from contextlib import contextmanager
import logging
import time
from typing import Any, Generator

import mysql.connector
from mysql.connector import MySQLConnection, pooling
from mysql.connector.cursor import MySQLCursorDict

from app.config import get_settings
from app.tz import MYSQL_TIME_ZONE

logger = logging.getLogger(__name__)

_pool: pooling.MySQLConnectionPool | None = None

# Cache del último ping: evita que health/status/polls martillen Hostinger
# (límite típico: max_connections_per_hour).
_check_cache: tuple[float, bool, str | None] | None = None
_CHECK_OK_TTL_S = 30.0
_CHECK_FAIL_TTL_S = 60.0
_CHECK_QUOTA_TTL_S = 300.0  # 5 min si Hostinger cortó por cuota horaria


def _connection_target() -> str:
    settings = get_settings()
    return f"{settings.mysql_host}:{settings.mysql_port}/{settings.mysql_database}"


def _build_pool() -> pooling.MySQLConnectionPool:
    settings = get_settings()
    target = _connection_target()
    # En serverless (Vercel) cada instancia tiene su pool: tamaño bajo reduce
    # el consumo de max_connections_per_hour en Hostinger.
    pool_size = settings.mysql_pool_size
    if settings.is_production and pool_size > 2:
        pool_size = 2
    logger.info(
        "Inicializando pool MySQL → %s (usuario=%s, pool=%s)",
        target,
        settings.mysql_user,
        pool_size,
    )
    return pooling.MySQLConnectionPool(
        pool_name="micheladas_pool",
        pool_size=pool_size,
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


def _is_hourly_quota_error(message: str) -> bool:
    lower = message.lower()
    return "max_connections_per_hour" in lower or "1226" in lower


def check_database(*, force: bool = False) -> tuple[bool, str | None]:
    """Ping MySQL; returns (ok, error_message). Resultado cacheado para no agotar cuota Hostinger."""
    global _check_cache
    now = time.monotonic()
    if not force and _check_cache is not None:
        cached_at, ok, err = _check_cache
        ttl = _CHECK_OK_TTL_S if ok else (
            _CHECK_QUOTA_TTL_S if err and _is_hourly_quota_error(err) else _CHECK_FAIL_TTL_S
        )
        if now - cached_at < ttl:
            return ok, err

    target = _connection_target()
    try:
        conn = get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            cursor.fetchone()
            cursor.close()
            logger.info("Conexión MySQL OK → %s", target)
            _check_cache = (now, True, None)
            return True, None
        finally:
            conn.close()
    except Exception as exc:
        msg = str(exc)
        logger.error("Conexión MySQL falló → %s — %s", target, msg)
        _check_cache = (now, False, msg)
        return False, msg


@contextmanager
def get_db() -> Generator[tuple[MySQLConnection, MySQLCursorDict], None, None]:
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        yield conn, cursor
    except Exception:
        conn.rollback()
        raise
    else:
        conn.commit()
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
