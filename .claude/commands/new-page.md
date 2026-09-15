---
description: Scaffold a Next.js App Router page (server component by default)
argument-hint: <route-path> e.g. dashboard or billing/invoices
---

Create a page at `app/$ARGUMENTS/page.tsx`, following `app/page.tsx` and the standards in `CLAUDE.md`:

- **Default export** named for the route (`export default function Dashboard()`). Route files
  (`page.tsx`, `layout.tsx`, `[param]`) are exempt from the kebab-case file rule but the component is
  `PascalCase`.
- **Server component by default.** Add `'use client'` only when the page itself needs interactivity
  (state, effects, event handlers) — push interactive bits into a colocated client component instead
  (see `/new-component`) and keep the page a server component.
- Do data fetching / LLM calls (`complete()` from `lib/llm.ts`) and env reads (`loadEnv()`) in the
  server component; never `process.env` directly.
- Server code emits ISO-8601 UTC (`.toISOString()`); locale-format dates only in a client rendering
  layer.
- Import shared code via the `@/` alias (`@/lib/...`).
- Add a `layout.tsx` in the same folder only if this subtree needs its own shell or `metadata`;
  otherwise inherit the root layout. If it takes `metadata`, type it `import type { Metadata }`.
- Keep the component ≤100 lines (TSX limit), ≤250 lines/file. If markup grows, extract a colocated
  component.
- If the page has meaningful logic, add a colocated `page.test.tsx` exercising rendered output; keep
  pure logic in `lib/**` with its own test.

When done, run `pnpm check:quick`.
