import { useCallback, useEffect, useRef, useState } from "react";

import { getStoredSession } from "@/lib/auth";
import {
  fetchInventario,
  patchInventarioStock,
  resetInventarioApi,
} from "@/lib/inventory-api";
import { nextQueueOrderForToday, sortComandasByQueue } from "@/lib/comanda-queue";
import { notifyComandaNueva } from "@/lib/comanda-print";
import {
  getCachedComandas,
  getCachedInventario,
  getCachedMesas,
  LS_COMANDAS,
  nextLocalFolio,
  setCachedComandas,
  setCachedInventario,
  setCachedMesas,
} from "@/lib/offline/local-cache";
import {
  isNetworkFailure,
  isRetryableSyncError,
  notifySyncChange,
  shouldPollServer,
  shouldSyncWithServer,
} from "@/lib/offline/network";
import {
  buildOptimisticComanda,
  discardLocalComanda,
  flushOutbox,
  foldOutboxIntoComandas,
  mergeComandaInCache,
  patchComandaInCache,
  removeComandaFromCache,
  applyMesaAtendidaLocally,
  markMesaOcupadaLocally,
  maybeLiberarMesaLocally,
} from "@/lib/offline/sync-engine";
import { enqueueOp } from "@/lib/offline/outbox";
import {
  createComandaApi,
  createMesaApi,
  deleteComandaApi,
  deleteMesaApi,
  fetchComandas,
  fetchMesas,
  marcarMesaAtendidaApi,
  patchComandaApi,
  patchMesaApi,
} from "@/lib/pos-api";

import type { ConsumoLine, FaseOpcion } from "@/lib/fases";

/** @deprecated Usar FaseOpcion */
export type Topping = FaseOpcion;

export type MicheladaType = {
  id: string;
  name: string;
  price: number;
  description: string;
  /** Opciones de fase asignadas al producto (topping, néctar, etc.). */
  faseOpciones: FaseOpcion[];
  /** Consumo base del producto (cerveza, limón, etc.). */
  consumo?: ConsumoLine[];
  /** Pasos del pedido: "fase:topping", "fase:nectar", "notas" */
  pasos?: string[];
  categoriaId?: string;
};
export type Addition = {
  id: string;
  name: string;
  price: number;
  stockKey?: string;
  /** Cantidad descontada del inventario al vender (misma unidad que el ítem: g, L, pz). */
  cantidad?: number;
};

export type InventoryItem = {
  key: string;
  name: string;
  stock: number;
  unit: string;
  minStock?: number;
};

export type OrderItem = {
  id: string;
  micheladaId: string;
  micheladaName: string;
  /** Legacy: comandas antiguas; los productos nuevos no usan tamaño como variante. */
  size?: string | null;
  basePrice: number;
  /** Unidades iguales de este ítem (default 1). */
  quantity?: number;
  selectedToppings: string[]; // topping ids
  additions: { id: string; name: string; price: number; quantity?: number }[];
  notes?: string;
  /** Cargo extra por unidad (p. ej. para llevar = 1000). */
  llevarExtra?: number;
  total: number;
};

export type Comanda = {
  id: string;
  folio: number;
  /** Turno en cola del día (1 = primero en barra). */
  queueOrder: number;
  cliente: string;
  mesa?: string;
  mesaId?: string;
  meseroId?: number;
  items: OrderItem[];
  total: number;
  createdAt: number;
  status: "pendiente" | "lista" | "entregada";
  pagado?: boolean;
  metodoPago?: "efectivo" | "tarjeta" | "transferencia" | "mixto";
  montoPagado?: number;
  propina?: number;
  pagoEfectivo?: number;
  pagoTarjeta?: number;
  pagoTransferencia?: number;
  pagadoEn?: number;
  cobradoPorId?: number;
};

export type Mesa = {
  id: string;
  nombre: string;
  capacidad: number;
  estado: "libre" | "ocupada" | "reservada";
  cliente?: string;
};

const DEFAULT_PASOS = ["fase:topping", "notas"];

function tops(
  items: { id: string; name: string }[],
  faseId = "topping",
): FaseOpcion[] {
  return items.map((t) => ({ ...t, faseId, faseName: "Topping" }));
}

