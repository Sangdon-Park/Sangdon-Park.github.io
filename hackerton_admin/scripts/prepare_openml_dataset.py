from __future__ import annotations

import argparse
import json
from pathlib import Path

import pandas as pd
from sklearn.datasets import fetch_openml
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder


ADMIN_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = Path(__file__).resolve().parents[2]


def write_config(metric: str, task_type: str, target_column: str, positive_label: str | None) -> None:
    config_path = ADMIN_ROOT / "competition" / "config.json"
    config = json.loads(config_path.read_text(encoding="utf-8"))
    config["metric"] = metric
    config["task_type"] = task_type
    config["target_column"] = target_column
    config["higher_is_better"] = metric not in {"rmse", "mae", "log_loss"}
    if positive_label is not None:
        config["positive_label"] = positive_label
    else:
        config.pop("positive_label", None)
    config_path.write_text(json.dumps(config, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    site_config_path = REPO_ROOT / "hackerton" / "data" / "config.json"
    site_config = dict(config)
    site_config_path.write_text(json.dumps(site_config, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def encode_target_if_needed(y: pd.Series, task_type: str, metric: str) -> tuple[pd.Series, str | None]:
    if task_type == "regression":
        return pd.to_numeric(y, errors="raise"), None

    encoder = LabelEncoder()
    encoded = pd.Series(encoder.fit_transform(y.astype(str)), index=y.index, name="target")
    mapping = {str(label): int(index) for index, label in enumerate(encoder.classes_)}
    mapping_path = ADMIN_ROOT / "competition" / "target_mapping.json"
    mapping_path.write_text(json.dumps(mapping, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    if task_type == "binary_classification" and len(encoder.classes_) != 2:
        raise ValueError(f"Binary classification requires 2 labels, found {list(encoder.classes_)}")
    positive_label = "1" if metric in {"roc_auc", "log_loss"} else None
    return encoded, positive_label


def main() -> int:
    parser = argparse.ArgumentParser(description="Prepare a train/test/evaluation split from OpenML.")
    parser.add_argument("--data-id", required=True, type=int)
    parser.add_argument("--test-size", type=float, default=0.3)
    parser.add_argument("--random-state", type=int, default=42)
    parser.add_argument("--task-type", choices=["binary_classification", "multiclass_classification", "regression"], default="binary_classification")
    parser.add_argument("--metric", default="roc_auc")
    parser.add_argument("--update-config", action="store_true")
    args = parser.parse_args()

    bunch = fetch_openml(data_id=args.data_id, as_frame=True, parser="auto")
    if bunch.target is None:
        raise ValueError("OpenML dataset has no target column")

    X = bunch.data.copy()
    y, positive_label = encode_target_if_needed(pd.Series(bunch.target), args.task_type, args.metric)
    target_column = "target"

    frame = X.copy()
    frame.insert(0, "id", [f"row_{i:06d}" for i in range(len(frame))])
    frame[target_column] = y.values
    frame = frame.dropna(subset=[target_column]).reset_index(drop=True)

    stratify = None
    if args.task_type in {"binary_classification", "multiclass_classification"}:
        counts = frame[target_column].value_counts()
        if len(counts) > 1 and counts.min() >= 2:
            stratify = frame[target_column]

    train, test = train_test_split(
        frame,
        test_size=args.test_size,
        random_state=args.random_state,
        stratify=stratify,
    )

    train_path = REPO_ROOT / "hackerton" / "data" / "train.csv"
    test_path = REPO_ROOT / "hackerton" / "data" / "test.csv"
    answers_path = ADMIN_ROOT / "runtime" / "grader.csv"
    sample_path = REPO_ROOT / "hackerton" / "data" / "sample_submission.csv"

    train_path.parent.mkdir(parents=True, exist_ok=True)
    test_path.parent.mkdir(parents=True, exist_ok=True)
    answers_path.parent.mkdir(parents=True, exist_ok=True)

    train.sort_values("id").to_csv(train_path, index=False)
    test_public = test.drop(columns=[target_column]).sort_values("id")
    test_public.to_csv(test_path, index=False)
    test[["id", target_column]].sort_values("id").to_csv(answers_path, index=False)

    default_prediction = 0.5 if args.task_type != "regression" else float(train[target_column].mean())
    sample = pd.DataFrame({"id": test_public["id"], "prediction": default_prediction})
    sample.to_csv(sample_path, index=False)

    if args.update_config:
        write_config(args.metric, args.task_type, target_column, positive_label)

    print(f"Prepared OpenML data_id={args.data_id}")
    print(f"Train: {train_path} ({len(train)} rows)")
    print(f"Test: {test_path} ({len(test_public)} rows)")
    print(f"Grader payload: {answers_path}")
    print(f"Sample submission: {sample_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
