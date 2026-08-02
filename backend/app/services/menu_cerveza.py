"""Asegura fase Tipo de cerveza en productos *_cerveza."""
from __future__ import annotations

import json
from typing import Any

from app.services.inventario import sync_consumo_producto

FASE_ID = "cerveza"
PASO = "fase:cerveza"

OPCIONES = [
    ("tipo_aguila", "Águila", "aguila"),
    ("tipo_poker", "Poker", "poker"),
    ("tipo_cerveza_light", "Light", "cerveza_light"),
    ("tipo_budweiser", "Budweiser", "budweiser"),
]

# Opciones antiguas que ya no deben aparecer en micheladas.
OPCIONES_RETIRADAS = (
    "tipo_coronita",
    "tipo_corona",
    "tipo_cerveza_latona",
    "tipo_cerveza_personal",
)


def _ensure_pasos(raw: Any) -> str:
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
            out.insert(out.index("notas"), PASO)
        else:
            out.append(PASO)
    if "notas" not in out:
        out.append("notas")
    return json.dumps(out)


def ensure_fase_cerveza(cursor: Any) -> int:
    """Idempotente. Devuelve cuántos productos *_cerveza actualizó."""
    # columnas inventario por si la tabla existía sin ellas
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
        row = cursor.fetchone()
        if row and int(row["c"] or 0) == 0:
            cursor.execute(f"ALTER TABLE menu_fase_opciones ADD COLUMN {col} {ddl}")

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

    # Quitar Coronita/Corona/latona/personal del paso de micheladas.
    if OPCIONES_RETIRADAS:
        ph = ", ".join(["%s"] * len(OPCIONES_RETIRADAS))
        cursor.execute(
            f"DELETE FROM menu_producto_fase_opcion WHERE opcion_id IN ({ph})",
            OPCIONES_RETIRADAS,
        )
        cursor.execute(
            f"DELETE FROM menu_fase_opciones WHERE id IN ({ph}) AND fase_id = %s",
            (*OPCIONES_RETIRADAS, FASE_ID),
        )

    keep_ids = tuple(o[0] for o in OPCIONES)
    cursor.execute(
        """
        SELECT id, pasos FROM menu_productos
        WHERE activo = 1 AND id LIKE %s
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
        # Reemplazar vínculos: solo Águila, Poker, Light y Budweiser.
        cursor.execute(
            """
            DELETE pfo FROM menu_producto_fase_opcion pfo
            INNER JOIN menu_fase_opciones o ON o.id = pfo.opcion_id
            WHERE pfo.producto_id = %s AND o.fase_id = %s
            """,
            (pid, FASE_ID),
        )
        for oid, _n, _c in OPCIONES:
            cursor.execute(
                """
                INSERT IGNORE INTO menu_producto_fase_opcion (producto_id, opcion_id)
                VALUES (%s, %s)
                """,
                (pid, oid),
            )
        sync_consumo_producto(cursor, pid, [{"clave": "limon", "cantidad": 2.0}])

    return len(rows)


def productos_cerveza_sin_opciones(cursor: Any) -> bool:
    cursor.execute(
        """
        SELECT p.id
        FROM menu_productos p
        WHERE p.activo = 1 AND p.id LIKE %s
          AND NOT EXISTS (
            SELECT 1
            FROM menu_producto_fase_opcion pfo
            JOIN menu_fase_opciones o ON o.id = pfo.opcion_id
            WHERE pfo.producto_id = p.id AND o.fase_id = %s
          )
        LIMIT 1
        """,
        ("%_cerveza", FASE_ID),
    )
    return cursor.fetchone() is not None
