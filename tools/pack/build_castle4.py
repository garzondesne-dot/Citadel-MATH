# 🏰 성채 4층 「함수 중단원」 팩 만들기 + 정답 독립 검산 (2026-11-20 · 손발 #7 · 변경 제안 v1 컨펌 · 컨펌 #7 = A1 · B1 · C1 · D1 · E1)
#   첫 판 = tools/pack/castle4_plan.py 표 그대로 · 재도전 6판 = 같은 꼴 숫자만 · 꼴 = 성채 3층(eval-3)과 같은 성채 팩(문항 = 입력판 꼴 q · a · ch · sol · say)
#   새 꼴(11/24 정식): 짝 맞추기 match { q, x, y, a } · 그래프 고르기 ch "graph:…" · 문제 글 [[graph:…]]
#   실행: python3 -I tools/pack/build_castle4.py <출력.json>  → 검산 표 · 하나라도 틀리면 멈춤
import json, sys, math, random
from fractions import Fraction as Fr
OUT = sys.argv[1]
rnd = random.Random(404)
M = lambda n: str(n).replace('-', '−')
CHECK = []
def ok(name, ans, calc): CHECK.append((name, ans, calc))
def fs(c):
    c = Fr(c); return M(c.numerator) if c.denominator == 1 else f'{"−" if c < 0 else ""}{abs(c.numerator)}/{c.denominator}'


def chq(q, correct, wrong, sol, say=None):
    c = [correct] + [w for w in wrong if w != correct]
    c = list(dict.fromkeys(c))
    if len(c) < 3:  # 수 정답이면 이웃 수로 채움 (오답이 정답과 겹친 판)
        try:
            v = Fr(correct.replace('−', '-'))
            for d in (1, -1, 2, -2): c = list(dict.fromkeys(c + [fs(v + d)]))
        except (ValueError, ZeroDivisionError): pass
    c = c[:3]; assert len(c) == 3 and c[0] == correct, (correct, wrong)
    rnd.shuffle(c)
    it = {'type': 'choice', 'q': q, 'a': str(c.index(correct)), 'ch': c, 'sol': sol}
    if say: it['say'] = say
    return it
def numq(q, ans, sol, say=None):
    assert Fr(ans).denominator == 1
    it = {'type': 'number', 'q': q, 'a': str(int(ans)), 'ch': [], 'sol': sol}
    if say: it['say'] = say
    return it
def lin(a, b, v='x'):
    a, b = Fr(a), Fr(b)
    if a == 0: return fs(b)
    s = ('' if a == 1 else '−' if a == -1 else M(a)) + v if a.denominator == 1 else f'{"−" if a < 0 else ""}({abs(a.numerator)}/{a.denominator}){v}'
    if b: s += (' + ' if b > 0 else ' − ') + fs(abs(b))
    return s
def quad(m, n, v='x'):  # m x² + n
    s = ('' if m == 1 else '−' if m == -1 else M(m)) + f'{v}²'
    return s + ((' + ' if n > 0 else ' − ') + str(abs(n)) if n else '')


# ───────── 01 · 중단원 01 (함수인 것 모두 · 여러 개) ─────────
def r01(Y, c1, c2, k, c4):
    X = [-1, 0, 1]
    fns = [(f'y = {lin(1, c1)}', lambda x: x + c1), (f'y = {quad(1, c2)}', lambda x: x * x + c2), (f'y = {lin(k, 0)}', lambda x: k * x), ('y = |x|' + (f' + {c4}' if c4 > 0 else f' − {-c4}' if c4 < 0 else ''), lambda x: abs(x) + c4)]
    ans = [i for i, (_, f) in enumerate(fns) if all(f(x) in Y for x in X)]
    assert 1 <= len(ans) <= 3, (Y, ans)
    why = ' · '.join(f'({i + 1}) ' + ('✔' if i in ans else f'x = {M(next(x for x in X if f(x) not in Y))} → {M(f(next(x for x in X if f(x) not in Y)))} ∉ Y') for i, (_, f) in enumerate(fns))
    Ys = '{' + ', '.join(M(y) for y in sorted(Y)) + '}'
    ok('01', str([a + 1 for a in ans]), why)
    return [{'type': 'multi', 'q': f'01 두 집합 X = {{−1, 0, 1}} 과 Y = {Ys} 에 대하여 X 에서 Y 로의 함수인 것을 모두 고르시오.', 'a': ','.join(map(str, ans)),
             'ch': [f'({i + 1}) {n}' for i, (n, _) in enumerate(fns)], 'sol': why}]
R01 = [r01({0, 1, 2, 4}, 1, 1, 2, 3), r01({0, 1, 2, 3}, 2, 2, -1, 1), r01({-1, 0, 1, 2}, 1, -2, 3, -1), r01({0, 1, 2, 3, 4}, 3, 3, 4, 2),
       r01({-2, -1, 0, 1}, -1, -1, 1, 1), r01({0, 1, 2, 5}, 1, 1, -2, 4), r01({1, 2, 3, 4}, 2, 3, 3, 2)]
assert R01[0][0]['a'] == '0,1'


