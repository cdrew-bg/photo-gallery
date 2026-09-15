# Repo map

A one-screen index of where things live, so an agent (or a new human) can navigate without
crawling the tree. Keep it current when the shape changes.

## Where code goes

| Need                       | Location                             | Notes                                          |
| -------------------------- | ------------------------------------ | ---------------------------------------------- |
| A page or layout           | `app/**`                             | App Router, server components by default.      |
| Runtime error UI           | `app/error.tsx`, `app/not-found.tsx` | Client boundary + 404.                         |
| Gallery UI + downloads     | `features/gallery/**`                | Grid, lightbox, selection, zip download.       |
| The password gate          | `features/gate/**` + `lib/password-gate.service.ts` | Cosmetic gate; see ADR 0002.    |
| Manifest schema + URLs     | `lib/manifest.schema.ts`, `lib/image-url.service.ts` | Image repo contract.           |
| Selection state            | `stores/selection.service.ts`        | zustand set of selected image ids.             |
| Adding photos              | `scripts/ingest.mjs`                 | Thumbs, EXIF dates, manifest regeneration.     |
| Shared server/client logic | `lib/**`                             | Covered by the coverage ratchet.               |
| Reading env                | `lib/env.service.ts` (`loadEnv()`)   | The only place `process.env` is read.          |
| Logging                    | `lib/logger.service.ts` (`logger`)   | Static message + metadata object.              |
| Typed errors               | `lib/*.class.ts` (`app-error`, …)    | `AppError` + families, one class per file.     |
| Calling an LLM             | `lib/llm.service.ts` (`complete()`)  | Anthropic Messages API; logs tokens + latency. |
| A boundary schema          | `*.schema.ts` colocated              | Every `z.object()` chained `.strict()`.        |
| A test                     | `*.test.ts(x)` colocated             | No `__tests__/`, no `*.spec.ts`.               |

## Agent workflow

| Command            | Use                                                                   |
| ------------------ | --------------------------------------------------------------------- |
| `pnpm check:quick` | Inner loop after an edit: typecheck + tests for changed files. Fast.  |
| `pnpm check:agent` | Full gate sweep, no early exit, JSON summary to `.agent/report.json`. |
| `pnpm verify`      | Every static gate (pre-PR). `verify:full` adds build + test.          |
| `pnpm eval`        | Run LLM evals in `evals/cases/` (skips if `ANTHROPIC_API_KEY` unset). |

Slash commands live in `.claude/commands/`: `/fix-gates`, `/new-route`, `/new-page`,
`/new-component`, `/new-hook`, `/new-service`, `/new-schema`, `/new-error`, `/new-test`,
`/new-eval`, `/add-adr`.

## Where knowledge goes

- **WHY behind code** (constraints, workarounds, invariants): `docs/context/code-notes.md`.
- **Significant decisions**: a numbered ADR in `docs/adr/`.
- **The standards themselves**: `CLAUDE.md` (canonical; every gate derives from it).
- **MCP servers**: `docs/context/mcp.md` and `.mcp.json`.
