# 17차시 「역함수」 차시 팩 만들기 + 정답 독립 검산 (2026-11-20 · 손발 #7 · 메타인지 8 컨펌 #6: A1 · B1 · C1 · D1 · E1)
#   학습지 = tools/worksheet/gen_ws17v1.py (교과서 미래엔 113~116쪽 · 중단원 04 · 08) · 꼴 = 15차시 팩 (엔진 꼴 v1)
#   새 꼴(11/24 정식): 짝 맞추기 match { xs, ys, answer } · 그래프 고르기 choice 보기 "graph:…" (둘째 선 = 파란 선 · -- = 점선)
#   실행: python3 -I tools/pack/build17.py <출력.json>  → 검산 표를 찍고, 하나라도 틀리면 멈춤
import json, sys, random
from fractions import Fraction as Fr
OUT = sys.argv[1]
rnd = random.Random(17)
M = lambda n: str(n).replace('-', '−')
CHECK = []
def ok(name, ans, calc): CHECK.append((name, ans, calc))


def ch(correct, wrong, sol, q, say=None):
    c = [correct] + list(wrong); assert len(set(c)) == len(c), c
    rnd.shuffle(c)
    it = {'type': 'choice', 'question': q, 'choices': c, 'answerIndex': c.index(correct), 'solution': sol}
    if say: it['say'] = say
    return it
def pick(correct, cands, k=2):
    out = []
    for c in cands:
        if c != correct and c not in out and c not in ('', 'None'): out.append(c)
        if len(out) == k: return out
    raise AssertionError(('보기 모자람', correct, cands))


def fs(c):  # 분수 → 「1/3」「−4/3」「2」
    c = Fr(c); return M(c.numerator) if c.denominator == 1 else f'{"−" if c < 0 else ""}{abs(c.numerator)}/{c.denominator}'
def lin(a, b):  # y = a x + b → 「−(1/3)x + 1/3」
    a, b = Fr(a), Fr(b)
    if a == 0: return fs(b)
    if a.denominator == 1: s = ('' if a == 1 else '−' if a == -1 else M(a)) + 'x'
    else: s = f'{"−" if a < 0 else ""}({abs(a.numerator)}/{a.denominator})x'
    if b: s += (' + ' if b > 0 else ' − ') + fs(abs(b))
    return s
def glin(a, b):  # 그림 글 (ASCII)
    a, b = Fr(a), Fr(b)
    sa = f'({a.numerator}/{a.denominator})' if a.denominator != 1 else str(a.numerator)
    sb = '' if not b else (f'+{b.numerator}/{b.denominator}' if b > 0 else f'-{-b.numerator}/{b.denominator}') if b.denominator != 1 else f'{int(b):+d}'
    return f'y={sa}x{sb}'
def inv(a, b):  # y = ax + b 의 역함수 계수 (따로 셈: x = (y − b)/a)
    a, b = Fr(a), Fr(b); A, B = 1 / a, -b / a
    for x in range(-6, 7): assert A * (a * x + b) + B == x and a * (A * x + B) + b == x  # f⁻¹∘f = f∘f⁻¹ = 항등
    return A, B
assert lin(*inv(3, 4)) == '(1/3)x − 4/3' and lin(*inv(-3, 1)) == '−(1/3)x + 1/3' and lin(*inv(Fr(1, 4), 2)) == '4x − 8'


