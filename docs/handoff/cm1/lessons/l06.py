from cm1lib import *
X = lambda cs: D(P(cs))
F = lambda v, rng, k=0: pick(v, rng, [[2, 4, -3, 1], [1, -2, 3, -1]][k], lambda r: [ri(r, 1, 3), ri(r, -4, 4), ri(r, -4, 4), ri(r, -5, 5)])
def rem(a):
    def f(v, rng):
        cs = F(v, random.Random(rng.random() if v else 1)); k = a if v == 0 else ri(rng, -3, 3)
        return number(f'다항식 f(x) = {X(cs)} 을 {X([1, -k])} 로 나누었을 때의 나머지는?', peval(cs, k), f'나머지정리: 나머지 = f({N(k)}) → x 에 {N(k)} 를 대입해 계산.', chk=lambda: pdiv(cs, [1, -k])[1] == [peval(cs, k)])
    return f
def LIN(v, rng):
    a, b = pick(v, rng, (2, 1), lambda r: (r.choice([2, 3]), r.choice([-2, -1, 1, 2]))); 
    if a == 2 and abs(b) == 2: b //= 2
    Q = pick(v, rng, [6, -3, 1], lambda r: [ri(r, 1, 4) * a, ri(r, -3, 3), ri(r, -3, 3)]); R = pick(v, rng, 1, lambda r: ri(r, -5, 5))
    return a, b, padd(pmul([a, b], Q), [R]), R
def m2a(v, rng):
    a, b, cs, R = LIN(v, random.Random(rng.random() if v else 1)); z = Fr(-b, a)
    return choice(rng, f'다항식 f(x) 를 일차식 {X([a, b])} 로 나누었을 때의 나머지는 f(□) 이다. □ 에 알맞은 수는?', N(z), [N(-z), N(Fr(-a, b)), N(-b), N(b)], f'{X([a, b])} = 0 이 되는 x 의 값을 대입한다 → x = {N(z)}.', chk=lambda: a * z + b == 0)
def m2b(v, rng):
    a, b, cs, R = LIN(v, random.Random(rng.random() if v else 1)); z = Fr(-b, a)
    return number(f'다항식 f(x) = {X(cs)} 을 {X([a, b])} 로 나누었을 때의 나머지는?', R, f'f({N(z)}) 를 계산한다.', chk=lambda: peval(cs, z) == R)
def UNK(v, rng):
    k, a, r = pick(v, rng, (2, -3, 5), lambda rr: (ri(rr, -3, 3), ri(rr, -4, 4), ri(rr, -6, 6)))
    k = k or 2; c1, c0 = pick(v, rng, (1, 0), lambda rr: (ri(rr, -3, 3), 0))
    c0 = r - (k ** 3 + a * k * k + c1 * k); return k, a, r, c1, c0
def us(v, rng):
    k, a, r, c1, c0 = UNK(v, random.Random(rng.random() if v else 1))
    fx = 'x³ + ax²' + (f' {"+" if c1 > 0 else "−"} {D(P([abs(c1), 0]))}' if c1 else '') + (f' {"+" if c0 > 0 else "−"} {abs(c0)}' if c0 else '')
    return k, a, r, c1, c0, f'다항식 f(x) = {fx} 을 {X([1, -k])} 로 나누었을 때의 나머지가 {N(r)} 이다 (a 는 상수).'
def m3a(v, rng):
    k, a, r, c1, c0, s = us(v, rng)
    return choice(rng, f'{s} 이 조건을 식으로 쓰면?', f'f({N(k)}) = {N(r)}', [f'f({N(-k)}) = {N(r)}', f'f({N(r)}) = {N(k)}', f'f({N(k)}) = 0'], f'{X([1, -k])} 로 나눈 나머지 = f({N(k)}).', chk=True)
def m3b(v, rng):
    k, a, r, c1, c0, s = us(v, rng)
    return number(f'{s} a 의 값은?', a, f'f({N(k)}) = {N(k**3)} + {D(P([k*k, 0], "a"))} + ({N(c1*k + c0)}) = {N(r)} 을 푼다.', chk=lambda: k ** 3 + a * k * k + c1 * k + c0 == r)
# 산: 이차식으로 나눈 나머지 (교과서 27쪽 예제 1 꼴)
def TWO(v, rng):
    p, q = pick(v, rng, (1, -3), lambda r: tuple(r.sample([-3, -2, -1, 1, 2, 3], 2))); a, b = pick(v, rng, (-2, 1), lambda r: (ri(r, -3, 3), ri(r, -4, 4)))
    return p, q, a, b, a * p + b, a * q + b
def ts(v, rng):
    p, q, a, b, r1, r2 = TWO(v, random.Random(rng.random() if v else 1))
    return p, q, a, b, r1, r2, f'다항식 f(x) 를 {X([1, -p])} 로 나눈 나머지는 {N(r1)}, {X([1, -q])} 로 나눈 나머지는 {N(r2)} 이다.'
def m4a(v, rng):
    p, q, a, b, r1, r2, s = ts(v, rng); B = f'({X([1, -p])})({X([1, -q])})'
    return choice(rng, f'{s} f(x) 를 {B} 로 나눈 나머지를 구할 때, 나머지를 어떻게 놓아야 하는가?', 'ax + b (일차 이하의 식)', ['a (상수)', 'ax² + bx + c (이차식)', '0'], '이차식으로 나눈 나머지는 일차 이하의 다항식이다.', chk=True)
