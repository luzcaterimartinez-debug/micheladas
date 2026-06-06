from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.dependencies import require_roles
from app.database import fetch_one, get_db
from app.menu_constants import pasos_to_json, slugify
from app.models.menu import (
    AdicionCreate,
    AdicionOut,
    AdicionUpdate,
    CategoriaCreate,
    CategoriaOut,
    CategoriaUpdate,
    MenuOut,
    ProductoCreate,
    ProductoOut,
    FaseCreate,
    FaseOpcionCreate,
    FaseOpcionOut,
    FaseOpcionUpdate,
    FaseOut,
    FaseUpdate,
    ProductoUpdate,
)
from app.models.user import Rol, UserPublic
from app.services.inventario import sync_consumo_producto
from app.services.menu import (
    create_fase,
    create_fase_opcion,
    delete_adicion,
    delete_fase_opcion,
    get_producto_by_id,
    list_all_toppings,
    list_fases,
    load_menu,
    sync_product_opciones,
    sync_product_toppings,
    update_fase,
    update_fase_opcion,
)

router = APIRouter(prefix="/api/admin/menu", tags=["admin-menu"])

AdminUser = Annotated[UserPublic, Depends(require_roles(Rol.ADMIN))]


@router.get("", response_model=MenuOut)
def get_menu_admin(_: AdminUser) -> MenuOut:
    return load_menu(include_inactive=True)


@router.get("/fases", response_model=list[FaseOut])
def get_fases(_: AdminUser) -> list[FaseOut]:
    return list_fases(include_inactive=True)


@router.post("/fases", response_model=FaseOut, status_code=status.HTTP_201_CREATED)
def post_fase(body: FaseCreate, _: AdminUser) -> FaseOut:
    return create_fase(body.nombre, body.descripcion, body.activo)


@router.patch("/fases/{fase_id}", response_model=FaseOut)
def patch_fase(fase_id: str, body: FaseUpdate, _: AdminUser) -> FaseOut:
    return update_fase(
        fase_id,
        nombre=body.nombre,
        descripcion=body.descripcion,
        activo=body.activo,
        orden=body.orden,
    )


@router.post("/fases/{fase_id}/opciones", response_model=FaseOpcionOut, status_code=status.HTTP_201_CREATED)
def post_fase_opcion(fase_id: str, body: FaseOpcionCreate, _: AdminUser) -> FaseOpcionOut:
    return create_fase_opcion(
        fase_id,
        body.nombre,
        body.inventario_clave,
        body.cantidad,
    )


@router.patch("/fases/opciones/{opcion_id}", response_model=FaseOpcionOut)
def patch_fase_opcion(opcion_id: str, body: FaseOpcionUpdate, _: AdminUser) -> FaseOpcionOut:
    if (
        body.nombre is None
        and body.inventario_clave is None
        and body.cantidad is None
    ):
        raise HTTPException(status_code=400, detail="Nada que actualizar")
    return update_fase_opcion(
        opcion_id,
        body.nombre,
        body.inventario_clave,
        body.cantidad,
        clear_inventario=body.inventario_clave == "",
    )


