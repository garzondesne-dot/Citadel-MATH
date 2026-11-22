from cm1lib import *
X = lambda cs, v='x': D(P(cs, v))
pr = lambda ps: ' 또는 '.join(f'x = {N(a)}, y = {N(b)}' for a, b in ps)
def LC(v, rng):
    a, b = pick(v, rng, (4, 3), lambda r: (ri(r, 1, 6), ri(r, -5, 5))); 
    if a == b or a == -b or b == 0: b = a - 1 if a > 1 else 3
    return a, b, a - b, a * a + b * b
def ls(v, rng):
    a, b, d, r = LC(v, random.Random(rng.random() if v else 1))
    return a, b, d, r, f"연립방정식 x − y = {N(d)}, x² + y² = {r} 에서"
def m1a(v, rng):
    a, b, d, r, s = ls(v, rng); e = [2, -2 * d, d * d - r]      # y = x − d → x² + (x−d)² = r
    return choice(rng, f'{s} y = {X([1, -d])} 을 둘째 식에 대입하여 정리하면?', X(e) + ' = 0', [X([2, 2 * d, d * d - r]) + ' = 0', X([1, -2 * d, d * d - r]) + ' = 0', X([2, -2 * d, d * d + r]) + ' = 0'], f'x² + ({X([1, -d])})² = {r} 을 전개해 정리.', chk=lambda: same(P(e), f'x**2+(x-({d}))**2-{r}'))
def m1b(v, rng):
    a, b, d, r, s = ls(v, rng); S = sorted({(a, b), (-b, -a)})
    return choice(rng, f'{s} 해를 모두 구한 것은?', pr(S), [pr(sorted({(b, a), (-a, -b)})), pr([S[0]]), pr(sorted({(a, -b), (b, -a)}))], f'일차식을 y = x − ({N(d)}) 로 고쳐 대입 → x 를 구한 뒤 y.', chk=lambda: all(x - y == d and x * x + y * y == r for x, y in S))
def SPp(v, rng):
    a, b = pick(v, rng, (2, 5), lambda r: tuple(sorted(r.sample([-6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 7], 2)))); return a, b
def m2a(v, rng):
    a, b = SPp(v, random.Random(rng.random() if v else 1)); s, p = a + b, a * b
    return choice(rng, f'연립방정식 x + y = {N(s)}, xy = {N(p)} 에서 x, y 는 어떤 이차방정식의 두 근인가? (미지수는 t)', X([1, -s, p], 't') + ' = 0', [X([1, s, p], 't') + ' = 0', X([1, -s, -p], 't') + ' = 0', X([1, -p, s], 't') + ' = 0'], '합이 s, 곱이 p 인 두 수 = t² − st + p = 0 의 두 근.', chk=True)
def m2b(v, rng):
    a, b = SPp(v, random.Random(rng.random() if v else 1)); s, p = a + b, a * b
    return choice(rng, f'연립방정식 x + y = {N(s)}, xy = {N(p)} 의 해를 모두 구한 것은?', pr([(a, b), (b, a)]), [pr([(a, b)]), pr([(-a, -b), (-b, -a)]), pr([(a, -b), (-b, a)])], f'합 {N(s)}, 곱 {N(p)} 인 두 수 {N(a)}, {N(b)} → x, y 자리를 바꾼 것도 해.', chk=True)
def TQ(v, rng): return pick(v, rng, (2, 2), lambda r: (r.choice([2, 3]), ri(r, 1, 3)))   # (x − y)(x − m y) = 0, x² + y² = (m²+1)t²
def qs(v, rng):
    m, t = TQ(v, random.Random(rng.random() if v else 1)); R = (m * m + 1) * t * t
    e = [(1, 2, 0), (-(m + 1), 1, 1), (m, 0, 2)]
    return m, t, R, f'연립방정식 {D(T(e))} = 0, x² + y² = {R} 에서'
def m3a(v, rng):
    m, t, R, s = qs(v, rng)
    return choice(rng, f'{s} 첫째 식의 좌변을 인수분해 하여 얻는 x, y 의 관계는?', f'x = y 또는 x = {m}y', [f'x = −y 또는 x = −{m}y', f'x = y 또는 x = −{m}y', f'x = {m}y'], f'(x − y)(x − {m}y) = 0.', chk=lambda: same(f'x**2-{m+1}*x*y+{m}*y**2', f'(x-y)*(x-{m}*y)', 'xy'))
def m3b(v, rng):
    m, t, R, s = qs(v, rng)
    return choice(rng, f'{s} x = {m}y 인 경우의 해를 모두 구한 것은?', pr([(-m * t, -t), (m * t, t)]), [pr([(m * t, t)]), pr([(-t, -m * t), (t, m * t)]), pr([(-m * t, t), (m * t, -t)])], f'({m}y)² + y² = {R} → {m*m+1}y² = {R} → y = ±{t}.', chk=lambda: all(x == m * y and x * x + y * y == R for x, y in [(-m * t, -t), (m * t, t)]))
