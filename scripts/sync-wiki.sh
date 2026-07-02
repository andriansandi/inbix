#!/usr/bin/env bash
set -euo pipefail

# Sync repository documentation to the GitHub Wiki checkout.
# Expects the wiki repository to be checked out at ./wiki relative to the repo root.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
WIKI_DIR="$REPO_ROOT/wiki"

if [ ! -d "$WIKI_DIR/.git" ]; then
  echo "Error: $WIKI_DIR is not a git repository. Clone the wiki first:"
  echo "  git clone git@github.com:andriansandi/inbix.wiki.git wiki"
  exit 1
fi

node "$SCRIPT_DIR/sync-wiki.js"
