from cm1lib import *
X = lambda cs, v='x': D(P(cs, v))
def VF(v, rng, k=0): return pick(v, rng, [(1, 2, -3), (-1, 3, 16), (3, 1, -4)][k], lambda r: (r.choice([1, -1, 2, -2]), ri(r, -4, 4), ri(r, -9, 9)))   # a(x−p)²+q
ex = lambda a, p, q: padd(pmul([a], pmul([1, -p], [1, -p])), [q])
vform = lambda a, p, q: (('' if a == 1 else '−' if a == -1 else N(a)) + (f"(x {'−' if p>0 else '+'} {abs(p)})²" if p else 'x²') + (f" {'+' if q>0 else '−'} {abs(q)}" if q else ''))
def m1a(v, rng):
    a, p, q = VF(v, random.Random(rng.random() if v else 1)); cs = ex(a, p, q)
    return choice(rng, f'이차함수 y = {X(cs)} 을 y = a(x − p)² + q 꼴로 고치면?', 'y = ' + vform(a, p, q), ['y = ' + vform(a, -p, q), 'y = ' + vform(a, p, -q) if q else 'y = ' + vform(a, p, 1), 'y = ' + vform(a, p, q + a * p * p) if p else 'y = ' + vform(a, 1, q), 'y = ' + vform(-a, p, q)], '완전제곱식으로 고친다: x 의 계수의 절반을 제곱해 더하고 뺀다.', chk=lambda: same(P(cs), f'{a}*(x-({p}))**2+({q})'))
def m1b(v, rng):
    a, p, q = VF(v, random.Random(rng.random() if v else 1)); cs = ex(a, p, q)
    kind = '최솟값' if a > 0 else '최댓값'
    return choice(rng, f'x 가 실수 전체일 때, 이차함수 y = {X(cs)} 의 최댓값 · 최솟값은?', f'{kind} {N(q)} ({"최댓값" if a > 0 else "최솟값"}은 없다)', [f'{"최댓값" if a > 0 else "최솟값"} {N(q)} ({kind}은 없다)', f'{kind} {N(p)} ({"최댓값" if a > 0 else "최솟값"}은 없다)', f'최댓값 {N(max(q, cs[2]) + 1)}, 최솟값 {N(min(q, cs[2]))}'], f'y = {vform(a, p, q)} → {"아래" if a > 0 else "위"}로 볼록, 꼭짓점 ({N(p)}, {N(q)}).', chk=True)
def RG(v, rng, k=0):
    a, p, q = VF(v, random.Random(rng.random() if v else 1 + k), k)
    lo, hi = pick(v, rng, [(1, 5), (0, 3), (-1, 2)][k], lambda r: (lambda s, w: (s, s + w))(ri(r, -4, 3), ri(r, 2, 5)))
    return a, p, q, lo, hi, ex(a, p, q)
def mm(a, p, q, lo, hi, cs):
    vals = [peval(cs, lo), peval(cs, hi)] + ([q] if lo <= p <= hi else [])
    return max(vals), min(vals)
def m2a(v, rng):
    a, p, q, lo, hi, cs = RG(v, rng); ins = lo <= p <= hi
    return choice(rng, f'{N(lo)} ≤ x ≤ {N(hi)} 일 때, 이차함수 y = {X(cs)} 의 꼭짓점의 x좌표 {N(p)} 는 이 범위에 포함되는가?', '포함된다' if ins else '포함되지 않는다', ['포함되지 않는다' if ins else '포함된다', '알 수 없다'], f'{N(lo)} ≤ {N(p)} ≤ {N(hi)} 이 {"성립한다" if ins else "성립하지 않는다"} → {"꼭짓점 값도 후보" if ins else "양 끝 값만 비교"}.', n=3, keep=True, chk=True)
def m2b(v, rng):
    a, p, q, lo, hi, cs = RG(v, rng); M, m = mm(a, p, q, lo, hi, cs)
    return number(f'{N(lo)} ≤ x ≤ {N(hi)} 일 때, 이차함수 y = {X(cs)} 의 최댓값은?', M, f'f({N(lo)}) = {N(peval(cs, lo))}, f({N(hi)}) = {N(peval(cs, hi))}' + (f', 꼭짓점 {N(q)}' if lo <= p <= hi else '') + ' 중 가장 큰 값.', chk=lambda: M == max(peval(cs, Fr(t, 4)) for t in range(lo * 4, hi * 4 + 1)))
