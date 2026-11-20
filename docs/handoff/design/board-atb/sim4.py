#!/usr/bin/env python3
"""게시판 던전 ATB 모의 실험 4 — 새 충전 규칙(묶음 #4 · 설계 방 · 2026-11-20)
한 문제(원문항)를 통째로 맞혀야 충전: 퍼펙트 2개 · 재시도 1개 · 최대 3개.
스킬 비용: 보호막 부수기 1 · 장착 스킬 1 · 역할 스킬 1 · 부활 1 (4레벨 2 · 오라 방패 2 · 각성 3 = 새내기 판에는 없음).
실드 각자 1칸(충전 1개로 자기 칸을 깸) · 팀 부활 3번 · 약점 시간 12초 · 힐 +12(팀 단위로 보스 공격 한 번 사이 1번).
가정값(엔진 아님): 소문항 한 번 18초 · 타이밍 바 성공 80% · 전원 새내기 · 채점 연출 2초.
쓰기: python3 sim4.py
"""
import random, statistics as st

ROLE = {'D': (100, 0.0, 8.0), 'T': (130, 0.2, 8.9), 'H': (90, 0.0, 8.4), 'S': (95, 0.0, 7.3)}
PACK = {2: [4, 2, 3, 2], 5: [3, 3, 4, 2], 11: [3, 4, 5, 3], 0: [3, 3, 3, 3]}   # 차시별 원문항의 소문항 수(0 = 보통)
P0 = dict(sub_sec=18, grade_sec=2, atk=12, atk_hit=0.8, atk_sec=3, atk_rate=0.6, skill=140, tap=1.25,
          shield_cut=0.3, fever_sec=12, fever_mul=2.0, fever_atb=2.0, shield_at=0.7,
          boss_gap=12, single=14, aoe=7, aoe_every=3, revive_max=3, revive_hp=0.3,
          heal=12, cover=0.5, smash=1.5, limit=900, cmax=3, perfect=2, retry=1)

