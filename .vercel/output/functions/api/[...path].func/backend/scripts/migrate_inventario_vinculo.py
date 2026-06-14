"""
Vincula fases/opciones con inventario (inventario_clave, cantidad).
Ejecutar desde backend/:
  python -m scripts.migrate_inventario_vinculo
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
              AND TABLE_NAME = 'menu_fase_opciones'
              AND COLUMN_NAME = 'inventario_clave'
            """
        )
        if cursor.fetchone()["c"] == 0:
            cursor.execute(
                """
                ALTER TABLE menu_fase_opciones
                  ADD COLUMN inventario_clave VARCHAR(50) NULL AFTER nombre,
                  ADD COLUMN cantidad DECIMAL(10, 3) NOT NULL DEFAULT 1 AFTER inventario_clave
                """
            )
            print("Columnas inventario_clave y cantidad agregadas a menu_fase_opciones.")

        cursor.execute("SELECT clave FROM inventario")
        inv_keys = {r["clave"] for r in cursor.fetchall()}

        cursor.execute("SELECT id FROM menu_fase_opciones")
        for row in cursor.fetchall():
            oid = row["id"]
            if oid in inv_keys:
                cursor.execute(
                    """
                    UPDATE menu_fase_opciones
                    SET inventario_clave = %s, cantidad = 1
                    WHERE id = %s AND (inventario_clave IS NULL OR inventario_clave = '')
                    """,
                    (oid, oid),
                )

    print("Vinculo inventario-fases listo.")


if __name__ == "__main__":
    main()
