"""
Crea la fase "Tipo de cerveza" y la asigna a productos *_cerveza.

Ejecutar desde backend/:
  python -m scripts.migrate_fase_cerveza
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import get_db
from app.services.menu import invalidate_menu_cache
from app.services.menu_cerveza import OPCIONES, ensure_fase_cerveza


def main() -> None:
    with get_db() as (conn, cursor):
        n = ensure_fase_cerveza(cursor)
        conn.commit()
    invalidate_menu_cache()
    print(f"Fase cerveza lista: {n} productos *_cerveza con {len(OPCIONES)} variaciones.")


if __name__ == "__main__":
    main()
