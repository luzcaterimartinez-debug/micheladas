import { getApiUrl, getStoredSession, parseApiError } from "@/lib/auth";
import { markApiFailureFromStatus } from "@/lib/offline/network";
import type { Comanda, Mesa, OrderItem } from "@/lib/micheladas-store";

function assertOk(res: Response, data: unknown): asserts res is Response & { ok: true } {
  if (!res.ok) {
    markApiFailureFromStatus(res.status);
    throw new Error(parseApiError(data, res.status));
  }
}

function authHeaders(): HeadersInit {
  const session = getStoredSession();
  if (!session) throw new Error("Sesión expirada");
  return {
    Authorization: `Bearer ${session.accessToken}`,
    "Content-Type": "application/json",
  };
}

function mapMesa(raw: Record<string, unknown>): Mesa {
  return {
    id: String(raw.id),
    nombre: String(raw.nombre),
    capacidad: Number(raw.capacidad),
    estado: raw.estado as Mesa["estado"],
    cliente: raw.cliente != null ? String(raw.cliente) : undefined,
  };
}

function mapOrderItem(raw: Record<string, unknown>): OrderItem {
  return {
    id: String(raw.id),
    micheladaId: String(raw.micheladaId),
    micheladaName: String(raw.micheladaName),
    size: raw.size != null && raw.size !== "" ? String(raw.size) : undefined,
    basePrice: Number(raw.basePrice),
    quantity: raw.quantity != null ? Number(raw.quantity) : 1,
    selectedToppings: (raw.selectedToppings as string[]) ?? [],
    additions: (raw.additions as OrderItem["additions"]) ?? [],
    notes: raw.notes != null ? String(raw.notes) : undefined,
    total: Number(raw.total),
  };
}

export function mapComanda(raw: Record<string, unknown>): Comanda {
  const items = ((raw.items as Record<string, unknown>[]) ?? []).map(mapOrderItem);
  return {
    id: String(raw.id),
    folio: Number(raw.folio),
    queueOrder: Number(raw.queueOrder ?? raw.orden_cola ?? 1),
    cliente: String(raw.cliente),
    mesa: raw.mesa != null ? String(raw.mesa) : undefined,
    mesaId: raw.mesaId != null ? String(raw.mesaId) : undefined,
    meseroId: raw.meseroId != null ? Number(raw.meseroId) : undefined,
    items,
    total: Number(raw.total),
    createdAt: Number(raw.createdAt),
    status: raw.status as Comanda["status"],
    pagado: Boolean(raw.pagado),
    metodoPago: raw.metodoPago != null ? (raw.metodoPago as Comanda["metodoPago"]) : undefined,
    montoPagado: raw.montoPagado != null ? Number(raw.montoPagado) : undefined,
    propina: Number(raw.propina ?? 0),
    pagoEfectivo: raw.pagoEfectivo != null ? Number(raw.pagoEfectivo) : undefined,
    pagoTarjeta: raw.pagoTarjeta != null ? Number(raw.pagoTarjeta) : undefined,
    pagoTransferencia: raw.pagoTransferencia != null ? Number(raw.pagoTransferencia) : undefined,
    pagadoEn: raw.pagadoEn != null ? Number(raw.pagadoEn) : undefined,
    cobradoPorId: raw.cobradoPorId != null ? Number(raw.cobradoPorId) : undefined,
  };
}

export async function fetchMesas(): Promise<Mesa[]> {
  const res = await fetch(`${getApiUrl()}/api/mesas`, { headers: authHeaders() });
  const data = await res.json().catch(() => ({}));
  assertOk(res, data);
  return (data as Record<string, unknown>[]).map(mapMesa);
}

export async function marcarMesaAtendidaApi(mesaId: string): Promise<Mesa> {
  const res = await fetch(`${getApiUrl()}/api/mesas/${mesaId}/atendida`, {
    method: "POST",
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  assertOk(res, data);
  return mapMesa(data as Record<string, unknown>);
}

export async function patchMesaApi(id: string, patch: Partial<Mesa>): Promise<Mesa> {
  const body: Record<string, unknown> = {};
  if (patch.estado != null) body.estado = patch.estado;
  if (patch.cliente !== undefined) body.cliente = patch.cliente;
  if (patch.nombre != null) body.nombre = patch.nombre;
  if (patch.capacidad != null) body.capacidad = patch.capacidad;

  const res = await fetch(`${getApiUrl()}/api/mesas/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  assertOk(res, data);
  return mapMesa(data as Record<string, unknown>);
}

export async function createMesaApi(nombre: string, capacidad: number): Promise<Mesa> {
  const res = await fetch(`${getApiUrl()}/api/mesas`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ nombre, capacidad }),
  });
  const data = await res.json().catch(() => ({}));
  assertOk(res, data);
  return mapMesa(data as Record<string, unknown>);
}

export async function deleteMesaApi(id: string): Promise<void> {
  const res = await fetch(`${getApiUrl()}/api/mesas/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    markApiFailureFromStatus(res.status);
    throw new Error(parseApiError(data, res.status));
  }
}

export async function fetchComandas(opts?: {
  status?: string;
  mesaId?: string;
}): Promise<Comanda[]> {
  const params = new URLSearchParams();
  if (opts?.status) params.set("status", opts.status);
  if (opts?.mesaId) params.set("mesa_id", opts.mesaId);
  const q = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${getApiUrl()}/api/comandas${q}`, { headers: authHeaders() });
  const data = await res.json().catch(() => ({}));
  assertOk(res, data);
  return (data as Record<string, unknown>[]).map(mapComanda);
}

export async function createComandaApi(
  input: Omit<Comanda, "id" | "folio" | "queueOrder" | "createdAt" | "status">,
  clientId?: string,
): Promise<Comanda> {
  const res = await fetch(`${getApiUrl()}/api/comandas`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      id: clientId,
      cliente: input.cliente,
      mesaId: input.mesaId,
      mesa: input.mesa,
      items: input.items,
      total: input.total,
    }),
  });
  const data = await res.json().catch(() => ({}));
  assertOk(res, data);
  return mapComanda(data as Record<string, unknown>);
}

export async function patchComandaApi(
  id: string,
  patch: { status?: Comanda["status"]; mesa?: string; mesaId?: string; cliente?: string },
): Promise<Comanda> {
  const res = await fetch(`${getApiUrl()}/api/comandas/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(patch),
  });
  const data = await res.json().catch(() => ({}));
  assertOk(res, data);
  return mapComanda(data as Record<string, unknown>);
}

export async function deleteComandaApi(id: string): Promise<void> {
  const res = await fetch(`${getApiUrl()}/api/comandas/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    markApiFailureFromStatus(res.status);
    throw new Error(parseApiError(data, res.status));
  }
}
