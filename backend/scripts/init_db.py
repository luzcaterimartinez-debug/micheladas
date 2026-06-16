"""
Crea la base de datos y la tabla usuarios. Ejecutar desde backend/:
  python -m scripts.init_db
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import mysql.connector

from app.config import get_settings

SCHEMA_SQL = """
CREATE DATABASE IF NOT EXISTS {database}
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE {database};

CREATE TABLE IF NOT EXISTS usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'mesero', 'cocinero') NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_usuarios_email (email),
  INDEX idx_usuarios_rol (rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_productos (
  id VARCHAR(50) PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  descripcion VARCHAR(500) NOT NULL DEFAULT '',
  activo TINYINT(1) NOT NULL DEFAULT 1,
  orden INT NOT NULL DEFAULT 0,
  pasos JSON NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_toppings (
  id VARCHAR(50) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_producto_topping (
  producto_id VARCHAR(50) NOT NULL,
  topping_id VARCHAR(50) NOT NULL,
  PRIMARY KEY (producto_id, topping_id),
  CONSTRAINT fk_pt_producto FOREIGN KEY (producto_id) REFERENCES menu_productos (id) ON DELETE CASCADE,
  CONSTRAINT fk_pt_topping FOREIGN KEY (topping_id) REFERENCES menu_toppings (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_adiciones (
  id VARCHAR(50) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  stock_key VARCHAR(50) NULL,
  cantidad DECIMAL(10, 3) NOT NULL DEFAULT 1,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  orden INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  cantidad INT NOT NULL DEFAULT 1,
  toppings_json JSON NOT NULL,
  adiciones_json JSON NOT NULL,
  notas VARCHAR(500) NULL,
  total DECIMAL(10, 2) NOT NULL,
  orden INT NOT NULL DEFAULT 0,
  INDEX idx_items_comanda (comanda_id),
  CONSTRAINT fk_items_comanda FOREIGN KEY (comanda_id) REFERENCES comandas (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventario (
  clave VARCHAR(50) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  stock DECIMAL(12, 3) NOT NULL DEFAULT 0,
  stock_inicial DECIMAL(12, 3) NOT NULL DEFAULT 0,
  unidad VARCHAR(20) NOT NULL DEFAULT 'pz',
  minimo DECIMAL(12, 3) NOT NULL DEFAULT 5
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS producto_consumo (
  producto_id VARCHAR(50) NOT NULL,
  inventario_clave VARCHAR(50) NOT NULL,
  cantidad DECIMAL(12, 3) NOT NULL,
  PRIMARY KEY (producto_id, inventario_clave),
  CONSTRAINT fk_pc_producto FOREIGN KEY (producto_id)
    REFERENCES menu_productos (id) ON DELETE CASCADE,
  CONSTRAINT fk_pc_inventario FOREIGN KEY (inventario_clave)
    REFERENCES inventario (clave) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
"""


def main() -> None:
    settings = get_settings()
    conn = mysql.connector.connect(
        host=settings.mysql_host,
        port=settings.mysql_port,
        user=settings.mysql_user,
        password=settings.mysql_password,
    )
    cursor = conn.cursor()
    try:
        for statement in SCHEMA_SQL.format(database=settings.mysql_database).split(";"):
            stmt = statement.strip()
            if stmt:
                cursor.execute(stmt)
        conn.commit()
        print(f"Base '{settings.mysql_database}' lista (usuarios + menú).")
        print("Ejecuta: python -m scripts.seed_menu")
        print("Ejecuta: python -m scripts.migrate_pos")
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    main()
