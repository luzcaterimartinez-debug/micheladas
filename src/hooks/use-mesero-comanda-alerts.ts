import { useEffect, useRef } from "react";
import { toast } from "sonner";

import type { Comanda } from "@/lib/micheladas-store";

function playListaChime() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
    osc.onended = () => void ctx.close();
  } catch {
    /* audio no disponible */
  }
}

/** Notifica al mesero cuando una comanda pasa a estado "lista". */
export function useMeseroComandaAlerts(comandas: Comanda[], enabled = true) {
  const prevStatusRef = useRef<Map<string, Comanda["status"]>>(new Map());
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) return;

    for (const c of comandas) {
      const prev = prevStatusRef.current.get(c.id);
      prevStatusRef.current.set(c.id, c.status);

      if (c.status !== "lista") continue;
      if (prev === "lista" || notifiedRef.current.has(c.id)) continue;

      notifiedRef.current.add(c.id);
      const mesaLabel = c.mesa ? `Mesa ${c.mesa}` : "Sin mesa";
      toast.success(`¡Pedido listo! Comanda #${c.folio}`, {
        description: `${mesaLabel} · ${c.cliente}`,
        duration: 12000,
      });
      playListaChime();
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([180, 80, 180]);
      }
    }
  }, [comandas, enabled]);
}
