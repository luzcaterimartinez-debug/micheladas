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
  "scripts",
  "database",
]);
const SKIP_FILES = new Set([
  ".env",
  ".gitignore",
  "README.md",
  "pytest.ini",
  ".env.example",
  ".env.local.example",
  ".env.production.example",
  "requirements-dev.txt",
  "test_db_connection.py",
  "pytest.ini",
  "pyproject.toml",
  "bun.lock",
  "bunfig.toml",
  "tsconfig.json",
  "vite.config.ts",
  "vitest.config.ts",
  "package-lock.json",
  "package.json",
]);

/** Carpetas que no aportan al runtime y engordan el unzip de la función. */
const PRUNE_DIR_NAMES = new Set([
  "__pycache__",
  ".pytest_cache",
  "tests",
  "test",
  "testing",
  "examples",
  "docs",
  "doc",
  "documentation",
  "demo",
  "benchmarks",
  "benchmark",
]);

function rmRecursive(target) {
  if (!fs.existsSync(target)) return;
  try {
    fs.rmSync(target, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    return;
  } catch {
    // Fallback Windows / archivos bloqueados: vaciar contenido y reintentar
  }
  if (process.platform === "win32") {
    try {
      execSync(
        `powershell -NoProfile -Command "Get-ChildItem -LiteralPath '${target.replace(/'/g, "''")}' -Force | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue; Remove-Item -LiteralPath '${target.replace(/'/g, "''")}' -Recurse -Force -ErrorAction SilentlyContinue"`,
        { stdio: "ignore" },
      );
    } catch {
      console.warn(`No se pudo limpiar por completo: ${target}`);
    }
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

function pythonCmd() {
  for (const cmd of ["python3", "python"]) {
    try {
      execSync(`${cmd} --version`, { stdio: "ignore" });
      return cmd;
    } catch {
      // try next
    }
  }
  throw new Error("No se encontró python3 ni python en PATH");
}

function prunePythonBundle(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (
        PRUNE_DIR_NAMES.has(entry.name) ||
        entry.name.endsWith(".dist-info") ||
        entry.name.endsWith(".egg-info")
      ) {
        rmRecursive(full);
        continue;
      }
      prunePythonBundle(full);
      continue;
    }
    // SOLO eliminar archivos 100% seguros, no metadata/configs que los paquetes necesiten
    if (
      entry.name.endsWith(".pyc") ||
      entry.name.endsWith(".pyo") ||
      entry.name === "RECORD" ||
      entry.name === "INSTALLER" ||
      entry.name === "WHEEL" ||
      entry.name === "direct_url.json" ||
      entry.name.endsWith(".whl") ||
      entry.name.endsWith(".md") ||
      entry.name.endsWith(".rst") ||
      entry.name.endsWith(".zip") ||
      entry.name.endsWith(".tar.gz") ||
      entry.name.endsWith(".c") ||
      entry.name.endsWith(".h")
    ) {
      try {
        fs.unlinkSync(full);
      } catch (e) {
        // ignore errors
      }
    }
  }
}

function aggressivePrune(targetDir) {
  // SOLO eliminar archivos 100% seguros (stubs de tipado, no afectan runtime)
  const removeStubFiles = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        removeStubFiles(full);
      } else if (entry.name.endsWith(".pyi") || entry.name.endsWith(".pxd")) {
        try { fs.unlinkSync(full); } catch {}
      }
    }
  };
  removeStubFiles(targetDir);
}

