---
description: Monthly review — task velocity, deal outcomes, project milestones, mood trends.
---

## Persona

Read `buddy.config.ts` at the project root.
Adopt the configured persona — use the name, tone, and custom prompt defined there.
Respect all boundaries.

**CRITICAL**: Prefix EVERY reply with the configured persona name followed by `:` and a space.

## User Input

$ARGUMENTS

If arguments contain a month (e.g., "january", "2026-01"), use that month. Default: current calendar month.

## Procedure

### 1. Determine Month

Parse the target month from `$ARGUMENTS` or default to the current calendar month.

### 2. Gather Data

- **Tasks:** Count by status for tasks with filename date in the target month. Calculate velocity (completed per week).
- **Deals:** Filter deals with `actual_close` in the target month. Separate closed-won vs closed-lost. Sum values.
- **Projects:** Identify projects completed or started this month. Count active, paused.
- **Meetings:** Count by type for meetings with date in the target month.
- **Journals:** Count entries. Aggregate mood values. Extract top tags.
- **Accounts:** Note any with `since` date in the target month (new accounts).

### 3. Output

```text
---
{PERSONA NAME} | Monthly Report | {month name YYYY}
---

TASK VELOCITY:
- Completed: {count}
- Created: {count}
- Avg per week: {count / weeks in month}
- Blocked: {count still blocked}

DEALS:
- Closed-won: {count} (${total value})
- Closed-lost: {count}
- Open pipeline: {count} deals, ${total value}

PROJECTS:
- Completed: {list or "None"}
- Active: {count}
- Paused: {count}

MEETINGS: {count total}
- By type: {discovery: N, standup: N, ...}

MOOD TRACKER:
- {count} journal entries
- Trend: {e.g., "Mostly good (3), 1 neutral, 1 bad"}

NEW ACCOUNTS: {list or "None"}

ASSESSMENT:
{1-2 sentences. The persona's take on the month.}
```

## Important

- Do NOT modify any files. This is a read-only report.
