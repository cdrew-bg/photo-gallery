---
description: Scaffold a colocated test for an existing file, testing through its seam
argument-hint: <path-to-source> e.g. lib/billing.ts or app/api/health/route.ts
---

Create a colocated test next to `$ARGUMENTS` — same folder, same base name, `.test.ts` (or
`.test.tsx` for a component). Test file location is lint-enforced (`local/test-file-location`): no
`__tests__/`, no `*.spec.ts`. Follow `CLAUDE.md` and the pattern in `lib/llm.test.ts`.

First read `$ARGUMENTS` and test its **public interface**:

- Import only what the module exports. Exercise exported functions/components through their inputs
  and observable outputs — never reach into private internals.
- **No mocking of internal modules** (`local/no-internal-vi-mock`). If the code calls a boundary
  (external HTTP, LLM, clients), the code should accept it as an injected dependency
  (`fetchImpl`, `apiKey`, a client) — pass a fake in the test, as `lib/llm.test.ts` does with
  `FetchLike`. If it is not injectable yet, restructure the source to inject it rather than mocking.
- Cover the real branches: happy path plus each boundary failure the code throws for (assert the
  typed error from `lib/errors.ts`, e.g. `rejects.toBeInstanceOf(LlmError)`).
- Use `vitest` (`import { expect, it } from 'vitest'`). Magic numbers (status codes, counts) become
  module-local `const UPPER_SNAKE` (`OK_STATUS = 200`).
- Pure logic gets unit tests; anything crossing a real boundary gets an integration test.

When done, run `pnpm check:quick` (adds this file to the coverage ratchet floor).