const CLASICA_TOPS = tops([
  { id: "chamoy", name: "Chamoy" },
  { id: "tajin", name: "Tajín" },
  { id: "salsa_inglesa", name: "Salsa inglesa" },
  { id: "salsa_maggi", name: "Salsa Maggi" },
  { id: "limon_extra", name: "Limón extra" },
  { id: "sal_gusano", name: "Sal de gusano" },
]);

/** Cada tamaño es un producto distinto (precio, descripción y toppings propios). */
export const MICHELADAS: MicheladaType[] = [
  {
    id: "clasica_chica",
    name: "Michelada Clásica · Chica",
    price: 48,
    description: "12 oz — cerveza, limón y escarchado clásico",
    pasos: DEFAULT_PASOS,
    faseOpciones: CLASICA_TOPS.slice(0, 4),
  },
  {
    id: "clasica_mediana",
    name: "Michelada Clásica · Mediana",
    price: 60,
    description: "16 oz — cerveza, limón, salsas y escarchado clásico",
    pasos: DEFAULT_PASOS,
    faseOpciones: CLASICA_TOPS,
  },
  {
    id: "clasica_grande",
    name: "Michelada Clásica · Grande",
    price: 84,
    description: "24 oz — porción grande con extra limón y escarchado",
    pasos: DEFAULT_PASOS,
    faseOpciones: CLASICA_TOPS,
  },
  {
    id: "cubana_mediana",
    name: "Michelada Cubana · Mediana",
    price: 75,
    description: "16 oz — clamato, picante y escarcha de tamarindo",
    pasos: DEFAULT_PASOS,
    faseOpciones: tops([
      { id: "chamoy", name: "Chamoy" },
      { id: "tajin", name: "Tajín" },
      { id: "tamarindo", name: "Escarcha de tamarindo" },
      { id: "salsa_habanero", name: "Salsa habanero" },
      { id: "valentina", name: "Salsa Valentina" },
    ]),
  },
  {
    id: "mango_mediana",
    name: "Michelada de Mango · Mediana",
    price: 80,
    description: "16 oz — dulce y picante con trozos de mango",
    pasos: DEFAULT_PASOS,
    faseOpciones: tops([
      { id: "chamoy", name: "Chamoy" },
      { id: "tajin", name: "Tajín" },
      { id: "mango_trozos", name: "Trozos de mango" },
      { id: "miguelito", name: "Miguelito" },
    ]),
  },
  {
    id: "frutos_rojos_grande",
    name: "Michelada Frutos Rojos · Grande",
    price: 95,
    description: "24 oz — jarabe de frutos rojos y escarcha dulce",
    pasos: DEFAULT_PASOS,
    faseOpciones: tops([
      { id: "chamoy", name: "Chamoy" },
      { id: "miguelito", name: "Miguelito" },
      { id: "azucar", name: "Escarcha de azúcar" },
      { id: "fresa", name: "Trozos de fresa" },
    ]),
  },
];

export const ADDITIONS: Addition[] = [
  { id: "cereza", name: "Cereza", price: 3000, stockKey: "cereza" },
  { id: "fresa", name: "Fresa", price: 3000, stockKey: "fresa" },
  { id: "sandia", name: "Sandía", price: 3000, stockKey: "sandia" },
  { id: "maracuya", name: "Maracuyá", price: 3000, stockKey: "maracuya" },
  { id: "mango", name: "Mango", price: 3000, stockKey: "mango" },
  { id: "sal", name: "Sal", price: 3000, stockKey: "sal" },
  { id: "trululu", name: "Trululu", price: 3000, stockKey: "trululu" },
];

