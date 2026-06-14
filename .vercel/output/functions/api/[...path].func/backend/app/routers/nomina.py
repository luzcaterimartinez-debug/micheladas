from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.auth.dependencies import require_roles
from app.models.nomina import (
    NominaConfigIn,
    NominaConfigOut,
    NominaPeriodoOut,
    NominaPrestamoIn,
    NominaPrestamoOut,
    NominaPrestamoUpdate,
    NominaReciboIn,
    NominaReciboOut,
    NominaReciboUpdate,
)
from app.models.user import Rol, UserPublic
from app.services.nomina import (
    create_prestamo,
    delete_prestamo,
    delete_recibo,
    get_periodo,
    save_recibo,
    update_prestamo,
    update_recibo,
    upsert_config,
)

router = APIRouter(prefix="/api/admin/nomina", tags=["nomina"])

AdminUser = Annotated[UserPublic, Depends(require_roles(Rol.ADMIN))]


@router.get("", response_model=NominaPeriodoOut)
def list_nomina_periodo(
    _: AdminUser,
    anio: int = Query(ge=2020, le=2100),
    mes: int = Query(ge=1, le=12),
    quincena: int | None = Query(default=None, ge=1, le=2),
) -> NominaPeriodoOut:
    return get_periodo(anio, mes, quincena)


@router.put("/config/{usuario_id}", response_model=NominaConfigOut)
def put_config(usuario_id: int, body: NominaConfigIn, _: AdminUser) -> NominaConfigOut:
    return upsert_config(usuario_id, body)


@router.post("/recibos", response_model=NominaReciboOut, status_code=201)
def post_recibo(body: NominaReciboIn, _: AdminUser) -> NominaReciboOut:
    return save_recibo(body)


@router.patch("/recibos/{recibo_id}", response_model=NominaReciboOut)
def patch_recibo(recibo_id: str, body: NominaReciboUpdate, _: AdminUser) -> NominaReciboOut:
    return update_recibo(recibo_id, body)


@router.delete("/recibos/{recibo_id}", status_code=204)
def remove_recibo(recibo_id: str, _: AdminUser) -> None:
    delete_recibo(recibo_id)


@router.post("/prestamos", response_model=NominaPrestamoOut, status_code=201)
def post_prestamo(body: NominaPrestamoIn, _: AdminUser) -> NominaPrestamoOut:
    return create_prestamo(body)


@router.patch("/prestamos/{prestamo_id}", response_model=NominaPrestamoOut)
def patch_prestamo(prestamo_id: str, body: NominaPrestamoUpdate, _: AdminUser) -> NominaPrestamoOut:
    return update_prestamo(prestamo_id, body)


@router.delete("/prestamos/{prestamo_id}", status_code=204)
def remove_prestamo(prestamo_id: str, _: AdminUser) -> None:
    delete_prestamo(prestamo_id)
