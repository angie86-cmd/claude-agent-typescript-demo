import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

// Load .env from the project root no matter which folder the script is run from.
config({ path: fileURLToPath(new URL("../../../.env", import.meta.url)) });

// Keep this model for the whole course.
const MODEL = "claude-haiku-4-5";

/** Safety limit on response length, not a target: Claude stops here if it must. */
const MAX_TOKENS = 1000;

/** A prompt template: turns a dataset question into the full prompt text. */
type PromptTemplate = (question: string) => string;

/** The grader's verdict for one answer. */
interface Grade {
  score: number;
  reason: string;
}

/** The result of running one question through a prompt and the grader. */
interface EvalResult {
  question: string;
  answer: string;
  grade: Grade;
}

// Step 2: the eval dataset. Real datasets can hold hundreds of records, and
// Claude can help generate them.
const DATASET: string[] = [
  "What's 2+2?",
  "How do I make oatmeal?",
  "How far away is the Moon?",
];

// Step 1: the baseline prompt we want to improve.
const promptV1: PromptTemplate = (question) => `
Please answer the user's question:

${question}
`;

// Step 5: a revised prompt with one extra instruction.
const promptV2: PromptTemplate = (question) => `
Please answer the user's question:

${question}

Answer the question with ample detail
`;

// Fail early if no API key is configured.
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error("Missing ANTHROPIC_API_KEY. Set it in .env or in your shell.");
  process.exit(1);
}

const client = new Anthropic({ apiKey });

/**
 * Send one user message to Claude and return the text of its reply.
 *
 * @param prompt - The user message.
 * @param prefill - Optional start of the reply, to force a format.
 * @param stopSequences - Optional strings that end the reply early.
 */
async function ask(
  prompt: string,
  prefill?: string,
  stopSequences?: string[],
): Promise<string> {
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: prompt }];
  if (prefill) messages.push({ role: "assistant", content: prefill });

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages,
    ...(stopSequences ? { stop_sequences: stopSequences } : {}),
  });

  const first = message.content[0];
  return first?.type === "text" ? first.text : "";
}

/**
 * Step 4: ask Claude to grade an answer from 1 to 10.
 *
 * The grader sees both the question and the answer. JSON is requested with the
 * prefill + stop sequence trick from module 1, so it can be parsed directly.
 */
async function grade(question: string, answer: string): Promise<Grade> {
  const prompt = `
You are grading an AI assistant's answer to a user's question.

<question>
${question}
</question>

<answer>
${answer}
</answer>

Score the answer from 1 (useless) to 10 (perfect) for correctness, completeness
and usefulness. Reply as JSON with the keys "score" (a number) and "reason"
(one short sentence).
`;
  const text = await ask(prompt, "```json", ["```"]);
  return JSON.parse(text.trim()) as Grade;
}

/**
 * Steps 3 and 4: run every dataset question through a prompt template, then
 * through the grader.
 *
 * @returns One result per question, in dataset order.
 */
async function runEval(template: PromptTemplate): Promise<EvalResult[]> {
  const results: EvalResult[] = [];
  for (const question of DATASET) {
    const answer = await ask(template(question));
    results.push({ question, answer, grade: await grade(question, answer) });
  }
  return results;
}

/** The average score across all results: the number used to compare prompts. */
function averageScore(results: EvalResult[]): number {
  const total = results.reduce((sum, r) => sum + r.grade.score, 0);
  return total / results.length;
}

/** Run one prompt version and print each score and the average. */
async function evaluate(name: string, template: PromptTemplate): Promise<number> {
  console.log(`--- ${name} ---`);
  const results = await runEval(template);
  for (const r of results) {
    console.log(`${r.grade.score}/10  ${r.question}  (${r.grade.reason})`);
  }
  const average = averageScore(results);
  console.log(`Average: ${average.toFixed(2)}\n`);
  return average;
}

/** Compare the baseline prompt with the revised one on the same dataset. */
async function main(): Promise<void> {
  const v1 = await evaluate("Prompt v1 (baseline)", promptV1);
  const v2 = await evaluate("Prompt v2 (ample detail)", promptV2);
  console.log(`Best prompt: ${v2 > v1 ? "v2" : v1 > v2 ? "v1" : "tie"}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
