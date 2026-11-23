#!/usr/bin/env python3
"""v11 시트 — python3 -I build_v11.py <베타 public/art> <PixelLab 결과 폴더> (이 폴더에서 · v11/ 에 시트 + cmp/)
① 닌자 걷기 r1 4칸 · 마검사 서기 r0 4칸(idle 같은 칸 4개) · 걷기 r1 4칸 = PixelLab edit-images-v2 결과(하얀 배경 지움 · 변형 0 번)
② 힐 받기 r9 · 생각 r10 의 c0 · c1 = 서기 몸 키의 90% 로 키움(scale.py · 발끝 135 · 가운데 유지) — 엘프 · 음유시인 · 드라군 · 해적 · 드론 · 상인 · 성기사 · 해커
고친 칸 밖은 그대로(검증) · 같은 칸 크기."""
import sys, os, json
import numpy as np
from PIL import Image, ImageDraw
sys.path.insert(0, 'v11/work')
from post import unwhite, over
from scale import rescale, body_box
ART, PL = sys.argv[1], sys.argv[2]; CW, CH = 256, 144
def load(h): return Image.open(f'{ART}/heroes/hero-{h}-v7.webp').convert('RGBA')
def cellof(im, r, c): return im.crop((c*CW, r*CH, (c+1)*CW, (r+1)*CH))
def put(im, r, c, cell): im.paste(Image.new('RGBA', (CW, CH), (0, 0, 0, 0)), (c*CW, r*CH)); im.alpha_composite(cell, (c*CW, r*CH))
log = []
def finish(h, im, orig, edits):
    chg = (np.array(orig) != np.array(im)).any(-1); mask = np.zeros(chg.shape, bool)
    for r, c in edits: mask[r*CH:(r+1)*CH, c*CW:(c+1)*CW] = True
    assert not chg[~mask].any(), h
    im.save(f'v11/hero-{h}-v11.webp', lossless=True, exact=True)
    # 비교 그림: 고친 칸마다 위 = 원본 · 아래 = 고침 (발끝 135 빨간 줄)
    n = len(edits); cv = Image.new('RGB', (n * 256, 2 * CH + 14), (30, 30, 36)); d = ImageDraw.Draw(cv)
    for i, (r, c) in enumerate(edits):
        for k, src in enumerate((orig, im)):
            cell = cellof(src, r, c); b = over(cell, z=1).convert('RGB'); ImageDraw.Draw(b).line([(0, 135), (256, 135)], fill=(255, 0, 0)); cv.paste(b, (i * 256, k * CH + 14))
        d.text((i * 256 + 3, 1), f'{h} r{r}c{c}  (top original / bottom fixed · red=135)', fill=(255, 255, 0))
    cv.save(f'v11/cmp/{h}.png')
    for r, c in edits:
        t0, b0 = body_box(cellof(orig, r, c))[:2]; t1, b1 = body_box(cellof(im, r, c))[:2]; log.append(dict(hero=h, row=r, col=c, h_before=int(b0 - t0 + 1), h_after=int(b1 - t1 + 1), foot_before=int(b0), foot_after=int(b1)))
# ① PixelLab
im = load('ninja'); orig = im.copy(); ed = []
for c in range(4): put(im, 1, c, unwhite(Image.open(f'{PL}/ninja_w{c}_0.png'))); ed.append((1, c))
finish('ninja', im, orig, ed)
im = load('spellblade'); orig = im.copy(); ed = []
idle = unwhite(Image.open(f'{PL}/spell_idle0_0.png'))
for c in range(4): put(im, 0, c, idle); ed.append((0, c))
for c in range(4): put(im, 1, c, unwhite(Image.open(f'{PL}/spell_walk{c}_0.png'))); ed.append((1, c))
finish('spellblade', im, orig, ed)
# ② 키움
for h in ['elf', 'bard', 'dragoon', 'pirate', 'drone', 'merchant', 'paladin', 'hacker']:
    im = load(h); orig = im.copy(); t, b = body_box(cellof(im, 0, 0))[:2]; ref = b - t + 1; ed = []
    for r in (9, 10):
        for c in (0, 1):
            new, s = rescale(cellof(im, r, c), ref, 0.9); put(im, r, c, new); ed.append((r, c))
    finish(h, im, orig, ed)
json.dump(log, open('v11/v11.json', 'w'), ensure_ascii=False, indent=1)
for l in log: print(l)
