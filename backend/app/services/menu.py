from decimal import Decimal
from typing import Any

from fastapi import HTTPException, status

from app.cache import cache_invalidate, query_cache
from app.database import fetch_all, fetch_one, get_db
from app.menu_constants import parse_pasos, pasos_to_json, slugify
from app.models.menu import (
    AdicionOut,
    CategoriaOut,
    ConsumoLine,
    FaseOpcionOut,
    FaseOut,
    MenuOut,
    ProductoOut,
)
from app.services.inventario import load_producto_consumo


def _float(v: Any) -> float:
    return float(v) if isinstance(v, Decimal) else float(v)


def _opcion_out(row: dict[str, Any]) -> FaseOpcionOut:
    return FaseOpcionOut(
        id=row["id"],
        name=row["nombre"],
        faseId=row["fase_id"],
        faseName=row.get("fase_nombre") or row.get("fase_id", ""),
        stockKey=row.get("inventario_clave"),
        cantidad=float(row.get("cantidad") or 1),
    )


def _consumo_lines(cursor: Any, producto_id: str) -> list[ConsumoLine]:
    return [
        ConsumoLine(clave=clave, cantidad=cantidad)
        for clave, cantidad in load_producto_consumo(cursor, producto_id)
    ]


def _load_fase_catalog(cursor) -> tuple[list[FaseOut], dict[str, str]]:
    fases_rows = fetch_all(
        cursor,
        """
        SELECT id, nombre, descripcion, activo, orden
        FROM menu_fases
        ORDER BY orden ASC, nombre ASC
        """,
    )
    opciones_rows = fetch_all(
        cursor,
        """
        SELECT o.id, o.nombre, o.fase_id, o.inventario_clave, o.cantidad, f.nombre AS fase_nombre
        FROM menu_fase_opciones o
        JOIN menu_fases f ON f.id = o.fase_id
        ORDER BY f.orden ASC, o.nombre ASC
        """,
    )
    fase_names = {r["id"]: r["nombre"] for r in fases_rows}
    opciones_by_fase: dict[str, list[FaseOpcionOut]] = {}
    for row in opciones_rows:
        opciones_by_fase.setdefault(row["fase_id"], []).append(_opcion_out(row))
    fases = [
        FaseOut(
            id=r["id"],
            name=r["nombre"],
            description=r["descripcion"] or "",
            activo=bool(r["activo"]),
            opciones=opciones_by_fase.get(r["id"], []),
        )
        for r in fases_rows
    ]
    return fases, fase_names


def _load_product_opciones(cursor, producto_id: str, fase_names: dict[str, str]) -> list[FaseOpcionOut]:
    rows = fetch_all(
        cursor,
        """
        SELECT o.id, o.nombre, o.fase_id, o.inventario_clave, o.cantidad
        FROM menu_fase_opciones o
        JOIN menu_producto_fase_opcion pfo ON pfo.opcion_id = o.id
        WHERE pfo.producto_id = %s
        ORDER BY o.fase_id, o.nombre
        """,
        (producto_id,),
    )
    return [
        FaseOpcionOut(
            id=r["id"],
            name=r["nombre"],
            faseId=r["fase_id"],
            faseName=fase_names.get(r["fase_id"], r["fase_id"]),
            stockKey=r.get("inventario_clave"),
            cantidad=float(r.get("cantidad") or 1),
        )
        for r in rows
    ]


def _producto_out(
    row: dict[str, Any],
    opciones: list[FaseOpcionOut],
    fase_ids: list[str],
    consumo: list[ConsumoLine] | None = None,
) -> ProductoOut:
    return ProductoOut(
        id=row["id"],
        name=row["nombre"],
        price=_float(row["precio"]),
        description=row["descripcion"] or "",
        faseOpciones=opciones,
        consumo=consumo or [],
        pasos=parse_pasos(row.get("pasos"), fase_ids),
        categoria_id=row["categoria_id"],
        activo=bool(row["activo"]),
    )


