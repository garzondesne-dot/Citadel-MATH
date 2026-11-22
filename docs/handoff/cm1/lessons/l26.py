from cm1lib import *
X = lambda cs, v='x': D(P(cs, v))
Q = lambda a, b: pmul([1, -a], [1, -b])
def S1(v, rng): return pick(v, rng, (1, 2, 4), lambda r: tuple(sorted(r.sample(range(-5, 7), 3))))    # 이차 a<x<b, 일차 x>c (a<c<b)
def s1(v, rng):
    a, c, b = S1(v, random.Random(rng.random() if v else 1)); k = pick(v, rng, 2, lambda r: ri(r, 2, 3))
    return a, c, b, f'연립부등식 {k}x > {N(k*c)}, {X(Q(a, b))} < 0 에서'
def m1a(v, rng):
    a, c, b, s = s1(v, rng)
    return choice(rng, f'{s} 두 부등식을 각각 풀면?', f'x > {N(c)}, {N(a)} < x < {N(b)}', [f'x > {N(c)}, x < {N(a)} 또는 x > {N(b)}', f'x < {N(c)}, {N(a)} < x < {N(b)}', f'x > {N(c)}, {N(-b)} < x < {N(-a)}' if (-b, -a) != (a, b) else f'x > {N(c)}, x < {N(b)}'], '일차부등식은 이항, 이차부등식은 인수분해 → 「< 0 은 사이」.', chk=True)
def m1b(v, rng):
    a, c, b, s = s1(v, rng)
    return choice(rng, f'{s} 해는?', f'{N(c)} < x < {N(b)}', [f'{N(a)} < x < {N(c)}', f'{N(a)} < x < {N(b)}', f'x > {N(c)}', '해가 없다'], f'x > {N(c)} 와 {N(a)} < x < {N(b)} 의 공통부분.', chk=lambda: all(((Fr(t, 2) > c) and (peval(Q(a, b), Fr(t, 2)) < 0)) == (c < Fr(t, 2) < b) for t in range(-30, 31)))
def S2(v, rng): return pick(v, rng, (-2, 1, 3, 5), lambda r: tuple(sorted(r.sample(range(-6, 8), 4))))    # a ≤ x ≤ b, x < c 또는 x > d  (a<c<b<d)
def s2(v, rng):
    a, c, b, d = S2(v, random.Random(rng.random() if v else 1)); return a, c, b, d, f'연립부등식 {X(Q(a, b))} ≤ 0, {X(Q(c, d))} > 0 에서'
def m2a(v, rng):
    a, c, b, d, s = s2(v, rng)
    return choice(rng, f'{s} 둘째 부등식 {X(Q(c, d))} > 0 의 해는?', f'x < {N(c)} 또는 x > {N(d)}', [f'{N(c)} < x < {N(d)}', f'x > {N(d)}', f'x ≤ {N(c)} 또는 x ≥ {N(d)}'], '「> 0 은 두 근의 바깥」.', chk=True)
def m2b(v, rng):
    a, c, b, d, s = s2(v, rng)
    return choice(rng, f'{s} 해는?', f'{N(a)} ≤ x < {N(c)}', [f'{N(c)} < x ≤ {N(b)}', f'{N(a)} ≤ x ≤ {N(b)}', f'{N(a)} < x ≤ {N(c)}', '해가 없다'], f'{N(a)} ≤ x ≤ {N(b)} 와 (x < {N(c)} 또는 x > {N(d)}) 가 겹치는 곳.', chk=lambda: all(((peval(Q(a, b), Fr(t, 2)) <= 0) and (peval(Q(c, d), Fr(t, 2)) > 0)) == (a <= Fr(t, 2) < c) for t in range(-30, 31)))
def m3a(v, rng):
    a, c, b, d, s = s2(v, rng)
    return number(f'{s} 정수인 해의 개수는?', c - a, f'해 {N(a)} ≤ x < {N(c)} → {N(a)} 부터 {N(c-1)} 까지.', chk=lambda: len([t for t in range(-20, 20) if peval(Q(a, b), t) <= 0 and peval(Q(c, d), t) > 0]) == c - a)
def m3b(v, rng):
    a, b, c, d = pick(v, rng, (-1, 2, 3, 6), lambda r: tuple(sorted(r.sample(range(-6, 8), 4))))
    return choice(rng, f'연립부등식 {X(Q(a, b))} < 0, {X(Q(c, d))} < 0 의 해는?', '해가 없다', [f'{N(a)} < x < {N(d)}', f'{N(b)} < x < {N(c)}', f'{N(a)} < x < {N(b)}', '모든 실수'], f'{N(a)} < x < {N(b)} 와 {N(c)} < x < {N(d)} 는 겹치지 않는다.', chk=lambda: not any(peval(Q(a, b), Fr(t, 2)) < 0 and peval(Q(c, d), Fr(t, 2)) < 0 for t in range(-30, 31)))
# 산: 둘레가 정해진 직사각형의 넓이 범위 (활용)
def RC(v, rng):
    h, w = pick(v, rng, (5, 2), lambda r: (ri(r, 4, 9), ri(r, 1, 3))); return h, w, h * h - w * w      # 가로 x, 세로 2h − x · 넓이 ≥ h² − w² ⟺ h − w ≤ x ≤ h + w
