import { getStoredSession } from "@/lib/auth";
import { nextQueueOrderForToday } from "@/lib/comanda-queue";
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
import { FALLBACK_MENU } from "@/lib/menu-utils";
import type { Comanda } from "@/lib/micheladas-store";

import {
  getCachedComandas,
  nextLocalFolio,
  setCachedComandas,
  setCachedInventario,
  setCachedMenu,
  setCachedMesas,
} from "./local-cache";
import { isAppOnline, isNetworkFailure, LS_SYNC_META, notifySyncChange, readLocal, writeLocal } from "./network";
import { listOutbox, removeOp, type OutboxOp } from "./outbox";

let flushing = false;

async function applyOp(op: OutboxOp): Promise<void> {
  switch (op.type) {
    case "comanda:create":
      await createComandaApi(op.payload, op.clientId);
      break;
    case "comanda:patch":
      await patchComandaApi(op.comandaId, op.patch);
      break;
    case "comanda:delete":
      await deleteComandaApi(op.comandaId);
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
  if (!getStoredSession() || !isAppOnline()) return;

  const [comandas, mesas, inventario, menu] = await Promise.all([
    fetchComandas({ status: "pendiente,lista,entregada" }),
    fetchMesas(),
    fetchInventario(),
    fetchMenu(),
  ]);

  setCachedComandas(comandas);
  setCachedMesas(mesas);
  setCachedInventario(inventario);
  setCachedMenu(menu);

  writeLocal(LS_SYNC_META, { lastPullAt: Date.now() });
  notifySyncChange();
}

export async function flushOutbox(): Promise<{ synced: number; failed: number }> {
  if (!getStoredSession() || !isAppOnline() || flushing) {
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
        if (isNetworkFailure(err)) break;
        console.warn("Sync op failed permanently:", op.type, err);
        removeOp(op.opId);
        failed += 1;
      }
    }

    if (synced > 0) {
      await pullFreshData();
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

export function initOfflineSync(): () => void {
  if (typeof window === "undefined") return () => {};

  const onOnline = () => {
    void flushOutbox();
  };

  window.addEventListener("online", onOnline);

  if (getStoredSession() && isAppOnline()) {
    void flushOutbox();
  }

  return () => window.removeEventListener("online", onOnline);
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

export { FALLBACK_MENU };
