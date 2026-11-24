# 14차시 「함수」 차시 팩 만들기 + 정답 독립 검산 (2026-11-20 · 손발 #7 · 메타인지 8 컨펌 #1: 몬스터 3 · B1 · C1)
#   팩 v3 (11/20): 여러 개 고르기(multi) = 엔진 꼴 options · answer [번호] (v1 · v2 = choices · "0,2" 라 앱에서 채점이 깨짐 · 베타 검사기로 확인)
#   학습지 = tools/worksheet/gen_ws14v1.py (교과서 미래엔 106~108쪽 · 중단원 05) · 꼴 = 13차시 팩(ex-13 v4) 과 같음
#   실행: python3 -I tools/pack/build14.py <출력.json>  → 검산 표를 찍고, 하나라도 틀리면 멈춤
import json, sys, random
OUT = sys.argv[1]
rnd = random.Random(14)
M = lambda n: str(n).replace('-', '−')  # 화면용 빼기 기호


def sgn(n, first=False):  # 「+ 3」「− 2」 꼴
    if first: return M(n)
    return f'+ {n}' if n >= 0 else f'− {-n}'


def ch(correct, wrong, sol, q, say=None):
    """보기 섞기 · 정답 번호는 섞은 뒤 다시 찾음 · 보기가 서로 다르지 않으면 멈춤"""
    c = [correct] + list(wrong); assert len(set(c)) == len(c), c
    rnd.shuffle(c)
    it = {'type': 'choice', 'question': q, 'choices': c, 'answerIndex': c.index(correct), 'solution': sol}
    if say: it['say'] = say
    return it


# ───────── 독립 판정 ─────────
X4, Y4 = ['1', '2', '3', '4'], ['a', 'b', 'c', 'd']
def is_fn(X, ar): return all(sum(1 for a, _ in ar if a == x) == 1 for x in X)
def why_not(X, ar):
    for x in X:
        n = sum(1 for a, _ in ar if a == x)
        if n != 1: return ('none' if n == 0 else 'many', x)
    return None
def rng(ar): return sorted({y for _, y in ar})
def txt(ar): return ', '.join(f'{a}→{b}' for a, b in ar)

CHECK = []  # 검산 표
def ok(name, ans, calc): CHECK.append((name, ans, calc))

# ───────── 몬스터 1 · 교과서 문제 1 ─────────
T1 = {1: [('1', 'c'), ('2', 'a'), ('4', 'b')], 2: [('1', 'c'), ('2', 'd'), ('3', 'a'), ('4', 'c')], 3: [('1', 'c'), ('2', 'a'), ('3', 'b'), ('4', 'b'), ('4', 'd')]}
R1 = [{1: [('1', 'a'), ('2', 'c'), ('3', 'd'), ('4', 'a')], 2: [('1', 'b'), ('3', 'a'), ('4', 'd')], 3: [('1', 'a'), ('1', 'b'), ('2', 'c'), ('3', 'c'), ('4', 'd')]},
      {1: [('1', 'd'), ('2', 'd'), ('3', 'b'), ('4', 'c'), ('3', 'a')], 2: [('1', 'b'), ('2', 'b'), ('3', 'd'), ('4', 'a')], 3: [('2', 'a'), ('3', 'c'), ('4', 'b')]},
      {1: [('2', 'b'), ('3', 'a'), ('4', 'd')], 2: [('1', 'c'), ('2', 'c'), ('2', 'a'), ('3', 'b'), ('4', 'd')], 3: [('1', 'a'), ('2', 'b'), ('3', 'b'), ('4', 'a')]}]
assert not is_fn(X4, T1[1]) and why_not(X4, T1[1]) == ('none', '3') and is_fn(X4, T1[2]) and why_not(X4, T1[3]) == ('many', '4')

