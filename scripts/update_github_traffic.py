#!/usr/bin/env python3
"""Collect GitHub repository traffic metrics and persist historical snapshots."""

from __future__ import annotations

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

API_ROOT = "https://api.github.com"
HISTORY_PATH = Path("data/github-traffic-history.json")
LATEST_PATH = Path("data/github-traffic-latest.json")
SUMMARY_PATH = Path("data/github-traffic-summary.md")
MAX_SNAPSHOTS = 730


def utc_now_iso() -> str:
  return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def require_env(name: str) -> str:
  value = os.getenv(name, "").strip()
  if not value:
    raise RuntimeError(f"Missing required environment variable: {name}")
  return value


def fetch_json(repo: str, token: str, endpoint: str) -> Any:
  url = f"{API_ROOT}/repos/{repo}/{endpoint}"
  request = Request(
    url=url,
    headers={
      "Accept": "application/vnd.github+json",
      "Authorization": f"Bearer {token}",
      "User-Agent": "github-traffic-sync",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  )
  try:
    with urlopen(request, timeout=30) as response:
      return json.loads(response.read().decode("utf-8"))
  except HTTPError as exc:
    body = exc.read().decode("utf-8", errors="replace")
    raise RuntimeError(f"GitHub API request failed ({exc.code}) for {endpoint}: {body}") from exc
  except URLError as exc:
    raise RuntimeError(f"Network error while requesting {endpoint}: {exc}") from exc


def load_history(repo: str, synced_at: str) -> Dict[str, Any]:
  if HISTORY_PATH.exists():
    try:
      data = json.loads(HISTORY_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
      data = {}
  else:
    data = {}

  if not isinstance(data, dict):
    data = {}

  data.setdefault("repo", repo)
  data.setdefault("created_at", synced_at)
  data.setdefault("views_by_day", {})
  data.setdefault("clones_by_day", {})
  data.setdefault("snapshots", [])
  return data


def to_day_map(items: List[Dict[str, Any]]) -> Dict[str, Dict[str, int]]:
  result: Dict[str, Dict[str, int]] = {}
  for item in items:
    timestamp = str(item.get("timestamp", ""))
    date_key = timestamp[:10]
    if not date_key:
      continue
    result[date_key] = {
      "count": int(item.get("count", 0)),
      "uniques": int(item.get("uniques", 0)),
    }
  return result


def normalize_top_paths(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
  normalized = []
  for item in items:
    normalized.append(
      {
        "path": str(item.get("path", "")),
        "title": str(item.get("title", "")),
        "count": int(item.get("count", 0)),
        "uniques": int(item.get("uniques", 0)),
      }
    )
  return normalized


def normalize_top_referrers(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
  normalized = []
  for item in items:
    normalized.append(
      {
        "referrer": str(item.get("referrer", "")),
        "count": int(item.get("count", 0)),
        "uniques": int(item.get("uniques", 0)),
      }
    )
  return normalized


def write_json(path: Path, data: Any) -> None:
  path.parent.mkdir(parents=True, exist_ok=True)
  path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def md_escape(value: str) -> str:
  return value.replace("|", "\\|").replace("\n", " ").strip()


def write_summary(repo: str, latest: Dict[str, Any], views_days: Dict[str, Any], clones_days: Dict[str, Any]) -> None:
  lines: List[str] = []
  lines.append("# GitHub Traffic Summary")
  lines.append("")
  lines.append(f"- Repository: `{repo}`")
  lines.append(f"- Last Synced (UTC): `{latest['synced_at']}`")
  lines.append("")
  lines.append("## Last 14 Days")
  lines.append("")
  lines.append("| Metric | Count | Unique |")
  lines.append("|---|---:|---:|")
  lines.append(f"| Views | {latest['views']['count']} | {latest['views']['uniques']} |")
  lines.append(f"| Clones | {latest['clones']['count']} | {latest['clones']['uniques']} |")
  lines.append("")

  if views_days:
    lines.append("## Daily Views")
    lines.append("")
    lines.append("| Date (UTC) | Views | Unique |")
    lines.append("|---|---:|---:|")
    for day, values in sorted(views_days.items()):
      lines.append(f"| {day} | {values['count']} | {values['uniques']} |")
    lines.append("")

  if clones_days:
    lines.append("## Daily Clones")
    lines.append("")
    lines.append("| Date (UTC) | Clones | Unique |")
    lines.append("|---|---:|---:|")
    for day, values in sorted(clones_days.items()):
      lines.append(f"| {day} | {values['count']} | {values['uniques']} |")
    lines.append("")

  top_paths = latest.get("top_paths", [])
  if top_paths:
    lines.append("## Top Paths")
    lines.append("")
    lines.append("| Path | Title | Views | Unique |")
    lines.append("|---|---|---:|---:|")
    for item in top_paths:
      lines.append(
        f"| {md_escape(item['path'])} | {md_escape(item['title'])} | {item['count']} | {item['uniques']} |"
      )
    lines.append("")

  top_referrers = latest.get("top_referrers", [])
  if top_referrers:
    lines.append("## Top Referrers")
    lines.append("")
    lines.append("| Referrer | Views | Unique |")
    lines.append("|---|---:|---:|")
    for item in top_referrers:
      lines.append(f"| {md_escape(item['referrer'])} | {item['count']} | {item['uniques']} |")
    lines.append("")

  SUMMARY_PATH.parent.mkdir(parents=True, exist_ok=True)
  SUMMARY_PATH.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")


def main() -> int:
  repo = require_env("GITHUB_REPOSITORY")
  token = require_env("GITHUB_TOKEN")
  synced_at = utc_now_iso()
  date_key = synced_at[:10]

  views = fetch_json(repo, token, "traffic/views")
  clones = fetch_json(repo, token, "traffic/clones")
  top_paths = fetch_json(repo, token, "traffic/popular/paths")
  top_referrers = fetch_json(repo, token, "traffic/popular/referrers")

  views_days = to_day_map(views.get("views", []))
  clones_days = to_day_map(clones.get("clones", []))

  latest: Dict[str, Any] = {
    "repo": repo,
    "synced_at": synced_at,
    "views": {
      "count": int(views.get("count", 0)),
      "uniques": int(views.get("uniques", 0)),
    },
    "clones": {
      "count": int(clones.get("count", 0)),
      "uniques": int(clones.get("uniques", 0)),
    },
    "top_paths": normalize_top_paths(top_paths),
    "top_referrers": normalize_top_referrers(top_referrers),
  }

  history = load_history(repo, synced_at)
  history["repo"] = repo
  history["updated_at"] = synced_at
  history["views_by_day"].update(views_days)
  history["clones_by_day"].update(clones_days)
  history["views_by_day"] = dict(sorted(history["views_by_day"].items()))
  history["clones_by_day"] = dict(sorted(history["clones_by_day"].items()))
  history["latest"] = latest

  snapshot = {
    "date": date_key,
    "synced_at": synced_at,
    "views_count": latest["views"]["count"],
    "views_uniques": latest["views"]["uniques"],
    "clones_count": latest["clones"]["count"],
    "clones_uniques": latest["clones"]["uniques"],
  }

  snapshots = history.get("snapshots", [])
  if snapshots and snapshots[-1].get("date") == date_key:
    snapshots[-1] = snapshot
  else:
    snapshots.append(snapshot)
  history["snapshots"] = snapshots[-MAX_SNAPSHOTS:]

  write_json(HISTORY_PATH, history)
  write_json(LATEST_PATH, latest)
  write_summary(repo, latest, history["views_by_day"], history["clones_by_day"])

  print(f"Saved GitHub traffic snapshot for {repo} at {synced_at}")
  return 0


if __name__ == "__main__":
  try:
    raise SystemExit(main())
  except Exception as exc:  # noqa: BLE001
    print(f"ERROR: {exc}", file=sys.stderr)
    raise SystemExit(1)
