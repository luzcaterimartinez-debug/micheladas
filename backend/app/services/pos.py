from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException, status

from app.cache import cache_invalidate, query_cache
from app.config import get_settings
from app.database import fetch_all, fetch_one, get_db
from app.services.inventario import apply_order_deductions, invalidate_inventario_cache
from app.models.pos import (
    ComandaCreate,
    ComandaOut,
    ComandaUpdate,
    MesaCreate,
    MesaOut,
    MesaUpdate,
    OrderItemOut,
)

DEFAULT_MESAS: list[tuple[str, str, int, int]] = [
    ("m1", "Mesa 1", 4, 1),
    ("m2", "Mesa 2", 4, 2),
    ("m3", "Mesa 3", 2, 3),
    ("m4", "Mesa 4", 6, 4),
    ("m5", "Mesa 5", 4, 5),
    ("barra", "Barra", 8, 6),
    ("llevar", "Para llevar", 0, 7),
]

COMANDAS_SELECT = """
  id, folio, orden_cola, cliente, mesa_id, mesa_nombre, total, status, creado_en, mesero_id,
  pagado, metodo_pago, monto_pagado, propina,
  pago_efectivo, pago_tarjeta, pago_transferencia, pagado_en, cobrado_por
"""
COMANDAS_CACHE_PREFIX = "comandas:"
MESAS_CACHE_KEY = "mesas:list"


def invalidate_mesas_cache() -> None:
    cache_invalidate("mesas:")


def invalidate_comandas_cache() -> None:
    cache_invalidate(COMANDAS_CACHE_PREFIX)


def invalidate_pos_cache() -> None:
    invalidate_mesas_cache()
    invalidate_comandas_cache()


def _comandas_cache_ttl() -> float:
    return float(get_settings().query_cache_comandas_ttl_seconds)


def _ts_ms(dt: datetime | None) -> int:
    if dt is None:
        return int(datetime.now(timezone.utc).timestamp() * 1000)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return int(dt.timestamp() * 1000)


def _parse_json_list(raw: Any) -> list:
    if raw is None:
        return []
    if isinstance(raw, list):
        return raw
    if isinstance(raw, (bytes, bytearray)):
        raw = raw.decode()
    if isinstance(raw, str):
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return []
    return []


def _row_to_item(row: dict[str, Any]) -> OrderItemOut:
    additions_raw = _parse_json_list(row.get("adiciones_json"))
    additions = [
        {"id": str(a["id"]), "name": str(a["name"]), "price": float(a["price"])}
        for a in additions_raw
        if isinstance(a, dict) and "id" in a
    ]
    return OrderItemOut(
        id=str(row["id"]),
        micheladaId=str(row["producto_id"]),
        micheladaName=str(row["producto_nombre"]),
        size=row["tamano"],
        basePrice=float(row["precio_base"]),
        quantity=int(row.get("cantidad") or 1),
        selectedToppings=[str(t) for t in _parse_json_list(row.get("toppings_json"))],
        additions=additions,
        notes=row.get("notas") or None,
        total=float(row["total"]),
    )


def _load_items(cursor: Any, comanda_id: str) -> list[OrderItemOut]:
    rows = fetch_all(
        cursor,
        """
        SELECT id, producto_id, producto_nombre, tamano, precio_base, cantidad,
               toppings_json, adiciones_json, notas, total
        FROM comanda_items
        WHERE comanda_id = %s
        ORDER BY orden ASC, id ASC
        """,
        (comanda_id,),
    )
    return [_row_to_item(r) for r in rows]


