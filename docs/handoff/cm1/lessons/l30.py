from cm1lib import *
from itertools import permutations
F = math.factorial
def brute(a, b, cond):
    ppl = ['M'] * a + ['W'] * b; idx = list(range(a + b))
    return sum(1 for p in permutations(idx) if cond([ppl[i] for i in p]))
adj = lambda seq, ch, k: any(all(seq[i + j] == ch for j in range(k)) for i in range(len(seq) - k + 1))
def MW(v, rng, k=0): return pick(v, rng, [(3, 2), (4, 2), (3, 3)][k], lambda r: (ri(r, 2, 5), ri(r, 2, 3)))
def m1a(v, rng):
    a, b = MW(v, random.Random(rng.random() if v else 1)); val = F(a + 1) * F(b)
    return number(f'남학생 {a}명과 여학생 {b}명을 한 줄로 세울 때, 여학생 {b}명이 모두 이웃하게 서는 방법의 수는?', val, f'여학생을 한 묶음으로 보면 {a+1}! , 묶음 안에서 자리 바꾸기 {b}! → {F(a+1)} × {F(b)}.', chk=lambda: brute(a, b, lambda s: adj(s, 'W', b)) == val)
def m1b(v, rng):
    a, b = MW(v, random.Random(rng.random() if v else 1))
    return choice(rng, f'남학생 {a}명과 여학생 {b}명을 한 줄로 세울 때 여학생끼리 이웃하게 세우려고 한다. 여학생 {b}명을 한 묶음으로 보면, 줄 세울 대상은 모두 몇 개인가?', f'{a + 1}개', [f'{a + b}개', f'{a}개', f'{b + 1}개'] if a != b else [f'{a + b}개', f'{a}개', f'{a + 2}개'], f'남학생 {a}명 + 묶음 1개.', chk=True)
def m2a(v, rng):
    a, b = MW(v, random.Random(rng.random() if v else 1), 1); 
    if b > a + 1: b = a
    val = F(a) * math.perm(a + 1, b)
    return number(f'남학생 {a}명과 여학생 {b}명을 한 줄로 세울 때, 여학생끼리 서로 이웃하지 않게 서는 방법의 수는?', val, f'남학생 {a}명을 먼저 세우고({a}!), 그 사이사이와 양 끝 {a+1}곳 중 {b}곳에 여학생을 세운다.', chk=lambda: brute(a, b, lambda s: not adj(s, 'W', 2)) == val)
def m2b(v, rng):
    a = pick(v, rng, 4, lambda r: ri(r, 2, 12))
    return number(f'남학생 {a}명을 한 줄로 세웠을 때, 그 사이사이와 양 끝에 여학생이 설 수 있는 자리는 모두 몇 곳인가?', a + 1, f'사이 {a-1}곳 + 양 끝 2곳.', chk=True)
def m3a(v, rng):
    n = pick(v, rng, 5, lambda r: ri(r, 4, 8)); val = 2 * F(n - 2); who = pick(v, rng, '부모님 2명을 포함한 가족', lambda r: r.choice(['부모님 2명을 포함한 가족', '선생님 2명을 포함한 동아리 회원', '주장과 부주장을 포함한 선수']))
    who2 = '부모님' if '부모님' in who else '선생님 2명' if '선생님' in who else '주장과 부주장'
    return number(f'{who} {n}명이 한 줄로 설 때, {who2}이 양 끝에 서는 방법의 수는?'.replace('장이 양', '장이 양'), val, f'양 끝 두 자리 2! × 가운데 {n-2}명 {n-2}!.', chk=lambda: sum(1 for p in permutations(range(n)) if {p[0], p[-1]} == {0, 1}) == val)
def m3b(v, rng):
    n = pick(v, rng, 5, lambda r: ri(r, 3, 11)); val = F(n - 1)
    return number(f'학생 {n}명이 한 줄로 설 때, 그중 한 학생(반장)이 맨 앞에 서는 방법의 수는?', val, f'반장 자리는 정해짐 → 나머지 {n-1}명만 줄 세운다.', chk=True)
# 산: 승용차 좌석 (중단원 마무리 08 꼴)
def CAR(v, rng): return pick(v, rng, (5, 2), lambda r: (lambda n_: (n_, ri(r, 1, n_ - 1)))(ri(r, 4, 6)))
def cs_(v, rng):
    n, d = CAR(v, random.Random(rng.random() if v else 1)); return n, d, f'운전석을 포함하여 좌석이 {n}개인 승용차에 {n}명이 모두 타려고 한다. {n}명 중 운전을 할 수 있는 사람은 {d}명뿐이다.'
