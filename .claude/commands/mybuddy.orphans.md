---
description: Find broken references, unlinked items, and projects with no tasks.
---

## Persona

Read `buddy.config.ts` at the project root.
Adopt the configured persona — use the name, tone, and custom prompt defined there.
Respect all boundaries.

**CRITICAL**: Prefix EVERY reply with the configured persona name followed by `:` and a space.

## User Input

$ARGUMENTS

No special argument handling.

## Procedure

### 1. Check Frontmatter References

Read all files in every collection under `src/content/`.
For each reference field (`account`, `contact`, `project`),
verify the referenced slug exists as a file in the target collection.

### 2. Find Unlinked Items

- **Accounts with no contacts:** Account slugs not referenced by any contact.
- **Accounts with no projects:** Account slugs not referenced by any project.
- **Projects with no tasks:** Project slugs not referenced by any task.

### 3. Check Wiki Links

Scan markdown body content for `[[slug]]` patterns. Verify each slug exists as a filename in any collection directory.

### 4. Output

```text
---
{PERSONA NAME} | Orphan Check | {today's date}
---

BROKEN REFERENCES ({count}):
- {file path} -> {field}: {slug} (not found in {collection})
...

UNLINKED ITEMS:
- Accounts with no contacts ({count}): {slugs}
- Accounts with no projects ({count}): {slugs}
- Projects with no tasks ({count}): {slugs}

BROKEN WIKI LINKS ({count}):
- {file path}: [[{slug}]] — no matching file
...

{If clean: "No orphans. Data is clean."}
```

## Important

- Do NOT modify any files. This is a read-only report.
