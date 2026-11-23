# 2026-11-23 · 📚 차시팩 #1 · 13차시 입장 열쇠 바꿈 (선생님 「절대부등식을 오늘 배우는데 절대부등식이냐고 물어보면 어떡해」 → 「진행해」)
# 규칙: 입장 열쇠 = 중학교 복습만 · 그 차시에 처음 배우는 용어 · 공식 꼴을 열쇠 문제 글에 쓰지 않음
# 쓰는 법: python3 make_v6.py <v5 팩.json> <출력 폴더>  → ex13v6.json · keys-13.json(학습지 · 쪽지용)
import json, sys, os, math, copy
SRC, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
d = json.load(open(SRC))
K = {k['id']: k for k in d['keys']}
use = lambda k: k['help'].split('·')[-1].strip()          # 「이 열쇠는 … 에서 써요.」 그대로
K['k1']['help'] = '양수든 음수든 제곱하면 양수 · 0 을 제곱하면 0 → 제곱한 값은 늘 0 이상이에요. · ' + use(K['k1'])
K['k1']['vers'] = [
    {'type': 'ox', 'q': '실수 a 에 대하여 a² 의 값은 음수가 될 수 있다.', 'a': 'X', 'ch': [], 'sol': '제곱한 값은 늘 0 이상 → 음수가 될 수 없다'},
    {'type': 'ox', 'q': '실수 x 에 대하여 (x − 5)² 의 값은 음수가 될 수 있다.', 'a': 'X', 'ch': [], 'sol': 'x − 5 를 제곱한 값 → 늘 0 이상 · 음수가 될 수 없다'},
    {'type': 'ox', 'q': 'x = −2 이면 (x + 2)² = 0 이다.', 'a': 'O', 'ch': [], 'sol': 'x + 2 = −2 + 2 = 0 → 0² = 0'},
]
k2 = K['k2']['vers']; Q2 = ['x² − 6x + 9', 'x² + 4x + 4', 'x² − 10x + 25']; S2 = ['x − 3', 'x + 2', 'x − 5']
for i, q in enumerate(k2):
    q['q'] = f'{Q2[i]} = ( ? )² 에서 ( ) 안에 알맞은 식은?'
    assert q['ch'][int(q['a'])] == S2[i]
    q['sol'] = f'{Q2[i]} = ({S2[i]})² · 가운데 항의 절반을 제곱하면 끝 항'
k3 = K['k3']['vers']; N3 = [4, 81, 100]
for i, q in enumerate(k3):
    r = math.isqrt(N3[i]); q['q'] = f'2√{N3[i]} 의 값은?'
    assert q['ch'][int(q['a'])] == str(2 * r)
    q['sol'] = f'√{N3[i]} = {r} → 2√{N3[i]} = 2 × {r} = {2 * r}'
K['k3']['help'] = '√4 = 2 처럼 제곱해서 그 수가 되는 양수 · 2√4 = 2 × 2 = 4. · ' + use(K['k3'])
# 독립 검산 (문제 글만 보고)
import re
assert all((a * a) >= 0 for a in [x / 2 for x in range(-40, 41)])                 # 판 0 · 1 = ×
assert ((-2) + 2) ** 2 == 0                                                       # 판 2 = ○
for i in range(3):
    m = re.match(r'x² ([+−]) (\d+)x \+ (\d+)', Q2[i]); s, b, c = (1 if m[1] == '+' else -1), int(m[2]), int(m[3])
    assert (b // 2) ** 2 == c and S2[i] == f'x {"+" if s > 0 else "−"} {b // 2}'
# 오늘 배우는 말이 열쇠 글에 없음
BAN = ['절대부등식', '산술평균', '기하평균', '≥', '최솟값', '등호']
for k in d['keys']:
    for q in k['vers']:
        assert not any(w in q['q'] for w in BAN), (k['id'], q['q'])
d['keys'] = list(K.values())
json.dump(d, open(f'{OUT}/ex13v6.json', 'w'), ensure_ascii=False, indent=1)
json.dump({'lesson': 13, 'pack': 'ex-13', 'keys': [{x: k[x] for x in k} for k in d['keys']]}, open(f'{OUT}/keys-13.json', 'w'), ensure_ascii=False, indent=1)
for k in d['keys']:
    print(k['id'], k['name'], '|', k['help'])
    for q in k['vers']: print('   ', q['q'], q['ch'], q['a'], '|', q['sol'])
