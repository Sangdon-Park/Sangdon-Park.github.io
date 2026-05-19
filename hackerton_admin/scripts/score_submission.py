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
CLASSIFICATION_METRICS = {"accuracy", "f1", "roc_auc", "log_loss"}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def load_config(path: str | Path) -> dict[str, Any]:
    with Path(path).open("r", encoding="utf-8") as f:
        return json.load(f)


def _read_csv(path: str | Path, id_column: str) -> pd.DataFrame:
    csv_path = Path(path)
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV file not found: {csv_path}")
    return pd.read_csv(csv_path, dtype={id_column: "string"})


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


def _normalize_ids(df: pd.DataFrame, id_column: str, kind: str) -> pd.DataFrame:
    if df[id_column].isna().any():
        raise ValueError(f"{kind} contains empty id values")
    out = df.copy()
    out[id_column] = out[id_column].astype(str)
    duplicated = out[id_column][out[id_column].duplicated()].head(5).tolist()
    if duplicated:
        raise ValueError(f"{kind} contains duplicate id values, for example: {duplicated}")
    return out


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


def _check_submission_ids(answer_ids: set[str], submission_ids: set[str]) -> None:
    missing = sorted(answer_ids - submission_ids)
    extra = sorted(submission_ids - answer_ids)
    if missing or extra:
        pieces = []
        if missing:
            pieces.append(f"missing {len(missing)} id(s), examples: {missing[:5]}")
        if extra:
            pieces.append(f"extra {len(extra)} id(s), examples: {extra[:5]}")
        raise ValueError("Submission ids do not match the test ids: " + "; ".join(pieces))


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
                y_pred = (numeric_pred.astype(float) >= float(config.get("classification_threshold", 0.5))).astype(int)
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


def score_submission(
    submission_path: str | Path,
    answers_path: str | Path,
    config: dict[str, Any],
    team: str | None = None,
) -> dict[str, Any]:
    id_column = config["id_column"]
    target_column = config["target_column"]
    prediction_column = config["prediction_column"]
    metric = config["metric"]

    _validate_size(submission_path, config.get("max_submission_bytes"))

    answers = _read_csv(answers_path, id_column)
    submission = _read_csv(submission_path, id_column)
    _validate_columns(answers, [id_column, target_column], "Answer file")
    _validate_columns(submission, [id_column, prediction_column], "Submission")

    answers = _normalize_ids(answers[[id_column, target_column]], id_column, "Answer file")
    submission = _normalize_ids(submission[[id_column, prediction_column]], id_column, "Submission")
    _check_submission_ids(set(answers[id_column]), set(submission[id_column]))

    merged = answers.merge(submission, on=id_column, how="left", validate="one_to_one")
    if merged[prediction_column].isna().any():
        raise ValueError("Submission has empty prediction values")

    raw_score = _score_metric(merged[target_column], merged[prediction_column], config)
    precision = int(config.get("score_precision", 6))
    rounded = round(float(raw_score), precision)
    if isinstance(rounded, np.floating):
        rounded = float(rounded)

    return {
        "status": "valid",
        "team": team or Path(submission_path).stem,
        "score": rounded,
        "raw_score": float(raw_score),
        "metric": metric,
        "higher_is_better": bool(config.get("higher_is_better", True)),
        "rows": int(len(merged)),
        "submission_file": str(submission_path),
        "scored_at": utc_now(),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Score one hackathon submission CSV.")
    parser.add_argument("--submission", required=True)
    parser.add_argument("--answers", required=True)
    parser.add_argument("--config", default="hackerton_admin/competition/config.json")
    parser.add_argument("--team")
    parser.add_argument("--out")
    args = parser.parse_args()

    config = load_config(args.config)
    result = score_submission(args.submission, args.answers, config, args.team)
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
