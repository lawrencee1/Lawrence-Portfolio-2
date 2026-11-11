#!/usr/bin/env bash
# Verify the latest pushed commit deployed on Vercel and the live site looks right.
# Usage: scripts/check-deploy.sh   (run from anywhere inside the repo)
set -uo pipefail

REPO="lawrencee1/Lawrence-Portfolio-2"
LIVE="https://lawrenceportfoliosmm.vercel.app"
OUT="/tmp/deploy-check"
SHA=$(git rev-parse HEAD)
mkdir -p "$OUT"

echo "Commit: ${SHA:0:7}"
echo "Waiting for Vercel status (up to 5 min)..."
STATE="pending"
for _ in $(seq 1 60); do
  STATE=$(gh api "repos/$REPO/commits/$SHA/status" --jq '[.statuses[] | select(.context=="Vercel")][0].state // "pending"' 2>/dev/null || echo pending)
  [ "$STATE" != "pending" ] && break
  sleep 5
done
DETAILS=$(gh api "repos/$REPO/commits/$SHA/status" --jq '[.statuses[] | select(.context=="Vercel")][0] | "\(.description) \(.target_url)"' 2>/dev/null)
echo "Vercel: $STATE — $DETAILS"

if [ "$STATE" != "success" ]; then
  echo "DEPLOY NOT SUCCESSFUL. Read the build logs (see CLAUDE.md) and fix."
  exit 1
fi

CODE=$(curl -s -o /dev/null -w '%{http_code}' "$LIVE")
echo "Live site HTTP: $CODE ($LIVE)"

node -e '
const { chromium } = require("playwright");
(async () => {
  const [live, out] = process.argv.slice(1);
  const b = await chromium.launch();
  for (const [name, w] of [["desktop", 1280], ["mobile", 390]]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    const errors = [];
    p.on("pageerror", e => errors.push(e.message));
    await p.goto(live + "?v=" + Date.now(), { waitUntil: "networkidle" });
    const sw = await p.evaluate(() => document.documentElement.scrollWidth);
    await p.screenshot({ path: `${out}/${name}.png`, fullPage: true });
    console.log(`${name}: ${out}/${name}.png  width=${sw}${sw > w ? "  (HORIZONTAL SCROLL!)" : ""}${errors.length ? "  JS errors: " + errors.join("; ") : ""}`);
  }
  await b.close();
})();
' "$LIVE" "$OUT"

[ "$CODE" = "200" ] || { echo "LIVE SITE NOT OK"; exit 1; }
echo "OK"
