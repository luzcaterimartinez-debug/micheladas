from contextlib import contextmanager
from typing import Any, Generator

import mysql.connector
from mysql.connector import MySQLConnection
from mysql.connector.cursor import MySQLCursorDict

from app.config import get_settings


def get_connection() -> MySQLConnection:
    settings = get_settings()
    return mysql.connector.connect(
        host=settings.mysql_host,
        port=settings.mysql_port,
        user=settings.mysql_user,
        password=settings.mysql_password,
        database=settings.mysql_database,
        autocommit=False,
    )


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
