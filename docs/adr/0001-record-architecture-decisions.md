# 1. Record architecture decisions

Date: 2026-08-29

## Status

Accepted

## Context

The comment ban keeps WHY knowledge out of the code. That knowledge still has to live somewhere
durable and reviewable. Architecture Decision Records (ADRs) are that home: one file per decision,
committed alongside the code, changed by pull request.

## Decision

We record every architecturally significant decision as a numbered ADR in `docs/adr/`. Each ADR
states the context, the decision, and the consequences. An ADR records only what is actually being
implemented — no catalog of considered alternatives, no deferred or future actions, and no mention
of paths that were rejected. A path that looks wrong today may be made viable by a later decision,
so anchoring it as "rejected" only goes stale; each ADR is written as if its decision is the only
one on the table. Superseded ADRs are kept and marked, not deleted.

## Consequences

- Reviewers can see why a constraint exists without archaeology.
- New contributors (human or agent) read the ADR log to understand the shape of the system.
- The cost is one short document per real decision — cheap, and it compounds.
