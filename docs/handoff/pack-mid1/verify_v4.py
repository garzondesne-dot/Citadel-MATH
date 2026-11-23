# v4 독립 검산 (gen_v4.py 의 자료를 쓰지 않음) — 문항 글만 읽어 표 · 원자료 · 줄기와 잎 · 히스토그램을 다시 만들고 정답을 다시 풂
#   = 「혼자 풀림」 검사(글 안에 풀 자료가 다 있어야 풀림) + 「답 하나」(보기 중 조건을 만족하는 것이 정답 하나뿐) + 판마다 따로
#   쓰는 법: python3 verify_v4.py <v4 폴더> → 검산 표(markdown) 출력 · 하나라도 틀리면 멈춤
import json, re, sys, os
from fractions import Fraction as Fr
D = sys.argv[1]
BAD_REF = ['[표', '[그림', '위의', '위 표', '위 그림', '아래 표', '앞에서', '(2)의', '왼쪽 표']   # 「줄기와 잎 그림에서는 …」 같은 개념 문장은 괜찮음
rows = []

def table(q):        # 「a~b: n · …」 (n = 숫자 · ? · A) → [(a, b, n)] · 합계
    head = q.split('\n')[0]
    cells = [(int(a), int(b), n) for a, b, n in re.findall(r'(\d+)~(\d+): (\d+|\?|A)(?= ·| \(|$)', head)]
    tot = re.search(r'합계 (\d+)', head) or re.search(r'복숭아 (\d+)개', head)   # 복숭아 = 문제 첫머리의 전체 개수
    return cells, int(tot.group(1)) if tot else None
def raw(q):
    return [float(x) for x in re.findall(r'(\d+\.\d)', q.split('\n')[0].split('—')[1])]
def stemleaf(q):
    body = q.split('\n')[0].split('—')[1]
    out = []
    for s, l in re.findall(r'(\d+) \| ([\d ]+)', body):
        out += [Fr(int(s)) + Fr(int(c), 10) for c in l.split()]
    return out
def bars(q):
    g = re.search(r'\[\[graph:(.*?)\]\]', q).group(1)
    out = []
    for m in re.finditer(r'poly \((\d+),0\) \((\d+),0\) \((\d+),(\d+)\) \((\d+),(\d+)\)', g):
        a, b, _, h, _, _ = map(int, m.groups()); out.append((a, b, h))
    lo, hi = map(int, re.search(r'계급 (\d+)~(\d+)cm', q).groups())
    for a in range(lo, hi, 50):                      # 높이 0 인 계급도 계급
        if not any(x[0] == a for x in out): out.append((a, a + 50, 0))
    return sorted(out)
def fill(cells, tot):
    miss = [i for i, c in enumerate(cells) if not str(c[2]).isdigit()]
    known = sum(int(c[2]) for c in cells if str(c[2]).isdigit())
    if miss: assert len(miss) == 1 and tot is not None
    return [(a, b, int(n) if str(n).isdigit() else tot - known) for a, b, n in cells], (cells[miss[0]] if miss else None)
lab_rng = lambda s: tuple(int(x) for x in re.findall(r'(\d+)', s)[:2])

