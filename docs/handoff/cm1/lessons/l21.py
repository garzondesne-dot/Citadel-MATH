from cm1lib import *
X = lambda cs, v='x': D(P(cs, v))
sol_ = lambda rs: ' 또는 '.join(f'x = {N(r)}' for r in sorted(set(rs)))
def SB(v, rng):
    b = pick(v, rng, 1, lambda r: ri(r, -3, 3)); p, q = pick(v, rng, (1, 2), lambda r: tuple(r.sample([1, 2, 3, 4, 5], 2)))
    m, n = p * (-b - p) * -1, q * (-b - q) * -1     # x² + bx = m ⟺ (x − p)(x + b + p) = 0 → m = p(p + b)
    m, n = p * (p + b), q * (q + b)
    if m == n or 0 in (m, n): return SB(1, random.Random(rng.random()))
    return b, p, q, m, n
def ss(v, rng):
    b, p, q, m, n = SB(v, random.Random(rng.random() if v else 1)); core = X([1, b, 0]); e = pmul([1, -m], [1, -n])
    return b, p, q, m, n, core, e, f"사차방정식 ({core})² {'+' if e[1]>=0 else '−'} {abs(e[1])}({core}) {'+' if e[2]>=0 else '−'} {abs(e[2])} = 0 에서 {core} = X 로 놓으면"
def m1a(v, rng):
    b, p, q, m, n, core, e, s = ss(v, rng)
    return choice(rng, f'{s} X 의 값은?', f'X = {N(min(m,n))} 또는 X = {N(max(m,n))}', [f'X = {N(-max(m,n))} 또는 X = {N(-min(m,n))}', f'X = {N(m + n)} 또는 X = {N(m * n)}', f'X = {N(min(m,n))}'], f"{X(e, 'X')} = 0 을 인수분해 한다.", chk=lambda: pmul([1, -m], [1, -n]) == e)
def m1b(v, rng):
    b, p, q, m, n, core, e, s = ss(v, rng); rs = [p, -b - p, q, -b - q]
    return choice(rng, f'{s} X = {N(m)} 또는 X = {N(n)} 이다. 이 사차방정식의 해를 모두 구한 것은?', sol_(rs), [sol_([p, q]), sol_([-r for r in rs]) if sol_([-r for r in rs]) != sol_(rs) else sol_([p, q, p + q]), sol_([m, n])], f'{core} = {N(m)}, {core} = {N(n)} 두 이차방정식을 각각 푼다.', chk=lambda: all((r * r + b * r - m) * (r * r + b * r - n) == 0 for r in rs))
def R3(v, rng): return pick(v, rng, (2, -1, 3), lambda r: tuple(r.sample([-4, -3, -2, -1, 1, 2, 3, 4], 3)))
def cub(rs):
    c = [1]
    for r in rs: c = pmul(c, [1, -r])
    return c
def ks(v, rng):
    rs = R3(v, random.Random(rng.random() if v else 1)); cs = cub(rs); k = rs[0]
    fx = 'x³ + ax²' + ''.join(f" {'+' if c>0 else '−'} {D(P([abs(c)] + [0]*(3-i)))}" for i, c in enumerate(cs) if i >= 2 and c)
    return rs, cs, k, f'삼차방정식 {fx} = 0 의 한 근이 {N(k)} 이다 (a 는 상수).'
def m2a(v, rng):
    rs, cs, k, s = ks(v, rng); return number(f'{s} a 의 값은?', cs[1], f'x = {N(k)} 를 대입하면 a 에 대한 일차방정식이 된다.', chk=lambda: peval(cs, k) == 0)
