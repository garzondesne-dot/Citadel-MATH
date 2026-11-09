# ✨ 강화 오라 10단계 시트 · 도는 입자 정리 (2026-11-09 · GPT 생성본 → 게임 크기)
#   python3 tools/sprite/aura_pack.py <원본 폴더(sNN.png · oNN.png)> <출력 폴더>
#   원본 = 검정 배경 4칸 가로 (크기 자유) → 검정 = 투명(밝기 = 진하기) · 칸마다 같은 자리
#   오라: 칸 128×128 · 4칸 × 10줄 · 고리 바닥 = y 122 · 가로 가운데 · 전체 폭 ≈ 96px (10단계가 같은 비율)
#   입자: 칸 24×24 · 4칸 × 10줄 · 가운데 · 긴 변 22px
import sys, os
from PIL import Image
SRC, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)

def deblack(im):
    im = im.convert('RGB'); px = im.load(); w, h = im.size; o = Image.new('RGBA', (w, h)); op = o.load()
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]; a = max(r, g, b)
            if a < 18: op[x, y] = (0, 0, 0, 0); continue
            op[x, y] = (min(255, r * 255 // a), min(255, g * 255 // a), min(255, b * 255 // a), a)
    return o

def frames(path):
    im = deblack(Image.open(path)); w, h = im.size; fw = w // 4
    return [im.crop((i * fw, 0, (i + 1) * fw, h)) for i in range(4)]

def union_bbox(fs):
    bb = None
    for f in fs:
        b = f.getbbox()
        if not b: continue
        bb = b if not bb else (min(bb[0], b[0]), min(bb[1], b[1]), max(bb[2], b[2]), max(bb[3], b[3]))
    return bb

def place(fs, cell, target_w, bottom=None, max_h=None):
    bb = union_bbox(fs); bw, bh = bb[2] - bb[0], bb[3] - bb[1]
    s = target_w / bw
    if max_h and bh * s > max_h: s = max_h / bh
    out = []
    for f in fs:
        c = f.crop(bb); c = c.resize((max(1, round(bw * s)), max(1, round(bh * s))), Image.NEAREST)
        cv = Image.new('RGBA', (cell, cell)); x = (cell - c.width) // 2
        y = (bottom - c.height) if bottom is not None else (cell - c.height) // 2
        cv.alpha_composite(c, (x, max(0, y))); out.append(cv)
    return out

A = Image.new('RGBA', (128 * 4, 128 * 10)); O = Image.new('RGBA', (24 * 4, 24 * 10))
for i in range(1, 11):
    n = f'{i:02d}'
    for k, f in enumerate(place(frames(f'{SRC}/s{n}.png'), 128, 96, bottom=124, max_h=118)): A.alpha_composite(f, (k * 128, (i - 1) * 128))
    for k, f in enumerate(place(frames(f'{SRC}/o{n}.png'), 24, 22, max_h=22)): O.alpha_composite(f, (k * 24, (i - 1) * 24))
A.save(f'{OUT}/aura-v1.webp', lossless=True); O.save(f'{OUT}/aura-orbs-v1.webp', lossless=True)
A.save(f'{OUT}/aura-v1.png'); O.save(f'{OUT}/aura-orbs-v1.png')
print('오라', A.size, '입자', O.size, '→', OUT)
