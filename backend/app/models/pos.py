from typing import Literal

from pydantic import BaseModel, Field

ComandaStatus = Literal["pendiente", "lista", "entregada"]
MesaEstado = Literal["libre", "ocupada", "reservada"]
class AdicionItem(BaseModel):
    id: str
    name: str
    price: float


class OrderItemOut(BaseModel):
    id: str
    micheladaId: str
    micheladaName: str
    size: str | None = None
    basePrice: float
    selectedToppings: list[str] = Field(default_factory=list)
    additions: list[AdicionItem] = Field(default_factory=list)
    notes: str | None = None
    total: float


class OrderItemIn(BaseModel):
    id: str
    micheladaId: str
    micheladaName: str
    size: str | None = None
    basePrice: float
    selectedToppings: list[str] = Field(default_factory=list)
    additions: list[AdicionItem] = Field(default_factory=list)
    notes: str | None = None
    total: float


class ComandaOut(BaseModel):
    id: str
    folio: int
    queueOrder: int = Field(description="Turno del día en cola de barra (1 = primero)")
    cliente: str
    mesa: str | None = None
    mesaId: str | None = None
    meseroId: int | None = None
    items: list[OrderItemOut]
    total: float
    createdAt: int
    status: ComandaStatus


class ComandaCreate(BaseModel):
    id: str | None = Field(default=None, max_length=36, description="ID cliente para sync offline")
    cliente: str = Field(min_length=1, max_length=100)
    mesaId: str | None = Field(default=None, max_length=50)
    mesa: str | None = Field(default=None, max_length=100)
    items: list[OrderItemIn] = Field(min_length=1)
    total: float = Field(ge=0)


class ComandaUpdate(BaseModel):
    status: ComandaStatus | None = None
    mesa: str | None = Field(default=None, max_length=100)
    mesaId: str | None = Field(default=None, max_length=50)
    cliente: str | None = Field(default=None, min_length=1, max_length=100)


class MesaOut(BaseModel):
    id: str
    nombre: str
    capacidad: int
    estado: MesaEstado
    cliente: str | None = None


class MesaUpdate(BaseModel):
    estado: MesaEstado | None = None
    cliente: str | None = Field(default=None, max_length=100)
    nombre: str | None = Field(default=None, min_length=1, max_length=100)
    capacidad: int | None = Field(default=None, ge=0, le=50)


class MesaCreate(BaseModel):
    nombre: str = Field(min_length=1, max_length=100)
    capacidad: int = Field(default=4, ge=0, le=50)
