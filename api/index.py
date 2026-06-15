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
