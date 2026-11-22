from cm1lib import *
from mat import *
def m1a(v, rng):
    r, c = pick(v, rng, (2, 3), lambda rr: rr.choice([(2, 3), (3, 2), (1, 3), (3, 1), (2, 2), (1, 2), (2, 1), (3, 3)]))
    m = rmat(rng if v else random.Random(3), r, c)
    return choice(rng, f'행렬 {M(m)} 의 꼴은?{NOTE}', f'{r} × {c} 행렬', [f'{c} × {r} 행렬' if r != c else f'{r} × {c+1} 행렬', f'{r*c} × 1 행렬' if c != 1 else f'1 × {r*c+1} 행렬', f'{r+c} × {r+c} 행렬'], f'행(가로줄) {r}개, 열(세로줄) {c}개 → 행 × 열 순서로 {r} × {c}.', chk=lambda: len(m) == r and len(m[0]) == c)
def m1b(v, rng):
    m = rmat(rng if v else random.Random(5), 2, 3, -6, 9); i, j = pick(v, rng, (2, 1), lambda rr: (ri(rr, 1, 2), ri(rr, 1, 3)))
    while len({x for r in m for x in r}) < 6: m = rmat(rng, 2, 3, -6, 9)
    return number(f'행렬 {M(m)} 의 ({i}, {j}) 성분은?{NOTE}', m[i-1][j-1], f'제{i}행(위에서 {i}번째 줄)과 제{j}열(왼쪽에서 {j}번째 줄)이 만나는 수.', chk=True)
FS = [('i + j', lambda i, j: i + j), ('2i − j', lambda i, j: 2*i - j), ('i − j', lambda i, j: i - j), ('ij', lambda i, j: i*j), ('i + 2j', lambda i, j: i + 2*j), ('3i − j', lambda i, j: 3*i - j), ('i² − j', lambda i, j: i*i - j), ('2i + j', lambda i, j: 2*i + j)]
def m2a(v, rng):
    k = pick(v, rng, 0, lambda rr: rr.randrange(1, len(FS))); nm, f = FS[k]; i, j = pick(v, rng, (2, 1), lambda rr: (ri(rr, 1, 2), ri(rr, 1, 2)))
    return number(f'2 × 2 행렬 A 의 (i, j) 성분 aᵢⱼ 가 aᵢⱼ = {nm} 일 때, A 의 ({i}, {j}) 성분은?', f(i, j), f'i = {i}, j = {j} 를 넣는다: {nm} → {N(f(i,j))}.', chk=True)
def m2b(v, rng):
    k = pick(v, rng, 0, lambda rr: rr.randrange(1, len(FS))); nm, f = FS[k]
    A = [[f(i, j) for j in (1, 2)] for i in (1, 2)]
    w = [[[f(j, i) for j in (1, 2)] for i in (1, 2)], [[f(i, j) + 1 for j in (1, 2)] for i in (1, 2)], [[f(i - 1, j - 1) for j in (1, 2)] for i in (1, 2)], [[A[1][1], A[0][1]], [A[1][0], A[0][0] + 2]]]
    return choice(rng, f'2 × 2 행렬 A 의 (i, j) 성분이 aᵢⱼ = {nm} 일 때, 행렬 A 는?{NOTE}', M(A), [M(x) for x in w if x != A], f'a₁₁ = {N(A[0][0])}, a₁₂ = {N(A[0][1])}, a₂₁ = {N(A[1][0])}, a₂₂ = {N(A[1][1])} 를 차례로 놓는다.', chk=lambda: A[0][1] == f(1, 2))
def m3a(v, rng):
    a, b = pick(v, rng, (3, -2), lambda rr: (ri(rr, -6, 8), ri(rr, -6, 8))); p, q = pick(v, rng, (1, 5), lambda rr: (ri(rr, -5, 6), ri(rr, -5, 6)))
    return number(f'두 행렬 (x  {N(p)} ; {N(q)}  y) 와 ({N(a)}  {N(p)} ; {N(q)}  {N(b)}) 가 서로 같을 때, x + y 의 값은?{NOTE}', a + b, f'같은 자리 성분끼리 같다: x = {N(a)}, y = {N(b)}.', chk=True)
def m3b(v, rng):
    x, y = pick(v, rng, (2, 1), lambda rr: (ri(rr, -5, 6), ri(rr, -5, 6)))
    return number(f'두 행렬 (x + y  0 ; 1  x − y) 와 ({N(x+y)}  0 ; 1  {N(x-y)}) 가 서로 같을 때, x 의 값은?{NOTE}', x, f'x + y = {N(x+y)}, x − y = {N(x-y)} 를 더하면 2x = {N(2*x)}.', chk=True)
# 산: 실생활 표 → 행렬 (본문 124쪽 도입 수준 + aᵢⱼ 조건 나눔)
def m4a(v, rng):
    p, q = pick(v, rng, (1, 2), lambda rr: (ri(rr, 1, 4), ri(rr, 1, 4)))
    f = lambda i, j: p*i + j if i >= j else q*j - i
    return number(f'2 × 2 행렬 A 의 (i, j) 성분 aᵢⱼ 가 i ≥ j 이면 aᵢⱼ = {D(P([p,0],"i"))} + j, i < j 이면 aᵢⱼ = {D(P([q,0],"j"))} − i 일 때, a₁₂ 의 값은?', f(1, 2), f'i = 1, j = 2 는 i < j → {D(P([q,0],"j"))} − i 에 넣는다: {N(2*q)} − 1.', chk=True)
