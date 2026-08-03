import { useEffect } from "react";

import { isAutoPrintEnabled, isPrintStation } from "@/lib/printer-config";
import { shouldSyncWithServer } from "@/lib/offline/network";

/** Antes: 1.5s → ~2400 hits/hora y Hostinger 500/h se agota en minutos. */
const POLL_MS = 12_000;

/** Refresca comandas en la estación de impresión sin quemar MySQL. */
export function usePrintStationPoll(reload: () => void | Promise<void>, enabled = true): void {
  useEffect(() => {
    if (!enabled || !isAutoPrintEnabled() || !isPrintStation()) return;

    const tick = () => {
      if (document.visibilityState === "hidden") return;
      if (!shouldSyncWithServer()) return;
      void reload();
    };
    tick();

    const interval = window.setInterval(tick, POLL_MS);
    const onSync = () => {
      if (shouldSyncWithServer()) void reload();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible" && shouldSyncWithServer()) void reload();
    };

    window.addEventListener("michelada-sync-change", onSync);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("michelada-sync-change", onSync);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [reload, enabled]);
}
