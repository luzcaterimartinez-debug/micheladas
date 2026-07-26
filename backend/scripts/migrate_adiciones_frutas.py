"""
Reemplaza adiciones por frutas a $3.000 COP.
Ejecutar desde backend/:
  python -m scripts.migrate_adiciones_frutas
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import get_db

ADICIONES = [
    ("cereza", "Cereza", 3000, "cereza", 1, 1),
    ("fresa", "Fresa", 3000, "fresa", 2, 1),
    ("sandia", "Sandía", 3000, "sandia", 3, 1),
    ("maracuya", "Maracuyá", 3000, "maracuya", 4, 1),
    ("mango", "Mango", 3000, "mango", 5, 1),
]

INVENTARIO = [
    ("cereza", "Cereza", 50, "pz", 10),
    ("fresa", "Fresa", 50, "pz", 10),
    ("sandia", "Sandía", 50, "pz", 10),
    ("maracuya", "Maracuyá", 50, "pz", 10),
    ("mango", "Mango", 50, "pz", 10),
]


def main() -> None:
    keep_ids = [a[0] for a in ADICIONES]
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

        placeholders = ", ".join(["%s"] * len(keep_ids))
        cursor.execute(
            f"UPDATE menu_adiciones SET activo = 0 WHERE id NOT IN ({placeholders})",
            tuple(keep_ids),
        )

        for clave, nombre, stock, unidad, minimo in INVENTARIO:
            cursor.execute(
                """
                INSERT INTO inventario (clave, nombre, stock, unidad, minimo)
                VALUES (%s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                  nombre = VALUES(nombre),
                  unidad = VALUES(unidad),
                  minimo = VALUES(minimo)
                """,
                (clave, nombre, stock, unidad, minimo),
            )

        conn.commit()

    print("Adiciones actualizadas: cereza, fresa, sandía, maracuyá, mango ($3.000).")
    print("Las demás adiciones quedaron inactivas.")


if __name__ == "__main__":
    main()
