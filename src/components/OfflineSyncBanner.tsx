import { CloudOff, CloudUpload, Loader2, ServerCrash, Wifi } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";

import { useOfflineSync } from "@/hooks/use-offline-sync";
import { getStoredSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

const PUBLIC_ROUTES = new Set(["/login", "/carta"]);

export function OfflineSyncBanner() {
  const { online, serverReachable, pending, syncing, syncNow } = useOfflineSync();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hasSession = typeof window !== "undefined" && !!getStoredSession();

  if (!hasSession && PUBLIC_ROUTES.has(pathname)) return null;
  if (online && serverReachable && pending === 0) return null;

  const offline = !online;
  const serverDown = online && !serverReachable;

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] px-3 py-2 text-sm font-semibold shadow-md",
        "pt-[max(0.5rem,env(safe-area-inset-top))]",
        offline ? "bg-slate-900 text-white" : serverDown ? "bg-red-600 text-white" : "bg-amber-500 text-slate-900",
      )}
    >
      <div className="mx-auto max-w-lg flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {offline ? (
            <>
              <CloudOff className="h-4 w-4 shrink-0" />
              <span className="truncate">Sin internet — los cambios se guardan localmente</span>
            </>
          ) : serverDown ? (
            <>
              <ServerCrash className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {import.meta.env.PROD
                  ? "Servidor no disponible — revisa la API o intenta más tarde"
                  : "Servidor no disponible — inicia el backend (puerto 8000)"}
              </span>
            </>
          ) : (
            <>
              <CloudUpload className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {pending} cambio{pending === 1 ? "" : "s"} pendiente{pending === 1 ? "" : "s"} de sincronizar
              </span>
            </>
          )}
        </div>
        {online && serverReachable && pending > 0 && (
          <button
            type="button"
            onClick={() => void syncNow()}
            disabled={syncing}
            className="shrink-0 inline-flex items-center gap-1 rounded-full bg-slate-900 text-white px-3 py-1 text-xs font-bold disabled:opacity-60"
          >
            {syncing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wifi className="h-3 w-3" />}
            {syncing ? "Sync…" : "Sincronizar"}
          </button>
        )}
      </div>
    </div>
  );
}
