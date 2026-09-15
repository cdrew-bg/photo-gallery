---
description: Run every gate, read the JSON report, and fix failures without weakening config
argument-hint: (optional) a gate id to focus on — lint, typecheck, quality, guardrails, typed, test
---

Run `pnpm check:agent`. It executes lint, typecheck, quality, guardrails, typed, and test in one
pass (it does not stop at the first failure) and writes a machine-readable summary to
`.agent/report.json`.

Read `.agent/report.json`. For every entry in `gates` where `ok` is false, open the files named in
its `output` and fix the code.

Rules:

- Fix the code, never the gate. `eslint.*.config.mjs`, `tooling/eslint-rules/`, `.claude/hooks/`,
  and `package.json` are protected. If a rule genuinely blocks the task, STOP and report the
  specific rule and why — do not weaken it.
- WHY knowledge goes to `docs/context/code-notes.md` or an ADR, never a code comment (the comment
  ban is lint-enforced).
- Re-run `pnpm check:agent` until `ok` is true across all gates.

$ARGUMENTS