def m1_set(D, tag):
    out = []
    for n in (1, 2, 3):
        w = why_not(X4, D[n]); k = w[1] if w else None
        if not w:
            other = [x for x in X4][0]
            c = '함수이다'; wr = [f'함수가 아니다 — X 의 원소 {other} 에 대응하는 Y 의 원소가 없다', f'함수가 아니다 — X 의 원소 {other} 에 대응하는 Y 의 원소가 2개이다']; sol = 'X 의 원소마다 Y 의 원소가 오직 하나씩 → 함수'
        else:
            none = f'함수가 아니다 — X 의 원소 {k} 에 대응하는 Y 의 원소가 없다'; many = f'함수가 아니다 — X 의 원소 {k} 에 대응하는 Y 의 원소가 2개이다'
            c, wr = (none, ['함수이다', many]) if w[0] == 'none' else (many, ['함수이다', none])
            sol = f'X 의 원소 {k} 에서 나가는 화살표가 ' + ('없다' if w[0] == 'none' else '2개다')
        out.append(ch(c, wr, sol, f'문제 1) X = {{1, 2, 3, 4}} 에서 Y = {{a, b, c, d}} 로의 대응\n({n}) {txt(D[n])}\n이 대응은?'))
        ok(f'm1{tag}-{n}', c, f'원소마다 화살표 수 = {[sum(1 for a, _ in D[n] if a == x) for x in X4]}')
    f = [n for n in (1, 2, 3) if is_fn(X4, D[n])]; assert len(f) == 1; f = f[0]; R = rng(D[f])
    out.append(ch('{a, b, c, d}', ['{' + ', '.join(R) + '}', '{1, 2, 3, 4}'], '공역 = Y 전체 = {a, b, c, d} (치역과 다름)', f'문제 1) 함수인 ({f}) 의 공역은?'))
    out.append({'type': 'multi', 'question': f'문제 1) 함수인 ({f}) 의 치역의 원소를 모두 고르시오.', 'options': Y4, 'answer': [Y4.index(y) for y in R], 'solution': '치역 = 화살표를 받은 원소 = {' + ', '.join(R) + '}'})
    ok(f'm1{tag}-공역', '{a, b, c, d}', '공역 = Y'); ok(f'm1{tag}-치역', '{' + ', '.join(R) + '}', f'({f}) 의 화살표 끝 모음')
    return out
for d in R1: assert sum(is_fn(X4, d[n]) for n in (1, 2, 3)) == 1 and {why_not(X4, d[n])[0] for n in (1, 2, 3) if why_not(X4, d[n])} == {'none', 'many'}
M1 = [m1_set(T1, '')] + [m1_set(d, f'r{i + 1}') for i, d in enumerate(R1)]

# ───────── 몬스터 2 · 교과서 문제 2 ─────────
def m2_set(p, q, r, tag):
    f1 = f'y = {M(p)}x {sgn(q)}'; f2 = f'y = −x² {sgn(r)}'
    assert max(-(x / 10) ** 2 + r for x in range(-300, 301)) == r  # −x² + r 의 가장 큰 값 = r
    out = [ch('{x | x 는 실수}', ['{x | x ≥ 0}', '{x | x ≠ 0}'], '정의역이 없으면 함수가 정의되는 실수 전체', f'문제 2) (1) {f1} 의 정의역은?'),
           ch('{y | y 는 실수}', [f'{{y | y ≥ {M(q)}}}', '{y | y > 0}'], 'x 가 실수 전체를 움직이면 y 도 실수 전체', f'문제 2) (1) {f1} 의 치역은?'),
           ch('{x | x 는 실수}', ['{x | x ≥ 0}', f'{{x | x ≤ {M(r)}}}'], '정의역이 없으면 실수 전체', f'문제 2) (2) {f2} 의 정의역은?'),
           ch(f'{{y | y ≤ {M(r)}}}', [f'{{y | y ≥ {M(r)}}}', '{y | y 는 실수}'], f'−x² ≤ 0 이므로 y ≤ {M(r)} (x = 0 일 때 가장 큼)', f'문제 2) (2) {f2} 의 치역은?')]
    ok(f'm2{tag}', f'실수 · 실수 · 실수 · y ≤ {M(r)}', f'p = {p} ≠ 0 · −x² 최댓값 0 → {r}')
    return out
M2 = [m2_set(2, 1, 3, '')] + [m2_set(*t, f'r{i + 1}') for i, t in enumerate([(3, -2, 5), (-2, 4, 1), (4, 3, 2)])]

# ───────── 몬스터 3 · 중단원 05 · ⚔ 소레이드 ─────────
def solve(u, w, c):  # u + a = u² + b u + c , w + a = w² + b w + c
    b = ((w * w + c - w) - (u * u + c - u)) / (u - w)  # 빼서 b
    a = u * u + b * u + c - u
    assert a == int(a) and b == int(b); a, b = int(a), int(b)
    for x in (u, w): assert x + a == x * x + b * x + c
    return a, b
