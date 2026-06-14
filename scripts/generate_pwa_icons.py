"""
Genera iconos PWA Michelandia en public/ a partir de un PNG base (512×512).

Uso (desde la raíz del proyecto):
  pip install pillow
  python scripts/generate_pwa_icons.py
  python scripts/generate_pwa_icons.py --source public/icon-512x512.png
"""
from __future__ import annotations

import argparse
import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
DEFAULT_SOURCE = PUBLIC / "icon-512x512.png"

BG = (77, 184, 235)  # #4db8eb
ACCENT = (245, 197, 24)  # #f5c518


def _write_png(path: Path, width: int, height: int, rgb_rows: list[list[tuple[int, int, int]]]) -> None:
    def chunk(tag: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    raw = b"".join(
        b"\x00" + bytes(channel for px in row for channel in px)
        for row in rgb_rows
    )
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")
    path.write_bytes(png)


def _fallback_icon(size: int) -> list[list[tuple[int, int, int]]]:
    """Icono plano con M amarilla (sin dependencias)."""
    rows: list[list[tuple[int, int, int]]] = []
    cx = size // 2
    bar_w = max(2, size // 8)
    m_top = size // 4
    m_bottom = size * 3 // 4
    m_mid_y = size // 2
    for y in range(size):
        row: list[tuple[int, int, int]] = []
        for x in range(size):
            color = BG
            if m_top <= y <= m_bottom:
                left = cx - size // 3
                right = cx + size // 3
                if left <= x < left + bar_w or right - bar_w < x <= right:
                    color = ACCENT
                elif y <= m_mid_y and left + bar_w <= x <= right - bar_w:
                    diag = abs((x - cx) * (m_mid_y - m_top) - (y - m_top) * (size // 6))
                    if diag < bar_w * 2:
                        color = ACCENT
                elif y > m_mid_y and left + bar_w <= x <= right - bar_w:
                    color = ACCENT
            row.append(color)
        rows.append(row)
    return rows


def _resize_pillow(source: Path, size: int):
    from PIL import Image

    img = Image.open(source).convert("RGB")
    return img.resize((size, size), Image.Resampling.LANCZOS)


def write_icon(path: Path, size: int, source: Path | None) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    try:
        from PIL import Image

        if source and source.is_file():
            img = _resize_pillow(source, size)
            img.save(path, format="PNG", optimize=True)
            return
    except ImportError:
        pass

    _write_png(path, size, size, _fallback_icon(size))


def write_favicon(path: Path, source: Path | None) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    try:
        from PIL import Image

        if source and source.is_file():
            img = _resize_pillow(source, 32)
            img.save(path, format="ICO", sizes=[(32, 32)])
            return
    except ImportError:
        pass

    # ICO mínimo 16×16 desde PNG fallback
    tmp = path.with_suffix(".tmp.png")
    _write_png(tmp, 16, 16, _fallback_icon(16))
    try:
        from PIL import Image

        Image.open(tmp).save(path, format="ICO")
    except ImportError:
        tmp.replace(path.with_suffix(".png"))
        print("  (favicon.ico requiere Pillow; usa apple-touch-icon.png)")
    finally:
        if tmp.exists():
            tmp.unlink()


def main() -> None:
    parser = argparse.ArgumentParser(description="Genera iconos PWA en public/")
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
    args = parser.parse_args()
    source = args.source if args.source.is_file() else None

    targets = [
        (PUBLIC / "icon-512x512.png", 512),
        (PUBLIC / "icon-192x192.png", 192),
        (PUBLIC / "apple-touch-icon.png", 180),
    ]
    for path, size in targets:
        write_icon(path, size, source)
        print(f"  {path.name} ({size}px)")
    write_favicon(PUBLIC / "favicon.ico", source or PUBLIC / "icon-512x512.png")
    if (PUBLIC / "favicon.ico").exists():
        print("  favicon.ico")


if __name__ == "__main__":
    print(f"Iconos PWA -> {PUBLIC}")
    main()
