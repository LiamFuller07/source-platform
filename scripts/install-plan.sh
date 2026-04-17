#!/usr/bin/env bash
set -euo pipefail

cd /vercel/share/v0-project

echo "[v0] Running: npx shadcn@latest add @tool-ui/plan"
npx --yes shadcn@latest add @tool-ui/plan --yes --overwrite 2>&1 || true

echo ""
echo "[v0] Resulting Plan file (first 80 lines):"
if [ -f src/components/tool-ui/plan.tsx ]; then
  head -n 80 src/components/tool-ui/plan.tsx
elif [ -f components/tool-ui/plan.tsx ]; then
  head -n 80 components/tool-ui/plan.tsx
else
  echo "[v0] No plan.tsx found at expected paths."
fi
