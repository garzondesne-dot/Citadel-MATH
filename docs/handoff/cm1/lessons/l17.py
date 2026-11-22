from cm1lib import *
X = lambda cs, v='x': D(P(cs, v))
POS = ['서로 다른 두 점에서 만난다', '한 점에서 만난다 (접한다)', '만나지 않는다']
pos = lambda d: POS[0 if d > 0 else 1 if d == 0 else 2]
def m1a(v, rng):
    a, b = pick(v, rng, (-1, 2), lambda r: tuple(sorted(r.sample(range(-4, 5), 2)))); m = pick(v, rng, 1, lambda r: ri(r, -3, 3)); n = pick(v, rng, 0, lambda r: ri(r, -3, 3))
    q = padd(pmul([1, -a], [1, -b]), [m, n])      # y = q(x), 직선 y = mx + n → 차 = (x−a)(x−b)
    return choice(rng, f'이차함수 y = {X(q)} 의 그래프와 직선 y = {X([m, n])} 이 만나는 점의 x좌표를 모두 구한 것은?', f'{N(a)}, {N(b)}', [f'{N(-b)}, {N(-a)}' if (-b, -a) != (a, b) else f'{N(a-1)}, {N(b+1)}', f'{N(a)}, {N(b+1)}', f'{N(a-1)}, {N(b)}', f'{N(a+b)}, {N(a*b)}'], f'두 식을 같다고 놓고 정리: {X(pmul([1,-a],[1,-b]))} = 0.', chk=lambda: peval(q, a) == m * a + n and peval(q, b) == m * b + n)
def QL(v, rng, k=0):
    return pick(v, rng, [([-1, 5, 1], [-1, 3]), ([-1, 5, 1], [1, 5]), ([-1, 5, 1], [3, 4])][k], lambda r: ([r.choice([1, -1, 2]), ri(r, -5, 5), ri(r, -4, 4)], [ri(r, -3, 3), ri(r, -5, 5)]))
def dd(q, l): e = padd(q, l, -1); return e, e[1] ** 2 - 4 * e[0] * e[2]
def m2a(v, rng):
    q, l = QL(v, random.Random(rng.random() if v else 1)); e, d = dd(q, l)
    return choice(rng, f'이차함수 y = {X(q)} 의 그래프와 직선 y = {X(l)} 의 교점을 구하려고 두 식을 같다고 놓았다. 정리한 이차방정식은?', X(e) + ' = 0', [X(padd(q, l)) + ' = 0', X([e[0], e[1], -e[2]]) + ' = 0', X([e[0], -e[1], e[2]]) + ' = 0', X(q) + ' = 0'], '직선의 식을 좌변으로 넘겨 동류항끼리 정리한다.', chk=True)
def m2b(v, rng):
    q, l = QL(v, random.Random(rng.random() if v else 1)); e, d = dd(q, l)
    return choice(rng, f'이차함수 y = {X(q)} 의 그래프와 직선 y = {X(l)} 의 위치 관계는?', pos(d), [p for p in POS if p != pos(d)], f'{X(e)} = 0 의 판별식 D = {N(d)}.', n=3, keep=True, chk=True)
def m2c(v, rng):
    q, l = QL(v, rng, 1 if v == 0 else 0); e, d = dd(q, l)
    return choice(rng, f'이차함수 y = {X(q)} 의 그래프와 직선 y = {X(l)} 의 위치 관계는?', pos(d), [p for p in POS if p != pos(d)], f'{X(e)} = 0 의 판별식 D = {N(d)}.', n=3, keep=True, chk=True)
def NO(v, rng): return pick(v, rng, (1, -2, 3), lambda r: (ri(r, -4, 4, (0,)), ri(r, -5, 5), ri(r, -4, 4)))   # y = x² + 2p x + a, y = mx + n → x² + (2p−m)x + a − n; 짝수로
def m3a(v, rng):
    p, n, m2 = NO(v, random.Random(rng.random() if v else 1)); m = 2 * m2; h = p - m2; t = h * h + n
    return choice(rng, f"이차함수 y = x² {'+' if p>0 else '−'} {abs(2*p)}x + a 의 그래프와 직선 y = {X([m, n])} 이 만나지 않도록 하는 실수 a 의 값의 범위는?", f'a > {N(t)}', [f'a < {N(t)}', f'a ≥ {N(t)}', f'a ≤ {N(t)}'], f'정리한 방정식의 D < 0: D/4 = {h*h} − (a − ({N(n)})) < 0.', chk=True)
def m3b(v, rng):
    p, n, m2 = NO(v, random.Random(rng.random() if v else 1)); m = 2 * m2; h = p - m2; t = h * h + n
    return number(f"이차함수 y = x² {'+' if p>0 else '−'} {abs(2*p)}x + a 의 그래프와 직선 y = {X([m, n])} 이 접하도록 하는 실수 a 의 값은?", t, f'D = 0: {h*h} − a + ({N(n)}) = 0.', chk=lambda: (2 * p - m) ** 2 - 4 * (t - n) == 0)
# 산: 접하도록 하는 a 를 모두 (교과서 67쪽 문제 5 꼴)
def TG(v, rng):
    m, c, s = pick(v, rng, (1, 4, 2), lambda r: (ri(r, -3, 3), 0, ri(r, 1, 4))); c = s * s      # x² + (a − m)x + c = 0, c = s²
    k = pick(v, rng, -1, lambda r: ri(r, -5, 5)); return m, c, s, k                              # 이차함수 상수 k, 직선 상수 k − c
def hs(v, rng):
    m, c, s, k = TG(v, random.Random(rng.random() if v else 1))
    return m, c, s, k, f"이차함수 y = x² + ax {'+' if k>=0 else '−'} {abs(k)} 의 그래프와 직선 y = {X([m, k - c])} 이 한 점에서 만난다 (a 는 실수)."
