import { getApiUrl, getStoredSession, parseApiError } from "@/lib/auth";
import type { Comanda, Mesa, OrderItem } from "@/lib/micheladas-store";

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
    selectedToppings: (raw.selectedToppings as string[]) ?? [],
    additions: (raw.additions as OrderItem["additions"]) ?? [],
    notes: raw.notes != null ? String(raw.notes) : undefined,
    total: Number(raw.total),
  };
}

function mapComanda(raw: Record<string, unknown>): Comanda {
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
  };
}

export async function fetchMesas(): Promise<Mesa[]> {
  const res = await fetch(`${getApiUrl()}/api/mesas`, { headers: authHeaders() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return (data as Record<string, unknown>[]).map(mapMesa);
}

export async function marcarMesaAtendidaApi(mesaId: string): Promise<Mesa> {
  const res = await fetch(`${getApiUrl()}/api/mesas/${mesaId}/atendida`, {
    method: "POST",
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
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
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return mapMesa(data as Record<string, unknown>);
}

export async function createMesaApi(nombre: string, capacidad: number): Promise<Mesa> {
  const res = await fetch(`${getApiUrl()}/api/mesas`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ nombre, capacidad }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return mapMesa(data as Record<string, unknown>);
}

export async function deleteMesaApi(id: string): Promise<void> {
  const res = await fetch(`${getApiUrl()}/api/mesas/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
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
  if (!res.ok) throw new Error(parseApiError(data, res.status));
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
  if (!res.ok) throw new Error(parseApiError(data, res.status));
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
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return mapComanda(data as Record<string, unknown>);
}

export async function deleteComandaApi(id: string): Promise<void> {
  const res = await fetch(`${getApiUrl()}/api/comandas/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(parseApiError(data, res.status));
  }
}
