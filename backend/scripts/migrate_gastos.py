"""
Tabla de gastos del negocio.
Ejecutar desde backend/:
  python -m scripts.migrate_gastos
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import get_db

SQL = """
CREATE TABLE IF NOT EXISTS gastos (
  id CHAR(36) PRIMARY KEY,
  concepto VARCHAR(200) NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  categoria ENUM(
    'insumos','servicios','renta','mantenimiento',
    'nomina_extra','transporte','otros'
  ) NOT NULL DEFAULT 'otros',
  fecha DATE NOT NULL,
  notas VARCHAR(500) NULL,
  creado_por INT UNSIGNED NOT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_gastos_fecha (fecha),
  INDEX idx_gastos_categoria (categoria),
  CONSTRAINT fk_gastos_usuario FOREIGN KEY (creado_por) REFERENCES usuarios (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
"""


def main() -> None:
    with get_db() as (conn, cursor):
        cursor.execute(SQL)
        conn.commit()
    print("Tabla gastos lista.")


if __name__ == "__main__":
    main()
