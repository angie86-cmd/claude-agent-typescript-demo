import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const prompt = "Explain in two sentences what a closure is in programming.";

const models = ["claude-haiku-4-5", "claude-sonnet-5", "claude-opus-5-5"];

// Sends the same prompt to each model and prints its token usage.
for (const model of models) {
  const response = await client.messages.create({
    model,
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });
  console.log(model, response.usage);
}
