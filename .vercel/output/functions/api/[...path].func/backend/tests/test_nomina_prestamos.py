"""Préstamos en nómina (admin)."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from tests.conftest import auth_headers

pytestmark = pytest.mark.integration


def test_nomina_prestamo_descuento_y_abono(client: TestClient, admin_token: str) -> None:
    headers = auth_headers(admin_token)
    users = client.get("/api/admin/users", headers=headers)
    assert users.status_code == 200
    empleado = next((u for u in users.json() if u["rol"] == "mesero"), None)
    if not empleado:
        pytest.skip("Sin usuario mesero en seed")

    uid = empleado["id"]
    anio, mes, quincena = 2027, 3, 1

    client.put(
        f"/api/admin/nomina/config/{uid}",
        headers=headers,
        json={"salarioBase": 2000, "tipoPago": "quincenal"},
    )

    r = client.post(
        "/api/admin/nomina/prestamos",
        headers=headers,
        json={
            "usuarioId": uid,
            "concepto": "Anticipo test",
            "montoTotal": 500,
            "cuotaPeriodo": 200,
        },
    )
    assert r.status_code == 201, r.text
    prestamo = r.json()
    assert prestamo["saldoPendiente"] == 500

    periodo = client.get(
        "/api/admin/nomina",
        headers=headers,
        params={"anio": anio, "mes": mes, "quincena": quincena},
    ).json()
    row = next(e for e in periodo["empleados"] if e["usuarioId"] == uid)
    assert row["descuentoPrestamosSugerido"] == 200

    payload = {
        "usuarioId": uid,
        "anio": anio,
        "mes": mes,
        "quincena": quincena,
        "diasTrabajados": 15,
        "horasExtra": 0,
        "bonos": 0,
        "deducciones": 0,
        "aplicarPrestamosAuto": True,
        "estado": "borrador",
    }
    r = client.post("/api/admin/nomina/recibos", headers=headers, json=payload)
    if r.status_code == 409:
        rec = next(e["recibo"] for e in periodo["empleados"] if e["usuarioId"] == uid and e["recibo"])
        rid = rec["id"]
        client.delete(f"/api/admin/nomina/recibos/{rid}", headers=headers)
        r = client.post("/api/admin/nomina/recibos", headers=headers, json=payload)
    assert r.status_code == 201, r.text
    recibo = r.json()
    assert recibo["descuentoPrestamos"] == 200
    assert recibo["total"] < 2000

    r = client.patch(
        f"/api/admin/nomina/recibos/{recibo['id']}",
        headers=headers,
        json={"estado": "pagado"},
    )
    assert r.status_code == 200, r.text

    periodo2 = client.get(
        "/api/admin/nomina",
        headers=headers,
        params={"anio": anio, "mes": mes, "quincena": quincena},
    ).json()
    row2 = next(e for e in periodo2["empleados"] if e["usuarioId"] == uid)
    activo = next(p for p in row2["prestamos"] if p["id"] == prestamo["id"])
    assert activo["saldoPendiente"] == 300