def get_producto_by_id(cursor, producto_id: str) -> ProductoOut | None:
    row = fetch_one(
        cursor,
        """
        SELECT id, nombre, precio, descripcion, activo, pasos, categoria_id
        FROM menu_productos WHERE id = %s
        """,
        (producto_id,),
    )
    if row is None:
        return None
    _, fase_names = _load_fase_catalog(cursor)
    active_fase_ids = [fid for fid, name in fase_names.items()]
    opciones = _load_product_opciones(cursor, producto_id, fase_names)
    consumo = _consumo_lines(cursor, producto_id)
    return _producto_out(row, opciones, active_fase_ids, consumo)


def sync_product_opciones(cursor, producto_id: str, opcion_ids: list[str]) -> None:
    cursor.execute("DELETE FROM menu_producto_fase_opcion WHERE producto_id = %s", (producto_id,))
    for oid in opcion_ids:
        cursor.execute(
            "INSERT IGNORE INTO menu_producto_fase_opcion (producto_id, opcion_id) VALUES (%s, %s)",
            (producto_id, oid),
        )


def sync_product_toppings(cursor, producto_id: str, topping_ids: list[str]) -> None:
    """Compatibilidad: topping_ids = opcion_ids."""
    sync_product_opciones(cursor, producto_id, topping_ids)


MENU_CACHE_PREFIX = "menu:"


def invalidate_menu_cache() -> None:
    cache_invalidate(MENU_CACHE_PREFIX)


def load_menu(*, include_inactive: bool = False) -> MenuOut:
    key = f"{MENU_CACHE_PREFIX}{'all' if include_inactive else 'active'}"
    return query_cache(key, lambda: _load_menu_db(include_inactive=include_inactive))


def _load_menu_db(*, include_inactive: bool = False) -> MenuOut:
    with get_db() as (_, cursor):
        fases, fase_names = _load_fase_catalog(cursor)
        active_fase_ids = [f.id for f in fases if include_inactive or f.activo]

        cat_filter = "" if include_inactive else "WHERE c.activo = 1"
        categorias_rows = fetch_all(
            cursor,
            f"""
            SELECT c.id, c.nombre, c.descripcion, c.activo
            FROM menu_categorias c
            {cat_filter}
            ORDER BY c.orden ASC, c.nombre ASC
            """,
        )

        prod_filter = "WHERE p.activo = 1" if not include_inactive else ""
        productos_rows = fetch_all(
            cursor,
            f"""
            SELECT p.id, p.nombre, p.precio, p.descripcion, p.activo, p.pasos, p.categoria_id, p.orden
            FROM menu_productos p
            {prod_filter}
            ORDER BY p.orden ASC, p.nombre ASC
            """,
        )

        adic_filter = "" if include_inactive else "WHERE activo = 1"
        adiciones_rows = fetch_all(
            cursor,
            f"""
            SELECT id, nombre, precio, stock_key, cantidad, activo
            FROM menu_adiciones
            {adic_filter}
            ORDER BY orden ASC, nombre ASC
            """,
        )

        productos_by_cat: dict[str, list[ProductoOut]] = {}
        _, fase_names = _load_fase_catalog(cursor)
        for r in productos_rows:
            opciones = _load_product_opciones(cursor, r["id"], fase_names)
            consumo = _consumo_lines(cursor, r["id"])
            p = _producto_out(r, opciones, active_fase_ids, consumo)
            productos_by_cat.setdefault(r["categoria_id"], []).append(p)

    categorias: list[CategoriaOut] = []
    seen_cat_ids = {c["id"] for c in categorias_rows}

    for c in categorias_rows:
        prods = productos_by_cat.get(c["id"], [])
        if not include_inactive and not prods:
            continue
        categorias.append(
            CategoriaOut(
                id=c["id"],
                name=c["nombre"],
                description=c["descripcion"] or "",
                activo=bool(c["activo"]),
                productos=prods,
            )
        )

    for cat_id, prods in productos_by_cat.items():
        if cat_id not in seen_cat_ids and prods:
            categorias.append(
                CategoriaOut(
                    id=cat_id,
                    name="Otros",
                    description="",
                    activo=True,
                    productos=prods,
                )
            )

    adiciones = [
        AdicionOut(
            id=r["id"],
            name=r["nombre"],
            price=_float(r["precio"]),
            stockKey=r["stock_key"],
            cantidad=float(r.get("cantidad") or 1),
            activo=bool(r["activo"]),
        )
        for r in adiciones_rows
    ]

    fases_out = fases if include_inactive else [f for f in fases if f.activo]
    return MenuOut(categorias=categorias, adiciones=adiciones, fases=fases_out)


