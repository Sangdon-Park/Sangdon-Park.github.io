from __future__ import annotations

import argparse
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

from score_submission import load_config, utc_now


API_ROOT = "https://api.github.com"
LEDGER_TITLE = "Submission Ledger: automated grading attempts"
LEDGER_LABEL = "grader-ledger"
MARKER_PREFIX = "<!-- tabular-challenge-submission:"
MARKER_SUFFIX = "-->"


class GitHubClient:
    def __init__(self, repo: str, token: str) -> None:
        self.repo = repo
        self.token = token

    def request(self, method: str, path: str, payload: dict[str, Any] | None = None) -> dict | list:
        data = None
        headers = {
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {self.token}",
            "User-Agent": "tabular-challenge-grader",
            "X-GitHub-Api-Version": "2022-11-28",
        }
        if payload is not None:
            data = json.dumps(payload).encode("utf-8")
            headers["Content-Type"] = "application/json"

        request = Request(f"{API_ROOT}/repos/{self.repo}{path}", data=data, headers=headers, method=method)
        try:
            with urlopen(request, timeout=30) as response:
                raw = response.read().decode("utf-8")
                return json.loads(raw) if raw else {}
        except HTTPError as exc:
            body = exc.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"GitHub API request failed: {method} {path}: {exc.code} {body}") from exc

    def get_all(self, path: str, params: dict[str, Any] | None = None) -> list[dict[str, Any]]:
        rows: list[dict[str, Any]] = []
        page = 1
        while True:
            query = dict(params or {})
            query.update({"per_page": 100, "page": page})
            payload = self.request("GET", f"{path}?{urlencode(query)}")
            if not isinstance(payload, list):
                raise RuntimeError(f"Expected list response from {path}")
            rows.extend(payload)
            if len(payload) < 100:
                return rows
            page += 1

    def ensure_label(self) -> None:
        try:
            self.request(
                "POST",
                "/labels",
                {
                    "name": LEDGER_LABEL,
                    "color": "6e7781",
                    "description": "Internal submission-attempt ledger for automated grading.",
                },
            )
        except RuntimeError as exc:
            if "already_exists" not in str(exc) and "Validation Failed" not in str(exc):
                raise

    def ensure_ledger_issue(self) -> int:
        self.ensure_label()
        issues = self.get_all("/issues", {"state": "open", "labels": LEDGER_LABEL})
        for issue in issues:
            if issue.get("title") == LEDGER_TITLE and "pull_request" not in issue:
                return int(issue["number"])

        created = self.request(
            "POST",
            "/issues",
            {
                "title": LEDGER_TITLE,
                "body": (
                    "Automated grading uses this issue as a submission-attempt ledger.\n\n"
                    "Do not edit or delete bot comments here. They enforce the daily submission limit."
                ),
                "labels": [LEDGER_LABEL],
            },
        )
        return int(created["number"])

    def comments(self, issue_number: int) -> list[dict[str, Any]]:
        return self.get_all(f"/issues/{issue_number}/comments")

    def create_comment(self, issue_number: int, body: str) -> None:
        self.request("POST", f"/issues/{issue_number}/comments", {"body": body})


def local_date(timezone_name: str) -> str:
    return datetime.now(ZoneInfo(timezone_name)).date().isoformat()


def marker_payload(body: str) -> dict[str, Any] | None:
    start = body.find(MARKER_PREFIX)
    if start == -1:
        return None
    start += len(MARKER_PREFIX)
    end = body.find(MARKER_SUFFIX, start)
    if end == -1:
        return None
    raw = body[start:end].strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


def count_attempts(comments: list[dict[str, Any]], team: str, date: str) -> int:
    count = 0
    for comment in comments:
        if comment.get("user", {}).get("login") != "github-actions[bot]":
            continue
        payload = marker_payload(str(comment.get("body") or ""))
        if not payload:
            continue
        if payload.get("team") == team and payload.get("date") == date:
            count += 1
    return count


def load_team(meta_path: str | None, fallback: str = "unknown") -> tuple[str, dict[str, Any]]:
    if not meta_path:
        return fallback, {}
    meta = json.loads(Path(meta_path).read_text(encoding="utf-8"))
    return str(meta.get("team") or fallback), meta


def limit_comment(team: str, date: str, limit: int, used: int, timezone_name: str) -> str:
    return (
        "### Daily submission limit reached\n\n"
        f"- Participant: `{team}`\n"
        f"- Date: `{date}` ({timezone_name})\n"
        f"- Limit: `{limit}` submissions per participant per day\n"
        f"- Already used: `{used}`\n\n"
        "This push was not scored. Try again after the daily limit resets."
    )


