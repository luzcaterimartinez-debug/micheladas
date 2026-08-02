"""
Agrega el sabor Maracuyá Sola con las mismas bases/precios que Maragumango.

Ejecutar desde backend/:
  python -m scripts.migrate_maracuya_sola
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import get_db
from app.services.inventario import sync_consumo_producto
from app.services.menu import invalidate_menu_cache
from app.services.menu_cerveza import ensure_fase_cerveza
from scripts.seed_menu import (
    BASES,
    PASOS,
    PASOS_CERVEZA,
    PRECIOS_ESTANDAR,
    _upsert_categoria,
    _upsert_producto,
)

CAT_ID = "maracuya_sola"
CAT_NOMBRE = "Maracuyá Sola"
CAT_DESC = "Solo maracuyá"


def main() -> None:
    with get_db() as (conn, cursor):
        cursor.execute("SELECT COALESCE(MAX(orden), 0) AS m FROM menu_categorias")
        orden = int(cursor.fetchone()["m"]) + 1
        # Preferir orden justo después de maragumango si existe.
        cursor.execute("SELECT orden FROM menu_categorias WHERE id = %s", ("maragumango",))
        row = cursor.fetchone()
        if row:
            orden = int(row["orden"]) + 1
            cursor.execute(
                "UPDATE menu_categorias SET orden = orden + 1 WHERE orden >= %s AND id <> %s",
                (orden, CAT_ID),
            )

        _upsert_categoria(cursor, CAT_ID, CAT_NOMBRE, CAT_DESC, orden)

        for i, (base_id, base_nombre) in enumerate(BASES):
            pid = f"{CAT_ID}_{base_id}"
            _upsert_producto(
                cursor,
                pid=pid,
                nombre=f"{CAT_NOMBRE} · {base_nombre}",
                precio=PRECIOS_ESTANDAR[i],
                descripcion=CAT_DESC,
                categoria_id=CAT_ID,
                orden=i + 1,
                pasos=PASOS_CERVEZA if base_id == "cerveza" else PASOS,
            )
            sync_consumo_producto(cursor, pid)

        n_cerv = ensure_fase_cerveza(cursor)
        conn.commit()

    invalidate_menu_cache()
    print(
        f"Maracuyá Sola lista: 5 bases (mismas variaciones que Maragumango), "
        f"fase cerveza ({n_cerv} productos)."
    )


if __name__ == "__main__":
    main()
