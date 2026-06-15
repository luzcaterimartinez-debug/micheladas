/**
 * Nitro (Build Output API) no empaqueta api/*.py. Este script corre tras `vite build`
 * y añade la función Python FastAPI a `.vercel/output/functions/api/index.func`.
 *
 * Vercel no soporta catch-all `[...path]` fuera de Next.js: todas las rutas /api/*
 * deben reescribirse a un único handler (`/api/index`).
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outputDir = path.join(root, ".vercel/output");
const funcDir = path.join(outputDir, "functions/api/index.func");

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

function rmRecursive(target) {
  if (!fs.existsSync(target)) return;
  if (process.platform === "win32") {
    execSync(
      `powershell -NoProfile -Command "Remove-Item -LiteralPath '${target.replace(/'/g, "''")}' -Recurse -Force"`,
    );
    return;
  }
  fs.rmSync(target, { recursive: true, force: true });
}
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

function patchConfigRoutes() {
  const configPath = path.join(outputDir, "config.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

  const otherRoutes = (config.routes ?? []).filter(
    (route) => !(typeof route.src === "string" && route.src.includes("/api")),
  );

  config.routes = [
    {
      src: "/api(?:/(.*))?",
      dest: "/api/index",
    },
    ...otherRoutes,
  ];

  fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
}

if (!fs.existsSync(path.join(outputDir, "config.json"))) {
  console.error("No se encontró .vercel/output — ejecuta `vite build` primero.");
  process.exit(1);
}

// Limpiar handler catch-all anterior si existía
rmRecursive(path.join(outputDir, "functions/api/[...path].func"));

fs.mkdirSync(funcDir, { recursive: true });

fs.copyFileSync(path.join(root, "api/index.py"), path.join(funcDir, "index.py"));
fs.copyFileSync(path.join(root, "api/requirements.txt"), path.join(funcDir, "requirements.txt"));
if (fs.existsSync(path.join(root, "pyproject.toml"))) {
  fs.copyFileSync(path.join(root, "pyproject.toml"), path.join(funcDir, "pyproject.toml"));
}
copyRecursive(path.join(root, "backend"), path.join(funcDir, "backend"));

fs.writeFileSync(
  path.join(funcDir, ".vc-config.json"),
  `${JSON.stringify(
    {
      handler: "index.app",
      runtime: "python3.12",
      environment: {},
      memory: 1024,
      maxDuration: 30,
    },
    null,
    2,
  )}\n`,
);

patchConfigRoutes();

const indexPy = path.join(funcDir, "index.py");
if (!fs.existsSync(indexPy)) {
  console.error("ERROR: no se generó api/index.func/index.py");
  process.exit(1);
}

console.log("API Python empaquetada en", path.relative(root, funcDir));
