# 🏫 학교판 로고 (2026-11-13 선생님 「학교판은 모두의던전 로고 변경」): 마젠타 배경 그림 → 투명 · 가장자리 분홍 번짐 빼기 · 여백 자름
#   → 정식 로고(menu-logo-v1 · 960×461)와 같은 틀 크기 안 가운데 → assets/art/brand-school-logo-v1.webp
#   python3 tools/school/logo.py <원본.png>   (원본은 드라이브 · 저장소에 넣지 않음)
import sys, os
from PIL import Image
import numpy as np
src = sys.argv[1]
ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
OUT = os.path.join(ROOT, 'assets/art/brand-school-logo-v1.webp')
im = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
r, g, b = im[..., 0], im[..., 1], im[..., 2]
# 마젠타 정도 = r · b 가 g 보다 얼마나 큰가 (배경 ≈ (250, 10, 250))
mag = np.minimum(r, b) - g
d0, d1 = 120.0, 215.0            # mag ≥ d1 = 완전 투명 · ≤ d0 = 불투명
alpha = np.clip((d1 - mag) / (d1 - d0), 0, 1)
# 번짐 빼기: 남은 분홍 기운(min(r,b) > g)을 g 쪽으로 눌러 줌 (반투명일수록 세게)
spill = np.clip(np.minimum(r, b) - np.maximum(g, 0), 0, None)
k = np.clip((1 - alpha) * 1.0 + (mag > 40) * 0.6, 0, 1)
r2 = r - spill * k * (r >= b) * 0.0 - np.where(r > g, (r - g) * k * 0.9, 0) * (b > g + 30)
b2 = b - np.where(b > g, (b - g) * k * 0.9, 0) * (r > g + 30)
out = np.dstack([np.clip(r2, 0, 255), g, np.clip(b2, 0, 255), alpha * 255]).astype(np.uint8)
img = Image.fromarray(out, 'RGBA')
# 거의 투명한 점은 완전 투명으로 (가장자리 먼지)
a = np.asarray(img)[..., 3]
ys, xs = np.where(a > 24)
img = img.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
W, H = 960, 461
pad = 12
s = min((W - 2 * pad) / img.width, (H - 2 * pad) / img.height)
img = img.resize((round(img.width * s), round(img.height * s)), Image.LANCZOS)
can = Image.new('RGBA', (W, H), (0, 0, 0, 0))
can.paste(img, ((W - img.width) // 2, (H - img.height) // 2), img)
can.save(OUT, 'WEBP', quality=92, method=6)
print('✔', os.path.relpath(OUT, ROOT), can.size, os.path.getsize(OUT), 'bytes')
