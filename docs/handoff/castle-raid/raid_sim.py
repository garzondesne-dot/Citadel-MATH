#!/usr/bin/env python3
"""🏰 성채 레이드 모의 실험 — 설계 방 · 2026-11-22
⚠ 진짜 엔진(src/board/atb/engine.ts · bots.ts)은 이 방에서 읽을 수 없음(베타 저장소) → 11/22 규칙을 따라 쓴 「어림 모형」.
   먼저 일반 게시판 판(4인 · HP 3800 · 실드 2칸 70% · 분노 30%)이 LEN-35 표(승률 ~70% · 이긴 판 ~3.5분)에 맞도록
   모형의 두 값(소문항 푸는 시간 · 보스 기본 피해)을 맞춘 뒤, 그 위에 레이드 규칙을 얹음. 손발이 진짜 엔진으로 다시 맞출 것.
규칙(11/22): 충전 = 소문항 첫 시도 +1 · 한 번 틀린 뒤 ½ · 두 번 이상 0 · 원문항 퍼펙트 +1 & ATB 가득 · 최대 4 · 시작 1
  스킬 1 = 구슬 1 ×1 / 스킬 2 = 구슬 2 ×1.7 · 속성이 맞으면 실드 1칸 / 문제 푸는 동안 기본 공격 자동(×1)
  실드 = 남은 동안 피해 ×0.3(2막 ×0.2) · 다 깨면 무방비 12초(피해 ×2 · ATB ×2) · 속성 없는 칸 = 📜 도움표(실드 중 원문항 완주 1장)
  보스 = 12초마다 단일 · 단일 · 광역 / 분노 = 9초 · ×1.2 / 반응 막기(봇 70%) 단일 = 탱커 엄호 ×0.5 · 광역 = 서포터 ×0.7 / 한 방 상한 60%
  힐러 큰 힐 90%(구슬 1) · 응급붕대 ⅓(구슬 1) · 부활 구슬 2(힐러 1) 체력 30% · 패배 = 전멸 · 도망 = limit
쓰기: python3 raid_sim.py
"""
import random, statistics as st
ROLE = {'D': (100, 0.0, 8.0), 'T': (130, 0.2, 8.9), 'H': (90, 0.0, 8.4), 'S': (95, 0.0, 7.3)}
FAMS = ['arms', 'flame', 'nature', 'wisdom', 'mystic']
BASE = dict(sub_sec=17, atk=12, skill=140, s2=1.7, weak_sec=12, weak_mul=2.0, gap=12, rage_gap=9, rage_mul=1.2, rage_at=0.3,
            single=27.5, aoe=13.75, cap=0.6, react=0.7, cmax=4, limit=600, hurry_at=420, hurry=0.8,
            acts=[(0.7, 2, 0.3)],        # (뜨는 HP 비율, 칸 수, 실드 중 피해 배율)
            rage_from_act=None,           # n번째 실드가 뜰 때부터 분노(레이드 2막) · None = HP 30%
            items=[3, 3, 4, 3], hard=0.0, slow=0, gain=1.0)   # gain = 소문항 첫 시도 정답 구슬(레이드 큰 구슬 = 2)  # 원문항별 소문항 수 · 정답률 깎임 · 소문항 시간 더함

