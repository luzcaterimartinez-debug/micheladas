from __future__ import annotations

import time
from typing import Any, Callable, TypeVar

T = TypeVar("T")

_store: dict[str, tuple[float, Any]] = {}


def cache_get(key: str, ttl_seconds: float, loader: Callable[[], T]) -> T:
    now = time.monotonic()
    hit = _store.get(key)
    if hit is not None:
        expires, value = hit
        if now < expires:
            return value
    value = loader()
    _store[key] = (now + ttl_seconds, value)
    return value


def query_cache(key: str, loader: Callable[[], T], *, ttl_seconds: float | None = None) -> T:
    """Caché en memoria para consultas de lectura. TTL por defecto desde settings."""
    if ttl_seconds is None:
        from app.config import get_settings

        ttl_seconds = float(get_settings().query_cache_ttl_seconds)
    return cache_get(key, ttl_seconds, loader)


def cache_invalidate(prefix: str) -> None:
    for key in list(_store):
        if key.startswith(prefix):
            del _store[key]


def cache_clear() -> None:
    _store.clear()
