import type { Fase } from "@/lib/fases";
import type { Addition, MicheladaType } from "@/lib/micheladas-store";
import { ADDITIONS, MICHELADAS } from "@/lib/micheladas-store";

export type MenuCategoria = {
  id: string;
  name: string;
  description?: string;
  activo?: boolean;
  productos: MicheladaType[];
};

export type MenuData = {
  categorias: MenuCategoria[];
  adiciones: Addition[];
  fases: Fase[];
};

const DEFAULT_PASOS = ["fase:topping", "notas"];

export function buildFallbackMenu(): MenuData {
  return {
    categorias: [
      {
        id: "micheladas",
        name: "Micheladas",
        description: "Nuestras micheladas preparadas al momento",
        productos: MICHELADAS.map((p) => ({
          ...p,
          categoriaId: "micheladas",
          pasos: p.pasos ?? DEFAULT_PASOS,
        })),
      },
    ],
    adiciones: ADDITIONS,
    fases: [],
  };
}

export const FALLBACK_MENU = buildFallbackMenu();

export function flattenProductos(categorias: MenuCategoria[]): MicheladaType[] {
  return categorias.flatMap((c) => c.productos);
}

export function normalizeMenuFromApi(data: {
  categorias?: MenuCategoria[];
  productos?: MicheladaType[];
  adiciones?: Addition[];
  fases?: Fase[];
}): MenuData {
  const fases = data.fases ?? FALLBACK_MENU.fases;
  if (data.categorias?.length) {
    return {
      categorias: data.categorias,
      adiciones: data.adiciones ?? FALLBACK_MENU.adiciones,
      fases,
    };
  }
  if (data.productos?.length) {
    return {
      categorias: [
        {
          id: "general",
          name: "Menú",
          productos: data.productos,
        },
      ],
      adiciones: data.adiciones ?? FALLBACK_MENU.adiciones,
      fases,
    };
  }
  return FALLBACK_MENU;
}