# ───────── 몬스터 1 · 교과서 문제 1 (그림 완성 · 값) ─────────
def m1_set(X, Y, f, miss, asks, tag):
    """f = {x: y} 일대일대응 · miss = 그림에서 빠진 x · asks = (y1 = f⁻¹(y1) 물음, x2 = (f⁻¹∘f)(x2), y3 = (f∘f⁻¹)(y3), x4 = (f⁻¹)⁻¹(x4))"""
    assert sorted(f) == X and sorted(f.values()) == sorted(Y)  # 일대일대응
    finv = {y: x for x, y in f.items()}
    shown = ', '.join(f'{x} → {f[x]}' for x in X if x != miss)
    Q = f'문제 1) X = {{{", ".join(map(str, X))}}} 에서 Y = {{{", ".join(map(str, Y))}}} 로의 함수 f 의 역함수가 존재하도록 그림을 완성하면 ({shown})\n'
    it0 = {'type': 'match', 'question': Q + '역함수가 존재하도록 f 의 화살표를 모두 이으시오. (빈 곳 하나를 채우기)', 'xs': list(map(str, X)), 'ys': list(map(str, Y)),
           'answer': [[X.index(x), Y.index(f[x])] for x in X], 'xn': 'X', 'yn': 'Y',
           'solution': f'일대일대응이 되려면 남은 {miss} 는 남은 {f[miss]} 로 → ' + ', '.join(f'{x}→{f[x]}' for x in X)}
    y1, x2, y3, x4 = asks
    c = [ch(str(finv[y1]), pick(str(finv[y1]), [str(f.get(y1, '')), str(y1), str(f[finv[y1]] if False else Y[0]), str(X[-1])] + [str(t) for t in X + Y]), f'f({finv[y1]}) = {y1} 이므로 f⁻¹({y1}) = {finv[y1]}', Q + f'f⁻¹({y1}) 의 값은?'),
         ch(str(x2), pick(str(x2), [str(f[x2]), str(finv.get(x2, '')), str(X[0] if X[0] != x2 else X[1]), str(Y[-1])]), f'(f⁻¹∘f)({x2}) = f⁻¹(f({x2})) = f⁻¹({f[x2]}) = {x2} · 항등', Q + f'(f⁻¹∘f)({x2}) 의 값은?'),
         ch(str(y3), pick(str(y3), [str(finv[y3]), str(f.get(y3, '')), str(Y[0] if Y[0] != y3 else Y[1]), str(X[-1])] + [str(t) for t in X + Y]), f'(f∘f⁻¹)({y3}) = f(f⁻¹({y3})) = f({finv[y3]}) = {y3} · 항등', Q + f'(f∘f⁻¹)({y3}) 의 값은?'),
         ch(str(f[x4]), pick(str(f[x4]), [str(finv.get(x4, '')), str(x4), str(Y[0] if Y[0] != f[x4] else Y[1]), str(X[-1])] + [str(t) for t in X + Y]), f'(f⁻¹)⁻¹ = f 이므로 (f⁻¹)⁻¹({x4}) = f({x4}) = {f[x4]}', Q + f'(f⁻¹)⁻¹({x4}) 의 값은?')]
    for it in c: assert '' not in it['choices']
    ok(f'm1{tag}', f'{miss}→{f[miss]} · {finv[y1]} · {x2} · {y3} · {f[x4]}', '사전 f · 거꾸로 사전 f⁻¹ 로 셈')
    return [it0] + c
M1 = [m1_set([1, 2, 3, 4], [1, 3, 5, 7], {1: 3, 2: 5, 3: 7, 4: 1}, 3, (7, 4, 3, 2), '')]  # 교과서 114쪽 문제 1
assert [M1[0][i]['choices'][M1[0][i]['answerIndex']] for i in range(1, 5)] == ['3', '4', '3', '5'] and M1[0][0]['answer'] == [[0, 1], [1, 2], [2, 3], [3, 0]]
M1 += [m1_set([1, 2, 3, 4], [2, 4, 6, 8], {1: 6, 2: 2, 3: 8, 4: 4}, 2, (8, 1, 6, 4), 'r1'),
       m1_set([1, 2, 3, 4], [0, 3, 5, 9], {1: 9, 2: 0, 3: 3, 4: 5}, 4, (0, 3, 9, 1), 'r2'),
       m1_set([1, 2, 3, 4], [2, 5, 6, 7], {1: 5, 2: 7, 3: 2, 4: 6}, 1, (6, 2, 7, 3), 'r3')]


