# my-buddy

## Product Requirements Document

> All-in-One Personal Business Management System

| Field | Value |
|---|---|
| Version | 0.3.0 |
| Status | Ready for Development |
| Date | February 2026 |
| Author | Mike Navales |
| Role | CTO, Madali LLC |
| Stack | Astro, Bun, Tailwind CSS, Cloudflare R2, Pagefind, Git |

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Module Specifications](#3-module-specifications)
4. [Data Relationships](#4-data-relationships)
5. [Dashboard & Pages](#5-dashboard--pages)
6. [UX & Interaction](#6-ux--interaction)
7. [Wiki-Linking System](#7-wiki-linking-system)
8. [Relations Helper Module](#8-relations-helper-module)
9. [Claude Code Integration](#9-claude-code-integration)
10. [CLI Scripts & Templates](#10-cli-scripts--templates)
11. [Multi-Instance Architecture](#11-multi-instance-architecture)
12. [Content Data Migration](#12-content-data-migration)
13. [Development Phases](#13-development-phases)
14. [Platform Compatibility](#14-platform-compatibility)
15. [Documentation](#15-documentation)
16. [Constraints & Decisions](#16-constraints--decisions)

---

## 1. Overview

### 1.1 Product Summary

my-buddy is a flat-file, Git-backed, all-in-one business management system built with Astro as a local dashboard. It replaces fragmented SaaS tools (CRM, project management, invoicing, HR, knowledge base) with a single version-controlled repository using Markdown files as the data layer, Cloudflare R2 for binary file storage, and an Astro-powered dashboard as the UI.

The system is designed for solo founders and small teams who want full ownership of their business data, terminal-first workflows, and zero vendor lock-in.

### 1.2 Goals

- Replace fragmented SaaS tools with a single local system
- Keep all business data version-controlled in Git
- Enable Claude Code to read and operate on business context via CLAUDE.md files
- Provide a clean Astro dashboard for visual management
- Store binary files in Cloudflare R2, metadata in Git
- Support the full business lifecycle: lead → client → project → invoice → payment
- Keyboard-first, terminal-first UX
- Support multiple instances for separate businesses via scaffolding CLI
- Open-source the app while keeping business data private

### 1.3 Non-Goals

- Not a multi-tenant SaaS product
- Not a mobile-first app
- Not a real-time collaboration tool
- No database — Markdown files are the data source of truth
- No authentication for v0.3.0 — dashboard runs locally via `astro dev`

### 1.4 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Astro 5.x | Dashboard UI, static site generation |
| Content | Astro Content Collections | Typed, queryable Markdown collections |
| Styling | Tailwind CSS v4 | Utility-first styling with CSS custom properties |
| Search | Pagefind | Static full-text search across all collections |
| Cross-Referencing | Remark wiki-links plugin | `[[slug]]` syntax with backlink index |
| File Storage | Cloudflare R2 | Binary files (PDFs, images, contracts) |
| CLI Upload | Wrangler CLI | R2 file uploads from terminal |
| Version Control | Git + GitHub | All MD content versioned |
| AI Context | Claude Code + CLAUDE.md | AI-assisted operations per module |
| Runtime / Package Manager | Bun | Fast runtime, package management, script execution |
| Linting | Biome | TypeScript/JS formatting and linting |

---

## 2. Architecture

### 2.1 Repository Structure

The repository is a monorepo with two primary layers: the Astro app in `src/` and the flat-file content in `content/`. Binary files are stored externally in Cloudflare R2 and referenced by URL in Markdown frontmatter. Components follow atomic design. Content templates live in `.templates/`.

```
my-buddy/
├── CLAUDE.md
├── buddy.config.ts              # gitignored — instance-specific persona + R2 config
├── buddy.config.example.ts      # tracked — reference config for new instances
├── buddy.instances.json
├── .claude/
│   ├── settings.json
│   └── commands/
│       └── *.md
├── .templates/
│   ├── project.md
│   ├── client.md
│   ├── contact.md
│   ├── task.md
│   ├── meeting.md
│   ├── interaction.md
│   ├── lead.md
│   ├── opportunity.md
│   ├── proposal.md
│   ├── contract.md
│   ├── invoice.md
│   ├── payment.md
│   ├── expense.md
│   ├── budget.md
│   ├── timelog.md
│   ├── team.md
│   ├── role.md
│   ├── leave.md
│   ├── hardware.md
│   ├── software.md
│   ├── domain.md
│   ├── server.md
│   ├── account.md
│   ├── subscription.md
│   ├── blog.md
│   ├── social.md
│   ├── newsletter.md
│   ├── campaign.md
│   ├── goal.md
│   ├── idea.md
│   ├── journal.md
│   ├── sop.md
│   ├── compliance.md
│   ├── tax.md
│   ├── file.md
│   └── kb.md
├── src/
│   ├── content.config.ts
│   ├── pages/
│   ├── components/
│   │   ├── atoms/
│   │   ├── molecules/
│   │   ├── organisms/
│   │   └── templates/
│   ├── lib/
│   │   ├── relations.ts
│   │   └── config.ts
│   ├── plugins/
│   │   └── wiki-links/
│   │       ├── remark-plugin.ts
│   │       └── build-index.ts
│   ├── data/
│   │   ├── wiki-link-index.json
│   │   └── backlink-index.json
│   ├── scripts/
│   │   ├── keyboard.ts
│   │   └── filtering.ts
│   ├── styles/
│   │   └── global.css
│   └── utils/
├── docs/
│   ├── decisions/                # ADRs — one file per architectural decision
│   ├── entity-relationships.md   # Mermaid diagram
│   ├── business-lifecycle.md     # Mermaid diagram
│   └── multi-instance.md         # Mermaid diagram
├── content.example/          # sample data for scaffolding + demo
│   └── ...                   # mirrors content/ structure with fake data
├── content/                  # gitignored in public repo, tracked in instances
│   ├── projects/
│   ├── tasks/
│   ├── clients/
│   ├── contacts/
│   ├── leads/
│   ├── opportunities/
│   ├── interactions/
│   ├── meetings/
│   ├── contracts/
│   ├── proposals/
│   ├── invoices/
│   ├── payments/
│   ├── expenses/
│   ├── budgets/
│   ├── tax/
│   ├── timelog/
│   ├── team/
│   ├── roles/
│   ├── leave/
│   ├── sops/
│   ├── subscriptions/
│   ├── assets/
│   │   ├── hardware/
│   │   ├── software/
│   │   ├── domains/
│   │   ├── servers/
│   │   └── accounts/
│   ├── marketing/
│   │   ├── blog/
│   │   ├── social/
│   │   └── newsletter/
│   ├── campaigns/
│   ├── goals/
│   ├── ideas/
│   ├── journal/
│   ├── compliance/
│   ├── files/
│   └── knowledge/
│       ├── projects/
│       ├── clients/
│       └── base/
│           ├── dev/
│           ├── business/
│           ├── tools/
│           └── personal/
└── scripts/
    ├── new-project.sh
    ├── new-client.sh
    ├── new-contact.sh
    ├── new-task.sh
    ├── upload-file.sh
    ├── log-time.sh
    ├── migrate-v1.sh
    ├── sync-upstream.sh
    ├── instances.sh
    └── sync-obsidian.sh
```

### 2.2 Content Collections

Every module maps to an Astro Content Collection defined in `src/content.config.ts` with a Zod schema. Each collection uses a folder-based namespace strategy where the top-level subfolder is the primary entity slug (project, client, or standalone).

| Collection | Namespace Key | Description |
|---|---|---|
| projects | project slug | Core business projects |
| tasks | project slug | Tasks scoped to projects |
| meetings | project slug | Meeting notes with agenda and action items |
| interactions | client slug | Client touchpoints and communication logs |
| timelog | project slug | Billable and non-billable time entries |
| budgets | project slug / general | Planned vs actual spend per project |
| knowledge/projects | project slug | Project-specific technical decisions and notes |
| files | project or client slug | R2 file metadata (URL references) |
| clients | client slug | Client profiles and company info |
| contacts | client slug | Contacts scoped under client |
| contracts | client slug | Service agreements with expiry tracking |
| proposals | client slug | Versioned proposals linked to opportunities |
| invoices | client slug | Invoices with status and R2 PDF reference |
| payments | client slug | Payments received against invoices |
| knowledge/clients | client slug | Client preferences and historical context |
| leads | lead slug | Top of funnel, pre-qualification |
| opportunities | opportunity slug | Qualified leads with pipeline stages |
| expenses | project slug / general | Project or general business expenses |
| tax | year | Annual tax periods and deductible tracking |
| team | member slug | Internal team members |
| roles | role slug | Job descriptions and responsibilities |
| leave | member slug | Time-off records per team member |
| sops | standalone | Standard operating procedures |
| subscriptions | standalone | Recurring SaaS subscriptions |
| assets/hardware | asset slug | Physical devices and equipment |
| assets/software | asset slug | Owned software licenses |
| assets/domains | domain slug | Domain names and expiry |
| assets/servers | server slug | VPS and server inventory |
| assets/accounts | account slug | Service account metadata |
| marketing/blog | post slug | Blog posts pipeline |
| marketing/social | post slug | Social media content per platform |
| marketing/newsletter | issue slug | Newsletter issues with send metrics |
| campaigns | campaign slug | Marketing campaign groupings |
| goals | quarter slug | OKRs per quarter |
| ideas | idea slug | Raw ideas before becoming projects |
| journal | date | Daily/weekly/monthly reflections |
| compliance | standalone | Legal and data handling policies |
| knowledge/base | category/topic | Global reusable knowledge base |

### 2.3 Namespace Strategy

The folder name within each collection acts as the foreign key. Relationships are resolved at query time using slug prefix matching or frontmatter references. This eliminates the need for a database while keeping data queryable.

**`index.md` vs flat file rule:** Entities that serve as parent namespaces for child data use `{slug}/index.md` (projects, clients, leads, opportunities, campaigns, goals, budgets, tax). Leaf entities that live under a parent namespace use flat files: `{parent-slug}/{entity-slug}.md` (contacts, tasks, invoices, payments, contracts, proposals, meetings, interactions, timelog, expenses, leave). Standalone entities with no parent use flat files at the collection root: `{slug}.md` (team, roles, subscriptions, sops, compliance, ideas, journal).

- `projects/test-project/` → `tasks/test-project/`, `meetings/test-project/`, `timelog/test-project/`
- `clients/acme-corp/` → `contacts/acme-corp/`, `invoices/acme-corp/`, `contracts/acme-corp/`
- `leads/` → `opportunities/` → `clients/` (pipeline conversion)
- `opportunities/` references `proposals/`, `proposals/` referenced by `invoices/`

### 2.4 File Storage (Cloudflare R2)

Binary files (PDFs, images, signed contracts) are stored in a Cloudflare R2 bucket. The public URL is stored in the Markdown frontmatter of the corresponding metadata file. The repo never stores binary blobs.

| R2 Path Pattern | Example | Used By |
|---|---|---|
| `/{project-slug}/{filename}` | `/test-project/proposal-v1.pdf` | files, proposals |
| `/{client-slug}/{filename}` | `/acme-corp/nda.pdf` | contracts, invoices |

---

## 3. Module Specifications

### 3.1 CRM — Leads, Opportunities, Clients, Contacts, Interactions

#### 3.1.1 Leads

Leads represent the top of the sales funnel. A lead is any potential client that has not yet been qualified.

```yaml
# content/leads/potential-client/index.md
---
name: Potential Client
status: new               # new | contacted | qualified | disqualified
source: referral          # referral | social | inbound | cold
contact: john-doe         # slug ref to contacts/
notes: ""
---
```

#### 3.1.2 Opportunities

Opportunities are qualified leads with a defined pipeline stage, value, and expected close date.

```yaml
# content/opportunities/acme-corp-saas-setup/index.md
---
title: Acme Corp SaaS Setup
lead: potential-client
contact: john-doe
value: 5000
probability: 70
stage: proposal-sent      # discovery | scoping | proposal-sent | negotiation | closed-won | closed-lost
expected-close: 2026-03-15
proposal: acme-corp/proposal-v1
---
```

#### 3.1.3 Clients

A client is a converted opportunity. Clients are the parent namespace for contacts, contracts, proposals, and invoices.

```yaml
# content/clients/acme-corp/index.md
---
name: Acme Corp
status: active            # active | inactive | churned
projects: [test-project]
industry: Technology
website: https://acme.com
---
```

#### 3.1.4 Contacts

Contacts are individual people scoped under a client. A client can have multiple contacts.

```yaml
# content/contacts/acme-corp/john-doe.md
---
name: John Doe
client: acme-corp
role: CEO
email: john@acme.com
phone: +1234567890
status: active            # active | inactive
projects: [test-project]
---
```

#### 3.1.5 Interactions

Interactions are the CRM's activity log — every touchpoint with a client or contact. The `direction` field indicates who initiated. The `follow-up` date feeds into dashboard reminders.

```yaml
# content/interactions/acme-corp/2026-02-10-kickoff-call.md
---
title: Kickoff Call with John
client: acme-corp
contact: john-doe
project: test-project
type: call                # call | email | chat | in-person | async
direction: outbound       # inbound | outbound
date: 2026-02-10
summary: Discussed scope and timeline, agreed on Phase 1 deliverables
follow-up: 2026-02-15
tags: [scope, onboarding]
---
```

---

### 3.2 Projects & Tasks

#### 3.2.1 Projects

Projects are the central entity that most other collections reference. The project slug is the primary namespace key.

```yaml
# content/projects/test-project/index.md
---
title: Test Project
status: active            # active | paused | completed | archived
client: acme-corp
stack: [SvelteKit, Supabase]
priority: high            # high | medium | low
start: 2026-02-01
end: 2026-06-01
budget: 10000
tags: [saas]
---
```

#### 3.2.2 Tasks

Tasks live in subfolders named after their parent project. This ensures uniqueness — two projects can have a task named `initiate-project` without collision.

```yaml
# content/tasks/test-project/initiate-project.md
---
title: Initiate Project
project: test-project
status: doing             # todo | doing | done | blocked | deferred
assignee: mike
priority: high
due: 2026-02-15
sprint: 1
tags: [setup]
---
```

#### 3.2.3 Meetings

Each meeting occurrence gets its own file. Recurring meetings are linked via `recurring-id` — no recurrence engine needed. Use CLI scripts or templates to stamp new files from a series.

```yaml
# content/meetings/test-project/2026-02-10-kickoff.md
---
title: Project Kickoff
project: test-project
client: acme-corp
contacts: [john-doe, jane-smith]
date: 2026-02-10
duration: 60
type: kickoff             # kickoff | standup | review | demo | internal
agenda:
  - Intro
  - Scope review
  - Next steps
action-items:
  - task: initiate-project
    owner: mike
recurring-id: ~           # optional — groups recurring series (e.g., weekly-standup)
---
```

---

### 3.3 Finance — Proposals, Invoices, Payments, Expenses, Budgets, Tax

#### 3.3.1 Proposals

```yaml
# content/proposals/acme-corp/proposal-v1.md
---
title: Project Proposal v1
client: acme-corp
project: test-project
date: 2026-02-01
value: 5000
status: draft             # draft | sent | accepted | rejected
file: https://pub-xxx.r2.dev/acme-corp/proposal-v1.pdf
---
```

#### 3.3.2 Invoices

```yaml
# content/invoices/acme-corp/inv-001.md
---
id: INV-001
client: acme-corp
project: test-project
date: 2026-02-10
due: 2026-02-28
amount: 2500
status: sent              # draft | sent | paid | overdue | cancelled
file: https://pub-xxx.r2.dev/acme-corp/inv-001.pdf
---
```

#### 3.3.3 Payments

```yaml
# content/payments/acme-corp/pay-001.md
---
id: PAY-001
client: acme-corp
invoice: inv-001
amount: 2500
date: 2026-02-15
method: bank-transfer     # bank-transfer | paypal | stripe | cash
status: confirmed         # pending | confirmed | failed
---
```

#### 3.3.4 Expenses

```yaml
# content/expenses/test-project/figma-subscription.md
---
title: Figma Subscription
project: test-project
category: software        # software | hardware | travel | marketing | office | other
amount: 15
date: 2026-02-01
recurring: monthly        # monthly | annual | one-time
receipt: https://pub-xxx.r2.dev/test-project/figma-receipt.pdf
---
```

**General (non-project) expenses** use `general/` as the folder namespace:

```yaml
# content/expenses/general/coworking-february.md
---
title: Coworking Space — February
project: ~                # null for general business expenses
category: office
amount: 200
date: 2026-02-01
recurring: monthly
receipt: https://pub-xxx.r2.dev/general/coworking-feb-2026.pdf
---
```

#### 3.3.5 Budgets

```yaml
# content/budgets/test-project/index.md
---
project: test-project
period: 2026
planned: 5000
spent: 1200
currency: USD
---
```

**General (non-project) budgets** use `general/` as the folder namespace:

```yaml
# content/budgets/general/index.md
---
project: ~                # null for general business budget
period: 2026
planned: 12000
spent: 3400
currency: USD
---
```

#### 3.3.6 Tax

```yaml
# content/tax/2026/index.md
---
period: 2026
status: in-progress       # in-progress | filed | audited
deductibles: [subscriptions, hardware, expenses]
total-income: 0
total-expenses: 0
filed-date: ~
---
```

---

### 3.4 Contracts

```yaml
# content/contracts/acme-corp/contract-v1.md
---
title: Service Agreement v1
client: acme-corp
project: test-project
type: service-agreement   # service-agreement | nda | msa | sow
signed: 2026-02-01
expires: 2027-02-01
value: 10000
status: active            # draft | sent | signed | expired | terminated
file: https://pub-xxx.r2.dev/acme-corp/contract-v1.pdf
---
```

---

### 3.5 Time Tracking

```yaml
# content/timelog/test-project/2026-02-10.md
---
project: test-project
task: initiate-project
member: mike              # slug ref to team/ collection
date: 2026-02-10
hours: 3.5
billable: true
description: Initial project setup and repo scaffolding
---
```

---

### 3.6 Team & HR

#### 3.6.1 Team

```yaml
# content/team/mike.md
---
name: Mike Navales
role: cto
email: mike@madali.com
status: active
skills: [SvelteKit, Astro, DevOps]
start-date: 2023-01-01
---
```

#### 3.6.2 Roles

Roles are reusable job definitions. Team members reference roles via their `role` field. The `status` field helps track hiring needs.

```yaml
# content/roles/frontend-developer.md
---
title: Frontend Developer
department: engineering   # engineering | design | marketing | operations
level: mid               # junior | mid | senior | lead
responsibilities:
  - Build and maintain UI components
  - Write tests for frontend features
skills: [SvelteKit, TypeScript, CSS]
status: open             # open | filled | closed
---
```

#### 3.6.3 Leave

```yaml
# content/leave/mike/2026-02-vacation.md
---
member: mike
type: vacation            # vacation | sick | holiday | unpaid
start: 2026-02-20
end: 2026-02-25
days: 5
status: approved          # pending | approved | rejected
---
```

---

### 3.7 Assets

#### 3.7.1 Hardware

```yaml
# content/assets/hardware/macbook-pro-2023.md
---
title: MacBook Pro 2023
type: laptop
serial: XXXX
purchased: 2023-06-01
cost: 2500
status: active            # active | storage | retired | sold
assigned-to: [mike]
warranty-until: 2026-06-01
---
```

#### 3.7.2 Software

```yaml
# content/assets/software/jetbrains-all-products.md
---
title: JetBrains All Products Pack
vendor: JetBrains
license-type: subscription  # subscription | perpetual | open-source | freemium
seats: 1
cost: 250
billing: annual
purchased: 2025-06-01
expires: 2026-06-01
assigned-to: [mike]
status: active            # active | expired | cancelled
---
```

#### 3.7.3 Domains

```yaml
# content/assets/domains/madali.com.md
---
title: madali.com
registrar: Cloudflare
registered: 2023-01-01
expires: 2026-01-01
auto-renew: true
cost: 15
project: madali-saas
status: active
---
```

#### 3.7.4 Servers

```yaml
# content/assets/servers/vps-hetzner-01.md
---
title: Hetzner VPS 01
provider: Hetzner
ip: 123.456.789
specs: 4vCPU 8GB RAM 80GB
cost: 20
billing: monthly
projects: [test-project, madali-saas]
status: active
---
```

#### 3.7.5 Accounts

```yaml
# content/assets/accounts/cloudflare-main.md
---
title: Cloudflare Main Account
url: https://dash.cloudflare.com
credentials: stored-in-vault
owner: mike
projects: [test-project, madali-saas]
services: [R2, Workers, DNS]
---
```

---

### 3.8 Subscriptions

```yaml
# content/subscriptions/figma.md
---
title: Figma
category: design          # design | dev | marketing | productivity | infra | other
cost: 15
billing: monthly          # monthly | annual
renewal: 2026-03-01
status: active            # active | cancelled | paused
url: https://figma.com
---
```

---

### 3.9 Knowledge Base

The knowledge base has three layers: project-scoped, client-scoped, and global base. All use tags for cross-referencing. The global base is organized by category: dev, business, tools, and personal.

```yaml
# content/knowledge/base/dev/sveltekit/auth-patterns.md
---
title: SvelteKit Auth Patterns
category: dev                   # must match parent folder — included for query convenience
tags: [sveltekit, auth, supabase]
related:
  - dev/sveltekit/rls-setup
  - tools/supabase
projects: [test-project]
last-reviewed: 2026-02-10
---
```

---

### 3.10 Strategic — Goals, Ideas, Journal

#### 3.10.1 Goals (OKRs)

```yaml
# content/goals/2026-q1/index.md
---
title: Q1 2026 Goals
period: 2026-q1
status: in-progress       # not-started | in-progress | achieved | missed
okrs:
  - objective: Launch Madali SaaS
    kr:
      - metric: 10 paying customers
        progress: 3
      - metric: MRR $2000
        progress: 600
projects: [madali-saas]
---
```

#### 3.10.2 Ideas

```yaml
# content/ideas/gh-tui-enhancer.md
---
title: gh TUI Enhancer
status: exploring          # raw | exploring | validated | shelved
effort: medium
potential: high
tags: [cli, tooling, open-source]
related-project: ~
---
```

#### 3.10.3 Journal

Journal entries support daily, weekly, and monthly cadences. Structured fields make entries queryable for patterns over time. The Markdown body is the actual journal content.

```yaml
# content/journal/2026-02-10.md
---
date: 2026-02-10
type: daily               # daily | weekly | monthly
energy: high              # high | medium | low
highlights:
  - Shipped auth module
  - Closed Acme Corp deal
blockers:
  - Waiting on DNS propagation
tags: [shipping, sales]
---
```

---

### 3.11 Marketing — Content, Campaigns

#### 3.11.1 Blog Content

```yaml
# content/marketing/blog/first-post.md
---
title: First Post
status: draft             # draft | review | scheduled | published
published: ~
campaign: q1-2026-launch
tags: [intro, saas]
url: ~
---
```

#### 3.11.2 Social Content

```yaml
# content/marketing/social/linkedin-launch-announcement.md
---
title: Launch Announcement
platform: linkedin        # linkedin | twitter | bluesky | threads
status: draft             # draft | scheduled | published
scheduled: 2026-03-01
published: ~
campaign: q1-2026-launch
tags: [launch, saas]
url: ~
---
```

#### 3.11.3 Newsletter Content

```yaml
# content/marketing/newsletter/issue-001.md
---
title: "Issue #001 — Hello World"
status: draft             # draft | review | scheduled | sent
scheduled: 2026-03-01
sent: ~
campaign: q1-2026-launch
subscribers: 0
open-rate: ~
platform: buttondown      # buttondown | convertkit | resend | manual
url: ~
---
```

#### 3.11.4 Campaigns

```yaml
# content/campaigns/q1-2026-launch/index.md
---
title: Q1 2026 Launch
goal: lead-generation     # lead-generation | brand-awareness | retention | launch
status: active
start: 2026-01-01
end: 2026-03-31
budget: 500
channels: [blog, linkedin, newsletter]
marketing: [blog/first-post]
leads-generated: 0
---
```

---

### 3.12 Compliance

Compliance documents track legal policies with review cycles. `review-due` feeds into the expiry alerts widget alongside domains and contracts.

```yaml
# content/compliance/privacy-policy.md
---
title: Privacy Policy
type: privacy-policy      # privacy-policy | terms-of-service | dpa | cookie-policy | acceptable-use
status: active            # draft | active | archived
effective: 2026-01-01
review-due: 2027-01-01
applies-to: [madali-saas]
file: https://pub-xxx.r2.dev/compliance/privacy-policy.pdf
---
```

---

### 3.13 Files (R2 Metadata)

Files metadata entries are the glue between Cloudflare R2 and Git. They are auto-created by the upload script. The folder namespace ties each file to its parent entity.

```yaml
# content/files/test-project/proposal-v1.md
---
title: Proposal v1
url: https://pub-xxx.r2.dev/test-project/proposal-v1.pdf
type: pdf                 # pdf | image | document | spreadsheet | other
size: 245000              # bytes
uploaded: 2026-02-10
uploaded-by: mike
tags: [proposal]
---
```

### 3.14 SOPs (Standard Operating Procedures)

SOPs are standalone documents that codify repeatable processes. They have no parent namespace — each SOP lives at the collection root.

```yaml
# content/sops/deploy-to-production.md
---
title: Deploy to Production
category: engineering     # engineering | operations | sales | onboarding | other
status: active            # draft | active | archived
owner: mike               # slug ref to team/ collection
last-reviewed: 2026-02-01
review-cycle: quarterly   # monthly | quarterly | annual
tags: [deployment, ci-cd]
---
```

---

## 4. Data Relationships

### 4.1 Relationship Map

| From | Field | To | Cardinality |
|---|---|---|---|
| opportunities | lead | leads | Many-to-One |
| opportunities | proposal | proposals | One-to-One |
| projects | client | clients | Many-to-One |
| tasks | project (folder) | projects | Many-to-One |
| contacts | client (folder) | clients | Many-to-One |
| contacts | projects[] | projects | Many-to-Many |
| contracts | client (folder) | clients | Many-to-One |
| proposals | client (folder) | clients | Many-to-One |
| invoices | client (folder) | clients | Many-to-One |
| invoices | project | projects | Many-to-One |
| payments | invoice | invoices | Many-to-One |
| timelog | project (folder) | projects | Many-to-One |
| timelog | task | tasks | Many-to-One |
| timelog | member | team | Many-to-One |
| meetings | project (folder) | projects | Many-to-One |
| meetings | contacts[] | contacts | Many-to-Many |
| interactions | client (folder) | clients | Many-to-One |
| interactions | contact | contacts | Many-to-One |
| interactions | project | projects | Many-to-One |
| expenses | project (folder) | projects | Many-to-One |
| files | project/client (folder) | projects/clients | Many-to-One |
| campaigns | marketing[] | marketing | One-to-Many |
| goals | projects[] | projects | Many-to-Many |
| assets | assigned-to[] | team | Many-to-Many |
| leave | member (folder) | team | Many-to-One |
| sops | owner | team | Many-to-One |
| compliance | applies-to[] | projects | Many-to-Many |
| roles | (referenced by) | team.role | One-to-Many |

**Note on asymmetric references:** Some relationships are intentionally one-directional. For example, `contacts.projects[]` references projects, but `projects` does not have a `contacts[]` field — contacts for a project are resolved at query time via `contacts.filter(c => c.data.projects.includes(slug))`. This avoids maintaining both sides of the relationship in flat files.

### 4.2 Query Patterns

**Project dashboard query — fetch all related data for a single project:**

```ts
const slug = 'test-project'

{
  project:      projects.find(p => p.slug === `${slug}/index`),
  tasks:        tasks.filter(t => t.slug.startsWith(`${slug}/`)),
  meetings:     meetings.filter(m => m.slug.startsWith(`${slug}/`)),
  timelog:      timelog.filter(t => t.slug.startsWith(`${slug}/`)),
  files:        files.filter(f => f.slug.startsWith(`${slug}/`)),
  invoices:     invoices.filter(i => i.data.project === slug),
  client:       clients.find(c => c.slug === `${project.data.client}/index`),
  contacts:     contacts.filter(c => c.data.projects?.includes(slug)),
  interactions: interactions.filter(i => i.data.project === slug),
  knowledge:    knowledge.filter(k =>
                  k.slug.startsWith(`projects/${slug}/`) ||
                  k.data.tags?.includes(slug)
                ),
}
```

**Client dashboard query:**

```ts
const clientSlug = 'acme-corp'

{
  client:       clients.find(c => c.slug === `${clientSlug}/index`),
  contacts:     contacts.filter(c => c.slug.startsWith(`${clientSlug}/`)),
  contracts:    contracts.filter(c => c.slug.startsWith(`${clientSlug}/`)),
  invoices:     invoices.filter(i => i.slug.startsWith(`${clientSlug}/`)),
  interactions: interactions.filter(i => i.slug.startsWith(`${clientSlug}/`)),
  projects:     projects.filter(p => p.data.client === clientSlug),
}
```

**Expiry alerts:**

```ts
const in30days = new Date(Date.now() + 30 * 86400000)

const expiring = [
  ...domains.filter(d => new Date(d.data.expires) <= in30days),
  ...contracts.filter(c => new Date(c.data.expires) <= in30days),
  ...subscriptions.filter(s => new Date(s.data.renewal) <= in30days),
  ...software.filter(s => new Date(s.data.expires) <= in30days),
  ...compliance.filter(c => new Date(c.data['review-due']) <= in30days),
]
```

---

## 5. Dashboard & Pages

### 5.1 Routes

| Route | Component | Description |
|---|---|---|
| `/` | index.astro | Dashboard home with summary widgets |
| `/projects` | projects/index.astro | All projects list |
| `/projects/[slug]` | projects/[slug].astro | Single project view with relations |
| `/tasks` | tasks/index.astro | Kanban board across all projects |
| `/clients` | clients/index.astro | Client list |
| `/clients/[slug]` | clients/[slug].astro | Client profile with contacts and invoices |
| `/contacts/[slug]` | contacts/[slug].astro | Contact profile with interactions |
| `/leads` | leads/index.astro | Lead list |
| `/opportunities` | opportunities/index.astro | Pipeline board by stage |
| `/interactions` | interactions/index.astro | Activity log with filters |
| `/invoices` | invoices/index.astro | All invoices with status filter |
| `/invoices/[slug]` | invoices/[slug].astro | Single invoice with payment status |
| `/payments` | payments/index.astro | Payment history |
| `/expenses` | expenses/index.astro | Expense tracker |
| `/timelog` | timelog/index.astro | Time entries with project filter |
| `/team` | team/index.astro | Team members |
| `/assets` | assets/index.astro | Asset inventory with tabs by type |
| `/subscriptions` | subscriptions/index.astro | Subscriptions with renewal alerts |
| `/knowledge` | knowledge/index.astro | Knowledge base with category filter |
| `/knowledge/[...slug]` | knowledge/[...slug].astro | Article view with backlinks |
| `/goals` | goals/index.astro | OKR tracker per quarter |
| `/ideas` | ideas/index.astro | Ideas board |
| `/campaigns` | campaigns/index.astro | Campaign tracker |
| `/sops` | sops/index.astro | SOP library |
| `/journal` | journal/index.astro | Daily journal list |
| `/compliance` | compliance/index.astro | Compliance documents |

### 5.2 Dashboard Home Widgets

- Active projects count and quick links
- Open tasks due this week
- Unpaid invoices with total amount outstanding
- Upcoming contract and domain expiries (within 30 days)
- Upcoming subscription renewals (within 30 days)
- Recent interactions and meetings
- Pipeline summary: leads → opportunities → clients
- Revenue this month vs last month
- Time logged this week

---

## 6. UX & Interaction

### 6.1 Keyboard Navigation

All list and detail pages support Vim-style keyboard shortcuts. Navigation is handled by a client-side `keyboard.ts` script.

| Shortcut | Action |
|---|---|
| `j` / `k` | Navigate next / previous item in list |
| `Enter` | Open selected item |
| `/` | Focus search input |
| `Escape` | Close modal, deselect, or go back |
| `?` | Open help modal with all shortcuts |

**Collection shortcuts (two-key chord: `g` + key):**

| Chord | Route |
|---|---|
| `g z` | Dashboard home (`/`) |
| `g p` | Projects |
| `g t` | Tasks |
| `g c` | Clients |
| `g l` | Leads |
| `g o` | Opportunities |
| `g i` | Invoices |
| `g m` | Meetings |
| `g k` | Knowledge base |
| `g j` | Journal |
| `g a` | Assets |

### 6.2 Search

Pagefind provides static full-text search across all collections. It indexes the built site at build time and requires zero server infrastructure.

- Triggered by `/` key or clicking the search input
- Searches across all markdown content and frontmatter
- Results link directly to detail pages
- Per-page filtering by status, tags, and date is available on all list pages

**Build integration:**

```bash
bun run build  # runs: build-wiki-index && astro build && pagefind --site dist
```

### 6.3 Theming

The dashboard uses a dark theme with CSS custom properties for accent color customization. Colors are defined in `src/styles/global.css` using Tailwind CSS v4's `@theme` directive.

- **Default theme:** Dark with indigo accent
- **Accent options:** indigo, blue, emerald, amber, rose, violet
- **Focus indicators:** WCAG AA compliant visible focus rings
- **Typography:** `@tailwindcss/typography` for rendered Markdown content

### 6.4 Component Architecture (Atomic Design)

Components follow atomic design principles:

| Layer | Directory | Examples |
|---|---|---|
| Atoms | `src/components/atoms/` | Badge, FilterSelect, SearchInput, KeyToast |
| Molecules | `src/components/molecules/` | Breadcrumb, FilterBar, Backlinks, RelatedContent |
| Organisms | `src/components/organisms/` | Sidebar, HelpModal, DashboardWidgets |
| Templates | `src/components/templates/` | BaseTemplate, PageTemplate |

---

## 7. Wiki-Linking System

### 7.1 Syntax

Wiki-links provide lightweight cross-referencing in Markdown content bodies using `[[double-bracket]]` syntax. A custom remark plugin transforms these into HTML links at build time.

| Syntax | Resolves To | Example |
|---|---|---|
| `[[slug]]` | Auto-resolved by priority | `[[acme-corp]]` → `/clients/acme-corp` |
| `[[slug\|display text]]` | Auto-resolved + custom label | `[[acme-corp\|Acme]]` → `<a>Acme</a>` |
| `[[collection/slug]]` | Explicit collection | `[[projects/test-project]]` |
| `[[collection/slug\|text]]` | Explicit + custom label | `[[projects/test-project\|Test]]` |

> **Note:** The `|` character separates slug from display text in wiki-links. The backslash (`\|`) in the table above is Markdown table escaping — the actual syntax in content files is `[[slug|display text]]` without a backslash.

**Resolution priority** (when no collection prefix): clients > contacts > projects > tasks > leads > opportunities > kb > meetings > journal

### 7.2 Build Process

1. `bun src/plugins/wiki-links/build-index.ts` scans all collections and generates:
   - `src/data/wiki-link-index.json` — slug → route mapping
   - `src/data/backlink-index.json` — reverse reference index
2. The remark plugin (`src/plugins/wiki-links/remark-plugin.ts`) transforms `[[...]]` to:
   - `<a class="wiki-link" href="/collection/slug">` for valid links
   - `<span class="wiki-link-broken">` for unresolved links
3. Detail pages display a "Referenced by" section using the backlink index

### 7.3 Usage in Content

Wiki-links can be used in any Markdown body across all collections:

```markdown
# Meeting Notes

Discussed [[test-project]] timeline with [[john-doe|John]].
Follow up on [[proposals/acme-corp/proposal-v1|the proposal]] by Friday.
See [[kb/dev/sveltekit/auth-patterns]] for implementation reference.
```

---

## 8. Relations Helper Module

A central `src/lib/relations.ts` module provides typed helper functions for resolving cross-collection references. All dashboard pages and components import from this module.

| Function | Returns | Description |
|---|---|---|
| `getProjectWithRelations(slug)` | Project + tasks, meetings, client, contacts, files, invoices, timelog, interactions | Full project context |
| `getClientWithRelations(slug)` | Client + projects, contacts, contracts, invoices, interactions | Full client context |
| `getOpportunityPipeline()` | Grouped opportunities by stage | Sales pipeline view |
| `getInvoiceSummary()` | Totals by status: draft, sent, paid, overdue | Finance overview |
| `getExpiringAssets(days)` | Domains, contracts, subscriptions, software, compliance expiring within N days | Expiry alerts |
| `getProjectBillableHours(slug)` | Total billable vs non-billable hours | Invoicing helper |
| `getContactWithRelations(slug)` | Contact + client, projects, interactions | Contact context |
| `getKnowledgeForProject(slug)` | Project-scoped + tagged knowledge articles | Contextual KB |

---

## 9. Claude Code Integration

CLAUDE.md files at the repo root and within each project folder provide Claude Code with the context it needs to operate on business data. This mirrors the Claude Projects feature but within a single Git repo. Claude Code slash commands (`.claude/commands/`) provide a CRUD and operations interface over all collections.

### 9.1 CLAUDE.md Structure

| File | Scope | Contents |
|---|---|---|
| `CLAUDE.md` (root) | Global | Stack, conventions, collection schemas, workflow |
| `content/projects/test-project/CLAUDE.md` | Per project | Stack, current sprint, decisions, conventions |
| `content/clients/acme-corp/CLAUDE.md` | Per client | Client preferences, tone, history |

### 9.2 Root CLAUDE.md Template

```markdown
# my-buddy

## Stack
Astro 5, Tailwind CSS v4, Bun, Cloudflare R2, Wrangler, Biome, Pagefind

## Collections
- projects/ → project slug namespace
- tasks/ → project slug namespace
- clients/ → client slug namespace
- contacts/ → client slug namespace
[...all collections]

## Conventions
- Slugs: kebab-case, stable, never rename after creation
- Dates: ISO format YYYY-MM-DD
- All required frontmatter fields must be present
- Binary files go to R2, never committed to repo
- Wiki-links: [[slug]] or [[collection/slug]] in markdown bodies

## R2
- Bucket: my-buddy-files
- URL pattern: https://pub-xxx.r2.dev/{namespace}/{filename}

## Scripts
- ./scripts/upload-file.sh <namespace> <file> <slug>
- ./scripts/new-project.sh <project-slug> <client-slug>
```

### 9.3 Instance Configuration (`buddy.config.ts`)

Each instance has a `buddy.config.ts` file that configures the AI persona and instance-specific settings. This file is gitignored in the public repo and tracked in instances. A `buddy.config.example.ts` is provided as a reference.

```ts
// buddy.config.ts
export default {
  instance: {
    name: "madali-buddy",
    accent: "indigo",       // indigo | blue | emerald | amber | rose | violet
  },
  persona: {
    name: "Buddy",
    tone: "professional",   // professional | casual | concise
    greeting: "Hey Mike, ready to get to work.",
    boundaries: [
      "Never modify .git/ or node_modules/",
      "Always confirm before deleting content files",
    ],
  },
  r2: {
    bucket: "my-buddy-files",
    publicUrl: "https://pub-xxx.r2.dev",
  },
}
```

| Field | Type | Description |
|---|---|---|
| `instance.name` | string | Instance identifier |
| `instance.accent` | string | Dashboard accent color |
| `persona.name` | string | AI persona display name |
| `persona.tone` | string | Response tone preference |
| `persona.greeting` | string | Session start greeting |
| `persona.boundaries` | string[] | Rules the AI must follow |
| `r2.bucket` | string | Cloudflare R2 bucket name |
| `r2.publicUrl` | string | R2 public URL prefix |

### 9.4 Slash Commands

Slash commands live in `.claude/commands/` and provide Claude Code with structured prompts for operating on business data. Commands are organized by category.

#### CRUD Commands (per collection)

Each collection gets five standard commands:

| Command | Description |
|---|---|
| `/mybuddy.{collection}.create` | Create new entry from template |
| `/mybuddy.{collection}.view` | View a specific entry |
| `/mybuddy.{collection}.edit` | Edit an existing entry |
| `/mybuddy.{collection}.list` | List entries with optional filters |
| `/mybuddy.{collection}.delete` | Delete an entry |

**Collections with CRUD:** projects, tasks, clients, contacts, leads, opportunities, interactions, meetings, proposals, contracts, invoices, payments, expenses, budgets, timelog, team, roles, leave, kb, journal, goals, ideas, subscriptions, sops, compliance, campaigns, assets (hardware, software, domains, servers, accounts), marketing (blog, social, newsletter), tax

**Collections without CRUD commands:**

| Collection | Reason |
|---|---|
| files | Auto-generated by `upload-file.sh` — use `/mybuddy.files.list` for viewing |
| knowledge/projects | Managed via project CLAUDE.md context, not standalone CRUD |
| knowledge/clients | Managed via client CLAUDE.md context, not standalone CRUD |

#### Session Commands

| Command | Description |
|---|---|
| `/mybuddy.start` | Activate persona, load context |
| `/mybuddy.end` | Deactivate persona, commit and push content |
| `/mybuddy.backup` | Commit and push content to instance remote |

#### Daily Operations

| Command | Description |
|---|---|
| `/mybuddy.standup` | Morning summary: tasks due, meetings today, follow-ups |
| `/mybuddy.eod` | End-of-day review: completed tasks, blockers, tomorrow plan |
| `/mybuddy.focus` | Today's priority focus items |
| `/mybuddy.followup` | Pending follow-ups from interactions and meetings |

#### Reporting

| Command | Description |
|---|---|
| `/mybuddy.weekly` | Week summary across all modules |
| `/mybuddy.monthly` | Month summary with financial overview |
| `/mybuddy.pipeline` | Sales pipeline: leads → opportunities → clients |
| `/mybuddy.audit` | Data integrity check across collections |
| `/mybuddy.orphans` | Find unreferenced entries |
| `/mybuddy.stale` | Overdue tasks, expired items, stale leads |
| `/mybuddy.blocked` | Blocked tasks across all projects |
| `/mybuddy.files.list` | List R2 file metadata entries with optional namespace filter |

---

## 10. CLI Scripts & Templates

### 10.1 Templates

Content templates in `.templates/` provide prefilled YAML frontmatter for each collection. CLI scripts and Claude Code commands use these templates to scaffold new entries consistently.

Templates include all required frontmatter fields with placeholder values and comments documenting valid enum options.

> **Note:** The `file.md` template exists for manual file metadata creation but is typically auto-generated by `scripts/upload-file.sh`. The `kb.md` template is shared across all three knowledge sub-collections (`knowledge/projects/`, `knowledge/clients/`, `knowledge/base/`).

### 10.2 CLI Scripts

| Script | Arguments | Description |
|---|---|---|
| `scripts/new-project.sh` | `<project-slug> <client-slug>` | Scaffold project folder with index.md from template |
| `scripts/new-client.sh` | `<client-slug>` | Scaffold client folder with index.md |
| `scripts/new-contact.sh` | `<client-slug> <contact-slug>` | Scaffold contact under client |
| `scripts/upload-file.sh` | `<namespace-slug> <file-path> <output-slug>` | Upload to R2 and create MD metadata |
| `scripts/new-task.sh` | `<project-slug> <task-slug>` | Scaffold task under project |
| `scripts/log-time.sh` | `<project-slug> <hours> <date>` | Create timelog entry |
| `scripts/migrate-v1.sh` | — | Migrate v1 content to v2 folder structure |
| `scripts/sync-upstream.sh` | `[--dry-run]` | Distribute app updates from public repo to all registered instances |
| `scripts/instances.sh` | `list \| add \| remove` | Manage registered instances in `buddy.instances.json` |
| `scripts/sync-obsidian.sh` | — | One-way sync: knowledge/base → Obsidian vault (read-only) |

**Example upload flow:**

```bash
# Upload file to R2 + auto-create MD metadata
./scripts/upload-file.sh test-project ./proposal-v1.pdf proposal-v1

# Output:
# ✓ Uploaded to R2: test-project/proposal-v1.pdf
# ✓ Created: content/files/test-project/proposal-v1.md
```

### 10.3 Bun Scripts

```json
{
  "dev": "astro dev",
  "build": "bun src/plugins/wiki-links/build-index.ts && astro build && pagefind --site dist",
  "build:index": "bun src/plugins/wiki-links/build-index.ts",
  "preview": "astro preview",
  "lint": "biome lint",
  "format": "biome format --write",
  "check": "biome check --write",
  "sync": "scripts/sync-upstream.sh",
  "instances": "scripts/instances.sh list",
  "instances:add": "scripts/instances.sh add",
  "instances:remove": "scripts/instances.sh remove"
}
```

### 10.4 Obsidian Sync

`scripts/sync-obsidian.sh` provides **one-way sync** from my-buddy to an Obsidian vault, scoped to the knowledge base only.

- **Direction:** my-buddy → Obsidian (read-only in Obsidian)
- **Scope:** `content/knowledge/base/` only
- **Method:** rsync or symlink into the Obsidian vault directory
- Edits happen in the repo — Obsidian is for reading and browsing knowledge

---

## 11. Multi-Instance Architecture

### 11.1 Overview

my-buddy is open-source. The public repo (`my-buddy`) contains the app code, schemas, components, scripts, and example content. Real business data lives in private **instance repos** — one per business or use case. A local clone of the public repo acts as the hub for fetching upstream updates and distributing them to all instances.

```
my-buddy (public, GitHub)
    │
    ├── git pull                          ← fetch latest app updates
    │
    └── bun sync                          ← push app code to all instances
        ├── → ~/madali-buddy    (private) ← Madali LLC
        ├── → ~/frostapp-buddy  (private) ← FrostAppDev
        └── → ~/personal-buddy  (private) ← personal use
```

### 11.2 Repository Roles

| Repo | Visibility | Contains | Issues/PRs | Git Remote |
|---|---|---|---|---|
| `my-buddy` | Public | App code + `content.example/` | Yes — all development tracked here | `origin` → GitHub public |
| `madali-buddy` | Private | App code + real content | No — just a working instance | `origin` → GitHub private |
| `frostapp-buddy` | Private | App code + real content | No — just a working instance | `origin` → GitHub private |

### 11.3 Content Strategy

| Directory | Public Repo | Instance Repos |
|---|---|---|
| `content.example/` | Tracked — sample data (fake clients, invoices) for demo and scaffolding | Not present — removed during scaffolding |
| `content/` | Gitignored — never committed to public repo | Tracked — real business data, pushed to private remote |

### 11.4 Scaffolding

`bun create my-buddy` (or a setup script) creates a new instance:

1. Copies app code from the public repo
2. Renames `content.example/` → `content/`
3. Initializes a new git repo
4. Prompts for instance name, accent color, and persona config
5. User links to their own private remote: `git remote add origin <private-repo-url>`

### 11.5 Sync Workflow

The local clone of `my-buddy` is the distribution hub. Instance repos never talk to the public repo directly.

**From the public repo (hub):**

```bash
# 1. Fetch latest app updates
git pull

# 2. Distribute to all registered instances
bun sync
```

**`bun sync` reads `buddy.instances.json` and rsyncs app code:**

```json
{
  "instances": [
    { "name": "madali-buddy", "path": "~/madali-buddy" },
    { "name": "frostapp-buddy", "path": "~/frostapp-buddy" }
  ]
}
```

**Sync rules:**

| Synced (app code) | Not synced (instance-specific) |
|---|---|
| `src/` | `content/` |
| `scripts/` | `buddy.config.ts` |
| `.templates/` | `buddy.instances.json` |
| `.claude/commands/` | `.git/` |
| `docs/` | `node_modules/` |
| `astro.config.mjs` | |
| `src/content.config.ts` | |
| `src/styles/` | |
| `package.json` | |
| `biome.jsonc` | |
| `tsconfig.json` | |

After sync, each instance runs `bun install` if `package.json` changed.

### 11.6 Instance Management CLI

| Command | Description |
|---|---|
| `bun sync` | Distribute app updates to all registered instances |
| `bun sync --dry-run` | Preview what would be synced without writing |
| `bun instances` | List all registered instances with sync status |
| `bun instances:add <name> <path>` | Register a new instance |
| `bun instances:remove <name>` | Unregister an instance |

### 11.7 Future Consideration: Meta-Dashboard

A meta-dashboard that aggregates data across all instances (total revenue, all tasks, cross-business overview) is a potential future feature but is **not in scope for v0.3.0**. Each instance has its own Astro dashboard. Cross-instance visibility can be explored once the core system is stable.

---

## 12. Content Data Migration

This section covers migrating **content data** (Markdown files with business data) from v1's flat structure to v2's folder-namespaced structure. The v1 application code has been scrapped entirely — only the content data in existing instances needs conversion.

### 12.1 Data Mapping

v1 instance content maps to v2 as follows:

| v1 Collection | v1 Count | v2 Collection | Migration Notes |
|---|---|---|---|
| accounts (type: client) | 2 | clients/ | Rename `uid` → slug-based, restructure to folder namespace |
| accounts (type: lead) | 1 | leads/ | Split from accounts |
| contacts | 2 | contacts/{client-slug}/ | Nest under client folder |
| deals | 0 | opportunities/ | Rename collection |
| projects | 8 | projects/{slug}/ | Add folder namespace, convert fields to kebab-case |
| tasks | 273 | tasks/{project-slug}/ | Nest under project folder, convert fields |
| kb | 8 | knowledge/base/ | Reorganize into category subfolders |
| journals | 7 | journal/ | Add `type`, `energy`, `highlights`, `blockers` fields |
| meetings | 2 | meetings/{project-slug}/ | Nest under project folder |

### 12.2 Field Convention Changes

| Aspect | v1 | v2 |
|---|---|---|
| ID field | `uid` (numeric) | Slug-based (filename = ID) |
| Field casing | `underscore_case` (`start_date`) | `kebab-case` (`start-date`) |
| Account model | Single `accounts` with `type: client\|lead` | Separate `clients/` + `leads/` collections |
| Deals | `deals` | `opportunities` |
| File structure | Flat files per collection | Folder-namespaced under parent entity |

### 12.3 Migration Script

`scripts/migrate-v1.sh` automates the content data conversion:

1. Read v1 content from the instance's `src/content/` directory (v1 stored content inside `src/`, not at the repo root)
2. Transform frontmatter fields (rename `uid` → slug, `underscore_case` → `kebab-case`)
3. Split `accounts` into `clients/` and `leads/` based on `type` field
4. Rename `deals/` → `opportunities/`
5. Create folder namespaces (e.g., `tasks/{project-slug}/`)
6. Write to v2 `content/` directory
7. Report: migrated count, skipped, errors

---

## 13. Development Phases

| Phase | Scope | Priority | Depends On |
|---|---|---|---|
| Phase 1 — Foundation | Astro + Bun setup, content collection schemas, wiki-link plugin, global CLAUDE.md, relations helper, dark theme, keyboard nav | Critical | — |
| Phase 2 — Core CRM | clients, contacts, leads, opportunities, interactions | High | Phase 1 |
| Phase 3 — Projects | projects, tasks, meetings, timelog | High | Phase 1 |
| Phase 4 — Finance | proposals, contracts, invoices, payments, expenses, budgets, tax | High | Phases 2–3 |
| Phase 5 — Assets & Subs | assets (all types), subscriptions, compliance | Medium | Phase 1 |
| Phase 6 — Knowledge Base | knowledge (all layers), sops, files, Pagefind search | Medium | Phase 1 |
| Phase 7 — Team & HR | team, roles, leave | Medium | Phase 1 |
| Phase 8 — Strategic | goals, ideas, journal, campaigns, marketing (blog, social, newsletter) | Lower | Phase 1 |
| Phase 9 — R2 Integration | upload scripts, file metadata, wrangler config | High | Phase 1 (parallel with Phase 4) |
| Phase 10 — Dashboard | All routes, widgets, relation queries, expiry alerts | Ongoing | Grows with each phase |
| Phase 11 — Claude Code Commands | CRUD commands, session commands, daily ops, reporting | Ongoing | Commands added per phase as collections land |
| Phase 12 — Multi-Instance | Scaffolding CLI (`bun create my-buddy`), sync script, `content.example/`, instance management | Medium | Phase 1 (can start anytime after) |
| Phase 13 — Migration | v1 data migration script, validation, cleanup | Low | Phase 3 (needs CRM + Projects schemas for validation) |

---

## 14. Platform Compatibility

my-buddy is platform-agnostic by design. The system is built on Markdown files, Git, and a static Astro site — none of which are tied to a specific IDE or AI tool. Claude Code is the recommended AI layer but is entirely optional.

### 14.1 Core System — Works Anywhere

| Layer | Technology | Compatible With |
|---|---|---|
| Content editing | Markdown files | VS Code, Neovim, Obsidian, any text editor |
| Dashboard | Astro static site | Any browser (local dev server for v0.3.0) |
| Version control | Git | GitHub, GitLab, Gitea, any git host |
| File uploads | Wrangler CLI | Any terminal on any OS |
| Scripts | Bash | Any Unix-compatible terminal |
| Search | Pagefind | Client-side, works in any browser |

### 14.2 Deployment

For v0.3.0, the dashboard runs locally via `astro dev` with hot reload. No authentication needed — it's localhost only.

**Future deployment options (not in scope for v0.3.0):**

- **Cloudflare Pages** — static build deployed on push via GitHub Actions
- **Cloudflare Access** — zero-trust auth (free for up to 50 users) if team access is needed
- Both require zero code changes to the Astro app

### 14.3 AI Layer Options

The CLAUDE.md files serve as structured context documents. Multiple AI tools can coexist in the same repo by using their respective config filenames alongside CLAUDE.md.

| AI Tool | Config File | Notes |
|---|---|---|
| Claude Code | CLAUDE.md | Best fit — reads hierarchy natively per folder |
| Cursor / Windsurf | .cursorrules | Add alongside CLAUDE.md, same content |
| GitHub Copilot | .github/copilot-instructions.md | Workspace-level context |
| OpenCode | Context files | Compatible with same MD structure |
| Neovim + avante.nvim | Via editor config | Point plugin at content/ directory |
| Obsidian | One-way sync | Read-only view of knowledge/base |

### 14.4 Multi-Platform Config Strategy

All AI config files can coexist — they are plain Markdown with different filenames. Maintain one source of truth and symlink or copy to platform-specific filenames:

- `CLAUDE.md` → Claude Code (primary)
- `.cursorrules` → Cursor / Windsurf
- `.github/copilot-instructions.md` → GitHub Copilot

The repo is the product, not the AI tool. Any editor or AI agent that can read files works with my-buddy. Claude Code simply has the best native support for the nested CLAUDE.md hierarchy used in this system.

---

## 15. Documentation

This project doubles as a learning resource. Documentation is layered — each layer serves a different purpose and can be maintained independently.

### 15.1 Architecture Decision Records (ADRs)

A `docs/decisions/` folder with one file per major decision. ADRs capture the *why* behind choices — the context that's easy to forget months later.

```
docs/decisions/
├── 001-flat-file-over-database.md
├── 002-folder-namespace-strategy.md
├── 003-wiki-links-over-explicit-refs.md
├── 004-marketing-not-content-content.md
└── ...
```

Each ADR is 20–50 lines and follows this structure: context, decision, alternatives considered, tradeoffs.

### 15.2 CLAUDE.md as Living Module Docs

CLAUDE.md files at the repo root and within each project/client folder serve as both AI context and module documentation. They describe conventions, gotchas, and current state. They stay maintained because they're functional — Claude Code reads them — not just decorative.

### 15.3 Code Comments

Comments follow a three-tier convention adapted for TypeScript and Astro.

**1. Module comments — one per file, describes purpose and scope**

```ts
// relations.ts
// Resolves cross-collection references for dashboard pages.
// Every relation query lives here — pages import from this
// module instead of writing inline collection lookups.
```

```ts
// remark-plugin.ts
// Remark plugin that transforms [[wiki-link]] syntax into
// HTML anchor elements at build time, using the pre-built
// slug index for resolution.
```

**2. TSDoc — on every exported function and type, explains what and when**

```ts
/** Strips a slug down for dedup comparison:
 *  lowercase, remove punctuation, collapse whitespace. */
export function normalizeSlug(raw: string): string {
```

```ts
/** Fetches a project and all related collections
 *  (tasks, meetings, client, invoices, timelog, etc.)
 *  in a single call. Used by project detail pages. */
export async function getProjectWithRelations(slug: string) {
```

**3. Inline comments — two kinds, prefixed for intent**

```ts
// WHY: Resolution priority favors clients over projects because
// client slugs are more likely to be unique — project slugs like
// "website-redesign" are common across clients.
const priority = ['clients', 'contacts', 'projects', 'tasks']

// LEARN: Astro's getCollection() returns entries sorted by file path.
// Filtering by slug prefix works because folder-namespaced children
// share the parent slug as their path prefix.
const tasks = allTasks.filter(t => t.slug.startsWith(`${slug}/`))
```

The `WHY` prefix marks design rationale — why this approach over alternatives. The `LEARN` prefix marks framework behavior, library idioms, or patterns being learned — these can be stripped later once they're second nature.

**What not to comment:**

- Self-explanatory code (`const name = entry.data.name`)
- Every function parameter (TSDoc covers the function, types cover the params)
- Removed code (delete it, git has history)

### 15.4 Diagrams

Three Mermaid diagrams in `docs/` cover the core architecture. Mermaid renders natively on GitHub with no tooling.

| Diagram | File | Purpose |
|---|---|---|
| Entity relationships | `docs/entity-relationships.md` | Visual version of the Section 4.1 relationship map |
| Business lifecycle | `docs/business-lifecycle.md` | Lead → opportunity → client → project → invoice → payment flow |
| Multi-instance architecture | `docs/multi-instance.md` | Public repo → sync → private instances |

### 15.5 README.md

The entry point for new users and contributors. Covers getting started, architecture overview at a glance, and links to the PRD, ADRs, and diagrams.

---

## 16. Constraints & Decisions

| Decision | Rationale |
|---|---|
| No database | All data in Git — version controlled, diff-able, portable, no migrations |
| Slug as foreign key | Folder paths are unique per collection, no ID generation needed |
| Markdown frontmatter as schema | Human-readable, editable from any text editor or terminal |
| Astro Content Collections | Provides Zod-validated, typed queries over MD files out of the box |
| Cloudflare R2 for files | Free tier covers most use cases, integrates with Wrangler CLI, no egress fees |
| Folder-based namespacing | Prevents slug collisions across projects without a global ID system |
| No real-time features | Static generation is sufficient; data changes via `astro dev` hot reload or git commit + rebuild |
| CLAUDE.md per project | Enables Claude Code to operate with full project context without manual prompting |
| Bun + Biome | Fast runtime, no node_modules bloat |
| Tasks under project folders | Duplicate task names across projects resolved by path — no UUID needed |
| Wiki-links via remark plugin | Lightweight cross-referencing without database joins, backlinks auto-generated at build time |
| Pagefind for search | Zero-config static search, no server infrastructure, built for Astro |
| Atomic design components | Scalable, maintainable UI pattern |
| Dark theme default | Terminal-first audience prefers dark UI, configurable accent color |
| Kebab-case frontmatter fields | Consistent with slug convention, readable in YAML |
| Local dev server only (v0.3.0) | No auth complexity — deploy to Cloudflare Pages + Access later if needed |
| One-way Obsidian sync | Avoids merge conflicts — Obsidian reads knowledge base, edits happen in repo |
| Individual recurring meeting files | Flat-file simplicity — no recurrence engine, link via `recurring-id` |
| Templates in `.templates/` | Single source of truth for content scaffolding, used by CLI scripts and Claude Code commands |
| Public repo + private instances | Open-source app code with issues/PRs on public repo; real business data in private instance repos — one per business |
| Hub-based sync (not per-instance upstream) | Local clone of public repo distributes updates to instances via rsync — no git remote entanglement in instances |
| `content.example/` for scaffolding | Sample data in public repo serves as demo and scaffolding source; renamed to `content/` in instances |
| CLI-only instance management (v0.3.0) | Meta-dashboard across instances is a future consideration — each instance has its own Astro dashboard |

---

*my-buddy PRD — v0.3.0 — February 2026 — Mike Navales, Madali LLC*
