"""Reproducible SQL microbenchmark, not an HTTP/load/concurrency benchmark."""
import csv
from contextlib import closing
import hashlib
import json
import math
import os
import platform
import random
import sqlite3
import statistics
import tempfile
import time
from datetime import datetime, timezone
from pathlib import Path
from store import Store, FEATURE_SQL, INDEX_SQL, CATEGORIES

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "evidence"
SEED = 20260906
N = 100_000
USERS = 1_000
SAMPLES = 300
ROUNDS = 3
WARMUPS = 30

def percentile(values, q):
  values = sorted(values)
  return values[max(0, math.ceil(q * len(values)) - 1)]

def summarize(values):
  return {"count": len(values), "p50_ms": round(statistics.median(values), 6),
          "p95_ms": round(percentile(values, .95), 6),
          "max_ms": round(max(values), 6)}

def run():
  OUT.mkdir(exist_ok=True)
  rng = random.Random(SEED)
  rows = [(f"bench-{i:06d}", f"u-{rng.randrange(USERS):04d}", rng.choice(CATEGORIES), 1788652800000 + i * 1000) for i in range(N)]
  input_digest = hashlib.sha256(json.dumps(rows, ensure_ascii=False, separators=(",", ":")).encode()).hexdigest()
  query_users = [f"u-{rng.randrange(USERS):04d}" for _ in range(SAMPLES)]
  raw = []
  rounds = []
  equality = True
  plans = {}
  with tempfile.TemporaryDirectory(prefix="campus-feed-bench-") as tmp:
    store = Store(Path(tmp) / "bench.db", indexed=False)
    with closing(store.connect()) as db:
      db.executemany("INSERT INTO events VALUES(?,?,?,?)", rows)
      db.commit()
      size_before = db.execute("PRAGMA page_count").fetchone()[0] * db.execute("PRAGMA page_size").fetchone()[0]
      for round_no in range(1, ROUNDS + 1):
        results = {}
        # Alternating order reduces the risk of attributing run order to the index.
        order = ["baseline", "indexed"] if round_no % 2 else ["indexed", "baseline"]
        for variant in order:
          db.execute(INDEX_SQL if variant == "indexed" else "DROP INDEX IF EXISTS ix_events_user_category_time")
          db.commit()
          # A distinct EXPLAIN text avoids reusing stale diagnostic statements after DDL.
          plans[variant] = [r[3] for r in db.execute("EXPLAIN QUERY PLAN " + FEATURE_SQL + f" -- {round_no}-{variant}", (query_users[0],))]
          assert any(("SEARCH events" if variant == "indexed" else "SCAN events") in line for line in plans[variant])
          for user in query_users[:WARMUPS]:
            db.execute(FEATURE_SQL, (user,)).fetchall()
          samples = []
          answers = []
          for i, user in enumerate(query_users):
            start = time.perf_counter_ns()
            answer = [tuple(r) for r in db.execute(FEATURE_SQL, (user,)).fetchall()]
            elapsed_ms = (time.perf_counter_ns() - start) / 1_000_000
            samples.append(elapsed_ms)
            answers.append(answer)
            raw.append([round_no, variant, i, user, format(elapsed_ms, ".9f")])
          results[variant] = {"summary": summarize(samples), "answers": answers}
        equality &= results["baseline"]["answers"] == results["indexed"]["answers"]
        rounds.append({"round": round_no, "order": order, "baseline": results["baseline"]["summary"], "indexed": results["indexed"]["summary"]})
      db.execute(INDEX_SQL)
      db.commit()
      index_bytes = sum(r[0] for r in db.execute("SELECT pgsize FROM dbstat WHERE name='ix_events_user_category_time'")) if db.execute("SELECT count(*) FROM pragma_module_list WHERE name='dbstat'").fetchone()[0] else None
      if index_bytes is None:
        index_bytes = db.execute("PRAGMA page_count").fetchone()[0] * db.execute("PRAGMA page_size").fetchone()[0] - size_before
  before = [float(r[4]) for r in raw if r[1] == "baseline"]
  after = [float(r[4]) for r in raw if r[1] == "indexed"]
  b, a = summarize(before), summarize(after)
  result = {
    "measured_at": datetime.now(timezone.utc).isoformat(),
    "scope": "Single-process warm SQL execute+fetchall latency. HTTP, network, concurrency and write latency are excluded.",
    "seed": SEED, "rows": N, "users": USERS, "samples_per_variant_per_round": SAMPLES,
    "rounds_count": ROUNDS, "warmups_per_variant_per_round": WARMUPS,
    "dataset_sha256": input_digest, "query": FEATURE_SQL.strip(),
    "change": INDEX_SQL, "plans": plans, "rounds": rounds,
    "baseline": b, "indexed": a,
    "p95_reduction_percent": round((b["p95_ms"] - a["p95_ms"]) / b["p95_ms"] * 100, 4),
    "results_equal": equality, "query_errors": 0,
    "approx_index_bytes": index_bytes,
    "environment": {"python": platform.python_version(), "sqlite": sqlite3.sqlite_version,
                    "system": platform.system(), "release": platform.release(),
                    "machine": platform.machine(), "logical_cpus": os.cpu_count(),
                    "processor": os.environ.get("BENCH_CPU_MODEL", platform.processor())}
  }
  assert equality, "Index changed query results"
  (OUT / "benchmark.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
  with (OUT / "latency.csv").open("w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["round","variant","sample","user_id","elapsed_ms"])
    writer.writerows(raw)
  print(json.dumps(result, ensure_ascii=False, indent=2))
if __name__ == "__main__":
  run()
