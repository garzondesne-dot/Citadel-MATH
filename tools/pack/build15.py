# 15차시 「함수의 그래프 · 여러 가지 함수」 차시 팩 만들기 + 정답 독립 검산 (2026-11-20 · 손발 #7 · 메타인지 8 컨펌 #3: A1 · B1 · C1 · D1)
#   학습지 = tools/worksheet/gen_ws15v2.py (v2 = 형성평가 4 보기 순서) (교과서 미래엔 108~110쪽 · 중단원 02) · 꼴 = 14차시 팩 v3 (엔진 꼴 v1)
#   새 꼴(손발 #2 fn-input · 11/24 정식): 그래프 고르기 = choice 보기 "graph:<그림 글>" · 짝 맞추기 = match { xs, ys, answer [[X번, Y번]] }
#   실행: python3 -I tools/pack/build15.py <출력.json>  → 검산 표를 찍고, 하나라도 틀리면 멈춤
#   앱 검사: 베타 fn-input 의 checkUpload + 모든 문항 정답 채점 (손발 #7 scratch 시험 · 14 v3 와 같은 길)
import json, sys, random
OUT = sys.argv[1]
rnd = random.Random(15)
M = lambda n: str(n).replace('-', '−')  # 화면용 빼기 기호
CHECK = []
def ok(name, ans, calc): CHECK.append((name, ans, calc))


def lin(p, q, var='x'):  # 「3x − 1」 꼴 (화면용)
    a = '' if p == 1 else '−' if p == -1 else M(p)
    s = f'{a}{var}' if p else ''
    if q: s = (s + (f' + {q}' if q > 0 else f' − {-q}')) if s else M(q)
    return s or '0'
def glin(p, q): return f'y={p}x{q:+d}'.replace('+0', '') if q else f'y={p}x'  # 그림 글 (ASCII)


def ch(correct, wrong, sol, q, say=None):
    c = [correct] + list(wrong); assert len(set(c)) == len(c), c
    rnd.shuffle(c)
    it = {'type': 'choice', 'question': q, 'choices': c, 'answerIndex': c.index(correct), 'solution': sol}
    if say: it['say'] = say
    return it


# ───────── 독립 판정 (그림 글을 따로 읽지 않고, 만들 때 쓴 자료로 따로 셈) ─────────
def sample_injective(f, dom, n=4001):
    """정의역 구간에서 촘촘히 찍어 값이 겹치는지 (일대일함수) · dom = (a, b) · 소수 3자리로 반올림해 비교"""
    a, b = dom; xs = [a + (b - a) * i / (n - 1) for i in range(n)]
    ys = [round(f(x), 6) for x in xs]
    return len(set(ys)) == len(ys)
def is_fn_pts(pts): return len({x for x, _ in pts}) == len(pts)


# ───────── 몬스터 1 · 교과서 문제 4 + 5 ─────────
def gpts(pts, win='@-4,4,-6,6'): return 'graph:pts ' + ' '.join(f'({x},{y})' for x, y in pts) + ' ' + win
def m1_set(p, q, five, tag):
    X = [0, 1, 2, 3]; P = [(x, p * x + q) for x in X]
    f = f'y = {lin(p, q)}'
    sw = [(y, x) for x, y in P]  # x · y 를 바꾼 점 (틀린 보기)
    W = '@-4,4,-7,7'
    win = W if all(-4 <= x <= 4 and -7 <= y <= 7 for x, y in P + sw) else '@-8,8,-8,8'
    it1 = ch(gpts(P, win), [gpts(sw, win), f'graph:{glin(p, q)} {win}'], f'x = 0, 1, 2, 3 을 넣은 점 4개 : ' + ', '.join(f'({x}, {M(y)})' for x, y in P),
             f'문제 4) 정의역이 {{0, 1, 2, 3}} 인 함수 {f} 의 그래프는?', say=f'정의역이 {{0, 1, 2, 3}} 이면 그래프는 점 4개 ' + ', '.join(f'({x}, {M(y)})' for x, y in P))
    it2 = ch(f'graph:{glin(p, q)} {win}', [gpts(P, win), f'graph:{glin(-p, q)} {win}'], f'정의역이 실수 전체 → 점이 이어져 직선 {f}',
             f'문제 4) 정의역이 {{x | x 는 실수}} 인 함수 {f} 의 그래프는?')
    ok(f'm1{tag}-4', ', '.join(f'({x},{y})' for x, y in P), f'{p}·x {q:+d} (x = 0~3) · 실수 전체 = 직선')
    (lf, lw), (pts, pw), (nf, nw) = five  # 함수 하나 · 점(x 겹침) · 함수 아님(원 · 옆 포물선)
    assert not is_fn_pts(pts)
    it3 = ch(f'graph:{lf} {lw}', [gpts(pts, pw), f'graph:{nf} {nw}'], '세로선 x = a 를 그어 보면 어디서나 한 점에서만 만나는 것은 직선뿐',
             '문제 5) 다음 중 함수의 그래프인 것은?')
    dup = sorted({x for x, _ in pts if sum(1 for a, _ in pts if a == x) > 1})
    it4 = ch('세로선 x = a 와 두 점 이상에서 만나는 곳이 있다', ['가로선 y = b 와 두 점에서 만나는 곳이 있다', '점으로만 되어 있거나 곡선이다'],
             f'점 그림은 x = {dup[0]} 에서 점이 2개 · 원은 세로선과 두 점에서 만남 → 함수가 아니다', '문제 5) 함수의 그래프가 아닌 두 그림의 까닭은?')
    ok(f'm1{tag}-5', lf, f'점 그림 x = {dup} 겹침 · {nf} = 세로선과 두 점')
    return [it1, it2, it3, it4]
