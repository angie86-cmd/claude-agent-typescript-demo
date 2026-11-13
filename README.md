# claude-agent-typescript-demo

This repo has two parts: the Claude Platform 101 project (in `src/claude_platform/`) and my TypeScript course exercises (in `src/typescript-basics/`).

## Claude Platform 101 project

Mini project from the **Claude Platform 101** course (Anthropic Academy):
the course examples rebuilt in strict TypeScript on top of the Anthropic SDK.
Every module lives in [src/claude_platform/](src/claude_platform/), and its
[README](src/claude_platform/README.md) logs what was improved in each one.

### Modules

| Module | File | What it shows |
| --- | --- | --- |
| Tool use | `weather.ts` | Custom tools with Zod schemas and the SDK tool runner |
| Extended thinking | `weatherExtendedThinking.ts` | Adaptive thinking, effort levels and thinking-token usage |
| Server tools | `serverTools.ts` | Web search and code execution run by Anthropic |
| Skills | `skills.ts` | Uploading a custom Skill and attaching it to a request |
| MCP connector | `mcp.ts`, `mcpPublic.ts` | Remote MCP servers (Linear with a token, DeepWiki without) |
| Managed agents | `managedAgent.ts` | Agent, environment and session with an event stream |

### Why TypeScript on Claude Platform

- **Typed requests and responses.** The SDK types catch wrong parameters and
  unhandled content blocks at compile time (for example, a code-execution result
  that may be an error object) instead of at runtime.
- **Less glue code.** `betaZodTool()` and `toolRunner()` replace the hand-written
  agent loop, `tool_result` handling and JSON schemas; tool input types are
  inferred from a single Zod schema.
- **Scalable agents.** Server tools, MCP servers, Skills and managed agents run on
  Anthropic's side, so adding a capability is a config entry rather than new
  infrastructure to host and maintain.
- **Portable.** Everything runs on plain Node.js, with no local Python runtime or
  sandbox required.
- **Reusable code.** Shared pieces (such as `weatherService.ts`) are imported by
  several modules instead of copied.
- **Observable reasoning.** Effort levels and `thinking_tokens` make it possible to
  compare how much the model reasons and tune effort per task.

These gains are about maintainability, safety and portability. They do not
change token usage, which depends on what is sent to the API.

## Install

```bash
npm install
```

## Configure the API key

The key is read from the `ANTHROPIC_API_KEY` environment variable and is never
committed. Create a `.env` file in the project root:

```bash
ANTHROPIC_API_KEY=your-key-here
# only needed for src/claude_platform/mcp.ts (Linear):
# LINEAR_MCP_TOKEN=your-linear-token
```

`.env` is ignored by Git.

## Run

```bash
npx tsx src/claude_platform/weather.ts          # run any module directly
npm run dev        # run src/claude_platform/index.ts directly with tsx
npm run typecheck  # type-check without emitting
npm run build      # compile to dist/
npm start          # run the compiled build
```

Some modules create resources in your workspace (Skills, managed agents) and
clean them up when they finish. The demos use inexpensive settings where
possible, but several of them call larger models, so running them has a cost.

## Roadmap

- [x] Tools (tool definitions and tool use)
- [x] Extended thinking and effort
- [x] Server tools, Skills, MCP connector
- [x] Managed agents
- [ ] Evaluations

## TypeScript basics (Udemy)

New to TypeScript, or want to understand the code in this repo better? Take a
look at the [src/typescript-basics/](src/typescript-basics/) folder. It holds my
exercises for the Udemy course "TypeScript Crash Course" (one file per lesson,
with its own strict `tsconfig.json`) and covers the fundamentals used across the
Claude Platform modules: types, interfaces, tuples, custom types, classes,
polymorphism and abstraction.

To check the exercises for type errors, run the command below. It only checks
the files in this folder, not the rest of the project:

```bash
npm run check:basics
```

## License

MIT
