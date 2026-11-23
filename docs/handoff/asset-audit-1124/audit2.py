#!/usr/bin/env python3
"""용사 시트 전수 점검 — python3 -I audit2.py <베타 public/art> (이 폴더에서) → out/cells.json · out/heroes.json
칸 256×144 · 줄 = 동작(0 서기 · 1 걷기 · 2 공격 · 3 맞음 · 4 승리 · 5 쓰러짐 · 6 힐 · 7 포털 · 8 쉬기 · 9 힐 받기 · 10 생각 · 11 헉헉) · 숨쉬기 idle8 = 8칸 한 줄.
몸 = 2px 이어 붙인 가장 큰 덩어리 · 무기 = 몸에서 떨어진 면적 25px 이상 덩어리."""
import sys, os, glob, json, re
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
ART = sys.argv[1]; CW, CH = 256, 144
ACT = ['서기', '걷기', '공격', '맞음', '승리', '쓰러짐', '힐', '포털', '쉬기', '힐받기', '생각', '헉헉']
LAY = json.load(open('/home/user/Citadel-MATH/docs/handoff/assets/hero-awaken/gpt-layout-dknight.json'))
SLOTS = [tuple(s['src']) for s in LAY['slots'] if 'src' in s]      # (row, col) 31칸
S8 = np.ones((3, 3), bool)
def cellstats(cell):
    a = cell[..., 3] > 128
    if a.sum() < 20: return None
    lab, n = ndi.label(ndi.binary_dilation(a, S8, iterations=2), S8)
    areas = [(a & (lab == i)).sum() for i in range(1, n + 1)]
    bi = int(np.argmax(areas)) + 1; body = a & (lab == bi)
    ys, xs = np.where(body); top, bot, l, r = ys.min(), ys.max(), xs.min(), xs.max()
    dist = ndi.distance_transform_edt(~body)
    others = []
    for i in range(1, n + 1):
        if i == bi: continue
        m = a & (lab == i)
        if m.sum() >= 25: others.append((int(m.sum()), float(dist[m].min())))
    allys = np.where(a.any(1))[0]
    return dict(top=int(top), bot=int(bot), h=int(bot - top + 1), l=int(l), r=int(r), w=int(r - l + 1), cx=float(xs.mean()), area=int(body.sum()), tot=int(a.sum()),
                nweap=len(others), weapgap=max([g for _, g in others], default=0.0), weaparea=sum(x for x, _ in others),
                clipbot=bool(a[CH - 1].any() or a[CH - 2].any()), cliptop=bool(a[0].any()), cliplr=bool(a[:, 0].any() or a[:, -1].any()), alltop=int(allys.min()), allbot=int(allys.max()))
def sheetlist():
    L = {}
    for f in sorted(glob.glob(ART + '/heroes/hero-*.webp')):
        n = os.path.basename(f); m = re.match(r'hero-([a-z0-9]+)-(awk-v9|v7|v8|idle8-v7|awk-idle8-v9)\.webp$', n)
        if not m: continue
        k, kind = m.groups(); L.setdefault((k, kind.split('-v')[0] if 'idle8' not in kind else kind), []).append((n, kind))
    return L
rows = []
files = {}
for f in sorted(glob.glob(ART + '/heroes/hero-*.webp')):
    n = os.path.basename(f); m = re.match(r'hero-([a-z0-9]+)-(awk-v9|v7|v8|idle8-v7|awk-idle8-v9)\.webp$', n)
    if m: files.setdefault((m.group(1), 'idle8' if 'idle8' in m.group(2) else 'sheet', 'awk' if 'awk' in m.group(2) else 'base'), []).append((n, m.group(2)))
# 게임이 쓰는 판: 기본 시트 = v8 이 있으면 v8(녹스) 아니면 v7 · 각성 = awk-v9 · 숨쉬기 = idle8-v7 · 각성 숨쉬기 = awk-idle8-v9
use = {}
for (k, typ, awk), L in files.items():
    names = dict((kind, n) for n, kind in L)
    pick = names.get('v8') or names.get('v7') if (typ == 'sheet' and awk == 'base') else (names.get('awk-v9') if typ == 'sheet' else (names.get('idle8-v7') if awk == 'base' else names.get('awk-idle8-v9')))
    if pick: use[(k, typ, awk)] = pick
for (k, typ, awk), n in sorted(use.items()):
    im = np.array(Image.open(f'{ART}/heroes/{n}').convert('RGBA'))
    if typ == 'sheet':
        for slot, (r, c) in enumerate(SLOTS):
            st = cellstats(im[r*CH:(r+1)*CH, c*CW:(c+1)*CW])
            if st: rows.append(dict(hero=k, awk=awk, kind='sheet', file=n, slot=slot, row=r, col=c, act=ACT[r], **st))
    else:
        for c in range(im.shape[1] // CW):
            st = cellstats(im[:, c*CW:(c+1)*CW])
            if st: rows.append(dict(hero=k, awk=awk, kind='idle8', file=n, slot=c, row=0, col=c, act='숨쉬기', **st))
json.dump(rows, open('out/cells.json', 'w'), ensure_ascii=False); print(len(rows), 'cells', len(use), 'files')
