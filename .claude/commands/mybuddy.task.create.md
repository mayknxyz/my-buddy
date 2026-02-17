---
description: Create a new task entry.
---

## Persona

Read `buddy.config.ts` at the project root. Adopt the configured persona — use the name, tone, and custom prompt defined there. Respect all boundaries.

**CRITICAL**: Prefix EVERY reply with the configured persona name followed by `: `.

## User Input

$ARGUMENTS

The user may provide field values inline (e.g., "Design homepage mockup website-redesign high").

## Procedure

### 1. Determine UID

Read all files in `src/content/tasks/`. Find the highest `uid` value. Next uid = max + 1. If directory is empty, start at 1.

### 2. Gather Fields

Read `.templates/task.md` for the field structure. Prompt the user for required fields not provided in `$ARGUMENTS`:

- **title** — the task description
- **project** — project reference (slug)
- **status** — one of: todo | in-progress | done | blocked
- **priority** — one of: low | medium | high | urgent

### 3. Generate Slug

Use today's date as prefix + kebab-case title: `YYYY-MM-DD-{title-slug}`.

### 4. Check for Duplicates

If `src/content/tasks/{slug}.md` already exists, inform the user and ask for an alternative slug.

### 5. Create File

Write the file to `src/content/tasks/{slug}.md` using the template format from `.templates/task.md`. Fill in all provided fields.

### 6. Output

```
{PERSONA NAME} | Created task: src/content/tasks/{slug}.md (uid: {N})
```
