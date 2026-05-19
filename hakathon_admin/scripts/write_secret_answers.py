from __future__ import annotations

import argparse
import base64
import os
from pathlib import Path


def load_encoded_payload(base_env: str) -> str:
    chunks = []
    index = 1
    while True:
        value = os.environ.get(f"{base_env}_{index}")
        if not value:
            break
        chunks.append(value)
        index += 1
    if chunks:
        return "".join(chunks)

    value = os.environ.get(base_env)
    if not value:
        raise SystemExit(f"Missing required environment variable: {base_env}")
    return value


def main() -> int:
    parser = argparse.ArgumentParser(description="Write grader data from a base64 encoded environment variable.")
    parser.add_argument("--output", default="hakathon_admin/runtime/grader.csv")
    parser.add_argument("--env", default="GRADER_DATA_B64")
    args = parser.parse_args()

    value = load_encoded_payload(args.env)

    try:
        content = base64.b64decode(value)
    except Exception as exc:
        raise SystemExit(f"Could not decode {args.env} as base64: {exc}") from exc

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_bytes(content)
    print(f"Wrote grader payload to {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
