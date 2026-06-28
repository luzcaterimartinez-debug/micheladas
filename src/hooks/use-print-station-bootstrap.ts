import { useEffect } from "react";

import {
  isPrintRoute,
  setAutoPrintEnabled,
  setPrintStation,
} from "@/lib/printer-config";

const AUTO_PRINT_KEY = "micheladas_auto_print";
const PRINT_STATION_KEY = "micheladas_print_station";

/** Activa estación de impresión, mantiene pantalla encendida en /impresion o /barra. */
export function usePrintStationBootstrap(): void {
  useEffect(() => {
    if (!isPrintRoute()) return;

    if (localStorage.getItem(PRINT_STATION_KEY) === null) {
      setPrintStation(true);
    }
    if (localStorage.getItem(AUTO_PRINT_KEY) === null) {
      setAutoPrintEnabled(true);
    }

    let wakeLock: WakeLockSentinel | null = null;

    async function keepAwake() {
      try {
        if ("wakeLock" in navigator && document.visibilityState === "visible") {
          wakeLock = await navigator.wakeLock.request("screen");
        }
      } catch {
        /* no disponible en todos los navegadores */
      }
    }

    void keepAwake();

    const onVisible = () => {
      void wakeLock?.release();
      wakeLock = null;
      if (document.visibilityState === "visible") void keepAwake();
    };

    document.addEventListener("visibilitychange", onVisible);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      void wakeLock?.release();
    };
  }, []);
}
