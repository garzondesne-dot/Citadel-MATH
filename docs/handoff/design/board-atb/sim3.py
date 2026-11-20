#!/usr/bin/env python3
"""게시판 던전 ATB 모의 실험 3 — 역할 4종 · 인원별 숫자 (설계 방 · 2026-11-20)
정해진 규칙: ⚡ 모아 쏘기(최대 5 · 대장 단계 2) · 금색 ⚡ · 실드 각자 1칸(완주로만) · 약점 계열 = 친구 칸 하나 더
· 팀 부활 3번 · 약점 시간 12초(피해 2배 · ATB 2배) · 맞을 확률 균등 · 역할 스킬 = ⚡ 1개.
가정값(엔진 아님): 소문항 한 번 18초 · 타이밍 바 성공 80% · 전원 새내기(성장 배율 1.0) · 원문항 크기 3 · 4 · 5 · 3.
쓰기: python3 sim3.py
"""
import random, statistics as st

KS = [3, 4, 5, 3]
MUL = {1: 1.0, 2: 2.1, 3: 3.3, 4: 4.6, 5: 6.0}
ROLE = {  # HP · 방어율 · ATB 초
    'D': (100, 0.0, 8.0), 'T': (130, 0.2, 8.9), 'H': (90, 0.0, 8.4), 'S': (95, 0.0, 7.3)}
P0 = dict(sub_sec=18, atk=12, atk_hit=0.8, atk_sec=3, atk_rate=0.6, skill=55, timing=1.15,
          shield_cut=0.3, fever_sec=12, fever_mul=2.0, fever_atb=2.0, shield_at=0.7,
          boss_gap=12, single=14, aoe=7, aoe_every=3, revive_max=3, revive_hp=40,
          heal=25, cover=0.5, smash=1.5, limit=900, weak=0)

