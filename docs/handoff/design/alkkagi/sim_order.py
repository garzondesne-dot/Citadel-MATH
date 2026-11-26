"""알까기 v4 모의 — 차례 규칙 견주기: (가) 늘 번갈아 (나) 첫 턴 동시 → 적게 남은 편이 먼저 · 같으면 동시. python3 sim_order.py"""
import math, random
from sim_square import settle, POW
def shoot(st, team, rng):
    foes = [s for s in st if s['on'] and s['t'] != team]
    for s in st:
        if s['on'] and s['t'] == team and s['act'] and foes:
            o = min(foes, key=lambda o: math.hypot(o['x'] - s['x'], o['y'] - s['y'])); d = math.hypot(o['x'] - s['x'], o['y'] - s['y'])
            a = math.atan2(o['y'] - s['y'], o['x'] - s['x']) + rng.gauss(0, s['sk']); p = POW[0] if d < 2.5 else POW[1] if d < 6 else POW[2]
            s['vx'], s['vy'] = p * math.cos(a), p * math.sin(a); s['shot'] = True
def play(n, rng, W, H, mode, hidden=False, cap=80):
    st = []
    for t in (0, 1):
        sgn = -1 if t == 0 else 1
        for i in range(n):
            if hidden:      # 가림막 뒤에서 각자 자리 고름 = 자기 진영 안 아무 데나
                for k in range(300):
                    x = rng.uniform(-W + 1, W - 1); y = sgn * rng.uniform(1.2, H - 1)
                    if all(math.hypot(x - s['x'], y - s['y']) > 1.6 for s in st): break
            else:
                row1 = (n + 1) // 2; r, k, m = (0, i, row1) if i < row1 else (1, i - row1, n - row1)
                x = (k - (m - 1) / 2) * min(2.4, (2 * W - 2.0) / m); y = sgn * (H - 1.6 - r * 1.8)
            st.append(dict(x=x, y=y, vx=0, vy=0, on=True, t=t, shot=False, mark=False, first=None, sk=0.25 * rng.choice([0.5, 1, 1, 2]), act=rng.random() > 0.1))
    cnt = lambda: [sum(1 for s in st if s['on'] and s['t'] == t) for t in (0, 1)]
    steps = 0; rnd = 0; lead1 = None; sim_rounds = 0
    while steps < cap:
        rnd += 1; c = cnt()
        if mode == 'alt': order = [[0], [1]]
        elif rnd == 1 or c[0] == c[1]: order = [[0, 1]]; sim_rounds += 1
        else: order = [[0], [1]] if c[0] < c[1] else [[1], [0]]
        for grp in order:
            for s in st: s['shot'] = False
            for t in grp: shoot(st, t, rng)
            settle(st, W, H, True, True); steps += 1
            if 0 in cnt(): break
        c = cnt()
        if rnd == 1 and c[0] != c[1]: lead1 = 0 if c[0] > c[1] else 1
        if 0 in c: break
    c = cnt(); win = None if 0 not in c or c == [0, 0] else (0 if c[0] > 0 else 1)
    return dict(steps=steps, left=max(c), win=win, lead1=lead1, sim=sim_rounds, rnd=rnd)
def row(label, mode, hidden, games=60):
    rng = random.Random(len(label)); rs = [play(9, rng, 7, 7, mode, hidden) for _ in range(games)]
    ts = sorted(r['steps'] for r in rs); m = sum(ts) / games
    ld = [r for r in rs if r['lead1'] is not None and r['win'] is not None]; keep = sum(1 for r in ld if r['win'] == r['lead1']) * 100 // max(1, len(ld))
    first = sum(1 for r in rs if r['win'] == 0) * 100 // max(1, sum(1 for r in rs if r['win'] is not None))
    print(f"| {label} | {m:.0f} | {m*8/60:.1f}분 | {ts[games//10]*8/60:.1f} ~ {ts[-games//10]*8/60:.1f}분 | {sum(r['left'] for r in rs)/games:.1f} | {keep}% | {first}% | {sum(r['sim'] for r in rs)/games:.1f} |")
if __name__ == '__main__':
    print('| 설정 (9 대 9 · 사각 14 × 14 · 정타만 · 발사 한 번 = 8초) | 발사 횟수 | 시간 | 빠른 ~ 긴 판 | 이긴 편 남은 수 | 첫 라운드에 앞선 편이 끝내 이김 | 붉은 편(먼저 쏘는 편) 승률 | 동시 발사 횟수 |'); print('|---|---|---|---|---|---|---|---|')
    row('늘 번갈아 · 줄 맞춰 섬', 'alt', False)
    row('첫 턴 동시 → 적은 편 먼저 · 줄 맞춰 섬', 'few', False)
    row('늘 번갈아 · 가림막 자리 잡기', 'alt', True)
    row('첫 턴 동시 → 적은 편 먼저 · 가림막 자리 잡기', 'few', True)
