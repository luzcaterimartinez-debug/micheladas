from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.config import get_settings, production_config_errors
from app.database import check_database
from app.routers import admin, admin_menu, auth, caja, comandas, inventario, menu, mesas, nomina, reportes

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Micheladas API",
    description="API de autenticación y roles para el POS de micheladas",
    version="1.0.0",
)

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(menu.router)
app.include_router(admin.router)
app.include_router(admin_menu.router)
app.include_router(mesas.router)
app.include_router(comandas.router)
app.include_router(inventario.router)
app.include_router(reportes.router)
app.include_router(nomina.router)
app.include_router(caja.router)


@app.middleware("http")
async def guard_production_config(request: Request, call_next):
    if request.url.path in ("/api/health", "/api/ping", "/api/status"):
        return await call_next(request)
    config_errors = production_config_errors(settings)
    if config_errors:
        return JSONResponse(
            status_code=503,
            content={"detail": "Configuración de producción incompleta", "config_errors": config_errors},
        )
    return await call_next(request)


@app.get("/api/ping")
def ping() -> dict[str, str | bool]:
    """Smoke test — no requiere MySQL ni JWT."""
    return {"ok": True, "api": "micheladas", "env": settings.app_env}


@app.get("/api/status")
def status(response: Response) -> dict[str, str | list[str] | bool]:
    """Diagnóstico: config + MySQL (sin secretos)."""
    config_errors = production_config_errors(settings)
    db_ok, db_error = check_database()
    payload: dict[str, str | list[str] | bool] = {
        "api": "micheladas",
        "env": settings.app_env,
        "config_ok": len(config_errors) == 0,
        "database": "ok" if db_ok else "error",
        "mysql_host": settings.mysql_host,
        "mysql_database": settings.mysql_database,
    }
    if config_errors:
        payload["config_errors"] = config_errors
        response.status_code = 503
    elif not db_ok:
        payload["database_error"] = db_error or "sin detalle"
        response.status_code = 503
    return payload


@app.get("/api/health")
def health(response: Response) -> dict[str, str | list[str]]:
    config_errors = production_config_errors(settings)
    if config_errors:
        response.status_code = 503
        return {
            "status": "error",
            "config": "invalid",
            "config_errors": config_errors,
            "env": settings.app_env,
        }

    db_ok, db_error = check_database()
    if db_ok:
        logger.info("Health check: base de datos conectada (%s)", settings.mysql_database)
    else:
        logger.warning("Health check: base de datos no disponible (%s)", settings.mysql_database)
    payload: dict[str, str | list[str]] = {
        "status": "ok" if db_ok else "degraded",
        "database": "ok" if db_ok else "error",
        "env": settings.app_env,
    }
    if db_error and not settings.is_production:
        payload["database_error"] = db_error
    elif db_error and settings.is_production:
        payload["mysql_host"] = settings.mysql_host
    if not db_ok:
        response.status_code = 503
    return payload
