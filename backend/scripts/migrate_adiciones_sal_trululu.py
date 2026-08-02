"""
Agrega adiciones Sal y Trululu ($3.000) sin desactivar las existentes.

Ejecutar desde backend/:
  python -m scripts.migrate_adiciones_sal_trululu
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import get_db
from app.services.menu import invalidate_menu_cache

ADICIONES = [
    ("sal", "Sal", 3_000, "sal", 6, 1),
    ("trululu", "Trululu", 3_000, "trululu", 7, 1),
]

INVENTARIO = [
    ("sal", "Sal", 50, "pz", 10),
    ("trululu", "Trululu", 50, "pz", 10),
]


def main() -> None:
    with get_db() as (conn, cursor):
        for aid, nombre, precio, stock, orden, qty in ADICIONES:
            cursor.execute(
                """
                INSERT INTO menu_adiciones (id, nombre, precio, stock_key, cantidad, activo, orden)
                VALUES (%s, %s, %s, %s, %s, 1, %s)
                ON DUPLICATE KEY UPDATE
                  nombre = VALUES(nombre),
                  precio = VALUES(precio),
                  stock_key = VALUES(stock_key),
                  cantidad = VALUES(cantidad),
                  orden = VALUES(orden),
                  activo = 1
                """,
                (aid, nombre, precio, stock, qty, orden),
            )

        for clave, nombre, stock, unidad, minimo in INVENTARIO:
            cursor.execute(
                """
                INSERT INTO inventario (clave, nombre, stock, stock_inicial, unidad, minimo)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                  nombre = VALUES(nombre),
                  unidad = VALUES(unidad),
                  minimo = VALUES(minimo)
                """,
                (clave, nombre, stock, stock, unidad, minimo),
            )

        conn.commit()

    invalidate_menu_cache()
    print("Adiciones agregadas: Sal y Trululu ($3.000).")


if __name__ == "__main__":
    main()
