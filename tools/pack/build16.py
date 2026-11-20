# 16차시 「합성함수」 차시 팩 만들기 + 정답 독립 검산 (2026-11-20 · 손발 #7 · 메타인지 8 컨펌 #5: A1 · B1 · C1 · D1 · E1)
#   학습지 = tools/worksheet/gen_ws16v1.py (교과서 미래엔 111~112쪽 · 중단원 03 · 07) · 꼴 = 14차시 팩 v3 (엔진 꼴 v1 · 새 꼴 없음)
#   실행: python3 -I tools/pack/build16.py <출력.json>  → 검산 표를 찍고, 하나라도 틀리면 멈춤
#   앱 검사: 베타 checkUpload + 모든 문항 정답 채점 (손발 #7 scratch 시험)
import json, sys, random
from fractions import Fraction as Fr
OUT = sys.argv[1]
rnd = random.Random(16)
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
    """오답 보기 = 후보 중 정답과 다르고 서로 다른 것 앞에서부터 k 개"""
    out = []
    for c in cands:
        if c != correct and c not in out: out.append(c)
        if len(out) == k: return out
    raise AssertionError(('보기 모자람', correct, cands))


# ───────── 다항식 (계수 dict · 독립 계산) ─────────
def P(*cs):  # P(a0, a1, a2 …) = a0 + a1 x + a2 x² …
    return {i: Fr(c) for i, c in enumerate(cs) if c}
def padd(a, b): r = dict(a); [r.__setitem__(k, r.get(k, 0) + v) for k, v in b.items()]; return {k: v for k, v in r.items() if v}
def pmul(a, b):
    r = {}
    for i, x in a.items():
        for j, y in b.items(): r[i + j] = r.get(i + j, 0) + x * y
    return {k: v for k, v in r.items() if v}
def pcomp(f, g):  # f(g(x))
    r, pw = {}, {0: Fr(1)}
    for d in range(max(f) + 1 if f else 1):
        if d in f: r = padd(r, {k: v * f[d] for k, v in pw.items()})
        pw = pmul(pw, g)
    return r
def pev(f, x): return sum(v * Fr(x) ** k for k, v in f.items())
SUP = {2: '²', 3: '³', 4: '⁴'}
def ps(f):  # 「−x² + 8x − 16」
    if not f: return '0'
    out = []
    for d in sorted(f, reverse=True):
        c = f[d]; assert c.denominator == 1; c = int(c)
        mag = abs(c); body = ('' if mag == 1 and d else str(mag)) + ('x' + SUP.get(d, '') if d else '')
        if d == 1: body = ('' if mag == 1 else str(mag)) + 'x'
        out.append(('−' if c < 0 else '+', body))
    s = ('−' if out[0][0] == '−' else '') + out[0][1]
    for sg, b in out[1:]: s += f' {sg} {b}'
    return s
assert ps(P(-16, 8, -1)) == '−x² + 8x − 16' and ps(P(0, 0, 0, 0, -1)) == '−x⁴' and ps(P(1, 2)) == '2x + 1' and ps(P(-1, 0, 1)) == 'x² − 1'
# 다항식 셈을 따로 확인 (숫자 넣어 비교)
for x in range(-3, 4): assert pev(pcomp(P(0, 0, -1), P(-4, 1)), x) == -(x - 4) ** 2