def run(roles, p, P, boss_hp, ks, masher=False, rng=random):
    n = len(roles)
    mhp = [ROLE[r][0] for r in roles]; dfn = [ROLE[r][1] for r in roles]; spd = [ROLE[r][2] for r in roles]
    hp = mhp[:]; atb = [0.0] * n; c = [0] * n
    qi = [rng.randrange(len(ks)) for _ in range(n)]; prog = [0] * n; wrong = [0] * n; clean = [True] * n
    busy = [0] * n; doing = [None] * n; solved = [0] * n; fires = 0; solve_t = 0; alive_t = 0
    boss = H = boss_hp; sh = {i: 0 for i in range(n)}; up = done = False; fever = 0
    rev = P['revive_max']; da = ds = 0; nb = 0; t = 0; target = None; covered = set(); heal_ok = True

    def hit(d, kind):
        nonlocal boss, da, ds
        if up: d *= P['shield_cut']
        elif fever > 0: d *= P['fever_mul']
        floor = 1 if (up or not done or any(h <= 0 for h in hp)) else 0
        r = max(0, min(d, boss - floor)); boss -= r
        if kind == 'a': da += r
        else: ds += r

    def out(win, why):
        return dict(win=win, t=t, share=da / max(1, da + ds), q=sum(solved) / n, fires=fires / n,
                    gap=alive_t / max(1, fires), why=why)

    while t < P['limit']:
        t += 1
        if fever > 0: fever -= 1
        if not done and not up and boss <= H * P['shield_at']:
            up = True
            for i in range(n): sh[i] = 1
        ph = t % P['boss_gap']
        if fever == 0 and ph == P['boss_gap'] - 2:
            al = [i for i in range(n) if hp[i] > 0]
            target = None if (nb + 1) % P['aoe_every'] == 0 or not al else rng.choice(al)
        if fever == 0 and ph == 0:
            nb += 1; al = [i for i in range(n) if hp[i] > 0]
            if nb % P['aoe_every'] == 0:
                for i in al: hp[i] -= P['aoe'] * (1 - dfn[i])
            elif target is not None and hp[target] > 0:
                hp[target] -= P['single'] * (1 - dfn[target]) * (P['cover'] if target in covered else 1)
            covered.clear(); target = None; heal_ok = True
        down = [i for i in range(n) if hp[i] <= 0]
        if len(down) == n: return out(0, '전멸')
        if down and rev == 0: return out(0, '부활 없음')
        for i in range(n):
            if hp[i] <= 0: continue
            alive_t += 1
            atb[i] = min(spd[i], atb[i] + (P['fever_atb'] if fever > 0 else 1))
            if busy[i] > 0:
                busy[i] -= 1
                if busy[i] == 0:
                    if doing[i] == 'atk':
                        if rng.random() < P['atk_hit']: hit(P['atk'], 'a')
                    elif doing[i] == 'sub':
                        k = ks[qi[i]]
                        if rng.random() < p:
                            prog[i] += 1; solved[i] += 1
                            if prog[i] == k:
                                c[i] = min(P['cmax'], c[i] + (P['perfect'] if clean[i] else P['retry']))
                                qi[i] = (qi[i] + 1) % len(ks); prog[i] = 0; wrong[i] = 0; clean[i] = True
                                busy[i] = P['grade_sec']; doing[i] = 'grade'; continue
                        else:
                            wrong[i] += 1; clean[i] = False
                            if wrong[i] >= 4: prog[i] = 0; wrong[i] = 0
                    doing[i] = None
                continue
            full = atb[i] >= spd[i]; r = roles[i]
            if full and c[i] > 0 and not masher:
                dn = [j for j in range(n) if hp[j] <= 0]; act = None
                if dn and rev > 0: act = 'revive'
                elif up and sh[i] > 0: act = 'break'
                elif r == 'T' and target is not None and target not in covered and hp[target] < mhp[target] * 0.6: act = 'cover'
                elif r == 'H' and heal_ok and min(hp[j] / mhp[j] for j in range(n) if hp[j] > 0) < 0.55: act = 'heal'
                elif r == 'S' and any(j != i and hp[j] > 0 and c[j] > 0 and atb[j] < spd[j] * 0.4 for j in range(n)) and c[i] >= 2: act = 'cheer'
                elif r == 'D' and fever > 0: act = 'smash'
                elif not up or sh[i] == 0: act = 'skill'
                if act:
                    atb[i] = 0; c[i] -= 1; fires += 1
                    if act == 'revive': rev -= 1; hp[dn[0]] = mhp[dn[0]] * P['revive_hp']
                    elif act == 'break':
                        sh[i] = 0
                        if sum(sh.values()) == 0: up = False; done = True; fever = P['fever_sec']
                    elif act == 'cover': covered.add(target)
                    elif act == 'heal':
                        heal_ok = False
                        for j in range(n):
                            if hp[j] > 0: hp[j] = min(mhp[j], hp[j] + P['heal'])
                    elif act == 'cheer':
                        j = max((j for j in range(n) if j != i and hp[j] > 0 and c[j] > 0 and atb[j] < spd[j] * 0.4), key=lambda j: c[j]); atb[j] = spd[j]
                    else: hit(P['skill'] * P['tap'] * (P['smash'] if act == 'smash' else 1), 's')
                    continue
            if full and (masher or fever > 0 or rng.random() < P['atk_rate']):
                atb[i] = 0; busy[i] = P['atk_sec']; doing[i] = 'atk'
            elif not masher and fever == 0 and c[i] < P['cmax']:
                busy[i] = P['sub_sec']; doing[i] = 'sub'; solve_t += P['sub_sec']
        if boss <= 0: return out(1, '승리')
    return out(0, '시간')

def rate(roles, p, P, hpv, ks, N=1000, seed=5, **kw):
    rng = random.Random(seed); R = [run(roles, p, P, hpv, ks, rng=rng, **kw) for _ in range(N)]
    W = [r for r in R if r['win']]
    m = lambda k, S: st.mean(r[k] for r in S) if S else float('nan')
    return dict(win=len(W) / N, t=m('t', W) / 60, q=m('q', W), share=m('share', R), fires=m('fires', W), gap=m('gap', R))

