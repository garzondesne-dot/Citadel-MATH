# ⚔ #74-2 근접 Ⅲ · Ⅳ 다시 그리기 (2026-11-11 HERO-ATTR 3-3): 코드로 그리는 도트 띠 (안티앨리어스 없음 · 흰 심 + 하늘빛 빛 두 겹)
#   python3 -I tools/pfx/melee_gen.py <이름> <출력.webp>  → 마지막 줄 = manifest fx2.fx 한 칸 (JSON)
#   이름: slash (삼연 참격 · 가로지르기 세 줄 → 한꺼번에 벌어짐) · twin (쌍월 참 · 지나감 → 멈춤 → 늦게 터지는 초승달 X)
import sys, json, math
from PIL import Image, ImageDraw
name, out = sys.argv[1], sys.argv[2]
CORE, MID, GLOW, SPARK = (255, 255, 255, 255), (190, 228, 255, 255), (96, 168, 255, 200), (255, 246, 200, 255)

def line(d, a, b, w, col):
    d.line([a, b], fill=col, width=w)

def slash_line(d, a, b, t):  # t = 0~1 그어진 정도 · 굵기 세 겹
    x = a[0] + (b[0] - a[0]) * t; y = a[1] + (b[1] - a[1]) * t
    line(d, a, (x, y), 9, GLOW); line(d, a, (x, y), 5, MID); line(d, a, (x, y), 3, CORE)

def sparks(d, cx, cy, r, k, n=8, col=SPARK):
    for i in range(n):
        ang = i * 2 * math.pi / n + k * 0.3
        x, y = cx + math.cos(ang) * r, cy + math.sin(ang) * r * 0.6
        d.rectangle([x - 1, y - 1, x + 1, y + 1], fill=col)

def crescent(d, cx, cy, R, ang, open_, col_outer, col_inner, w):
    # 큰 원호(초승달) 한 개: 중심 cx,cy · 반지름 R · 방향 ang(도) · 열림 각 open_
    box = [cx - R, cy - R, cx + R, cy + R]
    d.arc(box, ang - open_ / 2, ang + open_ / 2, fill=col_outer, width=w + 4)
    d.arc(box, ang - open_ / 2, ang + open_ / 2, fill=col_inner, width=w)
    d.arc(box, ang - open_ / 2 + 6, ang + open_ / 2 - 6, fill=CORE, width=max(1, w // 2))

frames = []
if name == 'slash':
    W, H, N = 220, 110, 16
    L = [((14, 30), (206, 62)), ((206, 30), (14, 80)), ((14, 52), (206, 84))]  # 좌→우 · 우→좌 · 좌→우
    for f in range(N):
        im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
        if f < 9:
            for k, (a, b) in enumerate(L):
                t = min(1, max(0, (f - k * 3 + 1) / 3))
                if t > 0: slash_line(d, a, b, t)
        else:  # 세 줄이 한꺼번에 벌어지며 튐
            g = f - 9; off = g * 3; fade = max(0, 255 - g * 36)
            for k, (a, b) in enumerate(L):
                dy = (k - 1) * off
                col = (255, 255, 255, fade); gl = (96, 168, 255, max(0, fade - 60))
                d.line([(a[0], a[1] + dy), (b[0], b[1] + dy)], fill=gl, width=6); d.line([(a[0], a[1] + dy), (b[0], b[1] + dy)], fill=col, width=2)
            sparks(d, W / 2, H / 2, 20 + g * 9, g, 10, (255, 246, 200, fade))
        frames.append(im)
    meta = {'w': W, 'h': H, 'n': N, 'fps': 20, 'px': 14, 'py': 55, 'pk': 9, 'hit': [0.12, 0.06, 0.16, 2], 'mm': 'cross'}
elif name == 'twin':
    W, H, N = 240, 150, 18
    for f in range(N):
        im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
        if f < 4:  # 한 번에 지나감 (가는 빛줄기)
            x = 10 + f * 60; line(d, (10, 75), (x, 75), 5, GLOW); line(d, (10, 75), (x, 75), 2, CORE)
        elif f < 7:  # 멈춤 (칼을 거둠) · 남은 선만 희미하게
            a = 160 - (f - 4) * 40; d.line([(10, 75), (230, 75)], fill=(190, 228, 255, a), width=1)
        else:  # 늦게 터지는 큰 초승달 두 개가 X 로
            g = f - 7; R = 24 + g * 7; fade = 255 if g < 6 else max(0, 255 - (g - 5) * 50)
            o = (96, 168, 255, max(0, fade - 50)); i_ = (190, 228, 255, fade)
            off = R * 0.55
            crescent(d, 120 - off, 75, R, 0, 130, o, i_, 6)    # 오른쪽으로 벌어진 초승달
            crescent(d, 120 + off, 75, R, 180, 130, o, i_, 6)  # 왼쪽으로 벌어진 초승달 → 둘이 X 로 엇갈림
            if g < 4: d.rectangle([118 - g, 73 - g, 122 + g, 77 + g], fill=(255, 255, 255, 255))
            sparks(d, 120, 75, R + 6, g, 12, (255, 246, 200, fade))
        frames.append(im)
    meta = {'w': W, 'h': H, 'n': N, 'fps': 20, 'px': 10, 'py': 75, 'pk': 9, 'hit': [0.4, 0.15, 0.3, 3], 'mm': 'cross-wide'}
else:
    raise SystemExit('이름 = slash | twin')
sheet = Image.new('RGBA', (meta['w'] * meta['n'], meta['h']), (0, 0, 0, 0))
for k, im in enumerate(frames): sheet.alpha_composite(im, (k * meta['w'], 0))
sheet.save(out, 'WEBP', lossless=True)
print(json.dumps(meta))