def bterm(u): return 'b' if u == 1 else f'{u}b'
def m3_set(u, w, c, tag):
    a, b = solve(u, w, c)
    Q = f'문제 3) 정의역이 {{{u}, {w}}}인 두 함수 f(x) = x + a, g(x) = x² + bx {sgn(c)} 에 대하여 f = g 일 때\n'
    e1 = f'{u} + a = {u * u + c} + {bterm(u)}'; e2 = f'{w} + a = {w * w + c} + {bterm(w)}'
    out = [ch(f'f({u}) = g({u}), f({w}) = g({w})', [f'f(x) = g(x) 인 x 가 하나만 있으면 된다', '두 함수의 식이 똑같다'], '서로 같은 함수 = 정의역의 모든 원소에서 함숫값이 같다', Q + 'f = g 가 뜻하는 것은?', say=f'f = g 이므로 f({u}) = g({u}), f({w}) = g({w}) 이다.'),
           ch(e1, [f'{u} + a = {c} + {bterm(u)}', f'a = {u * u + c} + {bterm(u)}'], f'f({u}) = {u} + a · g({u}) = {u * u} + {bterm(u)} {sgn(c)}', Q + f'f({u}) = g({u}) 을 식으로 쓰면?', say=f'f({u}) = g({u}) 에서 {e1}'),
           ch(e2, [f'{w} + a = {w + c} + {bterm(w)}', f'{w} + a = {w * w} + {bterm(w)}'], f'f({w}) = {w} + a · g({w}) = {w * w} + {bterm(w)} {sgn(c)}', Q + f'f({w}) = g({w}) 을 식으로 쓰면?', say=f'f({w}) = g({w}) 에서 {e2}'),
           ch(f'b = {M(b)}', [f'b = {M(-b)}', f'b = {M(b + 1)}'], f'(뒤 식) − (앞 식) : {w - u} = {w * w - u * u} + {bterm(w - u)} → b = {M(b)}', Q + '두 식을 빼서 구한 b 는?', say=f'두 식을 빼면 b = {M(b)}'),
           ch(f'a = {M(a)}, b = {M(b)}', [f'a = {M(b)}, b = {M(a)}', f'a = {M(a)}, b = {M(-b)}'], f'{e1} 에 b = {M(b)} 를 넣으면 a = {M(a)}', Q + '그러므로 a 와 b 는?', say=f'그러므로 a = {M(a)}, b = {M(b)} 이다.')]
    ok(f'm3{tag}', f'a = {a}, b = {b}', f'x = {u}: {u + a} = {u * u + b * u + c} · x = {w}: {w + a} = {w * w + b * w + c}')
    return out
M3 = [m3_set(1, 2, 5, '')] + [m3_set(*t, f'r{i + 1}') for i, t in enumerate([(1, 3, 2), (1, 2, 1), (2, 3, 4)])]
assert solve(1, 2, 5) == (3, -2)

# ───────── 형성평가 4 ─────────
def b1(maps, tag):  # maps = [(이름, 화살표)] 셋 중 함수 하나
    X = ['1', '2', '3']; fs = [i for i, (_, m) in enumerate(maps) if is_fn(X, m)]; assert len(fs) == 1
    c = [f'{"①②③"[i]} {txt(m)}' for i, (_, m) in enumerate(maps)]
    ok(f'boss1{tag}', c[fs[0]], '원소 1 · 2 · 3 에서 화살표가 하나씩인 것')
    return {'type': 'choice', 'question': '1. X = {1, 2, 3} 에서 Y = {a, b} 로의 대응 중 함수인 것은?', 'choices': c, 'answerIndex': fs[0], 'solution': 'X 의 원소마다 화살표가 꼭 하나 → 함수'}
B1 = [b1([(0, [('1', 'a'), ('2', 'a'), ('3', 'b')]), (0, [('1', 'a'), ('2', 'b')]), (0, [('1', 'a'), ('1', 'b'), ('2', 'a'), ('3', 'b')])], ''),
      b1([(0, [('1', 'b'), ('3', 'a')]), (0, [('1', 'b'), ('2', 'b'), ('3', 'b')]), (0, [('1', 'a'), ('2', 'a'), ('2', 'b'), ('3', 'a')])], 'r1'),
      b1([(0, [('1', 'a'), ('2', 'b'), ('2', 'a'), ('3', 'b')]), (0, [('2', 'a'), ('3', 'b')]), (0, [('1', 'b'), ('2', 'a'), ('3', 'a')])], 'r2'),
      b1([(0, [('1', 'a'), ('2', 'b'), ('3', 'a')]), (0, [('1', 'b'), ('2', 'a')]), (0, [('1', 'a'), ('2', 'b'), ('3', 'a'), ('3', 'b')])], 'r3')]