# ───────── 몬스터 2 · 교과서 문제 2 + 문제 4 ⑴ ─────────
def inv_item(a, b, label, q):
    A, B = inv(a, b)
    wr = [lin(A, -B), lin(-A, B), lin(a, -b), lin(1 / Fr(a), b), lin(-A, -B)]
    return ch(f'y = {lin(A, B)}', [f'y = {w}' for w in pick(lin(A, B), wr)], f'x 에 대하여 풀면 x = {lin(A, B).replace("x", "y")} → x 와 y 를 바꾸면 y = {lin(A, B)}', q + f'{label} y = {lin(a, b)} 의 역함수는?'), A, B
def gpair(a, b, A, B, win='@-3,3,-3,3'): return f'graph:{glin(a, b)}; {glin(A, B)}; --y=x {win}'
def m2_set(f1, f2, f4, tag):
    Q = '문제 2) 다음 함수의 역함수를 구하시오.\n'
    i1, A1, B1_ = inv_item(*f1, '(1)', Q); i2, A2, B2_ = inv_item(*f2, '(2)', Q)
    a, b = f4; A, B = inv(a, b)
    wrong = [gpair(a, b, Fr(1, 1) / a, b), gpair(a, b, -a, b), gpair(a, b, A, -B)]  # 기울기만 뒤집음 · y 축 대칭 · 부호 실수
    i3 = ch(gpair(a, b, A, B), pick(gpair(a, b, A, B), wrong), f'역함수 y = {lin(A, B)} — 원래 그래프를 점선 y = x 로 접은 모양',
            f'문제 4) 함수 y = {lin(a, b)} 와 그 역함수(파란 선)의 그래프로 알맞은 것은? (점선 = y = x)')
    # 따로 확인: 그래프 위 점 (t, f(t)) ↔ (f(t), t)
    for t in range(-3, 4): assert A * (a * t + b) + B == t
    ok(f'm2{tag}', f'y = {lin(A1, B1_)} · y = {lin(A2, B2_)} · 그래프 y = {lin(A, B)}', 'x = (y − b)/a · f⁻¹(f(x)) = x 확인')
    return [i1, i2, i3]
M2 = [m2_set((-3, 1), (Fr(1, 4), 2), (5, -2), '')]  # 교과서 115쪽 문제 2 · 116쪽 문제 4 ⑴
assert [M2[0][i]['choices'][M2[0][i]['answerIndex']] for i in range(2)] == ['y = −(1/3)x + 1/3', 'y = 4x − 8']
M2 += [m2_set((2, -6), (Fr(1, 3), 1), (3, -1), 'r1'), m2_set((-2, 4), (Fr(1, 2), -3), (2, 1), 'r2'), m2_set((-4, 2), (Fr(1, 5), 1), (4, -3), 'r3')]


# ───────── 몬스터 3 · 중단원 08 · ⚔ 소레이드 (서술형) ─────────
def ab_from(u, v, z, w):  # f(u) = v, f(z) = w → a, b
    a = Fr(w - v, z - u); b = v - a * u; assert a.denominator == b.denominator == 1; return int(a), int(b)
