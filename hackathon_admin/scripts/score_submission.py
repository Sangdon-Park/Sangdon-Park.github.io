from __future__ import annotations

import argparse
import json
import math
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    log_loss,
    mean_absolute_error,
    mean_squared_error,
    r2_score,
    roc_auc_score,
)


PROBABILITY_METRICS = {"roc_auc", "log_loss"}
REGRESSION_METRICS = {"rmse", "mae", "r2"}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def load_config(path: str | Path) -> dict[str, Any]:
    with Path(path).open("r", encoding="utf-8") as f:
        return json.load(f)


def _read_csv(path: str | Path, dtype_columns: list[str]) -> pd.DataFrame:
    csv_path = Path(path)
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV file not found: {csv_path}")
    return pd.read_csv(csv_path, dtype={column: "string" for column in dtype_columns})


def _validate_size(path: str | Path, max_bytes: int | None) -> None:
    if not max_bytes:
        return
    size = Path(path).stat().st_size
    if size > max_bytes:
        raise ValueError(f"Submission is too large: {size} bytes > {max_bytes} bytes")


def _validate_columns(df: pd.DataFrame, columns: list[str], kind: str) -> None:
    missing = [column for column in columns if column not in df.columns]
    if missing:
        raise ValueError(f"{kind} is missing required column(s): {', '.join(missing)}")


def _normalize_keys(df: pd.DataFrame, key_columns: list[str], kind: str) -> pd.DataFrame:
    out = df.copy()
    for column in key_columns:
        if out[column].isna().any():
            raise ValueError(f"{kind} contains empty {column} values")
        out[column] = out[column].astype(str)

    duplicated = out[out.duplicated(key_columns, keep=False)]
    if not duplicated.empty:
        examples = duplicated[key_columns].head(5).to_dict("records")
        raise ValueError(f"{kind} contains duplicate key values, for example: {examples}")
    return out


def _keys(df: pd.DataFrame, key_columns: list[str]) -> set[tuple[str, ...]]:
    return {tuple(row) for row in df[key_columns].astype(str).itertuples(index=False, name=None)}


def _format_key(key: tuple[str, ...], key_columns: list[str]) -> str:
    return ", ".join(f"{column}={value}" for column, value in zip(key_columns, key))


def _check_submission_keys(answers: pd.DataFrame, submission: pd.DataFrame, key_columns: list[str]) -> None:
    answer_keys = _keys(answers, key_columns)
    submission_keys = _keys(submission, key_columns)
    missing = sorted(answer_keys - submission_keys)
    extra = sorted(submission_keys - answer_keys)
    if missing or extra:
        pieces = []
        if missing:
            examples = [_format_key(key, key_columns) for key in missing[:5]]
            pieces.append(f"missing {len(missing)} row(s), examples: {examples}")
        if extra:
            examples = [_format_key(key, key_columns) for key in extra[:5]]
            pieces.append(f"extra {len(extra)} row(s), examples: {examples}")
        raise ValueError("Submission keys do not match the test keys: " + "; ".join(pieces))


def _numeric(series: pd.Series, name: str) -> pd.Series:
    values = pd.to_numeric(series, errors="coerce")
    if values.isna().any():
        bad_count = int(values.isna().sum())
        raise ValueError(f"{name} contains {bad_count} non-numeric or empty value(s)")
    return values


def _binary_target(series: pd.Series, positive_label: Any | None = None) -> pd.Series:
    numeric = pd.to_numeric(series, errors="coerce")
    if numeric.notna().all():
        unique = sorted(set(numeric.astype(float).tolist()))
        if set(unique).issubset({0.0, 1.0}):
            return numeric.astype(int)

    labels = sorted(series.astype(str).unique().tolist())
    if len(labels) != 2:
        raise ValueError(f"Binary metric requires exactly two target labels, found {labels}")
    positive = str(positive_label) if positive_label is not None else labels[-1]
    if positive not in labels:
        raise ValueError(f"Configured positive_label={positive!r} is not in target labels {labels}")
    return (series.astype(str) == positive).astype(int)


def _score_metric(
    y_true: pd.Series,
    y_pred_raw: pd.Series,
    config: dict[str, Any],
) -> float:
    metric = config["metric"]
    task_type = config.get("task_type", "binary_classification")

    if metric in PROBABILITY_METRICS:
        y_true_binary = _binary_target(y_true, config.get("positive_label"))
        y_pred = _numeric(y_pred_raw, "prediction").astype(float)
        if ((y_pred < 0) | (y_pred > 1)).any():
            raise ValueError("Probability predictions must be between 0 and 1")
        if metric == "roc_auc":
            return float(roc_auc_score(y_true_binary, y_pred))
        if metric == "log_loss":
            return float(log_loss(y_true_binary, y_pred, labels=[0, 1]))

    if metric in {"accuracy", "f1"}:
        if task_type == "binary_classification":
            y_true_binary = _binary_target(y_true, config.get("positive_label"))
            numeric_pred = pd.to_numeric(y_pred_raw, errors="coerce")
            if numeric_pred.notna().all():
                threshold = float(config.get("classification_threshold", 0.5))
                y_pred = (numeric_pred.astype(float) >= threshold).astype(int)
            else:
                y_pred = _binary_target(y_pred_raw, config.get("positive_label"))
            if metric == "accuracy":
                return float(accuracy_score(y_true_binary, y_pred))
            return float(f1_score(y_true_binary, y_pred))

        y_true_labels = y_true.astype(str)
        y_pred_labels = y_pred_raw.astype(str)
        if metric == "accuracy":
            return float(accuracy_score(y_true_labels, y_pred_labels))
        return float(f1_score(y_true_labels, y_pred_labels, average="macro"))

    if metric in REGRESSION_METRICS:
        y_true_num = _numeric(y_true, "target").astype(float)
        y_pred = _numeric(y_pred_raw, "prediction").astype(float)
        if metric == "rmse":
            return float(math.sqrt(mean_squared_error(y_true_num, y_pred)))
        if metric == "mae":
            return float(mean_absolute_error(y_true_num, y_pred))
        if metric == "r2":
            return float(r2_score(y_true_num, y_pred))

    raise ValueError(f"Unsupported metric: {metric}")