# ───────── 몬스터 1 · 교과서 문제 1 (값) ─────────
def m1_set(f, g, p, q, r, tag):
    F, G = (lambda x: pev(f, x)), (lambda x: pev(g, x))
    fs, gs = ps(f), ps(g)
    Q = f'문제 1) 두 함수 f(x) = {fs} 와 g(x) = {gs} 에 대하여\n'
    a1, a2, a3 = G(F(p)), F(G(q)), F(F(r))
    it1 = ch(M(a1), pick(M(a1), [M(F(G(p))), M(F(p)), M(G(p)), M(a1 + 1)]), f'(g∘f)({M(p)}) = g(f({M(p)})) = g({M(F(p))}) = {M(a1)} · 먼저 f', Q + f'(g∘f)({M(p)}) 의 값은?')
    it2 = ch(M(a2), pick(M(a2), [M(G(F(q))), M(G(q)), M(F(q)), M(a2 - 1)]), f'(f∘g)({M(q)}) = f(g({M(q)})) = f({M(G(q))}) = {M(a2)} · 먼저 g', Q + f'(f∘g)({M(q)}) 의 값은?')
    it3 = ch(M(a3), pick(M(a3), [M(F(r)), M(F(r) * F(r)), M(2 * F(r)), M(a3 + 2)]), f'(f∘f)({M(r)}) = f(f({M(r)})) = f({M(F(r))}) = {M(a3)}', Q + f'(f∘f)({M(r)}) 의 값은?')
    # 따로 셈: 파이썬 식으로 직접
    ok(f'm1{tag}', f'{a1} · {a2} · {a3}', f'g(f({p})) · f(g({q})) · f(f({r}))')
    return [it1, it2, it3]
M1 = [m1_set(P(1, 2), P(-1, 0, 1), 2, -1, -3, '')]
assert [int(M1[0][i]['choices'][M1[0][i]['answerIndex']].replace('−', '-')) for i in range(3)] == [24, 1, -9]  # 학습지 정답
M1 += [m1_set(*a, f'r{i + 1}') for i, a in enumerate([(P(-1, 3), P(2, 0, 1), 1, -2, 2), (P(3, -2), P(-3, 0, 1), 3, 2, -1), (P(-2, 1), P(1, 0, -1), 2, -1, 3)])]


# ───────── 몬스터 2 · 교과서 문제 2 (식) ─────────
def m2_set(a, k, tag):  # f(x) = x + a , g(x) = k x²
    f, g = P(a, 1), P(0, 0, k)
    Q = f'문제 2) 두 함수 f(x) = {ps(f)} 와 g(x) = {ps(g)} 에 대하여\n'
    gf, fg, gg = pcomp(g, f), pcomp(f, g), pcomp(g, g)
    for x in range(-4, 5):  # 따로 셈
        assert pev(gf, x) == k * (x + a) ** 2 and pev(fg, x) == k * x * x + a and pev(gg, x) == k * (k * x * x) ** 2
    w1 = [ps(P(k * a * a, 0, k)), ps(padd(gf, {1: -2 * gf[1]})), ps(pcomp(f, g)), ps({k2: -v for k2, v in gf.items()})]
    it1 = ch(ps(gf), pick(ps(gf), w1), f'g(f(x)) = g({ps(f)}) = {M(k) if k != -1 else "−"}({ps(f)})² = {ps(gf)}'.replace('1(', '('), Q + '(g∘f)(x) 는?')
    it2 = ch(ps(fg), pick(ps(fg), [ps(gf), ps(P(-a, 0, k)), ps(P(a, 0, -k))]), f'f(g(x)) = f({ps(g)}) = {ps(g)} {"+" if a > 0 else "−"} {abs(a)}', Q + '(f∘g)(x) 는?')
    it3 = ch(ps(gg), pick(ps(gg), [ps({4: -gg[4]}), ps(g), ps(P(0, 0, 0, 0, k))]), f'g(g(x)) = g({ps(g)}) = {M(k) if k not in (1, -1) else ("−" if k == -1 else "")}({ps(g)})² = {ps(gg)}', Q + '(g∘g)(x) 는?')
    ok(f'm2{tag}', f'{ps(gf)} · {ps(fg)} · {ps(gg)}', 'x = −4 ~ 4 넣어 따로 셈과 같음')
    return [it1, it2, it3]
M2 = [m2_set(-4, -1, '')]
assert [M2[0][i]['choices'][M2[0][i]['answerIndex']] for i in range(3)] == ['−x² + 8x − 16', '−x² − 4', '−x⁴']  # 학습지 정답
M2 += [m2_set(*a, f'r{i + 1}') for i, a in enumerate([(3, -1), (-2, 2), (5, -2)])]


