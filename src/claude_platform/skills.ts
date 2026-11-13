import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import Anthropic, { toFile } from "@anthropic-ai/sdk";

// Load .env from the project root no matter which folder the script is run from.
config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

const MODEL = "claude-opus-5";
const MAX_TOKENS = 4096;

/** Folder (next to this file) that contains the SKILL.md and any supporting files. */
const SKILL_DIR = fileURLToPath(new URL("./status-report-skill", import.meta.url));

/** Sample activity log passed in at request time; the report rules live in the Skill. */
const ACTIVITY_LOG = `
09:10 Merged PR #482 (retry logic for the payments webhook)
09:45 Started migration of the orders table to the new schema (60% done)
11:30 Fixed flaky test in checkout-service (TICKET-1291)
13:00 Staging deploy failed: missing DB_REPLICA_URL secret, waiting on DevOps
14:20 Reviewed PR #490 and #493 from the mobile team
15:40 Wrote draft of the incident report for yesterday's login outage
`;

// ---------------------------------------------------------------------------
// Uploading a skill
// ---------------------------------------------------------------------------

/**
 * Reads every file in a folder and returns them as uploadable files.
 * Each file name keeps the folder as its prefix (e.g. "status-report-skill/SKILL.md"),
 * which is how the API knows which files belong to the same skill.
 */
async function filesFromDir(dir: string): Promise<Awaited<ReturnType<typeof toFile>>[]> {
  const folderName = path.basename(dir);
  const entries = await readdir(dir, { recursive: true, withFileTypes: true });

  return Promise.all(
    entries
      .filter((entry) => entry.isFile())
      .map(async (entry) => {
        const fullPath = path.join(entry.parentPath, entry.name);
        const relativePath = path.relative(dir, fullPath).split(path.sep).join("/");
        return toFile(await readFile(fullPath), `${folderName}/${relativePath}`);
      })
  );
}

/** Uploads the skill once to the workspace; later requests reference it by ID. */
async function uploadSkill(client: Anthropic): Promise<Anthropic.Beta.Skills.BetaSkill> {
  return client.beta.skills.create({
    display_name: "Status Report Generator",
    files: await filesFromDir(SKILL_DIR),
  });
}

// ---------------------------------------------------------------------------
// Using a skill
// ---------------------------------------------------------------------------

/**
 * Attaches the skill to a request through the container configuration.
 * Skills run inside the code execution sandbox, so that tool must be enabled too.
 */
async function generateReport(client: Anthropic, skillId: string): Promise<Anthropic.Beta.BetaMessage> {
  return client.beta.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    betas: ["skills-2025-10-02"],
    container: {
      skills: [{ type: "custom", skill_id: skillId, version: "latest" }],
    },
    tools: [{ type: "code_execution_20250825", name: "code_execution" }],
    messages: [
      {
        role: "user",
        content: `Generate the daily status report from this activity log:\n\n${ACTIVITY_LOG}`,
      },
    ],
  });
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

/** Uploads the skill, uses it to generate a report, then removes the skill again. */
async function main(): Promise<void> {
  // Fail early if no API key is configured.
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("Missing ANTHROPIC_API_KEY. Set it in .env or in your shell.");
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });

  const skill = await uploadSkill(client);
  console.log(`Skill uploaded: ${skill.id} (${skill.display_name})`);

  try {
    const response = await generateReport(client, skill.id);

    for (const block of response.content) {
      if (block.type === "text") console.log(`\n${block.text}`);
    }
    console.log(
      `\n[tokens] input=${response.usage.input_tokens} output=${response.usage.output_tokens}`
    );
  } finally {
    // Clean up so repeated runs do not pile up skills in the workspace.
    // Deleting the skill also removes its only version.
    await client.beta.skills.delete(skill.id);
    console.log(`Skill deleted: ${skill.id}`);
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