const DEFAULT_INVENTORY: InventoryItem[] = [
  { key: "ginger", name: "Ginger ale", stock: 48, unit: "pz", minStock: 12 },
  { key: "soda", name: "Soda", stock: 48, unit: "pz", minStock: 12 },
  { key: "cerveza", name: "Cerveza (botellas)", stock: 96, unit: "pz", minStock: 10 },
  { key: "cola_pola", name: "Cola y pola", stock: 48, unit: "pz", minStock: 12 },
  { key: "smirnoff", name: "Smirnoff", stock: 24, unit: "pz", minStock: 6 },
  { key: "coronita", name: "Coronita", stock: 48, unit: "pz", minStock: 12 },
  { key: "corona", name: "Corona", stock: 48, unit: "pz", minStock: 12 },
  { key: "cerveza_latona", name: "Cerveza latona", stock: 48, unit: "pz", minStock: 12 },
  { key: "cerveza_personal", name: "Cerveza personal", stock: 48, unit: "pz", minStock: 12 },
  { key: "poker", name: "Poker", stock: 48, unit: "pz", minStock: 12 },
  { key: "aguila", name: "Águila", stock: 48, unit: "pz", minStock: 12 },
  { key: "cerveza_light", name: "Light", stock: 48, unit: "pz", minStock: 12 },
  { key: "budweiser", name: "Budweiser", stock: 48, unit: "pz", minStock: 12 },
  { key: "ginger_litro_medio", name: "Ginger 1.5 L", stock: 24, unit: "pz", minStock: 6 },
  { key: "clamato", name: "Clamato", stock: 8, unit: "L", minStock: 2 },
  { key: "limon", name: "Limón", stock: 100, unit: "pz", minStock: 15 },
  { key: "chamoy", name: "Chamoy", stock: 3, unit: "L", minStock: 1 },
  { key: "tajin", name: "Tajín", stock: 1500, unit: "g", minStock: 200 },
  { key: "cereza", name: "Cereza", stock: 50, unit: "pz", minStock: 10 },
  { key: "fresa", name: "Fresa", stock: 50, unit: "pz", minStock: 10 },
  { key: "sandia", name: "Sandía", stock: 50, unit: "pz", minStock: 10 },
  { key: "maracuya", name: "Maracuyá", stock: 50, unit: "pz", minStock: 10 },
  { key: "mango", name: "Mango", stock: 50, unit: "pz", minStock: 10 },
  { key: "sal", name: "Sal", stock: 50, unit: "pz", minStock: 10 },
  { key: "trululu", name: "Trululu", stock: 50, unit: "pz", minStock: 10 },
];

const DEFAULT_MESAS: Mesa[] = [
  { id: "m1", nombre: "Mesa 1", capacidad: 4, estado: "libre" },
  { id: "m2", nombre: "Mesa 2", capacidad: 4, estado: "libre" },
  { id: "m3", nombre: "Mesa 3", capacidad: 2, estado: "libre" },
  { id: "m4", nombre: "Mesa 4", capacidad: 6, estado: "libre" },
  { id: "m5", nombre: "Mesa 5", capacidad: 4, estado: "libre" },
  { id: "barra", nombre: "Barra", capacidad: 8, estado: "libre" },
  { id: "llevar", nombre: "Para llevar", capacidad: 0, estado: "libre" },
];