# ───────── 몬스터 3 · 중단원 07 · ⚔ 소레이드 ─────────
def solve_h(p, q, r, s):  # f = px + q , g = rx + s , f(h(x)) = g(x) → h = ((r)x + (s − q)) / p
    a, b = Fr(r, p), Fr(s - q, p); assert a.denominator == b.denominator == 1
    h = P(b, a)
    for x in range(-5, 6): assert p * pev(h, x) + q == r * x + s
    return h
def m3_set(p, q, r, s, tag):
    f, g = P(q, p), P(s, r); h = solve_h(p, q, r, s)
    Q = f'중단원 07) 두 함수 f(x) = {ps(f)} 와 g(x) = {ps(g)} 에 대하여 (f∘h)(x) = g(x) 를 만족시키는 h(x) 를 구하시오.\n'
    ph = f'{p}h(x)' if p != 1 else 'h(x)'
    lhs = f'{ph} {"+" if q > 0 else "−"} {abs(q)}'
    rhs2 = ps(P(s - q, r))
    s1 = ch('f(h(x))', ['h(f(x))', 'f(x) × h(x)'], '(f∘h)(x) = f(h(x)) — 오른쪽 h 먼저, 다음 f', Q + '(f∘h)(x) 를 바꿔 쓰면?', say='(f∘h)(x) = f(h(x)) 이다.')
    s2 = ch(lhs, [f'{ps(f)} + h(x)', f'h({ps(f)})'], f'f 의 x 자리에 h(x) 를 통째로 넣는다', Q + 'f(h(x)) 를 h(x) 로 나타내면?', say=f'f 의 x 자리에 h(x) 를 넣으면 f(h(x)) = {lhs}')
    s3 = ch(f'{lhs} = {ps(g)}', [f'{lhs} = {ps(f)}', f'h(x) = {ps(g)}'], '(f∘h)(x) = g(x) 이므로 두 식을 같다고 놓는다', Q + '세울 수 있는 식은?', say=f'(f∘h)(x) = g(x) 이므로 {lhs} = {ps(g)}')
    s4 = ch(f'{ph} = {rhs2}', pick(f'{ph} = {rhs2}', [f'{ph} = {ps(P(s + q, r))}', f'{ph} = {ps(g)}', f'{ph} = {ps(P(q - s, -r))}']), f'{M(q)} 을 옮기면 {ph} = {ps(g)} {"−" if q > 0 else "+"} {abs(q)} = {rhs2}', Q + f'{ph} 는?', say=f'{ph} = {rhs2}')
    wrong5 = [rhs2, ps(P(-h.get(0, 0), h.get(1, 0))), ps(P(h.get(0, 0), -h.get(1, 0))), ps(P(h.get(0, 0) + 1, h.get(1, 0)))]
    s5 = ch(f'h(x) = {ps(h)}', [f'h(x) = {w}' for w in pick(ps(h), wrong5)], f'양변을 {p} 로 나누면 h(x) = {ps(h)} · 검산 f(h(x)) = {p}({ps(h)}) {"+" if q > 0 else "−"} {abs(q)} = {ps(g)}', Q + '그러므로 h(x) 는?', say=f'그러므로 h(x) = {ps(h)} (검산 f(h(x)) = {ps(g)})')
    ok(f'm3{tag}', f'h(x) = {ps(h)}', f'x = −5~5 에서 {p}·h(x) {q:+d} = {r}x {s:+d}')
    return [s1, s2, s3, s4, s5], h
M3s = [m3_set(2, -7, -4, 3, '')] + [m3_set(*a, f'r{i + 1}') for i, a in enumerate([(2, 3, 6, -1), (3, -2, -6, 7), (4, 1, 8, -3)])]
M3 = [x[0] for x in M3s]
assert ps(M3s[0][1]) == '−2x + 5'  # 학습지 정답


