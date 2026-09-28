"""Run locally with: python -m uvicorn app:app --host 127.0.0.1 --port 8765."""
from datetime import datetime
from pathlib import Path
import json
import os
from typing import Literal
from fastapi import FastAPI, HTTPException, Response
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, ConfigDict, Field, field_validator
from store import Store, EventConflict

ROOT = Path(__file__).resolve().parent
POSTS = [
  {"id": "book-algorithm", "title": "알고리즘 교재", "category": "전공책", "price": 12000, "created": 4},
  {"id": "keyboard", "title": "기계식 키보드", "category": "디지털", "price": 25000, "created": 6},
  {"id": "book-db", "title": "데이터베이스 교재", "category": "전공책", "price": 10000, "created": 3},
  {"id": "lamp", "title": "책상 스탠드", "category": "생활용품", "price": 8000, "created": 5},
  {"id": "ball", "title": "농구공", "category": "운동용품", "price": 15000, "created": 2},
  {"id": "mug", "title": "미사용 머그컵", "category": "생활용품", "price": 3000, "created": 1}
]

class ClickEvent(BaseModel):
  model_config = ConfigDict(extra="forbid")
  event_id: str = Field(pattern=r"^[A-Za-z0-9_-]{1,64}$")
  user_id: str = Field(pattern=r"^[A-Za-z0-9_-]{1,64}$")
  category: Literal["전공책", "디지털", "생활용품", "운동용품"]
  occurred_at: datetime

  @field_validator("occurred_at")
  @classmethod
  def require_timezone(cls, value):
    if value.tzinfo is None or value.utcoffset() is None:
      raise ValueError("Timezone is required")
    return value

def create_app(db_path=None):
  store = Store(db_path or os.environ.get("CAMPUS_FEED_DB", str(ROOT / ".runtime" / "demo.db")))
  service = FastAPI(title="Campus Feed", version="1.0.0",
                    description="취창업역량강화 모의 지원 포트폴리오 예제. 합성 데이터만 사용합니다.")
  service.state.store = store

  @service.get("/api/health")
  def health():
    return {"status": "ok", "version": "1.0.0"}

  @service.post("/api/events")
  def ingest(event: ClickEvent, response: Response):
    try:
      result = store.ingest(event.model_dump())
    except EventConflict as error:
      raise HTTPException(status_code=409, detail=str(error)) from error
    response.status_code = 201 if result["status"] == "accepted" else 200
    return result

  @service.get("/api/state/{user_id}")
  def state(user_id: str):
    return store.state(user_id)

  @service.get("/api/feed/{user_id}")
  def feed(user_id: str):
    features = store.features(user_id)
    scores = {f["category"]: f["hits"] for f in features}
    posts = sorted(POSTS, key=lambda p: (-scores.get(p["category"], 0), -p["created"], p["id"]))
    return {"user_id": user_id, "features": features,
            "items": [{**p, "interest_score": scores.get(p["category"], 0)} for p in posts]}

  @service.get("/api/evidence")
  def evidence():
    result = {}
    for name in ("verification", "benchmark"):
      file = ROOT / "evidence" / (name + ".json")
      result[name] = json.loads(file.read_text(encoding="utf-8")) if file.exists() else None
    return result

  @service.get("/")
  def home():
    return FileResponse(ROOT / "web" / "index.html")

  service.mount("/web", StaticFiles(directory=ROOT / "web"), name="web")
  return service

app = create_app()

