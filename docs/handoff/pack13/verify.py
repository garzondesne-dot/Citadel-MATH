# 독립 검산: 문제 글에서 숫자 · 식을 읽어 직접 계산 (gen.py 의 계산을 쓰지 않음)
import json, re, itertools
d = json.load(open('raw.json'))
bad = 0; n = 0
def ok(c, m):
    global bad, n; n += 1
    if not c: bad += 1; print('FAIL', m)
def py(e):
    e = e.replace('−', '-').replace('²', '**2').replace('≥', '>=').replace('≤', '<=')
    e = re.sub(r'(\d)([abx(])', r'\1*\2', e); e = re.sub(r'\)\(', ')*(', e); e = re.sub(r'([ab])([ab])', r'\1*\2', e)
    e = re.sub(r'\|([^|]+)\|', r'abs(\1)', e)
    return e
G = [i / 2 for i in range(-24, 25)]
def always(e):
    f = py(e); return all(eval(f, {'abs': abs}, {'x': x, 'a': a, 'b': b}) for x in G for a in G[::4] for b in G[::4])
num = lambda s: float(s.replace('−', '-'))
sel = lambda q: q['ch'][int(q['a'])]
for v, vs in enumerate(d['mons']['m1']['vers']):
    for q in vs:
        e = q['q'].split(') ', 2)[-1].split('\n')[-1]; e = re.sub(r'^\(\d\) ', '', e)
        ok((q['a'] == 'O') == always(e), f'm1 v{v} {e}')
for v, vs in enumerate(d['mons']['m2']['vers']):
    K, M = map(int, re.search(r'x² \+ (\d+) ≥ (\d+)x', vs[0]['q']).groups())
    xs = [i / 3 for i in range(-30, 31)]
    f = lambda s, x: eval(py(s), {}, {'x': x})
    ok(all(abs(f(sel(vs[0]), x) - (x*x + K - M*x)) < 1e-9 for x in xs), f'm2 v{v} 1')
    ok(all(abs(f(f'({sel(vs[1])})²', x) - (x*x - M*x + K)) < 1e-9 for x in xs), f'm2 v{v} 2')
    ok(sel(vs[2]) == '≥' and min(x*x + K - M*x for x in xs) >= -1e-9, f'm2 v{v} 3')
    zero = [x for x in range(-50, 51) if x*x + K - M*x == 0]; ok(zero == [num(sel(vs[3]))], f'm2 v{v} 4 {zero}')
    for q in vs: ok(sum(1 for c in q['ch'] if (c == sel(q))) == 1, 'dup')
for v, vs in enumerate(d['mons']['m3']['vers']):
    c = int(re.search(r'x \+ (\d+)/x', vs[0]['q']).group(1))
    ok(num(sel(vs[0])) == c, f'm3 v{v} 1')
    best = min((x / 1000 + c / (x / 1000), x / 1000) for x in range(1, 200000))
    ok(abs(num(sel(vs[1])) - best[0]) < 1e-3, f'm3 v{v} 2 {best}'); ok(abs(num(sel(vs[2])) - best[1]) < 1e-2, f'm3 v{v} 3')
for v, vs in enumerate(d['mons']['m4']['vers']):
    p, q = map(int, re.search(r'\(a \+ (\d+)/b\)\(b \+ (\d+)/a\)', vs[0]['q']).groups())
    F = lambda a, b: (a + p / b) * (b + q / a)
    e = sel(vs[0]); m, k = map(int, re.search(r'ab \+ (\d+)/\(ab\) \+ (\d+)', e).groups())
    ok(all(abs(F(a, b) - (a*b + m / (a*b) + k)) < 1e-9 for a in (0.5, 1, 2, 3.7) for b in (0.3, 1, 2.5)), f'm4 v{v} 전개')
    ok(sel(vs[1]).startswith('ab > 0'), f'm4 v{v} 2')
    best = min((F(a / 50, b / 50), a * b / 2500) for a in range(1, 400) for b in range(1, 400))
    t = min(t * 1 for t in [ (u/1000) + m / (u/1000) for u in range(1, 100000)])
    ok(abs(num(sel(vs[2])) - t) < 1e-3, f'm4 v{v} 3'); ok(abs(num(sel(vs[3])) - best[1]) < 0.05, f'm4 v{v} 4 {best}'); ok(abs(num(sel(vs[4])) - best[0]) < 0.01, f'm4 v{v} 5 {best}')
for v, vs in enumerate(d['boss']['vers']):
    ok(sel(vs[0]) == '절대부등식', 'b1')
    truth = [always(re.sub(r'^[①②③] ', '', c)) for c in vs[1]['ch']]; ok(truth.count(True) == 1 and truth.index(True) == int(vs[1]['a']), f'b2 v{v} {vs[1]["ch"]}')
    A, B = map(int, re.search(r'x² − (\d+)x \+ (\d+)', vs[2]['q']).groups())
    ok(all(abs(eval(py(f'({sel(vs[2])})²'), {}, {'x': x}) - (x*x - A*x + B)) < 1e-9 for x in range(-9, 10)), f'b3 v{v}')
    c = int(re.search(r'x \+ (\d+)/x', vs[3]['q']).group(1)); ok(abs(num(sel(vs[3])) - min(x/1000 + c/(x/1000) for x in range(1, 100000))) < 1e-3, f'b4 v{v}')
    S = int(re.search(r'a \+ b = (\d+)', vs[4]['q']).group(1)); ok(abs(num(sel(vs[4])) - max(a/100 * (S - a/100) for a in range(1, S*100))) < 1e-6, f'b5 v{v}')
# 버전끼리 다른지 · 보기 겹침 · 교과서 · 학습지 숫자 = 버전 0
for k, m in list(d['mons'].items()) + [('boss', d['boss'])]:
    s = [json.dumps([q['q'] for q in v], ensure_ascii=False) for v in m['vers']]; ok(len(set(s)) == 7, f'{k} 버전 겹침')
    for v in m['vers']:
        for q in v:
            if q['type'] == 'choice': ok(len(set(q['ch'])) == len(q['ch']) and 0 <= int(q['a']) < len(q['ch']), f'{k} 보기')
print(f'검산 {n}건 · 실패 {bad}')
