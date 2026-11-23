# v4 독립 검산 — gen_v4.py 를 쓰지 않음 · 학습지 PDF 글(pdftotext)에서 따로 옮겨 적은 원자료로 물음 글을 읽어 다시 풂
#   학습지 자료 필요 ✔ 차시(선생님 2026-11-23): 문항 글 = 「학습지 ○) 자료 이름」 + 물음 → 그 자료가 학습지에 있는지 · 다른 칸 가리킴 말이 없는지
#   쓰는 법: python3 verify_v4.py <v4 폴더> → 검산 표(markdown) · 하나라도 틀리면 멈춤
import json, re, sys, os
D = sys.argv[1]
# ── 학습지에서 따로 옮긴 자료 ──
COMMUTE = {(0, 10): 3, (10, 20): None, (20, 30): 15, (30, 40): 8, (40, 50): 2}; COMMUTE_T = 34
VOTES = '95.5 91.9 91.1 87.8 84.3 72.1 76.1 73.2 71.4 77.1 77.7 84.6 75.8 71.9 63.9 57.2 60.6 46.1 54.2 58.0'
RUN = {7: '13457778889999999', 8: '0001134558899', 9: '1123344568'}
CONTEST = {(0, 20): 2, (20, 40): None, (40, 60): 11, (60, 80): 4, (80, 100): 5}; CONTEST_T = 25
BLOG = {(10, 15): 2, (15, 20): 5, (20, 25): 4, (25, 30): 8, (30, 35): 1}
MOVIE = {(200, 400): 17, (400, 600): 5, (600, 800): 5, (800, 1000): 1, (1000, 1200): 1, (1200, 1400): 2}
TREE = {(200, 250): 4, (250, 300): 7, (300, 350): 5, (350, 400): 3, (400, 450): 1}
PEACH = {(150, 200): 3, (200, 250): 3, (250, 300): None, (300, 350): 7, (350, 400): 5, (400, 450): 3}; PEACH_T = 35
def done(t, T):
    t = dict(t); k = [c for c, n in t.items() if n is None][0]; t[k] = T - sum(n for n in t.values() if n); return t, k
V = [float(x) for x in VOTES.split()]
RUNX = [s * 10 + int(c) for s, l in RUN.items() for c in l]   # 0.1초 단위
(c1, k1), (c2, k2), (c3, k3) = done(COMMUTE, COMMUTE_T), done(CONTEST, CONTEST_T), done(PEACH, PEACH_T)
SRC = {'통학 시간 도수분포표': (c1, k1), '국회의원 선거 투표율': ({(40 + 10 * i, 50 + 10 * i): sum(1 for x in V if 40 + 10 * i <= x < 50 + 10 * i) for i in range(6)}, None),
       '수학 경시대회': (c2, k2), '블로그 방문자 수': (BLOG, None), '영화의 관객 수': (MOVIE, None), '나무의 키 히스토그램': (TREE, None), '복숭아 35개': (c3, k3)}
BAD_REF = ['[표', '[그림', '위의', '위 표', '위 그림', '아래 표', '앞에서', '(2)의', '왼쪽 표']
lab = lambda c: tuple(int(x) for x in re.findall(r'(\d+)', c)[:2])

def pick(ch, cls):
    o = [i for i, c in enumerate(ch) if lab(c) == cls]; assert len(o) == 1, (ch, cls); return o[0]
