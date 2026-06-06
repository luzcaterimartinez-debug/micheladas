import { getApiUrl, getStoredSession, parseApiError } from "@/lib/auth";

export type PeriodoReporte = "dia" | "mes" | "anio";

export type ReporteData = {
  periodo: PeriodoReporte;
  label: string;
  desde: string;
  hasta: string;
  totalVentas: number;
  numComandas: number;
  numItems: number;
  ticketPromedio: number;
  porEstado: { status: string; count: number; total: number }[];
  topProductos: {
    productoId: string;
    productoNombre: string;
    cantidad: number;
    total: number;
  }[];
  porMesa: { mesa: string; count: number; total: number }[];
  porMesero: {
    meseroId: number | null;
    meseroNombre: string;
    count: number;
    total: number;
  }[];
  serie: { label: string; count: number; total: number }[];
};

export type ReporteParams = {
  periodo: PeriodoReporte;
  fecha?: string;
  anio?: number;
  mes?: number;
};

function mapReporte(raw: Record<string, unknown>): ReporteData {
  return {
    periodo: raw.periodo as PeriodoReporte,
    label: String(raw.label),
    desde: String(raw.desde),
    hasta: String(raw.hasta),
    totalVentas: Number(raw.totalVentas),
    numComandas: Number(raw.numComandas),
    numItems: Number(raw.numItems),
    ticketPromedio: Number(raw.ticketPromedio),
    porEstado: ((raw.porEstado as Record<string, unknown>[]) ?? []).map((r) => ({
      status: String(r.status),
      count: Number(r.count),
      total: Number(r.total),
    })),
    topProductos: ((raw.topProductos as Record<string, unknown>[]) ?? []).map((r) => ({
      productoId: String(r.productoId),
      productoNombre: String(r.productoNombre),
      cantidad: Number(r.cantidad),
      total: Number(r.total),
    })),
    porMesa: ((raw.porMesa as Record<string, unknown>[]) ?? []).map((r) => ({
      mesa: String(r.mesa),
      count: Number(r.count),
      total: Number(r.total),
    })),
    porMesero: ((raw.porMesero as Record<string, unknown>[]) ?? []).map((r) => ({
      meseroId: r.meseroId != null ? Number(r.meseroId) : null,
      meseroNombre: String(r.meseroNombre),
      count: Number(r.count),
      total: Number(r.total),
    })),
    serie: ((raw.serie as Record<string, unknown>[]) ?? []).map((r) => ({
      label: String(r.label),
      count: Number(r.count),
      total: Number(r.total),
    })),
  };
}

export async function fetchReporte(params: ReporteParams): Promise<ReporteData> {
  const session = getStoredSession();
  if (!session?.accessToken) {
    throw new Error("Sesión requerida");
  }
  const q = new URLSearchParams({ periodo: params.periodo });
  if (params.fecha) q.set("fecha", params.fecha);
  if (params.anio != null) q.set("anio", String(params.anio));
  if (params.mes != null) q.set("mes", String(params.mes));

  const res = await fetch(`${getApiUrl()}/api/reportes?${q}`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(parseApiError(data, res.status));
  }
  return mapReporte(data as Record<string, unknown>);
}
