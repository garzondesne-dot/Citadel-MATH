from cm1lib import *
def poly3(rng, deg=3, zero=True):
    cs = [ri(rng, -5, 6) if (i == 0 or not zero or rng.random() > 0.25) else 0 for i in range(deg + 1)]
    cs[0] = cs[0] or 2
    return [(c, deg - i) for i, c in enumerate(cs)]
def E1(t): return D(T(t, 'x'))
# m1 내림차순
def m1a(v, rng):
    t = pick(v, rng, [(4, 1), (-2, 0), (3, 3), (-1, 2)], lambda r: r.sample([(ri(r, -6, 6), 4), (ri(r, -6, 6), 3), (ri(r, -6, 6), 2), (ri(r, -6, 6), 1), (ri(r, -9, 9), 0)], 4))
    if v: rng.shuffle(t)
    if sortx(t) == t: t = t[1:] + t[:1]
    right = E1(sortx(t)); w = [E1(sortx(t, rev=False)), E1(sorted(t, key=lambda z: -abs(z[0]))), E1(t[::-1]), E1(t)]
    return choice(rng, f'다항식 {E1(t)} 을 x에 대하여 내림차순으로 정리한 것은?', right, w, '차수가 높은 항부터 차례대로 쓴다(상수항이 맨 뒤).', chk=lambda: [z[1] for z in sortx(t)] == sorted([z[1] for z in t], reverse=True) and same(T(sortx(t), 'x'), T(t, 'x')))
def m1b(v, rng):
    # 두 문자: y에 대하여 내림차순일 때 y² 의 계수(식)
    a, b, c, d, e = pick(v, rng, (3, -1, 5, 2, 6), lambda r: (ri(r, 2, 6), ri(r, -4, 4), ri(r, 2, 7), ri(r, -5, 5), ri(r, 1, 9)))
    t = [(a, 0, 2), (b, 1, 1), (-1, 3, 0), (c, 1, 2), (d, 0, 1), (e, 0, 0)]
    q = f'다항식 {D(T(t))} 을 y에 대하여 내림차순으로 정리하면 ( □ )y² + ( … )y + ( … ) 꼴이다. □ 에 알맞은 식은?'
    right = D(f'{c}*x+{a}'); w = [D(f'{a}*x+{c}'), N(a + c), D(f'{b}*x+{d}'), D(f'{c}*x')]
    return choice(rng, q, right, w, f'y² 이 든 항은 {D(T([(a,0,2)]))}, {D(T([(c,1,2)]))} → y² 으로 묶으면 ({right})y².', chk=lambda: same(f'({c}*x+{a})*y**2+({b}*x+{d})*y+(-x**3+{e})', T(t), 'xy'))
def S1(t): return E1(sortx(t))
# m2 한 문자 A ± B
def AB(v, rng):
    A = pick(v, rng, [(3, 3), (0, 2), (2, 1), (-1, 0)], lambda r: poly3(r)); B = pick(v, rng, [(2, 3), (-1, 2), (-1, 1), (1, 0)], lambda r: poly3(r, zero=False))
    return A, B
def m2(sign):
    def f(v, rng):
        A, B = AB(v, random.Random(rng.random() if v else 1)); R = tadd(A, B, sign)
        op = '+' if sign > 0 else '−'
        w = [S1(tadd(A, B, -sign)), S1(tadd(A, [B[0]] + tscale(B[1:], -1), sign)), S1(tadd(tscale(A, -1), B, 1)), S1(tadd(A, B[:-1] + [(-B[-1][0], 0)], sign))]
        sol = '동류항끼리 모아 계수를 더한다.' if sign > 0 else 'B의 모든 항의 부호를 바꾸어 더한다(첫 항만 바꾸면 틀림).'
        return choice(rng, f'A = {S1(A)}, B = {S1(B)} 일 때 A {op} B 를 계산하면?', S1(R), w, sol, chk=lambda: same(T(R, 'x'), f"({T(A,'x')}){'+' if sign>0 else '-'}({T(B,'x')})"))
    return f
