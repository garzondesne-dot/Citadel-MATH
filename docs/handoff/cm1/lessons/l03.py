from cm1lib import *
def AB(v, rng, k=0): return pick(v, rng, [(3, -1), (4, 1), (5, -2), (2, 3)][k], lambda r: (ri(r, 2, 6), ri(r, -4, 4)))
def m1a(v, rng):
    vs = pick(v, rng, 'ab', lambda r: r.choice(['ab', 'xy', 'pq'])); a, b = vs
    return choice(rng, f'{a} + {b} 와 {a}{b} 의 값을 알 때, {a}² + {b}² 을 구하는 식은?', f'({a} + {b})² − 2{a}{b}', [f'({a} + {b})² + 2{a}{b}', f'({a} + {b})² − {a}{b}', f'({a} + {b})²'], f'({a} + {b})² = {a}² + 2{a}{b} + {b}² 에서 2{a}{b} 를 넘긴다.', chk=lambda: same('(a+b)**2-2*a*b', 'a**2+b**2', 'ab'))
def m1b(v, rng):
    a, b = AB(v, rng); s, p = a + b, a * b
    return number(f'a + b = {N(s)}, ab = {N(p)} 일 때, a² + b² 의 값은?', a * a + b * b, f'({N(s)})² − 2 × ({N(p)}) = {s*s} − ({N(2*p)}).', chk=lambda: s * s - 2 * p == a * a + b * b)
def m2a(v, rng):
    vs = pick(v, rng, 'ab', lambda r: r.choice(['ab', 'xy', 'pq'])); a, b = vs
    return choice(rng, f'{a} + {b} 와 {a}{b} 의 값을 알 때, {a}³ + {b}³ 을 구하는 식은?', f'({a} + {b})³ − 3{a}{b}({a} + {b})', [f'({a} + {b})³ + 3{a}{b}({a} + {b})', f'({a} + {b})³ − 3{a}{b}', f'({a} + {b})³'], f'({a} + {b})³ 을 전개하면 3{a}²{b} + 3{a}{b}² = 3{a}{b}({a} + {b}) 가 더 붙는다.', chk=lambda: same('(a+b)**3-3*a*b*(a+b)', 'a**3+b**3', 'ab'))
def m2b(v, rng):
    a, b = AB(v, rng, 1); s, p = a + b, a * b
    return number(f'a + b = {N(s)}, ab = {N(p)} 일 때, a³ + b³ 의 값은?', a ** 3 + b ** 3, f'({N(s)})³ − 3 × ({N(p)}) × ({N(s)}) = {s**3} − ({N(3*p*s)}).', chk=lambda: s ** 3 - 3 * p * s == a ** 3 + b ** 3)
def m3a(v, rng):
    vs = pick(v, rng, 'xy', lambda r: r.choice(['ab', 'xy', 'pq'])); a, b = vs
    return choice(rng, f'{a} − {b} 와 {a}{b} 의 값을 알 때, {a}³ − {b}³ 을 구하는 식은?', f'({a} − {b})³ + 3{a}{b}({a} − {b})', [f'({a} − {b})³ − 3{a}{b}({a} − {b})', f'({a} − {b})³ + 3{a}{b}', f'({a} − {b})³'], f'({a} − {b})³ = {a}³ − 3{a}²{b} + 3{a}{b}² − {b}³ → −3{a}{b}({a} − {b}) 를 넘기면 + 가 된다.', chk=lambda: same('(a-b)**3+3*a*b*(a-b)', 'a**3-b**3', 'ab'))
def m3b(v, rng):
    a, b = AB(v, rng, 2); d, p = a - b, a * b
    return number(f'x − y = {N(d)}, xy = {N(p)} 일 때, x³ − y³ 의 값은?', a ** 3 - b ** 3, f'({N(d)})³ + 3 × ({N(p)}) × ({N(d)}) = {d**3} + ({N(3*p*d)}).', chk=lambda: d ** 3 + 3 * p * d == a ** 3 - b ** 3)
