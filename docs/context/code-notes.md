# Code notes

The comment ban (`local/no-comments`) is total. The WHY that would have been a comment lives
here or in an ADR instead: hidden constraints, workarounds, non-obvious invariants, and the
reasons behind dependency pins or audit exceptions.

Keep entries short and dated. Delete an entry when the code it explains is gone.

## Template

- _(2026-08-29)_ Guardrails, gate scripts, and agent hooks are extracted from an internal
  monorepo and pared down to what applies to any Next.js project. See `CLAUDE.md`.

## Gallery

- _(2026-09-15)_ `lib/env.service.ts` parses an explicit object of literal
  `process.env.NEXT_PUBLIC_*` member reads, not `process.env` itself: Next.js only inlines
  client-side env vars when they appear as literal member expressions, so a dynamic
  `parse(process.env)` would see `{}` in the browser under static export.
- _(2026-09-15)_ Image fetches go straight to `raw.githubusercontent.com` with no credentials;
  its CORS policy is `Access-Control-Allow-Origin: *`, which forbids credentialed requests —
  never add `credentials: 'include'` to these fetches.
- _(2026-09-15)_ The zip download stores files uncompressed (`ZipPassThrough`): originals are
  already-compressed JPEG/WebP/HEIC, so deflate would burn CPU for ~0% size win.
- _(2026-09-15)_ Plain `<img>` instead of `next/image`: static export has no optimizer, and
  ingest already produces 400px webp thumbs. Manifest width/height prevent layout shift.
- _(2026-09-15)_ `scripts/ingest.mjs` derives image ids from content SHA-256, which is what
  makes image URLs immutable and re-ingests idempotent. Width/height are swapped when EXIF
  orientation ≥ 5 because `sharp.metadata()` reports pre-rotation dimensions.
- _(2026-09-15)_ The unlock flag in localStorage is set inside an effect, not a lazy useState
  initializer, so the static-export HTML (always locked) matches the first client render and
  hydration stays clean.
- _(2026-09-17)_ Videos: ingest remuxes .mov to .mp4 with `-c copy` (no re-encode — sources are
  already H.264/AAC; the container swap is for Firefox, which refuses QuickTime). Poster frame
  comes from ffmpeg (which auto-rotates), so its dimensions are the display dimensions. The zip
  and single-download paths treat videos as opaque bytes — no special casing.
- _(2026-09-17)_ Video ids hash the ORIGINAL .mov bytes, not the remuxed .mp4, so re-running
  ingest against the same export folder stays idempotent.
