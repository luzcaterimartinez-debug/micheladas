from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Any

from fastapi import HTTPException, status

from app.cache import cache_invalidate, query_cache
from app.config import get_settings
from app.database import fetch_all, fetch_one, get_db
from app.models.gastos import (
    CategoriaGasto,
    GastoCategoriaTotal,
    GastoCreate,
    GastoOut,
    GastoUpdate,
    GastosResumenOut,
)
from app.services.reportes import invalidate_reportes_cache
from app.tz import today_co, to_ms

GASTOS_CACHE_PREFIX = "gastos:"


def invalidate_gastos_cache() -> None:
    cache_invalidate(GASTOS_CACHE_PREFIX)


def _gastos_ttl() -> float:
    return float(get_settings().query_cache_gastos_ttl_seconds)


def _invalidate_after_gasto_write() -> None:
    invalidate_gastos_cache()
    invalidate_reportes_cache()


def _gasto_out(row: dict[str, Any]) -> GastoOut:
    creado = row.get("creado_en")
    if isinstance(creado, datetime):
        creado_ms = to_ms(creado)
    else:
        creado_ms = 0
    fecha = row["fecha"]
    if isinstance(fecha, datetime):
        fecha = fecha.date()
    return GastoOut(
        id=str(row["id"]),
        concepto=str(row["concepto"]),
        monto=float(row["monto"]),
        categoria=row["categoria"],
        fecha=fecha,
        notas=row.get("notas"),
        creadoPorId=int(row["creado_por"]),
        creadoPorNombre=row.get("creado_por_nombre"),
        creadoEn=creado_ms,
    )


def _load_gasto(cursor: Any, gasto_id: str) -> GastoOut | None:
    row = fetch_one(
        cursor,
        """
        SELECT g.*, u.nombre AS creado_por_nombre
        FROM gastos g
        LEFT JOIN usuarios u ON u.id = g.creado_por
        WHERE g.id = %s
        """,
        (gasto_id,),
    )
    return _gasto_out(row) if row else None


def list_gastos(
    *,
    fecha: date | None = None,
    desde: date | None = None,
    hasta: date | None = None,
    categoria: CategoriaGasto | None = None,
    limit: int = 200,
) -> list[GastoOut]:
    key = (
        f"{GASTOS_CACHE_PREFIX}list:"
        f"{fecha}:{desde}:{hasta}:{categoria}:{limit}"
    )
    return query_cache(
        key,
        lambda: _list_gastos_db(
            fecha=fecha,
            desde=desde,
            hasta=hasta,
            categoria=categoria,
            limit=limit,
        ),
        ttl_seconds=_gastos_ttl(),
    )


def _list_gastos_db(
    *,
    fecha: date | None = None,
    desde: date | None = None,
    hasta: date | None = None,
    categoria: CategoriaGasto | None = None,
    limit: int = 200,
) -> list[GastoOut]:
    clauses: list[str] = []
    params: list[Any] = []

    if fecha is not None:
        clauses.append("g.fecha = %s")
        params.append(fecha)
    else:
        if desde is not None:
            clauses.append("g.fecha >= %s")
            params.append(desde)
        if hasta is not None:
            clauses.append("g.fecha <= %s")
            params.append(hasta)

    if categoria is not None:
        clauses.append("g.categoria = %s")
        params.append(categoria)

    where = f"WHERE {' AND '.join(clauses)}" if clauses else ""
    with get_db() as (_, cursor):
        rows = fetch_all(
            cursor,
            f"""
            SELECT g.*, u.nombre AS creado_por_nombre
            FROM gastos g
            LEFT JOIN usuarios u ON u.id = g.creado_por
            {where}
            ORDER BY g.fecha DESC, g.creado_en DESC
            LIMIT %s
            """,
            (*params, limit),
        )
    return [_gasto_out(r) for r in rows]


