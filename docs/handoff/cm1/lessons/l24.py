from cm1lib import *
X = lambda cs, v='x': D(P(cs, v))
ab = lambda p: f"|x {'−' if p>0 else '+'} {abs(p)}|" if p else '|x|'
def m1a(v, rng):
    p, r = pick(v, rng, (2, 3), lambda rr: (ri(rr, -5, 5), ri(rr, 1, 6)))
    return choice(rng, f'부등식 {ab(p)} < {r} 의 해는?', f'{N(p-r)} < x < {N(p+r)}', [f'x < {N(p-r)} 또는 x > {N(p+r)}', f'{N(-p-r)} < x < {N(-p+r)}' if p else f'x < {r}', f'x < {N(p+r)}', f'{N(p-r)} ≤ x ≤ {N(p+r)}'], f'−{r} < x − ({N(p)}) < {r} → 각 변에 {N(p)} 를 더한다.', chk=lambda: all((abs(Fr(t, 2) - p) < r) == (p - r < Fr(t, 2) < p + r) for t in range(-40, 41)))
def m1b(v, rng):
    a, lo, hi = pick(v, rng, (2, -3, 2), lambda rr: (lambda a_, m, w: (a_, m - w, m + w))(2, ri(rr, -3, 3), ri(rr, 1, 4)))   # |2x − (lo+hi)| ≥ hi − lo
    c, r = lo + hi, hi - lo
    e = f"|2x {'−' if c>0 else '+'} {abs(c)}|" if c else '|2x|'
    return choice(rng, f'부등식 {e} ≥ {r} 의 해는?', f'x ≤ {N(lo)} 또는 x ≥ {N(hi)}', [f'{N(lo)} ≤ x ≤ {N(hi)}', f'x ≥ {N(hi)}', f'x < {N(lo)} 또는 x > {N(hi)}', f'x ≤ {N(-hi)} 또는 x ≥ {N(-lo)}' if lo != -hi else f'x ≤ {N(lo-1)} 또는 x ≥ {N(hi+1)}'], f'2x − ({N(c)}) ≤ −{r} 또는 2x − ({N(c)}) ≥ {r}.', chk=lambda: all((abs(2 * Fr(t, 2) - c) >= r) == (Fr(t, 2) <= lo or Fr(t, 2) >= hi) for t in range(-40, 41)))
def m2a(v, rng):
    p, r = pick(v, rng, (1, 3), lambda rr: (ri(rr, -5, 5), ri(rr, 1, 6)))
    return number(f'부등식 {ab(p)} ≤ {r} 을 만족시키는 정수 x 의 개수는?', 2 * r + 1, f'{N(p-r)} ≤ x ≤ {N(p+r)} → 양 끝 포함 {2*r+1}개.', chk=lambda: len([t for t in range(-30, 30) if abs(t - p) <= r]) == 2 * r + 1)
def m2b(v, rng):
    p, r = pick(v, rng, (-2, 4), lambda rr: (ri(rr, -5, 5), ri(rr, 2, 6)))
    return number(f'부등식 {ab(p)} < {r} 을 만족시키는 정수 x 중 가장 큰 수는?', p + r - 1, f'{N(p-r)} < x < {N(p+r)} → 끝은 빠지므로 {N(p+r-1)}.', chk=lambda: max(t for t in range(-30, 30) if abs(t - p) < r) == p + r - 1)
# m3: |x − p| < 2x + q  (범위 나누기)
def CS(v, rng):
    p, t = pick(v, rng, (2, 1), lambda rr: (ri(rr, -3, 4), ri(rr, 1, 4)))   # 해: x > t' ... 구성: x ≥ p: x − p < 2x + q → x > −p − q ; x < p: −x + p < 2x + q → x > (p − q)/3
    q = p - 3 * (p - t)        # (p − q)/3 = p − t  (< p)
    return p, q, p - t
def cs_(v, rng):
    p, q, c = CS(v, random.Random(rng.random() if v else 1)); return p, q, c, f"부등식 {ab(p)} < {X([2, q])} 에서"
