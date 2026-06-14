from typing import Literal

from pydantic import BaseModel, Field

PeriodoReporte = Literal["dia", "mes", "anio"]


class ReporteEstadoRow(BaseModel):
    status: str
    count: int
    total: float


class ReporteProductoRow(BaseModel):
    productoId: str
    productoNombre: str
    cantidad: int
    total: float


class ReporteMesaRow(BaseModel):
    mesa: str
    count: int
    total: float


class ReporteMeseroRow(BaseModel):
    meseroId: int | None = None
    meseroNombre: str
    count: int
    total: float


class ReporteSeriePunto(BaseModel):
    label: str
    count: int
    total: float


class ReporteOut(BaseModel):
    periodo: PeriodoReporte
    label: str
    desde: str
    hasta: str
    totalVentas: float
    numComandas: int
    numItems: int
    ticketPromedio: float
    porEstado: list[ReporteEstadoRow] = Field(default_factory=list)
    topProductos: list[ReporteProductoRow] = Field(default_factory=list)
    porMesa: list[ReporteMesaRow] = Field(default_factory=list)
    porMesero: list[ReporteMeseroRow] = Field(default_factory=list)
    serie: list[ReporteSeriePunto] = Field(default_factory=list)
