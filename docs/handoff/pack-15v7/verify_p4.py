# 15차시 팩 v8 문제 4 (몬스터 1 · 단계 1 · 2) 독립 검산 (2026-11-25 · 📚 차시팩 #1) · 문항 글만 읽어 다시 풂 · python3 verify_p4.py <ex15.json>
import json, re, sys
d = json.load(open(sys.argv[1], encoding='utf8')); m = d['monsters']['m1']
N = lambda t: int(t.replace('−', '-'))
rows = []
for v, items in enumerate([m['first']] + m['retry']['pool']):
    a, b = items[0], items[1]
    mm = re.search(r'정의역이 \{0, 1, 2, 3\} 인 함수 y = (−?\d*)x(?: ([+−]) (\d+))? 의 그래프는 \{\(0, □\), \(1, □\), \(2, □\), \(3, □\)\} 이다', a['question']); assert mm, a['question']
    c = {'': 1, '−': -1}.get(mm.group(1)) or N(mm.group(1)); k = 0 if not mm.group(2) else N(('' if mm.group(2) == '+' else '-') + mm.group(3))
    want = [c * x + k for x in range(4)]
    got = [N(t) for t in a['choices'][a['answerIndex']].split(', ')]
    others = [[N(t) for t in ch.split(', ')] for i, ch in enumerate(a['choices']) if i != a['answerIndex']]
    assert got == want and want not in others, (v, got, want)
    assert '실수' in b['question'] and b['choices'] == ['점 4개', '직선', '포물선'] and b['answerIndex'] == 1
    assert a['type'] == b['type'] == 'choice' and [i['type'] for i in items] == ['choice'] * 4
    rows.append(f'| 판 {v} | y = {c}x {k:+d} | {", ".join(map(str, want))} | 직선 | ✔ | ✔ |')
print('| 판 | 함수 | (1) 다시 구함 | (2) | 정답 일치 | 혼자 풀림 |\n|---|---|---|---|---|---|'); print('\n'.join(rows)); print('문제 4 판', len(rows), '독립 검산 ✔')
