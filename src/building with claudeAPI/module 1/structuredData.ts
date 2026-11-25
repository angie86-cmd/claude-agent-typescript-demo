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

/** Opens a markdown JSON block, so Claude continues with the JSON itself. */
const JSON_PREFILL = "```json";

/** Closing fence of the block: generation stops as soon as Claude writes it. */
const JSON_STOP = "```";

/** One turn of the conversation history. */
type Message = Anthropic.MessageParam;

/** Options for `chat`; all are optional. */
interface ChatOptions {
  /** Optional system prompt that guides how Claude responds. */
  system?: string;
  /**
   * Strings that end the response as soon as Claude generates them. The
   * matching text itself is not included in the reply.
   */
  stopSequences?: string[];
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
 * Append an assistant turn to the history.
 *
 * Here it is used for prefilling: if the last message is from the assistant,
 * Claude continues that text instead of starting a new reply.
 *
 * @param messages - The conversation history. It is modified in place.
 * @param text - Claude's earlier reply, or the start of the reply to prefill.
 */
function addAssistantMessage(messages: Message[], text: string): void {
  // Same shape as a user message, but with the "assistant" role.
  messages.push({ role: "assistant", content: text });
}

/**
 * Send the history to Claude and return the text of its reply.
 *
 * This is the lesson's change: `stopSequences` is a new option that is only
 * sent when the list is not empty.
 *
 * @param messages - The whole conversation so far.
 * @param options - Optional system prompt and stop sequences.
 * @returns The text of Claude's reply.
 */
async function chat(
  messages: Message[],
  { system, stopSequences = [] }: ChatOptions = {},
): Promise<string> {
  const params: Anthropic.MessageCreateParamsNonStreaming = {
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages,
    // Optional fields are only included when they were provided, instead of
    // sending empty values.
    ...(system ? { system } : {}),
    ...(stopSequences.length > 0 ? { stop_sequences: stopSequences } : {}),
  };

  const message = await client.messages.create(params);

  // The reply holds a list of content blocks; the text is in the first one when
  // it is a text block.
  const first = message.content[0];
  return first?.type === "text" ? first.text : "";
}

/**
 * Ask Claude for JSON and return it already parsed.
 *
 * Without help, Claude wraps JSON in a markdown block and adds a description.
 * Two tricks remove that:
 * 1. Prefill the assistant turn with "```json", so Claude believes it already
 *    opened a code block and continues with just the JSON.
 * 2. Use "```" as a stop sequence, so generation ends the moment Claude tries
 *    to close the block, before any closing comment.
 *
 * @param prompt - What to generate, for example "an EventBridge rule as json".
 * @returns The parsed JSON value.
 * @throws SyntaxError if the reply is not valid JSON (for example when
 *   `max_tokens` cut it off).
 */
async function chatJson(prompt: string): Promise<unknown> {
  const messages: Message[] = [];
  addUserMessage(messages, prompt);
  addAssistantMessage(messages, JSON_PREFILL);

  const text = await chat(messages, { stopSequences: [JSON_STOP] });

  // The reply usually starts and ends with extra newlines, so trim before
  // parsing.
  return JSON.parse(text.trim());
}

/**
 * Show the lesson's example: a short EventBridge rule, generated as JSON.
 */
async function main(): Promise<void> {
  const rule = await chatJson("Generate a very short event bridge rule as json");

  // `rule` is a real object now, so it can be used like any other data.
  console.log(JSON.stringify(rule, null, 2));
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