def m2c(v, rng):
    a, p, q, lo, hi, cs = RG(v, rng); M, m = mm(a, p, q, lo, hi, cs)
    return number(f'{N(lo)} ≤ x ≤ {N(hi)} 일 때, 이차함수 y = {X(cs)} 의 최솟값은?', m, f'f({N(lo)}) = {N(peval(cs, lo))}, f({N(hi)}) = {N(peval(cs, hi))}' + (f', 꼭짓점 {N(q)}' if lo <= p <= hi else '') + ' 중 가장 작은 값.', chk=lambda: m == min(peval(cs, Fr(t, 4)) for t in range(lo * 4, hi * 4 + 1)))
def m3(which):
    def f(v, rng):
        a, p, q, lo, hi, cs = RG(v, rng, 1 + (which == 'min')); M, m = mm(a, p, q, lo, hi, cs); val = M if which == 'max' else m
        return number(f'{N(lo)} ≤ x ≤ {N(hi)} 일 때, 이차함수 y = {X(cs)} 의 {"최댓값" if which == "max" else "최솟값"}은?', val, f'y = {vform(a, p, q)} · 꼭짓점 x = {N(p)} {"∈" if lo <= p <= hi else "∉"} 범위 · 끝값 {N(peval(cs, lo))}, {N(peval(cs, hi))}.', chk=lambda: val == (max if which == 'max' else min)(peval(cs, Fr(t, 4)) for t in range(lo * 4, hi * 4 + 1)))
    return f
# 산: 최댓값이 주어질 때 상수 (중단원 수준)
def HK(v, rng):
    p, lo, hi, M = pick(v, rng, (2, 0, 3, 7), lambda r: (ri(r, -2, 3), 0, 0, ri(r, 3, 12))); 
    if v: lo = p - ri(rng, 1, 2); hi = p + ri(rng, 2, 4)
    far = hi if abs(hi - p) >= abs(lo - p) else lo; k = M - (far - p) ** 2 + p * p   # y = x² − 2p x + k = (x−p)² + k − p²
    return p, lo, hi, M, far, k
def hs(v, rng):
    p, lo, hi, M, far, k = HK(v, random.Random(rng.random() if v else 1))
    return p, lo, hi, M, far, k, f"{N(lo)} ≤ x ≤ {N(hi)} 일 때, 이차함수 y = x² {'−' if p>0 else '+'} {abs(2*p)}x + k 의 최댓값이 {N(M)} 이다 (k 는 상수)." if p else f'{N(lo)} ≤ x ≤ {N(hi)} 일 때, 이차함수 y = x² + k 의 최댓값이 {N(M)} 이다 (k 는 상수).'
def m4a(v, rng):
    p, lo, hi, M, far, k, s = hs(v, rng)
    return choice(rng, f'{s} 이 함수의 그래프는 아래로 볼록하고 꼭짓점의 x좌표는 {N(p)} 이다. 최댓값은 x 가 얼마일 때인가?', f'x = {N(far)}', [f'x = {N(p)}', f'x = {N(lo if far == hi else hi)}'] + ([f'x = {N(far + 1)}'] if far + 1 not in (p, lo, hi) else [f'x = {N(far - 7)}']), f'아래로 볼록 → 꼭짓점에서 멀수록 값이 크다. {N(p)} 에서 더 먼 끝은 {N(far)}.', chk=True)
def m4b(v, rng):
    p, lo, hi, M, far, k, s = hs(v, rng); c = far * far - 2 * p * far
    return choice(rng, f'{s} x = {N(far)} 을 대입하여 세운 식은?', f'{N(c)} + k = {N(M)}', [f'{N(-c) if c else "1"} + k = {N(M)}', f'{N(c)} − k = {N(M)}', f'{N(p*p - 2*p*p)} + k = {N(M)}' if p and (p*p - 2*p*p) != c else f'k = {N(M + 1)}'], f'({N(far)})² − {2*p} × ({N(far)}) + k = {N(M)}.', chk=True)
