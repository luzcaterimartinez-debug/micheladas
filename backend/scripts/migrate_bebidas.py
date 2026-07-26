"""
Agrega categoría Bebidas (sin fases) con consumo de inventario.
Ejecutar desde backend/:
  python -m scripts.migrate_bebidas
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import get_db
from app.services.inventario import sync_consumo_producto

PASOS = json.dumps(["notas"])

# id, nombre, precio, descripción, orden, [(clave_inventario, cantidad)]
BEBIDAS = [
    ("coronita", "Coronita", 6_000, "Cerveza Coronita", 1, [("coronita", 1.0)]),
    ("corona", "Corona", 8_000, "Cerveza Corona", 2, [("corona", 1.0)]),
    ("cerveza_latona", "Cerveza latona", 6_000, "Cerveza latona", 3, [("cerveza_latona", 1.0)]),
    ("cerveza_personal", "Cerveza personal", 5_000, "Cerveza personal", 4, [("cerveza_personal", 1.0)]),
    ("la_soda", "La soda", 5_000, "Soda", 5, [("soda", 1.0)]),
    ("ginger_personal", "Ginger personal", 5_000, "Ginger ale personal", 6, [("ginger", 1.0)]),
    (
        "ginger_litro_medio",
        "Ginger litro y medio",
        8_000,
        "Ginger ale 1.5 L",
        7,
        [("ginger_litro_medio", 1.0)],
    ),
]

# clave, nombre, stock inicial, unidad, mínimo
INVENTARIO = [
    ("coronita", "Coronita", 48, "pz", 12),
    ("corona", "Corona", 48, "pz", 12),
    ("cerveza_latona", "Cerveza latona", 48, "pz", 12),
    ("cerveza_personal", "Cerveza personal", 48, "pz", 12),
    ("ginger_litro_medio", "Ginger 1.5 L", 24, "pz", 6),
]


def main() -> None:
    with get_db() as (conn, cursor):
        cursor.execute(
            """
            INSERT INTO menu_categorias (id, nombre, descripcion, activo, orden)
            VALUES ('bebidas', 'Bebidas', 'Cervezas, soda y ginger', 1, 99)
            ON DUPLICATE KEY UPDATE
              nombre = VALUES(nombre),
              descripcion = VALUES(descripcion),
              orden = VALUES(orden),
              activo = 1
            """
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

        for pid, nombre, precio, desc, orden, consumo in BEBIDAS:
            cursor.execute(
                """
                INSERT INTO menu_productos
                  (id, nombre, precio, descripcion, activo, orden, pasos, categoria_id)
                VALUES (%s, %s, %s, %s, 1, %s, %s, 'bebidas')
                ON DUPLICATE KEY UPDATE
                  nombre = VALUES(nombre),
                  precio = VALUES(precio),
                  descripcion = VALUES(descripcion),
                  orden = VALUES(orden),
                  pasos = VALUES(pasos),
                  categoria_id = VALUES(categoria_id),
                  activo = 1
                """,
                (pid, nombre, precio, desc, orden, PASOS),
            )
            sync_consumo_producto(
                cursor,
                pid,
                [{"clave": c, "cantidad": q} for c, q in consumo],
            )

        conn.commit()

    print(f"Categoría Bebidas: {len(BEBIDAS)} productos sin fases + consumo de inventario.")


if __name__ == "__main__":
    main()
