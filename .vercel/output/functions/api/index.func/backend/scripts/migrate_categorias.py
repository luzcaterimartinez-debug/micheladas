"""Crea categorías y vincula productos. Ejecutar desde backend/:
  python -m scripts.migrate_categorias
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import mysql.connector

from app.config import get_settings

SQL = """
CREATE TABLE IF NOT EXISTS menu_categorias (
  id VARCHAR(50) PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  descripcion VARCHAR(300) NOT NULL DEFAULT '',
  activo TINYINT(1) NOT NULL DEFAULT 1,
  orden INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
"""


def main() -> None:
    settings = get_settings()
    conn = mysql.connector.connect(
        host=settings.mysql_host,
        port=settings.mysql_port,
        user=settings.mysql_user,
        password=settings.mysql_password,
        database=settings.mysql_database,
    )
    cursor = conn.cursor(dictionary=True)
    try:
        for stmt in SQL.split(";"):
            s = stmt.strip()
            if s:
                cursor.execute(s)

        cursor.execute(
            """
            SELECT COUNT(*) AS c FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = %s AND TABLE_NAME = 'menu_productos' AND COLUMN_NAME = 'categoria_id'
            """,
            (settings.mysql_database,),
        )
        if cursor.fetchone()["c"] == 0:
            cursor.execute(
                """
                ALTER TABLE menu_productos
                ADD COLUMN categoria_id VARCHAR(50) NULL AFTER pasos
                """
            )
            print("Columna categoria_id agregada.")

        cursor.execute(
            """
            INSERT INTO menu_categorias (id, nombre, descripcion, activo, orden)
            VALUES ('micheladas', 'Micheladas', 'Nuestras micheladas preparadas al momento', 1, 1)
            ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), activo = 1
            """
        )
        cursor.execute(
            """
            INSERT INTO menu_categorias (id, nombre, descripcion, activo, orden)
            VALUES ('especiales', 'Especiales', 'Ediciones y sabores de temporada', 1, 2)
            ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)
            """
        )
        cursor.execute(
            "UPDATE menu_productos SET categoria_id = 'micheladas' WHERE categoria_id IS NULL"
        )
        conn.commit()
        print("Categorías listas. Productos asignados a 'micheladas'.")
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    main()
