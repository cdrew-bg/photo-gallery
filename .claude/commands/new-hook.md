---
description: Scaffold a React custom hook (client) with a colocated test
argument-hint: <name> [route-dir] e.g. invoice-filter or invoice-filter billing
---

Create a custom hook following `CLAUDE.md`. Decide its home first:

- **Used by one route/component only** → colocate: `app/<route>/use-<name>.ts`.
- **Shared across routes** → `lib/hooks/use-<name>.ts` (create `lib/hooks/` if absent; `lib/**` is
  covered by the coverage ratchet).

File name is `use-<name>.ts` (kebab-case); the exported hook is `use<Name>` camelCase
(`use-invoice-filter.ts` exports `useInvoiceFilter`). Named export.

- Hooks run in client components — the consuming component carries `'use client'`. The hook file
  itself needs no directive, but never call server-only code (`loadEnv()`, `complete()`, `logger`)
  from it; receive data as arguments instead.
- More than 2 inputs → a single typed **options object**; return a typed object or tuple (declare the
  return `interface` when non-trivial — that is the seam).
- Follow the Rules of Hooks: call hooks unconditionally at the top level; name any effect deps
  honestly. Magic numbers become module-local `const UPPER_SNAKE`.
- Keep it ≤50 lines/function, ≤250 lines/file. Extract pure logic to a plain function in `lib/**`
  and unit-test that directly; the hook wires React state around it.
- Colocate `use-<name>.test.ts` exercising the hook through its public interface (inputs → returned
  values/state), not internals.

When done, run `pnpm check:quick`.
