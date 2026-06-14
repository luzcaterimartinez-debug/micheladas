"""
Crea usuarios de prueba. Ejecutar desde backend/:
  python -m scripts.seed_users
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.auth.password import hash_password
from app.database import get_db

USUARIOS = [
    ("Administrador", "admin@micheladas.local", "admin123", "admin"),
    ("Juan Mesero", "mesero@micheladas.local", "mesero123", "mesero"),
    ("María Barra", "cocinero@micheladas.local", "cocinero123", "cocinero"),
]


def main() -> None:
    with get_db() as (_, cursor):
        for nombre, email, password, rol in USUARIOS:
            cursor.execute(
                """
                INSERT INTO usuarios (nombre, email, password_hash, rol)
                VALUES (%s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                  nombre = VALUES(nombre),
                  password_hash = VALUES(password_hash),
                  rol = VALUES(rol),
                  activo = 1
                """,
                (nombre, email.lower(), hash_password(password), rol),
            )
    print("Usuarios listos:")
    for nombre, email, password, rol in USUARIOS:
        print(f"  [{rol}] {email} / {password} ({nombre})")


if __name__ == "__main__":
    main()
