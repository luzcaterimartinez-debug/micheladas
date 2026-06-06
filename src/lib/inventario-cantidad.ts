import type { InventoryItem } from "@/lib/micheladas-store";

export function findInventarioItem(
  items: InventoryItem[],
  key: string | undefined,
): InventoryItem | undefined {
  if (!key) return undefined;
  return items.find((i) => i.key === key);
}

/** Etiqueta legible: "50 g", "0.05 L", "1 pz". */
export function formatCantidadInventario(cantidad: number, unit: string): string {
  const n = Number(cantidad);
  const shown = Number.isInteger(n) ? String(n) : String(n);
  return unit ? `${shown} ${unit}` : shown;
}

export function inventarioSelectLabel(item: InventoryItem): string {
  return `${item.name} — ${item.stock} ${item.unit}`;
}

export function parseCantidadInventario(
  stockKey: string | undefined,
  value: string,
): { ok: true; cantidad: number } | { ok: false; message: string } {
  if (!stockKey?.trim()) {
    return { ok: true, cantidad: 1 };
  }
  const n = Number(value.trim());
  if (!Number.isFinite(n) || n <= 0) {
    return {
      ok: false,
      message: "Escribe cuánto lleva en la unidad del inventario (ej. 50 g, 0.05 L, 1 pz).",
    };
  }
  return { ok: true, cantidad: n };
}

const UNIT_PLACEHOLDER: Record<string, string> = {
  g: "50",
  L: "0.05",
  pz: "1",
};

export function cantidadPlaceholder(unit: string | undefined): string {
  if (!unit) return "1";
  return UNIT_PLACEHOLDER[unit] ?? "1";
}
