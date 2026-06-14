from __future__ import annotations

import uuid
from datetime import date, datetime, timedelta
from typing import Any

from fastapi import HTTPException, status

from app.database import fetch_all, fetch_one, get_db
from app.models.caja import (
    CajaResumenOut,
    CorteCreate,
    CorteOut,
    MetodoResumen,
    PagoCreate,
)
from app.models.pos import ComandaOut
from app.services.pos import COMANDAS_SELECT, _row_to_comanda, invalidate_pos_cache


def _ts_ms(dt: datetime | None) -> int | None:
    if dt is None:
        return None
    if dt.tzinfo is None:
        from datetime import timezone

        dt = dt.replace(tzinfo=timezone.utc)
    return int(dt.timestamp() * 1000)


def _day_bounds(fecha: date) -> tuple[datetime, datetime]:
    start = datetime.combine(fecha, datetime.min.time())
    return start, start + timedelta(days=1)


def _montos_pago(total: float, body: PagoCreate) -> tuple[float, float, float, float, float]:
    """Retorna monto_pagado, propina, pago_efectivo, pago_tarjeta, pago_transferencia."""
    propina = float(body.propina or 0)
    due = total + propina

    if body.metodoPago == "efectivo":
        return total, propina, due, 0.0, 0.0
    if body.metodoPago == "tarjeta":
        return total, propina, 0.0, due, 0.0
    if body.metodoPago == "transferencia":
        return total, propina, 0.0, 0.0, due

    ef = float(body.montoEfectivo or 0)
    ta = float(body.montoTarjeta or 0)
    tr = float(body.montoTransferencia or 0)
    if abs(ef + ta + tr - due) > 0.02:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Los montos deben sumar ${due:.2f} (total + propina)",
        )
    return total, propina, ef, ta, tr


def registrar_pago(comanda_id: str, body: PagoCreate, cobrador_id: int) -> ComandaOut:
    with get_db() as (conn, cursor):
        row = fetch_one(
            cursor,
            f"SELECT {COMANDAS_SELECT} FROM comandas WHERE id = %s",
            (comanda_id,),
        )
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comanda no encontrada")
        if bool(row.get("pagado")):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Comanda ya cobrada")

        total = float(row["total"])
        monto_pagado, propina, p_ef, p_ta, p_tr = _montos_pago(total, body)

        cursor.execute(
            """
            UPDATE comandas SET
              pagado = 1,
              metodo_pago = %s,
              monto_pagado = %s,
              propina = %s,
              pago_efectivo = %s,
              pago_tarjeta = %s,
              pago_transferencia = %s,
              pagado_en = CURRENT_TIMESTAMP,
              cobrado_por = %s
            WHERE id = %s
            """,
            (body.metodoPago, monto_pagado, propina, p_ef, p_ta, p_tr, cobrador_id, comanda_id),
        )
        conn.commit()
        updated = fetch_one(
            cursor,
            f"SELECT {COMANDAS_SELECT} FROM comandas WHERE id = %s",
            (comanda_id,),
        )
    invalidate_pos_cache()
    assert updated is not None
    with get_db() as (_, cursor):
        return _row_to_comanda(cursor, updated)


def anular_pago(comanda_id: str) -> ComandaOut:
    with get_db() as (conn, cursor):
        row = fetch_one(cursor, "SELECT id, pagado FROM comandas WHERE id = %s", (comanda_id,))
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comanda no encontrada")
        if not bool(row.get("pagado")):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Comanda sin pago registrado")

        cursor.execute(
            """
            UPDATE comandas SET
              pagado = 0,
              metodo_pago = NULL,
              monto_pagado = NULL,
              propina = 0,
              pago_efectivo = NULL,
              pago_tarjeta = NULL,
              pago_transferencia = NULL,
              pagado_en = NULL,
              cobrado_por = NULL
            WHERE id = %s
            """,
            (comanda_id,),
        )
        conn.commit()
        updated = fetch_one(
            cursor,
            f"SELECT {COMANDAS_SELECT} FROM comandas WHERE id = %s",
            (comanda_id,),
        )
    invalidate_pos_cache()
    assert updated is not None
    with get_db() as (_, cursor):
        return _row_to_comanda(cursor, updated)


def list_comandas_caja(*, fecha: date, pagado: bool | None = None) -> list[ComandaOut]:
    start, end = _day_bounds(fecha)
    with get_db() as (_, cursor):
        query = f"""
            SELECT {COMANDAS_SELECT}
            FROM comandas
            WHERE creado_en >= %s AND creado_en < %s
        """
        params: list[Any] = [start, end]
        if pagado is not None:
            query += " AND pagado = %s"
            params.append(1 if pagado else 0)
        query += " ORDER BY orden_cola ASC, creado_en ASC"
        rows = fetch_all(cursor, query, tuple(params))
        return [_row_to_comanda(cursor, r) for r in rows]


