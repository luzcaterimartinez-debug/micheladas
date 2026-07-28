"""Zona horaria del negocio: Colombia (America/Bogota, UTC-5, sin DST)."""

from __future__ import annotations

import os
from datetime import date, datetime, timedelta, timezone
from zoneinfo import ZoneInfo

# Offset fijo: Hostinger/MySQL a menudo no tiene tablas de zoneinfo nombradas.
MYSQL_TIME_ZONE = "-05:00"
APP_TZ_NAME = "America/Bogota"
APP_TZ = ZoneInfo(APP_TZ_NAME)


def ensure_process_timezone() -> None:
    """Fija TZ del proceso para date.today()/logs cuando el host lo respete."""
    os.environ.setdefault("TZ", APP_TZ_NAME)
    # En Linux, time.tzset() aplica TZ; en Windows ZoneInfo basta para helpers.
    try:
        import time

        if hasattr(time, "tzset"):
            time.tzset()
    except Exception:
        pass


def now_co() -> datetime:
    return datetime.now(APP_TZ)


def today_co() -> date:
    return now_co().date()


def day_bounds(fecha: date) -> tuple[datetime, datetime]:
    """Inicio/fin del día en hora Colombia (naive, para comparar con TIMESTAMP de sesión -05:00)."""
    start = datetime.combine(fecha, datetime.min.time())
    return start, start + timedelta(days=1)


def as_app_tz(dt: datetime) -> datetime:
    """Interpreta naive como hora Colombia; aware se convierte a Colombia."""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=APP_TZ)
    return dt.astimezone(APP_TZ)


def to_ms(dt: datetime | None) -> int:
    """Epoch ms. Naive = Colombia (sesión MySQL -05:00)."""
    if dt is None:
        return int(now_co().timestamp() * 1000)
    return int(as_app_tz(dt).timestamp() * 1000)


def to_ms_optional(dt: datetime | None) -> int | None:
    if dt is None:
        return None
    return to_ms(dt)


# UTC solo para JWT u otros tokens estándar.
UTC = timezone.utc
