from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.auth.dependencies import require_roles
from app.models.inventario import InventarioOut, InventarioUpdate
from app.models.user import Rol, UserPublic
from app.services.inventario import (
    delete_inventario_item,
    list_inventario,
    reset_inventario,
    update_stock,
)

router = APIRouter(prefix="/api/inventario", tags=["inventario"])

StaffUser = Annotated[UserPublic, Depends(require_roles(Rol.ADMIN, Rol.MESERO, Rol.COCINERO))]
AdminUser = Annotated[UserPublic, Depends(require_roles(Rol.ADMIN))]


@router.get("", response_model=list[InventarioOut])
def get_inventario(_: StaffUser) -> list[InventarioOut]:
    return list_inventario()


@router.patch("/{clave}", response_model=InventarioOut)
def patch_inventario(clave: str, body: InventarioUpdate, _: AdminUser) -> InventarioOut:
    return update_stock(clave, body)


@router.post("/reset", response_model=list[InventarioOut])
def post_reset_inventario(_: AdminUser) -> list[InventarioOut]:
    return reset_inventario()


@router.delete("/{clave}", status_code=status.HTTP_204_NO_CONTENT)
def remove_inventario_item(clave: str, _: AdminUser) -> None:
    delete_inventario_item(clave)
