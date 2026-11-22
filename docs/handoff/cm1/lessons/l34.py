from cm1lib import *
from fractions import Fraction
from mat import *
def AB(v, rng, base):
    if v == 0: return base
    return rmat(rng, 2, 2), rmat(rng, 2, 2)
B0 = ([[1, 2], [3, -1]], [[2, 0], [-1, 4]])
def wr(R): return [M(x) for x in ([[R[0][0], R[1][0]], [R[0][1], R[1][1] + 1]], [[R[0][0] + 1, R[0][1]], [R[1][0], R[1][1]]], [[-R[0][0] - 1, R[0][1]], [R[1][0], -R[1][1] - 2]], [[R[0][0], R[0][1] - 2], [R[1][0] + 1, R[1][1]]])]
def m1a(v, rng):
    A, B = AB(v, rng, B0); R = madd(A, B)
    return choice(rng, f'A = {M(A)}, B = {M(B)} 일 때, A + B 는?{NOTE}', M(R), wr(R), '같은 자리 성분끼리 더한다.', chk=lambda: R[0][0] == A[0][0] + B[0][0] and R[1][1] == A[1][1] + B[1][1])
def m1b(v, rng):
    A, B = AB(v, rng, B0); R = madd(A, B, -1)
    return choice(rng, f'A = {M(A)}, B = {M(B)} 일 때, A − B 는?{NOTE}', M(R), [M(madd(B, A, -1))] * (madd(B, A, -1) != R) + [M(madd(A, B))] * (madd(A, B) != R) + wr(R), '같은 자리 성분끼리 뺀다 (A 의 성분 − B 의 성분).', chk=lambda: madd(R, B) == A)
def m2a(v, rng):
    A = pick(v, rng, [[2, -1], [0, 3]], lambda rr: rmat(rr, 2, 2)); k = pick(v, rng, 3, lambda rr: ri(rr, -4, 5, no=(0, 1, -1)))
    return number(f'A = {M(A)} 일 때, 행렬 {N(k)}A 의 모든 성분의 합은?{NOTE}', k * tot(A), f'모든 성분에 {J(N(k), "을를")} 곱한다 → 합도 {N(k)} 배: {N(k)} × {PN(tot(A))}.', chk=lambda: tot(msc(k, A)) == k * tot(A))
def m2b(v, rng):
    A, B = AB(v, rng, B0); k = pick(v, rng, 2, lambda rr: ri(rr, 2, 3)); R = madd(msc(k, A), B, -1)
    return number(f'A = {M(A)}, B = {M(B)} 일 때, 행렬 {k}A − B 의 (1, 2) 성분은?{NOTE}', R[0][1], f'{k} × {PN(A[0][1])} − {PN(B[0][1])} 의 값.', chk=True)
def m3a(v, rng):
    A, B = AB(v, rng, B0); X = madd(B, A, -1)
    return choice(rng, f'A = {M(A)}, B = {M(B)} 일 때, A + X = B 를 만족시키는 행렬 X 는?{NOTE}', M(X), [M(madd(A, B, -1))] * (madd(A, B, -1) != X) + [M(madd(A, B))] * (madd(A, B) != X) + wr(X), 'X = B − A (수의 방정식처럼 A 를 옮긴다).', chk=lambda: madd(A, X) == B)
def m3b(v, rng):
    A = pick(v, rng, [[3, -2], [1, 5]], lambda rr: rmat(rr, 2, 2, -6, 7))
    return number(f'A = {M(A)} 일 때, A + X = O 를 만족시키는 행렬 X 의 (2, 2) 성분은? (O 는 모든 성분이 0 인 영행렬){NOTE}', -A[1][1], 'X = −A → 모든 성분의 부호를 바꾼다.', chk=True)
# 산: 2X + A = B 꼴 (본문 129쪽 수준)
def HX(v, rng):
    if v == 0: return [[1, 2], [0, -3]], [[5, 0], [4, 1]], 2
    k = ri(rng, 2, 3); A = rmat(rng, 2, 2); X = rmat(rng, 2, 2); return A, madd(msc(k, X), A), k
