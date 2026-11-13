import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

// Load .env from the project root no matter which folder the script is run from.
config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

const MODEL = "claude-opus-5";
const MAX_TOKENS = 1024;

/** Name that links the MCP server declaration to its toolset below. */
const MCP_SERVER_NAME = "linear";

/**
 * Connects Claude to a remote MCP server (Linear) through the MCP connector.
 * Anthropic's API talks to the server for us, so no MCP client code runs locally.
 */
async function main(): Promise<void> {
  // Two different credentials are needed: the Anthropic key for the API call,
  // and the Linear token that the API uses to authenticate against the MCP server.
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const linearToken = process.env.LINEAR_MCP_TOKEN;
  if (!apiKey || !linearToken) {
    console.error(
      "Missing ANTHROPIC_API_KEY or LINEAR_MCP_TOKEN. Set both in .env or in your shell."
    );
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });

  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [{ role: "user", content: "What tools do you have available?" }],
    // Remote MCP servers Claude may connect to.
    mcp_servers: [
      {
        type: "url",
        url: "https://mcp.linear.app/mcp",
        name: MCP_SERVER_NAME,
        authorization_token: linearToken,
      },
    ],
    // Exposes every tool of the named MCP server to Claude.
    tools: [{ type: "mcp_toolset", mcp_server_name: MCP_SERVER_NAME }],
    betas: ["mcp-client-2025-11-20"],
  });

  // Print the text answer, plus any MCP tool activity in the response.
  for (const block of response.content) {
    if (block.type === "text") {
      console.log(block.text);
    } else if (block.type === "mcp_tool_use") {
      console.log(`MCP tool call: ${block.server_name}/${block.name} — ${JSON.stringify(block.input)}`);
    }
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
