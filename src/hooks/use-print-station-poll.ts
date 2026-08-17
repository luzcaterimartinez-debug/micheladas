import { useEffect } from "react";

import { shouldPollServer } from "@/lib/offline/network";
import { isAutoPrintEnabled, isPrintStation } from "@/lib/printer-config";

const POLL_MS = 20_000;

/** Refresca comandas en la estación de impresión sin quemar consultas. */
export function usePrintStationPoll(reload: () => void | Promise<void>, enabled = true): void {
  useEffect(() => {
    if (!enabled || !isAutoPrintEnabled() || !isPrintStation()) return;

    const tick = () => {
      if (document.visibilityState === "hidden") return;
      if (!shouldPollServer("comandas")) return;
      void reload();
    };
    tick();

    const interval = window.setInterval(tick, POLL_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [reload, enabled]);
}