def run(roles, p, P, boss_hp, masher=False, rng=random):
    n = len(roles)
    mhp = [ROLE[r][0] for r in roles]; dfn = [ROLE[r][1] for r in roles]; spd = [ROLE[r][2] for r in roles]
    hp = mhp[:]; atb = [0.0] * n; e = [0] * n; gold = [0] * n; tok = [0] * n
    qi = [rng.randrange(4) for _ in range(n)]; prog = [0] * n; wrong = [0] * n; clean = [True] * n
    busy = [0] * n; doing = [None] * n; solved = [0] * n; solve_t = 0; alive_t = 0
    boss = H = boss_hp; sh = {i: 0 for i in range(n)}; up = done = False; fever = 0
    rev = P['revive_max']; da = ds = 0; nb = 0; t = 0; target = None; covered = set(); healed_last = False
    weak = set(range(P['weak']))

    def hit(d, kind):
        nonlocal boss, da, ds
        if up: d *= P['shield_cut']
        elif fever > 0: d *= P['fever_mul']
        floor = 1 if (up or not done or any(h <= 0 for h in hp)) else 0
        r = max(0, min(d, boss - floor)); boss -= r
        if kind == 'a': da += r
        else: ds += r

    def out(win, why):
        return dict(win=win, t=t, share=da / max(1, da + ds), q=sum(solved) / n, solve=solve_t / max(1, alive_t), why=why)

    while t < P['limit']:
        t += 1
        if fever > 0: fever -= 1
        if not done and not up and boss <= H * P['shield_at']:
            up = True
            for i in range(n): sh[i] = 1
        ph = t % P['boss_gap']
        if fever == 0 and ph == P['boss_gap'] - 2:                    # 2초 전 예고
            al = [i for i in range(n) if hp[i] > 0]
            target = None if (nb + 1) % P['aoe_every'] == 0 or not al else rng.choice(al)
        if fever == 0 and ph == 0:
            nb += 1; al = [i for i in range(n) if hp[i] > 0]
            if nb % P['aoe_every'] == 0:
                for i in al: hp[i] -= P['aoe'] * (1 - dfn[i])
            elif target is not None and hp[target] > 0:
                hp[target] -= P['single'] * (1 - dfn[target]) * (P['cover'] if target in covered else 1)
            covered.clear(); target = None
        down = [i for i in range(n) if hp[i] <= 0]
        if len(down) == n: return out(0, '전멸')
        if down and rev == 0: return out(0, '부활 없음')
        for i in range(n):
            if hp[i] <= 0: continue
            alive_t += 1
            atb[i] = min(spd[i], atb[i] + (P['fever_atb'] if fever > 0 else 1))
            if busy[i] > 0:
                busy[i] -= 1
                if doing[i] == 'sub': solve_t += 1
                if busy[i] == 0:
                    if doing[i] == 'atk':
                        if rng.random() < P['atk_hit']: hit(P['atk'], 'a')
                    else:
                        k = KS[qi[i]]
                        if rng.random() < p:
                            first = wrong[i] == 0 or prog[i] > 0 and clean[i]
                            prog[i] += 1; solved[i] += 1; last = prog[i] == k
                            add = 2 if (last and k >= 5) else 1
                            e[i] = min(5, e[i] + add)
                            if clean[i]: gold[i] = min(e[i], gold[i] + add)
                            if last:
                                tok[i] = 1; qi[i] = (qi[i] + 1) % 4; prog[i] = 0; wrong[i] = 0
                                if clean[i]: atb[i] = spd[i]            # 퍼펙트 완주 = ATB 가득
                                clean[i] = True
                        else:
                            wrong[i] += 1; clean[i] = False
                            if wrong[i] >= 4: prog[i] = 0; wrong[i] = 0
                    doing[i] = None
                continue
            full = atb[i] >= spd[i]; r = roles[i]
            if full and e[i] > 0 and not masher:
                dn = [j for j in range(n) if hp[j] <= 0]
                act = None
                if dn and rev > 0: act = 'revive'
                elif up and tok[i] and sh[i] > 0: act = 'skill'
                elif r == 'T' and target is not None and target not in covered and hp[target] < mhp[target] * 0.7: act = 'cover'
                elif r == 'H' and not healed_last and min(hp[j] / mhp[j] for j in range(n) if hp[j] > 0) < 0.55: act = 'heal'
                elif r == 'S' and any(j != i and hp[j] > 0 and atb[j] < spd[j] * 0.5 and (e[j] >= 3 or tok[j] and up and sh[j] > 0) for j in range(n)): act = 'cheer'
                elif r == 'D' and fever > 0 and e[i] <= 2: act = 'smash'
                elif e[i] >= 3 or fever > 0: act = 'skill'
                if act:
                    atb[i] = 0
                    if act == 'revive':
                        rev -= 1; hp[dn[0]] = P['revive_hp']; e[i] -= 1; gold[i] = min(gold[i], e[i])
                    elif act == 'cover': covered.add(target); e[i] -= 1; gold[i] = min(gold[i], e[i])
                    elif act == 'heal':
                        for j in range(n):
                            if hp[j] > 0: hp[j] = min(mhp[j], hp[j] + P['heal'])
                        e[i] -= 1; gold[i] = min(gold[i], e[i])
                    elif act == 'cheer':
                        j = max((j for j in range(n) if j != i and hp[j] > 0 and atb[j] < spd[j] * 0.5), key=lambda j: e[j])
                        atb[j] = spd[j]; e[i] -= 1; gold[i] = min(gold[i], e[i])
                    elif act == 'smash':
                        hit(P['skill'] * P['smash'] * P['timing'] * (1.5 if gold[i] else 1), 's'); e[i] -= 1; gold[i] = min(gold[i], e[i])
                    else:
                        if up and tok[i] and sh[i] > 0:
                            sh[i] = 0; tok[i] = 0
                            if i in weak:
                                rest = [o for o in sh if sh[o] > 0]
                                if rest: sh[rest[0]] = 0
                        hit(P['skill'] * MUL[e[i]] * (1 + 0.5 * gold[i] / e[i]) * P['timing'], 's'); e[i] = 0; gold[i] = 0
                        if done: tok[i] = 0
                        if up and sum(sh.values()) == 0: up = False; done = True; fever = P['fever_sec']
                    healed_last = act == 'heal' if r == 'H' else healed_last
                    continue
            if full and (masher or fever > 0 or rng.random() < P['atk_rate']):
                atb[i] = 0; busy[i] = P['atk_sec']; doing[i] = 'atk'
            elif not masher and fever == 0:
                busy[i] = P['sub_sec']; doing[i] = 'sub'
        if boss <= 0: return out(1, '승리')
    return out(0, '시간')

