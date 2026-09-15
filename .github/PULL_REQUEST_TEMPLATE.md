## What & why

<!-- What does this change do, and why? Link the issue or ADR. WHY that doesn't fit here belongs
     in an ADR or docs/context/code-notes.md, never in code comments. -->

Closes #

## Checklist

Each item maps to a gate that actually runs — check it because it is true, not to make the box go away.

- [ ] `pnpm verify` passes locally (mirrors the static CI gates).
- [ ] Commits follow Conventional Commits (imperative mood, one logical change each).
- [ ] Tests cover the change through the public seam; coverage floor not reduced (`test:coverage-ratchet`).
- [ ] No new comments, `eslint-disable`, or `@ts-*` directives (comment ban).
- [ ] Env read through `lib/env.ts`; dates handled UTC-first (server emits ISO-8601).
