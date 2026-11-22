from cm1lib import *
from mat import *
def wr(R): return [M(x) for x in ([[R[0][0], R[1][0]], [R[0][1], R[1][1] + 1]], [[R[0][0] + 1, R[0][1]], [R[1][0], R[1][1]]], [[R[0][0], R[0][1] - 2], [R[1][0] + 1, R[1][1]]], [[R[0][0] - 1, R[0][1]], [R[1][0], R[1][1] + 2]])]
SH = [((2, 3), (3, 2)), ((2, 2), (2, 1)), ((1, 2), (2, 2)), ((3, 2), (2, 2)), ((2, 1), (1, 2)), ((1, 3), (3, 1)), ((2, 3), (3, 1)), ((3, 1), (1, 3)), ((1, 2), (2, 3))]
def m1a(v, rng):
    (a, b), (c, d) = pick(v, rng, SH[0], lambda rr: rr.choice(SH[1:]))
    ws = [f'{b} × {b} 행렬' if (b, b) != (a, d) else f'{a+1} × {d} 행렬', f'{d} × {a} 행렬' if a != d else f'{a} × {d+1} 행렬', f'{a*b} × {c*d} 행렬' if (a*b, c*d) != (a, d) else f'{a+1} × {d+1} 행렬', f'{a+c} × {b+d} 행렬']
    return choice(rng, f'A 는 {a} × {b} 행렬, B 는 {c} × {d} 행렬일 때, 곱 AB 의 꼴은?', f'{a} × {d} 행렬', ws, f'(A 의 행의 수) × (B 의 열의 수) = {a} × {d}.', chk=lambda: b == c)
def m1b(v, rng):
    (a, b), (c, d) = pick(v, rng, ((2, 3), (2, 2)), lambda rr: rr.choice([((2, 3), (2, 2)), ((2, 2), (2, 1)), ((1, 2), (1, 2)), ((2, 1), (2, 2)), ((2, 2), (1, 2)), ((3, 2), (2, 3)), ((2, 1), (1, 2)), ((2, 2), (3, 2)), ((1, 3), (3, 2)), ((2, 3), (2, 3))]))
    return ox(f'A 는 {a} × {b} 행렬, B 는 {c} × {d} 행렬일 때, 곱 AB 를 계산할 수 있다.', b == c, f'A 의 열의 수 {b} 와 B 의 행의 수 {c} {"가 같으므로 곱할 수 있다" if b == c else "가 달라 곱할 수 없다"}.', chk=True)
def m2a(v, rng):
    a = pick(v, rng, [[2, 3]], lambda rr: rmat(rr, 1, 2, -5, 6)); b = pick(v, rng, [[4], [1]], lambda rr: rmat(rr, 2, 1, -5, 6))
    return number(f'A = {M(a)}, B = {M(b)} 일 때, 곱 AB 는 1 × 1 행렬이다. 그 성분은?{NOTE}', mmul(a, b)[0][0], f'{N(a[0][0])} × {PN(b[0][0])} + {PN(a[0][1])} × {PN(b[1][0])} (앞끼리, 뒤끼리 곱해 더한다).', chk=True)
def m2b(v, rng):
    A = pick(v, rng, [[1, 2], [3, 4]], lambda rr: rmat(rr, 2, 2)); b = pick(v, rng, [[2], [1]], lambda rr: rmat(rr, 2, 1)); R = mmul(A, b)
    ws = [M(x) for x in ([[R[1][0]], [R[0][0] + 1]], [[R[0][0] + 1], [R[1][0]]], [[A[0][0] * b[0][0]], [A[1][1] * b[1][0] + (1 if A[1][1] * b[1][0] == R[1][0] else 0)]], [[R[0][0]], [R[1][0] - 2]])]
    return choice(rng, f'A = {M(A)}, B = {M(b)} 일 때, AB 는?{NOTE}', M(R), ws, f'제1행 × B = {N(R[0][0])}, 제2행 × B = {N(R[1][0])} 을 위아래로 놓는다.'.replace(' 을 ', ' — '), chk=True)
def m3a(v, rng):
    A = pick(v, rng, [[1, 2], [0, 1]], lambda rr: rmat(rr, 2, 2, -3, 4)); B = pick(v, rng, [[3, 1], [2, 4]], lambda rr: rmat(rr, 2, 2, -3, 4)); i, j = pick(v, rng, (1, 2), lambda rr: (ri(rr, 1, 2), ri(rr, 1, 2)))
    return number(f'A = {M(A)}, B = {M(B)} 일 때, AB 의 ({i}, {j}) 성분은?{NOTE}', mmul(A, B)[i-1][j-1], f'A 의 제{i}행과 B 의 제{j}열: {N(A[i-1][0])} × {PN(B[0][j-1])} + {PN(A[i-1][1])} × {PN(B[1][j-1])}.', chk=True)
def m3b(v, rng):
    A = pick(v, rng, [[1, 2], [0, 1]], lambda rr: rmat(rr, 2, 2, -3, 4)); B = pick(v, rng, [[3, 1], [2, 4]], lambda rr: rmat(rr, 2, 2, -3, 4)); R = mmul(A, B)
    return choice(rng, f'A = {M(A)}, B = {M(B)} 일 때, AB 는?{NOTE}', M(R), [M(x) for x in [[[A[i][j] * B[i][j] for j in (0, 1)] for i in (0, 1)], mmul(B, A)] if x != R] + wr(R), '(i, j) 성분 = A 의 제i행과 B 의 제j열을 차례로 곱해 더한 값.', chk=True)