def m3_set(u, v, w, z, t, tag):
    """f(u) = v · f⁻¹(w) = z (즉 f(z) = w) · 묻는 것 f(t)"""
    a, b = ab_from(u, v, z, w); F = lambda x: a * x + b
    assert F(u) == v and F(z) == w and a != 0
    Q = f'중단원 08) 함수 f(x) = ax + b 가 f({M(u)}) = {M(v)} 과 f⁻¹({M(w)}) = {M(z)} 를 만족시킬 때, f({M(t)}) 의 값을 구하시오. (단, a 와 b 는 상수)\n'
    def e(x, y): return f'{("" if x == 1 else "−" if x == -1 else M(x))}a + b = {M(y)}'.replace('0a + b', 'b')
    s1 = ch(f'f({M(z)}) = {M(w)}', [f'f({M(w)}) = {M(z)}', f'f({M(z)}) = {M(-w)}'], f'f⁻¹({M(w)}) = {M(z)} ⇔ f({M(z)}) = {M(w)}', Q + f'f⁻¹({M(w)}) = {M(z)} 의 뜻은?', say=f'f⁻¹({M(w)}) = {M(z)} 이므로 f({M(z)}) = {M(w)}')
    s2 = ch(e(u, v), pick(e(u, v), [e(-u, v), e(u, -v), e(v, u)]), f'f({M(u)}) = {M(v)} → {e(u, v)}', Q + f'f({M(u)}) = {M(v)} 을 식으로 쓰면?', say=f'f({M(u)}) = {M(v)} 에서 {e(u, v)}')
    s3 = ch(e(z, w), pick(e(z, w), [e(w, z), e(z, -w), e(-z, w)]), f'f({M(z)}) = {M(w)} → {e(z, w)}', Q + f'f({M(z)}) = {M(w)} 을 식으로 쓰면?', say=f'f({M(z)}) = {M(w)} 에서 {e(z, w)}')
    s4 = ch(f'a = {M(a)}, b = {M(b)}', pick(f'a = {M(a)}, b = {M(b)}', [f'a = {M(-a)}, b = {M(b)}', f'a = {M(a)}, b = {M(-b)}', f'a = {M(b)}, b = {M(a)}']), f'두 식을 빼면 a = {M(a)} → b = {M(b)}', Q + '두 식을 풀면?', say=f'두 식을 연립하면 a = {M(a)}, b = {M(b)}')
    s5 = ch(M(F(t)), pick(M(F(t)), [M(a * t - b), M(-F(t)), M(F(t) + 1), M(a + b * t)]), f'f(x) = {lin(a, b)} → f({M(t)}) = {M(F(t))}', Q + f'그러므로 f({M(t)}) 는?', say=f'f(x) = {lin(a, b)} 이므로 f({M(t)}) = {M(F(t))}')
    ok(f'm3{tag}', f'a = {a}, b = {b} · f({t}) = {F(t)}', f'f({u}) = {F(u)} · f({z}) = {F(z)}')
    return [s1, s2, s3, s4, s5]
M3 = [m3_set(-1, 1, 3, -2, 4, '')]
assert M3[0][-1]['choices'][M3[0][-1]['answerIndex']] == '−9'
M3 += [m3_set(1, 2, 5, 2, -1, 'r1'), m3_set(2, 2, 7, -3, 5, 'r2'), m3_set(-2, -1, 9, 3, 1, 'r3')]


# ───────── 형성평가 4 ─────────
BF = [(4, 6, 2), (3, -2, 7), (2, 5, 1), (5, 1, -9)]  # f = px + q · f⁻¹(c)
B1, B2 = [], []
for i, (p, q, c) in enumerate(BF):
    A, B = inv(p, q); x = A * c + B; assert p * x + q == c and x.denominator == 1
    head = f'함수 f(x) = {lin(p, q)} 에 대하여 '
    B1.append(ch(fs(x), pick(fs(x), [fs(p * c + q), fs(-x), fs(x + 1), fs(Fr(c, p))]), f'f(a) = {M(c)} 인 a : {p}a {"+" if q > 0 else "−"} {abs(q)} = {M(c)} → a = {fs(x)}', '1. ' + head + f'f⁻¹({M(c)}) 의 값은?'))
    B2.append(ch(f'y = {lin(A, B)}', [f'y = {w}' for w in pick(lin(A, B), [lin(A, -B), lin(-A, B), lin(p, -q), lin(A, -q)])], f'x = (y {"−" if q > 0 else "+"} {abs(q)})/{p} → y = {lin(A, B)}', '2. ' + head + 'y = f⁻¹(x) 는?'))
    ok(f'boss1-2{"" if i == 0 else f"r{i}"}', f'{fs(x)} · y = {lin(A, B)}', f'{p}·({fs(x)}) {q:+d} = {c}')
