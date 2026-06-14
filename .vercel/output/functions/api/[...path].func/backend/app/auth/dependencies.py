from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.auth.jwt import decode_access_token
from app.database import fetch_one, get_db
from app.models.user import Rol, UserPublic

security = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
) -> UserPublic:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No autenticado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = int(payload.sub)
    with get_db() as (_, cursor):
        row = fetch_one(
            cursor,
            """
            SELECT id, nombre, email, rol
            FROM usuarios
            WHERE id = %s AND activo = 1
            """,
            (user_id,),
        )

    if row is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no encontrado")

    return UserPublic(
        id=row["id"],
        nombre=row["nombre"],
        email=row["email"],
        rol=row["rol"],
    )


def require_roles(*roles: Rol):
    def checker(user: Annotated[UserPublic, Depends(get_current_user)]) -> UserPublic:
        if user.rol not in {r.value for r in roles}:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para esta acción",
            )
        return user

    return checker
