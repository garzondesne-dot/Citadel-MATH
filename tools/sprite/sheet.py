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
frames = []  # (줄 번호, 배열)
for ri, (y0, y1) in enumerate(rows):
    for (x0, x1) in spans(fg[y0:y1].sum(0) > 1, 14):
        c = rgba[y0:y1, x0:x1]; ys, xs = np.where(c[..., 3] > 0)
        if len(ys) < 50: continue
        frames.append((ri, c[ys.min():ys.max() + 1, xs.min():xs.max() + 1]))
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
