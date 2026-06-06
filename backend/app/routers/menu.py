from typing import Annotated

from fastapi import APIRouter, Depends

from app.auth.dependencies import get_current_user
from app.models.menu import MenuOut
from app.models.user import UserPublic
from app.services.menu import load_menu

router = APIRouter(prefix="/api/menu", tags=["menu"])


@router.get("/public", response_model=MenuOut)
def get_menu_public() -> MenuOut:
    """Menú visible para clientes (sin autenticación)."""
    return load_menu(include_inactive=False)


@router.get("", response_model=MenuOut)
def get_menu(_: Annotated[UserPublic, Depends(get_current_user)]) -> MenuOut:
    return load_menu(include_inactive=False)
