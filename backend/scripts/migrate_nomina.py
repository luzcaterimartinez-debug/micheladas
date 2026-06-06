"""
Tablas de nómina (configuración por empleado y recibos por periodo).
Ejecutar desde backend/:
  python -m scripts.migrate_nomina
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import get_db

SQL = """
CREATE TABLE IF NOT EXISTS nomina_config (
  usuario_id INT UNSIGNED PRIMARY KEY,
  salario_base DECIMAL(12, 2) NOT NULL DEFAULT 0,
  tipo_pago ENUM('diario', 'semanal', 'quincenal', 'mensual') NOT NULL DEFAULT 'quincenal',
  tarifa_hora_extra DECIMAL(10, 2) NULL,
  puesto VARCHAR(100) NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_nomina_config_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS nomina_recibos (
  id CHAR(36) PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  anio SMALLINT UNSIGNED NOT NULL,
  mes TINYINT UNSIGNED NOT NULL,
  quincena TINYINT UNSIGNED NOT NULL DEFAULT 0,
  dias_trabajados DECIMAL(5, 2) NOT NULL DEFAULT 0,
  horas_extra DECIMAL(6, 2) NOT NULL DEFAULT 0,
  bonos DECIMAL(10, 2) NOT NULL DEFAULT 0,
  deducciones DECIMAL(10, 2) NOT NULL DEFAULT 0,
  sueldo_bruto DECIMAL(12, 2) NOT NULL,
  total DECIMAL(12, 2) NOT NULL,
  notas VARCHAR(500) NULL,
  estado ENUM('borrador', 'pagado') NOT NULL DEFAULT 'borrador',
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_nomina_periodo (usuario_id, anio, mes, quincena),
  INDEX idx_nomina_periodo (anio, mes, quincena),
  INDEX idx_nomina_estado (estado),
  CONSTRAINT fk_nomina_recibo_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
"""


def main() -> None:
    with get_db() as (conn, cursor):
        for stmt in SQL.split(";"):
            s = stmt.strip()
            if s:
                cursor.execute(s)
        conn.commit()
    print("Tablas de nómina listas (nomina_config, nomina_recibos).")


if __name__ == "__main__":
    main()
