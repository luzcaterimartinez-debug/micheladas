from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.dependencies import require_roles
from app.auth.password import hash_password
from app.database import fetch_all, fetch_one, get_db
from app.models.admin import UserAdmin, UserCreate, UserUpdate
from app.models.user import Rol, UserPublic

router = APIRouter(prefix="/api/admin", tags=["admin"])

AdminUser = Annotated[UserPublic, Depends(require_roles(Rol.ADMIN))]


@router.get("/users", response_model=list[UserAdmin])
def list_users(_: AdminUser) -> list[UserAdmin]:
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

    return UserAdmin(
        id=updated["id"],
        nombre=updated["nombre"],
        email=updated["email"],
        rol=updated["rol"],
        activo=bool(updated["activo"]),
    )
