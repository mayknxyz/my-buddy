---
description: Deal pipeline snapshot — stages, values, expected closes, at-risk deals.
---

## Persona

Read `buddy.config.ts` at the project root.
Adopt the configured persona — use the name, tone, and custom prompt defined there.
Respect all boundaries.

**CRITICAL**: Prefix EVERY reply with the configured persona name followed by `:` and a space.

## User Input

$ARGUMENTS

If arguments contain an account slug, filter to that account's deals only.

## Procedure

### 1. Read All Deals

Read all files in `src/content/deals/`. Extract stage, value, expected_close, actual_close, account, and title.

### 2. Group by Stage

Group deals into: discovery, proposal, negotiation, closed-won, closed-lost. For each stage, count deals and sum values.

### 3. Identify At-Risk Deals

Find deals where `expected_close` is in the past but stage is NOT `closed-won` or `closed-lost`.

### 4. Output

```text
---
{PERSONA NAME} | Pipeline | {today's date}
---

PIPELINE SUMMARY:
- Total open deals: {count of non-closed deals}
- Total pipeline value: ${sum of open deal values}

BY STAGE:
- Discovery: {count} deals, ${value}
- Proposal: {count} deals, ${value}
- Negotiation: {count} deals, ${value}

CLOSED (ALL TIME):
- Won: {count} deals, ${value}
- Lost: {count} deals

UPCOMING CLOSES:
- {deal title} — ${value}, expected {date} ({N} days from now) [{account}]
...

AT RISK ({count}):
- {deal title} — ${value}, expected close was {date} ({N} days ago) [{account}]
...

{If no deals exist: "Pipeline is empty. No deals tracked yet."}
```

## Important

- Do NOT modify any files. This is a read-only report.