def ABC(v, rng): return pick(v, rng, (2, 3, 4), lambda r: tuple(sorted(r.sample(range(1, 8), 3))))
def m4a(v, rng):
    vs = pick(v, rng, 'abc', lambda r: r.choice(['abc', 'xyz'])); a, b, c = vs
    return choice(rng, f'{a} + {b} + {c} 와 {a}{b} + {b}{c} + {c}{a} 의 값을 알 때, {a}² + {b}² + {c}² 을 구하는 식은?', f'({a} + {b} + {c})² − 2({a}{b} + {b}{c} + {c}{a})', [f'({a} + {b} + {c})² + 2({a}{b} + {b}{c} + {c}{a})', f'({a} + {b} + {c})² − ({a}{b} + {b}{c} + {c}{a})', f'({a} + {b} + {c})²'], '세 항의 제곱 공식에서 2(ab + bc + ca) 를 넘긴다.', chk=lambda: same('(a+b+c)**2-2*(a*b+b*c+c*a)', 'a**2+b**2+c**2', 'abc'))
def m4b(v, rng):
    a, b, c = ABC(v, rng); s, q = a + b + c, a * b + b * c + c * a
    return number(f'a + b + c = {s}, ab + bc + ca = {q} 일 때, a² + b² + c² 의 값은?', a * a + b * b + c * c, f'{s}² − 2 × {q} = {s*s} − {2*q}.', chk=lambda: s * s - 2 * q == a * a + b * b + c * c)
# 산: 직육면체 (중단원 마무리 10 꼴)
def BOX(v, rng):
    a, b, c = pick(v, rng, (3, 4, 5), lambda r: tuple(sorted(r.sample(range(1, 8), 3))))
    return a, b, c, 2 * (a * b + b * c + c * a), a * a + b * b + c * c
def S5(v, rng):
    a, b, c, S, d2 = BOX(v, random.Random(rng.random() if v else 1))
    return a, b, c, S, d2, f'가로 a, 세로 b, 높이 c 인 직육면체의 겉넓이가 {S} 이고 대각선의 길이의 제곱이 {d2} 이다.'
