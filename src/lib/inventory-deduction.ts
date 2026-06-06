import type { ConsumoLine, FaseOpcion } from "@/lib/fases";
import type { Addition, MicheladaType, OrderItem } from "@/lib/micheladas-store";

function add(totals: Record<string, number>, key: string, qty: number) {
  if (!key || qty <= 0) return;
  totals[key] = (totals[key] ?? 0) + qty;
}

function defaultProductConsumo(productoId: string): ConsumoLine[] {
  const lines: ConsumoLine[] = [
    { clave: "cerveza", cantidad: 1 },
    { clave: "limon", cantidad: 2 },
  ];
  if (productoId.startsWith("cubana")) {
    lines.push({ clave: "clamato", cantidad: 0.2 });
  }
  return lines;
}

function consumoForProduct(
  producto: MicheladaType | undefined,
  productoId: string,
): ConsumoLine[] {
  if (producto?.consumo?.length) return producto.consumo;
  return defaultProductConsumo(productoId);
}

function opcionDeduction(
  opcionId: string,
  catalog: FaseOpcion[],
): { key: string; qty: number } | null {
  const op = catalog.find((o) => o.id === opcionId);
  if (op?.stockKey) return { key: op.stockKey, qty: op.cantidad ?? 1 };
  if (catalog.some((o) => o.id === opcionId)) return null;
  return { key: opcionId, qty: 1 };
}

/** Descuenta inventario en modo offline (localStorage) o vista previa. */
export function buildOrderDeductions(
  cart: OrderItem[],
  adicionesCatalog: Addition[],
  productos: MicheladaType[],
  faseCatalog: FaseOpcion[],
): Record<string, number> {
  const totals: Record<string, number> = {};

  for (const it of cart) {
    const producto = productos.find((p) => p.id === it.micheladaId);
    const productOpciones = producto?.faseOpciones ?? [];
    const allOpciones = [...faseCatalog, ...productOpciones];

    for (const line of consumoForProduct(producto, it.micheladaId)) {
      add(totals, line.clave, line.cantidad);
    }

    for (const opcionId of it.selectedToppings) {
      const d = opcionDeduction(opcionId, allOpciones);
      if (d) add(totals, d.key, d.qty);
    }

    for (const a of it.additions) {
      const def = adicionesCatalog.find((d) => d.id === a.id);
      const key = def?.stockKey ?? a.id;
      const qty = def?.cantidad ?? 1;
      add(totals, key, qty);
    }
  }

  return totals;
}
