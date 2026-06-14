from __future__ import annotations

import uuid
from typing import Any

from fastapi import HTTPException, status

from app.database import fetch_all, fetch_one, get_db
from app.models.nomina import (
    DIAS_POR_TIPO,
    NominaConfigIn,
    NominaConfigOut,
    NominaEmpleadoRow,
    NominaPeriodoOut,
    NominaPrestamoIn,
    NominaPrestamoOut,
    NominaPrestamoUpdate,
    NominaReciboIn,
    NominaReciboOut,
    NominaReciboUpdate,
    NominaResumen,
    TipoPago,
)

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


def _normalize_quincena(quincena: int | None) -> int:
    return 0 if quincena is None else quincena


def _period_label(anio: int, mes: int, quincena: int) -> str:
    base = f"{MESES_ES[mes]} {anio}"
    if quincena == 1:
        return f"{base} · 1ª quincena"
    if quincena == 2:
        return f"{base} · 2ª quincena"
    return base


def _config_out(row: dict[str, Any]) -> NominaConfigOut:
    tarifa = row.get("tarifa_hora_extra")
    return NominaConfigOut(
        usuarioId=int(row["usuario_id"]),
        salarioBase=float(row["salario_base"]),
        tipoPago=row["tipo_pago"],
        tarifaHoraExtra=float(tarifa) if tarifa is not None else None,
        puesto=row.get("puesto"),
        activo=bool(row.get("activo", 1)),
    )


def _recibo_out(row: dict[str, Any]) -> NominaReciboOut:
    q = row.get("quincena")
    return NominaReciboOut(
        id=str(row["id"]),
        usuarioId=int(row["usuario_id"]),
        anio=int(row["anio"]),
        mes=int(row["mes"]),
        quincena=int(q or 0),
        diasTrabajados=float(row["dias_trabajados"]),
        horasExtra=float(row["horas_extra"]),
        bonos=float(row["bonos"]),
        deducciones=float(row["deducciones"]),
        descuentoPrestamos=float(row.get("descuento_prestamos") or 0),
        sueldoBruto=float(row["sueldo_bruto"]),
        total=float(row["total"]),
        notas=row.get("notas"),
        estado=row["estado"],
    )


def calcular_totales(
    *,
    salario_base: float,
    tipo_pago: TipoPago,
    dias_trabajados: float,
    horas_extra: float,
    bonos: float,
    deducciones: float,
    descuento_prestamos: float = 0,
    tarifa_hora_extra: float | None = None,
) -> tuple[float, float]:
    dias_ref = DIAS_POR_TIPO[tipo_pago]
    if tipo_pago == "diario":
        bruto = salario_base * dias_trabajados
    else:
        factor = min(dias_trabajados / dias_ref, 1.0) if dias_ref > 0 else 0
        bruto = salario_base * factor
        if dias_trabajados > dias_ref:
            bruto = salario_base * (dias_trabajados / dias_ref)

    tarifa = tarifa_hora_extra
    if tarifa is None and salario_base > 0:
        tarifa = salario_base / (dias_ref * 8) if dias_ref > 0 else 0
    bruto += horas_extra * (tarifa or 0)
    bruto += bonos
    neto = max(0.0, bruto - deducciones - descuento_prestamos)
    return round(bruto, 2), round(neto, 2)


def _prestamo_out(row: dict[str, Any]) -> NominaPrestamoOut:
    return NominaPrestamoOut(
        id=str(row["id"]),
        usuarioId=int(row["usuario_id"]),
        concepto=str(row["concepto"]),
        montoTotal=float(row["monto_total"]),
        saldoPendiente=float(row["saldo_pendiente"]),
        cuotaPeriodo=float(row["cuota_periodo"]),
        activo=bool(row.get("activo", 1)),
    )


