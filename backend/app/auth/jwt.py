from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

from app.config import get_settings
from app.models.user import TokenPayload


def create_access_token(*, user_id: int, rol: str, nombre: str) -> str:
    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {
        "sub": str(user_id),
        "rol": rol,
        "nombre": nombre,
        "exp": expire,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> TokenPayload | None:
    settings = get_settings()
    try:
        data = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        return TokenPayload(sub=data["sub"], rol=data["rol"], nombre=data["nombre"])
    except JWTError:
        return None
