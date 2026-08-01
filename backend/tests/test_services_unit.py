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


def test_consumo_por_producto_michelandia_bases() -> None:
    for pid, bebida in (
        ("tradicional_ginger", "ginger"),
        ("lulo_soda", "soda"),
        ("frutos_rojos_cola_pola", "cola_pola"),
        ("blueberry_mango_smirnoff", "smirnoff"),
    ):
        lines = _consumo_por_producto(pid)
        keys = {k: q for k, q in lines}
        assert keys[bebida] == 1.0
        assert keys["limon"] == 2.0
        assert "cerveza" not in keys

    cerv = {k: q for k, q in _consumo_por_producto("maracumazana_cerveza")}
    assert cerv["limon"] == 2.0
    assert "cerveza" not in cerv  # marca vía fase tipo de cerveza


def test_consumo_por_producto_bebidas() -> None:
    assert _consumo_por_producto("coronita") == [("coronita", 1.0)]
    assert _consumo_por_producto("corona") == [("corona", 1.0)]
    assert _consumo_por_producto("la_soda") == [("soda", 1.0)]
    assert _consumo_por_producto("ginger_personal") == [("ginger", 1.0)]
    assert _consumo_por_producto("ginger_litro_medio") == [("ginger_litro_medio", 1.0)]
    for lines in (
        _consumo_por_producto("coronita"),
        _consumo_por_producto("cerveza_latona"),
    ):
        assert "limon" not in {k for k, _ in lines}


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
