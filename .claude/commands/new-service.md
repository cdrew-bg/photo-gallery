---
description: Scaffold a lib service module (options object, injected boundaries, colocated test)
argument-hint: <module-name> e.g. billing or user-index
---

Create a new module at `lib/$ARGUMENTS.ts` following the shape of `lib/llm.ts` and the standards in
`CLAUDE.md`:

- Prefer a plain exported `async function` (or function) over a class — one class per file only when
  state genuinely warrants it. File name is `kebab-case.ts`.
- Magic numbers/strings become module-local `const UPPER_SNAKE = <n>;` near the top, named for
  meaning (`DEFAULT_MAX_TOKENS`, not `1024` inline).
- More than 2 inputs → one typed **options object** with destructuring. Declare an exported
  `interface XOptions` for the inputs and an exported `interface X` (or result type) for the output —
  interface is the seam; keep implementation private.
- **Inject boundaries** (`fetchImpl`, clients, `apiKey`) with defaults, so the module tests without
  the network. Never mock internal modules — inject the dependency.
- Read config/secrets via `loadEnv()` from `lib/env.ts` — never `process.env`.
- Validate anything crossing a boundary (HTTP, LLM, external API) with a Zod schema (`.strict()`);
  put reusable boundary schemas in a colocated `$ARGUMENTS.schemas.ts` (see `/new-schema`). Trust
  internal invariants — no error handling for impossible cases.
- Log with the pino `logger` from `lib/logger.ts`: static message + metadata object,
  `logger.info({ id }, 'indexed')`. A catch block logs XOR throws, never both.
- Throw typed errors from `lib/errors.ts` at the boundary (add a family with `/new-error` if none
  fits).
- Emit dates as `new Date().toISOString()` (UTC only).
- Add a colocated `lib/$ARGUMENTS.test.ts` that exercises the public interface, injecting boundaries
  (see `lib/llm.test.ts`).

Keep it under the guardrail limits (≤50 lines/function, ≤250 lines/file). When done, run
`pnpm check:quick`.
