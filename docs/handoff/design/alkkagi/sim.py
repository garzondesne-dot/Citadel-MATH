"""알까기 난장판 모의 실험 — 모두 한 판 · 실시간 · 쏘면 쿨타임 · 떨어지면 되살아남(잠깐 무적). python3 sim.py"""
import math, random
R_ST = 0.7; FRIC = 9.0; DT = 0.04
POW = [7.0, 11.0, 15.0]            # 세기 3단 처음 속도 → 혼자 미끄러지는 거리 약 2.7 · 6.7 · 12.5
GAME = 150.0                       # 한 판 150초
def radius(n): return max(5.5, 2.0 + 1.2 * math.sqrt(n))      # 인원에 맞춘 원판 반지름(알 반지름 0.7)
def play(n, rng, cool=4.0, inv=2.0, back=3.0, skill=0.25, afk=0.1, credit=3.0, K=None):
    R = (K or radius)(n)
    def spot():
        for _ in range(100):
            r = rng.uniform(0, R - 2.0); t = rng.uniform(0, 2 * math.pi); x, y = r * math.cos(t), r * math.sin(t)
            if all(math.hypot(x - s['x'], y - s['y']) > 3 * R_ST for s in st if s['on']): break
        return x, y
    st = []
    for i in range(n):
        s = dict(i=i, x=0, y=0, vx=0, vy=0, on=False, cd=rng.uniform(0, 2), inv=0, back=0, last=None, lt=-9, k=0, d=0, selfd=0, shots=0, act=rng.random() > afk,
                 sk=skill * rng.choice([0.5, 1, 1, 2])); st.append(s); s['x'], s['y'] = spot(); s['on'] = True
    t = 0.0; lead_changes = 0; lead = None; invk = 0
    while t < GAME:
        t += DT
        for s in st:
            if not s['on']:
                s['back'] -= DT
                if s['back'] <= 0: s['x'], s['y'] = spot(); s['vx'] = s['vy'] = 0; s['on'] = True; s['inv'] = inv; s['cd'] = 0.5
                continue
            s['cd'] -= DT; s['inv'] -= DT
            v = math.hypot(s['vx'], s['vy'])
            if v > 0.05:
                nv = max(0, v - FRIC * DT); s['vx'] *= nv / v; s['vy'] *= nv / v; s['x'] += s['vx'] * DT; s['y'] += s['vy'] * DT
                if math.hypot(s['x'], s['y']) > R:
                    s['on'] = False; s['back'] = back; s['d'] += 1
                    if s['last'] is not None and t - s['lt'] <= credit: st[s['last']]['k'] += 1
                    else: s['selfd'] += 1
                    s['last'] = None
            elif s['cd'] <= 0 and s['act'] and rng.random() < DT / 0.8:        # 쿨타임이 끝나면 평균 0.8초 뒤 쏨
                tg = [o for o in st if o['on'] and o is not s and o['inv'] <= 0]
                if tg:
                    o = min(tg, key=lambda o: math.hypot(o['x'] - s['x'], o['y'] - s['y'])); d = math.hypot(o['x'] - s['x'], o['y'] - s['y'])
                    a = math.atan2(o['y'] - s['y'], o['x'] - s['x']) + rng.gauss(0, s['sk']); p = POW[0] if d < 2.5 else POW[1] if d < 6 else POW[2]
                    s['vx'], s['vy'] = p * math.cos(a), p * math.sin(a); s['cd'] = cool; s['shots'] += 1; s['inv'] = 0      # 쏘면 무적 끝
        for i in range(n):
            a = st[i]
            if not a['on']: continue
            for j in range(i + 1, n):
                b = st[j]
                if not b['on']: continue
                dx, dy = b['x'] - a['x'], b['y'] - a['y']; d = math.hypot(dx, dy)
                if 0 < d < 2 * R_ST:
                    if a['inv'] > 0 or b['inv'] > 0: continue                    # 무적 = 서로 통과(밀지도 밀리지도 않음)
                    nx, ny = dx / d, dy / d; rel = (a['vx'] - b['vx']) * nx + (a['vy'] - b['vy']) * ny
                    if rel > 0:
                        a['vx'] -= rel * nx; a['vy'] -= rel * ny; b['vx'] += rel * nx; b['vy'] += rel * ny
                        a['last'], a['lt'], b['last'], b['lt'] = b['i'], t, a['i'], t
                    ov = (2 * R_ST - d) / 2; a['x'] -= nx * ov; a['y'] -= ny * ov; b['x'] += nx * ov; b['y'] += ny * ov
        if int(t / DT) % 25 == 0:
            top = max(st, key=lambda s: s['k'])
            if top['k'] > 0 and top['i'] != lead: lead_changes += lead is not None; lead = top['i']
    ks = sorted((s['k'] for s in st), reverse=True); act = [s for s in st if s['act']]
    return dict(k=sum(ks) / n, d=sum(s['d'] for s in st) / n, selfd=sum(s['selfd'] for s in st) / max(1, sum(s['d'] for s in st)), top=ks[0], zero=sum(1 for s in act if s['k'] == 0) / max(1, len(act)),
                shots=sum(s['shots'] for s in act) / max(1, len(act)), lead=lead_changes, R=R)
def table(ns=(4, 8, 12, 20, 28), games=12, **kw):
    print('| 인원 | 판 반지름 | 한 사람이 쏜 횟수 | 떨어뜨린 수(평균) | 떨어진 수(평균) | 혼자 떨어진 비율 | 1등 점수 | 0점인 학생 | 선두 바뀜 |'); print('|---|---|---|---|---|---|---|---|---|')
    for n in ns:
        rng = random.Random(n); rs = [play(n, rng, **kw) for _ in range(games)]; m = lambda k: sum(r[k] for r in rs) / len(rs)
        print(f"| {n} | {rs[0]['R']:.1f} | {m('shots'):.0f} | {m('k'):.1f} | {m('d'):.1f} | {m('selfd')*100:.0f}% | {m('top'):.1f} | {m('zero')*100:.0f}% | {m('lead'):.1f} |")
if __name__ == '__main__':
    print('### 기본 (쿨타임 4초 · 무적 2초 · 되살아남 3초)\n'); table()
    print('\n### 쿨타임 3초\n'); table(ns=(8, 20), cool=3.0)
    print('\n### 쿨타임 5초\n'); table(ns=(8, 20), cool=5.0)
