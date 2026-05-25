from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


SENSITIVE_ENTRY_FIELDS = {
    "component_scores",
    "filename",
    "head_sha",
    "participant_id",
    "raw_score",
    "submission_file",
}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def load_config(path: str | Path) -> dict[str, Any]:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def read_json(path: str | Path, default: dict[str, Any] | None = None) -> dict[str, Any]:
    source = Path(path)
    if not source.exists():
        return dict(default or {})
    return json.loads(source.read_text(encoding="utf-8"))


def public_entry(score: dict[str, Any], meta: dict[str, Any]) -> dict[str, Any]:
    team = str(score["team"])
    return {
        "team": team,
        "score": score["score"],
        "score_split": score.get("score_split", "all"),
        "rows": score["rows"],
        "submitted_rows": score.get("submitted_rows", score["rows"]),
        "scored_at": score["scored_at"],
    }


def sanitize_entry(entry: dict[str, Any]) -> dict[str, Any]:
    return {key: value for key, value in entry.items() if key not in SENSITIVE_ENTRY_FIELDS}


def same_participant(left: dict[str, Any], right: dict[str, Any]) -> bool:
    left_id = str(left.get("participant_id") or "")
    right_id = str(right.get("participant_id") or "")
    if left_id and right_id and left_id == right_id:
        return left_id == right_id
    return str(left.get("team") or "") == str(right.get("team") or "")


def rank_entries(entries: list[dict[str, Any]], higher_is_better: bool) -> list[dict[str, Any]]:
    ranked = [sanitize_entry(entry) for entry in entries]
    ranked.sort(key=lambda row: float(row["score"]), reverse=higher_is_better)
    for index, entry in enumerate(ranked, start=1):
        entry["rank"] = index
    return ranked


def update_leaderboard(
    leaderboard: dict[str, Any],
    score: dict[str, Any],
    meta: dict[str, Any],
    config: dict[str, Any],
) -> dict[str, Any]:
    if score.get("status") != "valid":
        raise ValueError("Only valid score results can be published to the leaderboard")

    entry = public_entry(score, meta)
    existing = [sanitize_entry(item) for item in leaderboard.get("entries", [])]
    replaced = False
    merged: list[dict[str, Any]] = []
    for item in existing:
        if same_participant(item, entry):
            merged.append(entry)
            replaced = True
        else:
            merged.append(item)
    if not replaced:
        merged.append(entry)

    higher_is_better = bool(config.get("higher_is_better", True))
    return {
        "competition_name": config.get("competition_name", "Hackathon"),
        "updated_at": score.get("scored_at") or utc_now(),
        "metric": config.get("aggregate_metric", config["metric"]),
        "base_metric": config["metric"],
        "score_split": score.get("score_split")
        or config.get("leaderboard_split")
        or config.get("feedback_split")
        or "all",
        "higher_is_better": higher_is_better,
        "entries": rank_entries(merged, higher_is_better),
        "invalid": [],
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Publish one scored submission without storing predictions.")
    parser.add_argument("--score-json", required=True)
    parser.add_argument("--meta", required=True)
    parser.add_argument("--config", default="hackathon_admin/competition/config.json")
    parser.add_argument("--leaderboard", default="hackathon/data/leaderboard.json")
    parser.add_argument("--out", default="hackathon/data/leaderboard.json")
    args = parser.parse_args()

    score = read_json(args.score_json)
    meta = read_json(args.meta)
    config = load_config(args.config)
    leaderboard = read_json(
        args.leaderboard,
        {
            "competition_name": config.get("competition_name", "Hackathon"),
            "entries": [],
            "invalid": [],
        },
    )
    updated = update_leaderboard(leaderboard, score, meta, config)

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(updated, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {out_path} with {len(updated['entries'])} public leaderboard entries")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