# ───────── 02 · 중단원 05 (f = g · ⚔ 5단계) ─────────
def r02(u, w, c):
    b = 1 - u - w; a = u * u + b * u + c - u
    for x in (u, w): assert x + a == x * x + b * x + c
    bt = lambda t: 'b' if t == 1 else f'{t}b'
    g = f'x² + bx {"+" if c > 0 else "−"} {abs(c)}'
    Q = f'02 정의역이 {{{u}, {w}}} 인 두 함수 f(x) = x + a, g(x) = {g} 에 대하여 f = g 일 때, 상수 a, b 의 값은?\n'
    e1 = f'{u} + a = {u * u + c} + {bt(u)}'.replace('+ 0b', '').replace('0 + a', 'a'); e2 = f'{w} + a = {w * w + c} + {bt(w)}'
    ok('02', f'a = {a}, b = {b}', f'x = {u}, {w} 대입 확인')
    return [chq(Q + '① f = g 의 뜻은?', f'f({u}) = g({u}), f({w}) = g({w})', ['식이 똑같다', 'f(x) = g(x) 인 x 가 하나 있다'], '서로 같은 함수 = 정의역의 모든 원소에서 함숫값이 같다', f'f = g 이므로 f({u}) = g({u}), f({w}) = g({w})'),
            chq(Q + f'② f({u}) = g({u}) 을 식으로 쓰면?', e1, [f'{u} + a = {c} + {bt(u)}', f'a = {u * u + c} + {bt(u)}'], f'g({u}) = {u * u} + {bt(u)} {"+" if c > 0 else "−"} {abs(c)}', e1),
            chq(Q + f'③ f({w}) = g({w}) 을 식으로 쓰면?', e2, [f'{w} + a = {w + c} + {bt(w)}', f'{w} + a = {w * w} + {bt(w)}'], f'g({w}) = {w * w} + {bt(w)} {"+" if c > 0 else "−"} {abs(c)}', e2),
            chq(Q + '④ 두 식을 빼서 구한 b 는?', f'b = {M(b)}', [f'b = {M(-b)}', f'b = {M(b + 1)}'], f'(뒤 식) − (앞 식) → b = {M(b)}', f'두 식을 빼면 b = {M(b)}'),
            chq(Q + '👑 그러므로 a, b 는?', f'a = {M(a)}, b = {M(b)}', [f'a = {M(b)}, b = {M(a)}', f'a = {M(a)}, b = {M(-b)}', f'a = {M(a + 1)}, b = {M(b)}'], f'b = {M(b)} 를 넣으면 a = {M(a)}', f'그러므로 a = {M(a)}, b = {M(b)}')]
R02 = [r02(1, 3, 4), r02(1, 2, 6), r02(2, 3, 1), r02(1, 4, 2), r02(2, 4, 5), r02(0, 3, 3), r02(1, 5, 7)]


# ───────── 03 · 중단원 02 (짝 맞추기) ─────────
LET = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ']
def kind_f(k):
    return {'c': lambda x: k[1], 'id': lambda x: x, 'l': lambda x: k[1] * x + k[2], 'q': lambda x: k[1] * x * x + k[2]}[k[0]]
def kname(k):
    return {'c': lambda: f'y = {M(k[1])}', 'id': lambda: 'y = x', 'l': lambda: f'y = {lin(k[1], k[2])}', 'q': lambda: f'y = {quad(k[1], k[2])}'}[k[0]]()
def classify(k):
    f = kind_f(k); xs = [i / 7 for i in range(-70, 71)]; vals = [f(x) for x in xs]
    inj = len(set(vals)) == len(vals); const = len(set(vals)) == 1; ident = all(f(x) == x for x in xs)
    onto = inj and ((f(1000) > 500 and f(-1000) < -500) or (f(1000) < -500 and f(-1000) > 500))
    return onto, ident, const
def r03(K):
    C = [classify(k) for k in K]
    on = [i for i, c in enumerate(C) if c[0]]; idn = [i for i, c in enumerate(C) if c[1]]; cn = [i for i, c in enumerate(C) if c[2]]
    assert len(on) == 2 and len(idn) == 1 and len(cn) == 1 and idn[0] in on
    ans = [(0, i) for i in on] + [(1, idn[0]), (2, cn[0])]
    box = '   '.join(f'{LET[i]}. {kname(k)}' for i, k in enumerate(K))
    sol = f'일대일대응 {LET[on[0]]}, {LET[on[1]]} · 항등함수 {LET[idn[0]]} · 상수함수 {LET[cn[0]]}'
    ok('03', sol, '촘촘히 찍어 일대일 · 항등 · 상수 따로 셈')
    return [{'type': 'match', 'q': f'03 정의역과 공역이 실수 전체일 때 보기에서 일대일대응, 항등함수, 상수함수를 찾아 이름에서 보기로 화살표를 이으시오.\n{box}', 'x': ['일대일대응', '항등함수', '상수함수'], 'y': LET,
             'a': ','.join(f'{a}-{b}' for a, b in ans), 'xn': '이름', 'yn': '보기', 'sol': sol}]
R03 = [r03(k) for k in ([('c', 4), ('l', -3, 2), ('id',), ('q', -1, 2)], [('id',), ('q', 2, 1), ('l', 5, -1), ('c', -3)], [('l', -1, 4), ('c', 0), ('q', 1, -5), ('id',)],
                        [('q', -2, 3), ('id',), ('c', 6), ('l', 2, 7)], [('c', -2), ('id',), ('q', 3, 0), ('l', -4, -1)], [('l', 6, 0), ('q', -1, -1), ('id',), ('c', 9)], [('id',), ('c', 1), ('l', -2, 5), ('q', 1, 4)])]
