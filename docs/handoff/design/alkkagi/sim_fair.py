"""알까기 — 「앞선 편이 끝내 이기는 비율」이 50% 에 가까운 차례 규칙 찾기. python3 sim_fair.py [판 수]"""
import math, random, sys
from sim_square import settle
from sim_order import shoot
def play(n, rng, W, H, mode, cap=90):
    st = []
    for t in (0, 1):
        sgn = -1 if t == 0 else 1; row1 = (n + 1) // 2
        for i in range(n):
            r, k, m = (0, i, row1) if i < row1 else (1, i - row1, n - row1)
            st.append(dict(x=(k - (m - 1) / 2) * min(2.4, (2 * W - 2.0) / m), y=sgn * (H - 1.6 - r * 1.8), vx=0, vy=0, on=True, t=t, shot=False, mark=False, first=None,
                           sk=0.25 * rng.choice([0.5, 1, 1, 2]), act=rng.random() > 0.1))
    cnt = lambda: [sum(1 for s in st if s['on'] and s['t'] == t) for t in (0, 1)]
    steps = rnd = 0; lead1 = None; last_second = 1
    def fire(grp):
        nonlocal steps
        for s in st: s['shot'] = False
        for t in grp: shoot(st, t, rng)
        settle(st, W, H, True, True); steps += 1
    while steps < cap:
        rnd += 1; c = cnt(); few = 0 if c[0] < c[1] else 1; gap = abs(c[0] - c[1])
        if mode == 'A': order = [[0], [1]]
        elif rnd == 1: order = [[0, 1]]
        elif mode == 'B': order = [[few], [1 - few]] if gap else [[1 - last_second], [last_second]]            # 뒤진 편 먼저 · 같으면 지난번 나중에 쏜 편이 먼저
        elif gap == 0: order = [[0, 1]] if mode in 'CEF' else [[last_second], [1 - last_second]]
        else:
            order = [[few], [1 - few]]
            if (mode == 'E' and gap >= 3) or (mode == 'F' and gap >= 2): order = [[few], [few], [1 - few]]   # 많이 뒤지면 연달아 두 번
        for grp in order:
            fire(grp)
            if len(grp) == 1: last_second = grp[0]
            if 0 in cnt(): break
        c = cnt()
        if rnd == 1 and c[0] != c[1]: lead1 = 0 if c[0] > c[1] else 1
        if 0 in c: break
    c = cnt(); win = None if (0 not in c or c == [0, 0]) else (0 if c[0] else 1)
    return dict(steps=steps, win=win, lead1=lead1, left=max(c))
NAMES = dict(A='늘 번갈아(붉은 편 먼저)', B='첫 턴 동시 → 뒤진 편 먼저 · 같으면 번갈아', C='첫 턴 동시 → 뒤진 편 먼저 · 같으면 동시(선생님 안)',
             E='선생님 안 + 3개 넘게 뒤지면 연달아 두 번', F='선생님 안 + 2개 넘게 뒤지면 연달아 두 번')
if __name__ == '__main__':
    G = int(sys.argv[1]) if len(sys.argv) > 1 else 100
    print(f'| 차례 규칙 (9 대 9 · 사각 · 정타만 · {G}판) | 시간 | 첫 라운드에 앞선 편이 끝내 이김 | 붉은 편 승률 | 이긴 편 남은 수 |'); print('|---|---|---|---|---|')
    for m in 'ABCEF':
        rng = random.Random(ord(m)); rs = [play(9, rng, 7, 7, m) for _ in range(G)]
        ld = [r for r in rs if r['lead1'] is not None and r['win'] is not None]; w = [r for r in rs if r['win'] is not None]
        print(f"| {NAMES[m]} | {sum(r['steps'] for r in rs)/G*8/60:.1f}분 | {sum(1 for r in ld if r['win']==r['lead1'])*100//max(1,len(ld))}% ({len(ld)}판) | {sum(1 for r in w if r['win']==0)*100//max(1,len(w))}% | {sum(r['left'] for r in rs)/G:.1f} |", flush=True)
