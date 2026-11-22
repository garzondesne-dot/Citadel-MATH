from cm1lib import *
X = lambda cs, v='x': D(P(cs, v))
KIND = ['서로 다른 두 실근', '중근 (실근)', '서로 다른 두 허근']
kind = lambda d: KIND[0 if d > 0 else 1 if d == 0 else 2]
def m1a(v, rng):
    p, q = pick(v, rng, (2, 3), lambda r: (ri(r, -4, 4, (0,)), r.choice([1, 2, 3, 4, 5, 7, 9]))); cs = [1, -2 * p, p * p + q]
    rt = lambda a, b: (f'{N(a)} ± {int(b**.5)}i' if int(b ** .5) ** 2 == b else f'{N(a)} ± √{b} i').replace('± 1i', '± i')
    return choice(rng, f'이차방정식 {X(cs)} = 0 의 해는?', 'x = ' + rt(p, q), ['x = ' + rt(-p, q), f'x = {N(p)} ± √{q}', 'x = ' + rt(p, q + p * p), f'x = {N(2*p)} ± √{q} i'], f'근의 공식(짝수 공식): x = {N(p)} ± √({p*p} − {p*p+q}) = {N(p)} ± √(−{q}).', chk=lambda: abs(complex(p, q ** .5) ** 2 - 2 * p * complex(p, q ** .5) + p * p + q) < 1e-9)
def QD(v, rng, k=0): return pick(v, rng, [[1, 3, -1], [1, 2, 4], [3, 1, 1]][k], lambda r: r.choice([[1, ri(r, -6, 6), ri(r, -6, 8)], [1, 2 * (t := ri(r, -4, 4, (0,))), t * t], [ri(r, 2, 3), ri(r, -5, 5), ri(r, 1, 6)]]))
def m1b(v, rng):
    cs = QD(v, rng, 1); d = cs[1] ** 2 - 4 * cs[0] * cs[2]; ok = d < 0
    return ox(f'이차방정식 {X(cs)} = 0 의 근은 허근이다.', ok, f'근호 안 b² − 4ac = {N(d)} {"< 0 → 허근" if ok else "≥ 0 → 실근"}.', chk=True)
def m2a(v, rng):
    cs = QD(v, random.Random(rng.random() if v else 1)); d = cs[1] ** 2 - 4 * cs[0] * cs[2]
    return number(f'이차방정식 {X(cs)} = 0 의 판별식 D = b² − 4ac 의 값은?', d, f'({N(cs[1])})² − 4 × {cs[0]} × ({N(cs[2])}).', chk=True)
def m2b(v, rng):
    cs = QD(v, random.Random(rng.random() if v else 1)); d = cs[1] ** 2 - 4 * cs[0] * cs[2]
    return choice(rng, f'이차방정식 {X(cs)} = 0 의 근을 판별하면?', kind(d), [k for k in KIND if k != kind(d)], f'D = {N(d)} {">" if d > 0 else "=" if d == 0 else "<"} 0.', n=3, keep=True, chk=True)
def CND(v, rng): return pick(v, rng, (2, -3), lambda r: (ri(r, -4, 4, (0,)), ri(r, -6, 6)))    # x² + 2p x + a + q = 0 · D/4 = p² − a − q
def cs_(v, rng):
    p, q = CND(v, random.Random(rng.random() if v else 1)); eq = f"x² {'+' if p>0 else '−'} {abs(2*p)}x + a {'+' if q>=0 else '−'} {abs(q)} = 0" if q else f"x² {'+' if p>0 else '−'} {abs(2*p)}x + a = 0"
    return p, q, eq, p * p - q
def m3a(v, rng):
    p, q, eq, t = cs_(v, rng)
    return choice(rng, f'이차방정식 {eq} 이 실근을 갖도록 하는 실수 a 의 값의 범위는?', f'a ≤ {N(t)}', [f'a ≥ {N(t)}', f'a < {N(t)}', f'a > {N(t)}'], f'실근 ⟺ D ≥ 0 (중근 포함): D/4 = {p*p} − (a {"+" if q>=0 else "−"} {abs(q)}) ≥ 0.', chk=True)
def m3b(v, rng):
    p, q, eq, t = cs_(v, rng)
    return number(f'이차방정식 {eq} 이 중근을 갖도록 하는 실수 a 의 값은?', t, f'중근 ⟺ D = 0: {p*p} − a − ({N(q)}) = 0.', chk=lambda: (2 * p) ** 2 - 4 * (t + q) == 0)
# 산: 중근 조건으로 k (중단원 수준)
def HK(v, rng):
    a, k = pick(v, rng, (1, 2), lambda r: (ri(r, -3, 3, (0,)), ri(r, -4, 4))); return a, k, a * a + 2 * a * k
def hs(v, rng):
    a, k, b = HK(v, random.Random(rng.random() if v else 1))
    return a, k, b, f"이차방정식 x² − 2(k {'+' if a>0 else '−'} {abs(a)})x + k² {'+' if b>=0 else '−'} {abs(b)} = 0 이 중근을 갖는다 (k 는 실수)."
