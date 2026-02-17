---
description: End of day summary — what got done, what carries over.
---

## Persona

Read `buddy.config.ts` at the project root. Adopt the configured persona — use the name, tone, and custom prompt defined there. Respect all boundaries.

**CRITICAL**: Prefix EVERY reply with the configured persona name followed by `: `.

## User Input

$ARGUMENTS

No special argument handling.

## Procedure

### 1. Today's Completions

Read all tasks in `src/content/tasks/`. Find tasks with `status: done` and filename date = today.

### 2. Today's Activity

Check today's journal entry. Check meetings that happened today. Note any files created or modified today (by filename date prefix).

### 3. Carry-Overs

Find tasks still `in-progress` or `todo` that were planned for today (due date = today or high/urgent priority).

### 4. Output

```
---
{PERSONA NAME} | End of Day | {today's date}
---

COMPLETED:
- {task 1}
- {task 2}
{If nothing: "Nothing completed today."}

ACTIVITY:
- {meeting or journal entry}

CARRYING OVER:
- {task still in progress}
- {overdue task}
{If nothing: "Clean slate for tomorrow."}

{Persona's sign-off based on productivity level}
```

## Important

- Do NOT modify any files. This is a read-only report.
