import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { f as flavorTheme, a as formatMenuPrice } from "./michelandia-theme-DVmC1I5Y.mjs";
import { c as cn } from "./router-DZCtlrU8.mjs";
import { T as Toaster$1 } from "../_libs/sonner.mjs";
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
function MenuPriceRow({
  label,
  price,
  selected,
  onClick
}) {
  const inner = /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
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
  if (onClick) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick,
        className: cn(
          "w-full flex items-end gap-2 text-[15px] leading-snug rounded-xl px-3 py-3 touch-manipulation transition-colors",
          selected ? "bg-slate-900/5 ring-2 ring-slate-900/15" : "hover:bg-slate-50 active:scale-[0.99]"
        ),
        children: inner
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-end gap-2 text-[15px] leading-snug", children: inner });
}
function FlavorGridCard({
  themeId,
  title,
  subtitle,
  minPrice,
  selected,
  onSelect
}) {
  const theme = flavorTheme(themeId);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      onClick: onSelect,
      className: cn(
        "w-full text-left rounded-xl sm:rounded-2xl bg-white p-3 sm:p-5 shadow-lg",
        "transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98] touch-manipulation",
        selected && "ring-2 ring-offset-2 ring-slate-900/25"
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
            children: title
          }
        ),
        subtitle ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "p",
          {
            className: "text-[10px] sm:text-sm italic mt-1 leading-snug line-clamp-2",
            style: { color: theme.subtitle },
            children: [
              "(",
              subtitle,
              ")"
            ]
          }
        ) : null,
        minPrice != null && Number.isFinite(minPrice) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] sm:text-[11px] text-slate-500 mt-2 sm:mt-3 font-medium", children: [
          "Desde ",
          formatMenuPrice(minPrice)
        ] })
      ]
    }
  );
}
function ThemedPanel({
  themeId,
  children,
  className
}) {
  const theme = flavorTheme(themeId);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn("rounded-2xl bg-white shadow-xl overflow-hidden", className),
      style: {
        border: `3px solid ${theme.border}`,
        boxShadow: `0 12px 32px ${theme.ring}`
      },
      children
    }
  );
}
function ThemedPanelHeader({
  themeId,
  title,
  subtitle
}) {
  const theme = flavorTheme(themeId);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "text-center px-4 py-4 sm:px-6 sm:py-5 border-b border-dashed border-slate-200", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "h2",
      {
        className: "text-lg sm:text-xl font-extrabold uppercase tracking-wide",
        style: { color: theme.title },
        children: title
      }
    ),
    subtitle ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm italic mt-1", style: { color: theme.subtitle }, children: subtitle }) : null
  ] });
}
function MeseroStepHeader({
  stepLabel,
  title,
  description
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
    stepLabel ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-bold uppercase tracking-[0.2em] text-white/85", children: stepLabel }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-extrabold text-white tracking-tight", children: title }),
    description ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-white/85 leading-relaxed", children: description }) : null
  ] });
}
function MichelandiaFooterBar({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn(
        "fixed bottom-0 left-0 right-0 z-30",
        "bg-[#ffcc00] border-t-2 border-amber-500",
        "shadow-[0_-4px_20px_rgba(0,0,0,0.15)]",
        "px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      ),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-lg", children })
    }
  );
}
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
export {
  FlavorGridCard as F,
  MichelandiaBackground as M,
  Toaster as T,
  ThemedPanel as a,
  ThemedPanelHeader as b,
  MeseroStepHeader as c,
  MenuPriceRow as d,
  MichelandiaFooterBar as e
};
