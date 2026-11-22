from cm1lib import *
X = lambda cs: D(P(cs))
def m1a(v, rng):
    k, m = pick(v, rng, (2, 3), lambda r: (ri(r, 2, 5), ri(r, 2, 6)))
    opts = [(f'{k}x + {k*m} = {k}(x + {m})', True), (f'{k}x + {m} = {k+m}', False), (f'(x + {m})² = x² + {2*m}x + {m*m}', True), (f'x² = {m}x', False), (f'(x + {k})(x − {k}) = x² − {k*k}', True)]
    opts = [opts[i] for i in ([0, 1, 2, 3] if v % 2 == 0 else [1, 4, 3, 0])]
    return multi(rng, 'x에 대한 항등식인 것을 모두 고르시오.', opts, '항등식 = x에 어떤 값을 넣어도 성립 · 양변을 정리하면 똑같은 식이 된다.', chk=lambda: [same(*[t.replace('²', '**2').replace('x +', 'x+').replace('−', '-').replace(' ', '') .replace(')(', ')*(').replace(f'{k}x', f'{k}*x').replace(f'{m}x', f'{m}*x').replace(f'{2*m}x', f'{2*m}*x').replace(f'{k}(', f'{k}*(') for t in o[0].split('=')]) for o in opts] == [o[1] for o in opts])
def m1b(v, rng):
    p, q = pick(v, rng, (2, -1), lambda r: (ri(r, -5, 5), ri(r, -5, 5)))
    s = f'(a {"−" if p > 0 else "+"} {abs(p)})x + (b {"−" if q > 0 else "+"} {abs(q)}) = 0'
    return number(f'등식 {s} 이 x에 대한 항등식일 때, a + b 의 값은? (a, b 는 상수)', p + q, f'x의 계수와 상수항이 모두 0 → a = {N(p)}, b = {N(q)}.', chk=lambda: True)
def CMP(v, rng):
    p, q, r, c, k = pick(v, rng, (2, -1, 1, 2, 1), lambda rr: (ri(rr, 1, 3), ri(rr, -3, 3), ri(rr, -3, 3), ri(rr, -5, 5), ri(rr, -4, 4)))
    k = q * r + c; return p, q, r, c, k
def m2a(v, rng):
    p, q, r, c, k = CMP(v, random.Random(rng.random() if v else 1)); R = pmul([p, q], [1, r])
    w = [X([R[0], R[1], -R[2]]), X([R[0], p * r - q, R[2]]), X([R[0], 0, R[2]]), X([R[0], q, R[2]])]
    return choice(rng, f'({X([p, q])})({X([1, r])}) 를 전개하면?', X(R), w, '분배법칙으로 네 항을 곱한 뒤 x 항끼리 모은다.', chk=lambda: same(P(R), f'({P([p,q])})*({P([1,r])})'))
def m2b(v, rng):
    p, q, r, c, k = CMP(v, random.Random(rng.random() if v else 1)); s = f'등식 ax² + bx {"+" if k >= 0 else "−"} {abs(k)} = ({X([p, q])})({X([1, r])}) + c 가 x에 대한 항등식이다 (a, b, c 는 상수).'
    return number(f'{s} b 의 값은?', p * r + q, f'우변의 x 계수 = {N(p*r)} + ({N(q)}) → 양변의 x 계수를 비교.', chk=lambda: pmul([p, q], [1, r])[1] == p * r + q)
def m2c(v, rng):
    p, q, r, c, k = CMP(v, random.Random(rng.random() if v else 1)); s = f'등식 ax² + bx {"+" if k >= 0 else "−"} {abs(k)} = ({X([p, q])})({X([1, r])}) + c 가 x에 대한 항등식이다 (a, b, c 는 상수).'
    return number(f'{s} c 의 값은?', c, f'상수항 비교: {N(k)} = ({N(q*r)}) + c.', chk=lambda: k == q * r + c)
