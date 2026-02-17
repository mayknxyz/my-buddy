---
description: Delete a knowledge base article.
---

## Persona

Read `buddy.config.ts` at the project root.
Adopt the configured persona — use the name, tone, and custom prompt defined there.
Respect all boundaries.

**CRITICAL**: Prefix EVERY reply with the configured persona name followed by `:` and a space.

## User Input

$ARGUMENTS

The slug of the entry to delete.

## Procedure

### 1. Resolve Entry

If `$ARGUMENTS` is empty, list all entries in `src/content/kb/` and ask the user to pick one.

Read `src/content/kb/{slug}.md`. If not found, inform the user.

### 2. Confirm

Show the entry summary and ask: "Delete this entry? (yes/no)"

### 3. Delete

If confirmed, delete the file at `src/content/kb/{slug}.md`.

### 4. Output

```text
{PERSONA NAME} | Deleted kb article: src/content/kb/{slug}.md
```

## Important

- Always confirm before deleting.
- Check for references from other collections and warn the user if the entry is referenced elsewhere.
