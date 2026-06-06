import type { Comanda, Mesa } from "@/lib/micheladas-store";

export type MesaActivity = {
  activas: Comanda[];
  pendientes: number;
  listas: number;
  totalCuenta: number;
};

const ACTIVA_STATUS = new Set<Comanda["status"]>(["pendiente", "lista"]);

export function isComandaActiva(c: Comanda): boolean {
  return ACTIVA_STATUS.has(c.status);
}

export function getMesaActivity(mesaId: string, comandas: Comanda[]): MesaActivity {
  const activas = comandas.filter((c) => c.mesaId === mesaId && isComandaActiva(c));
  return {
    activas,
    pendientes: activas.filter((c) => c.status === "pendiente").length,
    listas: activas.filter((c) => c.status === "lista").length,
    totalCuenta: activas.reduce((s, c) => s + c.total, 0),
  };
}

export function getComandasListas(comandas: Comanda[]): Comanda[] {
  return comandas.filter((c) => c.status === "lista");
}

export function getAllActivas(comandas: Comanda[]): Comanda[] {
  return comandas.filter(isComandaActiva);
}

const MESAS_SIN_LIBERAR = new Set(["llevar"]);

/** Mesas ocupadas o con pedidos activos del mesero (para marcar como atendida). */
export function getMesasPorAtender(
  mesas: Mesa[],
  comandas: Comanda[],
  meseroId?: number,
): Mesa[] {
  const idsConPedidos = new Set<string>();
  for (const c of comandas) {
    if (!c.mesaId || MESAS_SIN_LIBERAR.has(c.mesaId)) continue;
    if (!isComandaActiva(c)) continue;
    if (meseroId != null && c.meseroId != null && c.meseroId !== meseroId) continue;
    idsConPedidos.add(c.mesaId);
  }

  return mesas.filter((m) => {
    if (MESAS_SIN_LIBERAR.has(m.id)) return false;
    if (m.estado === "ocupada" || m.estado === "reservada") return true;
    return idsConPedidos.has(m.id);
  });
}
