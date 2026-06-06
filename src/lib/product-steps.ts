import type { MicheladaType } from "@/lib/micheladas-store";
import {
  FASE_PASO_PREFIX,
  PASO_NOTAS,
  fasePasoId,
  isFasePaso,
  normalizeProductPasos,
  parseFaseIdFromPaso,
  type Fase,
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

export function getMeseroStepLabel(step: string, fases: Fase[]): string {
  const faseId = parseFaseIdFromPaso(step);
  if (faseId) {
    return fases.find((f) => f.id === faseId)?.name ?? faseId;
  }
  return MESERO_STEP_LABELS[step] ?? step;
}

export function buildMeseroSteps(
  pasos: string[] | undefined,
  michelada?: Pick<MicheladaType, "faseOpciones">,
  faseIds?: string[],
): MeseroFlowStep[] {
  const ids = faseIds ?? [];
  const configured = normalizeProductPasos(pasos, ids);
  const flow: MeseroFlowStep[] = ["mesa", "cliente", "categoria", "producto"];

  for (const p of configured) {
    if (p === PASO_NOTAS) {
      flow.push("notas");
      continue;
    }
    if (isFasePaso(p)) {
      const faseId = parseFaseIdFromPaso(p)!;
      const count = michelada?.faseOpciones.filter((o) => o.faseId === faseId).length ?? 0;
      if (count > 0) flow.push(fasePasoId(faseId) as MeseroFlowStep);
    }
  }

  flow.push("adiciones", "item", "carrito");
  return flow;
}
