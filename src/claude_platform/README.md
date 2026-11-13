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
- **Extended thinking + tool runner (`weatherExtendedThinking.ts`)** – The
  request now goes through `client.beta.messages.toolRunner()` with
  `betaZodTool()`, so the full cycle (Claude requests `get_weather`, the tool
  runs, the result goes back, Claude answers) is handled by the SDK in one
  `await` instead of stopping at the first tool call. The mock data and lookup
  logic were extracted to `weatherService.ts` and are shared by `weather.ts` and
  this file, removing duplicated code and making new examples cheaper to add.
- **Server tools (`serverTools.ts`)** – Web search and code execution run on
  Anthropic's side (`web_search_20260209`, `code_execution_20260120`), so there
  is no local tool code to write, host or secure: the agent only declares the
  tool and reads the result blocks. This improves the agent's scalability (new
  capabilities are one entry in `tools`, with no extra infrastructure to run or
  maintain) and its portability (the code runs anywhere Node.js does, with no
  local Python runtime or sandbox required). The two calls share a single
  `printBlocks()` helper instead of repeating the output loop.
- **Skills (`skills.ts`)** – The status-report rules (sections, tone, how to
  summarize, how to handle blockers) live in a versioned `SKILL.md` that is
  uploaded once and referenced by ID (`version: "latest"`), so the request only
  carries the activity log instead of a long instruction prompt. The same skill
  can be reused across requests and agents and updated in one place. The script
  also deletes the skill it uploads, so repeated runs leave the workspace clean.
- **MCP connector (`mcp.ts`, `mcpPublic.ts`)** – Remote MCP servers are attached
  with `mcp_servers` + `mcp_toolset`, so Anthropic's API connects to the server
  and runs its tools; there is no local MCP client, transport or process to
  manage. Switching servers only means changing a URL and, when the server needs
  it, an `authorization_token`. `mcpPublic.ts` (DeepWiki, no token) was tested
  end to end; `mcp.ts` (Linear) needs a `LINEAR_MCP_TOKEN` and has only been
  type-checked.
- **Managed agents (`managedAgent.ts`)** – The agent loop, tool execution and
  sandbox are hosted by Anthropic: the code only creates an agent (reusable
  across sessions), an environment (cloud sandbox with limited networking) and a
  session, then reads an event stream. The bundled `agent_toolset_20260401`
  replaces hand-written file and bash tools. The stream is opened before the
  kickoff message is sent so no events are missed, and the script archives what
  it creates so repeated runs leave the workspace tidy.
