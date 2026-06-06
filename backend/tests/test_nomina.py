"""Nómina (admin)."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from tests.conftest import auth_headers

pytestmark = pytest.mark.integration


def test_nomina_requires_admin(client: TestClient, mesero_token: str) -> None:
    r = client.get(
        "/api/admin/nomina",
        headers=auth_headers(mesero_token),
        params={"anio": 2026, "mes": 6, "quincena": 1},
    )
    assert r.status_code == 403


def test_nomina_config_and_recibo(client: TestClient, admin_token: str) -> None:
    headers = auth_headers(admin_token)
    users = client.get("/api/admin/users", headers=headers)
    assert users.status_code == 200
    empleado = next((u for u in users.json() if u["rol"] == "mesero"), None)
    if not empleado:
        pytest.skip("Sin usuario mesero en seed")

    uid = empleado["id"]
    r = client.put(
        f"/api/admin/nomina/config/{uid}",
        headers=headers,
        json={
            "salarioBase": 3000,
            "tipoPago": "quincenal",
            "puesto": "Mesero",
        },
    )
    assert r.status_code == 200, r.text
    assert r.json()["salarioBase"] == 3000

    payload = {
        "usuarioId": uid,
        "anio": 2026,
        "mes": 6,
        "quincena": 1,
        "diasTrabajados": 15,
        "horasExtra": 2,
        "bonos": 100,
        "deducciones": 50,
    }
    r = client.post("/api/admin/nomina/recibos", headers=headers, json=payload)
    if r.status_code == 409:
        periodo = client.get(
            "/api/admin/nomina",
            headers=headers,
            params={"anio": 2026, "mes": 6, "quincena": 1},
        ).json()
        recibo = next(e["recibo"] for e in periodo["empleados"] if e["usuarioId"] == uid)
        rid = recibo["id"]
        r = client.patch(
            f"/api/admin/nomina/recibos/{rid}",
            headers=headers,
            json={"diasTrabajados": 15, "horasExtra": 2, "bonos": 100, "deducciones": 50},
        )
    else:
        assert r.status_code == 201, r.text
    recibo = r.json()
    assert recibo["total"] > 0
    assert recibo["estado"] in ("borrador", "pagado")

    r = client.get(
        "/api/admin/nomina",
        headers=headers,
        params={"anio": 2026, "mes": 6, "quincena": 1},
    )
    assert r.status_code == 200
    data = r.json()
    row = next(e for e in data["empleados"] if e["usuarioId"] == uid)
    assert row["recibo"] is not None
    assert data["resumen"]["empleadosConRecibo"] >= 1
