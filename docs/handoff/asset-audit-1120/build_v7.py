#!/usr/bin/env python3
"""v7 만들기 — python3 -I build_v7.py <public/art> (이 폴더에서 · v7/ 에 파일 + cmp/ + v7.json)
v6 와 달라진 점: ① 종류별 보호(초록은 안쪽 초록끼리 · 분홍은 안쪽 분홍끼리 — 보라 옷이 초록 테두리를 지켜 주지 않음: despill7.py)
② 녹스(전투 · 숨쉬기 = 베타가 쓰는 idle8-v2)의 초록 찌꺼기 제거(greenjunk.py) ③ 해골소환사 1,0칸 발 아래 초록 덩어리 제거 ④ 앞서 fixed/ 15칸 합침 · 마검사 오라."""
import sys, os, json, glob, shutil
import importlib.util, numpy as np
from PIL import Image
from scipy import ndimage as ndi
ART = sys.argv[1]; sys.argv = ['x', ART, 'v7']
def load(n, p):
    sp = importlib.util.spec_from_file_location(n, p); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m
d7 = load('d7', 'despill7.py'); gj = load('gj', 'greenjunk.py'); c6 = load('c6', 'cmp6.py')
CW, CH = 256, 144; rows = []
os.makedirs('v7/cmp', exist_ok=True)
files = []
for f in sorted(glob.glob(os.path.join(ART, 'heroes/hero-*-v5.webp'))): files.append((f, os.path.basename(f), os.path.basename(f).replace('-v5.webp', '-v7.webp')))
for f in sorted(glob.glob(os.path.join(ART, 'heroes/hero-*-idle8-v1.webp'))):
    n = os.path.basename(f)
    if n == 'hero-dknight-idle8-v1.webp': f = os.path.join(ART, 'heroes/hero-dknight-idle8-v2.webp'); n = 'hero-dknight-idle8-v2.webp'
    files.append((f, n, os.path.basename(f).replace('-idle8-v1.webp', '-idle8-v7.webp').replace('-idle8-v2.webp', '-idle8-v7.webp')))
files = [x for x in files if '-awk-idle8-v1' not in x[1] or True]
seen = set(); uniq = []
for x in files:
    if x[2] in seen: continue
    seen.add(x[2]); uniq.append(x)
for f, name, newname in uniq:
    im = np.array(Image.open(f).convert('RGBA')); out = im.copy(); H, W = im.shape[:2]; per = []
    for r in range(H // CH):
        for c in range(W // CW):
            sl = (slice(r*CH, (r+1)*CH), slice(c*CW, (c+1)*CW)); cell = im[sl]
            if not (cell[..., 3] > 0).any(): continue
            o, n, e = d7.despill(cell); out[sl] = o; per.append((r, c, n))
    fx = 'fixed/' + name; merged = 0
    if os.path.exists(fx):
        F = np.array(Image.open(fx).convert('RGBA')); dm = (im != F).any(-1); out[dm] = F[dm]; merged = int(dm.sum())
    if name.startswith('hero-dknight-') and 'awk' not in name:       # 녹스 초록 찌꺼기
        for r in range(H // CH):
            for c in range(W // CW):
                sl = (slice(r*CH, (r+1)*CH), slice(c*CW, (c+1)*CW)); out[sl], _ = gj.clean(out[sl])
    if name == 'hero-bone-v5.webp':                                    # 해골소환사 1,0칸 발 아래 초록 덩어리
        sl = (slice(144, 288), slice(0, 256)); cell = out[sl]; R, G, B, A = [cell[..., i].astype(int) for i in range(4)]
        flat = (A > 0) & (R < 30) & (B < 30) & (G >= 100) & (G <= 170); lab, k = ndi.label(flat, structure=np.ones((3, 3)))
        for i in range(1, k + 1):
            m = lab == i; ys, xs = np.where(m)
            if m.sum() >= 15 and (xs.max()-xs.min()) >= 8 and (ys.max()-ys.min()) <= 8: out[sl][m] = [0, 0, 0, 0]
    chg = (im != out).any(-1); assert ((im[..., 3] == out[..., 3]) | (out[..., 3] == 0))[chg].all()
    Image.fromarray(out, 'RGBA').save('v7/' + newname, lossless=True, exact=True)
    rows.append(dict(file=name, out=newname, changed=int(chg.sum()), cells=sorted(per, key=lambda x: -x[2])[:6]))
    top = [(r, c) for r, c, n in sorted(per, key=lambda x: -x[2])[:3]]
    c6.pair(im, out, top, 'v7/cmp/' + newname.replace('.webp', '.png'), name, 3)
shutil.copy('fixed/aura10-spellblade-v1.webp', 'v7/aura10-spellblade-v7.webp')
rows.append(dict(file='aura10-spellblade-v1.webp', out='aura10-spellblade-v7.webp', changed=435, cells=[]))
json.dump(rows, open('v7/v7.json', 'w'), ensure_ascii=False)
print(len(rows), 'files', sum(r['changed'] for r in rows), 'px changed')
