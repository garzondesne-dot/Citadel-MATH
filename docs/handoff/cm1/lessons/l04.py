from cm1lib import *
X = lambda cs: D(P(cs))
def DIV1(v, rng, k=0):
    B, Q, R = pick(v, rng, [([1, -2], [3, 1, 0], [1]), ([1, -1], [3, -2], [4])][k], lambda r: ([1, ri(r, -3, 3)], [ri(r, 1, 3), ri(r, -3, 3), ri(r, -3, 3)], [ri(r, -5, 5)]))
    return padd(pmul(B, Q), R), B, Q, R
def DIV2(v, rng):
    B, Q, R = pick(v, rng, ([1, -3, -1], [2, 1], [5, 4]), lambda r: ([1, ri(r, -3, 3), ri(r, -3, 3)], [ri(r, 1, 3), ri(r, -3, 3)], [ri(r, -5, 5), ri(r, -5, 5)]))
    return padd(pmul(B, Q), R), B, Q, R
okdiv = lambda A, B, Q, R: (lambda q, r: q == Q and padd(r, R, -1) == [0])(*pdiv(A, B))
def m1a(v, rng):
    A, B, Q, R = DIV1(v, random.Random(rng.random() if v else 1))
    w = [X(padd(Q, [1])), X([Q[0], -Q[1], Q[2]]), X(Q[:2]), X(padd(Q, [0, 1, 0]))]
    return choice(rng, f'({X(A)}) ÷ ({X(B)}) 의 몫은?', X(Q), w, f'{X([A[0], 0, 0, 0])} ÷ x = {X([Q[0], 0, 0])} 부터 차례로 맨 앞 항을 지워 나간다.', chk=lambda: okdiv(A, B, Q, R))
def m1b(v, rng):
    A, B, Q, R = DIV1(v, random.Random(rng.random() if v else 1))
    return number(f'({X(A)}) ÷ ({X(B)}) 의 나머지는?', R[0], f'몫 {X(Q)} 를 구한 뒤 남는 상수가 나머지.', chk=lambda: okdiv(A, B, Q, R))
def m2a(v, rng):
    A, B, Q, R = DIV2(v, random.Random(rng.random() if v else 1))
    w = [X([Q[0], -Q[1]]), X([Q[0], Q[1] + 1]), X([Q[0], Q[1], 0]), X([Q[0] + 1, Q[1]])]
    return choice(rng, f'({X(A)}) ÷ ({X(B)}) 의 몫은?', X(Q), w, '나누는 식이 이차식이면 몫은 (삼차) ÷ (이차) = 일차식.', chk=lambda: okdiv(A, B, Q, R))
def m2b(v, rng):
    A, B, Q, R = DIV2(v, random.Random(rng.random() if v else 1))
    w = [X([R[0], -R[1]]), X([-R[0], R[1]]), X([R[1]]) if R[1] else X([R[0] + 1, 0]), X(padd(R, [1, 1]))]
    return choice(rng, f'({X(A)}) ÷ ({X(B)}) 의 나머지는?', X(R), w, '이차식으로 나눈 나머지는 일차식 이하 — 더 나눌 수 없을 때 멈춘다.', chk=lambda: okdiv(A, B, Q, R))
def m3a(v, rng):
    A, B, Q, R = DIV1(v, random.Random(rng.random() + 1 if v else 2), 1)
    right = f'({X(B)})({X(Q)}) {"+" if R[0] >= 0 else "−"} {abs(R[0])}'
    w = [f'({X(B)})({X(Q)}) {"−" if R[0] >= 0 else "+"} {abs(R[0])}', f'({X(B)})({X(padd(Q, R))})', f'({X(padd(B, R))})({X(Q)})']
    return choice(rng, f'{X(A)} 을 {X(B)} 로 나누면 몫이 {X(Q)}, 나머지가 {N(R[0])} 이다. 이것을 A = BQ + R 꼴로 나타내면 {X(A)} = ?', right, w, '(나누는 식) × (몫) + (나머지) = (나누어지는 식).', chk=lambda: same(P(A), f'({P(B)})*({P(Q)})+({R[0]})'))
def m3b(v, rng):
    k = pick(v, rng, 1, lambda r: ri(r, 1, 3)); a = pick(v, rng, 3, lambda r: ri(r, 2, 5))
    B1, B2 = [1, k], [1, -k, k * k]; R = [a, -1]; A = padd(pmul(B1, B2), R); ok = (v % 2 == 1)
    div = B2 if ok else B1
    return ox(f'{X(A)} = ({X(B1)})({X(B2)}) + {X(R)} 이므로, {X(A)} 을 {X(div)} 로 나누었을 때의 나머지는 {X(R)} 이다.', ok, '나머지의 차수는 나누는 식의 차수보다 낮아야 한다 → 일차식으로 나눈 나머지는 상수.' if not ok else '이차식으로 나눈 나머지는 일차식 이하이므로 맞다.', chk=lambda: (pdiv(A, div)[1] == R) == ok or (padd(pdiv(A, div)[1], R, -1) == [0]) == ok)