assert R03[0][0]['a'] == '0-1,0-2,1-2,2-0'


# ───────── 04 · 구간을 나눈 함수 (그래프 고르기) ─────────
def onto_inj(r, l):
    f = lambda x: r(x) if x >= 0 else l(x)
    xs = [i / 200 for i in range(-2000, 2001)]; v = [f(x) for x in xs]
    inj = len({round(t, 9) for t in v}) == len(v)
    cont = all(abs(v[i + 1] - v[i]) < 0.1 for i in range(len(v) - 1))
    ends = (f(1000) > 100 and f(-1000) < -100) or (f(1000) < -100 and f(-1000) > 100)
    return inj and cont and ends
def r04(good, bad1, bad2):
    """각 = (오른쪽 그림 글, 오른쪽 식, 왼쪽 그림 글, 왼쪽 식, 글)"""
    gs = [good, bad1, bad2]
    res = [onto_inj(g[1], g[3]) for g in gs]; assert res == [True, False, False], res
    G = lambda g: f'graph:{g[2]} (-5,0); {g[0]} [0,5) @-3,3,-4,4'
    ok('04', good[4], '촘촘히 찍어 겹침 없음 · 끊김 없음 · 양 끝 ±∞')
    return [chq('04 실수 전체에서 정의된 함수 중 x ≥ 0 일 때와 x < 0 일 때 식이 다른 함수의 그래프이다. 일대일대응인 것은?', G(good), [G(bad1), G(bad2)],
                f'{good[4]} — 가로줄이 한 번만 만나고(일대일) 두 부분의 y 값이 겹치지 않고 합치면 실수 전체(치역 = 공역)')]
NOT_INJ = [('y=x^2', lambda x: x * x, 'y=-x', lambda x: -x, ''), ('y=2x', lambda x: 2 * x, 'y=x^2', lambda x: x * x, ''), ('y=-x', lambda x: -x, 'y=-x^2', lambda x: -x * x, '')]
NOT_ONTO = [('y=x+1', lambda x: x + 1, 'y=x', lambda x: x, ''), ('y=-x-1', lambda x: -x - 1, 'y=-x', lambda x: -x, ''), ('y=x^2+1', lambda x: x * x + 1, 'y=x', lambda x: x, '')]
GOOD = [('y=-x^2', lambda x: -x * x, 'y=-3x', lambda x: -3 * x, 'x ≥ 0: y = −x² · x < 0: y = −3x'), ('y=-2x', lambda x: -2 * x, 'y=x^2', lambda x: x * x, 'x ≥ 0: y = −2x · x < 0: y = x²'),
        ('y=x^2', lambda x: x * x, 'y=2x', lambda x: 2 * x, 'x ≥ 0: y = x² · x < 0: y = 2x'), ('y=3x', lambda x: 3 * x, 'y=-x^2', lambda x: -x * x, 'x ≥ 0: y = 3x · x < 0: y = −x²'),
        ('y=-x', lambda x: -x, 'y=x^2', lambda x: x * x, 'x ≥ 0: y = −x · x < 0: y = x²'), ('y=x', lambda x: x, 'y=3x', lambda x: 3 * x, 'x ≥ 0: y = x · x < 0: y = 3x'), ('y=-x^2', lambda x: -x * x, 'y=-x', lambda x: -x, 'x ≥ 0: y = −x² · x < 0: y = −x')]
R04 = [r04(GOOD[i], NOT_INJ[i % 3], NOT_ONTO[i % 3]) for i in range(7)]


# ───────── 05 · 중단원 10 (발전 · 서술형 · ⚔ 5단계) ─────────
def r05(p, q, r, s):
    E = lambda x, y: (f'{("" if x == 1 else "−" if x == -1 else M(x))}a + b' if x else 'b') + f' = {M(y)}'
    a1 = Fr(s - r, q - p); b1 = r - a1 * p; a2 = -a1; b2 = s - a2 * p
    assert all(x.denominator == 1 for x in (a1, b1, a2, b2)) and {a1 * p + b1, a1 * q + b1} == {r, s} == {a2 * p + b2, a2 * q + b2}
    a1, b1, a2, b2 = map(int, (a1, b1, a2, b2))
    Q = f'05 두 집합 X = {{x | {p} ≤ x ≤ {q}}} 와 Y = {{y | {r} ≤ y ≤ {s}}} 에 대하여 X 에서 Y 로의 함수 f(x) = ax + b 가 일대일대응일 때, 상수 a, b 의 순서쌍 (a, b) 를 모두 구하시오.\n'.replace('{x | ', '{x | ').replace(' − ', ' −')
    ok('05', f'({M(a1)}, {M(b1)}), ({M(a2)}, {M(b2)})', '끝점 대입')
    return [chq(Q + '① 일대일대응인 일차함수에서 정의역의 양 끝은?', '공역의 양 끝에 하나씩 대응한다', ['공역의 가운데에 대응한다', '같은 값에 대응한다'], '직선이 치역 = 공역이 되려면 양 끝점끼리 대응', '일대일대응이므로 정의역의 양 끝이 공역의 양 끝에 하나씩 대응한다.'),
            chq(Q + '② a > 0 일 때 세울 식은?', f'f({p}) = {r}, f({q}) = {s}', [f'f({p}) = {s}, f({q}) = {r}', f'f({r}) = {p}, f({s}) = {q}'], 'a > 0 → 오른쪽 위로 → 작은 끝 ↔ 작은 끝', f'a > 0 이면 f({p}) = {r}, f({q}) = {s}'),
            chq(Q + '③ a > 0 일 때 (a, b) 는?', f'({M(a1)}, {M(b1)})', [f'({M(b1)}, {M(a1)})', f'({M(a1)}, {M(-b1)})', f'({M(a1 + 1)}, {M(b1)})'], f'{E(p, r)}, {E(q, s)} → a = {M(a1)}, b = {M(b1)}', f'a > 0 이면 (a, b) = ({M(a1)}, {M(b1)})'),
            chq(Q + '④ a < 0 일 때 (a, b) 는?', f'({M(a2)}, {M(b2)})', [f'({M(b2)}, {M(a2)})', f'({M(a2)}, {M(b1)})', f'({M(-a2)}, {M(b2)})'], f'{E(p, s)}, {E(q, r)} → a = {M(a2)}, b = {M(b2)}', f'a < 0 이면 (a, b) = ({M(a2)}, {M(b2)})'),
            chq(Q + '👑 그러므로 (a, b) 를 모두 고르면?', f'({M(a1)}, {M(b1)}), ({M(a2)}, {M(b2)})', [f'({M(a1)}, {M(b1)}) 뿐', f'({M(a2)}, {M(b2)}) 뿐'], 'a > 0 · a < 0 두 경우 모두', f'그러므로 (a, b) = ({M(a1)}, {M(b1)}), ({M(a2)}, {M(b2)})')]
