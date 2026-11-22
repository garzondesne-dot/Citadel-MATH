from cm1lib import *
X = lambda cs, v='x': D(P(cs, v))
def m1a(v, rng):
    k = pick(v, rng, -2, lambda r: ri(r, -4, 4)); A = [1, 3 * k, 3 * k * k, k ** 3]
    return choice(rng, f'{X(A)} 을 인수분해 하면?', f'({X([1, k])})³', [f'({X([1, -k])})³', f'({X([1, k])})({X([1, -k, k*k])})', f'({X([1, k**3])})³', f'({X([1, 3*k])})³'], f'x³ ± 3·x²·{abs(k)} + 3·x·{k*k} ± {abs(k)**3} 꼴 = (x ± {abs(k)})³.', chk=lambda: same(P(A), f'({P([1,k])})**3'))
def m1b(v, rng):
    p, q = pick(v, rng, (1, 3), lambda r: (ri(r, 1, 2), ri(r, -3, 3, (0, 1, -1)))); R = [(p ** 3, 3, 0), (3 * p * p * q, 2, 1), (3 * p * q * q, 1, 2), (q ** 3, 0, 3)]
    f = lambda a, b: f"({D(T([(a,1,0),(b,0,1)],'ab'))})³"
    return choice(rng, f"{D(T(R, 'ab'))} 을 인수분해 하면?", f(p, q), [f(p, -q), f(p, q ** 3), f(p ** 3, q), f(q, p)], f"양 끝이 ({D(T([(p,1,0)],'ab'))})³ 과 ({D(T([(q,0,1)],'ab'))})³ — 가운데 두 항의 계수로 확인한다.", chk=lambda: same(T(R, 'ab'), f"({T([(p,1,0),(q,0,1)],'ab')})**3", 'ab'))
def m2a(v, rng):
    k = pick(v, rng, -1, lambda r: ri(r, -5, 5)); A = [1, 0, 0, k ** 3]
    f = lambda a, b: f'({X([1, a])})({X([1, b, k*k])})'
    return choice(rng, f'{X(A)} 을 인수분해 하면?', f(k, -k), [f(k, k), f(-k, -k), f'({X([1, k])})³', f(-k, k)], f"a³ {'+' if k>0 else '−'} b³ = (a {'+' if k>0 else '−'} b)(a² {'−' if k>0 else '+'} ab + b²), b = {abs(k)}.", chk=lambda: same(P(A), f'({P([1,k])})*({P([1,-k,k*k])})'))
def m2b(v, rng):
    p, q = pick(v, rng, (3, 1), lambda r: (ri(r, 2, 3), ri(r, -4, 4, (0,)))); R = [(p ** 3, 3, 0), (q ** 3, 0, 3)]
    f = lambda s: f"({D(T([(p,1,0),(q,0,1)]))})({D(T([(p*p,2,0),(s*p*q,1,1),(q*q,0,2)]))})"
    return choice(rng, f'{D(T(R))} 을 인수분해 하면?', f(-1), [f(1), f"({D(T([(p,1,0),(q,0,1)]))})³", f"({D(T([(p,1,0),(-q,0,1)]))})({D(T([(p*p,2,0),(-p*q,1,1),(q*q,0,2)]))})"], f"({D(T([(p,1,0)]))})³ 과 ({D(T([(abs(q),0,1)]))})³ 으로 보고 공식에 넣는다(가운데 항 부호 반대).", chk=lambda: same(T(R), f"({T([(p,1,0),(q,0,1)])})*({T([(p*p,2,0),(-p*q,1,1),(q*q,0,2)])})", 'xy'))
def m3a(v, rng):
    q, r = pick(v, rng, (1, -1), lambda rr: (rr.choice([1, -1, 2, -2]), rr.choice([1, -1])))
    R = [(1, 2, 0, 0), (q * q, 0, 2, 0), (r * r, 0, 0, 2), (2 * q, 1, 1, 0), (2 * q * r, 0, 1, 1), (2 * r, 1, 0, 1)]
    f = lambda a, b: f"({D(T([(1,1,0,0),(a,0,1,0),(b,0,0,1)],'xyz'))})²"
    return choice(rng, f"{D(T(R, 'xyz'))} 을 인수분해 하면?", f(q, r), [f(-q, r), f(q, -r), f(-q, -r)], 'xy, yz, zx 항의 부호로 y, z 의 부호를 정한다(둘 다 음수인 문자가 − 이다).', chk=lambda: same(T(R, 'xyz'), f"({T([(1,1,0,0),(q,0,1,0),(r,0,0,1)],'xyz')})**2", 'xyz'))
