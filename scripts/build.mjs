import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function run(label, command) {
  console.log(`\n› ${label}`);
  try {
    execSync(command, { cwd: root, stdio: "inherit", env: process.env });
  } catch (err) {
    const code = err && typeof err === "object" && "status" in err ? err.status : 1;
    console.error(`\n✗ Falló: ${label} (exit ${code})`);
    process.exit(typeof code === "number" && code > 0 ? code : 1);
  }
}

run("vite build", "npx vite build");
run("vercel-merge-api", "node scripts/vercel-merge-api.mjs");
