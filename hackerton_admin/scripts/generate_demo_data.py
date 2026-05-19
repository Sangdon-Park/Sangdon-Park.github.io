from __future__ import annotations

import csv
import math
import random
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
TRAIN_PATH = REPO_ROOT / "hackerton" / "data" / "train.csv"
TEST_PATH = REPO_ROOT / "hackerton" / "data" / "test.csv"
SAMPLE_PATH = REPO_ROOT / "hackerton" / "data" / "sample_submission.csv"
ANSWERS_PATH = REPO_ROOT / "hackerton_admin" / "runtime" / "grader.csv"
BASELINE_PATH = REPO_ROOT / "hackerton" / "submissions" / "demo_baseline.csv"

FIELDS = [
    "dataset",
    "id",
    "age",
    "visits",
    "balance",
    "segment",
    "device_score",
    "income",
    "loan_amount",
    "delinquencies",
    "utilization",
    "employment_years",
    "region",
    "target",
]


def sigmoid(value: float) -> float:
    return 1.0 / (1.0 + math.exp(-value))


def conversion_row(rng: random.Random, idx: int) -> dict:
    age = rng.randint(18, 68)
    visits = rng.randint(0, 14)
    balance = round(rng.gauss(4800, 2100), 2)
    segment = rng.choice(["A", "B", "C"])
    device_score = round(rng.uniform(0, 1), 4)
    segment_bonus = {"A": 0.48, "B": 0.12, "C": -0.38}[segment]
    logit = -3.05 + age * 0.022 + visits * 0.2 + balance * 0.00016 + device_score * 0.95 + segment_bonus
    probability = sigmoid(logit)
    target = 1 if rng.random() < probability else 0
    return {
        "dataset": "conversion",
        "id": f"conversion_{idx:05d}",
        "age": age,
        "visits": visits,
        "balance": balance,
        "segment": segment,
        "device_score": device_score,
        "income": "",
        "loan_amount": "",
        "delinquencies": "",
        "utilization": "",
        "employment_years": "",
        "region": "",
        "target": target,
        "probability": probability,
    }


def credit_row(rng: random.Random, idx: int) -> dict:
    income = round(rng.gauss(5200, 1700), 2)
    loan_amount = round(rng.gauss(18000, 6500), 2)
    delinquencies = rng.choice([0, 0, 0, 1, 1, 2, 3])
    utilization = round(min(0.98, max(0.02, rng.betavariate(2.2, 3.0))), 4)
    employment_years = round(max(0.0, rng.gauss(5.8, 3.2)), 1)
    region = rng.choice(["metro", "city", "rural"])
    region_bonus = {"metro": -0.18, "city": 0.05, "rural": 0.22}[region]
    logit = (
        -1.25
        - income * 0.00018
        + loan_amount * 0.000055
        + delinquencies * 0.58
        + utilization * 1.65
        - employment_years * 0.08
        + region_bonus
    )
    probability = sigmoid(logit)
    target = 1 if rng.random() < probability else 0
    return {
        "dataset": "credit",
        "id": f"credit_{idx:05d}",
        "age": "",
        "visits": "",
        "balance": "",
        "segment": "",
        "device_score": "",
        "income": income,
        "loan_amount": loan_amount,
        "delinquencies": delinquencies,
        "utilization": utilization,
        "employment_years": employment_years,
        "region": region,
        "target": target,
        "probability": probability,
    }


def write_csv(path: Path, rows: list[dict], fields: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        for row in rows:
            writer.writerow({field: row.get(field, "") for field in fields})


def split_rows(rows: list[dict], train_size: int) -> tuple[list[dict], list[dict]]:
    return rows[:train_size], rows[train_size:]


def main() -> int:
    rng = random.Random(20260519)
    conversion_train, conversion_test = split_rows([conversion_row(rng, idx) for idx in range(150)], 95)
    credit_train, credit_test = split_rows([credit_row(rng, idx) for idx in range(165)], 105)

    train_rows = conversion_train + credit_train
    test_rows = conversion_test + credit_test
    rng.shuffle(train_rows)
    rng.shuffle(test_rows)

    public_fields = [field for field in FIELDS if field != "target"]
    write_csv(TRAIN_PATH, train_rows, FIELDS)
    write_csv(TEST_PATH, test_rows, public_fields)
    write_csv(ANSWERS_PATH, test_rows, ["dataset", "id", "target"])

    sample_rows = [{"dataset": row["dataset"], "id": row["id"], "prediction": 0.5} for row in test_rows]
    write_csv(SAMPLE_PATH, sample_rows, ["dataset", "id", "prediction"])

    baseline_rng = random.Random(7)
    baseline_rows = []
    for row in test_rows:
        noisy_probability = min(1.0, max(0.0, row["probability"] + baseline_rng.gauss(0, 0.08)))
        baseline_rows.append({"dataset": row["dataset"], "id": row["id"], "prediction": round(noisy_probability, 6)})
    write_csv(BASELINE_PATH, baseline_rows, ["dataset", "id", "prediction"])

    print(f"Wrote {TRAIN_PATH} ({len(train_rows)} rows)")
    print(f"Wrote {TEST_PATH} ({len(test_rows)} rows)")
    print(f"Wrote {SAMPLE_PATH}")
    print(f"Wrote {ANSWERS_PATH}")
    print(f"Wrote {BASELINE_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
