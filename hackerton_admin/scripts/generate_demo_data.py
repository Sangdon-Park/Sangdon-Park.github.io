from __future__ import annotations

import csv
import math
import random
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
TRAIN_PATH = REPO_ROOT / "hackerton" / "data" / "train.csv"
TEST_PATH = REPO_ROOT / "hackerton" / "data" / "test.csv"
SAMPLE_PATH = REPO_ROOT / "hackerton" / "data" / "sample_submission.csv"
ANSWERS_PATH = REPO_ROOT / "hackerton_admin" / "answers" / "private_solution.csv"
BASELINE_PATH = REPO_ROOT / "hackerton" / "submissions" / "demo_baseline.csv"


def sigmoid(value: float) -> float:
    return 1.0 / (1.0 + math.exp(-value))


def make_row(rng: random.Random, idx: int) -> dict:
    age = rng.randint(18, 68)
    visits = rng.randint(0, 14)
    balance = round(rng.gauss(4800, 2100), 2)
    segment = rng.choice(["A", "B", "C"])
    device_score = round(rng.uniform(0, 1), 4)
    segment_bonus = {"A": 0.55, "B": 0.1, "C": -0.35}[segment]
    logit = -3.2 + age * 0.025 + visits * 0.22 + balance * 0.00018 + device_score * 0.9 + segment_bonus
    probability = sigmoid(logit)
    target = 1 if rng.random() < probability else 0
    return {
        "id": str(100000 + idx),
        "age": age,
        "visits": visits,
        "balance": balance,
        "segment": segment,
        "device_score": device_score,
        "target": target,
        "probability": probability,
    }


def write_csv(path: Path, rows: list[dict], fields: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        for row in rows:
            writer.writerow({field: row[field] for field in fields})


def main() -> int:
    rng = random.Random(20260519)
    rows = [make_row(rng, idx) for idx in range(140)]
    train_rows = rows[:90]
    test_rows = rows[90:]

    feature_fields = ["id", "age", "visits", "balance", "segment", "device_score"]
    write_csv(TRAIN_PATH, train_rows, feature_fields + ["target"])
    write_csv(TEST_PATH, test_rows, feature_fields)
    write_csv(ANSWERS_PATH, test_rows, ["id", "target"])

    sample_rows = [{"id": row["id"], "prediction": 0.5} for row in test_rows]
    write_csv(SAMPLE_PATH, sample_rows, ["id", "prediction"])

    baseline_rows = []
    baseline_rng = random.Random(7)
    for row in test_rows:
        noisy_probability = min(1.0, max(0.0, row["probability"] + baseline_rng.gauss(0, 0.08)))
        baseline_rows.append({"id": row["id"], "prediction": round(noisy_probability, 6)})
    write_csv(BASELINE_PATH, baseline_rows, ["id", "prediction"])

    print(f"Wrote {TRAIN_PATH}")
    print(f"Wrote {TEST_PATH}")
    print(f"Wrote {SAMPLE_PATH}")
    print(f"Wrote {ANSWERS_PATH}")
    print(f"Wrote {BASELINE_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
