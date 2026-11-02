# v2 도트 시트 정리기 (2026-11-02): 그림 AI 가 준 「마젠타 배경 · 8배 확대 · 격자 안 맞는」 시트 → 게임용 원본 크기 시트
#   1) 마젠타 배경 · 분홍 번짐 지우기  2) 줄(동작) · 칸(프레임) 자동 찾기  3) 대기 프레임 키 = TARGET 픽셀이 되게 같은 배율로 줄이기
#   4) 공통 32색 팔레트로 맞추기  5) 발 기준선 · 몸 중심(아래 40%)으로 정렬해 CW×CH 칸에 넣기  6) 시트(webp 무손실) + 움직임 GIF
# 사용: python3 tools/sprite/sheet.py <원본.png> <출력 폴더> [이름] [대기 키=50] [칸 가로=80] [칸 세로=64]
#   예) 용사(64급): 50 · 80 · 64 / 몬스터(96급): 76 · 112 · 96 / 보스(192급): 160 · 224 · 192
import sys, os
import numpy as np
from PIL import Image

src, out = sys.argv[1], sys.argv[2]
name = sys.argv[3] if len(sys.argv) > 3 else 'sprite'
TARGET, CW, CH = (int(sys.argv[i]) if len(sys.argv) > i else d for i, d in ((4, 50), (5, 80), (6, 64)))
os.makedirs(out, exist_ok=True)

a = np.asarray(Image.open(src).convert('RGB')).astype(int)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
bg = ((r > 170) & (b > 170) & (g < 110) & (abs(r - b) < 90)) | ((r > 150) & (b > 140) & (g < 130) & (abs(r - b) < 110))
rgba = np.dstack([a, (~bg) * 255]).astype(np.uint8)
fg = ~bg

def spans(mask, gap):
    out, s = [], None
    for i, v in enumerate(mask):
        if v and s is None: s = i
        if not v and s is not None: out.append((s, i)); s = None
    if s is not None: out.append((s, len(mask)))
    m = []
    for x in out:
        if m and x[0] - m[-1][1] < gap: m[-1] = (m[-1][0], x[1])
        else: m.append(x)
    return m

rows = spans(fg.sum(1) > 2, 10)
# 줄이 서로 붙어 자동으로 못 나눌 때: ROWS="0,360,725,…" (줄 경계 y) 로 직접 준다
if os.environ.get('ROWS'):
    ys_ = [int(v) for v in os.environ['ROWS'].split(',')]
    rows = [(ys_[i], ys_[i + 1]) for i in range(len(ys_) - 1)]
frames = []  # (줄 번호, 배열)
for ri, (y0, y1) in enumerate(rows):
    for (x0, x1) in spans(fg[y0:y1].sum(0) > 1, 14):
        c = rgba[y0:y1, x0:x1]; ys, xs = np.where(c[..., 3] > 0)
        if len(ys) < 50: continue
        frames.append((ri, c[ys.min():ys.max() + 1, xs.min():xs.max() + 1]))
# COMP=1: 줄이 겹칠 때(칼 · 이펙트가 윗줄로 삐져나옴) — 덩어리(연결 요소)로 프레임을 찾고 발 높이로 줄을 나눈다
if os.environ.get('COMP'):
    from collections import deque
    k = 4; small_m = fg[::k, ::k].copy()
    pad = np.zeros_like(small_m)  # 3칸 팽창 → 칼끝 · 반짝이를 몸과 잇는다
    for dy in range(-1, 2):
        for dx in range(-3, 4): pad |= np.roll(np.roll(small_m, dy, 0), dx, 1)
    lab = np.zeros(pad.shape, int); n = 0; boxes = []
    for y0_ in range(pad.shape[0]):
        for x0_ in range(pad.shape[1]):
            if pad[y0_, x0_] and not lab[y0_, x0_]:
                n += 1; q = deque([(y0_, x0_)]); lab[y0_, x0_] = n; bb = [y0_, x0_, y0_, x0_, 0]
                while q:
                    y_, x_ = q.popleft(); bb[0] = min(bb[0], y_); bb[1] = min(bb[1], x_); bb[2] = max(bb[2], y_); bb[3] = max(bb[3], x_); bb[4] += 1
                    for ny, nx in ((y_ + 1, x_), (y_ - 1, x_), (y_, x_ + 1), (y_, x_ - 1)):
                        if 0 <= ny < pad.shape[0] and 0 <= nx < pad.shape[1] and pad[ny, nx] and not lab[ny, nx]: lab[ny, nx] = n; q.append((ny, nx))
                boxes.append((n, bb))
    big = [(i, bb) for i, bb in boxes if bb[4] > 300]
    hmed = np.median([bb[2] - bb[0] for _, bb in big])
    # 위아래 두 프레임이 이펙트로 붙어 버린 덩어리는 가운데에서 가장 얇은 줄로 나눈다
    split = []
    for i, bb in big:
        sub = (lab[bb[0]:bb[2] + 1, bb[1]:bb[3] + 1] == i).sum(1); lo, hi = int(len(sub) * 0.3), int(len(sub) * 0.7)
        if bb[2] - bb[0] > hmed * 1.2 and hi > lo and sub[lo:hi].min() <= 6:
            cut = bb[0] + lo + int(np.argmin(sub[lo:hi]))
            n += 1; part = (lab == i); part[:cut + 1] = False; lab[part] = n
            split += [(i, [bb[0], bb[1], cut, bb[3], 0]), (n, [cut + 1, bb[1], bb[2], bb[3], 0])]
        else: split.append((i, bb))
    big = split
    big.sort(key=lambda t: t[1][2]); groups = []
    for i, bb in big:
        if groups and abs(bb[2] - groups[-1][-1][1][2]) < hmed * 0.45: groups[-1].append((i, bb))
        else: groups.append([(i, bb)])
    frames = []
    for ri, gr in enumerate(groups):
        for i, bb in sorted(gr, key=lambda t: t[1][1]):
            m = (lab == i).repeat(k, 0).repeat(k, 1)[:fg.shape[0], :fg.shape[1]] & fg
            ys, xs = np.where(m); c = rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1].copy()
            c[..., 3] = np.where(m[ys.min():ys.max() + 1, xs.min():xs.max() + 1], c[..., 3], 0)
            frames.append((ri, c))
    rows = groups
