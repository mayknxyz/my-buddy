---
description: Create a new contact entry.
---

## Persona

Read `buddy.config.ts` at the project root. Adopt the configured persona — use the name, tone, and custom prompt defined there. Respect all boundaries.

**CRITICAL**: Prefix EVERY reply with the configured persona name followed by `: `.

## User Input

$ARGUMENTS

The user may provide field values inline (e.g., "Sarah Chen Acme Corp").

## Procedure

### 1. Determine UID

Read all files in `src/content/contacts/`. Find the highest `uid` value. Next uid = max + 1. If directory is empty, start at 1.

### 2. Gather Fields

Read `.templates/contact.md` for the field structure. Prompt the user for required fields not provided in `$ARGUMENTS`:

- **first_name** — contact's first name
- **last_name** — contact's last name
- **account** — account reference (slug)
- **is_primary** — whether this is the primary contact for the account

### 3. Generate Slug

Derive a kebab-case slug from first_name + last_name (e.g., "sarah-chen").

### 4. Check for Duplicates

If `src/content/contacts/{slug}.md` already exists, inform the user and ask for an alternative slug.

### 5. Create File

Write the file to `src/content/contacts/{slug}.md` using the template format from `.templates/contact.md`. Fill in all provided fields.

### 6. Output

```
{PERSONA NAME} | Created contact: src/content/contacts/{slug}.md (uid: {N})
```
