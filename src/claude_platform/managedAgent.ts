import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

// Load .env from the project root no matter which folder the script is run from.
config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

const MODEL = "claude-opus-5";

/** Task the agent performs inside its sandbox. */
const KICKOFF_MESSAGE =
  "Create a file in the temp directory, count its lines, and report back.";

// ---------------------------------------------------------------------------
// Setup: agent, environment, session
// ---------------------------------------------------------------------------

/**
 * Step 1: creates the agent. An agent is reusable: create it once and run it
 * across many sessions. It uses Anthropic's bundled agent toolset (file, bash
 * and web tools), so no tools have to be defined by hand.
 */
async function createAgent(client: Anthropic) {
  return client.beta.agents.create({
    name: "Line Counter",
    model: MODEL,
    system: "You are a helpful agent that completes small file tasks.",
    tools: [{ type: "agent_toolset_20260401", default_config: { enabled: true } }],
  });
}

/**
 * Step 2: creates the environment, i.e. the sandbox the agent runs in.
 * With "limited" networking the sandbox only reaches hosts listed in
 * `allowed_hosts`; this task needs no network, so none are listed.
 */
async function createEnvironment(client: Anthropic) {
  return client.beta.environments.create({
    name: "line-counter-env",
    config: { type: "cloud", networking: { type: "limited" } },
  });
}

/** Step 3: creates a session, the unit of work that ties an agent to an environment. */
async function createSession(client: Anthropic, agentId: string, environmentId: string) {
  return client.beta.sessions.create({
    agent: agentId,
    environment_id: environmentId,
    title: "Count lines demo",
  });
}

// ---------------------------------------------------------------------------
// Running the session
// ---------------------------------------------------------------------------

/**
 * Steps 4 and 5: opens the event stream FIRST (it only delivers events that
 * happen after it opens), sends the kickoff message, then prints the events.
 */
async function runSession(client: Anthropic, sessionId: string): Promise<void> {
  const stream = await client.beta.sessions.events.stream(sessionId);

  // The stream is open, so it is safe to send the kickoff. Note it is `events`
  // (plural): everything in this API flows as events.
  await client.beta.sessions.events.send(sessionId, {
    events: [
      {
        type: "user.message",
        content: [{ type: "text", text: KICKOFF_MESSAGE }],
      },
    ],
  });

  for await (const event of stream) {
    if (event.type === "agent.message") {
      // Claude's text.
      for (const block of event.content) {
        if (block.type === "text") process.stdout.write(block.text);
      }
    } else if (event.type === "agent.tool_use") {
      // Which tool Claude picked.
      console.log(`\n[tool] ${event.name}`);
    } else if (event.type === "session.status_idle") {
      // The agent stopped and waits for input. This demo stops at the first idle
      // event; a real app should check event.stop_reason.type first:
      // "end_turn" = finished (or interrupted), "requires_action" = a tool call
      // needs an answer from you.
      console.log(`\n--- Agent done (${event.stop_reason.type}) ---`);
      break;
    }
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

/** Creates the managed agent resources, runs the task, then cleans them up. */
async function main(): Promise<void> {
  // Fail early if no API key is configured.
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("Missing ANTHROPIC_API_KEY. Set it in .env or in your shell.");
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });

  const agent = await createAgent(client);
  const environment = await createEnvironment(client);
  const session = await createSession(client, agent.id, environment.id);
  console.log(`Agent ${agent.id} | environment ${environment.id} | session ${session.id}\n`);

  try {
    await runSession(client, session.id);
  } finally {
    // Archive what this demo created so repeated runs leave the workspace tidy.
    await client.beta.sessions.archive(session.id);
    await client.beta.environments.archive(environment.id);
    await client.beta.agents.archive(agent.id);
    console.log("Session, environment and agent archived.");
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
