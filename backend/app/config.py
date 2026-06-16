import secrets
import warnings
from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_DEV_JWT_SECRET = "dev-secret-change-in-production"
_INSECURE_JWT_SECRETS = frozenset(
    {
        _DEV_JWT_SECRET,
        "cambia-esto-por-un-secreto-largo-y-aleatorio",
        "secret",
        "changeme",
    }
)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_env: str = "development"

    mysql_host: str = "82.197.82.29"
    mysql_port: int = 3306
    mysql_user: str = "u659323332_micheladas"
    mysql_password: str = "Micheladas123*"
    mysql_database: str = "u659323332_micheladas"
    mysql_pool_size: int = 5
    mysql_connection_timeout: int = 10

    query_cache_ttl_seconds: int = 30
    query_cache_comandas_ttl_seconds: int = 8

    jwt_secret: str = _DEV_JWT_SECRET
    jwt_expire_minutes: int = 480
    jwt_algorithm: str = "HS256"

    cors_origins: str = (
        "http://localhost:8080,http://127.0.0.1:8080,"
        "http://localhost:5173,http://127.0.0.1:5173,"
        "https://micheladas-black.vercel.app"
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.app_env.strip().lower() == "production"

    @field_validator("jwt_secret")
    @classmethod
    def jwt_secret_not_empty(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            return _DEV_JWT_SECRET
        return stripped


def production_config_errors(settings: Settings | None = None) -> list[str]:
    """Errores de configuración en producción (vacío = OK). No lanza excepciones."""
    cfg = settings or get_settings()
    if not cfg.is_production:
        return []

    errors: list[str] = []
    if cfg.jwt_secret in _INSECURE_JWT_SECRETS:
        errors.append(
            "JWT_SECRET debe ser único y seguro (no uses el valor de desarrollo). "
            "Genera uno con: python -c \"from app.config import generate_jwt_secret; print(generate_jwt_secret())\""
        )
    elif len(cfg.jwt_secret) < 32:
        errors.append("JWT_SECRET debe tener al menos 32 caracteres.")
    if not cfg.cors_origin_list:
        errors.append("CORS_ORIGINS debe incluir el dominio del frontend (ej. https://micheladas-black.vercel.app).")
    return errors


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    if not settings.is_production and settings.jwt_secret in _INSECURE_JWT_SECRETS:
        warnings.warn(
            "JWT_SECRET por defecto — define JWT_SECRET en .env antes de desplegar.",
            stacklevel=2,
        )
    return settings


def generate_jwt_secret() -> str:
    return secrets.token_urlsafe(48)