def m4a(v, rng):
    a, k, b, s = hs(v, rng)
    return choice(rng, f'{s} 이 조건을 판별식 D 로 쓰면?', 'D = 0', ['D > 0', 'D < 0', 'D ≥ 0'], '중근 ⟺ 판별식이 0.', chk=True)
def m4b(v, rng):
    a, k, b, s = hs(v, rng); e = [2 * a, a * a - b]
    return choice(rng, f'{s} D/4 = (k {"+" if a>0 else "−"} {abs(a)})² − (k² {"+" if b>=0 else "−"} {abs(b)}) 를 정리하면?', X(e, 'k'), [X([2 * a, a * a + b], 'k'), X([-2 * a, a * a - b], 'k'), X([2, 2 * a, a * a - b], 'k')], 'k² 이 서로 지워지고 k 의 일차식만 남는다.', chk=lambda: same(f'(k+({a}))**2-(k**2+({b}))', P(e, 'k'), 'k'))
def m4c(v, rng):
    a, k, b, s = hs(v, rng)
    return number(f'{s} k 의 값은?', k, f'D/4 = {X([2*a, a*a-b], "k")} = 0 을 푼다.', chk=lambda: (2 * (k + a)) ** 2 - 4 * (k * k + b) == 0)
def ex1(v, rng):
    a, c = pick(v, rng, (2, -5), lambda r: (r.choice([1, 2, 3, -1, -2]), 0)); 
    if v: c = -a * ri(rng, 1, 5) // abs(a) if True else 0
    b = pick(v, rng, 1, lambda r: ri(r, -5, 5))
    return choice(rng, f'이차방정식 {X([a, b, c])} = 0 은 이차항의 계수와 상수항의 부호가 다르다. 이 방정식의 근은?', KIND[0], KIND[1:] + ['근이 없다'], 'ac < 0 이면 −4ac > 0 → D = b² − 4ac > 0.', keep=True, chk=lambda: b * b - 4 * a * c > 0)
L = dict(id='cm1-13', no=13, title='이차방정식의 판별식', unit='Ⅱ-1 복소수와 이차방정식', pages='52 ~ 54', goal='이차방정식의 실근과 허근을 이해하고, 판별식으로 근을 판별할 수 있다.',
  review='중학교: 근의 공식 · 12차시: √(−a) = √a i', intro='번호판 색만 보고 친환경 차를 알듯, 근을 구하지 않고도 실근인지 허근인지 아는 법 — 근호 안의 부호.',
  concepts=[dict(id='c1', title='실근과 허근', say='계수가 실수인 이차방정식은 복소수 범위에서 반드시 근을 갖는다. 실수인 근 = 실근, 허수인 근 = 허근.', check=dict(type='ox', q='이차방정식 x² + 9 = 0 은 복소수의 범위에서 근이 없다.', ch=[], a='X', why='x = ±3i 라는 허근을 갖는다.')),
            dict(id='c2', title='판별식 D = b² − 4ac', say='D > 0 서로 다른 두 실근 · D = 0 중근(실근) · D < 0 서로 다른 두 허근. 실근을 가질 조건은 D ≥ 0.', check=dict(type='ox', q='이차방정식이 실근을 가질 조건은 D > 0 이다.', ch=[], a='X', why='중근도 실근 → D ≥ 0.'))],
  mons=[dict(id='m1', title='문제 1 · 풀어서 실근 · 허근', subs=[m1a, m1b]), dict(id='m2', title='문제 2 · 판별식으로 판별', subs=[m2a, m2b]), dict(id='m3', title='문제 3 · 근의 조건으로 a 의 범위', subs=[m3a, m3b]),
        dict(id='m4', title='문제 4 · 중근일 때 k', hard=True, subs=[m4a, m4b, m4c]), dict(id='m5', title='부호만 보고 판별', extra=True, subs=[ex1])],
  boss=[(m1a, 'c1', 'm1'), (m2b, 'c2', 'm2'), (m3a, 'c2', 'm3'), (m4c, 'c2', 'm4')],
  hard_from='산 = 중단원 수준(중근 조건으로 문자 값 구하기 · 본문에 어려운 문제가 없어 넣음)',
  motion=[dict(title='판별식 — 근호 안의 부호가 정한다', key='D = b² − 4ac 의 부호로 근의 종류가 갈린다.', scenes=['카드에 근의 공식이 뜨고 근호 안 b² − 4ac 에 돋보기가 놓인다.', '슬라이더로 c 를 올리면 포물선이 위로 뜨며 x축과의 만남이 2점 → 1점 → 0점.', '그때마다 D > 0 · D = 0 · D < 0 딱지가 바뀐다.', '세 칸 표 「두 실근 · 중근 · 두 허근」이 정리된다.'], end='D > 0 · D = 0 · D < 0', at='c2')],
  notes=['문제 3 은 D/4 꼴이 되도록 일차항 계수를 짝수로 둠.', '여유 문제 = 54쪽 생각 넓히기 활동 2.'])
if __name__ == '__main__': write(L)
