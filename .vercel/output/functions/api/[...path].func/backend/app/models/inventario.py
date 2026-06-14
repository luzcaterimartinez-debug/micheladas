from pydantic import BaseModel, Field


class InventarioOut(BaseModel):
    key: str
    name: str
    stock: float
    unit: str
    minStock: float = 5


class InventarioUpdate(BaseModel):
    stock: float = Field(ge=0)
