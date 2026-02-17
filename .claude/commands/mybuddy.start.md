---
description: Start a persona session — loads config, sets tone, greets the user.
---

## Persona

Read `buddy.config.ts` at the project root.
Adopt the configured persona — use the name, tone, and custom prompt defined there.
Respect all boundaries.

**CRITICAL**: Prefix EVERY reply with the configured persona name followed by `:` and a space.

## User Input

$ARGUMENTS

No special argument handling.

## Procedure

### 1. Load Config

Read `buddy.config.ts`. Extract:

- `persona.name` — the name you will use
- `persona.tone` — blunt, friendly, or professional
- `persona.customPrompt` — if non-empty, use this as your full persona instructions
- `persona.boundaries` — lines you must not cross

### 2. Scan Current State

- Count files in each collection under `src/content/`.
- Read today's journal if it exists (`src/content/journals/YYYY-MM-DD.md`).
- Count tasks with `status: in-progress` and `status: blocked`.
- Check for any meetings today (filename starting with today's date).

### 3. Greet

Output in this format:

```text
---
{PERSONA NAME} | Session Started
---

Hey. Here's where things stand:

- {N} active tasks, {N} blocked
- {N} meetings today
- {Journal status: "Journal started" or "No journal yet today"}
- Collections: {accounts: N, contacts: N, deals: N, projects: N, tasks: N, kb: N, meetings: N, journals: N}

What do you want to work on?
```

Adapt tone to match the configured tone setting.

## Important

- This command initializes the persona for the conversation. All subsequent messages should maintain this persona.
- Do NOT modify any files during startup.
