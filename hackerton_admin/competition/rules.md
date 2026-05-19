# Competition Rules

## Goal

Build the best tabular prediction system for the two held-out evaluation splits. Algorithms are unrestricted unless the organizer announces a separate rule before the competition starts.

## Submission

- File path: `hackerton/submissions/<team-slug>.csv`
- Columns: `id,prediction`
- One file per team per accepted leaderboard entry
- Daily limit: 3 scored attempts per team per day, measured in Asia/Seoul time
- Final metric: configured in `hackerton_admin/competition/config.json`

## Anti-leakage policy

- Do not manually label the test set.
- Do not use target values from the evaluation split.
- Do not submit predictions generated from another team's result.
- Public discussion of general modeling approaches is allowed; sharing exact submitted predictions is not.

## 운영 원칙

- 제출 제한과 최종 지표는 대회 시작 전에 고정합니다.
- invalid 제출은 merge하지 않습니다.
- 최종 순위는 공식 리더보드 기준으로 확정합니다.
