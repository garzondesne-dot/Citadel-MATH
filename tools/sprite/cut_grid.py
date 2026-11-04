# 생성 그림(투명 · 칸이 조금 어긋남) → 게임 시트: 줄 · 열을 빈 틈으로 찾아 칸마다 잘라 같은 줄은 같은 배율 · 발은 칸 아래에 맞춤
#   python3 tools/sprite/cut_grid.py <입력.png> <출력.webp> <줄 수> <열 수> <칸 px> [열 나누는 x,x]
import sys
from PIL import Image
src, out, R, Cn, CELL = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5])
CUTS = [int(v) for v in sys.argv[6].split(',')] if len(sys.argv) > 6 else None  # 열 나누는 x 를 직접 (예: 655,1370)
im = Image.open(src).convert('RGBA'); W, H = im.size; a = im.split()[3].point(lambda v: 255 if v > 60 else 0); px = a.load()
def bands(prof, n):
    # 비어 있는 구간(0) 중 가장 긴 n-1 개로 나눔
    gaps, s = [], None
    for i, v in enumerate(prof + [0]):
        if v == 0 and s is None: s = i
        if v and s is not None: gaps.append((i - s, s, i)); s = None
    inner = [g for g in gaps if g[1] > 0 and g[2] < len(prof)]
    cuts = sorted(sorted(inner, reverse=True)[:n - 1], key=lambda g: g[1])
    if len(cuts) < n - 1: L = len(prof); return [(L * i // n, L * (i + 1) // n) for i in range(n)]  # 틈이 모자라면 똑같이 나눔
    edges = [0] + [(g[1] + g[2]) // 2 for g in cuts] + [len(prof)]
    return [(edges[i], edges[i + 1]) for i in range(n)]
rowp = [sum(1 for x in range(W) if px[x, y]) for y in range(H)]
rows = bands([1 if v > 2 else 0 for v in rowp], R)
sheet = Image.new('RGBA', (CELL * Cn, CELL * R), (0, 0, 0, 0))
for r, (y0, y1) in enumerate(rows):
    colp = [sum(1 for y in range(y0, y1) if px[x, y]) for x in range(W)]
    cols = list(zip([0] + CUTS, CUTS + [W])) if CUTS else bands([1 if v > 2 else 0 for v in colp], Cn)
    crops = []
    for (x0, x1) in cols:
        box = a.crop((x0, y0, x1, y1)).getbbox()
        crops.append(im.crop((x0 + box[0], y0 + box[1], x0 + box[2], y0 + box[3])) if box else None)
    mw = max(c.width for c in crops if c); mh = max(c.height for c in crops if c)
    s = (CELL * 0.94) / max(mw, mh)
    for c, cimg in enumerate(crops):
        if not cimg: continue
        t = cimg.resize((max(1, round(cimg.width * s)), max(1, round(cimg.height * s))), Image.LANCZOS)
        sheet.alpha_composite(t, (c * CELL + (CELL - t.width) // 2, r * CELL + CELL - t.height - round(CELL * 0.03)))
    print('줄', r + 1, '칸 폭', [x1 - x0 for x0, x1 in cols])
sheet.save(out, 'WEBP', lossless=True); print('✅', out, sheet.size)
