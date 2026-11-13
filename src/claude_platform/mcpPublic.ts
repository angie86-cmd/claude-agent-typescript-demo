import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

// Load .env from the project root no matter which folder the script is run from.
config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

const MODEL = "claude-opus-5";
const MAX_TOKENS = 1024;

/** Name that links the MCP server declaration to its toolset below. */
const MCP_SERVER_NAME = "deepwiki";

/**
 * Same MCP connector flow as mcp.ts, but against DeepWiki, a public MCP server
 * that answers questions about GitHub repositories and needs no token,
 * so only the Anthropic API key is required.
 */
async function main(): Promise<void> {
  // Fail early if no API key is configured.
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("Missing ANTHROPIC_API_KEY. Set it in .env or in your shell.");
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });

  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [
      {
        role: "user",
        content:
          "Using your tools, what is the anthropics/anthropic-sdk-typescript repository about? Answer in two sentences.",
      },
    ],
    // Remote MCP server Claude may connect to; no authorization_token needed.
    mcp_servers: [
      { type: "url", url: "https://mcp.deepwiki.com/mcp", name: MCP_SERVER_NAME },
    ],
    // Exposes every tool of the named MCP server to Claude.
    tools: [{ type: "mcp_toolset", mcp_server_name: MCP_SERVER_NAME }],
    betas: ["mcp-client-2025-11-20"],
  });

  // Print MCP tool activity and the final text answer.
  for (const block of response.content) {
    if (block.type === "mcp_tool_use") {
      console.log(`MCP tool call: ${block.server_name}/${block.name} — ${JSON.stringify(block.input)}`);
    } else if (block.type === "text") {
      console.log(block.text);
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
