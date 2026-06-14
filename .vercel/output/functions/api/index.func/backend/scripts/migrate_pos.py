"""Tablas de mesas y comandas. Ejecutar desde backend/:
  python -m scripts.migrate_pos
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import mysql.connector

from app.config import get_settings
from app.services.pos import DEFAULT_MESAS, seed_mesas_if_empty

SQL = """
CREATE TABLE IF NOT EXISTS mesas (
  id VARCHAR(50) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  capacidad INT NOT NULL DEFAULT 4,
  estado ENUM('libre', 'ocupada', 'reservada') NOT NULL DEFAULT 'libre',
  cliente VARCHAR(100) NULL,
  orden INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS comandas (
  id CHAR(36) PRIMARY KEY,
  folio INT UNSIGNED NOT NULL,
  orden_cola INT UNSIGNED NOT NULL DEFAULT 1,
  cliente VARCHAR(100) NOT NULL,
  mesa_id VARCHAR(50) NULL,
  mesa_nombre VARCHAR(100) NULL,
  total DECIMAL(10, 2) NOT NULL,
  status ENUM('pendiente', 'lista', 'entregada') NOT NULL DEFAULT 'pendiente',
  mesero_id INT UNSIGNED NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_comandas_folio (folio),
  INDEX idx_comandas_status (status),
  INDEX idx_comandas_mesa (mesa_id),
  INDEX idx_comandas_creado (creado_en),
  INDEX idx_comandas_orden_dia (creado_en, orden_cola),
  CONSTRAINT fk_comandas_mesa FOREIGN KEY (mesa_id) REFERENCES mesas (id) ON DELETE SET NULL,
  CONSTRAINT fk_comandas_mesero FOREIGN KEY (mesero_id) REFERENCES usuarios (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS comanda_items (
  id CHAR(36) PRIMARY KEY,
  comanda_id CHAR(36) NOT NULL,
  producto_id VARCHAR(50) NOT NULL,
  producto_nombre VARCHAR(120) NOT NULL,
  tamano VARCHAR(50) NULL,
  precio_base DECIMAL(10, 2) NOT NULL,
  toppings_json JSON NOT NULL,
  adiciones_json JSON NOT NULL,
  notas VARCHAR(500) NULL,
  total DECIMAL(10, 2) NOT NULL,
  orden INT NOT NULL DEFAULT 0,
  INDEX idx_items_comanda (comanda_id),
  CONSTRAINT fk_items_comanda FOREIGN KEY (comanda_id) REFERENCES comandas (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
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
    cursor = conn.cursor()
    try:
        for stmt in SQL.split(";"):
            s = stmt.strip()
            if s:
                cursor.execute(s)
        conn.commit()
        print("Tablas mesas, comandas y comanda_items listas.")
    finally:
        cursor.close()
        conn.close()

    seed_mesas_if_empty()
    print(f"Mesas por defecto: {len(DEFAULT_MESAS)} registros (si estaban vacías).")


if __name__ == "__main__":
    main()
