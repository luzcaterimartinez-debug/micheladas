"""Tests unitarios sin base de datos."""
from __future__ import annotations

from app.models.menu import ConsumoLine
from app.services.inventario import _consumo_por_producto, _consumo_tuples


def test_consumo_por_producto_clasica() -> None:
    lines = _consumo_por_producto("clasica_mediana")
    keys = {k for k, _ in lines}
    assert "cerveza" in keys
    assert "limon" in keys
    assert "clamato" not in keys


def test_consumo_por_producto_cubana() -> None:
    lines = _consumo_por_producto("cubana_grande")
    keys = {k for k, _ in lines}
    assert "clamato" in keys


def test_consumo_tuples_from_models() -> None:
    consumo = [
        ConsumoLine(clave="cerveza", cantidad=2),
        ConsumoLine(clave="limon", cantidad=3),
    ]
    result = _consumo_tuples(consumo, "any_id")
    assert result == [("cerveza", 2.0), ("limon", 3.0)]


def test_consumo_tuples_default_when_none() -> None:
    result = _consumo_tuples(None, "clasica_chica")
    assert len(result) >= 2
