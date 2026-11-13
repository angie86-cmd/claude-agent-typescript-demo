---
name: status-report-generator
description: Generates a concise daily status report from a raw activity log. Use when the user asks for a status report, daily update or stand-up summary.
---

# Status Report Generator

Turn a raw activity log into a short, scannable daily status report.

## Sections (always in this order)

1. **Summary** – two sentences at most: what was achieved and the overall health
   (On track / At risk / Blocked).
2. **Completed** – bullet list of finished work, one line each, most important first.
3. **In progress** – bullet list of work still underway, with the next step.
4. **Blockers** – bullet list of what is stopping progress and who can unblock it.
   Write "None" if there are no blockers.
5. **Next** – the top 1–3 priorities for tomorrow.

## Tone

- Professional, neutral and factual. No hype, no blame.
- Past tense for completed work, present tense for in-progress work.

## How to summarize

- Merge related log entries into a single bullet instead of listing every line.
- Keep each bullet under 20 words and start it with a verb.
- Keep concrete identifiers (ticket numbers, PR numbers, service names).
- Never invent information that is not in the log.

## How to handle blockers

- State the blocker, its impact and the owner who can resolve it.
- If any blocker exists, the overall health in the Summary must be At risk or Blocked.