def _list_prestamos_usuario(cursor: Any, usuario_id: int, *, solo_activos: bool) -> list[dict[str, Any]]:
    if solo_activos:
        return fetch_all(
            cursor,
            """
            SELECT * FROM nomina_prestamos
            WHERE usuario_id = %s AND activo = 1 AND saldo_pendiente > 0
            ORDER BY creado_en ASC
            """,
            (usuario_id,),
        )
    return fetch_all(
        cursor,
        """
        SELECT * FROM nomina_prestamos
        WHERE usuario_id = %s
        ORDER BY activo DESC, creado_en DESC
        """,
        (usuario_id,),
    )


def sugerir_descuento_prestamos(cursor: Any, usuario_id: int) -> float:
    total = 0.0
    for row in _list_prestamos_usuario(cursor, usuario_id, solo_activos=True):
        saldo = float(row["saldo_pendiente"])
        cuota = float(row["cuota_periodo"])
        total += min(cuota, saldo)
    return round(total, 2)


def create_prestamo(body: NominaPrestamoIn) -> NominaPrestamoOut:
    with get_db() as (conn, cursor):
        user = fetch_one(cursor, "SELECT id FROM usuarios WHERE id = %s", (body.usuarioId,))
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

        prestamo_id = str(uuid.uuid4())
        cursor.execute(
            """
            INSERT INTO nomina_prestamos (
              id, usuario_id, concepto, monto_total, saldo_pendiente, cuota_periodo, activo
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                prestamo_id,
                body.usuarioId,
                body.concepto.strip(),
                body.montoTotal,
                body.montoTotal,
                body.cuotaPeriodo,
                1 if body.activo else 0,
            ),
        )
        conn.commit()
        row = fetch_one(cursor, "SELECT * FROM nomina_prestamos WHERE id = %s", (prestamo_id,))
    assert row is not None
    return _prestamo_out(row)


def update_prestamo(prestamo_id: str, body: NominaPrestamoUpdate) -> NominaPrestamoOut:
    with get_db() as (conn, cursor):
        row = fetch_one(cursor, "SELECT * FROM nomina_prestamos WHERE id = %s", (prestamo_id,))
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Préstamo no encontrado")

        concepto = body.concepto.strip() if body.concepto is not None else row["concepto"]
        cuota = body.cuotaPeriodo if body.cuotaPeriodo is not None else float(row["cuota_periodo"])
        saldo = body.saldoPendiente if body.saldoPendiente is not None else float(row["saldo_pendiente"])
        activo = body.activo if body.activo is not None else bool(row["activo"])

        if saldo < 0 or cuota <= 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cuota o saldo inválido")
        if saldo > float(row["monto_total"]):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Saldo no puede exceder el monto total")

        cursor.execute(
            """
            UPDATE nomina_prestamos
            SET concepto = %s, cuota_periodo = %s, saldo_pendiente = %s, activo = %s
            WHERE id = %s
            """,
            (concepto, cuota, saldo, 1 if activo else 0, prestamo_id),
        )
        conn.commit()
        row = fetch_one(cursor, "SELECT * FROM nomina_prestamos WHERE id = %s", (prestamo_id,))
    assert row is not None
    return _prestamo_out(row)


def delete_prestamo(prestamo_id: str) -> None:
    with get_db() as (conn, cursor):
        abonos = fetch_one(
            cursor,
            "SELECT COUNT(*) AS n FROM nomina_prestamo_abonos WHERE prestamo_id = %s",
            (prestamo_id,),
        )
        if abonos and int(abonos["n"]) > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="No se puede eliminar: ya tiene abonos registrados",
            )
        cursor.execute("DELETE FROM nomina_prestamos WHERE id = %s", (prestamo_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Préstamo no encontrado")
        conn.commit()


def _max_descuento_prestamos(cursor: Any, usuario_id: int) -> float:
    return round(
        sum(float(r["saldo_pendiente"]) for r in _list_prestamos_usuario(cursor, usuario_id, solo_activos=True)),
        2,
    )


def _resolver_descuento_prestamos(
    cursor: Any,
    usuario_id: int,
    *,
    manual: float | None,
    auto: bool,
) -> float:
    maximo = _max_descuento_prestamos(cursor, usuario_id)
    if not auto:
        monto = manual if manual is not None else 0.0
        return round(min(max(0.0, monto), maximo), 2)
    sugerido = sugerir_descuento_prestamos(cursor, usuario_id)
    if manual is None:
        return sugerido
    return round(min(max(0.0, manual), maximo), 2)


def _aplicar_abonos_prestamos(
    cursor: Any,
    conn: Any,
    *,
    recibo_id: str,
    usuario_id: int,
    monto_total: float,
) -> None:
    existing = fetch_one(
        cursor,
        "SELECT COUNT(*) AS n FROM nomina_prestamo_abonos WHERE recibo_id = %s",
        (recibo_id,),
    )
    if existing and int(existing["n"]) > 0:
        return

    restante = monto_total
    for row in _list_prestamos_usuario(cursor, usuario_id, solo_activos=True):
        if restante <= 0:
            break
        saldo = float(row["saldo_pendiente"])
        if saldo <= 0:
            continue
        abono = min(restante, float(row["cuota_periodo"]), saldo)
        if abono <= 0:
            continue
        abono_id = str(uuid.uuid4())
        cursor.execute(
            """
            INSERT INTO nomina_prestamo_abonos (id, prestamo_id, recibo_id, monto)
            VALUES (%s, %s, %s, %s)
            """,
            (abono_id, row["id"], recibo_id, abono),
        )
        nuevo_saldo = round(saldo - abono, 2)
        cursor.execute(
            "UPDATE nomina_prestamos SET saldo_pendiente = %s WHERE id = %s",
            (nuevo_saldo, row["id"]),
        )
        if nuevo_saldo <= 0:
            cursor.execute(
                "UPDATE nomina_prestamos SET activo = 0, saldo_pendiente = 0 WHERE id = %s",
                (row["id"],),
            )
        restante = round(restante - abono, 2)
    conn.commit()


def _get_config(cursor: Any, usuario_id: int) -> dict[str, Any] | None:
    return fetch_one(
        cursor,
        """
        SELECT usuario_id, salario_base, tipo_pago, tarifa_hora_extra, puesto, activo
        FROM nomina_config
        WHERE usuario_id = %s
        """,
        (usuario_id,),
    )


def upsert_config(usuario_id: int, body: NominaConfigIn) -> NominaConfigOut:
    with get_db() as (conn, cursor):
        user = fetch_one(
            cursor,
            "SELECT id FROM usuarios WHERE id = %s AND activo = 1",
            (usuario_id,),
        )
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

        cursor.execute(
            """
            INSERT INTO nomina_config (usuario_id, salario_base, tipo_pago, tarifa_hora_extra, puesto, activo)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
              salario_base = VALUES(salario_base),
              tipo_pago = VALUES(tipo_pago),
              tarifa_hora_extra = VALUES(tarifa_hora_extra),
              puesto = VALUES(puesto),
              activo = VALUES(activo)
            """,
            (
                usuario_id,
                body.salarioBase,
                body.tipoPago,
                body.tarifaHoraExtra,
                body.puesto,
                1 if body.activo else 0,
            ),
        )
        conn.commit()
        row = _get_config(cursor, usuario_id)
    assert row is not None
    return _config_out(row)


def get_periodo(anio: int, mes: int, quincena: int | None) -> NominaPeriodoOut:
    q = _normalize_quincena(quincena)
    with get_db() as (_, cursor):
        users = fetch_all(
            cursor,
            """
            SELECT id, nombre, email, rol, activo
            FROM usuarios
            WHERE rol IN ('mesero', 'cocinero', 'admin')
            ORDER BY activo DESC, nombre ASC
            """,
        )
        configs = {
            int(r["usuario_id"]): r
            for r in fetch_all(cursor, "SELECT * FROM nomina_config WHERE activo = 1")
        }

        recibos_rows = fetch_all(
            cursor,
            """
            SELECT * FROM nomina_recibos
            WHERE anio = %s AND mes = %s AND quincena = %s
            """,
            (anio, mes, q),
        )
        recibos = {int(r["usuario_id"]): r for r in recibos_rows}

        prestamos_por_usuario: dict[int, list[NominaPrestamoOut]] = {}
        sugerido_por_usuario: dict[int, float] = {}
        prestamos_activos = 0
        for u in users:
            uid = int(u["id"])
            rows = _list_prestamos_usuario(cursor, uid, solo_activos=False)
            plist = [_prestamo_out(r) for r in rows]
            prestamos_por_usuario[uid] = plist
            sugerido_por_usuario[uid] = sugerir_descuento_prestamos(cursor, uid)
            if any(p.saldoPendiente > 0 and p.activo for p in plist):
                prestamos_activos += 1

    empleados: list[NominaEmpleadoRow] = []
    total_bruto = 0.0
    total_neto = 0.0
    total_pagado = 0.0
    total_prestamos = 0.0
    con_recibo = 0
    pagados = 0

    for u in users:
        uid = int(u["id"])
        cfg_row = configs.get(uid)
        rec_row = recibos.get(uid)
        cfg = _config_out(cfg_row) if cfg_row else None
        rec = _recibo_out(rec_row) if rec_row else None
        if rec:
            con_recibo += 1
            total_bruto += rec.sueldoBruto
            total_neto += rec.total
            total_prestamos += rec.descuentoPrestamos
            if rec.estado == "pagado":
                pagados += 1
                total_pagado += rec.total

        empleados.append(
            NominaEmpleadoRow(
                usuarioId=uid,
                nombre=str(u["nombre"]),
                email=str(u["email"]),
                rol=str(u["rol"]),
                activo=bool(u["activo"]),
                config=cfg,
                recibo=rec,
                prestamos=prestamos_por_usuario.get(uid, []),
                descuentoPrestamosSugerido=sugerido_por_usuario.get(uid, 0),
            )
        )

    return NominaPeriodoOut(
        anio=anio,
        mes=mes,
        quincena=q if q > 0 else None,
        label=_period_label(anio, mes, q),
        empleados=empleados,
        resumen=NominaResumen(
            totalBruto=round(total_bruto, 2),
            totalNeto=round(total_neto, 2),
            totalPagado=round(total_pagado, 2),
            totalPrestamos=round(total_prestamos, 2),
            empleadosConRecibo=con_recibo,
            empleadosPagados=pagados,
            prestamosActivos=prestamos_activos,
        ),
    )


def save_recibo(body: NominaReciboIn) -> NominaReciboOut:
    with get_db() as (conn, cursor):
        cfg = _get_config(cursor, body.usuarioId)
        if not cfg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Configura salario y tipo de pago del empleado antes de generar recibo",
            )

        desc_prestamos = _resolver_descuento_prestamos(
            cursor,
            body.usuarioId,
            manual=body.descuentoPrestamos,
            auto=body.aplicarPrestamosAuto,
        )
        bruto, neto = calcular_totales(
            salario_base=float(cfg["salario_base"]),
            tipo_pago=cfg["tipo_pago"],
            dias_trabajados=body.diasTrabajados,
            horas_extra=body.horasExtra,
            bonos=body.bonos,
            deducciones=body.deducciones,
            descuento_prestamos=desc_prestamos,
            tarifa_hora_extra=float(cfg["tarifa_hora_extra"])
            if cfg.get("tarifa_hora_extra") is not None
            else None,
        )

        recibo_id = str(uuid.uuid4())
        estado = body.estado or "borrador"
        try:
            cursor.execute(
                """
                INSERT INTO nomina_recibos (
                  id, usuario_id, anio, mes, quincena,
                  dias_trabajados, horas_extra, bonos, deducciones, descuento_prestamos,
                  sueldo_bruto, total, notas, estado
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    recibo_id,
                    body.usuarioId,
                    body.anio,
                    body.mes,
                    _normalize_quincena(body.quincena),
                    body.diasTrabajados,
                    body.horasExtra,
                    body.bonos,
                    body.deducciones,
                    desc_prestamos,
                    bruto,
                    neto,
                    body.notas,
                    estado,
                ),
            )
        except Exception as exc:
            if "Duplicate" in str(exc) or "uk_nomina_periodo" in str(exc):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Ya existe recibo para este empleado en el periodo",
                ) from exc
        if estado == "pagado" and desc_prestamos > 0:
            _aplicar_abonos_prestamos(
                cursor,
                conn,
                recibo_id=recibo_id,
                usuario_id=body.usuarioId,
                monto_total=desc_prestamos,
            )
        else:
            conn.commit()
        row = fetch_one(cursor, "SELECT * FROM nomina_recibos WHERE id = %s", (recibo_id,))
    assert row is not None
    return _recibo_out(row)