# ───────── 형성평가 4 (1 ~ 3 = 중단원 03 · 같은 판에서 f · g 같음) ─────────
BF = [(-5, 3, -4, 3, 1), (2, 2, 1, 1, -1), (-3, 4, -1, 2, 2), (1, -2, 5, 0, 1)]  # f = x + a · g = mx + n · (g∘f)(u) · (g∘g)(w)
B1, B2, B3 = [], [], []
for i, (a, m, n, u, w) in enumerate(BF):
    f, g = P(a, 1), P(n, m); F, G = (lambda x, f=f: pev(f, x)), (lambda x, g=g: pev(g, x))
    tag = '' if i == 0 else f'r{i}'
    head = f'두 함수 f(x) = {ps(f)} 와 g(x) = {ps(g)} 에 대하여 '
    v1, v2, fg = G(F(u)), G(G(w)), pcomp(f, g)
    B1.append(ch(M(v1), pick(M(v1), [M(F(G(u))), M(G(u)), M(F(u)), M(v1 + 1)]), f'g(f({u})) = g({M(F(u))}) = {M(v1)}', '1. ' + head + f'(g∘f)({u}) 의 값은?'))
    B2.append(ch(M(v2), pick(M(v2), [M(G(w)), M(G(w) * G(w)), M(F(F(w))), M(v2 - 1)]), f'g(g({w})) = g({M(G(w))}) = {M(v2)}', '2. ' + head + f'(g∘g)({w}) 의 값은?'))
    B3.append(ch(ps(fg), pick(ps(fg), [ps(pcomp(g, f)), ps(P(a + n, m)), ps(P(n - a, m))]), f'f(g(x)) = ({ps(g)}) {"+" if a > 0 else "−"} {abs(a)} = {ps(fg)}', '3. ' + head + '(f∘g)(x) 는?'))
    for x in range(-3, 4): assert pev(fg, x) == (m * x + n) + a
    ok(f'boss1-3{tag}', f'{v1} · {v2} · {ps(fg)}', f'g(f({u})) · g(g({w})) · f(g(x))')
assert (B1[0]['choices'][B1[0]['answerIndex']], B2[0]['choices'][B2[0]['answerIndex']], B3[0]['choices'][B3[0]['answerIndex']]) == ('−10', '−7', '3x − 9')
B4 = []
for i, (p, q, r, s) in enumerate([(3, 1, 6, -5), (2, -1, 4, 7), (5, 2, -10, 7), (3, -4, 9, 2)]):
    h = solve_h(p, q, r, s); f, g = P(q, p), P(s, r)
    assert all(ps(h) != ps(x[1]) for x in M3s)  # 몬스터 3 답과 다름
    wr = [ps(P(s - q, r)), ps(P(-h.get(0, 0), h.get(1, 0))), ps(P(h.get(0, 0), -h.get(1, 0))), ps(P(h.get(0, 0) + 1, h.get(1, 0)))]
    B4.append(ch(f'h(x) = {ps(h)}', [f'h(x) = {w}' for w in pick(ps(h), wr)], f'f(h(x)) = {p}h(x) {"+" if q > 0 else "−"} {abs(q)} = {ps(g)} → h(x) = {ps(h)}',
                     f'4. 두 함수 f(x) = {ps(f)}, g(x) = {ps(g)} 에 대하여 (f∘h)(x) = g(x) 를 만족시키는 h(x) 는?'))
    ok(f'boss4{"" if i == 0 else f"r{i}"}', f'h(x) = {ps(h)}', f'{p}·h {q:+d} = {r}x {s:+d}')
assert B4[0]['choices'][B4[0]['answerIndex']] == 'h(x) = 2x − 2'
POOL = [B1, B2, B3, B4]


