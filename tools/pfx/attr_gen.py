# 🌈 #74-3 새 속성 4개 × 4단계 = 근접 스킬 16개 (2026-11-11 HERO-ATTR 3-4 · 코드로 그리는 도트 띠 · 안티앨리어스 없음)
#   python3 -I tools/pfx/attr_gen.py <출력 폴더>  → <폴더>/fx-<id>-v1.webp 16장 + 마지막 줄 = manifest fx2.fx 칸들 (JSON)
#   ☀ 빛 (금 · 흰): radiant 빛 베기 · bulwark 방패 강타 · holysword 성검 낙하(내려찍기) · skylance 천상의 창(내려찍기 + 넓게)
#   🌑 어둠 (보라 · 검정 + 흰 선): shade 그림자 베기 · claw 어둠 손톱 · phantom 그림자 분신(가로지르기) · eclipse 월식 참(가로지르기 + 넓게)
#   ⚙ 기계 (주황 불꽃 · 회색 쇠 · 흰 증기): wrench 스패너 치기 · cog 톱니 던지기 · piston 증기 해머(넓게) · drill 드릴 돌파(가로지르기)
#   🌊 물 (청록 · 흰 거품): aqua 물 베기 · wave 파도 치기 · anchor 닻 내려찍기(내려찍기) · tsunami 해일 베기(넓게)
#   안전: 화면 전체 번쩍임 없음 · 어두워짐은 월식 참 처음 2칸(0.1초)만 · 반투명
import sys, os, json, math, random
from PIL import Image, ImageDraw
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
W8 = (255, 255, 255, 255)
PAL = {
    'sun': {'core': W8, 'mid': (255, 236, 150, 255), 'glow': (255, 196, 60, 210), 'spark': (255, 250, 210, 255)},
    'dark': {'core': W8, 'mid': (176, 120, 255, 255), 'glow': (70, 30, 120, 230), 'spark': (220, 190, 255, 255), 'ink': (24, 10, 40, 235)},
    'gear': {'core': (255, 250, 230, 255), 'mid': (255, 160, 60, 255), 'glow': (230, 90, 20, 220), 'spark': (255, 220, 120, 255), 'steel': (150, 156, 168, 255), 'steel2': (96, 102, 116, 255), 'steam': (236, 240, 246, 200)},
    'water': {'core': W8, 'mid': (120, 236, 228, 255), 'glow': (20, 150, 170, 220), 'spark': (220, 255, 252, 255), 'deep': (16, 96, 132, 230)},
}

def fa(c, a):  # 투명도 바꾸기
    return (c[0], c[1], c[2], max(0, min(255, int(a))))

def stroke(d, pts, P, w=3, a=255):  # 세 겹 선 (빛 · 가운데 · 흰 심)
    d.line(pts, fill=fa(P['glow'], a * 0.85), width=w + 6); d.line(pts, fill=fa(P['mid'], a), width=w + 2); d.line(pts, fill=fa(P['core'], a), width=max(1, w - 1))

def arc3(d, box, a0, a1, P, w=4, a=255):
    d.arc(box, a0, a1, fill=fa(P['glow'], a * 0.85), width=w + 6); d.arc(box, a0, a1, fill=fa(P['mid'], a), width=w + 2); d.arc(box, a0 + 3, a1 - 3, fill=fa(P['core'], a), width=max(1, w - 2))

def dots(d, cx, cy, r, k, n, col, sz=1, squash=0.6):
    for i in range(n):
        ang = i * 2 * math.pi / n + k * 0.35
        x, y = cx + math.cos(ang) * r, cy + math.sin(ang) * r * squash
        d.rectangle([x - sz, y - sz, x + sz, y + sz], fill=col)

def star4(d, cx, cy, r, col, w=1):  # 반짝 십자
    d.line([(cx - r, cy), (cx + r, cy)], fill=col, width=w); d.line([(cx, cy - r), (cx, cy + r)], fill=col, width=w)

def crest(t):  # 파도 꼴: 뒤는 완만 · 앞(오른쪽)은 가파름
    t = max(0.0, min(1.0, t)); return math.sin(math.pi * t ** 1.9) ** 1.2 if t < 0.97 else 0.0

