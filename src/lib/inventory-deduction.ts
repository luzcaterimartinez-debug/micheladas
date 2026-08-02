import type { ConsumoLine, FaseOpcion } from "@/lib/fases";
import type { Addition, MicheladaType, OrderItem } from "@/lib/micheladas-store";

function add(totals: Record<string, number>, key: string, qty: number) {
  if (!key || qty <= 0) return;
  totals[key] = (totals[key] ?? 0) + qty;
}

const MICHELADA_BASES = ["ginger", "soda", "cerveza", "cola_pola", "smirnoff"] as const;

const BEBIDAS_CONSUMO: Record<string, ConsumoLine[]> = {
  coronita: [{ clave: "coronita", cantidad: 1 }],
  corona: [{ clave: "corona", cantidad: 1 }],
  cerveza_latona: [{ clave: "cerveza_latona", cantidad: 1 }],
  cerveza_personal: [{ clave: "cerveza_personal", cantidad: 1 }],
  poker: [{ clave: "poker", cantidad: 1 }],
  aguila: [{ clave: "aguila", cantidad: 1 }],
  cerveza_light: [{ clave: "cerveza_light", cantidad: 1 }],
  budweiser: [{ clave: "budweiser", cantidad: 1 }],
  la_soda: [{ clave: "soda", cantidad: 1 }],
  ginger_personal: [{ clave: "ginger", cantidad: 1 }],
  ginger_litro_medio: [{ clave: "ginger_litro_medio", cantidad: 1 }],
};

function bebidaBaseFromProductoId(productoId: string): string | null {
  for (const base of MICHELADA_BASES) {
    if (productoId.endsWith(`_${base}`)) return base;
  }
  return null;
}

function defaultProductConsumo(productoId: string): ConsumoLine[] {
  if (BEBIDAS_CONSUMO[productoId]) return BEBIDAS_CONSUMO[productoId];
  const bebida = bebidaBaseFromProductoId(productoId);
  if (bebida === "cerveza") {
    // Marca vía fase "Tipo de cerveza"
    return [{ clave: "limon", cantidad: 2 }];
  }
  if (bebida) {
    return [
      { clave: bebida, cantidad: 1 },
      { clave: "limon", cantidad: 2 },
    ];
  }
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
    const itemQty = Math.max(1, it.quantity ?? 1);
    const producto = productos.find((p) => p.id === it.micheladaId);
    const productOpciones = producto?.faseOpciones ?? [];
    const allOpciones = [...faseCatalog, ...productOpciones];

    for (const line of consumoForProduct(producto, it.micheladaId)) {
      add(totals, line.clave, line.cantidad * itemQty);
    }

    for (const opcionId of it.selectedToppings) {
      const d = opcionDeduction(opcionId, allOpciones);
      if (d) add(totals, d.key, d.qty * itemQty);
    }

    for (const a of it.additions) {
      const def = adicionesCatalog.find((d) => d.id === a.id);
      const key = def?.stockKey ?? a.id;
      const unitQty = def?.cantidad ?? 1;
      const addUnits = Math.max(1, a.quantity ?? 1);
      add(totals, key, unitQty * addUnits * itemQty);
    }
  }

  return totals;
}