def SUBX(v, rng): return pick(v, rng, (1, 5), lambda r: tuple(sorted(r.sample([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5], 2))))
def m4a(v, rng):
    m, n = SUBX(v, random.Random(rng.random() if v else 1)); c = pmul([1, m], [1, n])
    src = f"(a + b)² {'+' if c[1]>=0 else '−'} {abs(c[1])}(a + b) {'+' if c[2]>=0 else '−'} {abs(c[2])}"
    return choice(rng, f'{src} 에서 a + b = X 로 놓으면?', X(c, 'X'), [X([1, c[1], -c[2]], 'X'), X([1, c[2], c[1]], 'X'), X([2, c[1], c[2]], 'X')], '똑같이 들어 있는 a + b 를 한 문자로 바꾸면 X 에 대한 이차식.', chk=True)
def m4b(v, rng):
    m, n = SUBX(v, random.Random(rng.random() if v else 1)); c = pmul([1, m], [1, n])
    src = f"(a + b)² {'+' if c[1]>=0 else '−'} {abs(c[1])}(a + b) {'+' if c[2]>=0 else '−'} {abs(c[2])}"
    f = lambda a, b: f"(a + b {'+' if a>0 else '−'} {abs(a)})(a + b {'+' if b>0 else '−'} {abs(b)})"
    return choice(rng, f'{src} 를 인수분해 하면?', f(m, n), [f(-m, -n), f(m, -n), f(m + 1, n - 1) if (m + 1) * (n - 1) else f(-m, n)], f'X² 꼴을 (X {N(m) if m<0 else "+ "+str(m)})(X {N(n) if n<0 else "+ "+str(n)}) 로 인수분해 한 뒤 X 를 a + b 로 되돌린다.'[:89], chk=lambda: same(f'(a+b)**2+({c[1]})*(a+b)+({c[2]})', f'(a+b+({m}))*(a+b+({n}))', 'ab'))
# 산: (x² + bx)(x² + bx + c) + d  (교과서 33쪽 문제 2 ⑴ 꼴)
def HARD(v, rng):
    p, q = pick(v, rng, (1, 2), lambda r: tuple(sorted(r.sample([1, 2, 3, 4], 2)))); b = p + q; n = p * q; m = pick(v, rng, -3, lambda r: r.choice([-5, -3, -2, 1, 3, 5]))
    if m == n: m = -m
    if m == -n: m = m + (2 if m > 0 else -2)
    if m == n: m = m + 1
    return b, m, n, p, q            # X = x² + bx · (X + m)(X + n) · x² + bx + n = (x + p)(x + q)
def hs(v, rng):
    b, m, n, p, q = HARD(v, random.Random(rng.random() if v else 1)); c, d = m + n, m * n
    src = f"({X([1, b, 0])})({X([1, b, c])}) {'+' if d>=0 else '−'} {abs(d)}"
    return b, m, n, p, q, c, d, src
def m5a(v, rng):
    b, m, n, p, q, c, d, src = hs(v, rng)
    return choice(rng, f'{src} 에서 {X([1, b, 0])} = X 로 놓고 전개하면?', X([1, c, d], 'X'), [X([1, c, -d], 'X'), X([1, 0, d], 'X'), X([1, -c, d], 'X')], f'X(X {"+" if c>=0 else "−"} {abs(c)}) {"+" if d>=0 else "−"} {abs(d)} 를 전개한다.', chk=True)
def m5b(v, rng):
    b, m, n, p, q, c, d, src = hs(v, rng)
    f = lambda a, bb: f"({X([1, a], 'X')})({X([1, bb], 'X')})"
    return choice(rng, f"{X([1, c, d], 'X')} 을 인수분해 하면?", f(m, n), [f(-m, -n), f(m, -n), f(-m, n)], f'곱이 {N(d)}, 합이 {N(c)} 인 두 수 = {N(m)}, {N(n)}.', chk=lambda: pmul([1, m], [1, n]) == [1, c, d])
