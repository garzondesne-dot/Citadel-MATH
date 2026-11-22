from cm1lib import *
Pn = lambda n, r: f'{str(n).translate(str.maketrans("0123456789", "₀₁₂₃₄₅₆₇₈₉"))}P{str(r).translate(str.maketrans("0123456789", "₀₁₂₃₄₅₆₇₈₉"))}'
def m1a(v, rng):
    n, r = pick(v, rng, (5, 2), lambda rr: (lambda n_: (n_, ri(rr, 2, min(4, n_))))(ri(rr, 4, 8)))
    return number(f'{Pn(n, r)} 의 값은?', math.perm(n, r), f'{n} 부터 1 씩 줄여 가며 {r}개를 곱한다: ' + ' × '.join(str(n - i) for i in range(r)) + '.', chk=True)
def m1b(v, rng):
    n = pick(v, rng, 6, lambda rr: ri(rr, 4, 12))
    return number(f'{Pn("n", 2).replace("n", "ₙ")} = {n*(n-1)} 을 만족시키는 자연수 n 의 값은?'.replace('ₙP', 'ₙP'), n, f'n(n − 1) = {n*(n-1)} = {n} × {n-1}.', chk=lambda: math.perm(n, 2) == n * (n - 1))
def m2a(v, rng):
    n, m = pick(v, rng, (5, 0), lambda rr: (lambda n_: (n_, n_ - ri(rr, 1, 3)))(ri(rr, 5, 9)))
    if m == 0: return number(f'{n}! 의 값은?', math.factorial(n), ' × '.join(str(t) for t in range(n, 0, -1)) + '.', chk=True)
    return number(f'{n}! ÷ {m}! 의 값은?', math.factorial(n) // math.factorial(m), f'{m}! 부분이 약분되어 ' + ' × '.join(str(t) for t in range(n, m, -1)) + ' 만 남는다.', chk=True)
def m2b(v, rng):
    n, r = pick(v, rng, (6, 3), lambda rr: (lambda n_: (n_, ri(rr, 2, n_ - 2)))(ri(rr, 5, 9)))
    return choice(rng, f'{Pn(n, r)} 을 계승(!)을 써서 나타내면?', f'{n}! / {n-r}!', [f'{n}! / {r}!' if r != n - r else f'{n}! / {r+1}!', f'{n}! × {r}!', f'{n-r}! / {n}!', f'{n}!'], f'ₙPᵣ = n! / (n − r)! → 뒤에 남는 {n-r}! 로 나눈다.', chk=lambda: math.factorial(n) // math.factorial(n - r) == math.perm(n, r))
def m3a(v, rng):
    n, r = pick(v, rng, (5, 3), lambda rr: (lambda n_: (n_, ri(rr, 2, 4)))(ri(rr, 5, 8)))
    return number(f'학생 {n}명 중에서 {r}명을 뽑아 한 줄로 세우는 방법의 수는?', math.perm(n, r), f'서로 다른 {n}개에서 {r}개를 택해 일렬로 → {Pn(n, r)}.', chk=True)
def m3b(v, rng):
    n = pick(v, rng, 6, lambda rr: ri(rr, 5, 12)); roles = pick(v, rng, 2, lambda rr: rr.choice([2, 3]))
    rn = '회장 1명, 부회장 1명' if roles == 2 else '회장 1명, 부회장 1명, 총무 1명'
    return number(f'학생 {n}명 중에서 {rn}을 뽑는 방법의 수는?', math.perm(n, roles), f'역할이 서로 다르므로 순서가 있는 뽑기 → {Pn(n, roles)}.', chk=True)
# 산: ₙP₃ = k·ₙP₂ (중단원 수준)
def HN(v, rng): return pick(v, rng, (6, 4), lambda rr: (lambda n_: (n_, n_ - 2))(ri(rr, 4, 12)))
Pn_ = lambda r: f'ₙP{str(r).translate(str.maketrans("0123456789", "₀₁₂₃₄₅₆₇₈₉"))}'
def hs(v, rng):
    n, k = HN(v, random.Random(rng.random() if v else 1)); return n, k, f'등식 {Pn_(3)} = {k} × {Pn_(2)} 를 만족시키는 자연수 n (n ≥ 3) 에 대하여'
def m4a(v, rng):
    n, k, s = hs(v, rng)
    return choice(rng, f'{s} 등식을 n 의 식으로 풀어 쓰면?', f'n(n − 1)(n − 2) = {k}n(n − 1)', [f'n(n − 1)(n − 2) = {k}n(n − 2)', f'n³ = {k}n²', f'3n = {2*k}n'], 'ₙP₃ = n(n − 1)(n − 2), ₙP₂ = n(n − 1).', chk=True)
def m4b(v, rng):
    n, k, s = hs(v, rng)
    return choice(rng, f'{s} n(n − 1)(n − 2) = {k}n(n − 1) 의 양변을 n(n − 1) 로 나누면? (n ≥ 3 이므로 n(n − 1) ≠ 0)', f'n − 2 = {k}', [f'n − 1 = {k}', f'n = {k}', f'n + 2 = {k}'], '양변에 똑같이 들어 있는 n(n − 1) 을 약분한다.', chk=True)
def m4c(v, rng):
    n, k, s = hs(v, rng); return number(f'{s} n 의 값은?', n, f'n − 2 = {k}.', chk=lambda: math.perm(n, 3) == k * math.perm(n, 2))
def ex1(v, rng):
    n, k = pick(v, rng, (4, 0), lambda rr: (ri(rr, 3, 7), rr.choice([0, 1, 2])))
    q = [f'서로 다른 책 {n}권을 책꽂이에 한 줄로 모두 꽂는 방법의 수는?', f'학생 {n}명을 한 줄로 세우는 방법의 수는?', f'서로 다른 깃발 {n}개를 한 줄로 모두 거는 방법의 수는?'][k]
    return number(q, math.factorial(n), f'{n}개를 모두 일렬로 → {n}!.', chk=True)
L = dict(id='cm1-29', no=29, title='순열', unit='Ⅲ-1 경우의 수', pages='107 ~ 109', goal='순열의 개념을 이해하고, 순열의 수를 구할 수 있다.',
  review='27차시: 곱의 법칙 · 28차시: 서로 다른 색으로 칠하기(한 번 쓴 것은 다시 못 씀)', intro='DNA 염기 4개 중 3개를 골라 줄 세우면? 고르는 순서가 다르면 다른 것으로 센다 = 순열.',
  concepts=[dict(id='c1', title='순열과 ₙPᵣ', say='서로 다른 n 개에서 r 개를 택하여 일렬로 나열하는 것 = 순열. ₙPᵣ = n(n − 1)(n − 2) … (n − r + 1) (r 개의 곱).', check=dict(type='ox', q='₅P₂ = 5 × 2 = 10 이다.', ch=[], a='X', why='5 부터 2개를 곱한다 → 5 × 4 = 20.')),
            dict(id='c2', title='계승 n!', say='n! = n(n − 1) … 2 · 1 = ₙPₙ · 0! = 1, ₙP₀ = 1 · ₙPᵣ = n! / (n − r)!.', check=dict(type='ox', q='0! = 0 이다.', ch=[], a='X', why='0! = 1 로 약속한다.'))],
  mons=[dict(id='m1', title='문제 1 · ₙPᵣ 계산', subs=[m1a, m1b]), dict(id='m2', title='문제 2 · 계승', subs=[m2a, m2b]), dict(id='m3', title='문제 3 · 뽑아서 줄 세우기', subs=[m3a, m3b]),
        dict(id='m4', title='문제 4 · ₙP₃ = k × ₙP₂', hard=True, subs=[m4a, m4b, m4c]), dict(id='m5', title='모두 줄 세우기', extra=True, subs=[ex1])],
  boss=[(m1a, 'c1', 'm1'), (m2a, 'c2', 'm2'), (m3a, 'c1', 'm3'), (m3b, 'c1', 'm3')],
  hard_from='산 = 중단원 수준(순열의 수 등식 · 본문에 어려운 문제가 없어 넣음)',
  motion=[dict(title='자리마다 남은 사람 수', key='₅P₃ = 5 × 4 × 3 — 한 자리 채울 때마다 고를 수 있는 사람이 하나씩 준다.', scenes=['카드에 사람 칩 5개와 빈 의자 3개.', '첫 의자에 누구든 앉을 수 있다 → 「5」.', '한 명이 앉으면 남은 칩 4개 → 둘째 의자 「4」, 셋째 「3」.', '5 × 4 × 3 = 60 이 뜬다.'], end='₅P₃ = 5 × 4 × 3 = 60')],
  notes=['ₙPᵣ 표기는 아래 첨자 글자(₅P₂)로 적음 — 화면 글꼴에서 깨지지 않는지 손발 확인 거리.'])
if __name__ == '__main__': write(L)