def m2b(v, rng):
    rs, cs, k, s = ks(v, rng)
    return choice(rng, f'삼차방정식 {X(cs)} = 0 의 한 근이 {N(k)} 일 때, 나머지 두 근은?', f'{N(min(rs[1:]))}, {N(max(rs[1:]))}', [f'{N(-max(rs[1:]))}, {N(-min(rs[1:]))}' if sorted(-r for r in rs[1:]) != sorted(rs[1:]) else f'{N(rs[1]+1)}, {N(rs[2]+1)}', f'{N(rs[1])}, {N(-rs[2])}', f'{N(rs[1] + rs[2])}, {N(rs[1] * rs[2])}'], f'x − ({N(k)}) 로 조립제법 → 몫(이차식) = 0 을 푼다.', chk=lambda: all(peval(cs, r) == 0 for r in rs))
def BX(v, rng): return pick(v, rng, (3, 1, 2), lambda r: (ri(r, 2, 5), ri(r, 1, 3), ri(r, 2, 5)))
def xs(v, rng):
    x0, a, b = BX(v, random.Random(rng.random() if v else 1)); V = x0 * (x0 + a) * (x0 + b)
    return x0, a, b, V, f'가로, 세로, 높이가 각각 x, x + {a}, x + {b} 인 직육면체의 부피가 {V} 이다.'
def m3a(v, rng):
    x0, a, b, V, s = xs(v, rng); cs = padd(pmul(pmul([1, 0], [1, a]), [1, b]), [-V])
    return choice(rng, f'{s} x 에 대한 방정식을 세워 정리하면?', X(cs) + ' = 0', [X(padd(cs, [2 * V])) + ' = 0', X([1, a + b, a * b, -V]) + ' = 0', X([1, a + b, 0, -V]) + ' = 0'], f'x(x + {a})(x + {b}) = {V} 를 전개해 우변을 넘긴다.', chk=lambda: peval(cs, x0) == 0)
def m3b(v, rng):
    x0, a, b, V, s = xs(v, rng); return number(f'{s} x 의 값은? (x 는 양수)', x0, f'x = {x0} 을 넣으면 {x0} × {x0+a} × {x0+b} = {V}. x 가 양수일 때 부피는 x 가 커질수록 커지므로 답은 하나.', chk=lambda: x0 * (x0 + a) * (x0 + b) == V)
# 산: x³ = 1 의 허근 ω (대단원 평가 09 꼴)
W = '방정식 x³ = 1 의 한 허근을 ω 라 할 때,'
def m4a(v, rng):
    n = pick(v, rng, 3, lambda r: 3 * ri(r, 2, 9))
    return number(f'{W} ω{str(n).translate(SUP)} 의 값은?', 1, f'ω 는 x³ = 1 의 근 → ω³ = 1 → ω{str(n).translate(SUP)} = (ω³){str(n//3).translate(SUP)} = 1.', chk=True)
def m4b(v, rng):
    t = v; q = ['ω² + ω + 1', '1 + ω + ω²', 'ω + ω² + 1', 'ω² + 1 + ω', '1 + ω² + ω', 'ω + 1 + ω²', 'ω(ω + 1) + 1'][t]
    return number(f'{W} x³ − 1 = (x − 1)(x² + x + 1) 임을 이용하여 {q} 의 값을 구하면?', 0, 'ω 는 허근이므로 x − 1 = 0 이 아닌 x² + x + 1 = 0 의 근이다.', chk=True)
def m4c(v, rng):
    a, b = pick(v, rng, (10, 5), lambda r: (3 * ri(r, 1, 8) + 1, 3 * ri(r, 1, 8) + 2))
    return choice(rng, f'{W} ω{str(a).translate(SUP)} + ω{str(b).translate(SUP)} + 1 의 값은? (ω³ = 1, ω² + ω + 1 = 0)', '0', ['1', '3', '−1', 'ω'], f'ω{str(a).translate(SUP)} = ω, ω{str(b).translate(SUP)} = ω² (지수를 3 으로 나눈 나머지) → ω + ω² + 1.', chk=lambda: a % 3 == 1 and b % 3 == 2)
