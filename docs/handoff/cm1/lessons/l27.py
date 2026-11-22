from cm1lib import *
from itertools import product
def m1a(v, rng):
    a, b = pick(v, rng, (4, 7), lambda r: tuple(sorted(r.sample(range(2, 13), 2))))
    cnt = lambda s: sum(1 for x, y in product(range(1, 7), repeat=2) if x + y == s)
    return number(f'서로 다른 주사위 두 개를 동시에 던질 때, 나오는 눈의 수의 합이 {a} 또는 {b} 인 경우의 수는?', cnt(a) + cnt(b), f'합이 {a} 인 경우 {cnt(a)}가지, {b} 인 경우 {cnt(b)}가지 — 동시에 일어나지 않으므로 더한다.', chk=lambda: sum(1 for x, y in product(range(1, 7), repeat=2) if x + y in (a, b)) == cnt(a) + cnt(b))
def m1b(v, rng):
    n, a, b = pick(v, rng, (30, 4, 7), lambda r: (r.choice([20, 30, 40, 50]), *r.choice([(4, 7), (3, 5), (4, 9), (5, 7), (3, 7), (5, 8), (4, 5), (6, 7), (3, 8)])))
    if a * b <= n: n = a * b - 1 if a * b - 1 >= 15 else n
    val = n // a + n // b
    return number(f'1 부터 {n} 까지의 자연수 중에서 {a} 의 배수 또는 {b} 의 배수의 개수는?', val, f'{a} 의 배수 {n//a}개, {b} 의 배수 {n//b}개 — {n} 이하에서 겹치는 수({a*b} 의 배수)가 없으므로 더한다.', chk=lambda: len([t for t in range(1, n + 1) if t % a == 0 or t % b == 0]) == val)
def m2a(v, rng):
    a, b, c = pick(v, rng, (3, 4, 0), lambda r: (ri(r, 2, 6), ri(r, 2, 6), r.choice([0, 0, 2, 3])))
    q = f'상의 {a}벌, 하의 {b}벌' + (f', 신발 {c}켤레' if c else '') + ' 가 있을 때, 하나씩 골라 입는 방법의 수는?'
    return number(q, a * b * (c or 1), ' × '.join(str(t) for t in [a, b] + ([c] if c else [])) + ' — 상의마다 하의를 모두 고를 수 있다(동시에 일어남 → 곱).', chk=True)
def m2b(v, rng):
    a, b = pick(v, rng, (2, 3), lambda r: (ri(r, 2, 4), ri(r, 2, 5)))
    A = ' + '.join('xyzw'[:a]); B = ' + '.join('abcde'[:b])
    return number(f'({A})({B}) 를 전개했을 때 생기는 항의 개수는?', a * b, f'앞 괄호의 {a}개 항마다 뒤 괄호의 {b}개 항과 곱해진다 → {a} × {b}.', chk=True)