def m5a(v, rng):
    a, b, c, S, d2, s = S5(v, rng)
    return number(f'{s} 겉넓이 = 2(ab + bc + ca) 임을 이용하면 ab + bc + ca 의 값은?', S // 2, f'2(ab + bc + ca) = {S} → 양변을 2로 나눈다.', chk=lambda: a * b + b * c + c * a == S // 2)
def m5b(v, rng):
    a, b, c, S, d2, s = S5(v, rng)
    return choice(rng, f'{s} 대각선의 길이의 제곱을 a, b, c 로 나타내면?', 'a² + b² + c²', ['a + b + c', '(a + b + c)²', 'ab + bc + ca'], '직육면체의 대각선: 밑면 대각선² = a² + b², 여기에 c² 을 더한다(피타고라스 두 번).', chk=True)
def m5c(v, rng):
    a, b, c, S, d2, s = S5(v, rng)
    return number(f'a² + b² + c² = {d2}, ab + bc + ca = {S//2} 일 때, (a + b + c)² 의 값은?', d2 + S, f'(a + b + c)² = a² + b² + c² + 2(ab + bc + ca) = {d2} + {S}.', chk=lambda: (a + b + c) ** 2 == d2 + S)
def m5d(v, rng):
    a, b, c, S, d2, s = S5(v, rng)
    return number(f'{s} a + b + c 의 값은? (a, b, c 는 양수)', a + b + c, f'(a + b + c)² = {d2} + {S} = {d2+S} → 양수이므로 {a+b+c}.', chk=lambda: (a + b + c) ** 2 == d2 + S)
def ex1(v, rng):
    k = pick(v, rng, 2, lambda r: r.choice([2, 3, 5]))   # x = √k + 1, y = √k − 1
    co = 2 * k + 6      # x³ + y³ = (2√k)³ − 3(k−1)(2√k) = (8k − 6k + 6)√k
    return choice(rng, f'x = √{k} + 1, y = √{k} − 1 일 때, x³ + y³ 의 값은?', f'{co}√{k}', [f'{8*k}√{k}', f'{co + 12*(k-1)}√{k}', f'{co}', f'{2*k - 6 if 2*k-6>0 else 2*k+2}√{k}'], f'x + y = 2√{k}, xy = {k-1} → (2√{k})³ − 3 × {k-1} × 2√{k} = {8*k}√{k} − {6*(k-1)}√{k}.', chk=lambda: abs((k ** .5 + 1) ** 3 + (k ** .5 - 1) ** 3 - co * k ** .5) < 1e-9)
L = dict(id='cm1-03', no=3, title='곱셈 공식의 활용', unit='Ⅰ-1 다항식의 연산', pages='17 (예제 3 · 문제 4) · 21 (중단원 07 · 10)', goal='곱셈 공식을 변형하여 여러 가지 식의 값을 구할 수 있다.',
  review='2차시 곱셈 공식 세 줄 빈칸: (a + b + c)² · (a + b)³ · (a + b)(a² − ab + b²)', intro='두 수를 몰라도 합과 곱만 알면 제곱의 합 · 세제곱의 합을 알 수 있다 → 공식을 「거꾸로」 쓴다.',
  concepts=[dict(id='c1', title='합과 곱으로 a² + b², a³ ± b³ 구하기', say='a² + b² = (a + b)² − 2ab · a³ + b³ = (a + b)³ − 3ab(a + b) · a³ − b³ = (a − b)³ + 3ab(a − b).', check=dict(type='ox', q='a + b = 3, ab = 1 이면 a² + b² = 9 이다.', ch=[], a='X', why='9 에서 2ab = 2 를 빼야 한다 → 7.')),
            dict(id='c2', title='세 문자: a² + b² + c² 과 (a + b + c)²', say='a² + b² + c² = (a + b + c)² − 2(ab + bc + ca). 직육면체의 겉넓이 · 대각선 문제에 쓰인다.')],
  mons=[dict(id='m1', title='문제 1 · a² + b²', subs=[m1a, m1b]), dict(id='m2', title='문제 2 · a³ + b³', subs=[m2a, m2b]), dict(id='m3', title='문제 3 · a² + b² + c²', subs=[m4a, m4b]),
        dict(id='m4', title='문제 4 · 직육면체의 a + b + c', hard=True, subs=[m5a, m5b, m5c, m5d]),
        dict(id='m5', title='x³ − y³', extra=True, subs=[m3a, m3b]), dict(id='m6', title='무리수 대입', extra=True, subs=[ex1])],
  boss=[(m1b, 'c1', 'm1'), (m2b, 'c1', 'm2'), (m4b, 'c2', 'm3'), (m5c, 'c2', 'm4')],
  hard_from='산 = 중단원 마무리 10번 꼴(직육면체) · 대각선은 「길이의 제곱」으로 주어 √ 계산을 덜어 냄',
  motion=[dict(title='공식을 거꾸로 — 합과 곱으로 제곱의 합', key='(a + b)² 에서 2ab 를 덜어 내면 a² + b² 이 남는다.', scenes=['카드에 한 변이 a + b 인 정사각형이 그려진다.', '안쪽이 a², b², ab, ab 네 칸으로 나뉜다.', '커서가 ab 두 칸을 끌어 밖으로 뺀다.', '남은 두 칸에 a² + b² = (a + b)² − 2ab 가 뜬다.'], end='a² + b² = (a + b)² − 2ab')],
  notes=['x³ − y³(교과서 문제 4)은 시간이 넘쳐 여유 문제로 돌림(예상 50분 → 46분).', '2차시에서 넘어온 「곱셈 공식의 활용」을 한 차시로 독립시킴(45분 기준 · 전개와 활용을 한 차시에 넣으면 넘침).', '중단원 10번 원문은 대각선 5√2 → 학생이 제곱하다 막히지 않게 「대각선의 길이의 제곱 = 50」 꼴로 바꿈(선생님 확인 거리).', '여유 문제 = 중단원 마무리 07번 꼴.'])
if __name__ == '__main__': write(L)