FIVE = [(('y=-x+1', '@-2,3,-2,3'), ([(0, 2), (1, 3), (2, 4), (3, 3), (3, 1), (4, 2)], '@-1,5,-1,5'), ('circle (0,0) 1', '@-2,2,-2,2')),   # 교과서 108쪽 그림 그대로
        (('y=x+1', '@-3,3,-3,3'), ([(1, 1), (2, 3), (2, 1), (3, 2), (4, 4)], '@-1,5,-1,5'), ('circle (0,0) 2', '@-3,3,-3,3')),
        (('y=2x-1', '@-3,3,-3,3'), ([(0, 1), (1, 2), (1, 4), (3, 3), (4, 1)], '@-1,5,-1,5'), ('x=y^2', '@-1,4,-3,3')),
        (('y=-2x+2', '@-2,3,-3,4'), ([(1, 4), (2, 2), (3, 1), (3, 3), (4, 2)], '@-1,5,-1,5'), ('circle (0,0) 1.5', '@-2,2,-2,2'))]
M1 = [m1_set(-2, 3, FIVE[0], '')] + [m1_set(p, q, FIVE[i + 1], f'r{i + 1}') for i, (p, q) in enumerate([(2, -1), (-1, 2), (1, -2)])]


# ───────── 몬스터 2 · 교과서 문제 6 (⑷ 그래프와 함께 · B1) ─────────
def m2_set(L, Q, A, PW, tag):
    """L = (p, q) 일차 · Q = r (−x² + r) · A = c (|x| + c) · PW = (오른쪽 x≥0 식 이름 · 함수, 왼쪽 x<0 식 이름 · 함수, 그림 글)"""
    p, q = L
    (rn, rf), (ln, lf), pg = PW
    fs = [(f'(1) y = {lin(p, q)}', lambda x: p * x + q, True),
          (f'(2) y = −x² {"+ " + str(Q) if Q > 0 else "− " + str(-Q)}', lambda x: -x * x + Q, False),
          (f'(3) y = |x|' + (f' + {A}' if A > 0 else f' − {-A}' if A < 0 else ''), lambda x: abs(x) + A, False),
          (f'(4) x ≥ 0 이면 y = {rn} · x < 0 이면 y = {ln}', lambda x: rf(x) if x >= 0 else lf(x), True)]
    # 독립: 일대일 = [−3, 3] 촘촘히 찍어 겹침 없음 · 대응 = 치역이 실수 전체 (넓은 구간에서 양 끝이 ±∞ 로 · 빈틈 없음)
    inj = [sample_injective(f, (-3, 3)) for _, f, _ in fs]
    assert inj == [True, False, False, True], inj
    for nm, f, _ in fs:
        if 'x ≥ 0' in nm:  # ⑷ 두 부분의 값이 겹치지 않고 0 에서 이어짐 (오른쪽 ≤ 0 · 왼쪽 > 0 또는 반대)
            R = [f(x / 100) for x in range(0, 1000)]; Lv = [f(-x / 100) for x in range(1, 1000)]
            assert (max(R) <= 0 < min(Lv)) or (min(R) >= 0 > max(Lv)), nm
            assert f(0) == 0 and abs(f(-0.0001)) < 0.01  # 빈틈 없음
            assert max(abs(f(10)), abs(f(-10))) > 15
    opts = [nm for nm, _, _ in fs]
    Qn = f'문제 6) 다음 함수 중 일대일함수를 모두 고르시오. (정의역 · 공역 = 실수 전체)\n(4) 의 그래프 [[graph:{pg}]]'
    it1 = {'type': 'multi', 'question': Qn, 'options': opts, 'answer': [0, 3], 'solution': '가로줄을 그었을 때 그래프와 한 번만 만나는 것 = (1), (4) · (2) (3) 은 x = −1, 1 에서 값이 같다'}
    it2 = {'type': 'multi', 'question': Qn.replace('일대일함수를 모두', '일대일대응을 모두'), 'options': opts, 'answer': [0, 3], 'solution': '(1) · (4) 는 일대일함수이고 치역 = 실수 전체 = 공역 → 일대일대응'}
    v2 = -1 + Q
    it3 = ch(f'f(−1) = f(1) = {M(v2)} 이다', [f'f(−1) = {M(-v2)}, f(1) = {M(v2)} 이다', f'f(0) = {Q} 이 가장 크다'],
             f'(−1)² = 1² = 1 → f(−1) = f(1) = −1 + {Q} = {M(v2)}', f'문제 6) (2) y = −x² {"+ " + str(Q) if Q > 0 else "− " + str(-Q)} 가 일대일함수가 아닌 까닭은?')
    assert -(-1) ** 2 + Q == -(1) ** 2 + Q == v2
    ok(f'm2{tag}', '일대일 (1)(4) · 대응 (1)(4)', f'샘플 겹침 {inj} · (2) f(±1) = {v2}')
    return [it1, it2, it3]
