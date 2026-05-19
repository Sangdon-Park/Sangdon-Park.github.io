# Competition Rules

## Goal

Build the best tabular model for the private test split. XGBoost is expected, but any tabular ML method is allowed unless the organizer changes this rule.

## Submission

- File path: `hackerton/submissions/<team-slug>.csv`
- Columns: `id,prediction`
- One file per team per accepted leaderboard entry
- Daily limit: 3 scored attempts per team per day, measured in Asia/Seoul time
- Private metric: configured in `hackerton_admin/competition/config.json`

## Anti-leakage policy

- Do not manually label the test set.
- Do not use private target values.
- Do not submit predictions generated from another team's private result.
- Public discussion of general modeling approaches is allowed; sharing exact private predictions is not.

## Organizer checklist

- Keep `hackerton_admin/answers/private_solution.csv` out of Git.
- Store private answers only in `PRIVATE_ANSWERS_CSV_B64`.
- Review invalid PRs before merge.
- Change the final metric only before the competition starts.
