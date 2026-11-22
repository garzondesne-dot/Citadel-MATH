from cm1lib import *
X = lambda cs, v='x': D(P(cs, v))
def FL(v, rng): return pick(v, rng, 12, lambda r: 2 * ri(r, 4, 12))
def fs(v, rng):
    Lg = FL(v, random.Random(rng.random() if v else 1)); return Lg, f'수직인 두 벽면에 길이가 {Lg} m 인 「ㄴ」자 모양 울타리를 붙여 직사각형 꽃밭을 만든다. 꽃밭의 가로의 길이를 x m 라 할 때,'
def m1a(v, rng):
    Lg, s = fs(v, rng)
    return choice(rng, f'{s} 세로의 길이를 x 로 나타내면? (단위 m)', f'{Lg} − x', [f'{Lg} − 2x', f'{Lg//2} − x', f'x − {Lg}'], f'울타리 전체가 가로 + 세로 = {Lg}.', chk=True)
def m1b(v, rng):
    Lg, s = fs(v, rng)
    return choice(rng, f'{s} 꽃밭의 넓이 y 를 x 에 대한 식으로 나타내면? (단위 m²)', 'y = ' + X([-1, Lg, 0]), ['y = ' + X([1, -Lg, 0]), 'y = ' + X([-2, Lg, 0]), 'y = ' + X([-1, Lg // 2, 0])], f'y = x({Lg} − x).', chk=lambda: same(P([-1, Lg, 0]), f'x*({Lg}-x)'))
def m1c(v, rng):
    Lg, s = fs(v, rng)
    return number(f'{s} 꽃밭의 최대 넓이는 몇 m² 인가?', (Lg // 2) ** 2, f'y = −(x − {Lg//2})² + {(Lg//2)**2} → x = {Lg//2} 일 때 최대.', chk=lambda: max(x * (Lg - x) for x in range(Lg + 1)) == (Lg // 2) ** 2)
def BL(v, rng): return pick(v, rng, (2, 1), lambda r: (ri(r, 1, 5), ri(r, 0, 8)))
def bs(v, rng):
    k, h = BL(v, random.Random(rng.random() if v else 1)); cs = [-5, 10 * k, h]
    return k, h, cs, f'지면으로부터 {h} m 높이에서 쏘아 올린 물체의 t 초 후의 높이가 y = {X(cs, "t")} (m) 이다.' if h else f'지면에서 쏘아 올린 물체의 t 초 후의 높이가 y = {X(cs, "t")} (m) 이다.'
def m2a(v, rng):
    k, h, cs, s = bs(v, rng); return number(f'{s} 물체가 가장 높이 올라간 것은 몇 초 후인가?', k, f'y = −5(t − {k})² + {5*k*k + h} → 꼭짓점의 t 좌표.', chk=lambda: same(P(cs, 't'), f'-5*(t-{k})**2+{5*k*k+h}', 't'))
def m2b(v, rng):
    k, h, cs, s = bs(v, rng); return number(f'{s} 물체의 최고 높이는 몇 m 인가?', 5 * k * k + h, f't = {k} 를 대입: −5 × {k*k} + {10*k} × {k} + {h}.', chk=lambda: peval(cs, k) == 5 * k * k + h)
def PR(v, rng): return pick(v, rng, (10, 30), lambda r: (lambda a, d: (a, a + 2 * d))(ri(r, 5, 20), ri(r, 3, 12)))
def ps(v, rng):
    a, b = PR(v, random.Random(rng.random() if v else 1))
    return a, b, f'어느 가게에서 한 개에 {a}00 원인 빵을 하루에 {b}0 개 판다. 빵값을 100 원 올릴 때마다 하루 판매량이 10 개씩 줄어든다. 빵값을 100x 원 올렸을 때,'
def m3a(v, rng):
    a, b, s = ps(v, rng)
    return choice(rng, f'{s} 하루 수입 y (원) 을 x 에 대한 식으로 나타내면?', f'y = 1000({a} + x)({b} − x)', [f'y = 1000({a} + x)({b} + x)', f'y = 1000({a} − x)({b} − x)', f'y = 1000({a} + x) − ({b} − x)'], f'(값) × (판매량) = 100({a} + x) × 10({b} − x).', chk=True)
def m3b(v, rng):
    a, b, s = ps(v, rng); x0 = (b - a) // 2
    return number(f'{s} 하루 수입은 1000({a} + x)({b} − x) 원이다. 수입이 최대가 되는 x 의 값은?', x0, f'({a} + x)({b} − x) = −x² + {b-a}x + {a*b} → 꼭짓점 x = {x0}.', chk=lambda: max(range(0, b), key=lambda x: (a + x) * (b - x)) == x0)
# 산: 직각삼각형 안의 직사각형 (중단원 수준)
def TR(v, rng): return pick(v, rng, (4, 2), lambda r: (2 * ri(r, 2, 6), ri(r, 2, 4)))   # 밑변 a, 높이 b = m·a
def ts(v, rng):
    a, m = TR(v, random.Random(rng.random() if v else 1)); b = m * a
    return a, m, b, f'직각을 낀 두 변의 길이가 {a}, {b} 인 직각삼각형 안에, 직각을 한 꼭짓점으로 하고 맞은편 꼭짓점이 빗변 위에 있는 직사각형을 그린다. 길이가 {a} 인 변 위의 직사각형의 변의 길이를 x 라 할 때,'
def m4a(v, rng):
    a, m, b, s = ts(v, rng)
    return choice(rng, f'{s} 길이가 {b} 인 변 위의 직사각형의 변의 길이는?', D(f'{b}-{m}*x'), [D(f'{b}-x'), D(f'{a}-{m}*x'), D(f'{m}*x')], f'닮음: 빗변 위의 점은 x 가 1 늘 때 높이가 {m} 씩 줄어든다 ({b} ÷ {a} = {m}).', chk=True)
def m4b(v, rng):
    a, m, b, s = ts(v, rng)
    return choice(rng, f'{s} 직사각형의 넓이 y 를 x 에 대한 식으로 나타내면?', 'y = ' + X([-m, b, 0]), ['y = ' + X([m, -b, 0]), 'y = ' + X([-1, b, 0]), 'y = ' + X([-m, a, 0])], f'y = x({D(f"{b}-{m}*x")}).', chk=lambda: same(P([-m, b, 0]), f'x*({b}-{m}*x)'))
def m4c(v, rng):
    a, m, b, s = ts(v, rng)
    return number(f'{s} 직사각형의 넓이의 최댓값은?', a * b // 4, f'y = −{m}(x − {a//2})² + {a*b//4} → x = {a//2} 일 때 최대(삼각형 넓이의 절반).', chk=lambda: max(Fr(t, 2) * (b - m * Fr(t, 2)) for t in range(2 * a + 1)) == Fr(a * b, 4))
def ex1(v, rng):
    k, lo, w = pick(v, rng, (10, 12, 4), lambda r: (ri(r, 5, 12), 0, ri(r, 2, 5))); 
    if v: lo = k + ri(rng, 1, 3)
    hi = lo + w; cs = [-1, 2 * k, 0]
    return number(f'어떤 약을 먹고 t 분 후의 몸속 농도가 y = {X(cs, "t")} 이다. {lo} ≤ t ≤ {hi} 일 때, 농도의 최솟값은?', peval(cs, hi), f'꼭짓점 t = {k} 는 범위의 왼쪽 밖 → 범위에서 계속 줄어든다 → t = {hi} 일 때 최소.', chk=lambda: min(peval(cs, t) for t in range(lo, hi + 1)) == peval(cs, hi))
L = dict(id='cm1-19', no=19, title='이차함수의 최대, 최소의 활용', unit='Ⅱ-2 이차방정식과 이차함수', pages='71 · 72 ~ 73 (중단원)', goal='이차함수의 최대, 최소를 실생활 문제와 연결하여 해결할 수 있다.',
  review='18차시: y = a(x − p)² + q 로 고쳐 최대 · 최소 · 범위 확인', intro='울타리 길이는 정해져 있다 — 꽃밭을 가장 넓게 만들려면? 「x 로 놓기 → 식 세우기 → 범위 → 최대 · 최소」.',
  concepts=[dict(id='c1', title='활용 문제 푸는 순서', say='① 변하는 양을 x 로 ② 구하는 양 y 를 x 의 이차식으로 ③ x 의 범위 확인 ④ 완전제곱식으로 고쳐 최대 · 최소.', check=dict(type='ox', q='둘레가 일정한 직사각형 중 넓이가 가장 큰 것은 정사각형이다.', ch=[], a='O', why='가로 x, 세로 k − x → x(k − x) 는 x = k/2 일 때 최대.')),
            dict(id='c2', title='식에서 최대 · 최소 읽기', say='y = −5(t − 2)² + 21 → t = 2 일 때 최댓값 21. 범위가 꼭짓점을 포함하는지 꼭 확인한다.')],
  mons=[dict(id='m1', title='문제 1 · 울타리로 만드는 꽃밭', subs=[m1a, m1b, m1c]), dict(id='m2', title='문제 2 · 쏘아 올린 물체', subs=[m2a, m2b]), dict(id='m3', title='문제 3 · 값을 올리면 수입은', subs=[m3a, m3b]),
        dict(id='m4', title='문제 4 · 삼각형 안의 직사각형', hard=True, subs=[m4a, m4b, m4c]), dict(id='m5', title='범위가 꼭짓점 밖일 때', extra=True, subs=[ex1])],
  boss=[(m1c, 'c1', 'm1'), (m2b, 'c2', 'm2'), (m3b, 'c1', 'm3'), (m2a, 'c2', 'm2')],
  hard_from='산 = 중단원 수준(직각삼각형 안의 직사각형 · 본문에 어려운 문제가 없어 넣음)',
  motion=[dict(title='울타리 12 m 로 가장 넓게', key='가로 x, 세로 12 − x → 넓이 x(12 − x) 는 x = 6 에서 최대.', scenes=['카드에 벽 두 면과 ㄴ자 울타리, 가로 x 슬라이더.', 'x 를 2, 4, 6, 8 로 움직이면 직사각형 모양과 넓이 숫자(20, 32, 36, 32)가 바뀐다.', '옆 좌표평면에 (x, 넓이) 점이 찍혀 포물선이 된다.', '꼭짓점 (6, 36) 에 깃발.'], end='y = −(x − 6)² + 36')],
  notes=['문장제는 한 화면에서 풀리도록 상황 글을 소문항마다 다시 적음(글이 길어 문제 카드의 본문 접기가 필요 — 손발 확인 거리).', '수입 문제의 단위(100 원 · 10 개)는 계산을 줄이려고 식에 1000 을 묶어 둠.', '삼각형 안의 직사각형은 그림이 있으면 훨씬 쉬움 → 학습지에는 그림을 넣는 것을 권함.'])
if __name__ == '__main__': write(L)
