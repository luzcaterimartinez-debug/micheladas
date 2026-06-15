import os
import sys
import traceback

from fastapi import FastAPI
from fastapi.responses import JSONResponse

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

app = FastAPI(title="Micheladas API")

try:
    from app.main import app as backend_app

    app.mount("/", backend_app)
except Exception as boot_error:
    _boot_detail = {
        "detail": "Error al iniciar la API",
        "error": str(boot_error),
        "traceback": traceback.format_exc(),
    }

    @app.api_route(
        "/{full_path:path}",
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    )
    async def boot_error_handler(full_path: str) -> JSONResponse:
        return JSONResponse(status_code=503, content=_boot_detail)
