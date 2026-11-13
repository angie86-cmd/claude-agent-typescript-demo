import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

// Load .env from the project root no matter which folder the script is run from.
config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

const MODEL = "claude-opus-5";
const MAX_TOKENS = 1024;

/**
 * Prints the blocks of a response that involve server tools.
 * Server tools run on Anthropic's side, so there is nothing to execute locally:
 * the response already contains the tool call and, for code execution, its output.
 */
function printBlocks(response: Anthropic.Message): void {
  for (const block of response.content) {
    if (block.type === "server_tool_use") {
      // Claude decided to use a server tool; this shows which one and with what input.
      console.log(`Tool call: ${block.name} — ${JSON.stringify(block.input)}`);
    } else if (block.type === "bash_code_execution_tool_result") {
      // Output of the code Claude ran in the sandbox. The content can also be an
      // error object, so check its type before reading stdout.
      if (block.content.type === "bash_code_execution_result") {
        console.log(`stdout: ${block.content.stdout}`);
      } else {
        console.log(`Code execution error: ${block.content.error_code}`);
      }
    } else if (block.type === "text") {
      // Claude's final text answer.
      console.log(block.text);
    }
  }
}

/**
 * Call 1: web search. Anthropic runs the search server-side,
 * so the answer comes back already grounded in the search results.
 */
async function runWebSearch(client: Anthropic): Promise<void> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    tools: [{ type: "web_search_20260209", name: "web_search" }],
    messages: [
      {
        role: "user",
        content: "What is Anthropic's latest model release? Answer in one sentence.",
      },
    ],
  });

  printBlocks(response);
}

/**
 * Call 2: code execution. Claude writes and runs Python code in a sandbox
 * (the Python is generated and run by Claude, not part of this TypeScript file).
 */
async function runCodeExecution(client: Anthropic): Promise<void> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    tools: [{ type: "code_execution_20260120", name: "code_execution" }],
    messages: [
      {
        role: "user",
        content:
          "Calculate the mean and standard deviation of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]",
      },
    ],
  });

  printBlocks(response);
}

/** Runs both server-tool examples one after the other. */
async function main(): Promise<void> {
  // Fail early if no API key is configured.
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("Missing ANTHROPIC_API_KEY. Set it in .env or in your shell.");
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });

  console.log("--- Web search ---");
  await runWebSearch(client);

  console.log("\n--- Code execution ---");
  await runCodeExecution(client);
}

main().catch((error) => {
  if (error instanceof Anthropic.APIError) {
    console.error(`API error (${error.status}): ${error.message}`);
  } else {
    console.error(error);
  }
  process.exit(1);
});
