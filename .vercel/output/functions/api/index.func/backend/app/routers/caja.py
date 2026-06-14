from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.auth.dependencies import require_roles
from app.models.caja import CajaResumenOut, CorteCreate, CorteOut, PagoCreate
from app.models.pos import ComandaOut
from app.models.user import Rol, UserPublic
from app.services.caja import (
    anular_pago,
    crear_corte,
    list_comandas_caja,
    list_cortes,
    registrar_pago,
    resumen_dia,
)

router = APIRouter(prefix="/api/caja", tags=["caja"])

AdminUser = Annotated[UserPublic, Depends(require_roles(Rol.ADMIN))]


@router.get("/resumen", response_model=CajaResumenOut)
def get_resumen(
    _: AdminUser,
    fecha: date | None = Query(default=None),
) -> CajaResumenOut:
    return resumen_dia(fecha or date.today())


@router.get("/comandas", response_model=list[ComandaOut])
def get_comandas_caja(
    _: AdminUser,
    fecha: date | None = Query(default=None),
    pagado: bool | None = Query(default=None),
) -> list[ComandaOut]:
    return list_comandas_caja(fecha=fecha or date.today(), pagado=pagado)


@router.post("/pagos/{comanda_id}", response_model=ComandaOut)
def post_pago(
    comanda_id: str,
    body: PagoCreate,
    user: AdminUser,
) -> ComandaOut:
    return registrar_pago(comanda_id, body, user.id)


@router.delete("/pagos/{comanda_id}", response_model=ComandaOut)
def delete_pago(comanda_id: str, _: AdminUser) -> ComandaOut:
    return anular_pago(comanda_id)


@router.post("/corte", response_model=CorteOut, status_code=201)
def post_corte(body: CorteCreate, user: AdminUser) -> CorteOut:
    return crear_corte(body, user.id)


@router.get("/cortes", response_model=list[CorteOut])
def get_cortes(
    _: AdminUser,
    limit: int = Query(default=30, ge=1, le=100),
) -> list[CorteOut]:
    return list_cortes(limit=limit)