# 산: 직사각형의 둘레와 대각선 (활용)
def RC(v, rng): return pick(v, rng, (8, 6, 10), lambda r: r.choice([(4, 3, 5), (12, 5, 13), (15, 8, 17), (12, 9, 15), (16, 12, 20), (24, 7, 25), (20, 15, 25), (24, 10, 26)]))
def rs_(v, rng):
    a, b, c = RC(v, random.Random(rng.random() if v else 1)); return a, b, c, f'둘레의 길이가 {2*(a+b)} 이고 대각선의 길이가 {c} 인 직사각형의 가로, 세로의 길이를 각각 x, y 라 할 때 (x > y),'
def m4a(v, rng):
    a, b, c, s = rs_(v, rng)
    return multi(rng, f'{s} 맞는 식을 모두 고르시오.', [(f'x + y = {a+b}', True), (f'x + y = {2*(a+b)}', False), (f'x² + y² = {c*c}', True), (f'x² + y² = {c}', False), (f'xy = {c}', False)], '둘레 = 2(x + y) · 대각선² = x² + y² (피타고라스).', chk=True)
def m4b(v, rng):
    a, b, c, s = rs_(v, rng)
    return number(f'{s} x + y = {a+b}, x² + y² = {c*c} 이다. xy 의 값은?', a * b, f'(x + y)² − (x² + y²) = 2xy → {(a+b)**2} − {c*c} = {2*a*b}.', chk=lambda: (a + b) ** 2 - c * c == 2 * a * b)
def m4c(v, rng):
    a, b, c, s = rs_(v, rng)
    return number(f'{s} 가로의 길이 x 는?', a, f'합 {a+b}, 곱 {a*b} 인 두 수 = {a}, {b} → 큰 쪽이 x.', chk=lambda: a > b and a * a + b * b == c * c)
def ex1(v, rng):
    x, y = pick(v, rng, (4, 1), lambda r: (ri(r, 2, 7), ri(r, -4, 4)))
    if abs(x) == abs(y): y = y + 1
    s, d = x + y, x - y
    return number(f'연립방정식 x + y = {N(s)}, x² − y² = {N(s*d)} 에서 x 의 값은?', x, f'x² − y² = (x + y)(x − y) → x − y = {N(d)} → 두 식을 더해 2x = {N(s+d)}.', chk=lambda: x * x - y * y == s * d and s != 0)
L = dict(id='cm1-22', no=22, title='연립이차방정식', unit='Ⅱ-3 여러 가지 방정식과 부등식', pages='80 ~ 81', goal='미지수가 2개인 연립이차방정식을 풀 수 있다.',
  review='중학교: 연립일차방정식의 대입법 · 14차시: 합과 곱으로 이차방정식 만들기', intro='일차식 하나와 이차식 하나 — 일차식을 한 문자에 대해 풀어 이차식에 넣으면 이차방정식 하나가 된다.',
  concepts=[dict(id='c1', title='일차식과 이차식의 연립', say='일차식을 y = (x 의 식) 으로 고쳐 이차식에 대입 → x 에 대한 이차방정식 → 구한 x 마다 y. 합 · 곱이 주어지면 t² − (합)t + (곱) = 0.', check=dict(type='ox', q='연립방정식 x + y = 5, xy = 6 의 해는 x = 2, y = 3 하나뿐이다.', ch=[], a='X', why='x = 3, y = 2 도 해.')),
            dict(id='c2', title='두 이차식의 연립', say='한 식을 인수분해 하여 일차식 둘(x = y 또는 x = 2y …)로 나눈 뒤, 각각을 다른 식에 대입한다.')],
  mons=[dict(id='m1', title='문제 1 · 대입해서 풀기', subs=[m1a, m1b]), dict(id='m2', title='문제 2 · 합과 곱이 주어질 때', subs=[m2a, m2b]), dict(id='m3', title='문제 3 · 인수분해 되는 식', subs=[m3a, m3b]),
        dict(id='m4', title='문제 4 · 직사각형의 가로와 세로', hard=True, subs=[m4a, m4b, m4c]), dict(id='m5', title='x² − y² 을 쪼개기', extra=True, subs=[ex1])],
  boss=[(m1b, 'c1', 'm1'), (m2b, 'c1', 'm2'), (m3a, 'c2', 'm3'), (m4b, 'c1', 'm4')],
  hard_from='산 = 본문 · 중단원의 활용 꼴(직사각형 둘레 · 대각선)',
  motion=[dict(title='직선과 원이 만나는 두 점', key='일차식을 이차식에 대입하면 해가 두 쌍 나온다.', scenes=['카드에 원 x² + y² = 25 와 직선 x − y = 1 이 그려진다.', '직선의 식이 y = x − 1 로 바뀌어 원의 식 안으로 들어간다.', 'x² + (x − 1)² = 25 가 2x² − 2x − 24 = 0 으로 접힌다.', '두 교점 (4, 3), (−3, −4) 에 깃발.'], end='대입 → 이차방정식 → x 마다 y')],
  notes=['해는 「x = …, y = …」 쌍으로 적은 보기에서 고르게 함(순서쌍 표기는 안 씀).', '문제 3 은 x = my 가지만 물음 — x = y 가지는 무리수 해가 나와 뺌.'])
if __name__ == '__main__': write(L)
