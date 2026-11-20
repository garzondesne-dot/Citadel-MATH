#!/usr/bin/env python3
"""확대 비교 그림 — python3 -I fig.py <art> : 위 = 원본 · 가운데 = 문제 픽셀 빨강 · 아래 = 자동 고친 미리 보기"""
import sys, os, json
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
ART = sys.argv[1]
GEO = {'전투': (256, 144), '숨쉬기': (256, 144), '오라': (160, 160), '초상': (512, 512)}
def find(name):
    for p in ('heroes/' + name, name):
        if os.path.exists(os.path.join(ART, p)): return os.path.join(ART, p)
def detect(cell):
    a = cell[..., 3]; rgb = cell[..., :3].astype(int); R, G, B = rgb[..., 0], rgb[..., 1], rgb[..., 2]; op = a > 128
    near_t = ndi.binary_dilation(a < 128, structure=np.ones((3, 3))) & op
    mag = op & (R >= 225) & (B >= 225) & (G <= 70)
    lab, n = ndi.label(a > 0, structure=np.ones((3, 3)))
    small = np.zeros(a.shape, bool)
    for i in range(1, n + 1):
        m = lab == i
        if m.sum() <= 6: small |= m
    semi = (a >= 1) & (a <= 60)
    border = np.zeros(a.shape, bool); border[0] = border[-1] = True; border[:, 0] = border[:, -1] = True
    return mag, small, semi, (a > 30) & border
def fix(cell):
    out = cell.copy(); mag, small, semi, _ = detect(cell)
    out[small | semi, 3] = 0
    # 마젠타 가장자리: 안쪽 이웃 중 마젠타 아닌 불투명 픽셀 색의 평균으로 바꿈 (없으면 지움)
    solid = (cell[..., 3] > 128) & ~mag
    for y, x in zip(*np.where(mag)):
        ys, xs = slice(max(0, y-2), y+3), slice(max(0, x-2), x+3)
        m = solid[ys, xs]
        if m.any(): out[y, x, :3] = cell[ys, xs, :3][m].mean(0).astype(np.uint8)
        else: out[y, x, 3] = 0
    return out
def checker(w, h, s=8):
    c = np.zeros((h, w, 3), np.uint8)
    for y in range(h):
        for x in range(w): c[y, x] = (70, 70, 80) if (x // s + y // s) % 2 == 0 else (90, 90, 100)
    return Image.fromarray(c)
def show(cell, red=None, z=4):
    bg = checker(*cell.shape[1::-1]).convert('RGBA'); im = Image.fromarray(cell, 'RGBA'); bg.alpha_composite(im)
    if red is not None:
        arr = np.array(bg); arr[red] = (255, 0, 0, 255); bg = Image.fromarray(arr, 'RGBA')
    return bg.resize((cell.shape[1] * z, cell.shape[0] * z), Image.NEAREST)
def make(name, kind, r, c, tag):
    cw, ch = GEO[kind]; im = np.array(Image.open(find(name)).convert('RGBA'))
    cell = im[r*ch:(r+1)*ch, c*cw:(c+1)*cw]; mag, small, semi, bleed = detect(cell)
    z = 4 if cw <= 256 else 2
    A, B, C = show(cell, None, z), show(cell, mag | small | semi | bleed, z), show(fix(cell), None, z)
    W = A.width; canvas = Image.new('RGBA', (W * 3 + 40, A.height + 28), (30, 30, 36, 255)); d = ImageDraw.Draw(canvas)
    for i, (t, im2) in enumerate((('original', A), ('problem pixels (red)', B), ('auto-fixed preview', C))):
        canvas.alpha_composite(im2, (i * (W + 20), 28)); d.text((i * (W + 20) + 4, 8), f'{name} [{r},{c}] {t}', fill=(255, 255, 255, 255))
    canvas.convert('RGB').save(os.path.join('fig', f'{tag}.png'))
if __name__ == '__main__':
    os.makedirs('fig', exist_ok=True)
    cells = json.load(open('out/cells.json'))
    top = sorted([d for d in cells if d['kind'] != '초상'], key=lambda d: -(d['mag'] * 2 + d['neon'] * 6 + d['edot'] * 4 + d['bleed'] + d['semi'] / 20 + d['footdev'] * 3))[:int(sys.argv[2]) if len(sys.argv) > 2 else 8]
    for i, d in enumerate(top):
        make(d['file'], d['kind'], d['row'], d['col'], f"{i+1:02d}-{d['file'].replace('.webp','')}-r{d['row']}c{d['col']}")
        print(i + 1, d['file'], d['cell'], d['kind'], 'mag', d['mag'], 'neon', d['neon'], 'edot', d['edot'], 'bleed', d['bleed'], 'semi', d['semi'], 'footdev', d['footdev'])
