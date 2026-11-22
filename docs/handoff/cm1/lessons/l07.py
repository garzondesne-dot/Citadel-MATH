from cm1lib import *
X = lambda cs: D(P(cs))
def ROOTS(v, rng): return pick(v, rng, (1, 2, -3), lambda r: tuple(r.sample([-4, -3, -2, -1, 1, 2, 3, 4], 3)))
def cub(rs):
    c = [1]
    for r in rs: c = pmul(c, [1, -r])
    return c
def m1a(v, rng):
    rs = ROOTS(v, random.Random(rng.random() if v else 1)); cs = cub(rs)
    cand = [rs[0], -rs[0] if -rs[0] not in rs else rs[0] + 5, rs[1], rs[2], next(k for k in (1, -1, 2, -2, 3, 5) if k not in rs)]
    cand = [cand[i] for i in pick(v, rng, [0, 1, 2, 3], lambda r: r.sample(range(5), 4))]
    opts = [(X([1, -k]), k in rs) for k in dict.fromkeys(cand)]
    return multi(rng, f'다음 중 다항식 f(x) = {X(cs)} 의 인수인 것을 모두 고르시오.', opts, 'x − α 가 인수 ⟺ f(α) = 0 → 각 일차식이 0 이 되는 값을 대입해 본다.', chk=lambda: all((peval(cs, k) == 0) == (k in rs) for k in cand))
def m1b(v, rng):
    rs = ROOTS(v, random.Random(rng.random() + 2 if v else 3)); cs = cub(rs); k = pick(v, rng, rs[0], lambda r: r.choice(list(rs) + [rs[0] + 1, rs[1] - 1]))
    ok = peval(cs, k) == 0
    return ox(f'다항식 f(x) = {X(cs)} 은 {X([1, -k])} 로 나누어떨어진다.', ok, f'f({N(k)}) = {N(peval(cs, k))} {"= 0 이므로 나누어떨어진다." if ok else "≠ 0 이므로 나누어떨어지지 않는다."}', chk=lambda: (pdiv(cs, [1, -k])[1] == [0]) == ok)
def UNK(v, rng):
    k, a = pick(v, rng, (2, -16), lambda r: (ri(r, -3, 3), 0)); c3, c2, c1 = pick(v, rng, (1, 3, -2), lambda r: (ri(r, 1, 2), ri(r, -3, 3), ri(r, -4, 4)))
    a = -(c3 * k ** 3 + c2 * k * k + c1 * k); return k, a, [c3, c2, c1]
def us(v, rng):
    k, a, c = UNK(v, random.Random(rng.random() if v else 1))
    return k, a, c, f'다항식 f(x) = {X(c + [0])} + a 가 {X([1, -k])} 로 나누어떨어진다 (a 는 상수).'
def m2a(v, rng):
    k, a, c, s = us(v, rng)
    return choice(rng, f'{s} 이 조건을 식으로 쓰면?', f'f({N(k)}) = 0', [f'f({N(-k)}) = 0', f'f(0) = {N(k)}', f'f({N(k)}) = a'], '인수정리: x − α 로 나누어떨어진다 ⟺ f(α) = 0.', chk=True)
def m2b(v, rng):
    k, a, c, s = us(v, rng)
    return number(f'{s} a 의 값은?', a, f'f({N(k)}) = {N(peval(c + [0], k))} + a = 0.', chk=lambda: peval(c + [a], k) == 0)
def SYN(v, rng):
    k = pick(v, rng, -2, lambda r: ri(r, -3, 3)); Q = pick(v, rng, [2, -4, 3], lambda r: [ri(r, 1, 3), ri(r, -4, 4), ri(r, -4, 4)]); R = pick(v, rng, -2, lambda r: ri(r, -6, 6))
    return k, Q, R, padd(pmul([1, -k], Q), [R])