M2 = [m2_set((3, -1), 2, 0, (('−2x', lambda x: -2 * x), ('x²', lambda x: x * x), 'y=x^2 (-5,0); y=-2x [0,5) @-3,3,-4,4'), ''),   # 교과서 109쪽 문제 6 그대로
      m2_set((2, 3), 1, 2, (('−3x', lambda x: -3 * x), ('x²', lambda x: x * x), 'y=x^2 (-5,0); y=-3x [0,5) @-3,3,-4,4'), 'r1'),
      m2_set((-1, 4), 3, -1, (('−x²', lambda x: -x * x), ('−2x', lambda x: -2 * x), 'y=-2x (-5,0); y=-x^2 [0,5) @-3,3,-4,4'), 'r2'),
      m2_set((-2, 1), 5, 3, (('−x', lambda x: -x), ('x²', lambda x: x * x), 'y=x^2 (-5,0); y=-x [0,5) @-3,3,-4,4'), 'r3')]


# ───────── 몬스터 3 · 중단원 02 · ⚔ 소레이드 (대장 = 짝 맞추기 · C1) ─────────
LET = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ']
def classify(kind):
    """kind = ('c', c) 상수 · ('id',) 항등 · ('l', p, q) 일차(p≠0) · ('q', a, r) ax²+r → (일대일대응, 항등, 상수) 따로 셈"""
    if kind[0] == 'c': f = lambda x: kind[1]
    elif kind[0] == 'id': f = lambda x: x
    elif kind[0] == 'l': f = lambda x: kind[1] * x + kind[2]
    elif kind[0] == 'a': f = lambda x: abs(x) + kind[1]
    else: f = lambda x: kind[1] * x * x + kind[2]
    xs = [i / 7 for i in range(-70, 71)]
    const = len({f(x) for x in xs}) == 1
    ident = all(f(x) == x for x in xs)
    inj = sample_injective(f, (-5, 5))
    onto = inj and abs(f(100)) > 50 and abs(f(-100)) > 50 and (f(100) > 0) != (f(-100) > 0)  # 연속 · 일대일 · 양 끝이 반대 부호로 크게 → 치역 = 실수 전체
    return onto, ident, const, f
def name(kind):
    if kind[0] == 'c': return f'y = {M(kind[1])}'
    if kind[0] == 'id': return 'y = x'
    if kind[0] == 'l': return f'y = {lin(kind[1], kind[2])}'
    if kind[0] == 'a': return 'y = |x|' + (f' + {kind[1]}' if kind[1] > 0 else f' − {-kind[1]}' if kind[1] < 0 else '')
    a, r = kind[1], kind[2]; return f'y = {"" if a == 1 else "−" if a == -1 else M(a)}x² ' + (f'+ {r}' if r > 0 else f'− {-r}')
