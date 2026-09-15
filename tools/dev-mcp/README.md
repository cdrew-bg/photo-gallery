# dev MCP server

Zero-dependency stdio MCP server that exposes this repo's gate/lint/format/test scripts as tools, so an agent runs checks through typed `mcp__dev__*` tools instead of raw `pnpm` in Bash. Consumed by the `dev` skill in `.claude/skills/dev/SKILL.md`.

- `server.mjs` — the server. Newline-delimited JSON-RPC 2.0 over stdio (protocol `2024-11-05`). No npm dependencies.
- `tools.json` — **generated** tool manifest. The server reads it at startup. Never hand-edit.
- Registered in `.mcp.json` as `{ "dev": { "command": "node", "args": ["tools/dev-mcp/server.mjs"] } }`.

## Self-update

The manifest and the skill file are generated from `package.json` scripts:

```
node scripts/gen-dev-skill.mjs          # regenerate tools.json + SKILL.md
node scripts/gen-dev-skill.mjs --check  # exit 1 if either is stale (CI / git-hook use)
```

Add a new script to `package.json`, add its entry to the `SPEC` array in `scripts/gen-dev-skill.mjs`, then run the generator — a new `mcp__dev__*` tool and skill row appear with no server edits.

## Git-hook wiring (apply manually — these files are guardrail-protected)

The agent cannot edit `package.json` or `lefthook.yml`. To finish the local-script + git-hook self-update loop, apply these by hand.

`package.json` scripts (optional convenience aliases):

```jsonc
"skill:sync": "node scripts/gen-dev-skill.mjs",
"skill:check": "node scripts/gen-dev-skill.mjs --check",
```

`lefthook.yml` — add a drift check to `pre-commit.commands` and a re-sync on pull:

```yaml
pre-commit:
  commands:
    skill-sync:
      run: node scripts/gen-dev-skill.mjs --check

post-merge:
  commands:
    skill-sync:
      run: node scripts/gen-dev-skill.mjs
```

Then run `pnpm prepare` (reinstalls lefthook) so `post-merge` is registered.
