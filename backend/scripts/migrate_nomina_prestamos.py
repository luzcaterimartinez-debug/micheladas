"""
Préstamos a empleados y descuento en recibos de nómina.
Ejecutar desde backend/:
  python -m scripts.migrate_nomina_prestamos
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import get_db


def main() -> None:
    with get_db() as (conn, cursor):
        cursor.execute(
            """
            SELECT COUNT(*) AS c FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'nomina_recibos'
              AND COLUMN_NAME = 'descuento_prestamos'
            """
        )
        if cursor.fetchone()["c"] == 0:
            cursor.execute(
                """
                ALTER TABLE nomina_recibos
                  ADD COLUMN descuento_prestamos DECIMAL(10, 2) NOT NULL DEFAULT 0
                    AFTER deducciones
                """
            )
            print("Columna descuento_prestamos en nomina_recibos.")

        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS nomina_prestamos (
              id CHAR(36) PRIMARY KEY,
              usuario_id INT UNSIGNED NOT NULL,
              concepto VARCHAR(200) NOT NULL,
              monto_total DECIMAL(12, 2) NOT NULL,
              saldo_pendiente DECIMAL(12, 2) NOT NULL,
              cuota_periodo DECIMAL(10, 2) NOT NULL,
              activo TINYINT(1) NOT NULL DEFAULT 1,
              creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
              INDEX idx_prestamo_usuario (usuario_id),
              INDEX idx_prestamo_activo (activo),
              CONSTRAINT fk_prestamo_usuario FOREIGN KEY (usuario_id)
                REFERENCES usuarios (id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS nomina_prestamo_abonos (
              id CHAR(36) PRIMARY KEY,
              prestamo_id CHAR(36) NOT NULL,
              recibo_id CHAR(36) NOT NULL,
              monto DECIMAL(10, 2) NOT NULL,
              creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
              UNIQUE KEY uk_abono_recibo_prestamo (recibo_id, prestamo_id),
              INDEX idx_abono_prestamo (prestamo_id),
              CONSTRAINT fk_abono_prestamo FOREIGN KEY (prestamo_id)
                REFERENCES nomina_prestamos (id) ON DELETE CASCADE,
              CONSTRAINT fk_abono_recibo FOREIGN KEY (recibo_id)
                REFERENCES nomina_recibos (id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """
        )
        conn.commit()
    print("Préstamos de nómina listos.")


if __name__ == "__main__":
    main()
