# v1 용사 → v2 도트 시트 변환 (2026-11-03): 그림 AI 없이 지금 용사 16명을 같은 규격(칸 80×64 · 12줄)으로
#   v1 시트 = 4열(대기 · 이동 · 공격 · 넘어짐) × 8행. 대기 키를 50px 로 맞춰 같은 배율로 줄이고(BOX) 48색으로 맞춘 뒤 발 기준선 · 발 가운데 정렬
#   12줄 채우기 (v1 에 없는 동작은 있는 자세로):
#     대기 = 대기(숨쉬기는 breathe.py) · 걷기 = 이동 · 대기 번갈아 · 공격 = 대기 · 공격 · 공격 · 대기 · 피격 = 대기
#     승리 = 3px 뛰어오른 공격 · 공격 · 쓰러짐 = 넘어짐 · 힐 쓰기 = 공격 · 차원문 = 이동(코드가 작아지며 사라짐)
#     앉기 = 넘어짐(앉아 웃는 자세) · 힐 받음 = 대기 · 생각 중 = 대기 · 헉헉 = 2px 웅크린 대기
# 사용: python3 tools/sprite/v1to2.py <저장소> <출력 폴더>  → hero-NN-v2.webp (00~15) · 이어서 breathe.py · hero_meta.py
import sys, os
import numpy as np
from PIL import Image

repo, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
CW, CH, TARGET, ANCHOR = 80, 64, 50, 0.36
SHEETS = [('heroes-v2.webp', range(0, 8)), ('heroes-extra-v1.webp', range(8, 16))]

def cells(im, row):
    w, h = im.width / 4, im.height / 8
    return [np.asarray(im.crop((round(c * w), round(row * h), round((c + 1) * w), round((row + 1) * h)))) for c in range(4)]

def keep_main(a):
    # 옆 칸에서 묻어 온 조각 지우기: 가장 큰 덩어리(몸)와, 그 둘레 안쪽에 걸친 덩어리(무기 · 이펙트)만 남긴다
    from PIL import ImageDraw
    al = (a[..., 3] > 40); m = Image.fromarray((al * 255).astype(np.uint8), 'L').copy(); lab = 1; comps = []  # copy: 배열에서 바로 만든 이미지는 floodfill 이 안 먹는다
    ys, xs = np.where(al)
    for y, x in zip(ys, xs):
        if m.getpixel((int(x), int(y))) != 255 or lab > 250: continue
        ImageDraw.floodfill(m, (int(x), int(y)), lab); arr = np.asarray(m) == lab
        yy, xx = np.where(arr); lab += 1
        if len(xx): comps.append((lab - 1, arr.sum(), xx.min(), xx.max(), yy.min(), yy.max()))
    if not comps: return a
    L = np.asarray(m); big = max(comps, key=lambda c: c[1]); pad = a.shape[1] * 0.08
    W = a.shape[1]; edge = lambda c: c[2] <= W * 0.06 or c[3] >= W * 0.94  # 칸 테두리에 닿은 조각 = 옆 칸에서 넘어온 것
    keep = [c[0] for c in comps if c[0] == big[0] or (not edge(c) and c[3] >= big[2] - pad and c[2] <= big[3] + pad and c[5] >= big[4] - pad and c[4] <= big[5] + pad and c[1] >= 6)]
    o = a.copy(); o[..., 3] = np.where(np.isin(L, keep), a[..., 3], 0); return o

def trim(a):
    a = a.copy(); m = max(2, int(a.shape[1] * 0.02)); a[:, :m, 3] = 0; a[:, -m:, 3] = 0
    a = keep_main(a)
    al = a[..., 3] > 40; ys, xs = np.where(al)
    return a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]

def shrink(a, S):
    im = Image.fromarray(a, 'RGBA'); w, h = im.size
    arr = np.asarray(im).astype(float); al = arr[..., 3:] / 255
    pre = Image.fromarray(np.dstack([arr[..., :3] * al, al * 255]).astype(np.uint8), 'RGBA').resize((max(1, round(w * S)), max(1, round(h * S))), Image.BOX)
    sm = np.asarray(pre).astype(float); A = sm[..., 3]; o = np.zeros_like(sm); m = A > 110
    o[m, :3] = np.clip(sm[m, :3] / (A[m, None] / 255), 0, 255); o[m, 3] = 255
    return o.astype(np.uint8)

def place(f, dy=0):
    al = f[..., 3] > 0; h, w = al.shape
    feet = al[int(h * 0.88):]; xs = np.where(feet)[1]; cx = (xs.min() + xs.max()) / 2 if len(xs) else w / 2
    ox = int(round(CW * ANCHOR - cx)); oy = CH - 1 - h - dy
    if w <= CW: ox = min(max(ox, 0), CW - w)
    cell = Image.new('RGBA', (CW, CH), (0, 0, 0, 0))
    cell.alpha_composite(Image.fromarray(f, 'RGBA').crop((max(0, -ox), max(0, -oy), w, h)), (max(0, ox), max(0, oy)))
    return cell

for name, ids in SHEETS:
    im = Image.open(os.path.join(repo, 'assets/art', name)).convert('RGBA')
    for row, n in enumerate(ids):
        idle, walk, atk, fall = [trim(c) for c in cells(im, row)]
        S = TARGET / idle.shape[0]
        sm = [shrink(x, S) for x in (idle, walk, atk, fall)]
        px = np.concatenate([f[f[..., 3] > 0][:, :3] for f in sm])
        pal = Image.fromarray(px.reshape(1, -1, 3)).quantize(colors=48, method=Image.FASTOCTREE)
        q = []
        for f in sm:
            rgb = Image.fromarray(f[..., :3]).quantize(palette=pal, dither=Image.Dither.NONE).convert('RGB')
            q.append(np.dstack([np.asarray(rgb), f[..., 3]]))
        I, W, A, F = q
        rows = [[(I, 0)] * 4, [(W, 0), (I, 0), (W, 0), (I, 0)], [(I, 0), (A, 0), (A, 0), (I, 0)], [(I, 0)], [(A, 3), (A, 0)], [(F, 0), (F, 0)],
                [(A, 0), (A, 0)], [(W, 0), (W, 0), (W, 0), (W, 0)], [(F, 0), (F, 0)], [(I, 0), (I, 2)], [(I, 0), (I, 0)], [(I, -2), (I, -1)]]
        sheet = Image.new('RGBA', (CW * 4, CH * len(rows)), (0, 0, 0, 0))
        for r, fr in enumerate(rows):
            for c, (f, dy) in enumerate(fr):
                if dy < 0:  # 웅크림(헉헉): 허리 근처 줄을 -dy 줄 빼서 키를 줄인다 (머리 · 발은 그대로)
                    k = int(f.shape[0] * 0.6); f = np.concatenate([f[:k], f[k - dy:]])
                sheet.paste(place(f, max(dy, 0)), (c * CW, r * CH))
        sheet.save(os.path.join(out, f'hero-{n:02d}.png'))
        print(f'hero-{n:02d}: 배율 {S:.3f}')
