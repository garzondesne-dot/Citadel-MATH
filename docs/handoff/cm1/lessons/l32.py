from cm1lib import *
from itertools import combinations
SB = str.maketrans("0123456789nr", "₀₁₂₃₄₅₆₇₈₉ₙᵣ")
Cn = lambda n, r: f'{str(n).translate(SB)}C{str(r).translate(SB)}'
C = math.comb
def m1a(v, rng):
    n, r = pick(v, rng, (7, 3), lambda rr: (ri(rr, 6, 10), ri(rr, 3, 4)))
    cnt = sum(1 for c in combinations(range(n), r) if 0 in c)
    return number(f'학생 {n}명 중에서 {r}명을 뽑을 때, 특정한 학생 1명을 반드시 포함하여 뽑는 방법의 수는?', C(n - 1, r - 1), f'그 학생은 이미 뽑혔다 → 남은 {n-1}명에서 {r-1}명: {Cn(n-1, r-1)}.', chk=lambda: cnt == C(n - 1, r - 1))
def m1b(v, rng):
    n, r = pick(v, rng, (7, 3), lambda rr: (ri(rr, 6, 10), ri(rr, 2, 4)))
    cnt = sum(1 for c in combinations(range(n), r) if 0 not in c)
    return number(f'학생 {n}명 중에서 {r}명을 뽑을 때, 특정한 학생 1명을 빼고 뽑는 방법의 수는?', C(n - 1, r), f'그 학생을 뺀 {n-1}명에서 {r}명: {Cn(n-1, r)}.', chk=lambda: cnt == C(n - 1, r))
def m2a(v, rng):
    a, b, x, y = pick(v, rng, (5, 4, 2, 2), lambda rr: (ri(rr, 3, 7), ri(rr, 3, 6), ri(rr, 1, 2), ri(rr, 1, 2)))
    return number(f'빨간 공 {a}개와 파란 공 {b}개가 있다. 공은 모두 서로 다르다. 빨간 공 {x}개와 파란 공 {y}개를 뽑는 방법의 수는?', C(a, x) * C(b, y), f'{Cn(a, x)} × {Cn(b, y)} = {C(a,x)} × {C(b,y)} (동시에 일어나므로 곱).', chk=True)
def m2b(v, rng):
    a, b, r = pick(v, rng, (4, 3, 2), lambda rr: (ri(rr, 3, 6), ri(rr, 3, 5), 2))
    cnt = sum(1 for c in combinations(range(a + b), r) if all(i < a for i in c) or all(i >= a for i in c))
    return number(f'남학생 {a}명, 여학생 {b}명 중에서 2명을 뽑을 때, 두 명의 성별이 같도록 뽑는 방법의 수는?', C(a, 2) + C(b, 2), f'남 2명 {C(a,2)} + 여 2명 {C(b,2)} (동시에 일어나지 않으므로 합).', chk=lambda: cnt == C(a, 2) + C(b, 2))
def m3a(v, rng):
    n = pick(v, rng, 6, lambda rr: ri(rr, 4, 14))
    return number(f'어느 세 점도 한 직선 위에 있지 않은 서로 다른 점 {n}개가 있다. 이 중 세 점을 꼭짓점으로 하는 삼각형의 개수는?', C(n, 3), f'세 점을 고르면 삼각형 하나 → {Cn(n, 3)}.', chk=True)
def m3b(v, rng):
    a, b = pick(v, rng, (4, 5), lambda rr: (ri(rr, 3, 6), ri(rr, 3, 7)))
    return number(f'가로로 평행한 직선 {a}개와 세로로 평행한 직선 {b}개가 서로 만난다. 이 직선들로 만들어지는 평행사변형의 개수는?', C(a, 2) * C(b, 2), f'가로 2개 {Cn(a,2)} × 세로 2개 {Cn(b,2)} = {C(a,2)} × {C(b,2)}.', chk=True)
# 산: 「적어도」 = 전체 − 반대 (중단원)
def HB(v, rng): return pick(v, rng, (5, 4, 3), lambda rr: (ri(rr, 4, 6), ri(rr, 3, 5), 3))
def m4a(v, rng):
    a, b, r = HB(v, rng); return number(f'남학생 {a}명, 여학생 {b}명 중에서 {r}명을 뽑는 전체 방법의 수는?', C(a + b, r), f'{a+b}명에서 {r}명: {Cn(a+b, r)}.', chk=True)
