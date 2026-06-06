import { useCallback, useEffect, useState } from "react";

import { getStoredSession } from "@/lib/auth";
import {
  fetchInventario,
  patchInventarioStock,
  resetInventarioApi,
} from "@/lib/inventory-api";
import { nextQueueOrderForToday, sortComandasByQueue } from "@/lib/comanda-queue";
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
  { key: "cerveza", name: "Cerveza (botellas)", stock: 96, unit: "pz", minStock: 10 },
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

const LS_COMANDAS = "michelada_comandas_v1";
const LS_INVENTORY = "michelada_inventory_v1";
const LS_FOLIO = "michelada_folio_v1";
const LS_MESAS = "michelada_mesas_v1";

const DEFAULT_MESAS: Mesa[] = [
  { id: "m1", nombre: "Mesa 1", capacidad: 4, estado: "libre" },
  { id: "m2", nombre: "Mesa 2", capacidad: 4, estado: "libre" },
  { id: "m3", nombre: "Mesa 3", capacidad: 2, estado: "libre" },
  { id: "m4", nombre: "Mesa 4", capacidad: 6, estado: "libre" },
  { id: "m5", nombre: "Mesa 5", capacidad: 4, estado: "libre" },
  { id: "barra", nombre: "Barra", capacidad: 8, estado: "libre" },
  { id: "llevar", nombre: "Para llevar", capacidad: 0, estado: "libre" },
];

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("michelada-store-change", { detail: { key } }));
}

export function useComandas() {
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!getStoredSession()) {
      setComandas(read(LS_COMANDAS, [] as Comanda[]));
      setLoading(false);
      return;
    }
    try {
      const data = await fetchComandas({ status: "pendiente,lista,entregada" });
      setComandas([...data].sort(sortComandasByQueue));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar comandas");
      setComandas(read(LS_COMANDAS, [] as Comanda[]));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
    if (!getStoredSession()) return;
    const interval = window.setInterval(() => void reload(), 3000);
    return () => window.clearInterval(interval);
  }, [reload]);

  return {
    comandas,
    loading,
    error,
    reload,
    addComanda: async (c: Omit<Comanda, "id" | "folio" | "queueOrder" | "createdAt" | "status">) => {
      if (getStoredSession()) {
        const nueva = await createComandaApi(c);
        setComandas((prev) => [...prev, nueva].sort(sortComandasByQueue));
        return nueva;
      }
      const prev = read<Comanda[]>(LS_COMANDAS, []);
      const folio = read<number>(LS_FOLIO, 1000) + 1;
      write(LS_FOLIO, folio);
      const nueva: Comanda = {
        ...c,
        id: crypto.randomUUID(),
        folio,
        queueOrder: nextQueueOrderForToday(prev),
        createdAt: Date.now(),
        status: "pendiente",
      };
      const all = [...prev, nueva].sort(sortComandasByQueue);
      write(LS_COMANDAS, all);
      setComandas(all);
      return nueva;
    },
    updateStatus: async (id: string, status: Comanda["status"]) => {
      if (getStoredSession()) {
        const updated = await patchComandaApi(id, { status });
        setComandas((prev) => prev.map((c) => (c.id === id ? updated : c)));
        return;
      }
      const all = read<Comanda[]>(LS_COMANDAS, []).map((c) =>
        c.id === id ? { ...c, status } : c,
      );
      write(LS_COMANDAS, all);
      setComandas(all);
    },
    remove: async (id: string) => {
      if (getStoredSession()) {
        await deleteComandaApi(id);
        setComandas((prev) => prev.filter((c) => c.id !== id));
        return;
      }
      const all = read<Comanda[]>(LS_COMANDAS, []).filter((c) => c.id !== id);
      write(LS_COMANDAS, all);
      setComandas(all);
    },
    reassignMesa: async (id: string, mesa: string | undefined, cliente?: string) => {
      if (getStoredSession()) {
        const updated = await patchComandaApi(id, { mesa, cliente });
        setComandas((prev) => prev.map((c) => (c.id === id ? updated : c)));
        return;
      }
      const all = read<Comanda[]>(LS_COMANDAS, []).map((c) =>
        c.id === id ? { ...c, mesa, cliente: cliente ?? c.cliente } : c,
      );
      write(LS_COMANDAS, all);
      setComandas(all);
    },
  };
}

