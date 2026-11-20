#!/usr/bin/env python3
"""v6 만들기 — python3 -I build_v6.py <public/art> (이 폴더에서 실행 · v6/ 에 파일 + cmp/ 비교 그림 + v6.json)
순서: ① 가장자리 despill(despill6.py) ② 앞서 만든 fixed/ 의 떨어진 점 지우기 합침 ③ 마검사 오라 고침본 복사 · alpha 는 지울 때만 바뀜을 검증."""
import sys, os, json, glob, shutil
import importlib.util, numpy as np
from PIL import Image
ART = sys.argv[1]; sys.argv = ['x', ART, 'v6']
def load(n, p):
    sp = importlib.util.spec_from_file_location(n, p); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m
d6 = load('d6', 'despill6.py'); c6 = load('c6', 'cmp6.py')
CW, CH = 256, 144; rows = []; seen = set()
os.makedirs('v6/cmp', exist_ok=True)
for pat, a, b in [('heroes/hero-*-v5.webp', '-v5.webp', '-v6.webp'), ('heroes/hero-*-idle8-v1.webp', '-idle8-v1.webp', '-idle8-v6.webp')]:
    for f in sorted(glob.glob(os.path.join(ART, pat))):
        name = os.path.basename(f)
        if name in seen: continue
        seen.add(name)
        im = np.array(Image.open(f).convert('RGBA')); out = im.copy(); H, W = im.shape[:2]; per = []; kept = 0
        for r in range(H // CH):
            for c in range(W // CW):
                sl = (slice(r*CH, (r+1)*CH), slice(c*CW, (c+1)*CW)); cell = im[sl]
                if not (cell[..., 3] > 0).any(): continue
                o, n, e = d6.despill(cell); out[sl] = o; per.append((r, c, n)); kept += e - n
        fx = 'fixed/' + name; merged = 0
        if os.path.exists(fx):
            F = np.array(Image.open(fx).convert('RGBA')); dm = (im != F).any(-1); out[dm] = F[dm]; merged = int(dm.sum())
        newname = name.replace(a, b); chg = (im != out).any(-1)
        assert ((im[..., 3] == out[..., 3]) | (out[..., 3] == 0))[chg].all()
        Image.fromarray(out, 'RGBA').save('v6/' + newname, lossless=True, exact=True)
        rows.append(dict(file=name, out=newname, changed=int(chg.sum()), kept_tinted_edge=int(kept), merged_fixed=merged, cells=sorted(per, key=lambda x: -x[2])[:6]))
        top = [(r, c) for r, c, n in sorted(per, key=lambda x: -x[2])[:3]]
        c6.pair(im, out, top, 'v6/cmp/' + newname.replace('.webp', '.png'), name, 3)
shutil.copy('fixed/aura10-spellblade-v1.webp', 'v6/aura10-spellblade-v6.webp')
rows.append(dict(file='aura10-spellblade-v1.webp', out='aura10-spellblade-v6.webp', changed=435, kept_tinted_edge=0, merged_fixed=435, cells=[]))
json.dump(rows, open('v6/v6.json', 'w'), ensure_ascii=False)
print(len(rows), 'files', sum(r['changed'] for r in rows), 'px changed')
