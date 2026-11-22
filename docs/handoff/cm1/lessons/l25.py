from cm1lib import *
X = lambda cs, v='x': D(P(cs, v))
def AB(v, rng, k=0): return pick(v, rng, [(-1, 3), (2, 5), (-4, 1)][k], lambda r: tuple(sorted(r.sample(range(-6, 7), 2))))
inq = lambda lo, hi: f'{N(lo)} < x < {N(hi)}'
out = lambda lo, hi: f'x < {N(lo)} 또는 x > {N(hi)}'
def m1a(v, rng):
    a, b = AB(v, rng); cs = pmul([1, -a], [1, -b])
    return choice(rng, f'이차부등식 {X(cs)} < 0 의 해는?', inq(a, b), [out(a, b), inq(-b, -a) if (-b, -a) != (a, b) else inq(a - 1, b + 1), f'x < {N(b)}', f'{N(a)} ≤ x ≤ {N(b)}'], f'({X([1,-a])})({X([1,-b])}) < 0 → 그래프가 x축 아래인 부분 = 두 근 사이.', chk=lambda: all((peval(cs, Fr(t, 2)) < 0) == (a < Fr(t, 2) < b) for t in range(-30, 31)))
def m1b(v, rng):
    a, b = AB(v, rng, 1); cs = pmul([1, -a], [1, -b])
    return choice(rng, f'이차부등식 {X(cs)} > 0 의 해는?', out(a, b), [inq(a, b), out(-b, -a) if (-b, -a) != (a, b) else out(a - 1, b + 1), f'x > {N(b)}', f'x ≤ {N(a)} 또는 x ≥ {N(b)}'], f'({X([1,-a])})({X([1,-b])}) > 0 → 그래프가 x축 위인 부분 = 두 근의 바깥.', chk=lambda: all((peval(cs, Fr(t, 2)) > 0) == (Fr(t, 2) < a or Fr(t, 2) > b) for t in range(-30, 31)))
def m2a(v, rng):
    a, b = AB(v, rng, 2); cs = pmul([-1], pmul([1, -a], [1, -b]))
    return choice(rng, f'이차부등식 {X(cs)} ≥ 0 의 해는?', f'{N(a)} ≤ x ≤ {N(b)}', [f'x ≤ {N(a)} 또는 x ≥ {N(b)}', inq(a, b), f'{N(-b)} ≤ x ≤ {N(-a)}' if (-b, -a) != (a, b) else f'x ≥ {N(a)}', '모든 실수'], f'양변에 −1 을 곱하면 {X(pmul([1,-a],[1,-b]))} ≤ 0 (부등호 방향이 바뀐다).', chk=lambda: all((peval(cs, Fr(t, 2)) >= 0) == (a <= Fr(t, 2) <= b) for t in range(-30, 31)))
def m2b(v, rng):
    k = pick(v, rng, 2, lambda r: ri(r, -5, 5, (0,))); cs = pmul([1, -k], [1, -k]); kind = v % 2
    q, right = (f'{X(cs)} > 0', f'x ≠ {N(k)} 인 모든 실수') if kind == 0 else (f'{X(cs)} ≤ 0', f'x = {N(k)}')
    return choice(rng, f'이차부등식 {q} 의 해는?', right, [x for x in [f'x ≠ {N(k)} 인 모든 실수', f'x = {N(k)}', '모든 실수', '해가 없다', f'x > {N(k)}'] if x != right], f'(x − ({N(k)}))² 은 x = {N(k)} 일 때만 0, 나머지는 양수.', chk=True)
def NR(v, rng): return pick(v, rng, (1, 2), lambda r: (ri(r, -4, 4), ri(r, 1, 6)))    # (x + p)² + q
def m3(sign):
    def f(v, rng):
        p, q = NR(v, random.Random(rng.random() if v else 1)); cs = [1, 2 * p, p * p + q]
        right = '모든 실수' if sign == '>' else '해가 없다'
        return choice(rng, f'이차부등식 {X(cs)} {sign} 0 의 해는?', right, [x for x in ['모든 실수', '해가 없다', f'x ≠ {N(-p)} 인 모든 실수', f'x = {N(-p)}'] if x != right], f'D < 0 → 그래프가 x축보다 항상 위 (식 = (x {"+" if p>=0 else "−"} {abs(p)})² + {q} > 0).', chk=lambda: all(peval(cs, Fr(t, 2)) > 0 for t in range(-30, 31)))
    return f
# 산: 모든 실수에서 성립 (본문 89쪽 꼴)
def AL(v, rng): return pick(v, rng, (-1, 2), lambda r: tuple(sorted(r.sample(range(-5, 6), 2))))     # D/4 = (k − a)(k − b) < 0 ; x² + 2kx + (a+b)k − ab
def hs(v, rng):
    a, b = AL(v, random.Random(rng.random() if v else 1)); c1, c0 = a + b, -a * b
    cst = D(P([c1, c0], 'k')) if c1 else N(c0)
    return a, b, c1, c0, f'모든 실수 x 에 대하여 이차부등식 x² + 2kx + ({cst}) > 0 이 성립한다 (k 는 실수).'.replace('+ (0)', '').replace('(', '').replace(')', '') if False else f'모든 실수 x 에 대하여 이차부등식 x² + 2kx {"+" if True else ""} {"(" + cst + ")"} > 0 이 성립한다 (k 는 실수).'
