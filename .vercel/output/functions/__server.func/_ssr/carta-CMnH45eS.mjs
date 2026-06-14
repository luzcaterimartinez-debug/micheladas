import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { i as isAppOnline, g as getCachedMenu, F as FALLBACK_MENU, b as getApiUrl, n as normalizeMenuFromApi, s as setCachedMenu, c as cn } from "./router-CzC-Ytu6.mjs";
import { f as flavorTheme, a as formatMenuPrice, p as productBaseLabel } from "./michelandia-theme-DVmC1I5Y.mjs";
import { L as LoaderCircle, A as ArrowLeft, B as Bike, c as Phone } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
async function fetchPublicMenu() {
  if (!isAppOnline()) {
    return getCachedMenu(FALLBACK_MENU);
  }
  try {
    const res = await fetch(`${getApiUrl()}/api/menu/public`);
    if (!res.ok) {
      console.warn("Menú público no disponible, usando respaldo local");
      return getCachedMenu(FALLBACK_MENU);
    }
    const data = await res.json();
    const menu = normalizeMenuFromApi({
      categorias: data.categorias,
      productos: data.productos,
      adiciones: data.adiciones
    });
    setCachedMenu(menu);
    return menu;
  } catch {
    return getCachedMenu(FALLBACK_MENU);
  }
}
const DOMICILIOS = "323-373-5453";
const ADICIONES_ID = "__adiciones__";
function MenuPriceRow({ label, price }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-2 text-[15px] leading-snug", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-slate-800 shrink-0", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        className: "flex-1 border-b-2 border-dotted border-slate-400/70 mb-1 min-w-[1rem]",
        "aria-hidden": true
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-extrabold text-slate-900 tabular-nums shrink-0", children: formatMenuPrice(price) })
  ] });
}
function FlavorGridCard({
  categoria,
  onSelect
}) {
  const theme = flavorTheme(categoria.id);
  const minPrice = Math.min(...categoria.productos.map((p) => p.price), Infinity);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      onClick: onSelect,
      className: cn(
        "w-full text-left rounded-xl sm:rounded-2xl bg-white p-3 sm:p-5 shadow-lg",
        "transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98] touch-manipulation"
      ),
      style: {
        border: `3px solid ${theme.border}`,
        boxShadow: `0 8px 24px ${theme.ring}`
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "h2",
          {
            className: "text-xs sm:text-lg font-extrabold uppercase tracking-wide leading-tight",
            style: { color: theme.title },
            children: categoria.name
          }
        ),
        categoria.description ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "p",
          {
            className: "text-[10px] sm:text-sm italic mt-1 leading-snug line-clamp-2",
            style: { color: theme.subtitle },
            children: [
              "(",
              categoria.description,
              ")"
            ]
          }
        ) : null,
        Number.isFinite(minPrice) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] sm:text-[11px] text-slate-500 mt-2 sm:mt-3 font-medium", children: [
          "Desde ",
          formatMenuPrice(minPrice)
        ] })
      ]
    }
  );
}
function AdicionesGridCard({
  adiciones,
  onSelect
}) {
  const theme = flavorTheme("adiciones");
  const minPrice = Math.min(...adiciones.map((a) => a.price), Infinity);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      onClick: onSelect,
      className: cn(
        "w-full text-left rounded-xl sm:rounded-2xl bg-white p-3 sm:p-5 shadow-lg",
        "transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98] touch-manipulation"
      ),
      style: {
        border: `3px solid ${theme.border}`,
        boxShadow: `0 8px 24px ${theme.ring}`
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "h2",
          {
            className: "text-xs sm:text-lg font-extrabold uppercase tracking-wide leading-tight",
            style: { color: theme.title },
            children: "Adiciones"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "p",
          {
            className: "text-[10px] sm:text-sm italic mt-1 leading-snug",
            style: { color: theme.subtitle },
            children: "(Extras para tu michelada)"
          }
        ),
        Number.isFinite(minPrice) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] sm:text-[11px] text-slate-500 mt-2 sm:mt-3 font-medium", children: [
          "Desde ",
          formatMenuPrice(minPrice)
        ] })
      ]
    }
  );
}
function AdicionesMenuCard({ adiciones }) {
  const theme = flavorTheme("adiciones");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "article",
    {
      className: "rounded-2xl bg-white p-5 sm:p-6 shadow-xl",
      style: {
        border: `3px solid ${theme.border}`,
        boxShadow: `0 12px 32px ${theme.ring}`
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "text-center mb-5 pb-4 border-b border-dashed border-slate-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "h2",
            {
              className: "text-xl sm:text-2xl font-extrabold uppercase tracking-wide",
              style: { color: theme.title },
              children: "Adiciones"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm italic mt-1", style: { color: theme.subtitle }, children: "(Extras para tu michelada)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: adiciones.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuPriceRow, { label: a.name, price: a.price }, a.id)) })
      ]
    }
  );
}
function FlavorMenuCard({
  categoria,
  products
}) {
  const theme = flavorTheme(categoria.id);
  const isEspeciales = categoria.id === "especiales";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "article",
    {
      className: "rounded-2xl bg-white p-5 sm:p-6 shadow-xl",
      style: {
        border: `3px solid ${theme.border}`,
        boxShadow: `0 12px 32px ${theme.ring}`
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "text-center mb-5 pb-4 border-b border-dashed border-slate-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "h2",
            {
              className: "text-xl sm:text-2xl font-extrabold uppercase tracking-wide",
              style: { color: theme.title },
              children: categoria.name
            }
          ),
          categoria.description ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm italic mt-1", style: { color: theme.subtitle }, children: [
            "(",
            categoria.description,
            ")"
          ] }) : null
        ] }),
        isEspeciales ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: products.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: cn(
              "rounded-xl p-4 border-2",
              i === 0 ? "bg-amber-50 border-amber-400" : "bg-rose-50 border-rose-400"
            ),
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-extrabold uppercase text-slate-900", children: p.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-600 mt-1 leading-relaxed", children: p.description })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-black text-slate-900 tabular-nums shrink-0", children: formatMenuPrice(p.price) })
            ] })
          },
          p.id
        )) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: products.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          MenuPriceRow,
          {
            label: productBaseLabel(p.name, categoria.name),
            price: p.price
          },
          p.id
        )) })
      ]
    }
  );
}
function MichelandiaBackground() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pointer-events-none fixed inset-0 overflow-hidden", "aria-hidden": true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-[#5ec8f7] via-[#4db8eb] to-[#3aa8e0]" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-20 -left-16 h-56 w-56 rounded-full bg-lime-400/25 blur-2xl" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-10 -right-10 h-48 w-48 rounded-full bg-yellow-300/30 blur-2xl" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1/4 right-0 h-40 w-40 rounded-full bg-white/20 blur-xl" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-32 -left-20 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-[12%] left-[8%] h-3 w-3 rounded-full bg-white/50" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-[18%] right-[15%] h-2 w-2 rounded-full bg-white/40" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-[35%] left-[20%] h-2.5 w-2.5 rounded-full bg-white/35" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "absolute inset-0 opacity-[0.07]",
        style: {
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }
      }
    )
  ] });
}
function ClienteMenuView() {
  const [categorias, setCategorias] = reactExports.useState([]);
  const [adiciones, setAdiciones] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [selectedCategoriaId, setSelectedCategoriaId] = reactExports.useState(null);
  const categoriasActivas = reactExports.useMemo(
    () => categorias.filter((c) => c.productos.length > 0),
    [categorias]
  );
  const categoriaSeleccionada = categoriasActivas.find((c) => c.id === selectedCategoriaId);
  reactExports.useEffect(() => {
    fetchPublicMenu().then((menu) => {
      setCategorias(menu.categorias);
      setAdiciones(menu.adiciones);
    }).finally(() => setLoading(false));
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "min-h-screen relative text-slate-900",
      style: { fontFamily: '"Poppins", system-ui, sans-serif' },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MichelandiaBackground, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "relative px-4 pt-8 pb-6 sm:pt-12 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "h1",
            {
              className: "text-5xl sm:text-6xl md:text-7xl font-black leading-none select-none",
              style: {
                fontFamily: '"Pacifico", "Segoe Script", cursive',
                background: "linear-gradient(135deg, #ff6f00 0%, #43a047 45%, #1e88e5 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(3px 3px 0 #fff) drop-shadow(5px 5px 0 rgba(0,0,0,0.25))"
              },
              children: "Michelandia"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              className: "mt-3 text-lg sm:text-xl text-white",
              style: {
                fontFamily: '"Pacifico", "Segoe Script", cursive',
                textShadow: "1px 1px 0 rgba(0,0,0,0.35), 2px 2px 4px rgba(0,0,0,0.2)"
              },
              children: "Refresca tu mente y tu corazón"
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "relative max-w-3xl mx-auto px-4 pb-36 space-y-8", children: [
          loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center py-20 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-10 w-10 animate-spin text-white" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-white/90 font-medium", children: "Cargando menú…" })
          ] }) : selectedCategoriaId ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => setSelectedCategoriaId(null),
                className: "inline-flex items-center gap-2 text-sm font-bold text-white bg-black/20 hover:bg-black/30 rounded-full px-4 py-2 touch-manipulation transition-colors",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
                  "Ver todos los sabores"
                ]
              }
            ),
            selectedCategoriaId === ADICIONES_ID ? /* @__PURE__ */ jsxRuntimeExports.jsx(AdicionesMenuCard, { adiciones }) : categoriaSeleccionada ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              FlavorMenuCard,
              {
                categoria: categoriaSeleccionada,
                products: categoriaSeleccionada.productos
              }
            ) : null
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-xs font-bold uppercase tracking-[0.2em] text-white/90", children: "Elige tu sabor" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 sm:gap-4", children: [
              categoriasActivas.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                FlavorGridCard,
                {
                  categoria: cat,
                  onSelect: () => setSelectedCategoriaId(cat.id)
                },
                cat.id
              )),
              adiciones.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                AdicionesGridCard,
                {
                  adiciones,
                  onSelect: () => setSelectedCategoriaId(ADICIONES_ID)
                }
              )
            ] }),
            categoriasActivas.length === 0 && adiciones.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-white/80 py-12 font-medium", children: "Menú no disponible" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-[11px] text-white/70", children: "Precios en COP · Sujetos a disponibilidad" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "fixed bottom-0 left-0 right-0 z-20 bg-[#ffcc00] border-t-2 border-amber-500 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] pb-[env(safe-area-inset-bottom)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 font-extrabold text-slate-900 uppercase tracking-wide text-sm sm:text-base", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bike, { className: "h-6 w-6 shrink-0", strokeWidth: 2.5 }),
            "Domicilios"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "a",
            {
              href: `tel:${DOMICILIOS.replace(/-/g, "")}`,
              className: "flex items-center gap-2 font-black text-slate-900 text-lg sm:text-xl tabular-nums hover:opacity-80 transition-opacity",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4" }) }),
                DOMICILIOS
              ]
            }
          )
        ] }) })
      ]
    }
  );
}
const SplitComponent = ClienteMenuView;
export {
  SplitComponent as component
};
