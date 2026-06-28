import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

import { pwaManifest } from "./src/pwa/manifest";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    preset: "vercel",
  },
  vite: {
    publicDir: "public",
    plugins: [
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: false,
        includeAssets: [
          "favicon.ico",
          "apple-touch-icon.png",
          "icon-192x192.png",
          "icon-512x512.png",
          "manifest.webmanifest",
        ],
        manifest: pwaManifest,
        workbox: {
          navigateFallback: "/",
          navigateFallbackDenylist: [/^\/api/],
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,webmanifest}"],
          runtimeCaching: [
            {
              urlPattern: ({ request, url }) =>
                request.method === "GET" && url.pathname.startsWith("/api/"),
              handler: "NetworkOnly",
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:8000",
          changeOrigin: true,
        },
      },
    },
  },
});