def SUBS(v, rng):
    a, b, c, h = pick(v, rng, (1, 7, 6, 1), lambda r: (ri(r, 1, 3), ri(r, -6, 7), ri(r, -6, 8), ri(r, 1, 3)))
    R = padd(padd(pmul([a], pmul([1, -h], [1, -h])), pmul([b], [1, -h])), [c]); return a, b, c, h, R
def m3s(v, rng):
    a, b, c, h, R = SUBS(v, random.Random(rng.random() if v else 1))
    return a, b, c, h, R, f'등식 a(x − {h})² + b(x − {h}) + c = {X(R)} 이 x에 대한 항등식이다 (a, b, c 는 상수).'
def m3a(v, rng):
    a, b, c, h, R, s = m3s(v, rng)
    return number(f'{s} 양변에 x = {h} 을 대입하여 c 의 값을 구하면?', c, f'x = {h} 이면 좌변은 c 만 남고, 우변은 {N(peval(R, h))}.', chk=lambda: peval(R, h) == c)
def m3b(v, rng):
    a, b, c, h, R, s = m3s(v, rng)
    return number(f'{s} 양변의 x² 의 계수를 비교하여 a 의 값을 구하면?', a, f'좌변에서 x² 은 a(x − {h})² 에서만 나온다 → a = {R[0]}.', chk=lambda: R[0] == a)
def m3c(v, rng):
    a, b, c, h, R, s = m3s(v, rng)
    return number(f'{s} b 의 값은?', b, f'x 의 계수 비교: {N(-2*a*h)} + b = {N(R[1])}.', chk=lambda: -2 * a * h + b == R[1])
# 산: 수 대입 (교과서 25쪽 문제 2 ⑵ 꼴)
def HARD(v, rng):
    m, t = pick(v, rng, (3, 1), lambda r: (r.choice([2, 3, 0, -1]), ri(r, 1, 2))); n = pick(v, rng, 1, lambda r: ri(r, 1, 5))
    p = t * abs(1 - m) * (1 if (1 - m) > 0 else 1); a = Fr(p, 1 - m); c = (2 - m) * a + n   # 주의: x(x−1) 의 계수 p
    assert a.denominator == 1
    return m, int(a), n, int(c), p
def hs(v, rng):
    m, a, n, c, p = HARD(v, random.Random(rng.random() if v else 1))
    lhs = f"{D(P([p, 0]))}(x − 1) + ax(x + 1) + b(x + 1)(x − 1)"; rhs = f"cx² {'+' if m >= 0 else '−'} {abs(m) if abs(m) != 1 else ''}ax − {n}" if m else f'cx² − {n}'
    return m, a, n, c, p, f'등식 {lhs} = {rhs} 이 x에 대한 항등식이다 (a, b, c 는 상수).'
def m4a(v, rng):
    m, a, n, c, p, s = hs(v, rng)
    return number(f'{s} 양변에 x = 0 을 대입하여 b 의 값을 구하면?', n, f'x = 0: 좌변 = b × 1 × (−1) = −b, 우변 = −{n}.', chk=True)
def m4b(v, rng):
    m, a, n, c, p, s = hs(v, rng)
    right = f'2a = c {"+" if m >= 0 else "−"} {abs(m) if abs(m) != 1 else ""}a − {n}' if m else f'2a = c − {n}'
    w = [right.replace('2a =', 'a ='), right.replace('2a =', '2a + b ='), right.replace(f'− {n}', f'+ {n}')]
    return choice(rng, f'{s} 양변에 x = 1 을 대입한 식은?', right, w, 'x = 1: x − 1 = 0 인 항이 사라지고 a × 1 × 2 = 2a 만 남는다.', chk=lambda: 2 * a == c + m * a - n)
def m4c(v, rng):
    m, a, n, c, p, s = hs(v, rng)
    return number(f'{s} 양변에 x = −1 을 대입하면 좌변의 값은?', 2 * p, f'x = −1: x + 1 = 0 인 항이 사라지고 {D(P([p,0]))}(x − 1) 에서 ({N(-p)}) × (−2) = {2*p}.', chk=lambda: p * (-1) * (-2) == 2 * p)
