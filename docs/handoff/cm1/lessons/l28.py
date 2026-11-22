from cm1lib import *
from itertools import permutations, product
PW = lambda p, e: f'{p}{str(e).translate(SUP)}' if e > 1 else str(p)
def FA(v, rng): return pick(v, rng, (3, 2), lambda r: (ri(r, 1, 4), ri(r, 1, 3)))
def m1a(v, rng):
    a, b = FA(v, random.Random(rng.random() if v else 1)); n = 2 ** a * 3 ** b
    return choice(rng, f'{n} 을 소인수분해 하면?', f'{PW(2, a)} × {PW(3, b)}', [f'{PW(2, b)} × {PW(3, a)}' if a != b else f'{PW(2, a+1)} × {PW(3, b)}', f'{PW(2, a + 1)} × {PW(3, b - 1)}' if b > 1 else f'{PW(2, a)} × {PW(3, b + 1)}', f'{PW(2, a)} × {PW(5, b)}'], '2 로 나누어떨어질 때까지, 그다음 3 으로.', chk=True)
def m1b(v, rng):
    a, b = FA(v, random.Random(rng.random() if v else 1)); n = 2 ** a * 3 ** b
    return number(f'{n} = {PW(2, a)} × {PW(3, b)} 의 양의 약수의 개수는?', (a + 1) * (b + 1), f'2 의 지수 0 ~ {a} ({a+1}가지) × 3 의 지수 0 ~ {b} ({b+1}가지).', chk=lambda: len([t for t in range(1, n + 1) if n % t == 0]) == (a + 1) * (b + 1))
def CD(v, rng): return pick(v, rng, [0, 1, 2, 3], lambda r: [0] + sorted(r.sample(range(1, 8), r.choice([3, 4]))))
def m2a(v, rng):
    cs = CD(v, random.Random(rng.random() if v else 1)); val = sum(1 for p in permutations(cs, 3) if p[0] != 0)
    return number(f'숫자 {", ".join(map(str, cs))} 가 하나씩 적힌 카드 {len(cs)}장 중에서 서로 다른 3장을 뽑아 만들 수 있는 세 자리 자연수의 개수는?', val, f'백의 자리(0 제외) {len(cs)-1}가지 × 십의 자리 {len(cs)-1}가지 × 일의 자리 {len(cs)-2}가지.', chk=lambda: val == (len(cs) - 1) * (len(cs) - 1) * (len(cs) - 2))
def m2b(v, rng):
    cs = CD(v, random.Random(rng.random() if v else 1)); val = sum(1 for p in permutations(cs, 3) if p[0] != 0 and p[2] % 2 == 0)
    return number(f'숫자 {", ".join(map(str, cs))} 가 하나씩 적힌 카드 {len(cs)}장 중에서 서로 다른 3장을 뽑아 만들 수 있는 세 자리 자연수 중 짝수의 개수는?', val, '일의 자리가 0 인 경우와 0 이 아닌 짝수인 경우로 나누어 센 뒤 더한다(백의 자리에 0 불가).', chk=True)
def m3a(v, rng):
    k, n = pick(v, rng, (3, 4), lambda r: (ri(r, 3, 5), ri(r, 3, 5))); val = k * (k - 1) ** (n - 1)
    return number(f'한 줄로 나란히 붙어 있는 {n}개의 칸을 {k}가지 색으로 칠하려고 한다. 같은 색을 여러 번 써도 되지만 이웃한 칸은 서로 다른 색으로 칠하는 방법의 수는?', val, f'첫 칸 {k}가지, 그다음 칸부터는 앞 칸과 다른 {k-1}가지씩 → {k} × {k-1}{str(n-1).translate(SUP)}.', chk=lambda: sum(1 for t in product(range(k), repeat=n) if all(t[i] != t[i + 1] for i in range(n - 1))) == val)
def m3b(v, rng):
    k, n = pick(v, rng, (4, 3), lambda r: (lambda nn: (nn + ri(r, 0, 3), nn))(ri(r, 3, 5))); val = math.perm(k, n)
    return number(f'{n}개의 칸을 {k}가지 색 중에서 골라 모두 서로 다른 색으로 칠하는 방법의 수는?', val, ' × '.join(str(k - i) for i in range(n)) + ' — 한 번 쓴 색은 다시 못 쓴다.', chk=True)
# 산: 길 고르기 (합 · 곱 섞기)
def RD(v, rng): return pick(v, rng, (3, 2, 2), lambda r: (ri(r, 2, 5), ri(r, 2, 4), ri(r, 1, 3)))
def rs_(v, rng):
    a, b, c = RD(v, random.Random(rng.random() if v else 1)); return a, b, c, f'집에서 서점으로 가는 길이 {a}가지, 서점에서 학교로 가는 길이 {b}가지, 집에서 학교로 바로 가는 길이 {c}가지 있다.'
