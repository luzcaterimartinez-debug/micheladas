from decimal import Decimal

from pydantic import BaseModel, Field


class ConsumoLine(BaseModel):
    clave: str = Field(min_length=1, max_length=50)
    cantidad: float = Field(gt=0, default=1)


class FaseOpcionOut(BaseModel):
    id: str
    name: str
    faseId: str
    faseName: str = ""
    stockKey: str | None = None
    cantidad: float = 1


class FaseOut(BaseModel):
    id: str
    name: str
    description: str = ""
    activo: bool = True
    opciones: list[FaseOpcionOut] = Field(default_factory=list)


class ProductoOut(BaseModel):
    id: str
    name: str
    price: float
    description: str
    faseOpciones: list[FaseOpcionOut] = Field(default_factory=list)
    consumo: list[ConsumoLine] = Field(default_factory=list)
    pasos: list[str] = Field(default_factory=list)
    categoria_id: str
    activo: bool = True


class CategoriaOut(BaseModel):
    id: str
    name: str
    description: str = ""
    activo: bool = True
    productos: list[ProductoOut] = Field(default_factory=list)


class AdicionOut(BaseModel):
    id: str
    name: str
    price: float
    stockKey: str | None = None
    """Porción descontada del inventario al vender (unidades del ítem de stock)."""
    cantidad: float = 1
    activo: bool = True


class MenuOut(BaseModel):
    categorias: list[CategoriaOut]
    adiciones: list[AdicionOut]
    fases: list[FaseOut] = Field(default_factory=list)


class CategoriaCreate(BaseModel):
    nombre: str = Field(min_length=2, max_length=80)
    descripcion: str = Field(default="", max_length=300)
    activo: bool = True


class CategoriaUpdate(BaseModel):
    nombre: str | None = Field(default=None, min_length=2, max_length=80)
    descripcion: str | None = Field(default=None, max_length=300)
    activo: bool | None = None
    orden: int | None = None


class FaseCreate(BaseModel):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: str = Field(default="", max_length=300)
    activo: bool = True


class FaseUpdate(BaseModel):
    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    descripcion: str | None = Field(default=None, max_length=300)
    activo: bool | None = None
    orden: int | None = None


class FaseOpcionCreate(BaseModel):
    nombre: str = Field(min_length=1, max_length=100)
    inventario_clave: str | None = Field(default=None, max_length=50)
    cantidad: float = Field(gt=0, default=1)


class FaseOpcionUpdate(BaseModel):
    nombre: str | None = Field(default=None, min_length=1, max_length=100)
    inventario_clave: str | None = Field(default=None, max_length=50)
    cantidad: float | None = Field(default=None, gt=0)


class ProductoCreate(BaseModel):
    nombre: str = Field(min_length=2, max_length=120)
    precio: Decimal = Field(gt=0)
    descripcion: str = Field(default="", max_length=500)
    categoria_id: str = Field(min_length=1, max_length=50)
    pasos: list[str] = Field(default_factory=list)
    opcion_ids: list[str] = Field(default_factory=list)
    topping_ids: list[str] | None = None
    consumo: list[ConsumoLine] = Field(default_factory=list)
    activo: bool = True


class ProductoUpdate(BaseModel):
    nombre: str | None = Field(default=None, min_length=2, max_length=120)
    precio: Decimal | None = Field(default=None, gt=0)
    descripcion: str | None = Field(default=None, max_length=500)
    categoria_id: str | None = Field(default=None, max_length=50)
    activo: bool | None = None
    orden: int | None = None
    pasos: list[str] | None = None
    opcion_ids: list[str] | None = None
    topping_ids: list[str] | None = None
    consumo: list[ConsumoLine] | None = None


class AdicionCreate(BaseModel):
    nombre: str = Field(min_length=2, max_length=100)
    precio: Decimal = Field(ge=0)
    stock_key: str | None = Field(default=None, max_length=50)
    cantidad: float = Field(gt=0, default=1)
    activo: bool = True


class AdicionUpdate(BaseModel):
    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    precio: Decimal | None = Field(default=None, ge=0)
    stock_key: str | None = Field(default=None, max_length=50)
    cantidad: float | None = Field(default=None, gt=0)
    activo: bool | None = None
    orden: int | None = None