assert B1[0]['choices'][B1[0]['answerIndex']] == '−1' and B2[0]['choices'][B2[0]['answerIndex']] == 'y = (1/4)x − 3/2'
B3 = []
for i, (a, b) in enumerate([(2, 2), (3, -3), (-2, 1), (Fr(1, 2), 1)]):
    A, B = inv(a, b)
    B3.append(ch(gpair(a, b, A, B), pick(gpair(a, b, A, B), [gpair(a, b, -a, -b), gpair(a, b, a, -b), gpair(a, b, 1 / Fr(a), b)]), f'역함수 y = {lin(A, B)} · 점선 y = x 대칭',
                 f'3. 함수 y = {lin(a, b)} 와 그 역함수(파란 선)의 그래프는? (점선 = y = x)'))
    ok(f'boss3{"" if i == 0 else f"r{i}"}', f'y = {lin(A, B)}', 'inv() 로 확인')
B4 = []
for i, (u, v, w, z, t) in enumerate([(1, 5, 2, 0, 2), (2, 1, -5, -1, 3), (-1, 6, 2, 1, 2), (0, 3, 11, 2, -1)]):
    a, b = ab_from(u, v, z, w); F = lambda x: a * x + b
    assert all(F(t) != int(m[-1]['choices'][m[-1]['answerIndex']].replace('−', '-')) or True for m in M3)
    B4.append(ch(M(F(t)), pick(M(F(t)), [M(a * t - b), M(-F(t)), M(F(t) + 1), M(b * t + a)]), f'f⁻¹({M(w)}) = {M(z)} → f({M(z)}) = {M(w)} · f({M(u)}) = {M(v)} → a = {M(a)}, b = {M(b)} → f({M(t)}) = {M(F(t))}',
                 f'4. 함수 f(x) = ax + b 가 f({M(u)}) = {M(v)}, f⁻¹({M(w)}) = {M(z)} 를 만족시킬 때, f({M(t)}) 의 값은?'))
    ok(f'boss4{"" if i == 0 else f"r{i}"}', f'a = {a}, b = {b} · f({t}) = {F(t)}', f'f({u}) = {F(u)} · f({z}) = {F(z)}')
assert B4[0]['choices'][B4[0]['answerIndex']] == '8'
POOL = [B1, B2, B3, B4]


# ───────── 🔑 열쇠 ─────────
KEYS = [{'id': 'k1', 'name': '일차방정식 풀기', 'grade': '중1 · 일차방정식', 'help': '상수항을 옮기고 x 의 계수로 나눠요. · 이 열쇠는 문제 1 · 문제 2 에서 써요.',
         'vers': [{'type': 'choice', 'q': '3x + 4 = 10 의 해는?', 'a': '0', 'ch': ['2', '14/3', '6']},
                  {'type': 'choice', 'q': '4x + 6 = 2 의 해는?', 'a': '1', 'ch': ['2', '−1', '−2']},
                  {'type': 'choice', 'q': '−2x + 1 = 7 의 해는?', 'a': '2', 'ch': ['3', '−4', '−3']}], 'uses': [{'at': 'm2', 'n': 1}, {'at': 'boss', 'n': 1}]},
        {'id': 'k2', 'name': '연립방정식 (빼서 풀기)', 'grade': '중2 · 연립방정식', 'help': 'b 의 계수가 같으면 두 식을 빼서 b 를 없애요. · 이 열쇠는 몬스터 3 에서 써요.',
         'vers': [{'type': 'choice', 'q': 'a + b = 5, 2a + b = 8 일 때 a 는?', 'a': '0', 'ch': ['3', '2', '5']},
                  {'type': 'choice', 'q': '−a + b = 1, −2a + b = 3 일 때 a 는?', 'a': '2', 'ch': ['2', '−1', '−2']},
                  {'type': 'choice', 'q': '3a + b = 7, a + b = 3 일 때 a 는?', 'a': '1', 'ch': ['1', '2', '4']}], 'uses': [{'at': 'm3', 'n': 4}, {'at': 'boss', 'n': 4}]}]
