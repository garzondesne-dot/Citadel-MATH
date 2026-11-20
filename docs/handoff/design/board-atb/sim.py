#!/usr/bin/env python3
"""게시판 던전 ATB 모의 실험 (설계 방 · 2026-11-20)
1초 단위로 한 판을 흉내 냄. 숫자는 P 에 모아 둠(가정값 · 엔진 숫자 아님).
쓰기: python3 sim.py            → 표(모의실험.md 에 붙인 것)
"""
import random, statistics as st, sys

BASE = dict(
    hero_hp=100,
    atb=8,            # 용사 ATB 가 차는 초
    sub_n=3,          # 원문항 하나의 소문항 수(가정)
    sub_sec=18,       # 소문항 한 번 내는 데 걸리는 초(읽기 + 풀기 + 입력)
    atk=10,           # 일반 공격 피해
    atk_hit=0.8,      # 타이밍 바 성공률
    atk_sec=3,
    atk_rate=0.6,     # 소문항 사이에 ATB 가 차 있으면 타이밍 바를 누를 확률        # 타이밍 바 한 번에 쓰는 초(그동안 문제 못 풂)
    skill=40,         # 스킬 피해(실드 없을 때)
    shield_cut=0.3,   # 실드가 있을 때 받는 피해 배율
    break_sec=12, break_mul=2.0,   # 마지막 실드 파괴 뒤 약점 시간 · 배율
    shield_at=0.7,    # 보스 HP 가 이 비율이 되면 실드 펼침
    boss_gap=10,      # 보스 공격 간격(초)
    single=0.20, aoe=0.10, aoe_every=3,   # 단일 · 광역 피해(용사 최대 HP 비율) · 몇 번째마다 광역
    revive_max=3, revive_hp=0.4,
    heal=0.35,        # 힐러 역할 스킬 = 살아 있는 전원 회복 비율
    boss_hp={1: 260, 2: 520, 3: 800, 4: 1080},
    shields={1: 2, 2: 2, 3: 3, 4: 4},
    limit=900,        # 15분 넘으면 실패로 침
)

def run(n, p, P, healer=False, masher=False, rng=random):
    """한 판. masher=True 면 아무도 문제를 안 풀고 타이밍 바만 누름."""
    hp = [P['hero_hp']] * n
    atb = [0.0] * n
    charge = [0] * n          # 0 없음 · 1 일반 · 2 퍼펙트
    prog = [0] * n; wrong = [0] * n; perfect = [True] * n
    busy = [0] * n            # 지금 하는 일(소문항 풀이 · 타이밍 바)이 끝날 때까지 남은 초
    doing = [None] * n
    solved = [0] * n
    boss = P['boss_hp'][n]; H = boss
    sh_total = P['shields'][n]
    owners = list(range(min(2, n)))            # 실드 담당 최대 2명
    sh = {o: 0 for o in owners}; shield_up = False; shield_done = False
    brk = 0; revives = P['revive_max']; dmg_atk = dmg_sk = 0; nboss = 0; t = 0

    def hit(d, kind):
        nonlocal boss, dmg_atk, dmg_sk
        if shield_up: d *= P['shield_cut']
        elif brk > 0: d *= P['break_mul']
        floor = 1 if (shield_up or not shield_done or any(h <= 0 for h in hp)) else 0
        real = max(0, min(d, boss - floor)); boss -= real
        if kind == 'a': dmg_atk += real
        else: dmg_sk += real

    while t < P['limit']:
        t += 1
        if brk > 0: brk -= 1
        if not shield_done and not shield_up and boss <= H * P['shield_at']:
            shield_up = True
            for i in range(sh_total): sh[owners[i % len(owners)]] += 1
        # 보스 공격
        if t % P['boss_gap'] == 0 and brk == 0:
            nboss += 1; alive = [i for i in range(n) if hp[i] > 0]
            if alive:
                if nboss % P['aoe_every'] == 0:
                    for i in alive: hp[i] -= P['hero_hp'] * P['aoe']
                else:
                    hp[rng.choice(alive)] -= P['hero_hp'] * P['single']
            if all(h <= 0 for h in hp): return dict(win=0, t=t, a=dmg_atk, s=dmg_sk, q=solved, why='전멸')
            if any(h <= 0 for h in hp) and revives == 0 and not any(charge[i] for i in range(n) if hp[i] > 0):
                pass
        down = [i for i in range(n) if hp[i] <= 0]
        if n == 1 and down: return dict(win=0, t=t, a=dmg_atk, s=dmg_sk, q=solved, why='전멸')
        if down and revives == 0: return dict(win=0, t=t, a=dmg_atk, s=dmg_sk, q=solved, why='부활 없음')
        for i in range(n):
            if hp[i] <= 0: continue
            atb[i] = min(P['atb'], atb[i] + 1)
            if busy[i] > 0:
                busy[i] -= 1
                if busy[i] == 0:
                    if doing[i] == 'atk':
                        if rng.random() < P['atk_hit']: hit(P['atk'], 'a')
                    elif doing[i] == 'sub':
                        if rng.random() < p:
                            prog[i] += 1
                            if prog[i] == P['sub_n']:
                                charge[i] = 2 if perfect[i] else 1; solved[i] += 1
                                prog[i] = 0; wrong[i] = 0; perfect[i] = True
                        else:
                            wrong[i] += 1; perfect[i] = False
                            if wrong[i] >= 4: prog[i] = 0; wrong[i] = 0   # 새 변형
                    doing[i] = None
                continue
            # 할 일 고르기
            if atb[i] >= P['atb'] and charge[i]:
                atb[i] = 0; c = charge[i]; charge[i] = 0
                dn = [j for j in range(n) if hp[j] <= 0]
                if dn and revives > 0:
                    revives -= 1; hp[dn[0]] = P['hero_hp'] * P['revive_hp']
                elif healer and i == n - 1 and min(h for h in hp if h > 0) < P['hero_hp'] * 0.5:
                    for j in range(n):
                        if hp[j] > 0: hp[j] = min(P['hero_hp'], hp[j] + P['hero_hp'] * P['heal'])
                elif shield_up and sh.get(i, 0) > 0:
                    sh[i] -= min(c, sh[i])
                    if sum(sh.values()) == 0:
                        shield_up = False; shield_done = True; brk = P['break_sec']
                else:
                    hit(P['skill'], 's')
            elif atb[i] >= P['atb'] and (masher or charge[i] == 0 and rng.random() < P['atk_rate']):
                atb[i] = 0; busy[i] = P['atk_sec']; doing[i] = 'atk'
            elif not masher and charge[i] == 0:
                busy[i] = P['sub_sec']; doing[i] = 'sub'
        if boss <= 0: return dict(win=1, t=t, a=dmg_atk, s=dmg_sk, q=solved, why='승리')
    return dict(win=0, t=t, a=dmg_atk, s=dmg_sk, q=solved, why='시간')