export function useComandas() {
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reloadingRef = useRef(false);

  const applyFromCache = useCallback(() => {
    setComandas(foldOutboxIntoComandas(getCachedComandas()).sort(sortComandasByQueue));
  }, []);

  const reload = useCallback(async () => {
    if (reloadingRef.current) return;
    reloadingRef.current = true;
    try {
      if (!getStoredSession()) {
        applyFromCache();
        setLoading(false);
        return;
      }

      const cached = getCachedComandas();
      // Mostrar caché al instante mientras se pide al servidor.
      if (cached.length > 0) {
        setComandas(foldOutboxIntoComandas([...cached]).sort(sortComandasByQueue));
      }

      if (!shouldSyncWithServer() || !shouldPollServer("comandas")) {
        // No llamar /api/health aquí: el poll frecuente agotaba el cupo de consultas.
        applyFromCache();
        setLoading(false);
        return;
      }

      try {
        await flushOutbox();
        const data = await fetchComandas({ status: "pendiente,lista,entregada", limit: 500 });
        const merged = foldOutboxIntoComandas(data);
        setCachedComandas(merged);
        setComandas(merged);
        setError(null);
      } catch (err) {
        applyFromCache();
        if (
          isNetworkFailure(err) ||
          isRetryableSyncError(err) ||
          !shouldSyncWithServer()
        ) {
          setError(null);
        } else {
          setError(err instanceof Error ? err.message : "Error al cargar comandas");
        }
      } finally {
        setLoading(false);
      }
    } finally {
      reloadingRef.current = false;
    }
  }, [applyFromCache]);

  useEffect(() => {
    void reload();
    if (!getStoredSession()) return;

    const onSync = () => {
      applyFromCache();
      if (shouldPollServer("comandas")) void reload();
    };

    const onStore = (e: Event) => {
      const key = (e as CustomEvent<{ key?: string }>).detail?.key;
      if (key === LS_COMANDAS) applyFromCache();
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_COMANDAS) applyFromCache();
    };

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("michelada-sync");
      bc.onmessage = () => {
        applyFromCache();
      };
    } catch {
      bc = null;
    }

    window.addEventListener("michelada-sync-change", onSync);
    window.addEventListener("michelada-api-recovered", onSync);
    window.addEventListener("michelada-store-change", onStore);
    window.addEventListener("storage", onStorage);
    const onVisible = () => {
      if (document.visibilityState === "visible") applyFromCache();
    };
    document.addEventListener("visibilitychange", onVisible);

    const interval = window.setInterval(() => {
      if (document.visibilityState === "hidden") return;
      if (shouldPollServer("comandas")) void reload();
      else applyFromCache();
    }, 45_000);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("michelada-sync-change", onSync);
      window.removeEventListener("michelada-api-recovered", onSync);
      window.removeEventListener("michelada-store-change", onStore);
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisible);
      bc?.close();
    };
  }, [reload, applyFromCache]);

  return {
    comandas,
    loading,
    error,
    reload,
    addComanda: async (
      c: Omit<Comanda, "id" | "folio" | "queueOrder" | "createdAt" | "status">,
      existingClientId?: string,
    ) => {
      if (!getStoredSession()) {
        const prev = getCachedComandas();
        const folio = nextLocalFolio();
        const nueva: Comanda = {
          ...c,
          id: existingClientId ?? crypto.randomUUID(),
          folio,
          queueOrder: nextQueueOrderForToday(prev),
          createdAt: Date.now(),
          status: "pendiente",
        };
        const all = [...prev, nueva].sort(sortComandasByQueue);
        setCachedComandas(all);
        setComandas(all);
        markMesaOcupadaLocally(c.mesaId, c.cliente, DEFAULT_MESAS);
        notifyComandaNueva(nueva);
        notifySyncChange();
        return nueva;
      }

      const clientId = existingClientId ?? crypto.randomUUID();

      const queueOffline = () => {
        const nueva = buildOptimisticComanda(c, clientId);
        enqueueOp({ type: "comanda:create", clientId, payload: c });
        mergeComandaInCache(nueva);
        setComandas((prev) => [...prev, nueva].sort(sortComandasByQueue));
        markMesaOcupadaLocally(c.mesaId, c.cliente, DEFAULT_MESAS);
        notifyComandaNueva(nueva);
        notifySyncChange();
        return nueva;
      };

      if (!shouldSyncWithServer()) return queueOffline();

      try {
        const nueva = await createComandaApi(c, clientId);
        mergeComandaInCache(nueva);
        setComandas((prev) =>
          [...prev.filter((x) => x.id !== nueva.id), nueva].sort(sortComandasByQueue),
        );
        markMesaOcupadaLocally(nueva.mesaId ?? c.mesaId, nueva.cliente, DEFAULT_MESAS);
        notifyComandaNueva(nueva);
        notifySyncChange();
        return nueva;
      } catch (err) {
        if (isNetworkFailure(err) || isRetryableSyncError(err)) return queueOffline();
        throw err;
      }
    },
    updateStatus: async (id: string, status: Comanda["status"]) => {
      const before = getCachedComandas().find((x) => x.id === id);
      const mesaIdOf = () => before?.mesaId ?? getCachedComandas().find((x) => x.id === id)?.mesaId;

      // Optimista: la barra debe ver el cambio al instante.
      patchComandaInCache(id, { status });
      setComandas((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c)).sort(sortComandasByQueue),
      );
      if (status === "entregada") maybeLiberarMesaLocally(mesaIdOf(), DEFAULT_MESAS);

      if (!getStoredSession()) return;

      if (!shouldSyncWithServer()) {
        enqueueOp({ type: "comanda:patch", comandaId: id, patch: { status } });
        notifySyncChange();
        return;
      }

      try {
        const updated = await patchComandaApi(id, { status });
        mergeComandaInCache(updated);
        setComandas((prev) =>
          prev.map((c) => (c.id === id ? updated : c)).sort(sortComandasByQueue),
        );
        notifySyncChange();
      } catch (err) {
        if (isNetworkFailure(err) || isRetryableSyncError(err)) {
          enqueueOp({ type: "comanda:patch", comandaId: id, patch: { status } });
          notifySyncChange();
          return;
        }
        const msg = err instanceof Error ? err.message.toLowerCase() : "";
        // Pedido fantasma solo en caché local / ya borrado en servidor.
        if (msg.includes("no encontrada") || msg.includes("404")) {
          discardLocalComanda(id);
          setComandas((prev) => prev.filter((c) => c.id !== id));
          notifySyncChange();
          return;
        }
        // Revertir si el servidor rechazó el cambio.
        if (before) {
          mergeComandaInCache(before);
          setComandas((prev) =>
            prev.map((c) => (c.id === id ? before : c)).sort(sortComandasByQueue),
          );
        }
        throw err;
      }
    },
    remove: async (id: string) => {
      if (!getStoredSession()) {
        const all = getCachedComandas().filter((c) => c.id !== id);
        setCachedComandas(all);
        setComandas(all);
        return;
      }

      const applyLocal = () => {
        removeComandaFromCache(id);
        enqueueOp({ type: "comanda:delete", comandaId: id });
        setComandas((prev) => prev.filter((c) => c.id !== id));
      };

      if (!shouldSyncWithServer()) {
        applyLocal();
        return;
      }

      try {
        await deleteComandaApi(id);
        removeComandaFromCache(id);
        setComandas((prev) => prev.filter((c) => c.id !== id));
      } catch (err) {
        if (isNetworkFailure(err)) applyLocal();
        else throw err;
      }
    },
    reassignMesa: async (id: string, mesa: string | undefined, cliente?: string) => {
      if (!getStoredSession()) {
        const all = getCachedComandas()
          .map((c) => (c.id === id ? { ...c, mesa, cliente: cliente ?? c.cliente } : c))
          .sort(sortComandasByQueue);
        setCachedComandas(all);
        setComandas(all);
        return;
      }

      const patch = { mesa, cliente };
      const applyLocal = () => {
        patchComandaInCache(id, patch);
        enqueueOp({ type: "comanda:patch", comandaId: id, patch });
        setComandas((prev) =>
          prev.map((c) => (c.id === id ? { ...c, ...patch } : c)).sort(sortComandasByQueue),
        );
      };

      if (!shouldSyncWithServer()) {
        applyLocal();
        return;
      }

      try {
        const updated = await patchComandaApi(id, patch);
        mergeComandaInCache(updated);
        setComandas((prev) => prev.map((c) => (c.id === id ? updated : c)));
      } catch (err) {
        if (isNetworkFailure(err)) applyLocal();
        else throw err;
      }
    },
    updatePedido: async (
      id: string,
      patch: {
        cliente?: string;
        items: OrderItem[];
        total: number;
        mesaId?: string | null;
        mesa?: string | null;
      },
    ) => {
      const before = getCachedComandas().find((x) => x.id === id);
      const localPatch = {
        cliente: patch.cliente,
        items: patch.items,
        total: patch.total,
        ...(patch.mesaId !== undefined ? { mesaId: patch.mesaId || undefined } : {}),
        ...(patch.mesa !== undefined ? { mesa: patch.mesa || undefined } : {}),
      };

      const applyLocal = () => {
        patchComandaInCache(id, localPatch);
        enqueueOp({ type: "comanda:patch", comandaId: id, patch: localPatch });
        setComandas((prev) =>
          prev
            .map((c) =>
              c.id === id
                ? {
                    ...c,
                    cliente: patch.cliente?.trim() || c.cliente,
                    items: patch.items,
                    total: patch.total,
                    ...(patch.mesaId !== undefined ? { mesaId: patch.mesaId || undefined } : {}),
                    ...(patch.mesa !== undefined ? { mesa: patch.mesa || undefined } : {}),
                  }
                : c,
            )
            .sort(sortComandasByQueue),
        );
      };

      if (!getStoredSession()) {
        applyLocal();
        notifySyncChange();
        return getCachedComandas().find((x) => x.id === id)!;
      }

      // Optimista para que barra/caja vean el cambio al instante.
      patchComandaInCache(id, localPatch);
      setComandas((prev) =>
        prev
          .map((c) =>
            c.id === id
              ? {
                  ...c,
                  cliente: patch.cliente?.trim() || c.cliente,
                  items: patch.items,
                  total: patch.total,
                  ...(patch.mesaId !== undefined ? { mesaId: patch.mesaId || undefined } : {}),
                  ...(patch.mesa !== undefined ? { mesa: patch.mesa || undefined } : {}),
                }
              : c,
          )
          .sort(sortComandasByQueue),
      );

      if (!shouldSyncWithServer()) {
        enqueueOp({ type: "comanda:patch", comandaId: id, patch: localPatch });
        notifySyncChange();
        return getCachedComandas().find((x) => x.id === id)!;
      }

      try {
        const updated = await patchComandaApi(id, localPatch);
        mergeComandaInCache(updated);
        setComandas((prev) =>
          prev.map((c) => (c.id === id ? updated : c)).sort(sortComandasByQueue),
        );
        notifySyncChange();
        return updated;
      } catch (err) {
        if (isNetworkFailure(err)) {
          enqueueOp({ type: "comanda:patch", comandaId: id, patch: localPatch });
          notifySyncChange();
          return getCachedComandas().find((x) => x.id === id)!;
        }
        if (before) {
          mergeComandaInCache(before);
          setComandas((prev) =>
            prev.map((c) => (c.id === id ? before : c)).sort(sortComandasByQueue),
          );
        }
        throw err;
      }
    },
  };
}

