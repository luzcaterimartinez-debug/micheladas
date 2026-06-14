"""Tests unitarios de caja."""
from __future__ import annotations

import pytest
from fastapi import HTTPException

from app.models.caja import PagoCreate
from app.services.caja import _montos_pago


def test_montos_efectivo_con_propina() -> None:
    monto, propina, ef, ta, tr = _montos_pago(100.0, PagoCreate(metodoPago="efectivo", propina=20))
    assert monto == 100.0
    assert propina == 20.0
    assert ef == 120.0
    assert ta == 0.0
    assert tr == 0.0


def test_montos_tarjeta() -> None:
    _, _, ef, ta, tr = _montos_pago(50.0, PagoCreate(metodoPago="tarjeta", propina=5))
    assert ef == 0.0
    assert ta == 55.0
    assert tr == 0.0


def test_montos_mixto_suma_correcta() -> None:
    body = PagoCreate(metodoPago="mixto", propina=0, montoEfectivo=60, montoTarjeta=40)
    _, _, ef, ta, tr = _montos_pago(100.0, body)
    assert ef == 60.0
    assert ta == 40.0
    assert tr == 0.0


def test_montos_mixto_rechaza_suma_incorrecta() -> None:
    body = PagoCreate(metodoPago="mixto", montoEfectivo=50, montoTarjeta=40)
    with pytest.raises(HTTPException) as exc:
        _montos_pago(100.0, body)
    assert exc.value.status_code == 400
