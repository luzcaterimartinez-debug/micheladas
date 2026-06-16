import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
  size?: "sm" | "md";
};

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  className,
  size = "md",
}: Props) {
  const btnClass = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const textClass = size === "sm" ? "text-base w-8" : "text-lg w-10";

  function set(next: number) {
    onChange(Math.min(max, Math.max(min, next)));
  }

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn("touch-manipulation rounded-full shrink-0", btnClass)}
        onClick={() => set(value - 1)}
        disabled={value <= min}
        aria-label="Quitar una unidad"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span
        className={cn("font-black tabular-nums text-center text-slate-900", textClass)}
        aria-live="polite"
      >
        {value}
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn("touch-manipulation rounded-full shrink-0", btnClass)}
        onClick={() => set(value + 1)}
        disabled={value >= max}
        aria-label="Agregar una unidad"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
