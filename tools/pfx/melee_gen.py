# ⚔ #74-2 근접 Ⅲ · Ⅳ 다시 그리기 (2026-11-11 HERO-ATTR 3-3): 코드로 그리는 도트 띠 (안티앨리어스 없음 · 흰 심 + 하늘빛 빛 두 겹)
#   python3 -I tools/pfx/melee_gen.py <이름> <출력.webp>  → 마지막 줄 = manifest fx2.fx 한 칸 (JSON)
#   이름: slash (삼연 참격 · 가로지르기) · twin (쌍월 참 · 가로지르기 + 넓게) · hammer (망치 내려치기 · 내려찍기) · quake (대지 분쇄 · 내려찍기 + 넓게) · spin (회전 베기 · 넓게) · reap (사신의 낫 · 넓게)
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
elif name in ('hammer', 'quake'):  # 🔨 망치가 위에서 떨어짐 → 발밑 금 · 돌 조각 (대지 분쇄 = 금이 좌우 끝까지 + 돌기둥 3개)
    big = name == 'quake'; W, H, N = (260 if big else 150), 230, (22 if big else 16)
    ST, STD, HOT, IRON, WOOD = (214, 170, 110, 255), (120, 84, 50, 255), (255, 214, 140, 255), (150, 156, 170, 255), (122, 80, 40, 255)
    cx, floor = W // 2, H - 14
    for f in range(N):
        im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
        if f < 7:  # 떨어짐
            y = 10 + (floor - 46) * (f / 6) ** 2
            d.rectangle([cx - 4, y - 50, cx + 4, y], fill=WOOD); d.rectangle([cx - 26, y, cx + 26, y + 30], fill=IRON); d.rectangle([cx - 26, y, cx + 26, y + 4], fill=(210, 214, 226, 255))
            for k in range(3): d.line([(cx - 20 + k * 20, y - 30 - k * 8), (cx - 20 + k * 20, y - 60 - k * 8)], fill=(255, 255, 255, 120), width=2)
        else:
            g = f - 7; fade = max(0, 255 - max(0, g - 6) * 40)
            if g < 4:  # 맞는 순간 빛 고리
                r = 14 + g * 14; d.ellipse([cx - r, floor - r * 0.35, cx + r, floor + r * 0.35], outline=(255, 240, 190, 255 - g * 50), width=4)
            if g < 3: d.rectangle([cx - 26, floor - 30, cx + 26, floor], fill=IRON)
            reach = min(1, g / 5) * ((W // 2 - 6) if big else 46)  # 금
            for sgn in (-1, 1):
                pts = [(cx, floor)]; x = cx
                while abs(x - cx) < reach: x += sgn * 9; pts.append((x, floor - (3 if (abs(x - cx) // 9) % 2 else -2)))
                d.line(pts, fill=(60, 30, 10, fade), width=3); d.line(pts, fill=(255, 200, 120, max(0, fade - 80)), width=1)
            for k in range(6):  # 돌 조각
                ang = math.pi * (0.15 + k * 0.14); r = 10 + g * 7
                x, y = cx + math.cos(ang) * r * (1 if k % 2 else -1), floor - math.sin(ang) * r + g * g * 0.8
                d.rectangle([x - 3, y - 3, x + 3, y + 3], fill=(ST[0], ST[1], ST[2], fade)); d.rectangle([x - 3, y + 1, x + 3, y + 3], fill=(STD[0], STD[1], STD[2], fade))
            if big:  # 돌기둥 3개가 차례로 솟음
                for k, px in enumerate([cx - 80, cx, cx + 80]):
                    t = g - 5 - k * 2
                    if t < 0: continue
                    hgt = min(70, t * 18) * (1 if g < 13 else max(0, 1 - (g - 13) * 0.25))
                    if hgt <= 0: continue
                    d.polygon([(px - 14, floor), (px - 8, floor - hgt), (px + 8, floor - hgt - 6), (px + 14, floor)], fill=ST); d.line([(px - 8, floor - hgt), (px + 8, floor - hgt - 6)], fill=HOT, width=2)
                    d.polygon([(px + 2, floor), (px + 8, floor - hgt - 6), (px + 14, floor)], fill=STD)
        frames.append(im)
    meta = {'w': W, 'h': H, 'n': N, 'fps': 20, 'px': cx, 'py': floor, 'pk': 8, 'hit': [0.33, 0.14, 0.3 if big else 0.2, 3 if big else 2], 'mm': 'drop-wide' if big else 'drop'}
elif name in ('spin', 'reap'):  # 🌪 회전 베기 = 둥근 궤적 두 바퀴가 넓어짐 → 바깥 고리가 터짐 · 사신의 낫 = 다섯 방향 낫 궤적 → 큰 낫 한 바퀴
    big = name == 'reap'; W, H, N = 240, 170, (22 if big else 16)
    cx, cy = W // 2, H // 2
    C1, C2 = ((200, 120, 255, 255), (90, 40, 140, 220)) if big else ((180, 255, 220, 255), (60, 170, 150, 200))
    for f in range(N):
        im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
        if not big:
            if f < 11:
                for k in range(2):
                    r = 26 + f * 7 + k * 14; a0 = f * 40 + k * 180
                    box = [cx - r, cy - r * 0.55, cx + r, cy + r * 0.55]
                    d.arc(box, a0, a0 + 230, fill=C2, width=7); d.arc(box, a0, a0 + 230, fill=C1, width=4); d.arc(box, a0 + 20, a0 + 210, fill=CORE, width=2)
            else:
                g = f - 11; fade = max(0, 255 - g * 50); r = 100 + g * 6
                d.ellipse([cx - r, cy - r * 0.55, cx + r, cy + r * 0.55], outline=(C1[0], C1[1], C1[2], fade), width=3)
                sparks(d, cx, cy, r, g, 14, (255, 255, 255, fade))
        else:
            if f < 13:
                for k in range(5):  # 다섯 방향 낫 궤적이 차례로
                    t = f - k * 2
                    if t < 0 or t > 6: continue
                    ang = 90 + k * 72; r = 46; ox, oy = cx + math.cos(math.radians(ang)) * 34, cy - math.sin(math.radians(ang)) * 22
                    fade = 255 if t < 4 else 255 - (t - 3) * 70
                    box = [ox - r, oy - r * 0.6, ox + r, oy + r * 0.6]; a0 = -ang - 40
                    d.arc(box, a0, a0 + 110 * min(1, (t + 1) / 3), fill=(C2[0], C2[1], C2[2], max(0, fade - 40)), width=8); d.arc(box, a0, a0 + 110 * min(1, (t + 1) / 3), fill=(C1[0], C1[1], C1[2], fade), width=4); d.arc(box, a0 + 6, a0 + 100 * min(1, (t + 1) / 3), fill=(255, 255, 255, fade), width=2)
            else:  # 큰 낫 하나가 크게 한 바퀴
                g = f - 13; r = 110; sweep = min(360, g * 60); fade = 255 if g < 6 else max(0, 255 - (g - 5) * 70)
                box = [cx - r, cy - r * 0.62, cx + r, cy + r * 0.62]; a0 = 200
                d.arc(box, a0, a0 + sweep, fill=(C2[0], C2[1], C2[2], max(0, fade - 40)), width=10); d.arc(box, a0, a0 + sweep, fill=(C1[0], C1[1], C1[2], fade), width=5); d.arc(box, a0 + 4, a0 + max(0, sweep - 8), fill=(255, 255, 255, fade), width=2)
                if g >= 6: sparks(d, cx, cy, r, g, 16, (230, 200, 255, fade))
        frames.append(im)
    meta = {'w': W, 'h': H, 'n': N, 'fps': 20, 'px': cx, 'py': cy, 'pk': 8 if big else 6, 'hit': [0.3, 0.12, 0.24 if big else 0.18, 2], 'mm': 'wide'}
else:
    raise SystemExit('이름 = slash | twin | hammer | quake | spin | reap')
sheet = Image.new('RGBA', (meta['w'] * meta['n'], meta['h']), (0, 0, 0, 0))
for k, im in enumerate(frames): sheet.alpha_composite(im, (k * meta['w'], 0))
sheet.save(out, 'WEBP', lossless=True)
print(json.dumps(meta))
