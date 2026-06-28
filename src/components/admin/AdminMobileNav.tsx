import { Beer, LogOut } from "lucide-react";

import { PwaInstallButton } from "@/components/PwaInstallButton";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  ADMIN_MOBILE_QUICK,
  ADMIN_NAV,
  ADMIN_NAV_GROUPS,
  adminNavLabel,
  type AdminSection,
} from "@/lib/admin-nav";
import { cn } from "@/lib/utils";

type AdminMobileNavProps = {
  section: AdminSection;
  onSectionChange: (id: AdminSection) => void;
  userName: string;
  onLogout: () => void;
  sheetOpen: boolean;
  onSheetOpenChange: (open: boolean) => void;
};

export function AdminMobileHeader({
  section,
  onOpenMenu,
  userName,
  onLogout,
}: {
  section: AdminSection;
  onOpenMenu: () => void;
  userName: string;
  onLogout: () => void;
}) {
  const current = ADMIN_NAV.find((n) => n.id === section);
  const Icon = current?.icon ?? Beer;

  return (
    <header className="md:hidden sticky top-0 z-40 border-b bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/80 pt-[env(safe-area-inset-top)]">
      <div className="flex items-center gap-3 px-3 py-3">
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex items-center gap-3 min-w-0 flex-1 text-left touch-manipulation active:opacity-80"
        >
          <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground grid place-items-center shrink-0">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{adminNavLabel(section)}</p>
            <p className="text-xs text-muted-foreground truncate">{userName}</p>
          </div>
        </button>
        <PwaInstallButton size="icon" variant="outline" label="Instalar app" />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0 h-10 w-10"
          onClick={onLogout}
          aria-label="Cerrar sesión"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}

export function AdminMobileNav({
  section,
  onSectionChange,
  userName,
  onLogout,
  sheetOpen,
  onSheetOpenChange,
}: AdminMobileNavProps) {
  function pick(id: AdminSection) {
    onSectionChange(id);
    onSheetOpenChange(false);
  }

  return (
    <>
      <Sheet open={sheetOpen} onOpenChange={onSheetOpenChange}>
        <SheetContent side="left" className="w-[min(100vw-2rem,20rem)] p-0 flex flex-col">
          <SheetHeader className="p-4 border-b text-left space-y-1">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground grid place-items-center">
                <Beer className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <SheetTitle className="text-base">Michelandia</SheetTitle>
                <p className="text-xs text-muted-foreground font-normal truncate">{userName}</p>
              </div>
            </div>
          </SheetHeader>
          <nav className="flex-1 overflow-y-auto p-3 space-y-4">
            {ADMIN_NAV_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground px-2 mb-1.5">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.ids.map((id) => {
                    const item = ADMIN_NAV.find((n) => n.id === id);
                    if (!item) return null;
                    const Icon = item.icon;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => pick(id)}
                        className={cn(
                          "w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium touch-manipulation transition-colors",
                          section === id
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-muted",
                        )}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
          <div className="p-3 border-t pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <Button variant="outline" className="w-full gap-2 h-11" onClick={onLogout}>
              <LogOut className="h-4 w-4" />
              Salir
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/90 pb-[env(safe-area-inset-bottom)]"
        aria-label="Navegación principal"
      >
        <div className="grid grid-cols-4">
          {ADMIN_MOBILE_QUICK.map((item) => {
            const Icon = item.icon;
            const active = item.id === "more" ? sheetOpen : section === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.id === "more") {
                    onSheetOpenChange(true);
                  } else {
                    onSectionChange(item.id);
                    onSheetOpenChange(false);
                  }
                }}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2.5 px-1 touch-manipulation min-h-[3.25rem] transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
