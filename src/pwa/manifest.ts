/** Valores compartidos entre vite-plugin-pwa y public/manifest.webmanifest */
export const PWA_THEME_COLOR = "#4db8eb";
export const PWA_BACKGROUND_COLOR = "#4db8eb";

export const pwaManifest = {
  name: "Michelandia POS",
  short_name: "Michelandia",
  description: "Sistema de pedidos y comandas para micheladas",
  theme_color: PWA_THEME_COLOR,
  background_color: PWA_BACKGROUND_COLOR,
  display: "standalone" as const,
  orientation: "portrait" as const,
  scope: "/",
  start_url: "/",
  lang: "es",
  categories: ["food", "business"],
  icons: [
    {
      src: "/icon-192x192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icon-512x512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icon-512x512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
    {
      src: "/apple-touch-icon.png",
      sizes: "180x180",
      type: "image/png",
    },
  ],
};
