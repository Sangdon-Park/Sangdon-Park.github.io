from __future__ import annotations

import argparse
import json
from pathlib import Path

from score_submission import load_config, score_submission, utc_now


def _load_team(meta_path: str | None, fallback: str) -> str:
    if not meta_path:
        return fallback
    path = Path(meta_path)
    if not path.exists():
        return fallback
    try:
        meta = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return fallback
    return str(meta.get("team") or fallback)


def _comment(result: dict) -> str:
    if result["status"] == "valid":
        direction = "higher is better" if result.get("higher_is_better", True) else "lower is better"
        components = result.get("component_scores") or []
        component_lines = ""
        if components:
            component_lines = "\n".join(
                f"- {item['name']} (`{item['dataset']}`): `{item['score']}` / {item['rows']} rows"
                for item in components
            )
            component_lines = "\n\n데이터셋별 점수:\n" + component_lines
        return (
            "### 제출 점수\n\n"
            f"- Team: `{result['team']}`\n"
            f"- Metric: `{result['metric']}` ({direction})\n"
            f"- Final score: `{result['score']}`\n"
            f"- Rows checked: `{result['rows']}`\n"
            f"- Scored at: `{result['scored_at']}`\n"
            f"{component_lines}\n\n"
            "채점이 완료되었습니다. 제출 제한은 한국 시간 기준으로 계산됩니다."
        )

    return (
        "### 제출 점수\n\n"
        f"- Team: `{result['team']}`\n"
        "- Status: `invalid`\n"
        f"- Error: `{result['error']}`\n"
        f"- Checked at: `{result['scored_at']}`\n\n"
        "Fix the CSV and push the branch again."
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Grade a submission and write a GitHub PR comment body.")
    parser.add_argument("--submission", required=True)
    parser.add_argument("--answers", required=True)
    parser.add_argument("--config", default="hackerton_admin/competition/config.json")
    parser.add_argument("--team")
    parser.add_argument("--meta")
    parser.add_argument("--out-json", default="incoming/score.json")
    parser.add_argument("--out-comment", default="incoming/comment.md")
    parser.add_argument("--fail-on-invalid", action="store_true")
    args = parser.parse_args()

    team = args.team or _load_team(args.meta, Path(args.submission).stem)
    try:
        config = load_config(args.config)
        result = score_submission(args.submission, args.answers, config, team)
        exit_code = 0
    except Exception as exc:
        result = {
            "status": "invalid",
            "team": team,
            "error": str(exc),
            "scored_at": utc_now(),
        }
        exit_code = 1 if args.fail_on_invalid else 0

    out_json = Path(args.out_json)
    out_json.parent.mkdir(parents=True, exist_ok=True)
    out_json.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    out_comment = Path(args.out_comment)
    out_comment.parent.mkdir(parents=True, exist_ok=True)
    out_comment.write_text(_comment(result) + "\n", encoding="utf-8")
    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
