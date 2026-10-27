"""原創 16×16 雙刃刺客；字元原稿與 PNG 匯出可重現，無外部素材。"""
from pathlib import Path
import struct
import zlib
ROWS = [
 '......oooo......','.....ohhhho.....','....ohhhhhho....','....ohhhhhoo....',
 '....oeeeeeho....','.....ohhhoo.....','..s..oooooo..s..','.ssoohhhhhhooss.',
 '.sooohhhhhhooos.','..ooohrrhhooo...','....orrrrro.....','....ohhhhho.....',
 '....oh..ho......','....oh..ho......','...ooo..ooo.....','................',
]
PALETTE={'.':(0,0,0,0),'o':(39,38,56,255),'h':(119,107,152,255),'e':(255,245,223,255),'s':(213,231,236,255),'r':(191,55,90,255)}
def chunk(kind,data):
 return struct.pack('!I',len(data))+kind+data+struct.pack('!I',zlib.crc32(kind+data)&0xffffffff)
def main():
 assert len(ROWS)==16 and all(len(row)==16 for row in ROWS)
 raw=b''.join(b'\0'+b''.join(bytes(PALETTE[c]) for c in row) for row in ROWS)
 png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!2I5B',16,16,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(raw))+chunk(b'IEND',b'')
 (Path(__file__).resolve().parents[1]/'art/characters/assassin.png').write_bytes(png)
if __name__=='__main__':main()
