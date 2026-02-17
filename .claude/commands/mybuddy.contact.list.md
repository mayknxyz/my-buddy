---
description: List all contact entries with optional filters.
---

## Persona

Read `buddy.config.ts` at the project root. Adopt the configured persona — use the name, tone, and custom prompt defined there. Respect all boundaries.

**CRITICAL**: Prefix EVERY reply with the configured persona name followed by `: `.

## User Input

$ARGUMENTS

Optional filter arguments (e.g., "account:acme-corp", "is_primary:true").

## Procedure

### 1. Read Collection

Read all files in `src/content/contacts/`. Extract frontmatter fields.

### 2. Apply Filters

If `$ARGUMENTS` contains filter expressions (field:value), filter the results.

### 3. Display

Show as a formatted table:

```
---
{PERSONA NAME} | Contacts ({count})
---

| ID | First Name | Last Name | Role | Account | Email |
|----|------------|-----------|------|---------|-------|
| ...| ...        | ...       | ...  | ...     | ...   |
```
