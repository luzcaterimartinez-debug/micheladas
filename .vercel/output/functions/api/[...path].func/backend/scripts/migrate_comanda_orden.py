"""
Orden de cola diario en comandas (turno para barra e impresión).
Ejecutar desde backend/:
  python -m scripts.migrate_comanda_orden
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import get_db


def main() -> None:
    with get_db() as (conn, cursor):
        cursor.execute(
            """
            SELECT COUNT(*) AS c FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'comandas'
              AND COLUMN_NAME = 'orden_cola'
            """
        )
        if cursor.fetchone()["c"] == 0:
            cursor.execute(
                """
                ALTER TABLE comandas
                  ADD COLUMN orden_cola INT UNSIGNED NOT NULL DEFAULT 1
                    AFTER folio,
                  ADD INDEX idx_comandas_orden_dia (creado_en, orden_cola)
                """
            )
            print("Columna orden_cola agregada a comandas.")

        cursor.execute(
            """
            UPDATE comandas c
            INNER JOIN (
              SELECT id,
                     ROW_NUMBER() OVER (
                       PARTITION BY DATE(creado_en)
                       ORDER BY creado_en ASC, folio ASC
                     ) AS rn
              FROM comandas
            ) t ON t.id = c.id
            SET c.orden_cola = t.rn
            WHERE c.orden_cola IS NULL OR c.orden_cola = 0
            """
        )
        conn.commit()
    print("Orden de cola en comandas listo.")


if __name__ == "__main__":
    main()
