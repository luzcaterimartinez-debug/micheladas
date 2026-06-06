import { getApiUrl, getStoredSession, parseApiError } from "@/lib/auth";

export type TipoPago = "diario" | "semanal" | "quincenal" | "mensual";
export type EstadoRecibo = "borrador" | "pagado";

export type NominaConfig = {
  usuarioId: number;
  salarioBase: number;
  tipoPago: TipoPago;
  tarifaHoraExtra?: number;
  puesto?: string;
  activo: boolean;
};

export type NominaPrestamo = {
  id: string;
  usuarioId: number;
  concepto: string;
  montoTotal: number;
  saldoPendiente: number;
  cuotaPeriodo: number;
  activo: boolean;
};

export type NominaRecibo = {
  id: string;
  usuarioId: number;
  anio: number;
  mes: number;
  quincena: number | null;
  diasTrabajados: number;
  horasExtra: number;
  bonos: number;
  deducciones: number;
  descuentoPrestamos: number;
  sueldoBruto: number;
  total: number;
  notas?: string;
  estado: EstadoRecibo;
};

export type NominaEmpleado = {
  usuarioId: number;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  config: NominaConfig | null;
  recibo: NominaRecibo | null;
  prestamos: NominaPrestamo[];
  descuentoPrestamosSugerido: number;
};

export type NominaPeriodo = {
  anio: number;
  mes: number;
  quincena: number | null;
  label: string;
  empleados: NominaEmpleado[];
  resumen: {
    totalBruto: number;
    totalNeto: number;
    totalPagado: number;
    totalPrestamos: number;
    empleadosConRecibo: number;
    empleadosPagados: number;
    prestamosActivos: number;
  };
};

async function nominaFetch<T>(path: string, init?: RequestInit): Promise<T> {
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
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return data as T;
}

export function fetchNominaPeriodo(params: {
  anio: number;
  mes: number;
  quincena?: number | null;
}): Promise<NominaPeriodo> {
  const q = new URLSearchParams({
    anio: String(params.anio),
    mes: String(params.mes),
  });
  if (params.quincena != null && params.quincena > 0) {
    q.set("quincena", String(params.quincena));
  }
  return nominaFetch(`/api/admin/nomina?${q}`);
}

export function upsertNominaConfig(
  usuarioId: number,
  body: {
    salarioBase: number;
    tipoPago: TipoPago;
    tarifaHoraExtra?: number;
    puesto?: string;
    activo?: boolean;
  },
): Promise<NominaConfig> {
  return nominaFetch(`/api/admin/nomina/config/${usuarioId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function createNominaPrestamo(body: {
  usuarioId: number;
  concepto: string;
  montoTotal: number;
  cuotaPeriodo: number;
  activo?: boolean;
}): Promise<NominaPrestamo> {
  return nominaFetch("/api/admin/nomina/prestamos", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateNominaPrestamo(
  prestamoId: string,
  body: Partial<{
    concepto: string;
    cuotaPeriodo: number;
    saldoPendiente: number;
    activo: boolean;
  }>,
): Promise<NominaPrestamo> {
  return nominaFetch(`/api/admin/nomina/prestamos/${prestamoId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteNominaPrestamo(prestamoId: string): Promise<void> {
  return nominaFetch(`/api/admin/nomina/prestamos/${prestamoId}`, { method: "DELETE" });
}

export function createNominaRecibo(body: {
  usuarioId: number;
  anio: number;
  mes: number;
  quincena?: number | null;
  diasTrabajados: number;
  horasExtra: number;
  bonos: number;
  deducciones: number;
  descuentoPrestamos?: number;
  aplicarPrestamosAuto?: boolean;
  notas?: string;
  estado?: EstadoRecibo;
}): Promise<NominaRecibo> {
  return nominaFetch("/api/admin/nomina/recibos", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateNominaRecibo(
  reciboId: string,
  body: Partial<{
    diasTrabajados: number;
    horasExtra: number;
    bonos: number;
    deducciones: number;
    descuentoPrestamos: number;
    aplicarPrestamosAuto: boolean;
    notas: string;
    estado: EstadoRecibo;
  }>,
): Promise<NominaRecibo> {
  return nominaFetch(`/api/admin/nomina/recibos/${reciboId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteNominaRecibo(reciboId: string): Promise<void> {
  return nominaFetch(`/api/admin/nomina/recibos/${reciboId}`, { method: "DELETE" });
}

export const TIPO_PAGO_LABEL: Record<TipoPago, string> = {
  diario: "Por día",
  semanal: "Semanal",
  quincenal: "Quincenal",
  mensual: "Mensual",
};

export const DIAS_REF_TIPO: Record<TipoPago, number> = {
  diario: 1,
  semanal: 7,
  quincenal: 15,
  mensual: 30,
};
