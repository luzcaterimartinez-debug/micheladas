from contextlib import contextmanager
import logging
from typing import Any, Generator

import mysql.connector
from mysql.connector import MySQLConnection, pooling
from mysql.connector.cursor import MySQLCursorDict

from app.config import get_settings
from app.tz import MYSQL_TIME_ZONE

logger = logging.getLogger(__name__)

_pool: pooling.MySQLConnectionPool | None = None


def _connection_target() -> str:
    settings = get_settings()
    return f"{settings.mysql_host}:{settings.mysql_port}/{settings.mysql_database}"


def _build_pool() -> pooling.MySQLConnectionPool:
    settings = get_settings()
    target = _connection_target()
    logger.info("Inicializando pool MySQL → %s (usuario=%s)", target, settings.mysql_user)
    return pooling.MySQLConnectionPool(
        pool_name="micheladas_pool",
        pool_size=settings.mysql_pool_size,
        pool_reset_session=True,
        host=settings.mysql_host,
        port=settings.mysql_port,
        user=settings.mysql_user,
        password=settings.mysql_password,
        database=settings.mysql_database,
        autocommit=False,
        connection_timeout=settings.mysql_connection_timeout,
    )


def get_pool() -> pooling.MySQLConnectionPool:
    global _pool
    if _pool is None:
        _pool = _build_pool()
    return _pool


def _apply_session_timezone(conn: MySQLConnection) -> None:
    """Fuerza hora Colombia en CURRENT_TIMESTAMP / CURDATE / comparaciones."""
    cursor = conn.cursor()
    try:
        cursor.execute("SET time_zone = %s", (MYSQL_TIME_ZONE,))
    finally:
        cursor.close()


def get_connection() -> MySQLConnection:
    conn = get_pool().get_connection()
    try:
        _apply_session_timezone(conn)
    except Exception as exc:
        logger.warning("No se pudo fijar time_zone MySQL a %s: %s", MYSQL_TIME_ZONE, exc)
    return conn


def check_database() -> tuple[bool, str | None]:
    """Ping MySQL; returns (ok, error_message)."""
    target = _connection_target()
    try:
        conn = get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            cursor.fetchone()
            cursor.close()
            logger.info("Conexión MySQL OK → %s", target)
            return True, None
        finally:
            conn.close()
    except Exception as exc:
        logger.error("Conexión MySQL falló → %s — %s", target, exc)
        return False, str(exc)


@contextmanager
def get_db() -> Generator[tuple[MySQLConnection, MySQLCursorDict], None, None]:
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        yield conn, cursor
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()


def fetch_one(cursor: MySQLCursorDict, query: str, params: tuple[Any, ...] = ()) -> dict[str, Any] | None:
    cursor.execute(query, params)
    row = cursor.fetchone()
    return row if row else None


def fetch_all(cursor: MySQLCursorDict, query: str, params: tuple[Any, ...] = ()) -> list[dict[str, Any]]:
    cursor.execute(query, params)
    return list(cursor.fetchall())