export function useMesas() {
  const [mesas, setMesas] = useState<Mesa[]>(DEFAULT_MESAS);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!getStoredSession()) {
      setMesas(getCachedMesas(DEFAULT_MESAS));
      setLoading(false);
      return;
    }

    const cached = getCachedMesas(DEFAULT_MESAS);
    if (!shouldSyncWithServer() || !shouldPollServer("mesas")) {
      setMesas(cached);
      setLoading(false);
      return;
    }

    try {
      await flushOutbox();
      const data = await fetchMesas();
      setCachedMesas(data);
      setMesas(data);
    } catch {
      setMesas(cached);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
    if (!getStoredSession()) return;

    const onSync = () => {
      if (shouldPollServer("mesas")) void reload();
      else setMesas(getCachedMesas(DEFAULT_MESAS));
    };
    const onMesasLocal = () => {
      setMesas(getCachedMesas(DEFAULT_MESAS));
    };
    window.addEventListener("michelada-sync-change", onSync);
    window.addEventListener("michelada-mesas-change", onMesasLocal);

    const interval = window.setInterval(() => {
      if (document.visibilityState === "hidden") return;
      if (shouldPollServer("mesas")) void reload();
    }, 60_000);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("michelada-sync-change", onSync);
      window.removeEventListener("michelada-mesas-change", onMesasLocal);
    };
  }, [reload]);

  return {
    mesas,
    loading,
    reload,
    marcarAtendida: async (id: string) => {
      const applyLocal = () => {
        const updated = applyMesaAtendidaLocally(id, DEFAULT_MESAS);
        enqueueOp({ type: "mesa:atendida", mesaId: id });
        setMesas(getCachedMesas(DEFAULT_MESAS));
        return updated;
      };

      if (!getStoredSession()) {
        const updated = applyMesaAtendidaLocally(id, DEFAULT_MESAS);
        setMesas(getCachedMesas(DEFAULT_MESAS));
        return updated;
      }

      if (!shouldSyncWithServer()) return applyLocal();

      try {
        const updated = await marcarMesaAtendidaApi(id);
        setCachedMesas(
          getCachedMesas(DEFAULT_MESAS).map((m) => (m.id === id ? updated : m)),
        );
        setMesas((prev) => prev.map((m) => (m.id === id ? updated : m)));
        return updated;
      } catch (err) {
        if (isNetworkFailure(err)) return applyLocal();
        throw err;
      }
    },
    updateMesa: async (id: string, patch: Partial<Mesa>) => {
      if (!getStoredSession()) {
        const next = getCachedMesas(DEFAULT_MESAS).map((m) =>
          m.id === id ? { ...m, ...patch } : m,
        );
        setCachedMesas(next);
        setMesas(next);
        return;
      }

      const applyLocal = () => {
        const next = getCachedMesas(DEFAULT_MESAS).map((m) =>
          m.id === id ? { ...m, ...patch } : m,
        );
        setCachedMesas(next);
        enqueueOp({ type: "mesa:patch", mesaId: id, patch });
        setMesas(next);
      };

      if (!shouldSyncWithServer()) {
        applyLocal();
        return;
      }

      try {
        const updated = await patchMesaApi(id, patch);
        setMesas((prev) => prev.map((m) => (m.id === id ? updated : m)));
        setCachedMesas(
          getCachedMesas(DEFAULT_MESAS).map((m) => (m.id === id ? updated : m)),
        );
      } catch (err) {
        if (isNetworkFailure(err)) applyLocal();
        else throw err;
      }
    },
    addMesa: async (nombre: string, capacidad: number) => {
      if (!getStoredSession()) {
        const nueva: Mesa = { id: crypto.randomUUID(), nombre, capacidad, estado: "libre" };
        const next = [...getCachedMesas(DEFAULT_MESAS), nueva];
        setCachedMesas(next);
        setMesas(next);
        return;
      }
      if (!shouldSyncWithServer()) throw new Error("Sin conexión: no se puede crear mesa nueva offline");
      const nueva = await createMesaApi(nombre, capacidad);
      setMesas((prev) => [...prev, nueva]);
      setCachedMesas([...getCachedMesas(DEFAULT_MESAS), nueva]);
    },
    removeMesa: async (id: string) => {
      if (id === "llevar" || id === "barra") {
        throw new Error("No se puede eliminar Para llevar ni Barra");
      }
      if (!getStoredSession()) {
        const next = getCachedMesas(DEFAULT_MESAS).filter((m) => m.id !== id);
        setCachedMesas(next);
        setMesas(next);
        return;
      }
      if (!shouldSyncWithServer()) throw new Error("Sin conexión: no se puede eliminar mesa offline");
      await deleteMesaApi(id);
      setMesas((prev) => prev.filter((m) => m.id !== id));
      setCachedMesas(getCachedMesas(DEFAULT_MESAS).filter((m) => m.id !== id));
    },
    resetMesas: () => {
      setCachedMesas(DEFAULT_MESAS);
      setMesas(DEFAULT_MESAS);
      void reload();
    },
  };
}