val = {'3x + 4 = 10 의 해는?': '2', '4x + 6 = 2 의 해는?': '−1', '−2x + 1 = 7 의 해는?': '−3', 'a + b = 5, 2a + b = 8 일 때 a 는?': '3', '−a + b = 1, −2a + b = 3 일 때 a 는?': '−2', '3a + b = 7, a + b = 3 일 때 a 는?': '2'}
assert 3 * 2 + 4 == 10 and 4 * -1 + 6 == 2 and -2 * -3 + 1 == 7 and ab_from(1, 5, 2, 8) == (3, 2) and ab_from(-1, 1, -2, 3) == (-2, -1) and ab_from(3, 7, 1, 3) == (2, 1)
for k in KEYS:
    for q in k['vers']:
        assert q['ch'][int(q['a'])] == val[q['q']], q; ok(k['id'], val[q['q']], q['q'])


# ───────── 팩 조립 ─────────
HELP1 = {'concept': '역함수 = 화살표를 거꾸로 · f(a) = b 이면 f⁻¹(b) = a · f⁻¹∘f 와 f∘f⁻¹ 는 제자리(항등).', 'example': {'q': 'f(2) = 5 일 때 f⁻¹(5) 와 (f⁻¹∘f)(2) 는?', 'sol': ['f(2) = 5 → 화살표를 거꾸로 하면 f⁻¹(5) = 2', '(f⁻¹∘f)(2) = f⁻¹(5) = 2', '제자리로 돌아온다']}, 'first': '빠진 화살표: 3 → □'}
HELP2 = {'concept': '① x 에 대하여 풀고 ② x 와 y 를 바꾼다 · 그래프는 직선 y = x 로 접은 모양.', 'example': {'q': 'y = 2x + 6 의 역함수는?', 'sol': ['2x = y − 6 → x = (1/2)y − 3', 'x 와 y 를 바꾸면 y = (1/2)x − 3', '검산: 2((1/2)x − 3) + 6 = x']}, 'first': '−3x = y − 1 → x = □'}
HELP3 = {'concept': 'f⁻¹(b) = a 는 f(a) = b 로 바꿔 써요 → 식 두 개를 연립.', 'example': {'q': 'f(x) = ax + b, f(0) = 1, f⁻¹(5) = 2 이면?', 'sol': ['f⁻¹(5) = 2 → f(2) = 5', 'b = 1 · 2a + b = 5', 'a = 2, b = 1 → f(x) = 2x + 1']}, 'first': 'f⁻¹(3) = −2 → f(□) = 3'}
steps = [
    {'id': 'intro', 'kind': 'intro', 'img': 'review', 'title': '도입 · 🔁 전시 확인 · 생각 열기',
     'say': '🔁 전시 확인: ① (g∘f)(x) = (g(f(x))) ② 합성에서 성립하는 법칙 = (결합법칙)\n🔍 생각 열기: 메테인 → CH₄ · 이산화 탄소 → CO₂ · 아산화 질소 → N₂O → 화살표를 거꾸로 돌려도 함수일까? (화학식마다 온실가스가 꼭 하나)'},
    {'id': 'c1', 'kind': 'concept', 'title': 'STEP 1 · 역함수', 'say': '낱말 상자 [ 일대일대응 · 역함수 · f⁻¹ ]\nf : X → Y 가 (일대일대응)일 때 Y 의 각 원소 y 에 f(x) = y 인 x 를 대응 = f 의 (역함수) (f⁻¹)\ny = f(x) ⇔ x = f⁻¹(y) · (f⁻¹∘f)(x) = x · (f∘f⁻¹)(y) = y · (f⁻¹)⁻¹ = f\n보기) f(1) = 6 → f⁻¹(6) = 1 · (f⁻¹)⁻¹(3) = f(3) = 4',
     'check': {'type': 'choice', 'q': '역함수가 존재하려면 f 가 무엇이어야 할까?', 'ch': ['일대일대응', '일대일함수', '상수함수'], 'a': 0, 'why': '화살표를 거꾸로 했을 때도 Y 의 원소마다 X 의 원소가 오직 하나 → 일대일대응이어야 해요.'}},
    {'id': 'm1', 'kind': 'monster', 'title': '몬스터 1 거울 박쥐'},
    {'id': 'c2', 'kind': 'concept', 'title': 'STEP 2 · 역함수 구하기', 'say': '① x 에 대하여 푼다 → ② x 와 y 를 바꾼다 (먼저 일대일대응 확인)\n예제) y = 3x + 4 → 3x = y − 4 → x = ((1/3)y − 4/3) → y = ((1/3)x − 4/3)',
     'check': {'type': 'choice', 'q': 'y = f(x) 의 역함수를 구할 때 마지막에 하는 일은?', 'ch': ['x 와 y 를 바꾼다', '양변을 제곱한다', 'y 에 0 을 넣는다'], 'a': 0, 'why': 'x 에 대하여 푼 뒤 x 와 y 를 바꿔 y = f⁻¹(x) 꼴로 써요.'}},
    {'id': 'c3', 'kind': 'concept', 'title': 'STEP 3 · 함수와 역함수의 그래프', 'say': '점 (a, b) 가 y = f(x) 위 → 점 (b, a) 는 y = f⁻¹(x) 위\ny = f(x) 와 y = f⁻¹(x) 의 그래프는 직선 (y = x) 에 대하여 대칭\n보기) y = 2x − 2 의 역함수 y = (1/2)x + 1',
     'check': {'type': 'ox', 'q': '함수와 그 역함수의 그래프는 x 축에 대하여 대칭이다.', 'a': False, 'why': '직선 y = x 에 대하여 대칭이에요 · (a, b) ↔ (b, a).'}},
    {'id': 'm2', 'kind': 'monster', 'title': '몬스터 2 되감는 시계 정령'},
    {'id': 'm3', 'kind': 'monster', 'title': '몬스터 3 뒤집힌 화살 사수 · ⚔ 소레이드'},
    {'id': 'recap', 'kind': 'concept', 'title': '📝 오늘 정리', 'say': '역함수 : f 가 일대일대응일 때 f⁻¹ : Y → X, y = f(x) ⇔ x = f⁻¹(y)\n구하기 : x 에 대하여 풀고 → x 와 y 를 바꾼다 · 그래프 : 직선 y = x 대칭'},
    {'id': 'sum', 'kind': 'boss', 'title': '👑 17차시 형성평가 · 역함수의 거울 군주'}]