def m4b(v, rng):
    a, b, r = HB(v, rng); return number(f'남학생 {a}명, 여학생 {b}명 중에서 {r}명을 뽑을 때, 남학생만 {r}명 뽑는 방법의 수는?', C(a, r), f'남학생 {a}명에서 {r}명: {Cn(a, r)}.', chk=True)
def m4c(v, rng):
    a, b, r = HB(v, rng)
    cnt = sum(1 for c in combinations(range(a + b), r) if any(i >= a for i in c))
    return number(f'남학생 {a}명, 여학생 {b}명 중에서 {r}명을 뽑을 때, 여학생이 적어도 1명 포함되도록 뽑는 방법의 수는?', C(a + b, r) - C(a, r), f'전체 {C(a+b,r)} − 남학생만 {C(a,r)} (「적어도」는 반대를 뺀다).', chk=lambda: cnt == C(a + b, r) - C(a, r))
def ex1(v, rng):
    n = pick(v, rng, 6, lambda rr: ri(rr, 5, 14))
    return number(f'볼록 {n}각형의 대각선의 개수는?', C(n, 2) - n, f'꼭짓점 2개 고르기 {Cn(n,2)} = {C(n,2)} 에서 변 {n}개를 뺀다.', chk=lambda: C(n, 2) - n == n * (n - 3) // 2)
L = dict(id='cm1-32', no=32, title='조합의 활용', unit='Ⅲ-1 경우의 수', pages='113 · 중단원 115 ~ 117', goal='조합을 이용하여 여러 가지 경우의 수 문제를 해결할 수 있다.',
  review='31차시: ₙCᵣ = ₙPᵣ / r! · ₙCᵣ = ₙCₙ₋ᵣ', intro='동아리 7명 중 3명을 뽑는데 「회장은 꼭 가야 한다」는 조건이 붙으면 경우의 수는 어떻게 달라질까?',
  concepts=[dict(id='c1', title='조건이 붙은 뽑기', say='꼭 포함 → 미리 뽑아 두고 나머지에서 고른다. 제외 → 빼 놓고 고른다. 종류별로 뽑기 → 각각 구해 곱한다.', check=dict(type='ox', q='7명 중 3명을 뽑을 때 특정한 1명을 꼭 포함하는 방법의 수는 ₆C₂ 이다.', ch=[], a='O', why='그 1명은 정해졌으니 남은 6명에서 2명만 고른다.')),
            dict(id='c2', title='도형 세기와 「적어도」', say='점 2개 = 선분, 점 3개 = 삼각형. 「적어도 하나」는 전체에서 「하나도 없는 경우」를 뺀다.', check=dict(type='ox', q='「적어도 1명은 여학생」의 반대는 「여학생이 1명뿐」이다.', ch=[], a='X', why='반대는 「여학생이 한 명도 없다(모두 남학생)」.'))],
  mons=[dict(id='m1', title='문제 1 · 꼭 포함 / 제외', subs=[m1a, m1b]), dict(id='m2', title='문제 2 · 종류별로 뽑기', subs=[m2a, m2b]), dict(id='m3', title='문제 3 · 도형의 개수', subs=[m3a, m3b]),
        dict(id='m4', title='문제 4 · 적어도 한 명', hard=True, subs=[m4b, m4c]), dict(id='m5', title='대각선의 개수', extra=True, subs=[ex1])],
  boss=[(m1a, 'c1', 'm1'), (m2a, 'c1', 'm2'), (m3a, 'c2', 'm3'), (m2b, 'c1', 'm2')],
  hard_from='산 = 중단원 마무리 수준(「적어도」 · 본문에 어려운 문제가 없어 넣음)',
  motion=[dict(title='적어도 = 전체 − 하나도 없음', key='세기 어려운 쪽 대신 반대쪽을 세어 뺀다.', scenes=['카드에 「여학생이 적어도 1명」 — 여 1명 · 2명 · 3명 세 갈래가 복잡하게 펼쳐진다.', '화면이 뒤집히며 반대쪽 「모두 남학생」 한 갈래만 남는다.', '전체 막대에서 「모두 남학생」 조각이 떨어져 나간다.', '남은 막대에 답이 뜬다.'], end='적어도 = 전체 − 반대', at='c2')],
  notes=['Ⅲ 단원 마지막 차시 — 중단원 문제 유형(포함 · 제외 · 도형 · 적어도)을 모음.'])
if __name__ == '__main__': write(L)