row = lambda k, A: f"{N(k)} │ {'  '.join(N(c) for c in A)}"
def m3a(v, rng):
    k, Q, R, A = SYN(v, random.Random(rng.random() if v else 1))
    nz = [c for c in A if c != 0]
    w = [row(-k, A), row(k, nz) if len(nz) < 4 else row(k, A[::-1]), row(-k, nz) if len(nz) < 4 else row(k, [A[0], A[2], A[1], A[3]])]
    return choice(rng, f'({X(A)}) ÷ ({X([1, -k])}) 를 조립제법으로 계산할 때, 첫 줄에 쓰는 수는?', row(k, A), w, f'왼쪽에는 {X([1, -k])} = 0 이 되는 {N(k)}, 오른쪽에는 계수를 차수 순서로(없는 차수는 0).', chk=True)
def m3b(v, rng):
    k, Q, R, A = SYN(v, random.Random(rng.random() if v else 1))
    w = [X([Q[0], -Q[1], Q[2]]), X([Q[0], Q[1], Q[2], R]), X(padd(Q, [1])), X([Q[0], Q[1] + 1, Q[2]])]
    return choice(rng, f'({X(A)}) ÷ ({X([1, -k])}) 의 몫은?', X(Q), w, f'조립제법 아랫줄 {" ".join(N(c) for c in Q)} │ {N(R)} → 앞의 세 수가 몫의 계수.', chk=lambda: pdiv(A, [1, -k]) == (Q, [R]))
def m3c(v, rng):
    k, Q, R, A = SYN(v, random.Random(rng.random() if v else 1))
    return number(f'({X(A)}) ÷ ({X([1, -k])}) 의 나머지는?', R, f'조립제법 아랫줄의 맨 끝 수 = 나머지 (f({N(k)}) 와 같다).', chk=lambda: peval(A, k) == R)
# 산: 두 일차식의 곱으로 나누어떨어짐 (교과서 28쪽 문제 6 꼴)
def TWO(v, rng):
    p, q, r = pick(v, rng, (1, -2, 3), lambda rr: tuple(rr.sample([-3, -2, -1, 1, 2, 3], 3)))   # f = (x−p)(x−q)(x−r)
    cs = cub((p, q, r)); return p, q, cs
def ts(v, rng):
    p, q, cs = TWO(v, random.Random(rng.random() if v else 1)); a, b = cs[1], cs[3]
    fx = f'x³ + ax²' + (f' {"+" if cs[2] > 0 else "−"} {D(P([abs(cs[2]), 0]))}' if cs[2] else '') + ' + b'
    return p, q, cs, a, b, f'다항식 f(x) = {fx} 가 ({X([1, -p])})({X([1, -q])}) 로 나누어떨어진다 (a, b 는 상수).'
def m4a(v, rng):
    p, q, cs, a, b, s = ts(v, rng)
    return choice(rng, f'{s} 이 조건을 식으로 쓰면?', f'f({N(p)}) = 0 이고 f({N(q)}) = 0', [f'f({N(p)}) = 0 또는 f({N(q)}) = 0', f'f({N(-p)}) = 0 이고 f({N(-q)}) = 0', f'f({N(p)}) = f({N(q)}) = 1'], '곱으로 나누어떨어지면 두 일차식 각각으로도 나누어떨어진다.', chk=True)
def m4b(v, rng):
    p, q, cs, a, b, s = ts(v, rng); val = -(p ** 3 + cs[2] * p)
    return number(f'{s} f({N(p)}) = 0 을 정리하면 {D(P([p*p, 0], "a"))} + b = □ 이다. □ 에 알맞은 수는?', val, f'f({N(p)}) = {N(p**3)} + {D(P([p*p, 0], "a"))} + ({N(cs[2]*p)}) + b = 0 에서 수를 넘긴다.', chk=lambda: p * p * a + b == val)
def m4c(v, rng):
    p, q, cs, a, b, s = ts(v, rng)
    return number(f'{s} a 의 값은?', a, f'f({N(p)}) = 0, f({N(q)}) = 0 을 연립해 b 를 없앤다 → a = {N(a)}, b = {N(b)}.', chk=lambda: peval(cs, p) == 0 and peval(cs, q) == 0)
