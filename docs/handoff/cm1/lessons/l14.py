from cm1lib import *
X = lambda cs, v='x': D(P(cs, v))
def ABC(v, rng, k=0): return pick(v, rng, [[2, 7, -1], [3, -4, 1]][k], lambda r: [r.choice([1, 2, 3, -2]), ri(r, -9, 9, (0,)), ri(r, -8, 8, (0,))])
def m1a(v, rng):
    a, b, c = ABC(v, random.Random(rng.random() if v else 1)); s = Fr(-b, a)
    return choice(rng, f'이차방정식 {X([a, b, c])} = 0 의 두 근의 합은?', N(s), [N(-s), N(Fr(c, a)), N(Fr(-b, 1)) if a != 1 else N(Fr(b, 2)), N(Fr(-a, b))], f'두 근의 합 = −b/a = −({N(b)})/{N(a)}.', chk=True)
def m1b(v, rng):
    a, b, c = ABC(v, random.Random(rng.random() if v else 1)); p = Fr(c, a)
    return choice(rng, f'이차방정식 {X([a, b, c])} = 0 의 두 근의 곱은?', N(p), [N(-p), N(Fr(-b, a)), N(Fr(c, 1)) if a != 1 else N(Fr(c, 2)), N(Fr(a, c))], f'두 근의 곱 = c/a = ({N(c)})/{N(a)}.', chk=True)
def SP(v, rng, k=0): return pick(v, rng, [(4, 5), (-3, 4), (2, -4)][k], lambda r: (ri(r, -6, 6, (0,)), ri(r, -8, 8, (0,))))
eq = lambda s, p: X([1, -s, p]) + ' = 0'
def m2a(v, rng):
    s, p = SP(v, random.Random(rng.random() if v else 1))
    return number(f'이차방정식 {eq(s, p)} 의 두 근을 α, β 라 할 때, α² + β² 의 값은?', s * s - 2 * p, f'α + β = {N(s)}, αβ = {N(p)} → (α + β)² − 2αβ = {s*s} − ({N(2*p)}).', chk=True)
def m2b(v, rng):
    s, p = SP(v, random.Random(rng.random() if v else 1)); val = Fr(s, p)
    return choice(rng, f'이차방정식 {eq(s, p)} 의 두 근을 α, β 라 할 때, 1/α + 1/β 의 값은?', N(val), [N(-val), N(Fr(p, s)), N(Fr(1, s)), N(Fr(s * s, p))], f'통분: (α + β)/(αβ) = ({N(s)})/({N(p)}).', chk=True)
def m3a(v, rng):
    s, p = SP(v, random.Random(rng.random() if v else 1), 1)
    return number(f'이차방정식 {eq(s, p)} 의 두 근을 α, β 라 할 때, (α + 1)(β + 1) 의 값은?', p + s + 1, f'전개: αβ + (α + β) + 1 = ({N(p)}) + ({N(s)}) + 1.', chk=True)
def m3b(v, rng):
    s, p = SP(v, random.Random(rng.random() if v else 1), 1); val = Fr(s * s - 2 * p, p)
    return choice(rng, f'이차방정식 {eq(s, p)} 의 두 근을 α, β 라 할 때, β/α + α/β 의 값은?', N(val), [N(-val), N(Fr(s * s, p)), N(Fr(p, s * s - 2 * p)) if s * s != 2 * p else N(val + 1), N(val + 2)], f'통분: (α² + β²)/(αβ) = ({N(s*s - 2*p)})/({N(p)}).', chk=True)
# 산: 한 근이 다른 근의 m배 (중단원 수준)
def RT(v, rng): return pick(v, rng, (2, 2), lambda r: (r.choice([2, 3]), ri(r, -4, 4, (0,))))
def hs(v, rng):
    m, a = RT(v, random.Random(rng.random() if v else 1)); s = (m + 1) * a
    return m, a, s, f"이차방정식 x² {'−' if s>0 else '+'} {abs(s)}x + k = 0 의 한 근이 다른 근의 {m}배이다 (k 는 실수)."
