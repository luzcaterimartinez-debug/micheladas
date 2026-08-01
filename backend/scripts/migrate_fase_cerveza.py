"""
Crea la fase "Tipo de cerveza" con Coronita, Corona, latona y personal,
y la asigna a todos los productos *_cerveza.

Ejecutar desde backend/:
  python -m scripts.migrate_fase_cerveza
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import get_db
from app.services.inventario import sync_consumo_producto
from app.services.menu import invalidate_menu_cache

FASE_ID = "cerveza"
PASO = "fase:cerveza"

# id opción, nombre, clave inventario
OPCIONES = [
    ("tipo_coronita", "Coronita", "coronita"),
    ("tipo_corona", "Corona", "corona"),
    ("tipo_cerveza_latona", "Cerveza latona", "cerveza_latona"),
    ("tipo_cerveza_personal", "Cerveza personal", "cerveza_personal"),
]


def _ensure_pasos(raw) -> str:
    if raw is None:
        pasos: list[str] = []
    elif isinstance(raw, (bytes, bytearray)):
        pasos = json.loads(raw.decode())
    elif isinstance(raw, str):
        try:
            pasos = json.loads(raw)
        except json.JSONDecodeError:
            pasos = []
    elif isinstance(raw, list):
        pasos = list(raw)
    else:
        pasos = []

    out = [p for p in pasos if isinstance(p, str)]
    if PASO not in out:
        if "notas" in out:
            idx = out.index("notas")
            out.insert(idx, PASO)
        else:
            out.append(PASO)
    if "notas" not in out:
        out.append("notas")
    return json.dumps(out)


def ensure_fase_cerveza(cursor) -> int:
    """Idempotente: fase + opciones + vínculo a productos *_cerveza. Devuelve cuántos productos tocó."""
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS menu_fases (
          id VARCHAR(50) PRIMARY KEY,
          nombre VARCHAR(100) NOT NULL,
          descripcion VARCHAR(300) NOT NULL DEFAULT '',
          activo TINYINT(1) NOT NULL DEFAULT 1,
          orden INT NOT NULL DEFAULT 0
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
    )
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS menu_fase_opciones (
          id VARCHAR(50) PRIMARY KEY,
          fase_id VARCHAR(50) NOT NULL,
          nombre VARCHAR(100) NOT NULL,
          inventario_clave VARCHAR(80) NULL,
          cantidad DECIMAL(10, 3) NOT NULL DEFAULT 1,
          CONSTRAINT fk_fo_fase_cerv FOREIGN KEY (fase_id) REFERENCES menu_fases (id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
    )
    # columnas inventario por si la tabla ya existía sin ellas
    for col, ddl in (
        ("inventario_clave", "VARCHAR(80) NULL"),
        ("cantidad", "DECIMAL(10, 3) NOT NULL DEFAULT 1"),
    ):
        cursor.execute(
            """
            SELECT COUNT(*) AS c FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'menu_fase_opciones'
              AND COLUMN_NAME = %s
            """,
            (col,),
        )
        if cursor.fetchone()["c"] == 0:
            cursor.execute(f"ALTER TABLE menu_fase_opciones ADD COLUMN {col} {ddl}")

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS menu_producto_fase_opcion (
          producto_id VARCHAR(50) NOT NULL,
          opcion_id VARCHAR(50) NOT NULL,
          PRIMARY KEY (producto_id, opcion_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
    )

    cursor.execute(
        """
        INSERT INTO menu_fases (id, nombre, descripcion, activo, orden)
        VALUES (%s, %s, %s, 1, 5)
        ON DUPLICATE KEY UPDATE
          nombre = VALUES(nombre),
          descripcion = VALUES(descripcion),
          activo = 1
        """,
        (FASE_ID, "Tipo de cerveza", "Variaciones de cerveza para micheladas"),
    )

    for oid, nombre, clave in OPCIONES:
        cursor.execute(
            """
            INSERT INTO menu_fase_opciones (id, fase_id, nombre, inventario_clave, cantidad)
            VALUES (%s, %s, %s, %s, 1)
            ON DUPLICATE KEY UPDATE
              fase_id = VALUES(fase_id),
              nombre = VALUES(nombre),
              inventario_clave = VALUES(inventario_clave),
              cantidad = VALUES(cantidad)
            """,
            (oid, FASE_ID, nombre, clave),
        )

    cursor.execute(
        """
        SELECT id, pasos FROM menu_productos
        WHERE activo = 1 AND (id LIKE %s OR id = 'cerveza')
        """,
        ("%_cerveza",),
    )
    rows = cursor.fetchall()
    for row in rows:
        pid = row["id"]
        cursor.execute(
            "UPDATE menu_productos SET pasos = %s WHERE id = %s",
            (_ensure_pasos(row["pasos"]), pid),
        )
        for oid, _n, _c in OPCIONES:
            cursor.execute(
                """
                INSERT IGNORE INTO menu_producto_fase_opcion (producto_id, opcion_id)
                VALUES (%s, %s)
                """,
                (pid, oid),
            )
        # Base: solo limón; la marca se descuenta por la opción de fase
        sync_consumo_producto(cursor, pid, [{"clave": "limon", "cantidad": 2.0}])

    return len(rows)


def main() -> None:
    with get_db() as (conn, cursor):
        n = ensure_fase_cerveza(cursor)
        conn.commit()
    invalidate_menu_cache()
    print(f"Fase cerveza lista: {n} productos *_cerveza con {len(OPCIONES)} variaciones.")


if __name__ == "__main__":
    main()
