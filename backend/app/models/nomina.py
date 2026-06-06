from typing import Literal

from pydantic import BaseModel, Field

TipoPago = Literal["diario", "semanal", "quincenal", "mensual"]
EstadoRecibo = Literal["borrador", "pagado"]

DIAS_POR_TIPO: dict[TipoPago, int] = {
    "diario": 1,
    "semanal": 7,
    "quincenal": 15,
    "mensual": 30,
}


class NominaConfigIn(BaseModel):
    salarioBase: float = Field(ge=0)
    tipoPago: TipoPago = "quincenal"
    tarifaHoraExtra: float | None = Field(default=None, ge=0)
    puesto: str | None = Field(default=None, max_length=100)
    activo: bool = True


class NominaConfigOut(BaseModel):
    usuarioId: int
    salarioBase: float
    tipoPago: TipoPago
    tarifaHoraExtra: float | None = None
    puesto: str | None = None
    activo: bool = True


class NominaPrestamoIn(BaseModel):
    usuarioId: int
    concepto: str = Field(min_length=1, max_length=200)
    montoTotal: float = Field(gt=0)
    cuotaPeriodo: float = Field(gt=0)
    activo: bool = True


class NominaPrestamoUpdate(BaseModel):
    concepto: str | None = Field(default=None, min_length=1, max_length=200)
    cuotaPeriodo: float | None = Field(default=None, gt=0)
    saldoPendiente: float | None = Field(default=None, ge=0)
    activo: bool | None = None


class NominaPrestamoOut(BaseModel):
    id: str
    usuarioId: int
    concepto: str
    montoTotal: float
    saldoPendiente: float
    cuotaPeriodo: float
    activo: bool


class NominaReciboIn(BaseModel):
    usuarioId: int
    anio: int = Field(ge=2020, le=2100)
    mes: int = Field(ge=1, le=12)
    quincena: int | None = Field(default=None, ge=1, le=2)
    diasTrabajados: float = Field(default=0, ge=0)
    horasExtra: float = Field(default=0, ge=0)
    bonos: float = Field(default=0, ge=0)
    deducciones: float = Field(default=0, ge=0)
    descuentoPrestamos: float | None = Field(default=None, ge=0)
    aplicarPrestamosAuto: bool = True
    notas: str | None = Field(default=None, max_length=500)
    estado: EstadoRecibo | None = None


class NominaReciboUpdate(BaseModel):
    diasTrabajados: float | None = Field(default=None, ge=0)
    horasExtra: float | None = Field(default=None, ge=0)
    bonos: float | None = Field(default=None, ge=0)
    deducciones: float | None = Field(default=None, ge=0)
    descuentoPrestamos: float | None = Field(default=None, ge=0)
    aplicarPrestamosAuto: bool | None = None
    notas: str | None = Field(default=None, max_length=500)
    estado: EstadoRecibo | None = None


class NominaReciboOut(BaseModel):
    id: str
    usuarioId: int
    anio: int
    mes: int
    quincena: int | None = None
    diasTrabajados: float
    horasExtra: float
    bonos: float
    deducciones: float
    descuentoPrestamos: float = 0
    sueldoBruto: float
    total: float
    notas: str | None = None
    estado: EstadoRecibo


class NominaEmpleadoRow(BaseModel):
    usuarioId: int
    nombre: str
    email: str
    rol: str
    activo: bool
    config: NominaConfigOut | None = None
    recibo: NominaReciboOut | None = None
    prestamos: list[NominaPrestamoOut] = Field(default_factory=list)
    descuentoPrestamosSugerido: float = 0


class NominaResumen(BaseModel):
    totalBruto: float
    totalNeto: float
    totalPagado: float
    totalPrestamos: float = 0
    empleadosConRecibo: int
    empleadosPagados: int
    prestamosActivos: int = 0


class NominaPeriodoOut(BaseModel):
    anio: int
    mes: int
    quincena: int | None = None
    label: str
    empleados: list[NominaEmpleadoRow]
    resumen: NominaResumen
