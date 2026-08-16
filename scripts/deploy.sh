#!/usr/bin/env bash
# Production deployment script — runs ON THE VPS, invoked over SSH by
# .github/workflows/deploy.yml on every push to main.
#
# A copy of this file is also expected to live at /var/www/brightsmile/deploy.sh
# on the VPS (that copy is what actually runs — this repo copy exists so the
# deployment logic is version-controlled and reviewable like any other code).
# If you edit this file, copy the change to the VPS too:
#   scp scripts/deploy.sh tanmay@200.234.37.212:/var/www/brightsmile/deploy.sh
#
# Safety contract (do not weaken):
#   - `set -euo pipefail` means any failing step (npm ci, npm run build, a
#     failed health check) aborts the script immediately.
#   - pm2 reload only runs AFTER a successful build — never before.
#   - .env.production is never touched. It is untracked (see repo .gitignore)
#     so `git reset --hard` cannot affect it.
#   - Nginx config is never touched.

set -euo pipefail

APP_DIR="/var/www/brightsmile"
PM2_APP="brightsmile"
HEALTH_URL_LOCAL="http://127.0.0.1:3000"
HEALTH_URL_PUBLIC="https://brightsmiledentalclinic.org"

cd "$APP_DIR"

PREVIOUS_SHA=$(git rev-parse HEAD)
echo "== Previous commit: $PREVIOUS_SHA =="
echo "$PREVIOUS_SHA" > "$APP_DIR/.last-deploy-previous-sha"

echo "== Fetching origin =="
git fetch origin

echo "== Checking out main =="
git checkout main
git reset --hard origin/main

DEPLOYED_SHA=$(git rev-parse HEAD)
echo "== Deploying commit: $DEPLOYED_SHA =="

if [ "$DEPLOYED_SHA" = "$PREVIOUS_SHA" ]; then
  echo "== No new commit — already up to date, skipping build/restart =="
  exit 0
fi

echo "== Installing dependencies (npm ci) =="
npm ci

echo "== Building (npm run build) =="
npm run build

echo "== Build succeeded — reloading PM2 =="
pm2 reload "$PM2_APP" --update-env
pm2 save

echo "== Waiting for app to come back up =="
sleep 4

echo "== Health check: local ($HEALTH_URL_LOCAL) =="
if ! curl -fsS --max-time 10 "$HEALTH_URL_LOCAL" > /dev/null; then
  echo "FAILED: local health check did not return 200"
  echo "Production process may be degraded — investigate with: pm2 logs $PM2_APP"
  exit 1
fi

echo "== Health check: public ($HEALTH_URL_PUBLIC) =="
if ! curl -fsS --max-time 15 "$HEALTH_URL_PUBLIC" > /dev/null; then
  echo "FAILED: public health check did not return 200"
  exit 1
fi

echo "== Deployment successful =="
echo "Deployed commit: $DEPLOYED_SHA"
echo "Previous commit (for rollback): $PREVIOUS_SHA"