export function useInventory(opts?: { pauseAutoReload?: boolean }) {
  const pauseAutoReload = opts?.pauseAutoReload === true;
  const [items, setItems] = useState<InventoryItem[]>(DEFAULT_INVENTORY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!getStoredSession()) {
      setItems(getCachedInventario(DEFAULT_INVENTORY));
      setLoading(false);
      return;
    }

    const cached = getCachedInventario(DEFAULT_INVENTORY);
    if (!shouldSyncWithServer() || !shouldPollServer("inventario")) {
      setItems(cached);
      setLoading(false);
      return;
    }

    try {
      const data = await fetchInventario();
      setCachedInventario(data);
      setItems(data);
      setError(null);
    } catch (err) {
      setItems(cached);
      if (!shouldSyncWithServer() || isNetworkFailure(err)) {
        setError(null);
      } else {
        setError(err instanceof Error ? err.message : "Error al cargar inventario");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
    if (!getStoredSession()) {
      const handler = () => setItems(getCachedInventario(DEFAULT_INVENTORY));
      window.addEventListener("michelada-store-change", handler);
      return () => window.removeEventListener("michelada-store-change", handler);
    }
    if (pauseAutoReload) return;
    const interval = window.setInterval(() => {
      if (document.visibilityState === "hidden") return;
      if (shouldPollServer("inventario")) void reload();
    }, 90_000);
    return () => window.clearInterval(interval);
  }, [reload, pauseAutoReload]);

  const setStockLocal = (key: string, stock: number) => {
    const next = getCachedInventario(DEFAULT_INVENTORY).map((i) =>
      i.key === key ? { ...i, stock } : i,
    );
    setCachedInventario(next);
    setItems(next);
  };

  const decrementLocal = (key: string, qty: number) => {
    const next = getCachedInventario(DEFAULT_INVENTORY).map((i) =>
      i.key === key ? { ...i, stock: Math.max(0, i.stock - qty) } : i,
    );
    setCachedInventario(next);
    setItems(next);
  };

  return {
    items,
    loading,
    error,
    reload,
    setStock: async (key: string, stock: number) => {
      const before = getCachedInventario(DEFAULT_INVENTORY).find((i) => i.key === key);
      setStockLocal(key, stock);

      if (!getStoredSession()) return;

      if (!shouldSyncWithServer()) {
        enqueueOp({ type: "inventario:patch", key, stock });
        return;
      }

      try {
        const updated = await patchInventarioStock(key, stock);
        setItems((prev) => prev.map((i) => (i.key === key ? updated : i)));
        setCachedInventario(
          getCachedInventario(DEFAULT_INVENTORY).map((i) => (i.key === key ? updated : i)),
        );
      } catch (err) {
        if (isNetworkFailure(err)) {
          enqueueOp({ type: "inventario:patch", key, stock });
          return;
        }
        if (before) setStockLocal(key, before.stock);
        throw err;
      }
    },
    decrement: (key: string, qty: number) => {
      if (getStoredSession() && shouldSyncWithServer()) return;
      decrementLocal(key, qty);
    },
    decrementBatch: (totals: Record<string, number>) => {
      if (getStoredSession() && shouldSyncWithServer()) return;
      let next = getCachedInventario(DEFAULT_INVENTORY);
      for (const [key, qty] of Object.entries(totals)) {
        next = next.map((i) =>
          i.key === key ? { ...i, stock: Math.max(0, i.stock - qty) } : i,
        );
      }
      setCachedInventario(next);
      setItems(next);
    },
    reset: async () => {
      if (!getStoredSession()) {
        setCachedInventario(DEFAULT_INVENTORY);
        setItems(DEFAULT_INVENTORY);
        return;
      }
      if (!shouldSyncWithServer()) throw new Error("Sin conexión");
      const data = await resetInventarioApi();
      setCachedInventario(data);
      setItems(data);
    },
    removeItem: async (key: string) => {
      if (!getStoredSession()) {
        const next = getCachedInventario(DEFAULT_INVENTORY).filter((i) => i.key !== key);
        setCachedInventario(next);
        setItems(next);
        return;
      }
      if (!shouldSyncWithServer()) throw new Error("Sin conexión");
      const { deleteInventarioItem } = await import("@/lib/inventory-api");
      await deleteInventarioItem(key);
      const next = getCachedInventario(DEFAULT_INVENTORY).filter((i) => i.key !== key);
      setCachedInventario(next);
      setItems((prev) => prev.filter((i) => i.key !== key));
    },
  };
}