# ───────── 🔑 열쇠 ─────────
KEYS = [{'id': 'k1', 'name': '괄호 풀기', 'grade': '중1 · 문자와 식', 'help': '괄호 앞의 수를 괄호 안 모든 항에 곱해요 · −(…) 는 부호가 모두 바뀌어요. · 이 열쇠는 문제 3 에서 써요.',
         'vers': [{'type': 'choice', 'q': '2(x + 3) 을 풀면?', 'a': '1', 'ch': ['2x + 3', '2x + 6', 'x + 6']},
                  {'type': 'choice', 'q': '−(4x + 1) 을 풀면?', 'a': '2', 'ch': ['−4x + 1', '4x − 1', '−4x − 1']},
                  {'type': 'choice', 'q': '3(−x + 2) 를 풀면?', 'a': '0', 'ch': ['−3x + 6', '−3x + 2', '3x + 6']}], 'uses': [{'at': 'm3', 'n': 5}, {'at': 'boss', 'n': 4}]},
        {'id': 'k2', 'name': '완전제곱식 전개', 'grade': '중3 · 곱셈 공식', 'help': '(x − a)² = x² − 2ax + a² · 가운데 항을 빠뜨리지 않아요. · 이 열쇠는 문제 2 의 (1)에서 써요.',
         'vers': [{'type': 'choice', 'q': '(x − 4)² 을 전개하면?', 'a': '1', 'ch': ['x² − 16', 'x² − 8x + 16', 'x² + 16']},
                  {'type': 'choice', 'q': '(x + 3)² 을 전개하면?', 'a': '0', 'ch': ['x² + 6x + 9', 'x² + 9', 'x² + 3x + 9']},
                  {'type': 'choice', 'q': '(x − 1)² 을 전개하면?', 'a': '2', 'ch': ['x² + 1', 'x² − 1', 'x² − 2x + 1']}], 'uses': [{'at': 'm2', 'n': 1}]}]
val = {'2(x + 3) 을 풀면?': ps(P(6, 2)), '−(4x + 1) 을 풀면?': ps(P(-1, -4)), '3(−x + 2) 를 풀면?': ps(P(6, -3)),
       '(x − 4)² 을 전개하면?': ps(pmul(P(-4, 1), P(-4, 1))), '(x + 3)² 을 전개하면?': ps(pmul(P(3, 1), P(3, 1))), '(x − 1)² 을 전개하면?': ps(pmul(P(-1, 1), P(-1, 1)))}
for k in KEYS:
    for q in k['vers']:
        assert q['ch'][int(q['a'])] == val[q['q']], (q, val[q['q']]); ok(k['id'], val[q['q']], q['q'])


