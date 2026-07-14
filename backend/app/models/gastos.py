from datetime import date
from typing import Literal

from pydantic import BaseModel, Field

CategoriaGasto = Literal[
    "insumos",
    "servicios",
    "renta",
    "mantenimiento",
    "nomina_extra",
    "transporte",
    "otros",
]


class GastoCreate(BaseModel):
    concepto: str = Field(min_length=1, max_length=200)
    monto: float = Field(gt=0)
    categoria: CategoriaGasto = "otros"
    fecha: date
    notas: str | None = Field(default=None, max_length=500)


class GastoUpdate(BaseModel):
    concepto: str | None = Field(default=None, min_length=1, max_length=200)
    monto: float | None = Field(default=None, gt=0)
    categoria: CategoriaGasto | None = None
    fecha: date | None = None
    notas: str | None = Field(default=None, max_length=500)


class GastoOut(BaseModel):
    id: str
    concepto: str
    monto: float
    categoria: CategoriaGasto
    fecha: date
    notas: str | None = None
    creadoPorId: int
    creadoPorNombre: str | None = None
    creadoEn: int


class GastoCategoriaTotal(BaseModel):
    categoria: CategoriaGasto
    total: float
    cantidad: int


class GastosResumenOut(BaseModel):
    desde: date
    hasta: date
    total: float
    cantidad: int
    porCategoria: list[GastoCategoriaTotal]