def update_recibo(recibo_id: str, body: NominaReciboUpdate) -> NominaReciboOut:
    with get_db() as (conn, cursor):
        row = fetch_one(cursor, "SELECT * FROM nomina_recibos WHERE id = %s", (recibo_id,))
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recibo no encontrado")

        cfg = _get_config(cursor, int(row["usuario_id"]))
        if not cfg:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Sin configuración de nómina")

        uid = int(row["usuario_id"])
        dias = body.diasTrabajados if body.diasTrabajados is not None else float(row["dias_trabajados"])
        horas = body.horasExtra if body.horasExtra is not None else float(row["horas_extra"])
        bonos = body.bonos if body.bonos is not None else float(row["bonos"])
        ded = body.deducciones if body.deducciones is not None else float(row["deducciones"])
        notas = body.notas if body.notas is not None else row.get("notas")
        estado = body.estado if body.estado is not None else row["estado"]
        auto_prest = body.aplicarPrestamosAuto if body.aplicarPrestamosAuto is not None else True
        manual_prest = (
            body.descuentoPrestamos
            if body.descuentoPrestamos is not None
            else float(row.get("descuento_prestamos") or 0)
        )
        if body.descuentoPrestamos is None and body.aplicarPrestamosAuto is True:
            manual_prest = None
        desc_prestamos = _resolver_descuento_prestamos(
            cursor, uid, manual=manual_prest, auto=auto_prest
        )

        bruto, neto = calcular_totales(
            salario_base=float(cfg["salario_base"]),
            tipo_pago=cfg["tipo_pago"],
            dias_trabajados=dias,
            horas_extra=horas,
            bonos=bonos,
            deducciones=ded,
            descuento_prestamos=desc_prestamos,
            tarifa_hora_extra=float(cfg["tarifa_hora_extra"])
            if cfg.get("tarifa_hora_extra") is not None
            else None,
        )

        cursor.execute(
            """
            UPDATE nomina_recibos
            SET dias_trabajados = %s, horas_extra = %s, bonos = %s, deducciones = %s,
                descuento_prestamos = %s, sueldo_bruto = %s, total = %s, notas = %s, estado = %s
            WHERE id = %s
            """,
            (dias, horas, bonos, ded, desc_prestamos, bruto, neto, notas, estado, recibo_id),
        )
        prev_estado = row["estado"]
        if estado == "pagado" and prev_estado != "pagado" and desc_prestamos > 0:
            _aplicar_abonos_prestamos(
                cursor,
                conn,
                recibo_id=recibo_id,
                usuario_id=uid,
                monto_total=desc_prestamos,
            )
        else:
            conn.commit()
        row = fetch_one(cursor, "SELECT * FROM nomina_recibos WHERE id = %s", (recibo_id,))
    assert row is not None
    return _recibo_out(row)


def delete_recibo(recibo_id: str) -> None:
    with get_db() as (conn, cursor):
        cursor.execute("DELETE FROM nomina_recibos WHERE id = %s", (recibo_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recibo no encontrado")
        conn.commit()
