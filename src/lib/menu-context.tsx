import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { fetchMenu } from "@/lib/menu-api";
import { getCachedMenu } from "@/lib/offline/local-cache";
import {
  getFallbackMenu,
  flattenProductos,
  type MenuCategoria,
  type MenuData,
} from "@/lib/menu-utils";
import type { Fase, FaseOpcion } from "@/lib/fases";
import type { Addition, MicheladaType } from "@/lib/micheladas-store";

type MenuContextValue = {
  categorias: MenuCategoria[];
  productos: MicheladaType[];
  adiciones: Addition[];
  fases: Fase[];
  faseOpciones: FaseOpcion[];
  loading: boolean;
  refetch: () => Promise<void>;
  getProducto: (id: string) => MicheladaType | undefined;
};

const MenuContext = createContext<MenuContextValue | null>(null);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState<MenuData>(() => getCachedMenu(getFallbackMenu()));
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      setMenu(await fetchMenu());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const productos = useMemo(() => flattenProductos(menu.categorias), [menu.categorias]);
  const faseOpciones = useMemo(
    () => menu.fases.flatMap((f) => f.opciones),
    [menu.fases],
  );

  const value = useMemo<MenuContextValue>(
    () => ({
      categorias: menu.categorias,
      productos,
      adiciones: menu.adiciones,
      fases: menu.fases,
      faseOpciones,
      loading,
      refetch,
      getProducto: (id) => productos.find((p) => p.id === id),
    }),
    [menu, productos, faseOpciones, loading, refetch],
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) {
    const fallback = getFallbackMenu();
    const productos = flattenProductos(fallback.categorias);
    return {
      categorias: fallback.categorias,
      productos,
      adiciones: fallback.adiciones,
      fases: fallback.fases,
      faseOpciones: fallback.fases.flatMap((f) => f.opciones),
      loading: false,
      refetch: async () => {},
      getProducto: (id: string) => productos.find((p) => p.id === id),
    };
  }
  return ctx;
}
