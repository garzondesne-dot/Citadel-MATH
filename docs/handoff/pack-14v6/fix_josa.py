# v6 조사 고침 (2026-11-23 · 메인 「판 0 · 판 3 조사 → 같은 v6 덮어씀」)
#   「(숫자) 을/를 · 이/가 · 은/는」 을 숫자 끝소리로 맞춤 — 받침 있음 = 0 1 3 6 7 8 (영 일 삼 육 칠 팔) · 없음 = 2 4 5 9
#   쓰는 법: python3 fix_josa.py <v6.json> (제자리 고침 · 문자열 안 조사만 · 다른 값 그대로)
import json, re, sys, copy
p = sys.argv[1]; d = json.load(open(p, encoding='utf8')); old = copy.deepcopy(d)
PAIR = {'을': '를', '를': '을', '이': '가', '가': '이', '은': '는', '는': '은'}
HAS = {'을', '이', '은'}
log = []
def fix(s):
    def rep(m):
        n, j = m.group(1), m.group(2)
        want_has = n[-1] in '013678'
        k = j if (j in HAS) == want_has else PAIR[j]
        if k != j: log.append(f'{m.group(0)} → ({n}) {k}')
        return f'({n}) {k}'
    return re.sub(r'\((\d+)\) (을|를|이|가|은|는)(?=\s)', rep, s)
def walk(x):
    if isinstance(x, dict): return {k: walk(v) for k, v in x.items()}
    if isinstance(x, list): return [walk(v) for v in x]
    return fix(x) if isinstance(x, str) else x
d = walk(d)
json.dump(d, open(p, 'w', encoding='utf8'), ensure_ascii=False)
from collections import Counter
for k, n in Counter(log).items(): print(n, '×', k)
