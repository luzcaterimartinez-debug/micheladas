from __future__ import annotations

from collections import defaultdict
from typing import Any

from fastapi import HTTPException, status

from app.cache import cache_invalidate, query_cache
from app.database import fetch_all, fetch_one, get_db
from app.models.inventario import InventarioOut, InventarioUpdate
from app.models.pos import OrderItemIn

DEFAULT_ITEMS: list[dict[str, Any]] = [
    {"clave": "cerveza", "nombre": "Cerveza (botellas)", "stock": 96, "unidad": "pz", "minimo": 10},
    {"clave": "clamato", "nombre": "Clamato", "stock": 8, "unidad": "L", "minimo": 2},
    {"clave": "limon", "nombre": "Limón", "stock": 100, "unidad": "pz", "minimo": 15},
    {"clave": "chamoy", "nombre": "Chamoy", "stock": 3, "unidad": "L", "minimo": 1},
    {"clave": "tajin", "nombre": "Tajín", "stock": 1500, "unidad": "g", "minimo": 200},
    {"clave": "camaron", "nombre": "Camarón cocido", "stock": 40, "unidad": "pz", "minimo": 5},
    {"clave": "pulpo", "nombre": "Pulpo", "stock": 20, "unidad": "pz", "minimo": 5},
    {"clave": "pepino", "nombre": "Pepino", "stock": 25, "unidad": "pz", "minimo": 5},
    {"clave": "jicama", "nombre": "Jícama", "stock": 15, "unidad": "pz", "minimo": 5},
    {"clave": "cacahuate", "nombre": "Cacahuates", "stock": 2000, "unidad": "g", "minimo": 300},
    {"clave": "gomitas", "nombre": "Gomitas enchiladas", "stock": 1500, "unidad": "g", "minimo": 200},
    {"clave": "rielitos", "nombre": "Rielitos", "stock": 60, "unidad": "pz", "minimo": 10},
]


def _row_to_out(row: dict[str, Any]) -> InventarioOut:
    return InventarioOut(
        key=str(row["clave"]),
        name=str(row["nombre"]),
        stock=float(row["stock"]),
        unit=str(row["unidad"]),
        minStock=float(row["minimo"]),
    )


INVENTARIO_CACHE_KEY = "inventario:list"


def invalidate_inventario_cache() -> None:
    cache_invalidate("inventario:")


def list_inventario() -> list[InventarioOut]:
    return query_cache(INVENTARIO_CACHE_KEY, _list_inventario_db)


def _list_inventario_db() -> list[InventarioOut]:
    with get_db() as (conn, cursor):
        count = fetch_one(cursor, "SELECT COUNT(*) AS n FROM inventario")
        if count and int(count["n"]) == 0:
            ensure_inventario_seeded(cursor)
            conn.commit()
        rows = fetch_all(
            cursor,
            """
            SELECT clave, nombre, stock, unidad, minimo
            FROM inventario
            ORDER BY nombre ASC
            """,
        )
        return [_row_to_out(r) for r in rows]


def update_stock(clave: str, body: InventarioUpdate) -> InventarioOut:
    with get_db() as (conn, cursor):
        row = fetch_one(
            cursor,
            "SELECT clave, nombre, stock, unidad, minimo FROM inventario WHERE clave = %s",
            (clave,),
        )
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ítem no encontrado")
        cursor.execute(
            "UPDATE inventario SET stock = %s WHERE clave = %s",
            (body.stock, clave),
        )
        conn.commit()
        invalidate_inventario_cache()
        row["stock"] = body.stock
        return _row_to_out(row)


def reset_inventario() -> list[InventarioOut]:
    with get_db() as (conn, cursor):
        cursor.execute(
            "UPDATE inventario SET stock = stock_inicial"
        )
        conn.commit()
    invalidate_inventario_cache()
    return list_inventario()


def delete_inventario_item(clave: str) -> None:
    with get_db() as (conn, cursor):
        row = fetch_one(cursor, "SELECT clave FROM inventario WHERE clave = %s", (clave,))
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ítem no encontrado")
        cursor.execute(
            "UPDATE menu_adiciones SET stock_key = NULL WHERE stock_key = %s",
            (clave,),
        )
        cursor.execute("DELETE FROM inventario WHERE clave = %s", (clave,))
        conn.commit()
    invalidate_inventario_cache()


def _consumo_por_producto(producto_id: str) -> list[tuple[str, float]]:
    base = [("cerveza", 1.0), ("limon", 2.0)]
    if producto_id.startswith("cubana"):
        base.append(("clamato", 0.2))
    return base


