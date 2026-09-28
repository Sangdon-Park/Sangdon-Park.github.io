import json
import platform
import subprocess
import sys
import xml.etree.ElementTree as E
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "evidence"
OUT.mkdir(exist_ok=True)
result = subprocess.run([sys.executable, "-m", "pytest", "-q", "--junitxml=" + str(OUT / "tests.xml"), "test_app.py"],
                        cwd=ROOT, capture_output=True, text=True, encoding="utf-8", errors="replace")
(OUT / "tests.txt").write_text(result.stdout + result.stderr, encoding="utf-8")
if result.returncode:
  print(result.stdout + result.stderr)
  raise SystemExit(result.returncode)
root = E.parse(OUT / "tests.xml").getroot()
cases = []
for case in root.iter("testcase"):
  cases.append({"name": case.attrib["name"], "passed": not any(case.find(k) is not None for k in ("failure", "error", "skipped")),
                "seconds": float(case.attrib.get("time", 0))})
verification = {"executed_at": datetime.now(timezone.utc).isoformat(), "python": platform.python_version(),
                "passed": sum(c["passed"] for c in cases), "total": len(cases), "cases": cases}
(OUT / "verification.json").write_text(json.dumps(verification, ensure_ascii=False, indent=2), encoding="utf-8")
print(result.stdout)

