import type { ReactNode } from "react";
import { Beer, LogOut } from "lucide-react";

import { PwaInstallButton } from "@/components/PwaInstallButton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  /** Marca pequeña arriba del título */
  brand?: string;
  title: string;
  userName?: string;
  roleLabel?: string;
  badge?: ReactNode;
  onLogout: () => void;
  className?: string;
  /** Clases del contenedor interior (ancho máx.) */
  containerClassName?: string;
  variant?: "default" | "michelandia";
};

export function PosHeader({
  brand = "Micheladas",
  title,
  userName,
  roleLabel,
  badge,
  onLogout,
  className,
  containerClassName = "max-w-lg md:max-w-7xl",
  variant = "default",
}: Props) {
  const isMichelandia = variant === "michelandia";

  return (
    <header
      className={cn(
        "sticky top-0 z-30",
        "pt-[env(safe-area-inset-top,0px)]",
        isMichelandia
          ? "border-b border-white/25 bg-white/10 backdrop-blur-md"
          : "border-b border-border/50 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto flex h-[3.25rem] sm:h-14 w-full items-center justify-between gap-3 px-4",
          containerClassName,
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          {isMichelandia ? (
            <div className="min-w-0 leading-tight">
              <p
                className="text-2xl sm:text-3xl font-black leading-none truncate"
                style={{
                  fontFamily: '"Pacifico", "Segoe Script", cursive',
                  background: "linear-gradient(135deg, #ff6f00 0%, #43a047 45%, #1e88e5 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(1px 1px 0 #fff)",
                }}
              >
                {brand}
              </p>
              <h1 className="text-xs sm:text-sm font-bold text-white/90 truncate mt-0.5">
                {title}
              </h1>
            </div>
          ) : (
            <>
              <div
                className="h-9 w-9 shrink-0 rounded-lg bg-foreground text-background grid place-items-center"
                aria-hidden
              >
                <Beer className="h-4 w-4" strokeWidth={2.25} />
              </div>
              <div className="min-w-0 leading-tight">
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  {brand}
                </p>
                <h1 className="text-[15px] sm:text-base font-semibold tracking-tight truncate">
                  {title}
                </h1>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {badge}
          <PwaInstallButton
            size="icon"
            variant="ghost"
            light={isMichelandia}
            label="Instalar app"
          />
          {(userName || roleLabel) && (
            <div className="hidden sm:block text-right max-w-[9rem] mr-0.5">
              {userName && (
                <p
                  className={cn(
                    "text-sm font-medium truncate leading-none",
                    isMichelandia && "text-white",
                  )}
                >
                  {userName}
                </p>
              )}
              {roleLabel && (
                <p
                  className={cn(
                    "text-[11px] mt-1 truncate",
                    isMichelandia ? "text-white/75" : "text-muted-foreground",
                  )}
                >
                  {roleLabel}
                </p>
              )}
            </div>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-9 w-9 shrink-0",
              isMichelandia
                ? "text-white/90 hover:text-white hover:bg-white/15"
                : "text-muted-foreground hover:text-foreground",
            )}
            onClick={onLogout}
            aria-label="Cerrar sesión"
          >
            <LogOut className="h-[1.125rem] w-[1.125rem]" />
          </Button>
        </div>
      </div>
    </header>
  );
}
