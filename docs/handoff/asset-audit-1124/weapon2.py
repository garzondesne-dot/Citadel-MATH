#!/usr/bin/env python3
"""무기 연속성(날 · 은회색 덩어리) — python3 -I weapon2.py <public/art> → out/weapon.json
날 = 불투명 · 밝기 190 이상 · 채도 0.28 이하(은 · 흰색)인 8방향 덩어리(10px 이상) · 같은 줄(동작) 프레임끼리 날 면적 · 개수 비교."""
import sys, json, glob, os, re, collections
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
ART = sys.argv[1]; CW, CH = 256, 144
LAY = json.load(open('/home/user/Citadel-MATH/docs/handoff/assets/hero-awaken/gpt-layout-dknight.json'))
SLOTS = [tuple(s['src']) for s in LAY['slots'] if 'src' in s]
def blades(cell):
    a = cell[..., 3] > 128; rgb = cell[..., :3].astype(float); mx = rgb.max(-1); mn = rgb.min(-1)
    S = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 0)
    m = a & (mx >= 190) & (S <= 0.28)
    lab, n = ndi.label(m, np.ones((3, 3))); out = []
    for i in range(1, n + 1):
        ys, xs = np.where(lab == i)
        if len(ys) >= 10: out.append((len(ys), int(xs.mean()), int(ys.mean())))
    return out
rows = []
for f in sorted(glob.glob(ART + '/heroes/hero-*.webp')):
    n = os.path.basename(f); m = re.match(r'hero-([a-z0-9]+)-(awk-v9|v7|v8)\.webp$', n)
    if not m: continue
    k, kind = m.groups()
    if kind == 'v7' and os.path.exists(ART + f'/heroes/hero-{k}-v8.webp'): continue
    im = np.array(Image.open(f).convert('RGBA'))
    for slot, (r, c) in enumerate(SLOTS):
        b = blades(im[r*CH:(r+1)*CH, c*CW:(c+1)*CW]); rows.append(dict(hero=k, awk='awk' if 'awk' in kind else 'base', file=n, row=r, col=c, nb=len(b), area=sum(x[0] for x in b)))
G = collections.defaultdict(list)
for d in rows: G[(d['hero'], d['awk'], d['row'])].append(d)
res = []
for (h, a, r), L in G.items():
    if r in (5, 8, 11) or len(L) < 2: continue
    ar = [d['area'] for d in L]; nb = [d['nb'] for d in L]
    if max(ar) == 0: continue
    ratio = (max(ar) - min(ar)) / max(max(ar), 1)
    res.append(dict(hero=h, awk=a, row=r, areas=ar, nbs=nb, ratio=round(ratio, 2), file=L[0]['file']))
json.dump(res, open('out/weapon.json', 'w'), ensure_ascii=False)
for x in sorted(res, key=lambda x: -x['ratio'])[:25]: print(x['hero'], x['awk'], 'row', x['row'], x['areas'], x['nbs'], x['ratio'])
