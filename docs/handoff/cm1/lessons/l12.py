from cm1lib import *
def m1a(v, rng):
    k = pick(v, rng, 3, lambda r: ri(r, 2, 9))
    return choice(rng, f'√(−{k*k}) 을 허수단위 i 를 써서 나타내면?', f'{k}i', [f'−{k}i', f'−{k}', f'{k*k}i', f'{k}'], f'a > 0 일 때 √(−a) = √a i → √{k*k} i.', chk=True)
def m1b(v, rng):
    k = pick(v, rng, 5, lambda r: r.choice([2, 3, 5, 6, 7]))
    return choice(rng, f'−{k} 의 제곱근을 모두 구한 것은?', f'√{k} i, −√{k} i', [f'√{k} i', f'√{k}, −√{k}', f'−√{k} i', f'{k}i, −{k}i'], f'제곱해서 −{k} 가 되는 수 = ±√{k} i.', chk=True)
def m2a(v, rng):
    a, b = pick(v, rng, (2, 8), lambda r: r.choice([(2, 8), (3, 12), (2, 18), (3, 27), (5, 20), (2, 32), (4, 9)])); p = int((a * b) ** .5)
    return number(f'√(−{a}) × √(−{b}) 를 계산하면?', -p, f'√{a} i × √{b} i = √{a*b} i² = {p} × (−1). (√{a*b} 로 바로 계산하면 틀림)', chk=lambda: p * p == a * b)
