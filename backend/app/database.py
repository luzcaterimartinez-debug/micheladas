from contextlib import contextmanager
import logging
import os
import threading
import time
from typing import Any, Generator

import mysql.connector
from mysql.connector import MySQLConnection, pooling
from mysql.connector.cursor import MySQLCursorDict

from app.config import get_settings
from app.tz import MYSQL_TIME_ZONE

logger = logging.getLogger(__name__)

_pool: pooling.MySQLConnectionPool | None = None
_pool_lock = threading.Lock()

# Cache del último ping: evita que health/status/polls martillen Hostinger
# (límite típico: max_connections_per_hour).
_check_cache: tuple[float, bool, str | None] | None = None
_CHECK_OK_TTL_S = 30.0
_CHECK_FAIL_TTL_S = 60.0
_CHECK_QUOTA_TTL_S = 300.0  # 5 min si Hostinger cortó por cuota horaria
_CHECK_POOL_TTL_S = 15.0  # pool exhausted: reintentar pronto tras reset


def _is_serverless() -> bool:
    """Vercel (y similares): el pool global se agota fácil entre requests concurrentes."""
    return bool(os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"))


def _connection_target() -> str:
    settings = get_settings()
    return f"{settings.mysql_host}:{settings.mysql_port}/{settings.mysql_database}"


def _connect_kwargs() -> dict[str, Any]:
    settings = get_settings()
    return {
        "host": settings.mysql_host,
        "port": settings.mysql_port,
        "user": settings.mysql_user,
        "password": settings.mysql_password,
        "database": settings.mysql_database,
        "autocommit": False,
        "connection_timeout": settings.mysql_connection_timeout,
    }


def _connect_direct() -> MySQLConnection:
    """Una conexión nueva (sin pool). Preferido en Vercel."""
    conn = mysql.connector.connect(**_connect_kwargs())
    assert isinstance(conn, MySQLConnection)
    return conn


def _build_pool() -> pooling.MySQLConnectionPool:
    settings = get_settings()
    target = _connection_target()
    pool_size = max(1, min(settings.mysql_pool_size, 5))
    logger.info(
        "Inicializando pool MySQL → %s (usuario=%s, pool=%s)",
        target,
        settings.mysql_user,
        pool_size,
    )
    return pooling.MySQLConnectionPool(
        pool_name=f"micheladas_{os.getpid()}",
        pool_size=pool_size,
        pool_reset_session=True,
        **_connect_kwargs(),
    )


def reset_pool() -> None:
    """Descarta el pool (p. ej. tras 'pool exhausted') para recrearlo limpio."""
    global _pool
    with _pool_lock:
        if _pool is not None:
            logger.warning("Reseteando pool MySQL tras error / agotamiento")
        _pool = None


def get_pool() -> pooling.MySQLConnectionPool:
    global _pool
    with _pool_lock:
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


def _is_pool_exhausted(exc: BaseException) -> bool:
    msg = str(exc).lower()
    return "pool exhausted" in msg or "failed getting connection" in msg


def get_connection() -> MySQLConnection:
    """
    Obtiene una conexión lista para usar.
    En Vercel: conexión directa (evita 'pool exhausted').
    En local/VPS: pool con reset+reintento si se agota.
    """
    if _is_serverless():
        conn = _connect_direct()
        try:
            _apply_session_timezone(conn)
        except Exception as exc:
            logger.warning("No se pudo fijar time_zone MySQL a %s: %s", MYSQL_TIME_ZONE, exc)
        return conn

    try:
        conn = get_pool().get_connection()
    except Exception as exc:
        if _is_pool_exhausted(exc):
            reset_pool()
            conn = get_pool().get_connection()
        else:
            raise

    try:
        _apply_session_timezone(conn)
    except Exception as exc:
        logger.warning("No se pudo fijar time_zone MySQL a %s: %s", MYSQL_TIME_ZONE, exc)
        try:
            conn.close()
        except Exception:
            pass
        raise
    return conn


def _safe_close(conn: MySQLConnection | None) -> None:
    if conn is None:
        return
    try:
        conn.close()
    except Exception as exc:
        logger.debug("Error cerrando conexión MySQL: %s", exc)


def _is_hourly_quota_error(message: str) -> bool:
    lower = message.lower()
    return "max_connections_per_hour" in lower or "1226" in lower


def check_database(*, force: bool = False) -> tuple[bool, str | None]:
    """Ping MySQL; returns (ok, error_message). Resultado cacheado para no agotar cuota Hostinger."""
    global _check_cache
    now = time.monotonic()
    if not force and _check_cache is not None:
        cached_at, ok, err = _check_cache
        if ok:
            ttl = _CHECK_OK_TTL_S
        elif err and _is_hourly_quota_error(err):
            ttl = _CHECK_QUOTA_TTL_S
        elif err and _is_pool_exhausted(Exception(err)):
            ttl = _CHECK_POOL_TTL_S
        else:
            ttl = _CHECK_FAIL_TTL_S
        if now - cached_at < ttl:
            return ok, err

    target = _connection_target()
    conn: MySQLConnection | None = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        finally:
            cursor.close()
        logger.info("Conexión MySQL OK → %s", target)
        _check_cache = (now, True, None)
        return True, None
    except Exception as exc:
        msg = str(exc)
        logger.error("Conexión MySQL falló → %s — %s", target, msg)
        if _is_pool_exhausted(exc):
            reset_pool()
        _check_cache = (now, False, msg)
        return False, msg
    finally:
        _safe_close(conn)


@contextmanager
def get_db() -> Generator[tuple[MySQLConnection, MySQLCursorDict], None, None]:
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        yield conn, cursor
    except Exception:
        try:
            conn.rollback()
        except Exception:
            pass
        raise
    else:
        try:
            conn.commit()
        except Exception:
            try:
                conn.rollback()
            except Exception:
                pass
            raise
    finally:
        try:
            cursor.close()
        except Exception:
            pass
        _safe_close(conn)


def fetch_one(cursor: MySQLCursorDict, query: str, params: tuple[Any, ...] = ()) -> dict[str, Any] | None:
    cursor.execute(query, params)
    row = cursor.fetchone()
    return row if row else None


def fetch_all(cursor: MySQLCursorDict, query: str, params: tuple[Any, ...] = ()) -> list[dict[str, Any]]:
    cursor.execute(query, params)
    return list(cursor.fetchall())