def tune(roles, P, ks, target=0.7, p=0.6):
    lo, hi = 40, 8000
    for _ in range(13):
        mid = (lo + hi) / 2
        if rate(roles, p, P, mid, ks, 350, 11)['win'] > target: lo = mid
        else: hi = mid
    return round((lo + hi) / 2 / 10) * 10

HEAD = "| 조건 | 보스 HP | 정답률 | 승률 | 판 길이(분) | 1인당 소문항 | 1인당 스킬 수 | 스킬 간격(초) | 일반 공격 몫 |\n|---|---|---|---|---|---|---|---|---|"
def line(name, roles, P, hpv, ks, ps=(0.4, 0.6, 0.8)):
    for p in ps:
        r = rate(roles, p, P, hpv, ks)
        print(f"| {name} | {hpv} | {int(p*100)}% | {r['win']*100:.0f}% | {r['t']:.1f} | {r['q']:.1f} | {r['fires']:.1f} | {r['gap']:.0f} | {r['share']*100:.0f}% |")

if __name__ == '__main__':
    P = dict(P0); K = PACK[0]
    print('## 1. 충전 양 견주기 — 4인 딜러 · 보통 차시(소문항 3개씩) · 스킬 140 · 보스 공격 14 / 7 · 승률 70% 가 되는 HP\n'); print(HEAD)
    for name, pf, rt in (('퍼펙트 2 · 재시도 1 (확정)', 2, 1), ('퍼펙트 1 · 재시도 0.5', 1, 0.5), ('퍼펙트 3 · 재시도 1', 3, 1)):
        Q = dict(P, perfect=pf, retry=rt); h = tune(['D'] * 4, Q, K); line(name, ['D'] * 4, Q, h, K)
    print('\n## 2. 인원별 — 보통 차시 · 딜러만 · 승률 70% 가 되는 HP\n'); print(HEAD)
    HIT = {4: (14, 7), 3: (14, 7), 2: (11, 5.5), 1: (6, 3)}; BASE = {}
    for n in (4, 3, 2, 1):
        Q = dict(P, single=HIT[n][0], aoe=HIT[n][1]); BASE[n] = tune(['D'] * n, Q, K); line(f'{n}인 · 공격 {HIT[n][0]}/{HIT[n][1]}', ['D'] * n, Q, BASE[n], K)
    print('\n## 3. 차시별 — 같은 HP 에서 문항 길이만 바꿈(4인 · 2인 · 1인 · 정답률 60%)\n')
    print('| 차시(소문항 수) | 4인 승률 · 분 | 2인 승률 · 분 | 1인 승률 · 분 | 승률 70% 가 되는 HP (1 · 2 · 3 · 4인) |\n|---|---|---|---|---|')
    for ch in (2, 5, 0, 11):
        ks = PACK[ch]; cells = []
        for n in (4, 2, 1):
            Q = dict(P, single=HIT[n][0], aoe=HIT[n][1]); r = rate(['D'] * n, 0.6, Q, BASE[n], ks); cells.append(f"{r['win']*100:.0f}% · {r['t']:.1f}")
        hs = [tune(['D'] * n, dict(P, single=HIT[n][0], aoe=HIT[n][1]), ks) for n in (1, 2, 3, 4)]
        print(f"| {'보통' if ch == 0 else str(ch) + '차시'} ({'·'.join(map(str, ks))}) | {cells[0]} | {cells[1]} | {cells[2]} | {' · '.join(map(str, hs))} |")
    print('\n## 4. 역할 조합 — 4인 · 보통 차시 · 2절의 4인 HP\n'); print(HEAD)
    for cmb in ('DDDD', 'TDDD', 'TDHS', 'DDHS', 'SSSS', 'HHHH'):
        line('·'.join({'D': '딜', 'T': '탱', 'H': '힐', 'S': '서'}[x] for x in cmb), list(cmb), P, BASE[4], K, ps=(0.4, 0.6, 0.8))
    print('\n## 5. 문제 0개(타이밍 바만)\n')
    for n in (4, 3, 2, 1):
        Q = dict(P, single=HIT[n][0], aoe=HIT[n][1]); r = rate(['D'] * n, 0.6, Q, BASE[n], K, 300, 9, masher=True)
        print(f"- {n}인: 승률 {r['win']*100:.0f}%")
