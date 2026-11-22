from cm1lib import *
X = lambda cs, v='x': D(P(cs, v))
E = lambda s, p: X([1, -s, p]) + ' = 0'
def mk(q, s, p, sol, rng):
    return choice(rng, q, E(s, p), [E(-s, p), E(s, -p), E(p, s) if (p, s) != (s, p) else E(s + 1, p), E(-s, -p)], sol, chk=True)
def m1a(v, rng):
    a, b = pick(v, rng, (2, -5), lambda r: tuple(r.sample([-6, -5, -4, -3, -2, 2, 3, 4, 5, 6], 2)))
    return mk(f'두 수 {N(a)}, {N(b)} 를 근으로 하고 x² 의 계수가 1 인 이차방정식은?', a + b, a * b, f'x² − (합)x + (곱) = 0: 합 {N(a+b)}, 곱 {N(a*b)}.', rng)
def m1b(v, rng):
    a, k = pick(v, rng, (2, 5), lambda r: (ri(r, -4, 4, (0,)), r.choice([2, 3, 5, 6, 7])))
    return mk(f'두 수 {N(a)} + √{k}, {N(a)} − √{k} 를 근으로 하고 x² 의 계수가 1 인 이차방정식은?', 2 * a, a * a - k, f'합 = {N(2*a)}, 곱 = {a*a} − {k} = {N(a*a-k)} (합차 공식).', rng)
def m1c(v, rng):
    a, b = pick(v, rng, (2, 3), lambda r: (ri(r, -4, 4, (0,)), ri(r, 1, 4)))
    return mk(f'두 수 {cf(a, b)}, {cf(a, -b)} 를 근으로 하고 x² 의 계수가 1 인 이차방정식은?', 2 * a, a * a + b * b, f'합 = {N(2*a)}, 곱 = {a*a} − ({cf(0, b)})² = {a*a} + {b*b}.', rng)
def SP(v, rng): return pick(v, rng, (-2, 3), lambda r: (ri(r, -5, 5, (0,)), ri(r, -6, 6, (0,))))
def m2a(v, rng):
    s, p = SP(v, random.Random(rng.random() if v else 1))
    return mk(f'이차방정식 {E(s, p)} 의 두 근을 α, β 라 할 때, α + β 와 αβ 를 두 근으로 하고 x² 의 계수가 1 인 이차방정식은?', s + p, s * p, f'새 두 근 = {N(s)}, {N(p)} → 합 {N(s+p)}, 곱 {N(s*p)}.', rng)
def m2b(v, rng):
    s, p = SP(v, random.Random(rng.random() if v else 1))
    return mk(f'이차방정식 {E(s, p)} 의 두 근을 α, β 라 할 때, α + 1 과 β + 1 을 두 근으로 하고 x² 의 계수가 1 인 이차방정식은?', s + 2, p + s + 1, f'합 = (α + β) + 2 = {N(s+2)}, 곱 = αβ + (α + β) + 1 = {N(p+s+1)}.', rng)
def m3a(v, rng):
    k = pick(v, rng, 7, lambda r: r.choice([2, 3, 5, 6, 7, 10, 11]))
    return choice(rng, f'이차식 x² + {k} 을 복소수의 범위에서 인수분해 하면?', f'(x + √{k} i)(x − √{k} i)', [f'(x + √{k})(x − √{k})', f'(x + {k}i)(x − {k}i)', f'(x + √{k} i)²', '인수분해 할 수 없다'], f'x² + {k} = 0 의 근 x = ±√{k} i → (x − α)(x − β).', chk=True)
def m3b(v, rng):
    a, b = pick(v, rng, (3, 1), lambda r: (ri(r, -4, 4, (0,)), ri(r, 1, 3))); cs = [1, -2 * a, a * a + b * b]
    f = lambda sa, sb: f"(x {'−' if sa*a>0 else '+'} {abs(a)} − {cf(0,b)})(x {'−' if sa*a>0 else '+'} {abs(a)} + {cf(0,b)})" if sb else f"(x {'−' if sa*a>0 else '+'} {abs(a)} − {b})(x {'−' if sa*a>0 else '+'} {abs(a)} + {b})"
    return choice(rng, f'이차식 {X(cs)} 을 복소수의 범위에서 인수분해 하면?', f(1, 1), [f(-1, 1), f(1, 0), f(-1, 0)], f'근이 x = {N(a)} ± {cf(0,b)} → {{x − ({cf(a,b)})}}{{x − ({cf(a,-b)})}}.', chk=True)
# 산: 한 근이 p + qi (교과서 58쪽 생각 넓히기)
def CR(v, rng): return pick(v, rng, (2, 1), lambda r: (ri(r, -4, 4, (0,)), ri(r, 1, 4)))
def hs(v, rng):
    p, q = CR(v, random.Random(rng.random() if v else 1)); return p, q, f'계수가 실수인 이차방정식 x² + ax + b = 0 의 한 근이 {cf(p, q)} 이다.'