def m3_set(K, tag):
    C = [classify(k) for k in K]
    onto = [i for i, c in enumerate(C) if c[0]]; ident = [i for i, c in enumerate(C) if c[1]]; const = [i for i, c in enumerate(C) if c[2]]
    assert len(onto) == 2 and len(ident) == 1 and len(const) == 1 and ident[0] in onto
    qi = [i for i, k in enumerate(K) if k[0] == 'q'][0]; li = [i for i, k in enumerate(K) if k[0] == 'l'][0]
    box = '   '.join(f'{LET[i]}. {name(k)}' for i, k in enumerate(K))
    Q = f'중단원 02) 보기에서 일대일대응, 항등함수, 상수함수를 찾으시오. (정의역 · 공역 = 실수 전체)\n{box}\n'
    a, r = K[qi][1], K[qi][2]; fv = a + r
    s1 = ch(LET[const[0]], [LET[i] for i in range(4) if i != const[0]][:2], f'{LET[const[0]]}. {name(K[const[0]])} → 모든 x 에 {M(K[const[0]][1])} 하나가 대응', Q + '모든 x 에 같은 값 하나가 대응하는 상수함수는?', say=f'상수함수 = 모든 x 에 같은 값 하나 → {LET[const[0]]}')
    s2 = ch(LET[ident[0]], [LET[i] for i in range(4) if i != ident[0]][:2], 'f(x) = x → 자기 자신이 대응', Q + 'f(x) = x 인 항등함수는?', say=f'항등함수 = f(x) = x → {LET[ident[0]]}')
    s3 = ch(f'f(−1) = f(1) = {M(fv)} 이므로 일대일함수가 아니다', [f'f(−1) = {M(-fv)}, f(1) = {M(fv)} 이므로 일대일함수이다', f'f(0) = {M(r)} 이므로 일대일함수가 아니다'],
            f'{LET[qi]} : (−1)² = 1² → f(−1) = f(1) = {M(fv)}', Q + f'{LET[qi]}. {name(K[qi])} 는 일대일함수일까?', say=f'{LET[qi]} 는 −1 ≠ 1 이지만 f(−1) = f(1) = {M(fv)} → 일대일함수가 아니다')
    assert C[qi][3](-1) == C[qi][3](1) == fv
    s4 = ch('실수 전체', ['{y | y ≥ 0}', '{y | y > 0}'], f'{LET[ident[0]]} · {LET[li]} 는 직선 → x 가 실수 전체면 y 도 실수 전체 = 공역',
            Q + f'일대일함수인 {LET[onto[0]]} · {LET[onto[1]]} 의 치역은?', say=f'{LET[onto[0]]} · {LET[onto[1]]} 의 치역 = 실수 전체 = 공역 → 일대일대응')
    ans = [[0, i] for i in onto] + [[1, ident[0]], [2, const[0]]]
    boss = {'type': 'match', 'question': Q + '그러므로? 이름에서 보기로 화살표를 이으시오. (한 이름에서 여러 개 · ㄴ 처럼 두 이름에서 올 수도 있음)',
            'xs': ['일대일대응', '항등함수', '상수함수'], 'ys': LET, 'answer': ans, 'xn': '이름', 'yn': '보기',
            'solution': f'일대일대응 {LET[onto[0]]}, {LET[onto[1]]} · 항등함수 {LET[ident[0]]} · 상수함수 {LET[const[0]]}',
            'say': f'그러므로 일대일대응 {LET[onto[0]]}, {LET[onto[1]]} · 항등함수 {LET[ident[0]]} · 상수함수 {LET[const[0]]}'}
    ok(f'm3{tag}', boss['solution'], f'샘플: 대응 {onto} · 항등 {ident} · 상수 {const} · {LET[qi]} f(±1) = {fv}')
    return [s1, s2, s3, s4, boss]
M3K = [[('c', -1), ('id',), ('l', -4, 1), ('q', 2, -3)],   # 교과서 118쪽 중단원 02 그대로
       [('id',), ('l', -3, 2), ('q', -1, 4), ('c', 7)],
       [('q', 1, -1), ('c', -2), ('id',), ('l', 5, 3)],
       [('l', 4, -1), ('c', 3), ('q', 3, -2), ('id',)]]