def m4a(v, rng):
    A, B, k = HX(v, rng); R = madd(B, A, -1)
    return choice(rng, f'A = {M(A)}, B = {M(B)} 이고 {k}X + A = B 일 때, {k}X 는?{NOTE}', M(R), [M(madd(A, B))] * (madd(A, B) != R) + wr(R), f'{k}X = B − A (A 를 옮긴다).', chk=lambda: madd(R, A) == B)
def m4b(v, rng):
    A, B, k = HX(v, rng); R = madd(B, A, -1); X = [[Fraction(x, k) for x in r] for r in R]
    return number(f'A = {M(A)}, B = {M(B)} 이고 {k}X + A = B 일 때, 행렬 X 의 모든 성분의 합은?{NOTE}', tot(X), f'X = (B − A) ÷ {k}. B − A 의 성분의 합 {J(N(tot(R)), "을를")} {J(str(k), "으로")} 나눈다.', chk=lambda: madd(msc(k, X), A) == B)
def ex1(v, rng):
    A, B = AB(v, rng, B0)
    return ox(f'A = {M(A)}, B = {M(B)} 일 때, A + B = B + A 이다.{NOTE}', True, '행렬의 덧셈은 성분끼리의 덧셈 → 순서를 바꿔도 같다(교환법칙).', chk=lambda: madd(A, B) == madd(B, A))
L = dict(id='cm1-34', no=34, title='행렬의 덧셈, 뺄셈과 실수배', unit='Ⅳ-1 행렬과 그 연산', pages='127 ~ 129', goal='행렬의 덧셈, 뺄셈, 실수배를 할 수 있다.',
  review='33차시: 행 · 열 · (i, j) 성분 · 서로 같은 행렬', intro='매점의 1학기 판매량 행렬과 2학기 판매량 행렬 — 1년 판매량은 같은 자리끼리 더하면 된다.',
  concepts=[dict(id='c1', title='덧셈과 뺄셈', say='같은 꼴의 두 행렬은 같은 자리의 성분끼리 더하고 뺀다. 모든 성분이 0 인 행렬 = 영행렬 O.', check=dict(type='ox', q='2 × 2 행렬과 2 × 3 행렬은 더할 수 있다.', ch=[], a='X', why='같은 꼴일 때만 같은 자리끼리 더할 수 있다.')),
            dict(id='c2', title='실수배', say='kA = A 의 모든 성분에 k 를 곱한 행렬. 덧셈 · 실수배는 수의 계산처럼 교환 · 결합 · 분배법칙이 성립한다.', check=dict(type='ox', q='2A 는 A 의 제1행에만 2 를 곱한 행렬이다.', ch=[], a='X', why='모든 성분에 2 를 곱한다.'))],
  mons=[dict(id='m1', title='문제 1 · 더하기와 빼기', subs=[m1a, m1b]), dict(id='m2', title='문제 2 · 실수배', subs=[m2a, m2b]), dict(id='m3', title='문제 3 · X 구하기', subs=[m3a, m3b]),
        dict(id='m4', title='문제 4 · 실수배가 섞인 X', hard=True, subs=[m4a, m4b]), dict(id='m5', title='순서를 바꿔 더하기', extra=True, subs=[ex1])],
  boss=[(m1a, 'c1', 'm1'), (m1b, 'c1', 'm1'), (m2a, 'c2', 'm2'), (m3a, 'c1', 'm3')],
  hard_from='산 = 본문 129쪽 수준(kX + A = B 꼴의 등식)',
  motion=[dict(title='같은 자리끼리', key='두 행렬이 겹쳐지며 같은 자리 성분끼리 더해지고, 실수배는 모든 칸에 퍼진다.', scenes=['카드 위에 행렬 A, B 가 나란히 놓인다.', 'B 가 A 위로 미끄러져 겹치며 칸마다 「1 + 2」 식이 잠깐 보였다가 합으로 바뀐다.', '새 장면: 행렬 A 앞에 숫자 3 이 붙는다.', '3 이 네 칸으로 복사되어 들어가며 모든 성분이 3배가 된다.'], end='덧셈 = 같은 자리끼리 · 실수배 = 모든 칸에')],
  notes=['행렬 답은 고르기(보기 4개) 또는 「성분 하나 · 성분의 합」 숫자 입력으로 물음 — 웹앱에서 행렬 전체를 입력받는 칸이 없기 때문.'])
if __name__ == '__main__': write(L)
