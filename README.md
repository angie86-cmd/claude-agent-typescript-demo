# claude-agent-typescript-demo

This repo has two parts: the Claude Platform 101 project (in `src/`) and my TypeScript course exercises (in `typescript-basics/`).

## Claude Platform 101 project

Mini project from the **Claude Platform 101** course (Anthropic Academy):
a small TypeScript app built on the Anthropic SDK. It starts with a single
Messages API call and will grow lesson by lesson.

## Install

```bash
npm install
```

## Configure the API key

The key is read from the `ANTHROPIC_API_KEY` environment variable and is never
committed. Copy the example file and fill in your own key:

```bash
cp .env.example .env
# then edit .env and set ANTHROPIC_API_KEY=...
```

`.env` is ignored by Git.

## Run

```bash
npm run dev        # run src/claude_platform/index.ts directly with tsx
npm run typecheck  # type-check without emitting
npm run build      # compile to dist/
npm start          # run the compiled build
```

The demo uses a small, inexpensive model (`claude-haiku-5-5`) with a low
`max_tokens` on purpose, so running it costs very little.

## Roadmap

Lessons from the course to be added:

- [ ] Tools (tool definitions and tool use)
- [ ] Agent loop
- [ ] Evaluations

## TypeScript basics (Udemy)

The [typescript-basics/](typescript-basics/) folder holds my exercises for the Udemy course
"TypeScript Crash Course" (one file per lesson, with its own strict `tsconfig.json`).
Type-check them without touching `src/`:

```bash
npm run check:basics
```

## License

MIT
