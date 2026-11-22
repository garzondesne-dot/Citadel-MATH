from cm1lib import *
from itertools import combinations
SB = str.maketrans("0123456789nr", "₀₁₂₃₄₅₆₇₈₉ₙᵣ")
Cn = lambda n, r: f'{str(n).translate(SB)}C{str(r).translate(SB)}'
Pn = lambda n, r: f'{str(n).translate(SB)}P{str(r).translate(SB)}'
def m1a(v, rng):
    n, r = pick(v, rng, (5, 2), lambda rr: (lambda n_: (n_, ri(rr, 2, 3)))(ri(rr, 4, 9)))
    return number(f'{Cn(n, r)} 의 값은?', math.comb(n, r), f'{Pn(n, r)} ÷ {r}! = ' + ' × '.join(str(n - i) for i in range(r)) + f' ÷ {math.factorial(r)}.', chk=True)
def m1b(v, rng):
    n, r = pick(v, rng, (7, 5), lambda rr: (lambda n_: (n_, n_ - ri(rr, 1, 2)))(ri(rr, 5, 12)))
    return number(f'{Cn(n, r)} 의 값은?', math.comb(n, r), f'ₙCᵣ = ₙCₙ₋ᵣ → {Cn(n, n - r)} 로 바꾸어 계산하면 편하다.', chk=True)
def m2a(v, rng):
    n, r = pick(v, rng, (5, 3), lambda rr: (lambda n_: (n_, ri(rr, 2, 3)))(ri(rr, 4, 9)))
    return choice(rng, f'{Cn(n, r)} 와 {Pn(n, r)} 사이의 관계로 옳은 것은?', f'{Cn(n, r)} × {r}! = {Pn(n, r)}', [f'{Cn(n, r)} = {Pn(n, r)} × {r}!', f'{Cn(n, r)} + {r}! = {Pn(n, r)}', f'{Cn(n, r)} × {n}! = {Pn(n, r)}'], f'{r}개를 뽑는 조합마다 줄 세우는 방법이 {r}! 가지 → 곱하면 순열.', chk=lambda: math.comb(n, r) * math.factorial(r) == math.perm(n, r))
def m2b(v, rng):
    n = pick(v, rng, 6, lambda rr: ri(rr, 4, 12))
    return number(f'{Cn("n", 2)} = {math.comb(n, 2)} 를 만족시키는 자연수 n 의 값은?', n, f'n(n − 1)/2 = {math.comb(n, 2)} → n(n − 1) = {n*(n-1)} = {n} × {n-1}.', chk=True)
def m3a(v, rng):
    n, r = pick(v, rng, (6, 2), lambda rr: (ri(rr, 5, 10), ri(rr, 2, 3)))
    return number(f'학생 {n}명 중에서 대표 {r}명을 뽑는 방법의 수는? (대표끼리는 구별하지 않는다)', math.comb(n, r), f'순서가 없는 뽑기 → {Cn(n, r)}.', chk=lambda: len(list(combinations(range(n), r))) == math.comb(n, r))
def m3b(v, rng):
    n = pick(v, rng, 6, lambda rr: ri(rr, 4, 10)); k = pick(v, rng, 0, lambda rr: rr.choice([0, 1]))
    q = f'{n}명이 서로 한 번씩 악수를 할 때, 악수의 총 횟수는?' if k == 0 else f'{n}개 팀이 서로 한 번씩 경기를 할 때, 경기의 총 수는?'
    return number(q, math.comb(n, 2), f'{n} 중에서 2 를 뽑는 것과 같다 → {Cn(n, 2)}.', chk=True)
# 산: 순열과 조합 구별 (본문 113쪽 수준 · 뽑고 나서 줄 세우기)
def HS(v, rng): return pick(v, rng, (4, 3, 2, 1), lambda rr: (ri(rr, 3, 6), ri(rr, 3, 5), ri(rr, 1, 2), ri(rr, 1, 2)))
def hs(v, rng):
    a, b, x, y = HS(v, random.Random(rng.random() if v else 1)); return a, b, x, y, f'남학생 {a}명, 여학생 {b}명 중에서 남학생 {x}명, 여학생 {y}명을 뽑아 한 줄로 세우려고 한다.'
def m4a(v, rng):
    a, b, x, y, s = hs(v, rng); return number(f'{s} 남학생 {x}명을 뽑는 방법의 수는?', math.comb(a, x), f'{Cn(a, x)}.', chk=True)
