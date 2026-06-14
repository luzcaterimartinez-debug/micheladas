import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

const apiUrlEnv = (process.env.VITE_API_URL ?? "").replace(/\/$/, "");
let apiPattern: RegExp | undefined;
if (apiUrlEnv) {
  try {
    const { origin } = new URL(apiUrlEnv);
    apiPattern = new RegExp(`^${origin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/api/.*`, "i");
  } catch {
    apiPattern = undefined;
  }
} else {
  apiPattern = /^\/api\/.*/i;
}

const runtimeCaching = apiPattern
  ? [
      {
        urlPattern: apiPattern,
        handler: "NetworkFirst" as const,
        options: {
          cacheName: "api-cache",
          expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 },
          networkTimeoutSeconds: 5,
        },
      },
    ]
  : [];

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    preset: "vercel",
    vercel: {
      config: {
        routes: [
          {
            src: "/api(?:/(.*))?",
            dest: "/api/index",
          },
        ],
      }
    }
  },
  vite: {
    publicDir: "public",
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:8000",
          changeOrigin: true,
        },
      },
    },
    plugins: [
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.ico", "apple-touch-icon.png"],
        manifest: {
          name: "Michelandia POS",
          short_name: "Michelandia",
          description: "Sistema de pedidos Michelandia — funciona sin conexión",
          theme_color: "#4db8eb",
          background_color: "#4db8eb",
          display: "standalone",
          orientation: "portrait",
          icons: [
            { src: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
            { src: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
            { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
          navigateFallback: "index.html",
          runtimeCaching,
        },
      }),
    ],
  },
});
