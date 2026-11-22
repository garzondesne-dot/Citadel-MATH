from cm1lib import *
Z = lambda r: (ri(r, -5, 5, (0,)), ri(r, -5, 5, (0,)))
def ZW(v, rng, k=0): return pick(v, rng, [((3, -2), (-1, 4)), ((2, 1), (3, -1)), ((1, 2), (3, -1))][k], lambda r: (Z(r), Z(r)))
def m1(sign):
    def f(v, rng):
        z, w = ZW(v, random.Random(rng.random() if v else 1)); R = cadd(z, w, sign)
        return choice(rng, f'({cf(*z)}) {"+" if sign > 0 else "−"} ({cf(*w)}) 를 계산하면?', cf(*R), [cf(*cadd(z, w, -sign)), cf(R[0], -R[1]), cf(R[1], R[0]), cf(R[0] + 1, R[1])], '실수부분끼리, 허수부분끼리 계산한다(i 를 문자처럼).', chk=lambda: complex(*z) + sign * complex(*w) == complex(*R))
    return f
def m2a(v, rng):
    z, w = ZW(v, random.Random(rng.random() if v else 1), 1); R = cmul(z, w)
    return choice(rng, f'({cf(*z)})({cf(*w)}) 를 계산하면?', cf(*R), [cf(z[0] * w[0] + z[1] * w[1], R[1]), cf(z[0] * w[0], z[1] * w[1]), cf(R[0], -R[1]), cf(R[1], R[0])], f'분배법칙으로 전개하고 i² = −1 로 바꾼다: {D(P([z[1]*w[1], 0], "i"))}² = {N(-z[1]*w[1])}.', chk=lambda: complex(*z) * complex(*w) == complex(*R))
def m2b(v, rng):
    z = pick(v, rng, (3, 2), Z)
    return number(f'복소수 z = {cf(*z)} 와 그 켤레복소수의 곱을 구하면?', z[0] ** 2 + z[1] ** 2, f'(a + bi)(a − bi) = a² + b² = {z[0]**2} + {z[1]**2}.', chk=lambda: cmul(z, conj(z)) == (z[0] ** 2 + z[1] ** 2, 0))
def DV(v, rng):
    w = pick(v, rng, (1, 2), Z); q = pick(v, rng, (1, -1), Z); return cmul(q, w), w, q
def m3a(v, rng):
    z, w, q = DV(v, random.Random(rng.random() if v else 1))
    return choice(rng, f'({cf(*z)}) ÷ ({cf(*w)}) 를 계산하려면 분모와 분자에 무엇을 곱해야 하는가?', cf(*conj(w)), [cf(*w), cf(-w[0], -w[1]), 'i', cf(*conj(z))], '분모의 켤레복소수를 곱하면 분모가 실수(a² + b²)가 된다.', chk=True)
def m3b(v, rng):
    z, w, q = DV(v, random.Random(rng.random() if v else 1))
    return choice(rng, f'({cf(*z)}) ÷ ({cf(*w)}) 를 계산하면?', cf(*q), [cf(q[0], -q[1]), cf(-q[0], q[1]), cf(q[1], q[0]), cf(q[0] + 1, q[1])], f'분모 · 분자에 {cf(*conj(w))} 를 곱하면 분모 = {w[0]**2 + w[1]**2}.', chk=lambda: cdiv(z, w) == q)
# 산: αᾱ + ᾱβ + αβ̄ + ββ̄ (중단원 마무리 06 꼴)
def AB(v, rng): return pick(v, rng, ((3, -2), (-2, 1)), lambda r: (Z(r), Z(r)))
def hs(v, rng):
    a, b = AB(v, random.Random(rng.random() if v else 1)); return a, b, f'두 복소수 α = {cf(*a)}, β = {cf(*b)} 에 대하여 (ᾱ, β̄ 는 각각 α, β 의 켤레복소수)'
def m4a(v, rng):
    a, b, s = hs(v, rng)
    return choice(rng, f'{s} αᾱ + ᾱβ + αβ̄ + ββ̄ 를 인수분해 하면?', '(α + β)(ᾱ + β̄)', ['(α + ᾱ)(β + β̄)', '(α + β)²', '(α − β)(ᾱ − β̄)'], 'ᾱ(α + β) + β̄(α + β) 로 묶인다.', chk=True)
def m4b(v, rng):
    a, b, s = hs(v, rng); t = cadd(a, b)
    return choice(rng, f'{s} α + β 와 그 켤레복소수 ᾱ + β̄ 를 차례로 구하면?', f'{cf(*t)}, {cf(*conj(t))}', [f'{cf(*t)}, {cf(*t)}', f'{cf(*conj(t))}, {cf(*t)}', f'{cf(*cadd(a, b, -1))}, {cf(*conj(cadd(a, b, -1)))}'], '더한 뒤 허수부분의 부호만 바꾸면 켤레(합의 켤레 = 켤레의 합).', chk=True)
