# 교내 중고거래 관심 피드

대전대학교 컴퓨터공학과 박상돈 / 취창업역량강화 수업의 모의 지원 예제  
지원 직무: 당근 Software Engineer, Backend - 피드 (ML Data Platform, 신입)  
구현·검증일: 2026-09-06

클릭 이벤트를 저장하고 카테고리별 관심 횟수로 합성 게시글 6개의 순서를 바꾸는 로컬 웹 예제입니다.
교수자의 실제 구직 이력이나 학생 대상 운영 실적을 의미하지 않습니다.
인증, 결제, 채팅, 학습 기반 추천 모델은 구현 범위에 포함하지 않았습니다.

## 실행

Python 3.12에서 확인했습니다. 폴더를 연 뒤 다음 명령을 실행합니다.

```powershell
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe -m uvicorn app:app --host 127.0.0.1 --port 8765
```

브라우저에서 http://127.0.0.1:8765 를 엽니다.
API 문서는 http://127.0.0.1:8765/docs 에 있습니다.
macOS/Linux에서는 위 명령의 실행 파일을 .venv/bin/python으로 바꾸면 됩니다.

데모 버튼을 위에서부터 누르면 첫 클릭 저장(201), 같은 클릭 재전송(200), 늦은 기록 저장(201)을 확인합니다.
고유 이벤트는 2건이고 최신 관심은 전공책으로 유지됩니다.
새로고침해도 DB는 유지됩니다. 처음부터 시연하려면 서버를 종료한 뒤 환경 변수 CAMPUS_FEED_DB에 새 DB 파일 경로를 지정하고 다시 실행합니다.

```powershell
$env:CAMPUS_FEED_DB = ".runtime/demo-fresh.db"
.venv\Scripts\python.exe -m uvicorn app:app --host 127.0.0.1 --port 8765
```

## 테스트와 측정

별도 터미널에서 실행합니다. 재실행하면 evidence의 해당 결과 파일이 갱신됩니다.

```powershell
.venv\Scripts\python.exe verify.py
.venv\Scripts\python.exe benchmark.py
```

- 테스트: 12개 통과. 입력 검증, 중복·충돌, 늦은 입력, 롤백, 재접속, 사용자 분리, 동일 시각, 동시 재전송, 피드 정렬, 인덱스 전후 결과와 실행 계획을 확인합니다.
- 의존성에서 발생한 폐기 예정 기능 경고 2개가 테스트 로그에 포함됩니다. 테스트 실패는 없습니다.
- 성능: 합성 이벤트 100,000건, 사용자 1,000명, seed 20260906.
- 조건마다 회차당 300회, 3회차, 워밍업 30회. 각 조건 900개 측정값이며 CSV 전체는 1,800행입니다.
- 회차별 순서는 기준→인덱스 / 인덱스→기준 / 기준→인덱스입니다. 데이터와 SQL, 조회 사용자 목록은 같습니다.
- 한 프로세스·한 연결의 순차 SQL 실행과 fetchall 시간을 측정합니다. 네트워크, HTTP, 동시 부하, 쓰기 지연은 측정하지 않습니다.
- 통합 p95: 인덱스 없음 5.3043ms → 복합 인덱스 있음 0.0866ms. p95 감소율 약 98.4%.
- 회차별 p95: 기준 4.3541 / 4.6296 / 6.4508ms, 인덱스 0.0843 / 0.0823 / 0.0901ms.
- 인덱스 추가 공간은 약 3.20MiB입니다. 이 측정은 쓰기 비용의 증가를 평가하지 않습니다.
- 환경: Windows 11, Intel Core Ultra 9 285K, 논리 CPU 24개, Python 3.12.14, SQLite 3.53.1.
- 결과는 실행 장비와 상태에 따라 달라집니다. 제출 PDF는 동봉된 원본 기록을 기준으로 작성했습니다.

## 설계

POST /api/events에서 event_id를 고유 키로 사용합니다.
같은 ID와 같은 본문은 duplicate로 응답하고 집계하지 않습니다.
같은 ID에 다른 사용자·카테고리·발생 시각이 오면 409를 반환합니다.

이벤트 저장과 사용자 요약 변경은 BEGIN IMMEDIATE 트랜잭션으로 묶습니다.
중간 실패를 주입하는 테스트로 원본과 요약이 함께 롤백되는지 확인했습니다.
최신 관심은 발생 시각으로 결정하고, 시각이 같으면 event_id 순서로 일관되게 결정합니다.
카테고리별 횟수가 같으면 게시글의 합성 생성 순서로 정렬합니다.

조회 인덱스:
```sql
CREATE INDEX ix_events_user_category_time
ON events(user_id, category, occurred_at);
```

## 파일 안내

| 파일 | 내용 |
| --- | --- |
| app.py | 요청 검증, API, 합성 게시글과 피드 정렬 |
| store.py | SQLite 저장, 중복 처리, 트랜잭션, 관심 집계 |
| web/ | 실제 시연 화면 |
| test_app.py | 12개 검증 시나리오 |
| verify.py | 테스트 실행과 JSON/XML/텍스트 기록 생성 |
| benchmark.py | 합성 데이터 생성, 동일 SQL 비교, 실행 계획 검증 |
| evidence/verification.json | 테스트별 통과 결과 |
| evidence/tests.txt, tests.xml | 테스트 원본 로그 |
| evidence/benchmark.json | 실험 조건, 환경, 회차별 결과와 실행 계획 |
| evidence/latency.csv | 개별 측정값 1,800개 |
| evidence/source-manifest.json | 제출한 코드 파일의 SHA-256 |
| evidence/screenshots/ | 실제 실행 화면 캡처 |

## 남은 작업

사용자 인터뷰로 사용 상황 확인, 인증·권한, 데이터 보존 정책, PostgreSQL 이식, 배포, HTTP 부하 측정이 남아 있습니다.
이벤트 ID는 전체 시스템에서 고유하게 발급된다는 전제가 있습니다.
SQLite의 쓰기 직렬화와 지속적으로 커지는 이벤트 원본은 서비스 규모가 커지면 다시 설계해야 합니다.

## 참고 자료

- [당근 공식 채용공고](https://careers.daangn.com/jobs/role/5823087003/) (2026-09-06 확인)
- [당근 지원서 첨부 안내](https://careers.daangn.com/jobs/role/5823087003/apply/) (2026-09-06 확인)
- [AWS / Karrot feature serving](https://aws.amazon.com/ko/blogs/architecture/how-karrot-built-a-feature-platform-on-aws-part-1-motivation-and-feature-serving/) (2025-08-14)
- [AWS / Karrot feature ingestion](https://aws.amazon.com/ko/blogs/architecture/how-karrot-built-a-feature-platform-on-aws-part-2-feature-ingestion/) (2025-08-14)
- [SQLite Query Planning](https://www.sqlite.org/queryplanner.html)
- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)

채용공고는 준비 방향을 정하는 데 사용했고, 회사의 내부 구현이나 성능을 재현한 프로젝트는 아닙니다.
학생은 자신의 코드·역할·측정 기록으로 바꾸어 발표해야 합니다.

