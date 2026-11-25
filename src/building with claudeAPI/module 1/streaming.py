"""Lesson 7: response streaming with the Anthropic API.

Without streaming, the user waits until Claude finishes the whole reply. With
streaming, the API sends the reply in small chunks as it is generated, so the
text can appear on screen right away. This script shows the three ways the
course covers: raw events, simplified text streaming and getting the final
message once the stream ends.
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

    Args:
        messages: The conversation history. It is modified in place.
        text: What the user wants to say or ask.

    Returns:
        Nothing. The new message is added to the end of `messages`.
    """
    # A user message is a dict with a role and its content.
    messages.append({"role": "user", "content": text})


def print_raw_events(messages: list[dict]) -> None:
    """Stream a reply and print every raw event the API sends.

    Passing `stream=True` makes `create` return an iterator of events instead
    of a finished message. The events arrive in order: a message start, a
    content block start, many text deltas (the chunks), then the stop events.
    This is useful to understand the protocol, but rarely what an app needs.

    Args:
        messages: The conversation so far, ending with a user message.

    Returns:
        Nothing. Each event is printed as it arrives.
    """
    stream = client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        messages=messages,
        stream=True,
    )

    for event in stream:
        print(event)


def stream_text(messages: list[dict]) -> None:
    """Stream a reply and print only the text, chunk by chunk.

    `messages.stream` wraps the raw events and `text_stream` filters out
    everything except the text, which is usually all that is shown to a user.
    The `with` block closes the connection when the stream ends.

    Args:
        messages: The conversation so far, ending with a user message.

    Returns:
        Nothing. The text is printed as it arrives.
    """
    with client.messages.stream(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        messages=messages,
    ) as stream:
        for text in stream.text_stream:
            # end="" keeps the chunks on one line; flush shows them immediately.
            print(text, end="", flush=True)
    print()


def stream_and_get_message(messages: list[dict]) -> str:
    """Stream a reply to the user and also return the complete text.

    Streaming is good for the user experience, but an app often needs the whole
    message too, for example to save it in a database or add it to the history.
    `get_final_message` returns the full message assembled from the chunks.

    Args:
        messages: The conversation so far, ending with a user message.

    Returns:
        The complete text of Claude's reply.
    """
    with client.messages.stream(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        messages=messages,
    ) as stream:
        for text in stream.text_stream:
            # In a real app, send each chunk to the client here.
            print(text, end="", flush=True)
        print()

        # Must be called after the text has been consumed (or inside the block).
        final_message = stream.get_final_message()

    # The reply holds a list of content blocks; the text is in the first one.
    return final_message.content[0].text


def main() -> None:
    prompt = "Write a 1 sentence description of a fake database"

    # 1. Raw events: shows what the API really sends.
    messages: list[dict] = []
    add_user_message(messages, prompt)
    print("--- Raw events ---")
    print_raw_events(messages)

    # 2. Simplified text streaming: only the text chunks.
    print("\n--- Text stream ---")
    stream_text(messages)

    # 3. Text streaming plus the complete message for storage.
    print("\n--- Text stream + final message ---")
    full_text = stream_and_get_message(messages)
    print(f"\nStored message ({len(full_text)} characters): {full_text}")


if __name__ == "__main__":
    main()
