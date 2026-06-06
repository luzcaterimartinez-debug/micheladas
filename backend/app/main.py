from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import admin, admin_menu, auth, comandas, inventario, menu, mesas, nomina, reportes

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


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
