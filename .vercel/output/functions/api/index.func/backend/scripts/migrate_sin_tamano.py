"""
Quita el paso 'tamano' del menú y permite tamano NULL en comanda_items.
Ejecutar desde backend/:
  python -m scripts.migrate_sin_tamano
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import get_db
from app.menu_constants import PASOS_DEFAULT, parse_pasos, pasos_to_json

PASOS_SIN_TAMANO = [p for p in PASOS_DEFAULT if p != "tamano"]


def main() -> None:
    with get_db() as (_, cursor):
        cursor.execute(
            """
            SELECT COLUMN_TYPE FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'comanda_items'
              AND COLUMN_NAME = 'tamano'
            """
        )
        row = cursor.fetchone()
        if row and "enum" in str(row.get("COLUMN_TYPE", "")).lower():
            cursor.execute(
                "ALTER TABLE comanda_items MODIFY tamano VARCHAR(50) NULL DEFAULT NULL"
            )
            print("comanda_items.tamano -> VARCHAR(50) NULL")

        cursor.execute("SELECT id, pasos FROM menu_productos")
        for pid, raw in cursor.fetchall():
            pasos = parse_pasos(raw)
            cleaned = [p for p in pasos if p != "tamano"]
            if not cleaned:
                cleaned = list(PASOS_SIN_TAMANO)
            cursor.execute(
                "UPDATE menu_productos SET pasos = %s WHERE id = %s",
                (pasos_to_json(cleaned), pid),
            )
        print(f"Pasos actualizados en productos (sin tamano). Default: {PASOS_SIN_TAMANO}")


if __name__ == "__main__":
    main()
