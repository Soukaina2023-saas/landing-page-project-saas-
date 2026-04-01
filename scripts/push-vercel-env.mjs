/**
 * Pushes selected keys from .env.local to Vercel (development).
 * Usage: node scripts/push-vercel-env.mjs
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const envPath = resolve(root, ".env.local");
const raw = readFileSync(envPath, "utf8");

function parseDotEnv(content) {
  const out = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (val.startsWith('"') && val.endsWith('"') && val.length >= 2) {
      val = val.slice(1, -1).replace(/\\n/g, "\n").replace(/\\"/g, '"');
    }
    out[key] = val;
  }
  return out;
}

const env = parseDotEnv(raw);
const keys = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_KEY",
  "DIRECT_URL",
  "GEMINI_API_KEY",
];

function runVercelAdd(name, value) {
  const r = spawnSync(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["vercel", "env", "add", name, "development", "--yes", "--force"],
    {
      cwd: root,
      input: value,
      encoding: "utf8",
      shell: false,
    },
  );
  if (r.status !== 0) {
    process.stderr.write(r.stderr ?? "");
    process.stdout.write(r.stdout ?? "");
    process.exit(r.status ?? 1);
  }
  process.stdout.write(`OK: ${name}\n`);
}

for (const k of keys) {
  const v = env[k];
  if (v === undefined) {
    process.stdout.write(`SKIP (missing in .env.local): ${k}\n`);
    continue;
  }
  if (k === "GEMINI_API_KEY" && v.trim() === "") {
    process.stdout.write(`SKIP (empty): ${k}\n`);
    continue;
  }
  runVercelAdd(k, v);
}
