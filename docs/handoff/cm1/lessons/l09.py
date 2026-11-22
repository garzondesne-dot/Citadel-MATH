from cm1lib import *
X = lambda cs, v='x': D(P(cs, v))
def BI(v, rng): return pick(v, rng, (2, 3), lambda r: tuple(sorted(r.sample([1, 2, 3, 4, 5], 2))))
def m1a(v, rng):
    p, q = BI(v, random.Random(rng.random() if v else 1)); A = [1, 0, -(p * p + q * q), 0, p * p * q * q]
    f = lambda a, b: f"({X([1, a], 'X')})({X([1, b], 'X')})"
    return choice(rng, f'{X(A)} 에서 x² = X 로 놓고 인수분해 하면?', f(-p * p, -q * q), [f(p * p, q * q), f(-p, -q), f(p * p, -q * q)], f'X² − {p*p+q*q}X + {p*p*q*q} → 곱 {p*p*q*q}, 합 −{p*p+q*q}.', chk=lambda: pmul([1, -p * p], [1, -q * q]) == [1, -(p * p + q * q), p * p * q * q])
def m1b(v, rng):
    p, q = BI(v, random.Random(rng.random() if v else 1)); A = [1, 0, -(p * p + q * q), 0, p * p * q * q]
    right = f'(x + {p})(x − {p})(x + {q})(x − {q})'
    return choice(rng, f'{X(A)} 을 인수분해 하면?', right, [f'(x² − {p*p})(x² + {q*q})', f'(x + {p})²(x + {q})²', f'(x − {p})²(x − {q})²', f'(x² + {p*p})(x² + {q*q})'], f'(x² − {p*p})(x² − {q*q}) 의 두 괄호를 합차 공식으로 한 번 더.', chk=lambda: same(P(A), f'(x+{p})*(x-{p})*(x+{q})*(x-{q})'))
def AB2(v, rng): return pick(v, rng, (1, 1), lambda r: r.choice([(2, 3), (1, 2), (2, 2), (1, 3), (3, 5), (2, 5), (1, 4)]))   # (x²+px+q)(x²−px+q)
def m2a(v, rng):
    p, q = AB2(v, random.Random(rng.random() if v else 1)); mid = 2 * q - p * p; A = [1, 0, mid, 0, q * q]
    pp = D(P([p * p, 0, 0]))
    return choice(rng, f'{X(A)} 을 A² − B² 꼴로 고치면?', f'(x² + {q})² − {pp}', [f'(x² + {q})² + {pp}', f'(x² − {q})² − {pp}', f'(x² + {q*q})² − {pp}'], f'x⁴ 과 {q*q} 을 보고 (x² + {q})² = x⁴ + {2*q}x² + {q*q} 를 만든 뒤 남는 {pp} 을 뺀다.', chk=lambda: same(P(A), f'(x**2+{q})**2-{p*p}*x**2'))
def m2b(v, rng):
    p, q = AB2(v, random.Random(rng.random() if v else 1)); mid = 2 * q - p * p; A = [1, 0, mid, 0, q * q]
    right = f'({X([1, p, q])})({X([1, -p, q])})'
    return choice(rng, f'{X(A)} 을 인수분해 하면?', right, [f'({X([1, p, q])})²', f'({X([1, p, -q])})({X([1, -p, -q])})', f'({X([1, 0, q])})²'], 'A² − B² = (A + B)(A − B) 에 A = x² + (상수), B = (일차식) 을 넣는다.', chk=lambda: same(P(A), f'({P([1,p,q])})*({P([1,-p,q])})'))
def R3(v, rng): return pick(v, rng, (1, 2, -3), lambda r: tuple(r.sample([-4, -3, -2, -1, 1, 2, 3], 3)))
def cub(rs):
    c = [1]
    for r in rs: c = pmul(c, [1, -r])
    return c
def m3a(v, rng):
    rs = R3(v, random.Random(rng.random() if v else 1)); cs = cub(rs); a = min(rs, key=abs)
    cand = [k for k in (1, -1, 2, -2, 3, -3) if k not in rs][:3]
    return choice(rng, f'f(x) = {X(cs)} 을 인수분해 하려고 한다. 다음 중 f(α) = 0 이 되는 α 는?', N(a), [N(k) for k in cand], f'상수항 {N(cs[3])} 의 약수를 차례로 넣어 본다 → f({N(a)}) = 0.', chk=lambda: peval(cs, a) == 0 and all(peval(cs, k) != 0 for k in cand))
