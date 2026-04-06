# Harness Project

Codex harness starter based on the "Harness Engineering" lecture deck.

## Goal

Turn a short user request into a repeatable three-agent workflow:

1. `Planner` expands the request into `SPEC.md`.
2. `Generator` implements the deliverable and writes `SELF_CHECK.md`.
3. `Evaluator` grades the result and writes `QA_REPORT.md`.

The loop repeats until the result passes or the retry budget is exhausted.

## Folder Layout

```text
harness-project/
  AGENTS.md
  SPEC.md
  SELF_CHECK.md
  QA_REPORT.md
  agents/
    planner.md
    generator.md
    evaluator.md
    evaluation_criteria.md
  output/
    README.md
```

## Quick Start

```bash
cd harness-project
codex
```

Then give one short request such as:

```text
AI 교육 전문 회사의 랜딩페이지를 만들어줘
```

## Operating Rules

- Do not skip files that the next stage depends on.
- Do not invent relaxed criteria outside the role documents.
- Generator must apply evaluator feedback directly.
- Evaluator must stay strict and avoid lenient scoring.
