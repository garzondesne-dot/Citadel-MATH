"""알까기 편 나눠 번갈아(탈락제) 모의 — 한쪽 편이 모두 떨어지면 1라운드 끝. python3 sim_team.py"""
import math, random
R_ST = 0.7; FRIC = 9.0; DT = 0.04; POW = [7.0, 11.0, 15.0]
def settle(st, R):
    for _ in range(300):
        mv = False
        for s in st:
            if not s['on']: continue
            v = math.hypot(s['vx'], s['vy'])
            if v > 0.05:
                mv = True; nv = max(0, v - FRIC * DT); s['vx'] *= nv / v; s['vy'] *= nv / v; s['x'] += s['vx'] * DT; s['y'] += s['vy'] * DT
                if math.hypot(s['x'], s['y']) > R: s['on'] = False
        al = [s for s in st if s['on']]
        for i in range(len(al)):
            a = al[i]
            for b in al[i + 1:]:
                dx, dy = b['x'] - a['x'], b['y'] - a['y']; d = math.hypot(dx, dy)
                if 0 < d < 2 * R_ST:
                    nx, ny = dx / d, dy / d; rel = (a['vx'] - b['vx']) * nx + (a['vy'] - b['vy']) * ny
                    if rel > 0: a['vx'] -= rel * nx; a['vy'] -= rel * ny; b['vx'] += rel * nx; b['vy'] += rel * ny
                    ov = (2 * R_ST - d) / 2; a['x'] -= nx * ov; a['y'] -= ny * ov; b['x'] += nx * ov; b['y'] += ny * ov
        if not mv: break
def play(n, rng, R0, shrink=None, skill=0.25, afk=0.1, cap=200):
    """n = 한 편 인원. shrink = (몇 턴마다, 줄이는 양, 가장 작은 반지름)"""
    st = []
    for t in (0, 1):
        for i in range(n):
            for k in range(400):
                r = (R0 - 1.2) * math.sqrt(rng.random()); a = rng.uniform(0, math.pi) + t * math.pi; x, y = r * math.cos(a), r * math.sin(a)
                if all(math.hypot(x - s['x'], y - s['y']) > (2.2 if k < 300 else 2.0) * R_ST for s in st): break
            st.append(dict(x=x, y=y, vx=0, vy=0, on=True, t=t, sk=skill * rng.choice([0.5, 1, 1, 2]), act=rng.random() > afk))
    R = R0; turn = 0; alive_hist = []
    while turn < cap:
        team = turn % 2; turn += 1
        if shrink and turn % shrink[0] == 0:
            R = max(shrink[2], R - shrink[1])
            for s in st:
                if s['on'] and math.hypot(s['x'], s['y']) > R: s['on'] = False
        foes = [s for s in st if s['on'] and s['t'] != team]
        for s in st:
            if s['on'] and s['t'] == team and s['act'] and foes:
                o = min(foes, key=lambda o: math.hypot(o['x'] - s['x'], o['y'] - s['y'])); d = math.hypot(o['x'] - s['x'], o['y'] - s['y'])
                a = math.atan2(o['y'] - s['y'], o['x'] - s['x']) + rng.gauss(0, s['sk']); p = POW[0] if d < 2.5 else POW[1] if d < 6 else POW[2]
                s['vx'], s['vy'] = p * math.cos(a), p * math.sin(a)
        settle(st, R)
        c = [sum(1 for s in st if s['on'] and s['t'] == t) for t in (0, 1)]; alive_hist.append(sum(c))
        if 0 in c: break
    half = next((i + 1 for i, a in enumerate(alive_hist) if a <= n), turn)   # 절반이 떨어진 턴
    return dict(turns=turn, half=half, left=max(c), done=0 in c)
def row(label, n, R0, shrink, games=40):
    rng = random.Random(hash(label) % 9999); rs = [play(n, rng, R0, shrink) for _ in range(games)]; ts = sorted(r['turns'] for r in rs)
    m = sum(ts) / games; print(f"| {label} | {m:.0f} | {m*8/60:.1f}분 | {ts[games//10]*8/60:.1f} ~ {ts[-games//10]*8/60:.1f}분 | {sum(r['half'] for r in rs)/games:.0f} | {sum(r['left'] for r in rs)/games:.1f} | {sum(r['done'] for r in rs)*100//games}% |")
if __name__ == '__main__':
    print('| 설정 (9 대 9 · 한 턴 8초) | 평균 턴 | 평균 시간 | 빠른 판 ~ 긴 판 | 절반이 떨어지는 턴 | 이긴 편 남은 수 | 끝까지 감 |'); print('|---|---|---|---|---|---|---|')
    row('판 반지름 7.1 · 안 줄어듦', 9, 7.1, None)
    row('판 반지름 6.0 · 안 줄어듦', 9, 6.0, None)
    row('7.1 → 4턴마다 0.4씩 줄어듦(3.0까지)', 9, 7.1, (4, 0.4, 3.0))
    row('7.1 → 2턴마다 0.4씩 줄어듦(3.0까지)', 9, 7.1, (2, 0.4, 3.0))
    row('6.0 → 2턴마다 0.4씩 줄어듦(2.5까지)', 9, 6.0, (2, 0.4, 2.5))
