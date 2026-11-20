#!/usr/bin/env python3
"""게시판 던전 ATB 모의 실험 2 — 충전 단위 3안 비교 + 연습/일반/도전 (설계 방 · 2026-11-20)
가정값 계산(엔진 아님). 원문항 크기 = 11차시 팩(소문항 3 · 4 · 5 · 3).
안 A = 원문항 완주가 충전 1   안 B = 소문항 하나가 충전 1
안 C = 소문항마다 ⚡ 1(대장 단계 2 · 최대 5 저장) · 모아 쏠수록 큼 · 실드는 「완주」로만
쓰기: python3 sim2.py
"""
import random, statistics as st

KS = [3, 4, 5, 3]                 # 원문항별 소문항 수(11차시 m1~m4)
MUL = {1: 1.0, 2: 2.1, 3: 3.3, 4: 4.6, 5: 6.0}   # 안 C: ⚡ n개를 한 번에 쏠 때 배율
P0 = dict(hero_hp=100, atb=8, sub_sec=18, atk=8, atk_hit=0.8, atk_sec=3, atk_rate=0.6,
          skill=30, shield_cut=0.3, fever_sec=12, fever_mul=2.0, fever_atb=2.0,
          shield_at=0.7, boss_gap=12, single=10, aoe=5, aoe_every=3,
          revive_max=3, revive_hp=40, shields={1: 2, 2: 2, 3: 3, 4: 4}, limit=900,
          timing_bonus=1.15)      # 스킬 「모았다 놓기」 평균 덤(100 / 125 / 150% 의 어림 평균)

def run(n, p, P, mode, boss_hp, eager=False, masher=False, rng=random):
    hp = [P['hero_hp']] * n; atb = [0.0] * n
    e = [0] * n; tok = [0] * n                      # ⚡ · 완주 표(1 보통 · 2 퍼펙트)
    qi = [rng.randrange(len(KS)) for _ in range(n)]; prog = [0] * n; wrong = [0] * n; clean = [True] * n
    busy = [0] * n; doing = [None] * n
    solved = [0] * n; solve_t = [0] * n; fires = [0] * n; alive_t = [0] * n
    boss = H = boss_hp; owners = list(range(n if P.get('own_all') else min(2, n))); sh = {o: 0 for o in owners}
    up = done = False; fever = 0; rev = P['revive_max']; da = ds = 0; nb = 0; t = 0
    single = P['single'] * (0.7 if n == 1 else 1); aoe = P['aoe'] * (0.7 if n == 1 else 1)

    def hit(d, kind):
        nonlocal boss, da, ds
        if up: d *= P['shield_cut']
        elif fever > 0: d *= P['fever_mul']
        floor = 1 if (up or not done or any(h <= 0 for h in hp)) else 0
        r = max(0, min(d, boss - floor)); boss -= r
        if kind == 'a': da += r
        else: ds += r

    def out(win, why):
        tot = max(1, sum(alive_t))
        return dict(win=win, t=t, share=da / max(1, da + ds), q=sum(solved) / n,
                    solve=sum(solve_t) / tot, gap=tot / max(1, sum(fires)), why=why)

    while t < P['limit']:
        t += 1
        if fever > 0: fever -= 1
        if not done and not up and boss <= H * P['shield_at']:
            up = True
            for i in range(P['shields'][n]): sh[owners[i % len(owners)]] += 1
        if t % P['boss_gap'] == 0 and fever == 0:
            nb += 1; al = [i for i in range(n) if hp[i] > 0]
            if al:
                if nb % P['aoe_every'] == 0:
                    for i in al: hp[i] -= aoe
                else: hp[rng.choice(al)] -= single
        down = [i for i in range(n) if hp[i] <= 0]
        if len(down) == n or (n == 1 and down): return out(0, '전멸')
        if down and rev == 0: return out(0, '부활 없음')
        for i in range(n):
            if hp[i] <= 0: continue
            alive_t[i] += 1
            atb[i] = min(P['atb'], atb[i] + (P['fever_atb'] if fever > 0 else 1))
            if busy[i] > 0:
                busy[i] -= 1
                if doing[i] == 'sub': solve_t[i] += 1
                if busy[i] == 0:
                    if doing[i] == 'atk':
                        if rng.random() < P['atk_hit']: hit(P['atk'], 'a')
                    else:
                        k = KS[qi[i]]
                        if rng.random() < p:
                            prog[i] += 1; solved[i] += 1; first = (wrong[i] == 0)
                            last = prog[i] == k
                            if mode == 'B': e[i] = 2 if first else 1
                            if mode == 'C': e[i] = min(5, e[i] + (2 if last and k >= 5 else 1))
                            if last:
                                if mode == 'A': e[i] = 2 if clean[i] else 1
                                if mode == 'C': tok[i] = 2 if clean[i] else 1
                                qi[i] = (qi[i] + 1) % len(KS); prog[i] = 0; clean[i] = True
                            if mode == 'B': wrong[i] = 0
                            else: wrong[i] = wrong[i]
                        else:
                            wrong[i] += 1; clean[i] = False
                            if wrong[i] >= 4: prog[i] = 0; wrong[i] = 0
                        if mode != 'B' and prog[i] == 0: wrong[i] = 0
                    doing[i] = None
                continue
            full = atb[i] >= P['atb']
            ready = e[i] > 0 and (mode != 'C' or eager or e[i] >= P.get('hoard', 3) or (up and tok[i] and sh.get(i, 0) > 0)
                                  or (fever > 0) or any(h <= 0 for h in hp))
            if full and ready:
                atb[i] = 0; fires[i] += 1
                dn = [j for j in range(n) if hp[j] <= 0]
                if dn and rev > 0:
                    rev -= 1; hp[dn[0]] = P['revive_hp']; e[i] = max(0, e[i] - 1) if mode == 'C' else 0
                    continue
                if mode == 'C':
                    if up and sh.get(i, 0) > 0 and tok[i]:
                        sh[i] -= min(tok[i], sh[i])
                        tok[i] = 0
                    hit(P['skill'] * MUL[e[i]] * P['timing_bonus'], 's')
                    e[i] = 0
                    if done or i not in sh: tok[i] = 0
                else:
                    c = e[i]; e[i] = 0
                    if up and sh.get(i, 0) > 0: sh[i] -= min(c, sh[i])
                    else: hit(P['skill'] * (P['A_mul'] if mode == 'A' else 1) * P['timing_bonus'] * (1.5 if c == 2 else 1), 's')
                if up and sum(sh.values()) == 0: up = False; done = True; fever = P['fever_sec']
            elif full and (masher or fever > 0 or rng.random() < P['atk_rate']):
                atb[i] = 0; busy[i] = P['atk_sec']; doing[i] = 'atk'
            elif not masher and fever == 0 and not (mode != 'C' and e[i] > 0):
                busy[i] = P['sub_sec']; doing[i] = 'sub'
        if boss <= 0: return out(1, '승리')
    return out(0, '시간')