def ex1(v, rng):
    a, b = pick(v, rng, (2, -1), lambda r: (r.choice([2, 3]), r.choice([-1, 1]))); Q = pick(v, rng, [1, 0, 2], lambda r: [ri(r, 1, 2), ri(r, -2, 2), ri(r, -3, 3)]); R = pick(v, rng, 5, lambda r: ri(r, -5, 6))
    A = padd(pmul([a, b], Q), [R]); wq = pmul([a], Q)
    return choice(rng, f'({X(A)}) ÷ ({X([a, b])}) 의 몫은? (조립제법으로 x {"−" if b < 0 else "+"} {abs(b)}/{a} 로 나눈 몫은 {X(wq)} 이다)', X(Q), [X(wq), X(pmul([a * a], Q)), X(padd(Q, [1]))], f'{X([a, b])} = {a}(x {"−" if b < 0 else "+"} {abs(b)}/{a}) 이므로 조립제법으로 구한 몫을 {a} 로 나눈다. 나머지는 그대로.', chk=lambda: pdiv(A, [a, b]) == (Q, [R]))
L = dict(id='cm1-07', no=7, title='인수정리와 조립제법', unit='Ⅰ-2 나머지정리와 인수분해', pages='28 ~ 31', goal='인수정리를 이해하고, 조립제법으로 몫과 나머지를 구할 수 있다.',
  review='6차시: 나머지 R = f(α) · 나머지가 0 이면?', intro='나머지 f(α) 가 0 이면 「나누어떨어진다」 = x − α 가 인수. 계수만 써서 빠르게 나누는 법 = 조립제법.',
  concepts=[dict(id='c1', title='인수정리', say='f(α) = 0 ⟺ f(x) 가 x − α 로 나누어떨어진다(x − α 가 f(x) 의 인수).', check=dict(type='ox', q='f(2) = 0 이면 f(x) 는 x + 2 로 나누어떨어진다.', ch=[], a='X', why='f(2) = 0 이면 x − 2 가 인수.')),
            dict(id='c2', title='조립제법', say='일차식 x − α 로 나눌 때 계수만 적어 「곱해서 더하기」를 되풀이 → 아랫줄 = 몫의 계수와 나머지. 없는 차수는 0 을 적는다.', check=dict(type='ox', q='2x³ − 5x + 4 를 조립제법으로 나눌 때 계수는 2, −5, 4 세 개만 적는다.', ch=[], a='X', why='x² 자리에 0 을 적어 2, 0, −5, 4.'))],
  mons=[dict(id='m1', title='문제 1 · 인수 찾기', subs=[m1a, m1b]), dict(id='m2', title='문제 2 · 나누어떨어질 때의 계수', subs=[m2a, m2b]), dict(id='m3', title='문제 3 · 조립제법', subs=[m3a, m3b, m3c]),
        dict(id='m4', title='문제 4 · 두 일차식의 곱으로 나누어떨어짐', hard=True, subs=[m4a, m4b, m4c]), dict(id='m5', title='2x − 1 꼴로 나누는 조립제법', extra=True, subs=[ex1])],
  boss=[(m1a, 'c1', 'm1'), (m2b, 'c1', 'm2'), (m3b, 'c2', 'm3'), (m3c, 'c2', 'm3')],
  hard_from='산 = 본문 28쪽 문제 6 꼴(이미 어려운 문제가 있어 중단원에서 안 가져옴)',
  motion=[dict(title='조립제법 — 곱해서 더하기', key='계수만 적고 「α 를 곱해 다음 칸에 더하기」를 되풀이한다.', scenes=['카드에 2 │ 3  −4  2  −5 가 놓인다.', '첫 계수 3 이 그대로 내려온다.', '커서가 3 × 2 = 6 을 다음 칸 아래에 쓰고 −4 + 6 = 2 를 내린다(같은 동작 두 번 더).', '아랫줄 3  2  6 │ 7 → 「몫 3x² + 2x + 6 · 나머지 7」 딱지.'], end='(3x³ − 4x² + 2x − 5) ÷ (x − 2)', at='c2')],
  notes=['형성평가는 조립제법 2문항(몫 · 나머지) — 산(m4)과 짝인 문항은 두지 않음(산은 수업에서 같이 풂).', '31쪽 공학 도구(스프레드시트 조립제법)는 수업 시연 거리로만.'])
if __name__ == '__main__': write(L)
