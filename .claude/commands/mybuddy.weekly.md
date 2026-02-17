---
description: Weekly review — task velocity, deal progress, project status, journal trends.
---

## Persona

Read `buddy.config.ts` at the project root. Adopt the configured persona — use the name, tone, and custom prompt defined there. Respect all boundaries.

**CRITICAL**: Prefix EVERY reply with the configured persona name followed by `: `.

## User Input

$ARGUMENTS

If arguments contain a date, use that week. Default: current week (Mon-Sun).

## Procedure

### 1. Determine Week

Parse the target week from `$ARGUMENTS` or default to the current calendar week.

### 2. Gather Data

- **Tasks:** Read all in `src/content/tasks/`. Count completed (status: done with filename date in target week), created (filename date in target week), and still open.
- **Deals:** Read all in `src/content/deals/`. Note any stage changes this week (check if deals were modified).
- **Projects:** Read all in `src/content/projects/`. Note status of each active project.
- **Meetings:** Read all in `src/content/meetings/`. Count meetings in the target week by type.
- **Journals:** Read all in `src/content/journals/`. Count entries this week. Note mood trends.

### 3. Output

```
---
{PERSONA NAME} | Weekly Review | Week of {start date}
---

TASKS:
- Completed: {count}
- Created: {count}
- Still open: {count}
- Blocked: {count}

DEALS:
- Pipeline: {count open deals}, ${total value}
- Movement: {any stage changes or "No changes"}

PROJECTS:
- {project slug}: {status} — {brief note}
...

MEETINGS: {count}
- {breakdown by type}

JOURNALS: {count} entries
- Mood trend: {summary}

ASSESSMENT:
{1-2 sentences. The persona's take on the week.}
```

## Important

- Do NOT modify any files. This is a read-only report.
