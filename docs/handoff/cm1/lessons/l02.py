from cm1lib import *
X = lambda cs: D(P(cs))
def m1a(v, rng):
    a, b, c = pick(v, rng, (2, -1, 3), lambda r: (ri(r, -3, 3), ri(r, -3, 3), ri(r, -4, 4))); k = pick(v, rng, 2, lambda r: ri(r, 1, 3))
    A, B = [1, a], [k, b, c]; R = pmul(A, B)
    w = [X(padd(pmul([1, 0], B), [a * c])), X(pmul([1, -a], B)), X([R[0], R[1], B[2], R[3]]), X(padd(R, [1, 0, 0]))]
    return choice(rng, f'({X(A)})({X(B)}) 를 전개하면?', X(R), w, f'x 와 {N(a)} 를 각각 뒤 식에 곱해 더한 뒤 동류항을 정리한다.', chk=lambda: same(P(R), f'({P(A)})*({P(B)})'))
def m1b(v, rng):
    a, b, c, d = pick(v, rng, (1, 2, -1, 2), lambda r: (ri(r, 1, 2), ri(r, -3, 3), ri(r, -2, 2), ri(r, 1, 3)))
    A = [(1, 2, 0), (a * 2, 1, 1), (b, 0, 2)]; B = [(c, 1, 0), (d, 0, 1)]
    xy2 = a * 2 * d + b * c          # xy² 의 계수
    return number(f'({D(T(A))})({D(T(B))}) 를 전개했을 때 xy² 의 계수는?', xy2, f'xy² 이 나오는 곱: {D(T([A[1]]))} × {D(T([B[1]]))}, {D(T([A[2]]))} × {D(T([B[0]]))} → {N(a*2*d)} + ({N(b*c)}).',
                  chk=lambda: all(ev(f'({T(A)})*({T(B)})', x=Fr(p), y=Fr(q)) == sum(cf * Fr(p) ** i * Fr(q) ** j for cf, i, j in [(c, 3, 0), (d + a * 2 * c, 2, 1), (xy2, 1, 2), (b * d, 0, 3)]) for p, q in [(2, 3), (-1, 5), (3, -2)]))
def sq3(p, q, r, vs):
    return [(p * p, 2, 0, 0), (q * q, 0, 2, 0), (r * r, 0, 0, 2), (2 * p * q, 1, 1, 0), (2 * q * r, 0, 1, 1), (2 * r * p, 1, 0, 1)]