def m3a(v, rng):
    n = pick(v, rng, 3, lambda r: ri(r, 2, 8)); val = sum(1 for x in range(n + 1) for y in range(n + 1) if x + y <= n)
    return number(f'음이 아닌 정수 x, y 에 대하여 x + y ≤ {n} 을 만족시키는 순서쌍 (x, y) 의 개수는?', val, f'x + y = 0, 1, …, {n} 인 경우가 각각 1, 2, …, {n+1}가지 → 모두 더한다.', chk=lambda: val == (n + 1) * (n + 2) // 2)
def m3b(v, rng):
    n = pick(v, rng, 9, lambda r: ri(r, 7, 20)); val = sum(1 for y in range(1, n) for x in range(1, n) if x + 2 * y == n)
    return number(f'자연수 x, y 에 대하여 x + 2y = {n} 을 만족시키는 순서쌍 (x, y) 의 개수는?', val, f'y = 1, 2, … 를 차례로 넣어 x 가 자연수인 것만 센다(계수가 큰 y 부터).', chk=lambda: val == (n - 1) // 2)
# 산: 전체에서 빼기 (중단원 마무리 09 꼴)
CASES = [(3, 2), (2, 2), (3, 3), (2, 3), (3, 5), (2, 5), (4, 2)]
def hs(v, rng):
    n, k = CASES[v]; word = {2: '짝수', 3: '3 의 배수', 5: '5 의 배수'}[k]; bad = {2: 3, 3: 4, 5: 5}[k]
    return n, k, word, bad, f'서로 다른 주사위 {n}개를 동시에 던질 때, 나오는 눈의 수의 곱이 {word}인 경우의 수를 구하려고 한다.'
def m4a(v, rng):
    n, k, word, bad, s = hs(v, rng); return number(f'{s} 일어날 수 있는 모든 경우의 수는?', 6 ** n, f'주사위 하나마다 6가지 → 6 을 {n}번 곱한다.', chk=True)
def m4b(v, rng):
    n, k, word, bad, s = hs(v, rng); what = {2: '홀수', 3: '3 의 배수가 아닌 수', 5: '5 의 배수가 아닌 수'}[k]
    return number(f'{s} 곱이 {word}가 「아닌」 경우, 곧 {n}개 모두 {what}의 눈이 나오는 경우의 수는?', bad ** n, f'{what}의 눈은 {bad}가지 → {bad} 를 {n}번 곱한다.', chk=lambda: sum(1 for t in product(range(1, 7), repeat=n) if math.prod(t) % k != 0) == bad ** n)
def m4c(v, rng):
    n, k, word, bad, s = hs(v, rng)
    return number(f'서로 다른 주사위 {n}개를 동시에 던질 때, 나오는 눈의 수의 곱이 {word}인 경우의 수는?', 6 ** n - bad ** n, f'(전체) − ({word}가 아닌 경우) = {6**n} − {bad**n}.', chk=lambda: sum(1 for t in product(range(1, 7), repeat=n) if math.prod(t) % k == 0) == 6 ** n - bad ** n)
def ex1(v, rng):
    a, b = pick(v, rng, (2, 3), lambda r: (ri(r, 1, 4), ri(r, 1, 4)))
    return number(f'500 원짜리 동전 {a}개와 100 원짜리 동전 {b}개의 일부 또는 전부를 사용하여 지불할 수 있는 방법의 수는? (0 원을 지불하는 경우는 제외)', (a + 1) * (b + 1) - 1, f'500 원 동전을 쓰는 개수 {a+1}가지 × 100 원 동전 {b+1}가지 − (둘 다 0개) 1.', chk=True)
L = dict(id='cm1-27', no=27, title='합의 법칙과 곱의 법칙', unit='Ⅲ-1 경우의 수', pages='102 ~ 104', goal='합의 법칙과 곱의 법칙을 이해하고, 경우의 수를 구할 수 있다.',
  review='중학교: 경우의 수 · 「또는」은 더하고 「그리고(동시에)」는 곱한다', intro='패턴 암호는 몇 가지일까? 빠짐없이 · 겹치지 않게 세는 두 가지 규칙.',
  concepts=[dict(id='c1', title='합의 법칙', say='두 사건 A, B 가 동시에 일어나지 않을 때, A 또는 B 가 일어나는 경우의 수 = m + n.', check=dict(type='ox', q='1 부터 10 까지의 자연수 중 2 의 배수 또는 3 의 배수의 개수는 5 + 3 = 8 이다.', ch=[], a='X', why='6 이 두 번 세어졌다 → 8 − 1 = 7.')),
            dict(id='c2', title='곱의 법칙', say='사건 A 가 m 가지, 그 각각에 대하여 사건 B 가 n 가지로 일어날 때, A, B 가 잇달아(동시에) 일어나는 경우의 수 = m × n.')],
  mons=[dict(id='m1', title='문제 1 · 합의 법칙', subs=[m1a, m1b]), dict(id='m2', title='문제 2 · 곱의 법칙', subs=[m2a, m2b]), dict(id='m3', title='문제 3 · 순서쌍의 개수', subs=[m3a, m3b]),
        dict(id='m4', title='문제 4 · 전체에서 빼기', hard=True, subs=[m4a, m4b, m4c]), dict(id='m5', title='지불하는 방법의 수', extra=True, subs=[ex1])],
  boss=[(m1a, 'c1', 'm1'), (m2a, 'c2', 'm2'), (m2b, 'c2', 'm2'), (m3a, 'c1', 'm3')],
  hard_from='산 = 중단원 마무리 09번 꼴(주사위 3개 · 본문에 어려운 문제가 없어 가져옴)',
  motion=[dict(title='또는 = 더하기, 그리고 = 곱하기', key='동시에 안 일어나면 더하고, 잇달아 일어나면 곱한다.', scenes=['카드 왼쪽: 「버스 3 또는 지하철 2」 → 갈림길 5개가 나란히 펼쳐진다 (3 + 2).', '카드 오른쪽: 「상의 3 그리고 하의 2」 → 나뭇가지처럼 3 갈래마다 2 갈래 (3 × 2).', '두 그림 아래 5, 6 이 뜬다.', '「또는 → +」 「그리고 → ×」 딱지.'], end='합의 법칙 m + n · 곱의 법칙 m × n')],
  notes=['문제 1-2 는 겹치는 배수가 없도록 범위를 맞춤(겹침을 빼는 꼴은 개념 체크에서 한 번 짚음).', '산은 판마다 주사위 수 · 조건(짝수 · 3 의 배수 · 5 의 배수)이 바뀜.'])
if __name__ == '__main__': write(L)
