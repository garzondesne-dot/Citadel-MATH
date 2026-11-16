#!/usr/bin/env python3
"""용사 세밀화 v4 · 첨부 그림 만들기 (설계 묶음 #1)

용사마다 2장:
  refs/ref-v4-hNN-sheet-nb.png  지금 시트 2배(640x1536 · 투명 배경 · 1줄은 c1 한 칸만)
  refs/ref-v4-hNN-port.png      초상 한 칸(256x256 · hero-portraits-v2 6x6)

쓰기:  python3 make_refs.py <art/heroes 폴더>        (기본 = 저장소 맨 위 art/heroes)
원본 = 베타 public/art/heroes (정식 사이트 art/heroes 와 같은 파일)
"""
import json, os, sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', '..', '..', '..', 'art', 'heroes')
OUT = os.path.join(HERE, 'refs')
CW, CH, COLS, ROWS, K = 80, 64, 4, 12, 2      # 지금 시트 칸 80x64 · 4x12 · 2배
PORT, PCELL = 'hero-portraits-v2.webp', 256   # 초상 6x6 · 칸 256 · list = [열, 행]

heroes = json.load(open(os.path.join(HERE, 'heroes.json'), encoding='utf8'))
os.makedirs(OUT, exist_ok=True)
port = Image.open(os.path.join(SRC, PORT)).convert('RGBA')
assert port.size == (PCELL * 6, PCELL * 6), port.size

for h in heroes:
    n = '%02d' % h['id']
    im = Image.open(os.path.join(SRC, h['sprite'])).convert('RGBA')
    assert im.size == (CW * COLS, CH * ROWS), (h['sprite'], im.size)
    # 1줄 = c1 한 칸만 (숨쉬기 반복 칸을 GPT 가 베끼지 않게)
    im.paste((0, 0, 0, 0), (CW, 0, CW * COLS, CH))
    im.resize((CW * COLS * K, CH * ROWS * K), Image.NEAREST).save(
        os.path.join(OUT, f'ref-v4-h{n}-sheet-nb.png'), optimize=True)
    c, r = h['port']
    port.crop((c * PCELL, r * PCELL, (c + 1) * PCELL, (r + 1) * PCELL)).save(
        os.path.join(OUT, f'ref-v4-h{n}-port.png'), optimize=True)
print('만듦:', len(heroes), '명 x 2장 →', OUT)
