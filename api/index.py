import os
import sys
import traceback

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from mangum import Mangum

try:
    from app.main import app as asgi_app
except Exception as boot_error:
    asgi_app = FastAPI(title="Micheladas API (boot error)")
    _boot_detail = {
        "detail": "Error al iniciar la API",
        "error": str(boot_error),
        "traceback": traceback.format_exc(),
    }

    @asgi_app.api_route(
        "/{full_path:path}",
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    )
    async def boot_error_handler(full_path: str) -> JSONResponse:
        return JSONResponse(status_code=503, content=_boot_detail)

# Vercel/Lambda invoca `handler`, no la app ASGI directamente.
handler = Mangum(asgi_app, lifespan="off")