def m4b(v, rng):
    p, q = pick(v, rng, (1, 2), lambda rr: (ri(rr, 1, 4), ri(rr, 1, 4)))
    f = lambda i, j: p*i + j if i >= j else q*j - i
    s = sum(f(i, j) for i in (1, 2) for j in (1, 2))
    return number(f'2 × 2 행렬 A 의 (i, j) 성분 aᵢⱼ 가 i ≥ j 이면 aᵢⱼ = {D(P([p,0],"i"))} + j, i < j 이면 aᵢⱼ = {D(P([q,0],"j"))} − i 일 때, A 의 모든 성분의 합은?', s, f'a₁₁ = {f(1,1)}, a₁₂ = {f(1,2)}, a₂₁ = {f(2,1)}, a₂₂ = {f(2,2)} 를 더한다.', chk=True)
def ex1(v, rng):
    m = rmat(rng if v else random.Random(11), 2, 2, 100, 900); m = [[x // 10 * 10 for x in r] for r in m]
    names = pick(v, rng, ('김밥', '라면'), lambda rr: rr.choice([('김밥', '라면'), ('우유', '빵'), ('공책', '볼펜'), ('사과', '배')]))
    return number(f'매점 두 곳의 판매량을 행렬 {M(m)} 로 나타냈다. 제1행은 가 매점, 제2행은 나 매점이고 제1열은 {names[0]}, 제2열은 {names[1]}의 판매량(개)이다. 나 매점의 {names[0]} 판매량은?{NOTE}', m[1][0], f'나 매점 = 제2행, {names[0]} = 제1열 → (2, 1) 성분.', chk=True)
L = dict(id='cm1-33', no=33, title='행렬의 뜻', unit='Ⅳ-1 행렬과 그 연산', pages='124 ~ 126', goal='행렬의 뜻을 알고, 실생활 상황을 행렬로 표현할 수 있다.',
  review='중학교: 표 읽기 · 순서쌍 (x, y)', intro='매점 두 곳의 품목별 판매량 표 — 괄호로 묶어 숫자만 남기면 행렬이 된다.',
  concepts=[dict(id='c1', title='행렬 · 행 · 열 · 성분', say='수나 문자를 직사각형 모양으로 배열해 괄호로 묶은 것 = 행렬. 가로줄 = 행, 세로줄 = 열. m × n 행렬, (i, j) 성분 = 제i행과 제j열이 만나는 곳.', check=dict(type='ox', q='행이 2개, 열이 3개인 행렬은 3 × 2 행렬이다.', ch=[], a='X', why='행 × 열 순서 → 2 × 3 행렬.')),
            dict(id='c2', title='서로 같은 행렬', say='두 행렬이 같은 꼴이고 같은 자리의 성분이 모두 같을 때 「서로 같다」고 하고 A = B 로 쓴다.', check=dict(type='ox', q='성분에 쓰인 수들이 같으면 자리가 달라도 두 행렬은 서로 같다.', ch=[], a='X', why='같은 자리의 성분끼리 각각 같아야 한다.'))],
  mons=[dict(id='m1', title='문제 1 · 꼴과 성분', subs=[m1a, m1b]), dict(id='m2', title='문제 2 · aᵢⱼ 로 행렬 만들기', subs=[m2a, m2b]), dict(id='m3', title='문제 3 · 서로 같은 행렬', subs=[m3a, m3b]),
        dict(id='m4', title='문제 4 · 조건이 나뉜 성분', hard=True, subs=[m4a, m4b]), dict(id='m5', title='표를 행렬로 읽기', extra=True, subs=[ex1])],
  boss=[(m1a, 'c1', 'm1'), (m1b, 'c1', 'm1'), (m2a, 'c1', 'm2'), (m3a, 'c2', 'm3')],
  hard_from='산 = 중단원 마무리 수준(i ≥ j / i < j 로 나뉜 aᵢⱼ · 본문에 어려운 문제가 없어 넣음)',
  motion=[dict(title='표가 행렬이 되기까지', key='표에서 제목을 지우고 괄호로 묶으면 행렬 · 행은 가로, 열은 세로.', scenes=['카드에 매점 판매량 표(2줄 × 3칸)가 놓인다.', '줄 제목과 칸 제목이 흐려지고 숫자만 남아 큰 괄호가 감싼다.', '가로줄이 차례로 빛나며 「제1행 · 제2행」, 세로줄이 빛나며 「제1열 · 제2열 · 제3열」.', '한 칸이 빛나며 「(2, 1) 성분」 꼬리표가 붙는다.'], end='행 × 열 = 2 × 3 행렬')],
  notes=['행렬 표기: 글로는 (1  2 ; 3  4) 처럼 「;」 로 행을 나눔 — 웹앱 · 학습지에서는 손발이 큰 괄호 2줄 표기로 바꿔 그리기를 권함(글 표기는 단독 풀이용 임시).'])
if __name__ == '__main__': write(L)
