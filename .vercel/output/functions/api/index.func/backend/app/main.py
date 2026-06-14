from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import check_database
from app.routers import admin, admin_menu, auth, caja, comandas, inventario, menu, mesas, nomina, reportes

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


@app.get("/api/health")
def health(response: Response) -> dict[str, str]:
    db_ok, db_error = check_database()
    payload: dict[str, str] = {
        "status": "ok" if db_ok else "degraded",
        "database": "ok" if db_ok else "error",
        "env": settings.app_env,
    }
    if db_error and not settings.is_production:
        payload["database_error"] = db_error
    if not db_ok:
        response.status_code = 503
    return payload
