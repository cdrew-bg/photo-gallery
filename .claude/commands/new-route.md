---
description: Scaffold a Next.js App Router API route with a colocated test
argument-hint: <route-path> e.g. users or billing/invoices
---

Create a new App Router route at `app/api/$ARGUMENTS/route.ts`. Follow the project standards in
`CLAUDE.md`:

- Export named HTTP handlers (`GET`, `POST`, ...). Never a default export in a route.
- Return `NextResponse.json(...)`. Emit any date as `new Date().toISOString()` (UTC only).
- Validate request input at the boundary with a Zod schema in a colocated `*.schemas.ts` file,
  every `z.object()` chained with `.strict()`.
- Read config/secrets via `loadEnv()` from `lib/env.ts` — never `process.env` directly.
- Log with the pino `logger` from `lib/logger.ts`: static message + metadata object, e.g.
  `logger.info({ id }, 'created')`. A catch block logs XOR throws, never both.
- Throw typed errors from `lib/errors.ts` at the boundary.
- Add a colocated `route.test.ts` that exercises the handler through its public interface. Inject
  boundaries (fetch, clients) rather than mocking internal modules.

See `app/api/health/route.ts` and its test for the pattern. When done, run `pnpm check:quick`.
