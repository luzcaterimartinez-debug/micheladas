"""
Carga el menú Michelandia (cartas físicas del negocio).
Cada sabor es una categoría; cada base (ginger, soda, cerveza…) es un producto con precio.
Ejecutar desde backend/:
  python -m scripts.seed_menu
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import get_db
from app.services.inventario import ensure_inventario_seeded, sync_consumo_producto

PASOS = json.dumps(["notas"])

BASES = [
    ("ginger", "Ginger"),
    ("soda", "Soda"),
    ("cerveza", "Cerveza"),
    ("cola_pola", "Cola y pola"),
    ("smirnoff", "Smirnoff"),
]

PRECIOS_TRADICIONAL = (10_000, 10_000, 11_000, 11_000, 16_000)
PRECIOS_ESTANDAR = (14_000, 14_000, 15_000, 15_000, 23_000)

# id, nombre, descripción, tupla de precios por base
SABORES = [
    ("tradicional", "Tradicional", "Sal + limón", PRECIOS_TRADICIONAL),
    ("bombom_cereza", "Bombom Cereza", "Cereza", PRECIOS_ESTANDAR),
    ("lulo", "Lulo", "", PRECIOS_ESTANDAR),
    ("maracumazana", "Maracumanzana", "Maracuyá + manzana", PRECIOS_ESTANDAR),
    ("maragumango", "Maragumango", "Mango + maracuyá", PRECIOS_ESTANDAR),
    ("manzana_verde", "Manzana Verde", "", PRECIOS_ESTANDAR),
    ("frutos_rojos", "Frutos Rojos", "Cereza + sandía + fresa", PRECIOS_ESTANDAR),
    ("mango_biche", "Mango Biche", "", PRECIOS_ESTANDAR),
    ("sandia", "Sandía", "", PRECIOS_ESTANDAR),
    ("tamarindo_mango", "Tamarindo Mango", "", PRECIOS_ESTANDAR),
    ("maracubombom", "Maracubombom", "Maracuyá + cereza", PRECIOS_ESTANDAR),
    ("blueberry_mango", "Blueberry Mango", "", PRECIOS_ESTANDAR),
]

# id, nombre, precio COP, clave inventario, orden, cantidad por venta
ADICIONES = [
    ("camaron", "Camarón cocido", 5_000, "camaron", 1, 2),
    ("pulpo", "Pulpo", 8_000, "pulpo", 2, 2),
    ("pepino", "Pepino", 3_000, "pepino", 3, 1),
    ("jicama", "Jícama", 3_000, "jicama", 4, 1),
    ("cacahuate", "Cacahuates", 4_000, "cacahuate", 5, 50),
    ("gomitas", "Gomitas enchiladas", 4_000, "gomitas", 6, 40),
    ("rielitos", "Rielitos", 5_000, "rielitos", 7, 1),
]

ESPECIALES = [
    (
        "endiablada",
        "Endiablada",
        "Mango + maracuyá, curaçao, ají, tajín, Corona",
        25_000,
    ),
    (
        "diablo_rojo",
        "Diablo Rojo",
        "Fresa + cereza + sandía, curaçao, ají, tajín, Corona",
        25_000,
    ),
]


def _upsert_categoria(cursor, cat_id: str, nombre: str, descripcion: str, orden: int) -> None:
    cursor.execute(
        """
        INSERT INTO menu_categorias (id, nombre, descripcion, activo, orden)
        VALUES (%s, %s, %s, 1, %s)
        ON DUPLICATE KEY UPDATE
          nombre = VALUES(nombre),
          descripcion = VALUES(descripcion),
          orden = VALUES(orden),
          activo = 1
        """,
        (cat_id, nombre, descripcion, orden),
    )


def _upsert_producto(
    cursor,
    *,
    pid: str,
    nombre: str,
    precio: float,
    descripcion: str,
    categoria_id: str,
    orden: int,
) -> None:
    cursor.execute(
        """
        INSERT INTO menu_productos (id, nombre, precio, descripcion, activo, orden, pasos, categoria_id)
        VALUES (%s, %s, %s, %s, 1, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
          nombre = VALUES(nombre),
          precio = VALUES(precio),
          descripcion = VALUES(descripcion),
          orden = VALUES(orden),
          pasos = VALUES(pasos),
          categoria_id = VALUES(categoria_id),
          activo = 1
        """,
        (pid, nombre, precio, descripcion, orden, PASOS, categoria_id),
    )


def main() -> None:
    productos = 0
    with get_db() as (_, cursor):
        cursor.execute(
            """
            SELECT COUNT(*) AS c FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'menu_productos'
              AND COLUMN_NAME = 'categoria_id'
            """
        )
        if cursor.fetchone()["c"] == 0:
            cursor.execute(
                """
                ALTER TABLE menu_productos
                  ADD COLUMN categoria_id VARCHAR(50) NULL AFTER pasos
                """
            )
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS menu_categorias (
                  id VARCHAR(50) PRIMARY KEY,
                  nombre VARCHAR(80) NOT NULL,
                  descripcion VARCHAR(300) NOT NULL DEFAULT '',
                  activo TINYINT(1) NOT NULL DEFAULT 1,
                  orden INT NOT NULL DEFAULT 0
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """
            )

        orden_cat = 1
        for cat_id, nombre, desc, precios in SABORES:
            _upsert_categoria(cursor, cat_id, nombre, desc, orden_cat)
            orden_cat += 1
            for i, (base_id, base_nombre) in enumerate(BASES):
                pid = f"{cat_id}_{base_id}"
                _upsert_producto(
                    cursor,
                    pid=pid,
                    nombre=f"{nombre} · {base_nombre}",
                    precio=precios[i],
                    descripcion=desc or nombre,
                    categoria_id=cat_id,
                    orden=i + 1,
                )
                productos += 1

        _upsert_categoria(cursor, "especiales", "Especiales", "Micheladas premium", orden_cat)
        for i, (pid, nombre, desc, precio) in enumerate(ESPECIALES, start=1):
            _upsert_producto(
                cursor,
                pid=pid,
                nombre=nombre,
                precio=precio,
                descripcion=desc,
                categoria_id="especiales",
                orden=i,
            )
            productos += 1

        cursor.execute("UPDATE menu_productos SET activo = 0 WHERE categoria_id IS NULL")

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

        ensure_inventario_seeded(cursor)
        cursor.execute("SELECT id FROM menu_productos WHERE activo = 1")
        for row in cursor.fetchall():
            sync_consumo_producto(cursor, row["id"])

    print(
        f"Menú Michelandia: {productos} productos, {len(ADICIONES)} adiciones, consumo sincronizado."
    )


if __name__ == "__main__":
    main()