M3 = [m3_set(k, '' if i == 0 else f'r{i}') for i, k in enumerate(M3K)]
assert M3[0][-1]['answer'] == [[0, 1], [0, 2], [1, 1], [2, 0]]


# ───────── 형성평가 4 ─────────
def b1(p, q, tag):
    X = [-1, 0, 1]; P = [(x, p * x + q) for x in X]; sw = [(y, x) for x, y in P]; sh = [(x, y + 1) for x, y in P]
    w = '@-4,4,-5,5'
    ok(f'boss1{tag}', str(P), f'{p}x {q:+d} 에 −1, 0, 1')
    return ch(gpts(P, w), [gpts(sw, w), gpts(sh, w)], '순서쌍 ' + ', '.join(f'({M(x)}, {M(y)})' for x, y in P), f'1. 정의역이 {{−1, 0, 1}} 인 함수 f(x) = {lin(p, q)} 의 그래프는?')
B1 = [b1(2, -1, ''), b1(3, 1, 'r1'), b1(-1, 2, 'r2'), b1(-2, -1, 'r3')]
def b2(fns, bad, tag):
    assert bad.startswith(('x=', 'circle')) and all(f.startswith('y=') for f in fns)  # 세로선 검사: x=식 · 원 = 아님 · y=식 = 함수
    ok(f'boss2{tag}', bad, '세로선과 두 점 이상 (x = 상수 · 원 · 옆 포물선)')
    return ch(f'graph:{bad}', [f'graph:{f}' for f in fns], f'{bad.split(" @")[0]} 은 세로선과 두 점 이상(또는 한 줄 전체)에서 만난다 → 함수가 아니다', '2. 다음 중 함수의 그래프가 아닌 것은?')
B2 = [b2(['y=x+1 @-3,3,-3,3', 'y=x^2 @-3,3,-3,3', 'y=-1 @-3,3,-3,3'], 'x=1 @-3,3,-3,3', ''),
      b2(['y=-x+2 @-3,3,-3,3', 'y=|x| @-3,3,-3,3', 'y=2 @-3,3,-3,3'], 'circle (0,0) 2 @-3,3,-3,3', 'r1'),
      b2(['y=2x @-3,3,-3,3', 'y=-x^2+1 @-3,3,-3,3', 'y=3 @-3,3,-3,3'], 'x=y^2 @-1,4,-3,3', 'r2'),
      b2(['y=x-2 @-3,3,-3,3', 'y=x^2-2 @-3,3,-3,3', 'y=1 @-3,3,-3,3'], 'x=-2 @-3,3,-3,3', 'r3')]
def b3(K, tag):
    C = [classify(k) for k in K]; ans = [i for i, c in enumerate(C) if c[0]]; assert len(ans) == 2
    ok(f'boss3{tag}', str([name(K[i]) for i in ans]), '샘플 일대일 + 치역 실수 전체')
    return {'type': 'multi', 'question': '3. 정의역 · 공역이 실수 전체일 때, 일대일대응인 것을 모두 고르시오.', 'options': [name(k) for k in K], 'answer': ans, 'solution': '일대일함수이고 치역 = 실수 전체인 것 = 직선 (기울기 ≠ 0)'}
B3 = [b3([('l', 1, 2), ('q', 1, 0), ('a', 1), ('l', -3, 0)], ''), b3([('q', -1, 3), ('l', 2, -1), ('l', -1, 5), ('a', -2)], 'r1'),
      b3([('l', 4, 1), ('c', 0), ('q', 2, 1), ('id',)], 'r2'), b3([('c', 6), ('l', -2, 3), ('q', 1, -4), ('l', 5, 0)], 'r3')]
def b4(K, tag):
    it = dict(m3_set(K, f'b{tag}')[-1]); it.pop('say', None)
    it['question'] = '4. 보기에서 일대일대응 · 항등함수 · 상수함수를 찾아 이름에서 보기로 화살표를 이으시오. (정의역 · 공역 = 실수 전체)\n' + '   '.join(f'{LET[i]}. {name(k)}' for i, k in enumerate(K))
    return it
B4 = [b4([('id',), ('q', 1, 1), ('c', 5), ('l', 2, 0)], ''), b4([('l', -1, 3), ('q', 2, 0), ('id',), ('c', -4)], 'r1'),
      b4([('id',), ('c', 1), ('l', 3, -2), ('q', -1, -1)], 'r2'), b4([('q', 1, 2), ('l', -5, 1), ('c', 8), ('id',)], 'r3')]