def list_fases(*, include_inactive: bool = True) -> list[FaseOut]:
    key = f"{MENU_CACHE_PREFIX}fases:{'all' if include_inactive else 'active'}"
    fases = query_cache(key, lambda: _list_fases_db())
    if include_inactive:
        return fases
    return [f for f in fases if f.activo]


def _list_fases_db() -> list[FaseOut]:
    with get_db() as (_, cursor):
        fases, _ = _load_fase_catalog(cursor)
    return fases


def list_all_toppings() -> list[FaseOpcionOut]:
    """Compatibilidad admin: catálogo plano de opciones."""
    return query_cache(
        f"{MENU_CACHE_PREFIX}toppings",
        _list_all_toppings_db,
    )


def _list_all_toppings_db() -> list[FaseOpcionOut]:
    with get_db() as (_, cursor):
        rows = fetch_all(
            cursor,
            """
            SELECT o.id, o.nombre, o.fase_id, o.inventario_clave, o.cantidad, f.nombre AS fase_nombre
            FROM menu_fase_opciones o
            JOIN menu_fases f ON f.id = o.fase_id
            ORDER BY f.orden, o.nombre
            """,
        )
    return [_opcion_out(r) for r in rows]


def create_fase(nombre: str, descripcion: str, activo: bool) -> FaseOut:
    fase_id = slugify(nombre)
    with get_db() as (conn, cursor):
        if fetch_one(cursor, "SELECT id FROM menu_fases WHERE id = %s", (fase_id,)):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Esa fase ya existe")
        cursor.execute("SELECT COALESCE(MAX(orden), 0) + 1 AS n FROM menu_fases")
        orden = cursor.fetchone()["n"]
        cursor.execute(
            """
            INSERT INTO menu_fases (id, nombre, descripcion, activo, orden)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (fase_id, nombre.strip(), descripcion.strip(), int(activo), orden),
        )
        conn.commit()
    invalidate_menu_cache()
    return FaseOut(id=fase_id, name=nombre.strip(), description=descripcion.strip(), activo=activo, opciones=[])


def update_fase(fase_id: str, **fields: Any) -> FaseOut:
    with get_db() as (conn, cursor):
        row = fetch_one(
            cursor,
            "SELECT id, nombre, descripcion, activo FROM menu_fases WHERE id = %s",
            (fase_id,),
        )
        if not row:
            raise HTTPException(status_code=404, detail="Fase no encontrada")
        nombre = fields.get("nombre", row["nombre"])
        descripcion = fields.get("descripcion", row["descripcion"])
        activo = fields.get("activo", row["activo"])
        orden = fields.get("orden")
        if orden is not None:
            cursor.execute(
                "UPDATE menu_fases SET nombre = %s, descripcion = %s, activo = %s, orden = %s WHERE id = %s",
                (nombre, descripcion, int(activo), orden, fase_id),
            )
        else:
            cursor.execute(
                "UPDATE menu_fases SET nombre = %s, descripcion = %s, activo = %s WHERE id = %s",
                (nombre, descripcion, int(activo), fase_id),
            )
        conn.commit()
    invalidate_menu_cache()
    fases = list_fases()
    return next((f for f in fases if f.id == fase_id), FaseOut(id=fase_id, name=nombre, description=descripcion, activo=bool(activo)))


def create_fase_opcion(
    fase_id: str,
    nombre: str,
    inventario_clave: str | None = None,
    cantidad: float = 1,
) -> FaseOpcionOut:
    opcion_id = slugify(f"{fase_id}_{nombre}")
    with get_db() as (conn, cursor):
        if not fetch_one(cursor, "SELECT id FROM menu_fases WHERE id = %s", (fase_id,)):
            raise HTTPException(status_code=404, detail="Fase no encontrada")
        cursor.execute(
            """
            INSERT INTO menu_fase_opciones (id, fase_id, nombre, inventario_clave, cantidad)
            VALUES (%s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
              nombre = VALUES(nombre),
              inventario_clave = VALUES(inventario_clave),
              cantidad = VALUES(cantidad)
            """,
            (opcion_id, fase_id, nombre.strip(), inventario_clave or None, cantidad),
        )
        fase_row = fetch_one(cursor, "SELECT nombre FROM menu_fases WHERE id = %s", (fase_id,))
        row = fetch_one(
            cursor,
            """
            SELECT o.id, o.nombre, o.fase_id, o.inventario_clave, o.cantidad, f.nombre AS fase_nombre
            FROM menu_fase_opciones o
            JOIN menu_fases f ON f.id = o.fase_id
            WHERE o.id = %s
            """,
            (opcion_id,),
        )
        conn.commit()
    invalidate_menu_cache()
    return _opcion_out(row) if row else FaseOpcionOut(
        id=opcion_id,
        name=nombre.strip(),
        faseId=fase_id,
        faseName=fase_row["nombre"] if fase_row else fase_id,
        stockKey=inventario_clave,
        cantidad=cantidad,
    )


def update_fase_opcion(
    opcion_id: str,
    nombre: str | None = None,
    inventario_clave: str | None = None,
    cantidad: float | None = None,
    *,
    clear_inventario: bool = False,
) -> FaseOpcionOut:
    with get_db() as (conn, cursor):
        row = fetch_one(
            cursor,
            """
            SELECT o.id, o.nombre, o.fase_id, o.inventario_clave, o.cantidad, f.nombre AS fase_nombre
            FROM menu_fase_opciones o
            JOIN menu_fases f ON f.id = o.fase_id
            WHERE o.id = %s
            """,
            (opcion_id,),
        )
        if not row:
            raise HTTPException(status_code=404, detail="Opción no encontrada")
        new_nombre = nombre.strip() if nombre else row["nombre"]
        if clear_inventario:
            new_clave = None
        elif inventario_clave is not None:
            new_clave = inventario_clave or None
        else:
            new_clave = row.get("inventario_clave")
        new_cantidad = cantidad if cantidad is not None else float(row.get("cantidad") or 1)
        cursor.execute(
            """
            UPDATE menu_fase_opciones
            SET nombre = %s, inventario_clave = %s, cantidad = %s
            WHERE id = %s
            """,
            (new_nombre, new_clave, new_cantidad, opcion_id),
        )
        row = fetch_one(
            cursor,
            """
            SELECT o.id, o.nombre, o.fase_id, o.inventario_clave, o.cantidad, f.nombre AS fase_nombre
            FROM menu_fase_opciones o
            JOIN menu_fases f ON f.id = o.fase_id
            WHERE o.id = %s
            """,
            (opcion_id,),
        )
        conn.commit()
    invalidate_menu_cache()
    return _opcion_out(row)


def delete_fase_opcion(opcion_id: str) -> None:
    with get_db() as (conn, cursor):
        cursor.execute("DELETE FROM menu_fase_opciones WHERE id = %s", (opcion_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Opción no encontrada")
        conn.commit()
    invalidate_menu_cache()


def delete_adicion(adicion_id: str) -> None:
    with get_db() as (conn, cursor):
        cursor.execute("DELETE FROM menu_adiciones WHERE id = %s", (adicion_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Adición no encontrada")
        conn.commit()
    invalidate_menu_cache()

