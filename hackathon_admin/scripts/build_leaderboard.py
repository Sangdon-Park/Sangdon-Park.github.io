from __future__ import annotations

import argparse
import glob
import json
from pathlib import Path

from score_submission import load_config, score_submission, utc_now


def build_leaderboard(
    submissions_glob: str,
    answers: str,
    config_path: str,
    score_split: str | None = None,
    include_sensitive: bool = False,
) -> dict:
    config = load_config(config_path)
    entries = []
    invalid = []

    for filename in sorted(glob.glob(submissions_glob)):
        path = Path(filename)
        if path.name.startswith("."):
            continue
        try:
            result = score_submission(path, answers, config, team=path.stem, score_split=score_split)
            entry = {
                "team": result["team"],
                "score": result["score"],
                "raw_score": result["raw_score"],
                "score_split": result.get("score_split", "all"),
                "rows": result["rows"],
                "submitted_rows": result.get("submitted_rows", result["rows"]),
                "scored_at": result["scored_at"],
            }
            if include_sensitive:
                entry["component_scores"] = result.get("component_scores", [])
                entry["submission_file"] = str(path).replace("\\", "/")
            entries.append(entry)
        except Exception as exc:
            item = {"team": path.stem, "error": str(exc)}
            if include_sensitive:
                item["submission_file"] = str(path).replace("\\", "/")
            invalid.append(item)

    reverse = bool(config.get("higher_is_better", True))
    entries.sort(key=lambda row: row["raw_score"], reverse=reverse)
    for index, row in enumerate(entries, start=1):
        row["rank"] = index
        row.pop("raw_score", None)

    return {
        "competition_name": config.get("competition_name", "Hackathon"),
        "updated_at": utc_now(),
        "metric": config.get("aggregate_metric", config["metric"]),
        "base_metric": config["metric"],
        "score_split": score_split or config.get("leaderboard_split") or config.get("feedback_split") or "all",
        "higher_is_better": reverse,
        "entries": entries,
        "invalid": invalid,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Build hackathon/data/leaderboard.json from accepted submissions.")
    parser.add_argument("--submissions", default=None, help="Glob for private submission CSV files.")
    parser.add_argument("--answers", default="hackathon_admin/runtime/grader.csv")
    parser.add_argument("--config", default="hackathon_admin/competition/config.json")
    parser.add_argument("--out", default="hackathon/data/leaderboard.json")
    parser.add_argument("--score-split")
    parser.add_argument("--include-sensitive", action="store_true")
    args = parser.parse_args()

    config = load_config(args.config)
    submissions_glob = args.submissions or config.get(
        "submission_glob",
        "hackathon_admin/private_submissions/*.csv",
    )
    leaderboard = build_leaderboard(
        submissions_glob,
        args.answers,
        args.config,
        args.score_split,
        args.include_sensitive,
    )

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(leaderboard, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {out_path} with {len(leaderboard['entries'])} ranked submission(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
