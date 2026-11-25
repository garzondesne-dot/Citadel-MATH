# 15차시 팩 v7 몬스터 3(중단원 10 · 119쪽 서술형) 독립 검산 (2026-11-25 · 📚 차시팩 #1) · build15.py 를 읽지 않고 문항 글만 읽어 다시 풂
#   쓰는 법: python3 verify_m3.py <ex15.json>
import json, re, sys
from itertools import product
d = json.load(open(sys.argv[1], encoding='utf8')); m = d['monsters']['m3']
N = lambda t: int(t.replace('−', '-'))
pair = lambda a, b: f'({a}, {b})'.replace('-', '−')
vers = m['chain']['pool']; assert vers[0] == m['first'] and m['retry']['pool'] == vers[1:]
bad, rows = [], []
for v, items in enumerate(vers):
    q0 = items[0]['question'].split('\n')[0]
    p, q, r, s = map(N, re.search(r'X = \{x \| (−?\d+) ≤ x ≤ (−?\d+)\}, Y = \{y \| (−?\d+) ≤ y ≤ (−?\d+)\}', q0).groups())
    # 일대일대응 = 정수 a ≠ 0 · b 를 넓게 찾아 [p, q] 의 치역이 정확히 [r, s] 인 것
    sols = [(a, b) for a, b in product(range(-30, 31), range(-60, 61)) if a and sorted([a * p + b, a * q + b]) == [r, s]]
    assert len(sols) == 2, sols
    up = [x for x in sols if x[0] > 0][0]; dn = [x for x in sols if x[0] < 0][0]
    for it in items: assert it['question'].startswith(q0 + '\n'), '문항마다 문제 글 전체(혼자 풀림)'
    a = items
    ok1 = a[0]['choices'][a[0]['answerIndex']] == f'양 끝끼리 대응 : {{f({p}), f({q})}} = {{{r}, {s}}}'.replace('-', '−')
    lhs = lambda c: ('' if c == 1 else '−' if c == -1 else str(c).replace('-', '−')) + 'a + b = '
    want2 = {lhs(p) + str(up[0] * p + up[1]).replace('-', '−'), lhs(q) + str(up[0] * q + up[1]).replace('-', '−')}
    def holds(o, ab):  # 「ca + b = k」 를 (a, b) 에 넣어 봄
        c, k = re.fullmatch(r'(−?\d*)a \+ b = (−?\d+)', o).groups()
        c = {'': 1, '−': -1}.get(c, None) or N(c)
        return c * ab[0] + ab[1] == N(k)
    ok2 = {a[1]['options'][i] for i in a[1]['answer']} == want2 and all(holds(a[1]['options'][i], up) for i in a[1]['answer']) \
        and not any(holds(o, up) for i, o in enumerate(a[1]['options']) if i not in a[1]['answer'])
    ok3 = a[2]['choices'][a[2]['answerIndex']] == pair(*up)
    ok4 = a[3]['choices'][a[3]['answerIndex']] == pair(*dn)
    ok5 = {a[4]['options'][i] for i in a[4]['answer']} == {pair(*up), pair(*dn)}
    for k, okk in enumerate([ok1, ok2, ok3, ok4, ok5], 1):
        if not okk: bad.append(f'판{v} {k}')
    rows.append(f'| 판 {v} | X [{p}, {q}] → Y [{r}, {s}] | {pair(*up)} · {pair(*dn)} | {"✔" if all([ok1, ok2, ok3, ok4, ok5]) else "✘"} | ✔ |')
print('| 판 | 조건 | (a, b) 다시 구함 | 5단계 정답 | 혼자 풀림 |\n|---|---|---|---|---|'); print('\n'.join(rows))
assert not bad, bad
print('몬스터 3 판', len(vers), '× 5단계 독립 검산 ✔')
