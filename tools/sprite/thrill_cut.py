# v0.9.11 그림 묶음 자르기 (2026-11-05 사용자 생성 · 템플릿 assets/templates/v0911 · ASSET-SPEC 6-7)
#   python3 tools/sprite/thrill_cut.py <아이콘18> <콤보창> <카드틀+그림16> <경주트랙> <밸런스발판> <출력 폴더>
#   ① 아이콘 18 → 기존 UI 아이콘 시트(ui-icons-v2 · 8×5)에 붙여 ui-icons-v3 (8×8 · 64px 칸) — 이모지 자동 바꾸기(ui.emoji)가 그대로 씀
#   ② 콤보 창 4단계 → thrill-combo-v1 (가로 4칸 · 같은 칸 크기 · 아래 맞춤)
#   ③ 카드 틀 → card-frame-v2 · 카드 그림 16 → card-arts-v2 (8×2 · 64px)
#   ④ 경주 트랙 → thrill-track-v1 (1280×720 · 손실 webp)  ⑤ 발판 2칸(멀쩡 · 금 감) → fun-plat-v2 (가로 2칸)
import sys, os, json
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from demagenta import clean
from ui_cut import boxes, merge

def crisp(im):
    a = np.asarray(im).copy(); a[..., 3] = np.where(a[..., 3] > 110, 255, 0); return Image.fromarray(a, 'RGBA')

def fit(arr, W, H, pad=2, mode=Image.LANCZOS, align='center'):
    ys, xs = np.where(arr[..., 3] > 0); crop = arr[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    im = Image.fromarray(crop, 'RGBA'); s = min((W - 2 * pad) / im.size[0], (H - 2 * pad) / im.size[1])
    im = crisp(im.resize((max(1, round(im.size[0] * s)), max(1, round(im.size[1] * s))), mode))
    cell = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    y = H - pad - im.size[1] if align == 'bottom' else (H - im.size[1]) // 2
    cell.paste(im, ((W - im.size[0]) // 2, y), im); return cell

NEW_ICONS = ['flame', 'bolt', 'rainbow', 'crown2', 'sparkle', 'chain', 'chest', 'feather', 'bat', 'gem', 'trophy', 'flag', 'hand', 'loop', 'combo', 'target', 'heart', 'hourglass']

def icons(src, out, old):
    rgba, _ = clean(Image.open(src)); H, W = rgba.shape[:2]; cw, ch = W / 6, H / 3
    base = Image.open(old).convert('RGBA'); C = 64
    sheet = Image.new('RGBA', (C * 8, C * 8), (0, 0, 0, 0)); sheet.paste(base, (0, 0))
    for i, name in enumerate(NEW_ICONS):
        c, r = i % 6, i // 6
        cell = rgba[int(r * ch):int((r + 1) * ch), int(c * cw):int((c + 1) * cw)]
        k = 40 + i; sheet.paste(fit(cell, C, C), ((k % 8) * C, (k // 8) * C))
    sheet.save(os.path.join(out, 'ui-icons-v3.webp'), lossless=True); sheet.save(os.path.join(out, 'ui-icons-v3.png'))
    return NEW_ICONS

def strip(src, n, W, H, fn, out, align='center', gap=14, keep_big=True):
    rgba, _ = clean(Image.open(src)); bs = merge(boxes(rgba), gap=gap)
    bs = sorted(sorted(bs, key=lambda b: -(b[2] - b[0]) * (b[3] - b[1]))[:n], key=lambda b: b[0])
    # 같은 배율: 가장 큰 칸 기준
    s = min(min((W - 4) / (b[2] - b[0]), (H - 4) / (b[3] - b[1])) for b in bs)
    sheet = Image.new('RGBA', (W * n, H), (0, 0, 0, 0))
    for i, (x0, y0, x1, y1) in enumerate(bs):
        im = crisp(Image.fromarray(rgba[y0:y1, x0:x1], 'RGBA').resize((round((x1 - x0) * s), round((y1 - y0) * s)), Image.LANCZOS))
        y = H - 2 - im.size[1] if align == 'bottom' else (H - im.size[1]) // 2
        sheet.paste(im, (i * W + (W - im.size[0]) // 2, y), im)
    sheet.save(os.path.join(out, fn), lossless=True); return bs

def card(src, out):
    rgba, _ = clean(Image.open(src)); bs = merge(boxes(rgba), gap=10)
    frame = max(bs, key=lambda b: (b[2] - b[0]) * (b[3] - b[1])); x0, y0, x1, y1 = frame
    fw = 384; fh = round(fw * (y1 - y0) / (x1 - x0))
    fr = crisp(Image.fromarray(rgba[y0:y1, x0:x1], 'RGBA').resize((fw, fh), Image.LANCZOS))
    fr.save(os.path.join(out, 'card-frame-v2.webp'), lossless=True); fr.save(os.path.join(out, 'card-frame-v2.png'))
    # 그림 16: 틀 오른쪽 영역을 8×2 칸으로
    R = rgba[:, x1 + 10:]; ys, xs = np.where(R[..., 3] > 0); R = R[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    # 그림 16 = 2줄 × 8: 줄마다 세로로 비어 있는 틈 중 넓은 7곳에서 자름 (칸을 똑같이 나누면 옆 그림이 끼어듦)
    H = R.shape[0]; rp = (R[..., 3] > 0).sum(1); mid = H // 3 + int(np.argmin(rp[H // 3: 2 * H // 3]))
    C = 64; sheet = Image.new('RGBA', (C * 8, C * 2), (0, 0, 0, 0))
    for r, band in enumerate([R[:mid], R[mid:]]):
        cp = (band[..., 3] > 0).sum(0); L = len(cp); edges = [0]
        for k in range(1, 8):  # k 번째 경계: 똑같이 나눈 자리 ±40% 안에서 불투명 픽셀이 가장 적은 x
            c0 = L * k / 8; lo, hi = int(c0 - L / 8 * 0.4), int(c0 + L / 8 * 0.4)
            seg = cp[lo:hi]; m = seg.min(); xs = np.where(seg == m)[0]
            edges.append(lo + int(xs[np.argmin(np.abs(xs + lo - c0))]))
        edges.append(L)
        for c in range(8): sheet.paste(fit(band[:, edges[c]:edges[c + 1]], C, C), (c * C, r * C))
    sheet.save(os.path.join(out, 'card-arts-v2.webp'), lossless=True); sheet.save(os.path.join(out, 'card-arts-v2.png'))
    return fw, fh

if __name__ == '__main__':
    ic, cb, cd, tr, pl, out = sys.argv[1:7]; os.makedirs(out, exist_ok=True)
    root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'assets', 'art')
    names = icons(ic, out, os.path.join(root, 'ui-icons-v2.webp'))
    strip(cb, 4, 200, 104, 'thrill-combo-v1.webp', out, align='bottom')
    fw, fh = card(cd, out)
    Image.open(tr).convert('RGB').resize((1280, 720), Image.LANCZOS).save(os.path.join(out, 'thrill-track-v1.webp'), quality=82)
    strip(pl, 2, 480, 190, 'fun-plat-v2.webp', out, align='bottom')
    print(json.dumps({'icons': names, 'frame': [fw, fh]}, ensure_ascii=False))