def m4b(v, rng):
    a, b, x, y, s = hs(v, rng); return number(f'{s} 남학생 {x}명과 여학생 {y}명을 뽑는 방법의 수는? (아직 줄은 세우지 않는다)', math.comb(a, x) * math.comb(b, y), f'{Cn(a, x)} × {Cn(b, y)} = {math.comb(a,x)} × {math.comb(b,y)} (곱의 법칙).', chk=True)
def m4c(v, rng):
    a, b, x, y, s = hs(v, rng); t = x + y
    return number(f'{s} 뽑은 {t}명을 한 줄로 세우는 방법까지 생각한 전체 방법의 수는?', math.comb(a, x) * math.comb(b, y) * math.factorial(t), f'뽑기 {math.comb(a,x)*math.comb(b,y)}가지 × 줄 세우기 {t}! = {math.factorial(t)}.', chk=True)
def ex1(v, rng):
    n = pick(v, rng, 5, lambda rr: ri(rr, 4, 14))
    return number(f'원 위에 서로 다른 점 {n}개가 있다. 이 중 두 점을 이어 만들 수 있는 선분의 개수는?', math.comb(n, 2), f'두 점을 고르면 선분 하나 → {Cn(n, 2)}.', chk=True)
L = dict(id='cm1-31', no=31, title='조합', unit='Ⅲ-1 경우의 수', pages='111 ~ 112', goal='조합의 개념을 이해하고, 조합의 수를 구할 수 있다.',
  review='29차시: ₙPᵣ 과 n! · 「순서가 다르면 다른 것」', intro='봉사 활동 지원자 5명 중 2명을 뽑는다 — 누구를 먼저 뽑든 같은 2명이면 같은 것 = 조합.',
  concepts=[dict(id='c1', title='조합과 ₙCᵣ', say='서로 다른 n 개에서 순서를 생각하지 않고 r 개를 택하는 것 = 조합. ₙCᵣ = ₙPᵣ / r! = n! / {r!(n − r)!}.', check=dict(type='ox', q='5명 중 회장, 부회장을 뽑는 방법의 수는 ₅C₂ 이다.', ch=[], a='X', why='역할이 다르면 순서가 있다 → ₅P₂.')),
            dict(id='c2', title='ₙCᵣ = ₙCₙ₋ᵣ', say='r 개를 뽑는 것 = 남길 n − r 개를 정하는 것. ₙC₀ = ₙCₙ = 1.', check=dict(type='ox', q='₇C₅ = ₇C₂ 이다.', ch=[], a='O', why='7개 중 5개를 뽑는 것은 남길 2개를 고르는 것과 같다.'))],
  mons=[dict(id='m1', title='문제 1 · ₙCᵣ 계산', subs=[m1a, m1b]), dict(id='m2', title='문제 2 · 순열과의 관계', subs=[m2a, m2b]), dict(id='m3', title='문제 3 · 뽑기만 하기', subs=[m3a, m3b]),
        dict(id='m4', title='문제 4 · 뽑은 뒤 줄 세우기', hard=True, subs=[m4b, m4c]), dict(id='m5', title='점을 이어 선분 만들기', extra=True, subs=[ex1])],
  boss=[(m1a, 'c1', 'm1'), (m1b, 'c2', 'm1'), (m3a, 'c1', 'm3'), (m3b, 'c1', 'm3')],
  hard_from='산 = 중단원 수준(조합으로 뽑고 순열로 세우기 · 본문에 어려운 문제가 없어 넣음)',
  motion=[dict(title='순서를 지우면 조합', key='₅P₂ = 20 가지에서 (A, B) 와 (B, A) 를 하나로 보면 ₅C₂ = 10.', scenes=['카드에 사람 칩 A ~ E, 「2명 뽑아 줄 세우기」 20쌍이 쭉 나열된다.', 'AB 와 BA 처럼 같은 두 사람끼리 선으로 이어진다.', '이어진 둘이 하나로 합쳐지며 10묶음이 남는다.', '20 ÷ 2! = 10 이 뜬다.'], end='₅C₂ = ₅P₂ ÷ 2! = 10')],
  notes=['「뽑기만(조합)」과 「뽑아서 줄 세우기(순열)」를 가르는 것이 이 차시의 핵심 — 산에서 둘을 이어 붙임.'])
if __name__ == '__main__': write(L)