# m3 두 문자
def AB2(v, rng):
    g = lambda r: [(ri(r, -4, 5), 2, 0), (ri(r, -5, 5), 1, 1), (ri(r, -4, 6), 0, 2)]
    return pick(v, rng, [(1, 2, 0), (3, 1, 1), (5, 0, 2)], g), pick(v, rng, [(6, 2, 0), (-9, 1, 1), (-1, 0, 2)], g)
def m3(sign):
    def f(v, rng):
        A, B = AB2(v, random.Random(rng.random() if v else 1)); R = tadd(A, B, sign); op = '+' if sign > 0 else '−'
        w = [D(T(tadd(A, B, -sign))), D(T(tadd(A, [B[0]] + tscale(B[1:], -1), sign))), D(T(tadd(A, [B[0], (-B[1][0], 1, 1), B[2]], sign))), D(T(tadd(tscale(A, -1), B)))]
        if D(T(R)) == '0': return f(v, random.Random(rng.random()))
        return choice(rng, f'A = {D(T(A))}, B = {D(T(B))} 일 때 A {op} B 를 계산하면?', D(T(R)), w, 'x², xy, y² 항끼리 따로 모아 계수를 계산한다.', chk=lambda: same(T(R), f"({T(A)}){'+' if sign>0 else '-'}({T(B)})", 'xy'))
    return f
# m4 세 다항식
def ABC(v, rng):
    g = lambda r, d: [(ri(r, -3, 4), d - i) for i in range(d + 1)]
    return pick(v, rng, ([(1, 3), (-2, 2), (0, 1), (5, 0)], [(-1, 2), (3, 1), (1, 0)], [(1, 3), (-5, 2), (4, 1), (0, 0)]), lambda r: (g(r, 3), g(r, 2), g(r, 3)))
def m4a(v, rng):
    A, B, C = ABC(v, random.Random(rng.random() if v else 1)); s = f'A = {S1(A)}, B = {S1(B)}, C = {S1(C)}'
    return choice(rng, f'{s} 일 때, A − (B + C) 의 괄호를 풀면?', 'A − B − C', ['A − B + C', 'A + B + C', 'A + B − C'], '괄호 앞이 − 이면 괄호 안 모든 항의 부호가 바뀐다.', chk=True)
def m4b(v, rng):
    A, B, C = ABC(v, random.Random(rng.random() if v else 1)); s = f'A = {S1(A)}, B = {S1(B)}, C = {S1(C)}'
    R = tadd(tadd(A, B, -1), C, -1); w = [S1(tadd(tadd(A, B, -1), C, 1)), S1(tadd(tadd(A, B, 1), C, 1)), S1(tadd(tadd(A, B, 1), C, -1))]
    return choice(rng, f'{s} 일 때, A − (B + C) 를 계산하면?', S1(R), w, 'A − B − C 로 풀어 동류항끼리 계산한다.', chk=lambda: same(T(R, 'x'), f"({T(A,'x')})-(({T(B,'x')})+({T(C,'x')}))"))
def m4c(v, rng):
    A, B, C = ABC(v, random.Random(rng.random() if v else 1)); s = f'A = {S1(A)}, B = {S1(B)}, C = {S1(C)}'
    return choice(rng, f'{s} 일 때, (A − 2B) − (C + A) 를 간단히 하면?', '−2B − C', ['2A − 2B − C', '−2B + C', '2B − C'], 'A − 2B − C − A 에서 A 와 −A 가 지워진다.', chk=True)
def m4d(v, rng):
    A, B, C = ABC(v, random.Random(rng.random() if v else 1)); s = f'B = {S1(B)}, C = {S1(C)}'
    R = tadd(tscale(B, -2), C, -1); w = [S1(tadd(tscale(B, -2), C, 1)), S1(tadd(tscale(B, 2), C, -1)), S1(tadd(tscale(B, -1), C, -1))]
    return choice(rng, f'{s} 일 때, −2B − C 를 계산하면?', S1(R), w, 'B의 각 항에 −2 를 곱하고, C의 각 항의 부호를 바꾸어 더한다.', chk=lambda: same(T(R, 'x'), f"-2*({T(B,'x')})-({T(C,'x')})"))
