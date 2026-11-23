import numpy as np
from PIL import Image
from scipy import ndimage as ndi
def unwhite(im, tol=14):
    a = np.array(im.convert('RGBA')); rgb = a[..., :3].astype(int)
    if (a[..., 3] < 255).mean() > 0.2: return Image.fromarray(a, 'RGBA')       # 이미 투명 배경
    corner = rgb[0, 0]
    near = (np.abs(rgb - corner).max(-1) <= tol)
    lab, n = ndi.label(near)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(border))
    a[bg, 3] = 0
    return Image.fromarray(a, 'RGBA')
def over(im, bg=(60, 56, 72), z=2):
    b = Image.new('RGBA', im.size, bg + (255,)); b.alpha_composite(im); return b.resize((im.width * z, im.height * z), Image.NEAREST)
