"""Comandas, mesas e inventario (descuento al vender)."""
from __future__ import annotations

import uuid

import pytest
from fastapi.testclient import TestClient

from tests.conftest import auth_headers

pytestmark = pytest.mark.integration


def _stock(client: TestClient, token: str, key: str) -> float:
    r = client.get("/api/inventario", headers=auth_headers(token))
    assert r.status_code == 200
    row = next((i for i in r.json() if i["key"] == key), None)
    assert row is not None, f"clave {key} no en inventario"
    return float(row["stock"])


def _menu_opcion_cantidad(client: TestClient, token: str, opcion_id: str) -> float:
    r = client.get("/api/menu", headers=auth_headers(token))
    assert r.status_code == 200
    for fase in r.json().get("fases", []):
        for op in fase.get("opciones", []):
            if op["id"] == opcion_id:
                return float(op.get("cantidad", 1))
    raise AssertionError(f"opción {opcion_id} no encontrada en menú")


def _menu_adicion_cantidad(client: TestClient, token: str, adicion_id: str) -> float:
    r = client.get("/api/menu", headers=auth_headers(token))
    assert r.status_code == 200
    for ad in r.json().get("adiciones", []):
        if ad["id"] == adicion_id:
            return float(ad.get("cantidad", 1))
    raise AssertionError(f"adición {adicion_id} no encontrada en menú")


def test_list_mesas(client: TestClient, mesero_headers: dict[str, str]) -> None:
    r = client.get("/api/mesas", headers=mesero_headers)
    assert r.status_code == 200
    mesas = r.json()
    assert len(mesas) >= 1
    assert any(m["id"] == "llevar" for m in mesas)


def test_list_inventario_staff(client: TestClient, cocinero_token: str) -> None:
    r = client.get("/api/inventario", headers=auth_headers(cocinero_token))
    assert r.status_code == 200
    assert len(r.json()) >= 1


def test_inventario_patch_admin_only(
    client: TestClient,
    mesero_headers: dict[str, str],
    admin_headers: dict[str, str],
) -> None:
    r = client.patch(
        "/api/inventario/limon",
        headers=mesero_headers,
        json={"stock": 99},
    )
    assert r.status_code == 403

    r = client.patch(
        "/api/inventario/limon",
        headers=admin_headers,
        json={"stock": 100},
    )
    assert r.status_code == 200
    assert r.json()["stock"] == 100


def test_create_comanda_deducts_inventory(
    client: TestClient,
    mesero_token: str,
) -> None:
    headers = auth_headers(mesero_token)
    tajin_qty = _menu_opcion_cantidad(client, mesero_token, "tajin")
    cerveza_before = _stock(client, mesero_token, "cerveza")
    tajin_before = _stock(client, mesero_token, "tajin")

    item_id = str(uuid.uuid4())
    r = client.post(
        "/api/comandas",
        headers=headers,
        json={
            "cliente": "Test Pytest",
            "mesaId": "llevar",
            "items": [
                {
                    "id": item_id,
                    "micheladaId": "clasica_chica",
                    "micheladaName": "Clásica Chica",
                    "basePrice": 48,
                    "selectedToppings": ["tajin"],
                    "additions": [],
                    "total": 48,
                }
            ],
            "total": 48,
        },
    )
    assert r.status_code == 201, r.text
    data = r.json()
    assert data["status"] == "pendiente"
    assert data["items"][0]["selectedToppings"] == ["tajin"]
    assert data.get("queueOrder", 1) >= 1

    cerveza_after = _stock(client, mesero_token, "cerveza")
    tajin_after = _stock(client, mesero_token, "tajin")

    assert cerveza_after == cerveza_before - 1
    assert tajin_after == pytest.approx(tajin_before - tajin_qty)


def test_comanda_with_adicion_deducts_stock(
    client: TestClient,
    mesero_token: str,
) -> None:
    headers = auth_headers(mesero_token)
    cam_qty = _menu_adicion_cantidad(client, mesero_token, "camaron")
    cam_before = _stock(client, mesero_token, "camaron")

    r = client.post(
        "/api/comandas",
        headers=headers,
        json={
            "cliente": "Test Adicion",
            "mesaId": "llevar",
            "items": [
                {
                    "id": str(uuid.uuid4()),
                    "micheladaId": "clasica_chica",
                    "micheladaName": "Clásica",
                    "basePrice": 48,
                    "selectedToppings": [],
                    "additions": [{"id": "camaron", "name": "Camarón", "price": 25}],
                    "total": 73,
                }
            ],
            "total": 73,
        },
    )
    assert r.status_code == 201
    cam_after = _stock(client, mesero_token, "camaron")
    assert cam_after == pytest.approx(cam_before - cam_qty)


def test_list_comandas(client: TestClient, cocinero_token: str) -> None:
    r = client.get(
        "/api/comandas",
        headers=auth_headers(cocinero_token),
        params={"status": "pendiente", "limit": 10},
    )
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_cocinero_cannot_create_comanda(
    client: TestClient,
    cocinero_token: str,
) -> None:
    r = client.post(
        "/api/comandas",
        headers=auth_headers(cocinero_token),
        json={
            "cliente": "X",
            "items": [
                {
                    "id": "1",
                    "micheladaId": "clasica_chica",
                    "micheladaName": "X",
                    "basePrice": 48,
                    "selectedToppings": [],
                    "additions": [],
                    "total": 48,
                }
            ],
            "total": 48,
        },
    )
    assert r.status_code == 403