def m4c(v, rng):
    a, b, s = hs(v, rng); t = cadd(a, b)
    val = t[0] ** 2 + t[1] ** 2
    return number(f'{s} αᾱ + ᾱβ + αβ̄ + ββ̄ 의 값은?', val, f'(α + β)(ᾱ + β̄) = ({cf(*t)})({cf(*conj(t))}) = {t[0]**2} + {t[1]**2}.', chk=lambda: sum(x for x, _ in [cmul(a, conj(a)), cmul(conj(a), b), cmul(a, conj(b)), cmul(b, conj(b))]) == val)
def ex1(v, rng):
    s, n = pick(v, rng, (1, 4), lambda r: (r.choice([1, -1]), r.choice([4, 6, 8])))
    val = complex(1, s) ** n; R = (round(val.real), round(val.imag))
    return choice(rng, f'({cf(1, s)})² = {cf(0, 2*s)} 임을 이용하여 ({cf(1, s)}){str(n).translate(SUP)} 의 값을 구하면?', cf(*R), list(dict.fromkeys([cf(-R[0], -R[1]), cf(R[1], R[0]) if R[1] != R[0] else cf(2 ** (n // 2), 0), cf(0, 2 ** (n // 2)), cf(2 ** n, 0), cf(-2 ** (n // 2), 0)])), f'({cf(0, 2*s)}){str(n//2).translate(SUP)} 를 계산한다 — i² = −1.', chk=True)
L = dict(id='cm1-11', no=11, title='복소수의 사칙연산', unit='Ⅱ-1 복소수와 이차방정식', pages='48 ~ 49', goal='복소수의 덧셈 · 뺄셈 · 곱셈 · 나눗셈을 할 수 있다.',
  review='10차시: i² = −1 · 켤레복소수 · 중학교: 분모의 유리화', intro='i 를 문자처럼 계산하되 i² 이 나오면 −1 로 바꾼다. 나눗셈은 분모의 유리화처럼 켤레를 곱한다.',
  concepts=[dict(id='c1', title='덧셈 · 뺄셈 · 곱셈', say='덧셈 · 뺄셈 = 실수부분끼리, 허수부분끼리. 곱셈 = 분배법칙으로 전개 뒤 i² = −1.', check=dict(type='ox', q='(1 + i)(1 − i) = 0 이다.', ch=[], a='X', why='1 − i² = 1 + 1 = 2.')),
            dict(id='c2', title='나눗셈', say='분모의 켤레복소수를 분모 · 분자에 곱해 분모를 실수로 만든다: (a + bi)(a − bi) = a² + b².')],
  mons=[dict(id='m1', title='문제 1 · 덧셈과 뺄셈', subs=[m1(1), m1(-1)]), dict(id='m2', title='문제 2 · 곱셈', subs=[m2a, m2b]), dict(id='m3', title='문제 3 · 나눗셈', subs=[m3a, m3b]),
        dict(id='m4', title='문제 4 · 켤레가 섞인 식의 값', hard=True, subs=[m4a, m4b, m4c]), dict(id='m5', title='(1 + i) 의 거듭제곱', extra=True, subs=[ex1])],
  boss=[(m1(-1), 'c1', 'm1'), (m2a, 'c1', 'm2'), (m2b, 'c1', 'm2'), (m3b, 'c2', 'm3')],
  hard_from='산 = 중단원 마무리 06번 꼴(본문에 어려운 문제가 없어 가져옴)',
  motion=[dict(title='복소수 나눗셈 — 켤레를 곱한다', key='분모에 켤레복소수를 곱하면 분모가 실수가 된다.', scenes=['카드에 (5 + 5i) / (1 + 2i) 가 분수로 뜬다.', '커서가 분모의 켤레 1 − 2i 를 집어 위 · 아래에 붙인다.', '분모가 1² + 2² = 5 로 접히고, 분자가 전개되어 15 − 5i.', '5 로 나누어 3 − i 가 남는다.'], end='분모 × 켤레 = a² + b²', at='c2')],
  notes=['나눗셈은 결과가 정수 계수 복소수가 되도록 (몫) × (나누는 수) 로 만든 수를 씀.', '산의 켤레 기호는 ᾱ, β̄ 로 적음 — 화면 글꼴에서 윗줄이 보이는지 손발 확인 거리.'])
if __name__ == '__main__': write(L)
