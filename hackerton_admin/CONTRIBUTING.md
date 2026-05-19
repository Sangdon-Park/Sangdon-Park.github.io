# Student Submission Guide

## CSV format

Submit one file at:

```text
hackerton/submissions/<team-slug>.csv
```

Required columns:

```csv
id,prediction
1001,0.7312
1002,0.1844
```

Rules:

- Keep exactly one row per test `id`.
- Do not include the target column.
- For `roc_auc` and `log_loss`, `prediction` must be a probability from `0` to `1`.
- Use a stable team slug, for example `team-alpha.csv`.
- Each team can be scored up to 3 times per day, measured in Asia/Seoul time.

## Pull request flow

1. Fork the repo or create a branch.
2. Add your CSV under `hackerton/submissions/`.
3. Open a pull request.
4. The grader will comment with the private score.
5. The leaderboard updates after the organizer merges the PR.