def m4d(v, rng):
    m, a, n, c, p, s = hs(v, rng)
    return number(f'{s} a 의 값은?', a, f'x = 1 과 x = −1 을 대입한 두 식을 연립한다 → a = {N(a)}, c = {N(c)}.', chk=lambda: 2 * a == c + m * a - n and 2 * p == c - m * a - n)
def ex1(v, rng):
    return choice(rng, pick(v, rng, '연속하는 세 자연수 x − 1, x, x + 1 의 곱에 가운데 수 x 를 더한 식 (x − 1)x(x + 1) + x 를 정리하면?', lambda r: '연속하는 세 자연수 x − 1, x, x + 1 에 대하여 (x − 1)x(x + 1) + x 를 간단히 하면?' if r.random() < .5 else '(x − 1)x(x + 1) + x 를 전개하여 정리하면? (예: 3 × 4 × 5 + 4 = 4³)'), 'x³', ['x³ − x', 'x³ + x', 'x³ + 2x', '3x'], '(x − 1)(x + 1) = x² − 1 → x(x² − 1) + x = x³ − x + x.', chk=lambda: same('(x-1)*x*(x+1)+x', 'x**3'))
L = dict(id='cm1-05', no=5, title='항등식과 미정계수법', unit='Ⅰ-2 나머지정리와 인수분해', pages='24 ~ 25', goal='항등식의 성질을 이해하고, 이를 활용하여 문제를 해결할 수 있다.',
  review='4차시: A = BQ + R · 방정식과 항등식 구별(중학교): 2x + 3 = 5 는 방정식', intro='봉지를 2장씩 x명에게, 3명이 더 오면? 2x + 6 = 2(x + 3) — x 가 무엇이든 늘 맞는 등식.',
  concepts=[dict(id='c1', title='항등식의 성질', say='ax² + bx + c = 0 이 항등식 ⟺ a = b = c = 0 · ax² + bx + c = a′x² + b′x + c′ 이 항등식 ⟺ 계수가 각각 같다.', check=dict(type='ox', q='등식 2x + 3 = 5 는 x에 대한 항등식이다.', ch=[], a='X', why='x = 1 일 때만 성립 → 방정식.')),
            dict(id='c2', title='미정계수법 (계수 비교 · 수 대입)', say='모르는 계수를 정하는 두 방법: ① 양변을 정리해 같은 차수의 계수를 비교 ② 식이 간단해지는 수를 x에 대입.')],
  mons=[dict(id='m1', title='문제 1 · 항등식 찾기', subs=[m1a, m1b]), dict(id='m2', title='문제 2 · 계수 비교하기', subs=[m2b, m2c]), dict(id='m3', title='문제 3 · 수 대입하기', subs=[m3a, m3c]),
        dict(id='m4', title='문제 4 · 세 수를 차례로 대입', hard=True, subs=[m4a, m4b, m4c, m4d]), dict(id='m5', title='연속하는 세 수의 곱', extra=True, subs=[ex1])],
  boss=[(m1b, 'c1', 'm1'), (m2b, 'c2', 'm2'), (m3a, 'c2', 'm3'), (m4a, 'c2', 'm4')],
  hard_from='산 = 본문 25쪽 문제 2 ⑵ 꼴(이미 어려운 문제가 있어 중단원에서 안 가져옴)',
  motion=[dict(title='항등식 = 어떤 수를 넣어도 참', key='항등식은 x 자리에 무엇을 넣어도 양변이 같다.', scenes=['카드에 2x + 6 = 2(x + 3) 과 x 값을 넣는 다이얼이 뜬다.', '커서가 다이얼을 1, 5, −2 로 돌릴 때마다 양변 숫자가 같이 바뀌며 ✓.', '옆 카드 2x + 3 = 5 는 다이얼이 1 일 때만 ✓, 나머지는 ✗.', '위 카드에 「항등식」, 아래 카드에 「방정식」 딱지.'], end='항등식: 모든 x 에서 성립')],
  notes=['증명 문제(예제 1 · 문제 1)는 ○× · 개념 설명으로만 다루고 문항에서 뺌.', '여유 문제 = 25쪽 생각 넓히기.'])
if __name__ == '__main__': write(L)
