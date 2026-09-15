# Project Standards

> Foundation for building sustainable, LLM-powered Next.js apps. These standards keep
> agent-written and human-written code readable, small, and safe to change. They are enforced by
> the gates below — fix the code, never weaken the gate.

---

## Language & Runtime

- **TypeScript strict mode** everywhere. No `any`. No `as` casts unless unavoidable — and then only
  in a file sanctioned in `docs/context/sanctioned-casts.md`.
- **Node.js 22 LTS** (`.nvmrc` / `.npmrc` pin it).
- **pnpm** as package manager. Never npm or yarn.
- **Next.js (App Router) + React** for the frontend.

## Code Style

- **No comments. Ever.** Lint-enforced total ban (`local/no-comments`), including `eslint-disable`
  and `@ts-*` directives; shebangs exempt. Make the code self-documenting; WHY knowledge (hidden
  constraints, workarounds, invariants) goes to `docs/context/code-notes.md` or an ADR.
- **Guardrails lint** (`pnpm lint:guardrails`, CI-gated): max 2 params per function (use an options
  object), 50 lines/function (100 for TSX), 250 lines/file, complexity ≤ 10, depth ≤ 4, ≤ 20
  statements, one class per file, no magic numbers (module-local
  `const UPPER_SNAKE` near the top of the file — no god `constants.ts`), `id-length` ≥ 2, `eqeqeq`,
  member-ordering (fields → constructor → public → protected → private). Fix the code, never the
  config — lint configs, `tooling/eslint-rules/`, and hooks are protected; if a rule makes a task
  impossible, stop and tell the user.
- **No direct `process.env`.** Read env via the validated loader in `lib/env.service.ts` (the only
  sanctioned home; lint-enforced).
- **No dead code.** Delete it. Git has history. The knip ratchet (`pnpm lint:deadcode`) only tightens.
- **No premature abstraction.** Three similar lines beats a wrong abstraction. Extract only when a
  third real use case appears.
- **No error handling for impossible cases.** Trust internal invariants. Validate only at system
  boundaries (HTTP input, LLM responses, external APIs).
- **Short names** at narrow scope, precise names at wide scope.
- **Declarations at the top; one file per type; role in the name.** Inside a file the order is
  imports → module-local constants → type aliases / interfaces / enums → functions and classes. A
  file declares at most **one** top-level interface, type alias, or class, and its name states its
  role: `user.interface.ts`, `user-id.type.ts`, `user-repo.class.ts`, `role.enum.ts`,
  `button.component.tsx`, `use-toggle.hook.ts`, `order.schema.ts`, everything else `*.service.ts`
  (custom ESLint rules are `*.lint.js`). Only Zod `*.schema.ts` files may group several
  declarations; Next.js reserved files (`page.tsx`/`route.ts`/…) and `*.test.*` keep their names.
  Write it this way the first time (lint-enforced: `local/declarations-at-top`,
  `local/single-type-per-file`, `local/filename-role-suffix`).
- File names: `kebab-case.ts` (Next.js `page.tsx`/`layout.tsx`/`[param]` route files exempt).
  Classes: `PascalCase`. Functions/variables: `camelCase`.

## Module Architecture

