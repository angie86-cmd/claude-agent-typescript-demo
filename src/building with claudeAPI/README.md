# Building with the Claude API

Exercises from the **Building with the Claude API** course (Anthropic Academy,
67 lessons). The course examples are written in Python, so this folder uses
**both languages**:

- **TypeScript** (`.ts`): the lessons rebuilt in strict TypeScript on top of the
  Anthropic SDK, like the rest of this repo.
- **Python** (`.py`): the original course notebooks and scripts, kept next to the
  TypeScript version when it helps to compare them.

Each module has its own folder with a README that lists its lessons.

## What I learn



- Set up and authenticate with the Anthropic API, including API key management
  and request configuration.
- Implement single and multi-turn conversations with proper message formatting
  and context handling.
- Configure system prompts and control model behavior using temperature,
  response streaming and structured output formats.
- Design and run prompt evaluation workflows with test dataset generation and
  automated grading systems.
- Apply prompt engineering techniques, including XML tag structuring,
  example-based learning and clear directive formulation.
- Integrate Claude's tool use capabilities to extend functionality with custom
  tools and web search.
- Build retrieval-augmented generation (RAG) systems with text chunking,
  embeddings and BM25 search.
- Use Claude's extended features: extended thinking, image analysis, PDF
  processing and citation generation.
- Implement prompt caching strategies to optimize API usage and reduce latency.
- Develop Model Context Protocol (MCP) servers and clients for standardized
  tool and resource integration.
- Deploy Anthropic Apps, including Claude Code for automated development tasks
  and Computer Use for UI automation.
- Architect agent-based systems with parallelization, chaining and routing
  workflows.

## Who it's for

Software engineers who need to integrate Claude into production applications:
chatbots, automation tools or AI-powered features.

## Before you start

- Proficiency in Python (the course language; TypeScript versions are added here).
- Basic knowledge of handling JSON data.
- Access to an Anthropic API key (see the root README to configure `.env`).

## Modules

| Module | Folder | Topic |
| --- | --- | --- |
| 1 | [module 1/](module%201/) | Accessing Claude with the API |
| 2 | [module 2/](module%202/) | Prompt evaluation |
