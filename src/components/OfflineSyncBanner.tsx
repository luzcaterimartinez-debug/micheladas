import { CloudOff, CloudUpload, Loader2, Wifi } from "lucide-react";

import { useOfflineSync } from "@/hooks/use-offline-sync";
import { cn } from "@/lib/utils";

export function OfflineSyncBanner() {
  const { online, pending, syncing, syncNow } = useOfflineSync();

  if (online && pending === 0) return null;

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] px-3 py-2 text-sm font-semibold shadow-md",
        "pt-[max(0.5rem,env(safe-area-inset-top))]",
        online ? "bg-amber-500 text-slate-900" : "bg-slate-900 text-white",
      )}
    >
      <div className="mx-auto max-w-lg flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {!online ? (
            <>
              <CloudOff className="h-4 w-4 shrink-0" />
              <span className="truncate">Sin conexión — modo local activo</span>
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
        {online && pending > 0 && (
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
