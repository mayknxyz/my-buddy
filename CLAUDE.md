# my-buddy

## Stack

Astro 5, Tailwind CSS v4, Bun, Cloudflare R2, Wrangler, Biome, Pagefind

## Architecture

Flat-file business management system. Markdown files are the data layer,
folder names are foreign keys, no database.

- `src/` — Astro app (pages, components, lib, plugins, styles)
- `content/` — business data (gitignored in public repo, tracked in instances)
- `content.example/` — sample data for scaffolding
- `.templates/` — frontmatter templates for all 34 collections
- `.claude/commands/` — slash commands for CRUD, daily ops, reporting
- `scripts/` — CLI scripts (scaffolding, R2 upload, sync, migration)
- `docs/` — ADRs and Mermaid diagrams

## Collections

### Project-scoped (folder: `{project-slug}/`)

- `projects/` — core business projects (`index.md`)
- `tasks/` — tasks scoped to projects
- `meetings/` — meeting notes with agenda and action items
- `timelog/` — billable and non-billable time entries
- `budgets/` — planned vs actual spend (`index.md`)
- `expenses/` — project or general business expenses
- `knowledge/projects/` — project-specific technical notes

### Client-scoped (folder: `{client-slug}/`)

- `clients/` — client profiles (`index.md`)
- `contacts/` — contacts under client
- `contracts/` — service agreements with expiry tracking
- `proposals/` — versioned proposals linked to opportunities
- `invoices/` — invoices with status and R2 PDF reference
- `payments/` — payments received against invoices
- `interactions/` — client touchpoints and communication logs
- `knowledge/clients/` — client preferences and history

### Pipeline (folder: `{slug}/`)

- `leads/` — top of funnel, pre-qualification (`index.md`)
- `opportunities/` — qualified leads with pipeline stages (`index.md`)

### Standalone

- `team/` — team members
- `roles/` — job descriptions
- `leave/` — time-off records (folder: `{member-slug}/`)
- `subscriptions/` — recurring SaaS subscriptions
- `sops/` — standard operating procedures
- `compliance/` — legal policies with review cycles
- `ideas/` — raw ideas before becoming projects
- `journal/` — daily/weekly/monthly reflections
- `goals/` — OKRs per quarter (`index.md`)
- `campaigns/` — marketing campaign groupings (`index.md`)
- `tax/` — annual tax periods (`index.md`)
- `files/` — R2 file metadata (folder: `{project-or-client-slug}/`)

### Assets (folder: `assets/{type}/`)

- `assets/hardware/` — physical devices
- `assets/software/` — software licenses
- `assets/domains/` — domain names
- `assets/servers/` — VPS and server inventory
- `assets/accounts/` — service account metadata

### Marketing (folder: `marketing/{type}/`)

- `marketing/blog/` — blog posts pipeline
- `marketing/social/` — social media content
- `marketing/newsletter/` — newsletter issues

### Knowledge Base

- `knowledge/base/{category}/{topic}/` — global reusable knowledge
  - Categories: dev, business, tools, personal

## Conventions

- Slugs: kebab-case, stable, never rename after creation
- Dates: ISO format YYYY-MM-DD
- Frontmatter fields: kebab-case (`start-date`, not `start_date`)
- All required frontmatter fields must be present
- Binary files go to R2, never committed to repo
- Wiki-links: `[[slug]]` or `[[collection/slug]]` in markdown bodies
- Parent entities use `{slug}/index.md`, leaf entities use flat files
- Standalone entities use `{slug}.md` at collection root

## File Naming

- `index.md` — parent entities that namespace children
  (projects, clients, leads, opportunities, campaigns, goals, budgets, tax)
- `{entity-slug}.md` — leaf entities under a parent
  (contacts, tasks, invoices, payments, contracts, proposals, meetings,
  interactions, timelog, expenses, leave)
- `{slug}.md` — standalone entities
  (team, roles, subscriptions, sops, compliance, ideas, journal)

## R2

- URL pattern: `https://pub-xxx.r2.dev/{namespace}/{filename}`
- Upload: `./scripts/upload-file.sh <namespace> <file> <slug>`
- Metadata auto-created in `content/files/{namespace}/`

## Wiki-Links

- `[[slug]]` — auto-resolved by priority
- `[[collection/slug]]` — explicit collection target
- `[[slug|display text]]` — custom label
- Priority: clients > contacts > projects > tasks > leads >
  opportunities > kb > meetings > journal

## Code Comments

Three-tier convention:

1. Module comments — one per file, purpose and scope
2. TSDoc — on every exported function and type
3. Inline — prefixed `WHY:` (design rationale) or `LEARN:` (framework idioms)

## Scripts

- `./scripts/new-project.sh <project-slug> <client-slug>`
- `./scripts/new-client.sh <client-slug>`
- `./scripts/new-contact.sh <client-slug> <contact-slug>`
- `./scripts/new-task.sh <project-slug> <task-slug>`
- `./scripts/upload-file.sh <namespace-slug> <file-path> <output-slug>`
- `./scripts/log-time.sh <project-slug> <hours> <date>`
- `./scripts/sync-upstream.sh [--dry-run]`
- `./scripts/instances.sh list | add | remove`

## Key Files

- `src/content.config.ts` — Zod schemas for all collections
- `src/lib/relations.ts` — cross-collection query helpers
- `src/lib/config.ts` — instance configuration loader
- `src/plugins/wiki-links/remark-plugin.ts` — wiki-link transformer
- `src/plugins/wiki-links/build-index.ts` — slug index generator
- `buddy.config.ts` — instance-specific persona + R2 config (gitignored)
- `buddy.config.example.ts` — reference config for new instances
