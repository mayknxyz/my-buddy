#!/usr/bin/env bash
set -euo pipefail

# Restore content files and config from a separate data repo.
# Usage: scripts/data-restore.sh [path-to-data-repo]
#
# Default data repo location: ../my-buddy-data (sibling directory)

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DATA_REPO="${1:-${BUDDY_DATA_REPO:-$PROJECT_DIR/../my-buddy-data}}"

if [ ! -d "$DATA_REPO" ]; then
  echo "Data repo not found at: $DATA_REPO"
  echo ""
  echo "Clone it first:"
  echo "  git clone <your-private-repo-url> ../my-buddy-data"
  echo ""
  echo "Or pass a custom path:"
  echo "  scripts/data-restore.sh /path/to/your/data-repo"
  echo "  BUDDY_DATA_REPO=/path/to/repo scripts/data-restore.sh"
  exit 1
fi

echo "Restoring from: $DATA_REPO"

# Restore content collections
for collection in accounts contacts deals projects tasks kb meetings journals; do
  src="$DATA_REPO/content/$collection"
  dest="$PROJECT_DIR/src/content/$collection"

  if [ -d "$src" ]; then
    found=$(find "$src" -maxdepth 1 -name '*.md' 2>/dev/null | head -1)
    if [ -n "$found" ]; then
      cp "$src"/*.md "$dest/"
      echo "  content/$collection/ ✓"
    fi
  fi
done

# Restore buddy.config.ts
if [ -f "$DATA_REPO/buddy.config.ts" ]; then
  cp "$DATA_REPO/buddy.config.ts" "$PROJECT_DIR/"
  echo "  buddy.config.ts ✓"
fi

echo ""
echo "Restore complete. Run 'bun dev' to start working."
