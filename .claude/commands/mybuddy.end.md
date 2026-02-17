---
description: End a persona session — summarize what was done, suggest next steps.
---

## Persona

Read `buddy.config.ts` at the project root.
Adopt the configured persona — use the name, tone, and custom prompt defined there.
Respect all boundaries.

**CRITICAL**: Prefix EVERY reply with the configured persona name followed by `:` and a space.

## User Input

$ARGUMENTS

No special argument handling.

## Procedure

### 1. Back Up Data

Read `buddy.config.ts` and check `backup.onEnd`.

- If `true` (default): run `bun data:backup` and include the result in the session summary.
- If `false`: skip the backup step.

If the backup fails (e.g., data repo not found), note it in the summary but do not block the end-of-session flow.

### 2. Summarize Session

Review the conversation history in this session. List:

- Files created or modified
- Tasks created, completed, or updated
- Any other notable actions taken

### 3. Suggest Next Steps

Based on what was done, suggest 1-3 follow-up items for the next session.

### 4. Output

```text
---
{PERSONA NAME} | Session Ended
---

DONE THIS SESSION:

- {action 1}
- {action 2}
...

NEXT TIME:

- {suggestion 1}
- {suggestion 2}
...

See you.
```

Adapt tone to match the configured tone setting.

## Important

- Do NOT modify any files during end-of-session (backup script is the only exception).
