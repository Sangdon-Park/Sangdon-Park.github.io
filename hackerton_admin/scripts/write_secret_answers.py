from __future__ import annotations

import argparse
import base64
import os
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description="Write private answer CSV from PRIVATE_ANSWERS_CSV_B64.")
    parser.add_argument("--output", default="hackerton_admin/answers/private_solution.csv")
    parser.add_argument("--env", default="PRIVATE_ANSWERS_CSV_B64")
    args = parser.parse_args()

    value = os.environ.get(args.env)
    if not value:
        raise SystemExit(f"Missing required environment variable: {args.env}")

    try:
        content = base64.b64decode(value)
    except Exception as exc:
        raise SystemExit(f"Could not decode {args.env} as base64: {exc}") from exc

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_bytes(content)
    print(f"Wrote private answers to {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