export function orderItemQuantity(item: OrderItem): number {
  const q = item.quantity ?? 1;
  return q > 0 ? Math.floor(q) : 1;
}

export function additionQuantity(a: { quantity?: number }): number {
  const q = a.quantity ?? 1;
  return q > 0 ? Math.floor(q) : 1;
}

/** Etiqueta de adición con cantidad (ej. "2× Cereza +$6.000"). */
export function formatAdditionLine(
  a: { name: string; price: number; quantity?: number },
  formatPrice: (n: number) => string = (n) =>
    `$${n.toLocaleString("es-CO", { maximumFractionDigits: 0, useGrouping: true })}`,
): string {
  const qty = additionQuantity(a);
  const line = a.price * qty;
  const name = qty > 1 ? `${qty}× ${a.name}` : a.name;
  return line > 0 ? `${name} +${formatPrice(line)}` : name;
}

/** Id de mesa virtual para pedidos para llevar. */
export const MESA_LLEVAR_ID = "llevar";

/** Cargo adicional por unidad cuando el pedido es para llevar. */
export const LLEVAR_EXTRA = 1000;

export function isParaLlevar(mesaId?: string | null): boolean {
  return mesaId === MESA_LLEVAR_ID;
}

export function llevarExtraPorUnidad(mesaId?: string | null): number {
  return isParaLlevar(mesaId) ? LLEVAR_EXTRA : 0;
}

export function calcItemTotal(
  basePrice: number,
  additions: OrderItem["additions"],
  llevarExtra = 0,
) {
  const adds = additions.reduce((sum, a) => sum + a.price * additionQuantity(a), 0);
  return basePrice + adds + Math.max(0, llevarExtra);
}

/**
 * Total de la línea: (michelada + para llevar) × cantidad + adiciones una sola vez.
 * Las adiciones no se multiplican por la cantidad de bebidas.
 */
export function calcItemLineTotal(
  basePrice: number,
  additions: OrderItem["additions"],
  quantity = 1,
  llevarExtra = 0,
): number {
  const qty = Math.max(1, quantity);
  const adds = additions.reduce((sum, a) => sum + a.price * additionQuantity(a), 0);
  return (basePrice + Math.max(0, llevarExtra)) * qty + adds;
}
