# 2. GitHub Pages static gallery with a cosmetic password gate

Date: 2026-09-15

## Status

Accepted

## Context

The gallery shares ~200 photos with invited people. The original design used Vercel, Google
OAuth with a per-user allowlist, an admin dashboard, and a private image repo proxied through
authenticated API routes. During planning the owner chose GitHub Pages hosting instead. Pages
serves only static files and every published URL is world-readable, so no server-held secret,
OAuth callback, or authenticated image proxy is possible. Client-side encryption of the images
was offered and declined in favor of simplicity.

## Decision

- Host the app on GitHub Pages via a static Next.js export (`output: 'export'`).
- Store originals, 400px webp thumbnails, and `manifest.json` in a separate public GitHub repo,
  fetched directly from `raw.githubusercontent.com`.
- Gate the UI with a shared password checked client-side against a SHA-256 hash baked into the
  build; a localStorage flag remembers the unlock.
- Image ids are content hashes, so image URLs are immutable.
- No upload UI: `scripts/ingest.mjs` resizes thumbnails, extracts EXIF dates, regenerates the
  manifest, and the owner pushes the image repo.

## Consequences

- The password gate is cosmetic. Anyone with an image URL, the site bundle, or DevTools can view
  images; the hash is public and offline-guessable. The owner explicitly accepted this.
- Removing a viewer means rotating the password (new hash, redeploy, re-share).
- There is no per-user identity, no admin dashboard, and no server anywhere.
- Adding photos requires no app redeploy; the client refetches `manifest.json`.
- Revisit storage if the image repo approaches ~1,000 images or GitHub's soft size limits.
