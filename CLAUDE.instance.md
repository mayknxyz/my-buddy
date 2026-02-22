# my-buddy (Instance)

You are working in a **my-buddy instance** — a private business management
repo. The app code is maintained upstream and synced via `bun run sync`.

## Allowed Files

You may **only** create, edit, and delete files in:

- `content/` — all business data (markdown files)
- `buddy.config.ts` — instance configuration (persona, R2 settings)
- `CLAUDE.local.md` — your custom AI instructions (gitignored, survives syncs)

## Restricted Files

Do **not** modify anything outside `content/` and `buddy.config.ts`.
These files are managed by the upstream template and will cause merge
conflicts on the next `bun run sync`:

- `src/` — app code (pages, components, lib, plugins, styles)
- `scripts/` — CLI scripts
- `.templates/` — frontmatter templates
- `.claude/commands/` — slash commands
- `docs/` — documentation
- `package.json`, `astro.config.mjs`, `tsconfig.json`, `biome.jsonc`
- `CLAUDE.md`, `CLAUDE.instance.md` — managed by upstream

## Architecture

Flat-file business management system. Markdown files are the data layer,
folder names are foreign keys, no database.

## Collections

### Project-scoped (folder: `{project-slug}/`)

- `projects/` — core business projects (`index.md`)
- `tasks/` — tasks scoped to projects
- `meetings/` — meeting notes with agenda and action items
- `timelog/` — billable and non-billable time entries
- `budgets/` — planned vs actual spend (`index.md`, `general/` for non-project)
- `expenses/` — project or general business expenses (`general/` for non-project)
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

- `team/`, `roles/`, `leave/`, `subscriptions/`, `sops/`, `compliance/`,
  `ideas/`, `journal/`, `goals/`, `campaigns/`, `tax/`, `files/`

### Assets (`assets/{type}/`), Marketing (`marketing/{type}/`), Knowledge Base (`knowledge/base/`)

See the full CLAUDE.md in the upstream repo for detailed collection docs.

## Conventions

- Slugs: kebab-case, stable, never rename after creation
- Dates: ISO format YYYY-MM-DD
- Frontmatter fields: kebab-case (`start-date`, not `start_date`)
- All required frontmatter fields must be present
- Binary files go to R2, never committed to repo
- Wiki-links: `[[slug]]` or `[[collection/slug]]` in markdown bodies
- Parent entities use `{slug}/index.md`, leaf entities use flat files

## File Naming

- `index.md` — parent entities that namespace children
- `{entity-slug}.md` — leaf entities under a parent
- `{slug}.md` — standalone entities

## R2

- URL pattern: `https://pub-xxx.r2.dev/{namespace}/{filename}`
- Upload: `./scripts/upload-file.sh <namespace> <file> <slug>`

## Syncing Updates

```bash
bun run sync    # Pull latest app code from upstream
```

## Custom Instructions

Add your custom AI instructions to `CLAUDE.local.md`. This file is
gitignored and preserved across syncs.