# m5 산: A + B, 2A − B 가 주어짐 (중단원 마무리 05 꼴)
def SUMS(v, rng):
    g = lambda r: ([(ri(r, 1, 3), 3), (ri(r, -4, 4), 2), (ri(r, -3, 3, ()), 1), (ri(r, -4, 5), 0)], [(ri(r, -3, 3), 3), (ri(r, -5, 5), 2), (ri(r, -4, 4, ()), 1), (ri(r, -5, 5), 0)])
    A, B = pick(v, rng, ([(1, 3), (-5, 2), (-1, 1), (2, 0)], [(0, 3), (-4, 2), (1, 1), (2, 0)]), g)
    return A, B, tadd(A, B), tadd(tscale(A, 2), B, -1)
def m5a(v, rng):
    A, B, S, U = SUMS(v, random.Random(rng.random() if v else 1)); s = f'두 다항식 A, B 가 A + B = {S1(S)}, 2A − B = {J(S1(U), '을를')} 만족시킨다.'
    return choice(rng, f'{s} B 를 없애고 A 만 남기려면?', '두 식을 변끼리 더한다 (3A 가 남음)', ['두 식을 변끼리 뺀다', '첫 식에 2를 곱해 더한다', '둘째 식에 2를 곱해 더한다'], '(A + B) + (2A − B) = 3A → B 가 지워진다.', chk=True)
def m5b(v, rng):
    A, B, S, U = SUMS(v, random.Random(rng.random() if v else 1)); s = f'두 다항식 A, B 가 A + B = {S1(S)}, 2A − B = {J(S1(U), '을를')} 만족시킨다.'
    w = [S1(tadd(S, U)), S1(tadd(S, U, -1)), S1(B), S1(tscale(A, 2))]
    return choice(rng, f'{s} 두 식을 더하면 3A 이다. A 는?', S1(A), w, f'3A = {S1(tadd(S, U))} → 각 계수를 3으로 나눈다.', chk=lambda: same(f"3*({T(A,'x')})", f"({T(S,'x')})+({T(U,'x')})"))
def m5c(v, rng):
    A, B, S, U = SUMS(v, random.Random(rng.random() if v else 1))
    w = [S1(tadd(S, A)), S1(tadd(A, S, -1)), S1(A), S1(tadd(U, A, -1))]
    return choice(rng, f'두 다항식 A, B 에 대하여 A + B = {S1(S)} 이고 A = {S1(A)} 이다. B 는?', S1(B), w, 'B = (A + B) − A 로 계산한다.', chk=lambda: same(T(B, 'x'), f"({T(S,'x')})-({T(A,'x')})"))
# 여유: 이익 = 수입 − 비용
def ex1(v, rng):
    a, b, c, d = pick(v, rng, (2, 30, 500, 80), lambda r: (ri(r, 2, 5), ri(r, 2, 6) * 10, ri(r, 2, 9) * 100, ri(r, 7, 12) * 10))
    cost = [(a, 2), (b, 1), (c, 0)]; rev = [(-1, 2), (d, 1)]; R = tadd(rev, cost, -1)
    w = [S1(tadd(rev, cost)), S1(tadd(cost, rev, -1)), S1(tadd(rev, [(a, 2), (b, 1), (-c, 0)], -1))]
    return choice(rng, f'상품 x개를 만들 때 비용이 {S1(cost)} (원), 수입이 {S1(rev)} (원)이다. (이익) = (수입) − (비용) 을 x에 대한 식으로 나타내면?', S1(R), w, '수입에서 비용의 모든 항을 뺀다(비용 전체에 − 부호).', chk=lambda: same(T(R, 'x'), f"({T(rev,'x')})-({T(cost,'x')})"))
# 형성평가
def b3(v, rng):
    A, B = AB(v, random.Random(rng.random() + 3 if v else 5)); A = pick(v, rng, [(2, 2), (-3, 1), (4, 0)], lambda r: poly3(r, 2, False)); B = pick(v, rng, [(-1, 2), (5, 1), (-6, 0)], lambda r: poly3(r, 2, False))
    X = tadd(B, A, -1); w = [S1(tadd(A, B)), S1(tadd(A, B, -1)), S1(B)]
    return choice(rng, f'A = {S1(A)} 일 때, A + X = {J(S1(B), "을를")} 만족시키는 다항식 X 는?', S1(X), w, f'X = ({S1(B)}) − A 로 계산한다.', chk=lambda: same(f"({T(A,'x')})+({T(X,'x')})", T(B, 'x')))
