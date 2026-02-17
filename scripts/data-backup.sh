#!/usr/bin/env bash
set -euo pipefail

# Back up content files and config to a separate data repo.
# Usage: scripts/data-backup.sh [path-to-data-repo]
#
# Default data repo location: ../my-buddy-data (sibling directory)

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DATA_REPO="${1:-${BUDDY_DATA_REPO:-$PROJECT_DIR/../my-buddy-data}}"

if [ ! -d "$DATA_REPO" ]; then
  echo "Data repo not found at: $DATA_REPO"
  echo ""
  echo "Create it first:"
  echo "  git init ../my-buddy-data"
  echo "  cd ../my-buddy-data && git remote add origin <your-private-repo-url>"
  echo ""
  echo "Or pass a custom path:"
  echo "  scripts/data-backup.sh /path/to/your/data-repo"
  echo "  BUDDY_DATA_REPO=/path/to/repo scripts/data-backup.sh"
  exit 1
fi

echo "Backing up to: $DATA_REPO"

# Sync content collections
for collection in accounts contacts deals projects tasks kb meetings journals; do
  src="$PROJECT_DIR/src/content/$collection"
  dest="$DATA_REPO/content/$collection"
  mkdir -p "$dest"

  # Copy .md files only (skip .gitkeep)
  found=$(find "$src" -maxdepth 1 -name '*.md' 2>/dev/null | head -1)
  if [ -n "$found" ]; then
    cp "$src"/*.md "$dest/"
    echo "  content/$collection/ ✓"
  fi
done

# Sync buddy.config.ts
if [ -f "$PROJECT_DIR/buddy.config.ts" ]; then
  cp "$PROJECT_DIR/buddy.config.ts" "$DATA_REPO/"
  echo "  buddy.config.ts ✓"
fi

echo ""
echo "Backup complete."
echo "To push: cd $DATA_REPO && git add -A && git commit -m 'backup' && git push"
