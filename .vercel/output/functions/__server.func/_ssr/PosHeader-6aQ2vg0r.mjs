import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { B as Button } from "./button-CHqgX7FO.mjs";
import { c as cn } from "./router-Cug9C9eT.mjs";
import { h as Beer, b as LogOut } from "../_libs/lucide-react.mjs";
function PosHeader({
  brand = "Micheladas",
  title,
  userName,
  roleLabel,
  badge,
  onLogout,
  className,
  containerClassName = "max-w-lg md:max-w-7xl",
  variant = "default"
}) {
  const isMichelandia = variant === "michelandia";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "header",
    {
      className: cn(
        "sticky top-0 z-30",
        "pt-[env(safe-area-inset-top,0px)]",
        isMichelandia ? "border-b border-white/25 bg-white/10 backdrop-blur-md" : "border-b border-border/50 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75",
        className
      ),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: cn(
            "mx-auto flex h-[3.25rem] sm:h-14 w-full items-center justify-between gap-3 px-4",
            containerClassName
          ),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-3 min-w-0", children: isMichelandia ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 leading-tight", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                {
                  className: "text-2xl sm:text-3xl font-black leading-none truncate",
                  style: {
                    fontFamily: '"Pacifico", "Segoe Script", cursive',
                    background: "linear-gradient(135deg, #ff6f00 0%, #43a047 45%, #1e88e5 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(1px 1px 0 #fff)"
                  },
                  children: brand
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xs sm:text-sm font-bold text-white/90 truncate mt-0.5", children: title })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "h-9 w-9 shrink-0 rounded-lg bg-foreground text-background grid place-items-center",
                  "aria-hidden": true,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Beer, { className: "h-4 w-4", strokeWidth: 2.25 })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 leading-tight", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground", children: brand }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-[15px] sm:text-base font-semibold tracking-tight truncate", children: title })
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 sm:gap-2 shrink-0", children: [
              badge,
              (userName || roleLabel) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden sm:block text-right max-w-[9rem] mr-0.5", children: [
                userName && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "p",
                  {
                    className: cn(
                      "text-sm font-medium truncate leading-none",
                      isMichelandia && "text-white"
                    ),
                    children: userName
                  }
                ),
                roleLabel && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "p",
                  {
                    className: cn(
                      "text-[11px] mt-1 truncate",
                      isMichelandia ? "text-white/75" : "text-muted-foreground"
                    ),
                    children: roleLabel
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  variant: "ghost",
                  size: "icon",
                  className: cn(
                    "h-9 w-9 shrink-0",
                    isMichelandia ? "text-white/90 hover:text-white hover:bg-white/15" : "text-muted-foreground hover:text-foreground"
                  ),
                  onClick: onLogout,
                  "aria-label": "Cerrar sesión",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-[1.125rem] w-[1.125rem]" })
                }
              )
            ] })
          ]
        }
      )
    }
  );
}
export {
  PosHeader as P
};
