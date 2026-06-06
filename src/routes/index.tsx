import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { MeseroOrderWizard } from "@/components/mesero/MeseroOrderWizard";
import { MenuProvider } from "@/lib/menu-context";
import { InventoryPanel } from "@/components/InventoryPanel";
import { Beer, ClipboardList, Boxes, Users } from "lucide-react";
import { MichelandiaBackground } from "@/components/michelandia/michelandia-ui";
import { PosHeader } from "@/components/PosHeader";
import { clearSession, ROL_LABELS, validateSession } from "@/lib/auth";
import { defaultTabForRole, tabsForRole, type PosTab } from "@/lib/auth-permissions";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Micheladas POS" },
      { name: "description", content: "Sistema de pedidos y comandas para puesto de micheladas." },
    ],
  }),
  beforeLoad: async () => {
    const session = await validateSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }
    if (session.user.rol === "admin") {
      throw redirect({ to: "/admin" });
    }
    if (session.user.rol === "cocinero") {
      throw redirect({ to: "/barra" });
    }
    return { user: session.user };
  },
  component: Index,
});

const TAB_META: Record<PosTab, { label: string; icon: typeof Beer }> = {
  pedido: { label: "Pedido", icon: Beer },
  mesas: { label: "Mesas", icon: Users },
  comandas: { label: "Comandas", icon: ClipboardList },
  inventario: { label: "Inventario", icon: Boxes },
};

function Index() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const allowedTabs = tabsForRole(user.rol);
  const [activeTab, setActiveTab] = useState<PosTab>(defaultTabForRole(user.rol));
  function handleLogout() {
    clearSession();
    void navigate({ to: "/login" });
  }

  return (
    <MenuProvider>
    <div
      className="min-h-screen min-h-[100dvh] relative flex flex-col text-slate-900"
      style={{ fontFamily: '"Poppins", system-ui, sans-serif' }}
    >
      <MichelandiaBackground />
      <Toaster position="top-center" richColors />
      <div className="relative z-10 flex flex-col min-h-screen min-h-[100dvh]">
      <PosHeader
        brand="Michelandia"
        title="Mesero"
        variant="michelandia"
        userName={user.nombre}
        roleLabel={ROL_LABELS[user.rol]}
        onLogout={handleLogout}
      />

      <main className="flex-1 mx-auto w-full max-w-lg px-3 pt-3 pb-4 sm:px-4">
        {allowedTabs.length === 1 ? (
          <div>
            {allowedTabs[0] === "pedido" && <MeseroOrderWizard />}
            {allowedTabs[0] === "inventario" && <InventoryPanel />}
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as PosTab)}
            className="w-full"
          >
            <TabsList
              className="grid w-full max-w-xl"
              style={{ gridTemplateColumns: `repeat(${allowedTabs.length}, minmax(0, 1fr))` }}
            >
              {allowedTabs.map((tab) => {
                const meta = TAB_META[tab];
                const Icon = meta.icon;
                return (
                  <TabsTrigger key={tab} value={tab} className="gap-2">
                    <Icon className="h-4 w-4" /> {meta.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {allowedTabs.includes("pedido") && (
              <TabsContent value="pedido" className="mt-6">
                <MeseroOrderWizard />
              </TabsContent>
            )}
            {allowedTabs.includes("inventario") && (
              <TabsContent value="inventario" className="mt-6">
                <InventoryPanel />
              </TabsContent>
            )}
          </Tabs>
        )}
      </main>
      </div>
    </div>
    </MenuProvider>
  );
}
