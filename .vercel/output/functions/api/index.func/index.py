import os
import sys
import traceback

# In the Vercel bundle, backend/ is placed next to index.py in the function root.
# Adding it to sys.path lets us import 'from app.X import Y' as the source expects.
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend"))

from fastapi import FastAPI
from fastapi.responses import JSONResponse

try:
    from app.main import app  # noqa: E402 — imported as 'app' for Vercel handler detection
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
