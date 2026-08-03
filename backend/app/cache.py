from __future__ import annotations

import threading
import time
from typing import Any, Callable, TypeVar

T = TypeVar("T")

_store: dict[str, tuple[float, Any]] = {}
_lock = threading.Lock()
# Evita stampede: N requests concurrentes con la misma key → 1 sola carga a MySQL.
_inflight: dict[str, threading.Event] = {}


def cache_get(key: str, ttl_seconds: float, loader: Callable[[], T]) -> T:
    now = time.monotonic()
    with _lock:
        hit = _store.get(key)
        if hit is not None:
            expires, value = hit
            if now < expires:
                return value

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
            if hit2 is not None and time.monotonic() < hit2[0]:
                return hit2[1]
        # Líder falló o timeout: cargar por cuenta propia (mejor que romper).
        return loader()

    try:
        value = loader()
        with _lock:
            _store[key] = (time.monotonic() + max(0.1, ttl_seconds), value)
        return value
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


def cache_invalidate(prefix: str) -> None:
    with _lock:
        for key in list(_store):
            if key.startswith(prefix):
                del _store[key]


def cache_clear() -> None:
    with _lock:
        _store.clear()


def cache_stats() -> dict[str, int]:
    with _lock:
        return {"entries": len(_store), "inflight": len(_inflight)}
