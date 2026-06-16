"""Agrega cantidad por línea en comanda_items.
Ejecutar desde backend/:
  python -m scripts.migrate_item_cantidad
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import get_db


def column_exists(cursor, table: str, column: str) -> bool:
    cursor.execute(
        """
        SELECT COUNT(*) AS cnt
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = %s
          AND COLUMN_NAME = %s
        """,
        (table, column),
    )
    row = cursor.fetchone()
    return bool(row and row.get("cnt", 0) > 0)


def main() -> None:
    with get_db() as (_, cursor):
        if not column_exists(cursor, "comanda_items", "cantidad"):
            cursor.execute(
                """
                ALTER TABLE comanda_items
                  ADD COLUMN cantidad INT NOT NULL DEFAULT 1 AFTER precio_base
                """
            )
            print("Columna comanda_items.cantidad agregada.")
        else:
            print("Columna comanda_items.cantidad ya existe.")
    print("Migración lista.")


if __name__ == "__main__":
    main()
