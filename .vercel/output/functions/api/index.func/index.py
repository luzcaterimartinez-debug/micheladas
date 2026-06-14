import os
import sys
import traceback

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

try:
    from app.main import app
except Exception as boot_error:
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse

    app = FastAPI(title="Micheladas API (boot error)")
    _boot_detail = {
        "detail": "Error al iniciar la API",
        "error": str(boot_error),
        "traceback": traceback.format_exc(),
    }

    @app.api_route("/api/{full_path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
    async def boot_error_handler(full_path: str) -> JSONResponse:
        return JSONResponse(status_code=503, content=_boot_detail)
