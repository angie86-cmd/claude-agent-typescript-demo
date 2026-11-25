"""Lesson 3: run an evaluation over the dataset.

The pipeline has three functions, each with one job:
- `run_prompt` merges the prompt template with one test case and asks Claude.
- `run_test_case` runs one test case and grades the output.
- `run_eval` runs every test case in the dataset and collects the results.

Each output is graded by a second Claude call (a "model grader") that returns
strengths, weaknesses, reasoning and a 1-10 score; the run ends with the average
score. Run `generate_dataset.py` first to create `dataset.json`.
"""

import json
import os
import sys
from pathlib import Path
from statistics import mean

from anthropic import Anthropic
from dotenv import load_dotenv

# Load .env from the project root no matter which folder the script is run from.
load_dotenv(Path(__file__).resolve().parents[3] / ".env")

MODEL = "claude-haiku-4-5"

# Safety limit on response length, not a target: Claude stops here if it must.
# It is high on purpose: the prompt is still verbose, and a reply cut off at
# 1000 tokens would be graded as incomplete code.
MAX_TOKENS = 4000

# The dataset is read from the folder of this script, whatever the current one is.
DATASET_PATH = Path(__file__).resolve().parent / "dataset.json"

api_key = os.environ.get("ANTHROPIC_API_KEY")
if not api_key:
    sys.exit("Missing ANTHROPIC_API_KEY. Set it in .env or in your shell.")

client = Anthropic(api_key=api_key)


def add_user_message(messages: list[dict], text: str) -> None:
    """Append a user turn to the conversation history (modified in place)."""
    messages.append({"role": "user", "content": text})


def add_assistant_message(messages: list[dict], text: str) -> None:
    """Append an assistant turn to the history (modified in place).

    Used for prefilling: Claude continues the text instead of starting a reply.
    """
    messages.append({"role": "assistant", "content": text})


def chat(messages: list[dict], stop_sequences: list[str] | None = None) -> str:
    """Send the history to Claude and return the text of its reply.

    Args:
        messages: The conversation so far.
        stop_sequences: Optional strings that end the reply as soon as Claude
            writes them (the matching text is not included).

    Returns:
        The text of Claude's reply.
    """
    params = {
        "model": MODEL,
        "max_tokens": MAX_TOKENS,
        "messages": messages,
    }
    # The API rejects empty optional fields, so only send it when provided.
    if stop_sequences:
        params["stop_sequences"] = stop_sequences

    response = client.messages.create(**params)
    return response.content[0].text


def run_prompt(test_case: dict) -> str:
    """Merge the prompt template with a test case and return Claude's output.

    The prompt has no formatting instructions on purpose, so the output will be
    verbose. Improving that is the point of the next lessons.

    Args:
        test_case: A dataset entry with a "task" key.

    Returns:
        The text of Claude's reply.
    """
    prompt = f"""
Please solve the following task:

{test_case["task"]}
"""
    messages: list[dict] = []
    add_user_message(messages, prompt)
    return chat(messages)


def grade_by_model(test_case: dict, output: str) -> dict:
    """Ask Claude to review an output and score it from 1 to 10.

    The grader must explain itself (strengths, weaknesses, reasoning) before the
    score. Without that context, models tend to default to middling scores
    around 6. The JSON is requested with prefill + stop sequence, so it can be
    parsed directly.

    Args:
        test_case: The dataset entry the output answers.
        output: The text produced by `run_prompt`.

    Returns:
        A dict with `strengths`, `weaknesses`, `reasoning` and `score`.
    """
    eval_prompt = f"""
You are an expert code reviewer. Evaluate this AI-generated solution.

Task: {test_case["task"]}
Solution: {output}

Provide your evaluation as a structured JSON object with:
- "strengths": An array of 1-3 key strengths
- "weaknesses": An array of 1-3 key areas for improvement
- "reasoning": A concise explanation of your assessment
- "score": A number between 1-10

The reply must be valid JSON: escape every backslash as \\ and avoid raw
newlines inside strings.
"""
    messages: list[dict] = []
    add_user_message(messages, eval_prompt)
    add_assistant_message(messages, "```json")

    eval_text = chat(messages, stop_sequences=["```"])
    return json.loads(eval_text.strip())


def run_test_case(test_case: dict) -> dict:
    """Run one test case through the prompt and grade the result.

    Args:
        test_case: A dataset entry with a "task" key.

    Returns:
        A dict with the `output`, the original `test_case`, its `score` and the
        grader's `reasoning`.
    """
    output = run_prompt(test_case)

    # Grade the output with a second Claude call.
    model_grade = grade_by_model(test_case, output)

    return {
        "output": output,
        "test_case": test_case,
        "score": model_grade["score"],
        "reasoning": model_grade["reasoning"],
    }


def run_eval(dataset: list[dict]) -> list[dict]:
    """Run every test case in the dataset, print the average score and return
    the results.

    Args:
        dataset: A list of test cases.

    Returns:
        One result dict per test case, in dataset order.
    """
    results = []
    for test_case in dataset:
        results.append(run_test_case(test_case))

    average_score = mean(result["score"] for result in results)
    print(f"Average score: {average_score}")

    return results


def main() -> None:
    with open(DATASET_PATH, "r", encoding="utf-8") as f:
        dataset = json.load(f)

    # Sequential calls make this slow for big datasets; later lessons improve it.
    results = run_eval(dataset)
    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
