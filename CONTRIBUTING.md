# Contributing to my-buddy

Thanks for your interest in contributing! This guide covers the development workflow and conventions.

## Getting Started

```bash
git clone https://github.com/your-username/my-buddy.git
cd my-buddy
bun install
bun dev
```

## Project Structure

- **`src/content/`** — Markdown content collections (8 collections with Zod schemas)
- **`src/components/`** — Atomic design: `atoms/` → `molecules/` → `organisms/` → `templates/`
- **`src/pages/`** — Astro pages (dashboard + 16 collection list/detail pages)
- **`src/plugins/wiki-links/`** — Custom remark plugin for `[[slug]]` wiki-link syntax
- **`src/scripts/`** — Client-side TypeScript (keyboard nav, filtering)
- **`src/styles/global.css`** — Tailwind v4 with CSS custom properties
- **`src/lib/config.ts`** — `buddy.config.ts` schema and loader
- **`.claude/commands/`** — Claude Code custom commands (53 total)
- **`.templates/`** — Content creation templates (8 files)
- **`cli/`** — `create-my-buddy` scaffolding CLI (separate package)

## Code Style

We use [Biome](https://biomejs.dev/) for linting and formatting:

```bash
bun check        # Lint + format (auto-fix)
bun lint         # Lint only
bun format       # Format only
```

Conventions:
- 2-space indentation
- Single quotes
- No semicolons (Biome `asNeeded`)
- 100-character line width
- TypeScript strict mode

## Adding a New Collection

1. Add the Zod schema in `src/content.config.ts`
2. Create the content directory: `src/content/{collection}/`
3. Add a template: `.templates/{singular}.md`
4. Create list + detail pages: `src/pages/{collection}/index.astro` + `[...slug].astro`
5. Add sidebar link in `src/components/organisms/Sidebar.astro`
6. Add keyboard shortcut in `src/scripts/keyboard.ts`
7. Add CRUD commands in `.claude/commands/mybuddy.{singular}.*.md`
8. Update `buddy.config.ts` schema in `src/lib/config.ts`
9. Update wiki-link types in `src/plugins/wiki-links/types.ts`

## Adding a Claude Command

Create a markdown file in `.claude/commands/` with this structure:

```markdown
---
description: Short description shown in command list.
---

## Persona

Read `buddy.config.ts` at the project root. Adopt the configured persona.

**CRITICAL**: Prefix EVERY reply with the configured persona name followed by `: `.

## User Input

$ARGUMENTS

## Procedure

### 1. Step Name
...
```

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Run `bun check` to verify lint/format
4. Run `bun build` to verify the full build
5. Submit a PR with a clear description

## Reporting Issues

Use GitHub Issues with the provided templates for:
- Bug reports (include reproduction steps)
- Feature requests (describe the use case)
