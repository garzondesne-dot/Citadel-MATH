#!/usr/bin/env python3
"""녹스(붉은 · 검은 용사)의 크로마키 초록 찌꺼기(발 줄 · 망토 점) 지우기 — 녹스 몸에는 초록이 없으므로 초록 쏠림 픽셀을 모두 처리.
초록 조각이 몸(초록 아닌 불투명 픽셀)과 맞닿지 않으면 지우고, 닿으면 윤곽선 색(#1a1228)으로."""
import sys, numpy as np
from PIL import Image
from scipy import ndimage as ndi
def clean(cell):
    out = cell.copy(); a = cell[..., 3]; op = a > 0; rgb = cell[..., :3].astype(int)
    R, G, B = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    g = op & (G >= R + 12) & (G >= B + 12) & (G >= 24)
    lab, n = ndi.label(g, structure=np.ones((3, 3)))
    body = op & ~g
    n_chg = 0
    for i in range(1, n + 1):
        m = lab == i
        touch = ndi.binary_dilation(m, structure=np.ones((3, 3))) & body
        if touch.sum() == 0 or m.sum() <= 3:
            out[m, 3] = 0
        else:
            out[m, :3] = (26, 18, 40)
        n_chg += int(m.sum())
    return out, n_chg
if __name__ == '__main__':
    src, dst, title = sys.argv[1], sys.argv[2], sys.argv[3]
    im = np.array(Image.open(src).convert('RGBA')); out = im.copy(); H, W = im.shape[:2]; tot = 0
    for r in range(H // 144):
        for c in range(W // 256):
            sl = (slice(r*144, (r+1)*144), slice(c*256, (c+1)*256)); o, n = clean(im[sl]); out[sl] = o; tot += n
    chg = (im != out).any(-1); assert ((im[..., 3] == out[..., 3]) | (out[..., 3] == 0))[chg].all()
    Image.fromarray(out, 'RGBA').save(dst, lossless=True, exact=True); print(dst, 'green px', tot, 'changed', int(chg.sum()))
