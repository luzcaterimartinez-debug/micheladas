from datetime import date
from typing import Literal

from pydantic import BaseModel, Field, model_validator

MetodoPago = Literal["efectivo", "tarjeta", "transferencia", "mixto"]


class PagoCreate(BaseModel):
    metodoPago: MetodoPago
    propina: float = Field(default=0, ge=0)
    montoEfectivo: float | None = Field(default=None, ge=0)
    montoTarjeta: float | None = Field(default=None, ge=0)
    montoTransferencia: float | None = Field(default=None, ge=0)

    @model_validator(mode="after")
    def validar_mixto(self) -> "PagoCreate":
        if self.metodoPago != "mixto":
            return self
        if self.montoEfectivo is None and self.montoTarjeta is None and self.montoTransferencia is None:
            raise ValueError("Pago mixto requiere al menos un monto por método")
        return self


class MetodoResumen(BaseModel):
    metodo: MetodoPago | str
    total: float
    comandas: int


class CajaResumenOut(BaseModel):
    fecha: str
    ventasPagadas: float
    ventasPendientes: float
    propinas: float
    comandasPagadas: int
    comandasPendientes: int
    efectivoEsperado: float
    tarjetaTotal: float
    transferenciaTotal: float
    porMetodo: list[MetodoResumen]
    corteCerrado: bool
    corteId: str | None = None
    efectivoContado: float | None = None
    diferencia: float | None = None


class CorteCreate(BaseModel):
    fecha: date | None = None
    efectivoContado: float = Field(ge=0)
    notas: str | None = Field(default=None, max_length=500)


class CorteOut(BaseModel):
    id: str
    fecha: str
    totalVentas: float
    totalPropinas: float
    efectivoEsperado: float
    tarjetaTotal: float
    transferenciaTotal: float
    efectivoContado: float
    diferencia: float
    comandasPagadas: int
    comandasPendientes: int
    notas: str | None = None
    cerradoEn: int
    cerradoPorId: int
    cerradoPorNombre: str | None = None
