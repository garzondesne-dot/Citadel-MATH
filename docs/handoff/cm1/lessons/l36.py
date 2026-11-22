from cm1lib import *
from mat import *
E = [[1, 0], [0, 1]]
def mpow(A, n):
    R = E
    for _ in range(n): R = mmul(R, A)
    return R
def m1a(v, rng):
    A = pick(v, rng, [[1, 2], [0, 1]], lambda rr: rmat(rr, 2, 2, -3, 4)); B = pick(v, rng, [[1, 0], [3, 1]], lambda rr: rmat(rr, 2, 2, -3, 4))
    return number(f'A = {M(A)}, B = {M(B)} 일 때, BA 의 (1, 1) 성분은? (AB 가 아니라 BA 임에 주의){NOTE}', mmul(B, A)[0][0], f'B 의 제1행과 A 의 제1열: {N(B[0][0])} × {PN(A[0][0])} + {PN(B[0][1])} × {PN(A[1][0])}.', chk=True)
def m1b(v, rng):
    if v == 0: A, B = [[1, 2], [0, 1]], [[1, 0], [3, 1]]
    elif rng.random() < 0.4: a, b, c, d = [ri(rng, -4, 5) for _ in range(4)]; A, B = [[a, 0], [0, b]], [[c, 0], [0, d]]
    else: A, B = rmat(rng, 2, 2, -3, 4), rmat(rng, 2, 2, -3, 4)
    t = mmul(A, B) == mmul(B, A)
    return ox(f'A = {M(A)}, B = {M(B)} 일 때, AB = BA 이다.{NOTE}', t, f'AB = {M(mmul(A, B))}, BA = {M(mmul(B, A))} → {"같다" if t else "다르다 (곱셈은 순서를 바꾸면 달라질 수 있다)"}.', chk=True)
def m2a(v, rng):
    A = pick(v, rng, [[2, 1], [-1, 3]], lambda rr: rmat(rr, 2, 2, -3, 4)); i, j = pick(v, rng, (1, 2), lambda rr: (ri(rr, 1, 2), ri(rr, 1, 2)))
    return number(f'A = {M(A)} 일 때, A² = AA 의 ({i}, {j}) 성분은?{NOTE}', mmul(A, A)[i-1][j-1], f'A 의 제{i}행과 A 의 제{j}열: {N(A[i-1][0])} × {PN(A[0][j-1])} + {PN(A[i-1][1])} × {PN(A[1][j-1])}. (성분을 제곱하는 것이 아니다)', chk=True)
def m2b(v, rng):
    A = pick(v, rng, [[2, -3], [4, 5]], lambda rr: rmat(rr, 2, 2, -6, 7)); k = pick(v, rng, 0, lambda rr: rr.randrange(3))
    nm = ['AE', 'EA', 'AE²'][k]
    ws = [M(x) for x in ([[A[0][0], 0], [0, A[1][1]]], E, [[A[0][0] + 1, A[0][1]], [A[1][0], A[1][1] + 1]], [[A[1][1], A[0][1]], [A[1][0], A[0][0]]]) if x != A]
    return choice(rng, f'A = {M(A)}, E = (1  0 ; 0  1) 일 때, {nm} 는?{NOTE}', M(A), ws, 'E 는 단위행렬 — 수의 1 처럼, 곱해도 A 가 그대로다 (AE = EA = A).', chk=lambda: mmul(A, E) == A and mmul(E, A) == A)
def m3a(v, rng):
    A = pick(v, rng, [[1, 2], [3, 4]], lambda rr: rmat(rr, 2, 2, -3, 4)); B = pick(v, rng, [[2, 0], [1, 1]], lambda rr: rmat(rr, 2, 2, -3, 4)); C = pick(v, rng, [[-1, 1], [0, 2]], lambda rr: rmat(rr, 2, 2, -3, 4))
    S = madd(B, C); R = mmul(A, S)
    return number(f'A = {M(A)}, B = {M(B)}, C = {M(C)} 일 때, AB + AC 의 (1, 1) 성분은?{NOTE}', R[0][0], f'AB + AC = A(B + C). B + C = {M(S)} 를 먼저 구해 한 번만 곱한다.', chk=lambda: madd(mmul(A, B), mmul(A, C)) == R)
def m3b(v, rng):
    k = pick(v, rng, 0, lambda rr: rr.randrange(8))
    qs = [('(A + B)² = A² + 2AB + B²', False, '(A + B)² = A² + AB + BA + B². AB 와 BA 가 다를 수 있어 2AB 로 묶지 못한다.'),
          ('(A + B)(A − B) = A² − B²', False, '전개하면 A² − AB + BA − B². AB 와 BA 가 다를 수 있다.'),
          ('(AB)C = A(BC)', True, '곱셈의 결합법칙은 성립한다 (자리 순서는 그대로 A, B, C).'),
          ('A(B + C) = AB + AC', True, '분배법칙은 성립한다 (A 가 앞에 곱해진 순서를 지킨다).'),
          ('(A + B)C = AC + BC', True, '분배법칙은 성립한다 (C 가 뒤에 곱해진 순서를 지킨다).'),
          ('(A − B)² = A² − 2AB + B²', False, '(A − B)² = A² − AB − BA + B². AB 와 BA 가 다를 수 있다.'),
          ('AB = O 이면 A = O 또는 B = O (O 는 영행렬)', False, '영행렬이 아닌 두 행렬의 곱이 영행렬이 될 수 있다.'),
          ('A(B + C) = BA + CA', False, 'A(B + C) = AB + AC. 곱하는 순서를 바꾸면 안 된다.')]
    q, t, s = qs[k]
    return ox(f'곱셈을 할 수 있는 정사각행렬 A, B, C 에 대하여 「{q}」 는 항상 성립한다.', t, s, chk=True)
