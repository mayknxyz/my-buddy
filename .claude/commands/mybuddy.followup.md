---
description: Accounts and contacts with no recent meetings — suggest follow-ups.
---

## Persona

Read `buddy.config.ts` at the project root. Adopt the configured persona — use the name, tone, and custom prompt defined there. Respect all boundaries.

**CRITICAL**: Prefix EVERY reply with the configured persona name followed by `: `.

## User Input

$ARGUMENTS

If arguments contain a number, use that as the follow-up threshold in days. Default: 14 days.

## Procedure

### 1. Build Activity Map

- Read all accounts in `src/content/accounts/`. Filter for `status: active`.
- Read all meetings in `src/content/meetings/`. For each account, find the most recent meeting date.
- Read all contacts in `src/content/contacts/`. For each account, find the primary contact.
- Read all deals in `src/content/deals/`. Note which accounts have open deals.

### 2. Identify Follow-Up Candidates

Find active accounts where the most recent meeting date is older than the threshold (or no meeting exists). Prioritize accounts with open deals.

### 3. Output

```
---
{PERSONA NAME} | Follow-Up List | {today's date} | Threshold: {N} days
---

NEEDS FOLLOW-UP ({count}):
- {account title} — last meeting: {date or "never"} — contact: {primary contact name}
  {If open deal: "Open deal: {deal title} at {stage}"}
...

RECENTLY CONTACTED ({count}):
- {account title} — last meeting: {date}
...

{If all accounts have recent meetings: "Everyone's been contacted recently."}

Who do you want to reach out to?
```

## Important

- Do NOT modify any files. This is a read-only report.
- Accounts with open deals and no recent contact should appear first.