# ───────── 팩 조립 ─────────
HELP1 = {'concept': '(g∘f)(a) = g(f(a)) — 오른쪽 f 먼저 계산하고, 그 값을 g 에 넣어요.', 'example': {'q': 'f(x) = x + 1, g(x) = 2x 일 때 (g∘f)(3) 은?', 'sol': ['먼저 f(3) = 4', '다음 g(4) = 8', '(g∘f)(3) = 8 · (f∘g)(3) = f(6) = 7 과 다르다']}, 'first': 'f(2) = □'}
HELP2 = {'concept': 'g(f(x)) = g 의 x 자리에 f(x) 를 괄호째 넣어요 · 제곱은 괄호 전체에.', 'example': {'q': 'f(x) = x + 1, g(x) = x² 일 때 (g∘f)(x) 는?', 'sol': ['g 의 x 자리에 (x + 1) 을 넣는다', '(x + 1)² = x² + 2x + 1', '(f∘g)(x) = x² + 1 과 다르다']}, 'first': 'g(x − 4) = −(□)²'}
HELP3 = {'concept': '(f∘h)(x) = f(h(x)) — f 의 x 자리에 h(x) 를 통째로 넣고 방정식처럼 h(x) 를 구해요.', 'example': {'q': 'f(x) = 2x + 1, g(x) = 4x + 5 일 때 (f∘h)(x) = g(x) 인 h(x) 는?', 'sol': ['f(h(x)) = 2h(x) + 1', '2h(x) + 1 = 4x + 5 → 2h(x) = 4x + 4', 'h(x) = 2x + 2 · 검산 2(2x + 2) + 1 = 4x + 5']}, 'first': 'f(h(x)) = 2h(x) − □'}
steps = [
    {'id': 'intro', 'kind': 'intro', 'img': 'review', 'title': '도입 · 🔁 전시 확인 · 생각 열기',
     'say': '🔁 전시 확인: ① x₁ ≠ x₂ 이면 f(x₁) ≠ f(x₂) → (일대일함수) ② f(x) = x → (항등함수)\n🔍 생각 열기: 아람 → 떡볶이 → 3000원 · 재영 → 김밥 → 4000원 · 하영 → 어묵 → 2000원 → 학생에서 가격으로 바로 가는 화살표'},
    {'id': 'c1', 'kind': 'concept', 'title': 'STEP 1 · 합성함수', 'say': '낱말 상자 [ 합성함수 · g∘f · g(f(x)) ]\nf : X → Y, g : Y → Z → X 의 원소 x 에 Z 의 원소 (g(f(x))) 를 대응 = f 와 g 의 (합성함수) (g∘f)\n(g∘f)(x) = g(f(x)) · 먼저 f, 다음 g · f 의 치역 ⊂ g 의 정의역',
     'check': {'type': 'choice', 'q': '(g∘f)(x) 를 구할 때 먼저 계산하는 함수는?', 'ch': ['f', 'g'], 'a': 0, 'why': 'g(f(x)) — 괄호 안 f(x) 를 먼저 구하고 그 값을 g 에 넣어요.'}},
    {'id': 'm1', 'kind': 'monster', 'title': '몬스터 1 톱니 병정'},
    {'id': 'c2', 'kind': 'concept', 'title': 'STEP 2 · 합성함수의 식 · 교환법칙', 'say': '예제) f(x) = −x + 2, g(x) = 4x + 1\n(g∘f)(x) = 4(−x + 2) + 1 = (−4x + 9) · (f∘g)(x) = −(4x + 1) + 2 = (−4x + 1)\n→ g∘f (≠) f∘g · 합성에서 교환법칙이 성립하지 않는다',
     'check': {'type': 'ox', 'q': '합성함수에서 g∘f 와 f∘g 는 항상 같다.', 'a': False, 'why': '예제에서 −4x + 9 ≠ −4x + 1 — 순서를 바꾸면 달라질 수 있어요.'}},
    {'id': 'm2', 'kind': 'monster', 'title': '몬스터 2 순서 뒤바뀐 컨베이어 미믹'},
    {'id': 'c3', 'kind': 'concept', 'title': 'STEP 3 · 결합법칙', 'say': 'f(x) = 2x − 1, g(x) = 3x + 2, h(x) = x² + 1\n((f∘g)∘h)(x) = (f∘(g∘h))(x) = 6x² + 9 → (f∘g)∘h = f∘(g∘h)\n합성에서 교환법칙 ✕ · 결합법칙 ○',
     'check': {'type': 'choice', 'q': '합성에서 성립하는 것은?', 'ch': ['결합법칙', '교환법칙'], 'a': 0, 'why': '(f∘g)∘h = f∘(g∘h) 는 성립하지만 g∘f 와 f∘g 는 다를 수 있어요.'}},
    {'id': 'm3', 'kind': 'monster', 'title': '몬스터 3 합성 골렘 · ⚔ 소레이드'},
    {'id': 'recap', 'kind': 'concept', 'title': '📝 오늘 정리', 'say': '합성함수 g∘f : X → Z, (g∘f)(x) = g(f(x)) — 먼저 f, 다음 g\n교환법칙 ✕ (g∘f ≠ f∘g) · 결합법칙 ○ ((f∘g)∘h = f∘(g∘h))'},
    {'id': 'sum', 'kind': 'boss', 'title': '👑 16차시 형성평가 · 합성의 대기관'}]
