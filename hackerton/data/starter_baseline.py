from __future__ import annotations

from pathlib import Path

import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


ROOT = Path(__file__).resolve().parent
TRAIN_PATH = ROOT / "train.csv"
TEST_PATH = ROOT / "test.csv"
OUTPUT_PATH = ROOT / "submission.csv"


def make_one_hot_encoder() -> OneHotEncoder:
    try:
        return OneHotEncoder(handle_unknown="ignore", sparse_output=False)
    except TypeError:
        return OneHotEncoder(handle_unknown="ignore", sparse=False)


def build_model(feature_frame: pd.DataFrame) -> Pipeline:
    categorical = [
        column
        for column in feature_frame.columns
        if not pd.api.types.is_numeric_dtype(feature_frame[column])
    ]
    numeric = [column for column in feature_frame.columns if column not in categorical]

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", SimpleImputer(strategy="median"), numeric),
            (
                "cat",
                Pipeline(
                    steps=[
                        ("imputer", SimpleImputer(strategy="most_frequent")),
                        ("onehot", make_one_hot_encoder()),
                    ]
                ),
                categorical,
            ),
        ],
        remainder="drop",
    )

    model = RandomForestClassifier(
        n_estimators=350,
        min_samples_leaf=8,
        max_features="sqrt",
        class_weight="balanced_subsample",
        random_state=2026,
        n_jobs=-1,
    )
    return Pipeline(steps=[("preprocess", preprocessor), ("model", model)])


def train_one_dataset(train: pd.DataFrame, test: pd.DataFrame, dataset_id: str) -> pd.DataFrame:
    train_part = train[train["dataset"] == dataset_id].copy()
    test_part = test[test["dataset"] == dataset_id].copy()

    drop_columns = ["dataset", "id", "target"]
    feature_columns = [
        column
        for column in train_part.columns
        if column not in drop_columns and not train_part[column].isna().all()
    ]
    X_train = train_part[feature_columns]
    y_train = train_part["target"].astype(int)
    X_test = test_part[feature_columns]

    model = build_model(X_train)
    model.fit(X_train, y_train)
    prediction = model.predict_proba(X_test)[:, 1]

    return pd.DataFrame(
        {
            "dataset": test_part["dataset"].values,
            "id": test_part["id"].values,
            "prediction": prediction.clip(0, 1),
        }
    )


def main() -> None:
    train = pd.read_csv(TRAIN_PATH)
    test = pd.read_csv(TEST_PATH)

    submissions = []
    for dataset_id in sorted(test["dataset"].unique()):
        submissions.append(train_one_dataset(train, test, dataset_id))

    submission = pd.concat(submissions, ignore_index=True)
    submission = test[["dataset", "id"]].merge(submission, on=["dataset", "id"], how="left")
    if submission["prediction"].isna().any():
        raise RuntimeError("Some test rows did not receive predictions.")

    submission.to_csv(OUTPUT_PATH, index=False)
    print(f"Wrote {OUTPUT_PATH}")
    print("Upload this file to hackerton/submissions/<team-slug>.csv in your pull request.")


if __name__ == "__main__":
    main()
