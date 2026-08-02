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

export function getFallbackMenu(): MenuData {
  return buildFallbackMenu();
}

export function flattenProductos(categorias: MenuCategoria[]): MicheladaType[] {
  return categorias.flatMap((c) => c.productos);
}

export function normalizeMenuFromApi(data: {
  categorias?: MenuCategoria[];
  productos?: MicheladaType[];
  adiciones?: Addition[];
  fases?: Fase[];
}): MenuData {
  const fallback = getFallbackMenu();
  const fases = data.fases ?? fallback.fases;
  const adiciones = mergeAdiciones(data.adiciones ?? [], fallback.adiciones);
  if (data.categorias?.length) {
    return {
      categorias: data.categorias,
      adiciones,
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
      adiciones,
      fases,
    };
  }
  return { ...fallback, adiciones: mergeAdiciones(fallback.adiciones, fallback.adiciones) };
}

/** Asegura Sal, Trululu y demás del fallback aunque el caché/API vengan incompletos. */
function mergeAdiciones(fromApi: Addition[], fallback: Addition[]): Addition[] {
  const byId = new Map(fromApi.map((a) => [a.id, a]));
  for (const a of fallback) {
    if (!byId.has(a.id)) byId.set(a.id, a);
  }
  // Preferir orden del fallback + extras del API.
  const ordered: Addition[] = [];
  const seen = new Set<string>();
  for (const a of fallback) {
    const hit = byId.get(a.id);
    if (hit) {
      ordered.push(hit);
      seen.add(a.id);
    }
  }
  for (const a of fromApi) {
    if (!seen.has(a.id)) ordered.push(a);
  }
  return ordered.length > 0 ? ordered : fallback;
}
