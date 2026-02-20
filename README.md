# my-buddy

All-in-one personal business management system. Flat-file, Git-backed,
terminal-first.

Replaces fragmented SaaS tools (CRM, project management, invoicing, HR,
knowledge base) with a single version-controlled repository. Markdown files
are the data layer, Cloudflare R2 handles binary storage, and an
Astro-powered dashboard provides the UI.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Astro 5.x |
| Content | Astro Content Collections (Zod schemas) |
| Styling | Tailwind CSS v4 |
| Search | Pagefind |
| Cross-Referencing | Remark wiki-links plugin |
| File Storage | Cloudflare R2 |
| Runtime | Bun |
| Linting | Biome |
| AI Context | Claude Code + CLAUDE.md |

## Architecture

```
my-buddy/
├── src/              # Astro app — pages, components, lib, plugins
├── content/          # Flat-file business data (gitignored in public repo)
├── content.example/  # Sample data for scaffolding + demo
├── .templates/       # Frontmatter templates for all collections
├── .claude/commands/ # Claude Code slash commands
├── scripts/          # CLI scripts (scaffolding, upload, sync)
└── docs/             # ADRs, Mermaid diagrams
```

Content is organized into 30+ collections using folder-based namespacing.
The folder name acts as the foreign key — no database needed.

```
content/
├── projects/{slug}/index.md    # Parent entities use index.md
├── tasks/{project-slug}/*.md   # Children nest under parent slug
├── clients/{slug}/index.md
├── contacts/{client-slug}/*.md
└── ...
```

See the [PRD](PRD.md) for the full architecture and module specifications.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (runtime + package manager)
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) (for R2 uploads)
- Git

### Development

```bash
bun install
bun dev          # Start Astro dev server with hot reload
```

### Build

```bash
bun run build    # Build wiki-link index → Astro build → Pagefind index
bun preview      # Preview the built site
```

### Creating Content

```bash
# Via CLI scripts
./scripts/new-project.sh my-project acme-corp
./scripts/new-client.sh acme-corp
./scripts/new-task.sh my-project setup-repo

# Via Claude Code commands
/mybuddy.project.create
/mybuddy.client.create
/mybuddy.task.create
```

### Uploading Files to R2

```bash
./scripts/upload-file.sh my-project ./proposal.pdf proposal-v1
# ✓ Uploaded to R2: my-project/proposal-v1.pdf
# ✓ Created: content/files/my-project/proposal-v1.md
```

## Multi-Instance

The public repo contains app code only. Real business data lives in private
instance repos — one per business.

```bash
# Scaffold a new instance
bun create my-buddy

# Sync app updates to all instances
bun sync

# Manage instances
bun instances
bun instances:add madali-buddy ~/madali-buddy
```

See [Multi-Instance Architecture](docs/multi-instance.md) for details.

## Documentation

| Resource | Description |
|---|---|
| [PRD](PRD.md) | Full product requirements and module specs |
| [Entity Relationships](docs/entity-relationships.md) | Collection relationship diagram |
| [Business Lifecycle](docs/business-lifecycle.md) | Lead → client → project → invoice flow |
| [Multi-Instance](docs/multi-instance.md) | Public repo → sync → private instances |
| [Architecture Decisions](docs/decisions/) | ADRs — one file per major decision |
| [Changelog](CHANGELOG.md) | Version history |

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `j` / `k` | Navigate list items |
| `Enter` | Open selected item |
| `/` | Focus search |
| `?` | Help modal |
| `g p` | Go to Projects |
| `g t` | Go to Tasks |
| `g c` | Go to Clients |
| `g i` | Go to Invoices |
| `g k` | Go to Knowledge Base |

## License

[MIT](LICENSE)
