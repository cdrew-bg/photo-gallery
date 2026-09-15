---
description: Scaffold a full request-handling controller slice (route + input schema + service + error mapping)
argument-hint: <resource> e.g. orders or billing/invoices
---

Scaffold the whole request path for `$ARGUMENTS` as one vertical slice, following `CLAUDE.md`. A
"controller" here is the thin HTTP layer in `route.ts` that parses input, delegates to a `lib/`
service, and maps typed errors to responses — no business logic lives in the route. Derive the lib
module name as the last segment of `$ARGUMENTS` (e.g. `billing/invoices` → `lib/invoices.ts`).

Produce these files:

1. **Input schema** — `app/api/$ARGUMENTS/<name>.schemas.ts` (see `/new-schema`). Every `z.object()`
   chained `.strict()`; dates are `z.string().datetime({ offset: true })`, never `z.date()`. Export
   the inferred type. Request-input schemas must live in this `*.schemas.ts` file — an inline
   `z.object()` in `route.ts` is blocked by `local/boundary-schema-location`.
2. **Service** — `lib/<name>.ts` holding the business logic (see `/new-service` and `lib/llm.ts`).
   Plain exported `async function` with a typed options object (>2 inputs), injected boundaries
   (`fetchImpl`, clients, `apiKey`) with defaults, `loadEnv()` for config, module-local
   `UPPER_SNAKE` constants. The service throws typed errors from `lib/errors.ts`, never a raw
   `new Error()` (`local/no-raw-error-at-boundary`). It knows nothing about HTTP.
3. **Controller route** — `app/api/$ARGUMENTS/route.ts`. Export only named HTTP handlers (`GET`,
   `POST`, ...) — no default export, no other exports (`local/route-exports-only-handlers`). Each
   handler:
   - Parses input at the boundary: `const parsed = <name>Schema.safeParse(await req.json())`; on
     failure return `NextResponse.json({ error: 'validation_error', message }, { status: 400 })`.
   - Calls the `lib/<name>.ts` service with the parsed value. Never inline the logic here.
   - Wraps the call in one try/catch that maps a caught `AppError` to a status via its `.code`
     (`validation_error` → 400, `not_found` → 404, `llm_error` → 502, else 500), returning
     `NextResponse.json({ error: err.code, message: err.message }, { status })`. Re-throw or map
     unknown non-`AppError` errors to a logged 500 — a catch block logs XOR throws, never both.
   - Emits any date as `new Date().toISOString()` (UTC only).
   - Logs with the pino `logger` from `lib/logger.ts`: static message + metadata object,
     `logger.info({ id }, 'created')`.
4. **Error family** — if no `lib/errors.ts` family fits a failure the service raises, add one with
   `/new-error` (e.g. a `NotFoundError` with code `not_found`) rather than throwing a bare `Error`.
   Keep the handler's code→status map in step 3 in sync with the codes the service actually throws.
5. **Tests** — colocate `lib/<name>.test.ts` (service through its seam, boundaries injected — see
   `lib/llm.test.ts`) and `app/api/$ARGUMENTS/route.test.ts` (each handler: a happy path, a
   validation-failure 400, and one mapped `AppError` status). Never mock internal modules — inject
   the dependency.

Keep every function ≤50 lines and every file ≤250 lines; extract only on a third real use case.
When done, run `pnpm check:quick`, then `pnpm verify` before a PR.
