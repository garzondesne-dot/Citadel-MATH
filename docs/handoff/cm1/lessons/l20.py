from cm1lib import *
X = lambda cs, v='x': D(P(cs, v))
def cub(rs):
    c = [1]
    for r in rs: c = pmul(c, [1, -r])
    return c
sol_ = lambda rs: ' 또는 '.join(f'x = {N(r)}' for r in sorted(set(rs)))
def m1a(v, rng):
    k = pick(v, rng, 3, lambda r: ri(r, 2, 10))
    return choice(rng, f'삼차방정식 x³ − {k**3} = 0 의 좌변을 인수분해 하면?', f'(x − {k})(x² + {k}x + {k*k}) = 0'.replace('1x', 'x'), [f'(x − {k})³ = 0', f'(x + {k})(x² − {k}x + {k*k}) = 0'.replace('1x', 'x'), f'(x − {k})(x² − {k}x + {k*k}) = 0'.replace('1x', 'x')], 'a³ − b³ = (a − b)(a² + ab + b²).', chk=lambda: same(f'x**3-{k**3}', f'(x-{k})*(x**2+{k}*x+{k*k})'))
def m1b(v, rng):
    k = pick(v, rng, 3, lambda r: ri(r, 2, 10))
    return number(f'삼차방정식 x³ − {k**3} = 0 의 실근은?', k, f'(x − {k})(이차식) = 0 에서 이차식은 D < 0 이라 허근 → 실근은 x = {k} 하나.', chk=lambda: k ** 3 - k ** 3 == 0 and k * k - 4 * k * k < 0)
def BQ(v, rng): return pick(v, rng, (-1, -12, 2, 3), lambda r: (lambda p, q: (q - p * p, -p * p * q, p, q))(ri(r, 1, 3), ri(r, 1, 6)))   # x⁴ + b x² + c = (x² − p²)(x² + q)
def m2a(v, rng):
    b, c, p, q = BQ(v, random.Random(rng.random() if v else 1)); A = [1, 0, b, 0, c]
    return choice(rng, f'사차방정식 {X(A)} = 0 에서 x² = X 로 놓고 인수분해 하면?', f"({X([1, -p*p], 'X')})({X([1, q], 'X')}) = 0", [f"({X([1, p*p], 'X')})({X([1, -q], 'X')}) = 0", f"({X([1, -p*p], 'X')})({X([1, -q], 'X')}) = 0", f"({X([1, p*p], 'X')})({X([1, q], 'X')}) = 0"], f'{X([1, b, c], "X")} → 곱 {N(c)}, 합 {N(b)} 인 두 수.', chk=lambda: pmul([1, -p * p], [1, q]) == [1, b, c])
def m2b(v, rng):
    b, c, p, q = BQ(v, random.Random(rng.random() if v else 1)); A = [1, 0, b, 0, c]
    return choice(rng, f'사차방정식 {X(A)} = 0 의 실근을 모두 구한 것은?', f'x = {p} 또는 x = −{p}', [f'x = {p}', f'x = {p*p} 또는 x = −{q}', f'x = {p} 또는 x = −{p} 또는 x = {q} 또는 x = −{q}'], f'x² = {p*p} 에서 x = ±{p} · x² = −{q} 는 실근이 없다(허근).', chk=lambda: peval(A, p) == 0 and peval(A, -p) == 0)
def R3(v, rng): return pick(v, rng, (1, -2, 3), lambda r: tuple(r.sample([-4, -3, -2, -1, 1, 2, 3, 4], 3)))
def m3a(v, rng):
    rs = R3(v, random.Random(rng.random() if v else 1)); cs = cub(rs); a = min(rs, key=abs); Q = pdiv(cs, [1, -a])[0]
    return choice(rng, f'삼차방정식 {X(cs)} = 0 에서 f(x) = {X(cs)} 라 하면 f({N(a)}) = 0 이다. 좌변을 인수분해 한 첫 단계는?', f'({X([1, -a])})({X(Q)}) = 0', [f'({X([1, a])})({X(Q)}) = 0', f'({X([1, -a])})({X([Q[0], -Q[1], Q[2]])}) = 0', f'({X([1, -a])})({X(padd(Q, [1]))}) = 0'], f'인수정리: x − ({N(a)}) 가 인수 → 조립제법으로 몫을 구한다.', chk=lambda: pmul([1, -a], Q) == cs)
def m3b(v, rng):
    rs = R3(v, random.Random(rng.random() if v else 1)); cs = cub(rs)
    w = [sol_([-r for r in rs]), sol_([rs[0], rs[1], -rs[2]]), sol_([rs[0], rs[1]])]
    return choice(rng, f'삼차방정식 {X(cs)} = 0 의 해는?', sol_(rs), w, f'(x − α)(이차식) = 0 → 이차식도 인수분해 하여 세 일차식의 곱으로.', chk=lambda: all(peval(cs, r) == 0 for r in rs))
# 산: 사차방정식 (인수정리 두 번 · 교과서 77쪽 예제 2 ⑵ 꼴)
def R4(v, rng):
    r1, r2 = pick(v, rng, (1, -2), lambda r: tuple(r.sample([-3, -2, -1, 1, 2, 3], 2))); u, w = pick(v, rng, (1, 3), lambda r: r.choice([(1, 3), (0, 2), (1, 1), (-1, 2), (2, 2), (0, 1), (-1, 1)]))
    return r1, r2, u, w, pmul(pmul([1, -r1], [1, -r2]), [1, u, w])
def hs(v, rng):
    r1, r2, u, w, cs = R4(v, random.Random(rng.random() if v else 1)); return r1, r2, u, w, cs, f'사차방정식 {X(cs)} = 0 에서 f(x) = {X(cs)} 라 하자.'