def _row_to_comanda(cursor: Any, row: dict[str, Any]) -> ComandaOut:
    items = _load_items(cursor, str(row["id"]))
    mesero_raw = row.get("mesero_id")
    cobrado_raw = row.get("cobrado_por")
    pagado_en = row.get("pagado_en")
    return ComandaOut(
        id=str(row["id"]),
        folio=int(row["folio"]),
        queueOrder=int(row.get("orden_cola") or 1),
        cliente=str(row["cliente"]),
        mesa=row.get("mesa_nombre"),
        mesaId=row.get("mesa_id"),
        meseroId=int(mesero_raw) if mesero_raw is not None else None,
        items=items,
        total=float(row["total"]),
        createdAt=_ts_ms(row.get("creado_en")),
        status=row["status"],
        pagado=bool(row.get("pagado")),
        metodoPago=row.get("metodo_pago"),
        montoPagado=float(row["monto_pagado"]) if row.get("monto_pagado") is not None else None,
        propina=float(row.get("propina") or 0),
        pagoEfectivo=float(row["pago_efectivo"]) if row.get("pago_efectivo") is not None else None,
        pagoTarjeta=float(row["pago_tarjeta"]) if row.get("pago_tarjeta") is not None else None,
        pagoTransferencia=float(row["pago_transferencia"]) if row.get("pago_transferencia") is not None else None,
        pagadoEn=_ts_ms(pagado_en) if pagado_en else None,
        cobradoPorId=int(cobrado_raw) if cobrado_raw is not None else None,
    )


def list_mesas() -> list[MesaOut]:
    return query_cache(MESAS_CACHE_KEY, _list_mesas_db)


def _list_mesas_db() -> list[MesaOut]:
    with get_db() as (conn, cursor):
        rows = fetch_all(
            cursor,
            """
            SELECT id, nombre, capacidad, estado, cliente
            FROM mesas
            ORDER BY orden ASC, nombre ASC
            """,
        )
        if not rows:
            for mid, nombre, cap, orden in DEFAULT_MESAS:
                cursor.execute(
                    """
                    INSERT IGNORE INTO mesas (id, nombre, capacidad, estado, orden)
                    VALUES (%s, %s, %s, 'libre', %s)
                    """,
                    (mid, nombre, cap, orden),
                )
            conn.commit()
            rows = fetch_all(
                cursor,
                """
                SELECT id, nombre, capacidad, estado, cliente
                FROM mesas
                ORDER BY orden ASC, nombre ASC
                """,
            )
    return [
        MesaOut(
            id=str(r["id"]),
            nombre=str(r["nombre"]),
            capacidad=int(r["capacidad"]),
            estado=r["estado"],
            cliente=r.get("cliente"),
        )
        for r in rows
    ]


def seed_mesas_if_empty() -> None:
    with get_db() as (conn, cursor):
        row = fetch_one(cursor, "SELECT COUNT(*) AS n FROM mesas")
        if row and int(row["n"]) > 0:
            return
        for mid, nombre, cap, orden in DEFAULT_MESAS:
            cursor.execute(
                """
                INSERT INTO mesas (id, nombre, capacidad, estado, orden)
                VALUES (%s, %s, %s, 'libre', %s)
                """,
                (mid, nombre, cap, orden),
            )
        conn.commit()


def create_mesa(body: MesaCreate) -> MesaOut:
    mesa_id = str(uuid.uuid4())
    with get_db() as (conn, cursor):
        orden_row = fetch_one(cursor, "SELECT COALESCE(MAX(orden), 0) AS m FROM mesas")
        orden = int(orden_row["m"]) + 1 if orden_row else 1
        cursor.execute(
            """
            INSERT INTO mesas (id, nombre, capacidad, estado, orden)
            VALUES (%s, %s, %s, 'libre', %s)
            """,
            (mesa_id, body.nombre.strip(), body.capacidad, orden),
        )
        conn.commit()
        row = fetch_one(
            cursor,
            "SELECT id, nombre, capacidad, estado, cliente FROM mesas WHERE id = %s",
            (mesa_id,),
        )
    invalidate_mesas_cache()
    assert row is not None
    return MesaOut(
        id=str(row["id"]),
        nombre=str(row["nombre"]),
        capacidad=int(row["capacidad"]),
        estado=row["estado"],
        cliente=row.get("cliente"),
    )