def m4b(v, rng):
    p, q, a, b, r1, r2, s = ts(v, rng); B = f'({X([1, -p])})({X([1, -q])})'
    e = lambda t, r: f'{D(P([t, 0], "a"))} + b = {N(r)}'
    return multi(rng, f'{s} f(x) = {B}Q(x) + ax + b 로 놓을 때, 맞는 식을 모두 고르시오.', [(e(p, r1), True), (e(-p, r1), False), (e(q, r2), True), (e(q, r1), False), (e(p, r2), False)], f'x = {N(p)}, x = {N(q)} 를 대입하면 Q(x) 항이 사라진다.', chk=lambda: a * p + b == r1 and a * q + b == r2)
def m4c(v, rng):
    p, q, a, b, r1, r2, s = ts(v, rng); B = f'({X([1, -p])})({X([1, -q])})'
    w = [X([b, a]), X([-a, b]), X([a, -b]), X([a + 1, b])]
    return choice(rng, f'{s} f(x) 를 {B} 로 나누었을 때의 나머지는?', X([a, b]), w, f'{D(P([p,0],"a"))} + b = {N(r1)}, {D(P([q,0],"a"))} + b = {N(r2)} 을 연립 → a = {N(a)}, b = {N(b)}.', chk=lambda: a * p + b == r1 and a * q + b == r2)
def ex1(v, rng):
    p, q, r1, r2 = pick(v, rng, (1, 2, 3, 2), lambda r: (ri(r, -2, 2), ri(r, 3, 5), ri(r, -4, 5), ri(r, -4, 4)))
    return number(f'다항식 f(x) 를 {X([1, -p])} 로 나눈 몫이 Q(x), 나머지가 {N(r1)} 이고, Q(x) 를 {X([1, -q])} 로 나눈 나머지가 {N(r2)} 이다. f({q}) 의 값은?', (q - p) * r2 + r1, f'f(x) = ({X([1, -p])})Q(x) + ({N(r1)}), Q({q}) = {N(r2)} → ({q - p}) × ({N(r2)}) + ({N(r1)}).', chk=True)
L = dict(id='cm1-06', no=6, title='나머지정리', unit='Ⅰ-2 나머지정리와 인수분해', pages='26 ~ 27', goal='나머지정리를 이해하고, 이를 활용하여 문제를 해결할 수 있다.',
  review='4차시: A = BQ + R · 5차시: 항등식에 수 대입하기', intro='제품을 부수지 않고 검사하듯, 직접 나누지 않고도 나머지를 안다: f(x) = (x − α)Q(x) + R 에 x = α 를 넣으면?',
  concepts=[dict(id='c1', title='나머지정리', say='다항식 f(x) 를 일차식 x − α 로 나누었을 때의 나머지 R = f(α). 일차식 ax + b 로 나누면 R = f(−b/a).', check=dict(type='ox', q='다항식 f(x) 를 x + 1 로 나누었을 때의 나머지는 f(1) 이다.', ch=[], a='X', why='x + 1 = 0 이 되는 x = −1 을 넣는다 → f(−1).')),
            dict(id='c2', title='이차식으로 나눈 나머지', say='이차식으로 나눈 나머지는 일차 이하 → ax + b 로 놓고, 나누는 식이 0 이 되는 두 수를 대입해 연립한다.')],
  mons=[dict(id='m1', title='문제 1 · f(α) 로 나머지 구하기', subs=[rem(1), rem(-2)]), dict(id='m2', title='문제 2 · ax + b 로 나눈 나머지', subs=[m2a, m2b]), dict(id='m3', title='문제 3 · 나머지로 계수 찾기', subs=[m3a, m3b]),
        dict(id='m4', title='문제 4 · 이차식으로 나눈 나머지', hard=True, subs=[m4a, m4b, m4c]), dict(id='m5', title='몫을 다시 나누기', extra=True, subs=[ex1])],
  boss=[(rem(-1), 'c1', 'm1'), (m2b, 'c1', 'm2'), (m3b, 'c1', 'm3'), (m4c, 'c2', 'm4')],
  hard_from='산 = 본문 27쪽 예제 1 · 문제 3 꼴(이미 어려운 문제가 있어 중단원에서 안 가져옴)',
  motion=[dict(title='나누지 않고 나머지 알기', key='f(x) = (x − α)Q(x) + R 에 x = α 를 넣으면 R 만 남는다.', scenes=['카드에 f(x) = (x − 3)Q(x) + R 이 뜬다.', '커서가 x 자리에 3 을 끌어다 넣는다.', '(3 − 3) 이 0 으로 바뀌며 Q 항이 통째로 흐려진다.', 'f(3) = R 만 남고 강조된다.'], end='나머지 R = f(α)')],
  notes=['문제 2 는 나머지가 정수가 되도록 f(x) = (ax + b)Q(x) + R 꼴로 만듦(교과서 x − 1/2 꼴도 같은 원리).', '여유 문제는 중단원 수준의 응용(몫을 다시 나누기).'])
if __name__ == '__main__': write(L)
