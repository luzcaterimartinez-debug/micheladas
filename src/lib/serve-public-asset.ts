import { readFile } from "node:fs/promises";
import { join } from "node:path";

const PUBLIC_FILES = new Set([
  "/favicon.ico",
  "/apple-touch-icon.png",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/manifest.webmanifest",
  "/sw.js",
]);

const MIME: Record<string, string> = {
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".webmanifest": "application/manifest+json",
  ".js": "application/javascript",
};

export async function servePublicAsset(request: Request): Promise<Response | null> {
  const { pathname } = new URL(request.url);
  if (!PUBLIC_FILES.has(pathname)) return null;

  const ext = pathname.slice(pathname.lastIndexOf("."));
  const filePath = join(process.cwd(), "public", pathname.slice(1));

  try {
    const data = await readFile(filePath);
    return new Response(data, {
      headers: {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return null;
  }
}