# m4 나누는 식 구하기 (중단원 09 꼴)
def FIND(v, rng):
    Bv, Q, R = pick(v, rng, ([1, 0, 1], [1, -1], [2, 3]), lambda r: ([1, ri(r, -2, 2), ri(r, -3, 3)], [1, ri(r, -3, 3)], [ri(r, -4, 4), ri(r, -4, 4)]))
    return padd(pmul(Bv, Q), R), Bv, Q, R
def m4a(v, rng):
    A, Bv, Q, R = FIND(v, random.Random(rng.random() if v else 1)); s = f'다항식 {X(A)} 을 다항식 B 로 나누었더니 몫이 {X(Q)}, 나머지가 {X(R)} 이었다.'
    return choice(rng, f'{s} B 를 구하는 식은?', f'{{({X(A)}) − ({X(R)})}} ÷ ({X(Q)})', [f'{{({X(A)}) + ({X(R)})}} ÷ ({X(Q)})', f'({X(A)}) ÷ ({X(Q)}) − ({X(R)})', f'({X(A)}) × ({X(Q)}) + ({X(R)})'], 'A = BQ + R → A − R = BQ → B = (A − R) ÷ Q.', chk=True)
def m4b(v, rng):
    A, Bv, Q, R = FIND(v, random.Random(rng.random() if v else 1)); AR = padd(A, R, -1)
    w = [X([Bv[0], -Bv[1], Bv[2]]), X(padd(Bv, [1])), X([Bv[0], Bv[1], -Bv[2]]), X(padd(Bv, [1, 0]))]
    return choice(rng, f'({X(AR)}) ÷ ({X(Q)}) 를 계산하면? (나누어떨어진다)', X(Bv), w, '세로셈으로 나누면 나머지 없이 이차식 몫이 나온다.', chk=lambda: pdiv(AR, Q) == (Bv, [0]))
# 산: 나누어떨어질 조건 (중단원 08 꼴)
def EXACT(v, rng):
    Bv, Q = pick(v, rng, ([1, 1, 1], [2, -3]), lambda r: ([1, ri(r, -2, 2), ri(r, 1, 3)], [ri(r, 1, 3), ri(r, -4, 4)]))
    A = pmul(Bv, Q); return A, Bv, Q
def m5a(v, rng):
    A, Bv, Q = EXACT(v, random.Random(rng.random() if v else 1)); s = f'{X(A[:3])} + a 가 {X(Bv)} 로 나누어떨어진다 (a 는 상수).'
    return choice(rng, f'{s} 「나누어떨어진다」의 뜻은?', '나머지가 0 이다', ['몫이 0 이다', '나머지가 a 이다', '몫과 나머지가 같다'], 'A = BQ 꼴, 곧 R = 0.', chk=True)
def m5b(v, rng):
    A, Bv, Q = EXACT(v, random.Random(rng.random() if v else 1))
    w = [X([Q[0], -Q[1]]), X([Q[0], Q[1] + 1]), X([Q[0], Q[1] - 1]), X([Q[0] + 1, Q[1]])]
    return choice(rng, f'({X(A[:3])} + a) ÷ ({X(Bv)}) 를 세로셈으로 할 때 몫은? (a 는 상수)', X(Q), w, 'a 는 상수항에만 있으므로 몫은 앞의 세 항으로 정해진다.', chk=lambda: pmul(Bv, Q)[:3] == A[:3])
def m5c(v, rng):
    A, Bv, Q = EXACT(v, random.Random(rng.random() if v else 1)); k = -A[3]
    right = f'a {"+" if k >= 0 else "−"} {abs(k)}'
    return choice(rng, f'({X(A[:3])} + a) ÷ ({X(Bv)}) 의 몫은 {X(Q)} 이다. 이때 나머지는? (a 는 상수)', right, [f'a {"−" if k >= 0 else "+"} {abs(k)}', 'a', f'{abs(k) if abs(k) > 1 else 2}a'], f'({X(Bv)})({X(Q)}) = {X(A)} 를 빼면 상수만 남는다.', chk=lambda: pmul(Bv, Q)[3] == -k)
def m5d(v, rng):
    A, Bv, Q = EXACT(v, random.Random(rng.random() if v else 1))
    return number(f'{X(A[:3])} + a 가 {X(Bv)} 로 나누어떨어질 때, 상수 a 의 값은?', A[3], f'몫 {X(Q)}, 나머지 a − ({N(A[3])}) = 0.', chk=lambda: pdiv(A, Bv)[1] == [0])
