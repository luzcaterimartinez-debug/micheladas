import { createFileRoute } from "@tanstack/react-router";

import { ClienteMenuView } from "@/components/cliente/ClienteMenuView";

export const Route = createFileRoute("/carta")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Carta · Michelandia" },
      {
        name: "description",
        content: "Menú Michelandia — micheladas, sabores y precios. Refresca tu mente y tu corazón.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Pacifico&family=Poppins:wght@600;700;800&display=swap",
      },
    ],
  }),
  component: ClienteMenuView,
});