# 결합법칙 예 따로 확인
_f, _g, _h = P(-1, 2), P(2, 3), P(1, 0, 1)
assert pcomp(pcomp(_f, _g), _h) == pcomp(_f, pcomp(_g, _h)) == P(9, 0, 6)
assert ps(pcomp(P(1, 4), P(2, -1))) == '−4x + 9' and ps(pcomp(P(2, -1), P(1, 4))) == '−4x + 1'
# 4-1: 그림 이름은 지금 도감에 있는 것으로 · 새 그림(f16-…)이 오면 sprite 만 바꿈
pack = {'id': 'ex-16', 'no': 16, 'v': 1, 'title': '합성함수', 'unit': '공통수학2 Ⅲ. 함수와 그래프 1. 함수 02. 합성함수',
        'goal': '함수의 합성을 설명하고, 합성함수를 구할 수 있다.',
        'theme': '05-ruins', 'defaultPct': 90, 'source': {'file': 'upload'},
        'next': {'title': '17차시 · 역함수', 'ask': '화살표를 거꾸로 돌려도 함수가 될까?', 'link': '되감기 = 역함수'},
        'imgCells': ['review', 'c1', 'm1', 'c2', 'm2', 'c3', 'm3', 'recap', 'sum'],
        'videos': {'c1': 'video/v16-65.mp4', 'c2': 'video/v16-66.mp4', 'c3': 'video/v16-67.mp4'},  # 팩 v2: zip 안 v16-65~67.mp4 (드라이브 05 「(16차시) 65 · 66 · 67」)
        'steps': steps,
        'monsters': {
            'm1': {'title': '몬스터 1 톱니 병정', 'sprite': 'base1:0', 'attack': 'pause', 'first': M1[0], 'retry': {'pool': M1[1:]}, 'help': HELP1},
            'm2': {'title': '몬스터 2 순서 뒤바뀐 컨베이어 미믹', 'sprite': 'base2:0', 'attack': 'pause', 'first': M2[0], 'retry': {'pool': M2[1:]}, 'help': HELP2},
            'm3': {'title': '몬스터 3 합성 골렘 · ⚔ 소레이드', 'sprite': 'extra1:0', 'attack': 'pause', 'first': M3[0], 'chain': {'pool': M3}, 'retry': {'pool': M3[1:]},
                   'noteText': '(f∘h)(x) = f(h(x)) → f 에 h(x) 넣기 → g(x) 와 같다고 놓기 → 이항 → h(x) · 검산', 'help': HELP3}},
        'boss': {'title': '👑 16차시 형성평가 · 합성의 대기관', 'sprite': 'crown0:0', 'items': 4, 'hpItems': 4,
                 'tags': ['c1', 'c1', 'c2', 'c2'], 'links': ['m1', 'm1', 'm2', 'm3'],
                 'pool': POOL, 'sets': [None, [p[1] for p in POOL]]},
        'keys': KEYS}

# ───────── 팩 스스로 검사 ─────────
b = pack['boss']
assert b['items'] == len(b['tags']) == len(b['links']) == len(b['pool']) == 4 and 1 <= b['hpItems'] <= b['items']
cids = {s['id'] for s in steps if s['kind'] == 'concept'}; assert set(b['tags']) <= cids
assert all(s['id'] in pack['monsters'] for s in steps if s['kind'] == 'monster') and steps[-1]['kind'] == 'boss'
def each_item():
    for m in pack['monsters'].values():
        yield from m['first']
        for v in m['retry']['pool']: yield from v
    for p in b['pool']: yield from p
for it in each_item():
    assert 'question' in it
    if it['type'] == 'choice': assert 0 <= it['answerIndex'] < len(it['choices'])
    if it['type'] == 'multi': assert isinstance(it['answer'], list) and 'choices' not in it
for m in pack['monsters'].values():
    sig = [i['type'] for i in m['first']]
    assert all([i['type'] for i in v] == sig for v in m['retry']['pool'])
json.dump(pack, open(OUT, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('| 문항 | 정답 | 계산 한 줄 | 확인 |\n|---|---|---|---|')
for n, a, c in CHECK: print(f'| {n} | {a} | {c} | ✅ |')
print(f'팩 검사 통과 · 몬스터 3 · 형성평가 4 · 열쇠 2 · 검산 {len(CHECK)}줄')