def b2(p, q, X, Y, tag):
    R = sorted({p * x + q for x in X}); assert set(R) <= set(Y)
    f = f'f(x) = {p}x {sgn(q)}'
    ok(f'boss2{tag}', '{' + ', '.join(map(M, R)) + '}', ' · '.join(f'f({x}) = {p * x + q}' for x in X))
    return {'type': 'multi', 'question': f'2. X = {{{", ".join(map(str, X))}}} 에서 Y = {{{", ".join(map(str, Y))}}} 로의 함수 {f} 의 치역의 원소를 모두 고르시오.', 'options': [M(y) for y in Y], 'answer': [Y.index(y) for y in R], 'solution': '치역 = 함숫값 모음 = {' + ', '.join(map(M, R)) + '}'}
B2 = [b2(2, -1, [1, 2, 3], [1, 3, 5, 7], ''), b2(1, 2, [1, 2, 3], [2, 3, 4, 5, 6], 'r1'), b2(3, -2, [1, 2, 3], [1, 4, 7, 10], 'r2'), b2(2, 1, [0, 1, 2], [1, 3, 5, 7], 'r3')]
def b3(r, tag):
    assert min((x / 10) ** 2 + r for x in range(-300, 301)) == r
    ok(f'boss3{tag}', f'y ≥ {r}', f'x² ≥ 0 → x² {sgn(r)} ≥ {r}')
    return ch(f'{{y | y ≥ {M(r)}}}', [f'{{y | y ≤ {M(r)}}}', '{y | y 는 실수}'], f'x² ≥ 0 이므로 y ≥ {M(r)}', f'3. 함수 y = x² {sgn(r)} 의 치역은?')
B3 = [b3(1, ''), b3(4, 'r1'), b3(-2, 'r2'), b3(3, 'r3')]
def b4(u, w, tag):  # f(x) = ax + b , g(x) = x² , 정의역 {u, w}
    a = (w * w - u * u) / (w - u); b = u * u - a * u; assert a == int(a) and b == int(b); a, b = int(a), int(b)
    for x in (u, w): assert a * x + b == x * x
    ok(f'boss4{tag}', f'a = {a}, b = {b}', f'{a}·{u}{sgn(b)} = {u * u} · {a}·{w}{sgn(b)} = {w * w}')
    return ch(f'a = {M(a)}, b = {M(b)}', [f'a = {M(b)}, b = {M(a)}', f'a = {M(a)}, b = {M(-b)}' if b != 0 else f'a = {M(a + 1)}, b = {M(b)}'], f'f({u}) = g({u}), f({w}) = g({w}) 를 연립', f'4. 정의역이 {{{u}, {w}}}인 두 함수 f(x) = ax + b, g(x) = x² 에 대하여 f = g 일 때, 상수 a, b 는?')
B4 = [b4(1, 3, ''), b4(2, 3, 'r1'), b4(0, 2, 'r2'), b4(1, 4, 'r3')]  # 학습지 v2 = {1, 3} (몬스터 3 답과 다르게 · 11/20 컨펌)
assert (B4[0]['choices'][B4[0]['answerIndex']]) == 'a = 4, b = −3'
assert all(b['choices'][b['answerIndex']] != 'a = 3, b = −2' for b in B4)
POOL = [B1, B2, B3, B4]

