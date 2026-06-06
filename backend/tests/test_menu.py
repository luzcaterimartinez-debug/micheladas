"""Menú público y autenticado."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

pytestmark = pytest.mark.integration


def test_menu_public_no_auth(client: TestClient, db_available: bool) -> None:
    if not db_available:
        pytest.skip("MySQL no disponible")
    r = client.get("/api/menu/public")
    assert r.status_code == 200
    data = r.json()
    assert "categorias" in data
    assert "adiciones" in data
    assert "fases" in data
    assert isinstance(data["categorias"], list)


def test_menu_authenticated(client: TestClient, mesero_headers: dict[str, str]) -> None:
    r = client.get("/api/menu", headers=mesero_headers)
    assert r.status_code == 200
    cats = r.json()["categorias"]
    if cats:
        cat = cats[0]
        assert "productos" in cat
        if cat["productos"]:
            prod = cat["productos"][0]
            assert "faseOpciones" in prod
            assert "consumo" in prod


def test_admin_menu(client: TestClient, admin_headers: dict[str, str]) -> None:
    r = client.get("/api/admin/menu", headers=admin_headers)
    assert r.status_code == 200
    data = r.json()
    assert "categorias" in data
    assert "fases" in data