def m5c(v, rng):
    b, m, n, p, q, c, d, src = hs(v, rng)
    right = f'({X([1, b, m])})({X([1, p])})({X([1, q])})'
    return choice(rng, f'{src} 를 인수분해 하면?', right, [f'({X([1, b, m])})({X([1, b, n])})²', f'({X([1, b, -m])})({X([1, -p])})({X([1, -q])})', f'({X([1, b, m])})({X([1, -p])})({X([1, -q])})'], f'X 를 되돌리면 ({X([1, b, m])})({X([1, b, n])}) — 뒤 괄호는 한 번 더 인수분해 된다.', chk=lambda: same(f'({P([1,b,0])})*({P([1,b,c])})+({d})', f'({P([1,b,m])})*({P([1,p])})*({P([1,q])})'))
def ex1(v, rng):
    n, k = pick(v, rng, (98, 2), lambda r: r.choice([(98, 2), (97, 3), (99, 1), (48, 2), (198, 2), (995, 5)])); t = n + k
    return choice(rng, f'{n}³ + 3 × {n}² × {k} + 3 × {n} × {k*k} + {k**3} 의 값은?', f'{t**3}', [f'{t**2}', f'{n**3 + k**3}', f'{t**3 + 1}'], f'a³ + 3a²b + 3ab² + b³ = (a + b)³ 꼴 → ({n} + {k})³ = {t}³.', chk=lambda: n ** 3 + 3 * n * n * k + 3 * n * k * k + k ** 3 == t ** 3)
L = dict(id='cm1-08', no=8, title='인수분해 공식', unit='Ⅰ-2 나머지정리와 인수분해', pages='32 ~ 33', goal='인수분해 공식을 이용하여 다항식을 인수분해 할 수 있다.',
  review='2차시 곱셈 공식 세 줄 · 중학교 인수분해: x² + 5x + 6 = (x + 2)(x + 3)', intro='곱셈 공식을 거꾸로 읽으면 인수분해 공식 — 전개의 되감기.',
  concepts=[dict(id='c1', title='인수분해 공식', say='a² + b² + c² + 2ab + 2bc + 2ca = (a + b + c)² · a³ ± 3a²b + 3ab² ± b³ = (a ± b)³ · a³ ± b³ = (a ± b)(a² ∓ ab + b²).', check=dict(type='ox', q='a³ + b³ = (a + b)³ 이다.', ch=[], a='X', why='a³ + b³ = (a + b)(a² − ab + b²).')),
            dict(id='c2', title='공통부분을 한 문자로', say='공식을 바로 쓸 수 없으면 되풀이되는 부분을 X 로 놓고 인수분해 한 뒤 원래 식으로 되돌린다(되돌린 뒤 더 인수분해 되는지 확인).')],
  mons=[dict(id='m1', title='문제 1 · 세제곱 꼴', subs=[m1a, m1b]), dict(id='m2', title='문제 2 · a³ ± b³', subs=[m2a, m2b]), dict(id='m3', title='문제 3 · 세 항의 제곱 · 공통부분', subs=[m3a, m4a, m4b]),
        dict(id='m4', title='문제 4 · 공통부분을 놓고 끝까지', hard=True, subs=[m5a, m5b, m5c]), dict(id='m5', title='수 계산에 쓰기', extra=True, subs=[ex1])],
  boss=[(m1a, 'c1', 'm1'), (m2a, 'c1', 'm2'), (m3a, 'c1', 'm3'), (m4b, 'c2', 'm3')],
  hard_from='산 = 본문 33쪽 문제 2 ⑴ 꼴(이미 어려운 문제가 있어 중단원에서 안 가져옴)',
  motion=[dict(title='인수분해 = 전개 되감기', key='곱셈 공식을 오른쪽에서 왼쪽으로 읽으면 인수분해 공식이다.', scenes=['카드에 (a + b)³ → a³ + 3a²b + 3ab² + b³ 이 화살표와 함께 뜬다.', '커서가 「되감기」 단추를 누르면 화살표가 반대로 돈다.', 'x³ − 6x² + 12x − 8 이 들어와 a = x, b = 2 딱지가 붙는다.', '(x − 2)³ 으로 접힌다.'], end='x³ − 6x² + 12x − 8 = (x − 2)³')],
  notes=['문제 3 은 세 항의 제곱 1 + 공통부분 2 소문항으로 묶음(소문항 4개 상한 안).', '여유 문제 = 중단원 마무리 09번과 같은 생각(공식으로 수 계산).'])
if __name__ == '__main__': write(L)
