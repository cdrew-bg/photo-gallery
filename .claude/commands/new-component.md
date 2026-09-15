---
description: Scaffold a React component (server by default) with a colocated test
argument-hint: <name> [route-dir] e.g. invoice-table or invoice-table billing
---

Create a component following `CLAUDE.md`. Decide its home first:

- **Used by one route only** → colocate in that route folder: `app/<route>/<name>.tsx`. Component,
  its types, and its hooks live together when used only together.
- **Shared across routes** → `components/<name>.tsx` (create `components/` if absent).

File name is `kebab-case.tsx`; the exported component is `PascalCase` (`invoice-table.tsx` exports
`InvoiceTable`). Named export, not default (default export is for route files).

- **Server component by default.** Add `'use client'` only when this component needs state, effects,
  refs, or event handlers. Keep the client boundary as small as possible — a client leaf, not a
  client page.
- Props are a single typed `interface XProps` (the seam). More than 2 distinct inputs → still one
  props object (that is what props are). Destructure in the signature.
- No data fetching in a client component — receive data as props from a server component, or fetch in
  a server component. LLM/env/logging stay server-side.
- Locale-format dates here (client rendering layer only); never in server code.
- Magic numbers become module-local `const UPPER_SNAKE`. Keep it ≤100 lines (TSX), ≤250 lines/file.
- Colocate a `<name>.test.tsx` exercising rendered output through props (the public interface); do
  not reach into internals. Extract non-trivial logic to `lib/**` and unit-test it there.

When done, run `pnpm check:quick`.
