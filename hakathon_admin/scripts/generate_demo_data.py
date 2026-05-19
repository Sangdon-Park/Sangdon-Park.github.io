from __future__ import annotations

import csv
import math
import random
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
CONVERSION_TRAIN_PATH = REPO_ROOT / "hakathon" / "data" / "conversion_train.csv"
CONVERSION_TEST_PATH = REPO_ROOT / "hakathon" / "data" / "conversion_test.csv"
CREDIT_TRAIN_PATH = REPO_ROOT / "hakathon" / "data" / "credit_train.csv"
CREDIT_TEST_PATH = REPO_ROOT / "hakathon" / "data" / "credit_test.csv"
SAMPLE_PATH = REPO_ROOT / "hakathon" / "data" / "sample_submission.csv"
ANSWERS_PATH = REPO_ROOT / "hakathon_admin" / "runtime" / "grader.csv"
BASELINE_PATH = REPO_ROOT / "hakathon" / "submissions" / "demo_baseline.csv"


FIELDS = [
    "dataset",
    "id",
    "period",
    "region",
    "channel",
    "device",
    "segment",
    "age",
    "tenure_months",
    "income",
    "balance",
    "visits_7d",
    "visits_30d",
    "dwell_seconds",
    "discount_rate",
    "basket_value",
    "support_tickets",
    "loan_amount",
    "utilization",
    "delinquencies",
    "bureau_score",
    "employment_years",
    "inquiry_count",
    "macro_index",
    "merchant_risk",
    "behavior_score",
    "missingness_flag",
    "decoy_score",
    "target",
]


def sigmoid(value: float) -> float:
    return 1.0 / (1.0 + math.exp(-value))


def clip(value: float, lo: float, hi: float) -> float:
    return min(hi, max(lo, value))


def blank_if(value: object, probability: float, rng: random.Random) -> object:
    return "" if rng.random() < probability else value


def split_for_test(index: int, feedback_rows: int) -> str:
    return "feedback" if index < feedback_rows else "final"


def conversion_row(rng: random.Random, idx: int, split: str) -> dict:
    is_eval = split in {"feedback", "final"}
    is_final = split == "final"
    period = rng.choice(["P1", "P2", "P3"] if not is_final else ["P3", "P4"])
    region = rng.choice(["metro", "suburban", "regional", "island"])
    channel = rng.choice(["search", "social", "affiliate", "direct", "email"])
    device = rng.choice(["ios", "android", "desktop", "tablet"])
    segment = rng.choice(["value", "standard", "premium", "new"])

    age = int(clip(rng.gauss(37 if not is_final else 41, 11), 18, 72))
    tenure = int(clip(rng.expovariate(1 / 18), 0, 84))
    income = round(max(1200, rng.gauss(4300 if not is_final else 4700, 1450)), 2)
    visits_7d = rng.randint(0, 16 if not is_final else 11)
    visits_30d = visits_7d + rng.randint(0, 46)
    dwell = round(max(4, rng.lognormvariate(4.55 if not is_final else 4.35, 0.72)), 2)
    discount = round(clip(rng.betavariate(1.5, 5.8) + (0.08 if channel == "email" else 0), 0, 0.65), 4)
    basket = round(max(5, rng.lognormvariate(4.0, 0.65)), 2)
    support = rng.choice([0, 0, 0, 1, 1, 2, 3])
    merchant_risk = round(clip(rng.betavariate(2.2, 5.0), 0.01, 0.95), 4)

    channel_effect = {"search": 0.2, "social": -0.12, "affiliate": 0.08, "direct": 0.35, "email": 0.18}[channel]
    device_effect = {"ios": 0.18, "android": -0.05, "desktop": 0.1, "tablet": -0.16}[device]
    region_effect = {"metro": 0.14, "suburban": 0.02, "regional": -0.08, "island": -0.2}[region]
    period_effect = {"P1": -0.1, "P2": 0.05, "P3": 0.12, "P4": -0.18}[period]
    segment_effect = {"value": -0.18, "standard": 0.02, "premium": 0.3, "new": -0.28}[segment]

    nonlinear = 0.0
    nonlinear += 0.42 if visits_7d >= 5 and dwell > 110 else -0.05
    nonlinear += 0.35 if discount > 0.22 and segment in {"value", "new"} else 0
    nonlinear -= 0.38 if support >= 2 and channel in {"email", "affiliate"} else 0
    nonlinear -= 0.32 if is_final and discount > 0.32 else 0

    logit = (
        -2.25
        + visits_7d * 0.09
        + math.log1p(visits_30d) * 0.22
        + math.log1p(dwell) * 0.18
        + math.log1p(basket) * 0.16
        + discount * 0.95
        + channel_effect
        + device_effect
        + region_effect
        + period_effect
        + segment_effect
        - support * 0.16
        - merchant_risk * 0.55
        + nonlinear
    )
    probability = clip(sigmoid(logit), 0.02, 0.96)
    target = 1 if rng.random() < probability else 0

    behavior_score = round(clip(probability + rng.gauss(0, 0.12), 0, 1), 5)
    decoy_base = probability if not is_final else 1 - probability
    decoy_score = round(clip(decoy_base + rng.gauss(0, 0.16), 0, 1), 5)

    missingness = 1 if (device == "android" and rng.random() < 0.45) or (is_eval and rng.random() < 0.18) else 0
    return {
        "dataset": "conversion",
        "id": f"conversion_{idx:05d}",
        "period": period,
        "region": region,
        "channel": channel,
        "device": device,
        "segment": segment,
        "age": blank_if(age, 0.04 + missingness * 0.08, rng),
        "tenure_months": blank_if(tenure, 0.06, rng),
        "income": blank_if(income, 0.08 + missingness * 0.1, rng),
        "balance": blank_if(round(income * rng.uniform(0.4, 1.7), 2), 0.11, rng),
        "visits_7d": visits_7d,
        "visits_30d": visits_30d,
        "dwell_seconds": blank_if(dwell, 0.04, rng),
        "discount_rate": discount,
        "basket_value": basket,
        "support_tickets": support,
        "loan_amount": "",
        "utilization": "",
        "delinquencies": "",
        "bureau_score": "",
        "employment_years": "",
        "inquiry_count": "",
        "macro_index": "",
        "merchant_risk": merchant_risk,
        "behavior_score": behavior_score,
        "missingness_flag": missingness,
        "decoy_score": decoy_score,
        "target": target,
        "probability": probability,
        "split": split,
    }


