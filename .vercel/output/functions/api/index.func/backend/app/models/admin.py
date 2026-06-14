from typing import Literal

from pydantic import BaseModel, Field, field_validator

from app.models.user import RolLiteral, normalize_email


class UserAdmin(BaseModel):
    id: int
    nombre: str
    email: str
    rol: RolLiteral
    activo: bool


class UserCreate(BaseModel):
    nombre: str = Field(min_length=2, max_length=100)
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=6, max_length=128)
    rol: RolLiteral

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        return normalize_email(value)


class UserUpdate(BaseModel):
    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    email: str | None = Field(default=None, min_length=3, max_length=255)
    password: str | None = Field(default=None, min_length=6, max_length=128)
    rol: RolLiteral | None = None
    activo: bool | None = None

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return normalize_email(value)
