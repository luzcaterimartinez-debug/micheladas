"""
Respaldo de la base MySQL Michelandia.

Uso (desde backend/):
  python -m scripts.backup_db
  python -m scripts.backup_db --output ../backups
  python -m scripts.backup_db --keep 14

Requiere `mysqldump` en PATH (cliente MySQL instalado).
Programar en Windows (PowerShell como admin):
  schtasks /Create /TN "MichelandiaBackup" /TR "python -m scripts.backup_db" /SC DAILY /ST 03:00 /SD 01/01/2026 /F /RU SYSTEM

Linux (cron, diario 3:00):
  0 3 * * * cd /ruta/backend && .venv/bin/python -m scripts.backup_db --output /var/backups/michelandia
"""
from __future__ import annotations

import argparse
import gzip
import os
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config import get_settings


def _find_mysqldump() -> str:
    found = shutil.which("mysqldump")
    if found:
        return found
    for candidate in (
        r"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe",
        r"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqldump.exe",
        r"C:\xampp\mysql\bin\mysqldump.exe",
    ):
        if Path(candidate).is_file():
            return candidate
    raise FileNotFoundError(
        "mysqldump no encontrado. Instala el cliente MySQL o agrégalo al PATH."
    )


def run_backup(output_dir: Path, keep: int, compress: bool) -> Path:
    settings = get_settings()
    output_dir.mkdir(parents=True, exist_ok=True)

    stamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    base_name = f"{settings.mysql_database}_{stamp}.sql"
    sql_path = output_dir / base_name

    mysqldump = _find_mysqldump()
    base_cmd = [
        mysqldump,
        f"--host={settings.mysql_host}",
        f"--port={settings.mysql_port}",
        f"--user={settings.mysql_user}",
        "--single-transaction",
        "--routines",
        "--triggers",
        settings.mysql_database,
    ]
    env = os.environ.copy()
    if settings.mysql_password:
        env["MYSQL_PWD"] = settings.mysql_password

    print(f"Respaldando {settings.mysql_database} -> {sql_path}")
    with sql_path.open("wb") as fh:
        for cmd in (base_cmd + ["--set-gtid-purged=OFF"], base_cmd):
            try:
                subprocess.run(cmd, check=True, stdout=fh, env=env)
                break
            except subprocess.CalledProcessError:
                fh.seek(0)
                fh.truncate()
                if cmd is base_cmd:
                    raise

    final_path = sql_path
    if compress:
        gz_path = sql_path.with_suffix(sql_path.suffix + ".gz")
        with sql_path.open("rb") as src, gzip.open(gz_path, "wb") as dst:
            shutil.copyfileobj(src, dst)
        sql_path.unlink()
        final_path = gz_path

    _prune_old(output_dir, keep, compress)
    print(f"Backup listo: {final_path} ({final_path.stat().st_size // 1024} KB)")
    return final_path


def _prune_old(output_dir: Path, keep: int, compress: bool) -> None:
    if keep <= 0:
        return
    suffix = ".sql.gz" if compress else ".sql"
    files = sorted(
        (p for p in output_dir.iterdir() if p.is_file() and p.name.endswith(suffix)),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )
    for old in files[keep:]:
        old.unlink()
        print(f"  Eliminado backup antiguo: {old.name}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Respaldo MySQL Michelandia")
    parser.add_argument(
        "--output",
        type=Path,
        default=Path(__file__).resolve().parent.parent / "backups",
        help="Directorio de salida (default: backend/backups)",
    )
    parser.add_argument(
        "--keep",
        type=int,
        default=7,
        help="Copias a conservar (0 = sin límite)",
    )
    parser.add_argument(
        "--no-compress",
        action="store_true",
        help="Guardar .sql sin comprimir",
    )
    args = parser.parse_args()
    run_backup(args.output, args.keep, compress=not args.no_compress)


if __name__ == "__main__":
    main()
