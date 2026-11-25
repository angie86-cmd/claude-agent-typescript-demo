# Module 2: Prompt evaluation

How to measure whether a prompt is good instead of guessing.

## Lessons

| # | Lesson | Status | File |
| --- | --- | --- | --- |
| 1 | A typical eval workflow | Done | `promptEval.ts` |
| 2 | Generating test datasets | Done | `generate_dataset.py` |
| 3 | Running the eval | Done | `run_eval.py` |
| 4 | Model-based grading | Done | `run_eval.py` |

## What each lesson covers

- **A typical eval workflow:** five steps. (1) Draft a prompt. (2) Build a
  dataset of sample questions. (3) Run each question through Claude using the
  prompt. (4) Have a grader score each answer from 1 to 10 and average the
  scores. (5) Change the prompt and repeat, then keep the version with the best
  average. `promptEval.ts` is a minimal version: three questions, two prompt
  versions and Claude as the grader, which replies in JSON (using the prefill +
  stop sequence trick from module 1).
- **Generating test datasets:** instead of writing eval inputs by hand, ask a
  fast model (Haiku) for a JSON array of `{"task": ...}` objects, using the
  prefill + stop sequence trick to get clean JSON, then save it to
  `dataset.json`. The goal prompt returns Python, JSON or regex for AWS tasks.
- **Running the eval:** three functions with one job each. `run_prompt` merges
  the template with a test case and asks Claude; `run_test_case` calls it and
  grades the output (hardcoded score of 10 for now); `run_eval` loops over the
  dataset and collects `{output, test_case, score}` results. The prompt has no
  formatting instructions yet, so the outputs are verbose on purpose.
- **Model-based grading:** `grade_by_model` asks a second Claude call to act as
  a code reviewer and return JSON with `strengths`, `weaknesses`, `reasoning`
  and a 1-10 `score`. Asking for the reasoning first matters: without it,
  models drift toward middling scores around 6. `run_test_case` keeps the score
  and reasoning, and `run_eval` prints the average with `statistics.mean`.
  Lesson 4 updates `run_eval.py` in place instead of adding a new file.

## Run

```bash
npx tsx "src/building with claudeAPI/module 2/promptEval.ts"
```

The dataset generator is Python (needs `anthropic` and `python-dotenv`) and
writes `dataset.json` next to the script:

```bash
python "src/building with claudeAPI/module 2/generate_dataset.py"
```

Then run the eval (reads `dataset.json`, so generate it first):

```bash
python "src/building with claudeAPI/module 2/run_eval.py"
```

With only three easy questions, both prompts scored 9.33 on the first run, so
the result was a tie. A useful eval needs a larger, harder dataset.
