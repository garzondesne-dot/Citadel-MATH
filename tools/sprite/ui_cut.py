# UI 에셋 자르기 (2026-11-04): 아이콘 시트(8×5) → 64×64 칸 한 장 · UI 키트 → 조각별 파일
# 사용: python3 tools/sprite/ui_cut.py <아이콘시트.png> <UI키트.png> <출력 폴더>
import sys, os, json
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from demagenta import clean

ICONS = ['sword', 'close', 'back', 'gear', 'lock', 'unlock', 'ok', 'ng',
         'sheet', 'video', 'hint', 'mis', 'pin', 'dash', 'students', 'prep',
         'castle', 'tent', 'mail', 'dummy', 'anvil', 'fire', 'rest', 'gate',
         'boss', 'seal', 'fx', 'medal', 'gift', 'star', 'heal', 'timer',
         'shield', 'compass', 'demo', 'focus', 'talk', 'class', 'full', 'retry']
CELL = 64


def boxes(rgba, min_px=400, step=4):
    """불투명 덩어리들의 둘레 상자 (scipy 없이 · 1/step 로 줄여서 이웃 채우기)"""
    m = rgba[::step, ::step, 3] > 0
    H, W = m.shape; seen = np.zeros_like(m); out = []
    for y in range(H):
        for x in range(W):
            if not m[y, x] or seen[y, x]: continue
            st = [(y, x)]; seen[y, x] = True; x0 = x1 = x; y0 = y1 = y; n = 0
            while st:
                cy, cx = st.pop(); n += 1
                x0, x1, y0, y1 = min(x0, cx), max(x1, cx), min(y0, cy), max(y1, cy)
                for ny, nx in ((cy + 1, cx), (cy - 1, cx), (cy, cx + 1), (cy, cx - 1)):
                    if 0 <= ny < H and 0 <= nx < W and m[ny, nx] and not seen[ny, nx]: seen[ny, nx] = True; st.append((ny, nx))
            if n * step * step >= min_px: out.append([x0 * step, y0 * step, (x1 + 1) * step, (y1 + 1) * step])
    return out


def merge(bs, gap=14):
    """가까운 상자 합치기 (반짝이 · 떨어진 조각)"""
    bs = [b[:] for b in bs]
    changed = True
    while changed:
        changed = False
        for i in range(len(bs)):
            for j in range(i + 1, len(bs)):
                a, b = bs[i], bs[j]
                if a[0] - gap < b[2] and b[0] - gap < a[2] and a[1] - gap < b[3] and b[1] - gap < a[3]:
                    bs[i] = [min(a[0], b[0]), min(a[1], b[1]), max(a[2], b[2]), max(a[3], b[3])]; bs.pop(j); changed = True; break
            if changed: break
    return bs


def icons(src, out):
    rgba, _ = clean(Image.open(src))
    H, W = rgba.shape[:2]; cw, ch = W / 8, H / 5
    sheet = Image.new('RGBA', (CELL * 8, CELL * 5), (0, 0, 0, 0))
    for i, name in enumerate(ICONS):
        c, r = i % 8, i // 8
        cell = rgba[int(r * ch):int((r + 1) * ch), int(c * cw):int((c + 1) * cw)]
        ys, xs = np.where(cell[..., 3] > 0)
        crop = cell[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
        im = Image.fromarray(crop, 'RGBA'); s = (CELL - 4) / max(im.size)
        im = im.resize((max(1, round(im.size[0] * s)), max(1, round(im.size[1] * s))), Image.LANCZOS)
        a = np.asarray(im).copy(); a[..., 3] = np.where(a[..., 3] > 110, 255, 0); im = Image.fromarray(a, 'RGBA') # 도트처럼 가장자리 또렷하게
        sheet.paste(im, (c * CELL + (CELL - im.size[0]) // 2, r * CELL + (CELL - im.size[1]) // 2), im)
    sheet.save(os.path.join(out, 'ui-icons-v1.png')); sheet.save(os.path.join(out, 'ui-icons-v1.webp'), lossless=True)
    return {'src': 'ui-icons-v1.webp', 'cell': CELL, 'cols': 8, 'rows': 5, 'names': ICONS}


# UI 키트 조각 (위→아래 · 왼→오 순서 · 사용자 시트 배치 그대로)
KIT = ['btn', 'btn-press', 'btn-off', 'btn-gold', 'btn-gold-press', 'x', 'panel', 'back', 'tab', 'tab-on', 'bar']


def kit(src, out):
    rgba, _ = clean(Image.open(src))
    bs = merge(boxes(rgba))
    rows = sorted(bs, key=lambda b: (round(b[1] / 120), b[0]))  # 대략 같은 줄끼리
    # 패널(큰 정사각)은 줄 두 개에 걸쳐 있어서 따로 뽑아 순서에 넣음
    panel = max(bs, key=lambda b: (b[2] - b[0]) * (b[3] - b[1]))
    rest = [b for b in rows if b is not panel]
    order = rest[:6] + [panel] + rest[6:]
    meta = {}
    for name, b in zip(KIT, order):
        x0, y0, x1, y1 = b
        im = Image.fromarray(rgba[y0:y1, x0:x1], 'RGBA')
        s = 0.25  # 원본 약 4배 → 도트 1배 근처
        im = im.resize((max(1, round(im.size[0] * s)), max(1, round(im.size[1] * s))), Image.NEAREST)
        fn = f'ui-{name}-v1.webp'; im.save(os.path.join(out, fn), lossless=True)
        meta[name] = {'src': fn, 'w': im.size[0], 'h': im.size[1]}
    return meta


if __name__ == '__main__':
    ic, kt, out = sys.argv[1:4]
    os.makedirs(out, exist_ok=True)
    m = {'icons': icons(ic, out), 'kit': kit(kt, out)}
    json.dump(m, open(os.path.join(out, 'ui-meta.json'), 'w'), ensure_ascii=False, indent=1)
    print(json.dumps(m['kit'], ensure_ascii=False))


# UI 키트 2판 (2026-11-04): 돌 무늬 없는 정사각 9칸 조각 3×3 (높은 카드 · 긴 버튼 모두 늘려 씀)
KIT2 = ['btn', 'btn-press', 'btn-off', 'btn-gold', 'btn-gold-press', 'tab', 'tab-on', 'input', 'icbtn']


def kit2(src, out, s=0.25):
    rgba, _ = clean(Image.open(src))
    bs = merge(boxes(rgba), gap=6)
    bs = sorted(bs, key=lambda b: (round(b[1] / 200), b[0]))
    meta = {}
    for name, (x0, y0, x1, y1) in zip(KIT2, bs):
        im = Image.fromarray(rgba[y0:y1, x0:x1], 'RGBA')
        im = im.resize((max(1, round(im.size[0] * s)), max(1, round(im.size[1] * s))), Image.BOX)
        a = np.asarray(im).copy(); a[..., 3] = np.where(a[..., 3] > 110, 255, 0)
        fn = f'ui-{name}-v2.webp'; Image.fromarray(a, 'RGBA').save(os.path.join(out, fn), lossless=True)
        meta[name] = {'src': fn, 'w': im.size[0], 'h': im.size[1]}
    return meta