def m4c(v, rng):
    p, lo, hi, M, far, k, s = hs(v, rng)
    return number(f'{s} k 의 값은?', k, f'x = {N(far)} 일 때 최대: {N(far*far - 2*p*far)} + k = {N(M)}.', chk=lambda: max(t * t - 2 * p * t + k for t in range(lo, hi + 1)) == M)
def ex1(v, rng):
    p, lo, hi, M, far, k, s = hs(v, rng)
    return number(f"{N(lo)} ≤ x ≤ {N(hi)} 일 때, 이차함수 y = {X([1, -2*p, k])} 의 최솟값은?", k - p * p, f'꼭짓점 x = {N(p)} 가 범위 안 → 최솟값 = 꼭짓점의 y좌표.', chk=lambda: min(t * t - 2 * p * t + k for t in range(lo, hi + 1)) == k - p * p)
L = dict(id='cm1-18', no=18, title='이차함수의 최대, 최소', unit='Ⅱ-2 이차방정식과 이차함수', pages='69 ~ 71 (문제 1 까지)', goal='제한된 범위에서 이차함수의 최댓값과 최솟값을 구할 수 있다.',
  review='중학교: y = a(x − p)² + q 의 꼭짓점 · 완전제곱식 만들기', intro='불꽃의 최고 높이처럼, x 의 범위가 정해지면 최댓값 · 최솟값은 꼭짓점과 양 끝에서 정해진다.',
  concepts=[dict(id='c1', title='실수 전체에서의 최대 · 최소', say='y = a(x − p)² + q: a > 0 이면 최솟값 q(최댓값 없음), a < 0 이면 최댓값 q(최솟값 없음).', check=dict(type='ox', q='이차함수 y = −(x − 1)² + 4 의 최솟값은 4 이다.', ch=[], a='X', why='위로 볼록 → 4 는 최댓값, 최솟값은 없다.')),
            dict(id='c2', title='제한된 범위 α ≤ x ≤ β 에서의 최대 · 최소', say='꼭짓점의 x좌표 p 가 범위 안이면 f(α), f(p), f(β) 중에서, 범위 밖이면 f(α), f(β) 중에서 가장 큰 값 · 작은 값.')],
  mons=[dict(id='m1', title='문제 1 · 꼴 고치기와 최대 · 최소', subs=[m1a, m1b]), dict(id='m2', title='문제 2 · 범위가 있을 때', subs=[m2a, m2b, m2c]), dict(id='m3', title='문제 3 · 범위가 있을 때 한 번 더', subs=[m3('max'), m3('min')]),
        dict(id='m4', title='문제 4 · 최댓값으로 k 찾기', hard=True, subs=[m4a, m4b, m4c]), dict(id='m5', title='같은 함수의 최솟값', extra=True, subs=[ex1])],
  boss=[(m1b, 'c1', 'm1'), (m2b, 'c2', 'm2'), (m2c, 'c2', 'm2'), (m3('min'), 'c2', 'm3')],
  hard_from='산 = 중단원 수준(최댓값이 주어질 때 상수 · 본문에 어려운 문제가 없어 넣음)',
  motion=[dict(title='범위를 자르면 최대 · 최소가 보인다', key='꼭짓점이 범위 안이면 꼭짓점과 양 끝, 밖이면 양 끝만 본다.', scenes=['카드에 포물선 y = x² − 4x + 1 이 그려진다.', '커서가 x = 1, x = 5 에 세로 막대를 세워 그 사이만 남긴다.', '남은 조각의 가장 높은 점(5, 6)과 가장 낮은 점(2, −3)에 깃발.', '막대를 3 ≤ x ≤ 5 로 옮기면 꼭짓점이 빠지고 양 끝에만 깃발.'], end='꼭짓점 · 양 끝 값만 비교', at='c2')],
  notes=['그래프 그림 없이 풀리도록 「꼭짓점이 범위에 포함되는가」를 먼저 묻는 소문항을 둠.', '활용 문제(울타리 · 약물 농도)는 19차시.'])
if __name__ == '__main__': write(L)
