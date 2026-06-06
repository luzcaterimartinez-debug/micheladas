import type { ReactNode } from "react";

import { flavorTheme, formatMenuPrice } from "@/lib/michelandia-theme";
import { cn } from "@/lib/utils";

export function MichelandiaBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-b from-[#5ec8f7] via-[#4db8eb] to-[#3aa8e0]" />
      <div className="absolute -top-20 -left-16 h-56 w-56 rounded-full bg-lime-400/25 blur-2xl" />
      <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-yellow-300/30 blur-2xl" />
      <div className="absolute top-1/4 right-0 h-40 w-40 rounded-full bg-white/20 blur-xl" />
      <div className="absolute bottom-32 -left-20 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="absolute top-[12%] left-[8%] h-3 w-3 rounded-full bg-white/50" />
      <div className="absolute top-[18%] right-[15%] h-2 w-2 rounded-full bg-white/40" />
      <div className="absolute top-[35%] left-[20%] h-2.5 w-2.5 rounded-full bg-white/35" />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}

export function MenuPriceRow({
  label,
  price,
  selected,
  onClick,
}: {
  label: string;
  price: number;
  selected?: boolean;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <span className="font-semibold text-slate-800 shrink-0">{label}</span>
      <span
        className="flex-1 border-b-2 border-dotted border-slate-400/70 mb-1 min-w-[1rem]"
        aria-hidden
      />
      <span className="font-extrabold text-slate-900 tabular-nums shrink-0">
        {formatMenuPrice(price)}
      </span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "w-full flex items-end gap-2 text-[15px] leading-snug rounded-xl px-3 py-3 touch-manipulation transition-colors",
          selected
            ? "bg-slate-900/5 ring-2 ring-slate-900/15"
            : "hover:bg-slate-50 active:scale-[0.99]",
        )}
      >
        {inner}
      </button>
    );
  }

  return <div className="flex items-end gap-2 text-[15px] leading-snug">{inner}</div>;
}

export function FlavorGridCard({
  themeId,
  title,
  subtitle,
  minPrice,
  selected,
  onSelect,
}: {
  themeId: string;
  title: string;
  subtitle?: string;
  minPrice?: number;
  selected?: boolean;
  onSelect: () => void;
}) {
  const theme = flavorTheme(themeId);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left rounded-xl sm:rounded-2xl bg-white p-3 sm:p-5 shadow-lg",
        "transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98] touch-manipulation",
        selected && "ring-2 ring-offset-2 ring-slate-900/25",
      )}
      style={{
        border: `3px solid ${theme.border}`,
        boxShadow: `0 8px 24px ${theme.ring}`,
      }}
    >
      <h2
        className="text-xs sm:text-lg font-extrabold uppercase tracking-wide leading-tight"
        style={{ color: theme.title }}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className="text-[10px] sm:text-sm italic mt-1 leading-snug line-clamp-2"
          style={{ color: theme.subtitle }}
        >
          ({subtitle})
        </p>
      ) : null}
      {minPrice != null && Number.isFinite(minPrice) && (
        <p className="text-[10px] sm:text-[11px] text-slate-500 mt-2 sm:mt-3 font-medium">
          Desde {formatMenuPrice(minPrice)}
        </p>
      )}
    </button>
  );
}

export function ThemedPanel({
  themeId,
  children,
  className,
}: {
  themeId: string;
  children: ReactNode;
  className?: string;
}) {
  const theme = flavorTheme(themeId);

  return (
    <div
      className={cn("rounded-2xl bg-white shadow-xl overflow-hidden", className)}
      style={{
        border: `3px solid ${theme.border}`,
        boxShadow: `0 12px 32px ${theme.ring}`,
      }}
    >
      {children}
    </div>
  );
}

export function ThemedPanelHeader({
  themeId,
  title,
  subtitle,
}: {
  themeId: string;
  title: string;
  subtitle?: string;
}) {
  const theme = flavorTheme(themeId);

  return (
    <header className="text-center px-4 py-4 sm:px-6 sm:py-5 border-b border-dashed border-slate-200">
      <h2
        className="text-lg sm:text-xl font-extrabold uppercase tracking-wide"
        style={{ color: theme.title }}
      >
        {title}
      </h2>
      {subtitle ? (
        <p className="text-sm italic mt-1" style={{ color: theme.subtitle }}>
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}

export function MeseroStepHeader({
  stepLabel,
  title,
  description,
}: {
  stepLabel?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-1">
      {stepLabel ? (
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/85">
          {stepLabel}
        </p>
      ) : null}
      <h2 className="text-xl font-extrabold text-white tracking-tight">{title}</h2>
      {description ? (
        <p className="text-sm text-white/85 leading-relaxed">{description}</p>
      ) : null}
    </div>
  );
}

export function MichelandiaFooterBar({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-30",
        "bg-[#ffcc00] border-t-2 border-amber-500",
        "shadow-[0_-4px_20px_rgba(0,0,0,0.15)]",
        "px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
      )}
    >
      <div className="mx-auto max-w-lg">{children}</div>
    </div>
  );
}
