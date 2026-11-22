from cm1lib import *
X = lambda cs, v='x': D(P(cs, v))
def rngs(lo, hi, lc, hc):   # lc/hc: 포함 여부
    return f"{N(lo)} {'≤' if lc else '<'} x {'≤' if hc else '<'} {N(hi)}"
def AB(v, rng): return pick(v, rng, (3, 5, 1, 2), lambda r: (lambda lo, w: (lo, lo + w, ri(r, -3, 3), ri(r, 2, 4)))(ri(r, -4, 4), ri(r, 2, 5)))
def s1(v, rng):
    lo, hi, c, k = AB(v, random.Random(rng.random() if v else 1))
    i1 = f"x {'−' if c>0 else '+'} {abs(c)} > {N(lo - c)}" if c else f'x > {N(lo)}'; i2 = f'{k}x ≤ {N(k*hi)}'
    return lo, hi, i1, i2, f'연립부등식 {i1}, {i2} 에서'
def m1a(v, rng):
    lo, hi, i1, i2, s = s1(v, rng)
    return choice(rng, f'{s} 두 부등식을 각각 풀면?', f'x > {N(lo)}, x ≤ {N(hi)}', [f'x < {N(lo)}, x ≤ {N(hi)}', f'x > {N(lo)}, x ≥ {N(hi)}', f'x > {N(-lo) if lo else 1}, x ≤ {N(hi)}'], '이항하고, 양수로 나누면 부등호 방향은 그대로.', chk=True)
def m1b(v, rng):
    lo, hi, i1, i2, s = s1(v, rng)
    return choice(rng, f'{s} 해는?', rngs(lo, hi, 0, 1), [rngs(lo, hi, 1, 0), f'x > {N(lo)}', f'x ≤ {N(hi)}', '해가 없다'], f'x > {N(lo)} 와 x ≤ {N(hi)} 를 수직선에 그려 겹치는 부분.', chk=True)
def TR(v, rng):
    lo, hi = pick(v, rng, (1, 4), lambda r: (lambda a, w: (a, a + w))(ri(r, -3, 3), ri(r, 2, 5)))
    a, b = pick(v, rng, (2, 3), lambda r: (ri(r, 2, 3), ri(r, 2, 4)))    # a x + p < x + q ≤ (1+b) x + t  → x < hi, x ≥ lo
    q = pick(v, rng, 3, lambda r: ri(r, -3, 5)); p = q - (a - 1) * hi; t = q - b * lo
    TR.c = ([a, p], [1, q], [1 + b, t])
    return lo, hi, X([a, p]), X([1, q]), X([1 + b, t])
def m2a(v, rng):
    lo, hi, A, B, C = TR(v, random.Random(rng.random() if v else 1))
    return choice(rng, f'부등식 {A} < {B} ≤ {C} 를 연립부등식으로 고치면?', f'{A} < {B}, {B} ≤ {C}', [f'{A} < {B}, {A} ≤ {C}', f'{A} < {C}, {B} ≤ {C}', f'{A} ≤ {B}, {B} < {C}'], 'A < B ≤ C 는 「A < B 이고 B ≤ C」.', chk=True)
def m2b(v, rng):
    lo, hi, A, B, C = TR(v, random.Random(rng.random() if v else 1))
    return choice(rng, f'부등식 {A} < {B} ≤ {C} 의 해는?', rngs(lo, hi, 1, 0), [rngs(lo, hi, 0, 1), f'x < {N(hi)}', f'x ≥ {N(lo)}', '해가 없다'], f'{A} < {B} → x < {N(hi)} · {B} ≤ {C} → x ≥ {N(lo)}.', chk=(lambda cs: lambda: all(((peval(cs[0], Fr(t, 2)) < peval(cs[1], Fr(t, 2))) and (peval(cs[1], Fr(t, 2)) <= peval(cs[2], Fr(t, 2)))) == (lo <= Fr(t, 2) < hi) for t in range(-30, 31)))(TR.c))
def m3a(v, rng):
    k = pick(v, rng, 3, lambda r: ri(r, -5, 5)); a = pick(v, rng, 2, lambda r: ri(r, 2, 4))
    return choice(rng, f'연립부등식 {a}x ≥ {N(a*k)}, x ≤ {N(k)} 의 해는?', f'x = {N(k)}', ['해가 없다', f'x ≥ {N(k)}', f'x ≤ {N(k)}', '모든 실수'], f'x ≥ {N(k)} 와 x ≤ {N(k)} 가 겹치는 곳은 한 점.', chk=True)
def m3b(v, rng):
    k, w = pick(v, rng, (3, 2), lambda r: (ri(r, -4, 4), ri(r, 1, 4)))
    return choice(rng, f'연립부등식 x > {N(k)}, x < {N(k - w)} 의 해는?', '해가 없다', [f'{N(k-w)} < x < {N(k)}', f'x > {N(k)}', f'x = {N(k)}', '모든 실수'], f'{N(k)} 보다 크면서 {N(k-w)} 보다 작은 수는 없다(겹치는 부분 없음).', chk=True)
# 산: 정수인 해가 n개 (중단원 수준)
def HN(v, rng): return pick(v, rng, (2, 3), lambda r: (ri(r, -4, 3), ri(r, 2, 4)))
def hs(v, rng):
    lo, n = HN(v, random.Random(rng.random() if v else 1)); return lo, n, f'연립부등식 x > {N(lo)}, x ≤ a 를 만족시키는 정수 x 가 {n}개이다 (a 는 실수).'