def m4a(v, rng):
    m, c, s, k, st = hs(v, rng)
    am = f"(a {'−' if m>0 else '+'} {abs(m)})" if m else 'a'
    return choice(rng, f'{st} 두 식을 같다고 놓고 정리한 방정식은?', f'x² + {am}x + {c} = 0', [f'x² + {am}x − {c} = 0', f'x² + ax + {c} = 0', f"x² + (a {'+' if m>0 else '−'} {abs(m)})x + {c} = 0" if m else f'x² − ax + {c} = 0'], '직선의 식을 좌변으로 넘겨 x 항과 상수항을 따로 정리한다.', chk=True)
def m4b(v, rng):
    m, c, s, k, st = hs(v, rng); am = f"(a {'−' if m>0 else '+'} {abs(m)})" if m else 'a'
    return choice(rng, f'{st} 「한 점에서 만난다」를 x² + {am}x + {c} = 0 의 판별식 D 로 쓰면?', f'{am}² − {4*c} = 0', [f'{am}² − {4*c} > 0', f'{am}² + {4*c} = 0', f'{am}² − {c} = 0'], '접한다 ⟺ D = b² − 4ac = 0.', chk=True)
def m4c(v, rng):
    m, c, s, k, st = hs(v, rng); a1, a2 = sorted([m + 2 * s, m - 2 * s])
    return choice(rng, f'{st} a 의 값을 모두 구한 것은?', f'{N(a1)}, {N(a2)}', [f'{N(a2)}', f'{N(-a2)}, {N(-a1)}' if (-a2, -a1) != (a1, a2) else f'{N(a1+1)}, {N(a2+1)}', f'{N(m - s)}, {N(m + s)}'], f'(a − ({N(m)}))² = {4*c} → a − ({N(m)}) = ±{2*s}.', chk=lambda: all((a - m) ** 2 - 4 * c == 0 for a in (a1, a2)))
def ex1(v, rng):
    p, q, m = pick(v, rng, (-1, -2, 1), lambda r: (ri(r, -4, 4), ri(r, -5, 5), ri(r, -3, 3)))
    hh = (p - m); 
    if hh % 2: p += 1; hh = p - m
    a = q - Fr(hh * hh, 4)
    return number(f'이차함수 y = {X([1, p, q])} 의 그래프와 직선 y = {X([m, 0]) if m else "0·x"} + a 가 한 점에서 만날 때, 실수 a 의 값은?'.replace('0·x + a', 'a'), a, f'x² + ({N(p-m)})x + ({N(q)}) − a = 0 의 D = 0.', chk=lambda: (p - m) ** 2 - 4 * (q - a) == 0)
L = dict(id='cm1-17', no=17, title='이차함수의 그래프와 직선', unit='Ⅱ-2 이차방정식과 이차함수', pages='66 ~ 68', goal='이차함수의 그래프와 직선의 위치 관계를 판단할 수 있다.',
  review='16차시: 그래프와 x축 — D 의 부호 · x축은 직선 y = 0', intro='x축 대신 비스듬한 직선이면? 두 식을 같다고 놓은 이차방정식의 실근이 교점의 x좌표.',
  concepts=[dict(id='c1', title='그래프와 직선이 만나는 점', say='y = ax² + bx + c 와 y = mx + n 이 만나는 점의 x좌표 = ax² + (b − m)x + c − n = 0 의 실근.'),
            dict(id='c2', title='판별식과 위치 관계', say='정리한 이차방정식의 D > 0 두 점 · D = 0 접한다 · D < 0 만나지 않는다.', check=dict(type='ox', q='이차함수의 그래프와 직선이 접하면, 두 식을 같다고 놓은 이차방정식은 중근을 갖는다.', ch=[], a='O', why='교점이 하나 = 실근이 하나(중근) = D = 0.'))],
  mons=[dict(id='m1', title='문제 1 · 직선과 만나는 점', subs=[m1a]), dict(id='m2', title='문제 2 · 직선과의 위치 관계', subs=[m2a, m2b, m2c]), dict(id='m3', title='문제 3 · 위치 관계로 a 구하기', subs=[m3a, m3b]),
        dict(id='m4', title='문제 4 · 접하게 하는 a 를 모두', hard=True, subs=[m4a, m4b, m4c]), dict(id='m5', title='y = mx + a 가 접할 때', extra=True, subs=[ex1])],
  boss=[(m1a, 'c1', 'm1'), (m2b, 'c2', 'm2'), (m3a, 'c2', 'm3'), (m3b, 'c2', 'm3')],
  hard_from='산 = 본문 67쪽 문제 5 꼴(본문에 있어 중단원에서 안 가져옴)',
  motion=[dict(title='직선을 밀어 올리면 — 두 점 · 접점 · 헤어짐', key='두 식을 같다고 놓은 방정식의 D 가 위치 관계를 정한다.', scenes=['카드에 포물선 y = x² − x − 2 와 직선 y = x + a, 아래 a 슬라이더.', 'a 를 내리면 두 교점이 가까워지다 한 점으로 붙는다(a = −3).', '더 내리면 직선이 포물선 아래로 떨어진다.', '세 장면 옆에 D > 0 · D = 0 · D < 0.'], end='x² − 2x − 2 − a = 0 의 D', at='c2')],
  notes=['67쪽 생각 넓히기(배구공 · 소수 계수)는 뺌 — 여유 문제는 68쪽 공학 도구의 「접할 때 a」 꼴.', '문제 3 은 D/4 가 되도록 일차항 계수를 짝수로 맞춤.'])
if __name__ == '__main__': write(L)
