import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { WeatherService, toToolResult } from "./weatherService.js";

// Load .env from the project root no matter which folder the script is run from.
config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

// Model and token budget. max_tokens must leave room for the thinking tokens too.
const MODEL = "claude-opus-5";
const MAX_TOKENS = 16000;

/** Effort levels accepted by `output_config.effort`, from cheapest to deepest. */
type Effort = "low" | "medium" | "high" | "xhigh" | "max";

const EFFORT_LEVELS: readonly Effort[] = ["low", "medium", "high", "xhigh", "max"];

/** Prompt that gives the model something worth reasoning about. */
const PROMPT =
  "Plan a road trip out of San Francisco with two stops, " +
  "weighing weather and drive time.";

// ---------------------------------------------------------------------------
// Tool definition
// ---------------------------------------------------------------------------

const weather = new WeatherService();

/** Weather tool; the tool runner executes `run` whenever Claude requests it. */
const weatherTool = betaZodTool({
  name: "get_weather",
  description: "Get the current weather for a city.",
  inputSchema: z.object({
    city: z.string().describe("City name"),
  }),
  run: async ({ city }) => toToolResult(weather.getWeather(city), city),
});

// ---------------------------------------------------------------------------
// Request
// ---------------------------------------------------------------------------

/**
 * Sends the prompt with adaptive thinking enabled at the given effort level.
 * Effort controls how much reasoning (and therefore time and tokens) the model
 * spends before answering. The tool runner executes every requested tool call
 * and resolves with Claude's final message.
 */
async function askWithEffort(
  client: Anthropic,
  effort: Effort
): Promise<Anthropic.Beta.BetaMessage> {
  const runner = client.beta.messages.toolRunner({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    // "adaptive": Claude decides when and how much to think.
    // "summarized": return the reasoning text in the response.
    thinking: { type: "adaptive", display: "summarized" },
    output_config: { effort },
    tools: [weatherTool],
    messages: [{ role: "user", content: PROMPT }],
  });

  // Awaiting the runner yields the final message once all tool calls have settled.
  return await runner;
}

/**
 * Prints each content block of the response: the thinking summary, the final
 * text, and any tool call Claude requested, followed by token usage.
 */
function printResponse(effort: Effort, response: Anthropic.Beta.BetaMessage): void {
  console.log(`\n=== effort: ${effort} ===`);

  for (const block of response.content) {
    if (block.type === "thinking") {
      console.log(`\n[thinking]\n${block.thinking}`);
    } else if (block.type === "text") {
      console.log(`\n[answer]\n${block.text}`);
    } else if (block.type === "tool_use") {
      console.log(`\n[tool_use] ${block.name}(${JSON.stringify(block.input)})`);
    }
  }

  // thinking_tokens is a subset of output_tokens, so it shows how much of the
  // cost went to reasoning rather than to the visible answer.
  const thinkingTokens = response.usage.output_tokens_details?.thinking_tokens;
  console.log(
    `\n[tokens] input=${response.usage.input_tokens} ` +
      `output=${response.usage.output_tokens} ` +
      `thinking=${thinkingTokens ?? "n/a"}`
  );
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

/**
 * Runs the request once. Pass an effort level as the first argument
 * (e.g. `npx tsx weatherExtendedThinking.ts low`) to compare settings;
 * it defaults to "high".
 */
async function main(): Promise<void> {
  // Fail early if no API key is configured.
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("Missing ANTHROPIC_API_KEY. Set it in .env or in your shell.");
    process.exit(1);
  }

  const arg = process.argv[2] ?? "high";
  if (!EFFORT_LEVELS.includes(arg as Effort)) {
    console.error(`Invalid effort "${arg}". Use one of: ${EFFORT_LEVELS.join(", ")}.`);
    process.exit(1);
  }
  const effort = arg as Effort;

  const client = new Anthropic({ apiKey });
  printResponse(effort, await askWithEffort(client, effort));
}

main().catch((error) => {
  if (error instanceof Anthropic.APIError) {
    console.error(`API error (${error.status}): ${error.message}`);
  } else {
    console.error(error);
  }
  process.exit(1);
});
