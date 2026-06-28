import { useEffect } from "react";

import { isAutoPrintEnabled, isPrintStation } from "@/lib/printer-config";

const POLL_MS = 1500;

/** Refresca comandas cada 2 s y al detectar cambios de sincronización. */
export function usePrintStationPoll(reload: () => void | Promise<void>, enabled = true): void {
  useEffect(() => {
    if (!enabled || !isAutoPrintEnabled() || !isPrintStation()) return;

    const tick = () => void reload();
    tick();

    const interval = window.setInterval(tick, POLL_MS);
    const onSync = () => void reload();
    const onVisible = () => {
      if (document.visibilityState === "visible") void reload();
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
