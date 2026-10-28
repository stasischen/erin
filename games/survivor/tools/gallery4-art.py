"""Original three-frame 16px Stone Hands sheet. Standard library only; no external assets."""
from pathlib import Path
import struct
import zlib

PALETTE = {'.': (0, 0, 0, 0), 'o': (53, 67, 76, 255), 's': (156, 171, 177, 255),
           'h': (213, 225, 218, 255), 'c': (185, 231, 207, 255), 'l': (103, 176, 182, 255),
           'r': (192, 140, 95, 255)}
FRAMES = [
    ['................','......oooo......','.....osssso.....','....oshsshso....',
     '....osossoso....','.....oss s o.....'.replace(' ', '' ).ljust(16,'.'),
     '....oossssoo....','...osssccssso...','...oshc o chso...'.replace(' ', '').ljust(16,'.'),
     '...osssccssso...','....osss ss o....'.replace(' ', '').ljust(16,'.'),
     '....oshsshso....','.....osssso.....','....oossssoo....','....ooo..ooo....','................'],
    ['................','....oo.oo.oo....','...ossossosso...','..oshhshhshhso..',
     '..ossssss sssso..'.replace(' ', '').ljust(16,'.'),'..osssssssssso..','..oshsssssshso..',
     '...osssllssso...','...osssllssso...','...osssssssso...','....oshsshso....',
     '....ossssso.....','.....osssso.....','.....oooooo.....','................','................'],
    ['................','....oo.oo.oo....','...ossossosso...','..oshhshhshhso..',
     '..osssssssssso..','..osssssssssso..','..oshsssssshso..','...ossrrrssso...',
     '...osssrsssso...','...osssssssso...','....oshsshso....','.....osssso.....',
     '.....osssso.....','.....oooooo.....','................','................']]

def chunk(kind, data):
    return struct.pack('!I', len(data)) + kind + data + struct.pack('!I', zlib.crc32(kind + data) & 0xffffffff)

def png_bytes():
    if any(len(frame) != 16 or any(len(row) != 16 for row in frame) for frame in FRAMES):
        raise ValueError('Each original frame must be exactly 16x16')
    raw = b''.join(b'\0' + b''.join(bytes(PALETTE[c]) for frame in FRAMES for c in frame[y]) for y in range(16))
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('!2I5B', 48, 16, 8, 6, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b'')

if __name__ == '__main__':
    destination = Path(__file__).resolve().parents[1] / 'art/characters/stone-hands.png'
    destination.write_bytes(png_bytes())