def m4a(v, rng):
    m, a, s, st = hs(v, rng)
    return choice(rng, f'{st} 두 근을 어떻게 놓으면 좋은가?', f'α, {m}α', [f'α, α + {m}', f'α, −{m}α', 'α, 1/α'], f'「{m}배」이므로 작은 쪽을 α 라 하면 다른 근은 {m}α.', chk=True)
def m4b(v, rng):
    m, a, s, st = hs(v, rng)
    return number(f'{st} 두 근을 α, {m}α 로 놓고 두 근의 합을 이용하여 α 의 값을 구하면?', a, f'α + {m}α = {m+1}α = {N(s)} (두 근의 합 = x 의 계수의 부호를 바꾼 값).', chk=True)
def m4c(v, rng):
    m, a, s, st = hs(v, rng)
    return number(f'{st} k 의 값은?', m * a * a, f'두 근 {N(a)}, {N(m*a)} 의 곱 = k.', chk=lambda: a + m * a == s)
def ex1(v, rng):
    s, p = SP(v, random.Random(rng.random() if v else 1), 2)
    return number(f'이차방정식 {eq(s, p)} 의 두 근을 α, β 라 할 때, α³ + β³ 의 값은?', s ** 3 - 3 * p * s, f'(α + β)³ − 3αβ(α + β) = ({N(s)})³ − 3 × ({N(p)}) × ({N(s)}).', chk=True)
L = dict(id='cm1-14', no=14, title='이차방정식의 근과 계수의 관계', unit='Ⅱ-1 복소수와 이차방정식', pages='55 ~ 56', goal='이차방정식의 근과 계수의 관계를 설명하고, 두 근의 합과 곱으로 식의 값을 구할 수 있다.',
  review='3차시: a² + b² = (a + b)² − 2ab · 13차시: 근의 공식', intro='근을 구하지 않아도 계수만 보면 두 근의 합과 곱을 안다 — 2x² − 7x + 3 = 0 의 두 근을 더하고 곱해 보자.',
  concepts=[dict(id='c1', title='근과 계수의 관계', say='ax² + bx + c = 0 의 두 근 α, β: α + β = −b/a, αβ = c/a.', check=dict(type='ox', q='이차방정식 x² − 5x + 3 = 0 의 두 근의 합은 −5 이다.', ch=[], a='X', why='−b/a = −(−5)/1 = 5.')),
            dict(id='c2', title='합과 곱으로 식의 값', say='α² + β², 1/α + 1/β, (α + 1)(β + 1) 처럼 두 근을 바꿔도 같은 식은 α + β 와 αβ 로 고쳐 계산한다(3차시 공식).')],
  mons=[dict(id='m1', title='문제 1 · 두 근의 합과 곱', subs=[m1a, m1b]), dict(id='m2', title='문제 2 · α² + β², 1/α + 1/β', subs=[m2a, m2b]), dict(id='m3', title='문제 3 · (α + 1)(β + 1), β/α + α/β', subs=[m3a, m3b]),
        dict(id='m4', title='문제 4 · 한 근이 다른 근의 몇 배', hard=True, subs=[m4a, m4b, m4c]), dict(id='m5', title='α³ + β³', extra=True, subs=[ex1])],
  boss=[(m1a, 'c1', 'm1'), (m1b, 'c1', 'm1'), (m2a, 'c2', 'm2'), (m3a, 'c2', 'm3')],
  hard_from='산 = 중단원 수준(두 근의 비 · 본문에 어려운 문제가 없어 넣음)',
  motion=[dict(title='근을 안 구해도 합과 곱은 보인다', key='ax² + bx + c = 0 → 합 −b/a, 곱 c/a.', scenes=['카드에 2x² − 7x + 3 = 0 과 두 근 3, 1/2 가 뜬다.', '두 근을 더한 7/2, 곱한 3/2 가 옆에 적힌다.', '커서가 계수 2, −7, 3 을 가리키면 −b/a, c/a 자리에 날아가 7/2, 3/2 가 된다.', '두 줄이 서로 겹치며 ✓.'], end='α + β = −b/a · αβ = c/a')],
  notes=['문제 2 · 3 은 x² 의 계수가 1 인 방정식으로 통일(분수 계산을 줄여 45분 안에).'])
if __name__ == '__main__': write(L)
