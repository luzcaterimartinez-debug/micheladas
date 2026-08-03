from __future__ import annotations

import json
from calendar import monthrange
from datetime import date, datetime
from typing import Any

from fastapi import HTTPException, status

from app.database import fetch_all, fetch_one, get_db
from app.models.reportes import (
    PeriodoReporte,
    ReporteEstadoRow,
    ReporteMesaRow,
    ReporteMeseroRow,
    ReporteOut,
    ReportePedido,
    ReportePedidoItem,
    ReporteProductoRow,
    ReporteSeriePunto,
)
from app.tz import day_bounds, today_co, to_ms

MESES_ES = (
    "",
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
)


def _period_bounds(
    periodo: PeriodoReporte,
    *,
    fecha: date | None,
    anio: int | None,
    mes: int | None,
) -> tuple[datetime, datetime, str, str, str]:
    today = today_co()
    if periodo == "dia":
        d = fecha or today
        start, end = day_bounds(d)
        label = d.strftime("%d/%m/%Y")
        return start, end, label, d.isoformat(), d.isoformat()

    if periodo == "mes":
        y = anio if anio is not None else today.year
        m = mes if mes is not None else today.month
        if m < 1 or m > 12:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mes inválido (1-12)")
        start = datetime(y, m, 1)
        if m == 12:
            end = datetime(y + 1, 1, 1)
        else:
            end = datetime(y, m + 1, 1)
        last_day = monthrange(y, m)[1]
        label = f"{MESES_ES[m]} {y}"
        return start, end, label, date(y, m, 1).isoformat(), date(y, m, last_day).isoformat()

    y = anio if anio is not None else today.year
    start = datetime(y, 1, 1)
    end = datetime(y + 1, 1, 1)
    label = str(y)
    return start, end, label, date(y, 1, 1).isoformat(), date(y, 12, 31).isoformat()


def _comandas_where() -> str:
    return "c.creado_en >= %s AND c.creado_en < %s"


def build_reporte(
    periodo: PeriodoReporte,
    *,
    fecha: date | None = None,
    anio: int | None = None,
    mes: int | None = None,
) -> ReporteOut:
    start, end, label, desde, hasta = _period_bounds(periodo, fecha=fecha, anio=anio, mes=mes)
    bounds = (start, end)

    with get_db() as (_, cursor):
        summary = fetch_one(
            cursor,
            f"""
            SELECT
              COUNT(*) AS num_comandas,
              COALESCE(SUM(c.total), 0) AS total_ventas
            FROM comandas c
            WHERE {_comandas_where()}
            """,
            bounds,
        )
        items_row = fetch_one(
            cursor,
            f"""
            SELECT COUNT(*) AS n
            FROM comanda_items ci
            INNER JOIN comandas c ON c.id = ci.comanda_id
            WHERE {_comandas_where()}
            """,
            bounds,
        )

        por_estado = fetch_all(
            cursor,
            f"""
            SELECT c.status, COUNT(*) AS cnt, COALESCE(SUM(c.total), 0) AS tot
            FROM comandas c
            WHERE {_comandas_where()}
            GROUP BY c.status
            ORDER BY FIELD(c.status, 'pendiente', 'lista', 'entregada')
            """,
            bounds,
        )

        top_productos = fetch_all(
            cursor,
            f"""
            SELECT
              ci.producto_id,
              ci.producto_nombre,
              COUNT(*) AS cnt,
              COALESCE(SUM(ci.total), 0) AS tot
            FROM comanda_items ci
            INNER JOIN comandas c ON c.id = ci.comanda_id
            WHERE {_comandas_where()}
            GROUP BY ci.producto_id, ci.producto_nombre
            ORDER BY tot DESC, cnt DESC
            LIMIT 15
            """,
            bounds,
        )

        por_mesa = fetch_all(
            cursor,
            f"""
            SELECT
              COALESCE(NULLIF(c.mesa_nombre, ''), 'Sin mesa') AS mesa,
              COUNT(*) AS cnt,
              COALESCE(SUM(c.total), 0) AS tot
            FROM comandas c
            WHERE {_comandas_where()}
            GROUP BY mesa
            ORDER BY tot DESC
            LIMIT 20
            """,
            bounds,
        )

        por_mesero = fetch_all(
            cursor,
            f"""
            SELECT
              c.mesero_id,
              COALESCE(u.nombre, 'Sin asignar') AS mesero_nombre,
              COUNT(*) AS cnt,
              COALESCE(SUM(c.total), 0) AS tot
            FROM comandas c
            LEFT JOIN usuarios u ON u.id = c.mesero_id
            WHERE {_comandas_where()}
            GROUP BY c.mesero_id, mesero_nombre
            ORDER BY tot DESC
            """,
            bounds,
        )

        serie = _fetch_serie(cursor, periodo, bounds)
        pedidos = _fetch_pedidos(cursor, bounds)

    num_comandas = int(summary["num_comandas"]) if summary else 0
    total_ventas = float(summary["total_ventas"]) if summary else 0.0
    num_items = int(items_row["n"]) if items_row else 0
    ticket = total_ventas / num_comandas if num_comandas else 0.0

    return ReporteOut(
        periodo=periodo,
        label=label,
        desde=desde,
        hasta=hasta,
        totalVentas=round(total_ventas, 2),
        numComandas=num_comandas,
        numItems=num_items,
        ticketPromedio=round(ticket, 2),
        porEstado=[
            ReporteEstadoRow(status=str(r["status"]), count=int(r["cnt"]), total=float(r["tot"]))
            for r in por_estado
        ],
        topProductos=[
            ReporteProductoRow(
                productoId=str(r["producto_id"]),
                productoNombre=str(r["producto_nombre"]),
                cantidad=int(r["cnt"]),
                total=float(r["tot"]),
            )
            for r in top_productos
        ],
        porMesa=[
            ReporteMesaRow(mesa=str(r["mesa"]), count=int(r["cnt"]), total=float(r["tot"]))
            for r in por_mesa
        ],
        porMesero=[
            ReporteMeseroRow(
                meseroId=int(r["mesero_id"]) if r.get("mesero_id") is not None else None,
                meseroNombre=str(r["mesero_nombre"]),
                count=int(r["cnt"]),
                total=float(r["tot"]),
            )
            for r in por_mesero
        ],
        serie=serie,
        pedidos=pedidos,
    )


