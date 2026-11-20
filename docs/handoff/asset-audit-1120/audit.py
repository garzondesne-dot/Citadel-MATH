#!/usr/bin/env python3
"""용사 그림 검사 (1단계 · 읽기만) — python3 -I audit.py <public/art 경로> <결과 폴더>"""
import sys, glob, os, re, json, colorsys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
ART, OUT = sys.argv[1], sys.argv[2]
# (패턴, 칸 가로, 칸 세로, 종류)
SETS = [('heroes/hero-*-awk-v5.webp', 256, 144, '전투'), ('heroes/hero-*-v5.webp', 256, 144, '전투'),
        ('heroes/hero-*-awk-idle8-v1.webp', 256, 144, '숨쉬기'), ('heroes/hero-*-idle8-v1.webp', 256, 144, '숨쉬기'),
        ('aura10-*-v1.webp', 160, 160, '오라'), ('heroes/hero-portraits-v2.webp', 512, 512, '초상'), ('hero-faces-v3.webp', 512, 512, '초상')]
def sat(rgb):
    mx = rgb.max(-1).astype(float); mn = rgb.min(-1).astype(float)
    return np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 0), mx / 255
rows = []; marks = {}
seen = set()
for pat, cw, ch, kind in SETS:
    for f in sorted(glob.glob(os.path.join(ART, pat))):
        name = os.path.basename(f)
        if name in seen: continue
        seen.add(name)
        im = np.array(Image.open(f).convert('RGBA')); H, W = im.shape[:2]
        fcolors = len({tuple(p) for p in im[im[..., 3] > 128][:, :3]})
        base = []
        for r in range(H // ch):
            for c in range(W // cw):
                cell = im[r*ch:(r+1)*ch, c*cw:(c+1)*cw]; a = cell[..., 3]
                if not (a > 0).any(): continue
                rgb = cell[..., :3].astype(int); op = a > 128
                R, G, B = rgb[..., 0], rgb[..., 1], rgb[..., 2]
                near_t = ndi.binary_dilation(a < 128, structure=np.ones((3, 3))) & op   # 투명 옆 가장자리 픽셀
                mag = op & (R >= 225) & (B >= 225) & (G <= 70)        # ① 남은 마젠타 키 (거의 FF00FF)
                pink = near_t & (R >= 200) & (B >= 140) & (G <= 120) & (R - G > 100) & (B - G > 50) & ~mag   # ①' 분홍 가장자리 (이펙트 빛일 수 있어 점수에 안 넣음)
                lab, n = ndi.label(a > 0, structure=np.ones((3, 3)))
                sizes = ndi.sum(np.ones_like(a), lab, range(1, n + 1)) if n else []
                small = np.zeros(a.shape, bool)
                for i, s in enumerate(sizes):
                    if s <= 6: small |= lab == i + 1
                S, V = sat(rgb)
                neon = small & (S > 0.85) & (V > 0.75)                # ② 형광 외톨이
                edge = np.zeros(a.shape, bool); edge[:2] = edge[-2:] = True; edge[:, :2] = edge[:, -2:] = True
                edot = small & edge                                  # ② 칸 가장자리 점
                border = np.zeros(a.shape, bool); border[0] = border[-1] = True; border[:, 0] = border[:, -1] = True
                bleed = (a > 30) & border                            # ③ 칸 밖 번짐
                semi = (a >= 1) & (a <= 60)                          # ④ 반투명 찌꺼기
                ys = np.where(op.any(1))[0]; foot = int(ys.max()) if len(ys) else -1
                colors = len({tuple(p) for p in cell[op][:, :3]})   # ⑥
                d = dict(file=name, kind=kind, cell=f'{r},{c}', row=r, col=c, mag=int(mag.sum()), pink=int(pink.sum()), neon=int(neon.sum()),
                         edot=int(edot.sum()), bleed=int(bleed.sum()), semi=int(semi.sum()), foot=foot, colors=colors, filecolors=fcolors)
                rows.append(d); marks[(name, r, c)] = (mag | neon | edot, bleed, semi)
# ⑤ 발 줄: 파일마다 같은 줄(row)의 중앙값과 비교 (숨쉬기 = 파일 전체 중앙값)
by = {}
for d in rows: by.setdefault((d['file'], 0 if d['kind'] == '숨쉬기' else d['row']), []).append(d)
for k, v in by.items():
    med = float(np.median([x['foot'] for x in v]))
    for x in v: x['footdev'] = int(abs(x['foot'] - med)) if len(v) > 2 else 0
def sev(d):
    s = 0
    if d['mag'] >= 12: s += 3
    elif d['mag'] >= 3: s += 2
    elif d['mag'] >= 1: s += 1
    if d['neon'] >= 4: s += 3
    elif d['neon'] >= 1: s += 2
    if d['edot'] >= 3: s += 2
    elif d['edot'] >= 1: s += 1
    if d['bleed'] >= 12: s += 2
    elif d['bleed'] >= 1: s += 1
    if d['semi'] >= 80: s += 2
    elif d['semi'] >= 20: s += 1
    if d['footdev'] >= 6: s += 2
    elif d['footdev'] >= 3: s += 1
    return '상' if s >= 5 else '중' if s >= 3 else '하' if s >= 1 else ''
for d in rows: d['sev'] = sev(d)
json.dump(rows, open(os.path.join(OUT, 'cells.json'), 'w'), ensure_ascii=False)
# 파일 요약
files = {}
for d in rows:
    f = files.setdefault(d['file'], dict(file=d['file'], kind=d['kind'], cells=0, mag=0, pink=0, neon=0, edot=0, bleed=0, semi=0, footdev=0, over48=0, filecolors=d['filecolors'], 상=0, 중=0, 하=0))
    f['cells'] += 1
    for k in ('mag', 'pink', 'neon', 'edot', 'bleed', 'semi'): f[k] += d[k]
    f['footdev'] += 1 if d['footdev'] >= 3 else 0
    f['over48'] += 1 if d['colors'] > 48 else 0
    if d['sev']: f[d['sev']] += 1
json.dump(list(files.values()), open(os.path.join(OUT, 'files.json'), 'w'), ensure_ascii=False)
print(len(rows), 'cells', len(files), 'files')