L = dict(id='cm1-01', no=1, title='다항식의 덧셈과 뺄셈', unit='Ⅰ-1 다항식의 연산', pages='12 ~ 14', goal='다항식의 덧셈과 뺄셈의 원리를 설명하고, 그 계산을 할 수 있다.',
  review='중학교: 동류항 · 일차식의 덧셈과 뺄셈 · (3x − 2) − (x + 5) 를 계산해 보기', intro='순위표를 큰 것부터 정렬하면 보기 편하다 → 다항식도 차수 순서로 정리하면 계산이 편하다.',
  concepts=[dict(id='c1', title='다항식의 정리 (내림차순 · 오름차순)', say='한 문자에 대하여 차수가 높은 항부터 = 내림차순, 낮은 항부터 = 오름차순. 다른 문자는 수처럼 본다.', check=dict(type='ox', q='다항식 5 − 2x + x² 은 x에 대하여 오름차순으로 정리되어 있다.', ch=[], a='O', why='차수가 0, 1, 2 로 낮은 것부터 놓였다.')),
            dict(id='c2', title='다항식의 덧셈과 뺄셈', say='덧셈 = 동류항끼리 모아 계산. 뺄셈 = 빼는 식의 모든 항의 부호를 바꾸어 더한다. 교환법칙 · 결합법칙이 성립한다.', check=dict(type='ox', q='A − (B − C) = A − B − C 이다.', ch=[], a='X', why='괄호 앞이 − 이면 안의 부호가 모두 바뀐다 → A − B + C.'))],
  mons=[dict(id='m1', title='문제 1 · 내림차순으로 정리', subs=[m1a, m1b]),
        dict(id='m2', title='문제 2 · A + B, A − B', subs=[m2(1), m2(-1)]),
        dict(id='m3', title='문제 3 · 두 문자 다항식', subs=[m3(1), m3(-1)]),
        dict(id='m4', title='문제 4 · 세 다항식의 계산', subs=[m4a, m4b, m4c, m4d]),
        dict(id='m5', title='문제 5 · 두 식에서 A, B 찾기', hard=True, subs=[m5a, m5b, m5c]),
        dict(id='m6', title='이익을 식으로', extra=True, subs=[ex1])],
  boss=[(m1a, 'c1', 'm1'), (m2(-1), 'c2', 'm2'), (m4b, 'c2', 'm4'), (b3, 'c2', 'm5')],
  motion=[dict(title='내림차순 = 큰 차수부터 줄 세우기', key='차수가 높은 항부터 차례대로 놓으면 내림차순이다.', scenes=['카드에 4x − 2 + 3x³ − x² 이 뒤섞여 뜬다.', '항마다 작은 차수 딱지(1, 0, 3, 2)가 붙는다.', '커서가 딱지 숫자가 큰 항부터 왼쪽으로 끌어 놓는다.', '3x³ − x² + 4x − 2 로 정렬되고 딱지가 3 · 2 · 1 · 0 으로 반짝인다.'], end='내림차순: 3x³ − x² + 4x − 2'),
          dict(title='뺄셈 = 부호를 모두 바꿔 더하기', key='A − B 는 B 의 모든 항의 부호를 바꾼 뒤 더한다.', scenes=['카드 위 줄에 A = 3x³ + 2x − 1, 아래 줄에 B = 2x³ − x² − x + 1.', '커서가 − 단추를 누르면 B 의 부호가 하나씩 뒤집힌다(색이 바뀜).', '같은 차수끼리 세로로 줄이 맞춰진다.', '세로로 더해 x³ + x² + 3x − 2 가 내려온다.'], end='A − B = A + (−B)', at='c2')],
  hard_from='산 = 중단원 마무리 05번 꼴(이 소단원 본문에 어려운 문제가 없어 가져옴)',
  notes=['교과서 문제 4(비용 · 수입 · 이익)는 소수 계수라 정수 계수로 바꿔 여유 문제로 둠.', '문제 4 는 「괄호 풀기 → 계산」 두 단계씩 4소문항(소문항 4개 상한).', '생각 넓히기(정사각뿔대 부피)는 뺌 — 분수 계수 · 문자 3개로 45분에 넘침.'])
if __name__ == '__main__': write(L)
