# Module 1: Accessing Claude with the API

Covers lessons 1 to 9 of the course: how to authenticate, send requests and
shape Claude's responses.

## Lessons

| # | Lesson | Status | File |
| --- | --- | --- | --- |
| 1 | Accessing the API | Done | n/a (concepts) |
| 2 | Getting an API key | Done | n/a (set `ANTHROPIC_API_KEY` in `.env`) |
| 3 | Making a request | Done | `firstRequest.ts` |
| 4 | Multi-turn conversations | Done | `multi_turn.py` |
| 5 | System prompts | Done | `system_prompts.py` |
| 6 | Temperature | Done | `temperature.ts` |
| 7 | Response streaming | Done | `streaming.py` |
| 8 | Structured data | Done | `structuredData.ts` |
| 9 | Quiz on accessing Claude with the API | Pending | n/a |

## What each lesson covers

- **Making a request:** `client.messages.create()` takes three required
  parameters: `model`, `max_tokens` (a safety limit, not a target) and
  `messages` (the conversation history, each message with a `role` and
  `content`). The reply text is in the first content block.
- **Multi-turn conversations:** the API is stateless, so every request must
  resend the full history, alternating `user` and `assistant` messages.
- **System prompts:** set Claude's role and tone for the whole conversation.
- **Temperature:** a value from 0.0 to 1.0 (default 1.0) that controls how
  random or predictable the output is. Low values pick the most likely words,
  which suits factual or repeatable tasks; high values give more varied,
  creative answers.
- **Response streaming:** receive the answer in chunks as it is generated, so
  the user sees text right away. `stream=True` returns raw events;
  `client.messages.stream()` with `text_stream` gives just the text; and
  `get_final_message()` returns the complete message for storage.
- **Structured data:** get clean JSON with no explanation around it by
  combining a prefilled assistant message (`` ```json ``) with a stop sequence
  (`` ``` ``). Claude continues inside the code block and stops when it tries to
  close it; then `trim()` and `JSON.parse()` turn the reply into an object.

## Run

```bash
npx tsx "src/building with claudeAPI/module 1/firstRequest.ts"
npx tsx "src/building with claudeAPI/module 1/temperature.ts"
npx tsx "src/building with claudeAPI/module 1/structuredData.ts"
```

The Python lessons need the `anthropic` and `python-dotenv` packages:

```bash
pip install anthropic python-dotenv
python "src/building with claudeAPI/module 1/multi_turn.py"
python "src/building with claudeAPI/module 1/streaming.py"
```

The course pins `claude-haiku-4-5` for all lessons, because newer models reject
settings that later lessons teach, such as `temperature` and prefilled
assistant messages.
