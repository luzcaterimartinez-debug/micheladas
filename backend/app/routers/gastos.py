from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response

from app.auth.dependencies import require_roles
from app.models.gastos import (
    CategoriaGasto,
    GastoCreate,
    GastoOut,
    GastoUpdate,
    GastosResumenOut,
)
from app.models.user import Rol, UserPublic
from app.services.gastos import (
    create_gasto,
    delete_gasto,
    list_gastos,
    resumen_gastos,
    update_gasto,
)

router = APIRouter(prefix="/api/gastos", tags=["gastos"])

AdminUser = Annotated[UserPublic, Depends(require_roles(Rol.ADMIN))]


@router.get("/resumen", response_model=GastosResumenOut)
def get_resumen(
    _: AdminUser,
    fecha: date | None = Query(default=None),
    desde: date | None = Query(default=None),
    hasta: date | None = Query(default=None),
) -> GastosResumenOut:
    return resumen_gastos(fecha=fecha, desde=desde, hasta=hasta)


@router.get("", response_model=list[GastoOut])
def get_gastos(
    _: AdminUser,
    fecha: date | None = Query(default=None),
    desde: date | None = Query(default=None),
    hasta: date | None = Query(default=None),
    categoria: CategoriaGasto | None = Query(default=None),
    limit: int = Query(default=200, ge=1, le=500),
) -> list[GastoOut]:
    return list_gastos(
        fecha=fecha,
        desde=desde,
        hasta=hasta,
        categoria=categoria,
        limit=limit,
    )


@router.post("", response_model=GastoOut, status_code=201)
def post_gasto(body: GastoCreate, user: AdminUser) -> GastoOut:
    return create_gasto(body, user.id)


@router.patch("/{gasto_id}", response_model=GastoOut)
def patch_gasto(gasto_id: str, body: GastoUpdate, _: AdminUser) -> GastoOut:
    return update_gasto(gasto_id, body)


@router.delete("/{gasto_id}", status_code=204)
def remove_gasto(gasto_id: str, _: AdminUser) -> Response:
    delete_gasto(gasto_id)
    return Response(status_code=204)
