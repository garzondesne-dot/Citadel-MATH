# 14차시 차시팩 v6 (2026-11-23 · 📚 차시팩 #1 · 선생님 「판 4 = 새 숫자로」)
#   v5 m3 소레이드 chain.pool 판 3 = 판 4 (정의역 {2, 3} · +4) 똑같음 → 판 4 만 새 숫자 · retry.pool[3] (= chain.pool[4]) 도 같이
#   쓰는 법: python3 make_v6.py <v5 ex14.json> <출력 v6.json>
import json, sys, copy
from fractions import Fraction as F
src, out = sys.argv[1], sys.argv[2]
d = json.load(open(src, encoding='utf8')); M = d['monsters']['m3']
cp, rp = M['chain']['pool'], M['retry']['pool']
same = lambda v: [v[0]['question'].split('\n')[0]] + [x['choices'][x['answerIndex']] for x in v]
assert same(cp[3]) == same(cp[4]) and rp == cp[1:], '바탕이 v5 와 다름'   # 문제 글 · 정답 같음 (보기 순서 · 조사만 다름)
old = copy.deepcopy(d)

p, q, c = 1, 5, 7                       # 정의역 {1, 5} · g(x) = x² + bx + 7
m = lambda n: str(n).replace('-', '−')
# 독립 검산: p + a = p² + bp + c , q + a = q² + bq + c
b = F((q - p) - (q * q - p * p), q - p); a = p * p + b * p + c - p
assert (b, a) == (-5, 2)
for x in (p, q): assert x + a == x * x + b * x + c
L, R = p * p + c, q * q + c             # 8, 32
stem = f'문제 3) 정의역이 {{{p}, {q}}}인 두 함수 f(x) = x + a, g(x) = x² + bx + {c} 에 대하여 f = g 일 때\n'
V = [
 {'type': 'choice', 'question': stem + 'f = g 가 뜻하는 것은?',
  'choices': [f'f({p}) = g({p}), f({q}) = g({q})', '두 함수의 식이 똑같다', 'f(x) = g(x) 인 x 가 하나만 있으면 된다'], 'answerIndex': 0,
  'solution': '서로 같은 함수 = 정의역의 모든 원소에서 함숫값이 같다', 'say': f'f = g 이므로 f({p}) = g({p}), f({q}) = g({q}) 이다.'},
 {'type': 'choice', 'question': stem + f'f({p}) = g({p}) 을 식으로 쓰면?',
  'choices': [f'a = {L} + b', f'{p} + a = {L} + b', f'{p} + a = {p * p} + b'], 'answerIndex': 1,
  'solution': f'f({p}) = {p} + a · g({p}) = {p * p} + b + {c}', 'say': f'f({p}) = g({p}) 에서 {p} + a = {L} + b'},
 {'type': 'choice', 'question': stem + f'f({q}) = g({q}) 를 식으로 쓰면?',
  'choices': [f'{q} + a = {q * q} + {q}b', f'{q} + a = {q + c} + {q}b', f'{q} + a = {R} + {q}b'], 'answerIndex': 2,
  'solution': f'f({q}) = {q} + a · g({q}) = {q * q} + {q}b + {c}', 'say': f'f({q}) = g({q}) 에서 {q} + a = {R} + {q}b'},
 {'type': 'choice', 'question': stem + '두 식을 빼서 구한 b 는?',
  'choices': [f'b = {m(b)}', f'b = {m(-b)}', f'b = {m(b + 1)}'], 'answerIndex': 0,
  'solution': f'(뒤 식) − (앞 식) : {q - p} = {R - L} + {q - p}b → b = {m(b)}', 'say': f'두 식을 빼면 b = {m(b)}'},
 {'type': 'choice', 'question': stem + '그러므로 a 와 b 는?',
  'choices': [f'a = {m(b)}, b = {m(a)}', f'a = {m(-a)}, b = {m(b)}', f'a = {m(a)}, b = {m(b)}'], 'answerIndex': 2,
  'solution': f'{p} + a = {L} + b 에 b = {m(b)} 를 넣으면 a = {m(a)}', 'say': f'그러므로 a = {m(a)}, b = {m(b)} 이다.'},
]
# 검사: 보기 겹침 없음 · 오답 대입(정답만 맞음) · 다른 판과 숫자 안 겹침
for s in V: assert len(set(s['choices'])) == 3
import re
def holds(eq):                          # 'n + a = k + mb' 꼴을 a, b 에 넣어 참인지
    l, r = eq.split(' = '); ev = lambda s: eval(re.sub(r'(\d)b', r'\1*b', s).replace('−', '-'), {'a': a, 'b': b})
    return ev(l) == ev(r)
for k in (1, 2):
    ok = [holds(t) for t in V[k]['choices']]; assert ok.count(True) == 1 and ok[V[k]['answerIndex']], (k, ok)
for k, (A, B) in ((3, (None, b)), (4, (a, b))):
    assert V[k]['choices'][V[k]['answerIndex']].endswith(f'b = {m(B)}') and (A is None or f'a = {m(A)},' in V[k]['choices'][V[k]['answerIndex']])
    assert sum(t == V[k]['choices'][V[k]['answerIndex']] for t in V[k]['choices']) == 1
used = [re.search(r'\{(\d+), (\d+)\}.*bx \+ (\d+)', v[0]['question']).groups() for i, v in enumerate(cp) if i != 4]
assert (str(p), str(q), str(c)) not in used and len(set(used)) == 6, used   # 판 4 를 빼면 6판 모두 다름
ab = [v[-1]['say'] for i, v in enumerate(cp) if i != 4]
assert V[-1]['say'] not in ab, ab      # 답 (a, b) 도 다른 판과 다름
for s in V: assert s['question'].startswith('문제 3) 정의역이') and 'f(x) = x + a' in s['question']   # 혼자 풀림: 문제 글 + 단계
cp[4] = V; rp[3] = V
assert rp == cp[1:]
# 바뀐 곳은 m3 판 4 · retry 판 3 뿐
o = copy.deepcopy(old); o['monsters']['m3']['chain']['pool'][4] = V; o['monsters']['m3']['retry']['pool'][3] = V
assert o == d
json.dump(d, open(out, 'w', encoding='utf8'), ensure_ascii=False)
print('판 4 =', V[-1]['say'], '· 판들:', [x[0]['question'].split('\n')[0][7:40] for x in cp])
