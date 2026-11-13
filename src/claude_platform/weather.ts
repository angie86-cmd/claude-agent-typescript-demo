import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { WeatherService, toToolResult } from "./weatherService.js";

// Cheap model (Haiku) and a low token limit so experimenting costs almost nothing.
const MODEL = "claude-haiku-5-5";
const MAX_TOKENS = 1024;

// Load .env from the project root no matter which folder the script is run from
// (dotenv would otherwise look in the current working directory only).
config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

const weather = new WeatherService();

/** Tool: current weather. The Zod schema is converted to the JSON schema Claude receives. */
const weatherTool = betaZodTool({
  name: "get_weather",
  description: "Get today's current weather for a city.",
  inputSchema: z.object({
    city: z.string().describe("The city to check"),
  }),
  run: async ({ city }) => toToolResult(weather.getWeather(city), city),
});

/** Tool: multi-day forecast. */
const forecastTool = betaZodTool({
  name: "get_forecast",
  description: "Get the weather forecast for the next few days for a city.",
  inputSchema: z.object({
    city: z.string().describe("The city to check"),
  }),
  run: async ({ city }) => toToolResult(weather.getForecast(city), city),
});

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

/**
 * Sends the prompt through the SDK tool runner, which handles the whole loop:
 * it executes the requested tools, returns their results to Claude and repeats
 * until Claude produces a final answer.
 */
async function main(): Promise<void> {
  // Fail early if no API key is configured.
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("Missing ANTHROPIC_API_KEY. Set it in .env or in your shell.");
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });

  const runner = client.beta.messages.toolRunner({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [
      {
        role: "user",
        content:
          "What is the weather like in Bogota today, and what will it be like over the next few days?",
      },
    ],
    tools: [weatherTool, forecastTool],
  });

  // Awaiting the runner yields the final message once all tool calls have settled.
  const finalMessage = await runner;

  for (const block of finalMessage.content) {
    if (block.type === "text") console.log(block.text);
  }
}

main().catch((error) => {
  if (error instanceof Anthropic.APIError) {
    console.error(`API error (${error.status}): ${error.message}`);
  } else {
    console.error(error);
  }
  process.exit(1);
});
