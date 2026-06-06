"""
Crea tablas de inventario y consumo por producto.
Ejecutar desde backend/:
  python -m scripts.migrate_inventario
  python -m scripts.seed_inventario
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import get_db
from app.services.inventario import ensure_inventario_seeded


def main() -> None:
    with get_db() as (conn, cursor):
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS inventario (
              clave VARCHAR(50) PRIMARY KEY,
              nombre VARCHAR(100) NOT NULL,
              stock DECIMAL(12, 3) NOT NULL DEFAULT 0,
              stock_inicial DECIMAL(12, 3) NOT NULL DEFAULT 0,
              unidad VARCHAR(20) NOT NULL DEFAULT 'pz',
              minimo DECIMAL(12, 3) NOT NULL DEFAULT 5
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS producto_consumo (
              producto_id VARCHAR(50) NOT NULL,
              inventario_clave VARCHAR(50) NOT NULL,
              cantidad DECIMAL(12, 3) NOT NULL,
              PRIMARY KEY (producto_id, inventario_clave),
              CONSTRAINT fk_pc_producto FOREIGN KEY (producto_id)
                REFERENCES menu_productos (id) ON DELETE CASCADE,
              CONSTRAINT fk_pc_inventario FOREIGN KEY (inventario_clave)
                REFERENCES inventario (clave) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """
        )
        ensure_inventario_seeded(cursor)
        conn.commit()
    print("Inventario: tablas listas y datos iniciales cargados.")


if __name__ == "__main__":
    main()
