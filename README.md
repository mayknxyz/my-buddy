# my-buddy

Open-source personal assistant dashboard. Markdown-first, keyboard-first, built with Astro 5 + Bun + Tailwind v4.

Manage accounts, contacts, deals, projects, tasks, knowledge base, meetings, and journals —
all from markdown files with a configurable AI assistant powered by Claude Code.

## Quick Start

### Template (clone and own)

```bash
git clone https://github.com/mayknxyz/my-buddy.git
cd my-buddy
bun install
bun dev
```

### CLI (scaffold a new project)

```bash
bun create my-buddy
```

The CLI asks for your persona name, tone, which collections to enable, accent color, and sets everything up.

### Setup

Copy the example config and customize it:

```bash
cp buddy.config.example.ts buddy.config.ts
```

Your content files (`src/content/**/*.md`) and `buddy.config.ts` are gitignored
so personal data is never pushed to the public repo.

## Staying Updated

my-buddy separates **code** (tracked) from **content** (local-only). Your markdown
files and persona config stay on your machine while you pull code updates cleanly.

### Fork workflow (recommended)

```bash
# 1. Fork the repo on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/my-buddy.git
cd my-buddy
bun install

# 2. Add the upstream remote
git remote add upstream https://github.com/mayknxyz/my-buddy.git

# 3. Pull code updates anytime
git fetch upstream
git merge upstream/main
```

Your content files won't conflict because upstream has none — only `.gitkeep`
stubs in `src/content/`. If `buddy.config.example.ts` or `src/content.config.ts`
change upstream, you may need to resolve minor conflicts.

### Backing up your content (recommended)

Your content is gitignored, which means it only exists on your machine. Set up a
private data repo so you don't lose your work:

```bash
# 1. Create a private repo on GitHub (e.g., my-buddy-data), then:
git init ../my-buddy-data
cd ../my-buddy-data
git remote add origin git@github.com:YOUR_USERNAME/my-buddy-data.git

# 2. Back up your content anytime
bun data:backup

# 3. Push to your private repo
cd ../my-buddy-data && git add -A && git commit -m "backup" && git push
```

To restore on a new machine after cloning both repos:

```bash
bun data:restore
```

The scripts look for `../my-buddy-data` by default. Override with a custom path:

```bash
bun data:backup /path/to/your/data-repo
bun data:restore /path/to/your/data-repo
# or set BUDDY_DATA_REPO=/path/to/repo
```

## Features

- **8 content collections** — accounts, contacts, deals, projects, tasks, kb, meetings, journals
- **Wiki-linking** — `[[slug]]` syntax with automatic backlinks and cross-collection resolution
- **Pagefind search** — full-text search across all content (press `/`)
- **Vim-style keyboard nav** — `g p` for projects, `j/k` to navigate lists, `?` for help
- **Configurable AI persona** — name, tone (blunt/friendly/professional), boundaries
- **53 Claude Code commands** — CRUD operations + daily ops, reporting, pipeline analysis
- **Dark theme** — CSS custom properties with WCAG AA focus indicators
- **Data backup** — built-in scripts to back up content to a private repo, auto-runs on `/mybuddy.end`
- **Zero external services** — everything runs locally from markdown files

## Configuration

Edit `buddy.config.ts` at the project root:

```ts
import { defineConfig } from './src/lib/config'

export default defineConfig({
  persona: {
    name: 'Buddy',           // Your assistant's name
    tone: 'friendly',        // 'blunt' | 'friendly' | 'professional'
    customPrompt: '',        // Override persona instructions entirely
    boundaries: [],          // Lines the persona won't cross
  },
  collections: {
    accounts: true,
    contacts: true,
    deals: true,
    projects: true,
    tasks: true,
    kb: true,
    meetings: true,
    journals: true,
  },
  backup: {
    onEnd: true,              // Auto-backup when ending a session (default: true)
  },
  theme: {
    accentColor: 'indigo',
  },
})
```

