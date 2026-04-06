# AGENTS.md

This file orchestrates the harness workflow for Codex.

## Required Files

- `agents/planner.md`
- `agents/generator.md`
- `agents/evaluator.md`
- `agents/evaluation_criteria.md`
- `SPEC.md`
- `SELF_CHECK.md`
- `QA_REPORT.md`

If any required file is missing, restore it before continuing.

## Pipeline

1. Read the user request.
2. Run the planner rules in `agents/planner.md` and update `SPEC.md`.
3. Run the generator rules in `agents/generator.md` and update files in `output/` plus `SELF_CHECK.md`.
4. Run the evaluator rules in `agents/evaluator.md` and update `QA_REPORT.md`.
5. If the verdict is `PASS`, stop.
6. If the verdict is `CONDITIONAL PASS` or `FAIL`, return to the generator and revise the output.
7. Retry at most 3 total generator-evaluator cycles.

## Global Rules

- Follow the shared rubric in `agents/evaluation_criteria.md`.
- Do not create your own relaxed acceptance criteria.
- Do not skip evaluation after generation.
- Do not move to the next stage if the current stage output is incomplete.
- Prefer deterministic, inspectable output over clever but brittle tricks.
