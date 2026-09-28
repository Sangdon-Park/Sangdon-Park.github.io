from concurrent.futures import ThreadPoolExecutor
from contextlib import closing
from fastapi.testclient import TestClient
import pytest
from app import create_app
from store import Store, EventConflict, FEATURE_SQL

def event(id="e01", cat="전공책", at="2026-09-06T10:00:00+09:00", user="u-demo"):
  return {"event_id": id, "user_id": user, "category": cat, "occurred_at": at}

@pytest.fixture
def store(tmp_path):
  return Store(tmp_path / "test.db")

def test_duplicate_counted_once(store):
  assert store.ingest(event())["status"] == "accepted"
  assert store.ingest(event())["status"] == "duplicate"
  assert store.state("u-demo")["stats"]["accepted_count"] == 1
  assert store.features("u-demo")[0]["hits"] == 1

def test_late_event_keeps_latest(store):
  store.ingest(event())
  store.ingest(event("e02", "운동용품", "2026-09-06T09:59:00+09:00"))
  state = store.state("u-demo")
  assert state["stats"]["latest_category"] == "전공책"
  assert state["stats"]["accepted_count"] == 2

def test_conflicting_reuse_rejected(store):
  store.ingest(event())
  with pytest.raises(EventConflict):
    store.ingest(event(cat="디지털"))
  assert store.state("u-demo")["stats"]["accepted_count"] == 1

def test_failed_transaction_rolls_back_and_retries(store):
  with pytest.raises(RuntimeError):
    store.ingest(event(), fail_after_insert=True)
  assert store.state("u-demo")["events"] == []
  assert store.state("u-demo")["stats"] is None
  store.ingest(event())
  assert store.state("u-demo")["stats"]["accepted_count"] == 1

def test_reopen_preserves_idempotency(store):
  store.ingest(event())
  reopened = Store(store.db_path)
  assert reopened.ingest(event())["status"] == "duplicate"
  assert reopened.state("u-demo")["stats"]["accepted_count"] == 1

def test_users_are_isolated(store):
  store.ingest(event())
  store.ingest(event("e02", "디지털", user="u-other"))
  assert store.features("u-demo")[0]["category"] == "전공책"
  assert store.features("u-other")[0]["category"] == "디지털"

def test_equal_times_have_deterministic_latest(store):
  store.ingest(event("e02", "디지털"))
  store.ingest(event("e01", "전공책"))
  assert store.state("u-demo")["stats"]["latest_event_id"] == "e02"

def test_concurrent_duplicate_submissions(store):
  with ThreadPoolExecutor(max_workers=8) as pool:
    results = list(pool.map(lambda _: store.ingest(event()), range(16)))
  assert sum(r["status"] == "accepted" for r in results) == 1
  assert store.state("u-demo")["stats"]["accepted_count"] == 1

def test_api_validation(tmp_path):
  with TestClient(create_app(tmp_path / "api.db")) as client:
    assert client.post("/api/events", json=event(cat="없는분류")).status_code == 422
    assert client.post("/api/events", json=event(at="2026-09-06T10:00:00")).status_code == 422
    assert client.post("/api/events", json={**event(), "extra": "no"}).status_code == 422
    assert client.get("/api/state/u-demo").json()["events"] == []

def test_api_duplicate_and_conflict(tmp_path):
  with TestClient(create_app(tmp_path / "api.db")) as client:
    assert client.post("/api/events", json=event()).status_code == 201
    assert client.post("/api/events", json=event()).status_code == 200
    assert client.post("/api/events", json=event(cat="디지털")).status_code == 409

def test_feed_and_new_user_fallback(tmp_path):
  with TestClient(create_app(tmp_path / "api.db")) as client:
    assert client.get("/api/feed/new").json()["items"][0]["id"] == "keyboard"
    client.post("/api/events", json=event())
    feed = client.get("/api/feed/u-demo").json()
    assert [p["category"] for p in feed["items"][:2]] == ["전공책", "전공책"]
    assert feed["items"][0]["interest_score"] == 1

def test_index_changes_plan_not_results(store):
  with closing(store.connect()) as db:
    for i in range(20):
      db.execute("INSERT INTO events VALUES(?,?,?,?)", (f"e{i}", "u-demo", "전공책", i))
    db.commit()
  before = store.features("u-demo")
  with closing(store.connect()) as db:
    assert any("SEARCH events" in r[3] for r in db.execute("EXPLAIN QUERY PLAN " + FEATURE_SQL, ("u-demo",)))
    db.execute("DROP INDEX ix_events_user_category_time")
    assert any("SCAN events" in r[3] for r in db.execute("EXPLAIN QUERY PLAN " + FEATURE_SQL + " -- dropped", ("u-demo",)))
  assert store.features("u-demo") == before
