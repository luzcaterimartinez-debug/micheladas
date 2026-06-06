import type { Rol } from "@/lib/auth";

export type PosTab = "pedido" | "mesas" | "comandas" | "inventario";

const TAB_ACCESS: Record<PosTab, Rol[]> = {
  pedido: ["mesero"],
  mesas: [],
  comandas: [],
  inventario: [],
};

export function tabsForRole(rol: Rol): PosTab[] {
  return (Object.keys(TAB_ACCESS) as PosTab[]).filter((tab) => TAB_ACCESS[tab].includes(rol));
}

export function defaultTabForRole(rol: Rol): PosTab {
  const tabs = tabsForRole(rol);
  return tabs[0] ?? "pedido";
}
