# ADR 006: No Backup Script — Git Push Is the Backup

## Status

Accepted (supersedes v1 `data-backup.sh`)

## Context

v1 had dedicated `data-backup.sh` and `data-restore.sh` scripts that
copied content to a separate private data repo. This was necessary
because v1 content lived inside the public repo and needed to be
extracted to avoid leaking business data.

## Decision

Remove the backup/restore scripts. In v2's multi-instance architecture,
each instance IS a private Git repo with its own remote. Content backup
is `git push`.

The `/mybuddy.backup` command automates: stage content, commit, push.
The `/mybuddy.end` command runs the same before ending a session.

## Alternatives Considered

- **Keep `data-backup.sh`** — redundant. The instance repo already
  tracks content and pushes to a private remote
- **Scheduled cron backup** — unnecessary complexity when `git push`
  achieves the same result with full version history

## Tradeoffs

- **Pro:** Simpler — no separate backup repo or script to maintain
- **Pro:** Full git history — every content change is a versioned commit
- **Pro:** Restore is `git clone` or `git checkout`
- **Con:** Requires discipline to commit and push regularly (mitigated
  by `/mybuddy.end` auto-committing)

## Consequences

The `bun data:backup` and `bun data:restore` package.json scripts from
v1 are removed. The `/mybuddy.backup` and `/mybuddy.end` commands use
standard git operations instead.
