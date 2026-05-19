from __future__ import annotations

import argparse
import base64
import json
import os
from pathlib import Path, PurePosixPath
from urllib.error import HTTPError
from urllib.parse import quote
from urllib.request import Request, urlopen


API_ROOT = "https://api.github.com"


def api_get(url: str, token: str) -> dict | list:
    request = Request(
        url,
        headers={
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {token}",
            "User-Agent": "tabular-challenge-grader",
            "X-GitHub-Api-Version": "2022-11-28",
        },
    )
    try:
        with urlopen(request, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"GitHub API request failed: {exc.code} {body}") from exc


def is_submission_path(filename: str, submission_root: str) -> bool:
    path = PurePosixPath(filename)
    return path.parent == PurePosixPath(submission_root) and path.suffix.lower() == ".csv"


def main() -> int:
    parser = argparse.ArgumentParser(description="Safely download a CSV submission file from a PR head.")
    parser.add_argument("--repo", required=True, help="owner/repo")
    parser.add_argument("--pr", required=True, type=int)
    parser.add_argument("--head-sha", required=True)
    parser.add_argument("--out", default="incoming/submission.csv")
    parser.add_argument("--meta-out", default="incoming/meta.json")
    parser.add_argument("--max-bytes", type=int, default=5 * 1024 * 1024)
    parser.add_argument("--submission-root", default="submissions")
    args = parser.parse_args()

    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        raise SystemExit("Missing GITHUB_TOKEN")

    files_url = f"{API_ROOT}/repos/{args.repo}/pulls/{args.pr}/files?per_page=100"
    files = api_get(files_url, token)
    candidates = [
        item
        for item in files
        if is_submission_path(item["filename"], args.submission_root) and item.get("status") != "removed"
    ]

    if not candidates:
        raise SystemExit(f"No CSV file under {args.submission_root}/ was found in this PR")
    if len(candidates) > 1:
        names = ", ".join(item["filename"] for item in candidates)
        raise SystemExit(f"Submit exactly one CSV file per PR. Found: {names}")

    filename = candidates[0]["filename"]
    encoded_path = quote(filename, safe="/")
    content_url = f"{API_ROOT}/repos/{args.repo}/contents/{encoded_path}?ref={args.head_sha}"
    payload = api_get(content_url, token)

    if payload.get("type") != "file" or payload.get("encoding") != "base64":
        raise SystemExit(f"Could not read {filename} as a base64 file")
    if int(payload.get("size") or 0) > args.max_bytes:
        raise SystemExit(f"Submission is too large: {payload.get('size')} bytes")

    content = base64.b64decode(payload["content"])
    if len(content) > args.max_bytes:
        raise SystemExit(f"Submission is too large after decoding: {len(content)} bytes")

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(content)

    meta = {
        "team": PurePosixPath(filename).stem,
        "filename": filename,
        "head_sha": args.head_sha,
        "size": len(content),
    }
    meta_out = Path(args.meta_out)
    meta_out.parent.mkdir(parents=True, exist_ok=True)
    meta_out.write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Downloaded {filename} to {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
