# Claude Platform 101 – course modules

Code for the modules of the Claude Platform 101 course. Each module adds a
file here, and every module records one improvement or optimization below.

## Improvements log

- **Tool use (`weather.ts`)** – Replaced the hand-written agent loop (manual
  `while`, message history, `tool_result` building, `switch` dispatcher and
  JSON tool schemas) with the SDK tool runner (`betaZodTool()` +
  `client.beta.messages.toolRunner()`). The file went from roughly 210 lines to
  172, and the tool input types are now inferred from the Zod schemas instead of
  being declared twice. The number of API calls is unchanged; the gain is less
  code to maintain, not faster execution.
- **Tool use (`weather.ts`)** – `.env` is now loaded from the project root, so
  the script works from any working directory.
- **Tool use (`weather.ts`)** – Less code to maintain and fewer chances for
  bugs: the SDK now handles the loop, the `tool_result` blocks and the schema
  conversion that were written by hand before. Each tool is a self-contained
  `betaZodTool()` definition (name, description, Zod schema, `run`), so adding a
  new tool means adding one object to the `tools` array instead of editing the
  schema list, the `switch` dispatcher and the loop. This makes the code more
  reusable and easier to scale. Token usage is unchanged (same tool schemas and
  API calls).
- **Extended thinking (`weatherExtendedThinking.ts`)** – The effort level is now
  a parameter (`low` | `medium` | `high` | `xhigh` | `max`, passed from the
  command line), and the script prints the thinking summary, the final answer
  and the token usage, including `thinking_tokens`. This makes it possible to
  compare effort settings and see how the model reasons before answering, so the
  effort (and the model) can be tuned to what each task needs when evaluating
  responses.
