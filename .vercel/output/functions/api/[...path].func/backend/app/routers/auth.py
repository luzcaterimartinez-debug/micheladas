from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.dependencies import get_current_user
from app.auth.jwt import create_access_token
from app.auth.password import verify_password
from app.database import fetch_one, get_db
from app.models.user import LoginRequest, LoginResponse, UserPublic

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest) -> LoginResponse:
    with get_db() as (_, cursor):
        row = fetch_one(
            cursor,
            """
            SELECT id, nombre, email, password_hash, rol, activo
            FROM usuarios
            WHERE email = %s
            """,
            (body.email.lower(),),
        )

    if row is None or not row["activo"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
        )

    if not verify_password(body.password, row["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
        )

    token = create_access_token(user_id=row["id"], rol=row["rol"], nombre=row["nombre"])
    user = UserPublic(id=row["id"], nombre=row["nombre"], email=row["email"], rol=row["rol"])
    return LoginResponse(access_token=token, user=user)


@router.get("/me", response_model=UserPublic)
def me(user: Annotated[UserPublic, Depends(get_current_user)]) -> UserPublic:
    return user
