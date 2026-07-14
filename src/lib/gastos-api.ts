import { getApiUrl, getStoredSession, parseApiError } from "@/lib/auth";

export type CategoriaGasto =
  | "insumos"
  | "servicios"
  | "renta"
  | "mantenimiento"
  | "nomina_extra"
  | "transporte"
  | "otros";

export const CATEGORIA_GASTO_LABEL: Record<CategoriaGasto, string> = {
  insumos: "Insumos",
  servicios: "Servicios",
  renta: "Renta",
  mantenimiento: "Mantenimiento",
  nomina_extra: "Nómina extra",
  transporte: "Transporte",
  otros: "Otros",
};

export const CATEGORIAS_GASTO = Object.keys(CATEGORIA_GASTO_LABEL) as CategoriaGasto[];

export type Gasto = {
  id: string;
  concepto: string;
  monto: number;
  categoria: CategoriaGasto;
  fecha: string;
  notas?: string;
  creadoPorId: number;
  creadoPorNombre?: string;
  creadoEn: number;
};

export type GastosResumen = {
  desde: string;
  hasta: string;
  total: number;
  cantidad: number;
  porCategoria: { categoria: CategoriaGasto; total: number; cantidad: number }[];
};

export type GastoInput = {
  concepto: string;
  monto: number;
  categoria: CategoriaGasto;
  fecha: string;
  notas?: string;
};

async function gastosFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const session = getStoredSession();
  if (!session?.accessToken) throw new Error("Sesión requerida");

  const res = await fetch(`${getApiUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
      ...init?.headers,
    },
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return data as T;
}

function mapGasto(raw: Record<string, unknown>): Gasto {
  return {
    id: String(raw.id),
    concepto: String(raw.concepto),
    monto: Number(raw.monto),
    categoria: raw.categoria as CategoriaGasto,
    fecha: String(raw.fecha),
    notas: raw.notas != null ? String(raw.notas) : undefined,
    creadoPorId: Number(raw.creadoPorId),
    creadoPorNombre: raw.creadoPorNombre != null ? String(raw.creadoPorNombre) : undefined,
    creadoEn: Number(raw.creadoEn),
  };
}

function mapResumen(raw: Record<string, unknown>): GastosResumen {
  return {
    desde: String(raw.desde),
    hasta: String(raw.hasta),
    total: Number(raw.total),
    cantidad: Number(raw.cantidad),
    porCategoria: ((raw.porCategoria as Record<string, unknown>[]) ?? []).map((c) => ({
      categoria: c.categoria as CategoriaGasto,
      total: Number(c.total),
      cantidad: Number(c.cantidad),
    })),
  };
}

export function fetchGastos(params?: {
  fecha?: string;
  desde?: string;
  hasta?: string;
  categoria?: CategoriaGasto;
}): Promise<Gasto[]> {
  const q = new URLSearchParams();
  if (params?.fecha) q.set("fecha", params.fecha);
  if (params?.desde) q.set("desde", params.desde);
  if (params?.hasta) q.set("hasta", params.hasta);
  if (params?.categoria) q.set("categoria", params.categoria);
  const qs = q.toString();
  return gastosFetch<Record<string, unknown>[]>(`/api/gastos${qs ? `?${qs}` : ""}`).then((rows) =>
    rows.map(mapGasto),
  );
}

export function fetchGastosResumen(params?: {
  fecha?: string;
  desde?: string;
  hasta?: string;
}): Promise<GastosResumen> {
  const q = new URLSearchParams();
  if (params?.fecha) q.set("fecha", params.fecha);
  if (params?.desde) q.set("desde", params.desde);
  if (params?.hasta) q.set("hasta", params.hasta);
  const qs = q.toString();
  return gastosFetch<Record<string, unknown>>(`/api/gastos/resumen${qs ? `?${qs}` : ""}`).then(
    mapResumen,
  );
}

export function createGastoApi(body: GastoInput): Promise<Gasto> {
  return gastosFetch<Record<string, unknown>>("/api/gastos", {
    method: "POST",
    body: JSON.stringify(body),
  }).then(mapGasto);
}

export function updateGastoApi(id: string, body: Partial<GastoInput>): Promise<Gasto> {
  return gastosFetch<Record<string, unknown>>(`/api/gastos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  }).then(mapGasto);
}

export function deleteGastoApi(id: string): Promise<void> {
  return gastosFetch<void>(`/api/gastos/${id}`, { method: "DELETE" });
}