def credit_row(rng: random.Random, idx: int, split: str) -> dict:
    is_eval = split in {"feedback", "final"}
    is_final = split == "final"
    period = rng.choice(["P1", "P2", "P3"] if not is_final else ["P3", "P4"])
    region = rng.choice(["metro", "suburban", "regional", "industrial"])
    channel = rng.choice(["branch", "mobile", "broker", "partner"])
    segment = rng.choice(["prime", "near_prime", "thin_file", "high_yield"])

    age = int(clip(rng.gauss(43 if not is_final else 39, 12), 19, 74))
    tenure = int(clip(rng.expovariate(1 / 30), 0, 120))
    income = round(max(900, rng.gauss(5200 if not is_final else 4700, 1900)), 2)
    loan = round(max(800, rng.gauss(18500 if not is_final else 22200, 7800)), 2)
    utilization = round(clip(rng.betavariate(2.2 if not is_final else 2.8, 3.0), 0.01, 0.99), 4)
    delinquencies = rng.choice([0, 0, 0, 1, 1, 2, 3, 4])
    bureau = round(clip(rng.gauss(665 - delinquencies * 28 - utilization * 55, 48), 430, 820), 1)
    employment = round(clip(rng.gauss(6.2, 3.7), 0, 24), 1)
    inquiries = rng.choice([0, 0, 1, 1, 2, 3, 4, 5])
    macro = round(rng.gauss(-0.1 if not is_final else -0.45, 0.42), 4)

    dti = loan / max(income * 12, 1)
    channel_effect = {"branch": -0.16, "mobile": 0.1, "broker": 0.24, "partner": 0.05}[channel]
    region_effect = {"metro": -0.08, "suburban": -0.02, "regional": 0.12, "industrial": 0.24}[region]
    segment_effect = {"prime": -0.42, "near_prime": -0.04, "thin_file": 0.28, "high_yield": 0.48}[segment]
    period_effect = {"P1": -0.1, "P2": 0.03, "P3": 0.1, "P4": 0.32}[period]

    nonlinear = 0.0
    nonlinear += 0.46 if utilization > 0.78 and bureau < 640 else 0
    nonlinear += 0.34 if dti > 0.38 and segment in {"thin_file", "high_yield"} else 0
    nonlinear -= 0.22 if employment > 8 and inquiries <= 1 else 0
    nonlinear += 0.28 if is_final and channel == "broker" and macro < -0.35 else 0

    logit = (
        -1.05
        - income * 0.00011
        + loan * 0.000035
        + utilization * 1.42
        + delinquencies * 0.42
        - (bureau - 640) * 0.006
        - employment * 0.055
        + inquiries * 0.09
        - tenure * 0.004
        + macro * 0.45
        + channel_effect
        + region_effect
        + segment_effect
        + period_effect
        + nonlinear
    )
    probability = clip(sigmoid(logit), 0.015, 0.97)
    target = 1 if rng.random() < probability else 0

    behavior_score = round(clip(probability + rng.gauss(0, 0.15), 0, 1), 5)
    decoy_base = probability if not is_final else clip(0.45 + rng.gauss(0, 0.18), 0, 1)
    decoy_score = round(clip(decoy_base + rng.gauss(0, 0.14), 0, 1), 5)
    missingness = 1 if (segment == "thin_file" and rng.random() < 0.55) or (is_eval and rng.random() < 0.14) else 0

    return {
        "dataset": "credit",
        "id": f"credit_{idx:05d}",
        "period": period,
        "region": region,
        "channel": channel,
        "device": "",
        "segment": segment,
        "age": blank_if(age, 0.05, rng),
        "tenure_months": blank_if(tenure, 0.07 + missingness * 0.08, rng),
        "income": blank_if(income, 0.06 + missingness * 0.14, rng),
        "balance": "",
        "visits_7d": "",
        "visits_30d": "",
        "dwell_seconds": "",
        "discount_rate": "",
        "basket_value": "",
        "support_tickets": "",
        "loan_amount": loan,
        "utilization": utilization,
        "delinquencies": delinquencies,
        "bureau_score": blank_if(bureau, 0.04 + missingness * 0.12, rng),
        "employment_years": blank_if(employment, 0.05, rng),
        "inquiry_count": inquiries,
        "macro_index": macro,
        "merchant_risk": "",
        "behavior_score": behavior_score,
        "missingness_flag": missingness,
        "decoy_score": decoy_score,
        "target": target,
        "probability": probability,
        "split": split,
    }


