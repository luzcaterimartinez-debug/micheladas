import base64
import json
import traceback

_app = None
_client = None


def _load_app():
    global _app
    if _app is not None:
        return _app

    import os
    import sys

    here = os.path.dirname(os.path.abspath(__file__))
    bundle_backend = os.path.join(here, "backend")
    source_backend = os.path.join(os.path.dirname(here), "backend")
    sys.path.insert(0, bundle_backend if os.path.isdir(bundle_backend) else source_backend)

    from fastapi import FastAPI
    from fastapi.responses import JSONResponse

    try:
        from app.main import app as fastapi_app
        _app = fastapi_app
        return _app
    except Exception as boot_error:
        boot_tb = traceback.format_exc()
        fallback = FastAPI(title="Micheladas API — boot error")

        @fallback.api_route(
            "/{full_path:path}",
            methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
        )
        async def boot_error_handler(full_path: str) -> JSONResponse:
            return JSONResponse(
                status_code=503,
                content={
                    "detail": "Error al iniciar la API",
                    "error": str(boot_error),
                    "traceback": boot_tb,
                },
            )

        _app = fallback
        return _app


def _get_client():
    global _client
    if _client is None:
        from starlette.testclient import TestClient

        _client = TestClient(_load_app(), raise_server_exceptions=False)
    return _client


def handler(event, context):
    """Entrypoint Vercel — event['body'] es JSON con method, path, headers, body."""
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
            "body": json.dumps(
                {
                    "detail": "Error en la API",
                    "error": str(exc),
                    "traceback": traceback.format_exc(),
                }
            ),
        }

    out = {
        "statusCode": response.status_code,
        "headers": dict(response.headers),
    }
    try:
        out["body"] = response.content.decode("utf-8")
    except UnicodeDecodeError:
        out["body"] = base64.b64encode(response.content).decode("ascii")
        out["encoding"] = "base64"
    return out
