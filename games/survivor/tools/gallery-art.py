"""原創 16×16 霜火雙子與古神像素原稿；沿用守門人的標準庫 PNG 格式。"""
from pathlib import Path
import struct
import zlib
from importlib.util import spec_from_file_location, module_from_spec

spec = spec_from_file_location('gatekeeper_art', Path(__file__).with_name('gatekeeper-art.py'))
base = module_from_spec(spec)
spec.loader.exec_module(base)


def main():
    wing = ['................', '......oooo......', '.....ohhhho.....',
            'oo...oheeh o...oo'.replace(' ', ''), 'oh o..ohhho..o ho'.replace(' ', ''),
            'ohho..ohho..ohho', '.ohhoohhhhoohho.', '..ohhhhhhhhhho..',
            '...ooohhhhooo...', '.....obbbbo.....', '....ohbbbbho....',
            '....ohhhhhho....', '.....ohhhho.....', '.....oo..oo.....',
            '....ooo..ooo....', '................']
    for name, color, rows in [('frost-twin', (95, 201, 238, 255), base.ROWS),
                              ('fire-twin', (244, 133, 75, 255), base.ROWS),
                              ('winged', (189, 167, 228, 255), wing)]:
        # Wing rows are padded to the same fixed frame size.
        palette = {**base.PALETTE, 's': color, 'h': color}
        raw = b''.join(b'\x00'+b''.join(bytes(palette[c]) for c in row.ljust(16, '.')[:16]) for row in rows)
        png = (b'\x89PNG\r\n\x1a\n'+base.chunk(b'IHDR', struct.pack('!2I5B', 16, 16, 8, 6, 0, 0, 0))
               +base.chunk(b'IDAT', zlib.compress(raw))+base.chunk(b'IEND', b''))
        (Path(__file__).resolve().parents[1]/f'art/characters/{name}.png').write_bytes(png)


if __name__ == '__main__':
    main()
