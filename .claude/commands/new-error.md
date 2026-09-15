---
description: Add a typed error family to lib/errors.ts
argument-hint: <ErrorName> e.g. BillingError
---

Add a new error class to `lib/errors.ts`, following the shape of the existing families
(`LlmError`, `ValidationError`) and `CLAUDE.md`:

- Extend `AppError`. Class name is `PascalCase` ending in `Error` (e.g. `$ARGUMENTS`).
- Constructor takes `message: string` and calls `super(message, '<snake_case_code>')` — the code is
  the class name lower-snaked (`BillingError` → `'billing_error'`).
- `errors.ts` is the sanctioned home for the error family (exempt from one-class-per-file). Keep each
  class tiny; add fields only if a boundary genuinely needs them, then follow member-ordering
  (fields → constructor).
- These are thrown at boundaries (HTTP input, LLM responses, external APIs) and caught for structured
  logging — do not throw them for impossible internal cases.

After adding, throw it from the boundary code that needed it, and run `pnpm check:quick`.

Error to add: $ARGUMENTS
