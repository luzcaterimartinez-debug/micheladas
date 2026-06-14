"""Tablas de caja: pagos en comandas y cortes diarios.
Ejecutar desde backend/:
  python -m scripts.migrate_caja
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import get_db

SQL = """
ALTER TABLE comandas
  ADD COLUMN pagado TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN metodo_pago ENUM('efectivo','tarjeta','transferencia','mixto') NULL,
  ADD COLUMN monto_pagado DECIMAL(10,2) NULL,
  ADD COLUMN propina DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN pago_efectivo DECIMAL(10,2) NULL,
  ADD COLUMN pago_tarjeta DECIMAL(10,2) NULL,
  ADD COLUMN pago_transferencia DECIMAL(10,2) NULL,
  ADD COLUMN pagado_en TIMESTAMP NULL,
  ADD COLUMN cobrado_por INT UNSIGNED NULL;

CREATE TABLE IF NOT EXISTS caja_cortes (
  id CHAR(36) PRIMARY KEY,
  fecha DATE NOT NULL,
  total_ventas DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_propinas DECIMAL(12,2) NOT NULL DEFAULT 0,
  efectivo_esperado DECIMAL(12,2) NOT NULL DEFAULT 0,
  tarjeta_total DECIMAL(12,2) NOT NULL DEFAULT 0,
  transferencia_total DECIMAL(12,2) NOT NULL DEFAULT 0,
  efectivo_contado DECIMAL(12,2) NOT NULL,
  diferencia DECIMAL(12,2) NOT NULL DEFAULT 0,
  comandas_pagadas INT NOT NULL DEFAULT 0,
  comandas_pendientes INT NOT NULL DEFAULT 0,
  notas TEXT NULL,
  cerrado_por INT UNSIGNED NOT NULL,
  cerrado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_corte_fecha (fecha),
  INDEX idx_corte_cerrado (cerrado_en),
  CONSTRAINT fk_corte_usuario FOREIGN KEY (cerrado_por) REFERENCES usuarios (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
"""

FK_SQL = """
ALTER TABLE comandas
  ADD CONSTRAINT fk_comandas_cobrado FOREIGN KEY (cobrado_por) REFERENCES usuarios (id) ON DELETE SET NULL;
"""

INDEX_SQL = "CREATE INDEX idx_comandas_pagado ON comandas (pagado, creado_en);"


def _column_exists(cursor, table: str, column: str) -> bool:
    cursor.execute(
        """
        SELECT COUNT(*) AS c FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = %s AND COLUMN_NAME = %s
        """,
        (table, column),
    )
    return int(cursor.fetchone()["c"]) > 0


def _table_exists(cursor, table: str) -> bool:
    cursor.execute(
        """
        SELECT COUNT(*) AS c FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = %s
        """,
        (table,),
    )
    return int(cursor.fetchone()["c"]) > 0


def _fk_exists(cursor, name: str) -> bool:
    cursor.execute(
        """
        SELECT COUNT(*) AS c FROM information_schema.TABLE_CONSTRAINTS
        WHERE TABLE_SCHEMA = DATABASE() AND CONSTRAINT_NAME = %s
        """,
        (name,),
    )
    return int(cursor.fetchone()["c"]) > 0


def _index_exists(cursor, table: str, index: str) -> bool:
    cursor.execute(
        """
        SELECT COUNT(*) AS c FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = %s AND INDEX_NAME = %s
        """,
        (table, index),
    )
    return int(cursor.fetchone()["c"]) > 0


def main() -> None:
    with get_db() as (conn, cursor):
        if not _column_exists(cursor, "comandas", "pagado"):
            for stmt in SQL.split(";"):
                s = stmt.strip()
                if s:
                    cursor.execute(s)
            print("Columnas de pago en comandas y tabla caja_cortes creadas.")
        else:
            print("Columnas de pago ya existen en comandas.")

        if not _table_exists(cursor, "caja_cortes"):
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS caja_cortes (
                  id CHAR(36) PRIMARY KEY,
                  fecha DATE NOT NULL,
                  total_ventas DECIMAL(12,2) NOT NULL DEFAULT 0,
                  total_propinas DECIMAL(12,2) NOT NULL DEFAULT 0,
                  efectivo_esperado DECIMAL(12,2) NOT NULL DEFAULT 0,
                  tarjeta_total DECIMAL(12,2) NOT NULL DEFAULT 0,
                  transferencia_total DECIMAL(12,2) NOT NULL DEFAULT 0,
                  efectivo_contado DECIMAL(12,2) NOT NULL,
                  diferencia DECIMAL(12,2) NOT NULL DEFAULT 0,
                  comandas_pagadas INT NOT NULL DEFAULT 0,
                  comandas_pendientes INT NOT NULL DEFAULT 0,
                  notas TEXT NULL,
                  cerrado_por INT UNSIGNED NOT NULL,
                  cerrado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  UNIQUE KEY uk_corte_fecha (fecha),
                  INDEX idx_corte_cerrado (cerrado_en),
                  CONSTRAINT fk_corte_usuario FOREIGN KEY (cerrado_por) REFERENCES usuarios (id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """
            )
            print("Tabla caja_cortes creada.")

        if not _fk_exists(cursor, "fk_comandas_cobrado"):
            try:
                cursor.execute(FK_SQL.strip())
                print("FK cobrado_por en comandas.")
            except Exception as exc:
                print(f"FK cobrado_por omitida: {exc}")

        if not _index_exists(cursor, "comandas", "idx_comandas_pagado"):
            try:
                cursor.execute(INDEX_SQL)
                print("Índice idx_comandas_pagado.")
            except Exception as exc:
                print(f"Índice omitido: {exc}")

        conn.commit()
    print("Caja: migración lista.")


if __name__ == "__main__":
    main()
