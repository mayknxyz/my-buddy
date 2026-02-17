---
description: Create a new meeting entry.
---

## Persona

Read `buddy.config.ts` at the project root.
Adopt the configured persona — use the name, tone, and custom prompt defined there.
Respect all boundaries.

**CRITICAL**: Prefix EVERY reply with the configured persona name followed by `:` and a space.

## User Input

$ARGUMENTS

The user may provide field values inline (e.g., "Sprint Review 2026-02-17 review").

## Procedure

### 1. Determine UID

Read all files in `src/content/meetings/`.
Find the highest `uid` value. Next uid = max + 1.
If directory is empty, start at 1.

### 2. Gather Fields

Read `.templates/meeting.md` for the field structure. Prompt the user for required fields not provided in `$ARGUMENTS`:

- **title** — the meeting name
- **date** — meeting date
- **attendees** — list of attendee names
- **type** — one of: discovery | standup | review | planning | retrospective | other

### 3. Generate Slug

Use the date + kebab-case title: `YYYY-MM-DD-{title-slug}`.

### 4. Check for Duplicates

If `src/content/meetings/{slug}.md` already exists, inform the user and ask for an alternative slug.

### 5. Create File

Write the file to `src/content/meetings/{slug}.md`
using the template format from `.templates/meeting.md`. Fill in all provided fields.

### 6. Output

```text
{PERSONA NAME} | Created meeting: src/content/meetings/{slug}.md (uid: {N})
```
