import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

execSync("vite build", { cwd: root, stdio: "inherit" });
execSync("node scripts/vercel-merge-api.mjs", { cwd: root, stdio: "inherit" });