def m2a(v, rng):
    p, q, r, vs = pick(v, rng, (1, -1, 2, 'abc'), lambda rr: (ri(rr, 1, 2), ri(rr, -2, 2), ri(rr, -3, 3), rr.choice(['abc', 'xyz'])))
    src = T([(p, 1, 0, 0), (q, 0, 1, 0), (r, 0, 0, 1)], vs); R = sq3(p, q, r, vs)
    w = [D(T(R[:3], vs)), D(T(R[:3] + [(c // 2, *d) for c, *d in R[3:]], vs)), D(T(R[:3] + [(abs(c), *d) for c, *d in R[3:]], vs)), D(T(R[:3] + [(-c, *d) for c, *d in R[3:]], vs))]
    return choice(rng, f'({D(src)})² 을 전개하면?', D(T(R, vs)), w, '(a + b + c)² = a² + b² + c² + 2ab + 2bc + 2ca 에 부호까지 넣어 대입한다.', chk=lambda: same(T(R, vs), f'({src})**2', vs))
def m2b(v, rng):
    p, q, k = pick(v, rng, (1, 1, -1), lambda r: (ri(r, 1, 2), ri(r, -2, 2), ri(r, -3, 3)))
    src = f"{T([(p,1,0),(q,0,1)],'ab')}{'+' if k>0 else '-'}{abs(k)}"
    R = [(p * p, 2, 0), (q * q, 0, 2), (2 * p * q, 1, 1), (2 * p * k, 1, 0), (2 * q * k, 0, 1), (k * k, 0, 0)]
    w = [D(T(R[:2] + [R[5]], 'ab')), D(T(R[:3] + [(p * k, 1, 0), (q * k, 0, 1), R[5]], 'ab')), D(T(R[:5] + [(-k * k, 0, 0)], 'ab')), D(T(R[:3] + [(-2 * p * k, 1, 0), (-2 * q * k, 0, 1), R[5]], 'ab'))]
    return choice(rng, f'({D(src)})² 을 전개하면?', D(T(R, 'ab')), w, f'c 자리에 {N(k)} 를 넣는다: c² = {k*k}, 2bc 와 2ca 의 부호에 주의.', chk=lambda: same(T(R, 'ab'), f'({src})**2', 'ab'))
def cube(p, q, vs):
    return [(p ** 3, 3, 0), (3 * p * p * q, 2, 1), (3 * p * q * q, 1, 2), (q ** 3, 0, 3)]
def m3a(v, rng):
    k = pick(v, rng, -1, lambda r: ri(r, -4, 4)); R = [1, 3 * k, 3 * k * k, k ** 3]
    w = [X([1, 0, 0, k ** 3]), X([1, k, k * k, k ** 3]), X([1, 3 * k, 3 * k * k, -k ** 3]), X([1, -3 * k, 3 * k * k, k ** 3])]
    return choice(rng, f'({X([1, k])})³ 을 전개하면?', X(R), w, f'(a ± b)³ = a³ ± 3a²b + 3ab² ± b³ 에 a = x, b = {abs(k)} 대입.', chk=lambda: same(P(R), f'({P([1,k])})**3'))
def m3b(v, rng):
    p, q, vs = pick(v, rng, (2, -1, 'ab'), lambda r: (ri(r, 1, 3), ri(r, -3, 3), r.choice(['ab', 'xy']))); 
    if abs(p) == 1 and abs(q) == 1: q = 2 * q
    src = T([(p, 1, 0), (q, 0, 1)], vs); R = cube(p, q, vs)
    w = [D(T([R[0], R[3]], vs)), D(T([R[0], (p * p * q, 2, 1), (p * q * q, 1, 2), R[3]], vs)), D(T([R[0], (-R[1][0], 2, 1), R[2], (-R[3][0], 0, 3)], vs)), D(T([(p, 3, 0), (3 * p * q, 2, 1), (3 * p * q, 1, 2), (q, 0, 3)], vs))]
    return choice(rng, f'({D(src)})³ 을 전개하면?', D(T(R, vs)), w, f'{D(T([(p,1,0)],vs))} 와 {D(T([(abs(q),0,1)],vs))} 를 통째로 a, b 로 보고 세제곱 공식에 넣는다(계수도 세제곱).', chk=lambda: same(T(R, vs), f'({src})**3', vs))
def m4a(v, rng):
    k = pick(v, rng, -2, lambda r: ri(r, -5, 5)); A = [1, k]; B = [1, -k, k * k]
    w = [X([1, 0, 0, -k ** 3]), X([1, 2 * k, 2 * k * k, k ** 3]), X(pmul([1, k], [1, k, k * k])), X([1, 0, 0, k * k])]
    return choice(rng, f'({X(A)})({X(B)}) 를 전개하면?', X([1, 0, 0, k ** 3]), w, f"(a {'+' if k>0 else '−'} b)(a² {'−' if k>0 else '+'} ab + b²) = a³ {'+' if k>0 else '−'} b³ 꼴 → b = {abs(k)}.", chk=lambda: same(P([1, 0, 0, k ** 3]), f'({P(A)})*({P(B)})'))
def m4b(v, rng):
    p, q = pick(v, rng, (2, 3), lambda r: (ri(r, 1, 3), ri(r, -3, 3, (0, 1, -1))))
    A = [(p, 1, 0), (q, 0, 1)]; B = [(p * p, 2, 0), (-p * q, 1, 1), (q * q, 0, 2)]; R = [(p ** 3, 3, 0), (q ** 3, 0, 3)]
    w = [D(T([(p ** 3, 3, 0), (-q ** 3, 0, 3)])), D(T([(p, 3, 0), (q, 0, 3)])), D(T([(p * p, 3, 0), (q * q * (1 if q > 0 else -1), 0, 3)])), D(T(cube(p, q, 'xy')))]
    return choice(rng, f'({D(T(A))})({D(T(B))}) 를 전개하면?', D(T(R)), w, f'a = {D(T([A[0]]))}, b = {D(T([(abs(q),0,1)]))} 로 보면 a³ ± b³ 꼴 → 계수도 세제곱한다.', chk=lambda: same(T(R), f'({T(A)})*({T(B)})', 'xy'))
def m4c(v, rng):
    k = pick(v, rng, 2, lambda r: ri(r, 2, 5)); ok = (v % 2 == 1)
    B = [1, -k, k * k] if ok else [1, k, k * k]
    return ox(f'({X([1, k])})({X(B)}) = {X([1, 0, 0, k ** 3])} 이다.', ok, '가운데 항의 부호가 앞 괄호와 반대여야 a³ + b³ 이 된다.' if not ok else '(a + b)(a² − ab + b²) = a³ + b³ 꼴과 같다.', chk=lambda: same(P([1, 0, 0, k ** 3]), f'({P([1,k])})*({P(B)})') == ok)
# 산: 공통 부분 치환 (중단원 마무리 06 ⑴ 꼴)
def SUB(v, rng): return pick(v, rng, (-2, -3, -2), lambda r: (ri(r, -3, 3), ri(r, -4, 4), ri(r, -4, 4)))
def m5a(v, rng):
    b, p, q = SUB(v, random.Random(rng.random() if v else 1)); core = X([1, b, 0]); src = f'({X([1, b, p])})({X([1, b, q])})'
    return choice(rng, f'{src} 를 전개하려고 한다. {core} = t 로 놓으면 이 식은?', f'({D(P([1, p], "t"))})({D(P([1, q], "t"))})', [f'({D(P([1, p], "t"))})²', f'({D(P([1, -p], "t"))})({D(P([1, -q], "t"))})', f't² {"+" if p*q>0 else "−"} {abs(p*q)}'], '두 괄호에 똑같이 들어 있는 부분을 한 문자로 바꾼다.', chk=True)
def m5b(v, rng):
    b, p, q = SUB(v, random.Random(rng.random() if v else 1)); R = pmul([1, p], [1, q])
    w = [D(P([1, 0, p * q], 't')), D(P([1, p * q, p + q], 't')), D(P([1, -(p + q), p * q], 't')), D(P([1, p + q, -p * q], 't'))]
    return choice(rng, f'({D(P([1, p], "t"))})({D(P([1, q], "t"))}) 를 전개하면?', D(P(R, 't')), w, '(t + a)(t + b) = t² + (a + b)t + ab.', chk=lambda: same(P(R, 't'), f'({P([1,p],"t")})*({P([1,q],"t")})', 't'))
def m5c(v, rng):
    b, p, q = SUB(v, random.Random(rng.random() if v else 1)); R = pmul([1, b, p], [1, b, q]); t2 = pmul([1, b, 0], [1, b, 0])
    w = [X(padd(t2, [p * q])), X(padd(padd(t2, pmul([p + q], [1, b, 0])), [-p * q])), X(pmul([1, b, p], [1, -b, q])), X(padd(R, [1, 0, 0]))]
    return choice(rng, f'({X([1, b, p])})({X([1, b, q])}) 를 전개하면?', X(R), w, f't = {X([1, b, 0])} 로 놓고 전개한 뒤 t 를 되돌려 다시 전개한다.', chk=lambda: same(P(R), f'({P([1,b,p])})*({P([1,b,q])})'))
def ex1(v, rng):
    vr, n = pick(v, rng, ('a', 3), lambda r: (r.choice('axy'), r.choice([2, 3])))
    fs = [f'({vr} − 1)', f'({vr} + 1)'] + [f'({vr}{str(2**i).translate(SUP)} + 1)' for i in range(1, n)]
    e = 2 ** n; right = f'{vr}{str(e).translate(SUP)} − 1'
    w = [f'{vr}{str(e).translate(SUP)} + 1', f'{vr}{str(e - 1).translate(SUP)} − 1', f'{vr}{str(2 * e).translate(SUP)} − 1']
    py = '*'.join([f'({vr}-1)', f'({vr}+1)'] + [f'({vr}**{2**i}+1)' for i in range(1, n)])
    return choice(rng, ''.join(fs) + ' 를 전개하면?', right, w, '(a − b)(a + b) = a² − b² 을 앞에서부터 차례로 되풀이한다.', chk=lambda: same(py, f'{vr}**{e}-1', vr))
def b1(v, rng):
    a, b, c = pick(v, rng, (-1, -1, 1), lambda r: (ri(r, -3, 3), ri(r, -3, 3), ri(r, -4, 4))); R = pmul([1, a], [1, b, c])
    return number(f'({X([1, a])})({X([1, b, c])}) 를 전개했을 때 x 의 계수는?', R[2], f'x 가 나오는 곱: x × ({N(c)}) 와 ({N(a)}) × ({D(P([b, 0]))}) → {N(c)} + ({N(a*b)}).', chk=lambda: same(P(R), f'({P([1,a])})*({P([1,b,c])})'))
L = dict(id='cm1-02', no=2, title='다항식의 곱셈과 곱셈 공식', unit='Ⅰ-1 다항식의 연산', pages='15 ~ 17', goal='다항식의 곱셈의 원리를 설명하고, 곱셈 공식을 이용하여 식을 전개할 수 있다.',
  review='중학교 곱셈 공식: (a + b)², (a − b)², (a + b)(a − b), (x + a)(x + b) 빈칸 채우기 · 1차시: 동류항 정리', intro='직사각형 땅을 네 구역으로 나눈 넓이의 합 = 전체 넓이 → (a + b)(x + y) = ax + ay + bx + by.',
  concepts=[dict(id='c1', title='다항식의 곱셈 (분배법칙)', say='한 식의 각 항을 다른 식의 모든 항에 곱한 뒤 동류항끼리 정리한다. 교환 · 결합 · 분배법칙이 성립한다.', check=dict(type='ox', q='(x + 2)(x² − x + 3) 을 전개하면 항이 6개 생기고, 동류항을 정리하면 4개가 된다.', ch=[], a='O', why='2 × 3 = 6개의 곱 → x³, x², x, 상수항으로 정리.')),
            dict(id='c2', title='곱셈 공식 (세 항의 제곱 · 세제곱 · 세제곱의 합과 차)', say='(a + b + c)² = a² + b² + c² + 2ab + 2bc + 2ca · (a ± b)³ = a³ ± 3a²b + 3ab² ± b³ · (a ± b)(a² ∓ ab + b²) = a³ ± b³.', check=dict(type='ox', q='(a + b)³ = a³ + b³ 이다.', ch=[], a='X', why='가운데 3a²b + 3ab² 이 빠졌다.'))],
  mons=[dict(id='m1', title='문제 1 · 분배법칙으로 전개', subs=[m1a, m1b]),
        dict(id='m2', title='문제 2 · 세 항의 제곱', subs=[m2a, m2b]),
        dict(id='m3', title='문제 3 · 세제곱 전개', subs=[m3a, m3b]),
        dict(id='m4', title='문제 4 · a³ ± b³ 꼴', subs=[m4c, m4a, m4b]),
        dict(id='m5', title='문제 5 · 공통 부분을 한 문자로', hard=True, subs=[m5a, m5b, m5c]),
        dict(id='m6', title='합차 공식 되풀이', extra=True, subs=[ex1])],
  boss=[(b1, 'c1', 'm1'), (m2a, 'c2', 'm2'), (m3a, 'c2', 'm3'), (m4a, 'c2', 'm4')],
  hard_from='산 = 중단원 마무리 06 ⑴ 꼴(공통 부분 치환) · 본문에는 공식 대입만 있어 가져옴',
  motion=[dict(title='분배법칙 = 넓이 나누기', key='(a + b)(x + y) 는 큰 직사각형을 네 칸으로 나눈 넓이의 합이다.', scenes=['흰 카드에 가로 a + b, 세로 x + y 인 직사각형이 그려진다.', '커서가 세로선 · 가로선을 하나씩 그어 네 칸으로 나눈다.', '칸마다 ax, ay, bx, by 가 차례로 켜진다.', '네 칸이 아래 식 줄로 내려와 ax + ay + bx + by 로 이어진다.'], end='(a + b)(x + y) = ax + ay + bx + by'),
          dict(title='(a + b)³ 은 왜 3이 붙을까', key='(a + b)³ = (a + b)(a + b)² 를 분배하면 a²b 와 ab² 이 세 개씩 모인다.', scenes=['카드에 (a + b)(a² + 2ab + b²) 가 뜬다.', '커서가 a 를 끌어 뒤 식에 곱한다 → a³ + 2a²b + ab².', '커서가 b 를 끌어 곱한다 → a²b + 2ab² + b³.', '같은 색 항끼리 모여 3a²b, 3ab² 이 된다.'], end='(a + b)³ = a³ + 3a²b + 3ab² + b³', at='c2')],
  notes=['곱셈 공식의 활용(a + b, ab 로 a³ + b³ 구하기 · 교과서 17쪽 예제 3)은 3차시로 넘김 — 한 차시에 넣으면 50분을 넘음.', '여유 문제 = 중단원 마무리 06 ⑵ 꼴.', '19쪽 탐구(11² = 121 …)는 수업 이야깃거리로만 · 문항 없음.'])
if __name__ == '__main__': write(L)