def m4a(v, rng):
    n, d, s = cs_(v, rng); return number(f'{s} 운전석에 앉을 사람을 정하는 방법의 수는?', d, f'운전할 수 있는 {d}명 중 한 명.', chk=True)
def m4b(v, rng):
    n, d, s = cs_(v, rng); return number(f'{s} 운전석에 한 명이 앉은 뒤, 나머지 {n-1}명이 남은 {n-1}개 좌석에 앉는 방법의 수는?', F(n - 1), f'{n-1}!.', chk=True)
def m4c(v, rng):
    n, d, s = cs_(v, rng); return number(f'{s} {n}명이 앉는 방법의 수는?', d * F(n - 1), f'운전석 {d}가지 × 나머지 {n-1}! = {d} × {F(n-1)}.', chk=lambda: sum(1 for p in permutations(range(n)) if p[0] < d) == d * F(n - 1))
def ex1(v, rng):
    a, k = pick(v, rng, (3, 0), lambda r: (ri(r, 2, 4), r.choice([0, 1, 2]))); val = 2 * F(a) * F(a)
    A, B = [('남학생', '여학생'), ('1학년 학생', '2학년 학생'), ('어른', '어린이')][k]
    return number(f'{A} {a}명과 {B} {a}명이 한 줄로 설 때, {A}{"과" if k < 2 else "과"} {B}{"이" if k < 2 else "가"} 번갈아 서는 방법의 수는?'.replace('어른과', '어른과'), val, f'한쪽이 먼저인 경우 {a}! × {a}!, 다른 쪽이 먼저인 경우도 같다 → × 2.', chk=lambda: a > 3 or brute(a, a, lambda s: all(s[i] != s[i + 1] for i in range(2 * a - 1))) == val)
L = dict(id='cm1-30', no=30, title='순열의 활용', unit='Ⅲ-1 경우의 수', pages='110 · 116 (중단원 08)', goal='이웃하는 경우 · 이웃하지 않는 경우 · 자리가 정해진 경우의 순열의 수를 구할 수 있다.',
  review='29차시: n! 과 ₙPᵣ', intro='단체 사진을 찍는데 친한 둘은 꼭 붙어 서고 싶다 — 조건이 붙은 줄 세우기.',
  concepts=[dict(id='c1', title='이웃하게 · 이웃하지 않게', say='이웃하게 = 한 묶음으로 보고 줄 세운 뒤 묶음 안에서 자리 바꾸기. 이웃하지 않게 = 나머지를 먼저 세우고 사이사이 · 양 끝에 끼워 넣기.', check=dict(type='ox', q='A, B 가 이웃하게 서는 방법의 수는 A, B 를 한 묶음으로 본 순열의 수에 2 를 곱한다.', ch=[], a='O', why='묶음 안에서 AB, BA 두 가지.')),
            dict(id='c2', title='자리가 정해진 경우', say='조건이 붙은 자리(양 끝 · 맨 앞 · 운전석)를 먼저 채우고, 나머지를 줄 세운다.')],
  mons=[dict(id='m1', title='문제 1 · 이웃하게', subs=[m1b, m1a]), dict(id='m2', title='문제 2 · 이웃하지 않게', subs=[m2b, m2a]), dict(id='m3', title='문제 3 · 자리가 정해진 경우', subs=[m3a, m3b]),
        dict(id='m4', title='문제 4 · 승용차에 앉기', hard=True, subs=[m4a, m4b, m4c]), dict(id='m5', title='번갈아 서기', extra=True, subs=[ex1])],
  boss=[(m1a, 'c1', 'm1'), (m2a, 'c1', 'm2'), (m3a, 'c2', 'm3'), (m4c, 'c2', 'm4')],
  hard_from='산 = 중단원 마무리 08번 꼴(승용차 좌석 · 본문에 어려운 문제가 없어 가져옴)',
  motion=[dict(title='붙어 설 사람은 한 묶음', key='이웃하게 = 묶어서 줄 세우고, 묶음 안에서 다시 줄 세운다.', scenes=['카드에 사람 칩 5개(파랑 3 · 분홍 2).', '분홍 둘이 고무줄로 묶여 칩 하나처럼 된다 → 칩 4개.', '4개가 줄을 바꾸며 「4!」 가 뜬다.', '묶음 안에서 둘이 자리를 바꾸며 「× 2!」.'], end='4! × 2! = 48')],
  notes=['교과서 110쪽 한 쪽 분량에 중단원 유형을 더해 한 차시로 만듦(29차시와 붙이면 50분을 넘음).', '모든 수는 사람 6명 이하에서 실제로 세어(전수 조사) 검산함.'])
if __name__ == '__main__': write(L)
