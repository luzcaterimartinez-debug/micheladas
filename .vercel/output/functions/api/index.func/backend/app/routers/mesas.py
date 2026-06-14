from typing import Annotated

from fastapi import APIRouter, Depends

from app.auth.dependencies import require_roles
from app.models.pos import MesaCreate, MesaOut, MesaUpdate
from app.models.user import Rol, UserPublic
from app.services.pos import create_mesa, delete_mesa, list_mesas, marcar_mesa_atendida, update_mesa

router = APIRouter(prefix="/api/mesas", tags=["mesas"])

StaffUser = Annotated[UserPublic, Depends(require_roles(Rol.ADMIN, Rol.MESERO, Rol.COCINERO))]


@router.get("", response_model=list[MesaOut])
def get_mesas(_: StaffUser) -> list[MesaOut]:
    return list_mesas()


@router.post("", response_model=MesaOut, status_code=201)
def post_mesa(
    body: MesaCreate,
    _: Annotated[UserPublic, Depends(require_roles(Rol.ADMIN))],
) -> MesaOut:
    return create_mesa(body)


@router.post("/{mesa_id}/atendida", response_model=MesaOut)
def mesa_atendida(
    mesa_id: str,
    _: Annotated[UserPublic, Depends(require_roles(Rol.ADMIN, Rol.MESERO))],
) -> MesaOut:
    """Marca la mesa como atendida: comandas activas a entregada y mesa libre."""
    return marcar_mesa_atendida(mesa_id)


@router.patch("/{mesa_id}", response_model=MesaOut)
def patch_mesa(
    mesa_id: str,
    body: MesaUpdate,
    _: Annotated[UserPublic, Depends(require_roles(Rol.ADMIN, Rol.MESERO))],
) -> MesaOut:
    return update_mesa(mesa_id, body)


@router.delete("/{mesa_id}", status_code=204)
def remove_mesa(
    mesa_id: str,
    _: Annotated[UserPublic, Depends(require_roles(Rol.ADMIN))],
) -> None:
    delete_mesa(mesa_id)
