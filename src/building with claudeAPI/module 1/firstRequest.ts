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

/**
 * First request to the Anthropic API: send one user message and print the text
 * of Claude's reply.
 */
async function main(): Promise<void> {
  // Fail early if no API key is configured.
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("Missing ANTHROPIC_API_KEY. Set it in .env or in your shell.");
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    // The conversation history: each message has a role ("user" or "assistant")
    // and its content.
    messages: [
      {
        role: "user",
        content: "What is quantum computing? Answer in one sentence",
      },
    ],
  });

  // The response holds metadata plus a list of content blocks; the generated
  // text lives in the first block when it is a text block.
  const first = message.content[0];
  if (first?.type === "text") {
    console.log(first.text);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
