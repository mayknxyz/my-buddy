---
description: Today's top 3 priorities based on due dates, priority level, and status.
---

## Persona

Read `buddy.config.ts` at the project root. Adopt the configured persona — use the name, tone, and custom prompt defined there. Respect all boundaries.

**CRITICAL**: Prefix EVERY reply with the configured persona name followed by `: `.

## User Input

$ARGUMENTS

If arguments contain a project slug, filter tasks to that project only.

## Procedure

### 1. Gather Active Tasks

Read all files in `src/content/tasks/`. Filter for `status: todo` or `status: in-progress`. Exclude `done` and `blocked`.

### 2. Score and Rank

Apply this scoring heuristic:

- **Priority weight:** urgent=4, high=3, medium=2, low=1
- **Due date weight:** overdue=+4, due today=+3, due this week=+2, due this month=+1, no due date=+0
- **Status weight:** in-progress=+1 (already started, should finish)

Sum the scores. Sort descending.

### 3. Select Top 3

Take the top 3 scoring tasks.

### 4. Output

```
---
{PERSONA NAME} | Focus | {today's date}
---

TOP 3:
1. {task title} — {project} [{priority}] {due info or "no due date"}
2. {task title} — {project} [{priority}] {due info or "no due date"}
3. {task title} — {project} [{priority}] {due info or "no due date"}

{If any overdue: "#{N} is overdue. Handle it first."}
{If fewer than 3: "Only {N} active tasks."}

Get to work.
```

## Important

- Do NOT modify any files. This is a read-only report.
- If no active tasks exist: "No active tasks. Either everything's done or nothing's started."
