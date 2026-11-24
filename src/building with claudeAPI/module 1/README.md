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
| 5 | System prompts | Pending | |
| 6 | Temperature | Pending | |
| 7 | Response streaming | Pending | |
| 8 | Structured data | Pending | |
| 9 | Quiz on accessing Claude with the API | Pending | n/a |

## What each lesson covers

- **Making a request:** `client.messages.create()` takes three required
  parameters: `model`, `max_tokens` (a safety limit, not a target) and
  `messages` (the conversation history, each message with a `role` and
  `content`). The reply text is in the first content block.
- **Multi-turn conversations:** the API is stateless, so every request must
  resend the full history, alternating `user` and `assistant` messages.
- **System prompts:** set Claude's role and tone for the whole conversation.
- **Temperature:** controls how random or predictable the output is.
- **Response streaming:** receive the answer in chunks as it is generated.
- **Structured data:** get output in a fixed format such as JSON.

## Run

```bash
npx tsx "src/building with claudeAPI/module 1/firstRequest.ts"
```

The Python lessons need the `anthropic` and `python-dotenv` packages:

```bash
pip install anthropic python-dotenv
python "src/building with claudeAPI/module 1/multi_turn.py"
```

The course pins `claude-haiku-4-5` for all lessons, because newer models reject
settings that later lessons teach, such as `temperature` and prefilled
assistant messages.
