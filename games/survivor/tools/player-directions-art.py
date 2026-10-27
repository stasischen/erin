# -*- coding: utf-8 -*-
"""Deterministic original art fixture: 64px cells, S/E/N rows, W mirrors E.
Columns are idle/run/hurt. One-pixel margin and two-pixel gutters test atlas crops.
Run from anywhere; uses only Python's standard library. Not a game screenshot.
"""
from pathlib import Path
import struct
import sys
import zlib

CELL, MARGIN, GAP = 64, 1, 2
SIDE = MARGIN * 2 + CELL * 3 + GAP * 2
pixels = bytearray(SIDE * SIDE * 4)

def rect(x, y, w, h, color):
    rgba = bytes.fromhex(color) + b'\xff'
    for row in range(y, y + h):
        for col in range(x, x + w):
            pos = (row * SIDE + col) * 4
            pixels[pos:pos + 4] = rgba

for row, direction in enumerate(['S', 'E', 'N']):
    for col in range(3):
        ox, oy = MARGIN + col * (CELL + GAP), MARGIN + row * (CELL + GAP)
        def box(x, y, w, h, color):
            rect(ox + x, oy + y, w, h, color)
        box(12, 7, 40, 37, '26313c')
        box(15, 10, 34, 30, 'ffffff' if col == 2 else '83d9ed')
        box(20, 44, 24, 11, '4069a7')
        box(18, 55, 10, 6 if col != 1 else 3, '26313c')
        box(36, 55, 10, 3 if col == 1 else 6, '26313c')
        box(24, 3, 10, 6, '9bd57b')
        if direction == 'S':
            box(22, 23, 5, 7, '26313c'); box(38, 23, 5, 7, '26313c')
            box(29, 34, 7, 2, 'ed7d9e')
        elif direction == 'E':
            box(42, 23, 5, 7, '26313c'); box(49, 29, 7, 5, 'ed7d9e')
            box(18, 14, 4, 23, '64b7d2')
        else:
            box(18, 13, 28, 4, '64b7d2'); box(28, 18, 7, 14, '64b7d2')

def chunk(tag, data):
    return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)

scan = b''.join(b'\x00' + pixels[y * SIDE * 4:(y + 1) * SIDE * 4] for y in range(SIDE))
png = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', SIDE, SIDE, 8, 6, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(scan, 9)) + chunk(b'IEND', b'')
target = Path(__file__).resolve().parents[1] / 'art/samples/player-directions.png'
if '--check' in sys.argv:
    if not target.exists() or target.read_bytes() != png:
        raise SystemExit('Fixture differs from generator; regenerate player-directions.png')
else:
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(png)
print(f'Generated {target.name}: {SIDE}x{SIDE}, 64x64 cells, S/E/N; W mirrors E')