def m4a(v, rng):
    p, q, s = hs(v, rng)
    return choice(rng, f'{s} 다른 한 근은?', cf(p, -q), [cf(-p, q), cf(-p, -q), cf(q, p), cf(p, q)], '계수가 실수이면 허근은 켤레복소수끼리 짝으로 나온다.', chk=True)
def m4b(v, rng):
    p, q, s = hs(v, rng)
    return number(f'{s} a 의 값은?', -2 * p, f'두 근 {cf(p,q)}, {cf(p,-q)} 의 합 = {N(2*p)} = −a.', chk=True)
def m4c(v, rng):
    p, q, s = hs(v, rng)
    return number(f'{s} b 의 값은?', p * p + q * q, f'두 근의 곱 = {p*p} + {q*q} = b.', chk=lambda: abs(complex(p, q) ** 2 - 2 * p * complex(p, q) + p * p + q * q) < 1e-9)
def ex1(v, rng):
    a, b, k = pick(v, rng, (1, -3, 2), lambda r: (ri(r, -4, 4, (0,)), ri(r, -4, 4, (0,)), r.choice([2, 3])))
    cs = [k, -k * (a + b), k * a * b]
    return choice(rng, f'두 수 {N(a)}, {N(b)} 를 근으로 하고 x² 의 계수가 {k} 인 이차방정식은?', X(cs) + ' = 0', [X([k, -(a + b), a * b]) + ' = 0', X([k, k * (a + b), k * a * b]) + ' = 0', X([1, -(a + b), a * b]) + ' = 0'], f'{k}(x² − (합)x + (곱)) = 0 — 전체에 {k} 를 곱한다.', chk=lambda: peval(cs, a) == 0 and peval(cs, b) == 0)
L = dict(id='cm1-15', no=15, title='두 수를 근으로 하는 이차방정식과 이차식의 인수분해', unit='Ⅱ-1 복소수와 이차방정식', pages='56 ~ 58', goal='두 수를 근으로 하는 이차방정식을 만들고, 이차식을 복소수의 범위에서 인수분해 할 수 있다.',
  review='14차시: α + β = −b/a, αβ = c/a · 11차시: (a + bi)(a − bi) = a² + b²', intro='근을 알면 방정식을 거꾸로 만들 수 있다: x² − (합)x + (곱) = 0.',
  concepts=[dict(id='c1', title='두 수를 근으로 하는 이차방정식', say='두 수 α, β 를 근으로 하고 x² 의 계수가 1 인 이차방정식: x² − (α + β)x + αβ = 0.', check=dict(type='ox', q='두 수 2, 3 을 근으로 하는 이차방정식은 x² + 5x + 6 = 0 이다.', ch=[], a='X', why='x² − 5x + 6 = 0 (합의 부호가 바뀐다).')),
            dict(id='c2', title='이차식의 인수분해 (복소수 범위)', say='ax² + bx + c = 0 의 두 근이 α, β 이면 ax² + bx + c = a(x − α)(x − β). 계수가 실수이면 허근은 켤레끼리 짝.')],
  mons=[dict(id='m1', title='문제 1 · 두 근으로 방정식 만들기', subs=[m1a, m1b, m1c]), dict(id='m2', title='문제 2 · 새 두 근으로 방정식 만들기', subs=[m2a, m2b]), dict(id='m3', title='문제 3 · 복소수 범위에서 인수분해', subs=[m3a, m3b]),
        dict(id='m4', title='문제 4 · 한 근이 허수일 때 a, b', hard=True, subs=[m4a, m4b, m4c]), dict(id='m5', title='x² 의 계수가 1 이 아닐 때', extra=True, subs=[ex1])],
  boss=[(m1a, 'c1', 'm1'), (m1c, 'c1', 'm1'), (m3b, 'c2', 'm3'), (m4a, 'c2', 'm4')],
  hard_from='산 = 본문 58쪽 생각 넓히기 꼴(본문에 있어 중단원에서 안 가져옴)',
  motion=[dict(title='근에서 방정식으로 — 거꾸로 가기', key='x² − (합)x + (곱) = 0.', scenes=['카드에 두 근 2 + 3i, 2 − 3i 가 칩으로 놓인다.', '커서가 두 칩을 겹치면 합 4 가, 곱하면 13 이 튀어나온다.', '틀 x² − ( )x + ( ) = 0 의 빈칸에 4, 13 이 들어간다.', 'x² − 4x + 13 = 0 완성 · 칩을 다시 넣어 ✓.'], end='x² − (α + β)x + αβ = 0')],
  notes=['56쪽 「두 수를 근으로 하는 이차방정식」부터 58쪽까지를 한 차시로 묶음(14차시가 55 ~ 56쪽 위).', '인수분해 보기의 허수는 「√7 i」처럼 띄어 적음.'])
if __name__ == '__main__': write(L)
