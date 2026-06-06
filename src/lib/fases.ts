export type FaseOpcion = {
  id: string;
  name: string;
  faseId: string;
  faseName?: string;
  /** Clave en inventario que se descuenta al elegir esta opción. */
  stockKey?: string;
  cantidad?: number;
};

export type ConsumoLine = {
  clave: string;
  cantidad: number;
};

export type Fase = {
  id: string;
  name: string;
  description?: string;
  activo?: boolean;
  opciones: FaseOpcion[];
};

export const FASE_PASO_PREFIX = "fase:";
export const PASO_NOTAS = "notas";
export const LEGACY_PASO_TOPPINGS = "toppings";

export function fasePasoId(faseId: string): string {
  return `${FASE_PASO_PREFIX}${faseId}`;
}

export function parseFaseIdFromPaso(paso: string): string | null {
  if (paso.startsWith(FASE_PASO_PREFIX)) return paso.slice(FASE_PASO_PREFIX.length);
  if (paso === LEGACY_PASO_TOPPINGS) return "topping";
  return null;
}

export function isFasePaso(paso: string): boolean {
  return parseFaseIdFromPaso(paso) !== null;
}

export function normalizeProductPasos(pasos: string[] | undefined, faseIds: string[]): string[] {
  if (!pasos?.length) {
    const ids = faseIds.length ? faseIds : ["topping"];
    return [...ids.map(fasePasoId), PASO_NOTAS];
  }
  const valid = new Set(faseIds);
  const out: string[] = [];
  for (const p of pasos) {
    if (p === PASO_NOTAS) out.push(PASO_NOTAS);
    else if (p === LEGACY_PASO_TOPPINGS) out.push(fasePasoId("topping"));
    else if (p.startsWith(FASE_PASO_PREFIX)) {
      const fid = parseFaseIdFromPaso(p);
      if (fid && (!valid.size || valid.has(fid))) out.push(fasePasoId(fid));
    }
  }
  if (!out.some((x) => x.startsWith(FASE_PASO_PREFIX))) {
    const ids = faseIds.length ? faseIds : ["topping"];
    out.unshift(...ids.map(fasePasoId));
  }
  if (!out.includes(PASO_NOTAS)) out.push(PASO_NOTAS);
  return out;
}

export function opcionesForFase(
  producto: { faseOpciones: FaseOpcion[] },
  faseId: string,
): FaseOpcion[] {
  return producto.faseOpciones.filter((o) => o.faseId === faseId);
}

export function faseOpcionNames(
  micheladaId: string,
  opcionIds: string[],
  productos: { id: string; faseOpciones: FaseOpcion[] }[],
): string[] {
  const m = productos.find((x) => x.id === micheladaId);
  return opcionIds
    .map((id) => m?.faseOpciones.find((o) => o.id === id)?.name)
    .filter(Boolean) as string[];
}
