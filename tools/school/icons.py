# 🖼 앱 아이콘 (2026-11-13 밤 선생님 「로고를 전부 모두의 던전 공통수학2에서 모두의 던전으로 교체해」)
#   첫 장면 그림(brand-bg-v1 · 글씨 없음)을 정사각으로 자르고 위에 새 로고(brand-school-logo-v1 · 「모두의 던전」 + 방패 · 월계수)
#   → icons/icon-192-v2.png · icon-512-v2.png · icon-maskable-512-v2.png(로고를 안쪽 80% 에) · apple-touch-icon-v2.png(180)
#   python3 tools/school/icons.py [출력 폴더]   (기본 = icons/)
import sys, os
from PIL import Image
ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'icons')
bg = Image.open(os.path.join(ROOT, 'assets/art/brand-bg-v1.webp')).convert('RGBA')
lg = Image.open(os.path.join(ROOT, 'assets/art/brand-school-logo-v1.webp')).convert('RGBA'); lg = lg.crop(lg.getbbox())
def make(size, safe):
    W = bg.width; y0 = 150; sq = bg.crop((0, y0, W, y0 + W)).resize((size, size), Image.LANCZOS)
    m = size * (1 - safe) / 2; lw = int((size - 2 * m) * 0.92); lh = int(lg.height * lw / lg.width)
    l2 = lg.resize((lw, lh), Image.LANCZOS); sq.alpha_composite(l2, (int((size - lw) / 2), int(m + size * 0.03)))
    return sq.convert('RGB')
for name, size, safe in [('icon-192-v2.png', 192, 1.0), ('icon-512-v2.png', 512, 1.0), ('icon-maskable-512-v2.png', 512, 0.8), ('apple-touch-icon-v2.png', 180, 1.0)]:
    make(size, safe).save(os.path.join(OUT, name), optimize=True); print('✔', name)
