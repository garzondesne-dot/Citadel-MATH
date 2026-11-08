# 💫 상태이상 오버레이 굽기 (2026-11-08 · 선생님 「A로 진행」)
#   python3 tools/pfx/status_bake.py [assets/art/status-v1.webp] [--png 확인.png]
#   칸 80×80 = 용사 칸 80×64 + 머리 위 16px (아래를 용사 칸 아래에 맞춤) · 6프레임(열) × 8종(줄) → 480×640 무손실 webp (배치표 status)
#   줄: 0 기절 stun · 1 빙결 freeze · 2 속박 bind · 3 화상 burn · 4 독 poison · 5 감전 shock · 6 혼란 confuse · 7 수면 sleep
#   자리(80×80 기준): 머리 위 y≈0~18 · 몸통 y≈36~66 · 발밑 y≈68~79 · 가운데 x≈38
import math, random, sys
from PIL import Image, ImageDraw

W, H, F = 80, 80, 6
TOP = 16  # 몸통 · 발밑 그림은 80×64 로 그려 y=16 에 붙임
KINDS = ['stun', 'freeze', 'bind', 'burn', 'poison', 'shock', 'confuse', 'sleep']
OL = (26, 18, 40, 255)  # 외곽선 #1a1228


def px(d, x, y, c):
    if 0 <= x < W and 0 <= y < H: d.point((int(x), int(y)), fill=c)


def blob(d, pts, c):  # 외곽선 1px 두른 점 묶음
    for x, y in pts:
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)): px(d, x + dx, y + dy, OL)
    for x, y in pts: px(d, x, y, c)


def star(cx, cy, r=2):
    return [(cx + dx, cy + dy) for dx in range(-r, r + 1) for dy in range(-r, r + 1) if abs(dx) + abs(dy) <= r]


GLYPH = {  # 5×5 도트 글자
    '?': ['01110', '10001', '00110', '00100', '00100'],
    'Z': ['11111', '00010', '00100', '01000', '11111'],
}


def glyph(ch, x, y, s=1):
    return [(x + i * s + a, y + j * s + b) for j, row in enumerate(GLYPH[ch]) for i, v in enumerate(row) if v == '1' for a in range(s) for b in range(s)]


def frame(kind, f):
    full = Image.new('RGBA', (W, H), (0, 0, 0, 0)); body = kind in ('freeze', 'bind', 'burn', 'shock')
    im = Image.new('RGBA', (W, 64), (0, 0, 0, 0)) if body else full; d = ImageDraw.Draw(im); t = f / F
    if kind == 'stun':  # 머리 위 별 3개가 타원으로 빙글
        for k in range(3):
            a = 2 * math.pi * (t + k / 3); x, y = 38 + 14 * math.cos(a), 11 + 4 * math.sin(a)
            blob(d, star(round(x), round(y), 3 if math.sin(a) > 0 else 2), (255, 226, 92, 255) if k != 1 else (255, 250, 200, 255))
    elif kind == 'freeze':  # 얼음 덩어리가 몸 아래 2/3 를 덮음 + 반짝
        ice = [(x, y) for y in range(28, 63) for x in range(24, 57) if abs(x - 40) <= 14 - max(0, 34 - y) // 3]
        blob(d, ice, (150, 215, 255, 110))
        for y in range(30, 62, 7): [px(d, x, y + (x % 3 == 0), (225, 245, 255, 210)) for x in range(27, 54, 2)]
        sx, sy = [(30, 33), (49, 41), (36, 55), (46, 30), (28, 48), (51, 56)][f]
        blob(d, [(sx, sy), (sx - 1, sy), (sx + 1, sy), (sx, sy - 1), (sx, sy + 1)], (255, 255, 255, 255))
    elif kind == 'bind':  # 몸통을 감는 사슬 두 줄 (고리가 흐름)
        for row, y0 in enumerate((34, 44)):
            for i in range(9):
                x = 22 + i * 4 + (f + row * 2) % 4; y = y0 + round(2 * math.sin((x - 22) / 6))
                c = (170, 170, 190, 255) if (i + row) % 2 else (120, 120, 145, 255)
                blob(d, [(x, y), (x + 1, y), (x, y + 1), (x + 1, y + 1)], c)
    elif kind == 'burn':  # 발밑 불꽃 5개가 깜빡
        rnd = random.Random(f)
        for i, x in enumerate(range(26, 56, 7)):
            h = 5 + rnd.randint(0, 5)
            fl = [(x + dx, 63 - dy) for dy in range(h) for dx in range(-2, 3) if abs(dx) <= 2 - dy * 2 // max(h, 1)]
            blob(d, fl, (255, 120, 40, 255))
            blob(d, [(x, 63 - dy) for dy in range(max(1, h - 3))], (255, 220, 90, 255))
    elif kind == 'poison':  # 머리 위 보라 거품이 올라감
        for k in range(3):
            p = (t + k / 3) % 1; x = 30 + k * 8 + round(2 * math.sin(p * 6)); y = 20 - round(p * 16); r = 1 + (k % 2) + (p > .5)
            blob(d, [(x + dx, y + dy) for dx in range(-r, r + 1) for dy in range(-r, r + 1) if dx * dx + dy * dy <= r * r], (170, 90, 220, 230))
            px(d, x - r // 2, y - r // 2, (235, 200, 255, 255))
    elif kind == 'shock':  # 몸 둘레 번개 (프레임마다 다른 모양 · 홀수 프레임은 약하게)
        rnd = random.Random(100 + f)
        for _ in range(3 if f % 2 == 0 else 1):
            x, y = rnd.choice([(22, 26), (58, 28), (24, 50), (56, 48), (40, 20)]); pts = []
            for _ in range(7):
                pts.append((x, y)); x += rnd.choice((-2, -1, 1, 2)); y += rnd.choice((1, 2))
                pts.append((x, y))
            blob(d, pts, (255, 250, 140, 255))
    elif kind == 'confuse':  # 머리 위 물음표 둘이 통통
        for k, x0 in enumerate((24, 42)):
            y = 1 + round(3 * abs(math.sin(math.pi * (t + k / 2))))
            blob(d, glyph('?', x0, y, 2), (255, 255, 255, 255))
    elif kind == 'sleep':  # Z 세 개가 오른쪽 위로 올라가며 커짐
        for k in range(3):
            p = (t + k / 3) % 1; s = 1 + (p > .4)
            blob(d, glyph('Z', 46 + round(p * 16), 16 - round(p * 15), s), (200, 225, 255, 255))
    if body: full.alpha_composite(im, (0, TOP))
    return full


def main():
    out = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith('--') else 'assets/art/status-v1.webp'
    sheet = Image.new('RGBA', (W * F, H * len(KINDS)), (0, 0, 0, 0))
    for r, k in enumerate(KINDS):
        for c in range(F): sheet.alpha_composite(frame(k, c), (c * W, r * H))
    sheet.save(out, lossless=True) if out.endswith('.webp') else sheet.save(out)
    print(f'✅ {out} ({sheet.width}×{sheet.height} · 칸 {W}×{H} · {F}프레임 × {len(KINDS)}종: {" · ".join(KINDS)})')
    if '--png' in sys.argv:
        p = sys.argv[sys.argv.index('--png') + 1]; bg = Image.new('RGBA', sheet.size, (40, 40, 60, 255)); bg.alpha_composite(sheet)
        bg.resize((sheet.width * 2, sheet.height * 2), Image.NEAREST).save(p); print(f'  확인 그림 {p}')


if __name__ == '__main__':
    main()
