#!/usr/bin/env python3
"""공격 FX 10종 자르기 — python3 -I cut_fx.py (이 폴더에서) → fx-<이름>-v1.webp (6프레임 가로 768×128 · 칸 128×128 · 무손실)
검은 배경 5종 = 밝기를 투명도로(검정 = 투명) · 마젠타 배경 5종 = 크로마키 · 프레임 합집합 bbox 로 같은 자리 · 64칸 격자(BOX 줄임 + 64색)로 줄여 2배 nearest = 굵은 픽셀 맞춤 · 번개 위쪽 잘림은 위 8% 를 서서히 투명하게."""
import numpy as np
from PIL import Image
B = ['fire', 'ice', 'lightning', 'poison', 'beam']; M = ['claw', 'bite', 'impact', 'dash', 'slash']
def black():
    im = np.array(Image.open('src-black-5x6.png').convert('RGB')).astype(float)
    a = np.clip((im.max(-1) / 255 - 0.04) * 1.15, 0, 1)
    rgb = np.where(a[..., None] > 0, im / np.maximum(a[..., None], 1e-3), 0).clip(0, 255)
    return Image.fromarray(np.dstack([rgb, a * 255]).astype(np.uint8), 'RGBA')
def magenta():
    im = np.array(Image.open('src-magenta-5x6.png').convert('RGB')).astype(float)
    d = np.sqrt(((im - np.array([252, 3, 250])) ** 2).sum(-1)); a = np.clip((d - 70) / 60, 0, 1)
    out = np.dstack([im, a * 255]).astype(np.uint8); m = (a > 0) & (a < 1)
    out[m, 0] = (out[m, 0] * 0.6).astype(np.uint8); out[m, 2] = (out[m, 2] * 0.6).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')
def cells(sheet, row):
    W, H = sheet.size; cw, ch = W / 6, H / 5
    return [sheet.crop((int(c*cw)+3, int(row*ch)+4, int((c+1)*cw)-3, int((row+1)*ch)-4)) for c in range(6)]   # 이웃 칸 번짐 방지로 안쪽 여유
def build(frames, name, fadetop=False):
    bb = None
    for f in frames:
        b = f.getchannel('A').point(lambda v: 255 if v > 20 else 0).getbbox()
        if b: bb = b if bb is None else (min(bb[0], b[0]), min(bb[1], b[1]), max(bb[2], b[2]), max(bb[3], b[3]))
    fr = [f.crop(bb) for f in frames]; w, h = fr[0].size; s = 60 / max(w, h)       # 64칸 안(여백 2)
    outs = []
    for f in fr:
        if fadetop:
            a = np.array(f).astype(float); k = max(1, int(h * 0.08)); a[:k, :, 3] *= np.linspace(0, 1, k)[:, None]; f = Image.fromarray(a.astype(np.uint8), 'RGBA')
        sm = f.resize((max(1, round(w * s)), max(1, round(h * s))), Image.BOX)
        cell = Image.new('RGBA', (64, 64), (0, 0, 0, 0)); cell.alpha_composite(sm, ((64 - sm.width) // 2, (64 - sm.height) // 2))
        arr = np.array(cell); a = arr[..., 3].copy(); a = np.where(a < 40, 0, np.where(a < 200, a, 255)).astype(np.uint8)   # 반투명 정리
        q = Image.fromarray(arr[..., :3]).quantize(colors=64, dither=Image.NONE).convert('RGB'); arr2 = np.dstack([np.array(q), a])
        outs.append(Image.fromarray(arr2, 'RGBA').resize((128, 128), Image.NEAREST))
    sheet = Image.new('RGBA', (768, 128)); [sheet.alpha_composite(o, (i * 128, 0)) for i, o in enumerate(outs)]
    sheet.save(f'fx-{name}-v1.webp', lossless=True, exact=True); return sheet
if __name__ == '__main__':
    Bs, Ms = black(), magenta(); sheets = []
    for i, n in enumerate(B): sheets.append(build(cells(Bs, i), n, fadetop=(n == 'lightning')))
    for i, n in enumerate(M): sheets.append(build(cells(Ms, i), n))
    # 확인용 한 장 (어두운 배경 위)
    c = Image.new('RGBA', (768, 128 * 10), (36, 32, 48, 255))
    for i, s in enumerate(sheets): c.alpha_composite(s, (0, i * 128))
    c.convert('RGB').save('contact-sheet.png')
