from typing import Annotated

import logging

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import mysql.connector

from app.auth.jwt import decode_access_token
from app.cache import cache_invalidate, query_cache
from app.config import get_settings
from app.database import fetch_one, get_db
from app.models.user import Rol, UserPublic

logger = logging.getLogger(__name__)

security = HTTPBearer(auto_error=False)

AUTH_USER_CACHE_PREFIX = "auth:user:"


def invalidate_auth_user_cache(user_id: int | None = None) -> None:
    if user_id is None:
        cache_invalidate(AUTH_USER_CACHE_PREFIX)
    else:
        cache_invalidate(f"{AUTH_USER_CACHE_PREFIX}{user_id}")


def _user_from_token(
    *,
    user_id: int,
    rol: str,
    nombre: str,
    email: str | None,
) -> UserPublic:
    """Respaldo sin MySQL: claims del JWT (el POS no debe botar al usuario)."""
    fallback_email = email if email and "@" in email else f"user{user_id}@sesion.local"
    return UserPublic(
        id=user_id,
        nombre=nombre or f"Usuario {user_id}",
        email=fallback_email,
        rol=rol,  # type: ignore[arg-type]
    )


def _load_user_public(user_id: int) -> UserPublic:
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
    ttl = float(get_settings().query_cache_auth_ttl_seconds)

    try:
        return query_cache(
            f"{AUTH_USER_CACHE_PREFIX}{user_id}",
            lambda: _load_user_public(user_id),
            ttl_seconds=ttl,
        )
    except HTTPException:
        raise
    except (mysql.connector.Error, OSError, TimeoutError) as exc:
        logger.warning(
            "Auth: MySQL no disponible (%s) — sirviendo usuario desde JWT id=%s",
            type(exc).__name__,
            user_id,
        )
        return _user_from_token(
            user_id=user_id,
            rol=payload.rol,
            nombre=payload.nombre,
            email=payload.email,
        )
    except Exception as exc:
        # Otros fallos de red del conector / host
        if "1226" in str(exc) or "max_connections" in str(exc).lower() or "mysql" in type(exc).__name__.lower():
            logger.warning(
                "Auth: error de BD (%s) — sirviendo usuario desde JWT id=%s",
                exc,
                user_id,
            )
            return _user_from_token(
                user_id=user_id,
                rol=payload.rol,
                nombre=payload.nombre,
                email=payload.email,
            )
        raise


def require_roles(*roles: Rol):
    def checker(user: Annotated[UserPublic, Depends(get_current_user)]) -> UserPublic:
        if user.rol not in {r.value for r in roles}:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para esta acción",
            )
        return user

    return checker