assert B4[0]['answer'] == [[0, 0], [0, 3], [1, 0], [2, 2]]  # 학습지 v2 형성평가 4 = ㄱ y=x ㄴ y=x²+1 ㄷ y=5 ㄹ y=2x → 대응 ㄱㄹ · 항등 ㄱ · 상수 ㄷ
key = lambda a: sorted(map(tuple, a))
assert not ({str(key(x['answer'])) for x in B4} & {str(key(s[-1]['answer'])) for s in M3})  # 형성평가 4 어느 판도 몬스터 3 어느 판과 기호 답 꼴이 안 겹침 (11/20 컨펌)
POOL = [B1, B2, B3, B4]
# 그래프 글이 겹치지 않음 · 몬스터 3 첫 판과 형성평가 4 첫 판의 보기 식이 다름


# ───────── 🔑 열쇠 ─────────
KEYS = [{'id': 'k1', 'name': '일차함수에 수 넣기', 'grade': '중2 · 일차함수', 'help': 'x 자리에 수를 넣고 곱셈부터 · 음수는 괄호. · 이 열쇠는 문제 4 에서 써요.',
         'vers': [{'type': 'choice', 'q': 'y = −2x + 3 에 x = 2 를 넣으면?', 'a': '0', 'ch': ['−1', '1', '7']},
                  {'type': 'choice', 'q': 'y = 3x − 1 에 x = −1 을 넣으면?', 'a': '1', 'ch': ['2', '−4', '4']},
                  {'type': 'choice', 'q': 'y = −x + 5 에 x = 3 을 넣으면?', 'a': '2', 'ch': ['8', '−2', '2']}], 'uses': [{'at': 'm1', 'n': 1}, {'at': 'boss', 'n': 1}]},
        {'id': 'k2', 'name': '제곱한 값', 'grade': '중1 · 거듭제곱', 'help': '(−1)² = (−1) × (−1) = 1 · 부호가 반대인 두 수는 제곱이 같아요. · 이 열쇠는 문제 6 과 몬스터 3 에서 써요.',
         'vers': [{'type': 'choice', 'q': '(−1)² 과 1² 의 값은?', 'a': '1', 'ch': ['−1 과 1', '1 과 1', '−2 와 2']},
                  {'type': 'choice', 'q': '(−2)² 과 2² 의 값은?', 'a': '0', 'ch': ['4 와 4', '−4 와 4', '−4 와 −4']},
                  {'type': 'choice', 'q': '(−3)² 의 값은?', 'a': '2', 'ch': ['−9', '−6', '9']}], 'uses': [{'at': 'm2', 'n': 3}, {'at': 'm3', 'n': 3}]}]
val = {'y = −2x + 3 에 x = 2 를 넣으면?': '−1', 'y = 3x − 1 에 x = −1 을 넣으면?': '−4', 'y = −x + 5 에 x = 3 을 넣으면?': '2',
       '(−1)² 과 1² 의 값은?': '1 과 1', '(−2)² 과 2² 의 값은?': '4 와 4', '(−3)² 의 값은?': '9'}
assert -2 * 2 + 3 == -1 and 3 * -1 - 1 == -4 and -3 + 5 == 2 and (-1) ** 2 == 1 ** 2 == 1 and (-2) ** 2 == 2 ** 2 == 4 and (-3) ** 2 == 9
for k in KEYS:
    for q in k['vers']:
        assert q['ch'][int(q['a'])] == val[q['q']], q; ok(k['id'], val[q['q']], q['q'])


# ───────── 팩 조립 ─────────
HELP1 = {'concept': '정의역이 수 몇 개면 그래프는 점 몇 개 · 실수 전체면 이어진 선. 세로선을 그어 두 점 이상과 만나면 함수의 그래프가 아니에요.',
         'example': {'q': '정의역이 {1, 2} 인 y = x + 1 의 그래프는?', 'sol': ['x = 1 → y = 2, x = 2 → y = 3', '그래프 = {(1, 2), (2, 3)}', '좌표평면 위의 점 2개']}, 'first': 'x = 0 일 때 y = □'}
