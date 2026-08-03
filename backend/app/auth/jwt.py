from datetime import datetime, timedelta, timezone

import jwt
from jwt.exceptions import PyJWTError

from app.config import get_settings
from app.models.user import TokenPayload


def create_access_token(
    *,
    user_id: int,
    rol: str,
    nombre: str,
    email: str | None = None,
) -> str:
    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    payload: dict = {
        "sub": str(user_id),
        "rol": rol,
        "nombre": nombre,
        "exp": expire,
    }
    if email:
        payload["email"] = email
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> TokenPayload | None:
    settings = get_settings()
    try:
        data = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        return TokenPayload(
            sub=data["sub"],
            rol=data["rol"],
            nombre=data["nombre"],
            email=data.get("email"),
        )
    except PyJWTError:
        return None
