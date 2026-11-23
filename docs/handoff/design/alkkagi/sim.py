"""알까기 수비대 모의 실험 — 모두 동시에 튕기는 협동 알까기(용사 알 vs 몬스터 알). python3 sim.py"""
import math, random
R_AR = 10.0          # 판 반지름(원판) · 알 중심이 넘으면 떨어짐
R_ST = 0.7           # 알 반지름
FRIC = 9.0           # 미끄러지다 멈추는 감속
POW = [7.0, 11.0, 15.0]   # 세기 3단(약 · 중 · 강) 처음 속도
DT = 0.02
def step(st):
    """st = [dict(x,y,vx,vy,m,alive,side)] 모두 멈출 때까지 굴림. 떨어진 알 목록을 돌려줌"""
    out = []
    for _ in range(400):
        mv = False
        for s in st:
            if not s['alive']: continue
            v = math.hypot(s['vx'], s['vy'])
            if v > 0.05:
                mv = True; nv = max(0, v - FRIC * DT); s['vx'] *= nv / v; s['vy'] *= nv / v
                s['x'] += s['vx'] * DT; s['y'] += s['vy'] * DT
                if math.hypot(s['x'], s['y']) > R_AR: s['alive'] = False; out.append(s)
            else: s['vx'] = s['vy'] = 0
        for i in range(len(st)):
            a = st[i]
            if not a['alive']: continue
            for j in range(i + 1, len(st)):
                b = st[j]
                if not b['alive']: continue
                dx, dy = b['x'] - a['x'], b['y'] - a['y']; d = math.hypot(dx, dy)
                if 0 < d < 2 * R_ST:
                    nx, ny = dx / d, dy / d; rel = (a['vx'] - b['vx']) * nx + (a['vy'] - b['vy']) * ny
                    if rel > 0:
                        k = 2 * rel / (a['m'] + b['m'])
                        a['vx'] -= k * b['m'] * nx; a['vy'] -= k * b['m'] * ny; b['vx'] += k * a['m'] * nx; b['vy'] += k * a['m'] * ny
                    ov = (2 * R_ST - d) / 2; a['x'] -= nx * ov; a['y'] -= ny * ov; b['x'] += nx * ov; b['y'] += ny * ov
        if not mv: break
    return out
def place(side, n, rng, st):
    for _ in range(n):
        for _ in range(200):
            r = rng.uniform(1, R_AR - 2.5); t = rng.uniform(0, 2 * math.pi)
            if side == 'hero': t = rng.uniform(math.pi, 2 * math.pi)       # 용사 = 아래 반
            elif side == 'mon': t = rng.uniform(0, math.pi)                # 몬스터 = 위 반
            x, y = r * math.cos(t), r * math.sin(t)
            if all(math.hypot(x - s['x'], y - s['y']) > 2.4 * R_ST for s in st if s['alive']): break
        st.append(dict(x=x, y=y, vx=0, vy=0, m=1.0, alive=True, side=side))
    return st
def aim(s, targets, rng, err, pw):
    t = min(targets, key=lambda o: math.hypot(o['x'] - s['x'], o['y'] - s['y']))
    ang = math.atan2(t['y'] - s['y'], t['x'] - s['x']) + rng.gauss(0, err)
    s['vx'], s['vy'] = pw * math.cos(ang), pw * math.sin(ang)
def play(n, rng, skill=0.25, waves=3, turns=20, per_wave=None, life_bonus=2, boss_m=2.5, afk=0.1):
    per_wave = per_wave or (lambda n, w: n + 1 + (w == 2))
    st = place('hero', n, rng, []); lives = n + life_bonus; t = 0; hit_own = 0; shots = 0; respawn = []
    for w in range(waves):
        place('mon', per_wave(n, w), rng, st)
        if w == waves - 1: boss = [s for s in st if s['side'] == 'mon' and s['alive']][-1]; boss['m'] = boss_m
        while any(s['side'] == 'mon' and s['alive'] for s in st):
            if t >= turns or lives <= 0: return dict(win=False, turns=t, lives=lives, wave=w)
            t += 1
            for _ in range(respawn.count(t)): place('hero', 1, rng, st)
            heroes = [s for s in st if s['side'] == 'hero' and s['alive']]; mons = [s for s in st if s['side'] == 'mon' and s['alive']]
            for h in heroes:
                if rng.random() > afk: aim(h, mons, rng, skill, rng.choice(POW)); shots += 1
            if heroes:
                for m in mons[::2] if t % 2 else mons[1::2]: aim(m, heroes, rng, 0.15, POW[1] if m['m'] == 1 else POW[0])   # 몬스터는 번갈아 절반만 움직임
            for o in step(st):
                if o['side'] == 'hero': lives -= 1; respawn.append(t + 2)
        st = [s for s in st if s['alive']]
    return dict(win=True, turns=t, lives=lives, wave=waves)
if __name__ == '__main__':
    print('| 인원 | 조준 실력 | 이김 | 평균 턴 | 남은 ♥ | 진 판이 끝난 물결 |'); print('|---|---|---|---|---|---|')
    for n in (1, 2, 4, 6, 8):
        for nm, sk in (('서툼(±29°)', 0.5), ('보통(±14°)', 0.25), ('잘함(±6°)', 0.1)):
            rng = random.Random(n * 100 + int(sk * 100)); rs = [play(n, rng, sk) for _ in range(300)]
            w = [r for r in rs if r['win']]; l = [r for r in rs if not r['win']]
            print(f"| {n} | {nm} | {len(w)/3:.0f}% | {sum(r['turns'] for r in rs)/300:.1f} | {sum(r['lives'] for r in w)/max(1,len(w)):.1f} | {sum(r['wave'] for r in l)/max(1,len(l))+1:.1f} |")
