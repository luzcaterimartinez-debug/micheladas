import { useEffect } from "react";
import { toast } from "sonner";

/**
 * Registra el service worker generado por vite-plugin-pwa.
 * La API (/api/*) no se cachea — el modo offline sigue usando localStorage + outbox.
 */
export function PwaRegistrar() {
  useEffect(() => {
    if (import.meta.env.DEV || typeof window === "undefined") return;

    void import("virtual:pwa-register")
      .then(({ registerSW }) => {
        registerSW({
          immediate: true,
          onNeedRefresh() {
            toast("Nueva versión disponible", {
              description: "Toca para actualizar la app",
              action: {
                label: "Actualizar",
                onClick: () => window.location.reload(),
              },
              duration: 12_000,
            });
          },
          onOfflineReady() {
            toast.success("Lista para usar sin conexión", {
              description: "La app quedó instalada en este dispositivo",
              duration: 5000,
            });
          },
        });
      })
      .catch(() => {
        /* SW no disponible en este entorno */
      });
  }, []);

  return null;
}