R05 = [r05(0, 2, 1, 7), r05(1, 2, 3, 8), r05(0, 3, -2, 4), r05(1, 4, 0, 6), r05(-1, 1, 2, 6), r05(2, 4, 1, 5), r05(0, 1, -3, 2)]


# ───────── 06 · 중단원 03 (합성 값 · 식 · g = mx² + n) ─────────
def r06(a, m, n, u, w):
    F = lambda x: x + a; G = lambda x: m * x * x + n
    v1, v2 = G(F(u)), G(G(w)); fg = quad(m, n + a) if n + a else quad(m, 0)
    for x in range(-3, 4): assert F(G(x)) == m * x * x + (n + a)
    head = f'06 두 함수 f(x) = {lin(1, a)}, g(x) = {quad(m, n)} 에 대하여 '
    ok('06', f'{v1} · {v2} · {fg}', f'g(f({u})) · g(g({w})) · f(g(x))')
    return [chq(head + f'(g∘f)({u}) 의 값은?', M(v1), [M(F(G(u))), M(G(u)), M(F(u)), M(v1 + 1)], f'g(f({u})) = g({M(F(u))}) = {M(v1)}'),
            chq(head + f'(g∘g)({w}) 의 값은?', M(v2), [M(G(w)), M(F(F(w))), M(G(w) ** 2), M(v2 - 1)], f'g(g({w})) = g({M(G(w))}) = {M(v2)}'),
            chq(head + '(f∘g)(x) 는?', f'{fg}', [quad(m, n - a) if n - a else quad(m, 0), lin(m, n + a), quad(-m, n + a)], f'f(g(x)) = ({quad(m, n)}) {"+" if a > 0 else "−"} {abs(a)} = {fg}')]
R06 = [r06(2, 2, -3, 0, 1), r06(-1, 1, 2, 3, 1), r06(3, 2, -1, -2, 1), r06(-2, -1, 4, 1, 2), r06(1, 3, -2, -1, 1), r06(4, 1, -3, -3, 2), r06(-3, 2, 1, 1, 0)]
assert [R06[0][i]['ch'][int(R06[0][i]['a'])] for i in range(3)] == ['5', '−1', '2x² − 1']


# ───────── 07 · 중단원 06 (구간을 나눈 함수의 합성 · 숫자) ─────────
def r07(k, up, lo, gs, t):
    """up = (p, q) x ≥ k 일 때 px + q · lo = (r, s) x < k 일 때 rx + s · gs = (b, c) g = x² + bx + c"""
    f = lambda x: up[0] * x + up[1] if x >= k else lo[0] * x + lo[1]; g = lambda x: x * x + gs[0] * x + gs[1]
    v = f(g(t)); gt = g(t)
    gname = 'x²' + (f' + {gs[0]}x' if gs[0] > 0 else f' − {-gs[0]}x' if gs[0] < 0 else '').replace(' 1x', ' x') + (f' + {gs[1]}' if gs[1] > 0 else f' − {-gs[1]}' if gs[1] < 0 else '')
    q = f'07 두 함수 f(x) = {lin(*up)} (x ≥ {M(k)}), {lin(*lo)} (x < {M(k)}) 와 g(x) = {gname} 에 대하여 (f∘g)({M(t)}) 의 값은?'
    ok('07', str(v), f'g({t}) = {gt} → {"x ≥" if gt >= k else "x <"} {k} 쪽 식')
    return [numq(q, v, f'g({M(t)}) = {M(gt)} → {M(gt)} {"≥" if gt >= k else "<"} {M(k)} 이므로 f({M(gt)}) = {M(v)}')]
