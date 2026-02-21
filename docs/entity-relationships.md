# Entity Relationships

Collection relationship diagram for my-buddy. Arrows show reference direction
(from → to). Folder-based relationships use the parent slug as the folder name.

```mermaid
erDiagram
    LEADS ||--o{ OPPORTUNITIES : "qualifies into"
    OPPORTUNITIES ||--o| PROPOSALS : "references"
    OPPORTUNITIES }o--|| LEADS : "lead"
    CLIENTS ||--o{ CONTACTS : "folder namespace"
    CLIENTS ||--o{ CONTRACTS : "folder namespace"
    CLIENTS ||--o{ PROPOSALS : "folder namespace"
    CLIENTS ||--o{ INVOICES : "folder namespace"
    CLIENTS ||--o{ PAYMENTS : "folder namespace"
    CLIENTS ||--o{ INTERACTIONS : "folder namespace"
    PROJECTS ||--o{ TASKS : "folder namespace"
    PROJECTS ||--o{ MEETINGS : "folder namespace"
    PROJECTS ||--o{ TIMELOG : "folder namespace"
    PROJECTS ||--o{ FILES : "folder namespace"
    PROJECTS }o--|| CLIENTS : "client"
    INVOICES }o--|| PROJECTS : "project"
    PAYMENTS }o--|| INVOICES : "invoice"
    TIMELOG }o--|| TASKS : "task"
    MEETINGS }o--o{ CONTACTS : "contacts[]"
    CONTACTS }o--o{ PROJECTS : "projects[]"
    INTERACTIONS }o--|| CONTACTS : "contact"
    INTERACTIONS }o--o| PROJECTS : "project"
    GOALS }o--o{ PROJECTS : "projects[]"
    COMPLIANCE }o--o{ PROJECTS : "applies-to[]"
    CAMPAIGNS ||--o{ MARKETING : "marketing[]"
    ASSETS }o--o{ TEAM : "assigned-to[]"
    LEAVE }o--|| TEAM : "folder namespace"
    ROLES ||--o{ TEAM : "referenced by"
    EXPENSES }o--o| PROJECTS : "project"
    BUDGETS }o--|| PROJECTS : "folder namespace"
    SOPS }o--|| TEAM : "owner"
    TIMELOG }o--|| TEAM : "member"
```

## Namespace Strategy

Relationships are resolved in two ways:

1. **Folder namespace** — the subfolder name IS the foreign key
   - `tasks/test-project/setup.md` → belongs to project `test-project`
   - `contacts/acme-corp/john-doe.md` → belongs to client `acme-corp`

2. **Frontmatter reference** — a field contains the target slug
   - `invoices/acme-corp/inv-001.md` → `project: test-project`
   - `payments/acme-corp/pay-001.md` → `invoice: inv-001`

## Cardinality Reference

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

**Note:** Some relationships are intentionally one-directional. For example,
`contacts.projects[]` references projects, but `projects` has no `contacts[]`
field — contacts for a project are resolved at query time via filtering.
