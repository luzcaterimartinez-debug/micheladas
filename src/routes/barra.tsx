import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Toaster } from "sonner";

import { BarraPanel } from "@/components/barra/BarraPanel";
import { MenuProvider } from "@/lib/menu-context";
import { clearSession, validateSession } from "@/lib/auth";

export const Route = createFileRoute("/barra")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Barra · Micheladas" }],
  }),
  beforeLoad: async () => {
    const session = await validateSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }
    if (session.user.rol !== "cocinero") {
      throw redirect({ to: session.user.rol === "admin" ? "/admin" : "/" });
    }
    return { user: session.user };
  },
  component: BarraRoute,
});

function BarraRoute() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();

  return (
    <MenuProvider>
      <Toaster position="top-center" richColors />
      <BarraPanel
        userName={user.nombre}
        onLogout={() => {
          clearSession();
          void navigate({ to: "/login" });
        }}
      />
    </MenuProvider>
  );
}
