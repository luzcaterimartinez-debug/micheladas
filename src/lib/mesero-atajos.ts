/** Atajos de pedido frecuente para el mesero (un toque → carrito). */

export type PedidoAtajo = {
  id: string;
  label: string;
  /** Id de producto en menú (ej. tradicional_cerveza). */
  productId: string;
  /** Opción de fase cerveza si aplica. */
  cervezaOpcionId?: string;
  quantity?: number;
};

export const PEDIDOS_ATAJO: PedidoAtajo[] = [
  {
    id: "trad_aguila_x2",
    label: "Tradicional · Cerveza Águila ×2",
    productId: "tradicional_cerveza",
    cervezaOpcionId: "tipo_aguila",
    quantity: 2,
  },
  {
    id: "trad_poker",
    label: "Tradicional · Poker",
    productId: "tradicional_cerveza",
    cervezaOpcionId: "tipo_poker",
    quantity: 1,
  },
  {
    id: "trad_soda",
    label: "Tradicional · Soda",
    productId: "tradicional_soda",
    quantity: 1,
  },
  {
    id: "trad_ginger",
    label: "Tradicional · Ginger",
    productId: "tradicional_ginger",
    quantity: 1,
  },
];
