from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.auth.dependencies import require_roles
from app.models.reportes import PeriodoReporte, ReporteOut
from app.models.user import Rol, UserPublic
from app.services.reportes import build_reporte

router = APIRouter(prefix="/api/reportes", tags=["reportes"])

AdminUser = Annotated[UserPublic, Depends(require_roles(Rol.ADMIN))]


@router.get("", response_model=ReporteOut)
def get_reporte(
    _: AdminUser,
    periodo: PeriodoReporte = Query(description="dia, mes o anio"),
    fecha: date | None = Query(default=None, description="YYYY-MM-DD (periodo=dia)"),
    anio: int | None = Query(default=None, ge=2020, le=2100),
    mes: int | None = Query(default=None, ge=1, le=12, description="1-12 (periodo=mes)"),
) -> ReporteOut:
    return build_reporte(periodo, fecha=fecha, anio=anio, mes=mes)
