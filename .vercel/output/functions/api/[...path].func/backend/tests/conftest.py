"""Fixtures compartidas para tests de integración con MySQL."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app

ADMIN_EMAIL = "admin@micheladas.local"
ADMIN_PASSWORD = "admin123"
MESERO_EMAIL = "mesero@micheladas.local"
MESERO_PASSWORD = "mesero123"
COCINERO_EMAIL = "cocinero@micheladas.local"
COCINERO_PASSWORD = "cocinero123"


def _db_ping() -> bool:
    try:
        from app.database import get_connection

        conn = get_connection()
        conn.close()
        return True
    except Exception:
        return False


@pytest.fixture(scope="session")
def db_available() -> bool:
    return _db_ping()


@pytest.fixture(scope="session")
def client() -> TestClient:
    return TestClient(app)


def auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="session")
def admin_token(client: TestClient, db_available: bool) -> str:
    if not db_available:
        pytest.skip("MySQL no disponible — inicia la BD y ejecuta seed_users")
    r = client.post(
        "/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def mesero_token(client: TestClient, db_available: bool) -> str:
    if not db_available:
        pytest.skip("MySQL no disponible")
    r = client.post(
        "/api/auth/login",
        json={"email": MESERO_EMAIL, "password": MESERO_PASSWORD},
    )
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def cocinero_token(client: TestClient, db_available: bool) -> str:
    if not db_available:
        pytest.skip("MySQL no disponible")
    r = client.post(
        "/api/auth/login",
        json={"email": COCINERO_EMAIL, "password": COCINERO_PASSWORD},
    )
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


@pytest.fixture
def admin_headers(admin_token: str) -> dict[str, str]:
    return auth_headers(admin_token)


@pytest.fixture
def mesero_headers(mesero_token: str) -> dict[str, str]:
    return auth_headers(mesero_token)
