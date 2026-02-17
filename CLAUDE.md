# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Configurable Persona

my-buddy uses a configurable AI persona defined in `buddy.config.ts`. The persona is activated by `/mybuddy.start` and deactivated by `/mybuddy.end`.

### When the Persona is Active

**Reply format:**
- Prefix EVERY response with the configured persona name followed by `: `.

**Tone** is determined by `buddy.config.ts`:
- `blunt` — Direct. No filler. No "Great question!" Challenges complacency.
- `friendly` — Warm and encouraging, but still focused on getting things done.
- `professional` — Neutral, structured, business-appropriate.

If `persona.customPrompt` is set in config, use it as the full persona instructions. Always respect `persona.boundaries`.

**Behavior:**
- Tracks what the user said they'd do and holds them to it.
- Flags overdue items unprompted.
- Does not sugarcoat project status.
- Does not make decisions for the user. Presents the situation and asks what they want to do.
- Does not invent fake urgency.

### When the Persona is NOT Active

Outside of `/mybuddy.start` and `/mybuddy.end`, Claude Code operates normally. The persona is dormant.

## Project Overview

Open-source personal work dashboard for managing accounts, contacts, deals, projects, tasks, knowledge base, meetings, and journals. Built with Astro 5.x, TypeScript (strict), Tailwind CSS v4, and Bun. All data stored in markdown files with frontmatter. Keyboard-first, local-only.

## Commands

```bash
bun dev          # Start dev server at localhost:4321
bun build        # Build wiki-link index + Astro + Pagefind
bun preview      # Preview production build
bun lint         # Lint with Biome
bun format       # Format with Biome (auto-fix)
bun check        # Lint + format combined (auto-fix)
```

## Architecture

### Content Collections (src/content/)

Eight markdown-based collections with Zod validation in `src/content.config.ts`:

- **accounts/** — Account profiles (`kebab-case.md`)
  - Frontmatter: uid, title?, type (lead|client), status (active|inactive|potential), contact, since

- **contacts/** — People linked to accounts (`kebab-case.md`)
  - Frontmatter: uid, first_name, last_name, email?, phone?, role?, account (slug ref), is_primary

- **deals/** — Sales pipeline (`kebab-case.md`)
  - Frontmatter: uid, account (slug ref), contact? (slug ref), stage (discovery|proposal|negotiation|closed-won|closed-lost), value?, expected_close?, actual_close?, lost_reason?

- **projects/** — Project tracking (`kebab-case.md`)
  - Frontmatter: uid, account (slug ref), status (planning|in-progress|done|paused), start_date, deadline?, budget?, priority? (low|medium|high)

- **tasks/** — Task management (`YYYY-MM-DD-task-name.md`)
  - Frontmatter: uid, project (slug ref), status (todo|in-progress|done|blocked), priority (low|medium|high|urgent), due?, tags[]?

- **kb/** — Knowledge base articles (`kebab-case.md`)
  - Frontmatter: uid, tags[]?, updated?

- **meetings/** — Meeting notes (`YYYY-MM-DD-meeting-name.md`)
  - Frontmatter: uid, date, attendees[], type (discovery|standup|review|planning|retrospective|other), account? (slug ref), project? (slug ref), action_items[]?

- **journals/** — Journal entries (`YYYY-MM-DD.md`)
  - Frontmatter: uid, date, mood? (great|good|neutral|bad|terrible), tags[]?, projects[]? (slug refs)

### Component Structure (Atomic Design)

```
src/components/
├── atoms/         # Badge, FilterSelect, KeyToast, SearchInput, SiblingNav
├── molecules/     # Backlinks, Breadcrumb, FilterBar, RelatedContent
├── organisms/     # Sidebar, HelpModal
└── templates/     # BaseTemplate, PageTemplate
```

### Pages

- `/` — Dashboard with today's tasks, meetings, in-progress items, journal prompt
- `/accounts/` + `/accounts/[slug]` — Account list and detail
- `/contacts/` + `/contacts/[slug]` — Contact list and detail
- `/deals/` + `/deals/[slug]` — Deal pipeline and detail
- `/projects/` + `/projects/[slug]` — Project list and detail
- `/tasks/` + `/tasks/[slug]` — Task list and detail
- `/kb/` + `/kb/[slug]` — Knowledge base list and detail
- `/meetings/` + `/meetings/[slug]` — Meeting list and detail
- `/journals/` + `/journals/[slug]` — Journal list and detail

### Wiki Linking

Content uses `[[slug]]` syntax in markdown body. Implemented via a custom remark plugin (`src/plugins/wiki-links/`).

**Syntax:**
- `[[slug]]` — resolves via priority order (accounts > contacts > projects > deals > tasks > kb > meetings > journals)
- `[[slug|display text]]` — custom display text
- `[[collection/slug]]` — explicit collection
- `[[collection/slug|text]]` — explicit collection + custom text

**How it works:**
- Pre-build step (`bun build:index`) generates `src/data/wiki-link-index.json` and `src/data/backlink-index.json`
- Remark plugin transforms `[[slug]]` → `<a class="wiki-link">`
- Broken links render as `<span class="wiki-link-broken">`
- Backlinks show "Referenced by" section on detail pages

### Keyboard Navigation

Vim-style keyboard shortcuts (`src/scripts/keyboard.ts`):

- `g z` dashboard, `g a` accounts, `g c` contacts, `g d` deals, `g p` projects, `g t` tasks, `g k` kb, `g m` meetings, `g j` journals
- `j/k` next/prev item in lists
- `Enter` open selected item
- `/` global search (Pagefind)
- `?` help modal
- `Escape` back / close

## Content Relationships

```
accounts → contacts (via contact.account)
accounts → deals (via deal.account)
accounts → projects (via project.account)
accounts → meetings (via meeting.account)
contacts → deals (via deal.contact)
projects → tasks (via task.project)
projects → meetings (via meeting.project)
projects → journals (via journal.projects)
any → kb (via wiki links in markdown body)
```

### Deal Pipeline Workflow

Lead account → Deal (discovery → proposal → negotiation → closed-won) → Account type changes to client.
Conversion is manual (edit account frontmatter `type: lead` → `type: client`).

## Claude Commands (.claude/commands/mybuddy.*)

### CRUD Commands (5 per collection × 8 collections)

Each collection has `.create`, `.view`, `.edit`, `.list`, `.delete`:

```
/mybuddy.account.{create,view,edit,list,delete}
/mybuddy.contact.{create,view,edit,list,delete}
/mybuddy.deal.{create,view,edit,list,delete}
/mybuddy.project.{create,view,edit,list,delete}
/mybuddy.task.{create,view,edit,list,delete}
/mybuddy.kb.{create,view,edit,list,delete}
/mybuddy.meeting.{create,view,edit,list,delete}
/mybuddy.journal.{create,view,edit,list,delete}
```

### Persona Operational Commands

**Session:** `mybuddy.start`, `mybuddy.end`
**Daily Ops:** `mybuddy.standup`, `mybuddy.eod`
**Reporting:** `mybuddy.weekly`, `mybuddy.monthly`
**Data Hygiene:** `mybuddy.orphans`, `mybuddy.stale`, `mybuddy.audit`
**CRM / Pipeline:** `mybuddy.pipeline`, `mybuddy.followup`
**Planning:** `mybuddy.blocked`, `mybuddy.focus`

### Content Templates (.templates/)

Copy these files to quickly create new content:
- `account.md`, `contact.md`, `deal.md`, `project.md`
- `task.md`, `kb.md`, `meeting.md`, `journal.md`

## Configuration

`buddy.config.ts` at project root controls:

```ts
{
  persona: { name, tone, customPrompt, boundaries },
  collections: { accounts, contacts, deals, projects, tasks, kb, meetings, journals },
  theme: { accentColor }
}
```

## Technologies

- Astro 5.x (static site generator)
- TypeScript (strict mode)
- Tailwind CSS v4 with @tailwindcss/vite
- Bun (runtime + package manager)
- Biome (linter + formatter)
- Pagefind (full-text search, build-time indexing)
- Zod (schema validation)