export function useMesas() {
  const [mesas, setMesas] = useState<Mesa[]>(DEFAULT_MESAS);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!getStoredSession()) {
      setMesas(read(LS_MESAS, DEFAULT_MESAS));
      setLoading(false);
      return;
    }
    try {
      setMesas(await fetchMesas());
    } catch {
      setMesas(read(LS_MESAS, DEFAULT_MESAS));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
    if (!getStoredSession()) return;
    const interval = window.setInterval(() => void reload(), 10000);
    return () => window.clearInterval(interval);
  }, [reload]);

  return {
    mesas,
    loading,
    reload,
    marcarAtendida: async (id: string) => {
      if (getStoredSession()) {
        const updated = await marcarMesaAtendidaApi(id);
        setMesas((prev) => prev.map((m) => (m.id === id ? updated : m)));
        return updated;
      }
      const next = read<Mesa[]>(LS_MESAS, DEFAULT_MESAS).map((m) =>
        m.id === id ? { ...m, estado: "libre" as const, cliente: undefined } : m,
      );
      write(LS_MESAS, next);
      setMesas(next);
      return next.find((m) => m.id === id)!;
    },
    updateMesa: async (id: string, patch: Partial<Mesa>) => {
      if (getStoredSession()) {
        const updated = await patchMesaApi(id, patch);
        setMesas((prev) => prev.map((m) => (m.id === id ? updated : m)));
        return;
      }
      const next = read<Mesa[]>(LS_MESAS, DEFAULT_MESAS).map((m) =>
        m.id === id ? { ...m, ...patch } : m,
      );
      write(LS_MESAS, next);
      setMesas(next);
    },
    addMesa: async (nombre: string, capacidad: number) => {
      if (getStoredSession()) {
        const nueva = await createMesaApi(nombre, capacidad);
        setMesas((prev) => [...prev, nueva]);
        return;
      }
      const nueva: Mesa = { id: crypto.randomUUID(), nombre, capacidad, estado: "libre" };
      const next = [...read<Mesa[]>(LS_MESAS, DEFAULT_MESAS), nueva];
      write(LS_MESAS, next);
      setMesas(next);
    },
    removeMesa: async (id: string) => {
      if (getStoredSession()) {
        await deleteMesaApi(id);
        setMesas((prev) => prev.filter((m) => m.id !== id));
        return;
      }
      const next = read<Mesa[]>(LS_MESAS, DEFAULT_MESAS).filter((m) => m.id !== id);
      write(LS_MESAS, next);
      setMesas(next);
    },
    resetMesas: () => {
      write(LS_MESAS, DEFAULT_MESAS);
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
      setItems(read(LS_INVENTORY, DEFAULT_INVENTORY));
      setLoading(false);
      return;
    }
    try {
      setItems(await fetchInventario());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar inventario");
      setItems(read(LS_INVENTORY, DEFAULT_INVENTORY));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
    if (!getStoredSession()) {
      const handler = () => setItems(read(LS_INVENTORY, DEFAULT_INVENTORY));
      window.addEventListener("michelada-store-change", handler);
      return () => window.removeEventListener("michelada-store-change", handler);
    }
    const interval = window.setInterval(() => void reload(), 8000);
    return () => window.clearInterval(interval);
  }, [reload]);

  const setStockLocal = (key: string, stock: number) => {
    const next = read<InventoryItem[]>(LS_INVENTORY, DEFAULT_INVENTORY).map((i) =>
      i.key === key ? { ...i, stock } : i,
    );
    write(LS_INVENTORY, next);
    setItems(next);
  };

  const decrementLocal = (key: string, qty: number) => {
    const next = read<InventoryItem[]>(LS_INVENTORY, DEFAULT_INVENTORY).map((i) =>
      i.key === key ? { ...i, stock: Math.max(0, i.stock - qty) } : i,
    );
    write(LS_INVENTORY, next);
    setItems(next);
  };

  return {
    items,
    loading,
    error,
    reload,
    setStock: async (key: string, stock: number) => {
      if (getStoredSession()) {
        const updated = await patchInventarioStock(key, stock);
        setItems((prev) => prev.map((i) => (i.key === key ? updated : i)));
        return;
      }
      setStockLocal(key, stock);
    },
    decrement: (key: string, qty: number) => {
      if (getStoredSession()) return;
      decrementLocal(key, qty);
    },
    decrementBatch: (totals: Record<string, number>) => {
      if (getStoredSession()) return;
      let next = read<InventoryItem[]>(LS_INVENTORY, DEFAULT_INVENTORY);
      for (const [key, qty] of Object.entries(totals)) {
        next = next.map((i) =>
          i.key === key ? { ...i, stock: Math.max(0, i.stock - qty) } : i,
        );
      }
      write(LS_INVENTORY, next);
      setItems(next);
    },
    reset: async () => {
      if (getStoredSession()) {
        setItems(await resetInventarioApi());
        return;
      }
      write(LS_INVENTORY, DEFAULT_INVENTORY);
      setItems(DEFAULT_INVENTORY);
    },
    removeItem: async (key: string) => {
      if (getStoredSession()) {
        const { deleteInventarioItem } = await import("@/lib/inventory-api");
        await deleteInventarioItem(key);
        setItems((prev) => prev.filter((i) => i.key !== key));
        return;
      }
      const next = read<InventoryItem[]>(LS_INVENTORY, DEFAULT_INVENTORY).filter(
        (i) => i.key !== key,
      );
      write(LS_INVENTORY, next);
      setItems(next);
    },
  };
}

export function calcItemTotal(basePrice: number, additions: OrderItem["additions"]) {
  const adds = additions.reduce((sum, a) => sum + a.price, 0);
  return basePrice + adds;
}
