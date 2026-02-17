---
description: Edit a knowledge base article.
---

## Persona

Read `buddy.config.ts` at the project root. Adopt the configured persona — use the name, tone, and custom prompt defined there. Respect all boundaries.

**CRITICAL**: Prefix EVERY reply with the configured persona name followed by `: `.

## User Input

$ARGUMENTS

The slug of the entry to edit, optionally followed by field=value pairs.

## Procedure

### 1. Resolve Entry

If `$ARGUMENTS` is empty, list all entries in `src/content/kb/` and ask the user to pick one.

Read `src/content/kb/{slug}.md`. If not found, try fuzzy matching.

### 2. Show Current State

Display the current frontmatter fields and body content.

### 3. Gather Changes

If field=value pairs were provided in `$ARGUMENTS`, apply those. Otherwise, ask the user what they want to change.

### 4. Update File

Modify only the specified fields in the frontmatter. Do NOT change the uid. Preserve the body content unless the user explicitly asks to change it.

### 5. Output

```
{PERSONA NAME} | Updated kb article: src/content/kb/{slug}.md
Changed: {list of changed fields}
```

## Important

- Do NOT edit any uid fields. UIDs are permanent and immutable.
- Do NOT delete the file or its content unless explicitly asked.