# 산: Aⁿ 의 규칙 (본문 133쪽 수준)
def m4a(v, rng):
    a = pick(v, rng, 2, lambda rr: ri(rr, -4, 5)); A = [[1, a], [0, 1]]
    return number(f'A = {M(A)} 일 때, A² 의 (1, 2) 성분은?{NOTE}', mpow(A, 2)[0][1], f'제1행 (1  {N(a)}) 와 제2열 ({N(a)}, 1): 1 × {PN(a)} + {PN(a)} × 1 = {N(2*a)}.', chk=True)
def m4b(v, rng):
    a = pick(v, rng, 2, lambda rr: ri(rr, -4, 5)); n = pick(v, rng, 10, lambda rr: ri(rr, 5, 30)); A = [[1, a], [0, 1]]
    return number(f'A = {M(A)} 일 때, A², A³ 을 구해 규칙을 찾으면 A 를 {n}번 곱한 행렬의 (1, 2) 성분은?{NOTE}', n * a, f'(1, 2) 성분이 {N(a)}, {N(2*a)}, {N(3*a)}, … 로 {N(a)} 씩 변한다 → {n} × {PN(a)}.', chk=lambda: mpow(A, n)[0][1] == n * a)
def ex1(v, rng):
    p, q = pick(v, rng, (1, 2), lambda rr: (ri(rr, -5, 6), ri(rr, -5, 6))); A = [[p, 0], [q, 0]]; B = [[0, 0], [ri(rng, 1, 5) if v else 1, ri(rng, 1, 5) if v else 3]]
    return ox(f'A = {M(A)}, B = {M(B)} 일 때, AB 는 모든 성분이 0 인 영행렬이다.{NOTE}', True, 'A ≠ O, B ≠ O 인데 AB = O 가 될 수 있다 — 수의 곱셈과 다른 점.', chk=lambda: tot(mmul(A, B)) == 0 and all(x == 0 for r in mmul(A, B) for x in r))
L = dict(id='cm1-36', no=36, title='행렬의 곱셈의 성질', unit='Ⅳ-1 행렬과 그 연산', pages='132 ~ 133', goal='행렬의 곱셈의 성질을 이해하고, 수의 곱셈과 다른 점을 설명할 수 있다.',
  review='35차시: (i, j) 성분 = 제i행 × 제j열', intro='수는 2 × 3 = 3 × 2. 행렬도 AB = BA 일까? 직접 곱해 보면 답이 나온다.',
  concepts=[dict(id='c1', title='교환법칙은 성립하지 않는다', say='일반적으로 AB ≠ BA. 결합법칙 (AB)C = A(BC), 분배법칙 A(B + C) = AB + AC 는 성립한다. 그래서 (A + B)² = A² + AB + BA + B².', check=dict(type='ox', q='모든 정사각행렬 A, B 에 대하여 AB = BA 이다.', ch=[], a='X', why='순서를 바꾸면 행과 열의 짝이 달라져 결과가 달라질 수 있다.')),
            dict(id='c2', title='단위행렬 E 와 거듭제곱', say='E = (1  0 ; 0  1) 은 AE = EA = A (수의 1 과 같은 역할). A² = AA, A³ = A²A.', check=dict(type='ox', q='A² 은 A 의 각 성분을 제곱한 행렬이다.', ch=[], a='X', why='A² = AA — 행렬의 곱셈을 해야 한다.'))],
  mons=[dict(id='m1', title='문제 1 · AB 와 BA', subs=[m1a, m1b]), dict(id='m2', title='문제 2 · A² 과 단위행렬', subs=[m2a, m2b]), dict(id='m3', title='문제 3 · 성립하는 법칙 가리기', subs=[m3a, m3b]),
        dict(id='m4', title='문제 4 · 거듭제곱의 규칙', hard=True, subs=[m4a, m4b]), dict(id='m5', title='곱이 영행렬', extra=True, subs=[ex1])],
  boss=[(m1a, 'c1', 'm1'), (m2a, 'c2', 'm2'), (m2b, 'c2', 'm2'), (m3b, 'c1', 'm3')],
  hard_from='산 = 본문 133쪽 수준(Aⁿ 의 규칙 찾기)',
  motion=[dict(title='순서를 바꾸면 달라진다', key='AB 와 BA 를 나란히 계산하면 결과 칸의 숫자가 다르다.', scenes=['카드 왼쪽에 「AB」, 오른쪽에 「BA」 계산 틀이 놓인다.', '왼쪽은 A 의 행이 B 의 열을 훑고, 오른쪽은 B 의 행이 A 의 열을 훑는다.', '두 결과 행렬이 동시에 채워진 뒤 서로 다른 칸이 붉게 깜박인다.', '가운데에 「AB ≠ BA」 가 뜬다.'], end='행렬의 곱셈은 순서가 중요하다')],
  notes=['공통수학1 마지막 차시. 역행렬 · 케일리-해밀턴은 교육과정 밖이라 넣지 않음.', '문제 3-2 는 판마다 묻는 등식이 달라짐(8종) — 판 0 은 (A + B)² 꼴.'])
if __name__ == '__main__': write(L)