HELP2 = {'concept': '가로줄을 그었을 때 그래프와 한 번만 만나면 일대일함수 · (4) 는 두 부분의 y 값이 겹치지 않고, 합치면 실수 전체예요.',
         'example': {'q': 'y = x² 은 일대일함수일까?', 'sol': ['x = −1 → 1 · x = 1 → 1', '−1 ≠ 1 인데 함숫값이 같다', '일대일함수가 아니다 (일대일대응도 아님)']}, 'first': '(2) 에서 f(−1) 과 f(1) 은 □'}
HELP3 = {'concept': '상수함수 = 모든 x 에 같은 값 · 항등함수 = f(x) = x · 일대일대응 = 일대일함수 + 치역 = 공역.',
         'example': {'q': 'y = 4, y = x, y = 3x 중 일대일대응은?', 'sol': ['y = 4 는 상수함수 (모두 4)', 'y = x · y = 3x 는 직선 → 일대일함수 · 치역 = 실수 전체', '일대일대응 = y = x, y = 3x']}, 'first': '모든 x 에 같은 값이 대응하는 것 = □'}
steps = [
    {'id': 'intro', 'kind': 'intro', 'img': 'review', 'title': '도입 · 🔁 전시 확인 · 생각 열기',
     'say': '🔁 전시 확인: ① X 의 각 원소에 Y 의 원소가 (오직 하나)씩 대응 → 함수 ② 함숫값 전체의 집합 = (치역)\n🔍 생각 열기: 학생 3명 → 영화 · (가) 모두 다른 영화 (나) 모두 같은 영화 → 둘 다 함수 · 무엇이 다를까?'},
    {'id': 'c1', 'kind': 'concept', 'title': 'STEP 1 · 함수의 그래프', 'say': '낱말 상자 [ 순서쌍 · 그래프 · 한 점 ]\n(x, f(x)) 의 (순서쌍) 전체의 집합 {(x, f(x)) | x ∈ X} = 함수 f 의 (그래프)\n함수의 그래프는 세로선 x = a 와 오직 (한 점)에서 만난다\n보기) 정의역 {−1, 0, 1, 2} · f(x) = x + 1 → (−1, 0), (0, 1), (1, 2), (2, 3) 점 4개',
     'check': {'type': 'ox', 'q': '세로선 x = a 와 두 점에서 만나는 그래프도 함수의 그래프이다.', 'a': False, 'why': 'x = a 하나에 y 가 둘 → 함숫값이 오직 하나가 아니에요.'}},
    {'id': 'm1', 'kind': 'monster', 'title': '몬스터 1 수평선 박쥐'},
    {'id': 'c2', 'kind': 'concept', 'title': 'STEP 2 · 일대일함수 · 일대일대응', 'say': '낱말 상자 [ 서로 다른 · 공역 · 일대일함수 · 일대일대응 ]\nx₁ ≠ x₂ 이면 f(x₁) ≠ f(x₂) → (일대일함수)\n일대일함수이고 치역과 (공역)이 같다 → (일대일대응)\n보기) f(x) = 2x → 일대일대응 · g(x) = x² → g(−1) = g(1) 이라 일대일함수 아님',
     'check': {'type': 'choice', 'q': 'g(x) = x² 에서 −1 ≠ 1 이지만 g(−1) = g(1) = 1 이다. g 는?', 'ch': ['일대일함수가 아니다', '일대일함수이다', '일대일대응이다'], 'a': 0, 'why': '서로 다른 두 x 에서 함숫값이 같으면 일대일함수가 아니에요.'}},
    {'id': 'm2', 'kind': 'monster', 'title': '몬스터 2 대각선 골렘'},
    {'id': 'c3', 'kind': 'concept', 'title': 'STEP 3 · 항등함수 · 상수함수', 'say': '낱말 상자 [ 항등함수 · 상수함수 ]\nf : X → X 에서 f(x) = x → (항등함수) · 일대일대응이다\nf : X → Y 에서 f(x) = c (c 는 상수) → (상수함수)\n문제 7) (1) y = x → 항등함수 · (2) x = 1 → 함수가 아님 · (3) y = 1 → 상수함수',
     'check': {'type': 'choice', 'q': '문제 7) 그래프 y = x, x = 1, y = 1 중 상수함수의 그래프는?', 'ch': ['y = 1', 'y = x', 'x = 1'], 'a': 0, 'why': '모든 x 에 1 하나가 대응 → 상수함수 · x = 1 은 세로선이라 함수의 그래프가 아니에요.'}},
    {'id': 'm3', 'kind': 'monster', 'title': '몬스터 3 쌍둥이 뿔 늑대 · ⚔ 소레이드'},
    {'id': 'sum', 'kind': 'boss', 'title': '👑 15차시 형성평가 · 그래프 용'}]
