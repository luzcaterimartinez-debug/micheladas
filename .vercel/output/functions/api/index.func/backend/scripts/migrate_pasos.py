"""Agrega columna pasos a menu_productos si falta."""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import mysql.connector

from app.config import get_settings

DEFAULT = ["fase:topping", "notas"]


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
        cursor.execute(
            """
            SELECT COUNT(*) AS c FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = %s AND TABLE_NAME = 'menu_productos' AND COLUMN_NAME = 'pasos'
            """,
            (settings.mysql_database,),
        )
        if cursor.fetchone()["c"] == 0:
            cursor.execute("ALTER TABLE menu_productos ADD COLUMN pasos JSON NULL AFTER orden")
            print("Columna pasos agregada.")

        cursor.execute("UPDATE menu_productos SET pasos = %s WHERE pasos IS NULL", (json.dumps(DEFAULT),))
        conn.commit()
        print("Pasos por producto configurados.")
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    main()
