"""原創 16×16 守門人像素原稿；只使用 Python 標準庫，可重新產生 PNG。"""
from pathlib import Path
import struct
import zlib

PALETTE = {'.': (0, 0, 0, 0), 'o': (48, 48, 65, 255),
           's': (163, 178, 190, 255), 'h': (221, 221, 204, 255),
           'b': (100, 81, 108, 255), 'r': (206, 112, 75, 255),
           'e': (255, 221, 128, 255)}
ROWS = ['................', '.....oooooo.....', '....ossshsso....',
        '....osssseso....', '....ooeeeeeoo...', '.....obbbbo.....',
        '...oosshsssoo...', '..oshsshsshso...', '.oshosshsshoso..',
        '.oshoobbbbohso..', '..ooobbbbrboo...', '....obbbbrbo....',
        '....ossossso....', '....oss.osso....', '...oooo.oooo....',
        '................']


def chunk(kind, data):
    return (struct.pack('!I', len(data)) + kind + data
            + struct.pack('!I', zlib.crc32(kind + data) & 0xffffffff))


def main():
    raw = b''.join(b'\x00' + b''.join(bytes(PALETTE[c]) for c in row) for row in ROWS)
    png = (b'\x89PNG\r\n\x1a\n'
           + chunk(b'IHDR', struct.pack('!2I5B', 16, 16, 8, 6, 0, 0, 0))
           + chunk(b'IDAT', zlib.compress(raw)) + chunk(b'IEND', b''))
    (Path(__file__).resolve().parents[1] / 'art/characters/gatekeeper.png').write_bytes(png)


if __name__ == '__main__':
    main()
