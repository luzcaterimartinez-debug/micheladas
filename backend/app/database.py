from contextlib import contextmanager
import logging
import os
import threading
import time
from typing import Any, Generator

import mysql.connector
from mysql.connector import pooling
from mysql.connector.cursor import MySQLCursorDict

from app.config import get_settings
from app.tz import MYSQL_TIME_ZONE

logger = logging.getLogger(__name__)

_pool: pooling.MySQLConnectionPool | None = None
_pool_lock = threading.Lock()

# Cache del último ping: evita que health/status/polls martillen Hostinger
# (límite típico: max_connections_per_hour).
_check_cache: tuple[float, bool, str | None] | None = None
_CHECK_OK_TTL_S = 45.0
_CHECK_FAIL_TTL_S = 90.0
_CHECK_QUOTA_TTL_S = 55 * 60.0  # ~55 min: Hostinger resetea max_connections_per_hour cada hora
_CHECK_POOL_TTL_S = 30.0


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


def _connect_direct() -> Any:
    """Una conexión nueva (sin pool). Preferido en Vercel."""
    # No usar assert isinstance: en Vercel a menudo es CMySQLConnection
    # (no siempre subclase de MySQLConnection) y el assert vacío rompía health/login.
    return mysql.connector.connect(**_connect_kwargs())


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


def _apply_session_timezone(conn: Any) -> None:
    """Fuerza hora Colombia en CURRENT_TIMESTAMP / CURDATE / comparaciones."""
    cursor = conn.cursor()
    try:
        cursor.execute("SET time_zone = %s", (MYSQL_TIME_ZONE,))
    finally:
        cursor.close()


def _is_pool_exhausted(exc: BaseException) -> bool:
    msg = str(exc).lower()
    return "pool exhausted" in msg or "failed getting connection" in msg


def _safe_close(conn: Any) -> None:
    if conn is None:
        return
    try:
        conn.close()
    except Exception as exc:
        logger.debug("Error cerrando conexión MySQL: %s", exc)


def _is_hourly_quota_error(message: str) -> bool:
    lower = message.lower()
    return "max_connections_per_hour" in lower or "1226" in lower


def _cache_ttl(ok: bool, err: str | None) -> float:
    if ok:
        return _CHECK_OK_TTL_S
    if err and _is_hourly_quota_error(err):
        return _CHECK_QUOTA_TTL_S
    if err and _is_pool_exhausted(Exception(err)):
        return _CHECK_POOL_TTL_S
    return _CHECK_FAIL_TTL_S


def peek_database_status() -> tuple[bool, str | None] | None:
    """Devuelve el último check cacheado si aún es válido. No abre MySQL."""
    if _check_cache is None:
        return None
    cached_at, ok, err = _check_cache
    if time.monotonic() - cached_at < _cache_ttl(ok, err):
        return ok, err
    return None


def _raise_circuit_open(err: str) -> None:
    """Sin abrir socket: repropaga el error de cuota cacheado."""
    raise mysql.connector.errors.ProgrammingError(msg=err, errno=1226)


def get_connection(*, bypass_circuit: bool = False) -> Any:
    """
    Obtiene una conexión lista para usar.
    En Vercel: conexión directa (evita 'pool exhausted').
    En local/VPS: pool con reset+reintento si se agota.

    Si Hostinger ya respondió 1226, no se abre otra conexión durante el TTL
    (evita quemar la cuota restante y permite servir datos desde caché).
    """
    global _check_cache
    if not bypass_circuit:
        cached = peek_database_status()
        if cached is not None:
            ok, err = cached
            if not ok and err and _is_hourly_quota_error(err):
                _raise_circuit_open(err)

    try:
        if _is_serverless():
            conn = _connect_direct()
            try:
                _apply_session_timezone(conn)
            except Exception as exc:
                logger.warning("No se pudo fijar time_zone MySQL a %s: %s", MYSQL_TIME_ZONE, exc)
                _safe_close(conn)
                raise
        else:
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
                _safe_close(conn)
                raise
        _check_cache = (time.monotonic(), True, None)
        return conn
    except Exception as exc:
        msg = f"{type(exc).__name__}: {exc}".strip()
        if msg.endswith(":"):
            msg = type(exc).__name__
        if _is_hourly_quota_error(msg):
            _check_cache = (time.monotonic(), False, msg)
            logger.error("MySQL cuota por hora agotada — circuit open ~55 min")
        elif _is_pool_exhausted(exc):
            reset_pool()
            _check_cache = (time.monotonic(), False, msg)
        raise


def check_database(*, force: bool = False) -> tuple[bool, str | None]:
    """Ping MySQL; returns (ok, error_message). Resultado cacheado para no agotar cuota Hostinger."""
    global _check_cache
    now = time.monotonic()
    if not force:
        cached = peek_database_status()
        if cached is not None:
            return cached

    target = _connection_target()
    conn: Any = None
    try:
        conn = get_connection(bypass_circuit=force)
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
        msg = f"{type(exc).__name__}: {exc}".strip()
        if msg.endswith(":"):
            msg = type(exc).__name__
        logger.error("Conexión MySQL falló → %s — %s", target, msg)
        if _is_pool_exhausted(exc):
            reset_pool()
        _check_cache = (now, False, msg)
        return False, msg
    finally:
        _safe_close(conn)


@contextmanager
def get_db() -> Generator[tuple[Any, MySQLCursorDict], None, None]:
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
