# ADR 005: Hub-Based Sync Over Per-Instance Upstream

## Status

Superseded by [ADR 007](007-upstream-remote-over-hub-sync.md)

## Context

my-buddy is open-source with private instance repos for each business.
Instances need to receive app code updates from the public repo without
exposing business data or entangling git remotes.

## Decision

Use a local clone of the public repo as a distribution hub. The sync
script (`bun sync`) rsyncs app code to all registered instances. Instance
repos never have a git remote pointing to the public repo.

```
my-buddy (public) → git pull → local hub → bun sync → instances
```

## Alternatives Considered

- **Git subtree** — merge public repo as a subtree in each instance.
  Complex merge conflicts, pollutes instance git history
- **Git submodule** — reference public repo as a submodule. Adds
  complexity for non-git-experts, submodule state gets stale
- **Fork per instance** — fork public repo, track upstream. Leaks
  private content if accidentally pushed, complex rebase workflow
- **npm/bun package** — publish app code as a package. Adds versioning
  overhead, can't easily customize per instance

## Tradeoffs

- **Pro:** No git remote entanglement in instances — clean git history
- **Pro:** Selective sync — only app code copied, content untouched
- **Pro:** Dry-run mode for previewing changes
- **Pro:** Works with any number of instances
- **Con:** Requires a local clone of the public repo as a hub
- **Con:** Not fully automated — user runs `bun sync` manually
- **Con:** One-way sync only — instance customizations aren't pushed
  upstream (by design)

## Consequences

Instance management is CLI-only (`buddy.instances.json` registry).
Each instance is a standalone git repo that can be pushed to any
private remote independently. Content backup is just `git push` on
the instance.
