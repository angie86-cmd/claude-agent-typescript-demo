"""Lesson 5: system prompts with the Anthropic API.

A system prompt is a plain string that tells Claude how to respond. Claude tries
to answer the way someone in the given role would, which also helps keep it on
task. The same question is sent twice, without and with a system prompt, so the
difference is easy to see.
"""

import os
import sys
from pathlib import Path

from anthropic import Anthropic
from dotenv import load_dotenv

# Load .env from the project root no matter which folder the script is run from.
load_dotenv(Path(__file__).resolve().parents[3] / ".env")

# Keep this model for the whole course: newer ones reject settings that later
# lessons teach, such as temperature and prefilled assistant messages.
MODEL = "claude-haiku-4-5"

# Safety limit on response length, not a target: Claude stops here if it must.
MAX_TOKENS = 1000

# Defines Claude's role and how it should (and should not) answer.
MATH_TUTOR_PROMPT = """
You are a patient math tutor.
Do not directly answer a student's questions.
Guide them to a solution step by step.
"""

api_key = os.environ.get("ANTHROPIC_API_KEY")
if not api_key:
    sys.exit("Missing ANTHROPIC_API_KEY. Set it in .env or in your shell.")

client = Anthropic(api_key=api_key)


def add_user_message(messages: list[dict], text: str) -> None:
    """Append a user turn to the conversation history.

    Args:
        messages: The conversation history. It is modified in place.
        text: What the user wants to say or ask.

    Returns:
        Nothing. The new message is added to the end of `messages`.
    """
    # A user message is a dict with a role and its content.
    messages.append({"role": "user", "content": text})


def add_assistant_message(messages: list[dict], text: str) -> None:
    """Append an assistant turn (a previous Claude reply) to the history.

    Args:
        messages: The conversation history. It is modified in place.
        text: Claude's reply, usually the value returned by `chat`.

    Returns:
        Nothing. The new message is added to the end of `messages`.
    """
    # Same shape as a user message, but with the "assistant" role.
    messages.append({"role": "assistant", "content": text})


def chat(messages: list[dict], system: str | None = None) -> str:
    """Send the history to Claude and return the text of its reply.

    The system prompt is optional, so the same function works for plain chats
    and for chats where Claude plays a specific role.

    Args:
        messages: The whole conversation so far, ending with a user message.
        system: Optional system prompt that guides how Claude responds.

    Returns:
        The text of Claude's reply.
    """
    # Build the parameters in a dict so `system` can be added only when needed.
    params = {
        "model": MODEL,
        "max_tokens": MAX_TOKENS,
        "messages": messages,
    }

    # The API does not accept `system=None`, so the key is only included when a
    # system prompt was actually provided.
    if system:
        params["system"] = system

    message = client.messages.create(**params)
    # The reply holds a list of content blocks; the text is in the first one.
    return message.content[0].text


def main() -> None:
    question = "How do I solve 5x + 2 = 17?"

    # Without a system prompt: Claude usually gives the full solution at once.
    messages: list[dict] = []
    add_user_message(messages, question)
    print("--- Without system prompt ---")
    print(chat(messages))

    # With the math tutor prompt: Claude guides the student with questions
    # instead of giving the answer. A fresh history keeps the two runs separate.
    messages = []
    add_user_message(messages, question)
    print("\n--- With math tutor system prompt ---")
    print(chat(messages, system=MATH_TUTOR_PROMPT))


if __name__ == "__main__":
    main()
