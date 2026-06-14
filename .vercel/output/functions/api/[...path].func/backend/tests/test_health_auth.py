"""Health y autenticación."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient


pytestmark = pytest.mark.integration


def test_health_ok(client: TestClient, db_available: bool) -> None:
    r = client.get("/api/health")
    data = r.json()
    assert "status" in data
    assert "database" in data
    if not db_available:
        assert r.status_code == 503
        assert data["database"] == "error"
        return
    assert r.status_code == 200
    assert data["status"] == "ok"
    assert data["database"] == "ok"


def test_login_admin(client: TestClient, admin_token: str) -> None:
    assert len(admin_token) > 20


def test_login_invalid_credentials(client: TestClient, db_available: bool) -> None:
    if not db_available:
        pytest.skip("MySQL no disponible")
    r = client.post(
        "/api/auth/login",
        json={"email": "admin@micheladas.local", "password": "wrong"},
    )
    assert r.status_code == 401


def test_me_requires_auth(client: TestClient) -> None:
    r = client.get("/api/auth/me")
    assert r.status_code == 401


def test_me_with_token(client: TestClient, admin_headers: dict[str, str]) -> None:
    r = client.get("/api/auth/me", headers=admin_headers)
    assert r.status_code == 200
    data = r.json()
    assert data["rol"] == "admin"
    assert data["email"] == "admin@micheladas.local"


def test_menu_requires_auth(client: TestClient) -> None:
    r = client.get("/api/menu")
    assert r.status_code == 401