def _fetch_serie(
    cursor: Any,
    periodo: PeriodoReporte,
    bounds: tuple[datetime, datetime],
) -> list[ReporteSeriePunto]:
    if periodo == "dia":
        rows = fetch_all(
            cursor,
            f"""
            SELECT HOUR(c.creado_en) AS bucket, COUNT(*) AS cnt, COALESCE(SUM(c.total), 0) AS tot
            FROM comandas c
            WHERE {_comandas_where()}
            GROUP BY bucket
            ORDER BY bucket
            """,
            bounds,
        )
        return [
            ReporteSeriePunto(
                label=f"{int(r['bucket']):02d}:00",
                count=int(r["cnt"]),
                total=float(r["tot"]),
            )
            for r in rows
        ]

    if periodo == "mes":
        rows = fetch_all(
            cursor,
            f"""
            SELECT DAY(c.creado_en) AS bucket, COUNT(*) AS cnt, COALESCE(SUM(c.total), 0) AS tot
            FROM comandas c
            WHERE {_comandas_where()}
            GROUP BY bucket
            ORDER BY bucket
            """,
            bounds,
        )
        return [
            ReporteSeriePunto(
                label=str(int(r["bucket"])),
                count=int(r["cnt"]),
                total=float(r["tot"]),
            )
            for r in rows
        ]

    rows = fetch_all(
        cursor,
        f"""
        SELECT MONTH(c.creado_en) AS bucket, COUNT(*) AS cnt, COALESCE(SUM(c.total), 0) AS tot
        FROM comandas c
        WHERE {_comandas_where()}
        GROUP BY bucket
        ORDER BY bucket
        """,
        bounds,
    )
    return [
        ReporteSeriePunto(
            label=MESES_ES[int(r["bucket"])][:3],
            count=int(r["cnt"]),
            total=float(r["tot"]),
        )
        for r in rows
    ]


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


def _addition_labels(raw: Any) -> list[str]:
    labels: list[str] = []
    for a in _parse_json_list(raw):
        if not isinstance(a, dict):
            continue
        name = str(a.get("name") or a.get("nombre") or "").strip()
        if not name:
            continue
        qty = int(a.get("quantity") or 1)
        labels.append(f"{name} ×{qty}" if qty > 1 else name)
    return labels


PEDIDOS_LIMIT = 300


def _fetch_pedidos(cursor: Any, bounds: tuple[datetime, datetime]) -> list[ReportePedido]:
    rows = fetch_all(
        cursor,
        f"""
        SELECT
          c.id, c.folio, c.orden_cola, c.cliente, c.mesa_nombre, c.total,
          c.status, c.pagado, c.metodo_pago, c.creado_en,
          COALESCE(u.nombre, NULL) AS mesero_nombre
        FROM comandas c
        LEFT JOIN usuarios u ON u.id = c.mesero_id
        WHERE {_comandas_where()}
        ORDER BY c.creado_en DESC
        LIMIT {PEDIDOS_LIMIT}
        """,
        bounds,
    )
    if not rows:
        return []

    ids = [str(r["id"]) for r in rows]
    placeholders = ", ".join(["%s"] * len(ids))
    item_rows = fetch_all(
        cursor,
        f"""
        SELECT comanda_id, producto_nombre, tamano, cantidad, toppings_json, adiciones_json, notas, total
        FROM comanda_items
        WHERE comanda_id IN ({placeholders})
        ORDER BY orden ASC, id ASC
        """,
        tuple(ids),
    )
    items_by_comanda: dict[str, list[ReportePedidoItem]] = {cid: [] for cid in ids}
    for it in item_rows:
        cid = str(it["comanda_id"])
        if cid not in items_by_comanda:
            continue
        items_by_comanda[cid].append(
            ReportePedidoItem(
                productoNombre=str(it["producto_nombre"]),
                cantidad=max(1, int(it.get("cantidad") or 1)),
                size=str(it["tamano"]) if it.get("tamano") else None,
                notes=str(it["notas"]).strip() if it.get("notas") else None,
                additions=_addition_labels(it.get("adiciones_json")),
                toppings=[str(t) for t in _parse_json_list(it.get("toppings_json"))],
                total=float(it["total"]),
            )
        )

    return [
        ReportePedido(
            id=str(r["id"]),
            folio=int(r["folio"]),
            queueOrder=int(r.get("orden_cola") or 1),
            cliente=str(r["cliente"]),
            mesa=str(r["mesa_nombre"]) if r.get("mesa_nombre") else None,
            meseroNombre=str(r["mesero_nombre"]) if r.get("mesero_nombre") else None,
            status=str(r["status"]),
            pagado=bool(r.get("pagado")),
            metodoPago=str(r["metodo_pago"]) if r.get("metodo_pago") else None,
            total=float(r["total"]),
            createdAt=to_ms(r["creado_en"]) if r.get("creado_en") else 0,
            items=items_by_comanda.get(str(r["id"]), []),
        )
        for r in rows
    ]
