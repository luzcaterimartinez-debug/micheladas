import { useCallback, useEffect, useState } from "react";

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
  nextLocalFolio,
  setCachedComandas,
  setCachedInventario,
  setCachedMesas,
} from "@/lib/offline/local-cache";
import { isNetworkFailure, isRetryableSyncError, shouldSyncWithServer } from "@/lib/offline/network";
import { enqueueOp } from "@/lib/offline/outbox";
import {
  buildOptimisticComanda,
  flushOutbox,
  mergeComandaInCache,
  patchComandaInCache,
  removeComandaFromCache,
  applyMesaAtendidaLocally,
} from "@/lib/offline/sync-engine";
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
  additions: { id: string; name: string; price: number }[];
  notes?: string;
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
  { id: "camaron", name: "Camarón cocido", price: 25, stockKey: "camaron" },
  { id: "pulpo", name: "Pulpo", price: 35, stockKey: "pulpo" },
  { id: "pepino", name: "Pepino", price: 10, stockKey: "pepino" },
  { id: "jicama", name: "Jícama", price: 10, stockKey: "jicama" },
  { id: "cacahuate", name: "Cacahuates", price: 15, stockKey: "cacahuate" },
  { id: "gomitas", name: "Gomitas enchiladas", price: 15, stockKey: "gomitas" },
  { id: "rielitos", name: "Rielitos", price: 20, stockKey: "rielitos" },
];