def m2b(v, rng):
    a, b = pick(v, rng, (12, 3), lambda r: r.choice([(12, 3), (18, 2), (27, 3), (20, 5), (32, 2), (8, 2), (50, 2)])); q = int((a // b) ** .5)
    return choice(rng, f'√{a} ÷ √(−{b}) 를 계산하면?', f'−{q}i', [f'{q}i', f'{q}', f'−{q}', f'{a//b}i'], f'√{a} / (√{b} i) = {q}/i = {q}i/i² = −{q}i.', chk=lambda: q * q * b == a)
def m3a(v, rng):
    n = pick(v, rng, 10, lambda r: ri(r, 5, 99)); val = ['1', 'i', '−1', '−i'][n % 4]
    return choice(rng, f'i{str(n).translate(SUP)} 의 값은?', val, [x for x in ['1', 'i', '−1', '−i'] if x != val], f'i⁴ = 1 → {n} 을 4 로 나눈 나머지 {n % 4} 만 본다.', chk=lambda: abs(1j ** n - {'1': 1, 'i': 1j, '−1': -1, '−i': -1j}[val]) < 1e-9)
def m3b(v, rng):
    k = pick(v, rng, 1, lambda r: ri(r, 1, 20))
    return number(f'i{str(k).translate(SUP) if k > 1 else ""} + i{str(k+1).translate(SUP)} + i{str(k+2).translate(SUP)} + i{str(k+3).translate(SUP)} 의 값은?', 0, '잇따른 네 거듭제곱은 i, −1, −i, 1 이 한 번씩 → 합은 0.', chk=lambda: abs(sum(1j ** (k + t) for t in range(4))) < 1e-9)
# 산: i + i² + … + iⁿ (중단원 수준)
def NN(v, rng): return pick(v, rng, 50, lambda r: r.choice([22, 26, 30, 35, 41, 42, 45, 46, 53, 57, 61, 62]))
def hs(v, rng):
    n = NN(v, random.Random(rng.random() if v else 1)); return n, f'i + i² + i³ + … + i{str(n).translate(SUP)} 의 값을 구하려고 한다.'
def m4a(v, rng):
    n, s = hs(v, rng)
    return choice(rng, f'{s} 앞에서부터 네 개씩 묶을 때, 한 묶음 i + i² + i³ + i⁴ 의 값은?', '0', ['1', 'i', '−1', '4'], 'i + (−1) + (−i) + 1 = 0.', chk=True)
def m4b(v, rng):
    n, s = hs(v, rng)
    return number(f'{s} 항 {n}개를 네 개씩 묶으면 몇 개가 남는가?', n % 4, f'{n} = 4 × {n//4} + {n%4}.', chk=True)
def m4c(v, rng):
    n, s = hs(v, rng); r = n % 4; val = [(0, 0), (0, 1), (-1, 1), (-1, 0)][r]
    return choice(rng, f'i + i² + i³ + … + i{str(n).translate(SUP)} 의 값은?', cf(*val), [x for x in ['0', 'i', '−1 + i', '−1', '1', '−i'] if x != cf(*val)][:4], f'묶음은 모두 0, 남는 {r}개는 앞의 {r}개(i, −1, −i 순)와 같다.' if r else '네 개씩 딱 떨어져 모두 0.', chk=lambda: abs(sum(1j ** t for t in range(1, n + 1)) - complex(*val)) < 1e-9)
def ex1(v, rng):
    k = pick(v, rng, 2, lambda r: ri(r, 2, 9))
    return choice(rng, f'이차방정식 x² + {k*k} = 0 의 해는?', f'x = {k}i 또는 x = −{k}i', [f'x = {k} 또는 x = −{k}', f'x = {k}i', '해가 없다', f'x = {k*k}i 또는 x = −{k*k}i'], f'x² = −{k*k} → x = ±√(−{k*k}) = ±{k}i.', chk=True)
L = dict(id='cm1-12', no=12, title='음수의 제곱근과 i 의 거듭제곱', unit='Ⅱ-1 복소수와 이차방정식', pages='50 ~ 51 · 61 (중단원)', goal='음수의 제곱근을 i 로 나타내고, i 의 거듭제곱의 규칙을 이용할 수 있다.',
  review='10차시: i² = −1 · 11차시: 곱셈에서 i² 바꾸기', intro='√(−9) 는 무엇일까? i 의 거듭제곱 i, i², i³, i⁴ … 는 어떻게 돌아갈까?',
  concepts=[dict(id='c1', title='음수의 제곱근', say='a > 0 일 때 √(−a) = √a i · −a 의 제곱근 = ±√a i. 음수의 제곱근끼리 곱할 때는 먼저 i 로 바꾼다.', check=dict(type='ox', q='√(−2) × √(−3) = √6 이다.', ch=[], a='X', why='√2 i × √3 i = √6 i² = −√6.')),
            dict(id='c2', title='i 의 거듭제곱', say='i, −1, −i, 1 이 네 개마다 되풀이된다(i⁴ = 1) → 지수를 4 로 나눈 나머지만 본다.')],
  mons=[dict(id='m1', title='문제 1 · 음수의 제곱근', subs=[m1a, m1b]), dict(id='m2', title='문제 2 · 음수의 제곱근의 계산', subs=[m2a, m2b]), dict(id='m3', title='문제 3 · i 의 거듭제곱', subs=[m3a, m3b]),
        dict(id='m4', title='문제 4 · i 를 쭉 더하기', hard=True, subs=[m4a, m4b, m4c]), dict(id='m5', title='해가 허수인 이차방정식', extra=True, subs=[ex1])],
  boss=[(m1a, 'c1', 'm1'), (m2a, 'c1', 'm2'), (m3a, 'c2', 'm3'), (m4c, 'c2', 'm4')],
  hard_from='산 = 중단원 수준의 규칙 찾기(본문에 어려운 문제가 없어 넣음 · i 의 거듭제곱 합)',
  motion=[dict(title='i 는 네 박자로 돈다', key='i, −1, −i, 1 이 네 개마다 되풀이된다.', scenes=['카드에 시계처럼 네 칸(1, i, −1, −i)이 둥글게 놓인다.', '커서가 「× i」 단추를 누를 때마다 바늘이 한 칸씩 돈다: i¹, i², i³, i⁴.', '지수 10 을 넣으면 바늘이 두 바퀴 반을 돌아 −1 에 멈춘다.', '10 ÷ 4 의 나머지 2 가 강조된다.'], end='iⁿ 은 n 을 4 로 나눈 나머지로 정한다', at='c2')],
  notes=['i 의 거듭제곱은 교과서 본문보다 중단원 · 탐구 쪽 내용 — 음수의 제곱근만으로는 45분이 비어 한 차시로 묶음.', '√(−a) 는 괄호를 써서 범위를 분명히 함(지침 검사 14).'])
if __name__ == '__main__': write(L)