def fadeat(g, keep, step):
    return 255 if g < keep else max(0, 255 - (g - keep + 1) * step)

def frames_of(W, H, N, fn):
    out = []
    for f in range(N):
        im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); fn(ImageDraw.Draw(im), f, im); out.append(im)
    return out

# ── 공통 Ⅰ 베기 꼴: 대각 궤적이 그어지고 → 남은 빛이 흩어짐 ─────────────
def basic_slash(P, extra=None):
    W, H, N = 130, 100, 10
    a, b = (14, 82), (116, 16)
    def fn(d, f, im):
        if f < 4:
            t = (f + 1) / 4; x = a[0] + (b[0] - a[0]) * t; y = a[1] + (b[1] - a[1]) * t; stroke(d, [a, (x, y)], P, 3)
        else:
            g = f - 4; al = fadeat(g, 2, 60)
            d.line([a, b], fill=fa(P['glow'], al * 0.7), width=8 - g); d.line([a, b], fill=fa(P['core'], al), width=2)
            dots(d, 65, 49, 12 + g * 7, g, 10, fa(P['spark'], al))
        if extra: extra(d, f)
    return frames_of(W, H, N, fn), {'w': W, 'h': H, 'n': N, 'fps': 18, 'px': 65, 'py': 50, 'pk': 3, 'hit': [0.1, 0.07, 0.16, 2]}