def rate(n, p, P, mode, hpv, N, seed, **kw):
    rng = random.Random(seed); R = [run(n, p, P, mode, hpv, rng=rng, **kw) for _ in range(N)]
    W = [r for r in R if r['win']]
    m = lambda key, S=R: st.mean(r[key] for r in S) if S else float('nan')
    return dict(win=len(W) / N, t=m('t', W) / 60, share=m('share'), q=m('q', W), solve=m('solve'), gap=m('gap'))

def tune(n, P, mode, target=0.7, p=0.6):
    """정답률 60% 팀의 승률이 target 이 되는 보스 HP 를 찾음(안끼리 같은 어려움으로 맞춰 견줌)."""
    lo, hi = 40, 6000
    for _ in range(14):
        mid = (lo + hi) / 2
        if rate(n, p, P, mode, mid, 500, 11)['win'] > target: lo = mid
        else: hi = mid
    return round((lo + hi) / 2 / 10) * 10

def block(title, P, mode, hps, ps=(0.4, 0.6, 0.8), ns=(1, 2, 3, 4), N=1500, **kw):
    print(f"\n### {title}\n\n| 인원 | 보스 HP | 정답률 | 승률 | 판 길이(분) | 1인당 맞힌 소문항 | 문제 푸는 시간 | 스킬 간격(초) | 일반 공격 몫 |\n|---|---|---|---|---|---|---|---|---|")
    for n in ns:
        for p in ps:
            r = rate(n, p, P, mode, hps[n], N, 5, **kw)
            print(f"| {n} | {hps[n]} | {int(p*100)}% | {r['win']*100:.0f}% | {r['t']:.1f} | {r['q']:.1f} | {r['solve']*100:.0f}% | {r['gap']:.0f} | {r['share']*100:.0f}% |")

if __name__ == '__main__':
    P = dict(P0); P['A_mul'] = 3.75
    print('## 1. 충전 단위 3안 — 4인 · 일반 · 보스 공격 같음 · 「정답률 60% 팀 승률 70%」가 되게 보스 HP 를 맞춤')
    for mode, own in (('A', False), ('B', False), ('C', False), ('C', True)):
        Q = dict(P); Q['own_all'] = own
        hp4 = {4: tune(4, Q, mode)}
        block(f"안 {mode}" + (' · 실드 = 4명이 1칸씩' if own else ' · 실드 = 2명이 2칸씩'), Q, mode, hp4, ns=(4,))
    print('\n## 2. 난이도 3단 — 안 C · 실드 각자 1칸(1인 2칸) · 스킬 55 · 몰아치기')
    L = dict(P); L['skill'] = 55; L['own_all'] = True; L['shields'] = {1: 2, 2: 2, 3: 3, 4: 4}
    hpn = {n: tune(n, L, 'C') for n in (1, 2, 3, 4)}
    block('일반 (보스 공격 10 / 5 · 1인 7 / 3.5)', L, 'C', hpn)
    E = dict(L); E['single'] = 6; E['aoe'] = 3
    hpe = {n: round(hpn[n] * 70 / 85 / 10) * 10 for n in hpn}
    block('연습 (HP = 일반의 70/85 · 보스 공격 6 / 3)', E, 'C', hpe)
    D = dict(L); D['single'] = 13; D['aoe'] = 7
    hpd = {n: round(hpn[n] / 0.85 / 10) * 10 for n in hpn}
    block('도전 (HP = 일반 ÷ 0.85 · 보스 공격 13 / 7)', D, 'C', hpd, ps=(0.6, 0.8, 0.95))
    print('\n### 문제 0개(타이밍 바만) · 일반\n')
    for n in (1, 2, 3, 4):
        r = rate(n, 0.6, L, 'C', hpn[n], 300, 9, masher=True)
        print(f"- {n}인: 승률 {r['win']*100:.0f}%")