def write_csv(path: Path, rows: list[dict], fields: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        for row in rows:
            writer.writerow({field: row.get(field, "") for field in fields})


def make_rows(factory, rng: random.Random, train_count: int, feedback_count: int, final_count: int) -> tuple[list[dict], list[dict]]:
    train = [factory(rng, idx, "train") for idx in range(train_count)]
    test = [
        factory(rng, train_count + idx, split_for_test(idx, feedback_count))
        for idx in range(feedback_count + final_count)
    ]
    return train, test


def main() -> int:
    rng = random.Random(20260519)
    conversion_train, conversion_test = make_rows(conversion_row, rng, 900, 240, 420)
    credit_train, credit_test = make_rows(credit_row, rng, 900, 240, 420)

    test_rows = conversion_test + credit_test
    rng.shuffle(test_rows)

    public_fields = [field for field in FIELDS if field != "target"]
    write_csv(CONVERSION_TRAIN_PATH, conversion_train, FIELDS)
    write_csv(CONVERSION_TEST_PATH, conversion_test, public_fields)
    write_csv(CREDIT_TRAIN_PATH, credit_train, FIELDS)
    write_csv(CREDIT_TEST_PATH, credit_test, public_fields)
    write_csv(ANSWERS_PATH, test_rows, ["dataset", "id", "split", "target"])

    sample_rows = [{"dataset": row["dataset"], "id": row["id"], "prediction": 0.5} for row in test_rows]
    write_csv(SAMPLE_PATH, sample_rows, ["dataset", "id", "prediction"])

    baseline_rng = random.Random(7)
    baseline_rows = []
    for row in test_rows:
        noisy_probability = clip(row["probability"] + baseline_rng.gauss(0, 0.16), 0, 1)
        baseline_rows.append({"dataset": row["dataset"], "id": row["id"], "prediction": round(noisy_probability, 6)})
    write_csv(BASELINE_PATH, baseline_rows, ["dataset", "id", "prediction"])

    print(f"Wrote {CONVERSION_TRAIN_PATH} ({len(conversion_train)} rows)")
    print(f"Wrote {CONVERSION_TEST_PATH} ({len(conversion_test)} rows)")
    print(f"Wrote {CREDIT_TRAIN_PATH} ({len(credit_train)} rows)")
    print(f"Wrote {CREDIT_TEST_PATH} ({len(credit_test)} rows)")
    print(f"Wrote {SAMPLE_PATH}")
    print(f"Wrote {ANSWERS_PATH}")
    print(f"Wrote {BASELINE_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
