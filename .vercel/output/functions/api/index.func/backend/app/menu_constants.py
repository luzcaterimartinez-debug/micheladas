import json
import re
from typing import Any

PASO_NOTAS = "notas"
LEGACY_PASO_TOPPINGS = "toppings"
FASE_PASO_PREFIX = "fase:"


def slugify(text: str) -> str:
    s = text.lower().strip()
    s = re.sub(r"[^a-z0-9]+", "_", s)
    return s.strip("_")[:50] or "producto"


def fase_paso_id(fase_id: str) -> str:
    return f"{FASE_PASO_PREFIX}{fase_id}"


def parse_fase_id_from_paso(paso: str) -> str | None:
    if paso.startswith(FASE_PASO_PREFIX):
        return paso[len(FASE_PASO_PREFIX) :]
    if paso == LEGACY_PASO_TOPPINGS:
        return "topping"
    return None


def default_pasos_for_fases(fase_ids: list[str]) -> list[str]:
    pasos = [fase_paso_id(fid) for fid in fase_ids]
    pasos.append(PASO_NOTAS)
    return pasos


def parse_pasos(raw: Any, fase_ids_activos: list[str] | None = None) -> list[str]:
    if raw is None:
        fids = fase_ids_activos or ["topping"]
        return default_pasos_for_fases(fids)
    if isinstance(raw, str):
        try:
            raw = json.loads(raw)
        except json.JSONDecodeError:
            raw = None
    if not isinstance(raw, list):
        fids = fase_ids_activos or ["topping"]
        return default_pasos_for_fases(fids)

    valid_fases = set(fase_ids_activos or [])
    out: list[str] = []
    for p in raw:
        if not isinstance(p, str):
            continue
        if p == PASO_NOTAS:
            out.append(PASO_NOTAS)
        elif p == LEGACY_PASO_TOPPINGS:
            out.append(fase_paso_id("topping"))
        elif p.startswith(FASE_PASO_PREFIX):
            fid = parse_fase_id_from_paso(p)
            if fid and (not valid_fases or fid in valid_fases):
                out.append(fase_paso_id(fid))

    if not out:
        fids = fase_ids_activos or ["topping"]
        return default_pasos_for_fases(fids)
    if PASO_NOTAS not in out:
        out.append(PASO_NOTAS)
    return out


def pasos_to_json(pasos: list[str]) -> str:
    cleaned: list[str] = []
    for p in pasos:
        if p == PASO_NOTAS and PASO_NOTAS not in cleaned:
            cleaned.append(PASO_NOTAS)
        elif p.startswith(FASE_PASO_PREFIX) and p not in cleaned:
            cleaned.append(p)
        elif p == LEGACY_PASO_TOPPINGS:
            legacy = fase_paso_id("topping")
            if legacy not in cleaned:
                cleaned.append(legacy)
    if not cleaned:
        cleaned = default_pasos_for_fases(["topping"])
    return json.dumps(cleaned)
