import type { Fase, FaseOpcion } from "@/lib/fases";
import type { Addition, MicheladaType } from "@/lib/micheladas-store";
import { getApiUrl, getStoredSession, parseApiError } from "@/lib/auth";
import { getCachedMenu, setCachedMenu } from "@/lib/offline/local-cache";
import { markApiFailureFromStatus, shouldSyncWithServer } from "@/lib/offline/network";
import {
  getFallbackMenu,
  normalizeMenuFromApi,
  type MenuCategoria,
  type MenuData,
} from "@/lib/menu-utils";

export type { MenuCategoria, MenuData } from "@/lib/menu-utils";

export type FaseOpcionOption = FaseOpcion;

function mapFaseOpcion(raw: Record<string, unknown>): FaseOpcion {
  return {
    id: String(raw.id),
    name: String(raw.name),
    faseId: String(raw.faseId ?? raw.fase_id ?? "topping"),
    faseName: String(raw.faseName ?? raw.fase_name ?? ""),
    stockKey: raw.stockKey != null ? String(raw.stockKey) : raw.inventario_clave != null ? String(raw.inventario_clave) : undefined,
    cantidad: raw.cantidad != null ? Number(raw.cantidad) : undefined,
  };
}

function mapAdicion(raw: Record<string, unknown>): Addition {
  return {
    id: String(raw.id),
    name: String(raw.name),
    price: Number(raw.price),
    stockKey:
      raw.stockKey != null
        ? String(raw.stockKey)
        : raw.stock_key != null
          ? String(raw.stock_key)
          : undefined,
    cantidad: Number(raw.cantidad ?? 1),
  };
}

function mapFase(raw: Record<string, unknown>): Fase {
  const opciones = ((raw.opciones as Record<string, unknown>[]) ?? []).map(mapFaseOpcion);
  return {
    id: String(raw.id),
    name: String(raw.name),
    description: String(raw.description ?? ""),
    activo: raw.activo as boolean | undefined,
    opciones,
  };
}

function mapProducto(raw: Record<string, unknown>): MicheladaType {
  const legacyTops = (raw.toppings as Record<string, unknown>[]) ?? [];
  const faseOpciones = (
    (raw.faseOpciones as Record<string, unknown>[]) ??
    (raw.fase_opciones as Record<string, unknown>[]) ??
    legacyTops
  ).map((t) =>
    mapFaseOpcion(
      typeof t === "object" && t && "faseId" in t
        ? (t as Record<string, unknown>)
        : { ...t, faseId: "topping", faseName: "Topping" },
    ),
  );
  const consumo = (
    (raw.consumo as { clave?: string; cantidad?: number }[]) ?? []
  ).map((c) => ({
    clave: String(c.clave),
    cantidad: Number(c.cantidad ?? 1),
  }));

  return {
    id: String(raw.id),
    name: String(raw.name),
    price: Number(raw.price),
    description: String(raw.description ?? ""),
    faseOpciones,
    consumo,
    pasos: (raw.pasos as string[]) ?? undefined,
    categoriaId: String(raw.categoria_id ?? raw.categoriaId ?? ""),
  };
}

function mapCategoria(raw: Record<string, unknown>): MenuCategoria {
  const productos = ((raw.productos as Record<string, unknown>[]) ?? []).map(mapProducto);
  return {
    id: String(raw.id),
    name: String(raw.name),
    description: String(raw.description ?? ""),
    activo: raw.activo as boolean | undefined,
    productos,
  };
}

function parseMenuResponse(data: Record<string, unknown>): MenuData {
  const categorias = (data.categorias as Record<string, unknown>[] | undefined)?.map(mapCategoria);
  const productos = (data.productos as Record<string, unknown>[] | undefined)?.map(mapProducto);
  const adicionesRaw = (data.adiciones as Record<string, unknown>[] | undefined) ?? [];
  const fallback = getFallbackMenu();
  const adiciones =
    adicionesRaw.length > 0
      ? adicionesRaw.map(mapAdicion)
      : fallback.adiciones;
  const fases = (data.fases as Record<string, unknown>[] | undefined)?.map(mapFase);
  return normalizeMenuFromApi({ categorias, productos, adiciones, fases });
}

export async function fetchMenu(): Promise<MenuData> {
  const session = getStoredSession();
  if (!session) return getFallbackMenu();

  if (!shouldSyncWithServer()) {
    return getCachedMenu(getFallbackMenu());
  }

  try {
    const res = await fetch(`${getApiUrl()}/api/menu`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });

    if (!res.ok) {
      markApiFailureFromStatus(res.status);
      console.warn("Menú API:", parseApiError(await res.json().catch(() => ({})), res.status));
      return getCachedMenu(getFallbackMenu());
    }

    const menu = parseMenuResponse(await res.json());
    setCachedMenu(menu);
    return menu;
  } catch {
    return getCachedMenu(getFallbackMenu());
  }
}

