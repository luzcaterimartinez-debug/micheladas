/**
 * Nitro (Build Output API) no empaqueta api/*.py. Este script corre tras `vite build`
 * y añade la función Python FastAPI a `.vercel/output/functions/`.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outputDir = path.join(root, ".vercel/output");
const funcDir = path.join(outputDir, "functions/api/[...path].func");

const SKIP_DIRS = new Set([
  "__pycache__",
  ".pytest_cache",
  "venv",
  ".venv",
  "node_modules",
  "backups",
  "tests",
]);
const SKIP_FILES = new Set([".env"]);

function shouldSkip(name) {
  return SKIP_DIRS.has(name) || SKIP_FILES.has(name);
}

function copyRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (shouldSkip(entry.name)) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (!fs.existsSync(path.join(outputDir, "config.json"))) {
  console.error("No se encontró .vercel/output — ejecuta `vite build` primero.");
  process.exit(1);
}

fs.mkdirSync(funcDir, { recursive: true });

fs.copyFileSync(path.join(root, "api/[...path].py"), path.join(funcDir, "[...path].py"));
fs.copyFileSync(path.join(root, "api/requirements.txt"), path.join(funcDir, "requirements.txt"));
copyRecursive(path.join(root, "backend"), path.join(funcDir, "backend"));

fs.writeFileSync(
  path.join(funcDir, ".vc-config.json"),
  `${JSON.stringify(
    {
      runtime: "python3.12",
      handler: "[...path].py",
      launcherType: "Python",
      memory: 1024,
      maxDuration: 30,
    },
    null,
    2,
  )}\n`,
);

console.log("API Python empaquetada en", path.relative(root, funcDir));
