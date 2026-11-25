"""Lesson 2: generate an evaluation dataset with Claude.

The prompt we want to evaluate helps users write Python, JSON or regex for AWS
tasks and must return only that output, with no explanations. To test it we need
a dataset: a list of JSON objects, each with a "task" to solve. Writing it by
hand is slow, so Claude generates it and the result is saved to `dataset.json`.
"""

import json
import os
import sys
from pathlib import Path

from anthropic import Anthropic
from dotenv import load_dotenv

# Load .env from the project root no matter which folder the script is run from.
load_dotenv(Path(__file__).resolve().parents[3] / ".env")

# A fast, cheap model is enough to generate test data.
MODEL = "claude-haiku-4-5"

# Safety limit on response length, not a target: Claude stops here if it must.
MAX_TOKENS = 1000

# The dataset is saved next to this script, whatever the current folder is.
DATASET_PATH = Path(__file__).resolve().parent / "dataset.json"

# How many tasks to ask for.
DATASET_SIZE = 3

api_key = os.environ.get("ANTHROPIC_API_KEY")
if not api_key:
    sys.exit("Missing ANTHROPIC_API_KEY. Set it in .env or in your shell.")

client = Anthropic(api_key=api_key)


def add_user_message(messages: list[dict], text: str) -> None:
    """Append a user turn to the conversation history (modified in place)."""
    messages.append({"role": "user", "content": text})


def add_assistant_message(messages: list[dict], text: str) -> None:
    """Append an assistant turn to the history (modified in place).

    Used here for prefilling: Claude continues the text instead of starting a
    new reply.
    """
    messages.append({"role": "assistant", "content": text})


def chat(
    messages: list[dict],
    system: str | None = None,
    stop_sequences: list[str] | None = None,
) -> str:
    """Send the history to Claude and return the text of its reply.

    Args:
        messages: The conversation so far.
        system: Optional system prompt that guides how Claude responds.
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
    # Optional fields are only sent when provided; the API rejects empty ones.
    if system:
        params["system"] = system
    if stop_sequences:
        params["stop_sequences"] = stop_sequences

    response = client.messages.create(**params)
    return response.content[0].text


def generate_dataset(size: int = DATASET_SIZE) -> list[dict]:
    """Ask Claude for a list of tasks to use as eval inputs.

    Args:
        size: How many tasks to generate.

    Returns:
        A list of dicts like `{"task": "Description of task"}`.
    """
    prompt = f"""
Generate an evaluation dataset for a prompt evaluation. The dataset will be used to evaluate prompts that generate Python, JSON, or Regex specifically for AWS-related tasks. Generate an array of JSON objects, each representing task that requires Python, JSON, or a Regex to complete.

Example output:
```json
[
  {{
    "task": "Description of task"
  }},
  ...additional
]
```

* Focus on tasks that can be solved by writing a single Python function, a single JSON object, or a single regex
* Focus on tasks that do not require writing much code

Please generate {size} objects.
"""
    messages: list[dict] = []
    add_user_message(messages, prompt)
    # Prefill an opening code block and stop at the closing one, so the reply is
    # only the JSON (the trick from module 1).
    add_assistant_message(messages, "```json")
    text = chat(messages, stop_sequences=["```"])
    return json.loads(text.strip())


def save_dataset(dataset: list[dict], path: Path = DATASET_PATH) -> None:
    """Write the dataset to a JSON file so the eval can load it later."""
    with open(path, "w", encoding="utf-8") as f:
        json.dump(dataset, f, indent=2)


def main() -> None:
    dataset = generate_dataset()
    print(json.dumps(dataset, indent=2))
    save_dataset(dataset)
    print(f"\nSaved {len(dataset)} tasks to {DATASET_PATH.name}")


if __name__ == "__main__":
    main()