def _consumo_tuples(consumo: list | None, producto_id: str) -> list[tuple[str, float]]:
    if consumo:
        return [(str(c.clave if hasattr(c, "clave") else c["clave"]), float(
            c.cantidad if hasattr(c, "cantidad") else c["cantidad"]
        )) for c in consumo]
    return _consumo_por_producto(producto_id)


def sync_consumo_producto(
    cursor: Any,
    producto_id: str,
    consumo: list | None = None,
) -> None:
    cursor.execute("DELETE FROM producto_consumo WHERE producto_id = %s", (producto_id,))
    for clave, cantidad in _consumo_tuples(consumo, producto_id):
        if cantidad <= 0:
            continue
        cursor.execute(
            """
            INSERT INTO producto_consumo (producto_id, inventario_clave, cantidad)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE cantidad = VALUES(cantidad)
            """,
            (producto_id, clave, cantidad),
        )


def load_producto_consumo(cursor: Any, producto_id: str) -> list[tuple[str, float]]:
    rows = fetch_all(
        cursor,
        """
        SELECT inventario_clave, cantidad
        FROM producto_consumo
        WHERE producto_id = %s
        ORDER BY inventario_clave
        """,
        (producto_id,),
    )
    return [(str(r["inventario_clave"]), float(r["cantidad"])) for r in rows]


def _deduct_fase_opciones(cursor: Any, opcion_ids: list[str], totals: dict[str, float]) -> None:
    for opcion_id in opcion_ids:
        row = fetch_one(
            cursor,
            """
            SELECT inventario_clave, cantidad
            FROM menu_fase_opciones
            WHERE id = %s
            """,
            (opcion_id,),
        )
        if row and row.get("inventario_clave"):
            clave = str(row["inventario_clave"])
            qty = float(row["cantidad"] or 1)
            totals[clave] += qty
            continue
        inv = fetch_one(cursor, "SELECT clave FROM inventario WHERE clave = %s", (opcion_id,))
        if inv:
            totals[str(opcion_id)] += 1.0


def _sync_producto_consumo(cursor: Any) -> None:
    """Asegura filas de consumo para cada producto activo."""
    cursor.execute("SELECT id FROM menu_productos WHERE activo = 1")
    for row in cursor.fetchall():
        sync_consumo_producto(cursor, row["id"])


def apply_order_deductions(cursor: Any, items: list[OrderItemIn]) -> None:
    """Descuenta inventario según consumo por producto y adiciones del pedido."""
    totals: dict[str, float] = defaultdict(float)

    for item in items:
        rows = fetch_all(
            cursor,
            """
            SELECT inventario_clave, cantidad
            FROM producto_consumo
            WHERE producto_id = %s
            """,
            (item.micheladaId,),
        )
        if rows:
            for row in rows:
                totals[str(row["inventario_clave"])] += float(row["cantidad"])
        else:
            for clave, cantidad in _consumo_por_producto(item.micheladaId):
                totals[clave] += cantidad

        _deduct_fase_opciones(cursor, item.selectedToppings, totals)

        for adicion in item.additions:
            ad_row = fetch_one(
                cursor,
                "SELECT stock_key, cantidad FROM menu_adiciones WHERE id = %s",
                (adicion.id,),
            )
            stock_key = ad_row.get("stock_key") if ad_row else None
            if not stock_key and adicion.id:
                stock_key = adicion.id
            qty = float(ad_row["cantidad"] or 1) if ad_row else 1.0
            if stock_key and qty > 0:
                inv = fetch_one(
                    cursor, "SELECT clave FROM inventario WHERE clave = %s", (stock_key,)
                )
                if inv:
                    totals[str(stock_key)] += qty

    for clave, qty in totals.items():
        if qty <= 0:
            continue
        cursor.execute(
            """
            UPDATE inventario
            SET stock = GREATEST(0, stock - %s)
            WHERE clave = %s
            """,
            (qty, clave),
        )


def ensure_inventario_seeded(cursor: Any) -> None:
    for item in DEFAULT_ITEMS:
        cursor.execute(
            """
            INSERT INTO inventario (clave, nombre, stock, stock_inicial, unidad, minimo)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
              nombre = VALUES(nombre),
              unidad = VALUES(unidad),
              minimo = VALUES(minimo)
            """,
            (
                item["clave"],
                item["nombre"],
                item["stock"],
                item["stock"],
                item["unidad"],
                item["minimo"],
            ),
        )
    _sync_producto_consumo(cursor)