def m3a(v, rng):
    p, q, c, s = cs_(v, rng)
    return choice(rng, f'{s} x ≥ {N(p)} 일 때 절댓값 기호를 없앤 식은?', f'{X([1, -p])} < {X([2, q])}', [f'{X([-1, p])} < {X([2, q])}', f'{X([1, p])} < {X([2, q])}' if p else f'x > {X([2, q])}', f'{X([1, -p])} > {X([2, q])}'], f'x ≥ {N(p)} 이면 절댓값 안이 0 이상 → 그대로.', chk=True)
def m3b(v, rng):
    p, q, c, s = cs_(v, rng)
    return choice(rng, f'{s} x < {N(p)} 일 때의 해는?', f'{N(c)} < x < {N(p)}', [f'x < {N(c)}', f'x > {N(c)}', f'x < {N(p)}', '해가 없다'], f'−x + ({N(p)}) < 2x + ({N(q)}) → 3x > {N(p-q)} → x > {N(c)} 이고 x < {N(p)}.', chk=lambda: all(((abs(Fr(t, 4) - p) < 2 * Fr(t, 4) + q) and Fr(t, 4) < p) == (c < Fr(t, 4) < p) for t in range(-60, 61)))
def m3c(v, rng):
    p, q, c, s = cs_(v, rng)
    return choice(rng, f'{s} 해는?', f'x > {N(c)}', [f'x ≥ {N(p)}', f'{N(c)} < x < {N(p)}', f'x < {N(c)}', '모든 실수'], f'x ≥ {N(p)} 인 경우(모두 해)와 {N(c)} < x < {N(p)} 를 합친다.', chk=lambda: all((abs(Fr(t, 4) - p) < 2 * Fr(t, 4) + q) == (Fr(t, 4) > c) for t in range(-60, 61)))
# 산: |x − p| + |x − q| < L (교과서 86쪽 예제 꼴)
def TW(v, rng):
    p, w, h = pick(v, rng, (-1, 3, 1), lambda rr: (ri(rr, -4, 2), ri(rr, 1, 4), ri(rr, 1, 3))); q = p + w; Lh = w + 2 * h
    return p, q, Lh, p - h, q + h
def ts(v, rng):
    p, q, Lh, lo, hi = TW(v, random.Random(rng.random() if v else 1)); return p, q, Lh, lo, hi, f'부등식 {ab(p)} + {ab(q)} < {Lh} 에서'
def m4a(v, rng):
    p, q, Lh, lo, hi, s = ts(v, rng)
    return choice(rng, f'{s} 절댓값 기호 안이 0 이 되는 x 의 값을 기준으로 범위를 나누려고 한다. 기준이 되는 두 수는?', f'{N(p)}, {N(q)}', [f'{N(-q)}, {N(-p)}' if (-q, -p) != (p, q) else f'{N(p-1)}, {N(q+1)}', f'0, {Lh}', f'{N(lo)}, {N(hi)}'], f'x − ({N(p)}) = 0, x − ({N(q)}) = 0 이 되는 값.', chk=True)
def m4b(v, rng):
    p, q, Lh, lo, hi, s = ts(v, rng)
    return choice(rng, f'{s} x < {N(p)} 일 때의 해는?', f'{N(lo)} < x < {N(p)}', [f'x < {N(lo)}', f'x < {N(p)}', f'{N(lo)} < x < {N(q)}', '해가 없다'], f'두 절댓값 안이 모두 음수 → −2x + ({N(p+q)}) < {Lh} → x > {N(lo)}.', chk=lambda: all(((abs(Fr(t, 2) - p) + abs(Fr(t, 2) - q) < Lh) and Fr(t, 2) < p) == (lo < Fr(t, 2) < p) for t in range(-40, 41)))
