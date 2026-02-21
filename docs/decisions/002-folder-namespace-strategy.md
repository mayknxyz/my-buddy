# ADR 002: Folder Namespace Strategy

## Status

Accepted

## Context

Without a database, we need a way to express relationships between
collections (tasks belong to projects, contacts belong to clients).
We also need to prevent slug collisions — two projects can both have
a task called `setup-repo`.

## Decision

Use the parent entity's slug as a subfolder name within child
collections. The folder name IS the foreign key.

```
tasks/project-alpha/setup-repo.md   → belongs to project-alpha
tasks/project-beta/setup-repo.md    → belongs to project-beta
contacts/acme-corp/john-doe.md      → belongs to acme-corp
```

Parent entities that namespace children use `{slug}/index.md`.
Leaf entities use flat files under the parent folder.
Standalone entities use `{slug}.md` at the collection root.

## Alternatives Considered

- **UUID-based references** — `task-id: uuid-xxx` in frontmatter.
  Works but UUIDs are not human-readable, harder to debug, and
  require a generation step
- **Flat files with frontmatter refs only** — `project: project-alpha`
  in frontmatter. Allows slug collisions across projects and requires
  frontmatter parsing to resolve every relationship
- **Nested content (tasks inside project folder)** — breaks Astro's
  content collection model which expects one collection per folder

## Tradeoffs

- **Pro:** Slug collisions eliminated by path — no UUID needed
- **Pro:** Filesystem is the index — `ls tasks/project-alpha/` shows
  all tasks for that project
- **Pro:** Queries use simple string prefix matching
- **Con:** Moving an entity between parents requires renaming the folder
- **Con:** Deeply nested paths can get long

## Consequences

All query helpers in `src/lib/relations.ts` use `slug.startsWith()`
for folder-namespaced relationships and frontmatter field matching
for explicit references.
