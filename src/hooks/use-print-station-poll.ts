import { useEffect } from "react";

import { isAutoPrintEnabled, isPrintStation } from "@/lib/printer-config";

/** En estación de impresión, refresca comandas más seguido para tickets casi inmediatos. */
export function usePrintStationPoll(reload: () => void | Promise<void>, enabled = true): void {
  useEffect(() => {
    if (!enabled || !isAutoPrintEnabled() || !isPrintStation()) return;
    const tick = () => void reload();
    const interval = window.setInterval(tick, 3000);
    return () => window.clearInterval(interval);
  }, [reload, enabled]);
}
