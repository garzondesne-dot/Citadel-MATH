#!/usr/bin/env python3
"""v6 가장자리 despill — python3 -I despill6.py <public/art> <출력 폴더>
규칙: 투명에 닿은(2px 안) 가장자리 픽셀 중 초록/분홍(크로마키색)쪽으로 쏠린 것만 · 안쪽 5×5 에 같은 색이 많으면(= 진짜 마법 · 이펙트 · 옷) 그대로 둠 ·
      고칠 때는 이웃 중 쏠리지 않은 불투명 픽셀 색 평균으로 · 이웃이 없으면 지움. alpha 는 지울 때만 바뀜. 칸 크기 256×144."""
import sys, os, glob, json
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
ART, OUT = sys.argv[1], sys.argv[2]
CW, CH = 256, 144
def tint(rgb, op):
    R, G, B = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    green = op & (G >= R + 12) & (G >= B + 12) & (G >= 24)
    pink = op & (R >= G + 30) & (B >= G + 30) & (R >= 60) & (B >= 60)
    return green, pink
def despill(cell):
    a = cell[..., 3]; op = a > 0; rgb = cell[..., :3].astype(int)
    out = cell.copy()
    transp = ~op
    band = op & ndi.binary_dilation(transp, structure=ndi.generate_binary_structure(2, 1), iterations=2)
    edge = op & ndi.binary_dilation(transp, structure=ndi.generate_binary_structure(2, 1))
    green, pink = tint(rgb, op)
    T = green | pink
    inner = op & ~band
    k = np.ones((5, 5))
    cnt_in = ndi.convolve(inner.astype(float), k, mode='constant')
    V = rgb.max(-1)
    cnt_tin = ndi.convolve((T & inner & (V >= 80)).astype(float), k, mode='constant')
    frac = cnt_tin / np.maximum(cnt_in, 1)
    # 안쪽이 하나도 없으면(얇은 조각) 바깥 쪽 포함해서 계산
    cnt_all = ndi.convolve(op.astype(float), k, mode='constant'); cnt_tall = ndi.convolve(T.astype(float), k, mode='constant')
    frac = np.where(cnt_in > 0, frac, cnt_tall / np.maximum(cnt_all, 1))
    bad = band & T & (frac < 0.4)
    good = op & ~T
    changed = 0
    sums = [ndi.convolve(np.where(good, rgb[..., c], 0).astype(float), k, mode='constant') for c in range(3)]
    gcnt = ndi.convolve(good.astype(float), k, mode='constant')
    ys, xs = np.where(bad)
    kept_bright = 0
    for y, x in zip(ys, xs):
        lum = 0.3 * rgb[y, x, 0] + 0.59 * rgb[y, x, 1] + 0.11 * rgb[y, x, 2]
        R0, G0, B0 = rgb[y, x]
        nearkey = (G0 >= R0 + 80 and G0 >= B0 + 40) or (R0 >= G0 + 100 and B0 >= G0 + 100)   # 크로마키(초록 · 마젠타)에 섞인 색 — 청록 · 분홍 빛과 구별
        if lum < 75:
            out[y, x, :3] = (26, 18, 40)          # 어두운 초록 · 분홍 테두리 = 표준 윤곽선 색(남보라)으로
        elif not nearkey:
            kept_bright += 1; continue            # 밝은 이펙트 색(연두 · 분홍 빛)은 그대로
        elif gcnt[y, x] >= 1:
            out[y, x, :3] = [int(round(sums[c][y, x] / gcnt[y, x])) for c in range(3)]
        else:
            out[y, x, 3] = 0
        changed += 1
    return out, changed, int((edge & T).sum())
if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    pats = [('heroes/hero-*-v5.webp', 'v5', 'v6'), ('heroes/hero-*-idle8-v1.webp', 'idle8-v1', 'idle8-v6')]
    rows = []; seen = set()
    for pat, a, b in pats:
        for f in sorted(glob.glob(os.path.join(ART, pat))):
            name = os.path.basename(f)
            if name in seen: continue
            seen.add(name)
            im = np.array(Image.open(f).convert('RGBA')); out = im.copy(); H, W = im.shape[:2]
            fixed = 0; before = 0; cells = []
            for r in range(H // CH):
                for c in range(W // CW):
                    sl = (slice(r*CH, (r+1)*CH), slice(c*CW, (c+1)*CW))
                    cell = im[sl]
                    if not (cell[..., 3] > 0).any(): continue
                    o, n, e = despill(cell); out[sl] = o; fixed += n; before += e
                    if n: cells.append((r, c, n))
            newname = name.replace('-' + a + '.webp', '-' + b + '.webp') if a == 'idle8-v1' else name.replace('-v5.webp', '-v6.webp')
            Image.fromarray(out, 'RGBA').save(os.path.join(OUT, newname), lossless=True, exact=True)
            rows.append(dict(file=name, out=newname, fixed=fixed, edge_tinted=before, cells=cells))
    json.dump(rows, open(os.path.join(OUT, 'despill6.json'), 'w'), ensure_ascii=False)
    print(len(rows), 'files', sum(r['fixed'] for r in rows), 'px fixed')