function installPythonDeps(targetDir) {
  const requirements = path.join(targetDir, "requirements.txt");
  if (!fs.existsSync(requirements)) {
    throw new Error(`Falta requirements.txt en ${targetDir}`);
  }

  const py = pythonCmd();
  const args = [
    "-m",
    "pip",
    "install",
    "-r",
    "requirements.txt",
    "-t",
    ".",
    "--no-cache-dir",
    "--no-compile",
    "--disable-pip-version-check",
  ];

  // Empaquetar wheels Linux para Lambda cuando el build corre fuera de Vercel/Linux
  if (process.platform !== "linux") {
    args.push(
      "--platform",
      "manylinux2014_x86_64",
      "--python-version",
      "3.12",
      "--implementation",
      "cp",
      "--only-binary",
      ":all:",
    );
  }

  console.log(`Instalando dependencias Python en ${path.relative(root, targetDir)} ...`);
  execSync([py, ...args].join(" "), { cwd: targetDir, stdio: "inherit" });

  // Evitar que Vercel vuelva a instalar deps (duplica tamaño y suma el runtime)
  fs.unlinkSync(requirements);
  prunePythonBundle(targetDir);
  aggressivePrune(targetDir);

  // Eliminar requirements que hayan quedado en el directorio backend
  const backendReq = path.join(targetDir, "backend", "requirements.txt");
  const backendReqDev = path.join(targetDir, "backend", "requirements-dev.txt");
  if (fs.existsSync(backendReq)) try { fs.unlinkSync(backendReq); } catch {}
  if (fs.existsSync(backendReqDev)) try { fs.unlinkSync(backendReqDev); } catch {}

  if (!fs.existsSync(path.join(targetDir, "fastapi"))) {
    throw new Error("pip install no generó el paquete fastapi en el bundle");
  }
  console.log("Dependencias Python empaquetadas correctamente");
  if (fs.existsSync(path.join(targetDir, "fastapi/__init__.py"))) {
    try {
      const initContent = fs.readFileSync(path.join(targetDir, "fastapi/__init__.py"), "utf8");
      const versionMatch = initContent.match(/__version__\s*=\s*["']([^"']+)["']/);
      if (versionMatch) {
        console.log(`  → fastapi ${versionMatch[1]}`);
      }
    } catch {}
  }

  const sizeBytes = walkSize(targetDir);
  console.log(`Tamaño API (sin runtime Vercel): ${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`);
}

function walkSize(dir) {
  let total = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) total += walkSize(full);
    else total += fs.statSync(full).size;
  }
  return total;
}

function copyPwaAssets() {
  const distDir = path.join(root, "dist");
  const publicDir = path.join(root, "public");
  const staticDir = path.join(outputDir, "static");
  if (!fs.existsSync(staticDir)) {
    console.warn("No se copiaron assets PWA (falta static/)");
    return;
  }

  const swSrc = path.join(distDir, "sw.js");
  if (fs.existsSync(swSrc)) {
    fs.copyFileSync(swSrc, path.join(staticDir, "sw.js"));
    console.log("PWA: sw.js → static/");
  }

  if (fs.existsSync(distDir)) {
    for (const entry of fs.readdirSync(distDir)) {
      if (entry.startsWith("workbox-") && entry.endsWith(".js")) {
        fs.copyFileSync(path.join(distDir, entry), path.join(staticDir, entry));
        console.log(`PWA: ${entry} → static/`);
      }
    }
  }

  // Asegurar iconos/manifest aunque Nitro no los haya copiado
  const publicAssets = [
    "favicon.ico",
    "apple-touch-icon.png",
    "icon-192x192.png",
    "icon-512x512.png",
    "manifest.webmanifest",
  ];
  for (const name of publicAssets) {
    const src = path.join(publicDir, name);
    if (!fs.existsSync(src)) continue;
    fs.copyFileSync(src, path.join(staticDir, name));
    console.log(`PWA: public/${name} → static/`);
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

// Limpiar handlers previos (incluyendo acumular deps en redeploys locales)
rmRecursive(path.join(outputDir, "functions/api/[...path].func"));
rmRecursive(funcDir);

fs.mkdirSync(funcDir, { recursive: true });

fs.copyFileSync(path.join(root, "api/index.py"), path.join(funcDir, "index.py"));

const vercelRequirements = path.join(root, "api/requirements-vercel.txt");
const sourceRequirements = fs.existsSync(vercelRequirements)
  ? vercelRequirements
  : path.join(root, "api/requirements.txt");
fs.copyFileSync(sourceRequirements, path.join(funcDir, "requirements.txt"));
fs.writeFileSync(
  path.join(funcDir, "pyproject.toml"),
  `[project]
name = "micheladas-api"
version = "1.0.0"
requires-python = ">=3.12"

[tool.vercel]
entrypoint = "index:handler"
`,
);
copyRecursive(path.join(root, "backend"), path.join(funcDir, "backend"));

fs.writeFileSync(
  path.join(funcDir, ".vc-config.json"),
  `${JSON.stringify(
    {
      handler: "index.handler",
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
copyPwaAssets();
installPythonDeps(funcDir);

const indexSource = fs.readFileSync(path.join(funcDir, "index.py"), "utf8");
if (!indexSource.includes("class handler(BaseHTTPRequestHandler)") || !indexSource.includes("TestClient")) {
  console.error("ERROR: api/index.py debe definir class handler(BaseHTTPRequestHandler).");
  process.exit(1);
}

const indexPy = path.join(funcDir, "index.py");
if (!fs.existsSync(indexPy)) {
  console.error("ERROR: no se generó api/index.func/index.py");
  process.exit(1);
}

console.log("API Python empaquetada en", path.relative(root, funcDir));
