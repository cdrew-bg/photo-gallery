# photo-gallery

A password-gated photo gallery with **no database and no backend**: images live in a public
GitHub repo, the app is a static Next.js export on GitHub Pages. Built on
[project-starter-template](../project-starter-template) — its gates and standards
([`CLAUDE.md`](./CLAUDE.md)) still apply.

## How it works

- A separate public repo (e.g. `gallery-images`) holds `images/<id>.<ext>` originals,
  `thumbs/<id>.webp` 400px previews, and `manifest.json`. Ids are content SHA-256 prefixes, so
  URLs are immutable.
- The app fetches everything straight from `raw.githubusercontent.com` — no server in between.
- A shared password (SHA-256 hash baked into the build) gates the UI. **Cosmetic only** — see
  [ADR 0002](./docs/adr/0002-github-pages-static-gallery.md); anyone with a direct URL can fetch
  an image.
- Viewers can multi-select and download a zip built client-side (fflate), or download singles
  from the lightbox.

## Adding photos

```bash
node scripts/ingest.mjs --source ~/Pictures/batch1 --repo ../gallery-images
cd ../gallery-images && git add -A && git commit -m "add photos" && git push
```

Ingest is idempotent (content-addressed), generates thumbs, reads EXIF dates, and rewrites the
manifest. `--push` does the git dance for you; `--force` re-processes existing ids. No app
redeploy needed — clients refetch the manifest.

## Configuration

Set in `.env` locally and as GitHub Actions **variables** for deploys (all values are public by
design — see the ADR):

| Var                                 | Value                                                           |
| ----------------------------------- | --------------------------------------------------------------- |
| `NEXT_PUBLIC_IMAGE_REPO_BASE`       | `https://raw.githubusercontent.com/<owner>/gallery-images/main` |
| `NEXT_PUBLIC_GALLERY_PASSWORD_HASH` | sha-256 hex of the shared password                              |
| `NEXT_PUBLIC_BASE_PATH`             | `/<repo>` for project pages, empty for a custom domain          |

Generate a password hash:

```bash
node -e "crypto.subtle.digest('SHA-256', new TextEncoder().encode('yourpassword')).then(d => console.log(Buffer.from(d).toString('hex')))"
```

Rotating the password = new hash in the Actions variable, redeploy, re-share.

## Deploy

`.github/workflows/pages.yml` runs `pnpm verify` + tests, builds the static export, and deploys
to GitHub Pages on every push to `main`. One-time setup: repo Settings → Pages → Source =
GitHub Actions, and set the three variables above under Settings → Secrets and variables →
Actions → Variables.

## Development

```bash
pnpm install            # also installs the Lefthook commit hooks
pnpm dev                # http://localhost:3000
pnpm verify             # every static gate
pnpm verify:full        # verify + build + test
```

## Layout

```
app/                 App Router pages (static export)
features/gallery/    Grid, lightbox, selection toolbar, zip download
features/gate/       Password gate
lib/                 env loader, manifest schema, image URLs, gate logic
stores/              zustand selection + notifications
scripts/ingest.mjs   Photo ingestion (thumbs, EXIF, manifest)
docs/                ADRs, repo map, code notes; CONTEXT.md has the glossary
```