# ───────── 🔑 열쇠 ─────────
KEYS = [{'id': 'k1', 'name': '식에 수 넣기', 'grade': '중1 · 문자와 식', 'help': 'x 자리에 수를 넣고 곱셈부터 · 음수는 괄호. · 이 열쇠는 문제 3 의 ②에서 써요.',
         'vers': [{'type': 'choice', 'q': 'x + 3 에 x = 1 을 넣으면?', 'a': '1', 'ch': ['2', '4', '−2']},
                  {'type': 'choice', 'q': 'x² − 2x + 5 에 x = 2 를 넣으면?', 'a': '0', 'ch': ['5', '9', '1']},
                  {'type': 'choice', 'q': '2x − 1 에 x = −3 을 넣으면?', 'a': '2', 'ch': ['5', '−5', '−7']}], 'uses': [{'at': 'm3', 'n': 2}, {'at': 'boss', 'n': 4}]},
        {'id': 'k2', 'name': 'y = −x² + r 의 가장 큰 값', 'grade': '중3 · 이차함수', 'help': '−x² 은 0 이하 → x = 0 일 때 가장 커요. · 이 열쇠는 문제 2 의 (2)에서 써요.',
         'vers': [{'type': 'choice', 'q': 'y = −x² + 3 의 가장 큰 값은?', 'a': '1', 'ch': ['0', '3', '−3']},
                  {'type': 'choice', 'q': 'y = −x² + 7 의 가장 큰 값은?', 'a': '2', 'ch': ['0', '−7', '7']},
                  {'type': 'choice', 'q': 'y = −x² − 1 의 가장 큰 값은?', 'a': '0', 'ch': ['−1', '1', '0']}], 'uses': [{'at': 'm2', 'n': 4}, {'at': 'boss', 'n': 3}]}]
val = {'x + 3 에 x = 1 을 넣으면?': 1 + 3, 'x² − 2x + 5 에 x = 2 를 넣으면?': 4 - 4 + 5, '2x − 1 에 x = −3 을 넣으면?': -6 - 1,
       'y = −x² + 3 의 가장 큰 값은?': 3, 'y = −x² + 7 의 가장 큰 값은?': 7, 'y = −x² − 1 의 가장 큰 값은?': -1}
for k in KEYS:
    for q in k['vers']:
        assert q['ch'][int(q['a'])] == M(val[q['q']]), q; ok(f"{k['id']}", q['ch'][int(q['a'])], q['q'])