export async function fetchMenuAdmin(): Promise<MenuData> {
  const session = getStoredSession();
  if (!session) throw new Error("Sesión expirada");

  const res = await fetch(`${getApiUrl()}/api/admin/menu`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return parseMenuResponse(data);
}

export async function fetchFasesAdmin(): Promise<Fase[]> {
  const session = getStoredSession();
  if (!session) throw new Error("Sesión expirada");

  const res = await fetch(`${getApiUrl()}/api/admin/menu/fases`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return (data as Record<string, unknown>[]).map(mapFase);
}

export async function createFase(input: {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}) {
  const session = getStoredSession();
  if (!session) throw new Error("Sesión expirada");
  const res = await fetch(`${getApiUrl()}/api/admin/menu/fases`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return mapFase(data as Record<string, unknown>);
}

export async function updateFase(
  id: string,
  patch: Partial<{ nombre: string; descripcion: string; activo: boolean }>,
) {
  const session = getStoredSession();
  if (!session) throw new Error("Sesión expirada");
  const res = await fetch(`${getApiUrl()}/api/admin/menu/fases/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify(patch),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return mapFase(data as Record<string, unknown>);
}

export async function createFaseOpcion(
  faseId: string,
  payload: { nombre: string; inventario_clave?: string; cantidad?: number },
) {
  const session = getStoredSession();
  if (!session) throw new Error("Sesión expirada");
  const res = await fetch(`${getApiUrl()}/api/admin/menu/fases/${faseId}/opciones`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return mapFaseOpcion(data as Record<string, unknown>);
}

export async function updateFaseOpcion(
  opcionId: string,
  patch: {
    nombre?: string;
    inventario_clave?: string;
    cantidad?: number;
  },
) {
  const session = getStoredSession();
  if (!session) throw new Error("Sesión expirada");
  const res = await fetch(`${getApiUrl()}/api/admin/menu/fases/opciones/${opcionId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify(patch),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return mapFaseOpcion(data as Record<string, unknown>);
}

export async function deleteFaseOpcion(opcionId: string) {
  const session = getStoredSession();
  if (!session) throw new Error("Sesión expirada");
  const res = await fetch(`${getApiUrl()}/api/admin/menu/fases/opciones/${opcionId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(parseApiError(data, res.status));
  }
}

export type ProductoInput = {
  nombre: string;
  precio: number;
  descripcion?: string;
  categoria_id: string;
  pasos: string[];
  opcion_ids: string[];
  consumo?: { clave: string; cantidad: number }[];
  activo?: boolean;
};

export async function createProducto(input: ProductoInput) {
  const session = getStoredSession();
  if (!session) throw new Error("Sesión expirada");

  const res = await fetch(`${getApiUrl()}/api/admin/menu/productos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return data;
}

export async function updateProducto(id: string, patch: Partial<ProductoInput>) {
  const session = getStoredSession();
  if (!session) throw new Error("Sesión expirada");

  const res = await fetch(`${getApiUrl()}/api/admin/menu/productos/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify(patch),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return data;
}

export type CategoriaInput = {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
};

export async function createCategoria(input: CategoriaInput) {
  const session = getStoredSession();
  if (!session) throw new Error("Sesión expirada");

  const res = await fetch(`${getApiUrl()}/api/admin/menu/categorias`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return data;
}

export async function updateCategoria(id: string, patch: Partial<CategoriaInput & { orden?: number }>) {
  const session = getStoredSession();
  if (!session) throw new Error("Sesión expirada");

  const res = await fetch(`${getApiUrl()}/api/admin/menu/categorias/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify(patch),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return data;
}

export async function createAdicion(input: {
  nombre: string;
  precio: number;
  stock_key?: string;
  cantidad?: number;
  activo?: boolean;
}) {
  const session = getStoredSession();
  if (!session) throw new Error("Sesión expirada");

  const res = await fetch(`${getApiUrl()}/api/admin/menu/adiciones`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return data;
}

export async function updateAdicion(
  id: string,
  patch: {
    nombre?: string;
    precio?: number;
    stock_key?: string;
    cantidad?: number;
    activo?: boolean;
  },
) {
  const session = getStoredSession();
  if (!session) throw new Error("Sesión expirada");

  const res = await fetch(`${getApiUrl()}/api/admin/menu/adiciones/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify(patch),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return data;
}

export async function deleteAdicion(id: string) {
  const session = getStoredSession();
  if (!session) throw new Error("Sesión expirada");

  const res = await fetch(`${getApiUrl()}/api/admin/menu/adiciones/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(parseApiError(data, res.status));
  }
}