def run(P, ppl, p_h, hp0, rng, p_bot=0.65, cover=True):
    n = 4
    roles = ['D', 'T', 'H', 'S'] if rng.random() < 0.6 else [rng.choice('DTHS') for _ in range(4)]
    rng.shuffle(roles)
    fam = [rng.choice(FAMS) for _ in range(n)]
    acc = [p_h if i < ppl else p_bot for i in range(n)]
    acc = [max(0.2, a - P['hard']) for a in acc]
    mhp = [ROLE[r][0] for r in roles]; dfn = [ROLE[r][1] for r in roles]; spd = [ROLE[r][2] for r in roles]
    hp = mhp[:]; atb = [0.0] * n; c = [1.0] * n
    qi = [rng.randrange(len(P['items'])) for _ in range(n)]; prog = [0] * n; miss = [0] * n; clean = [True] * n; left = [P['sub_sec'] + P['slow']] * n
    boss = float(hp0); acts = list(P['acts']); ai = 0; slots = []; cut = 1.0; weak = 0; tickets = 0; rage = False
    t = 0; nb = 0; nxt = P['gap']; target = None; log = dict(act=[], brk=[])
    def start_act():
        nonlocal slots, cut, ai, rage
        at, k, m = acts[ai]; cut = m
        want = FAMS[:]; rng.shuffle(want); slots = want[:k] if k <= 5 else want
        if cover:   # 빈자리 봇 = 비어 있는 실드 속성부터
            for i in range(ppl, n):
                lack = [s for s in slots if s not in fam[:i]]
                if lack: fam[i] = lack[0]
        log['act'].append(t); ai += 1
        if P['rage_from_act'] is not None and ai >= P['rage_from_act']: rage = True
    def dmg(d):
        nonlocal boss
        if slots: d *= cut
        elif weak > 0: d *= P['weak_mul']
        floor = (acts[ai - 1][0] * hp0 * 0 + 1) if slots else 0
        boss = max(floor, boss - d)
    while t < P['limit']:
        t += 1
        if weak > 0: weak -= 1
        if not slots and ai < len(acts) and boss <= hp0 * acts[ai][0]: start_act()
        if not rage and boss <= hp0 * P['rage_at']: rage = True
        # 보스 공격
        if weak == 0:
            nxt -= 1
            if nxt <= 0:
                nb += 1; mul = P['rage_mul'] if rage else 1; al = [i for i in range(n) if hp[i] > 0]
                g = P['rage_gap'] if rage else P['gap']
                if t >= P['hurry_at']: g *= P['hurry']
                nxt = g
                if al:
                    if nb % 3 == 0:
                        blk = any(roles[i] == 'S' and hp[i] > 0 and c[i] >= 1 for i in range(n)) and rng.random() < P['react']
                        if blk:
                            j = next(i for i in range(n) if roles[i] == 'S' and hp[i] > 0 and c[i] >= 1); c[j] -= 1
                        for i in al: hp[i] -= min(mhp[i] * P['cap'], P['aoe'] * mul * (0.7 if blk else 1) * (1 - dfn[i]))
                    else:
                        tg = rng.choice(al); d = P['single'] * mul
                        tk = [i for i in range(n) if roles[i] == 'T' and hp[i] > 0 and c[i] >= 1 and i != tg]
                        if tk and rng.random() < P['react']:
                            c[tk[0]] -= 1; hp[tk[0]] -= min(mhp[tk[0]] * P['cap'], d * 0.5 * (1 - dfn[tk[0]]))
                        else: hp[tg] -= min(mhp[tg] * P['cap'], d * (1 - dfn[tg]))
        if all(h <= 0 for h in hp): return dict(win=0, t=t, flee=0, **log)
        for i in range(n):
            if hp[i] <= 0: continue
            atb[i] = min(spd[i], atb[i] + (2 if weak > 0 else 1))
            # 문제 풀이(늘 진행 · 충전이 가득이면 쉼)
            if c[i] < P['cmax']:
                left[i] -= 1
                if left[i] <= 0:
                    left[i] = P['sub_sec'] + P['slow']; k = P['items'][qi[i]]
                    if rng.random() < acc[i]:
                        c[i] = min(P['cmax'], c[i] + P['gain'] * (1 if miss[i] == 0 else 0.5 if miss[i] == 1 else 0)); prog[i] += 1; miss[i] = 0
                        if prog[i] >= k:
                            if clean[i]: c[i] = min(P['cmax'], c[i] + 1); atb[i] = spd[i]
                            if slots: tickets += 1
                            qi[i] = (qi[i] + 1) % len(P['items']); prog[i] = 0; clean[i] = True
                    else:
                        miss[i] += 1; clean[i] = False
                        if miss[i] >= 3: prog[i] += 1; miss[i] = 0   # ⏭ 넘기기
                        if prog[i] >= k: qi[i] = (qi[i] + 1) % len(P['items']); prog[i] = 0; clean[i] = True
            if atb[i] < spd[i]: continue
            r = roles[i]; down = [j for j in range(n) if hp[j] <= 0]
            low = min((j for j in range(n) if hp[j] > 0), key=lambda j: hp[j] / mhp[j])
            if hp[low] / mhp[low] < 0.35 and c[i] >= 1:
                c[i] -= 1; atb[i] = 0; hp[low] = min(mhp[low], hp[low] + mhp[low] * (0.9 if r == 'H' else 1 / 3)); continue
            if down and c[i] >= (1 if r == 'H' else 2):
                c[i] -= (1 if r == 'H' else 2); atb[i] = 0; hp[down[0]] = mhp[down[0]] * 0.3; continue
            if slots:
                if fam[i] in slots and c[i] >= 2:
                    c[i] -= 2; atb[i] = 0; slots.remove(fam[i]); dmg(P['skill'] * P['s2']); log['brk'].append(t)
                elif tickets > 0 and not any(fam[j] in slots and hp[j] > 0 for j in range(n)):
                    tickets -= 1; slots.pop(); log['brk'].append(t)
                elif fam[i] in slots: atb[i] = 0; dmg(P['atk'])      # 구슬 모으는 중 = 기본 공격
                elif tickets > 0 and c[i] < 2 and not any(fam[j] in slots and hp[j] > 0 and c[j] >= 1 for j in range(n)):
                    tickets -= 1; slots.pop(); log['brk'].append(t)
                else: atb[i] = 0; dmg(P['atk'])
                if not slots: weak = P['weak_sec']; log['brk'].append(-t)
                continue
            if c[i] >= 2 and (weak > 0 or c[i] >= 3): c[i] -= 2; atb[i] = 0; dmg(P['skill'] * P['s2'])
            elif c[i] >= 1 and weak == 0 and c[i] < 2 and left[i] > 6: c[i] -= 1; atb[i] = 0; dmg(P['skill'])
            elif c[i] >= 1 and weak > 0: c[i] -= 1; atb[i] = 0; dmg(P['skill'])
            else: atb[i] = 0; dmg(P['atk'])
        if boss <= 0: return dict(win=1, t=t, flee=0, **log)
    return dict(win=0, t=t, flee=1, **log)

