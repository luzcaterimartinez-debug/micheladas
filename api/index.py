"""
Vercel Python serverless entry point.

Vercel's modern Python runtime detects ASGI apps natively — it looks for a
module-level variable named `app` that is an ASGI-compatible callable and
bridges it to Lambda automatically (no Mangum needed).

Directory layout on Lambda:
  /var/task/
    api/index.py        ← this file
    backend/            ← project root/backend (copied by Vercel build)
      app/
        main.py
        ...
"""
import os
import sys
import traceback as _traceback

# ---------------------------------------------------------------------------
# Path setup — backend/ is at the project root, one level above api/
# We add backend/ to sys.path so the existing `from app.X import Y` imports
# inside backend/app/* work without modification.
# ---------------------------------------------------------------------------
_here = os.path.dirname(os.path.abspath(__file__))
_project_root = os.path.dirname(_here)
sys.path.insert(0, os.path.join(_project_root, "backend"))

# ---------------------------------------------------------------------------
# Import the real FastAPI app — or fall back to a minimal error app that
# returns a 503 with the full boot traceback in the response body.
# ---------------------------------------------------------------------------
from fastapi import FastAPI  # noqa: E402
from fastapi.responses import JSONResponse  # noqa: E402

try:
    from app.main import app  # noqa: E402
except Exception as _boot_error:
    _boot_tb = _traceback.format_exc()

    app = FastAPI(title="Micheladas API — boot error")

    @app.api_route(
        "/{full_path:path}",
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    )
    async def _boot_error_handler(full_path: str) -> JSONResponse:
        return JSONResponse(
            status_code=503,
            content={
                "detail": "Error al iniciar la API",
                "error": str(_boot_error),
                "traceback": _boot_tb,
            },
        )
