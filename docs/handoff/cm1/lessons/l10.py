from cm1lib import *
Z = lambda r: (ri(r, -6, 6), ri(r, -6, 6))
def m1a(v, rng):
    z = pick(v, rng, (3, -1), Z); part = pick(v, rng, 1, lambda r: r.choice([0, 1]))
    return number(f'복소수 {cf(*z)} 의 {"실수부분" if part == 0 else "허수부분"}은?', z[part], 'a + bi 에서 a 가 실수부분, b 가 허수부분(i 는 빼고 수만).', chk=True)
def m1b(v, rng):
    pool = [('2', 0), ('1 + i', 1), ('5i', 1), ('√3', 0), ('−4i', 1), ('0', 0), ('3 − √2', 0), ('2 − 3i', 1), ('−7', 0), ('√2 i', 1)]
    opts = pick(v, rng, [pool[0], pool[1], pool[2], pool[3]], lambda r: r.sample(pool, 4))
    if sum(o[1] for o in opts) in (0, 4): opts = [pool[0], pool[4], pool[7], pool[8]]
    return multi(rng, '다음 중 허수인 것을 모두 고르시오.', [(t, bool(k)) for t, k in opts], '허수 = 허수부분이 0 이 아닌 복소수(i 가 붙은 부분이 남아 있는 수).', chk=True)
def EQ(v, rng): return pick(v, rng, (4, -6, -1, 2, 3, -4), lambda r: (ri(r, -5, 6), ri(r, -6, 5), ri(r, -4, 4), ri(r, -4, 4), 0, 0))
def es(v, rng):
    x, y, p, q, _, _ = EQ(v, random.Random(rng.random() if v else 1)); a, b = x + p, y + q
    L1 = f"(x {'+' if p>=0 else '−'} {abs(p)})" if p else 'x'; L2 = f"(y {'+' if q>=0 else '−'} {abs(q)})" if q else 'y'
    return x, y, f'등식 {L1} + {L2}i = {cf(a, b)} 를 만족시키는 실수 x, y 에 대하여'.replace(' 를 만', ' 를 만'), a, b
def m2a(v, rng):
    x, y, s, a, b = es(v, rng); return number(f'{s} x 의 값은?', x, f'실수부분끼리 같다 → x 가 든 괄호 = {N(a)}.', chk=True)
def m2b(v, rng):
    x, y, s, a, b = es(v, rng); return number(f'{s} y 의 값은?', y, f'허수부분끼리 같다 → y 가 든 괄호 = {N(b)}.', chk=True)
def m3a(v, rng):
    z = pick(v, rng, (2, 3), lambda r: (ri(r, -6, 6), ri(r, -6, 6, (0,))))
    return choice(rng, f'복소수 {cf(*z)} 의 켤레복소수는?', cf(z[0], -z[1]), [cf(-z[0], z[1]), cf(-z[0], -z[1]), cf(z[1], z[0]), cf(*z)], '켤레복소수 = 허수부분의 부호만 바꾼 수.', chk=True)
def m3b(v, rng):
    z = pick(v, rng, (2, -3), lambda r: (ri(r, -6, 6), ri(r, -6, 6, (0,))))
    return number(f'복소수 a + bi 의 켤레복소수가 {cf(*z)} 일 때, a + b 의 값은? (a, b 는 실수)', z[0] - z[1], f'a + bi = {cf(z[0], -z[1])} → a = {N(z[0])}, b = {N(-z[1])}.', chk=True)
# 산: 연립 (중단원 마무리 01 꼴)
def SY(v, rng): return pick(v, rng, (2, 3), lambda r: (ri(r, -4, 5), ri(r, -4, 5)))
def ss(v, rng):
    x, y = SY(v, random.Random(rng.random() if v else 1)); return x, y, f'등식 (x + y) + (x − y)i = {cf(x + y, x - y)} 를 만족시키는 실수 x, y 에 대하여'
def m4a(v, rng):
    x, y, s = ss(v, rng)
    return multi(rng, f'{s} 맞는 식을 모두 고르시오.', [(f'x + y = {N(x+y)}', True), (f'x − y = {N(x+y)}', False), (f'x − y = {N(x-y)}', True), (f'x + y = {N(x-y)}', False)] if x + y != x - y else [(f'x + y = {N(x+y)}', True), (f'x − y = {N(x-y)}', True), (f'x + y = {N(x+y+1)}', False), (f'x − y = {N(-(x-y)-1)}', False)], '실수부분끼리, 허수부분끼리 각각 같다.', chk=True)
