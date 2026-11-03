# v2 용사 두 장 → 게임 시트 한 장 (2026-11-03): 그림 AI 가 준 7줄(기본) + 5줄(차원문 · 앉기 · 힐 받음 · 생각 · 헉헉)
#   1) 두 장을 따로 sheet.py (대기 키 50 · 칸 80×64) — 5줄 그림은 첫 줄(서 있는 뒷모습) 키를 50 으로 맞춘다
#   2) 7줄 + 5줄 을 위아래로 이어 12줄 시트 (5줄이 없으면 7줄만 — 없는 동작은 art.js 대신 쓰기)
#   3) breathe.py 로 대기 숨쉬기 4프레임 · hero_meta.py 로 머리 기준점(cx · anchors)
# 사용: python3 tools/sprite/hero_pair.py <7줄.png> <5줄.png 또는 -> <출력 폴더> <이름>
#   → <출력 폴더>/<이름>.webp (게임용) · <이름>-meta.json · <이름>-idle.gif
import sys, os, json, subprocess
from PIL import Image

A, B, out, name = sys.argv[1:5]
HERE = os.path.dirname(os.path.abspath(__file__))
tmp = os.path.join(out, '_' + name); os.makedirs(tmp, exist_ok=True)
def bands(f, want=0):  # 마젠타만 있는 가로줄로 줄(동작) 경계를 찾아 sheet.py 에 ROWS 로 준다 (이펙트가 붙어 줄이 합쳐지는 것 막기)
    import numpy as np
    a = np.asarray(Image.open(f).convert('RGB')).astype(int)
    fill = (~((a[..., 0] > 170) & (a[..., 1] < 110) & (a[..., 2] > 170))).mean(1) > 0.004
    runs, st = [], None
    for i, v in enumerate(fill):
        if v and st is None: st = i
        if not v and st is not None: runs.append((st, i)); st = None
    if st is not None: runs.append((st, len(fill)))
    runs = [r for r in runs if r[1] - r[0] > 20]
    while want and len(runs) > want:  # 반짝이 · 이펙트가 떨어져 한 줄이 둘로 잡히면 가장 가까운 두 줄을 합친다
        i = min(range(len(runs) - 1), key=lambda k: runs[k + 1][0] - runs[k][1]); runs[i:i + 2] = [(runs[i][0], runs[i + 1][1])]
    cuts = [0] + [(runs[i][1] + runs[i + 1][0]) // 2 for i in range(len(runs) - 1)] + [len(fill)]
    return ','.join(map(str, cuts)), len(runs)
run = lambda *a, **env: subprocess.run([sys.executable, *a], check=True, capture_output=True, text=True, env={**os.environ, **env}).stdout.strip()
# 보라 · 분홍 몸(마녀 등)은 BG=edge 로 진한 마젠타만 지운다: python3 … hero_pair.py … (환경 BG=edge)
print(run(os.path.join(HERE, 'sheet.py'), A, tmp, 'a', '50', '80', '64', ROWS=bands(A, 7)[0]))
parts = [Image.open(os.path.join(tmp, 'a.png')).convert('RGBA')]
if B != '-':
    print(run(os.path.join(HERE, 'sheet.py'), B, tmp, 'b', '50', '80', '64', ROWS=bands(B, 5)[0]))
    parts.append(Image.open(os.path.join(tmp, 'b.png')).convert('RGBA'))
W, H = 80 * 4, sum(p.height for p in parts)
merged = Image.new('RGBA', (W, H), (0, 0, 0, 0)); y = 0
for p in parts: merged.paste(p.crop((0, 0, min(W, p.width), p.height)), (0, y)); y += p.height
# 프레임이 모자란 줄(그림 AI 가 한 칸 빼먹음)은 마지막 프레임을 이어 붙여 빈 칸이 깜빡이지 않게
import numpy as np
NEED = [4, 4, 4, 1, 2, 2, 2, 4, 2, 2, 2, 2]
arr = np.asarray(merged)
for r in range(H // 64):
    have = [c for c in range(4) if arr[r * 64:(r + 1) * 64, c * 80:(c + 1) * 80, 3].any()]
    for c in range(len(have), NEED[r] if r < len(NEED) else 0):
        if have: merged.paste(merged.crop((have[-1] * 80, r * 64, have[-1] * 80 + 80, r * 64 + 64)), (c * 80, r * 64)); print(f'줄 {r} 칸 {c} ← 칸 {have[-1]} 복사')
mp = os.path.join(tmp, 'merged.png'); merged.save(mp)
print(run(os.path.join(HERE, 'breathe.py'), mp, out, name))
rows = H // 64
counts = '4,4,4,1,2,2,2,4,2,2,2,2' if rows == 12 else '4,4,4,1,2,2,2'
meta = json.loads(run(os.path.join(HERE, 'hero_meta.py'), os.path.join(out, name + '.png'), '80', '64', counts))
json.dump(meta, open(os.path.join(out, name + '-meta.json'), 'w'))
print(f'{name}: {rows}줄 · cx {meta["cx"]}')
