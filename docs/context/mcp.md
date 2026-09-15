# MCP servers for this project

`.mcp.json` at the repo root declares project-scoped [Model Context Protocol](https://modelcontextprotocol.io)
servers. Claude Code (and other MCP clients) read it and, after you approve the servers once, expose
their tools to the agent. It ships empty on purpose — each project wires the servers it actually
needs. Project-scoped servers are prompted for approval before they run; they never execute
silently.

## When to add one

Add a server when it lets the agent **introspect or act** instead of guessing:

- **Filesystem / repo** — structured reads beyond grep.
- **Database** — let the agent read the real schema and run read-only queries while debugging.
- **Browser** — drive and screenshot the running app to verify UI changes.
- **Code graph** — call graphs and blast-radius ("who calls X", "what breaks if I change Y").

## How to add one

Edit `.mcp.json`:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": { "DATABASE_URL": "postgresql://localhost/dev" }
    }
  }
}
```

Never commit secrets into `.mcp.json`. Reference an env var (as above) and keep the value in
`.env.local`, which is git-ignored. Restart the client after editing so it re-reads the file.
