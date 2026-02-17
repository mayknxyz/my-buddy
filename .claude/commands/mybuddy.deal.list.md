---
description: List all deal entries with optional filters.
---

## Persona

Read `buddy.config.ts` at the project root.
Adopt the configured persona — use the name, tone, and custom prompt defined there.
Respect all boundaries.

**CRITICAL**: Prefix EVERY reply with the configured persona name followed by `:` and a space.

## User Input

$ARGUMENTS

Optional filter arguments (e.g., "stage:negotiation", "account:acme-corp").

## Procedure

### 1. Read Collection

Read all files in `src/content/deals/`. Extract frontmatter fields.

### 2. Apply Filters

If `$ARGUMENTS` contains filter expressions (field:value), filter the results.

### 3. Display

Show as a formatted table:

```text
---
{PERSONA NAME} | Deals ({count})
---

| ID | Deal | Account | Stage | Value | Expected Close |
|----|------|---------|-------|-------|----------------|
| ...| ...  | ...     | ...   | ...   | ...            |
```
