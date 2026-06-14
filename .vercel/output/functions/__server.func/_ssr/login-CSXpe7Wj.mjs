import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { M as MichelandiaBackground, T as Toaster, a as ThemedPanel, b as ThemedPanelHeader } from "./sonner-D7NcLsQE.mjs";
import { B as Button } from "./button-BNhi5K8I.mjs";
import { L as Label, I as Input } from "./label-BkiSsbJx.mjs";
import { c as cn, l as login, h as homePathForRole } from "./router-BGt08YE6.mjs";
import { L as LoaderCircle } from "../_libs/lucide-react.mjs";
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
import "./michelandia-theme-DVmC1I5Y.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tailwind-merge.mjs";
function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const session = await login(email.trim(), password);
      toast.success("Bienvenido");
      await navigate({
        to: homePathForRole(session.user.rol)
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen min-h-[100dvh] relative text-slate-900", style: {
    fontFamily: '"Poppins", system-ui, sans-serif'
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MichelandiaBackground, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { position: "top-center", richColors: true }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 min-h-screen min-h-[100dvh] flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "px-4 pt-10 pb-4 sm:pt-14 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl sm:text-5xl font-black leading-none select-none", style: {
          fontFamily: '"Pacifico", "Segoe Script", cursive',
          background: "linear-gradient(135deg, #ff6f00 0%, #43a047 45%, #1e88e5 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          filter: "drop-shadow(3px 3px 0 #fff) drop-shadow(5px 5px 0 rgba(0,0,0,0.25))"
        }, children: "Michelandia" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-base sm:text-lg text-white", style: {
          fontFamily: '"Pacifico", "Segoe Script", cursive',
          textShadow: "1px 1px 0 rgba(0,0,0,0.35), 2px 2px 4px rgba(0,0,0,0.2)"
        }, children: "Refresca tu mente y tu corazón" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-xs font-bold uppercase tracking-[0.2em] text-white/85", children: "Acceso personal" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 flex flex-col items-center justify-center px-4 pb-28", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ThemedPanel, { themeId: "tradicional", className: "w-full max-w-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ThemedPanelHeader, { themeId: "tradicional", title: "Iniciar sesión", subtitle: "Cuenta de trabajo del negocio" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-5 sm:px-6 sm:py-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", className: "text-sm font-bold text-slate-800", children: "Correo" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "email", type: "email", autoComplete: "username", placeholder: "mesero@micheladas.local", value: email, onChange: (e) => setEmail(e.target.value), required: true, disabled: loading, className: cn("h-12 rounded-xl border-slate-300 bg-white text-base", "focus-visible:ring-2 focus-visible:ring-[#1e88e5]/30") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", className: "text-sm font-bold text-slate-800", children: "Contraseña" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "password", type: "password", autoComplete: "current-password", value: password, onChange: (e) => setPassword(e.target.value), required: true, disabled: loading, className: cn("h-12 rounded-xl border-slate-300 bg-white text-base", "focus-visible:ring-2 focus-visible:ring-[#1e88e5]/30") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: cn("w-full h-12 rounded-xl text-base font-bold", "bg-slate-900 hover:bg-slate-800 text-white", "touch-manipulation active:scale-[0.98]"), disabled: loading, children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
              "Entrando…"
            ] }) : "Iniciar sesión" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 text-center text-xs text-slate-500 leading-relaxed" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "fixed bottom-0 left-0 right-0 z-20 bg-[#ffcc00] border-t-2 border-amber-500 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] pb-[env(safe-area-inset-bottom)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-md mx-auto px-4 py-3 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/carta", className: "text-sm font-extrabold text-slate-900 uppercase tracking-wide hover:opacity-80 transition-opacity", children: "Ver carta para clientes →" }) }) })
    ] })
  ] });
}
export {
  LoginPage as component
};
