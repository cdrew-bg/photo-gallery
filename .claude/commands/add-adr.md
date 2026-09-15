---
description: Add a numbered Architecture Decision Record
argument-hint: <short decision title>
---

Create the next ADR in `docs/adr/`, following the shape of
`docs/adr/0001-record-architecture-decisions.md`:

- File name `NNNN-kebab-title.md`, where `NNNN` is one greater than the highest existing ADR number
  (zero-padded to four digits).
- Sections in order: `# N. Title`, `Date:` (today, UTC `YYYY-MM-DD`), `## Status`
  (Proposed or Accepted), `## Context`, `## Decision`, `## Consequences`.
- Keep it short. Record the WHY and the trade-off, not implementation detail.
- Record only the decision actually being implemented. No "Considered alternatives" / "Options"
  section, no deferred, future, or out-of-scope actions, and no mention of paths that were rejected.
  Write the ADR as if the chosen decision is the only one on the table — a path that looks wrong
  today may be made viable by a later decision, and a record that anchors it as "rejected" only goes
  stale. State the context, the decision, and its consequences; nothing about roads not taken.
- If this decision supersedes an earlier ADR, mark the old one Superseded rather than deleting it.

Decision to record: $ARGUMENTS
