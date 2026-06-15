import os
import sys
import traceback

# backend/ lives at the project root, one level above api/
# We add backend/ itself to sys.path so that 'from app.X import Y'
# inside backend/app/* continues to work without changes.
_project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(_project_root, "backend"))

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from mangum import Mangum

try:
    from app.main import app as _asgi_app
except Exception as boot_error:
    _asgi_app = FastAPI(title="Micheladas API (boot error)")
    _boot_detail = {
        "detail": "Error al iniciar la API",
        "error": str(boot_error),
        "traceback": traceback.format_exc(),
    }

    @_asgi_app.api_route(
        "/{full_path:path}",
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    )
    async def boot_error_handler(full_path: str) -> JSONResponse:
        return JSONResponse(status_code=503, content=_boot_detail)

# Vercel/Lambda invoca `handler`, no la app ASGI directamente.
# _asgi_app uses a private name so Vercel doesn't auto-detect it as an ASGI entrypoint.
handler = Mangum(_asgi_app, lifespan="off")