def m4a(v, rng):
    r1, r2, u, w, cs, s = hs(v, rng); bad = [k for k in (1, -1, 2, -2, 3, -3) if peval(cs, k) != 0]
    return multi(rng, f'{s} 다음 중 f(α) = 0 이 되는 α 를 모두 고르시오.', sorted([(N(r1), True), (N(r2), True), (N(bad[0]), False), (N(bad[1]), False)], key=lambda o: o[0]), '상수항의 약수를 넣어 0 이 되는 것을 찾는다.', chk=lambda: peval(cs, r1) == 0 and peval(cs, r2) == 0)
def m4b(v, rng):
    r1, r2, u, w, cs, s = hs(v, rng)
    f = lambda a, b, q: f'({X([1, -a])})({X([1, -b])})({X(q)}) = 0'
    return choice(rng, f'{s} f({N(r1)}) = 0, f({N(r2)}) = 0 임을 이용하여 좌변을 인수분해 하면?', f(r1, r2, [1, u, w]), [f(-r1, -r2, [1, u, w]), f(r1, r2, [1, -u, w]) if u else f(r1, r2, [1, 1, w]), f(r1, r2, [1, u, -w])], '조립제법을 두 번 써서 일차식 둘을 떼어 낸다.', chk=lambda: pmul(pmul([1, -r1], [1, -r2]), [1, u, w]) == cs)
def m4c(v, rng):
    r1, r2, u, w, cs, s = hs(v, rng); d = u * u - 4 * w
    return choice(rng, f'사차방정식 ({X([1, -r1])})({X([1, -r2])})({X([1, u, w])}) = 0 의 실근을 모두 구한 것은?', sol_([r1, r2]), [sol_([-r1, -r2]), sol_([r1]), sol_([r1, r2, w]) if w not in (r1, r2) else sol_([r1, r2, w + 4])], f'{X([1, u, w])} = 0 은 D = {N(d)} < 0 → 허근. 실근은 일차식에서만.', chk=lambda: d < 0)
def ex1(v, rng):
    k = pick(v, rng, 2, lambda r: ri(r, 3, 10))
    return choice(rng, f'삼차방정식 x³ + {k**3} = 0 의 해 중 실수인 것은?', f'x = −{k}', [f'x = {k}', f'x = {k} 또는 x = −{k}', '실수인 해가 없다'], f'(x + {k})(x² − {k}x + {k*k}) = 0 → 이차식은 허근.'.replace('1x', 'x'), chk=True)
L = dict(id='cm1-20', no=20, title='삼차방정식과 사차방정식 (인수분해로 풀기)', unit='Ⅱ-3 여러 가지 방정식과 부등식', pages='76 ~ 77', goal='인수분해와 인수정리를 이용하여 간단한 삼차방정식과 사차방정식을 풀 수 있다.',
  review='9차시: 인수정리로 인수분해 · 조립제법 · AB = 0 이면 A = 0 또는 B = 0', intro='삼차 · 사차방정식도 좌변을 인수분해 하면 일차 · 이차방정식으로 쪼개진다.',
  concepts=[dict(id='c1', title='인수분해 공식 · 치환으로 풀기', say='(좌변) = 0 꼴에서 좌변을 공식이나 x² = X 치환으로 인수분해 → 각 인수 = 0. 복소수 범위에서 삼차는 근 3개, 사차는 4개.', check=dict(type='ox', q='삼차방정식 x³ = 1 의 해는 x = 1 뿐이다.', ch=[], a='X', why='(x − 1)(x² + x + 1) = 0 → 허근 두 개가 더 있다.')),
            dict(id='c2', title='인수정리와 조립제법으로 풀기', say='f(α) = 0 인 α 를 찾아 (x − α)Q(x) = 0 으로 → Q(x) = 0 을 다시 푼다.')],
  mons=[dict(id='m1', title='문제 1 · x³ = a³ 꼴', subs=[m1a, m1b]), dict(id='m2', title='문제 2 · x² = X 로 놓기', subs=[m2a, m2b]), dict(id='m3', title='문제 3 · 인수정리로 삼차방정식', subs=[m3a, m3b]),
        dict(id='m4', title='문제 4 · 사차방정식', hard=True, subs=[m4a, m4b, m4c]), dict(id='m5', title='x³ + a³ = 0', extra=True, subs=[ex1])],
  boss=[(m1b, 'c1', 'm1'), (m2b, 'c1', 'm2'), (m3b, 'c2', 'm3'), (m3a, 'c2', 'm3')],
  hard_from='산 = 본문 77쪽 예제 2 ⑵ 꼴(사차 · 인수정리 두 번 · 본문에 있어 중단원에서 안 가져옴)',
  motion=[dict(title='삼차방정식 쪼개기', key='인수분해 하면 (일차식)(이차식) = 0 으로 갈라진다.', scenes=['카드에 x³ − 2x² − 5x + 6 = 0 이 한 덩어리로 놓인다.', '커서가 x = 1 을 넣자 0 이 되고, 덩어리에서 (x − 1) 조각이 떨어져 나온다.', '남은 x² − x − 6 이 다시 (x − 3)(x + 2) 로 갈라진다.', '세 조각 아래 x = 1, 3, −2 가 뜬다.'], end='(x − 1)(x − 3)(x + 2) = 0', at='c2')],
  notes=['허근까지 쓰는 문항은 21차시(x³ = 1 의 허근 ω)에서 — 이 차시는 「실근」과 인수분해 과정에 집중.', '사차방정식의 남는 이차식은 늘 D < 0 이 되게 골라 실근 2개로 통일.'])
if __name__ == '__main__': write(L)