def delete_mesa(mesa_id: str) -> None:
    with get_db() as (conn, cursor):
        activas = fetch_one(
            cursor,
            """
            SELECT COUNT(*) AS n FROM comandas
            WHERE mesa_id = %s AND status IN ('pendiente', 'lista')
            """,
            (mesa_id,),
        )
        if activas and int(activas["n"]) > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="No se puede eliminar: hay comandas activas en esta mesa",
            )
        cursor.execute("DELETE FROM mesas WHERE id = %s", (mesa_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mesa no encontrada")
        conn.commit()
    invalidate_mesas_cache()


def delete_comanda(comanda_id: str) -> None:
    with get_db() as (conn, cursor):
        cursor.execute("DELETE FROM comandas WHERE id = %s", (comanda_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comanda no encontrada")
        conn.commit()
    invalidate_comandas_cache()


def marcar_mesa_atendida(mesa_id: str) -> MesaOut:
    """Cierra comandas activas de la mesa y la deja libre."""
    if mesa_id == "llevar":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Para llevar no usa estado de mesa",
        )
    with get_db() as (conn, cursor):
        existing = fetch_one(cursor, "SELECT id FROM mesas WHERE id = %s", (mesa_id,))
        if not existing:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mesa no encontrada")

        cursor.execute(
            """
            UPDATE comandas SET status = 'entregada'
            WHERE mesa_id = %s AND status IN ('pendiente', 'lista')
            """,
            (mesa_id,),
        )
        cursor.execute(
            """
            UPDATE mesas SET estado = 'libre', cliente = NULL WHERE id = %s
            """,
            (mesa_id,),
        )
        conn.commit()
        row = fetch_one(
            cursor,
            "SELECT id, nombre, capacidad, estado, cliente FROM mesas WHERE id = %s",
            (mesa_id,),
        )
    invalidate_pos_cache()
    assert row is not None
    return MesaOut(
        id=str(row["id"]),
        nombre=str(row["nombre"]),
        capacidad=int(row["capacidad"]),
        estado=row["estado"],
        cliente=row.get("cliente"),
    )


def update_mesa(mesa_id: str, patch: MesaUpdate) -> MesaOut:
    with get_db() as (conn, cursor):
        existing = fetch_one(cursor, "SELECT id FROM mesas WHERE id = %s", (mesa_id,))
        if not existing:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mesa no encontrada")

        fields: list[str] = []
        params: list[Any] = []
        if patch.estado is not None:
            fields.append("estado = %s")
            params.append(patch.estado)
        if patch.cliente is not None:
            fields.append("cliente = %s")
            params.append(patch.cliente.strip() or None)
        if patch.nombre is not None:
            fields.append("nombre = %s")
            params.append(patch.nombre.strip())
        if patch.capacidad is not None:
            fields.append("capacidad = %s")
            params.append(patch.capacidad)

        if not fields:
            row = fetch_one(
                cursor,
                "SELECT id, nombre, capacidad, estado, cliente FROM mesas WHERE id = %s",
                (mesa_id,),
            )
        else:
            params.append(mesa_id)
            cursor.execute(
                f"UPDATE mesas SET {', '.join(fields)} WHERE id = %s",
                tuple(params),
            )
            conn.commit()
            row = fetch_one(
                cursor,
                "SELECT id, nombre, capacidad, estado, cliente FROM mesas WHERE id = %s",
                (mesa_id,),
            )

    invalidate_mesas_cache()
    assert row is not None
    return MesaOut(
        id=str(row["id"]),
        nombre=str(row["nombre"]),
        capacidad=int(row["capacidad"]),
        estado=row["estado"],
        cliente=row.get("cliente"),
    )


def _resolve_mesa(cursor: Any, mesa_id: str | None, mesa_nombre: str | None) -> tuple[str | None, str | None]:
    if mesa_id:
        row = fetch_one(cursor, "SELECT id, nombre FROM mesas WHERE id = %s", (mesa_id,))
        if row:
            return str(row["id"]), str(row["nombre"])
    if mesa_nombre:
        row = fetch_one(cursor, "SELECT id, nombre FROM mesas WHERE nombre = %s", (mesa_nombre,))
        if row:
            return str(row["id"]), str(row["nombre"])
        return None, mesa_nombre
    return None, None


def _next_folio(cursor: Any) -> int:
    row = fetch_one(cursor, "SELECT COALESCE(MAX(folio), 1000) AS ultimo FROM comandas")
    return int(row["ultimo"]) + 1 if row else 1001


def _next_orden_cola(cursor: Any) -> int:
    row = fetch_one(
        cursor,
        """
        SELECT COALESCE(MAX(orden_cola), 0) AS ultimo
        FROM comandas
        WHERE DATE(creado_en) = CURDATE()
        """,
    )
    return int(row["ultimo"]) + 1 if row else 1


def list_comandas(
    *,
    status_filter: str | None = None,
    mesa_id: str | None = None,
    pagado: bool | None = None,
    limit: int = 200,
) -> list[ComandaOut]:
    key = f"{COMANDAS_CACHE_PREFIX}list:{status_filter or ''}:{mesa_id or ''}:{pagado}:{limit}"
    return query_cache(
        key,
        lambda: _list_comandas_db(
            status_filter=status_filter,
            mesa_id=mesa_id,
            pagado=pagado,
            limit=limit,
        ),
        ttl_seconds=_comandas_cache_ttl(),
    )


def _list_comandas_db(
    *,
    status_filter: str | None = None,
    mesa_id: str | None = None,
    pagado: bool | None = None,
    limit: int = 200,
) -> list[ComandaOut]:
    with get_db() as (_, cursor):
        query = f"""
            SELECT {COMANDAS_SELECT}
            FROM comandas
        """
        params: list[Any] = []
        clauses: list[str] = []
        if status_filter:
            statuses = [s.strip() for s in status_filter.split(",") if s.strip()]
            if statuses:
                placeholders = ", ".join(["%s"] * len(statuses))
                clauses.append(f"status IN ({placeholders})")
                params.extend(statuses)
        if mesa_id:
            clauses.append("mesa_id = %s")
            params.append(mesa_id)
        if pagado is not None:
            clauses.append("pagado = %s")
            params.append(1 if pagado else 0)
        if clauses:
            query += " WHERE " + " AND ".join(clauses)
        query += " ORDER BY orden_cola ASC, creado_en ASC LIMIT %s"
        params.append(limit)
        rows = fetch_all(cursor, query, tuple(params))
        return [_row_to_comanda(cursor, r) for r in rows]


def get_comanda(comanda_id: str) -> ComandaOut:
    key = f"{COMANDAS_CACHE_PREFIX}one:{comanda_id}"
    return query_cache(
        key,
        lambda: _get_comanda_db(comanda_id),
        ttl_seconds=_comandas_cache_ttl(),
    )


def _get_comanda_db(comanda_id: str) -> ComandaOut:
    with get_db() as (_, cursor):
        row = fetch_one(
            cursor,
            f"""
            SELECT {COMANDAS_SELECT}
            FROM comandas
            WHERE id = %s
            """,
            (comanda_id,),
        )
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comanda no encontrada")
        return _row_to_comanda(cursor, row)


def create_comanda(body: ComandaCreate, mesero_id: int | None) -> ComandaOut:
    with get_db() as (conn, cursor):
        if body.id:
            existing = fetch_one(
                cursor,
                f"""
                SELECT {COMANDAS_SELECT}
                FROM comandas WHERE id = %s
                """,
                (body.id,),
            )
            if existing:
                return _row_to_comanda(cursor, existing)
            comanda_id = body.id
        else:
            comanda_id = str(uuid.uuid4())

        mesa_id, mesa_nombre = _resolve_mesa(cursor, body.mesaId, body.mesa)
        folio = _next_folio(cursor)
        orden_cola = _next_orden_cola(cursor)
        cursor.execute(
            """
            INSERT INTO comandas (id, folio, orden_cola, cliente, mesa_id, mesa_nombre, total, status, mesero_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 'pendiente', %s)
            """,
            (
                comanda_id,
                folio,
                orden_cola,
                body.cliente.strip(),
                mesa_id,
                mesa_nombre,
                body.total,
                mesero_id,
            ),
        )
        for i, item in enumerate(body.items):
            cursor.execute(
                """
                INSERT INTO comanda_items (
                  id, comanda_id, producto_id, producto_nombre, tamano, precio_base, cantidad,
                  toppings_json, adiciones_json, notas, total, orden
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    item.id or str(uuid.uuid4()),
                    comanda_id,
                    item.micheladaId,
                    item.micheladaName,
                    item.size,
                    item.basePrice,
                    item.quantity,
                    json.dumps(item.selectedToppings),
                    json.dumps([a.model_dump() for a in item.additions]),
                    item.notes,
                    item.total,
                    i,
                ),
            )
        if mesa_id and mesa_id != "llevar":
            cursor.execute(
                """
                UPDATE mesas SET estado = 'ocupada', cliente = %s WHERE id = %s
                """,
                (body.cliente.strip(), mesa_id),
            )
        apply_order_deductions(cursor, body.items)
        conn.commit()
        invalidate_inventario_cache()
        invalidate_pos_cache()
        row = fetch_one(
            cursor,
            f"""
            SELECT {COMANDAS_SELECT}
            FROM comandas WHERE id = %s
            """,
            (comanda_id,),
        )
    assert row is not None
    with get_db() as (_, cursor):
        return _row_to_comanda(cursor, row)


def update_comanda(comanda_id: str, patch: ComandaUpdate) -> ComandaOut:
    with get_db() as (conn, cursor):
        existing = fetch_one(
            cursor,
            "SELECT id, mesa_id, status FROM comandas WHERE id = %s",
            (comanda_id,),
        )
        if not existing:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comanda no encontrada")

        fields: list[str] = []
        params: list[Any] = []
        if patch.status is not None:
            fields.append("status = %s")
            params.append(patch.status)
        if patch.cliente is not None:
            fields.append("cliente = %s")
            params.append(patch.cliente.strip())
        if patch.mesaId is not None or patch.mesa is not None:
            mesa_id, mesa_nombre = _resolve_mesa(cursor, patch.mesaId, patch.mesa)
            fields.append("mesa_id = %s")
            params.append(mesa_id)
            fields.append("mesa_nombre = %s")
            params.append(mesa_nombre)

        if fields:
            params.append(comanda_id)
            cursor.execute(
                f"UPDATE comandas SET {', '.join(fields)} WHERE id = %s",
                tuple(params),
            )

        if patch.status == "entregada" and existing.get("mesa_id"):
            pendientes = fetch_one(
                cursor,
                """
                SELECT COUNT(*) AS n FROM comandas
                WHERE mesa_id = %s AND status IN ('pendiente', 'lista') AND id != %s
                """,
                (existing["mesa_id"], comanda_id),
            )
            if pendientes and int(pendientes["n"]) == 0:
                cursor.execute(
                    """
                    UPDATE mesas SET estado = 'libre', cliente = NULL WHERE id = %s
                    """,
                    (existing["mesa_id"],),
                )

        conn.commit()
        row = fetch_one(
            cursor,
            f"""
            SELECT {COMANDAS_SELECT}
            FROM comandas WHERE id = %s
            """,
            (comanda_id,),
        )
    invalidate_pos_cache()
    assert row is not None
    with get_db() as (_, cursor):
        return _row_to_comanda(cursor, row)