R07 = [r07(3, (1, -2), (3, 1), (2, 0), 1), r07(2, (1, 1), (2, -1), (-3, 0), -1), r07(1, (1, 3), (-1, 0), (1, 0), 0), r07(4, (1, -1), (2, 0), (-2, 0), -2),
       r07(0, (2, 1), (1, -3), (-4, 0), 2), r07(5, (1, 0), (1, 2), (1, 0), -3), r07(3, (1, 4), (2, -2), (-1, 0), 3)]
assert R07[0][0]['a'] == '1'


# ───────── 08 · 중단원 07 ((f∘h)(x) = g(x) · ⚔ 5단계) ─────────
def r08(p, q, r, s):
    A, B = Fr(r, p), Fr(s - q, p); assert A.denominator == B.denominator == 1
    for x in range(-5, 6): assert p * (A * x + B) + q == r * x + s
    ph = f'{p}h(x)'; lhs = f'{ph} {"+" if q > 0 else "−"} {abs(q)}'
    Q = f'08 두 함수 f(x) = {lin(p, q)}, g(x) = {lin(r, s)} 에 대하여 (f∘h)(x) = g(x) 를 만족시키는 h(x) 는?\n'
    ok('08', f'h(x) = {lin(A, B)}', f'{p}·h(x) {q:+d} = {r}x {s:+d} (x = −5 ~ 5)')
    return [chq(Q + '① (f∘h)(x) 를 바꿔 쓰면?', 'f(h(x))', ['h(f(x))', 'f(x) × h(x)'], '오른쪽 h 먼저, 다음 f', '(f∘h)(x) = f(h(x))'),
            chq(Q + '② f(h(x)) 를 h(x) 로 나타내면?', lhs, [f'{lin(p, q)} + h(x)', f'h({lin(p, q)})'], 'f 의 x 자리에 h(x) 를 통째로', f'f(h(x)) = {lhs}'),
            chq(Q + '③ 세울 수 있는 식은?', f'{lhs} = {lin(r, s)}', [f'{lhs} = {lin(p, q)}', f'h(x) = {lin(r, s)}'], '(f∘h)(x) = g(x)', f'{lhs} = {lin(r, s)}'),
            chq(Q + f'④ {ph} 는?', f'{ph} = {lin(r, s - q)}', [f'{ph} = {lin(r, s + q)}', f'{ph} = {lin(r, s)}'], f'{M(q)} 을 옮긴다', f'{ph} = {lin(r, s - q)}'),
            chq(Q + '👑 그러므로 h(x) 는?', f'h(x) = {lin(A, B)}', [f'h(x) = {lin(r, s - q)}', f'h(x) = {lin(A, -B)}', f'h(x) = {lin(-A, B)}'], f'양변을 {p} 로 나누면 h(x) = {lin(A, B)}', f'그러므로 h(x) = {lin(A, B)}')]
R08 = [r08(3, 2, 6, -7), r08(2, 1, 4, 9), r08(3, -1, -9, 5), r08(4, 3, -8, 7), r08(2, -5, 6, 1), r08(5, 1, 10, -9), r08(3, 4, 3, -2)]


# ───────── 09 · 문제 3 ((g∘f)⁻¹ = f⁻¹∘g⁻¹) ─────────
def r09(k, m, t):
    x = Fr(t - m, k); assert x.denominator == 1 and k * x + m == t
    Q = f'09 (g∘f)(x) = {lin(k, m)} 일 때, (f⁻¹∘g⁻¹)({M(t)}) 의 값은?\n'
    ok('09', str(x), f'{k}x {m:+d} = {t}')
    return [chq(Q + '① f⁻¹∘g⁻¹ 와 같은 것은?', '(g∘f)⁻¹', ['(f∘g)⁻¹', 'g∘f'], '두 함수의 역함수가 있으면 (g∘f)⁻¹ = f⁻¹∘g⁻¹', '(f⁻¹∘g⁻¹) = (g∘f)⁻¹'),
            numq(Q + f'② (g∘f)⁻¹({M(t)}) = k 이면 (g∘f)(k) = {M(t)} · k 의 값은?', x, f'{lin(k, m).replace("x", "k")} = {M(t)} → k = {M(x)}', f'(g∘f)⁻¹({M(t)}) = {M(x)}')]
R09 = [r09(3, 1, 7), r09(4, -3, 9), r09(5, 2, -8), r09(2, 7, 1), r09(3, -4, 5), r09(-2, 1, -5), r09(6, 1, 13)]


# ───────── 10 · 중단원 04 (역함수 값 · 식) ─────────
def r10(p, q, c):
    A, B = Fr(1, p), Fr(-q, p); x = A * c + B; assert x.denominator == 1 and p * x + q == c
    for t in range(-4, 5): assert A * (p * t + q) + B == t
    head = f'10 함수 f(x) = {lin(p, q)} 에 대하여 '
    ok('10', f'{x} · y = {lin(A, B)}', 'x = (y − q)/p · f⁻¹(f(x)) = x')
    return [chq(head + f'f⁻¹({M(c)}) 의 값은?', fs(x), [fs(p * c + q), fs(-x), fs(x + 1), fs(Fr(c, p))], f'f(k) = {M(c)} 인 k → {lin(p, q).replace("x", "k")} = {M(c)} → k = {fs(x)}'),
            chq(head + 'y = f⁻¹(x) 는?', f'y = {lin(A, B)}', [f'y = {lin(A, -B)}', f'y = {lin(-A, B)}', f'y = {lin(p, -q)}'], f'x 에 대하여 풀고 x 와 y 를 바꾸면 y = {lin(A, B)}')]
