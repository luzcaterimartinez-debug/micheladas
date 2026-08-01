import { getStoredSession } from "@/lib/auth";
import { nextQueueOrderForToday, sortComandasByQueue } from "@/lib/comanda-queue";
import { fetchMenu } from "@/lib/menu-api";
import { fetchInventario } from "@/lib/inventory-api";
import {
  createComandaApi,
  deleteComandaApi,
  fetchComandas,
  fetchMesas,
  marcarMesaAtendidaApi,
  patchComandaApi,
  patchMesaApi,
} from "@/lib/pos-api";
import { patchInventarioStock } from "@/lib/inventory-api";
import { getFallbackMenu } from "@/lib/menu-utils";
import type { Comanda, Mesa } from "@/lib/micheladas-store";
import { isMesaVirtual } from "@/lib/pos-utils";

import {
  getCachedComandas,
  getCachedMesas,
  nextLocalFolio,
  setCachedComandas,
  setCachedInventario,
  setCachedMenu,
  setCachedMesas,
} from "./local-cache";
import {
  checkServerReachable,
  isRetryableSyncError,
  LS_SYNC_META,
  markApiUnreachable,
  notifySyncChange,
  readLocal,
  shouldSyncWithServer,
  writeLocal,
} from "./network";
import { getPendingCount, listOutbox, removeOp, removeOutboxOpsForComanda, type OutboxOp } from "./outbox";

let flushing = false;
let autoSyncInterval: ReturnType<typeof setInterval> | null = null;

function isNotFoundError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return msg.includes("no encontrada") || msg.includes("no encontrado") || msg.includes("404");
}

async function applyOp(op: OutboxOp): Promise<void> {
  switch (op.type) {
    case "comanda:create": {
      const created = await createComandaApi(op.payload, op.clientId);
      mergeComandaInCache(created);
      break;
    }
    case "comanda:patch":
      try {
        const updated = await patchComandaApi(op.comandaId, op.patch);
        mergeComandaInCache(updated);
      } catch (err) {
        if (isNotFoundError(err)) {
          discardLocalComanda(op.comandaId);
          return;
        }
        throw err;
      }
      break;
    case "comanda:delete":
      try {
        await deleteComandaApi(op.comandaId);
        removeComandaFromCache(op.comandaId);
      } catch (err) {
        if (isNotFoundError(err)) {
          discardLocalComanda(op.comandaId);
          return;
        }
        throw err;
      }
      break;
    case "mesa:atendida":
      await marcarMesaAtendidaApi(op.mesaId);
      break;
    case "mesa:patch":
      await patchMesaApi(op.mesaId, op.patch);
      break;
    case "inventario:patch":
      await patchInventarioStock(op.key, op.stock);
      break;
  }
}

export async function pullFreshData(): Promise<void> {
  if (!getStoredSession() || !shouldSyncWithServer()) return;

  try {
    const [comandas, mesas, inventario, menu] = await Promise.all([
      fetchComandas({ status: "pendiente,lista,entregada", limit: 500 }),
      fetchMesas(),
      fetchInventario(),
      fetchMenu(),
    ]);

    setCachedComandas(foldOutboxIntoComandas(comandas));
    setCachedMesas(mesas);
    setCachedInventario(inventario);
    setCachedMenu(menu);

    writeLocal(LS_SYNC_META, { ...readLocal(LS_SYNC_META, {}), lastPullAt: Date.now() });
    notifySyncChange();
  } catch (err) {
    if (isRetryableSyncError(err)) return;
    console.warn("pullFreshData:", err);
  }
}

/** Sube el outbox y refresca datos del servidor. */
export async function runAutoSync(): Promise<{ synced: number; failed: number }> {
  if (!getStoredSession() || !shouldSyncWithServer()) {
    return { synced: 0, failed: 0 };
  }
  const result = await flushOutbox();
  await pullFreshData();
  return result;
}

export async function flushOutbox(): Promise<{ synced: number; failed: number }> {
  if (!getStoredSession() || !shouldSyncWithServer() || flushing) {
    return { synced: 0, failed: 0 };
  }

  flushing = true;
  let synced = 0;
  let failed = 0;

  try {
    const ops = listOutbox();
    for (const op of ops) {
      try {
        await applyOp(op);
        removeOp(op.opId);
        synced += 1;
      } catch (err) {
        if (isRetryableSyncError(err)) break;
        console.warn("Sync op failed permanently:", op.type, err);
        removeOp(op.opId);
        failed += 1;
      }
    }

    writeLocal(LS_SYNC_META, {
      ...readLocal(LS_SYNC_META, {}),
      lastSyncAt: Date.now(),
      lastSyncedCount: synced,
    });
    notifySyncChange();
  } finally {
    flushing = false;
  }

  return { synced, failed };
}

export function buildOptimisticComanda(
  input: Omit<Comanda, "id" | "folio" | "queueOrder" | "createdAt" | "status">,
  clientId: string,
): Comanda {
  const prev = getCachedComandas();
  return {
    ...input,
    id: clientId,
    folio: nextLocalFolio(),
    queueOrder: nextQueueOrderForToday(prev),
    createdAt: Date.now(),
    status: "pendiente",
  };
}