def m3b(v, rng):
    rs = R3(v, random.Random(rng.random() if v else 1)); cs = cub(rs); a = min(rs, key=abs); Q = pdiv(cs, [1, -a])[0]
    return choice(rng, f'({X(cs)}) ÷ ({X([1, -a])}) 의 몫은? (나누어떨어진다)', X(Q), [X([Q[0], -Q[1], Q[2]]), X([Q[0], Q[1], -Q[2]]), X(padd(Q, [1, 0]))], '조립제법으로 나누면 나머지 0, 아랫줄 세 수가 몫의 계수.', chk=lambda: pdiv(cs, [1, -a]) == (Q, [0]))
def m3c(v, rng):
    rs = R3(v, random.Random(rng.random() if v else 1)); cs = cub(rs)
    f = lambda t: ''.join(f'({X([1, -r])})' for r in sorted(t))
    return choice(rng, f'{X(cs)} 을 인수분해 하면?', f(rs), [f([-r for r in rs]), f([rs[0], rs[1], -rs[2]]), f([-rs[0], rs[1], rs[2]])], 'f(α) = 0 인 α 로 일차식 인수를 찾고, 몫(이차식)을 다시 인수분해 한다.', chk=lambda: same(P(cs), '*'.join(f'({P([1,-r])})' for r in rs)))
# 산: 사차식 · 미지 계수 (교과서 35쪽 문제 5 꼴)
def Q4(v, rng):
    r1, r2 = pick(v, rng, (-1, -1), lambda r: (r.choice([-1, 1, -2, 2]), r.choice([-1, 1, -2, 2]))); u, w = pick(v, rng, (0, 2), lambda r: (r.choice([0, 1, -1, 2]), r.choice([1, 2, 3])))
    cs = pmul(pmul([1, -r1], [1, -r2]), [1, u, w]); return r1, r2, u, w, cs
def qs(v, rng):
    r1, r2, u, w, cs = Q4(v, random.Random(rng.random() if v else 1)); t = cs[:]; t[1] = 0
    fx = 'x⁴ + ax³' + ''.join(f" {'+' if c>0 else '−'} {D(P([abs(c)] + [0]*(4-i)))}" for i, c in enumerate(cs) if i >= 2 and c)
    return r1, r2, u, w, cs, f'다항식 f(x) = {fx} 이 {X([1, -r1])} 을 인수로 갖는다 (a 는 상수).'
def m4a(v, rng):
    r1, r2, u, w, cs, s = qs(v, rng)
    return number(f'{s} a 의 값은?', cs[1], f'인수정리: f({N(r1)}) = 0 에 대입해 a 에 대한 일차방정식을 푼다.', chk=lambda: peval(cs, r1) == 0)
def m4b(v, rng):
    r1, r2, u, w, cs, s = qs(v, rng); Q = pdiv(cs, [1, -r1])[0]
    return choice(rng, f'({X(cs)}) ÷ ({X([1, -r1])}) 의 몫은? (나누어떨어진다)', X(Q), [X([Q[0], -Q[1], Q[2], -Q[3]]), X(padd(Q, [1])), X([Q[0], Q[1], Q[2], -Q[3]])], '조립제법: 계수 다섯 개를 적고 「곱해서 더하기」 네 번.', chk=lambda: pdiv(cs, [1, -r1]) == (Q, [0]))
def m4c(v, rng):
    r1, r2, u, w, cs, s = qs(v, rng)
    f = lambda a, b, c: (f'({X([1, -a])})²' if a == b else f'({X([1, -a])})({X([1, -b])})') + f'({X(c)})'
    return choice(rng, f'{X(cs)} 을 인수분해 하면?', f(r1, r2, [1, u, w]), [f(-r1, -r2, [1, u, w]), f(r1, r2, [1, u, -w]), f(r1, -r2, [1, -u, w]) if (u or r2) else f(-r1, r2, [1, 1, w])], '일차식 인수를 하나 떼고, 몫(삼차식)에 다시 인수정리를 쓴다. 더 안 되는 이차식은 그대로 둔다.', chk=lambda: same(P(cs), f'({P([1,-r1])})*({P([1,-r2])})*({P([1,u,w])})'))
