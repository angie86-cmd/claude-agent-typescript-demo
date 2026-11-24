"""Lesson 4: multi-turn conversations with the Anthropic API.

The API is stateless: it remembers nothing between requests. To keep a
conversation going, we store the history in a list and resend all of it on
every call, alternating "user" and "assistant" messages.
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

api_key = os.environ.get("ANTHROPIC_API_KEY")
if not api_key:
    sys.exit("Missing ANTHROPIC_API_KEY. Set it in .env or in your shell.")

client = Anthropic(api_key=api_key)


def add_user_message(messages: list[dict], text: str) -> None:
    """Append a user turn to the conversation history.

    Call this before every request to Claude: it records what the user said so
    the next call to `chat` includes it.

    Args:
        messages: The conversation history. It is modified in place.
        text: What the user wants to say or ask.

    Returns:
        Nothing. The new message is added to the end of `messages`.
    """
    # A user message is a dict with a role and its content.
    user_message = {"role": "user", "content": text}
    messages.append(user_message)


def add_assistant_message(messages: list[dict], text: str) -> None:
    """Append an assistant turn (a previous Claude reply) to the history.

    The API does not remember anything, so Claude's own answers must be stored
    and sent back with the next request. Otherwise a follow-up question such as
    "Write another sentence" would have no context.

    Args:
        messages: The conversation history. It is modified in place.
        text: Claude's reply, usually the value returned by `chat`.

    Returns:
        Nothing. The new message is added to the end of `messages`.
    """
    # Same shape as a user message, but with the "assistant" role. Roles must
    # alternate between "user" and "assistant" in the history.
    assistant_message = {"role": "assistant", "content": text}
    messages.append(assistant_message)


def chat(messages: list[dict]) -> str:
    """Send the full history to Claude and return the text of its reply.

    This function does not change the history. To continue the conversation,
    pass the returned text to `add_assistant_message`.

    Args:
        messages: The whole conversation so far, ending with a user message.

    Returns:
        The text of Claude's reply.
    """
    # Every request resends the entire history, because the API is stateless.
    message = client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        messages=messages,
    )
    # The reply holds a list of content blocks; the text is in the first one.
    return message.content[0].text


def main() -> None:
    # Start with an empty history.
    messages: list[dict] = []

    # Add the first user question.
    add_user_message(messages, "Define quantum computing in one sentence")

    # Get Claude's answer and store it in the history.
    answer = chat(messages)
    add_assistant_message(messages, answer)
    print(f"Claude: {answer}\n")

    # The follow-up only makes sense with the previous turns, so the whole
    # history is sent again.
    add_user_message(messages, "Write another sentence")
    final_answer = chat(messages)
    add_assistant_message(messages, final_answer)
    print(f"Claude: {final_answer}")


if __name__ == "__main__":
    main()
