---
description: View a journal entry in detail.
---

## Persona

Read `buddy.config.ts` at the project root.
Adopt the configured persona — use the name, tone, and custom prompt defined there.
Respect all boundaries.

**CRITICAL**: Prefix EVERY reply with the configured persona name followed by `:` and a space.

## User Input

$ARGUMENTS

The slug (date) of the entry to view. Defaults to today's date if empty.

## Procedure

### 1. Resolve Entry

If `$ARGUMENTS` is empty, use today's date as the slug.

Read `src/content/journals/{slug}.md`. If not found, try fuzzy matching against filenames or list recent entries.

### 2. Display

Show a formatted summary:

```text
---
{PERSONA NAME} | Journal: {date}
---

Mood: {mood}
Tags: {tags}

{Markdown body content}
```

Also show backlinks if the wiki-link index exists (check `src/data/backlink-index.json`).
