#!/usr/bin/env bash
# Deploy Prosto Backend (instamicro-api) to PRODUCTION.
#
# Flow: commit → push → ssh to VPS → git pull → npm ci → pm2 restart → smoke test.
# Usage: bash scripts/deploy-prod.sh
#
# IMPORTANT — agyaad protection:
#   This script ONLY touches /var/www/prosto-backend and PM2 process
#   `instamicro-api`. It must never reference any agyaad/plaza/galaxysupps
#   resource. If you edit this file, keep that invariant.

set -euo pipefail

# ---------- config ----------
SERVER="root@185.182.9.95"
SSH_PASS="PlazaUse"
REMOTE_DIR="/var/www/prosto-backend"
PM2_NAME="instamicro-api"
BRANCH="main"
HEALTH_URL="https://api.prosto.instamicrotech.com/api/v1/health"

# ---------- colors ----------
red()   { printf "\033[0;31m%s\033[0m\n" "$*"; }
green() { printf "\033[0;32m%s\033[0m\n" "$*"; }
cyan()  { printf "\033[0;36m%s\033[0m\n" "$*"; }
yellow(){ printf "\033[0;33m%s\033[0m\n" "$*"; }

cyan "=========================================="
cyan "  Deploying Prosto Backend - PRODUCTION"
cyan "=========================================="
echo ""
echo "Target:   $HEALTH_URL"
echo "Server:   $SERVER"
echo "Dir:      $REMOTE_DIR"
echo "PM2:      $PM2_NAME"
echo ""

# ---------- 1. preflight ----------
cyan ">> Preflight checks..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

if ! command -v git >/dev/null 2>&1; then
  red "x git not installed"
  exit 1
fi
if ! command -v sshpass >/dev/null 2>&1; then
  yellow "   sshpass not installed — installing via Homebrew..."
  if ! command -v brew >/dev/null 2>&1; then
    red "x Homebrew not found. Install it from https://brew.sh or install sshpass manually."
    exit 1
  fi
  brew install hudochenkov/sshpass/sshpass || {
    red "x Failed to install sshpass"
    exit 1
  }
fi
green "ok preflight passed"
echo ""

# ---------- 2. push local changes ----------
cyan ">> Checking local git state..."
if [ -n "$(git status --porcelain)" ]; then
  yellow "   You have uncommitted changes. Commit or stash before deploying."
  git status --short
  read -r -p "Continue anyway (push existing commits only)? [y/N] " ans
  [[ "$ans" =~ ^[Yy]$ ]] || exit 1
fi

cyan ">> Pushing $BRANCH to origin..."
git push origin "$BRANCH"
green "ok pushed"
echo ""

# ---------- 3. remote deploy ----------
cyan ">> Deploying on server..."
sshpass -p "$SSH_PASS" ssh \
  -o StrictHostKeyChecking=no \
  -o UserKnownHostsFile=/dev/null \
  -o LogLevel=ERROR \
  "$SERVER" "REMOTE_DIR='$REMOTE_DIR' PM2_NAME='$PM2_NAME' BRANCH='$BRANCH' bash -s" <<'REMOTE_EOF'
set -euo pipefail

# Refuse to touch any protected resource (defence in depth)
case "$REMOTE_DIR$PM2_NAME" in
  *agyaad*|*plaza*|*galaxysupps*)
    echo "!! refusing — REMOTE_DIR or PM2_NAME contains a protected name"; exit 1 ;;
esac

cd "$REMOTE_DIR"

echo ">> resetting local changes (preserve .env + uploads + node_modules)..."
git config --global --add safe.directory "$REMOTE_DIR" 2>/dev/null || true
git reset --hard HEAD
git clean -fd -e .env -e .env.production -e public/uploads -e node_modules

echo ">> pulling $BRANCH..."
git fetch origin "$BRANCH"
git reset --hard "origin/$BRANCH"

echo ">> installing production deps..."
npm ci --production --no-audit --no-fund 2>&1 | tail -3

echo ">> restarting PM2 process $PM2_NAME..."
if pm2 describe "$PM2_NAME" > /dev/null 2>&1; then
  pm2 restart "$PM2_NAME" --update-env
else
  pm2 start src/server.js --name "$PM2_NAME" --time
fi
pm2 save

echo ">> done."
REMOTE_EOF
green "ok remote deploy complete"
echo ""

# ---------- 4. smoke test ----------
cyan ">> Smoke test..."
sleep 2
HTTP=$(curl -s -o /tmp/prosto-health.json -w "%{http_code}" --max-time 15 "$HEALTH_URL" || echo "000")
if [ "$HTTP" = "200" ]; then
  green "ok $HEALTH_URL -> HTTP 200"
  cat /tmp/prosto-health.json
  echo ""
else
  red "warn $HEALTH_URL -> HTTP $HTTP — check 'pm2 logs $PM2_NAME' on the server"
  exit 2
fi

cyan "=========================================="
green "  Backend deploy complete"
cyan "=========================================="