def gen(name):
    random.seed(name)
    # ☀ 빛 ─────────────────────────────────────────
    if name == 'radiant':
        P = PAL['sun']
        def ex(d, f):
            if 3 <= f <= 8: star4(d, 116 - (f - 3) * 4, 16 + (f - 3) * 3, 6, fa(P['spark'], 255 - (f - 3) * 40))
        return basic_slash(P, ex)
    if name == 'bulwark':  # 빛 방패로 밀침 → 십자 섬광
        P = PAL['sun']; W, H, N = 150, 120, 13; cx, cy = 80, 60
        def fn(d, f, im):
            if f < 5:  # 방패가 왼쪽에서 밀고 들어옴
                x = 20 + f * 14; sw, sh = 26, 34
                pts = [(x - sw / 2, cy - sh / 2), (x + sw / 2, cy - sh / 2), (x + sw / 2, cy + 4), (x, cy + sh / 2), (x - sw / 2, cy + 4)]
                d.polygon(pts, fill=fa(P['glow'], 200), outline=P['core']); d.line([(x, cy - sh / 2 + 4), (x, cy + sh / 2 - 6)], fill=P['core'], width=3); d.line([(x - 8, cy - 4), (x + 8, cy - 4)], fill=P['core'], width=3)
                for k in range(3): d.line([(x - sw / 2 - 6 - k * 8, cy - 10 + k * 10), (x - sw / 2 - 16 - k * 8, cy - 10 + k * 10)], fill=fa(P['mid'], 180), width=2)
            else:  # 십자 섬광 + 고리
                g = f - 5; al = fadeat(g, 3, 50); L = 14 + g * 9
                d.line([(cx - L, cy), (cx + L, cy)], fill=fa(P['glow'], al * 0.8), width=9); d.line([(cx, cy - L), (cx, cy + L)], fill=fa(P['glow'], al * 0.8), width=9)
                d.line([(cx - L, cy), (cx + L, cy)], fill=fa(P['core'], al), width=3); d.line([(cx, cy - L), (cx, cy + L)], fill=fa(P['core'], al), width=3)
                r = 10 + g * 7; d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=fa(P['mid'], al), width=2)
                dots(d, cx, cy, r + 6, g, 8, fa(P['spark'], al), 1, 1)
        return frames_of(W, H, N, fn), {'w': W, 'h': H, 'n': N, 'fps': 18, 'px': cx, 'py': cy, 'pk': 6, 'hit': [0.25, 0.1, 0.2, 2]}
    if name == 'holysword':  # 큰 빛의 검이 위에서 꽂히고 빛기둥 (내려찍기)
        P = PAL['sun']; W, H, N = 140, 230, 16; cx, floor = 70, 222
        def sword(d, tipy, al):
            bl = 120; top = tipy - bl
            d.polygon([(cx - 9, top + 22), (cx + 9, top + 22), (cx + 9, tipy - 14), (cx, tipy), (cx - 9, tipy - 14)], fill=fa(P['mid'], al), outline=fa(P['core'], al))
            d.line([(cx, top + 24), (cx, tipy - 8)], fill=fa(P['core'], al), width=3)
            d.rectangle([cx - 24, top + 14, cx + 24, top + 22], fill=fa(P['glow'], al)); d.rectangle([cx - 5, top - 6, cx + 5, top + 14], fill=fa(P['glow'], al)); d.ellipse([cx - 7, top - 14, cx + 7, top], fill=fa(P['core'], al))
        def fn(d, f, im):
            if f < 6:
                tip = 30 + f * 38; sword(d, min(floor, tip), 255)
                for k in range(3): d.line([(cx - 14 + k * 14, max(0, tip - 150 - k * 10)), (cx - 14 + k * 14, max(0, tip - 130))], fill=fa(P['mid'], 120), width=1)
            else:
                g = f - 6; al = fadeat(g, 4, 45); sword(d, floor, al)
                bw = 10 + g * 5; d.rectangle([cx - bw, 0, cx + bw, floor], fill=fa(P['glow'], al * 0.35)); d.rectangle([cx - bw // 3, 0, cx + bw // 3, floor], fill=fa(P['core'], al * 0.6))
                rx = 16 + g * 8; d.ellipse([cx - rx, floor - 8, cx + rx, floor + 6], outline=fa(P['mid'], al), width=3)
                dots(d, cx, floor - 30 - g * 6, 20 + g * 6, g, 10, fa(P['spark'], al), 1, 0.7)
        return frames_of(W, H, N, fn), {'w': W, 'h': H, 'n': N, 'fps': 20, 'px': cx, 'py': floor, 'pk': 6, 'hit': [0.3, 0.12, 0.22, 2], 'mm': 'drop'}
    if name == 'skylance':  # 빛의 창 여섯 자루가 차례로 꽂힘 → 날개 모양으로 퍼짐 (내려찍기 + 넓게)
        P = PAL['sun']; W, H, N = 260, 220, 20; cx, floor = 130, 212
        xs = [130, 95, 165, 60, 200, 30][:6]
        def lance(d, x, tip, al):
            d.line([(x, tip - 70), (x, tip - 12)], fill=fa(P['glow'], al), width=6); d.line([(x, tip - 70), (x, tip - 12)], fill=fa(P['core'], al), width=2)
            d.polygon([(x - 6, tip - 14), (x + 6, tip - 14), (x, tip)], fill=fa(P['core'], al))
        def fn(d, f, im):
            if f < 12:
                for k, x in enumerate(xs):
                    st = k * 1.6
                    if f >= st:
                        tip = min(floor, 20 + (f - st) * 70); lance(d, x, tip, 255)
                        if tip >= floor: rr = 6 + (f - st) * 2; d.ellipse([x - rr, floor - 4, x + rr, floor + 3], outline=fa(P['mid'], 200), width=2)
            else:  # 날개 모양 빛살
                g = f - 12; al = fadeat(g, 4, 55)
                for x in xs: lance(d, x, floor, al * 0.6)
                for s in (-1, 1):
                    for k in range(5):
                        ang = math.radians(200 + k * 14) if s < 0 else math.radians(340 - k * 14)
                        L = 40 + g * 14 + k * 6; ox, oy = cx, floor - 70
                        stroke(d, [(ox, oy), (ox + math.cos(ang) * L, oy + math.sin(ang) * L * 0.8)], P, 2, al)
                dots(d, cx, floor - 70, 30 + g * 12, g, 14, fa(P['spark'], al), 1, 0.7)
        return frames_of(W, H, N, fn), {'w': W, 'h': H, 'n': N, 'fps': 20, 'px': cx, 'py': floor, 'pk': 12, 'hit': [0.5, 0.15, 0.3, 3], 'mm': 'drop-wide'}
    # 🌑 어둠 ────────────────────────────────────────
    if name == 'shade':
        P = PAL['dark']
        def ex(d, f):
            if f >= 4: d.line([(14, 82), (116, 16)], fill=fa(P['ink'], 120 - (f - 4) * 18), width=12)
        return basic_slash(P, ex)
    if name == 'claw':  # 세 줄 할퀴기
        P = PAL['dark']; W, H, N = 130, 120, 11
        L = [((30, 16), (60, 104)), ((52, 12), (82, 104)), ((74, 16), (104, 100))]
        def fn(d, f, im):
            for k, (a, b) in enumerate(L):
                t = min(1, max(0, (f - k + 1) / 3))
                if t <= 0: continue
                al = 255 if f < 7 else max(0, 255 - (f - 6) * 55)
                x = a[0] + (b[0] - a[0]) * t; y = a[1] + (b[1] - a[1]) * t
                d.line([a, (x, y)], fill=fa(P['ink'], al * 0.8), width=10); d.line([a, (x, y)], fill=fa(P['mid'], al), width=4); d.line([a, (x, y)], fill=fa(P['core'], al), width=1)
            if f >= 5: dots(d, 66, 60, 14 + (f - 5) * 8, f, 9, fa(P['spark'], max(0, 255 - (f - 5) * 40)))
        return frames_of(W, H, N, fn), {'w': W, 'h': H, 'n': N, 'fps': 18, 'px': 66, 'py': 60, 'pk': 4, 'hit': [0.14, 0.08, 0.18, 2]}
    if name == 'phantom':  # 잔상 셋이 세 방향에서 동시에 벰 (가로지르기)
        P = PAL['dark']; W, H, N = 230, 120, 15; cx, cy = 115, 60
        L = [((10, 28), (220, 92)), ((10, 92), (220, 28)), ((10, 60), (220, 60))]
        def fn(d, f, im):
            if f < 4:  # 그림자 셋이 나타남
                for k, (a, b) in enumerate(L):
                    x, y = (a[0] + 20, a[1]) if k < 2 else (b[0] - 20, b[1])
                    al = 60 + f * 45; d.ellipse([x - 6, y - 14, x + 6, y + 14], fill=fa(P['ink'], al)); d.ellipse([x - 3, y - 20, x + 3, y - 12], fill=fa(P['glow'], al))
            elif f < 8:
                t = (f - 3) / 4
                for a, b in L:
                    x = a[0] + (b[0] - a[0]) * t; y = a[1] + (b[1] - a[1]) * t
                    d.line([a, (x, y)], fill=fa(P['ink'], 200), width=9); d.line([a, (x, y)], fill=fa(P['mid'], 255), width=4); d.line([a, (x, y)], fill=P['core'], width=1)
            else:
                g = f - 8; al = fadeat(g, 2, 50)
                for a, b in L: d.line([a, b], fill=fa(P['mid'], al * 0.7), width=max(1, 4 - g)); d.line([a, b], fill=fa(P['core'], al), width=1)
                dots(d, cx, cy, 10 + g * 9, g, 12, fa(P['spark'], al), 1, 0.8)
        return frames_of(W, H, N, fn), {'w': W, 'h': H, 'n': N, 'fps': 20, 'px': 10, 'py': cy, 'pk': 7, 'hit': [0.3, 0.1, 0.2, 2], 'mm': 'cross'}
    if name == 'eclipse':  # 0.1초 어두워짐 → 검은 초승달이 지나감 → 흰 선 하나로 갈라짐 (가로지르기 + 넓게)
        P = PAL['dark']; W, H, N = 250, 160, 18; cy = 80
        def fn(d, f, im):
            if f < 2: d.ellipse([10, 10, W - 10, H - 10], fill=fa(P['ink'], 90))  # 짧게 어두워짐 (반투명 · 2칸)
            if f < 9:
                x = 20 + f * 26; R = 46
                d.ellipse([x - R, cy - R, x + R, cy + R], fill=fa(P['ink'], 235), outline=fa(P['mid'], 255), width=2)
                d.ellipse([x - R + 16, cy - R - 4, x + R + 10, cy + R + 4], fill=(0, 0, 0, 0))
                d.arc([x - R, cy - R, x + R, cy + R], 100, 260, fill=P['core'], width=2)
                d.line([(10, cy), (x - R, cy)], fill=fa(P['mid'], 90), width=1)
            else:
                g = f - 9; al = fadeat(g, 4, 50); sp = g * 3
                d.line([(6, cy), (W - 6, cy)], fill=fa(P['glow'], al), width=6 + g); d.line([(6, cy), (W - 6, cy)], fill=fa(P['core'], al), width=2)
                for s in (-1, 1): d.line([(30, cy + s * sp), (W - 30, cy + s * sp)], fill=fa(P['mid'], al * 0.6), width=1)
                dots(d, W / 2, cy, 20 + g * 12, g, 14, fa(P['spark'], al), 1, 0.5)
        return frames_of(W, H, N, fn), {'w': W, 'h': H, 'n': N, 'fps': 20, 'px': 10, 'py': cy, 'pk': 9, 'hit': [0.45, 0.15, 0.3, 3], 'mm': 'cross-wide'}
    # ⚙ 기계 ────────────────────────────────────────
    if name == 'wrench':  # 스패너가 휘둘러져 한 방 · 불꽃
        P = PAL['gear']; W, H, N = 130, 110, 11; cx, cy = 68, 58
        def wr(d, ang, al):
            ox, oy = 30, 96; L = 70; x, y = ox + math.cos(ang) * L, oy + math.sin(ang) * L
            d.line([(ox, oy), (x, y)], fill=fa(P['steel2'], al), width=8); d.line([(ox, oy), (x, y)], fill=fa(P['steel'], al), width=4)
            d.ellipse([x - 11, y - 11, x + 11, y + 11], fill=fa(P['steel'], al), outline=fa(P['steel2'], al), width=2); d.rectangle([x - 4, y - 12, x + 4, y - 2], fill=(0, 0, 0, 0))
        def fn(d, f, im):
            if f < 4:
                wr(d, math.radians(-150 + f * 30), 255)
                for k in range(f): a_ = math.radians(-150 + k * 30); d.line([(30 + math.cos(a_) * 50, 96 + math.sin(a_) * 50), (30 + math.cos(a_) * 76, 96 + math.sin(a_) * 76)], fill=fa(P['mid'], 90 + k * 40), width=2)
            else:
                g = f - 4; al = fadeat(g, 3, 50); wr(d, math.radians(-50), al)
                for k in range(12):
                    ang = k * 30 + g * 7; r = 8 + g * 9 + (k % 3) * 4
                    x, y = cx + math.cos(math.radians(ang)) * r, cy + math.sin(math.radians(ang)) * r * 0.7 + g * g * 0.6
                    d.line([(x, y), (x + math.cos(math.radians(ang)) * 4, y + math.sin(math.radians(ang)) * 3)], fill=fa(P['spark'] if k % 2 else P['mid'], al), width=2)
                star4(d, cx, cy, 10 - g, fa(P['core'], al), 2)
        return frames_of(W, H, N, fn), {'w': W, 'h': H, 'n': N, 'fps': 18, 'px': cx, 'py': cy, 'pk': 4, 'hit': [0.2, 0.08, 0.18, 2]}
    if name == 'cog':  # 톱니가 날아갔다가 돌아옴
        P = PAL['gear']; W, H, N = 200, 100, 16; cy = 50
        def gearpic(d, x, y, r, rot, al):
            for k in range(8):
                a = math.radians(rot + k * 45); d.rectangle([x + math.cos(a) * r - 4, y + math.sin(a) * r - 4, x + math.cos(a) * r + 4, y + math.sin(a) * r + 4], fill=fa(P['steel2'], al))
            d.ellipse([x - r, y - r, x + r, y + r], fill=fa(P['steel'], al), outline=fa(P['steel2'], al), width=2); d.ellipse([x - 5, y - 5, x + 5, y + 5], fill=fa(P['steel2'], al))
        def fn(d, f, im):
            t = f / (N - 1); x = 20 + math.sin(t * math.pi) * 150; al = 255 if f < N - 2 else 140
            for k in range(1, 4):  # 잔상
                tx = 20 + math.sin(max(0, t - k * 0.04) * math.pi) * 150; d.ellipse([tx - 12, cy - 12, tx + 12, cy + 12], outline=fa(P['mid'], 120 - k * 30), width=2)
            gearpic(d, x, cy, 14, f * 40, al)
            if 6 <= f <= 10: dots(d, 170, cy, 8 + (f - 6) * 6, f, 10, fa(P['spark'], 255 - (f - 6) * 40), 1, 1)
        return frames_of(W, H, N, fn), {'w': W, 'h': H, 'n': N, 'fps': 18, 'px': 170, 'py': cy, 'pk': 8, 'hit': [0.4, 0.08, 0.18, 2]}
    if name == 'piston':  # 피스톤 연타 + 증기 (넓게)
        P = PAL['gear']; W, H, N = 200, 170, 18; cx, floor = 100, 160
        def head(d, y, al):
            d.rectangle([cx - 8, 0, cx + 8, y - 30], fill=fa(P['steel2'], al)); d.rectangle([cx - 30, y - 34, cx + 30, y], fill=fa(P['steel'], al), outline=fa(P['steel2'], al), width=2)
            for k in range(3): d.line([(cx - 24, y - 26 + k * 8), (cx + 24, y - 26 + k * 8)], fill=fa(P['steel2'], al), width=1)
        def fn(d, f, im):
            hits = [3, 7, 11]
            if f < 13:
                ph = f % 4; y = floor - 46 + (ph if ph < 3 else 0) * 15; head(d, min(floor, y + 15), 255)
                for h in hits:
                    if f >= h:
                        g = f - h; al = max(0, 220 - g * 40); r = 16 + g * 10
                        d.ellipse([cx - r, floor - 14 - g * 6, cx + r, floor], fill=fa(P['steam'], al * 0.6))
                        if g < 3: dots(d, cx, floor - 6, 20 + g * 10, g, 10, fa(P['spark'], 255 - g * 60), 1, 0.4)
            else:
                g = f - 13; al = fadeat(g, 1, 50); head(d, floor - 46, al)
                for s in (-1, 1):
                    for k in range(3):
                        r = 18 + g * 8 + k * 6; x = cx + s * (30 + g * 14 + k * 10); d.ellipse([x - r, floor - 30 - g * 8 - k * 6 - r / 2, x + r, floor - 30 - g * 8 - k * 6 + r / 2], fill=fa(P['steam'], al * 0.55))
        return frames_of(W, H, N, fn), {'w': W, 'h': H, 'n': N, 'fps': 20, 'px': cx, 'py': floor - 50, 'pk': 7, 'hit': [0.2, 0.1, 0.24, 2], 'mm': 'wide'}
    if name == 'drill':  # 큰 드릴이 뚫고 지나가며 볼트 · 너트가 튐 (가로지르기)
        P = PAL['gear']; W, H, N = 240, 120, 16; cy = 60
        def drill(d, x, rot, al):
            L = 70; d.rectangle([x - L - 30, cy - 14, x - L, cy + 14], fill=fa(P['steel2'], al))
            d.polygon([(x - L, cy - 20), (x, cy), (x - L, cy + 20)], fill=fa(P['steel'], al), outline=fa(P['steel2'], al))
            for k in range(5):
                xx = x - L + 8 + k * 12 + (rot % 12); d.line([(xx, cy - 16 + k * 3), (xx + 6, cy + 16 - k * 3)], fill=fa(P['steel2'], al), width=2)
        def fn(d, f, im):
            if f < 10:
                x = 40 + f * 22; drill(d, x, f * 5, 255)
                for k in range(4): d.line([(x - 120 - k * 10, cy - 18 + k * 12), (x - 160 - k * 10, cy - 18 + k * 12)], fill=fa(P['mid'], 120), width=2)
                if f >= 4:
                    for k in range(6):
                        bx = 120 + (k - 3) * 6 + (f - 4) * (k - 2.5) * 3; by = cy - 10 + (f - 4) * (k % 3 - 1) * 6 + (f - 4) ** 2 * 0.8
                        if k % 2: d.rectangle([bx - 3, by - 3, bx + 3, by + 3], fill=fa(P['steel'], 255), outline=fa(P['steel2'], 255))
                        else: d.polygon([(bx - 4, by), (bx - 2, by - 3), (bx + 2, by - 3), (bx + 4, by), (bx + 2, by + 3), (bx - 2, by + 3)], fill=fa(P['steel'], 255), outline=fa(P['steel2'], 255))
            else:
                g = f - 10; al = fadeat(g, 2, 60)
                d.line([(10, cy), (230, cy)], fill=fa(P['glow'], al * 0.6), width=10 - g); d.line([(10, cy), (230, cy)], fill=fa(P['core'], al), width=2)
                dots(d, 120, cy, 16 + g * 10, g, 12, fa(P['spark'], al), 1, 0.7)
        return frames_of(W, H, N, fn), {'w': W, 'h': H, 'n': N, 'fps': 20, 'px': 10, 'py': cy, 'pk': 6, 'hit': [0.3, 0.1, 0.24, 3], 'mm': 'cross'}
    # 🌊 물 ─────────────────────────────────────────
    if name == 'aqua':
        P = PAL['water']
        def ex(d, f):
            if f >= 3:
                for k in range(6):
                    g = f - 3; x = 30 + k * 16; y = 72 - k * 10 + g * g * 1.2
                    d.ellipse([x - 2, y - 3, x + 2, y + 2], fill=fa(P['mid'], max(0, 255 - g * 35)))
        return basic_slash(P, ex)
    if name == 'wave':  # 낮은 파도가 밀어냄
        P = PAL['water']; W, H, N = 200, 110, 14; floor = 100
        def fn(d, f, im):
            x = 20 + f * 12; al = 255 if f < 10 else max(0, 255 - (f - 9) * 55); hh = 34 + math.sin(f / 13 * math.pi) * 16
            pts = [(x - 90, floor)] + [(x - 90 + i * 9, floor - hh * crest(i / 11)) for i in range(12)] + [(x + 10, floor)]
            d.polygon(pts, fill=fa(P['deep'], al * 0.85)); d.line(pts[1:-1], fill=fa(P['mid'], al), width=3)
            cx_, cy_ = x - 90 + 8 * 9, floor - hh; d.arc([cx_ - 10, cy_ - 2, cx_ + 22, cy_ + 26], 200, 360, fill=fa(P['core'], al), width=3); d.line([(x - 80, floor - 10), (x - 30, floor - hh * 0.5)], fill=fa(P['mid'], al * 0.6), width=2)
            for k in range(5): d.ellipse([x - 4 + k * 6, floor - 20 - (k % 2) * 8, x + k * 6, floor - 16 - (k % 2) * 8], fill=fa(P['spark'], al))
        return frames_of(W, H, N, fn), {'w': W, 'h': H, 'n': N, 'fps': 18, 'px': 120, 'py': floor - 30, 'pk': 8, 'hit': [0.3, 0.08, 0.2, 2]}
    if name == 'anchor':  # 사슬 달린 닻이 떨어지고 물기둥 (내려찍기)
        P = PAL['water']; W, H, N = 150, 230, 16; cx, floor = 75, 222
        steel, steel2 = PAL['gear']['steel'], PAL['gear']['steel2']
        def anc(d, y, al):
            for k in range(int(y // 12)): d.ellipse([cx - 3, k * 12, cx + 3, k * 12 + 9], outline=fa(steel2, al), width=2)
            d.rectangle([cx - 4, y - 60, cx + 4, y], fill=fa(steel, al)); d.rectangle([cx - 18, y - 52, cx + 18, y - 46], fill=fa(steel, al))
            d.arc([cx - 30, y - 34, cx + 30, y + 10], 20, 160, fill=fa(steel, al), width=6)
            for s in (-1, 1): d.polygon([(cx + s * 28, y - 16), (cx + s * 36, y - 22), (cx + s * 32, y - 8)], fill=fa(steel, al))
            d.ellipse([cx - 7, y - 72, cx + 7, y - 58], outline=fa(steel2, al), width=3)
        def fn(d, f, im):
            if f < 6: anc(d, min(floor, 40 + f * 36), 255)
            else:
                g = f - 6; al = fadeat(g, 4, 45); anc(d, floor, al)
                hgt = min(180, 40 + g * 30) if g < 6 else max(0, 180 - (g - 5) * 40)
                for s in (-1, 1):
                    pts = [(cx + s * 10, floor), (cx + s * (28 + g * 3), floor - hgt * 0.6), (cx + s * 18, floor - hgt)]
                    d.line(pts, fill=fa(P['mid'], al), width=5); d.line(pts, fill=fa(P['core'], al), width=2)
                dots(d, cx, floor - hgt, 16 + g * 5, g, 10, fa(P['spark'], al), 2, 0.6)
                rx = 18 + g * 8; d.ellipse([cx - rx, floor - 7, cx + rx, floor + 5], outline=fa(P['mid'], al), width=2)
        return frames_of(W, H, N, fn), {'w': W, 'h': H, 'n': N, 'fps': 20, 'px': cx, 'py': floor, 'pk': 6, 'hit': [0.3, 0.12, 0.22, 2], 'mm': 'drop'}
    if name == 'tsunami':  # 큰 파도가 덮고 물보라 (넓게)
        P = PAL['water']; W, H, N = 260, 200, 20; floor = 192
        def fn(d, f, im):
            if f < 13:
                x = -40 + f * 26; hh = 60 + f * 8
                pts = [(x - 160, floor)] + [(x - 160 + i * 14, floor - hh * crest(i / 13)) for i in range(14)] + [(x + 30, floor)]
                d.polygon(pts, fill=fa(P['deep'], 210)); d.line(pts[1:-1], fill=fa(P['mid'], 255), width=4)
                tx, ty = pts[12]; d.arc([tx - 18, ty - 4, tx + 34, ty + 50], 200, 360, fill=P['core'], width=4); d.line([(x - 140, floor - 20), (x - 60, floor - hh * 0.55)], fill=fa(P['mid'], 160), width=3)
                for k in range(8): d.ellipse([tx - 20 + k * 6, ty - 8 - (k % 3) * 5, tx - 16 + k * 6, ty - 4 - (k % 3) * 5], fill=fa(P['spark'], 255))
            else:
                g = f - 13; al = fadeat(g, 2, 50)
                for k in range(18):
                    ang = math.radians(200 + k * 8); r = 30 + g * 16 + (k % 4) * 6
                    x, y = 140 + math.cos(ang) * r, floor - 40 + math.sin(ang) * r * 0.9 + g * g * 1.4
                    d.ellipse([x - 3, y - 3, x + 3, y + 3], fill=fa(P['spark'] if k % 2 else P['mid'], al))
                d.rectangle([0, floor - 14, W, floor], fill=fa(P['deep'], al * 0.5))
        return frames_of(W, H, N, fn), {'w': W, 'h': H, 'n': N, 'fps': 20, 'px': 140, 'py': floor - 60, 'pk': 10, 'hit': [0.5, 0.15, 0.3, 3], 'mm': 'wide'}
    raise SystemExit(f'모르는 이름: {name}')

NAMES = ['radiant', 'bulwark', 'holysword', 'skylance', 'shade', 'claw', 'phantom', 'eclipse', 'wrench', 'cog', 'piston', 'drill', 'aqua', 'wave', 'anchor', 'tsunami']
only = sys.argv[2:] or NAMES
res = {}
for nm in only:
    frames, meta = gen(nm)
    sheet = Image.new('RGBA', (meta['w'] * meta['n'], meta['h']), (0, 0, 0, 0))
    for k, im in enumerate(frames): sheet.alpha_composite(im, (k * meta['w'], 0))
    fn = f'fx-{nm}-v1.webp'; sheet.save(os.path.join(OUT, fn), 'WEBP', lossless=True)
    res[nm] = dict({'src': f'pfx/{fn}'}, **meta)
print(json.dumps(res))