R10 = [r10(2, -8, 4), r10(3, 6, 0), r10(5, -5, 10), r10(2, 3, -1), r10(4, -4, 8), r10(3, -9, 3), r10(6, 2, -10)]


# ───────── 11 · 문제 5 (화씨 ↔ 섭씨) ─────────
def r11(F):
    C = Fr(5, 9) * (F - 32); assert C.denominator == 1 and Fr(9, 5) * C + 32 == F
    Q = f'11 섭씨온도 x °C 를 화씨온도 y °F 로 바꾸는 함수는 y = (9/5)x + 32 이다.\n'
    ok('11', f'{C} °C', f'(5/9)({F} − 32)')
    return [chq(Q + '① 이 함수의 역함수는?', 'y = (5/9)(x − 32)', ['y = (9/5)(x − 32)', 'y = (5/9)x − 32'], 'x = (5/9)(y − 32) → x 와 y 를 바꾼다'),
            numq(Q + f'② 화씨온도 {F} °F 는 섭씨온도로 몇 °C 일까?', C, f'(5/9)({F} − 32) = {M(C)}')]
R11 = [r11(F) for F in (68, 50, 86, 104, 59, 41, 77)]


# ───────── 12 · 중단원 08 (서술형 · ⚔ 5단계) ─────────
def r12(u, v, w, z, t):
    a = Fr(w - v, z - u); b = v - a * u; assert a.denominator == b.denominator == 1; a, b = int(a), int(b)
    F = lambda x: a * x + b; assert F(u) == v and F(z) == w and t != z
    e = lambda x, y: f'{("" if x == 1 else "−" if x == -1 else M(x))}a + b = {M(y)}' if x else f'b = {M(y)}'
    Q = f'12 함수 f(x) = ax + b 가 f({M(u)}) = {M(v)} 과 f⁻¹({M(w)}) = {M(z)} 를 만족시킬 때, f({M(t)}) 의 값을 구하시오. (단, a, b 는 상수)\n'
    ok('12', f'{F(t)}', f'a = {a}, b = {b}')
    return [chq(Q + f'① f⁻¹({M(w)}) = {M(z)} 의 뜻은?', f'f({M(z)}) = {M(w)}', [f'f({M(w)}) = {M(z)}', f'f({M(z)}) = {M(-w)}'], 'f⁻¹(b) = a ⇔ f(a) = b', f'f⁻¹({M(w)}) = {M(z)} 이므로 f({M(z)}) = {M(w)}'),
            chq(Q + f'② f({M(u)}) = {M(v)} 을 식으로 쓰면?', e(u, v), [e(-u, v), e(u, -v), e(v, u)], f'x = {M(u)} 대입', e(u, v)),
            chq(Q + f'③ f({M(z)}) = {M(w)} 을 식으로 쓰면?', e(z, w), [e(w, z), e(z, -w), e(-z, w)], f'x = {M(z)} 대입', e(z, w)),
            chq(Q + '④ 두 식을 풀면?', f'a = {M(a)}, b = {M(b)}', [f'a = {M(-a)}, b = {M(b)}', f'a = {M(a)}, b = {M(-b)}', f'a = {M(b)}, b = {M(a)}'], '두 식을 빼서 a → b', f'a = {M(a)}, b = {M(b)}'),
            numq(Q + f'👑 그러므로 f({M(t)}) 는?', F(t), f'f(x) = {lin(a, b)} → f({M(t)}) = {M(F(t))}', f'그러므로 f({M(t)}) = {M(F(t))}')]
R12 = [r12(2, 3, -1, 4, -3), r12(1, 4, 10, 3, -2), r12(-1, 5, -1, 2, 4), r12(0, -2, 4, 2, 5), r12(3, 1, 7, 1, -1), r12(2, -3, 9, 6, 0), r12(-2, 8, 2, 1, 3)]
assert R12[0][-1]['a'] == '13'


# ───────── 13 · 중단원 09 (그래프 보고 · 수로 바꿈) ─────────
def r13(a, b, p, q, r):
    f = lambda x: a * x + b
    finv = lambda y: Fr(y - b, a)
    v1 = f(f(p)); v2 = finv(q); v3 = finv(finv(r))
    assert all(Fr(x).denominator == 1 for x in (v1, v2, v3))
    for x in range(-1, 6):
        if -2 <= f(x) <= 7: pass
    g = f'graph:y={a}x{b:+d}; --y=x @-2,6,-2,7'
    G = f'[[{g}]]'
    Q = f'13 함수 y = f(x) 의 그래프(격자 한 칸 = 1)와 점선 y = x 가 그림과 같다. {G}\n'
    ok('13', f'{v1} · {v2} · {v3}', f'f(x) = {a}x {b:+d} 로 셈 (그래프 위 격자점)')
    return [chq(Q + f'① (f∘f)({p}) 의 값은?', M(v1), [M(f(p)), M(v1 + 1), M(p)], f'f({p}) = {M(f(p))} → f({M(f(p))}) = {M(v1)}'),
            chq(Q + f'② f⁻¹({q}) 의 값은?', fs(v2), [M(f(q)), fs(v2 + 1), str(q)], f'f(x) = {q} 인 x = {fs(v2)} (그래프에서 y = {q} 인 점)'),
            chq(Q + f'③ (f∘f)⁻¹({r}) 의 값은?', fs(v3), [fs(finv(r)), M(f(f(r))), fs(v3 + 1)], f'(f∘f)(x) = {r} → f(x) = {fs(finv(r))} → x = {fs(v3)}')]