# ───────── 팩 조립 ─────────
HELP1 = {'concept': 'X 의 원소마다 화살표가 꼭 하나씩 나가야 함수예요. 없거나 둘이면 함수가 아니에요.', 'example': {'q': 'X = {1, 2, 3} 에서 Y = {p, q} 로 1→p, 2→p, 3→q 는 함수일까?', 'sol': ['1, 2, 3 에서 화살표가 하나씩 나간다', '같은 p 로 두 화살표가 가도 괜찮다', '그러므로 함수이고 치역은 {p, q}']}, 'first': '원소 1 에서 나가는 화살표 수 = □'}
HELP2 = {'concept': '정의역이 없으면 실수 전체 · −x² 은 0 이하라서 −x² + r 은 r 이하예요.', 'example': {'q': 'y = −x² + 10 의 정의역과 치역은?', 'sol': ['정의역이 없으므로 {x | x 는 실수}', '−x² ≤ 0 이므로 −x² + 10 ≤ 10', '치역은 {y | y ≤ 10}']}, 'first': '−x² 의 가장 큰 값 = □'}
HELP3 = {'concept': '서로 같은 함수 = 정의역의 원소마다 함숫값이 같다 → 원소 하나에 식 하나.', 'example': {'q': '정의역이 {0, 1} 인 f(x) = x + a, g(x) = x² + b 에서 f = g 이면?', 'sol': ['f(0) = g(0) : a = b', 'f(1) = g(1) : 1 + a = 1 + b', '두 식이 같으므로 a = b 이면 된다 (a, b 는 하나로 정해지지 않는다)']}, 'first': 'f(1) = 1 + a · g(1) = 1 + b + □'}
steps = [
    {'id': 'intro', 'kind': 'intro', 'img': 'review', 'title': '도입 · 🔁 전시 확인 · 생각 열기',
     'say': '🔁 전시 확인: ① 모든 실수를 넣어도 항상 성립하는 부등식 = (절대부등식) ② a > 0, b > 0 → a + b ≥ (2√(ab))\n🔍 생각 열기: 대한민국→원 · 독일→유로 · 프랑스→유로 · 미국→달러 · 파운드는 화살표를 받지 않음 → 나라마다 화폐가 꼭 하나'},
    {'id': 'c1', 'kind': 'concept', 'title': 'STEP 1 · 함수', 'say': '낱말 상자 [ 대응 · 오직 하나 · 함수 ]\nX 의 원소에 Y 의 원소를 짝 지어 주는 것 = (대응)\nX 의 각 원소에 Y 의 원소가 (오직 하나)씩 대응 → X 에서 Y 로의 (함수) f : X → Y',
     'check': {'type': 'ox', 'q': 'X 의 원소 하나에 Y 의 원소 두 개가 대응해도 함수이다.', 'a': False, 'why': '함수는 X 의 원소마다 Y 의 원소가 「오직 하나」씩 대응해야 해요.'}},
    {'id': 'c2', 'kind': 'concept', 'title': 'STEP 2 · 정의역 · 공역 · 치역', 'say': '낱말 상자 [ 정의역 · 공역 · 치역 · 함숫값 ]\nf : X → Y 에서 X = (정의역) · Y = (공역) · f(x) = x 의 (함숫값) · {f(x) | x ∈ X} = (치역) ⊂ 공역\n보기) 1→b, 2→a, 3→b, 4→d → 치역 {a, b, d}'},
    {'id': 'm1', 'kind': 'monster', 'title': '몬스터 1 짝 잃은 열쇠'},
    {'id': 'c3', 'kind': 'concept', 'title': 'STEP 3 · 정의역 · 공역이 주어지지 않을 때', 'say': '정의역 = 함수가 정의되는 (실수) 전체 · 공역 = (실수) 전체\n보기) y = x² − 1 : 정의역 {x | x 는 실수} · 치역 {y | y ≥ −1} · y = 1/x : 정의역 {x | x ≠ 0}'},
    {'id': 'm2', 'kind': 'monster', 'title': '몬스터 2 정의역 문지기'},
    {'id': 'c4', 'kind': 'concept', 'title': 'STEP 4 · 서로 같은 함수', 'say': '낱말 상자 [ 정의역 · 모든 · 같다 ]\n(정의역)의 (모든) 원소 x 에 대하여 f(x) = g(x) → f 와 g 는 서로 (같다) · f = g\n탐구) 정의역 {−1, 0, 1} · f(x) = |2x| 와 g(x) = 2x² → 2, 0, 2 로 같다 → f = g',
     'check': {'type': 'choice', 'q': '정의역이 {−1, 0, 1} 인 f(x) = |2x| 와 g(x) = 2x² 는?', 'ch': ['서로 같은 함수이다', '식이 달라서 같은 함수가 아니다'], 'a': 0, 'why': 'f(−1) = g(−1) = 2 · f(0) = g(0) = 0 · f(1) = g(1) = 2 → 식이 달라도 같은 함수'}},
    {'id': 'm3', 'kind': 'monster', 'title': '몬스터 3 대응 사슬 기사 · ⚔ 소레이드'},
    {'id': 'recap', 'kind': 'concept', 'title': '📝 오늘 정리', 'say': '함수 : X 의 각 원소에 Y 의 원소가 오직 하나씩 대응\n정의역 X · 공역 Y · 치역 {f(x) | x ∈ X} ⊂ 공역\nf = g : 정의역이 같고, 모든 원소 x 에서 f(x) = g(x)'},
    {'id': 'sum', 'kind': 'boss', 'title': '👑 14차시 형성평가 · 대응의 사슬 군주'}]
