import base64
import json
import os
import sys
import traceback

# En el bundle de Vercel, backend/ está junto a index.py.
# En desarrollo local (api/index.py), backend/ está en la raíz del proyecto.
_here = os.path.dirname(os.path.abspath(__file__))
_bundle_backend = os.path.join(_here, "backend")
_source_backend = os.path.join(os.path.dirname(_here), "backend")

if os.path.isdir(_bundle_backend):
    sys.path.insert(0, _bundle_backend)
else:
    sys.path.insert(0, _source_backend)

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from starlette.testclient import TestClient

try:
    from app.main import app
except Exception as boot_error:
    _boot_tb = traceback.format_exc()
    app = FastAPI(title="Micheladas API — boot error")

    @app.api_route(
        "/{full_path:path}",
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    )
    async def boot_error_handler(full_path: str) -> JSONResponse:
        return JSONResponse(
            status_code=503,
            content={
                "detail": "Error al iniciar la API",
                "error": str(boot_error),
                "traceback": _boot_tb,
            },
        )

_client: TestClient | None = None


def _get_client() -> TestClient:
    global _client
    if _client is None:
        _client = TestClient(app, raise_server_exceptions=False)
    return _client


def handler(event: dict, context) -> dict:
    """Entrypoint Vercel — event["body"] es JSON con method, path, headers, body."""
    try:
        payload = json.loads(event["body"])
    except (KeyError, TypeError, json.JSONDecodeError) as exc:
        return {
            "statusCode": 500,
            "headers": {"content-type": "application/json"},
            "body": json.dumps({"detail": "Evento inválido", "error": str(exc)}),
        }

    method = str(payload.get("method", "GET")).upper()
    path = str(payload.get("path", "/"))
    headers = payload.get("headers") or {}

    raw_body = payload.get("body", "")
    if payload.get("encoding") == "base64" and raw_body:
        content = base64.b64decode(raw_body)
    elif isinstance(raw_body, str):
        content = raw_body.encode("utf-8") if raw_body else b""
    elif isinstance(raw_body, (bytes, bytearray)):
        content = bytes(raw_body)
    else:
        content = b""

    try:
        response = _get_client().request(method, path, headers=headers, content=content)
    except Exception as exc:
        return {
            "statusCode": 500,
            "headers": {"content-type": "application/json"},
            "body": json.dumps({"detail": "Error en la API", "error": str(exc)}),
        }

    out: dict = {
        "statusCode": response.status_code,
        "headers": dict(response.headers),
    }
    try:
        out["body"] = response.content.decode("utf-8")
    except UnicodeDecodeError:
        out["body"] = base64.b64encode(response.content).decode("ascii")
        out["encoding"] = "base64"
    return out
