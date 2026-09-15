# Contributing

The engineering standards live in **[`CLAUDE.md`](./CLAUDE.md)** — language and runtime, code
style, module architecture, testing, and the adopted patterns. This file does not restate them; it
covers the mechanics of getting a change merged.

## Before you start

- **Read [`CLAUDE.md`](./CLAUDE.md).** It is canonical, and every automated gate derives from it.
  The **WHY** behind a rule lives in `docs/adr/` and `docs/context/code-notes.md`, not in code
  comments (the comment ban is lint-enforced).
- Use **pnpm** (never npm or yarn) and **Node 22** (`.nvmrc` / `.npmrc` pin the version).
- Branch names use `feature/`, `fix/`, or `chore/` prefixes.

## The local gate

Run **`pnpm verify`** before opening a PR. It runs every static gate — lint, typecheck, quality,
guardrails, typed, casts-doc, gates, dup, deps. If it passes locally, CI's static gates cannot
fail. `pnpm verify:full` additionally runs `build` and `test`.

A commit hook (Lefthook) runs lint, prettier, commitlint, and (if installed) gitleaks on
`git commit`, so a human developer gets the same per-change feedback an agent already gets from
`.claude/hooks/`.

## Commits

- **Conventional Commits**, imperative mood, present tense: `add signup route`, not `added`.
  Enforced by commitlint.
- One logical change per commit.

## Pull requests

- Fill in the PR template — every checklist item maps to a gate that actually runs.
- Do not weaken a lint rule to make an error pass. Fix the code. If a rule genuinely blocks the
  task, say so in the PR with the specific rule and why.

## Reporting security issues

Do not use issues or PRs for vulnerabilities. See [`SECURITY.md`](./SECURITY.md).
