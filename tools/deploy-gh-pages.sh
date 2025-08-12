#!/usr/bin/env bash
set -euo pipefail

REMOTE="origin"
BRANCH="gh-pages"
WORKTREE_DIR=".gh-pages-publish"

echo "[deploy] Starting gh-pages deployment..."

# Ensure we are not on the deploy branch when using worktrees
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
SHORT_SHA=$(git rev-parse --short HEAD)
if [[ "$CURRENT_BRANCH" == "$BRANCH" ]]; then
  echo "[deploy] ERROR: You are currently on '$BRANCH'. Switch to a source branch (e.g., 'source' or 'main') before deploying."
  exit 1
fi

# Ensure dist exists
if [[ ! -d "dist" ]]; then
  echo "[deploy] ERROR: dist/ not found. Run 'npm run build' first."
  exit 1
fi

echo "[deploy] Preparing worktree for $BRANCH..."
git fetch "$REMOTE" "$BRANCH" || true

# Clean any previous worktree dir
if [[ -d "$WORKTREE_DIR" ]]; then
  echo "[deploy] Removing existing worktree directory $WORKTREE_DIR..."
  rm -rf "$WORKTREE_DIR"
fi

git worktree add --force --checkout "$WORKTREE_DIR" "$BRANCH" || git worktree add --force --orphan "$WORKTREE_DIR" "$BRANCH"

echo "[deploy] Clearing old contents..."
(
  cd "$WORKTREE_DIR"
  # Remove tracked files
  if git ls-files -z | grep -q .; then
    git ls-files -z | xargs -0 git rm -f
  fi
  # Remove untracked files except .git
  find . -mindepth 1 -maxdepth 1 ! -name ".git" -exec rm -rf {} +
)

echo "[deploy] Copying new build from dist/ ..."
cp -R dist/* "$WORKTREE_DIR"/

# Preserve .nojekyll if present at repo root
if [[ -f ".nojekyll" ]]; then
  cp .nojekyll "$WORKTREE_DIR"/.nojekyll
fi

echo "[deploy] Committing and pushing to $BRANCH..."
(
  cd "$WORKTREE_DIR"
  git add -A
  if git diff --cached --quiet; then
    echo "[deploy] No changes to deploy."
  else
    git commit -m "Deploy to gh-pages: $(date -u +%Y-%m-%dT%H:%M:%SZ) from $CURRENT_BRANCH@$SHORT_SHA"
    git push "$REMOTE" "$BRANCH"
  fi
)

echo "[deploy] Cleaning up worktree..."
git worktree remove "$WORKTREE_DIR" --force

echo "[deploy] Done."