# 4-1: 그림 이름은 지금 도감에 있는 것으로 · 새 그림(f15-…)이 오면 sprite 만 바꿈
pack = {'id': 'ex-15', 'no': 15, 'v': 1, 'title': '함수의 그래프 · 여러 가지 함수', 'unit': '공통수학2 Ⅲ. 함수와 그래프 1. 함수 01. 함수',
        'goal': '① 함수의 그래프를 나타내고 함수의 그래프인지 판단할 수 있다. ② 일대일함수 · 일대일대응 · 항등함수 · 상수함수를 구별할 수 있다.',
        'theme': '12-skygarden', 'defaultPct': 90, 'source': {'file': 'upload'},
        'next': {'title': '16차시 · 합성함수', 'ask': '함수 두 개를 이어 붙이면 — 먼저 f, 다음 g 를 하면?', 'link': '두 기계를 차례로 통과하기'},
        'imgCells': ['review', 'c1', 'm1', 'c2', 'm2', 'c3', 'm3', 'sum'],
        'videos': {'c1': 'video/v15-62.mp4', 'c2': 'video/v15-63.mp4', 'c3': 'video/v15-64.mp4'},  # 팩 v2: zip 안 v15-62~64.mp4 (드라이브 05 「(15차시) 62 · 63 · 64」)
        'steps': steps,
        'monsters': {
            'm1': {'title': '몬스터 1 수평선 박쥐', 'sprite': 'garden1:0', 'attack': 'pause', 'first': M1[0], 'retry': {'pool': M1[1:]}, 'help': HELP1},
            'm2': {'title': '몬스터 2 대각선 골렘', 'sprite': 'garden2:0', 'attack': 'pause', 'first': M2[0], 'retry': {'pool': M2[1:]}, 'help': HELP2},
            'm3': {'title': '몬스터 3 쌍둥이 뿔 늑대 · ⚔ 소레이드', 'sprite': 'garden3:0', 'attack': 'pause', 'first': M3[0], 'chain': {'pool': M3}, 'retry': {'pool': M3[1:]},
                   'noteText': '상수함수 → 항등함수 → 이차함수가 일대일이 아닌 까닭 → 직선의 치역 → 짝 맞추기', 'help': HELP3}},
        'boss': {'title': '👑 15차시 형성평가 · 그래프 용', 'sprite': 'gardenboss0:0', 'items': 4, 'hpItems': 4,
                 'tags': ['c1', 'c1', 'c2', 'c3'], 'links': ['m1', 'm1', 'm2', 'm3'],
                 'pool': [p[1:] for p in POOL], 'sets': [None, [p[0] for p in POOL]]},
        'keys': KEYS}

# ───────── 팩 스스로 검사 (PACK-GUIDE 7 · 16) ─────────
b = pack['boss']
# PACK-GUIDE 검사 15 (11/24): 👑 첫 시도 = 세트 1 = 학습지 판(POOL[i][0] · 태그 '') · pool = 숫자 바꾼 판만 (엔진: 시도 0 = sets[1] · 1 ~ = pool)
assert b['sets'][1] == [p[0] for p in POOL] and all(b['sets'][1][i] not in b['pool'][i] and b['pool'][i] == POOL[i][1:] for i in range(len(POOL)))
WS = ["f(x) = 2x − 1 의 그래프는?", "2. 다음 중 함수의 그래프가 아닌 것은?", "3. 정의역 · 공역이 실수 전체일 때, 일대일대응인 것을", "4. 보기에서 일대일대응 · 항등함수 · 상수함수를"]  # 레이드용 학습지 형성평가 글 조각 (14 v7 · 15 v5 · 16 v6 · 17 v6 세트 1 과 대조 · 11/24)
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
    if it['type'] == 'multi': assert isinstance(it['answer'], list) and it['answer'] and all(0 <= i < len(it['options']) for i in it['answer']) and 'choices' not in it
    if it['type'] == 'match': assert all(0 <= a < len(it['xs']) and 0 <= c < len(it['ys']) for a, c in it['answer'])
for m in pack['monsters'].values():  # 판마다 문항 꼴 같음(PACK-GUIDE 14)
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
