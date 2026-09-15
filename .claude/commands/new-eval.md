---
description: Scaffold an LLM regression eval case
argument-hint: <case-name> e.g. capital-of-france or refund-tone
---

Create an eval case at `evals/cases/$ARGUMENTS.json`, following `evals/cases/example.json` and the
runner in `scripts/run-evals.mjs`:

- Exactly three string fields, no others (the runner reads only these):
  - `name` — the case id shown in PASS/FAIL output; match the file name (`$ARGUMENTS`).
  - `prompt` — the full user prompt sent to the model.
  - `expectContains` — a substring the response must contain. Matching is literal
    `text.includes(expectContains)`: case-sensitive, no regex. Pick a short, stable, unambiguous
    marker (constrain the prompt so the answer is deterministic — e.g. "Answer with one word.").
- One case per file. File name is `kebab-case.json`.
- Runs via `pnpm eval`. It calls the real Anthropic API and **skips (exit 0) when
  `ANTHROPIC_API_KEY` is unset**, so verify locally with the key set. Model is `claude-sonnet-5`
  (fixed in the runner).

After writing, run `pnpm eval` (with the key set) to confirm it PASSes.
