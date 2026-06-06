"""Reportes de ventas (admin)."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from tests.conftest import auth_headers

pytestmark = pytest.mark.integration


def test_reportes_requires_admin(client: TestClient, mesero_token: str) -> None:
    r = client.get(
        "/api/reportes",
        headers=auth_headers(mesero_token),
        params={"periodo": "dia"},
    )
    assert r.status_code == 403


def test_reporte_dia(client: TestClient, admin_token: str) -> None:
    r = client.get(
        "/api/reportes",
        headers=auth_headers(admin_token),
        params={"periodo": "dia"},
    )
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["periodo"] == "dia"
    assert "totalVentas" in data
    assert "numComandas" in data
    assert isinstance(data["serie"], list)


def test_reporte_mes(client: TestClient, admin_token: str) -> None:
    r = client.get(
        "/api/reportes",
        headers=auth_headers(admin_token),
        params={"periodo": "mes", "anio": 2026, "mes": 6},
    )
    assert r.status_code == 200
    assert r.json()["periodo"] == "mes"
    assert "Junio" in r.json()["label"]


def test_reporte_anio(client: TestClient, admin_token: str) -> None:
    r = client.get(
        "/api/reportes",
        headers=auth_headers(admin_token),
        params={"periodo": "anio", "anio": 2026},
    )
    assert r.status_code == 200
    assert r.json()["label"] == "2026"