def m4b(v, rng):
    x, y, s = ss(v, rng); return number(f'{s} x 의 값은?', x, f'x + y = {N(x+y)}, x − y = {N(x-y)} 를 더하면 2x = {N(2*x)}.', chk=True)
def m4c(v, rng):
    x, y, s = ss(v, rng); return number(f'{s} y 의 값은?', y, f'x + y = {N(x+y)}, x − y = {N(x-y)} 를 빼면 2y = {N(2*y)}.', chk=True)
def ex1(v, rng):
    k = pick(v, rng, 3, lambda r: ri(r, 2, 9))
    return choice(rng, f'제곱하여 −{k*k} 이 되는 수를 모두 구한 것은?', f'{k}i, −{k}i', [f'{k}i', f'{k}, −{k}', f'−{k}i', '없다'], f'({k}i)² = {k*k}i² = −{k*k}, (−{k}i)² 도 같다.', chk=True)
L = dict(id='cm1-10', no=10, title='복소수의 뜻', unit='Ⅱ-1 복소수와 이차방정식', pages='46 ~ 47', goal='복소수의 뜻을 알고, 서로 같을 조건과 켤레복소수를 구할 수 있다.',
  review='중학교: 제곱근 · x² = 4 의 해 · 실수는 제곱하면 0 이상', intro='x² = −1 의 해는 실수에 없다 → 제곱해서 −1 이 되는 새 수 i 를 만든다.',
  concepts=[dict(id='c1', title='허수단위 i 와 복소수', say='i² = −1. 실수 a, b 에 대하여 a + bi 꼴의 수 = 복소수(a 실수부분 · b 허수부분). b = 0 이면 실수, b ≠ 0 이면 허수.', check=dict(type='ox', q='실수 5 는 복소수가 아니다.', ch=[], a='X', why='5 = 5 + 0i → 실수도 복소수다.')),
            dict(id='c2', title='서로 같은 복소수 · 켤레복소수', say='a + bi = c + di ⟺ a = c, b = d (a, b, c, d 실수). a + bi 의 켤레복소수 = a − bi.', check=dict(type='ox', q='3 − 2i 의 켤레복소수는 −3 + 2i 이다.', ch=[], a='X', why='허수부분의 부호만 바꾼다 → 3 + 2i.'))],
  mons=[dict(id='m1', title='문제 1 · 실수부분과 허수부분', subs=[m1a, m1b]), dict(id='m2', title='문제 2 · 서로 같은 복소수', subs=[m2a, m2b]), dict(id='m3', title='문제 3 · 켤레복소수', subs=[m3a, m3b]),
        dict(id='m4', title='문제 4 · 두 식을 세워 x, y 구하기', hard=True, subs=[m4a, m4b, m4c]), dict(id='m5', title='제곱하면 음수', extra=True, subs=[ex1])],
  boss=[(m1a, 'c1', 'm1'), (m2a, 'c2', 'm2'), (m3a, 'c2', 'm3'), (m4b, 'c2', 'm4')],
  hard_from='산 = 중단원 마무리 01번 꼴(본문에 어려운 문제가 없어 가져옴)',
  motion=[dict(title='수의 지도 — 실수 밖의 수 i', key='제곱해서 −1 이 되는 수 i 를 더하면 복소수 a + bi 가 된다.', scenes=['카드에 수직선(실수)이 그려지고 x² = −1 물음표가 수직선 위를 헤맨다.', '수직선 위쪽으로 새 축이 솟고 i 가 찍힌다.', '3 + 2i 가 가로 3, 세로 2 자리에 찍히며 「실수부분 3 · 허수부분 2」 딱지.', '세로가 0 인 점들에 「실수」, 나머지에 「허수」 색이 입혀진다.'], end='복소수 a + bi (a, b 는 실수)')],
  notes=['첫 만남 차시라 계산보다 뜻 · 구별(실수부분 · 허수 · 켤레)에 문항을 둠.'])
if __name__ == '__main__': write(L)
