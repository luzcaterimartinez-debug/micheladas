"""Admin: fases, opciones, adiciones."""
from __future__ import annotations

import uuid

import pytest
from fastapi.testclient import TestClient

pytestmark = pytest.mark.integration


def test_list_fases(client: TestClient, admin_headers: dict[str, str]) -> None:
    r = client.get("/api/admin/menu/fases", headers=admin_headers)
    assert r.status_code == 200
    fases = r.json()
    assert isinstance(fases, list)
    if fases:
        assert "opciones" in fases[0]


def test_fase_opcion_crud(client: TestClient, admin_headers: dict[str, str]) -> None:
    suffix = uuid.uuid4().hex[:8]
    nombre = f"Test Opcion {suffix}"

    r = client.post(
        "/api/admin/menu/fases/topping/opciones",
        headers=admin_headers,
        json={"nombre": nombre, "inventario_clave": "limon", "cantidad": 0.5},
    )
    assert r.status_code == 201, r.text
    opcion = r.json()
    opcion_id = opcion["id"]
    assert opcion["stockKey"] == "limon"
    assert opcion["cantidad"] == 0.5

    r = client.patch(
        f"/api/admin/menu/fases/opciones/{opcion_id}",
        headers=admin_headers,
        json={"nombre": f"{nombre} Edit", "cantidad": 1},
    )
    assert r.status_code == 200
    assert r.json()["name"] == f"{nombre} Edit"

    r = client.delete(
        f"/api/admin/menu/fases/opciones/{opcion_id}",
        headers=admin_headers,
    )
    assert r.status_code == 204


def test_adicion_requires_admin(
    client: TestClient,
    mesero_headers: dict[str, str],
    admin_headers: dict[str, str],
) -> None:
    r = client.post(
        "/api/admin/menu/adiciones",
        headers=mesero_headers,
        json={"nombre": "No Permitido", "precio": 10},
    )
    assert r.status_code == 403

    suffix = uuid.uuid4().hex[:6]
    r = client.post(
        "/api/admin/menu/adiciones",
        headers=admin_headers,
        json={
            "nombre": f"Test Adicion {suffix}",
            "precio": 12,
            "stock_key": "pepino",
            "cantidad": 2,
        },
    )
    assert r.status_code == 201, r.text
    adicion_id = r.json()["id"]

    r = client.delete(
        f"/api/admin/menu/adiciones/{adicion_id}",
        headers=admin_headers,
    )
    assert r.status_code == 204


def test_delete_inventario_item_admin(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    key = f"test_{uuid.uuid4().hex[:6]}"
    r = client.patch(
        f"/api/inventario/limon",
        headers=admin_headers,
        json={"stock": 50},
    )
    assert r.status_code == 200

    # crear ítem vía seed pattern: insert not exposed — skip create, test 404
    r = client.delete(f"/api/inventario/{key}", headers=admin_headers)
    assert r.status_code == 404