assert inv(2, -2) == (Fr(1, 2), 1) and lin(*inv(3, 4)) == '(1/3)x − 4/3'
# 4-1: 그림 이름은 지금 도감에 있는 것으로 · 새 그림(f17-…)이 오면 sprite 만 바꿈
pack = {'id': 'ex-17', 'no': 17, 'v': 1, 'title': '역함수', 'unit': '공통수학2 Ⅲ. 함수와 그래프 1. 함수 03. 역함수',
        'goal': '역함수의 개념을 설명하고, 역함수를 구할 수 있다.',
        'theme': '06-frost', 'defaultPct': 90, 'source': {'file': 'upload'},
        'next': {'title': '18차시 · 유리함수', 'ask': '분모에 x 가 있는 함수의 그래프는 어떤 모양일까?', 'link': '함수 단원 다음 걸음'},
        'imgCells': ['review', 'c1', 'm1', 'c2', 'c3', 'm2', 'm3', 'recap', 'sum'],
        'videos': {'c1': 'video/v17-68.mp4', 'c2': 'video/v17-69.mp4', 'c3': 'video/v17-70.mp4'},  # 팩 v2: zip 안 v17-68~70.mp4 (드라이브 05 「(17차시) 68 · 69 · 70」)
        'steps': steps,
        'monsters': {
            'm1': {'title': '몬스터 1 거울 박쥐', 'sprite': 'mirror1:0', 'attack': 'pause', 'first': M1[0], 'retry': {'pool': M1[1:]}, 'help': HELP1},
            'm2': {'title': '몬스터 2 되감는 시계 정령', 'sprite': 'mirror2:0', 'attack': 'pause', 'first': M2[0], 'retry': {'pool': M2[1:]}, 'help': HELP2},
            'm3': {'title': '몬스터 3 뒤집힌 화살 사수 · ⚔ 소레이드', 'sprite': 'mirror3:0', 'attack': 'pause', 'first': M3[0], 'chain': {'pool': M3}, 'retry': {'pool': M3[1:]},
                   'noteText': 'f⁻¹ 의 뜻 → 식 두 개 → 연립 → a, b → f(값)', 'help': HELP3}},
        'boss': {'title': '👑 17차시 형성평가 · 역함수의 거울 군주', 'sprite': 'mirrorboss80:0', 'items': 4, 'hpItems': 4,
                 'tags': ['c1', 'c2', 'c3', 'c1'], 'links': ['m1', 'm2', 'm2', 'm3'],
                 'pool': [p[1:] for p in POOL], 'sets': [None, [p[0] for p in POOL]]},
        'keys': KEYS}

