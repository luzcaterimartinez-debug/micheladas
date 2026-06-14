"""
Vacía todas las tablas de la base excepto usuarios.
Ejecutar desde backend/:
  python -m scripts.format_db
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import get_db

KEEP_TABLE = "usuarios"


def main() -> None:
    with get_db() as (conn, cursor):
        cursor.execute(
            """
            SELECT TABLE_NAME AS name
            FROM information_schema.TABLES
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_TYPE = 'BASE TABLE'
              AND TABLE_NAME != %s
            ORDER BY TABLE_NAME
            """,
            (KEEP_TABLE,),
        )
        tables = [row["name"] for row in cursor.fetchall()]

        if not tables:
            print(f"No hay tablas que vaciar (solo '{KEEP_TABLE}').")
            return

        cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
        for table in tables:
            cursor.execute(f"TRUNCATE TABLE `{table}`")
            print(f"  · {table}")
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1")

        cursor.execute(f"SELECT COUNT(*) AS n FROM `{KEEP_TABLE}`")
        count = cursor.fetchone()["n"]
        conn.commit()

    print(f"\nBase formateada: {len(tables)} tabla(s) vaciadas, {count} usuario(s) conservados.")


if __name__ == "__main__":
    main()
