"""
Agrega porción de inventario a adiciones (cantidad a descontar por venta).
Ejecutar desde backend/:
  python -m scripts.migrate_adiciones_porcion
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import get_db


def main() -> None:
    with get_db() as (_, cursor):
        cursor.execute(
            """
            SELECT COUNT(*) AS c FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'menu_adiciones'
              AND COLUMN_NAME = 'cantidad'
            """
        )
        if cursor.fetchone()["c"] == 0:
            cursor.execute(
                """
                ALTER TABLE menu_adiciones
                  ADD COLUMN cantidad DECIMAL(10, 3) NOT NULL DEFAULT 1 AFTER stock_key
                """
            )
            print("Columna cantidad agregada a menu_adiciones.")
        cursor.execute(
            "UPDATE menu_adiciones SET cantidad = 1 WHERE cantidad IS NULL OR cantidad <= 0"
        )
    print("Adiciones: porciones de inventario listas.")


if __name__ == "__main__":
    main()