def ex1(v, rng):
    n = pick(v, rng, 999, lambda r: r.choice([99, 199, 499, 1999, 299, 399, 599, 799, 899, 9999]))
    return number(f'({n}³ − 13 × {n} + 12) ÷ ({n} × {n+3} − 4) 의 값은? (x³ − 13x + 12 = (x − 1)(x − 3)(x + 4), x(x + 3) − 4 = (x + 4)(x − 1) 임을 이용)', n - 3, f'x = {n} 으로 보면 (x − 1)(x − 3)(x + 4) ÷ {{(x + 4)(x − 1)}} = x − 3.', chk=lambda: (n ** 3 - 13 * n + 12) == (n - 3) * (n * (n + 3) - 4))
L = dict(id='cm1-09', no=9, title='복잡한 식의 인수분해', unit='Ⅰ-2 나머지정리와 인수분해', pages='34 ~ 35', goal='치환 · A² − B² 꼴 · 인수정리를 이용하여 삼차 이상의 다항식을 인수분해 할 수 있다.',
  review='7차시: 인수정리 f(α) = 0 · 조립제법 · 8차시: 공통부분을 X 로', intro='공식이 안 보이는 삼차 · 사차식은? ① x² 을 한 문자로 ② 제곱 − 제곱 꼴 만들기 ③ f(α) = 0 인 α 찾기.',
  concepts=[dict(id='c1', title='x⁴ + ax² + b 꼴', say='x² = X 로 놓아 인수분해 되면 그대로, 안 되면 x² 항을 더하고 빼서 A² − B² 꼴로 고친다.', check=dict(type='ox', q='x⁴ − 5x² + 4 = (x² − 1)(x² − 4) 는 인수분해가 끝난 것이다.', ch=[], a='X', why='두 괄호 모두 합차 공식으로 더 인수분해 된다.')),
            dict(id='c2', title='인수정리를 이용한 인수분해', say='f(α) = 0 인 α 를 상수항의 약수(±) 에서 찾는다 → x − α 로 조립제법 → 몫을 다시 인수분해.')],
  mons=[dict(id='m1', title='문제 1 · x² = X 로 놓기', subs=[m1a, m1b]), dict(id='m2', title='문제 2 · A² − B² 꼴로', subs=[m2a, m2b]), dict(id='m3', title='문제 3 · 인수정리로 삼차식', subs=[m3a, m3b, m3c]),
        dict(id='m4', title='문제 4 · 계수를 찾고 사차식 인수분해', hard=True, subs=[m4a, m4b, m4c]), dict(id='m5', title='큰 수 계산', extra=True, subs=[ex1])],
  boss=[(m1b, 'c1', 'm1'), (m2b, 'c1', 'm2'), (m3a, 'c2', 'm3'), (m3c, 'c2', 'm3')],
  hard_from='산 = 본문 35쪽 문제 5 꼴(이미 어려운 문제가 있어 중단원에서 안 가져옴)',
  motion=[dict(title='인수 찾기 → 조립제법 → 한 번 더', key='f(α) = 0 인 α 를 찾으면 x − α 가 인수다.', scenes=['카드에 f(x) = x³ − 7x + 6 과 후보 칩 ±1, ±2, ±3, ±6.', '커서가 1 을 넣자 f(1) = 0 ✓ → 칩이 (x − 1) 로 바뀐다.', '조립제법 한 줄이 펼쳐져 몫 x² + x − 6 이 나온다.', '몫이 (x − 2)(x + 3) 으로 갈라진다.'], end='x³ − 7x + 6 = (x − 1)(x − 2)(x + 3)', at='c2')],
  notes=['문제 2 의 A² − B² 꼴은 버전마다 (x² + px + q)(x² − px + q) 가 되도록 수를 골라 만듦.', '여유 문제 = 35쪽 생각 넓히기(인수분해 결과를 문항 안에 적어 혼자 풀리게 함).', '중단원 마무리 07 · 10 · 11번(발전)은 성채 몫.'])
if __name__ == '__main__': write(L)
