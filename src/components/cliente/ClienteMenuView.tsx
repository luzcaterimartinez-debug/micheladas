import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, Phone, Bike } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { fetchPublicMenu } from "@/lib/public-menu-api";
import {
  flavorTheme,
  formatMenuPrice,
  productBaseLabel,
} from "@/lib/michelandia-theme";
import type { MenuCategoria } from "@/lib/menu-utils";
import type { Addition, MicheladaType } from "@/lib/micheladas-store";
import { cn } from "@/lib/utils";

const DOMICILIOS = "323-373-5453";
const ADICIONES_ID = "__adiciones__";

function MenuPriceRow({ label, price }: { label: string; price: number }) {
  return (
    <div className="flex items-end gap-2 text-[15px] leading-snug">
      <span className="font-semibold text-slate-800 shrink-0">{label}</span>
      <span
        className="flex-1 border-b-2 border-dotted border-slate-400/70 mb-1 min-w-[1rem]"
        aria-hidden
      />
      <span className="font-extrabold text-slate-900 tabular-nums shrink-0">
        {formatMenuPrice(price)}
      </span>
    </div>
  );
}

function FlavorGridCard({
  categoria,
  onSelect,
}: {
  categoria: MenuCategoria;
  onSelect: () => void;
}) {
  const theme = flavorTheme(categoria.id);
  const minPrice = Math.min(...categoria.productos.map((p) => p.price), Infinity);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left rounded-xl sm:rounded-2xl bg-white p-3 sm:p-5 shadow-lg",
        "transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98] touch-manipulation",
      )}
      style={{
        border: `3px solid ${theme.border}`,
        boxShadow: `0 8px 24px ${theme.ring}`,
      }}
    >
      <h2
        className="text-xs sm:text-lg font-extrabold uppercase tracking-wide leading-tight"
        style={{ color: theme.title }}
      >
        {categoria.name}
      </h2>
      {categoria.description ? (
        <p
          className="text-[10px] sm:text-sm italic mt-1 leading-snug line-clamp-2"
          style={{ color: theme.subtitle }}
        >
          ({categoria.description})
        </p>
      ) : null}
      {Number.isFinite(minPrice) && (
        <p className="text-[10px] sm:text-[11px] text-slate-500 mt-2 sm:mt-3 font-medium">
          Desde {formatMenuPrice(minPrice)}
        </p>
      )}
    </button>
  );
}

function AdicionesGridCard({
  adiciones,
  onSelect,
}: {
  adiciones: Addition[];
  onSelect: () => void;
}) {
  const theme = flavorTheme("adiciones");
  const minPrice = Math.min(...adiciones.map((a) => a.price), Infinity);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left rounded-xl sm:rounded-2xl bg-white p-3 sm:p-5 shadow-lg",
        "transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98] touch-manipulation",
      )}
      style={{
        border: `3px solid ${theme.border}`,
        boxShadow: `0 8px 24px ${theme.ring}`,
      }}
    >
      <h2
        className="text-xs sm:text-lg font-extrabold uppercase tracking-wide leading-tight"
        style={{ color: theme.title }}
      >
        Adiciones
      </h2>
      <p
        className="text-[10px] sm:text-sm italic mt-1 leading-snug"
        style={{ color: theme.subtitle }}
      >
        (Extras para tu michelada)
      </p>
      {Number.isFinite(minPrice) && (
        <p className="text-[10px] sm:text-[11px] text-slate-500 mt-2 sm:mt-3 font-medium">
          Desde {formatMenuPrice(minPrice)}
        </p>
      )}
    </button>
  );
}

function AdicionesMenuCard({ adiciones }: { adiciones: Addition[] }) {
  const theme = flavorTheme("adiciones");

  return (
    <article
      className="rounded-2xl bg-white p-5 sm:p-6 shadow-xl"
      style={{
        border: `3px solid ${theme.border}`,
        boxShadow: `0 12px 32px ${theme.ring}`,
      }}
    >
      <header className="text-center mb-5 pb-4 border-b border-dashed border-slate-200">
        <h2
          className="text-xl sm:text-2xl font-extrabold uppercase tracking-wide"
          style={{ color: theme.title }}
        >
          Adiciones
        </h2>
        <p className="text-sm italic mt-1" style={{ color: theme.subtitle }}>
          (Extras para tu michelada)
        </p>
      </header>
      <div className="space-y-3">
        {adiciones.map((a) => (
          <MenuPriceRow key={a.id} label={a.name} price={a.price} />
        ))}
      </div>
    </article>
  );
}