# 산: 실생활 (본문 130쪽 도입 · 가격 × 개수)
def HP(v, rng):
    if v == 0: return [[2, 1], [3, 2]], [[1500], [1000]]
    return rmat(rng, 2, 2, 1, 5), [[rng.randint(5, 30) * 100], [rng.randint(5, 30) * 100]]
def ctx(Q, Pm): return f'김밥 한 줄은 {Pm[0][0]}원, 음료 한 병은 {Pm[1][0]}원이다. 1모둠은 김밥 {Q[0][0]}줄과 음료 {Q[0][1]}병, 2모둠은 김밥 {Q[1][0]}줄과 음료 {Q[1][1]}병을 샀다. A = {M(Q)}, B = {M(Pm)} 라 하자.{NOTE}'
def m4a(v, rng):
    Q, Pm = HP(v, rng)
    return choice(rng, f'{ctx(Q, Pm)} 곱 AB 의 (1, 1) 성분이 뜻하는 것은?', '1모둠이 낸 금액', ['2모둠이 낸 금액', '두 모둠이 산 김밥의 수', '김밥 한 줄과 음료 한 병 값의 합'], f'제1행(1모둠의 개수) × 가격 = {Q[0][0]} × {Pm[0][0]} + {Q[0][1]} × {Pm[1][0]}.', keep=True, chk=True)
def m4b(v, rng):
    Q, Pm = HP(v, rng); R = mmul(Q, Pm)
    return number(f'{ctx(Q, Pm)} 곱 AB 의 (2, 1) 성분은?', R[1][0], f'2모둠: {Q[1][0]} × {Pm[0][0]} + {Q[1][1]} × {Pm[1][0]} = {R[1][0]} (원).', chk=True)
def ex1(v, rng):
    a = pick(v, rng, [[1], [2]], lambda rr: rmat(rr, 2, 1, -4, 5)); b = pick(v, rng, [[3, 4]], lambda rr: rmat(rr, 1, 2, -4, 5)); R = mmul(a, b)
    return number(f'A = {M(a)}, B = {M(b)} 일 때, 곱 AB 는 2 × 2 행렬이다. AB 의 모든 성분의 합은?{NOTE}', tot(R), f'AB = {M(R)} — 세로 행렬 × 가로 행렬은 2 × 2 가 된다.', chk=True)
L = dict(id='cm1-35', no=35, title='행렬의 곱셈', unit='Ⅳ-1 행렬과 그 연산', pages='130 ~ 131', goal='행렬의 곱셈을 할 수 있다.',
  review='34차시: 덧셈 · 뺄셈 · 실수배는 「같은 자리끼리」', intro='모둠별로 산 개수 행렬과 가격 행렬 — 모둠이 낸 돈은 「개수 × 가격」을 더한 값. 이것이 행렬의 곱셈이다.',
  concepts=[dict(id='c1', title='곱할 수 있는 조건과 꼴', say='A 의 열의 수 = B 의 행의 수일 때만 AB 를 계산할 수 있다. (m × k)(k × n) = m × n 행렬.', check=dict(type='ox', q='2 × 3 행렬과 2 × 3 행렬은 곱할 수 있다.', ch=[], a='X', why='앞 행렬의 열의 수 3 과 뒤 행렬의 행의 수 2 가 다르다.')),
            dict(id='c2', title='행 × 열', say='AB 의 (i, j) 성분 = A 의 제i행과 B 의 제j열의 성분을 차례로 곱해 더한 값. 곱셈은 「같은 자리끼리」가 아니다.', check=dict(type='ox', q='행렬의 곱셈은 같은 자리의 성분끼리 곱하는 것이다.', ch=[], a='X', why='행과 열을 짝지어 차례로 곱해 더한다.'))],
  mons=[dict(id='m1', title='문제 1 · 곱의 꼴', subs=[m1a, m1b]), dict(id='m2', title='문제 2 · 행 하나 × 열 하나', subs=[m2a, m2b]), dict(id='m3', title='문제 3 · 2 × 2 끼리의 곱', subs=[m3a, m3b]),
        dict(id='m4', title='문제 4 · 개수와 가격', hard=True, subs=[m4a, m4b]), dict(id='m5', title='세로 × 가로', extra=True, subs=[ex1])],
  boss=[(m1a, 'c1', 'm1'), (m2a, 'c2', 'm2'), (m3a, 'c2', 'm3'), (m3b, 'c2', 'm3')],
  hard_from='산 = 본문 130쪽 도입 상황(곱의 성분이 뜻하는 것 · 실생활)',
  motion=[dict(title='행이 열을 훑는다', key='A 의 한 행이 B 의 한 열 위에 포개지며 짝끼리 곱해 더해져 한 칸이 된다.', scenes=['카드에 A (2 × 2), B (2 × 2), 빈 결과 칸 4개가 놓인다.', 'A 의 제1행이 빛나며 가로로 눕고, B 의 제1열이 빛나며 세로로 선다.', '짝끼리 선으로 이어져 「1 × 3 + 2 × 2」 가 뜨고 결과 (1, 1) 칸에 7 이 떨어진다.', '같은 방식으로 나머지 세 칸이 빠르게 채워진다.'], end='(i, j) 성분 = 제i행 × 제j열', at='c2')],
  notes=['가장 흔한 오개념 「같은 자리끼리 곱하기」를 문제 3 의 틀린 보기로 넣음.'])
if __name__ == '__main__': write(L)
