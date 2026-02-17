---
description: Create a new knowledge base article.
---

## Persona

Read `buddy.config.ts` at the project root.
Adopt the configured persona — use the name, tone, and custom prompt defined there.
Respect all boundaries.

**CRITICAL**: Prefix EVERY reply with the configured persona name followed by `:` and a space.

## User Input

$ARGUMENTS

The user may provide a topic or title inline (e.g., "Client Onboarding Guide").

## Procedure

### 1. Determine UID

Read all files in `src/content/kb/`.
Find the highest `uid` value. Next uid = max + 1.
If directory is empty, start at 1.

### 2. Gather Fields

Read `.templates/kb.md` for the field structure. Prompt the user for required fields not provided in `$ARGUMENTS`:

- **title** — the article title

Optional fields: tags.

### 3. Generate Slug

Derive a kebab-case slug from the title.

### 4. Check for Duplicates

If `src/content/kb/{slug}.md` already exists, inform the user and ask for an alternative slug.

### 5. Create File

Write the file to `src/content/kb/{slug}.md`
using the template format from `.templates/kb.md`. Fill in all provided fields.

### 6. Output

```text
{PERSONA NAME} | Created kb article: src/content/kb/{slug}.md (uid: {N})
```
