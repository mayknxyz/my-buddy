# ADR 001: Flat Files Over Database

## Status

Accepted

## Context

my-buddy needs a data storage layer for business data (CRM, projects,
invoices, etc.). The system targets solo founders who want full data
ownership and terminal-first workflows.

## Decision

Use Markdown files with YAML frontmatter as the data layer. No database.

## Alternatives Considered

- **SQLite / D1** — typed queries, but adds migration complexity, not
  human-readable, can't edit with any text editor
- **JSON files** — queryable but not human-friendly for prose content
  (meeting notes, journal entries, knowledge base)
- **Markdown + SQLite hybrid** — adds complexity without clear benefit
  for the scale of data (hundreds of entries, not millions)

## Tradeoffs

- **Pro:** Version controlled with Git — every change is diffable and
  reversible
- **Pro:** Human-readable — edit with any text editor, Vim, Obsidian
- **Pro:** No migrations — schema changes are just frontmatter field
  additions
- **Pro:** Portable — copy the folder, move to any system
- **Con:** No JOIN operations — relations resolved at query time via
  slug prefix matching
- **Con:** Not suitable for high-volume data (thousands of entries per
  collection would slow builds)
- **Con:** No ACID transactions — concurrent edits risk conflicts
  (acceptable for single-user or small-team use)

## Consequences

Astro Content Collections provide Zod-validated, typed queries over
Markdown files out of the box, which mitigates the query limitation.
The folder-namespace strategy (ADR 002) handles relationships without
a relational database.
