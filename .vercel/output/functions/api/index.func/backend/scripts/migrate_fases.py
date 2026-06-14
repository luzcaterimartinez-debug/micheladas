"""
Migra toppings a fases + opciones por fase.
Ejecutar desde backend/:
  python -m scripts.migrate_fases
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import get_db


def _migrate_pasos_json(raw) -> str:
    if raw is None:
        pasos = ["fase:topping", "notas"]
    elif isinstance(raw, str):
        try:
            pasos = json.loads(raw)
        except json.JSONDecodeError:
            pasos = ["fase:topping", "notas"]
    else:
        pasos = list(raw) if isinstance(raw, list) else ["fase:topping", "notas"]

    out: list[str] = []
    for p in pasos:
        if p == "toppings":
            out.append("fase:topping")
        elif p == "notas":
            out.append("notas")
        elif isinstance(p, str) and p.startswith("fase:"):
            out.append(p)
    if "notas" not in out:
        out.append("notas")
    if not any(x.startswith("fase:") for x in out):
        out.insert(0, "fase:topping")
    return json.dumps(out)


def main() -> None:
    with get_db() as (conn, cursor):
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
              CONSTRAINT fk_fo_fase FOREIGN KEY (fase_id) REFERENCES menu_fases (id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS menu_producto_fase_opcion (
              producto_id VARCHAR(50) NOT NULL,
              opcion_id VARCHAR(50) NOT NULL,
              PRIMARY KEY (producto_id, opcion_id),
              CONSTRAINT fk_pfo_producto FOREIGN KEY (producto_id) REFERENCES menu_productos (id) ON DELETE CASCADE,
              CONSTRAINT fk_pfo_opcion FOREIGN KEY (opcion_id) REFERENCES menu_fase_opciones (id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """
        )

        cursor.execute("INSERT IGNORE INTO menu_fases (id, nombre, descripcion, activo, orden) VALUES (%s, %s, %s, 1, 1)", ("topping", "Topping", "Extras y condimentos"))
        cursor.execute("INSERT IGNORE INTO menu_fases (id, nombre, descripcion, activo, orden) VALUES (%s, %s, %s, 1, 2)", ("nectar", "Néctar", "Jarabes y néctares"))

        cursor.execute(
            """
            SELECT COUNT(*) AS c FROM information_schema.TABLES
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'menu_toppings'
            """
        )
        has_legacy = cursor.fetchone()["c"] > 0

        if has_legacy:
            cursor.execute("SELECT id, nombre FROM menu_toppings")
            for row in cursor.fetchall():
                cursor.execute(
                    """
                    INSERT INTO menu_fase_opciones (id, fase_id, nombre)
                    VALUES (%s, 'topping', %s)
                    ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), fase_id = VALUES(fase_id)
                    """,
                    (row["id"], row["nombre"]),
                )

            cursor.execute("SELECT producto_id, topping_id FROM menu_producto_topping")
            for row in cursor.fetchall():
                cursor.execute(
                    """
                    INSERT IGNORE INTO menu_producto_fase_opcion (producto_id, opcion_id)
                    VALUES (%s, %s)
                    """,
                    (row["producto_id"], row["topping_id"]),
                )

        cursor.execute("SELECT id, pasos FROM menu_productos")
        for row in cursor.fetchall():
            cursor.execute(
                "UPDATE menu_productos SET pasos = %s WHERE id = %s",
                (_migrate_pasos_json(row["pasos"]), row["id"]),
            )

        conn.commit()
    print("Fases: tablas listas, datos migrados y pasos de producto actualizados.")


if __name__ == "__main__":
    main()