def table(P, healer=False, N=2000, seed=1):
    rng = random.Random(seed); rows = []
    for n in (1, 2, 3, 4):
        for p in (0.4, 0.6, 0.8):
            R = [run(n, p, P, healer=healer and n > 1, rng=rng) for _ in range(N)]
            W = [r for r in R if r['win']]
            win = len(W) / N
            tm = st.mean(r['t'] for r in W) / 60 if W else float('nan')
            share = st.mean(r['a'] / max(1, r['a'] + r['s']) for r in R)
            q = st.mean(sum(r['q']) / n for r in R)
            rows.append((n, p, win, tm, share, q))
    return rows

def show(title, rows):
    print(f"\n### {title}\n\n| 인원 | 소문항 정답률 | 승률 | 이긴 판 길이(분) | 일반 공격 몫 | 1인당 푼 원문항 |\n|---|---|---|---|---|---|")
    for n, p, w, tm, sh, q in rows:
        print(f"| {n} | {int(p*100)}% | {w*100:.0f}% | {tm:.1f} | {sh*100:.0f}% | {q:.1f} |")

if __name__ == '__main__':
    show('A. 처음 숫자(가정값) · 힐러 없음', table(BASE))
    show('A-2. 처음 숫자 · 힐러 1명(2인 이상)', table(BASE, healer=True))
    rng = random.Random(7)
    print('\n### B. 문제 0개(타이밍 바만) 로 깨지는가\n\n| 인원 | 승률 | 끝난 까닭 |\n|---|---|---|')
    for n in (1, 2, 3, 4):
        R = [run(n, 0.6, BASE, masher=True, rng=rng) for _ in range(500)]
        why = {}
        for r in R: why[r['why']] = why.get(r['why'], 0) + 1
        print(f"| {n} | {sum(r['win'] for r in R)/5:.0f}% | {why} |")
    if len(sys.argv) > 1:
        import json; T = dict(BASE); T.update(json.loads(sys.argv[1]))
        show('C. 고친 숫자 · 힐러 없음', table(T)); show('C-2. 고친 숫자 · 힐러 1명', table(T, healer=True))
