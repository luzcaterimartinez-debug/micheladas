from __future__ import annotations

import logging
import threading
import time
from typing import Any, Callable, TypeVar

T = TypeVar("T")

logger = logging.getLogger(__name__)

# value + soft TTL; al expirar se revalida, si MySQL falla se sirve lo viejo.
_store: dict[str, tuple[float, Any]] = {}
_lock = threading.Lock()
# Evita stampede: N requests concurrentes con la misma key → 1 sola carga a MySQL.
_inflight: dict[str, threading.Event] = {}


def cache_get(key: str, ttl_seconds: float, loader: Callable[[], T]) -> T:
    """
    Caché con stale-on-error: si el loader falla (p. ej. Hostinger 1226),
    se devuelve el último valor bueno en vez de romper el POS.
    """
    now = time.monotonic()
    stale: T | None = None

    with _lock:
        hit = _store.get(key)
        if hit is not None:
            expires, value = hit
            if now < expires:
                return value
            stale = value

        waiter = _inflight.get(key)
        if waiter is None:
            event = threading.Event()
            _inflight[key] = event
            leader = True
        else:
            event = waiter
            leader = False

    if not leader:
        event.wait(timeout=25)
        with _lock:
            hit2 = _store.get(key)
            if hit2 is not None:
                # Aunque esté "vencido", preferir lo que dejó el líder (incluyendo stale).
                return hit2[1]
        if stale is not None:
            return stale
        return loader()

    try:
        value = loader()
        with _lock:
            _store[key] = (time.monotonic() + max(0.1, ttl_seconds), value)
        return value
    except Exception as exc:
        if stale is not None:
            # Reintentar MySQL más tarde sin spamear; seguir sirviendo datos viejos.
            soft_ttl = min(max(ttl_seconds, 30.0), 120.0)
            with _lock:
                _store[key] = (time.monotonic() + soft_ttl, stale)
            logger.warning(
                "Caché stale para %s (loader falló: %s) — sirviendo último valor",
                key,
                type(exc).__name__,
            )
            return stale
        raise
    finally:
        with _lock:
            _inflight.pop(key, None)
        event.set()


def query_cache(key: str, loader: Callable[[], T], *, ttl_seconds: float | None = None) -> T:
    """Caché en memoria para consultas de lectura. TTL por defecto desde settings."""
    if ttl_seconds is None:
        from app.config import get_settings

        ttl_seconds = float(get_settings().query_cache_ttl_seconds)
    return cache_get(key, ttl_seconds, loader)


def cache_put(key: str, value: Any, *, ttl_seconds: float | None = None) -> None:
    """Escribe un valor en caché (p. ej. sembrar auth tras login)."""
    if ttl_seconds is None:
        from app.config import get_settings

        ttl_seconds = float(get_settings().query_cache_ttl_seconds)
    with _lock:
        _store[key] = (time.monotonic() + max(0.1, ttl_seconds), value)


def cache_invalidate(prefix: str) -> None:
    """
    Marca entradas como vencidas pero conserva el valor (stale).
    Así un write + MySQL caído no borra lo último bueno del POS.
    """
    with _lock:
        for key in list(_store):
            if key.startswith(prefix):
                _expires, value = _store[key]
                _store[key] = (0.0, value)


def cache_clear() -> None:
    with _lock:
        _store.clear()


def cache_stats() -> dict[str, int]:
    with _lock:
        return {"entries": len(_store), "inflight": len(_inflight)}
