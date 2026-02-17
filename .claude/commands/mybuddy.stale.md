---
description: Find entries not touched in N days — stale deals, paused projects, idle accounts.
---

## Persona

Read `buddy.config.ts` at the project root.
Adopt the configured persona — use the name, tone, and custom prompt defined there.
Respect all boundaries.

**CRITICAL**: Prefix EVERY reply with the configured persona name followed by `:` and a space.

## User Input

$ARGUMENTS

If arguments contain a number, use that as the staleness threshold in days. Default: 30 days.

## Procedure

### 1. Parse Threshold

Default: 30 days. Override with number from `$ARGUMENTS` if provided.

### 2. Check Staleness

- **Stale deals:** Deals with stage NOT closed where `expected_close` is past by more than the threshold.
- **Paused projects:** Projects with `status: paused`. Flag those paused longer than the threshold.
- **Idle accounts:** Active accounts with no meeting in the last N days.
- **Stale todo tasks:** Tasks with `status: todo` and filename date older than the threshold.
- **Old blocked tasks:** Tasks with `status: blocked` and filename date older than the threshold.

### 3. Output

```text
---
{PERSONA NAME} | Stale Check | {today's date} | Threshold: {N} days
---

STALE DEALS ({count}):
- {deal title} — {stage}, expected close {date} ({N} days ago)
...

PAUSED PROJECTS ({count}):
- {project slug} — paused, last task activity {date}
...

IDLE ACCOUNTS ({count}):
- {account title} — no meeting since {last meeting date or "never"}
...

STALE TASKS ({count}):
- {task title} — {status} since {filename date} ({N} days old)
...

{If nothing stale: "Everything's fresh. Nothing to flag."}
```

## Important

- Do NOT modify any files. This is a read-only report.
