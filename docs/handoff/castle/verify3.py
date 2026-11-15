# 독립 검산: 문제 글에서 숫자를 읽어 다시 계산 (gen3.py 계산을 쓰지 않음)
import json, re, random
from fractions import Fraction as Fr
d = json.load(open('eval-3v2.json')); R = {r['id']: r for r in d['rooms']}
bad = n = 0
def ok(c, m):
    global bad, n; n += 1
    if not c: bad += 1; print('FAIL', m)
sel = lambda q: q['ch'][int(q['a'])]
num = lambda s: float(Fr(s.replace('−', '-')))
for v, vs in enumerate(R['q11']['vers']):
    P, Q = map(int, re.search(r'\(x − a \+ (\d+)\)\(x \+ 2a − (\d+)\)', vs[0]['q']).groups())
    good = [a for a in range(-60, 61) if all((min(0, 2*a) <= x <= max(0, 2*a)) for x in (a - P, Q - 2*a))]
    ok(sel(vs[0]) == 'P ⊂ Q', f'q11 v{v} 1'); ok(sel(vs[1]) == f'{{a − {P}, {Q} − 2a}}', f'q11 v{v} 2')
    lo, hi = map(int, re.match(r'(-?\d+) ≤ a ≤ (\d+)', sel(vs[3])).groups()); ok(list(range(lo, hi + 1)) == good, f'q11 v{v} 4 {good}')
    ok(int(vs[4]['a']) == sum(good) and vs[4]['type'] == 'number', f'q11 v{v} 5')
for v, vs in enumerate(R['q14']['vers']):
    m, nn = map(int, re.search(r'\(x \+ (\d+)/y\)\(1/x \+ (\d+)y\)', vs[0]['q']).groups())
    F = lambda x, y: (x + m / y) * (1 / x + nn * y)
    best = min((F(1, t / 2000), t / 2000) for t in range(1, 20000))  # x=1, xy = t
    ok(abs(float(vs[4]['a']) - best[0]) < 1e-3, f'q14 v{v} min {best}')
    ok(abs(num(sel(vs[3])) - best[1]) < 1e-3, f'q14 v{v} xy')
    k = float(re.search(r'\+ (\d+)$', sel(vs[0])).group(1)); ok(all(abs(F(x, y) - (nn*x*y + m/(x*y) + k)) < 1e-9 for x in (0.5, 2) for y in (0.3, 3)), f'q14 v{v} 전개')
    ok(abs(float(sel(vs[2])) - min(nn*t + m/t for t in [i/2000 for i in range(1, 40000)])) < 1e-3, f'q14 v{v} 3')
for v, vs in enumerate(R['q15']['vers']):
    B, G, S = map(int, re.search(r'남학생 (\d+)명과 여학생 (\d+)명.*합은 (\d+)', vs[0]['q']).groups())
    sols = [(x, y) for x in range(0, B + 1) for y in range(0, G + 1) if x + y == S - B - G and B - x == G - y]
    ok(len(sols) == 1 and int(vs[3]['a']) == sols[0][1], f'q15 v{v} {sols}')
    ok(sel(vs[0]) == str(S - B - G), f'q15 v{v} 1')
    picks = [vs[2]['ch'][int(i)] for i in vs[2]['a'].split(',')]; x, y = sols[0]
    for c in vs[2]['ch']:
        e = c.replace('−', '-').replace('=', '==').replace('x', f'({x})').replace('y', f'({y})')
        ok(eval(e) == (c in picks), f'q15 v{v} 식 {c}')
for v, vs in enumerate(R['q16']['vers']):
    p = int(re.search(r'√(\d+)', vs[0]['q']).group(1)); ok(vs[1]['a'] == str(p) and vs[2]['a'] == str(p), f'q16 v{v}')
    ok(sel(vs[0]) == f'√{p} 는 유리수이다.' and sel(vs[3]).startswith('m, n 이 서로소'), f'q16 v{v} 가정')
r = random.Random(1)
for v, vs in enumerate(R['q17']['vers']):
    ok(all(abs(2*(a**3 + b**3) - (a+b)*(a*a+b*b) - (a+b)*(a-b)**2) < 1e-6 for a, b in [(r.random()*5, r.random()*5) for _ in range(20)]) and sel(vs[1]) == '(a + b)(a − b)²', f'q17 v{v}')
    ok(sel(vs[3]) == 'a = b', f'q17 v{v} 등호')
for rid in NEWS if (NEWS := ['q11', 'q14', 'q15', 'q16']) else []:
    s = [json.dumps([q['q'] for q in v], ensure_ascii=False) for v in R[rid]['vers']]; ok(len(set(s)) == 7, f'{rid} 판 겹침')
for rr in d['rooms']:
    for vv in rr['vers']:
        for q in vv:
            if q['type'] in ('choice', 'multi'): ok(len(set(q['ch'])) == len(q['ch']) and all(0 <= int(i) < len(q['ch']) for i in q['a'].split(',')), f'{rr["id"]} 보기')
print(f'검산 {n}건 · 실패 {bad}')
