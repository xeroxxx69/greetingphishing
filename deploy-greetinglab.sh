#!/usr/bin/env bash
set -Eeuo pipefail

# GreetingLab deployment helper. Run from the project root containing index.html.
REPO_URL="https://github.com/xeroxxx69/greetingphishing.git"
BRANCH="main"
COMMIT_MESSAGE="Deploy GreetingLab"

SOURCE_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
WORK_DIR="$(mktemp -d)"
REPO_DIR="$WORK_DIR/repository"
trap 'rm -rf "$WORK_DIR"' EXIT

fail() { echo "ERROR: $*" >&2; exit 1; }

echo "== GreetingLab deployment =="
command -v git >/dev/null 2>&1 || fail "Git missing. Install: sudo apt update && sudo apt install -y git"
command -v rsync >/dev/null 2>&1 || fail "rsync missing. Install: sudo apt update && sudo apt install -y rsync"
[[ -f "$SOURCE_DIR/index.html" ]] || fail "index.html not found. Run this script from the GreetingLab project root."

# Stop rather than risk publishing common secrets or private visitor records.
if find "$SOURCE_DIR" -type f \( -name ".env" -o -name ".env.*" -o -name "*.pem" -o -name "*.key" -o -iname "*location*.log" -o -iname "*visitor*.csv" -o -iname "*capture*" \) -print -quit | grep -q .; then
  fail "Potential secrets/private visitor data found. Remove or move those files before deployment."
fi

echo "[1/4] Cloning GitHub repository..."
git clone --branch "$BRANCH" "$REPO_URL" "$REPO_DIR" || fail "Clone failed. Check internet and GitHub authentication."

echo "[2/4] Copying project files..."
rsync -a --delete \
  --exclude='/.git/' \
  --exclude='/.env' --exclude='/.env.*' \
  --exclude='*.pem' --exclude='*.key' \
  --exclude='node_modules/' --exclude='vendor/' --exclude='__pycache__/' \
  --exclude='.DS_Store' --exclude='*.log' \
  --exclude='backups/' --exclude='backup/' \
  --exclude='uploads/' --exclude='captures/' --exclude='location-logs/' \
  --exclude='*.php' \
  "$SOURCE_DIR/" "$REPO_DIR/"

cd "$REPO_DIR"
[[ -f index.html ]] || fail "index.html missing from repository root after copying."

echo "[3/4] Preparing commit..."
git add -A
if git diff --cached --quiet; then
  echo "No changes to upload; repository is already up to date."
else
  git -c user.name="GreetingLab Deployment" \
      -c user.email="actions@users.noreply.github.com" \
      commit -m "$COMMIT_MESSAGE"
  echo "[4/4] Pushing to GitHub..."
  git push origin "$BRANCH" || fail "Push failed. Check GitHub authentication and push permission."
fi

echo
echo "Upload completed."
echo "Repository: https://github.com/xeroxxx69/greetingphishing"
echo "Expected website: https://xeroxxx69.github.io/greetingphishing/"
echo "If Pages is not enabled: Settings > Pages > Deploy from a branch > main > / (root) > Save"
echo "Note: GitHub Pages serves static HTML/CSS/JS; it does not execute PHP."