def ok_comment(team: str, date: str, limit: int, used: int, timezone_name: str) -> str:
    remaining = max(0, limit - used)
    return (
        f"Daily submission limit check passed for `{team}` on `{date}` ({timezone_name}). "
        f"{remaining} submission(s) remaining before this attempt is recorded."
    )


def error_comment(team: str, message: str) -> str:
    return (
        "### Submission limit check failed\n\n"
        f"- Participant: `{team}`\n"
        f"- Error: `{message}`\n\n"
        "The submission was not scored because the grader could not verify the daily limit."
    )


def write_outputs(out_json: str, out_comment: str | None, result: dict[str, Any], comment: str | None) -> None:
    out_path = Path(out_json)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if out_comment and comment is not None:
        comment_path = Path(out_comment)
        comment_path.parent.mkdir(parents=True, exist_ok=True)
        comment_path.write_text(comment + "\n", encoding="utf-8")


def check(args: argparse.Namespace) -> int:
    team, meta = load_team(args.meta)
    try:
        config = load_config(args.config)
        limit = int(config.get("daily_submission_limit", 3))
        timezone_name = str(config.get("submission_limit_timezone", "Asia/Seoul"))
        date = local_date(timezone_name)
        token = os.environ["GITHUB_TOKEN"]
        client = GitHubClient(args.repo, token)
        ledger_issue = client.ensure_ledger_issue()
        used = count_attempts(client.comments(ledger_issue), team, date)
        allowed = used < limit
        result = {
            "status": "allowed" if allowed else "limited",
            "team": team,
            "date": date,
            "timezone": timezone_name,
            "limit": limit,
            "used": used,
            "remaining_before_record": max(0, limit - used),
            "ledger_issue": ledger_issue,
            "meta": meta,
            "checked_at": utc_now(),
        }
        comment = ok_comment(team, date, limit, used, timezone_name)
        if not allowed:
            comment = limit_comment(team, date, limit, used, timezone_name)
        write_outputs(args.out_json, args.out_comment, result, comment)
        return 0 if allowed else 2
    except Exception as exc:
        result = {
            "status": "error",
            "team": team,
            "error": str(exc),
            "checked_at": utc_now(),
        }
        write_outputs(args.out_json, args.out_comment, result, error_comment(team, str(exc)))
        return 1


def record(args: argparse.Namespace) -> int:
    team, meta = load_team(args.meta)
    config = load_config(args.config)
    timezone_name = str(config.get("submission_limit_timezone", "Asia/Seoul"))
    date = local_date(timezone_name)
    token = os.environ["GITHUB_TOKEN"]
    client = GitHubClient(args.repo, token)
    ledger_issue = client.ensure_ledger_issue()

    score = {}
    if args.score_json and Path(args.score_json).exists():
        score = json.loads(Path(args.score_json).read_text(encoding="utf-8"))

    payload = {
        "team": team,
        "date": date,
        "timezone": timezone_name,
        "pr": args.pr,
        "head_sha": meta.get("head_sha") or args.head_sha,
        "filename": meta.get("filename"),
        "status": score.get("status", "unknown"),
        "recorded_at": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
    }
    body = (
        f"{MARKER_PREFIX} {json.dumps(payload, ensure_ascii=False, sort_keys=True)} {MARKER_SUFFIX}\n"
        f"Recorded submission attempt for `{team}` on `{date}`."
    )
    client.create_comment(ledger_issue, body)

    result = {
        "status": "recorded",
        "ledger_issue": ledger_issue,
        "payload": payload,
    }
    write_outputs(args.out_json, None, result, None)
    print(f"Recorded submission attempt for {team} in issue #{ledger_issue}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Check or record daily submission limits.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    check_parser = subparsers.add_parser("check")
    check_parser.add_argument("--repo", required=True)
    check_parser.add_argument("--config", default="hackathon_admin/competition/config.json")
    check_parser.add_argument("--meta", required=True)
    check_parser.add_argument("--out-json", default="incoming/limit.json")
    check_parser.add_argument("--out-comment", default="incoming/comment.md")

    record_parser = subparsers.add_parser("record")
    record_parser.add_argument("--repo", required=True)
    record_parser.add_argument("--pr", required=True, type=int)
    record_parser.add_argument("--head-sha", required=True)
    record_parser.add_argument("--config", default="hackathon_admin/competition/config.json")
    record_parser.add_argument("--meta", required=True)
    record_parser.add_argument("--score-json", default="incoming/score.json")
    record_parser.add_argument("--out-json", default="incoming/limit-record.json")

    args = parser.parse_args()
    if args.command == "check":
        return check(args)
    return record(args)


if __name__ == "__main__":
    raise SystemExit(main())