def resumen_dia(fecha: date) -> CajaResumenOut:
    start, end = _day_bounds(fecha)
    with get_db() as (_, cursor):
        pagadas = fetch_one(
            cursor,
            """
            SELECT
              COUNT(*) AS n,
              COALESCE(SUM(monto_pagado), 0) AS ventas,
              COALESCE(SUM(propina), 0) AS propinas,
              COALESCE(SUM(pago_efectivo), 0) AS efectivo,
              COALESCE(SUM(pago_tarjeta), 0) AS tarjeta,
              COALESCE(SUM(pago_transferencia), 0) AS transferencia
            FROM comandas
            WHERE creado_en >= %s AND creado_en < %s AND pagado = 1
            """,
            (start, end),
        )
        pendientes = fetch_one(
            cursor,
            """
            SELECT COUNT(*) AS n, COALESCE(SUM(total), 0) AS ventas
            FROM comandas
            WHERE creado_en >= %s AND creado_en < %s AND pagado = 0
            """,
            (start, end),
        )
        por_metodo_rows = fetch_all(
            cursor,
            """
            SELECT metodo_pago AS metodo, COUNT(*) AS cnt, COALESCE(SUM(monto_pagado), 0) AS tot
            FROM comandas
            WHERE creado_en >= %s AND creado_en < %s AND pagado = 1 AND metodo_pago IS NOT NULL
            GROUP BY metodo_pago
            ORDER BY tot DESC
            """,
            (start, end),
        )
        corte = fetch_one(
            cursor,
            """
            SELECT id, efectivo_contado, diferencia
            FROM caja_cortes WHERE fecha = %s
            """,
            (fecha,),
        )

    return CajaResumenOut(
        fecha=fecha.isoformat(),
        ventasPagadas=float(pagadas["ventas"] if pagadas else 0),
        ventasPendientes=float(pendientes["ventas"] if pendientes else 0),
        propinas=float(pagadas["propinas"] if pagadas else 0),
        comandasPagadas=int(pagadas["n"] if pagadas else 0),
        comandasPendientes=int(pendientes["n"] if pendientes else 0),
        efectivoEsperado=float(pagadas["efectivo"] if pagadas else 0),
        tarjetaTotal=float(pagadas["tarjeta"] if pagadas else 0),
        transferenciaTotal=float(pagadas["transferencia"] if pagadas else 0),
        porMetodo=[
            MetodoResumen(metodo=str(r["metodo"]), total=float(r["tot"]), comandas=int(r["cnt"]))
            for r in por_metodo_rows
        ],
        corteCerrado=corte is not None,
        corteId=str(corte["id"]) if corte else None,
        efectivoContado=float(corte["efectivo_contado"]) if corte else None,
        diferencia=float(corte["diferencia"]) if corte else None,
    )


def crear_corte(body: CorteCreate, usuario_id: int) -> CorteOut:
    fecha = body.fecha or date.today()
    resumen = resumen_dia(fecha)

    if resumen.comandasPendientes > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Hay {resumen.comandasPendientes} comanda(s) sin cobrar en este día",
        )

    diferencia = round(body.efectivoContado - resumen.efectivoEsperado, 2)
    corte_id = str(uuid.uuid4())

    with get_db() as (conn, cursor):
        existing = fetch_one(cursor, "SELECT id FROM caja_cortes WHERE fecha = %s", (fecha,))
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ya existe un corte de caja para esta fecha",
            )

        cursor.execute(
            """
            INSERT INTO caja_cortes (
              id, fecha, total_ventas, total_propinas,
              efectivo_esperado, tarjeta_total, transferencia_total,
              efectivo_contado, diferencia,
              comandas_pagadas, comandas_pendientes, notas, cerrado_por
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                corte_id,
                fecha,
                resumen.ventasPagadas,
                resumen.propinas,
                resumen.efectivoEsperado,
                resumen.tarjetaTotal,
                resumen.transferenciaTotal,
                body.efectivoContado,
                diferencia,
                resumen.comandasPagadas,
                resumen.comandasPendientes,
                body.notas,
                usuario_id,
            ),
        )
        conn.commit()
        row = fetch_one(
            cursor,
            """
            SELECT c.*, u.nombre AS cerrado_por_nombre
            FROM caja_cortes c
            LEFT JOIN usuarios u ON u.id = c.cerrado_por
            WHERE c.id = %s
            """,
            (corte_id,),
        )
    assert row is not None
    return _corte_out(row)


def list_cortes(limit: int = 30) -> list[CorteOut]:
    with get_db() as (_, cursor):
        rows = fetch_all(
            cursor,
            """
            SELECT c.*, u.nombre AS cerrado_por_nombre
            FROM caja_cortes c
            LEFT JOIN usuarios u ON u.id = c.cerrado_por
            ORDER BY c.fecha DESC
            LIMIT %s
            """,
            (limit,),
        )
    return [_corte_out(r) for r in rows]


def _corte_out(row: dict[str, Any]) -> CorteOut:
    return CorteOut(
        id=str(row["id"]),
        fecha=row["fecha"].isoformat() if hasattr(row["fecha"], "isoformat") else str(row["fecha"]),
        totalVentas=float(row["total_ventas"]),
        totalPropinas=float(row["total_propinas"]),
        efectivoEsperado=float(row["efectivo_esperado"]),
        tarjetaTotal=float(row["tarjeta_total"]),
        transferenciaTotal=float(row["transferencia_total"]),
        efectivoContado=float(row["efectivo_contado"]),
        diferencia=float(row["diferencia"]),
        comandasPagadas=int(row["comandas_pagadas"]),
        comandasPendientes=int(row["comandas_pendientes"]),
        notas=row.get("notas"),
        cerradoEn=_ts_ms(row.get("cerrado_en")) or 0,
        cerradoPorId=int(row["cerrado_por"]),
        cerradoPorNombre=row.get("cerrado_por_nombre"),
    )
