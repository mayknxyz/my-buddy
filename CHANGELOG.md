# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-02-17

### Added

- Data backup/restore scripts (`scripts/data-backup.sh`,
  `scripts/data-restore.sh`) for syncing content to a private data repo
- `/mybuddy.backup` Claude Code command for manual backup
- `backup.onEnd` config option to control auto-backup on session end
  (default: `true`)
- `buddy.config.example.ts` as tracked reference config for new users
- `bun data:backup` and `bun data:restore` package scripts
- README sections: Setup, Staying Updated (fork workflow),
  and Backing Up Your Content

### Changed

- `/mybuddy.end` now auto-runs backup before session summary
  (respects `backup.onEnd` config)
- `.gitignore` excludes `src/content/**/*.md` and `buddy.config.ts`
  to keep personal data out of the public repo

## [0.1.1] - 2026-02-17

### Fixed

- Resolve 453 markdownlint violations across 56 files
  (MD013, MD038, MD040, MD041, MD032, MD060)
- Fix XSS vector in Pagefind search result rendering
- Fix hardcoded GitHub URL prefix in project detail page

### Added

- Markdownlint configuration at root, `.claude/commands/`,
  and `.templates/`
- CHANGELOG.md
- `.gitignore` entries for OS files, editor/IDE, and logs
- `package.json` metadata (description, author, license,
  repository, keywords)

### Removed

- Sample content purged from git history

## [0.1.0] - 2026-02-17

### Added

- Eight markdown-based content collections: accounts, contacts, deals,
  projects, tasks, knowledge base, meetings, and journals
- Zod schema validation for all collection frontmatter
- Wiki-link system with `[[slug]]` syntax, custom display text,
  explicit collection targeting, and automatic backlink resolution
- Remark plugin for transforming wiki links at build time
  with broken link detection
- Pre-build index generator for wiki-link and backlink resolution
- Pagefind full-text search integration with `/` keyboard shortcut
- Vim-style keyboard navigation (`g a/c/d/p/t/k/m/j` for collections,
  `j/k` for lists, `Enter` to open, `?` for help)
- Dashboard page with today's tasks, meetings, in-progress items,
  and journal prompt
- List and detail pages for all eight collections
- Configurable AI persona via `buddy.config.ts`
  (name, tone, custom prompt, boundaries)
- 53 Claude Code slash commands for CRUD operations, daily ops,
  reporting, pipeline analysis, and data hygiene
- Content templates in `.templates/` for quick entry creation
- Atomic design component structure
  (atoms, molecules, organisms, templates)
- Client-side filtering with `FilterBar` and `FilterSelect` components
- Sibling navigation between collection entries
- Breadcrumb navigation with account-scoped context
- Dark theme with CSS custom properties and WCAG AA focus indicators
- Tailwind CSS v4 with `@tailwindcss/typography` for prose styling
- Biome for linting and formatting
- CLI scaffolding tool via `bun create my-buddy`
- MIT license

[0.2.0]: https://github.com/mayknxyz/my-buddy/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/mayknxyz/my-buddy/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/mayknxyz/my-buddy/releases/tag/v0.1.0