def rate(P, ppl, p_h, hp0, N=400, seed=3, **kw):
    rng = random.Random(seed * 1000 + ppl * 10 + int(p_h * 100)); R = [run(P, ppl, p_h, hp0, rng, **kw) for _ in range(N)]
    W = [r for r in R if r['win']]; m = lambda xs: st.mean(xs) if xs else float('nan')
    out = dict(win=len(W) / N, tw=m([r['t'] for r in W]) / 60, t=m([r['t'] for r in R]) / 60, flee=m([r['flee'] for r in R]))
    for k in range(len(P['acts'])):
        up = [r['act'][k] for r in R if len(r['act']) > k]; dn = []
        for r in R:
            ends = [-x for x in r['brk'] if x < 0]
            if len(ends) > k: dn.append(ends[k] - r['act'][k])
        out[f'up{k}'] = m(up) / 60; out[f'brk{k}'] = m(dn); out[f'clr{k}'] = len(dn) / max(1, len(up))
    return out

def tune_hp(P, ppl, p_h, target, lo=300, hi=40000):
    for _ in range(12):
        mid = (lo + hi) / 2
        if rate(P, ppl, p_h, mid, 200, 9)['win'] > target: lo = mid
        else: hi = mid
    return round((lo + hi) / 2 / 50) * 50

if __name__ == '__main__':
    import sys
    P = dict(BASE)
    print('## 0. 모형 맞춤 — 일반 게시판 판(HP 3800 · 실드 2칸 70% · 분노 30%) · 「보통 학생」 정답률 65%\n')
    print('| 사람 수 | 승률 | 이긴 판(분) | 전체(분) | 도망 | 실드 뜸(분) | 실드 깨는 데(초) |\n|---|---|---|---|---|---|---|')
    for ppl in (4, 2, 1):
        r = rate(P, ppl, 0.65, 3800)
        print(f"| {ppl} | {r['win']*100:.0f}% | {r['tw']:.1f} | {r['t']:.1f} | {r['flee']*100:.0f}% | {r['up0']:.1f} | {r['brk0']:.0f} |")
