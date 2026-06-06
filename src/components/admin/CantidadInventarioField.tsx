import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  cantidadPlaceholder,
  findInventarioItem,
  formatCantidadInventario,
} from "@/lib/inventario-cantidad";
import type { InventoryItem } from "@/lib/micheladas-store";

type Props = {
  inventario: InventoryItem[];
  stockKey: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function CantidadInventarioField({
  inventario,
  stockKey,
  value,
  onChange,
  disabled,
}: Props) {
  const item = findInventarioItem(inventario, stockKey);
  const unit = item?.unit ?? "";
  const parsed = Number(value);
  const hasQty = Number.isFinite(parsed) && parsed > 0;

  return (
    <div className="space-y-2">
      <Label>Cantidad que lleva</Label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={0.001}
          step="any"
          className="flex-1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || !stockKey}
          placeholder={cantidadPlaceholder(unit)}
        />
        {unit ? (
          <span className="text-sm font-semibold text-foreground w-10 shrink-0">{unit}</span>
        ) : (
          <span className="text-sm text-muted-foreground w-10 shrink-0">—</span>
        )}
      </div>
      {!stockKey ? (
        <p className="text-xs text-muted-foreground">
          Elige un ítem de inventario para indicar cuánto se resta al vender.
        </p>
      ) : item ? (
        <p className="text-xs text-muted-foreground">
          En inventario hay <strong className="text-foreground">{item.stock}</strong> {unit}.
          {hasQty ? (
            <>
              {" "}
              Al vender se restará{" "}
              <strong className="text-foreground">{formatCantidadInventario(parsed, unit)}</strong>
              {item.stock - parsed >= 0 ? (
                <> (quedarían {item.stock - parsed} {unit})</>
              ) : (
                <> — no alcanza el stock actual</>
              )}
              .
            </>
          ) : (
            <> Escribe el gasto por pedido en {unit} (misma unidad que en Inventario).</>
          )}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Usa la misma unidad que el ítem en Inventario (g, L, pz).
        </p>
      )}
    </div>
  );
}