idle_h = np.median([f.shape[0] for ri, f in frames if ri == 0])
S = TARGET / idle_h

def shrink(c):
    im = Image.fromarray(c, 'RGBA'); w, h = im.size
    arr = np.asarray(im).astype(float); al = arr[..., 3:] / 255
    pre = Image.fromarray(np.dstack([arr[..., :3] * al, al * 255]).astype(np.uint8), 'RGBA').resize((max(1, round(w * S)), max(1, round(h * S))), Image.BOX)
    sm = np.asarray(pre).astype(float); A = sm[..., 3]; o = np.zeros_like(sm); m = A > 110
    o[m, :3] = np.clip(sm[m, :3] / (A[m, None] / 255), 0, 255); o[m, 3] = 255
    return o.astype(np.uint8)

small = [(ri, shrink(f)) for ri, f in frames]
px = np.concatenate([f[f[..., 3] > 0][:, :3] for _, f in small])
pal = Image.fromarray(px.reshape(1, -1, 3)).quantize(colors=32, method=Image.MEDIANCUT)
def quant(f):
    rgb = Image.fromarray(f[..., :3]).quantize(palette=pal, dither=Image.Dither.NONE).convert('RGB')
    return np.dstack([np.asarray(rgb), f[..., 3]])
small = [(ri, quant(f)) for ri, f in small]

counts = [sum(1 for ri, _ in small if ri == k) for k in range(len(rows))]
sheet = Image.new('RGBA', (CW * max(counts), CH * len(rows)), (0, 0, 0, 0))
col = [0] * len(rows); clipped = 0
for ri, f in small:
    al = f[..., 3] > 0; h, w = al.shape
    xs = np.where(al[int(h * 0.6):])[1]; cx = xs.mean() if len(xs) else w / 2
    ox, oy = int(round(CW * 0.375 - cx)), CH - 1 - h
    if ox < 0 or ox + w > CW or oy < 0: clipped += 1
    cell = Image.new('RGBA', (CW, CH), (0, 0, 0, 0)); cell.alpha_composite(Image.fromarray(f, 'RGBA').crop((max(0, -ox), max(0, -oy), w, h)), (max(0, ox), max(0, oy)))
    sheet.paste(cell, (col[ri] * CW, ri * CH)); col[ri] += 1
sheet.save(os.path.join(out, f'{name}.webp'), lossless=True)
sheet.save(os.path.join(out, f'{name}.png'))
seq = []
for ri, n in enumerate(counts):
    for j in range(n):
        im = Image.new('RGBA', (CW, CH), (24, 30, 48, 255)); im.alpha_composite(sheet.crop((j * CW, ri * CH, (j + 1) * CW, (ri + 1) * CH)))
        seq += [im.resize((CW * 4, CH * 4), Image.NEAREST).convert('P', palette=Image.ADAPTIVE)] * (2 if n == 1 else 1)
seq[0].save(os.path.join(out, f'{name}-anim.gif'), save_all=True, append_images=seq[1:], duration=170, loop=0)
print(f'{name}: 줄 {len(rows)} · 프레임 {counts} · 배율 {S:.3f} · 칸 {CW}×{CH} · 잘림 {clipped} · webp {os.path.getsize(os.path.join(out, name + ".webp"))} bytes')