# 4-1: 그림 이름은 지금 도감에 있는 것으로 · 새 그림(f14-…)이 오면 sprite 만 바꿈
pack = {'id': 'ex-14', 'no': 14, 'v': 1, 'title': '함수', 'unit': '공통수학2 Ⅲ. 함수와 그래프 1. 함수 01. 함수',
        'goal': '① 함수의 뜻을 알고 정의역 · 공역 · 치역을 구할 수 있다. ② 두 함수가 서로 같을 조건을 안다.',
        'theme': '04-mine', 'defaultPct': 90, 'source': {'file': 'upload'},
        'next': {'title': '15차시 · 함수의 그래프', 'ask': '함숫값의 순서쌍 (x, f(x)) 를 좌표평면에 점으로 찍으면?', 'link': '함수를 그림으로 보는 법'},
        'imgCells': ['review', 'c1', 'c2', 'm1', 'c3', 'm2', 'c4', 'm3', 'recap', 'sum'], 'videos': {'c1': 'video/v14-58.mp4', 'c2': 'video/v14-59.mp4', 'c3': 'video/v14-60.mp4', 'c4': 'video/v14-61.mp4'},  # zip 안 v14-58~61.mp4 (드라이브 05 「(14차시) 58 · 59 · 60 · 61」)
        'steps': steps,
        'monsters': {
            'm1': {'title': '몬스터 1 짝 잃은 열쇠', 'sprite': 'keyvault1:0', 'attack': 'pause', 'first': M1[0], 'retry': {'pool': M1[1:]}, 'help': HELP1},
            'm2': {'title': '몬스터 2 정의역 문지기', 'sprite': 'keyvault3:0', 'attack': 'pause', 'first': M2[0], 'retry': {'pool': M2[1:]}, 'help': HELP2},
            'm3': {'title': '몬스터 3 대응 사슬 기사 · ⚔ 소레이드', 'sprite': 'keyvault2:0', 'attack': 'pause', 'first': M3[0], 'chain': {'pool': M3}, 'retry': {'pool': M3[1:]},
                   'noteText': 'f = g 의 뜻 → f(1) = g(1) → f(2) = g(2) → 빼서 b → a', 'help': HELP3}},
        'boss': {'title': '👑 14차시 형성평가 · 대응의 사슬 군주', 'sprite': 'keyvaultboss0:0', 'items': 4, 'hpItems': 4,
                 'tags': ['c1', 'c2', 'c3', 'c4'], 'links': ['m1', 'm1', 'm2', 'm3'],
                 'pool': [p[1:] for p in POOL], 'sets': [None, [p[0] for p in POOL]]},
        'keys': KEYS}

# ───────── 팩 스스로 검사 (PACK-GUIDE 7 · 16) ─────────
b = pack['boss']
# PACK-GUIDE 검사 15 (11/24): 👑 첫 시도 = 세트 1 = 학습지 판(POOL[i][0] · 태그 '') · pool = 숫자 바꾼 판만 (엔진: 시도 0 = sets[1] · 1 ~ = pool)
assert b['sets'][1] == [p[0] for p in POOL] and all(b['sets'][1][i] not in b['pool'][i] and b['pool'][i] == POOL[i][1:] for i in range(len(POOL)))
WS = ["1. X = {1, 2, 3} 에서 Y = {a, b} 로의 대응 중 함수인 것은?", "f(x) = 2x − 1 의 치", "3. 함수 y = x² + 1 의 치역은?", "4. 정의역이 {1, 3}인 두 함수"]  # 레이드용 학습지 형성평가 글 조각 (14 v7 · 15 v5 · 16 v6 · 17 v6 세트 1 과 대조 · 11/24)
assert all(w in b['sets'][1][i]['question'] for i, w in enumerate(WS)), '세트 1 ≠ 학습지 글'
assert b['items'] == len(b['tags']) == len(b['links']) == len(b['pool']) == 4 and 1 <= b['hpItems'] <= b['items']
cids = {s['id'] for s in steps if s['kind'] == 'concept'}; assert set(b['tags']) <= cids
assert all(s['id'] in pack['monsters'] for s in steps if s['kind'] == 'monster') and steps[-1]['kind'] == 'boss'
assert set(l for l in b['links'] if l) <= set(pack['monsters'])
def each_item():
    for m in pack['monsters'].values():
        yield from m['first']
        for v in m['retry']['pool']: yield from v
    for p in b['pool']: yield from p
    yield from b['sets'][1]
for it in each_item():
    if it['type'] == 'choice': assert 0 <= it['answerIndex'] < len(it['choices'])
    if it['type'] == 'multi': assert isinstance(it['answer'], list) and it['answer'] and all(0 <= i < len(it['options']) for i in it['answer']) and 'choices' not in it  # 엔진 꼴 = options · answer 번호 배열 (v3 고침)
for m in pack['monsters'].values():  # 판마다 문항 꼴 같음(PACK-GUIDE 14)
    sig = [i['type'] for i in m['first']]
    assert all([i['type'] for i in v] == sig for v in m['retry']['pool'])
json.dump(pack, open(OUT, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('| 문항 | 정답 | 계산 한 줄 | 확인 |\n|---|---|---|---|')
for n, a, c in CHECK: print(f'| {n} | {a} | {c} | ✅ |')
print(f'팩 검사 통과 · 몬스터 3 · 형성평가 4 · 열쇠 2 · 검산 {len(CHECK)}줄')