def solve(q, it):
    ask = q.split('\n')[-1]; ch = it['ch']
    if '\n' not in q: return None                                   # 개념 문항 = 눈으로 확인
    head = q.split('\n')[0]; assert head.startswith('학습지 '), head
    if '줄기와 잎' in head:
        m = re.search(r'(\d)\.(\d)초 이상 (\d)\.(\d)초 미만', ask)
        if m: return sum(1 for x in RUNX if int(m[1] + m[2]) <= x < int(m[3] + m[4]))
        m = re.search(r'(\d)\.(\d)초 미만', ask)
        if m: return sum(1 for x in RUNX if x < int(m[1] + m[2]))
        m = re.search(r'(\d)\.(\d)초 이상', ask)
        if m: return sum(1 for x in RUNX if x >= int(m[1] + m[2]))
        m = re.search(r'기록이 (\d)\.(\d)초인', ask)
        if m: return RUNX.count(int(m[1] + m[2]))
        m = re.search(r'줄기가 (\d) 인 잎', ask)
        if m: return len(RUN[int(m[1])])
        want = f'{min(RUNX) / 10}초' if '가장 빠른' in ask else f'{max(RUNX) / 10}초' if '가장 느린' in ask else str(max(RUN, key=lambda s: len(RUN[s])))
        assert ch.count(want) == 1; return ch.index(want)
    hit = [v for k, v in SRC.items() if k in head]; assert len(hit) == 1, head
    t, miss = hit[0]; keys = sorted(t); W = keys[0][1] - keys[0][0]; tot = sum(t.values())
    rng = lambda a, b: sum(n for (x, y), n in t.items() if a <= x and y <= b)
    nums = [int(x) for x in re.findall(r'(\d+)(?:만 명|분|%|점|명|cm|g)', ask)]
    asknum = lambda n: (ch.index(str(n)) if it['type'] == 'choice' else n)
    if '계급의 크기는 몇 백만' in ask: return ch.index(str(W // 100))
    if '계급의 크기' in ask and '넓이' not in ask: return W
    if '계급의 개수' in ask or '직사각형은 모두 몇 개' in ask: return asknum(len(keys))
    if '도수(?)' in ask or 'A의 값' in ask: return t[miss]
    if '전체의 몇 %' in ask:
        part = rng(nums[0], nums[1]) if ('이상' in ask and '미만' in ask) else rng(nums[0], 10 ** 9) if '이상' in ask else rng(-1, nums[0])
        assert part * 100 % tot == 0; return part * 100 // tot
    if '넓이를 모두 더하면' in ask: return ch.index(str(W * tot))
    if '넓이' in ask:
        n = max(t.values()) if '가장 높은' in ask else min(t.values()) if '가장 낮은' in ask else t[(nums[0], nums[1])]
        return W * n
    if '점은 양 끝' in ask: return ch.index(str(len(keys) + 2))
    if '양 끝에 도수 0' in ask:
        lo, hi = keys[0][0], keys[-1][1]
        o = [i for i, c in enumerate(ch) if [int(x) for x in re.findall(r'(\d+)', c)][:4] == [lo - W, lo, hi, hi + W]]; assert len(o) == 1; return o[0]
    if '가로축 값' in ask:
        c = max(keys, key=lambda k: t[k]) if '가장 높은 점' in ask else (nums[0], nums[1])
        w = f'{(c[0] + c[1]) / 2:g}'; assert ch.count(w) == 1; return ch.index(w)
    if '도수가 가장 큰 계급의 도수' in ask: return max(t.values())
    if '막대의 높이' in ask: return t[(nums[0], nums[1])]
    m = re.search(r'(두|세) ?번째로 (큰|높은)|가장 (큰|높은|작은|낮은)', ask)
    if m and '도수는' not in ask and '넓이' not in ask and ('계급' in ask):
        r = {'두': 2, '세': 3}.get(m.group(1), 1); big = (m.group(2) or m.group(3)) in ('큰', '높은')
        want = sorted(set(t.values()), reverse=big)[r - 1]; cls = [c for c in keys if t[c] == want]; assert len(cls) == 1
        return cls[0][0] if it['type'] == 'number' else pick(ch, cls[0])
    m = re.search(r'(?:높이|도수)가 (\d+)인', ask)
    if m or '도수가 A와 같은' in ask:
        want = t[miss] if not m else int(m.group(1)); cls = [c for c in keys if t[c] == want and (m or c != miss)]; assert len(cls) == 1; return pick(ch, cls[0])
    m = re.search(r'(\d+)(?:만 명|점|명|cm)인 (?:영화|학생|날|나무)', ask)
    if m: x = int(m.group(1)); return pick(ch, [c for c in keys if c[0] <= x < c[1]][0])
    if '모두 몇' in ask: return tot
    n = rng(nums[0], nums[1]) if ('이상' in ask and '미만' in ask) else rng(nums[0], 10 ** 9) if '이상' in ask else rng(-1, nums[0])
    return asknum(n)

rows, n_ok = [], 0
for f in ('mid1-stat-01.json', 'mid1-stat-02.json'):
    d = json.load(open(os.path.join(D, f), encoding='utf8'))
    for mid, m in list(d['mons'].items()) + [('보스', d['boss'])]:
        for v, items in enumerate(m['vers']):
            for i, it in enumerate(items):
                q = it['q']
                assert not any(b in q for b in BAD_REF), (f, mid, v, i)
                assert it['sol'] and len(it['sol']) <= 90
                if it['type'] == 'choice': assert len(set(it['ch'])) == len(it['ch']) and 0 <= int(it['a']) < len(it['ch'])
                if it['type'] == 'number': assert 0 <= int(it['a']) <= 99
                got = solve(q, it); want = int(it['a']) if it['type'] in ('number', 'choice') else it['a']
                ok = '눈으로 확인' if got is None else '✅' if got == want else '❌'
                assert ok != '❌', (f, mid, v, i, q.split('\n')[-1], got, it['a'])
                need = '학습지 자료 필요 ✔' if '\n' in q else '혼자 풀림 ✔'
                ans = it['ch'][int(it['a'])] if it['type'] == 'choice' else it['a']
                rows.append(f"| {f[10:12]}차시 {mid}-{i + 1} · 판 {v} | {q.split(chr(10))[-1]} | {ans} | {ok} | {need} | ✔ |")
                n_ok += 1
print('| 문항 · 판 | 물음 | 정답 | 확인 | 풀 자료 | 답 하나 |\n|---|---|---|---|---|---|')
print('\n'.join(rows))
print(f'문항 {n_ok}개 모두 통과', file=sys.stderr)