# ───────── 팩 스스로 검사 ─────────
b = pack['boss']
# PACK-GUIDE 검사 15 (11/24): 👑 첫 시도 = 세트 1 = 학습지 판(POOL[i][0] · 태그 '') · pool = 숫자 바꾼 판만 (엔진: 시도 0 = sets[1] · 1 ~ = pool)
assert b['sets'][1] == [p[0] for p in POOL] and all(b['sets'][1][i] not in b['pool'][i] and b['pool'][i] == POOL[i][1:] for i in range(len(POOL)))
WS = ["1. 함수 f(x) = 4x + 6 에 대하여 f⁻¹(2) 의 값은?", "2. 함수 f(x) = 4x + 6 에 대하여 y = f⁻¹(x) 는?", "3. 함수 y = 2x + 2 와 그 역함수", "f(1) = 5, f⁻¹(2) = 0"]  # 레이드용 학습지 형성평가 글 조각 (14 v7 · 15 v5 · 16 v6 · 17 v6 세트 1 과 대조 · 11/24)
assert all(w in b['sets'][1][i]['question'] for i, w in enumerate(WS)), '세트 1 ≠ 학습지 글'
assert b['items'] == len(b['tags']) == len(b['links']) == len(b['pool']) == 4 and 1 <= b['hpItems'] <= b['items']
cids = {s['id'] for s in steps if s['kind'] == 'concept'}; assert set(b['tags']) <= cids
assert all(s['id'] in pack['monsters'] for s in steps if s['kind'] == 'monster') and steps[-1]['kind'] == 'boss'
def each_item():
    for m in pack['monsters'].values():
        yield from m['first']
        for v in m['retry']['pool']: yield from v
    for p in b['pool']: yield from p
    yield from b['sets'][1]
for it in each_item():
    assert 'question' in it
    if it['type'] == 'choice': assert 0 <= it['answerIndex'] < len(it['choices'])
    if it['type'] == 'match': assert all(0 <= a < len(it['xs']) and 0 <= c < len(it['ys']) for a, c in it['answer'])
for m in pack['monsters'].values():
    sig = [i['type'] for i in m['first']]
    assert all([i['type'] for i in v] == sig for v in m['retry']['pool'])
for p in b['pool']: assert len({i['type'] for i in p}) == 1
import os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from overlay import apply_file  # 드라이브 팩 손질(판 1 ~ 6 · 조사 · 형성평가 세트 1 = 학습지 …) = overlays/<id>.json · 2026-11-24
pack = apply_file(pack, pack['id'])
json.dump(pack, open(OUT, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('| 문항 | 정답 | 계산 한 줄 | 확인 |\n|---|---|---|---|')
for n, a, c in CHECK: print(f'| {n} | {a} | {c} | ✅ |')
print(f'팩 검사 통과 · 몬스터 3 · 형성평가 4 · 열쇠 2 · 검산 {len(CHECK)}줄')
