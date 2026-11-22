#!/usr/bin/env python3
"""땅따먹기(반 전체 3분 미니게임) 모의 실험 — 설계 방 · 2026-11-22
규칙: 정사각 격자 · 4팀 · 턴마다 모두 동시에 상하좌우 한 칸 · 밟은 칸 = 내 팀 색
     다른 팀과 같은 칸에 들어가면 둘 다 튕겨 제자리(칸은 그대로) · 같은 팀은 겹쳐도 됨
     ⭐ 별 칸: 6턴마다 3개 생김 · 밟으면 둘레 3×3 을 내 팀 색으로
봇(가정): 80% = 가까운 「내 색 아닌 칸」 쪽으로 · 20% = 아무 쪽 · 안 누름 10% = 지난 방향 그대로
쓰기: python3 sim.py
"""
import random, statistics as st
D = [(0, -1), (0, 1), (-1, 0), (1, 0)]

def play(n, size, turns=30, star=True, rng=random, snap=False):
    team = [i % 4 for i in range(n)]
    cs = [(1, 1), (size - 2, size - 2), (size - 2, 1), (1, size - 2)]
    pos = []; last = [rng.randrange(4) for _ in range(n)]
    for i in range(n):
        cx, cy = cs[team[i]]; k = i // 4
        pos.append((min(size - 1, max(0, cx + (k % 3 - 1))), min(size - 1, max(0, cy + (k // 3 % 3 - 1)))))
    own = {}; stars = set(); bumps = 0; moves = 0; lead_changes = 0; lead = None
    for p, t in zip(pos, team): own[p] = t
    for turn in range(1, turns + 1):
        if star and turn % 6 == 1 and turn > 1:
            for _ in range(3): stars.add((rng.randrange(size), rng.randrange(size)))
        want = []
        for i in range(n):
            x, y = pos[i]
            if rng.random() < 0.1: d = last[i]
            elif rng.random() < 0.2: d = rng.randrange(4)
            else:
                best = None
                for d2 in rng.sample(range(4), 4):
                    nx, ny = x + D[d2][0], y + D[d2][1]
                    if not (0 <= nx < size and 0 <= ny < size): continue
                    sc = 3 if (nx, ny) in stars else 2 if own.get((nx, ny), -1) not in (-1, team[i]) else 1 if (nx, ny) not in own else 0
                    if best is None or sc > best[0]: best = (sc, d2)
                d = best[1]
                if best[0] == 0:   # 둘레가 다 내 색 → 가장 가까운 남의 칸 쪽
                    tg = min(((abs(a - x) + abs(b - y), a, b) for a in range(size) for b in range(size) if own.get((a, b), -1) != team[i]), default=None)
                    if tg:
                        _, a, b = tg
                        d = (3 if a > x else 2) if abs(a - x) >= abs(b - y) and a != x else (1 if b > y else 0)
            last[i] = d; nx, ny = x + D[d][0], y + D[d][1]
            want.append((nx, ny) if 0 <= nx < size and 0 <= ny < size else (x, y))
        for i in range(n):
            moves += 1
            rivals = [j for j in range(n) if j != i and want[j] == want[i] and team[j] != team[i]]
            if rivals and want[i] != pos[i]: bumps += 1; continue
            if rivals: continue
            pos[i] = want[i]
        for i in range(n):
            if any(j != i and pos[j] == pos[i] and team[j] != team[i] for j in range(n)): continue
            own[pos[i]] = team[i]
            if pos[i] in stars:
                stars.discard(pos[i]); x, y = pos[i]
                for a in range(x - 1, x + 2):
                    for b in range(y - 1, y + 2):
                        if 0 <= a < size and 0 <= b < size: own[(a, b)] = team[i]
        sc = [sum(1 for v in own.values() if v == t) for t in range(4)]
        l = max(range(4), key=lambda t: sc[t])
        if lead is not None and l != lead: lead_changes += 1
        lead = l
    sc = sorted((sum(1 for v in own.values() if v == t) for t in range(4)), reverse=True)
    r = dict(fill=len(own) / size ** 2, bump=bumps / moves, gap=(sc[0] - sc[1]) / size ** 2, tie=sc[0] == sc[1], lead=lead_changes, top=sc[0] / size ** 2, low=sc[3] / size ** 2)
    return (r, own, pos, team) if snap else r

if __name__ == '__main__':
    rng = random.Random(7)
    print('| 인원 | 판 크기 | 칠해진 칸 | 튕김(한 번 움직일 때) | 1등 팀 몫 | 꼴찌 팀 몫 | 1 · 2등 차이 | 선두 바뀜(판당) | 동점 |\n|---|---|---|---|---|---|---|---|---|')
    for n in (8, 12, 16, 20, 24, 28, 32):
        for size in (7, 9, 11, 13):
            R = [play(n, size, rng=rng) for _ in range(300)]
            m = lambda k: st.mean(r[k] for r in R)
            print(f"| {n} | {size}×{size} | {m('fill')*100:.0f}% | {m('bump')*100:.0f}% | {m('top')*100:.0f}% | {m('low')*100:.0f}% | {m('gap')*100:.1f}%p | {m('lead'):.1f} | {m('tie')*100:.0f}% |")