def m4a(v, rng):
    lo, n, s = hs(v, rng); xs = list(range(lo + 1, lo + 1 + n))
    return choice(rng, f'{s} 그 정수 x 를 모두 구한 것은?', ', '.join(N(t) for t in xs), [', '.join(N(t) for t in range(lo, lo + n)), ', '.join(N(t) for t in range(lo + 2, lo + 2 + n)), ', '.join(N(t) for t in range(lo + 1, lo + n))], f'{N(lo)} 보다 큰 정수부터 차례로 {n}개.', chk=True)
def m4b(v, rng):
    lo, n, s = hs(v, rng); top = lo + n
    return choice(rng, f'{s} a 의 값의 범위는?', f'{N(top)} ≤ a < {N(top+1)}', [f'{N(top)} < a ≤ {N(top+1)}', f'{N(top-1)} ≤ a < {N(top)}', f'a = {N(top)}', f'{N(top)} ≤ a ≤ {N(top+1)}'], f'{N(top)} 은 포함되고 {N(top+1)} 은 포함되지 않아야 한다 → a = {N(top+1)} 이면 정수가 하나 더 생긴다.', chk=True)
def m4c(v, rng):
    lo, n, s = hs(v, rng); top = lo + n; ok = (v % 2 == 0)
    aval = f'{N(top)} + 0.5' if ok else N(top + 1)
    return ox(f'연립부등식 x > {N(lo)}, x ≤ a 에서 a = {aval} 이면 정수인 해는 {n}개이다.', ok, f'정수는 {N(lo+1)} 부터 {N(top if ok else top + 1)} 까지 {n if ok else n + 1}개.', chk=True)
def ex1(v, rng):
    lo, hi = pick(v, rng, (-2, 3), lambda r: (lambda a, w: (a, a + w))(ri(r, -5, 2), ri(r, 3, 7)))
    return number(f'연립부등식 {rngs(lo, hi, 0, 1)} 를 만족시키는 정수 x 의 개수는?'.replace('연립부등식 ', '부등식 '), hi - lo, f'{N(lo+1)} 부터 {N(hi)} 까지.', chk=lambda: len([t for t in range(lo - 3, hi + 3) if lo < t <= hi]) == hi - lo)
L = dict(id='cm1-23', no=23, title='연립일차부등식', unit='Ⅱ-3 여러 가지 방정식과 부등식', pages='82 ~ 83', goal='미지수가 1개인 연립일차부등식을 풀 수 있다.',
  review='중학교: 일차부등식의 풀이 · 음수를 곱하거나 나누면 부등호 방향이 바뀐다', intro='제한 속도는 「시속 50 이상 110 이하」 — 두 조건을 한꺼번에 만족하는 범위를 찾는 것이 연립부등식.',
  concepts=[dict(id='c1', title='연립부등식과 그 해', say='각 부등식을 풀어 수직선 위에 나타내고 겹치는 부분(공통부분)을 찾는다. A < B < C 는 A < B 이고 B < C.', check=dict(type='ox', q='부등식 −2x > 6 의 해는 x > −3 이다.', ch=[], a='X', why='음수로 나누면 방향이 바뀐다 → x < −3.')),
            dict(id='c2', title='해가 하나이거나 없는 경우', say='겹치는 부분이 한 점이면 해는 그 수 하나, 겹치는 부분이 없으면 해가 없다.')],
  mons=[dict(id='m1', title='문제 1 · 공통부분 찾기', subs=[m1a, m1b]), dict(id='m2', title='문제 2 · A < B ≤ C 꼴', subs=[m2a, m2b]), dict(id='m3', title='문제 3 · 해가 하나 · 없음', subs=[m3a, m3b]),
        dict(id='m4', title='문제 4 · 정수인 해의 개수로 a 의 범위', hard=True, subs=[m4a, m4b, m4c]), dict(id='m5', title='정수인 해 세기', extra=True, subs=[ex1])],
  boss=[(m1b, 'c1', 'm1'), (m2b, 'c1', 'm2'), (m3a, 'c2', 'm3'), (m3b, 'c2', 'm3')],
  hard_from='산 = 중단원 수준(정수인 해의 개수 · 본문에 어려운 문제가 없어 넣음)',
  motion=[dict(title='수직선에서 겹치는 곳', key='연립부등식의 해 = 두 범위가 겹치는 부분.', scenes=['카드에 수직선 하나가 그려진다.', 'x > 3 이 파란 띠(3 은 빈 점)로, x ≤ 5 가 주황 띠(5 는 찬 점)로 올라간다.', '두 띠가 겹치는 3 과 5 사이만 진하게 남는다.', '띠를 x > 5, x < 3 으로 바꾸면 겹치는 곳이 없다 → 「해가 없다」.'], end='3 < x ≤ 5')],
  notes=['수직선 그림 없이 고르게 하되, 풀이 한 줄에 「수직선에 그려 겹치는 부분」을 적음.', '문제 4-3 은 끝점 감각을 확인하는 ○× (판마다 수가 바뀜).'])
if __name__ == '__main__': write(L)
