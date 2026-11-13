import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const buggyCode = `
// Intended to add two numbers, but this implementation subtracts them.
function add(a, b) {
  return a - b;
}
`;

// Sends the example code to Claude and asks for a concise code review.
const response = await client.messages.create({
  model: "claude-sonnet-5",
  max_tokens: 2048,
  system: "You are a terse senior code reviewer. Give feedback in one paragraph.",
  messages: [
    { role: "user", content: `Review this code:\n${buggyCode}` },
  ],
});

// Prints each text block returned in Claude's response.
for (const block of response.content) {
  if (block.type === "text") {
    console.log(block.text);
  }
}
