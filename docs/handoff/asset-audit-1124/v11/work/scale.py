import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi
def body_box(im):
    a = np.array(im)[..., 3] > 128
    lab, n = ndi.label(ndi.binary_dilation(a, np.ones((3, 3)), iterations=2), np.ones((3, 3)))
    areas = [(a & (lab == i)).sum() for i in range(1, n + 1)]; bi = int(np.argmax(areas)) + 1; body = a & (lab == bi)
    ys, xs = np.where(body); return ys.min(), ys.max(), xs.min(), xs.max(), xs.mean()
def rescale(cell, ref_h, target=0.9, foot=135):
    t, b, l, r, cx = body_box(cell); h = b - t + 1; s = target * ref_h / h
    if s <= 1.02: return cell, 1.0
    W, H = cell.size
    big = cell.resize((round(W * s), round(H * s)), Image.LANCZOS)
    # 알파 정리 + 색 번짐 줄이기: 알파를 이진화하고 약하게 샤프
    a = np.array(big); a[..., 3] = np.where(a[..., 3] > 110, 255, 0); big = Image.fromarray(a, 'RGBA').filter(ImageFilter.UnsharpMask(radius=1, percent=60, threshold=2))
    a = np.array(big); a[..., 3] = np.where(a[..., 3] > 110, 255, 0); big = Image.fromarray(a, 'RGBA')
    # 발끝을 foot 에 · 몸 가운데 x 유지
    nt, nb, nl, nr, ncx = body_box(big)
    dx = round(cx - ncx); dy = foot - nb
    out = Image.new('RGBA', (W, H), (0, 0, 0, 0)); out.alpha_composite(big, (dx, dy)); 
    return out, s
