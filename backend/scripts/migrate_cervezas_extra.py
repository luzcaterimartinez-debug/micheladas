"""
Agrega cervezas Poker, Águila, Light y Budweiser en Bebidas + fase tipo de cerveza.

Ejecutar desde backend/:
  python -m scripts.migrate_cervezas_extra
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import get_db
from app.services.inventario import sync_consumo_producto
from app.services.menu import invalidate_menu_cache
from app.services.menu_cerveza import ensure_fase_cerveza

PASOS = json.dumps(["notas"])

NUEVAS = [
    ("poker", "Poker", 5_000, "Cerveza Poker", 5, [("poker", 1.0)]),
    ("aguila", "Águila", 5_000, "Cerveza Águila", 6, [("aguila", 1.0)]),
    ("cerveza_light", "Light", 5_000, "Cerveza Light", 7, [("cerveza_light", 1.0)]),
    ("budweiser", "Budweiser", 5_000, "Cerveza Budweiser", 8, [("budweiser", 1.0)]),
]

INVENTARIO = [
    ("poker", "Poker", 48, "pz", 12),
    ("aguila", "Águila", 48, "pz", 12),
    ("cerveza_light", "Light", 48, "pz", 12),
    ("budweiser", "Budweiser", 48, "pz", 12),
]

# Reordenar soda/ginger después de las nuevas cervezas
REORDEN = [
    ("la_soda", 9),
    ("ginger_personal", 10),
    ("ginger_litro_medio", 11),
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

        for pid, nombre, precio, desc, orden, consumo in NUEVAS:
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

        for pid, orden in REORDEN:
            cursor.execute(
                "UPDATE menu_productos SET orden = %s WHERE id = %s AND categoria_id = 'bebidas'",
                (orden, pid),
            )

        n_cerv = ensure_fase_cerveza(cursor)
        conn.commit()

    invalidate_menu_cache()
    print(
        f"Cervezas agregadas: Poker, Águila, Light, Budweiser ($5.000). "
        f"Fase tipo de cerveza actualizada ({n_cerv} productos)."
    )


if __name__ == "__main__":
    main()