def resumen_gastos(
    *,
    fecha: date | None = None,
    desde: date | None = None,
    hasta: date | None = None,
) -> GastosResumenOut:
    if fecha is not None:
        desde = hasta = fecha
    elif desde is None and hasta is None:
        hoy = today_co()
        desde = hasta = hoy
    elif desde is None:
        desde = hasta
    elif hasta is None:
        hasta = desde

    assert desde is not None and hasta is not None
    key = f"{GASTOS_CACHE_PREFIX}resumen:{desde}:{hasta}"
    return query_cache(
        key,
        lambda: _resumen_gastos_db(desde=desde, hasta=hasta),
        ttl_seconds=_gastos_ttl(),
    )


def _resumen_gastos_db(*, desde: date, hasta: date) -> GastosResumenOut:
    with get_db() as (_, cursor):
        total_row = fetch_one(
            cursor,
            """
            SELECT COALESCE(SUM(monto), 0) AS total, COUNT(*) AS cantidad
            FROM gastos
            WHERE fecha BETWEEN %s AND %s
            """,
            (desde, hasta),
        )
        por_cat = fetch_all(
            cursor,
            """
            SELECT categoria, COALESCE(SUM(monto), 0) AS total, COUNT(*) AS cantidad
            FROM gastos
            WHERE fecha BETWEEN %s AND %s
            GROUP BY categoria
            ORDER BY total DESC
            """,
            (desde, hasta),
        )
    return GastosResumenOut(
        desde=desde,
        hasta=hasta,
        total=float(total_row["total"] if total_row else 0),
        cantidad=int(total_row["cantidad"] if total_row else 0),
        porCategoria=[
            GastoCategoriaTotal(
                categoria=r["categoria"],
                total=float(r["total"]),
                cantidad=int(r["cantidad"]),
            )
            for r in por_cat
        ],
    )


def create_gasto(body: GastoCreate, user_id: int) -> GastoOut:
    gasto_id = str(uuid.uuid4())
    notas = body.notas.strip() if body.notas else None
    with get_db() as (_, cursor):
        cursor.execute(
            """
            INSERT INTO gastos (id, concepto, monto, categoria, fecha, notas, creado_por)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                gasto_id,
                body.concepto.strip(),
                round(body.monto, 2),
                body.categoria,
                body.fecha,
                notas,
                user_id,
            ),
        )
        out = _load_gasto(cursor, gasto_id)
    if not out:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "No se pudo crear el gasto")
    _invalidate_after_gasto_write()
    return out


def update_gasto(gasto_id: str, body: GastoUpdate) -> GastoOut:
    data = body.model_dump(exclude_unset=True)
    with get_db() as (_, cursor):
        existing = fetch_one(cursor, "SELECT id FROM gastos WHERE id = %s", (gasto_id,))
        if not existing:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Gasto no encontrado")

        if not data:
            out = _load_gasto(cursor, gasto_id)
            assert out
            return out

        fields: list[str] = []
        params: list[Any] = []

        if "concepto" in data and data["concepto"] is not None:
            fields.append("concepto = %s")
            params.append(str(data["concepto"]).strip())
        if "monto" in data and data["monto"] is not None:
            fields.append("monto = %s")
            params.append(round(float(data["monto"]), 2))
        if "categoria" in data and data["categoria"] is not None:
            fields.append("categoria = %s")
            params.append(data["categoria"])
        if "fecha" in data and data["fecha"] is not None:
            fields.append("fecha = %s")
            params.append(data["fecha"])
        if "notas" in data:
            notas = data["notas"]
            fields.append("notas = %s")
            params.append(notas.strip() if isinstance(notas, str) and notas.strip() else None)

        if fields:
            params.append(gasto_id)
            cursor.execute(
                f"UPDATE gastos SET {', '.join(fields)} WHERE id = %s",
                tuple(params),
            )

        out = _load_gasto(cursor, gasto_id)
    if not out:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Gasto no encontrado")
    _invalidate_after_gasto_write()
    return out


def delete_gasto(gasto_id: str) -> None:
    with get_db() as (_, cursor):
        cursor.execute("DELETE FROM gastos WHERE id = %s", (gasto_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Gasto no encontrado")
    _invalidate_after_gasto_write()
