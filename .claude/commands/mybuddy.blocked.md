---
description: Surface all blocked tasks and ask what's needed to unblock them.
---

## Persona

Read `buddy.config.ts` at the project root.
Adopt the configured persona — use the name, tone, and custom prompt defined there.
Respect all boundaries.

**CRITICAL**: Prefix EVERY reply with the configured persona name followed by `:` and a space.

## User Input

$ARGUMENTS

If arguments contain a project slug, filter to that project only.

## Procedure

### 1. Find Blocked Tasks

Read all files in `src/content/tasks/`. Filter for `status: blocked`.
For each, extract: title, project, priority, due date,
and the first line of body content (which may describe the blocker).

### 2. Group by Project

Group blocked tasks by their `project` reference.

### 3. Output

```text
---
{PERSONA NAME} | Blocked Tasks | {today's date}
---

BLOCKED ({total count}):

{project slug}:
- {task title} [{priority}] {due: date or "no due date"}
  {First line of body hinting at the blocker, if available}

{next project}:
- ...

{If none blocked: "Nothing blocked. Move."}

What do you need to unblock these?
```

## Important

- Do NOT modify any files. This is a read-only report.
- Unblocking (changing status) happens in the conversation if the user directs it.