## Content Collections

All data lives in `src/content/` as markdown files with YAML frontmatter.

| Collection | Slug format | Key fields |
| ---------- | --------------- | ------------------------------------------------ |
| Accounts | `kebab-case` | type, status, contact, since |
| Contacts | `kebab-case` | first_name, last_name, account, is_primary |
| Deals | `kebab-case` | account, stage, value, expected_close |
| Projects | `kebab-case` | account, status, priority, deadline |
| Tasks | `YYYY-MM-DD-name` | project, status, priority, due |
| KB | `kebab-case` | tags, updated |
| Meetings | `YYYY-MM-DD-name` | date, attendees, type, account |
| Journals | `YYYY-MM-DD` | date, mood, tags, projects |

### Wiki Links

Cross-reference entries in markdown body with `[[slug]]` syntax:

```markdown
Met with [[sarah-chen]] about the [[acme-crm-integration]] deal.
See [[meeting-best-practices]] for prep notes.
```

- `[[slug]]` — auto-resolves across collections by priority
- `[[slug|custom text]]` — custom display text
- `[[collection/slug]]` — explicit collection targeting

## Keyboard Shortcuts

| Key | Action |
| --- | ------ |
| `g z` | Go to dashboard |
| `g a/c/d/p/t/k/m/j` | Go to collection |
| `j` / `k` | Next / previous item |
| `Enter` | Open selected item |
| `/` | Search |
| `?` | Help modal |
| `Escape` | Back / close |

## Claude Code Commands

### Session

| Command | Description |
| ------- | ----------- |
| `/mybuddy.start` | Start persona session |
| `/mybuddy.end` | End session with summary + auto-backup |
| `/mybuddy.backup` | Back up content to data repo |

### CRUD (per collection)

| Command | Description |
| ------- | ----------- |
| `/mybuddy.{collection}.create` | Create new entry |
| `/mybuddy.{collection}.view [slug]` | View entry detail |
| `/mybuddy.{collection}.edit [slug]` | Edit entry fields |
| `/mybuddy.{collection}.list [filters]` | List with optional filters |
| `/mybuddy.{collection}.delete [slug]` | Delete with confirmation |

Collections: `account`, `contact`, `deal`, `project`, `task`, `kb`, `meeting`, `journal`

### Operations

| Command | Description |
| ------- | ----------- |
| `/mybuddy.standup` | Morning review |
| `/mybuddy.eod` | End of day summary |
| `/mybuddy.weekly` | Weekly review |
| `/mybuddy.monthly` | Monthly review |
| `/mybuddy.pipeline` | Deal pipeline analysis |
| `/mybuddy.focus` | Top 3 priorities |
| `/mybuddy.blocked` | Blocked task analysis |
| `/mybuddy.followup` | Follow-up suggestions |
| `/mybuddy.audit` | Data health check |
| `/mybuddy.orphans` | Broken references |
| `/mybuddy.stale` | Stale content finder |

## Development

```bash
bun dev          # Dev server at localhost:4321
bun build        # Build (wiki-link index + Astro + Pagefind)
bun preview      # Preview production build
bun lint         # Lint with Biome
bun format       # Format with Biome
bun check        # Lint + format
bun data:backup  # Back up content to data repo
bun data:restore # Restore content from data repo
```

### Architecture

```text
src/
├── content/              # 8 markdown collections
├── content.config.ts     # Zod schemas
├── components/           # Atomic design (atoms/molecules/organisms/templates)
├── pages/                # Dashboard + 16 collection pages
├── plugins/wiki-links/   # Remark plugin + index builder
├── scripts/              # Keyboard nav + client-side filtering
├── styles/global.css     # Tailwind v4 + CSS tokens
├── lib/config.ts         # buddy.config.ts schema
└── utils/display.ts      # Display name helpers
```

## License

MIT