def ex1(v, rng):
    A, B, Q, R = DIV1(v, random.Random(rng.random() + 7 if v else 9)); A2 = pmul(B, Q)
    w = [X(padd(Q, [1])), X([Q[0], -Q[1], Q[2]]), X(padd(Q, [1, 0]))]
    return choice(rng, f'넓이가 {X(A2)} 인 직사각형의 가로의 길이가 {X(B)} 일 때, 세로의 길이는?', X(Q), w, '(세로) = (넓이) ÷ (가로) → 다항식의 나눗셈.', chk=lambda: pdiv(A2, B) == (Q, [0]))
L = dict(id='cm1-04', no=4, title='다항식의 나눗셈', unit='Ⅰ-1 다항식의 연산', pages='18 · 20 ~ 21 (중단원 04 · 08 · 09)', goal='다항식의 나눗셈의 원리를 설명하고, 몫과 나머지를 구할 수 있다.',
  review='자연수 나눗셈 17 ÷ 5 = 3 … 2 를 17 = 5 × 3 + 2 로 쓰기 · 2차시 분배법칙 전개', intro='17 = 5 × 3 + 2 처럼 다항식도 「나누는 식 × 몫 + 나머지」로 쓸 수 있다.',
  concepts=[dict(id='c1', title='다항식의 나눗셈 (세로셈)', say='두 식을 내림차순으로 정리하고(빈 차수는 자리를 비워 둠) 자연수 나눗셈처럼 맨 앞 항부터 지워 나간다.', check=dict(type='ox', q='x³ + 2x − 1 을 세로셈으로 나눌 때는 x² 자리를 비워 두고 쓴다.', ch=[], a='O', why='차수 자리를 맞춰야 동류항끼리 뺄 수 있다.')),
            dict(id='c2', title='A = BQ + R', say='다항식 A 를 B 로 나눈 몫 Q, 나머지 R: A = BQ + R (R 의 차수 < B 의 차수). R = 0 이면 「나누어떨어진다」.', check=dict(type='ox', q='다항식을 이차식으로 나눈 나머지는 항상 일차식이다.', ch=[], a='X', why='일차식 「이하」 — 상수이거나 0 일 수도 있다.'))],
  mons=[dict(id='m1', title='문제 1 · 일차식으로 나누기', subs=[m1a, m1b]), dict(id='m2', title='문제 2 · 이차식으로 나누기', subs=[m2a, m2b]), dict(id='m3', title='문제 3 · A = BQ + R', subs=[m3a, m3b]),
        dict(id='m4', title='문제 4 · 나누는 식 찾기', subs=[m4a, m4b]), dict(id='m5', title='문제 5 · 나누어떨어질 조건', hard=True, subs=[m5a, m5b, m5c, m5d]),
        dict(id='m6', title='넓이와 가로로 세로 구하기', extra=True, subs=[ex1])],
  boss=[(m1a, 'c1', 'm1'), (m2b, 'c1', 'm2'), (m3a, 'c2', 'm3'), (m5d, 'c2', 'm5')],
  hard_from='산 = 중단원 마무리 08번 꼴(나누어떨어질 조건) · 문제 4 = 09번 꼴',
  motion=[dict(title='다항식 세로 나눗셈', key='맨 앞 항을 지우는 몫을 하나씩 세우고, 곱해서 뺀다.', scenes=['카드에 x − 1 ) 3x² − 5x + 6 세로셈 틀이 그려진다.', '커서가 3x² ÷ x = 3x 를 몫 자리에 올린다 → (x − 1) × 3x 를 아래에 쓰고 뺀다.', '남은 −2x + 6 에서 −2 를 몫에 올린다 → 곱해서 뺀다.', '맨 아래 4 가 남고 「나머지」 딱지가 붙는다.'], end='3x² − 5x + 6 = (x − 1)(3x − 2) + 4'),
          dict(title='A = BQ + R — 나머지는 더 작아야', key='나머지의 차수는 나누는 식의 차수보다 낮다.', scenes=['카드에 17 = 5 × 3 + 2 가 뜨고 「2 < 5」가 표시된다.', '같은 줄 아래 x³ + 3x = (x + 1)(x² − x + 1) + 3x − 1 이 뜬다.', '커서가 x + 1 을 누르면 「일차식으로 나눔 → 나머지 3x − 1 ✗」.', '커서가 x² − x + 1 을 누르면 「이차식으로 나눔 → 나머지 3x − 1 ✓」.'], end='R 의 차수 < B 의 차수', at='c2')],
  notes=['교과서 18쪽 생각 넓히기(은혜 · 민호)를 문제 3-2 ○× 로 옮김.', '중단원 11번(x² + x + 1 = 0 일 때 식의 값)은 성채 몫으로 남김.'])
if __name__ == '__main__': write(L)