- Every module has a deliberate **interface** (what callers know) and **implementation** (what
  callers don't). Keep implementation private.
- **Deletion test**: if deleting a module moves complexity to callers, it was earning its keep. If
  complexity vanishes, it was a pass-through — delete it.
- One adapter means a hypothetical seam. Two adapters means a real one. Don't introduce a seam
  unless something actually varies across it.

## Automated guardrails

Five ESLint configs, each with one concern, plus ratchet scripts:

- `pnpm lint` — base correctness/style across all TS/TSX (`eslint.config.mjs`: no `any`, unused
  vars, consistent type imports).
- `pnpm lint:quality` — duplication, cognitive complexity, and the `as unknown as` ban
  (`eslint.quality.config.mjs`, `--no-inline-config`).
- `pnpm lint:guardrails` — AI discipline: comment ban, size/shape limits, named constants, env
  access, structured logging, UTC dates, React hygiene (`eslint.guardrails.config.mjs`,
  `--no-inline-config`).
- `pnpm lint:typed` — type-aware: no floating/misused promises, switch exhaustiveness,
  only-throw-error (`eslint.typed.config.mjs`).
- `pnpm typecheck` — `tsc --noEmit` strict compile.
- `pnpm dup` — jscpd copy-paste under 3%.
- `pnpm lint:deps` / `pnpm lint:deadcode` / `pnpm knip` — unlisted deps and the dead-code ratchet.
- `pnpm lint:casts-doc` / `pnpm lint:gates` — keep the sanctioned-cast doc and this gate table in
  sync with the config and the scripts.
- `pnpm test:coverage-ratchet` — line coverage never falls below the recorded floor.

**Before opening a PR, run `pnpm verify`** — it runs every static gate. `pnpm verify:full` adds
build + test.

## Gate inventory

Every gate carries a WHY: it is added only with a stated failure it prevents.
`pnpm lint:gates` keeps this table in 1:1 sync with the gate scripts in `package.json`.

| Gate                         | WHY                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------ |
| `pnpm lint`                  | Base eslint: correctness and style baseline across all TS/TSX.                       |
| `pnpm typecheck`             | TypeScript strict compile; no `any`, no unsound casts.                               |
| `pnpm lint:typed`            | Type-aware: no floating/misused promises, switch exhaustiveness.                     |
| `pnpm lint:quality`          | Duplication, cognitive complexity, and the `as unknown as` ban.                      |
| `pnpm lint:guardrails`       | AI discipline: comment ban, size/shape limits, env access, UTC dates.                |
| `pnpm lint:casts-doc`        | Sanctioned-cast carve-outs and their WHY records stay in sync.                       |
| `pnpm lint:gates`            | This table stays 1:1 with the gate scripts in package.json.                          |
| `pnpm lint:rules`            | Every custom lint rule is documented in rules.json, CLAUDE.md, and the dev SKILL.md. |
| `pnpm lint:deps`             | knip: no unlisted dependencies or binaries.                                          |
| `pnpm lint:deadcode`         | knip dead-code ratchet: counts may only shrink.                                      |
| `pnpm dup`                   | jscpd copy-paste under 3%.                                                           |
| `pnpm audit:deps`            | No high/critical dependency advisories.                                              |
| `pnpm test:coverage-ratchet` | Line coverage never decreases below the recorded floor.                              |
| `pnpm format:check`          | prettier formatting.                                                                 |
| `pnpm knip`                  | Non-blocking dead-code / unused-export report.                                       |

## Frontend (Next.js + React)

- **App Router**, server components by default. `"use client"` only when interactivity requires it.
- Colocate component, types, and hooks in the same folder when they're used only together.
- Locale-format dates in the client rendering layer only — server code emits ISO-8601 UTC.

## Testing

- Test through the public interface (the seam), not internal implementation.
- Test files are `*.test.ts(x)` colocated next to the code (no `*.spec.ts`, no `__tests__/`
  folders — lint-enforced: `local/test-file-location`).
- No mocking of internal modules — only mock at system boundaries (external HTTP, LLM APIs)
  (`local/no-internal-vi-mock`). Restructure to inject the dependency instead.
- Unit tests for pure logic; integration tests for anything crossing a real boundary.

## Adopted patterns

Reach for these by name; they have established homes and should not be re-invented inline.

- **Env via loader** — `loadEnv()` from `lib/env.service.ts` (a Zod-validated read of `process.env`). It is
  the only place `process.env` is read (lint-enforced).
- **Structured logging** — the pino logger in `lib/logger.service.ts`. Static message + metadata object:
  `logger.warn({ id }, 'failed to index')`; never interpolate values into the message. Catch blocks
  log XOR throw (lint-enforced: `local/structured-logging`, `local/no-log-and-throw`).
- **Module-local constants** — magic numbers become `const UPPER_SNAKE = <n>;` near the top of the
  file that uses them, named for meaning (`TOKEN_TTL_MS`, `HTTP_NOT_FOUND`) (lint-enforced:
  `no-magic-numbers`).
- **Options object** — any function needing more than 2 inputs takes a single typed options
  parameter with destructuring (lint-enforced: `better-max-params`).
- **Strict boundary schemas** — every `z.object()` in `*.schema.ts` chains `.strict()`; free-form
  payloads use `z.record(...)` (lint-enforced: `local/zod-strict-boundary`, autofixable). On the
  route/API input surface, request schemas live only in `*.schema.ts` — an inline `z.object()` in
  a `route.ts` or `app/api/**` handler would dodge the strict and datetime rules (lint-enforced:
  `local/boundary-schema-location`). Modules that own a partial-read schema of an external payload
  (e.g. `lib/llm.service.ts`, `lib/env.service.ts`) keep it inline and non-strict.
- **Typed errors at boundaries** — throw an `AppError` family, never a raw `new Error()` /
  `new TypeError()`; callers branch on the typed code. Each error class is its own file
  (`app-error.class.ts`, `llm-error.class.ts`, `validation-error.class.ts`) (lint-enforced:
  `local/no-raw-error-at-boundary`).
- **Thin route files** — `app/**/route.ts` exports only HTTP handlers and Next route config; logic
  lives in `lib/` (lint-enforced: `local/route-exports-only-handlers`).
- **Module public entry** — import another module by its public entry, never by reaching into its
  internal files (lint-enforced: `local/no-deep-module-import`).
- **Kebab-case file names** — source files are `kebab-case.ts(x)`; the stem before the first dot is
  lowercase words joined by hyphens (`user-profile.schema.ts`, `no-deep-module-import.lint.js`). A
  class still lives in a kebab-cased file. Next.js special files (`page`/`layout`/`route`/…) already
  comply and dynamic `[param]` segments are exempt (lint-enforced: `local/filename-convention`).
- **UTC time everywhere** — server emits ISO-8601 UTC (`.toISOString()`); boundary dates are
  `z.string().datetime({ offset: true })`, never `z.date()`; parse only ISO strings, never
  `Date.parse()` / `new Date(nonIso)` (lint-enforced: `local/no-server-date-formatting`,
  `local/require-datetime-zod`, `local/no-naive-date-parse`).
- **void for fire-and-forget** — an intentionally unawaited promise is marked `void promise;`
  (lint-enforced: `@typescript-eslint/no-floating-promises`).
- **Declarations before implementation** — module-local `const`s, type aliases, interfaces and
  enums sit at the top of the file, above every function and class; a `const` bound to an arrow or
  function counts as implementation, not a declaration (lint-enforced: `local/declarations-at-top`,
  exempt in `*.schema.ts`).
- **One type per file** — a source file declares at most one top-level interface, type alias, or
  class; split anything more into sibling files. Only grouped Zod `*.schema.ts` files are exempt
  (lint-enforced: `local/single-type-per-file`, tests exempt).
- **Role in the filename** — every source file states its role: `.component.tsx`, `.hook.ts`,
  `.interface.ts`, `.type.ts`, `.class.ts`, `.enum.ts`, `.schema.ts`, else `.service.ts`; custom
  ESLint rules are `*.lint.js`. Framework-reserved files (`page`/`layout`/`route`/…) and `*.test.*`
  are exempt (lint-enforced: `local/filename-role-suffix`; the `*.lint.js` naming via
  `pnpm lint:rules`).
- **Kind folders** — interface, type, class and enum files live in a kind-named folder inside their
  directory: `interfaces/`, `types/`, `classes/`, `enums/` (e.g. `lib/classes/app-error.class.ts`,
  `lib/interfaces/complete-options.interface.ts`). Cross-folder type imports use the `@/` alias, not
  a `../` hop (lint-enforced: `local/kind-folder`).

## Agent workflow

Loop commands (not gates — kept out of the gate inventory on purpose):

- **`pnpm check:quick`** — inner loop after an edit: `typecheck` + tests for changed files only.
  Fast; run it between edits.
- **`pnpm check:agent`** — full gate sweep with **no early exit**, writing a machine-readable
  summary to `.agent/report.json` (`{ ok, failed[], gates[] }`). Read that file, fix every gate
  whose `ok` is false, re-run until `ok` is true. `.agent/` is git-ignored.
- **`pnpm verify`** — every static gate (pre-PR); `verify:full` adds build + test.
- **`pnpm eval`** — LLM regression cases in `evals/cases/*.json` via `scripts/run-evals.mjs`.
  Skips and exits 0 when `ANTHROPIC_API_KEY` is unset, so it is safe in CI without a key.

Repeatable scaffolds live in `.claude/commands/` (also exposed as skills through the in-repo `dev`
MCP server): `/fix-gates`, `/new-route`, `/add-adr`. For deterministic, byte-identical boilerplate
(no LLM in the loop), run `pnpm gen <service|schema|route|component|page> <name> [route-dir]` —
`scripts/gen.mjs` renders the templates in `scripts/templates/` into gate-clean files.

Navigation and homes for new code:

- **`docs/context/map.md`** — one-screen index of where each kind of code lives; read it before
  hunting through the tree.
- **LLM calls** — `complete()` from `lib/llm.service.ts` (Anthropic Messages API; logs model, tokens, and
  latency through the pino logger). Inject `fetchImpl`/`apiKey` to test without hitting the network.
- **Typed errors** — `AppError` and its families, one class per `*.class.ts` file
  (`app-error.class.ts`, `llm-error.class.ts`, `validation-error.class.ts`); throw these at boundaries.
- **Runtime error UI** — `app/error.tsx` (client boundary) and `app/not-found.tsx`.
- **MCP servers** — declared in `.mcp.json`, documented in `docs/context/mcp.md`.

## Git

- Commit messages: Conventional Commits, imperative mood, present tense. `add signup route` not
  `added` or `adding` (enforced by commitlint).
- One logical change per commit. Don't bundle unrelated changes.
- Branch names: `feature/`, `fix/`, `chore/` prefixes.
