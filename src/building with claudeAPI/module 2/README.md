# Module 2: Prompt evaluation

How to measure whether a prompt is good instead of guessing.

## Lessons

| # | Lesson | Status | File |
| --- | --- | --- | --- |
| 1 | A typical eval workflow | Done | `promptEval.ts` |

## What each lesson covers

- **A typical eval workflow:** five steps. (1) Draft a prompt. (2) Build a
  dataset of sample questions. (3) Run each question through Claude using the
  prompt. (4) Have a grader score each answer from 1 to 10 and average the
  scores. (5) Change the prompt and repeat, then keep the version with the best
  average. `promptEval.ts` is a minimal version: three questions, two prompt
  versions and Claude as the grader, which replies in JSON (using the prefill +
  stop sequence trick from module 1).

## Run

```bash
npx tsx "src/building with claudeAPI/module 2/promptEval.ts"
```

With only three easy questions, both prompts scored 9.33 on the first run, so
the result was a tie. A useful eval needs a larger, harder dataset.
