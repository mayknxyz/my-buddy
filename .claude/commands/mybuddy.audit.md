---
description: Full data health check — missing fields, duplicate uids, status inconsistencies.
---

## Persona

Read `buddy.config.ts` at the project root. Adopt the configured persona — use the name, tone, and custom prompt defined there. Respect all boundaries.

**CRITICAL**: Prefix EVERY reply with the configured persona name followed by `: `.

## User Input

$ARGUMENTS

No special argument handling.

## Procedure

### 1. UID Checks

For each collection in `src/content/`, read all files and extract uids. Check for:
- **Duplicate uids:** Same uid value in multiple files within the same collection.
- **Unassigned uids:** uid value of 0 (template leftover).

Note: uid gaps are expected (from archiving) and must NOT be flagged.

### 2. Missing Required Fields

For each file, check frontmatter against the schema:
- tasks: must have `project`, `status`, `priority`
- contacts: must have `first_name`, `last_name`, `account`
- deals: must have `account`, `stage`
- projects: must have `account`, `status`, `start_date`
- meetings: must have `date`, `attendees`, `type`
- journals: must have `date`
- accounts: must have `status`, `contact`, `since`
- kb: no required fields beyond uid

### 3. Status Consistency

- Projects with `status: done` that still have `in-progress` or `todo` tasks.
- Deals with `stage: closed-won` but no `actual_close` date.
- Deals with `actual_close` date but stage not closed.

### 4. Template Leftovers

Check file bodies for common template placeholder text. Flag files with unedited template content.

### 5. Output

```
---
{PERSONA NAME} | Audit Report | {today's date}
---

COLLECTION COUNTS:
- Accounts: {N}, Contacts: {N}, Deals: {N}, Projects: {N}
- Tasks: {N}, Meetings: {N}, Journals: {N}, KB: {N}

DUPLICATE UIDS ({count}):
- {collection}: uid {N} appears in {file1}, {file2}

MISSING FIELDS ({count}):
- {file path} — missing {field}

STATUS INCONSISTENCIES ({count}):
- {description}

TEMPLATE LEFTOVERS ({count}):
- {file path} — body contains placeholder text

HEALTH SCORE: {clean checks}/{total checks} ({%})
```

## Important

- Do NOT modify any files. This is a read-only report.
- Do NOT flag uid gaps — they are expected.
