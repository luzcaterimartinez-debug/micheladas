import type { Comanda, InventoryItem, Mesa } from "@/lib/micheladas-store";
import type { MenuData } from "@/lib/menu-utils";

import { LS_MENU, readLocal, writeLocal } from "./network";

export const LS_COMANDAS = "michelada_comandas_v1";
export const LS_INVENTORY = "michelada_inventory_v1";
export const LS_FOLIO = "michelada_folio_v1";
export const LS_MESAS = "michelada_mesas_v1";

const MESAS_VIRTUALES = new Set(["llevar", "barra"]);

/** Barra / llevar nunca guardan ocupación de asiento. */
function normalizeMesasVirtuales(mesas: Mesa[]): Mesa[] {
  return mesas.map((m) =>
    MESAS_VIRTUALES.has(m.id) ? { ...m, estado: "libre" as const, cliente: undefined } : m,
  );
}

export function getCachedComandas(): Comanda[] {
  return readLocal<Comanda[]>(LS_COMANDAS, []);
}

export function setCachedComandas(comandas: Comanda[]): void {
  writeLocal(LS_COMANDAS, comandas);
}

export function getCachedMesas(fallback: Mesa[]): Mesa[] {
  return normalizeMesasVirtuales(readLocal<Mesa[]>(LS_MESAS, fallback));
}

export function setCachedMesas(mesas: Mesa[]): void {
  writeLocal(LS_MESAS, normalizeMesasVirtuales(mesas));
}

export function getCachedInventario(fallback: InventoryItem[]): InventoryItem[] {
  return readLocal<InventoryItem[]>(LS_INVENTORY, fallback);
}

export function setCachedInventario(items: InventoryItem[]): void {
  writeLocal(LS_INVENTORY, items);
}

export function getCachedMenu(fallback: MenuData): MenuData {
  return readLocal<MenuData>(LS_MENU, fallback);
}

export function setCachedMenu(menu: MenuData): void {
  writeLocal(LS_MENU, menu);
}

export function nextLocalFolio(): number {
  const folio = readLocal<number>(LS_FOLIO, 1000) + 1;
  writeLocal(LS_FOLIO, folio);
  return folio;
}