def rate(roles, p, P, hpv, N=1200, seed=5, **kw):
    rng = random.Random(seed); R = [run(roles, p, P, hpv, rng=rng, **kw) for _ in range(N)]
    W = [r for r in R if r['win']]
    m = lambda k, S: st.mean(r[k] for r in S) if S else float('nan')
    return dict(win=len(W) / N, t=m('t', W) / 60, q=m('q', W), share=m('share', R), solve=m('solve', R))

def tune(roles, P, target=0.7, p=0.6):
    lo, hi = 40, 6000
    for _ in range(13):
        mid = (lo + hi) / 2
        if rate(roles, p, P, mid, 400, 11)['win'] > target: lo = mid
        else: hi = mid
    return round((lo + hi) / 2 / 10) * 10

def rows(title, P, cases, ps=(0.4, 0.6, 0.8)):
    print(f"\n### {title}\n\n| 파티 | 보스 HP | 정답률 | 승률 | 판 길이(분) | 1인당 맞힌 소문항 | 일반 공격 몫 |\n|---|---|---|---|---|---|---|")
    for name, roles, hpv in cases:
        for p in ps:
            r = rate(roles, p, P, hpv)
            print(f"| {name} | {hpv} | {int(p*100)}% | {r['win']*100:.0f}% | {r['t']:.1f} | {r['q']:.1f} | {r['share']*100:.0f}% |")

NAME = {'D': '딜', 'T': '탱', 'H': '힐', 'S': '서'}
nm = lambda rs: '·'.join(NAME[r] for r in rs)

if __name__ == '__main__':
    P = dict(P0)
    print('## 1. 4인 · 일반 — 같은 보스(HP 1510 · 공격 14 / 7)에 역할 조합만 바꿈')
    rows('역할 조합', P, [(nm(r), list(r), 1510) for r in ('DDDD', 'TDDD', 'TDDS', 'DDHS', 'TDHS', 'THHS', 'SSSS', 'HHHH')])
    print('\n## 2. 인원별 숫자 — 「정답률 60% 팀 승률 70%」가 되는 보스 HP (대표 조합)')
    for label, P2, cases in (
        ('4인 · 보스 공격 14 / 7', P, ['TDHS', 'DDDD']),
        ('3인 · 보스 공격 14 / 7', P, ['TDH', 'DDD', 'DDS']),
        ('2인 · 보스 공격 11 / 5.5', dict(P, single=11, aoe=5.5), ['DD', 'TD', 'DH']),
        ('1인 · 보스 공격 6 / 3', dict(P, single=6, aoe=3), ['D', 'T', 'H', 'S']),
    ):
        rows(label, P2, [(nm(c), list(c), tune(list(c), P2)) for c in cases])
    print('\n## 3. 정한 숫자로 확인 — 일반 · 딜러만(가장 불리한 조합에 가까움) 기준 HP')
    FIX = {4: (1500, 14, 7), 3: (950, 14, 7), 2: (500, 11, 5.5), 1: (230, 6, 3)}
    for n, (hpv, s, a) in FIX.items():
        Q = dict(P, single=s, aoe=a)
        combos = {4: ['DDDD', 'TDHS', 'TDDS'], 3: ['DDD', 'TDH'], 2: ['DD', 'TH'], 1: ['D', 'T', 'H', 'S']}[n]
        rows(f'{n}인 · HP {hpv} · 공격 {s} / {a}', Q, [(nm(c), list(c), hpv) for c in combos])
    print('\n## 4. 문제 0개(타이밍 바만) · 정한 숫자\n')
    for n, (hpv, s, a) in FIX.items():
        r = rate(['D'] * n, 0.6, dict(P, single=s, aoe=a), hpv, 300, 9, masher=True)
        print(f"- {n}인: 승률 {r['win']*100:.0f}%")
