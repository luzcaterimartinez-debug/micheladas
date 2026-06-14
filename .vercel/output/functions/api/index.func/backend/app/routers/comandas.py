from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.auth.dependencies import require_roles
from app.models.pos import ComandaCreate, ComandaOut, ComandaUpdate
from app.models.user import Rol, UserPublic
from app.services.pos import create_comanda, delete_comanda, get_comanda, list_comandas, update_comanda

router = APIRouter(prefix="/api/comandas", tags=["comandas"])

StaffUser = Annotated[UserPublic, Depends(require_roles(Rol.ADMIN, Rol.MESERO, Rol.COCINERO))]


@router.get("", response_model=list[ComandaOut])
def get_comandas(
    _: StaffUser,
    status: str | None = Query(default=None, description="Filtro: pendiente,lista,entregada o CSV"),
    mesa_id: str | None = Query(default=None, alias="mesa_id"),
    limit: int = Query(default=200, ge=1, le=500),
) -> list[ComandaOut]:
    return list_comandas(status_filter=status, mesa_id=mesa_id, limit=limit)


@router.get("/{comanda_id}", response_model=ComandaOut)
def get_one(comanda_id: str, _: StaffUser) -> ComandaOut:
    return get_comanda(comanda_id)


@router.post("", response_model=ComandaOut, status_code=201)
def post_comanda(
    body: ComandaCreate,
    user: Annotated[UserPublic, Depends(require_roles(Rol.ADMIN, Rol.MESERO))],
) -> ComandaOut:
    mesero_id = user.id if user.rol == Rol.MESERO.value else None
    return create_comanda(body, mesero_id=mesero_id)


@router.patch("/{comanda_id}", response_model=ComandaOut)
def patch_comanda(
    comanda_id: str,
    body: ComandaUpdate,
    user: StaffUser,
) -> ComandaOut:
    return update_comanda(comanda_id, body)


@router.delete("/{comanda_id}", status_code=204)
def remove_comanda(
    comanda_id: str,
    _: Annotated[UserPublic, Depends(require_roles(Rol.ADMIN))],
) -> None:
    delete_comanda(comanda_id)
