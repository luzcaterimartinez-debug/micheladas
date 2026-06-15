import base64
import json
import traceback
from http.server import BaseHTTPRequestHandler

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


def _json_response(handler: BaseHTTPRequestHandler, status: int, payload: dict) -> None:
    body = json.dumps(payload).encode("utf-8")
    handler.send_response(status)
    handler.send_header("content-type", "application/json")
    handler.send_header("content-length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


class handler(BaseHTTPRequestHandler):
    """Entrypoint Vercel — patrón oficial BaseHTTPRequestHandler."""

    def log_message(self, format: str, *args) -> None:
        return

    def do_GET(self) -> None:
        self._dispatch()

    def do_POST(self) -> None:
        self._dispatch()

    def do_PUT(self) -> None:
        self._dispatch()

    def do_PATCH(self) -> None:
        self._dispatch()

    def do_DELETE(self) -> None:
        self._dispatch()

    def do_OPTIONS(self) -> None:
        self._dispatch()

    def do_HEAD(self) -> None:
        self._dispatch()

    def _dispatch(self) -> None:
        try:
            length = int(self.headers.get("Content-Length", "0") or "0")
            raw_body = self.rfile.read(length) if length > 0 else b""

            response = _get_client().request(
                self.command,
                self.path,
                headers=dict(self.headers),
                content=raw_body,
            )

            body = response.content
            self.send_response(response.status_code)
            for key, value in response.headers.items():
                if key.lower() == "content-length":
                    continue
                self.send_header(key, value)
            self.send_header("content-length", str(len(body)))
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(body)
        except Exception as exc:
            _json_response(
                self,
                500,
                {
                    "detail": "Error en la API",
                    "error": str(exc),
                    "traceback": traceback.format_exc(),
                },
            )