def m4a(v, rng):
    a, b, c1, c0, s = hs(v, rng)
    return choice(rng, f'{s} 이 조건을 이차방정식의 판별식 D 로 쓰면?', 'D < 0', ['D > 0', 'D = 0', 'D ≥ 0'], '그래프가 x축과 만나지 않고 항상 위에 있어야 한다.', chk=True)
def m4b(v, rng):
    a, b, c1, c0, s = hs(v, rng); e = [1, -c1, -c0]
    return choice(rng, f'{s} D/4 를 k 에 대한 식으로 나타내면?', X(e, 'k'), [X([1, c1, c0], 'k'), X([1, -c1, c0], 'k'), X([4, -c1, -c0], 'k')], 'D/4 = k² − (상수항).', chk=lambda: pmul([1, -a], [1, -b]) == e)
def m4c(v, rng):
    a, b, c1, c0, s = hs(v, rng)
    return choice(rng, f'{s} k 의 값의 범위는?', f'{N(a)} < k < {N(b)}', [f'k < {N(a)} 또는 k > {N(b)}', f'{N(a)} ≤ k ≤ {N(b)}', f'{N(-b)} < k < {N(-a)}' if (-b, -a) != (a, b) else f'k > {N(a)}'], f'(k − ({N(a)}))(k − ({N(b)})) < 0.', chk=lambda: all(((2 * Fr(t, 2)) ** 2 - 4 * (c1 * Fr(t, 2) + c0) < 0) == (a < Fr(t, 2) < b) for t in range(-30, 31)))
def ex1(v, rng):
    a, b = AB(v, rng, 1)
    return number(f'이차부등식 x² + px + q < 0 의 해가 {inq(a, b)} 일 때, p + q 의 값은? (p, q 는 상수)', -(a + b) + a * b, f'(x − ({N(a)}))(x − ({N(b)})) < 0 을 전개: p = {N(-(a+b))}, q = {N(a*b)}.', chk=True)
L = dict(id='cm1-25', no=25, title='이차부등식', unit='Ⅱ-3 여러 가지 방정식과 부등식', pages='87 ~ 89', goal='이차부등식과 이차함수를 연결하여 이차부등식을 풀 수 있다.',
  review='16차시: 이차함수의 그래프와 x축 — D 의 부호 · 인수분해', intro='x² − 2x − 3 < 0 = 「포물선이 x축보다 아래에 있는 x 의 범위」. 그래프로 읽으면 한눈에.',
  concepts=[dict(id='c1', title='이차부등식의 해 (D > 0)', say='a > 0, 두 근 α < β: (x − α)(x − β) < 0 ⟺ α < x < β · (x − α)(x − β) > 0 ⟺ x < α 또는 x > β. x² 의 계수가 음수면 −1 을 곱해 방향을 바꾼다.', check=dict(type='ox', q='(x − 1)(x − 4) > 0 의 해는 1 < x < 4 이다.', ch=[], a='X', why='0 보다 크다 = 두 근의 바깥 → x < 1 또는 x > 4.')),
            dict(id='c2', title='D = 0, D < 0 인 경우', say='(x − α)² > 0 ⟺ x ≠ α 인 모든 실수 · (x − α)² ≤ 0 ⟺ x = α · D < 0 (a > 0): ax² + bx + c > 0 은 모든 실수, < 0 은 해가 없다.')],
  mons=[dict(id='m1', title='문제 1 · 두 근의 사이 · 바깥', subs=[m1a, m1b]), dict(id='m2', title='문제 2 · 계수가 음수 · 중근', subs=[m2a, m2b]), dict(id='m3', title='문제 3 · x축과 만나지 않을 때', subs=[m3('>'), m3('<')]),
        dict(id='m4', title='문제 4 · 모든 실수에서 성립', hard=True, subs=[m4a, m4b, m4c]), dict(id='m5', title='해로 부등식 찾기', extra=True, subs=[ex1])],
  boss=[(m1a, 'c1', 'm1'), (m1b, 'c1', 'm1'), (m2a, 'c1', 'm2'), (m3('>'), 'c2', 'm3')],
  hard_from='산 = 본문 89쪽의 「모든 실수에서 성립」 꼴(본문에 있어 중단원에서 안 가져옴)',
  motion=[dict(title='포물선이 x축 아래인 곳', key='이차부등식의 해 = 그래프가 x축 위 · 아래인 x 의 범위.', scenes=['카드에 y = x² − 2x − 3 포물선과 x축.', 'x축 아래 부분이 파랗게 칠해지고 그 그림자가 x축 위 −1 < x < 3 으로 내려온다.', '부등호를 > 로 바꾸면 x축 위 부분의 그림자 x < −1, x > 3.', '포물선을 위로 올려 x축에서 떨어뜨리면 「< 0 은 해가 없다」.'], end='< 0 은 사이 · > 0 은 바깥')],
  notes=['문제 2-2 는 판마다 「> 0」 과 「≤ 0」 을 번갈아 냄.', '산의 상수항은 D/4 가 (k − a)(k − b) 로 인수분해 되게 맞춤.'])
if __name__ == '__main__': write(L)
