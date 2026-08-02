import type { MicheladaType } from "@/lib/micheladas-store";
import {
  FASE_PASO_PREFIX,
  PASO_NOTAS,
  fasePasoId,
  isFasePaso,
  normalizeProductPasos,
  parseFaseIdFromPaso,
  type Fase,
  type FaseOpcion,
} from "@/lib/fases";

export type MeseroFlowStep =
  | "mesa"
  | "cliente"
  | "categoria"
  | "producto"
  | "adiciones"
  | "notas"
  | "item"
  | "carrito"
  | `${typeof FASE_PASO_PREFIX}${string}`;

export const MESERO_STEP_LABELS: Record<string, string> = {
  mesa: "Elegir mesa",
  cliente: "Cliente",
  categoria: "Categoría",
  producto: "Producto",
  adiciones: "Adiciones",
  notas: "Notas",
  item: "Confirmar ítem",
  carrito: "Enviar pedido",
};

export const CERVEZA_FASE_ID = "cerveza";

/** Variaciones si el menú aún no trae la fase configurada. */
export const FALLBACK_CERVEZA_OPCIONES: FaseOpcion[] = [
  { id: "tipo_coronita", name: "Coronita", faseId: CERVEZA_FASE_ID, stockKey: "coronita", cantidad: 1 },
  { id: "tipo_corona", name: "Corona", faseId: CERVEZA_FASE_ID, stockKey: "corona", cantidad: 1 },
  {
    id: "tipo_cerveza_latona",
    name: "Cerveza latona",
    faseId: CERVEZA_FASE_ID,
    stockKey: "cerveza_latona",
    cantidad: 1,
  },
  {
    id: "tipo_cerveza_personal",
    name: "Cerveza personal",
    faseId: CERVEZA_FASE_ID,
    stockKey: "cerveza_personal",
    cantidad: 1,
  },
  { id: "tipo_poker", name: "Poker", faseId: CERVEZA_FASE_ID, stockKey: "poker", cantidad: 1 },
  { id: "tipo_aguila", name: "Águila", faseId: CERVEZA_FASE_ID, stockKey: "aguila", cantidad: 1 },
  {
    id: "tipo_cerveza_light",
    name: "Light",
    faseId: CERVEZA_FASE_ID,
    stockKey: "cerveza_light",
    cantidad: 1,
  },
  {
    id: "tipo_budweiser",
    name: "Budweiser",
    faseId: CERVEZA_FASE_ID,
    stockKey: "budweiser",
    cantidad: 1,
  },
];

export function isCervezaProduct(producto: Pick<MicheladaType, "id"> | undefined): boolean {
  return !!producto?.id?.endsWith("_cerveza");
}

export function getMeseroStepLabel(step: string, fases: Fase[]): string {
  const faseId = parseFaseIdFromPaso(step);
  if (faseId === CERVEZA_FASE_ID) return "Tipo de cerveza";
  if (faseId) {
    return fases.find((f) => f.id === faseId)?.name ?? faseId;
  }
  return MESERO_STEP_LABELS[step] ?? step;
}

export function cervezaOpcionesForProduct(
  michelada: Pick<MicheladaType, "faseOpciones"> | undefined,
  fases: Fase[],
): FaseOpcion[] {
  const fromProduct = (michelada?.faseOpciones ?? []).filter((o) => o.faseId === CERVEZA_FASE_ID);
  if (fromProduct.length > 0) return fromProduct;
  const fromCatalog = fases.find((f) => f.id === CERVEZA_FASE_ID)?.opciones ?? [];
  if (fromCatalog.length > 0) return fromCatalog;
  return FALLBACK_CERVEZA_OPCIONES;
}

function ensureCervezaPaso(configured: string[], michelada?: Pick<MicheladaType, "id">): string[] {
  if (!isCervezaProduct(michelada)) return configured;
  if (configured.includes(fasePasoId(CERVEZA_FASE_ID))) return configured;
  const out = [...configured];
  const notasIdx = out.indexOf(PASO_NOTAS);
  if (notasIdx >= 0) out.splice(notasIdx, 0, fasePasoId(CERVEZA_FASE_ID));
  else out.push(fasePasoId(CERVEZA_FASE_ID));
  return out;
}

export function buildMeseroSteps(
  pasos: string[] | undefined,
  michelada?: Pick<MicheladaType, "id" | "faseOpciones">,
  faseIds?: string[],
): MeseroFlowStep[] {
  const ids = faseIds ?? [];
  // Incluir "cerveza" aunque el catálogo cacheado aún no la traiga.
  const idsWithCerveza =
    isCervezaProduct(michelada) && !ids.includes(CERVEZA_FASE_ID)
      ? [...ids, CERVEZA_FASE_ID]
      : ids;
  const configured = ensureCervezaPaso(
    normalizeProductPasos(pasos, idsWithCerveza),
    michelada,
  );
  const flow: MeseroFlowStep[] = ["mesa", "cliente", "categoria", "producto"];

  for (const p of configured) {
    if (p === PASO_NOTAS) {
      flow.push("notas");
      continue;
    }
    if (isFasePaso(p)) {
      const faseId = parseFaseIdFromPaso(p)!;
      const count = michelada?.faseOpciones.filter((o) => o.faseId === faseId).length ?? 0;
      const forceCerveza =
        faseId === CERVEZA_FASE_ID && isCervezaProduct(michelada);
      if (count > 0 || forceCerveza) flow.push(fasePasoId(faseId) as MeseroFlowStep);
    }
  }

  flow.push("adiciones", "carrito");
  return flow;
}

/** Flujo en lote: fases del producto actual (si aplica) + adiciones + notas → carrito. */
export function buildBatchMeseroSteps(
  michelada: Pick<MicheladaType, "id" | "pasos" | "faseOpciones"> | undefined,
  faseIds?: string[],
): MeseroFlowStep[] {
  const flow: MeseroFlowStep[] = ["mesa", "cliente", "categoria", "producto"];
  if (michelada) {
    const full = buildMeseroSteps(michelada.pasos, michelada, faseIds);
    for (const s of full) {
      if (isFasePaso(s)) flow.push(s);
    }
  }
  flow.push("adiciones", "notas", "carrito");
  return flow;
}

export function productHasFaseSteps(
  michelada: Pick<MicheladaType, "id" | "pasos" | "faseOpciones">,
  faseIds?: string[],
): boolean {
  return buildMeseroSteps(michelada.pasos, michelada, faseIds).some(isFasePaso);
}
