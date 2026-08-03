import mysql.connector
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.config import get_settings, production_config_errors
from app.database import check_database, peek_database_status
from app.routers import admin, admin_menu, auth, caja, comandas, gastos, inventario, menu, mesas, nomina, reportes
from app.tz import APP_TZ_NAME, ensure_process_timezone

ensure_process_timezone()

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Micheladas API",
    description="API de autenticación y roles para el POS de micheladas",
    version="1.0.0",
)

# Configurar CORS una vez con settings iniciales
_settings_on_start = get_settings()
logger.info(
    "API iniciada — env=%s, tz=%s, mysql=%s:%s/%s, user=%s, origins=%s",
    _settings_on_start.app_env,
    APP_TZ_NAME,
    _settings_on_start.mysql_host,
    _settings_on_start.mysql_port,
    _settings_on_start.mysql_database,
    _settings_on_start.mysql_user,
    _settings_on_start.cors_origin_list,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_settings_on_start.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(mysql.connector.Error)
async def mysql_error_handler(request: Request, exc: mysql.connector.Error) -> JSONResponse:
    settings = get_settings()
    logger.error("MySQL error: %s", exc)
    payload: dict[str, str] = {
        "detail": "Base de datos no disponible",
        "database_error": f"{type(exc).__name__}: {exc}",
    }
    logger.error(
        "MySQL error handler called for %s %s — exc=%s",
        request.method,
        request.url.path,
        str(exc),
    )
    return JSONResponse(status_code=503, content=payload)


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    import traceback

    tb = traceback.format_exc()
    logger.error(
        "Unhandled exception in %s %s: %s\n%s",
        request.method,
        request.url.path,
        str(exc),
        tb,
    )
    # En producción también devolvemos el tipo de error (sin traceback) para diagnosticar
    # fallos como AssertionError vacío del conector MySQL en Vercel.
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Error interno del servidor",
            "error": f"{type(exc).__name__}: {exc}",
        },
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
app.include_router(gastos.router)


@app.middleware("http")
async def guard_production_config(request: Request, call_next):
    settings = get_settings()
    if request.url.path in ("/api/health", "/api/ping", "/api/status"):
        return await call_next(request)
    config_errors = production_config_errors(settings)
    if config_errors:
        logger.error(
            "Bloqueado %s %s por errores de configuración: %s",
            request.method,
            request.url.path,
            config_errors,
        )
        return JSONResponse(
            status_code=503,
            content={"detail": "Configuración de producción incompleta", "config_errors": config_errors},
        )
    return await call_next(request)


@app.get("/api/ping")
def ping() -> dict[str, str | bool]:
    """Smoke test — no requiere MySQL ni JWT."""
    settings = get_settings()
    return {"ok": True, "api": "micheladas", "env": settings.app_env}


@app.get("/api/status")
def status(response: Response, deep: bool = False) -> dict[str, str | list[str] | bool]:
    """Diagnóstico: config + MySQL (sin secretos). Usa caché salvo ?deep=1."""
    settings = get_settings()
    config_errors = production_config_errors(settings)
    if deep:
        db_ok, db_error = check_database(force=True)
    else:
        cached = peek_database_status()
        if cached is None:
            # No forzar ping: status también lo usa el front/diagnóstico espontáneo.
            db_ok, db_error = check_database(force=False)
        else:
            db_ok, db_error = cached
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
    logger.info(
        "Status endpoint: env=%s, config_ok=%s, db=%s",
        settings.app_env,
        len(config_errors) == 0,
        "ok" if db_ok else "error",
    )
    return payload


@app.get("/api/health")
def health(response: Response, deep: bool = False) -> dict[str, str | list[str]]:
    """
    Liveness del API. Por defecto NO abre MySQL (evita gastar max_connections_per_hour
    en Hostinger con cold starts de Vercel + polls del front).

    - Sin query: solo config + caché local del último check DB (si existe).
    - ?deep=1: sí hace ping a MySQL (diagnóstico manual /ops).
    """
    settings = get_settings()
    config_errors = production_config_errors(settings)
    if config_errors:
        response.status_code = 503
        return {
            "status": "error",
            "config": "invalid",
            "config_errors": config_errors,
            "env": settings.app_env,
        }

    if deep:
        db_ok, db_error = check_database(force=True)
        db_state = "ok" if db_ok else "error"
    else:
        cached = peek_database_status()
        if cached is None:
            # API arriba; no sabemos BD sin gastar una conexión.
            db_ok, db_error = True, None
            db_state = "skipped"
        else:
            db_ok, db_error = cached
            db_state = "ok" if db_ok else "error"

    payload: dict[str, str | list[str]] = {
        "status": "ok" if db_ok else "degraded",
        "database": db_state,
        "env": settings.app_env,
        "mysql_host": settings.mysql_host,
    }
    if db_error:
        payload["database_error"] = db_error
        if "max_connections_per_hour" in db_error.lower() or "1226" in db_error:
            payload["hint"] = (
                "Hostinger: se agotó max_connections_per_hour. "
                "Cierra pestañas del POS y espera ~1 hora. "
                "No reintentes health: cada intento consume la cuota."
            )
        elif "pool exhausted" in db_error.lower():
            payload["hint"] = (
                "Pool MySQL agotado en la función serverless. "
                "Redeploy con conexiones directas (sin pool) en Vercel."
            )
    # Solo 503 cuando sabemos que la BD falló (deep o caché de error).
    # Con database=skipped devolvemos 200: el front puede tratar la API como viva.
    if not db_ok and db_state == "error":
        response.status_code = 503
    return payload