def m4a(v, rng):
    a, b, c, s = rs_(v, rng); return number(f'{s} 집에서 서점을 거쳐 학교로 가는 방법의 수는?', a * b, f'잇달아 일어난다 → {a} × {b}.', chk=True)
def m4b(v, rng):
    a, b, c, s = rs_(v, rng); return number(f'{s} 집에서 학교로 가는 방법의 수는? (서점을 거쳐도 되고 바로 가도 된다)', a * b + c, f'서점을 거치는 {a*b}가지 + 바로 가는 {c}가지 (동시에 일어나지 않음).', chk=True)
def m4c(v, rng):
    a, b, c, s = rs_(v, rng); return number(f'{s} 집에서 서점을 거쳐 학교에 갔다가, 서점을 거치지 않고 바로 집으로 돌아오는 방법의 수는?', a * b * c, f'가는 방법 {a*b}가지 × 돌아오는 방법 {c}가지.', chk=True)
def ex1(v, rng):
    a, b, c = pick(v, rng, (1, 2, 1), lambda r: (ri(r, 1, 3), ri(r, 1, 3), ri(r, 1, 2))); n = 2 ** a * 3 ** b * 5 ** c
    return number(f'{n} = {PW(2, a)} × {PW(3, b)} × {PW(5, c)} 의 양의 약수의 개수는?', (a + 1) * (b + 1) * (c + 1), f'({a} + 1)({b} + 1)({c} + 1).', chk=lambda: len([t for t in range(1, n + 1) if n % t == 0]) == (a + 1) * (b + 1) * (c + 1))
L = dict(id='cm1-28', no=28, title='경우의 수의 활용', unit='Ⅲ-1 경우의 수', pages='105 ~ 106', goal='합의 법칙과 곱의 법칙을 약수의 개수 · 자연수 만들기 · 색칠 · 길 고르기에 활용할 수 있다.',
  review='27차시: 합의 법칙 · 곱의 법칙 · 중학교: 소인수분해', intro='약수가 몇 개인지 다 쓰지 않고 세는 법? 지수를 고르는 「곱의 법칙」.',
  concepts=[dict(id='c1', title='약수의 개수 · 자연수 만들기', say='N = pᵃ × qᵇ 의 양의 약수의 개수 = (a + 1)(b + 1). 자릿수 문제는 제한이 큰 자리(맨 앞 0 불가 · 일의 자리 조건)부터 정한다.', check=dict(type='ox', q='12 = 2² × 3 의 양의 약수는 2 × 1 = 2 개이다.', ch=[], a='X', why='지수에 1 을 더해 곱한다 → 3 × 2 = 6 개.')),
            dict(id='c2', title='색칠 · 길 고르기', say='이웃한 칸을 다르게 칠하기 = 앞 칸의 색만 피한다. 길 고르기 = 잇달아 가면 곱, 갈라지는 경로는 합.')],
  mons=[dict(id='m1', title='문제 1 · 약수의 개수', subs=[m1a, m1b]), dict(id='m2', title='문제 2 · 세 자리 자연수 만들기', subs=[m2a, m2b]), dict(id='m3', title='문제 3 · 색칠하기', subs=[m3a, m3b]),
        dict(id='m4', title='문제 4 · 길 고르기', subs=[m4a, m4b, m4c]), dict(id='m5', title='소인수가 셋인 수', extra=True, subs=[ex1])],
  boss=[(m1b, 'c1', 'm1'), (m2a, 'c1', 'm2'), (m3a, 'c2', 'm3'), (m4b, 'c2', 'm4')],
  hard_from='어려운 문제(산) = 문제 2-2(짝수 세기 · 경우 나누기) — 본문 수준에서 이미 까다로워 중단원에서 더 가져오지 않음',
  motion=[dict(title='약수의 개수 = 지수 고르기', key='72 = 2³ × 3² 의 약수는 2 의 지수(0 ~ 3)와 3 의 지수(0 ~ 2)를 고르는 것.', scenes=['카드에 72 = 2³ × 3² 이 뜬다.', '가로 4칸(2⁰ ~ 2³) × 세로 3칸(3⁰ ~ 3²) 표가 펼쳐진다.', '칸마다 약수 1, 2, 4, 8, 3, 6, … 72 가 채워진다.', '표 크기 4 × 3 = 12 가 강조된다.'], end='(3 + 1)(2 + 1) = 12 개')],
  notes=['이 차시는 산을 따로 두지 않고(문제 2-2 가 가장 어려움) 네 꼴을 고르게 다룸 — 선생님 확인 거리.', '색칠 문제는 그림 없이 「한 줄로 붙은 칸」으로 통일(게시판에서 혼자 풀리게).'])
if __name__ == '__main__': write(L)
