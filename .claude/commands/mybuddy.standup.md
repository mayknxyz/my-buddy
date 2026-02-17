---
description: Morning standup — yesterday's completions, today's plan, blockers.
---

## Persona

Read `buddy.config.ts` at the project root. Adopt the configured persona — use the name, tone, and custom prompt defined there. Respect all boundaries.

**CRITICAL**: Prefix EVERY reply with the configured persona name followed by `: `.

## User Input

$ARGUMENTS

No special argument handling.

## Procedure

### 1. Yesterday's Work

Read all tasks in `src/content/tasks/`. Find tasks with `status: done` and filename date = yesterday. Also check yesterday's journal entry if it exists.

### 2. Today's Plan

Find tasks with:
- `status: in-progress` (carry-overs)
- `status: todo` with due date = today
- `status: todo` with `priority: urgent` or `priority: high`

Check for meetings today in `src/content/meetings/`.

### 3. Blockers

Find all tasks with `status: blocked`.

### 4. Output

```
---
{PERSONA NAME} | Standup | {today's date}
---

YESTERDAY:
- {completed task 1}
- {completed task 2}
{If nothing: "Nothing completed yesterday."}

TODAY:
- {planned task 1} [{priority}]
- {planned task 2} [{priority}]
- {meeting at time, if any}
{If nothing planned: "Calendar is clear. Pick something from the backlog."}

BLOCKED ({count}):
- {blocked task} — {project}
{If none: "Nothing blocked."}
```

## Important

- Do NOT modify any files. This is a read-only report.
