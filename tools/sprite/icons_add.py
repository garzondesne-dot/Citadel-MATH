# 🖼 아이콘 묶음 더하기 (#88 · 2026-11-11 · v4 와 같은 방식): 마젠타 원본(가로 C × 세로 R · 칸 간격 고르지 않음) → 그림 덩어리 기준으로 잘라 32px(nearest) → 칸 64 로 키워 기존 시트 뒤에 붙임
#   python3 -I tools/sprite/icons_add.py <원본.png> <줄> <열> <기존 시트.webp> <새 시트.webp> <확인 그림.png>
import sys, os
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from demagenta import clean
src, R, C, old, out, chk = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4], sys.argv[5], sys.argv[6]
im = Image.fromarray(clean(Image.open(src)) if not isinstance(clean(Image.open(src)), tuple) else clean(Image.open(src))[0])
a = np.asarray(im)[..., 3] > 60
def bands(prof, n):
    gaps, s = [], None
    for i, v in enumerate(list(prof) + [0]):
        if v == 0 and s is None: s = i
        if v and s is not None: gaps.append((i - s, s, i)); s = None
    inner = [g for g in gaps if g[1] > 0 and g[2] < len(prof)]
    cuts = sorted(sorted(inner, reverse=True)[:n - 1], key=lambda g: g[1])
    edges = [0] + [(g[1] + g[2]) // 2 for g in cuts] + [len(prof)]
    return [(edges[i], edges[i + 1]) for i in range(n)]
rows = bands((a.sum(1) > 2).astype(int), R)
cells = []
for (y0, y1) in rows:
    cols = bands((a[y0:y1].sum(0) > 2).astype(int), C)
    for (x0, x1) in cols:
        sub = im.crop((x0, y0, x1, y1)); bb = sub.getchannel('A').point(lambda v: 255 if v > 60 else 0).getbbox(); sub = sub.crop(bb)
        k = 30 / max(sub.size); sm = sub.resize((max(1, round(sub.width * k)), max(1, round(sub.height * k))), Image.NEAREST)
        c32 = Image.new('RGBA', (32, 32), (0, 0, 0, 0)); c32.alpha_composite(sm, ((32 - sm.width) // 2, (32 - sm.height) // 2))
        cells.append(c32.resize((64, 64), Image.NEAREST))
base = Image.open(old).convert('RGBA'); cols8 = base.width // 64; n0 = sum(1 for _ in range(0))
print(len(cells), 'cells')
sys.stdout.flush()
open(out + '.n', 'w').write(str(len(cells)))
import json
meta = json.loads(sys.stdin.read()) if not sys.stdin.isatty() else {}
start = meta.get('start'); total = start + len(cells); rows8 = (total + cols8 - 1) // cols8
sheet = Image.new('RGBA', (cols8 * 64, rows8 * 64), (0, 0, 0, 0)); sheet.alpha_composite(base, (0, 0))
for i, c in enumerate(cells):
    k = start + i; sheet.alpha_composite(c, ((k % cols8) * 64, (k // cols8) * 64))
sheet.save(out, 'WEBP', lossless=True)
pv = Image.new('RGBA', (len(cells) * 72, 72), (40, 40, 50, 255))
for i, c in enumerate(cells): pv.alpha_composite(c, (i * 72 + 4, 4))
pv.save(chk); print('rows', rows8)
