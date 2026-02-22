#!/usr/bin/env bash
# sync.sh — Pull latest app code from the upstream template repo.
# Usage: bun run sync

set -euo pipefail

UPSTREAM_REMOTE="upstream"
UPSTREAM_BRANCH="main"

# --- Helpers ---------------------------------------------------------------

info()  { printf '\033[1;34m→\033[0m %s\n' "$1"; }
ok()    { printf '\033[1;32m✓\033[0m %s\n' "$1"; }
warn()  { printf '\033[1;33m!\033[0m %s\n' "$1"; }
fail()  { printf '\033[1;31m✗\033[0m %s\n' "$1" >&2; exit 1; }

# --- Guard: clean working tree --------------------------------------------

if [ -n "$(git status --porcelain)" ]; then
  fail "Working tree is dirty. Commit or stash your changes before syncing."
fi

# --- Guard: upstream remote exists -----------------------------------------

if ! git remote get-url "$UPSTREAM_REMOTE" >/dev/null 2>&1; then
  fail "No '$UPSTREAM_REMOTE' remote found. Add it with:
  git remote add upstream https://github.com/mayknxyz/my-buddy-assistant.git"
fi

# --- Fetch upstream --------------------------------------------------------

info "Fetching from $UPSTREAM_REMOTE..."
git fetch "$UPSTREAM_REMOTE"
ok "Fetched latest from $UPSTREAM_REMOTE/$UPSTREAM_BRANCH"

# --- Show incoming changes -------------------------------------------------

INCOMING=$(git log --oneline "HEAD..$UPSTREAM_REMOTE/$UPSTREAM_BRANCH" 2>/dev/null)
if [ -z "$INCOMING" ]; then
  ok "Already up to date. Nothing to sync."
  exit 0
fi

echo ""
info "Incoming commits:"
echo "$INCOMING"
echo ""

# --- Record pre-merge state for post-merge checks -------------------------

PKG_HASH_BEFORE=$(git hash-object package.json 2>/dev/null || echo "")

# --- Merge -----------------------------------------------------------------

info "Merging $UPSTREAM_REMOTE/$UPSTREAM_BRANCH..."
if ! git merge "$UPSTREAM_REMOTE/$UPSTREAM_BRANCH" --no-edit; then
  echo ""
  warn "Merge conflict detected. Resolve conflicts, then:"
  echo "  git add ."
  echo "  git commit"
  echo ""
  echo "  Escape hatch (accept all upstream changes):"
  echo "    git checkout $UPSTREAM_REMOTE/$UPSTREAM_BRANCH -- src/"
  echo "    git add . && git commit"
  exit 1
fi

ok "Merge complete"

# --- Post-merge: apply instance CLAUDE.md ----------------------------------

if [ -f CLAUDE.instance.md ]; then
  if ! diff -q CLAUDE.instance.md CLAUDE.md >/dev/null 2>&1; then
    cp CLAUDE.instance.md CLAUDE.md
    git add CLAUDE.md
    git commit -m "sync: apply updated CLAUDE.instance.md" --no-verify >/dev/null 2>&1
    ok "CLAUDE.md updated from CLAUDE.instance.md"
  fi
fi

# --- Post-merge: reinstall if package.json changed -------------------------

PKG_HASH_AFTER=$(git hash-object package.json 2>/dev/null || echo "")
if [ "$PKG_HASH_BEFORE" != "$PKG_HASH_AFTER" ]; then
  info "package.json changed — reinstalling dependencies..."
  bun install
  ok "Dependencies updated"
fi

# --- Done ------------------------------------------------------------------

echo ""
ok "Sync complete!"
