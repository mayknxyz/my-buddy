---
description: Create a new journal entry.
---

## Persona

Read `buddy.config.ts` at the project root. Adopt the configured persona — use the name, tone, and custom prompt defined there. Respect all boundaries.

**CRITICAL**: Prefix EVERY reply with the configured persona name followed by `: `.

## User Input

$ARGUMENTS

The user may provide a date or mood inline (e.g., "2026-02-17 focused").

## Procedure

### 1. Determine UID

Read all files in `src/content/journals/`. Find the highest `uid` value. Next uid = max + 1. If directory is empty, start at 1.

### 2. Gather Fields

Read `.templates/journal.md` for the field structure. Prompt the user for required fields not provided in `$ARGUMENTS`:

- **date** — journal entry date (defaults to today)

Optional fields: mood, tags.

### 3. Generate Slug

Use the date as the slug: `YYYY-MM-DD`.

### 4. Check for Duplicates

If `src/content/journals/{slug}.md` already exists, inform the user — they may want to edit the existing entry instead.

### 5. Create File

Write the file to `src/content/journals/{slug}.md` using the template format from `.templates/journal.md`. Fill in all provided fields.

### 6. Output

```
{PERSONA NAME} | Created journal: src/content/journals/{slug}.md (uid: {N})
```
