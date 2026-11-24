import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

// Load .env from the project root no matter which folder the script is run from.
config({ path: fileURLToPath(new URL("../../../.env", import.meta.url)) });

// Keep this model for the whole course: newer ones reject settings that later
// lessons teach, such as temperature and prefilled assistant messages.
const MODEL = "claude-haiku-4-5";

/** Safety limit on response length, not a target: Claude stops here if it must. */
const MAX_TOKENS = 1000;

/** How many times each temperature is tried, to make the variety visible. */
const RUNS_PER_TEMPERATURE = 3;

/** One turn of the conversation history. */
type Message = Anthropic.MessageParam;

/**
 * Request parameters plus `temperature`. SDK 1.8 no longer lists `temperature`
 * in its types because newer models reject it, but the model pinned by this
 * course (claude-haiku-4-5) still accepts it, so the type is extended here.
 */
type RequestParams = Anthropic.MessageCreateParamsNonStreaming & {
  temperature: number;
};

/** Options for `chat`; both are optional. */
interface ChatOptions {
  /** Optional system prompt that guides how Claude responds. */
  system?: string;
  /**
   * How random the output is, from 0.0 to 1.0. Low values pick the most likely
   * words (predictable); high values allow less likely ones (creative).
   */
  temperature?: number;
}

// Fail early if no API key is configured.
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error("Missing ANTHROPIC_API_KEY. Set it in .env or in your shell.");
  process.exit(1);
}

const client = new Anthropic({ apiKey });

/**
 * Append a user turn to the conversation history.
 *
 * @param messages - The conversation history. It is modified in place.
 * @param text - What the user wants to say or ask.
 */
function addUserMessage(messages: Message[], text: string): void {
  // A user message is an object with a role and its content.
  messages.push({ role: "user", content: text });
}

/**
 * Append an assistant turn (a previous Claude reply) to the history.
 *
 * @param messages - The conversation history. It is modified in place.
 * @param text - Claude's reply, usually the value returned by `chat`.
 */
function addAssistantMessage(messages: Message[], text: string): void {
  // Same shape as a user message, but with the "assistant" role.
  messages.push({ role: "assistant", content: text });
}

/**
 * Send the history to Claude and return the text of its reply.
 *
 * This is the lesson's change: `temperature` is now a parameter (default 1.0,
 * the API default) and is always sent with the request.
 *
 * @param messages - The whole conversation so far, ending with a user message.
 * @param options - Optional system prompt and temperature.
 * @returns The text of Claude's reply.
 */
async function chat(
  messages: Message[],
  { system, temperature = 1.0 }: ChatOptions = {},
): Promise<string> {
  // Built as a separate variable (not inline) so the extra `temperature` field
  // is accepted by TypeScript and still sent in the request body.
  const params: RequestParams = {
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages,
    temperature,
    // Only include `system` when a prompt was provided, like in the Python
    // lesson, instead of sending an empty value.
    ...(system ? { system } : {}),
  };

  const message = await client.messages.create(params);

  // The reply holds a list of content blocks; the text is in the first one when
  // it is a text block.
  const first = message.content[0];
  return first?.type === "text" ? first.text : "";
}

/**
 * Ask for the same movie idea several times at one temperature and print each
 * answer, so the amount of variety can be compared between temperatures.
 *
 * @param temperature - The temperature to test.
 */
async function showMovieIdeas(temperature: number): Promise<void> {
  console.log(`--- Temperature ${temperature.toFixed(1)} ---`);

  for (let run = 1; run <= RUNS_PER_TEMPERATURE; run++) {
    // A fresh history each time, so earlier answers don't influence the next.
    const messages: Message[] = [];
    addUserMessage(
      messages,
      "Generate a one sentence movie idea. Return only the idea and nothing else.",
    );
    console.log(`${run}. ${await chat(messages, { temperature })}`);
  }
}

/**
 * Compare a low temperature (more predictable) with a high one (more varied).
 */
async function main(): Promise<void> {
  await showMovieIdeas(0.0);
  console.log();
  await showMovieIdeas(1.0);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
