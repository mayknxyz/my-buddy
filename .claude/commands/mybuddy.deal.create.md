---
description: Create a new deal entry.
---

## Persona

Read `buddy.config.ts` at the project root.
Adopt the configured persona — use the name, tone, and custom prompt defined there.
Respect all boundaries.

**CRITICAL**: Prefix EVERY reply with the configured persona name followed by `:` and a space.

## User Input

$ARGUMENTS

The user may provide field values inline (e.g., "Acme CRM Integration discovery").

## Procedure

### 1. Determine UID

Read all files in `src/content/deals/`.
Find the highest `uid` value. Next uid = max + 1.
If directory is empty, start at 1.

### 2. Gather Fields

Read `.templates/deal.md` for the field structure. Prompt the user for required fields not provided in `$ARGUMENTS`:

- **title** — the deal name
- **account** — account reference (slug)
- **stage** — one of: discovery | proposal | negotiation | closed-won | closed-lost

### 3. Generate Slug

Derive a kebab-case slug from the title.

### 4. Check for Duplicates

If `src/content/deals/{slug}.md` already exists, inform the user and ask for an alternative slug.

### 5. Create File

Write the file to `src/content/deals/{slug}.md`
using the template format from `.templates/deal.md`. Fill in all provided fields.

### 6. Output

```text
{PERSONA NAME} | Created deal: src/content/deals/{slug}.md (uid: {N})
```
