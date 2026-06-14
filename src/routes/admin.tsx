import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Beer, Loader2, LogOut } from "lucide-react";
import { Toaster } from "sonner";

import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminAdiciones } from "@/components/admin/AdminAdiciones";
import { AdminFases } from "@/components/admin/AdminFases";
import { AdminCategorias } from "@/components/admin/AdminCategorias";
import { AdminMenu } from "@/components/admin/AdminMenu";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminReportes } from "@/components/admin/AdminReportes";
import { AdminNomina } from "@/components/admin/AdminNomina";
import { AdminCaja } from "@/components/admin/AdminCaja";
import { AdminMobileHeader, AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { MenuProvider } from "@/lib/menu-context";
import { ComandasList } from "@/components/ComandasList";
import { InventoryPanel } from "@/components/InventoryPanel";
import { MesasPanel } from "@/components/MesasPanel";
import { OrderBuilder } from "@/components/OrderBuilder";
import { Button } from "@/components/ui/button";
import { ADMIN_NAV, type AdminSection } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";
import { clearSession, validateSession } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  ssr: false,
  pendingComponent: AdminPanelFallback,
  head: () => ({
    meta: [{ title: "Panel administrador · Micheladas POS" }],
  }),
  beforeLoad: async () => {
    const session = await validateSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }
    if (session.user.rol !== "admin") {
      throw redirect({ to: "/" });
    }
    return { user: session.user };
  },
  component: AdminPanel,
});

export function AdminPanelFallback() {
  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex w-56 shrink-0 border-r bg-card" aria-hidden />
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    </div>
  );
}

function AdminPanel() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const [section, setSection] = useState<AdminSection>("resumen");
  const [navSheetOpen, setNavSheetOpen] = useState(false);

  function handleLogout() {
    clearSession();
    void navigate({ to: "/login" });
  }

  return (
    <MenuProvider>
      <div className="min-h-screen bg-background flex">
        <Toaster position="top-center" richColors />

        <aside className="hidden md:flex w-56 shrink-0 border-r bg-card flex-col">
          <div className="p-4 border-b flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground grid place-items-center">
              <Beer className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">Admin</p>
              <p className="text-xs text-muted-foreground truncate">{user.nombre}</p>
            </div>
          </div>
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={cn(
                    "w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    section === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <div className="p-3 border-t">
            <Button variant="outline" size="sm" className="w-full gap-2" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Salir
            </Button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <AdminMobileHeader
            section={section}
            onOpenMenu={() => setNavSheetOpen(true)}
            userName={user.nombre}
            onLogout={handleLogout}
          />

          <AdminMobileNav
            section={section}
            onSectionChange={setSection}
            userName={user.nombre}
            onLogout={handleLogout}
            sheetOpen={navSheetOpen}
            onSheetOpenChange={setNavSheetOpen}
          />

          <main className="flex-1 px-3 pt-3 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:px-6 md:py-6 md:pb-6 overflow-auto max-w-6xl w-full mx-auto">
            {section === "resumen" && <AdminDashboard />}
            {section === "categorias" && <AdminCategorias />}
            {section === "menu" && <AdminMenu />}
            {section === "fases" && <AdminFases />}
            {section === "adiciones" && <AdminAdiciones />}
            {section === "usuarios" && <AdminUsers />}
            {section === "comandas" && <ComandasList />}
            {section === "caja" && <AdminCaja />}
            {section === "reportes" && <AdminReportes />}
            {section === "nomina" && <AdminNomina />}
            {section === "inventario" && <InventoryPanel />}
            {section === "mesas" && <MesasPanel />}
            {section === "pos" && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">Tomar pedido</h2>
                  <p className="text-sm text-muted-foreground">Mismo flujo que el mesero</p>
                </div>
                <OrderBuilder />
              </div>
            )}
          </main>
        </div>
      </div>
    </MenuProvider>
  );
}
