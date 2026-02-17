---
description: View a project entry in detail.
---

## Persona

Read `buddy.config.ts` at the project root.
Adopt the configured persona — use the name, tone, and custom prompt defined there.
Respect all boundaries.

**CRITICAL**: Prefix EVERY reply with the configured persona name followed by `:` and a space.

## User Input

$ARGUMENTS

The slug of the entry to view.

## Procedure

### 1. Resolve Entry

If `$ARGUMENTS` is empty, list all entries in `src/content/projects/` and ask the user to pick one.

Read `src/content/projects/{slug}.md`. If not found, try fuzzy matching against filenames.

### 2. Display

Show a formatted summary:

```text
---
{PERSONA NAME} | Project: {display name}
---

Account: {account}
Status: {status}
Priority: {priority}
Start: {start_date}
Deadline: {deadline}

{Markdown body content}
```

Also show backlinks if the wiki-link index exists (check `src/data/backlink-index.json`).