def _dataset_configs(config: dict[str, Any], answers: pd.DataFrame, dataset_column: str) -> list[dict[str, Any]]:
    configured = config.get("datasets") or []
    if configured:
        return configured
    return [
        {"id": dataset_id, "name": dataset_id, "weight": 1.0}
        for dataset_id in sorted(answers[dataset_column].astype(str).unique().tolist())
    ]


def _round_score(value: float, config: dict[str, Any]) -> float:
    rounded = round(float(value), int(config.get("score_precision", 6)))
    if isinstance(rounded, np.floating):
        return float(rounded)
    return rounded


def _score_components(merged: pd.DataFrame, config: dict[str, Any], dataset_column: str) -> tuple[float, list[dict[str, Any]]]:
    target_column = config["target_column"]
    prediction_column = config["prediction_column"]
    total_weight = 0.0
    weighted_score = 0.0
    components: list[dict[str, Any]] = []

    for dataset_config in _dataset_configs(config, merged, dataset_column):
        dataset_id = str(dataset_config["id"])
        dataset_name = str(dataset_config.get("name") or dataset_id)
        weight = float(dataset_config.get("weight", 1.0))
        group = merged[merged[dataset_column].astype(str) == dataset_id]
        if group.empty:
            raise ValueError(f"Answer file has no rows for configured dataset: {dataset_id}")

        raw = _score_metric(group[target_column], group[prediction_column], config)
        total_weight += weight
        weighted_score += raw * weight
        components.append(
            {
                "dataset": dataset_id,
                "name": dataset_name,
                "score": _round_score(raw, config),
                "raw_score": float(raw),
                "weight": weight,
                "rows": int(len(group)),
            }
        )

    if total_weight <= 0:
        raise ValueError("Total dataset weight must be greater than 0")

    aggregate = weighted_score / total_weight
    return aggregate, components


def score_submission(
    submission_path: str | Path,
    answers_path: str | Path,
    config: dict[str, Any],
    team: str | None = None,
    score_split: str | None = None,
) -> dict[str, Any]:
    id_column = config["id_column"]
    dataset_column = config.get("dataset_column")
    split_column = config.get("answer_split_column")
    target_column = config["target_column"]
    prediction_column = config["prediction_column"]
    key_columns = [dataset_column, id_column] if dataset_column else [id_column]
    key_columns = [column for column in key_columns if column]
    answer_dtype_columns = key_columns + ([split_column] if split_column else [])
    selected_split = score_split or config.get("leaderboard_split") or config.get("feedback_split")

    _validate_size(submission_path, config.get("max_submission_bytes"))

    answers = _read_csv(answers_path, answer_dtype_columns)
    submission = _read_csv(submission_path, key_columns)
    answer_columns = key_columns + [target_column] + ([split_column] if split_column else [])
    _validate_columns(answers, answer_columns, "Answer file")
    _validate_columns(submission, key_columns + [prediction_column], "Submission")

    answers = _normalize_keys(answers[answer_columns], key_columns, "Answer file")
    submission = _normalize_keys(submission[key_columns + [prediction_column]], key_columns, "Submission")
    _check_submission_keys(answers, submission, key_columns)

    merged = answers.merge(submission, on=key_columns, how="left", validate="one_to_one")
    if merged[prediction_column].isna().any():
        raise ValueError("Submission has empty prediction values")

    scored = merged
    if split_column and selected_split and selected_split != "all":
        scored = merged[merged[split_column].astype(str) == str(selected_split)]
        if scored.empty:
            raise ValueError(f"No answer rows found for score split: {selected_split}")

    component_scores: list[dict[str, Any]] = []
    if dataset_column:
        raw_score, component_scores = _score_components(scored, config, dataset_column)
        metric = config.get("aggregate_metric", f"mean_{config['metric']}")
    else:
        raw_score = _score_metric(scored[target_column], scored[prediction_column], config)
        metric = config["metric"]

    for component in component_scores:
        component.pop("raw_score", None)

    return {
        "status": "valid",
        "team": team or Path(submission_path).stem,
        "score": _round_score(raw_score, config),
        "raw_score": float(raw_score),
        "metric": metric,
        "base_metric": config["metric"],
        "score_split": selected_split or "all",
        "higher_is_better": bool(config.get("higher_is_better", True)),
        "rows": int(len(scored)),
        "submitted_rows": int(len(merged)),
        "component_scores": component_scores,
        "submission_file": str(submission_path),
        "scored_at": utc_now(),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Score one hackathon submission CSV.")
    parser.add_argument("--submission", required=True)
    parser.add_argument("--answers", required=True)
    parser.add_argument("--config", default="hackathon_admin/competition/config.json")
    parser.add_argument("--team")
    parser.add_argument("--score-split")
    parser.add_argument("--out")
    args = parser.parse_args()

    config = load_config(args.config)
    result = score_submission(args.submission, args.answers, config, args.team, args.score_split)
    payload = json.dumps(result, ensure_ascii=False, indent=2)
    if args.out:
        out_path = Path(args.out)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(payload + "\n", encoding="utf-8")
    else:
        print(payload)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