R13 = [r13(2, -3, 2, 5, 3), r13(2, -4, 3, 2, 0), r13(2, -2, 1, 4, 6), r13(2, -1, 2, 3, 5), r13(2, 0, 1, 6, 4), r13(2, 1, 1, 5, 3), r13(2, -3, 2, 1, -1)]  # 값이 모두 정수 · 창(−2 ~ 6) 안 · 전수 탐색으로 고름
assert [R13[0][i]['ch'][int(R13[0][i]['a'])] for i in range(3)] == ['−1', '4', '3']


# ───────── 👑 14 · 중단원 11 (발전 · 경우 나누기 · ⚔ 6단계) ─────────
def sol14(u, t, p, q, T):
    """f = x + a · g = x² (x ≥ a), px + q (x < a) · (g∘f)(u) + (f∘g)(t) = T → 모든 실수 a (판별식 완전제곱 확인 · 경우별)"""
    c1, c2 = [], []
    for case, c in (('le', t * t), ('gt', p * t + q)):
        B = 2 * u + 1; C = u * u + c - T; D = B * B - 4 * C
        if D < 0: continue
        s = math.isqrt(D); assert s * s == D
        for rr in sorted({Fr(-B + s, 2), Fr(-B - s, 2)}):
            assert rr.denominator == 1; rr = int(rr)
            if case == 'le' and rr <= t: c1.append(rr)
            if case == 'gt' and rr > t: c2.append(rr)
    # 따로 셈: 정수 전수 조사로 같은 답
    def tot(a):
        f = lambda x: x + a; g = lambda x: x * x if x >= a else p * x + q
        return g(f(u)) + f(g(t))
    assert sorted(c1 + c2) == [a for a in range(-60, 61) if tot(a) == T]
    return c1, c2
def r14(u, t, p, q, T):
    c1, c2 = sol14(u, t, p, q, T); assert c1 and c2
    gl = lin(p, q)
    Q = f'14 두 함수 f(x) = x + a, g(x) = x² (x ≥ a), {gl} (x < a) 에 대하여 (g∘f)({u}) + (f∘g)({t}) = {T} 을 만족시키는 모든 실수 a 의 값의 합은?\n'
    L = lambda xs: ', '.join(M(x) for x in xs)
    ok('👑14', f'{sum(c1 + c2)} (a = {L(c1 + c2)})', f'a ≤ {t}: {L(c1)} · a > {t}: {L(c2)} · 정수 −60 ~ 60 전수 조사와 같음')
    return [chq(Q + f'① (g∘f)({u}) = g({u} + a) 이고 {u} + a ≥ a 이므로?', f'({u} + a)²', [f'{gl.replace("x", f"({u} + a)")}', f'{u * u} + a'], f'{u} + a 는 늘 a 이상 → 위 식 x²', f'(g∘f)({u}) = ({u} + a)²'),
            chq(Q + f'② a ≤ {t} 일 때 (f∘g)({t}) 는?', f'{t * t} + a', [f'{M(p * t + q)} + a', f'{t * t}'], f'{t} ≥ a → g({t}) = {t * t} → f({t * t}) = {t * t} + a', f'a ≤ {t} 이면 (f∘g)({t}) = {t * t} + a'),
            chq(Q + f'③ a > {t} 일 때 (f∘g)({t}) 는?', f'{M(p * t + q)} + a', [f'{t * t} + a', f'{M(p * t + q)}'], f'{t} < a → g({t}) = {M(p * t + q)} → f = {M(p * t + q)} + a', f'a > {t} 이면 (f∘g)({t}) = {M(p * t + q)} + a'),
            chq(Q + f'④ a ≤ {t} 에서 맞는 a 를 모두 고르면?', L(c1), [L(c1 + [x for x in [t + 1] if x not in c1]), L([-x for x in c1])], f'({u} + a)² + {t * t} + a = {T} 의 해 중 a ≤ {t}', f'a ≤ {t} 에서 a = {L(c1)}'),
            chq(Q + f'⑤ a > {t} 에서 맞는 a 를 모두 고르면?', L(c2), [L(c2 + [-c2[0] - (2 * u + 1)]), L([x - 1 for x in c2])], f'({u} + a)² + {M(p * t + q)} + a = {T} 의 해 중 a > {t} (다른 해는 버림)', f'a > {t} 에서 a = {L(c2)}'),
            numq(Q + '👑 그러므로 모든 실수 a 의 값의 합은?', sum(c1 + c2), f'{L(c1 + c2)} → 합 {M(sum(c1 + c2))}', f'그러므로 a = {L(c1 + c2)} 이고 합은 {M(sum(c1 + c2))}')]
P14 = [(2, 4, 2, -6, 56), (1, 4, 2, -4, 45), (3, 5, 2, -3, 94), (1, 3, 1, -4, 28), (1, 2, 2, -8, 15), (3, 4, 1, -4, 69), (1, 5, 2, -3, 96)]  # 두 경우 모두 해가 있는 판만 (전수 탐색으로 고름 · 교과서 (1, 4, 2, −6, 57) 은 뺌)
R14 = []
for prm in P14:
    c1, c2 = sol14(*prm)
    if c1 and c2: R14.append(r14(*prm))
