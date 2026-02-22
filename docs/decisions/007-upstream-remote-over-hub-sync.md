# ADR 007: Upstream Remote Over Hub-Based Sync

## Status

Accepted (supersedes ADR 005)

## Context

ADR 005 specified a hub-based sync model: a local clone of the public repo
would act as a distribution hub, rsyncing app code to registered instances
via `buddy.instances.json`. This was never implemented — no scripts, no
registry file, no package.json bindings existed. The design added unnecessary
complexity (local hub clone, instance registry, rsync-based distribution)
for a problem that Git's upstream remote pattern already solves.

## Decision

Replace the hub-based sync model with a standard upstream-remote pattern:

1. **Install**: A curl-installable `install.sh` clones the template repo,
   strips git history (`git init`), and sets an `upstream` remote pointing
   to `my-buddy-assistant` (the public repo).
2. **Sync**: `scripts/sync.sh` (aliased as `bun run sync`) fetches from
   upstream and merges, with guards for dirty working trees, auto-reinstall
   on `package.json` changes, and auto-apply of `CLAUDE.instance.md`.
3. **AI guardrails**: `CLAUDE.instance.md` restricts AI to `content/` and
   `buddy.config.ts` only, preventing accidental edits to app code that
   would cause merge conflicts on sync. Users add custom instructions to
   `CLAUDE.local.md` (gitignored, preserved across syncs).

```
my-buddy-assistant (public) ──upstream──→ my-buddy (private instance)
                                          ──origin──→ user's private repo
```

## Alternatives Considered

- **Hub-based sync (ADR 005)** — local clone as distribution hub with
  rsync. Never implemented, adds a mandatory intermediary clone
- **Git subtree** — merge public repo as a subtree. Complex conflicts,
  pollutes instance history
- **Git submodule** — reference public repo as a submodule. Confusing
  for non-experts, stale state issues
- **npm/bun package** — publish app code as a package. Adds versioning
  overhead, can't customize per instance

## Tradeoffs

- **Pro:** Uses standard Git workflow — no custom tooling beyond a
  thin merge wrapper
- **Pro:** No intermediary hub clone needed
- **Pro:** Users can inspect incoming changes before merging
- **Pro:** Merge conflicts use standard Git resolution
- **Pro:** `CLAUDE.instance.md` prevents the most common conflict cause
  (AI editing app code in instances)
- **Con:** Instance repos have an `upstream` remote pointing to the
  public repo (by design — no data flows upstream)
- **Con:** Merge conflicts possible if users modify app code
  (mitigated by AI guardrails and escape hatch in sync script)

## Consequences

- `buddy.instances.json` registry is removed
- `bun instances` / `bun sync` commands are removed from package.json
- `scripts/instances.sh` and `scripts/sync-upstream.sh` are removed
- `install.sh` becomes the canonical setup path
- `bun run sync` (not `bun sync`) is the update command
- Instance repos carry an `upstream` remote — this is intentional and
  does not leak data (Git never pushes to upstream)