@router.delete("/fases/opciones/{opcion_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_fase_opcion(opcion_id: str, _: AdminUser) -> None:
    delete_fase_opcion(opcion_id)


@router.get("/toppings", response_model=list[FaseOpcionOut])
def get_toppings_legacy(_: AdminUser) -> list[FaseOpcionOut]:
    """Compatibilidad: catálogo plano de opciones de fase."""
    return list_all_toppings()


def _opcion_ids_from_body(body: ProductoCreate | ProductoUpdate) -> list[str] | None:
    if body.opcion_ids is not None:
        return body.opcion_ids
    if body.topping_ids is not None:
        return body.topping_ids
    return None


@router.post("/categorias", response_model=CategoriaOut, status_code=status.HTTP_201_CREATED)
def create_categoria(body: CategoriaCreate, _: AdminUser) -> CategoriaOut:
    cat_id = slugify(body.nombre)
    with get_db() as (conn, cursor):
        if fetch_one(cursor, "SELECT id FROM menu_categorias WHERE id = %s", (cat_id,)):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Esa categoría ya existe")

        cursor.execute("SELECT COALESCE(MAX(orden), 0) + 1 AS n FROM menu_categorias")
        orden_row = cursor.fetchone()
        orden = orden_row["n"] if orden_row else 1

        cursor.execute(
            """
            INSERT INTO menu_categorias (id, nombre, descripcion, activo, orden)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (cat_id, body.nombre.strip(), body.descripcion.strip(), int(body.activo), orden),
        )
        conn.commit()

    return CategoriaOut(
        id=cat_id,
        name=body.nombre.strip(),
        description=body.descripcion.strip(),
        activo=body.activo,
        productos=[],
    )


@router.patch("/categorias/{categoria_id}", response_model=CategoriaOut)
def update_categoria(categoria_id: str, body: CategoriaUpdate, _: AdminUser) -> CategoriaOut:
    with get_db() as (conn, cursor):
        row = fetch_one(
            cursor,
            "SELECT id, nombre, descripcion, activo, orden FROM menu_categorias WHERE id = %s",
            (categoria_id,),
        )
        if row is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada")

        nombre = body.nombre.strip() if body.nombre else row["nombre"]
        descripcion = body.descripcion if body.descripcion is not None else row["descripcion"]
        activo = int(body.activo) if body.activo is not None else row["activo"]
        orden = body.orden if body.orden is not None else row["orden"]

        cursor.execute(
            """
            UPDATE menu_categorias
            SET nombre = %s, descripcion = %s, activo = %s, orden = %s
            WHERE id = %s
            """,
            (nombre, descripcion, activo, orden, categoria_id),
        )
        conn.commit()

    menu = load_menu(include_inactive=True)
    cat = next((c for c in menu.categorias if c.id == categoria_id), None)
    if cat:
        return cat
    return CategoriaOut(id=categoria_id, name=nombre, description=descripcion, activo=bool(activo), productos=[])


@router.post("/productos", response_model=ProductoOut, status_code=status.HTTP_201_CREATED)
def create_producto(body: ProductoCreate, _: AdminUser) -> ProductoOut:
    producto_id = slugify(body.nombre)
    with get_db() as (conn, cursor):
        existing = fetch_one(cursor, "SELECT id FROM menu_productos WHERE id = %s", (producto_id,))
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ya existe un producto con un nombre similar",
            )

        cat = fetch_one(
            cursor, "SELECT id FROM menu_categorias WHERE id = %s", (body.categoria_id,)
        )
        if cat is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Categoría no válida")

        cursor.execute("SELECT COALESCE(MAX(orden), 0) + 1 AS n FROM menu_productos")
        orden_row = cursor.fetchone()
        orden = orden_row["n"] if orden_row else 1

        cursor.execute(
            """
            INSERT INTO menu_productos (id, nombre, precio, descripcion, activo, orden, pasos, categoria_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                producto_id,
                body.nombre.strip(),
                body.precio,
                body.descripcion.strip(),
                int(body.activo),
                orden,
                pasos_to_json(body.pasos),
                body.categoria_id,
            ),
        )
        opcion_ids = _opcion_ids_from_body(body) or []
        sync_product_opciones(cursor, producto_id, opcion_ids)
        sync_consumo_producto(
            cursor, producto_id, body.consumo if body.consumo else None
        )
        conn.commit()

        producto = get_producto_by_id(cursor, producto_id)

    if producto is None:
        raise HTTPException(status_code=500, detail="Error al crear producto")
    return producto


@router.patch("/productos/{producto_id}", response_model=ProductoOut)
def update_producto(producto_id: str, body: ProductoUpdate, _: AdminUser) -> ProductoOut:
    with get_db() as (conn, cursor):
        row = fetch_one(
            cursor,
            "SELECT id, nombre, precio, descripcion, activo, orden, pasos, categoria_id FROM menu_productos WHERE id = %s",
            (producto_id,),
        )
        if row is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")

        nombre = body.nombre.strip() if body.nombre else row["nombre"]
        precio = body.precio if body.precio is not None else row["precio"]
        descripcion = body.descripcion if body.descripcion is not None else row["descripcion"]
        activo = int(body.activo) if body.activo is not None else row["activo"]
        orden = body.orden if body.orden is not None else row["orden"]
        pasos = pasos_to_json(body.pasos) if body.pasos is not None else row["pasos"]
        categoria_id = body.categoria_id if body.categoria_id is not None else row["categoria_id"]

        if body.categoria_id is not None:
            cat = fetch_one(cursor, "SELECT id FROM menu_categorias WHERE id = %s", (categoria_id,))
            if cat is None:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Categoría no válida")

        cursor.execute(
            """
            UPDATE menu_productos
            SET nombre = %s, precio = %s, descripcion = %s, activo = %s, orden = %s, pasos = %s, categoria_id = %s
            WHERE id = %s
            """,
            (nombre, precio, descripcion, activo, orden, pasos, categoria_id, producto_id),
        )

        opcion_ids = _opcion_ids_from_body(body)
        if opcion_ids is not None:
            sync_product_opciones(cursor, producto_id, opcion_ids)
        if body.consumo is not None:
            sync_consumo_producto(cursor, producto_id, body.consumo)
        elif opcion_ids is not None:
            sync_consumo_producto(cursor, producto_id)

        conn.commit()
        producto = get_producto_by_id(cursor, producto_id)

    if producto is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    return producto


@router.post("/adiciones", response_model=AdicionOut, status_code=status.HTTP_201_CREATED)
def create_adicion(body: AdicionCreate, _: AdminUser) -> AdicionOut:
    adicion_id = slugify(body.nombre)
    with get_db() as (conn, cursor):
        existing = fetch_one(cursor, "SELECT id FROM menu_adiciones WHERE id = %s", (adicion_id,))
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Esa adición ya existe")

        cursor.execute("SELECT COALESCE(MAX(orden), 0) + 1 AS n FROM menu_adiciones")
        orden_row = cursor.fetchone()
        orden = orden_row["n"] if orden_row else 1

        cursor.execute(
            """
            INSERT INTO menu_adiciones (id, nombre, precio, stock_key, cantidad, activo, orden)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                adicion_id,
                body.nombre.strip(),
                body.precio,
                body.stock_key,
                body.cantidad,
                int(body.activo),
                orden,
            ),
        )
        conn.commit()

    return AdicionOut(
        id=adicion_id,
        name=body.nombre.strip(),
        price=float(body.precio),
        stockKey=body.stock_key,
        cantidad=float(body.cantidad),
        activo=body.activo,
    )


@router.patch("/adiciones/{adicion_id}", response_model=AdicionOut)
def update_adicion(adicion_id: str, body: AdicionUpdate, _: AdminUser) -> AdicionOut:
    with get_db() as (conn, cursor):
        row = fetch_one(
            cursor,
            "SELECT id, nombre, precio, stock_key, cantidad, activo, orden FROM menu_adiciones WHERE id = %s",
            (adicion_id,),
        )
        if row is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Adición no encontrada")

        nombre = body.nombre.strip() if body.nombre else row["nombre"]
        precio = body.precio if body.precio is not None else row["precio"]
        stock_key = body.stock_key if body.stock_key is not None else row["stock_key"]
        cantidad = body.cantidad if body.cantidad is not None else float(row.get("cantidad") or 1)
        activo = int(body.activo) if body.activo is not None else row["activo"]
        orden = body.orden if body.orden is not None else row["orden"]

        cursor.execute(
            """
            UPDATE menu_adiciones
            SET nombre = %s, precio = %s, stock_key = %s, cantidad = %s, activo = %s, orden = %s
            WHERE id = %s
            """,
            (nombre, precio, stock_key, cantidad, activo, orden, adicion_id),
        )
        conn.commit()

    return AdicionOut(
        id=adicion_id,
        name=nombre,
        price=float(precio),
        stockKey=stock_key,
        cantidad=float(cantidad),
        activo=bool(activo),
    )


@router.delete("/adiciones/{adicion_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_adicion(adicion_id: str, _: AdminUser) -> None:
    delete_adicion(adicion_id)
