import { getApiUrl, getStoredSession, parseApiError } from "@/lib/auth";
import type { Comanda } from "@/lib/micheladas-store";
import { mapComanda } from "@/lib/pos-api";

export type MetodoPago = "efectivo" | "tarjeta" | "transferencia" | "mixto";

export const METODO_PAGO_LABEL: Record<MetodoPago, string> = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  transferencia: "Transferencia",
  mixto: "Mixto",
};

export type CajaResumen = {
  fecha: string;
  ventasPagadas: number;
  ventasPendientes: number;
  propinas: number;
  comandasPagadas: number;
  comandasPendientes: number;
  efectivoEsperado: number;
  tarjetaTotal: number;
  transferenciaTotal: number;
  porMetodo: { metodo: string; total: number; comandas: number }[];
  corteCerrado: boolean;
  corteId?: string;
  efectivoContado?: number;
  diferencia?: number;
};

export type CorteCaja = {
  id: string;
  fecha: string;
  totalVentas: number;
  totalPropinas: number;
  efectivoEsperado: number;
  tarjetaTotal: number;
  transferenciaTotal: number;
  efectivoContado: number;
  diferencia: number;
  comandasPagadas: number;
  comandasPendientes: number;
  notas?: string;
  cerradoEn: number;
  cerradoPorId: number;
  cerradoPorNombre?: string;
};

export type PagoInput = {
  metodoPago: MetodoPago;
  propina?: number;
  montoEfectivo?: number;
  montoTarjeta?: number;
  montoTransferencia?: number;
};

function authHeaders(): HeadersInit {
  const session = getStoredSession();
  if (!session) throw new Error("Sesión expirada");
  return {
    Authorization: `Bearer ${session.accessToken}`,
    "Content-Type": "application/json",
  };
}

function mapResumen(raw: Record<string, unknown>): CajaResumen {
  return {
    fecha: String(raw.fecha),
    ventasPagadas: Number(raw.ventasPagadas),
    ventasPendientes: Number(raw.ventasPendientes),
    propinas: Number(raw.propinas),
    comandasPagadas: Number(raw.comandasPagadas),
    comandasPendientes: Number(raw.comandasPendientes),
    efectivoEsperado: Number(raw.efectivoEsperado),
    tarjetaTotal: Number(raw.tarjetaTotal),
    transferenciaTotal: Number(raw.transferenciaTotal),
    porMetodo: ((raw.porMetodo as Record<string, unknown>[]) ?? []).map((m) => ({
      metodo: String(m.metodo),
      total: Number(m.total),
      comandas: Number(m.comandas),
    })),
    corteCerrado: Boolean(raw.corteCerrado),
    corteId: raw.corteId != null ? String(raw.corteId) : undefined,
    efectivoContado: raw.efectivoContado != null ? Number(raw.efectivoContado) : undefined,
    diferencia: raw.diferencia != null ? Number(raw.diferencia) : undefined,
  };
}

function mapCorte(raw: Record<string, unknown>): CorteCaja {
  return {
    id: String(raw.id),
    fecha: String(raw.fecha),
    totalVentas: Number(raw.totalVentas),
    totalPropinas: Number(raw.totalPropinas),
    efectivoEsperado: Number(raw.efectivoEsperado),
    tarjetaTotal: Number(raw.tarjetaTotal),
    transferenciaTotal: Number(raw.transferenciaTotal),
    efectivoContado: Number(raw.efectivoContado),
    diferencia: Number(raw.diferencia),
    comandasPagadas: Number(raw.comandasPagadas),
    comandasPendientes: Number(raw.comandasPendientes),
    notas: raw.notas != null ? String(raw.notas) : undefined,
    cerradoEn: Number(raw.cerradoEn),
    cerradoPorId: Number(raw.cerradoPorId),
    cerradoPorNombre: raw.cerradoPorNombre != null ? String(raw.cerradoPorNombre) : undefined,
  };
}

export async function fetchCajaResumen(fecha?: string): Promise<CajaResumen> {
  const q = fecha ? `?fecha=${encodeURIComponent(fecha)}` : "";
  const res = await fetch(`${getApiUrl()}/api/caja/resumen${q}`, { headers: authHeaders() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return mapResumen(data as Record<string, unknown>);
}

export async function fetchCajaComandas(opts?: {
  fecha?: string;
  pagado?: boolean;
}): Promise<Comanda[]> {
  const params = new URLSearchParams();
  if (opts?.fecha) params.set("fecha", opts.fecha);
  if (opts?.pagado != null) params.set("pagado", String(opts.pagado));
  const q = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${getApiUrl()}/api/caja/comandas${q}`, { headers: authHeaders() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return (data as Record<string, unknown>[]).map(mapComanda);
}

export async function registrarPagoApi(comandaId: string, input: PagoInput): Promise<Comanda> {
  const res = await fetch(`${getApiUrl()}/api/caja/pagos/${comandaId}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return mapComanda(data as Record<string, unknown>);
}

export async function anularPagoApi(comandaId: string): Promise<Comanda> {
  const res = await fetch(`${getApiUrl()}/api/caja/pagos/${comandaId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return mapComanda(data as Record<string, unknown>);
}

export async function crearCorteApi(input: {
  fecha?: string;
  efectivoContado: number;
  notas?: string;
}): Promise<CorteCaja> {
  const res = await fetch(`${getApiUrl()}/api/caja/corte`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return mapCorte(data as Record<string, unknown>);
}

export async function fetchCortes(limit = 30): Promise<CorteCaja[]> {
  const res = await fetch(`${getApiUrl()}/api/caja/cortes?limit=${limit}`, { headers: authHeaders() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return (data as Record<string, unknown>[]).map(mapCorte);
}