def rs_(v, rng):
    h, w, A = RC(v, random.Random(rng.random() if v else 1)); return h, w, A, f'둘레의 길이가 {4*h} 인 직사각형의 넓이가 {A} 이상이 되게 하려고 한다. 가로의 길이를 x 라 할 때 (가로가 세로보다 길다),'
def m4a(v, rng):
    h, w, A, s = rs_(v, rng)
    return multi(rng, f'{s} 맞는 식을 모두 고르시오.', [(f'x({2*h} − x) ≥ {A}', True), (f'x({4*h} − x) ≥ {A}', False), (f'x > {2*h} − x', True), (f'x < {2*h} − x', False)], f'세로 = {2*h} − x · 넓이 = 가로 × 세로 · 가로 > 세로.', chk=True)
def m4b(v, rng):
    h, w, A, s = rs_(v, rng); e = [1, -2 * h, A]
    return choice(rng, f'{s} x({2*h} − x) ≥ {A} 를 정리하여 풀면?', f'{h-w} ≤ x ≤ {h+w}', [f'x ≤ {h-w} 또는 x ≥ {h+w}', f'{h-w} < x < {h+w}', f'{w} ≤ x ≤ {2*h-w}' if w != h - w else f'x ≥ {h-w}'], f'{X(e)} ≤ 0 → ({X([1, -(h-w)])})({X([1, -(h+w)])}) ≤ 0.', chk=lambda: all((x * (2 * h - x) >= A) == (h - w <= x <= h + w) for x in [Fr(t, 2) for t in range(0, 8 * h)]))
def m4c(v, rng):
    h, w, A, s = rs_(v, rng)
    return choice(rng, f'{s} x 의 값의 범위는?', f'{h} < x ≤ {h+w}', [f'{h-w} ≤ x < {h}', f'{h-w} ≤ x ≤ {h+w}', f'{h} ≤ x ≤ {h+w}', f'x > {h}'], f'{h-w} ≤ x ≤ {h+w} 와 x > {h} (가로 > 세로) 의 공통부분.', chk=True)
def ex1(v, rng):
    a, b = pick(v, rng, (2, 6), lambda r: tuple(sorted(r.sample(range(1, 10), 2))))
    return choice(rng, f'부등식 {X([a, 0])} < x² ≤ {X([b, 0])} 를 만족시키는 x 의 값의 범위는? (x > 0)'.replace('2x < x²', '2x < x²'), f'{a} < x ≤ {b}', [f'{a} ≤ x < {b}', f'0 < x ≤ {b}', f'x > {a}', f'{a} < x < {b}'], f'x > 0 이므로 x 로 나누면 {a} < x ≤ {b}.', chk=lambda: all(((a * x < x * x) and (x * x <= b * x)) == (a < x <= b) for x in [Fr(t, 2) for t in range(1, 30)]))
L = dict(id='cm1-26', no=26, title='연립이차부등식', unit='Ⅱ-3 여러 가지 방정식과 부등식', pages='90 ~ 91', goal='연립이차부등식을 풀고, 이를 활용하여 문제를 해결할 수 있다.',
  review='23차시: 연립부등식의 공통부분 · 25차시: 「< 0 은 사이, > 0 은 바깥」', intro='조건이 둘이면 각각 풀어 수직선에서 겹치는 곳 — 이차부등식이 들어가도 똑같다.',
  concepts=[dict(id='c1', title='연립이차부등식', say='차수가 가장 높은 부등식이 이차인 연립부등식. 각 부등식의 해를 구해 공통부분을 찾는다.', check=dict(type='ox', q='연립부등식의 해는 두 부등식의 해를 합친 범위이다.', ch=[], a='X', why='합친 범위가 아니라 겹치는 범위(공통부분).')),
            dict(id='c2', title='활용', say='넓이 · 길이 조건을 x 의 부등식으로 세운 뒤, 길이는 양수 · 대소 조건까지 함께 연립한다.')],
  mons=[dict(id='m1', title='문제 1 · 일차 + 이차', subs=[m1a, m1b]), dict(id='m2', title='문제 2 · 이차 + 이차', subs=[m2a, m2b]), dict(id='m3', title='문제 3 · 정수인 해 · 해가 없는 경우', subs=[m3a, m3b]),
        dict(id='m4', title='문제 4 · 직사각형의 넓이 조건', hard=True, subs=[m4a, m4b, m4c]), dict(id='m5', title='A < B ≤ C 꼴', extra=True, subs=[ex1])],
  boss=[(m1b, 'c1', 'm1'), (m2b, 'c1', 'm2'), (m3a, 'c1', 'm3'), (m4b, 'c2', 'm4')],
  hard_from='산 = 본문 91쪽의 활용 꼴(둘레가 정해진 직사각형)',
  motion=[dict(title='두 조건이 겹치는 곳', key='각 부등식의 해를 수직선에 올려 겹치는 부분만 남긴다.', scenes=['카드의 수직선에 x² − 6x + 8 < 0 의 해 2 < x < 4 가 파란 띠로.', '2x > 6 의 해 x > 3 이 주황 띠로 올라간다.', '겹치는 3 < x < 4 만 진하게 남는다.', '띠 하나를 옮겨 겹치는 곳이 사라지면 「해가 없다」.'], end='공통부분 = 연립부등식의 해')],
  notes=['문제 2 는 네 수 a < c < b < d 를 뽑아 해가 a ≤ x < c 가 되게 만듦.', '여유 문제는 x > 0 조건을 주어 일차 연립부등식으로 바뀌는 꼴.'])
if __name__ == '__main__': write(L)
