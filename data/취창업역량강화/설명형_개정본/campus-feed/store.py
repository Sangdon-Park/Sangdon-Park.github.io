"""SQLite persistence for the classroom portfolio example."""
from contextlib import closing
from datetime import datetime, timezone
from pathlib import Path
import sqlite3

CATEGORIES = ("전공책", "디지털", "생활용품", "운동용품")
FEATURE_SQL = """
SELECT category, COUNT(*) AS hits, MAX(occurred_at) AS latest
FROM events WHERE user_id = ?
GROUP BY category ORDER BY hits DESC, latest DESC, category ASC
"""
INDEX_SQL = "CREATE INDEX IF NOT EXISTS ix_events_user_category_time ON events(user_id, category, occurred_at)"
SCHEMA = """
CREATE TABLE IF NOT EXISTS events(
  event_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  category TEXT NOT NULL,
  occurred_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS user_stats(
  user_id TEXT PRIMARY KEY,
  accepted_count INTEGER NOT NULL,
  latest_at INTEGER NOT NULL,
  latest_category TEXT NOT NULL,
  latest_event_id TEXT NOT NULL
);
"""
class EventConflict(ValueError):
  pass

def timestamp_ms(value):
  if isinstance(value, str):
    value = datetime.fromisoformat(value.replace("Z", "+00:00"))
  if value.tzinfo is None or value.utcoffset() is None:
    raise ValueError("occurred_at requires a timezone")
  return int(value.timestamp() * 1000)

class Store:
  def __init__(self, db_path, indexed=True):
    self.db_path = str(db_path)
    Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
    with closing(self.connect()) as db:
      db.executescript(SCHEMA)
      if indexed:
        db.execute(INDEX_SQL)
      db.commit()

  def connect(self):
    db = sqlite3.connect(self.db_path, timeout=10)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA busy_timeout=10000")
    return db

  def ingest(self, event, fail_after_insert=False):
    ts = timestamp_ms(event["occurred_at"])
    payload = (event["event_id"], event["user_id"], event["category"], ts)
    with closing(self.connect()) as db:
      # Serialize the existence check, insert and counter update together.
      with db:
        db.execute("BEGIN IMMEDIATE")
        prior = db.execute("SELECT * FROM events WHERE event_id=?", (payload[0],)).fetchone()
        if prior:
          if tuple(prior) != payload:
            raise EventConflict("The event ID already belongs to a different payload")
          return {"status": "duplicate", "event_id": payload[0]}
        db.execute("INSERT INTO events VALUES(?,?,?,?)", payload)
        if fail_after_insert:
          raise RuntimeError("Injected failure between the event and the summary")
        db.execute("""
          INSERT INTO user_stats VALUES(?,1,?,?,?)
          ON CONFLICT(user_id) DO UPDATE SET
            accepted_count = accepted_count + 1,
            latest_at = CASE WHEN (excluded.latest_at, excluded.latest_event_id) >
              (user_stats.latest_at, user_stats.latest_event_id) THEN excluded.latest_at ELSE user_stats.latest_at END,
            latest_category = CASE WHEN (excluded.latest_at, excluded.latest_event_id) >
              (user_stats.latest_at, user_stats.latest_event_id) THEN excluded.latest_category ELSE user_stats.latest_category END,
            latest_event_id = CASE WHEN (excluded.latest_at, excluded.latest_event_id) >
              (user_stats.latest_at, user_stats.latest_event_id) THEN excluded.latest_event_id ELSE user_stats.latest_event_id END
        """, (payload[1], ts, payload[2], payload[0]))
    return {"status": "accepted", "event_id": payload[0]}

  def features(self, user_id):
    with closing(self.connect()) as db:
      return [dict(r) for r in db.execute(FEATURE_SQL, (user_id,))]

  def state(self, user_id):
    with closing(self.connect()) as db:
      stats = db.execute("SELECT * FROM user_stats WHERE user_id=?", (user_id,)).fetchone()
      events = [dict(r) for r in db.execute("SELECT * FROM events WHERE user_id=? ORDER BY rowid", (user_id,))]
    return {"user_id": user_id, "stats": dict(stats) if stats else None,
            "features": self.features(user_id), "events": events}