def m4c(v, rng):
    p, q, Lh, lo, hi, s = ts(v, rng)
    return choice(rng, f'{s} 해는?', f'{N(lo)} < x < {N(hi)}', [f'{N(p)} < x < {N(q)}', f'x < {N(lo)} 또는 x > {N(hi)}', f'{N(lo)} ≤ x ≤ {N(hi)}', f'{N(lo)} < x < {N(q)}'], f'세 범위(x < {N(p)}, {N(p)} ≤ x < {N(q)}, x ≥ {N(q)})의 해를 모두 합친다.', chk=lambda: all((abs(Fr(t, 2) - p) + abs(Fr(t, 2) - q) < Lh) == (lo < Fr(t, 2) < hi) for t in range(-40, 41)))
def ex1(v, rng):
    a = pick(v, rng, 4, lambda rr: ri(rr, 2, 9))
    return number(f'부등식 |x| < a 를 만족시키는 정수 x 가 {2*a - 1}개일 때, 자연수 a 의 값은?', a, f'−a < x < a 인 정수는 −(a − 1) 부터 a − 1 까지 2a − 1 개 → 2a − 1 = {2*a-1}.', chk=lambda: len([t for t in range(-30, 30) if abs(t) < a]) == 2 * a - 1)
L = dict(id='cm1-24', no=24, title='절댓값 기호를 포함한 일차부등식', unit='Ⅱ-3 여러 가지 방정식과 부등식', pages='84 ~ 86', goal='절댓값 기호를 포함한 일차부등식을 풀 수 있다.',
  review='중학교: 절댓값 = 원점에서의 거리 · 23차시: 연립부등식의 공통부분', intro='|x| < 3 은 「원점에서 거리가 3 보다 가까운 수」 → −3 과 3 사이.',
  concepts=[dict(id='c1', title='|x| < a, |x| > a (a > 0)', say='|x| < a ⟺ −a < x < a · |x| > a ⟺ x < −a 또는 x > a. x 자리에 식이 와도 같다.', check=dict(type='ox', q='|x| > 2 의 해는 −2 < x < 2 이다.', ch=[], a='X', why='거리가 2 보다 먼 수 → x < −2 또는 x > 2.')),
            dict(id='c2', title='범위를 나누어 풀기', say='절댓값 안이 0 이 되는 값을 기준으로 범위를 나눠 기호를 없애고, 범위마다 푼 해를 합친다.')],
  mons=[dict(id='m1', title='문제 1 · |식| < a, |식| ≥ a', subs=[m1a, m1b]), dict(id='m2', title='문제 2 · 정수인 해', subs=[m2a, m2b]), dict(id='m3', title='문제 3 · 범위를 나누어 풀기', subs=[m3a, m3b, m3c]),
        dict(id='m4', title='문제 4 · 절댓값이 두 개', hard=True, subs=[m4a, m4b, m4c]), dict(id='m5', title='정수 해의 개수로 a', extra=True, subs=[ex1])],
  boss=[(m1a, 'c1', 'm1'), (m1b, 'c1', 'm1'), (m2a, 'c1', 'm2'), (m3c, 'c2', 'm3')],
  hard_from='산 = 본문 86쪽 예제 꼴(절댓값 두 개 · 본문에 있어 중단원에서 안 가져옴)',
  motion=[dict(title='절댓값 = 거리', key='|x − 2| < 3 은 2 에서 거리가 3 보다 가까운 수.', scenes=['카드의 수직선 위 2 에 깃발이 꽂힌다.', '깃발에서 양쪽으로 길이 3 인 팔이 뻗어 −1 과 5 에 닿는다(끝은 빈 점).', '팔 안쪽이 칠해지며 −1 < x < 5.', '부등호를 > 로 바꾸면 팔 바깥쪽 두 갈래가 칠해진다.'], end='|x − 2| < 3 ⟺ −1 < x < 5')],
  notes=['문제 3 은 해가 정수 끝점으로 떨어지도록 수를 맞춤.', '문제 4 는 「기준 값 → 한 범위 → 전체」 세 단계.'])
if __name__ == '__main__': write(L)
