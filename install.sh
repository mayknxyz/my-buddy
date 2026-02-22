#!/usr/bin/env bash
# install.sh — Create a fresh my-buddy instance.
# Usage: curl -fsSL https://raw.githubusercontent.com/mayknxyz/my-buddy-assistant/main/install.sh | bash

set -euo pipefail

UPSTREAM_URL="${MY_BUDDY_UPSTREAM:-https://github.com/mayknxyz/my-buddy-assistant.git}"
INSTALL_DIR="my-buddy"

# --- Helpers ---------------------------------------------------------------

info()  { printf '\033[1;34m→\033[0m %s\n' "$1"; }
ok()    { printf '\033[1;32m✓\033[0m %s\n' "$1"; }
warn()  { printf '\033[1;33m!\033[0m %s\n' "$1"; }
fail()  { printf '\033[1;31m✗\033[0m %s\n' "$1" >&2; exit 1; }

# --- Prerequisites ---------------------------------------------------------

command -v git >/dev/null 2>&1 || fail "git is required but not found. Install it first."
command -v bun >/dev/null 2>&1 || fail "bun is required but not found. Install it: https://bun.sh"

[ -d "$INSTALL_DIR" ] && fail "Directory '$INSTALL_DIR' already exists. Remove it or choose a different location."

# --- Clone template --------------------------------------------------------

info "Downloading my-buddy-assistant..."
git clone --depth 1 "$UPSTREAM_URL" "$INSTALL_DIR" || fail "Failed to clone $UPSTREAM_URL"
ok "Downloaded template"

cd "$INSTALL_DIR"

# --- Fresh git init --------------------------------------------------------

info "Initializing fresh git repo (no template history)..."
rm -rf .git
git init -b main >/dev/null 2>&1
ok "Fresh git repo initialized"

# --- Set upstream remote ---------------------------------------------------

git remote add upstream "$UPSTREAM_URL"
ok "Upstream remote set to $UPSTREAM_URL"

# --- Scaffold content ------------------------------------------------------

info "Scaffolding content from examples..."
cp -r content.example content
ok "content/ created from content.example/"

cp buddy.config.example.ts buddy.config.ts
ok "buddy.config.ts created from buddy.config.example.ts"

# --- Instance CLAUDE.md ----------------------------------------------------

if [ -f CLAUDE.instance.md ]; then
  cp CLAUDE.instance.md CLAUDE.md
  ok "CLAUDE.md set to instance version (AI restricted to content/ and config)"
fi

touch CLAUDE.local.md
ok "CLAUDE.local.md created for your custom AI instructions"

# --- Install dependencies --------------------------------------------------

info "Installing dependencies..."
bun install
ok "Dependencies installed"

# --- Initial commit --------------------------------------------------------

git add -A
git commit -m "Initial commit — my-buddy instance" >/dev/null 2>&1
ok "Initial commit created"

# --- Optional: create private GitHub repo ----------------------------------

echo ""
if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  printf "Create a private GitHub repo and push? [y/N] "
  read -r CREATE_REPO
  if [ "$CREATE_REPO" = "y" ] || [ "$CREATE_REPO" = "Y" ]; then
    REPO_NAME=$(basename "$PWD")
    if gh repo create "$REPO_NAME" --private --source=. --push 2>&1; then
      ok "Private repo created and pushed: $(gh repo view --json url -q .url)"
    else
      warn "Could not create repo '$REPO_NAME' (may already exist)."
      echo "  To push manually:"
      echo "    git remote add origin git@github.com:YOUR_USER/$REPO_NAME.git"
      echo "    git push -u origin main"
    fi
  fi
else
  warn "GitHub CLI (gh) not available or not authenticated."
  echo "  To push to a private repo later:"
  echo "    git remote add origin git@github.com:YOUR_USER/my-buddy.git"
  echo "    git push -u origin main"
fi

# --- Done ------------------------------------------------------------------

echo ""
ok "my-buddy instance ready!"
echo ""
echo "  cd $INSTALL_DIR"
echo "  bun dev          # Start dev server"
echo "  bun run build    # Build for production"
echo ""
echo "  To pull future updates:"
echo "    bun run sync"
echo ""
