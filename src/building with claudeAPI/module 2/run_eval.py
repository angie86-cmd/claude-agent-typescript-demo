"""Lesson 3: run an evaluation over the dataset.

The pipeline has three functions, each with one job:
- `run_prompt` merges the prompt template with one test case and asks Claude.
- `run_test_case` runs one test case and (later) grades the output.
- `run_eval` runs every test case in the dataset and collects the results.

Grading is a placeholder for now: every output gets a hardcoded score of 10.
Run `generate_dataset.py` first to create `dataset.json`.
"""

import json
import os
import sys
from pathlib import Path

from anthropic import Anthropic
from dotenv import load_dotenv

# Load .env from the project root no matter which folder the script is run from.
load_dotenv(Path(__file__).resolve().parents[3] / ".env")

MODEL = "claude-haiku-4-5"

# Safety limit on response length, not a target: Claude stops here if it must.
MAX_TOKENS = 1000

# The dataset is read from the folder of this script, whatever the current one is.
DATASET_PATH = Path(__file__).resolve().parent / "dataset.json"

api_key = os.environ.get("ANTHROPIC_API_KEY")
if not api_key:
    sys.exit("Missing ANTHROPIC_API_KEY. Set it in .env or in your shell.")

client = Anthropic(api_key=api_key)


def add_user_message(messages: list[dict], text: str) -> None:
    """Append a user turn to the conversation history (modified in place)."""
    messages.append({"role": "user", "content": text})


def chat(messages: list[dict]) -> str:
    """Send the history to Claude and return the text of its reply."""
    response = client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        messages=messages,
    )
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


def run_test_case(test_case: dict) -> dict:
    """Run one test case through the prompt and grade the result.

    Args:
        test_case: A dataset entry with a "task" key.

    Returns:
        A dict with the `output`, the original `test_case` and its `score`.
    """
    output = run_prompt(test_case)

    # TODO: real grading. A hardcoded score lets us test the whole pipeline.
    score = 10

    return {
        "output": output,
        "test_case": test_case,
        "score": score,
    }


def run_eval(dataset: list[dict]) -> list[dict]:
    """Run every test case in the dataset and collect the results.

    Args:
        dataset: A list of test cases.

    Returns:
        One result dict per test case, in dataset order.
    """
    results = []
    for test_case in dataset:
        results.append(run_test_case(test_case))
    return results


def main() -> None:
    with open(DATASET_PATH, "r", encoding="utf-8") as f:
        dataset = json.load(f)

    # Sequential calls make this slow for big datasets; later lessons improve it.
    results = run_eval(dataset)
    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
