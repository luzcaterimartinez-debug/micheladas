import { Q as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { c as createRouter, a as createRootRouteWithContext, u as useRouter, L as Link, O as Outlet, H as HeadContent, S as Scripts, b as createFileRoute, l as lazyRouteComponent } from "../_libs/tanstack__react-router.mjs";
import { Q as redirect } from "../_libs/tanstack__router-core.mjs";
import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { c as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { C as CloudOff, a as CloudUpload, L as LoaderCircle, W as Wifi } from "../_libs/lucide-react.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
const LS_MENU = "michelada_menu_v1";
const LS_OUTBOX = "michelada_outbox_v1";
const LS_SYNC_META = "michelada_sync_meta_v1";
function isAppOnline() {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}
function isNetworkFailure(err) {
  if (!isAppOnline()) return true;
  if (err instanceof TypeError) return true;
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return msg.includes("failed to fetch") || msg.includes("network") || msg.includes("load failed");
  }
  return false;
}
function readLocal(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeLocal(key, value) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("michelada-store-change", { detail: { key } }));
}
function notifySyncChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("michelada-sync-change"));
}
function readOutbox() {
  return readLocal(LS_OUTBOX, []);
}
function writeOutbox(ops) {
  writeLocal(LS_OUTBOX, ops);
  notifySyncChange();
}
function getPendingCount() {
  return readOutbox().length;
}
function enqueueOp(op) {
  const entry = {
    ...op,
    opId: op.opId ?? crypto.randomUUID(),
    createdAt: Date.now()
  };
  const next = [...readOutbox(), entry].sort((a, b) => a.createdAt - b.createdAt);
  writeOutbox(next);
  return entry;
}
function removeOp(opId) {
  writeOutbox(readOutbox().filter((o) => o.opId !== opId));
}
function listOutbox() {
  return readOutbox();
}
const STORAGE_KEY = "micheladas_auth";
const API_URL = "";
function getApiUrl() {
  return API_URL;
}
function getStoredSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.accessToken || !parsed.user?.rol) return null;
    return parsed;
  } catch {
    return null;
  }
}
function saveSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}
function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}
async function login(email, password) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(parseApiError(data, res.status));
  }
  const session = {
    accessToken: data.access_token,
    user: data.user
  };
  saveSession(session);
  return session;
}
async function validateSession() {
  const stored = getStoredSession();
  if (!stored) return null;
  let user;
  try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${stored.accessToken}` }
    });
    if (!res.ok) {
      clearSession();
      return null;
    }
    user = await res.json();
    if (!user) {
      clearSession();
      return null;
    }
  } catch {
    return stored;
  }
  const session = { accessToken: stored.accessToken, user };
  saveSession(session);
  return session;
}
function parseApiError(data, status) {
  if (data && typeof data === "object" && "detail" in data) {
    const detail = data.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0];
      if (first?.msg) {
        const field = Array.isArray(first.loc) ? first.loc.at(-1) : null;
        return field ? `${String(field)}: ${first.msg}` : first.msg;
      }
    }
  }
  if (status === 422) return "Datos inválidos. Revisa el correo y la contraseña.";
  return "No se pudo iniciar sesión";
}
const ROL_LABELS = {
  admin: "Administrador",
  mesero: "Mesero",
  cocinero: "Barra / Preparación"
};
function sortComandasByQueue(a, b) {
  const oa = a.queueOrder ?? 0;
  const ob = b.queueOrder ?? 0;
  if (oa !== ob) return oa - ob;
  return a.createdAt - b.createdAt;
}
function nextQueueOrderForToday(comandas) {
  const today = (/* @__PURE__ */ new Date()).toDateString();
  const max = comandas.filter((c) => new Date(c.createdAt).toDateString() === today).reduce((m, c) => Math.max(m, c.queueOrder ?? 0), 0);
  return max + 1;
}
function queueLabel(order) {
  return `Turno ${order}`;
}
const LS_COMANDAS = "michelada_comandas_v1";
const LS_INVENTORY = "michelada_inventory_v1";
const LS_FOLIO = "michelada_folio_v1";
const LS_MESAS = "michelada_mesas_v1";
function getCachedComandas() {
  return readLocal(LS_COMANDAS, []);
}
function setCachedComandas(comandas) {
  writeLocal(LS_COMANDAS, comandas);
}
function getCachedMesas(fallback) {
  return readLocal(LS_MESAS, fallback);
}
function setCachedMesas(mesas) {
  writeLocal(LS_MESAS, mesas);
}
function getCachedInventario(fallback) {
  return readLocal(LS_INVENTORY, fallback);
}
function setCachedInventario(items) {
  writeLocal(LS_INVENTORY, items);
}
function getCachedMenu(fallback) {
  return readLocal(LS_MENU, fallback);
}
function setCachedMenu(menu) {
  writeLocal(LS_MENU, menu);
}
function nextLocalFolio() {
  const folio = readLocal(LS_FOLIO, 1e3) + 1;
  writeLocal(LS_FOLIO, folio);
  return folio;
}
function authHeaders$1() {
  const session = getStoredSession();
  if (!session) throw new Error("Sesión expirada");
  return {
    Authorization: `Bearer ${session.accessToken}`,
    "Content-Type": "application/json"
  };
}
function mapItem(raw) {
  return {
    key: String(raw.key),
    name: String(raw.name),
    stock: Number(raw.stock),
    unit: String(raw.unit),
    minStock: Number(raw.minStock ?? 5)
  };
}
async function fetchInventario() {
  const res = await fetch(`${getApiUrl()}/api/inventario`, { headers: authHeaders$1() });
  const data = await res.json().catch(() => []);
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return data.map(mapItem);
}
async function patchInventarioStock(key, stock) {
  const res = await fetch(`${getApiUrl()}/api/inventario/${encodeURIComponent(key)}`, {
    method: "PATCH",
    headers: authHeaders$1(),
    body: JSON.stringify({ stock })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return mapItem(data);
}
async function resetInventarioApi() {
  const res = await fetch(`${getApiUrl()}/api/inventario/reset`, {
    method: "POST",
    headers: authHeaders$1()
  });
  const data = await res.json().catch(() => []);
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return data.map(mapItem);
}
async function deleteInventarioItem(key) {
  const res = await fetch(`${getApiUrl()}/api/inventario/${encodeURIComponent(key)}`, {
    method: "DELETE",
    headers: authHeaders$1()
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(parseApiError(data, res.status));
  }
}
const inventoryApi = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  deleteInventarioItem,
  fetchInventario,
  patchInventarioStock,
  resetInventarioApi
}, Symbol.toStringTag, { value: "Module" }));
function authHeaders() {
  const session = getStoredSession();
  if (!session) throw new Error("Sesión expirada");
  return {
    Authorization: `Bearer ${session.accessToken}`,
    "Content-Type": "application/json"
  };
}
function mapMesa(raw) {
  return {
    id: String(raw.id),
    nombre: String(raw.nombre),
    capacidad: Number(raw.capacidad),
    estado: raw.estado,
    cliente: raw.cliente != null ? String(raw.cliente) : void 0
  };
}
function mapOrderItem(raw) {
  return {
    id: String(raw.id),
    micheladaId: String(raw.micheladaId),
    micheladaName: String(raw.micheladaName),
    size: raw.size != null && raw.size !== "" ? String(raw.size) : void 0,
    basePrice: Number(raw.basePrice),
    selectedToppings: raw.selectedToppings ?? [],
    additions: raw.additions ?? [],
    notes: raw.notes != null ? String(raw.notes) : void 0,
    total: Number(raw.total)
  };
}
function mapComanda(raw) {
  const items = (raw.items ?? []).map(mapOrderItem);
  return {
    id: String(raw.id),
    folio: Number(raw.folio),
    queueOrder: Number(raw.queueOrder ?? raw.orden_cola ?? 1),
    cliente: String(raw.cliente),
    mesa: raw.mesa != null ? String(raw.mesa) : void 0,
    mesaId: raw.mesaId != null ? String(raw.mesaId) : void 0,
    meseroId: raw.meseroId != null ? Number(raw.meseroId) : void 0,
    items,
    total: Number(raw.total),
    createdAt: Number(raw.createdAt),
    status: raw.status
  };
}
async function fetchMesas() {
  const res = await fetch(`${getApiUrl()}/api/mesas`, { headers: authHeaders() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return data.map(mapMesa);
}
async function marcarMesaAtendidaApi(mesaId) {
  const res = await fetch(`${getApiUrl()}/api/mesas/${mesaId}/atendida`, {
    method: "POST",
    headers: authHeaders()
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return mapMesa(data);
}
async function patchMesaApi(id, patch) {
  const body = {};
  if (patch.estado != null) body.estado = patch.estado;
  if (patch.cliente !== void 0) body.cliente = patch.cliente;
  if (patch.nombre != null) body.nombre = patch.nombre;
  if (patch.capacidad != null) body.capacidad = patch.capacidad;
  const res = await fetch(`${getApiUrl()}/api/mesas/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return mapMesa(data);
}
async function createMesaApi(nombre, capacidad) {
  const res = await fetch(`${getApiUrl()}/api/mesas`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ nombre, capacidad })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return mapMesa(data);
}
async function deleteMesaApi(id) {
  const res = await fetch(`${getApiUrl()}/api/mesas/${id}`, {
    method: "DELETE",
    headers: authHeaders()
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(parseApiError(data, res.status));
  }
}
async function fetchComandas(opts) {
  const params = new URLSearchParams();
  if (opts?.status) params.set("status", opts.status);
  if (opts?.mesaId) params.set("mesa_id", opts.mesaId);
  const q = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${getApiUrl()}/api/comandas${q}`, { headers: authHeaders() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return data.map(mapComanda);
}
async function createComandaApi(input, clientId) {
  const res = await fetch(`${getApiUrl()}/api/comandas`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      id: clientId,
      cliente: input.cliente,
      mesaId: input.mesaId,
      mesa: input.mesa,
      items: input.items,
      total: input.total
    })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return mapComanda(data);
}
async function patchComandaApi(id, patch) {
  const res = await fetch(`${getApiUrl()}/api/comandas/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(patch)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return mapComanda(data);
}
async function deleteComandaApi(id) {
  const res = await fetch(`${getApiUrl()}/api/comandas/${id}`, {
    method: "DELETE",
    headers: authHeaders()
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(parseApiError(data, res.status));
  }
}
const DEFAULT_PASOS$1 = ["fase:topping", "notas"];
function tops(items, faseId = "topping") {
  return items.map((t) => ({ ...t, faseId, faseName: "Topping" }));
}
const CLASICA_TOPS = tops([
  { id: "chamoy", name: "Chamoy" },
  { id: "tajin", name: "Tajín" },
  { id: "salsa_inglesa", name: "Salsa inglesa" },
  { id: "salsa_maggi", name: "Salsa Maggi" },
  { id: "limon_extra", name: "Limón extra" },
  { id: "sal_gusano", name: "Sal de gusano" }
]);
const MICHELADAS = [
  {
    id: "clasica_chica",
    name: "Michelada Clásica · Chica",
    price: 48,
    description: "12 oz — cerveza, limón y escarchado clásico",
    pasos: DEFAULT_PASOS$1,
    faseOpciones: CLASICA_TOPS.slice(0, 4)
  },
  {
    id: "clasica_mediana",
    name: "Michelada Clásica · Mediana",
    price: 60,
    description: "16 oz — cerveza, limón, salsas y escarchado clásico",
    pasos: DEFAULT_PASOS$1,
    faseOpciones: CLASICA_TOPS
  },
  {
    id: "clasica_grande",
    name: "Michelada Clásica · Grande",
    price: 84,
    description: "24 oz — porción grande con extra limón y escarchado",
    pasos: DEFAULT_PASOS$1,
    faseOpciones: CLASICA_TOPS
  },
  {
    id: "cubana_mediana",
    name: "Michelada Cubana · Mediana",
    price: 75,
    description: "16 oz — clamato, picante y escarcha de tamarindo",
    pasos: DEFAULT_PASOS$1,
    faseOpciones: tops([
      { id: "chamoy", name: "Chamoy" },
      { id: "tajin", name: "Tajín" },
      { id: "tamarindo", name: "Escarcha de tamarindo" },
      { id: "salsa_habanero", name: "Salsa habanero" },
      { id: "valentina", name: "Salsa Valentina" }
    ])
  },
  {
    id: "mango_mediana",
    name: "Michelada de Mango · Mediana",
    price: 80,
    description: "16 oz — dulce y picante con trozos de mango",
    pasos: DEFAULT_PASOS$1,
    faseOpciones: tops([
      { id: "chamoy", name: "Chamoy" },
      { id: "tajin", name: "Tajín" },
      { id: "mango_trozos", name: "Trozos de mango" },
      { id: "miguelito", name: "Miguelito" }
    ])
  },
  {
    id: "frutos_rojos_grande",
    name: "Michelada Frutos Rojos · Grande",
    price: 95,
    description: "24 oz — jarabe de frutos rojos y escarcha dulce",
    pasos: DEFAULT_PASOS$1,
    faseOpciones: tops([
      { id: "chamoy", name: "Chamoy" },
      { id: "miguelito", name: "Miguelito" },
      { id: "azucar", name: "Escarcha de azúcar" },
      { id: "fresa", name: "Trozos de fresa" }
    ])
  }
];
const ADDITIONS = [
  { id: "camaron", name: "Camarón cocido", price: 25, stockKey: "camaron" },
  { id: "pulpo", name: "Pulpo", price: 35, stockKey: "pulpo" },
  { id: "pepino", name: "Pepino", price: 10, stockKey: "pepino" },
  { id: "jicama", name: "Jícama", price: 10, stockKey: "jicama" },
  { id: "cacahuate", name: "Cacahuates", price: 15, stockKey: "cacahuate" },
  { id: "gomitas", name: "Gomitas enchiladas", price: 15, stockKey: "gomitas" },
  { id: "rielitos", name: "Rielitos", price: 20, stockKey: "rielitos" }
];
const DEFAULT_INVENTORY = [
  { key: "cerveza", name: "Cerveza (botellas)", stock: 96, unit: "pz", minStock: 10 },
  { key: "clamato", name: "Clamato", stock: 8, unit: "L", minStock: 2 },
  { key: "limon", name: "Limón", stock: 100, unit: "pz", minStock: 15 },
  { key: "chamoy", name: "Chamoy", stock: 3, unit: "L", minStock: 1 },
  { key: "tajin", name: "Tajín", stock: 1500, unit: "g", minStock: 200 },
  { key: "camaron", name: "Camarón cocido", stock: 40, unit: "pz", minStock: 5 },
  { key: "pulpo", name: "Pulpo", stock: 20, unit: "pz", minStock: 5 },
  { key: "pepino", name: "Pepino", stock: 25, unit: "pz", minStock: 5 },
  { key: "jicama", name: "Jícama", stock: 15, unit: "pz", minStock: 5 },
  { key: "cacahuate", name: "Cacahuates", stock: 2e3, unit: "g", minStock: 300 },
  { key: "gomitas", name: "Gomitas enchiladas", stock: 1500, unit: "g", minStock: 200 },
  { key: "rielitos", name: "Rielitos", stock: 60, unit: "pz", minStock: 10 }
];
const DEFAULT_MESAS = [
  { id: "m1", nombre: "Mesa 1", capacidad: 4, estado: "libre" },
  { id: "m2", nombre: "Mesa 2", capacidad: 4, estado: "libre" },
  { id: "m3", nombre: "Mesa 3", capacidad: 2, estado: "libre" },
  { id: "m4", nombre: "Mesa 4", capacidad: 6, estado: "libre" },
  { id: "m5", nombre: "Mesa 5", capacidad: 4, estado: "libre" },
  { id: "barra", nombre: "Barra", capacidad: 8, estado: "libre" },
  { id: "llevar", nombre: "Para llevar", capacidad: 0, estado: "libre" }
];
function useComandas() {
  const [comandas, setComandas] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  const reload = reactExports.useCallback(async () => {
    if (!getStoredSession()) {
      setComandas(getCachedComandas());
      setLoading(false);
      return;
    }
    const cached = getCachedComandas();
    if (!isAppOnline()) {
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
      setError(err instanceof Error ? err.message : "Error al cargar comandas");
      setComandas([...cached].sort(sortComandasByQueue));
    } finally {
      setLoading(false);
    }
  }, []);
  reactExports.useEffect(() => {
    void reload();
    if (!getStoredSession()) return;
    const interval = window.setInterval(() => {
      if (isAppOnline()) void reload();
    }, 3e3);
    return () => window.clearInterval(interval);
  }, [reload]);
  return {
    comandas,
    loading,
    error,
    reload,
    addComanda: async (c) => {
      if (!getStoredSession()) {
        const prev = getCachedComandas();
        const folio = nextLocalFolio();
        const nueva = {
          ...c,
          id: crypto.randomUUID(),
          folio,
          queueOrder: nextQueueOrderForToday(prev),
          createdAt: Date.now(),
          status: "pendiente"
        };
        const all = [...prev, nueva].sort(sortComandasByQueue);
        setCachedComandas(all);
        setComandas(all);
        return nueva;
      }
      const clientId = crypto.randomUUID();
      const queueOffline = () => {
        const nueva = buildOptimisticComanda(c, clientId);
        enqueueOp({ type: "comanda:create", clientId, payload: c });
        mergeComandaInCache(nueva);
        setComandas((prev) => [...prev, nueva].sort(sortComandasByQueue));
        return nueva;
      };
      if (!isAppOnline()) return queueOffline();
      try {
        const nueva = await createComandaApi(c, clientId);
        mergeComandaInCache(nueva);
        setComandas(
          (prev) => [...prev.filter((x) => x.id !== nueva.id), nueva].sort(sortComandasByQueue)
        );
        return nueva;
      } catch (err) {
        if (isNetworkFailure(err)) return queueOffline();
        throw err;
      }
    },
    updateStatus: async (id, status) => {
      if (!getStoredSession()) {
        const all = getCachedComandas().map((c) => c.id === id ? { ...c, status } : c).sort(sortComandasByQueue);
        setCachedComandas(all);
        setComandas(all);
        return;
      }
      const applyLocal = () => {
        patchComandaInCache(id, { status });
        enqueueOp({ type: "comanda:patch", comandaId: id, patch: { status } });
        setComandas(
          (prev) => prev.map((c) => c.id === id ? { ...c, status } : c).sort(sortComandasByQueue)
        );
      };
      if (!isAppOnline()) {
        applyLocal();
        return;
      }
      try {
        const updated = await patchComandaApi(id, { status });
        mergeComandaInCache(updated);
        setComandas(
          (prev) => prev.map((c) => c.id === id ? updated : c).sort(sortComandasByQueue)
        );
      } catch (err) {
        if (isNetworkFailure(err)) applyLocal();
        else throw err;
      }
    },
    remove: async (id) => {
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
      if (!isAppOnline()) {
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
    reassignMesa: async (id, mesa, cliente) => {
      if (!getStoredSession()) {
        const all = getCachedComandas().map((c) => c.id === id ? { ...c, mesa, cliente: cliente ?? c.cliente } : c).sort(sortComandasByQueue);
        setCachedComandas(all);
        setComandas(all);
        return;
      }
      const patch = { mesa, cliente };
      const applyLocal = () => {
        patchComandaInCache(id, patch);
        enqueueOp({ type: "comanda:patch", comandaId: id, patch });
        setComandas(
          (prev) => prev.map((c) => c.id === id ? { ...c, ...patch } : c).sort(sortComandasByQueue)
        );
      };
      if (!isAppOnline()) {
        applyLocal();
        return;
      }
      try {
        const updated = await patchComandaApi(id, patch);
        mergeComandaInCache(updated);
        setComandas((prev) => prev.map((c) => c.id === id ? updated : c));
      } catch (err) {
        if (isNetworkFailure(err)) applyLocal();
        else throw err;
      }
    }
  };
}
function useMesas() {
  const [mesas, setMesas] = reactExports.useState(DEFAULT_MESAS);
  const [loading, setLoading] = reactExports.useState(true);
  const reload = reactExports.useCallback(async () => {
    if (!getStoredSession()) {
      setMesas(getCachedMesas(DEFAULT_MESAS));
      setLoading(false);
      return;
    }
    const cached = getCachedMesas(DEFAULT_MESAS);
    if (!isAppOnline()) {
      setMesas(cached);
      setLoading(false);
      return;
    }
    try {
      const data = await fetchMesas();
      setCachedMesas(data);
      setMesas(data);
    } catch {
      setMesas(cached);
    } finally {
      setLoading(false);
    }
  }, []);
  reactExports.useEffect(() => {
    void reload();
    if (!getStoredSession()) return;
    const interval = window.setInterval(() => {
      if (isAppOnline()) void reload();
    }, 1e4);
    return () => window.clearInterval(interval);
  }, [reload]);
  return {
    mesas,
    loading,
    reload,
    marcarAtendida: async (id) => {
      if (!getStoredSession()) {
        const next = getCachedMesas(DEFAULT_MESAS).map(
          (m) => m.id === id ? { ...m, estado: "libre", cliente: void 0 } : m
        );
        setCachedMesas(next);
        setMesas(next);
        return next.find((m) => m.id === id);
      }
      const applyLocal = () => {
        const next = getCachedMesas(DEFAULT_MESAS).map(
          (m) => m.id === id ? { ...m, estado: "libre", cliente: void 0 } : m
        );
        setCachedMesas(next);
        enqueueOp({ type: "mesa:atendida", mesaId: id });
        setMesas(next);
        return next.find((m) => m.id === id);
      };
      if (!isAppOnline()) return applyLocal();
      try {
        const updated = await marcarMesaAtendidaApi(id);
        setCachedMesas(
          getCachedMesas(DEFAULT_MESAS).map((m) => m.id === id ? updated : m)
        );
        setMesas((prev) => prev.map((m) => m.id === id ? updated : m));
        return updated;
      } catch (err) {
        if (isNetworkFailure(err)) return applyLocal();
        throw err;
      }
    },
    updateMesa: async (id, patch) => {
      if (!getStoredSession()) {
        const next = getCachedMesas(DEFAULT_MESAS).map(
          (m) => m.id === id ? { ...m, ...patch } : m
        );
        setCachedMesas(next);
        setMesas(next);
        return;
      }
      const applyLocal = () => {
        const next = getCachedMesas(DEFAULT_MESAS).map(
          (m) => m.id === id ? { ...m, ...patch } : m
        );
        setCachedMesas(next);
        enqueueOp({ type: "mesa:patch", mesaId: id, patch });
        setMesas(next);
      };
      if (!isAppOnline()) {
        applyLocal();
        return;
      }
      try {
        const updated = await patchMesaApi(id, patch);
        setMesas((prev) => prev.map((m) => m.id === id ? updated : m));
        setCachedMesas(
          getCachedMesas(DEFAULT_MESAS).map((m) => m.id === id ? updated : m)
        );
      } catch (err) {
        if (isNetworkFailure(err)) applyLocal();
        else throw err;
      }
    },
    addMesa: async (nombre, capacidad) => {
      if (!getStoredSession()) {
        const nueva2 = { id: crypto.randomUUID(), nombre, capacidad, estado: "libre" };
        const next = [...getCachedMesas(DEFAULT_MESAS), nueva2];
        setCachedMesas(next);
        setMesas(next);
        return;
      }
      if (!isAppOnline()) throw new Error("Sin conexión: no se puede crear mesa nueva offline");
      const nueva = await createMesaApi(nombre, capacidad);
      setMesas((prev) => [...prev, nueva]);
      setCachedMesas([...getCachedMesas(DEFAULT_MESAS), nueva]);
    },
    removeMesa: async (id) => {
      if (!getStoredSession()) {
        const next = getCachedMesas(DEFAULT_MESAS).filter((m) => m.id !== id);
        setCachedMesas(next);
        setMesas(next);
        return;
      }
      if (!isAppOnline()) throw new Error("Sin conexión: no se puede eliminar mesa offline");
      await deleteMesaApi(id);
      setMesas((prev) => prev.filter((m) => m.id !== id));
      setCachedMesas(getCachedMesas(DEFAULT_MESAS).filter((m) => m.id !== id));
    },
    resetMesas: () => {
      setCachedMesas(DEFAULT_MESAS);
      setMesas(DEFAULT_MESAS);
      void reload();
    }
  };
}
function useInventory() {
  const [items, setItems] = reactExports.useState(DEFAULT_INVENTORY);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  const reload = reactExports.useCallback(async () => {
    if (!getStoredSession()) {
      setItems(getCachedInventario(DEFAULT_INVENTORY));
      setLoading(false);
      return;
    }
    const cached = getCachedInventario(DEFAULT_INVENTORY);
    if (!isAppOnline()) {
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
      setError(err instanceof Error ? err.message : "Error al cargar inventario");
      setItems(cached);
    } finally {
      setLoading(false);
    }
  }, []);
  reactExports.useEffect(() => {
    void reload();
    if (!getStoredSession()) {
      const handler = () => setItems(getCachedInventario(DEFAULT_INVENTORY));
      window.addEventListener("michelada-store-change", handler);
      return () => window.removeEventListener("michelada-store-change", handler);
    }
    const interval = window.setInterval(() => {
      if (isAppOnline()) void reload();
    }, 8e3);
    return () => window.clearInterval(interval);
  }, [reload]);
  const setStockLocal = (key, stock) => {
    const next = getCachedInventario(DEFAULT_INVENTORY).map(
      (i) => i.key === key ? { ...i, stock } : i
    );
    setCachedInventario(next);
    setItems(next);
  };
  const decrementLocal = (key, qty) => {
    const next = getCachedInventario(DEFAULT_INVENTORY).map(
      (i) => i.key === key ? { ...i, stock: Math.max(0, i.stock - qty) } : i
    );
    setCachedInventario(next);
    setItems(next);
  };
  return {
    items,
    loading,
    error,
    reload,
    setStock: async (key, stock) => {
      if (!getStoredSession()) {
        setStockLocal(key, stock);
        return;
      }
      const applyLocal = () => {
        setStockLocal(key, stock);
        enqueueOp({ type: "inventario:patch", key, stock });
      };
      if (!isAppOnline()) {
        applyLocal();
        return;
      }
      try {
        const updated = await patchInventarioStock(key, stock);
        setItems((prev) => prev.map((i) => i.key === key ? updated : i));
        setCachedInventario(
          getCachedInventario(DEFAULT_INVENTORY).map((i) => i.key === key ? updated : i)
        );
      } catch (err) {
        if (isNetworkFailure(err)) applyLocal();
        else throw err;
      }
    },
    decrement: (key, qty) => {
      if (getStoredSession() && isAppOnline()) return;
      decrementLocal(key, qty);
    },
    decrementBatch: (totals) => {
      if (getStoredSession() && isAppOnline()) return;
      let next = getCachedInventario(DEFAULT_INVENTORY);
      for (const [key, qty] of Object.entries(totals)) {
        next = next.map(
          (i) => i.key === key ? { ...i, stock: Math.max(0, i.stock - qty) } : i
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
      if (!isAppOnline()) throw new Error("Sin conexión");
      const data = await resetInventarioApi();
      setCachedInventario(data);
      setItems(data);
    },
    removeItem: async (key) => {
      if (!getStoredSession()) {
        const next2 = getCachedInventario(DEFAULT_INVENTORY).filter((i) => i.key !== key);
        setCachedInventario(next2);
        setItems(next2);
        return;
      }
      if (!isAppOnline()) throw new Error("Sin conexión");
      const { deleteInventarioItem: deleteInventarioItem2 } = await Promise.resolve().then(() => inventoryApi);
      await deleteInventarioItem2(key);
      const next = getCachedInventario(DEFAULT_INVENTORY).filter((i) => i.key !== key);
      setCachedInventario(next);
      setItems((prev) => prev.filter((i) => i.key !== key));
    }
  };
}
function calcItemTotal(basePrice, additions) {
  const adds = additions.reduce((sum, a) => sum + a.price, 0);
  return basePrice + adds;
}
const DEFAULT_PASOS = ["fase:topping", "notas"];
function buildFallbackMenu() {
  return {
    categorias: [
      {
        id: "micheladas",
        name: "Micheladas",
        description: "Nuestras micheladas preparadas al momento",
        productos: MICHELADAS.map((p) => ({
          ...p,
          categoriaId: "micheladas",
          pasos: p.pasos ?? DEFAULT_PASOS
        }))
      }
    ],
    adiciones: ADDITIONS,
    fases: []
  };
}
const FALLBACK_MENU = buildFallbackMenu();
function flattenProductos(categorias) {
  return categorias.flatMap((c) => c.productos);
}
function normalizeMenuFromApi(data) {
  const fases = data.fases ?? FALLBACK_MENU.fases;
  if (data.categorias?.length) {
    return {
      categorias: data.categorias,
      adiciones: data.adiciones ?? FALLBACK_MENU.adiciones,
      fases
    };
  }
  if (data.productos?.length) {
    return {
      categorias: [
        {
          id: "general",
          name: "Menú",
          productos: data.productos
        }
      ],
      adiciones: data.adiciones ?? FALLBACK_MENU.adiciones,
      fases
    };
  }
  return FALLBACK_MENU;
}
function mapFaseOpcion(raw) {
  return {
    id: String(raw.id),
    name: String(raw.name),
    faseId: String(raw.faseId ?? raw.fase_id ?? "topping"),
    faseName: String(raw.faseName ?? raw.fase_name ?? ""),
    stockKey: raw.stockKey != null ? String(raw.stockKey) : raw.inventario_clave != null ? String(raw.inventario_clave) : void 0,
    cantidad: raw.cantidad != null ? Number(raw.cantidad) : void 0
  };
}
function mapAdicion(raw) {
  return {
    id: String(raw.id),
    name: String(raw.name),
    price: Number(raw.price),
    stockKey: raw.stockKey != null ? String(raw.stockKey) : raw.stock_key != null ? String(raw.stock_key) : void 0,
    cantidad: Number(raw.cantidad ?? 1)
  };
}
function mapFase(raw) {
  const opciones = (raw.opciones ?? []).map(mapFaseOpcion);
  return {
    id: String(raw.id),
    name: String(raw.name),
    description: String(raw.description ?? ""),
    activo: raw.activo,
    opciones
  };
}
function mapProducto(raw) {
  const legacyTops = raw.toppings ?? [];
  const faseOpciones = (raw.faseOpciones ?? raw.fase_opciones ?? legacyTops).map(
    (t) => mapFaseOpcion(
      typeof t === "object" && t && "faseId" in t ? t : { ...t, faseId: "topping", faseName: "Topping" }
    )
  );
  const consumo = (raw.consumo ?? []).map((c) => ({
    clave: String(c.clave),
    cantidad: Number(c.cantidad ?? 1)
  }));
  return {
    id: String(raw.id),
    name: String(raw.name),
    price: Number(raw.price),
    description: String(raw.description ?? ""),
    faseOpciones,
    consumo,
    pasos: raw.pasos ?? void 0,
    categoriaId: String(raw.categoria_id ?? raw.categoriaId ?? "")
  };
}
function mapCategoria(raw) {
  const productos = (raw.productos ?? []).map(mapProducto);
  return {
    id: String(raw.id),
    name: String(raw.name),
    description: String(raw.description ?? ""),
    activo: raw.activo,
    productos
  };
}
function parseMenuResponse(data) {
  const categorias = data.categorias?.map(mapCategoria);
  const productos = data.productos?.map(mapProducto);
  const adicionesRaw = data.adiciones ?? [];
  const adiciones = adicionesRaw.length > 0 ? adicionesRaw.map(mapAdicion) : FALLBACK_MENU.adiciones;
  const fases = data.fases?.map(mapFase);
  return normalizeMenuFromApi({ categorias, productos, adiciones, fases });
}
async function fetchMenu() {
  const session = getStoredSession();
  if (!session) return FALLBACK_MENU;
  if (!isAppOnline()) {
    return getCachedMenu(FALLBACK_MENU);
  }
  try {
    const res = await fetch(`${getApiUrl()}/api/menu`, {
      headers: { Authorization: `Bearer ${session.accessToken}` }
    });
    if (!res.ok) {
      console.warn("Menú API:", parseApiError(await res.json().catch(() => ({})), res.status));
      return getCachedMenu(FALLBACK_MENU);
    }
    const menu = parseMenuResponse(await res.json());
    setCachedMenu(menu);
    return menu;
  } catch {
    return getCachedMenu(FALLBACK_MENU);
  }
}
async function fetchMenuAdmin() {
  const session = getStoredSession();
  if (!session) throw new Error("Sesión expirada");
  const res = await fetch(`${getApiUrl()}/api/admin/menu`, {
    headers: { Authorization: `Bearer ${session.accessToken}` }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return parseMenuResponse(data);
}
async function fetchFasesAdmin() {
  const session = getStoredSession();
  if (!session) throw new Error("Sesión expirada");
  const res = await fetch(`${getApiUrl()}/api/admin/menu/fases`, {
    headers: { Authorization: `Bearer ${session.accessToken}` }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return data.map(mapFase);
}
async function createFase(input) {
  const session = getStoredSession();
  if (!session) throw new Error("Sesión expirada");
  const res = await fetch(`${getApiUrl()}/api/admin/menu/fases`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`
    },
    body: JSON.stringify(input)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return mapFase(data);
}
async function updateFase(id, patch) {
  const session = getStoredSession();
  if (!session) throw new Error("Sesión expirada");
  const res = await fetch(`${getApiUrl()}/api/admin/menu/fases/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`
    },
    body: JSON.stringify(patch)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return mapFase(data);
}
async function createFaseOpcion(faseId, payload) {
  const session = getStoredSession();
  if (!session) throw new Error("Sesión expirada");
  const res = await fetch(`${getApiUrl()}/api/admin/menu/fases/${faseId}/opciones`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`
    },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return mapFaseOpcion(data);
}
async function updateFaseOpcion(opcionId, patch) {
  const session = getStoredSession();
  if (!session) throw new Error("Sesión expirada");
  const res = await fetch(`${getApiUrl()}/api/admin/menu/fases/opciones/${opcionId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`
    },
    body: JSON.stringify(patch)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return mapFaseOpcion(data);
}
async function deleteFaseOpcion(opcionId) {
  const session = getStoredSession();
  if (!session) throw new Error("Sesión expirada");
  const res = await fetch(`${getApiUrl()}/api/admin/menu/fases/opciones/${opcionId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${session.accessToken}` }
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(parseApiError(data, res.status));
  }
}
async function createProducto(input) {
  const session = getStoredSession();
  if (!session) throw new Error("Sesión expirada");
  const res = await fetch(`${getApiUrl()}/api/admin/menu/productos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`
    },
    body: JSON.stringify(input)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return data;
}
async function updateProducto(id, patch) {
  const session = getStoredSession();
  if (!session) throw new Error("Sesión expirada");
  const res = await fetch(`${getApiUrl()}/api/admin/menu/productos/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`
    },
    body: JSON.stringify(patch)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return data;
}
async function createCategoria(input) {
  const session = getStoredSession();
  if (!session) throw new Error("Sesión expirada");
  const res = await fetch(`${getApiUrl()}/api/admin/menu/categorias`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`
    },
    body: JSON.stringify(input)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return data;
}
async function updateCategoria(id, patch) {
  const session = getStoredSession();
  if (!session) throw new Error("Sesión expirada");
  const res = await fetch(`${getApiUrl()}/api/admin/menu/categorias/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`
    },
    body: JSON.stringify(patch)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return data;
}
async function createAdicion(input) {
  const session = getStoredSession();
  if (!session) throw new Error("Sesión expirada");
  const res = await fetch(`${getApiUrl()}/api/admin/menu/adiciones`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`
    },
    body: JSON.stringify(input)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return data;
}
async function updateAdicion(id, patch) {
  const session = getStoredSession();
  if (!session) throw new Error("Sesión expirada");
  const res = await fetch(`${getApiUrl()}/api/admin/menu/adiciones/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`
    },
    body: JSON.stringify(patch)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return data;
}
async function deleteAdicion(id) {
  const session = getStoredSession();
  if (!session) throw new Error("Sesión expirada");
  const res = await fetch(`${getApiUrl()}/api/admin/menu/adiciones/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${session.accessToken}` }
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(parseApiError(data, res.status));
  }
}
let flushing = false;
async function applyOp(op) {
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
async function pullFreshData() {
  if (!getStoredSession() || !isAppOnline()) return;
  const [comandas, mesas, inventario, menu] = await Promise.all([
    fetchComandas({ status: "pendiente,lista,entregada" }),
    fetchMesas(),
    fetchInventario(),
    fetchMenu()
  ]);
  setCachedComandas(comandas);
  setCachedMesas(mesas);
  setCachedInventario(inventario);
  setCachedMenu(menu);
  writeLocal(LS_SYNC_META, { lastPullAt: Date.now() });
  notifySyncChange();
}
async function flushOutbox() {
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
      lastSyncedCount: synced
    });
    notifySyncChange();
  } finally {
    flushing = false;
  }
  return { synced, failed };
}
function buildOptimisticComanda(input, clientId) {
  const prev = getCachedComandas();
  return {
    ...input,
    id: clientId,
    folio: nextLocalFolio(),
    queueOrder: nextQueueOrderForToday(prev),
    createdAt: Date.now(),
    status: "pendiente"
  };
}
function mergeComandaInCache(comanda) {
  const all = getCachedComandas();
  const idx = all.findIndex((c) => c.id === comanda.id);
  if (idx >= 0) {
    all[idx] = comanda;
  } else {
    all.push(comanda);
  }
  setCachedComandas(all);
}
function patchComandaInCache(id, patch) {
  setCachedComandas(
    getCachedComandas().map((c) => c.id === id ? { ...c, ...patch } : c)
  );
}
function removeComandaFromCache(id) {
  setCachedComandas(getCachedComandas().filter((c) => c.id !== id));
}
function initOfflineSync() {
  if (typeof window === "undefined") return () => {
  };
  const onOnline = () => {
    void flushOutbox();
  };
  window.addEventListener("online", onOnline);
  if (getStoredSession() && isAppOnline()) {
    void flushOutbox();
  }
  return () => window.removeEventListener("online", onOnline);
}
function useOfflineSync() {
  const [online, setOnline] = reactExports.useState(() => isAppOnline());
  const [pending, setPending] = reactExports.useState(() => getPendingCount());
  const [syncing, setSyncing] = reactExports.useState(false);
  const refresh = reactExports.useCallback(() => {
    setOnline(isAppOnline());
    setPending(getPendingCount());
  }, []);
  const syncNow = reactExports.useCallback(async () => {
    if (!isAppOnline()) return;
    setSyncing(true);
    try {
      await flushOutbox();
    } finally {
      setSyncing(false);
      refresh();
    }
  }, [refresh]);
  reactExports.useEffect(() => {
    const teardown = initOfflineSync();
    const onChange = () => refresh();
    window.addEventListener("online", onChange);
    window.addEventListener("offline", onChange);
    window.addEventListener("michelada-sync-change", onChange);
    refresh();
    return () => {
      teardown();
      window.removeEventListener("online", onChange);
      window.removeEventListener("offline", onChange);
      window.removeEventListener("michelada-sync-change", onChange);
    };
  }, [refresh]);
  return { online, pending, syncing, syncNow };
}
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function OfflineSyncBanner() {
  const { online, pending, syncing, syncNow } = useOfflineSync();
  if (online && pending === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn(
        "fixed top-0 left-0 right-0 z-[100] px-3 py-2 text-sm font-semibold shadow-md",
        "pt-[max(0.5rem,env(safe-area-inset-top))]",
        online ? "bg-amber-500 text-slate-900" : "bg-slate-900 text-white"
      ),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-lg flex items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 min-w-0", children: !online ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CloudOff, { className: "h-4 w-4 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: "Sin conexión — modo local activo" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CloudUpload, { className: "h-4 w-4 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate", children: [
            pending,
            " cambio",
            pending === 1 ? "" : "s",
            " pendiente",
            pending === 1 ? "" : "s",
            " de sincronizar"
          ] })
        ] }) }),
        online && pending > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => void syncNow(),
            disabled: syncing,
            className: "shrink-0 inline-flex items-center gap-1 rounded-full bg-slate-900 text-white px-3 py-1 text-xs font-bold disabled:opacity-60",
            children: [
              syncing ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Wifi, { className: "h-3 w-3" }),
              syncing ? "Sync…" : "Sincronizar"
            ]
          }
        )
      ] })
    }
  );
}
const appCss = "/assets/styles-Tl1CIrHR.css";
function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error"
    }
  );
}
function registerSW(options = {}) {
  const {
    immediate = false,
    onNeedReload,
    onNeedRefresh,
    onOfflineReady,
    onRegistered,
    onRegisteredSW,
    onRegisterError
  } = options;
  let wb;
  let registerPromise;
  const updateServiceWorker = async (_reloadPage = true) => {
    await registerPromise;
  };
  async function register() {
    if ("serviceWorker" in navigator) {
      wb = await import("./workbox-window.prod.es5-BAA1jQbh.mjs").then(({ Workbox }) => {
        return new Workbox("/sw.js", { scope: "/", type: "classic" });
      }).catch((e) => {
        onRegisterError?.(e);
        return void 0;
      });
      if (!wb)
        return;
      {
        {
          wb.addEventListener("activated", (event) => {
            if (event.isUpdate || event.isExternal) {
              if (onNeedReload)
                onNeedReload();
              else
                window.location.reload();
            }
          });
          wb.addEventListener("installed", (event) => {
            if (!event.isUpdate) {
              onOfflineReady?.();
            }
          });
        }
      }
      wb.register({ immediate }).then((r) => {
        if (onRegisteredSW)
          onRegisteredSW("/sw.js", r);
        else
          onRegistered?.(r);
      }).catch((e) => {
        onRegisterError?.(e);
      });
    }
  }
  registerPromise = register();
  return updateServiceWorker;
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  reactExports.useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$6 = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Micheladas Black" },
      { name: "description", content: "Sistema de pedidos de micheladas" },
      { name: "author", content: "Micheladas Black" },
      { property: "og:title", content: "Micheladas Black" },
      { property: "og:description", content: "Sistema de pedidos de micheladas" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "theme-color", content: "#1a1a2e" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Micheladas" }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      },
      {
        rel: "manifest",
        href: "/manifest.webmanifest"
      },
      {
        rel: "apple-touch-icon",
        href: "/apple-touch-icon.png"
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { suppressHydrationWarning: true, children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$6.useRouteContext();
  reactExports.useEffect(() => {
    if (typeof window !== "undefined") {
      const updateSW = registerSW({
        onNeedRefresh() {
          console.log("New content available, please refresh");
        },
        onOfflineReady() {
          console.log("App is ready to work offline");
        }
      });
      return () => updateSW();
    }
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(QueryClientProvider, { client: queryClient, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(OfflineSyncBanner, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {})
  ] });
}
function homePathForRole(rol) {
  if (rol === "admin") return "/admin";
  if (rol === "cocinero") return "/barra";
  return "/";
}
const $$splitComponentImporter$5 = () => import("./login-CSXpe7Wj.mjs");
const Route$5 = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [{
      title: "Iniciar sesión · Michelandia"
    }]
  }),
  beforeLoad: () => {
    const session = getStoredSession();
    if (session) {
      throw redirect({
        to: homePathForRole(session.user.rol)
      });
    }
  },
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./impresion-CoBrMBAZ.mjs");
const Route$4 = createFileRoute("/impresion")({
  ssr: false,
  head: () => ({
    meta: [{
      title: "Impresión · Michelandia"
    }]
  }),
  beforeLoad: async () => {
    const session = await validateSession();
    if (!session) {
      throw redirect({
        to: "/login"
      });
    }
    if (session.user.rol !== "cocinero" && session.user.rol !== "admin") {
      throw redirect({
        to: "/"
      });
    }
    return {
      user: session.user
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./carta-D1XXyEld.mjs");
const Route$3 = createFileRoute("/carta")({
  ssr: false,
  head: () => ({
    meta: [{
      title: "Carta · Michelandia"
    }, {
      name: "description",
      content: "Menú Michelandia — micheladas, sabores y precios. Refresca tu mente y tu corazón."
    }],
    links: [{
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Pacifico&family=Poppins:wght@600;700;800&display=swap"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./barra-BdlIFeMk.mjs");
const Route$2 = createFileRoute("/barra")({
  ssr: false,
  head: () => ({
    meta: [{
      title: "Barra · Micheladas"
    }]
  }),
  beforeLoad: async () => {
    const session = await validateSession();
    if (!session) {
      throw redirect({
        to: "/login"
      });
    }
    if (session.user.rol !== "cocinero") {
      throw redirect({
        to: session.user.rol === "admin" ? "/admin" : "/"
      });
    }
    return {
      user: session.user
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./admin-tL6JVAMq.mjs");
const Route$1 = createFileRoute("/admin")({
  ssr: false,
  pendingComponent: AdminPanelFallback,
  head: () => ({
    meta: [{
      title: "Panel administrador · Micheladas POS"
    }]
  }),
  beforeLoad: async () => {
    const session = await validateSession();
    if (!session) {
      throw redirect({
        to: "/login"
      });
    }
    if (session.user.rol !== "admin") {
      throw redirect({
        to: "/"
      });
    }
    return {
      user: session.user
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
function AdminPanelFallback() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background flex", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: "hidden md:flex w-56 shrink-0 border-r bg-card", "aria-hidden": true }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-muted-foreground" }) })
  ] });
}
const $$splitComponentImporter = () => import("./index-Dq92df8K.mjs");
const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [{
      title: "Micheladas POS"
    }, {
      name: "description",
      content: "Sistema de pedidos y comandas para puesto de micheladas."
    }]
  }),
  beforeLoad: async () => {
    const session = await validateSession();
    if (!session) {
      throw redirect({
        to: "/login"
      });
    }
    if (session.user.rol === "admin") {
      throw redirect({
        to: "/admin"
      });
    }
    if (session.user.rol === "cocinero") {
      throw redirect({
        to: "/barra"
      });
    }
    return {
      user: session.user
    };
  },
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const LoginRoute = Route$5.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$6
});
const ImpresionRoute = Route$4.update({
  id: "/impresion",
  path: "/impresion",
  getParentRoute: () => Route$6
});
const CartaRoute = Route$3.update({
  id: "/carta",
  path: "/carta",
  getParentRoute: () => Route$6
});
const BarraRoute = Route$2.update({
  id: "/barra",
  path: "/barra",
  getParentRoute: () => Route$6
});
const AdminRoute = Route$1.update({
  id: "/admin",
  path: "/admin",
  getParentRoute: () => Route$6
});
const IndexRoute = Route.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$6
});
const rootRouteChildren = {
  IndexRoute,
  AdminRoute,
  BarraRoute,
  CartaRoute,
  ImpresionRoute,
  LoginRoute
};
const routeTree = Route$6._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  createCategoria as A,
  updateCategoria as B,
  createProducto as C,
  updateProducto as D,
  getStoredSession as E,
  FALLBACK_MENU as F,
  parseApiError as G,
  ROL_LABELS as H,
  calcItemTotal as I,
  Route$1 as J,
  getPendingCount as K,
  Route as L,
  MICHELADAS as M,
  fetchMenu as N,
  flattenProductos as O,
  router as P,
  Route$4 as R,
  clearSession as a,
  getApiUrl as b,
  cn as c,
  sortComandasByQueue as d,
  Route$2 as e,
  useInventory as f,
  getCachedMenu as g,
  homePathForRole as h,
  isAppOnline as i,
  useMesas as j,
  fetchMenuAdmin as k,
  login as l,
  fetchInventario as m,
  normalizeMenuFromApi as n,
  createAdicion as o,
  updateAdicion as p,
  queueLabel as q,
  deleteAdicion as r,
  setCachedMenu as s,
  fetchFasesAdmin as t,
  useComandas as u,
  createFase as v,
  updateFase as w,
  createFaseOpcion as x,
  updateFaseOpcion as y,
  deleteFaseOpcion as z
};
