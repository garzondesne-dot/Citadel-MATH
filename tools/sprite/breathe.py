# 대기 숨쉬기 굽기 (2026-11-02): 정리된 용사 시트의 대기 줄(0번 줄)을 「몸이 먼저 · 머리가 늦게」 4프레임으로 바꾼다
#   대기 첫 프레임 한 장을 머리 · 몸통 · 다리 세 겹으로 잘라 정수 1px 씩 내린다 (그림 AI 가 그린 대기 프레임의 떨림 없음)
#   목 = 머리 아래에서 가장 좁은 줄 · 허리 = 칼 · 손 아래 (몸통 겹에 무기가 통째로 들어가게)
#   프레임: 0 기본 · 1 몸 ↓ · 2 몸 ↓ + 머리 ↓ · 3 머리 ↓ (몸이 먼저 올라옴)
# 사용: python3 tools/sprite/breathe.py <시트.png> <출력 폴더> [이름] [칸 가로=80] [칸 세로=64]
#   NECK=41 WAIST=51 로 직접 줄 수도 있다 (자동 측정이 어긋날 때)
import sys, os, json
import numpy as np
from PIL import Image

src, out = sys.argv[1], sys.argv[2]
name = sys.argv[3] if len(sys.argv) > 3 else 'hero'
CW, CH = (int(sys.argv[i]) if len(sys.argv) > i else d for i, d in ((4, 80), (5, 64)))
os.makedirs(out, exist_ok=True)
sheet = np.asarray(Image.open(src).convert('RGBA')).copy()
base = sheet[0:CH, 0:CW].copy()
al = base[..., 3] > 0
ys = np.where(al.any(1))[0]; top, bot = ys.min(), ys.max(); H = bot - top + 1
width = np.array([(np.ptp(np.where(al[y])[0]) + 1) if al[y].any() else 0 for y in range(CH)])

# 목: 키의 35~70% 구간에서 가장 좁은 줄 (같으면 아래쪽) — 그 줄부터 몸통
lo, hi = top + int(H * 0.35), top + int(H * 0.70)
neck = int(os.environ.get('NECK') or max(range(lo, hi + 1), key=lambda y: (-width[y], y)))
# 허리: 목 아래에서 가로로 가장 넓은 줄(팔 · 칼)이 끝나는 곳 + 1 — 단, 발에서 6줄은 남긴다
wide = width[neck:bot + 1]; wmax = wide.max()
arm_rows = [neck + i for i, w in enumerate(wide) if w >= wmax * 0.85]
waist = int(os.environ.get('WAIST') or min(max(arm_rows) + 2, bot - 5))

def shift(a, y0, y1, d=1):  # [y0, y1) 줄을 d 픽셀 아래로 (아래 겹 위에 덮어 그림)
    o = a.copy(); band = a[y0:y1].copy(); o[y0:y1][band[..., 3] > 0] = 0
    dst = o[y0 + d:y1 + d]; m = band[: dst.shape[0], ..., 3] > 0; dst[m] = band[: dst.shape[0]][m]
    return o

def frame(k):
    a = base
    body = k in (1, 2); head = k in (2, 3)
    if body: a = shift(a, neck, waist)
    if head: a = shift(a, 0, neck)
    return a

for k in range(4):
    sheet[0:CH, k * CW:(k + 1) * CW] = frame(k)
img = Image.fromarray(sheet, 'RGBA')
img.save(os.path.join(out, f'{name}.webp'), lossless=True); img.save(os.path.join(out, f'{name}.png'))
bg = (24, 30, 48, 255); seq = []
for k in range(4):
    c = Image.new('RGBA', (CW, CH), bg); c.alpha_composite(Image.fromarray(sheet[0:CH, k * CW:(k + 1) * CW]))
    seq.append(c.resize((CW * 4, CH * 4), Image.NEAREST).convert('RGB'))
seq[0].save(os.path.join(out, f'{name}-idle.gif'), save_all=True, append_images=seq[1:], duration=[380, 260, 380, 260], loop=0)
meta = {'neck': neck, 'waist': waist, 'top': int(top), 'feet': int(bot)}
json.dump(meta, open(os.path.join(out, f'{name}-breath.json'), 'w'))
print(f'{name}: 목 {neck}행 · 허리 {waist}행 · 키 {H}px → 대기 4프레임 (기본 · 몸↓ · 몸+머리↓ · 머리↓)')