const DEFAULT_INVENTORY: InventoryItem[] = [
  { key: "ginger", name: "Ginger ale", stock: 48, unit: "pz", minStock: 12 },
  { key: "soda", name: "Soda", stock: 48, unit: "pz", minStock: 12 },
  { key: "cerveza", name: "Cerveza (botellas)", stock: 96, unit: "pz", minStock: 10 },
  { key: "cola_pola", name: "Cola y pola", stock: 48, unit: "pz", minStock: 12 },
  { key: "smirnoff", name: "Smirnoff", stock: 24, unit: "pz", minStock: 6 },
  { key: "clamato", name: "Clamato", stock: 8, unit: "L", minStock: 2 },
  { key: "limon", name: "Limón", stock: 100, unit: "pz", minStock: 15 },
  { key: "chamoy", name: "Chamoy", stock: 3, unit: "L", minStock: 1 },
  { key: "tajin", name: "Tajín", stock: 1500, unit: "g", minStock: 200 },
  { key: "camaron", name: "Camarón cocido", stock: 40, unit: "pz", minStock: 5 },
  { key: "pulpo", name: "Pulpo", stock: 20, unit: "pz", minStock: 5 },
  { key: "pepino", name: "Pepino", stock: 25, unit: "pz", minStock: 5 },
  { key: "jicama", name: "Jícama", stock: 15, unit: "pz", minStock: 5 },
  { key: "cacahuate", name: "Cacahuates", stock: 2000, unit: "g", minStock: 300 },
  { key: "gomitas", name: "Gomitas enchiladas", stock: 1500, unit: "g", minStock: 200 },
  { key: "rielitos", name: "Rielitos", stock: 60, unit: "pz", minStock: 10 },
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

  const reload = useCallback(async () => {
    if (!getStoredSession()) {
      setComandas(getCachedComandas());
      setLoading(false);
      return;
    }

    const cached = getCachedComandas();
    if (!shouldSyncWithServer()) {
      setComandas([...cached].sort(sortComandasByQueue));
      setLoading(false);
      return;
    }

    try {
      if (cached.length > 0) {
        setComandas([...cached].sort(sortComandasByQueue));
      }
      await flushOutbox();
      const data = await fetchComandas({ status: "pendiente,lista,entregada" });
      setCachedComandas(data);
      setComandas([...data].sort(sortComandasByQueue));
      setError(null);
    } catch (err) {
      setComandas([...cached].sort(sortComandasByQueue));
      if (isNetworkFailure(err) || !shouldSyncWithServer()) {
        setError(null);
      } else {
        setError(err instanceof Error ? err.message : "Error al cargar comandas");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
    if (!getStoredSession()) return;

    const onSync = () => {
      if (shouldSyncWithServer()) void reload();
    };
    window.addEventListener("michelada-sync-change", onSync);

    const interval = window.setInterval(() => {
      if (shouldSyncWithServer()) void reload();
    }, 10000);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("michelada-sync-change", onSync);
    };
  }, [reload]);

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
        notifyComandaNueva(nueva);
        return nueva;
      }

      const clientId = existingClientId ?? crypto.randomUUID();

      const queueOffline = () => {
        const nueva = buildOptimisticComanda(c, clientId);
        enqueueOp({ type: "comanda:create", clientId, payload: c });
        mergeComandaInCache(nueva);
        setComandas((prev) => [...prev, nueva].sort(sortComandasByQueue));
        notifyComandaNueva(nueva);
        return nueva;
      };

      if (!shouldSyncWithServer()) return queueOffline();

      try {
        const nueva = await createComandaApi(c, clientId);
        mergeComandaInCache(nueva);
        setComandas((prev) =>
          [...prev.filter((x) => x.id !== nueva.id), nueva].sort(sortComandasByQueue),
        );
        notifyComandaNueva(nueva);
        return nueva;
      } catch (err) {
        if (isNetworkFailure(err) || isRetryableSyncError(err)) return queueOffline();
        throw err;
      }
    },
    updateStatus: async (id: string, status: Comanda["status"]) => {
      if (!getStoredSession()) {
        const all = getCachedComandas()
          .map((c) => (c.id === id ? { ...c, status } : c))
          .sort(sortComandasByQueue);
        setCachedComandas(all);
        setComandas(all);
        return;
      }

      const applyLocal = () => {
        patchComandaInCache(id, { status });
        enqueueOp({ type: "comanda:patch", comandaId: id, patch: { status } });
        setComandas((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status } : c)).sort(sortComandasByQueue),
        );
      };

      if (!shouldSyncWithServer()) {
        applyLocal();
        return;
      }

      try {
        const updated = await patchComandaApi(id, { status });
        mergeComandaInCache(updated);
        setComandas((prev) =>
          prev.map((c) => (c.id === id ? updated : c)).sort(sortComandasByQueue),
        );
      } catch (err) {
        if (isNetworkFailure(err)) applyLocal();
        else throw err;
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
    if (!shouldSyncWithServer()) {
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
      if (shouldSyncWithServer()) void reload();
    };
    window.addEventListener("michelada-sync-change", onSync);

    const interval = window.setInterval(() => {
      if (shouldSyncWithServer()) void reload();
    }, 10000);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("michelada-sync-change", onSync);
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

export function useInventory() {
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
    if (!shouldSyncWithServer()) {
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
    const interval = window.setInterval(() => {
      if (shouldSyncWithServer()) void reload();
    }, 15000);
    return () => window.clearInterval(interval);
  }, [reload]);

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
      if (!getStoredSession()) {
        setStockLocal(key, stock);
        return;
      }

      const applyLocal = () => {
        setStockLocal(key, stock);
        enqueueOp({ type: "inventario:patch", key, stock });
      };

      if (!shouldSyncWithServer()) {
        applyLocal();
        return;
      }

      try {
        const updated = await patchInventarioStock(key, stock);
        setItems((prev) => prev.map((i) => (i.key === key ? updated : i)));
        setCachedInventario(
          getCachedInventario(DEFAULT_INVENTORY).map((i) => (i.key === key ? updated : i)),
        );
      } catch (err) {
        if (isNetworkFailure(err)) applyLocal();
        else throw err;
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

export function calcItemTotal(basePrice: number, additions: OrderItem["additions"]) {
  const adds = additions.reduce((sum, a) => sum + a.price, 0);
  return basePrice + adds;
}

export function calcItemLineTotal(
  basePrice: number,
  additions: OrderItem["additions"],
  quantity = 1,
): number {
  return calcItemTotal(basePrice, additions) * Math.max(1, quantity);
}
