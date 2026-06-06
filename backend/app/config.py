from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    mysql_host: str = "82.197.82.29"
    mysql_port: int = 3306
    mysql_user: str = "u659323332_micheladas"
    mysql_password: str = "Michelandia123*"
    mysql_database: str = "u659323332_micheladas"

    jwt_secret: str = "dev-secret-change-in-production"
    jwt_expire_minutes: int = 480
    jwt_algorithm: str = "HS256"

    cors_origins: str = "http://localhost:8080,http://127.0.0.1:8080,http://localhost:5173,http://127.0.0.1:5173"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