function FlavorMenuCard({
  categoria,
  products,
}: {
  categoria: MenuCategoria;
  products: MicheladaType[];
}) {
  const theme = flavorTheme(categoria.id);
  const isEspeciales = categoria.id === "especiales";

  return (
    <article
      className="rounded-2xl bg-white p-5 sm:p-6 shadow-xl"
      style={{
        border: `3px solid ${theme.border}`,
        boxShadow: `0 12px 32px ${theme.ring}`,
      }}
    >
      <header className="text-center mb-5 pb-4 border-b border-dashed border-slate-200">
        <h2
          className="text-xl sm:text-2xl font-extrabold uppercase tracking-wide"
          style={{ color: theme.title }}
        >
          {categoria.name}
        </h2>
        {categoria.description ? (
          <p className="text-sm italic mt-1" style={{ color: theme.subtitle }}>
            ({categoria.description})
          </p>
        ) : null}
      </header>

      {isEspeciales ? (
        <div className="space-y-4">
          {products.map((p, i) => (
            <div
              key={p.id}
              className={cn(
                "rounded-xl p-4 border-2",
                i === 0 ? "bg-amber-50 border-amber-400" : "bg-rose-50 border-rose-400",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-extrabold uppercase text-slate-900">{p.name}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{p.description}</p>
                </div>
                <p className="text-lg font-black text-slate-900 tabular-nums shrink-0">
                  {formatMenuPrice(p.price)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <MenuPriceRow
              key={p.id}
              label={productBaseLabel(p.name, categoria.name)}
              price={p.price}
            />
          ))}
        </div>
      )}
    </article>
  );
}

function MichelandiaBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-b from-[#5ec8f7] via-[#4db8eb] to-[#3aa8e0]" />
      <div className="absolute -top-20 -left-16 h-56 w-56 rounded-full bg-lime-400/25 blur-2xl" />
      <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-yellow-300/30 blur-2xl" />
      <div className="absolute top-1/4 right-0 h-40 w-40 rounded-full bg-white/20 blur-xl" />
      <div className="absolute bottom-32 -left-20 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
      {/* gotas / splash */}
      <div className="absolute top-[12%] left-[8%] h-3 w-3 rounded-full bg-white/50" />
      <div className="absolute top-[18%] right-[15%] h-2 w-2 rounded-full bg-white/40" />
      <div className="absolute top-[35%] left-[20%] h-2.5 w-2.5 rounded-full bg-white/35" />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}

export function ClienteMenuView() {
  const [categorias, setCategorias] = useState<MenuCategoria[]>([]);
  const [adiciones, setAdiciones] = useState<Addition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<string | null>(null);

  const categoriasActivas = useMemo(
    () => categorias.filter((c) => c.productos.length > 0),
    [categorias],
  );

  const categoriaSeleccionada = categoriasActivas.find((c) => c.id === selectedCategoriaId);

  useEffect(() => {
    fetchPublicMenu()
      .then((menu) => {
        setCategorias(menu.categorias);
        setAdiciones(menu.adiciones);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      className="min-h-screen relative text-slate-900"
      style={{ fontFamily: '"Poppins", system-ui, sans-serif' }}
    >
      <MichelandiaBackground />

      {/* Hero */}
      <header className="relative px-4 pt-8 pb-6 sm:pt-12 text-center">
        <div className="max-w-3xl mx-auto">
          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-black leading-none select-none"
            style={{
              fontFamily: '"Pacifico", "Segoe Script", cursive',
              background: "linear-gradient(135deg, #ff6f00 0%, #43a047 45%, #1e88e5 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(3px 3px 0 #fff) drop-shadow(5px 5px 0 rgba(0,0,0,0.25))",
            }}
          >
            Michelandia
          </h1>
          <p
            className="mt-3 text-lg sm:text-xl text-white"
            style={{
              fontFamily: '"Pacifico", "Segoe Script", cursive',
              textShadow: "1px 1px 0 rgba(0,0,0,0.35), 2px 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            Refresca tu mente y tu corazón
          </p>
        </div>
      </header>

      <main className="relative max-w-3xl mx-auto px-4 pb-36 space-y-8">
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-white" />
            <p className="text-sm text-white/90 font-medium">Cargando menú…</p>
          </div>
        ) : selectedCategoriaId ? (
          <div className="space-y-5">
            <button
              type="button"
              onClick={() => setSelectedCategoriaId(null)}
              className="inline-flex items-center gap-2 text-sm font-bold text-white bg-black/20 hover:bg-black/30 rounded-full px-4 py-2 touch-manipulation transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Ver todos los sabores
            </button>
            {selectedCategoriaId === ADICIONES_ID ? (
              <AdicionesMenuCard adiciones={adiciones} />
            ) : categoriaSeleccionada ? (
              <FlavorMenuCard
                categoria={categoriaSeleccionada}
                products={categoriaSeleccionada.productos}
              />
            ) : null}
          </div>
        ) : (
          <>
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-white/90">
              Elige tu sabor
            </p>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {categoriasActivas.map((cat) => (
                <FlavorGridCard
                  key={cat.id}
                  categoria={cat}
                  onSelect={() => setSelectedCategoriaId(cat.id)}
                />
              ))}
              {adiciones.length > 0 && (
                <AdicionesGridCard
                  adiciones={adiciones}
                  onSelect={() => setSelectedCategoriaId(ADICIONES_ID)}
                />
              )}
            </div>
            {categoriasActivas.length === 0 && adiciones.length === 0 && (
              <p className="text-center text-white/80 py-12 font-medium">Menú no disponible</p>
            )}
          </>
        )}

        <p className="text-center text-[11px] text-white/70">
          Precios en COP · Sujetos a disponibilidad
        </p>
        
      </main>

      {/* Footer domicilios — estilo carta física */}
      <footer className="fixed bottom-0 left-0 right-0 z-20 bg-[#ffcc00] border-t-2 border-amber-500 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-3xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-extrabold text-slate-900 uppercase tracking-wide text-sm sm:text-base">
            <Bike className="h-6 w-6 shrink-0" strokeWidth={2.5} />
            Domicilios
          </div>
          <a
            href={`tel:${DOMICILIOS.replace(/-/g, "")}`}
            className="flex items-center gap-2 font-black text-slate-900 text-lg sm:text-xl tabular-nums hover:opacity-80 transition-opacity"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white shrink-0">
              <Phone className="h-4 w-4" />
            </span>
            {DOMICILIOS}
          </a>
        </div>
      </footer>
    </div>
  );
}
