# Sanctioned casts

The `as unknown as` double cast is banned by `pnpm lint:quality`. A genuinely unavoidable
boundary cast may be sanctioned by carving its file out in `eslint.quality.config.mjs` — but only
together with a `## <file path>` heading here that records WHY. `pnpm lint:casts-doc` keeps the
two in 1:1 sync.

There are no sanctioned casts yet. Prefer a typed adapter, a Zod parse, or a discriminated union
before reaching for one.

## Removed

Entries move here when the cast is deleted and the carve-out is removed from the config.
