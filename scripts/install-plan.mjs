import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const cwd = "/vercel/share/v0-project";

console.log("[v0] Running: npx shadcn@latest add @tool-ui/plan");
try {
  const out = execSync(
    "npx --yes shadcn@latest add @tool-ui/plan --yes --overwrite",
    { cwd, stdio: "pipe", encoding: "utf8" }
  );
  console.log(out);
} catch (e) {
  console.log("[v0] shadcn CLI stdout:");
  console.log(e.stdout?.toString?.() ?? "");
  console.log("[v0] shadcn CLI stderr:");
  console.log(e.stderr?.toString?.() ?? "");
  console.log("[v0] Exit code:", e.status);
}

const candidates = [
  "src/components/tool-ui/plan.tsx",
  "components/tool-ui/plan.tsx",
];
for (const rel of candidates) {
  const p = resolve(cwd, rel);
  if (existsSync(p)) {
    console.log(`\n[v0] ✓ Found file: ${rel}`);
    const content = readFileSync(p, "utf8");
    console.log(`[v0] First 120 lines:\n`);
    console.log(content.split("\n").slice(0, 120).join("\n"));
    break;
  }
}
