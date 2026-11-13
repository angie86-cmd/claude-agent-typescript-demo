import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";

// Cheap on purpose: Haiku is the smallest/cheapest model, and max_tokens is
// kept low, so experimenting while learning costs almost nothing.
const MODEL = "claude-haiku-5-5";
const MAX_TOKENS = 300;

async function main(): Promise<void> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error(
      "Missing ANTHROPIC_API_KEY. Copy .env.example to .env and set your key, " +
        "or export it in your shell."
    );
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        { role: "user", content: "Say hello in one short sentence." },
      ],
    });

    for (const block of message.content) {
      if (block.type === "text") {
        console.log(block.text);
      }
    }
    console.log(
      `\n[tokens] input=${message.usage.input_tokens} output=${message.usage.output_tokens}`
    );
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error(`API error (${error.status}): ${error.message}`);
    } else {
      console.error("Unexpected error:", error);
    }
    process.exit(1);
  }
}

await main();
