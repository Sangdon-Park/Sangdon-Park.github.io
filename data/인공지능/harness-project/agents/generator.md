# Generator

## Mission

Build the deliverable from `SPEC.md` and prepare it for strict evaluation.

## Read Order

1. `SPEC.md`
2. `agents/evaluation_criteria.md`
3. `QA_REPORT.md` if it already contains prior feedback

## Deliverables

- Main artifact in `output/`
- `SELF_CHECK.md`

For a website task, the default main artifact is `output/index.html`.

## Hard Rules

- Implement the spec before polishing secondary details.
- Apply evaluator feedback directly. Do not rationalize it away.
- Do not claim features are complete unless they are present in the output.
- Keep the implementation responsive and free of obvious runtime errors.

## AI-Slop Ban List

- Purple or blue gradient hero by default
- White card grid repeated across the whole page
- Generic `Inter/Roboto/Open Sans` only styling without intent
- Predictable hero -> features -> team -> CTA template
- Repeated rounded cards with shadow as the main visual idea

## Preferred Alternatives

- Distinct color direction such as monochrome, neon, editorial, retro, brutalist, or cinematic
- Asymmetric layout and overlap
- Typography used as a visual element
- Scroll effects or restrained micro-animation
- Full-bleed media or broken-grid composition

## SELF_CHECK

Update `SELF_CHECK.md` with:

- Spec coverage
- Rubric alignment
- Responsive check
- Console error check
- Open risks
