"""알까기 v3 모의 — 사각 판 · 두 편이 마주 봄 · 번갈아 일제 발사 · 「정타(쏜 알이 처음 맞힌 알)만 떨어짐」. python3 sim_square.py"""
import math, random
R_ST = 0.7; FRIC = 9.0; DT = 0.04; POW = [7.0, 11.0, 15.0]
def settle(st, W, H, direct_only, shooter_falls):
    for s in st: s['mark'] = False; s['first'] = None
    for _ in range(300):
        mv = False
        for s in st:
            if not s['on']: continue
            v = math.hypot(s['vx'], s['vy'])
            if v > 0.05:
                mv = True; nv = max(0, v - FRIC * DT); s['vx'] *= nv / v; s['vy'] *= nv / v; s['x'] += s['vx'] * DT; s['y'] += s['vy'] * DT
                if abs(s['x']) > W or abs(s['y']) > H:
                    can = (not direct_only) or s['mark'] or (s['shot'] and shooter_falls)
                    if can: s['on'] = False
                    else: s['x'] = max(-W, min(W, s['x'])); s['y'] = max(-H, min(H, s['y'])); s['vx'] = s['vy'] = 0      # 가장자리에서 멈춤
        al = [s for s in st if s['on']]
        for i in range(len(al)):
            a = al[i]
            for b in al[i + 1:]:
                dx, dy = b['x'] - a['x'], b['y'] - a['y']; d = math.hypot(dx, dy)
                if 0 < d < 2 * R_ST:
                    nx, ny = dx / d, dy / d; rel = (a['vx'] - b['vx']) * nx + (a['vy'] - b['vy']) * ny
                    if rel > 0:
                        for p, q in ((a, b), (b, a)):                       # 쏜 알이 처음 맞힌 알 = 정타 표시
                            if p['shot'] and p['first'] is None:
                                p['first'] = q
                                if not q['shot']: q['mark'] = True
                        a['vx'] -= rel * nx; a['vy'] -= rel * ny; b['vx'] += rel * nx; b['vy'] += rel * ny
                    ov = (2 * R_ST - d) / 2; a['x'] -= nx * ov; a['y'] -= ny * ov; b['x'] += nx * ov; b['y'] += ny * ov
        if not mv: break
def play(n, rng, W, H, direct_only=True, shooter_falls=True, skill=0.25, afk=0.1, cap=120):
    st = []
    for t in (0, 1):
        sgn = -1 if t == 0 else 1; row1 = (n + 1) // 2
        for i in range(n):
            r, k, m = (0, i, row1) if i < row1 else (1, i - row1, n - row1)
            x = (k - (m - 1) / 2) * (2 * W - 2.4) / max(m - 1, 1) * (1 if m > 1 else 0) * 0.5 * 2 / 2 if m > 1 else 0
            x = (k - (m - 1) / 2) * min(2.4, (2 * W - 2.0) / max(m, 1))
            y = sgn * (H - 1.6 - r * 1.8)
            st.append(dict(x=x, y=y, vx=0, vy=0, on=True, t=t, shot=False, mark=False, first=None, sk=skill * rng.choice([0.5, 1, 1, 2]), act=rng.random() > afk))
    turn = 0; hist = []; c = [n, n]
    while turn < cap:
        team = turn % 2; turn += 1
        foes = [s for s in st if s['on'] and s['t'] != team]
        for s in st:
            s['shot'] = False
            if s['on'] and s['t'] == team and s['act'] and foes:
                o = min(foes, key=lambda o: math.hypot(o['x'] - s['x'], o['y'] - s['y'])); d = math.hypot(o['x'] - s['x'], o['y'] - s['y'])
                a = math.atan2(o['y'] - s['y'], o['x'] - s['x']) + rng.gauss(0, s['sk']); p = POW[0] if d < 2.5 else POW[1] if d < 6 else POW[2]
                s['vx'], s['vy'] = p * math.cos(a), p * math.sin(a); s['shot'] = True
        settle(st, W, H, direct_only, shooter_falls)
        c = [sum(1 for s in st if s['on'] and s['t'] == t) for t in (0, 1)]; hist.append(sum(c))
        if 0 in c: break
    half = next((i + 1 for i, a in enumerate(hist) if a <= n), turn)
    return dict(turns=turn, half=half, left=max(c), done=0 in c)
def row(label, n, W, H, games=40, **kw):
    rng = random.Random(len(label) * 7 + int(W * 10)); rs = [play(n, rng, W, H, **kw) for _ in range(games)]; ts = sorted(r['turns'] for r in rs); m = sum(ts) / games
    print(f"| {label} | {m:.0f} | {m*8/60:.1f}분 | {ts[games//10]*8/60:.1f} ~ {ts[-games//10]*8/60:.1f}분 | {sum(r['half'] for r in rs)/games:.0f} | {sum(r['left'] for r in rs)/games:.1f} | {sum(r['done'] for r in rs)*100//games}% |")
if __name__ == '__main__':
    print('| 설정 (9 대 9 · 한 턴 8초) | 평균 턴 | 평균 시간 | 빠른 ~ 긴 판 | 절반 떨어지는 턴 | 이긴 편 남은 수 | 120턴 안에 끝남 |'); print('|---|---|---|---|---|---|---|')
    row('사각 14 × 14 · 무엇에 맞든 떨어짐', 9, 7, 7, direct_only=False)
    row('사각 14 × 14 · 정타만 · 쏜 알도 넘으면 떨어짐', 9, 7, 7)
    row('사각 14 × 14 · 정타만 · 쏜 알은 가장자리에서 멈춤', 9, 7, 7, shooter_falls=False)
    row('사각 12 × 12 · 정타만 · 쏜 알도 떨어짐', 9, 6, 6)
    row('사각 12 × 12 · 정타만 · 쏜 알은 멈춤', 9, 6, 6, shooter_falls=False)
    row('가로 14 × 세로 10 · 정타만 · 쏜 알도 떨어짐', 9, 7, 5)
    row('가로 14 × 세로 10 · 정타만 · 쏜 알은 멈춤', 9, 7, 5, shooter_falls=False)
