---
description: Scaffold a colocated Zod boundary schema file with inferred types
argument-hint: <name> e.g. billing (creates lib/billing.schemas.ts) or a route dir
---

Create a boundary schema at `$ARGUMENTS.schemas.ts` (colocated next to the code it guards — e.g.
`lib/billing.schemas.ts` or `app/api/<name>/route.schemas.ts`). Follow `CLAUDE.md`:

- Every `z.object()` chains `.strict()`. Free-form payloads use `z.record(...)`, never a loose
  object.
- Export the schema (`export const xSchema = z.object({...}).strict();`) and derive the type from it:
  `export type X = z.infer<typeof xSchema>;` — one source of truth, never a hand-written duplicate
  `interface` alongside it.
- Dates at the boundary are `z.string().datetime({ offset: true })` — never `z.date()`,
  never `Date.parse()`.
- Magic numbers (min/max/length) become module-local `const UPPER_SNAKE` near the top.
- Short field names; the schema is the validation seam — parse untrusted input with it at the
  boundary, then trust the result internally.
- No logic in this file: schemas and inferred types only. Parsing/throwing lives in the caller.

When done, run `pnpm check:quick`.
