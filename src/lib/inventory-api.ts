import { getApiUrl, getStoredSession, parseApiError } from "@/lib/auth";
import { markApiFailureFromStatus } from "@/lib/offline/network";
import {
  RESPONSE_TTL,
  cachedGetJson,
  responseCacheInvalidate,
} from "@/lib/offline/response-cache";
import type { InventoryItem } from "@/lib/micheladas-store";

function assertOk(res: Response, data: unknown): asserts res is Response & { ok: true } {
  if (!res.ok) {
    const text =
      data && typeof data === "object"
        ? JSON.stringify(data)
        : typeof data === "string"
          ? data
          : undefined;
    markApiFailureFromStatus(res.status, text);
    throw new Error(parseApiError(data, res.status));
  }
}

function authHeaders(): HeadersInit {
  const session = getStoredSession();
  if (!session) throw new Error("Sesión expirada");
  return {
    Authorization: `Bearer ${session.accessToken}`,
    "Content-Type": "application/json",
  };
}

function mapItem(raw: Record<string, unknown>): InventoryItem {
  return {
    key: String(raw.key),
    name: String(raw.name),
    stock: Number(raw.stock),
    unit: String(raw.unit),
    minStock: Number(raw.minStock ?? 5),
  };
}

function invalidateInv(): void {
  responseCacheInvalidate("/api/inventario");
}

export async function fetchInventario(): Promise<InventoryItem[]> {
  const url = `${getApiUrl()}/api/inventario`;
  const data = await cachedGetJson<Record<string, unknown>[]>({
    url,
    headers: authHeaders(),
    ttlMs: RESPONSE_TTL.inventario,
    cacheKey: url,
  });
  return data.map(mapItem);
}

export async function patchInventarioStock(key: string, stock: number): Promise<InventoryItem> {
  const res = await fetch(`${getApiUrl()}/api/inventario/${encodeURIComponent(key)}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ stock }),
  });
  const data = await res.json().catch(() => ({}));
  assertOk(res, data);
  invalidateInv();
  return mapItem(data as Record<string, unknown>);
}

export async function resetInventarioApi(): Promise<InventoryItem[]> {
  const res = await fetch(`${getApiUrl()}/api/inventario/reset`, {
    method: "POST",
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => []);
  assertOk(res, data);
  invalidateInv();
  return (data as Record<string, unknown>[]).map(mapItem);
}

export async function deleteInventarioItem(key: string): Promise<void> {
  const res = await fetch(`${getApiUrl()}/api/inventario/${encodeURIComponent(key)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    markApiFailureFromStatus(res.status);
    throw new Error(parseApiError(data, res.status));
  }
  invalidateInv();
}
