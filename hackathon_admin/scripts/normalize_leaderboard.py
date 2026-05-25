from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

from update_leaderboard_entry import rank_entries, sanitize_entry


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def load_config(path: str | Path) -> dict:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def main() -> int:
    parser = argparse.ArgumentParser(description="Strip sensitive fields and re-rank the public leaderboard.")
    parser.add_argument("--config", default="hackathon_admin/competition/config.json")
    parser.add_argument("--leaderboard", default="hackathon/data/leaderboard.json")
    parser.add_argument("--out", default="hackathon/data/leaderboard.json")
    args = parser.parse_args()

    config = load_config(args.config)
    path = Path(args.leaderboard)
    leaderboard = json.loads(path.read_text(encoding="utf-8")) if path.exists() else {"entries": []}
    entries = [sanitize_entry(entry) for entry in leaderboard.get("entries", [])]
    higher_is_better = bool(config.get("higher_is_better", True))

    normalized = {
        "competition_name": config.get("competition_name", "Hackathon"),
        "updated_at": leaderboard.get("updated_at") or utc_now(),
        "metric": config.get("aggregate_metric", config["metric"]),
        "base_metric": config["metric"],
        "score_split": leaderboard.get("score_split")
        or config.get("leaderboard_split")
        or config.get("feedback_split")
        or "all",
        "higher_is_better": higher_is_better,
        "entries": rank_entries(entries, higher_is_better),
        "invalid": [],
    }

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(normalized, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Normalized {out_path} with {len(normalized['entries'])} entries")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