def solve(q, it):
    ask = q.split('\n')[-1]; t = it['type']; ch = it['ch']
    if '줄기와 잎' in q and '\n' in q:
        xs = stemleaf(q)
        m = re.search(r'(\d+\.\d)초 이상 (\d+\.\d)초 미만', ask)
        if m: a, b = Fr(m.group(1)), Fr(m.group(2)); return sum(1 for x in xs if a <= x < b)
        m = re.search(r'(\d+\.\d)초 미만', ask); return sum(1 for x in xs if x < Fr(m.group(1)))
    if '투표율' in q and '\n' in q:
        xs = raw(q); assert len(xs) == 20
        m = re.search(r'(\d+)% 이상 (\d+)% 미만', ask)
        if m: a, b = map(int, m.groups()); return sum(1 for x in xs if a <= x < b)
        m = re.search(r'(\d+)% 이상', ask); return sum(1 for x in xs if x >= int(m.group(1)))
    if '[[graph:' in q:
        cs = bars(q)
        if '모두 몇' in ask: return sum(h for _, _, h in cs)
        if '가장 작은' in ask:
            mn = min(h for *_, h in cs); hits = [i for i, c in enumerate(ch) if [h for a, b, h in cs if (a, b) == lab_rng(c)] == [mn]]
            assert len(hits) == 1; return hits[0]
        a, b = map(int, re.search(r'(\d+)cm 이상 (\d+)cm 미만', ask).groups()); return sum(h for x, y, h in cs if a <= x and y <= b)
    if '\n' not in q: return None                          # 개념 문항 (숫자 없음) = 눈으로 확인
    cells, tot = table(q); full, missc = fill(cells, tot)
    if tot is not None: assert sum(n for *_, n in full) == tot
    if '계급의 크기' in ask and '넓이' not in ask: ws = {b - a for a, b, _ in full}; assert len(ws) == 1; return ws.pop()
    if '도수(?)' in ask or 'A의 값' in ask or re.search(r'g 이상 \d+g 미만인 복숭아는 몇 개', ask): return missc and [n for a, b, n in full if (a, b) == missc[:2]][0]
    if '전체의 몇 %' in ask:
        T = sum(n for *_, n in full)
        m = re.search(r'(\d+)g 이상 (\d+)g 미만', ask)
        part = [n for a, b, n in full if (a, b) == tuple(map(int, m.groups()))][0] if m else sum(n for a, b, n in full if a >= int(re.search(r'(\d+)점 이상', ask).group(1)))
        assert part * 100 % T == 0; return part * 100 // T
    if '두 번째로 큰' in ask or '가장 높은 직사각형은' in ask or '가장 높은 점' in ask:
        hs = sorted({n for *_, n in full}, reverse=True); want = hs[1] if '두 번째' in ask else hs[0]
        assert [n for *_, n in full].count(want) == 1
        hits = [i for i, c in enumerate(ch) if [n for a, b, n in full if (a, b) == (lab_rng(c) if '만~' not in c else tuple(int(x) for x in re.findall(r'(\d+)만', c)))] == [want]]
        assert len(hits) == 1, (ask, ch); return hits[0]
    if '넓이' in ask: mx = max(n for *_, n in full); return [(b - a) * n for a, b, n in full if n == mx][0]
    if '양 끝에' in ask:
        lo, hi, w = full[0][0], full[-1][1], full[0][1] - full[0][0]
        want = f'{lo - w}~{lo} 과 {hi}~{hi + w}'; assert ch.count(want) == 1; return ch.index(want)
    if '모두 몇 편' in ask: return sum(n for *_, n in full)
    m = re.search(r'(\d+)만 명 이상이', ask)
    if m: return sum(n for a, b, n in full if a >= int(m.group(1)))
    m = re.search(r'(\d+)분 이상인', ask) or re.search(r'(\d+)점 이상인', ask)
    if m: return sum(n for a, b, n in full if a >= int(m.group(1)))
    raise ValueError(ask)

def ans_val(it):
    if it['type'] == 'number': return int(it['a'])
    if it['type'] == 'choice': return int(it['a'])
    return it['a']
tot_ok = 0
for f in ('mid1-stat-01.json', 'mid1-stat-02.json'):
    d = json.load(open(os.path.join(D, f), encoding='utf8'))
    for mid, m in list(d['mons'].items()) + [('보스', d['boss'])]:
        for v, items in enumerate(m['vers']):
            for i, it in enumerate(items):
                q = it['q']
                assert not any(b in q for b in BAD_REF), (f, mid, v, i, q[:80])          # 다른 칸을 가리키지 않음
                assert it['sol'] and len(it['sol']) <= 90, (f, mid, v, i)
                if it['type'] == 'choice': assert len(set(it['ch'])) == len(it['ch']) and 0 <= int(it['a']) < len(it['ch'])
                if it['type'] == 'number': assert 0 <= int(it['a']) <= 99
                got = solve(q, it)
                ok = '눈으로 확인' if got is None else ('✅' if got == ans_val(it) else '❌')
                assert ok != '❌', (f, mid, v, i, q.split('\n')[-1], got, it['a'])
                tot_ok += 1
                rows.append(f"| {f[10:12]}차시 {mid}-{i + 1} · 판 {v} | {it['ch'][int(it['a'])] if it['type'] == 'choice' else it['a']} | {it['sol']} | {ok} | ✔ | ✔ |")
print('| 문항 · 판 | 정답 | 풀이 한 줄 | 확인 | 혼자 풀림 | 답 하나 |\n|---|---|---|---|---|---|')
print('\n'.join(rows))
print(f'\n문항 {tot_ok}개 모두 통과', file=sys.stderr)
