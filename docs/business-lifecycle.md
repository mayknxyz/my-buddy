# Business Lifecycle

The full business lifecycle from lead capture to payment collection.
Each stage maps to a content collection.

```mermaid
flowchart LR
    subgraph Pipeline
        A[Lead] -->|qualify| B[Opportunity]
        B -->|convert| C[Client]
    end

    subgraph Engagement
        C -->|scoped to| D[Project]
        D -->|tracked by| E[Tasks]
        D -->|logged in| F[Timelog]
        D -->|discussed in| G[Meetings]
        C -->|touchpoints| H[Interactions]
    end

    subgraph Finance
        B -->|attached| I[Proposal]
        I -->|accepted| J[Contract]
        D -->|billed via| K[Invoice]
        K -->|settled by| L[Payment]
        D -->|costs tracked| M[Expenses]
        D -->|planned in| N[Budget]
    end

    style A fill:#4f46e5,color:#fff
    style B fill:#4f46e5,color:#fff
    style C fill:#059669,color:#fff
    style D fill:#059669,color:#fff
    style K fill:#d97706,color:#fff
    style L fill:#059669,color:#fff
```

## Stage Details

### 1. Lead Capture

A lead enters the system via referral, social, inbound, or cold outreach.

```
content/leads/{lead-slug}/index.md
status: new → contacted → qualified → disqualified
```

### 2. Opportunity Qualification

A qualified lead becomes an opportunity with a defined value, probability,
and expected close date.

```
content/opportunities/{slug}/index.md
stage: discovery → scoping → proposal-sent → negotiation → closed-won | closed-lost
```

### 3. Client Conversion

A closed-won opportunity converts to a client. The client becomes the parent
namespace for contacts, contracts, invoices, and interactions.

```
content/clients/{client-slug}/index.md
status: active | inactive | churned
```

### 4. Project Execution

Projects are scoped to clients. Tasks, meetings, timelog, and files are
namespaced under the project slug.

```
content/projects/{project-slug}/index.md
status: active → paused → completed → archived
```

### 5. Proposal & Contract

Proposals are versioned and linked to opportunities. Accepted proposals
lead to signed contracts.

```
content/proposals/{client-slug}/proposal-v1.md
content/contracts/{client-slug}/contract-v1.md
```

### 6. Invoicing & Payment

Invoices reference a project and client. Payments reference an invoice.

```
content/invoices/{client-slug}/inv-001.md
status: draft → sent → paid | overdue | cancelled

content/payments/{client-slug}/pay-001.md
status: pending → confirmed | failed
```

### 7. Financial Tracking

Expenses and budgets are tracked per project. Tax periods aggregate
across all financial data.

```
content/expenses/{project-slug}/expense-name.md
content/budgets/{project-slug}/index.md
content/tax/{year}/index.md
```
