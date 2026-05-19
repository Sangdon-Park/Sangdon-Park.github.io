# XGBoost Tabular Hackathon Platform

학생들이 `id,prediction` 형식의 CSV를 제출하면 GitHub Actions가 private 정답으로 자동 채점하고, GitHub Pages가 순위표를 보여주는 해커톤 템플릿입니다.

## 구성

- `hackerton/`: GitHub Pages 하위 페이지
- `.github/workflows/score-hackerton-pr.yml`: 학생 PR 제출 자동 채점
- `.github/workflows/publish-hackerton-leaderboard.yml`: `main`에 반영된 제출물로 순위표 갱신
- `hackerton_admin/scripts/`: 데이터 준비, 채점, 리더보드 생성 스크립트
- `hackerton_admin/competition/config.json`: 컬럼명, metric, 제출 규칙
- `hackerton_admin/answers/private_solution.csv`: private 정답 파일, Git에는 올리지 않음
- `hackerton/data/train.csv`, `hackerton/data/test.csv`: 학생에게 공개되는 데이터
- `hackerton/submissions/<team>.csv`: 팀별 제출 파일
- 제출 제한: `hackerton_admin/competition/config.json`의 `daily_submission_limit` 값으로 제어, 기본은 한국 시간 기준 팀별 하루 3회

## 운영 흐름

1. 데이터셋을 고릅니다.
   - 후보는 `hackerton/data/datasets.json`에 정리되어 있습니다.
   - OpenML 데이터는 `hackerton_admin/scripts/prepare_openml_dataset.py`로 train/test/정답 파일을 만들 수 있습니다.

2. 로컬 환경을 준비합니다.

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python hackerton_admin/scripts/generate_demo_data.py
python hackerton_admin/scripts/build_leaderboard.py --answers hackerton_admin/answers/private_solution.csv --config hackerton_admin/competition/config.json --out hackerton/data/leaderboard.json
```

3. GitHub 저장소에 올린 뒤 Actions secret을 등록합니다.

```powershell
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes("hackerton_admin/answers/private_solution.csv"))
$b64
```

GitHub 저장소의 `Settings -> Secrets and variables -> Actions`에 `PRIVATE_ANSWERS_CSV_B64` 이름으로 위 값을 저장합니다.

4. GitHub Pages를 켭니다.
   - 이 저장소는 `main` 브랜치 루트가 이미 GitHub Pages로 배포됩니다.
   - 해커톤 페이지 URL은 `https://sangdon-park.github.io/hackerton/`입니다.
   - 제출 제한 ledger를 쓰려면 저장소의 Issues 기능이 켜져 있어야 합니다.

5. 학생 제출 방식
   - 학생은 `hackerton/submissions/<team-slug>.csv` 파일을 추가해서 PR을 엽니다.
   - CSV는 반드시 `id,prediction` 컬럼을 가져야 합니다.
   - PR이 열리거나 갱신되면 `score-hackerton-pr.yml`이 하루 제출 횟수를 확인한 뒤 private score를 댓글로 남깁니다.
   - 제출 횟수는 `Submission Ledger: automated grading attempts` issue에 bot 댓글로 기록됩니다.
   - 운영자가 PR을 merge하면 `publish-hackerton-leaderboard.yml`이 `hackerton/data/leaderboard.json`을 갱신합니다.

## 보안 메모

`score-hackerton-pr.yml`은 `pull_request_target`을 사용하지만, 학생 브랜치의 코드를 checkout하거나 실행하지 않습니다. base repo의 신뢰된 스크립트만 실행하고, GitHub API로 PR의 CSV 파일 내용만 읽습니다. 이 구조를 유지해야 private answer secret이 노출될 가능성을 낮출 수 있습니다.

일일 제출 제한은 GitHub issue 댓글에 저장된 bot ledger를 기준으로 계산합니다. 학생이 같은 팀 파일명으로 하루 3회를 넘기면 정답 secret을 복원하지 않고 채점을 중단합니다.

## 데이터 출처 조사 요약

- UCI Machine Learning Repository: tabular classification/regression 데이터가 많고, 수업/해커톤용으로 설명과 규모가 명확합니다.
- OpenML: API로 검색과 다운로드를 자동화하기 좋습니다.
- Kaggle: 데이터 폭은 넓지만, 일부 데이터는 계정/API token/라이선스 확인이 필요합니다.
- AI Hub: 한국어/국내 산업 데이터가 풍부하지만, 로그인과 이용 약관 확인이 필요한 데이터가 많아 운영자가 별도로 검토하는 편이 안전합니다.

## 추천 기본 대회

처음 운영할 때는 UCI Bank Marketing, Adult, Online Shoppers, Bike Sharing 같은 tabular 데이터가 적당합니다. XGBoost/LightGBM/CatBoost 비교가 잘 되고, 제출 파일 크기도 GitHub Actions에서 다루기 쉽습니다.