assert len(R14) == 7 and R14[0][-1]['a'] == '0'


# ───────── 층 조립 ─────────
S = lambda n, h=None: f'castle{n}:{0}' + (f'@h{h}' if h else '')
ROOMS = [('q01', 14, '01 함수인 것 찾기', 'castle1:0@h160', R01, {}),
         ('q02', 14, '02 서로 같은 함수', 'castle1:1@h160', R02, {'chain': True, 'note': 'f = g 의 뜻 → 두 식 → 빼서 b → a', 'card': '⚔ 소레이드 · 5단계'}),
         ('q03', 15, '03 일대일대응 · 항등 · 상수', 'castle1:2@h160', R03, {}),
         ('q04', 15, '04 구간을 나눈 함수의 그래프', 'castle1:3@h160', R04, {}),
         ('q05', 15, '05 일대일대응인 (a, b) (서술형)', 'castle2:0@h160', R05, {'chain': True, 'photo': True, 'note': '끝점끼리 대응 → a > 0 · a < 0 두 경우 → (a, b) 모두', 'card': '⚔ 소레이드 · 5단계 · 📷 서술형'}),
         ('q06', 16, '06 합성함수의 값과 식', 'castle2:1@h160', R06, {}),
         ('q07', 16, '07 구간 함수의 합성', 'castle2:2@h160', R07, {}),
         ('q08', 16, '08 (f∘h)(x) = g(x)', 'castle2:3@h160', R08, {'chain': True, 'note': 'f(h(x)) → 식 세우기 → 이항 → h(x)', 'card': '⚔ 소레이드 · 5단계'}),
         ('q09', 17, '09 합성함수의 역함수', 'castle2:4@h160', R09, {}),
         ('q10', 17, '10 역함수의 값과 식', 'castle3:0@h160', R10, {}),
         ('q11', 17, '11 화씨 ↔ 섭씨', 'castle3:1@h160', R11, {}),
         ('q12', 17, '12 f⁻¹ 조건으로 f(값) (서술형)', 'castle3:2@h160', R12, {'chain': True, 'photo': True, 'note': 'f⁻¹ 의 뜻 → 식 두 개 → 연립 → f(값)', 'card': '⚔ 소레이드 · 5단계 · 📷 서술형'}),
         ('q13', 17, '13 그래프와 y = x', 'castle3:3@h160', R13, {}),
         ('q14', 17, '👑 14 경우를 나누는 합성', 'castleboss2:0', R14, {'boss': True, 'chain': True, 'note': '(g∘f) 는 위 식 → (f∘g) 는 a ≤ t · a > t 나눠서 → 해 모으기 → 합', 'card': '⚔ 소레이드 · 6단계 · 👑 보스'})]
pack = {'kind': 'castle', 'id': 'eval-4', 'floor': 4, 'title': '함수 중단원', 'unit': '공통수학2 Ⅲ-1 함수 · 평가4 (교과서 118~119쪽 · 변경 제안 v1)', 'theme': '08-crypt',
        'goal': '함수 단원 개념을 스스로 점검한다 · 틀린 문항으로 보충할 부분을 찾는다', 'bossPct': 60, 'after': 17, 'rooms': []}
for rid, no, title, sp, vers, extra in ROOMS:
    assert len(vers) == 7, rid
    sig = [it['type'] for it in vers[0]]
    assert all([it['type'] for it in v] == sig for v in vers), rid  # 판마다 꼴 같음
    qs = [json.dumps(v, ensure_ascii=False) for v in vers]; assert len(set(qs)) == 7, rid  # 판 7개 모두 다름
    for v in vers:
        for it in v:
            it['ref'] = rid[1:]
            if it['type'] == 'choice': assert 0 <= int(it['a']) < len(it['ch']) and len(set(it['ch'])) == len(it['ch'])
    pack['rooms'].append({'id': rid, 'no': no, 'title': title, 'sprite': sp, **extra, 'vers': vers})
assert sum(1 for r in pack['rooms'] if r.get('boss')) == 1
import re
def nice(t):  # 화면 글자의 빼기 = − (그림 글 graph: · [[graph:…]] 안은 그대로)
    if t.startswith('graph:'): return t
    parts = re.split(r'(\[\[graph:[^\]]*\]\])', t)
    return ''.join(x if x.startswith('[[graph:') else re.sub(r'(^|[\s(\[{,=])-(?=\d)', lambda m: m.group(1) + '−', x) for x in parts)
for r in pack['rooms']:
    for v in r['vers']:
        for it in v:
            for k in ('q', 'sol', 'say'):
                if k in it: it[k] = nice(it[k])
            if it.get('ch'): it['ch'] = [nice(c) for c in it['ch']]
            if it['type'] == 'choice': assert len(set(it['ch'])) == len(it['ch'])
json.dump(pack, open(OUT, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('| 방 | 정답 | 계산 | 확인 |\n|---|---|---|---|')
for n, a, c in CHECK: print(f'| {n} | {a} | {c} | ✅ |')
print(f'성채 4층 팩 검사 통과 · 방 {len(pack["rooms"])} · 판 7 · 검산 {len(CHECK)}줄')
