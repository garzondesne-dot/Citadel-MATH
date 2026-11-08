# 🧩 프레임 → 시트 (2026-11-08 · asset-handoff 「원본 고정 · 동작별 따로 생성 · 붙이기는 도구」)
#   GPT 가 한 장에 한 프레임씩 그린 그림(마젠타 배경 PNG)을 게임 시트로 붙인다. 생성 AI 에게 시트를 그리게 하지 않는다.
#   python3 tools/sprite/frames_to_sheet.py <출력.webp> --cell 192 --rows m11-01,m11-02,m11-03,m11-04,m11-05 \
#       [--dir asset-handoff/outputs] [--masters asset-handoff/references/masters] [--actions idle,attack,down] [--colors 32] [--png 확인.png]
#   - 줄(row) = 몬스터 하나 (--rows 순서 = 배치표 줄 번호) · 열(col) = 동작 (--actions 순서 = 배치표 poses: idle 0 · attack 1 · down 2)
#   - 프레임 고르기: outputs/{ID}/{ID}_{동작}_1.png · 다시 만든 판 _r2 · _r3 가 있으면 가장 마지막 판
#   - 마스터(references/masters/{ID}_master.png) 가 있으면 대기 칸은 마스터를 그대로 씀 (정답지)
#   - 배경: 마젠타면 demagenta.clean 으로 투명 · 이미 투명이면 그대로
#   - 크기: 한 줄의 모든 프레임에 **같은 배율** (마스터 기준) → 칸의 94% 안에 가장 큰 프레임이 들어감 (cut_grid 와 같은 규칙) · 키는 동작마다 자연스럽게 다름
#   - 자리: 가로 = 보이는 부분 가운데를 칸 가운데 · 세로 = 발(보이는 아래끝)을 칸 아래 3% 선에
#   - 색: 마스터에서 뽑은 팔레트(기본 32색)로 모든 프레임을 맞춤 (번짐 없이 · 진짜 도트 색 수) · 투명도는 0 / 255 두 값만
#   - --png 를 주면 칸 선 · 기준선을 그린 확인 그림도 남김 (게임에는 안 씀)
import argparse, glob, os, re, sys
import numpy as np
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from demagenta import clean  # noqa: E402

def latest(dir_, id_, act):
    fs = glob.glob(os.path.join(dir_, id_, f'{id_}_{act}_*.png'))
    if not fs: return None
    def rank(f):
        m = re.search(r'_(\d+)(?:_r(\d+))?\.png$', f)
        return (int(m.group(1)) if m else 0, int(m.group(2) or 1) if m else 0)
    return max(fs, key=rank)

def load_rgba(path):
    im = Image.open(path)
    if im.mode == 'RGBA' and np.array(im)[..., 3].min() < 250: return im
    return Image.fromarray(clean(im.convert('RGB'))[0], 'RGBA')

def crop(im):
    a = np.array(im)[..., 3]; ys, xs = np.where(a > 40)
    if not len(xs): raise SystemExit('빈 그림')
    return im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))

def palette_of(im, n):
    rgb = np.array(im.convert('RGBA')); m = rgb[..., 3] > 128
    px = rgb[m][:, :3].reshape(-1, 1, 3).astype('uint8')
    if not len(px): raise SystemExit('마스터에 보이는 픽셀 없음')
    return Image.fromarray(px).quantize(colors=n, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)

def snap(im, pal):
    rgba = np.array(im); alpha = rgba[..., 3]
    q = Image.fromarray(rgba[..., :3]).quantize(palette=pal, dither=Image.Dither.NONE).convert('RGB')
    out = np.dstack([np.array(q), np.where(alpha > 110, 255, 0).astype('uint8')])
    return Image.fromarray(out, 'RGBA')

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('out'); ap.add_argument('--cell', type=int, default=192); ap.add_argument('--rows', required=True)
    ap.add_argument('--dir', default='asset-handoff/outputs'); ap.add_argument('--masters', default='asset-handoff/references/masters')
    ap.add_argument('--actions', default='idle,attack,down'); ap.add_argument('--colors', type=int, default=32); ap.add_argument('--png')
    o = ap.parse_args()
    ids, acts, C = o.rows.split(','), o.actions.split(','), o.cell
    sheet = Image.new('RGBA', (C * len(acts), C * len(ids)), (0, 0, 0, 0))
    for r, id_ in enumerate(ids):
        mpath = os.path.join(o.masters, f'{id_}_master.png')
        frames = {}
        for a in acts:
            p = mpath if (a == 'idle' and os.path.exists(mpath)) else latest(o.dir, id_, a)
            if not p: raise SystemExit(f'❌ {id_} 의 {a} 프레임이 없음 ({o.dir}/{id_}/{id_}_{a}_1.png)')
            frames[a] = crop(load_rgba(p)); print(f'  {id_} {a:7s} ← {os.path.relpath(p)} ({frames[a].width}×{frames[a].height})')
        pal = palette_of(frames['idle'] if 'idle' in frames else next(iter(frames.values())), o.colors)
        k = (C * 0.94) / max(max(f.width, f.height) for f in frames.values())  # 한 줄 같은 배율
        for c, a in enumerate(acts):
            f = frames[a]; w, h = max(1, round(f.width * k)), max(1, round(f.height * k))
            g = snap(f.resize((w, h), Image.BOX), pal)
            x = c * C + (C - w) // 2; y = r * C + C - round(C * 0.03) - h
            sheet.alpha_composite(g, (x, max(r * C, y)))
        print(f'  {id_}: 배율 {k:.3f} · 팔레트 {o.colors}색')
    sheet.save(o.out, lossless=True) if o.out.endswith('.webp') else sheet.save(o.out)
    print(f'✅ {o.out} ({sheet.width}×{sheet.height} · 칸 {C} · {len(ids)}줄 × {len(acts)}열)')
    if o.png:
        prev = Image.new('RGBA', sheet.size, (40, 40, 60, 255)); prev.alpha_composite(sheet); d = ImageDraw.Draw(prev)
        for r in range(len(ids)):
            for c in range(len(acts)):
                d.rectangle((c * C, r * C, c * C + C - 1, r * C + C - 1), outline=(255, 255, 255, 90))
                yb = r * C + C - round(C * 0.03); d.line((c * C, yb, c * C + C, yb), fill=(90, 220, 255, 160))
        prev.save(o.png); print(f'  확인 그림 {o.png}')

if __name__ == '__main__':
    main()
