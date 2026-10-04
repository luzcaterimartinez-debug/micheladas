from typing import Annotated

import mysql.connector
from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.auth.dependencies import invalidate_auth_user_cache, require_roles
from app.auth.password import hash_password
from app.cache import cache_invalidate, query_cache
from app.database import fetch_all, fetch_one, get_db
from app.models.admin import UserAdmin, UserCreate, UserUpdate
from app.models.user import Rol, UserPublic

router = APIRouter(prefix="/api/admin", tags=["admin"])

AdminUser = Annotated[UserPublic, Depends(require_roles(Rol.ADMIN))]

USERS_CACHE_KEY = "usuarios:list"


def invalidate_users_cache(user_id: int | None = None) -> None:
    cache_invalidate("usuarios:")
    invalidate_auth_user_cache(user_id)


def _list_users_db() -> list[UserAdmin]:
    with get_db() as (_, cursor):
        rows = fetch_all(
            cursor,
            """
            SELECT id, nombre, email, rol, activo
            FROM usuarios
            ORDER BY activo DESC, nombre ASC
            """,
        )
    return [
        UserAdmin(
            id=r["id"],
            nombre=r["nombre"],
            email=r["email"],
            rol=r["rol"],
            activo=bool(r["activo"]),
        )
        for r in rows
    ]


@router.get("/users", response_model=list[UserAdmin])
def list_users(_: AdminUser) -> list[UserAdmin]:
    return query_cache(USERS_CACHE_KEY, _list_users_db)


@router.post("/users", response_model=UserAdmin, status_code=status.HTTP_201_CREATED)
def create_user(body: UserCreate, admin: AdminUser) -> UserAdmin:
    with get_db() as (conn, cursor):
        existing = fetch_one(cursor, "SELECT id FROM usuarios WHERE email = %s", (body.email,))
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ese correo ya está registrado")

        cursor.execute(
            """
            INSERT INTO usuarios (nombre, email, password_hash, rol)
            VALUES (%s, %s, %s, %s)
            """,
            (body.nombre.strip(), body.email, hash_password(body.password), body.rol),
        )
        user_id = cursor.lastrowid
        conn.commit()

        row = fetch_one(
            cursor,
            "SELECT id, nombre, email, rol, activo FROM usuarios WHERE id = %s",
            (user_id,),
        )

    if row is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error al crear usuario")

    invalidate_users_cache()
    return UserAdmin(
        id=row["id"],
        nombre=row["nombre"],
        email=row["email"],
        rol=row["rol"],
        activo=bool(row["activo"]),
    )


@router.patch("/users/{user_id}", response_model=UserAdmin)
def update_user(user_id: int, body: UserUpdate, admin: AdminUser) -> UserAdmin:
    if user_id == admin.id and body.activo is False:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No puedes desactivar tu propia cuenta")

    with get_db() as (conn, cursor):
        row = fetch_one(
            cursor,
            "SELECT id, nombre, email, rol, activo FROM usuarios WHERE id = %s",
            (user_id,),
        )
        if row is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

        if body.email and body.email != row["email"]:
            dup = fetch_one(cursor, "SELECT id FROM usuarios WHERE email = %s AND id != %s", (body.email, user_id))
            if dup:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ese correo ya está registrado")

        nombre = body.nombre.strip() if body.nombre else row["nombre"]
        email = body.email if body.email else row["email"]
        rol = body.rol if body.rol else row["rol"]
        activo = body.activo if body.activo is not None else bool(row["activo"])

        if body.password:
            cursor.execute(
                """
                UPDATE usuarios
                SET nombre = %s, email = %s, rol = %s, activo = %s, password_hash = %s
                WHERE id = %s
                """,
                (nombre, email, rol, int(activo), hash_password(body.password), user_id),
            )
        else:
            cursor.execute(
                """
                UPDATE usuarios
                SET nombre = %s, email = %s, rol = %s, activo = %s
                WHERE id = %s
                """,
                (nombre, email, rol, int(activo), user_id),
            )
        conn.commit()

        updated = fetch_one(
            cursor,
            "SELECT id, nombre, email, rol, activo FROM usuarios WHERE id = %s",
            (user_id,),
        )

    invalidate_users_cache(user_id)
    return UserAdmin(
        id=updated["id"],
        nombre=updated["nombre"],
        email=updated["email"],
        rol=updated["rol"],
        activo=bool(updated["activo"]),
    )


# Historial que se perdería (CASCADE / SET NULL) o que bloquea el borrado (FK sin ON DELETE).
_BLOCKING_HISTORY = (
    ("comandas", "mesero_id", "comandas tomadas"),
    ("comandas", "cobrado_por", "comandas cobradas"),
    ("gastos", "creado_por", "gastos registrados"),
    ("caja_cortes", "cerrado_por", "cortes de caja"),
    ("nomina_recibos", "usuario_id", "recibos de nómina"),
    ("nomina_prestamos", "usuario_id", "préstamos de nómina"),
)


def _count_refs(cursor, table: str, column: str, user_id: int) -> int:
    try:
        row = fetch_one(cursor, f"SELECT COUNT(*) AS n FROM {table} WHERE {column} = %s", (user_id,))
    except mysql.connector.Error as exc:
        if getattr(exc, "errno", None) == 1146:  # tabla no existe en esta instalación
            return 0
        raise
    return int(row["n"]) if row else 0


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, admin: AdminUser) -> Response:
    if user_id == admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No puedes eliminar tu propia cuenta")

    with get_db() as (conn, cursor):
        row = fetch_one(cursor, "SELECT id, rol, activo FROM usuarios WHERE id = %s", (user_id,))
        if row is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

        if row["rol"] == Rol.ADMIN.value and row["activo"]:
            admins = fetch_one(
                cursor,
                "SELECT COUNT(*) AS n FROM usuarios WHERE rol = %s AND activo = 1",
                (Rol.ADMIN.value,),
            )
            if admins and int(admins["n"]) <= 1:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No puedes eliminar al único administrador activo",
                )

        found = [label for table, col, label in _BLOCKING_HISTORY if _count_refs(cursor, table, col, user_id)]
        if found:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    f"No se puede eliminar: tiene {', '.join(found)}. "
                    "Desactiva la cuenta para que no pueda entrar sin perder ese historial."
                ),
            )

        try:
            cursor.execute("DELETE FROM usuarios WHERE id = %s", (user_id,))
            conn.commit()
        except mysql.connector.IntegrityError as exc:
            conn.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="No se puede eliminar: el usuario tiene registros asociados. Desactiva la cuenta en su lugar.",
            ) from exc

    invalidate_users_cache(user_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
