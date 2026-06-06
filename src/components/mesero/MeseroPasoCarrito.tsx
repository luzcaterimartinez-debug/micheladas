import { MapPin, ShoppingCart, Trash2, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MeseroStepHeader, ThemedPanel, ThemedPanelHeader } from "@/components/michelandia/michelandia-ui";
import { formatMenuPrice } from "@/lib/michelandia-theme";
import { faseOpcionNames, orderItemSubtitle } from "@/lib/comanda-display";
import type { Mesa, MicheladaType, OrderItem } from "@/lib/micheladas-store";
import { cn } from "@/lib/utils";

const TOUCH = "touch-manipulation active:scale-[0.98] transition-all duration-150";

type Props = {
  cart: OrderItem[];
  cartTotal: number;
  productos: MicheladaType[];
  mesa?: Mesa;
  cliente?: string;
  onRemoveItem: (id: string) => void;
};

function CartItemRow({
  item,
  productos,
  onRemove,
}: {
  item: OrderItem;
  productos: MicheladaType[];
  onRemove: () => void;
}) {
  const tops = faseOpcionNames(item.micheladaId, item.selectedToppings, productos);
  const subtitle = orderItemSubtitle(item);
  const extras: string[] = [
    ...tops,
    ...item.additions.map((a) => (a.price > 0 ? `${a.name} +${formatMenuPrice(a.price)}` : a.name)),
  ];

  return (
    <div className="flex gap-3 px-4 py-3.5 first:pt-4 last:pb-4">
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-3 items-baseline">
          <div className="min-w-0">
            <p className="font-bold text-[15px] leading-snug tracking-tight truncate text-slate-900">
              {item.micheladaName}
            </p>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          <span className="text-[15px] font-extrabold tabular-nums shrink-0 text-slate-900">
            {formatMenuPrice(item.total)}
          </span>
        </div>
        {extras.length > 0 && (
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
            {extras.join(" · ")}
          </p>
        )}
        {item.notes && (
          <p className="text-xs text-slate-700 mt-1.5 pl-2 border-l-2 border-amber-400 leading-relaxed line-clamp-2">
            {item.notes}
          </p>
        )}
      </div>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className={cn(TOUCH, "h-10 w-10 shrink-0 text-slate-500 hover:text-red-600")}
        onClick={onRemove}
        aria-label={`Quitar ${item.micheladaName}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function MeseroPasoCarrito({
  cart,
  cartTotal,
  productos,
  mesa,
  cliente,
  onRemoveItem,
}: Props) {
  const clienteLabel = cliente?.trim();
  const count = cart.length;

  return (
    <div className="space-y-4">
      <MeseroStepHeader
        stepLabel="Paso final"
        title="Tu pedido"
        description="Revisa los ítems y envía la comanda a barra cuando esté listo."
      />

      {(mesa || clienteLabel) && (
        <div className="flex flex-wrap gap-2 text-xs">
          {mesa && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 border border-white px-3 py-1.5 text-slate-700 shadow-sm">
              <MapPin className="h-3 w-3 shrink-0 text-slate-500" />
              <span className="font-semibold">{mesa.nombre}</span>
            </span>
          )}
          {clienteLabel && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 border border-white px-3 py-1.5 text-slate-700 shadow-sm">
              <User className="h-3 w-3 shrink-0 text-slate-500" />
              <span className="font-semibold truncate max-w-[10rem]">{clienteLabel}</span>
            </span>
          )}
        </div>
      )}

      {count === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-white/50 bg-white/20 px-4 py-14 text-center space-y-2">
          <ShoppingCart className="h-8 w-8 mx-auto text-white/70" />
          <p className="text-sm font-bold text-white">El pedido está vacío</p>
          <p className="text-xs text-white/85 max-w-[16rem] mx-auto leading-relaxed">
            Agrega bebidas con el botón de abajo o vuelve atrás para armar un ítem.
          </p>
        </div>
      ) : (
        <ThemedPanel themeId="adiciones">
          <ThemedPanelHeader themeId="adiciones" title="Resumen" subtitle={`${count} ítem${count === 1 ? "" : "s"}`} />
          <div className="divide-y divide-slate-100">
            {cart.map((it) => (
              <CartItemRow
                key={it.id}
                item={it}
                productos={productos}
                onRemove={() => onRemoveItem(it.id)}
              />
            ))}
            <div className="bg-amber-50 px-4 py-3.5 flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-slate-600">Total pedido</span>
              <span className="text-2xl font-black tabular-nums text-slate-900">
                {formatMenuPrice(cartTotal)}
              </span>
            </div>
          </div>
        </ThemedPanel>
      )}
    </div>
  );
}
