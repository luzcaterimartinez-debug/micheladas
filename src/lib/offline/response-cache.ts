/**
 * Caché de respuestas JSON del API en el navegador.
 * - Evita re-pegar a MySQL/Vercel en cada poll (Hostinger 500 conn/h).
 * - Si la red o la BD fallan, sirve la última respuesta buena (stale).
 */

import { fetchWithTimeout } from "@/lib/api-fetch";
import { markApiFailureFromStatus, markApiReachable, shouldSyncWithServer } from "@/lib/offline/network";
import { parseApiError } from "@/lib/auth";

type CacheEntry = {
  expiresAt: number;
  body: unknown;
  status: number;
};

const store = new Map<string, CacheEntry>();

/** TTLs por familia de endpoint (ms). */
export const RESPONSE_TTL = {
  comandas: 15_000,
  mesas: 20_000,
  caja: 15_000,
  inventario: 30_000,
  menu: 60_000,
  default: 12_000,
} as const;

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function responseCacheGet(key: string): CacheEntry | null {
  return store.get(key) ?? null;
}

export function responseCachePut(key: string, body: unknown, ttlMs: number): void {
  store.set(key, {
    expiresAt: Date.now() + Math.max(500, ttlMs),
    body: cloneJson(body),
    status: 200,
  });
}

export function responseCacheInvalidate(prefix: string): void {
  for (const key of [...store.keys()]) {
    if (key.startsWith(prefix) || key.includes(prefix)) {
      // Soft expire: conservamos body para stale.
      const hit = store.get(key);
      if (hit) store.set(key, { ...hit, expiresAt: 0 });
    }
  }
}

export function responseCacheInvalidateAll(): void {
  for (const key of [...store.keys()]) {
    const hit = store.get(key);
    if (hit) store.set(key, { ...hit, expiresAt: 0 });
  }
}

type CachedGetOpts = {
  url: string;
  headers?: HeadersInit;
  /** TTL fresco de la respuesta. */
  ttlMs?: number;
  /** Prefijo de invalidación (ej. "/api/comandas"). */
  cacheKey?: string;
  timeoutMs?: number;
  /** Si true y hay TTL vivo, no llama red. */
  preferCache?: boolean;
};

/**
 * GET JSON con caché + stale-on-error.
 * No llama a la red si:
 * - hay entrada fresca, o
 * - shouldSyncWithServer() es false y hay cualquier entrada (stale).
 */
export async function cachedGetJson<T = unknown>(opts: CachedGetOpts): Promise<T> {
  const key = opts.cacheKey ?? opts.url;
  const ttlMs = opts.ttlMs ?? RESPONSE_TTL.default;
  const now = Date.now();
  const hit = store.get(key);

  if (hit && now < hit.expiresAt) {
    return cloneJson(hit.body) as T;
  }

  // Sin servidor (cuota Hostinger / offline): servir stale si existe.
  if (!shouldSyncWithServer() && hit) {
    return cloneJson(hit.body) as T;
  }

  try {
    const res = await fetchWithTimeout(
      opts.url,
      {
        method: "GET",
        headers: opts.headers,
        cache: "no-store",
      },
      opts.timeoutMs,
    );
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const text =
        data && typeof data === "object"
          ? JSON.stringify(data)
          : typeof data === "string"
            ? data
            : undefined;
      markApiFailureFromStatus(res.status, text);
      // Stale: no romper el POS.
      if (hit) return cloneJson(hit.body) as T;
      throw new Error(parseApiError(data, res.status));
    }

    markApiReachable();
    responseCachePut(key, data, ttlMs);
    return cloneJson(data) as T;
  } catch (err) {
    if (hit) return cloneJson(hit.body) as T;
    throw err;
  }
}
