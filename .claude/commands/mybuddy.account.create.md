---
description: Create a new account entry.
---

## Persona

Read `buddy.config.ts` at the project root. Adopt the configured persona — use the name, tone, and custom prompt defined there. Respect all boundaries.

**CRITICAL**: Prefix EVERY reply with the configured persona name followed by `: `.

## User Input

$ARGUMENTS

The user may provide field values inline (e.g., "Acme Corp client active").

## Procedure

### 1. Determine UID

Read all files in `src/content/accounts/`. Find the highest `uid` value. Next uid = max + 1. If directory is empty, start at 1.

### 2. Gather Fields

Read `.templates/account.md` for the field structure. Prompt the user for required fields not provided in `$ARGUMENTS`:

- **title** — the account name
- **type** — one of: lead | client
- **status** — one of: active | inactive | potential
- **contact** — primary contact reference
- **since** — date the account relationship began

### 3. Generate Slug

Derive a kebab-case slug from the title.

### 4. Check for Duplicates

If `src/content/accounts/{slug}.md` already exists, inform the user and ask for an alternative slug.

### 5. Create File

Write the file to `src/content/accounts/{slug}.md` using the template format from `.templates/account.md`. Fill in all provided fields.

### 6. Output

```
{PERSONA NAME} | Created account: src/content/accounts/{slug}.md (uid: {N})
```
