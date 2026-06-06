import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  MichelandiaBackground,
  ThemedPanel,
  ThemedPanelHeader,
} from "@/components/michelandia/michelandia-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { getStoredSession, login } from "@/lib/auth";
import { homePathForRole } from "@/lib/auth-routes";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Iniciar sesión · Michelandia" }],
  }),
  beforeLoad: () => {
    const session = getStoredSession();
    if (session) {
      throw redirect({ to: homePathForRole(session.user.rol) });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const session = await login(email.trim(), password);
      toast.success("Bienvenido");
      await navigate({ to: homePathForRole(session.user.rol) });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen min-h-[100dvh] relative text-slate-900"
      style={{ fontFamily: '"Poppins", system-ui, sans-serif' }}
    >
      <MichelandiaBackground />
      <Toaster position="top-center" richColors />

      <div className="relative z-10 min-h-screen min-h-[100dvh] flex flex-col">
        <header className="px-4 pt-10 pb-4 sm:pt-14 text-center">
          <h1
            className="text-4xl sm:text-5xl font-black leading-none select-none"
            style={{
              fontFamily: '"Pacifico", "Segoe Script", cursive',
              background: "linear-gradient(135deg, #ff6f00 0%, #43a047 45%, #1e88e5 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(3px 3px 0 #fff) drop-shadow(5px 5px 0 rgba(0,0,0,0.25))",
            }}
          >
            Michelandia
          </h1>
          <p
            className="mt-2 text-base sm:text-lg text-white"
            style={{
              fontFamily: '"Pacifico", "Segoe Script", cursive',
              textShadow: "1px 1px 0 rgba(0,0,0,0.35), 2px 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            Refresca tu mente y tu corazón
          </p>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-white/85">
            Acceso personal
          </p>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-4 pb-28">
          <ThemedPanel themeId="tradicional" className="w-full max-w-md">
            <ThemedPanelHeader
              themeId="tradicional"
              title="Iniciar sesión"
              subtitle="Cuenta de trabajo del negocio"
            />
            <div className="px-4 py-5 sm:px-6 sm:py-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-bold text-slate-800">
                    Correo
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="username"
                    placeholder="mesero@micheladas.local"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className={cn(
                      "h-12 rounded-xl border-slate-300 bg-white text-base",
                      "focus-visible:ring-2 focus-visible:ring-[#1e88e5]/30",
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-bold text-slate-800">
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className={cn(
                      "h-12 rounded-xl border-slate-300 bg-white text-base",
                      "focus-visible:ring-2 focus-visible:ring-[#1e88e5]/30",
                    )}
                  />
                </div>
                <Button
                  type="submit"
                  className={cn(
                    "w-full h-12 rounded-xl text-base font-bold",
                    "bg-slate-900 hover:bg-slate-800 text-white",
                    "touch-manipulation active:scale-[0.98]",
                  )}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Entrando…
                    </>
                  ) : (
                    "Iniciar sesión"
                  )}
                </Button>
              </form>
              <p className="mt-5 text-center text-xs text-slate-500 leading-relaxed">
                Personal: admin, mesero y barra · pruebas en backend/README.md
              </p>
            </div>
          </ThemedPanel>
        </main>

        <footer className="fixed bottom-0 left-0 right-0 z-20 bg-[#ffcc00] border-t-2 border-amber-500 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] pb-[env(safe-area-inset-bottom)]">
          <div className="max-w-md mx-auto px-4 py-3 text-center">
            <Link
              to="/carta"
              className="text-sm font-extrabold text-slate-900 uppercase tracking-wide hover:opacity-80 transition-opacity"
            >
              Ver carta para clientes →
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