def ex1(v, rng):
    p, q = pick(v, rng, (1, 2), lambda r: tuple(sorted(r.sample([1, 2, 3, 4, 5], 2)))); A = [1, 0, -(p * p + q * q), 0, p * p * q * q]
    return number(f'사차방정식 {X(A)} = 0 의 네 근 중 가장 큰 근과 가장 작은 근의 곱은?', -q * q, f'(x² − {p*p})(x² − {q*q}) = 0 → x = ±{p}, ±{q} → {q} × (−{q}).', chk=lambda: all(peval(A, r) == 0 for r in (p, -p, q, -q)))
L = dict(id='cm1-21', no=21, title='삼차방정식과 사차방정식 (치환 · 활용 · ω)', unit='Ⅱ-3 여러 가지 방정식과 부등식', pages='78 ~ 79 · 96 (대단원 09)', goal='공통부분 치환으로 사차방정식을 풀고, 삼차방정식을 실생활 문제와 x³ = 1 의 허근에 활용할 수 있다.',
  review='20차시: 인수분해로 삼차 · 사차방정식 풀기 · 12차시: i 의 거듭제곱의 규칙', intro='식 안에 같은 덩어리가 보이면 한 문자로. 그리고 x³ = 1 의 허근 ω 는 i 처럼 「세 박자」로 돈다.',
  concepts=[dict(id='c1', title='공통부분이 있는 사차방정식', say='x² + bx 같은 공통부분을 X 로 놓아 X 에 대한 이차방정식을 풀고, X 값마다 x 에 대한 이차방정식을 다시 푼다.'),
            dict(id='c2', title='삼차방정식의 활용과 x³ = 1 의 허근', say='부피 문제 = 삼차방정식(양수인 근만). x³ = 1 의 허근 ω: ω³ = 1, ω² + ω + 1 = 0.', check=dict(type='ox', q='x³ = 1 의 한 허근을 ω 라 하면 ω² + ω + 1 = 0 이다.', ch=[], a='O', why='x³ − 1 = (x − 1)(x² + x + 1) 에서 ω ≠ 1 이므로.'))],
  mons=[dict(id='m1', title='문제 1 · 공통부분을 X 로', subs=[m1a, m1b]), dict(id='m2', title='문제 2 · 한 근을 알 때', subs=[m2a, m2b]), dict(id='m3', title='문제 3 · 직육면체의 부피', subs=[m3a, m3b]),
        dict(id='m4', title='문제 4 · x³ = 1 의 허근 ω', hard=True, subs=[m4a, m4b, m4c]), dict(id='m5', title='네 근 살펴보기', extra=True, subs=[ex1])],
  boss=[(m1a, 'c1', 'm1'), (m2a, 'c2', 'm2'), (m3b, 'c2', 'm3'), (m4a, 'c2', 'm4')],
  hard_from='산 = 대단원 평가 09번 꼴(ω · 본문에 어려운 문제가 없어 가져옴)',
  motion=[dict(title='ω 는 세 박자', key='ω³ = 1 이므로 ω 의 거듭제곱은 ω, ω², 1 이 되풀이된다.', scenes=['카드에 x³ − 1 = (x − 1)(x² + x + 1) 이 갈라진다.', '뒤 괄호의 근에 ω 딱지가 붙고 ω² + ω + 1 = 0 이 뜬다.', '세 칸 바퀴(ω, ω², 1)가 「× ω」 누를 때마다 한 칸씩 돈다.', 'ω¹⁰ 을 넣으면 세 바퀴 돌고 ω 에 멈춘다.'], end='ω³ = 1 · ω² + ω + 1 = 0', at='c2')],
  notes=['ω 는 교과서 대단원 평가에만 나오는 내용 — 특성화고 수준에 무거우면 문제 4 를 여유 문제와 맞바꾸는 것을 권함(선생님 확인 거리).', '문제 3 은 양수 근이 하나뿐(부피는 x 가 커질수록 커짐).'])
if __name__ == '__main__': write(L)
