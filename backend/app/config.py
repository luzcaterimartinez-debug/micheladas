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

    mysql_host: str = "localhost"
    mysql_port: int = 3306
    mysql_user: str = "root"
    mysql_password: str = ""
    mysql_database: str = "michelada"
    mysql_pool_size: int = 5
    mysql_connection_timeout: int = 10

    query_cache_ttl_seconds: int = 30
    query_cache_comandas_ttl_seconds: int = 8

    jwt_secret: str = _DEV_JWT_SECRET
    jwt_expire_minutes: int = 480
    jwt_algorithm: str = "HS256"

    cors_origins: str = (
        "http://localhost:8080,http://127.0.0.1:8080,"
        "http://localhost:5173,http://127.0.0.1:5173"
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
        if not value.strip():
            raise ValueError("JWT_SECRET no puede estar vacío")
        return value


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    if settings.is_production:
        if settings.jwt_secret in _INSECURE_JWT_SECRETS:
            raise RuntimeError(
                "APP_ENV=production requiere JWT_SECRET único y seguro (mín. 32 caracteres aleatorios)."
            )
        if len(settings.jwt_secret) < 32:
            raise RuntimeError("APP_ENV=production requiere JWT_SECRET de al menos 32 caracteres.")
        if not settings.cors_origin_list:
            raise RuntimeError("APP_ENV=production requiere CORS_ORIGINS con el dominio del frontend.")
    elif settings.jwt_secret in _INSECURE_JWT_SECRETS:
        warnings.warn(
            "JWT_SECRET por defecto — define JWT_SECRET en .env antes de desplegar.",
            stacklevel=2,
        )
    return settings


def generate_jwt_secret() -> str:
    return secrets.token_urlsafe(48)
