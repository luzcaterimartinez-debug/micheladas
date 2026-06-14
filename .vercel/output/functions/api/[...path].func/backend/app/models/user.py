from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field, field_validator


class Rol(str, Enum):
    ADMIN = "admin"
    MESERO = "mesero"
    COCINERO = "cocinero"


RolLiteral = Literal["admin", "mesero", "cocinero"]


def normalize_email(value: str) -> str:
    email = value.strip().lower()
    local, _, domain = email.partition("@")
    if not local or not domain or "." not in domain:
        raise ValueError("Correo inválido")
    return email


class LoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=1)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        return normalize_email(value)


class UserPublic(BaseModel):
    id: int
    nombre: str
    email: str
    rol: RolLiteral

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        return normalize_email(value)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class TokenPayload(BaseModel):
    sub: str
    rol: RolLiteral
    nombre: str
