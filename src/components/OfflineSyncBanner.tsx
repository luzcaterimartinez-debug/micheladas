import { useMemo, useState } from "react";
import { CloudOff, CloudUpload, ChevronDown, ChevronUp, Loader2, ServerCrash, Wifi } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";

import { useOfflineSync } from "@/hooks/use-offline-sync";
import { getStoredSession } from "@/lib/auth";
import { listOutbox, type OutboxOp } from "@/lib/offline/outbox";
import { cn } from "@/lib/utils";

const PUBLIC_ROUTES = new Set(["/login", "/carta"]);

function opLabel(op: OutboxOp): string {
  switch (op.type) {
    case "comanda:create":
      return `Pedido de ${op.payload.cliente} (sin subir)`;
    case "comanda:patch":
      return op.patch.status
        ? `Actualizar estado → ${op.patch.status}`
        : op.patch.items
          ? "Editar pedido"
          : "Actualizar comanda";
    case "comanda:delete":
      return "Eliminar comanda";
    case "mesa:atendida":
      return "Liberar mesa";
    case "mesa:patch":
      return "Actualizar mesa";
    case "inventario:patch":
      return `Inventario ${op.key}`;
    default:
      return "Cambio pendiente";
  }
}

export function OfflineSyncBanner() {
  const { online, serverReachable, pending, syncing, syncNow } = useOfflineSync();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hasSession = typeof window !== "undefined" && !!getStoredSession();
  const [expanded, setExpanded] = useState(false);

  const ops = useMemo(() => (pending > 0 ? listOutbox() : []), [pending, online, serverReachable, syncing]);

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
      <div className="mx-auto max-w-lg space-y-2">
        <div className="flex items-center justify-between gap-3">
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
                    ? "Base de datos no disponible — reintentando en silencio…"
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
          <div className="flex items-center gap-1.5 shrink-0">
            {pending > 0 && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-xs font-bold bg-black/15"
                aria-expanded={expanded}
              >
                {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                Ver
              </button>
            )}
            {online && (
              <button
                type="button"
                onClick={() => void syncNow()}
                disabled={syncing}
                className="inline-flex items-center gap-1 rounded-full bg-slate-900 text-white px-3 py-1 text-xs font-bold disabled:opacity-60"
              >
                {syncing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wifi className="h-3 w-3" />}
                {syncing ? "Sync…" : serverDown ? "Reintentar" : "Sincronizar"}
              </button>
            )}
          </div>
        </div>
        {expanded && ops.length > 0 && (
          <ul className="rounded-lg bg-black/15 px-3 py-2 space-y-1 max-h-40 overflow-y-auto text-xs font-medium">
            {ops.slice(0, 12).map((op) => (
              <li key={op.opId} className="truncate">
                • {opLabel(op)}
              </li>
            ))}
            {ops.length > 12 && <li>… y {ops.length - 12} más</li>}
          </ul>
        )}
      </div>
    </div>
  );
}
