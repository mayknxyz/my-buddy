# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-02-22

### Added

- SOPs list page with computed review-due dates, category/status filters,
  and summary stats (active, review overdue, drafts)
- Journal list page with date-descending sort, type filter, this-week
  count, and average energy computation
- Knowledge index page aggregating knowledgeBase, knowledgeProjects, and
  knowledgeClients with scope/category filters and stale detection (>90 days)
- Stack aggregation page deriving tech usage from projects' `stack` field,
  grouped by tech name and sorted by project count
- Format helpers: `journalTypeLabel`, `sopCategoryLabel`,
  `knowledgeScopeLabel`, `knowledgeCategoryLabel`
- Keyboard shortcuts `g r` → SOPs, `g w` → Stack with help modal entries
- Tech nav group in sidebar with Stack link
- `sops` and `stack` SVG icon paths in sidebar

### Changed

- Sidebar navigation reorganized from flat section groups to discriminated-
  union layout: ungrouped links (Dashboard, Knowledge, Journal, SOPs) →
  separator → headed groups (CRM, Projects, Finance, Tech, Operations)
- Knowledge and Journal moved from Operations group to ungrouped top-level
- SOPs treated as cross-department, placed as ungrouped top-level link
- Operations group trimmed to Assets, Subscriptions, Compliance only

## [0.3.0] - 2026-02-22

### Added

- Sidebar navigation with 17 grouped links (Overview, CRM, Projects,
  Finance, Operations), mobile hamburger overlay, compact toggle with
  localStorage persistence, and FOUC prevention
- Calendar page with monthly CSS grid, meetings and task due dates,
  month navigation via `?month=YYYY-MM` query param
- SortHeader atom component for clickable column sorting
- Sortable columns on Projects and Tasks list pages
- CSV and JSON export API endpoints at `/api/export/{collection}.{csv,json}`
  for 15 collections
- Recurring task support: `recurrence` and `recurrence-end` schema fields,
  template updates, and badge display on task list
- Dashboard pinned items from `src/data/pinned.json`
- Dashboard overdue task detection with danger styling
- Calendar keyboard chord (`g v`) and help modal entry
- Vitest test infrastructure with 27 tests covering wiki-links
  build-index and remark plugin
- `test` and `test:watch` package scripts

### Changed

- `text-muted` color bumped from 0.5 to 0.6 oklch lightness for
  WCAG AA 4.5:1 contrast against surface-0
- Help modal uses z-index token (`--z-modal`) instead of hardcoded `z-50`
- Navigable item list cached with MutationObserver invalidation
  for better j/k keyboard performance
- Remark wiki-links plugin accepts injectable index for testability

## [0.2.2] - 2026-02-17

### Fixed

- Fix j/k key interception in search input — typing j or k as the first
  character no longer triggers result navigation when the input is focused
- Remove double debounce in Pagefind search — the caller already debounces,
  so the Pagefind-level debounce added unnecessary delay

## [0.2.1] - 2026-02-17

### Fixed

- Fix SIGPIPE error in `data-backup.sh` caused by `find | head -1`
  with `pipefail` enabled — replaced with `find -print -quit`

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

[0.4.0]: https://github.com/mayknxyz/my-buddy/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/mayknxyz/my-buddy/compare/v0.2.2...v0.3.0
[0.2.2]: https://github.com/mayknxyz/my-buddy/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/mayknxyz/my-buddy/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/mayknxyz/my-buddy/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/mayknxyz/my-buddy/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/mayknxyz/my-buddy/releases/tag/v0.1.0
