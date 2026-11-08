# 🔍 GPT 프레임 자동 검수 (2026-11-08 · asset-handoff 「틀어짐 검사」)
#   python3 tools/sprite/check_frames.py <ID> [--dir asset-handoff/outputs] [--masters asset-handoff/references/masters]
#   outputs/{ID}/ 의 PNG 마다 표로: 크기 · 배경(마젠타/투명) · 안전 여백(가장자리 3%) · 발 기준선(아래 3% 근처)
#   마스터가 있으면 마스터 대비 ① 실루엣 키 · 폭 차이(±5%) ② 색이 마스터 팔레트 밖인 비율 ③ 방향(좌우 뒤집힘 의심)
#   ④ 장비 · 표식 유지는 눈으로 (표에 「눈 확인」) — 어긋나면 「수정 필요」: 결과물을 고치지 말고 「마스터 + 템플릿」에서 다시 생성 (같은 프레임 3번까지)
import argparse, glob, os, sys
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from demagenta import clean  # noqa: E402

def rgba(path):
    im = Image.open(path); bg = 'transparent'
    if not (im.mode == 'RGBA' and np.array(im)[..., 3].min() < 250):
        a = np.array(im.convert('RGB')).astype(int); corners = np.concatenate([a[:8, :8].reshape(-1, 3), a[:8, -8:].reshape(-1, 3), a[-8:, :8].reshape(-1, 3), a[-8:, -8:].reshape(-1, 3)])
        mag = np.mean((corners[:, 0] > 200) & (corners[:, 1] < 60) & (corners[:, 2] > 200)); bg = 'magenta' if mag > 0.9 else f'⚠ 배경이 마젠타가 아님({mag:.0%})'
        im = Image.fromarray(clean(im.convert('RGB'))[0], 'RGBA')
    return im.convert('RGBA'), bg

def box(im):
    a = np.array(im)[..., 3] > 40; ys, xs = np.where(a)
    return (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1) if len(xs) else None

def sil(im, b, n=64):  # 실루엣을 n×n 로 (방향 비교용)
    return np.array(im.crop(b).split()[3].resize((n, n), Image.BOX)) > 60

def colprof(im, b, n=16):  # 세로줄마다 평균 색 (방향 비교용 · 자세가 달라도 왼쪽 / 오른쪽 색 배치는 남음)
    a = np.array(im.crop(b).resize((n, n), Image.BOX)).astype(float)
    return (a[..., :3] * (a[..., 3:] / 255)).mean(0)

def pal_out(im, master, thr=48):
    m = np.array(master)[..., :3][np.array(master)[..., 3] > 128].astype(int)
    if len(m) > 4000: m = m[np.random.default_rng(0).choice(len(m), 4000, replace=False)]
    cols = np.unique((m // 8) * 8, axis=0)
    p = np.array(im)[..., :3][np.array(im)[..., 3] > 128].astype(int)
    if len(p) > 6000: p = p[np.random.default_rng(1).choice(len(p), 6000, replace=False)]
    d = np.sqrt(((p[:, None, :] - cols[None, :, :]) ** 2).sum(-1)).min(1)
    return float(np.mean(d > thr))

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('id'); ap.add_argument('--dir', default='asset-handoff/outputs'); ap.add_argument('--masters', default='asset-handoff/references/masters')
    o = ap.parse_args()
    files = sorted(glob.glob(os.path.join(o.dir, o.id, '*.png')))
    if not files: raise SystemExit(f'❌ {o.dir}/{o.id}/ 에 PNG 가 없음')
    mp = os.path.join(o.masters, f'{o.id}_master.png'); M = None
    if os.path.exists(mp): M, _ = rgba(mp); Mb = box(M); Mh, Mw = (Mb[3] - Mb[1]) / M.height, (Mb[2] - Mb[0]) / M.width
    print(f'| 파일 | 크기 | 배경 | 여백 3% | 발 기준선 | 키 차이 | 폭 차이 | 팔레트 밖 | 방향 | 판정 |\n|---|---|---|---|---|---|---|---|---|---|')
    bad = 0
    for f in files:
        im, bg = rgba(f); b = box(im); W, H = im.size; notes = []
        if W != H or W < 512: notes.append('크기')
        if bg != 'magenta' and bg != 'transparent': notes.append('배경')
        mg = 0.03; inside = b and b[0] >= W * mg - 1 and b[1] >= H * mg - 1 and b[2] <= W * (1 - mg) + 1 and b[3] <= H * (1 - mg) + 1
        if not inside: notes.append('여백')
        foot = b and abs(b[3] / H - 0.97) <= 0.03
        if not foot: notes.append('발')
        dh = dw = po = None; dirv = '—'
        if M is not None and b:
            dh = (b[3] - b[1]) / H / Mh - 1; dw = (b[2] - b[0]) / W / Mw - 1; po = pal_out(im, M)
            s, sm = sil(im, b), sil(M, Mb); same, flip = (s == sm).mean(), (s == sm[:, ::-1]).mean()
            c, cm = colprof(im, b), colprof(M, Mb); csame, cflip = np.abs(c - cm).mean(), np.abs(c - cm[::-1]).mean()
            dirv = '⚠ 뒤집힘?' if (flip > same + 0.02 and cflip < csame) or cflip < csame * 0.8 else '같음'
            act = os.path.basename(f).split('_')[1] if '_' in os.path.basename(f) else ''
            if abs(dh) > (0.10 if act == 'attack' else 0.05) and act != 'down': notes.append('키')
            if abs(dw) > 0.05 and act not in ('attack', 'down'): notes.append('폭')
            if po > 0.10: notes.append('색')
            if dirv != '같음': notes.append('방향')
        verdict = '통과 (장비 · 표식은 눈 확인)' if not notes else '수정 필요: ' + ' · '.join(notes)
        bad += bool(notes)
        pct = lambda v: '—' if v is None else f'{v:+.1%}'
        print(f'| {os.path.basename(f)} | {W}×{H} | {bg} | {"✓" if inside else "✗"} | {"✓" if foot else "✗"} | {pct(dh)} | {pct(dw)} | {"—" if po is None else f"{po:.0%}"} | {dirv} | {verdict} |')
    if M is None: print(f'\n(마스터 {mp} 없음 — 마스터 대비 검사는 승인 · 고정 뒤에)')
    print(f'\n{"✅ 모두 통과" if not bad else f"⚠ 수정 필요 {bad}개"} · 쓰러짐(down)은 키 · 폭, 공격(attack)은 폭이 달라도 되고 키는 ±10% (동작 때문)')

if __name__ == '__main__':
    main()