/**
 * Aplica operaciones pendientes del outbox sobre la lista del servidor,
 * para que un "Atendido" offline no reaparezca al refrescar.
 */
export function foldOutboxIntoComandas(serverComandas: Comanda[]): Comanda[] {
  let list = [...serverComandas];
  for (const op of listOutbox()) {
    if (op.type === "comanda:create") {
      if (!list.some((c) => c.id === op.clientId)) {
        list.push(buildOptimisticComanda(op.payload, op.clientId));
      }
    } else if (op.type === "comanda:patch") {
      list = list.map((c) => (c.id === op.comandaId ? { ...c, ...op.patch } : c));
    } else if (op.type === "comanda:delete") {
      list = list.filter((c) => c.id !== op.comandaId);
    }
  }
  return list.sort(sortComandasByQueue);
}

export function discardLocalComanda(comandaId: string): void {
  removeOutboxOpsForComanda(comandaId);
  removeComandaFromCache(comandaId);
}

export function mergeComandaInCache(comanda: Comanda): void {
  const all = getCachedComandas();
  const idx = all.findIndex((c) => c.id === comanda.id);
  if (idx >= 0) {
    all[idx] = comanda;
  } else {
    all.push(comanda);
  }
  setCachedComandas(all);
}

export function patchComandaInCache(id: string, patch: Partial<Comanda>): void {
  setCachedComandas(
    getCachedComandas().map((c) => (c.id === id ? { ...c, ...patch } : c)),
  );
}

export function removeComandaFromCache(id: string): void {
  setCachedComandas(getCachedComandas().filter((c) => c.id !== id));
}

/** Marca mesa ocupada en caché local (mesas reales del salón). */
export function markMesaOcupadaLocally(
  mesaId: string | undefined,
  cliente: string,
  mesasFallback: Mesa[],
): void {
  if (!mesaId || isMesaVirtual(mesaId)) return;
  const next = getCachedMesas(mesasFallback).map((m) =>
    m.id === mesaId ? { ...m, estado: "ocupada" as const, cliente } : m,
  );
  setCachedMesas(next);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("michelada-mesas-change"));
  }
}

/** Libera mesa en caché si ya no tiene comandas activas. */
export function maybeLiberarMesaLocally(mesaId: string | undefined, mesasFallback: Mesa[]): void {
  if (!mesaId || isMesaVirtual(mesaId)) return;
  const activas = getCachedComandas().filter(
    (c) => c.mesaId === mesaId && (c.status === "pendiente" || c.status === "lista"),
  );
  if (activas.length > 0) return;
  const next = getCachedMesas(mesasFallback).map((m) =>
    m.id === mesaId ? { ...m, estado: "libre" as const, cliente: undefined } : m,
  );
  setCachedMesas(next);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("michelada-mesas-change"));
  }
}

/** Libera mesa y marca comandas activas como entregada (optimista / offline). */
export function applyMesaAtendidaLocally(mesaId: string, mesasFallback: Mesa[]): Mesa {
  const mesas = getCachedMesas(mesasFallback).map((m) =>
    m.id === mesaId ? { ...m, estado: "libre" as const, cliente: undefined } : m,
  );
  setCachedMesas(mesas);

  setCachedComandas(
    getCachedComandas().map((c) =>
      c.mesaId === mesaId && (c.status === "pendiente" || c.status === "lista")
        ? { ...c, status: "entregada" as const }
        : c,
    ),
  );

  const mesa = mesas.find((m) => m.id === mesaId);
  if (!mesa) throw new Error("Mesa no encontrada");
  return mesa;
}

export function initOfflineSync(): () => void {
  if (typeof window === "undefined") return () => {};

  const onRecovered = () => {
    void runAutoSync();
  };

  const onOnline = () => {
    void checkServerReachable().then((ok) => {
      if (ok) void runAutoSync();
    });
  };

  const onOffline = () => {
    markApiUnreachable();
  };

  window.addEventListener("michelada-api-recovered", onRecovered);
  window.addEventListener("online", onOnline);
  window.addEventListener("offline", onOffline);

  if (getStoredSession()) {
    void checkServerReachable().then((ok) => {
      if (ok) void runAutoSync();
    });
  }

  autoSyncInterval = window.setInterval(() => {
    if (!getStoredSession() || !shouldSyncWithServer()) return;
    if (getPendingCount() > 0) void runAutoSync();
  }, 20_000);

  return () => {
    window.removeEventListener("michelada-api-recovered", onRecovered);
    window.removeEventListener("online", onOnline);
    window.removeEventListener("offline", onOffline);
    if (autoSyncInterval != null) {
      window.clearInterval(autoSyncInterval);
      autoSyncInterval = null;
    }
  };
}

export function getLastSyncMeta(): { lastSyncAt?: number; lastPullAt?: number } {
  return readLocal(LS_SYNC_META, {});
}

export function hasCachedMenu(): boolean {
  return readLocal(LS_SYNC_META, {} as { menuCached?: boolean }).menuCached === true
    || localStorage.getItem("michelada_menu_v1") != null;
}

export function markMenuCached(): void {
  writeLocal(LS_SYNC_META, { ...readLocal(LS_SYNC_META, {}), menuCached: true });
}
