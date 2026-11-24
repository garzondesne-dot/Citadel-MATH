# 🏫 중1 통계 3차시 팩 v1 독립 검산 (2026-11-25 · 📚 차시팩 #1) · gen_pack3.py 를 읽지 않음 — 문항 글만 읽고 다시 풀어 정답 · 보기 · 혼자 풀림을 확인
#   쓰는 법: python3 verify_pack3.py <mid1-stat-03.json> [검산 표.md]
import json, re, sys
from fractions import Fraction as F
d = json.load(open(sys.argv[1], encoding='utf8'))
rows, bad = [], []


def rnd2(x):            # 사사오입 소수 둘째 자리 → Fraction
    return F(int(x * 100 + F(1, 2)), 100)


def num(s): return F(s)


def classes(q):         # 「a~b: n」
    return [(int(a), int(b), int(n)) for a, b, n in re.findall(r'(\d+)~(\d+): (\d+)(?=\s·|\s\()', q)]


def ok(name, cond, note=''):
    if not cond: bad.append(f'{name} {note}')
    return cond


SELF_BAD = ['위의', '앞에서', '그림에서', '표에서', '(1)의', '⑴의', '학습지']
for mid, m in list(d['mons'].items()) + [('sum', d['boss'])]:
    seen = set()
    for v, items in enumerate(m['vers']):
        for i, x in enumerate(items):
            q, a, ch, t = x['q'], x['a'], x['ch'], x['type']
            tag = f'{mid} 판{v} {i + 1}'
            ok(tag, x['sol'] and len(x['sol']) <= 90, 'sol')
            ok(tag, not any(b in q for b in SELF_BAD), '혼자 풀림')
            ok(tag, q not in seen, '같은 글 두 번'); seen.add(q)
            if t == 'choice': ok(tag, 0 <= int(a) < len(ch) and len(set(ch)) == len(ch), '보기')
            else: ok(tag, ch == [], 'ch')
            last = q.split('\n')[-1]; got = None
            if t == 'ox':
                got = '눈'
            elif mid in ('m1', 'sum') and '도수의 총합이' not in q:
                cl = classes(q); N = sum(n for *_, n in cl)
                tot = int(re.search(r'합계 (\d+)', q).group(1)); ok(tag, tot == N, '합계')
                m1 = re.search(r'(\d+)(?:%|분) 이상 (\d+)(?:%|분) 미만인 계급의 상대도수', last)
                m2 = re.search(r'(\d+)(?:%|분) 이상 (\d+)(?:%|분) 미만인 지역은 전체의 몇 %', last)
                m3 = re.search(r'(\d+)분 이상인 학생은 전체의 몇 %', last)
                if m1:
                    lo = int(m1.group(1)); n = next(n for a_, b_, n in cl if a_ == lo)
                    r = rnd2(F(n, N)); right = [k for k, c in enumerate(ch) if num(c) == r]
                    ok(tag, right == [int(a)], f'정답 {r}'); got = str(float(r))
                elif m2:
                    lo, hi = int(m2.group(1)), int(m2.group(2)); s = sum(n for a_, b_, n in cl if lo <= a_ and b_ <= hi)
                    p = F(s * 100, N); ok(tag, p.denominator == 1 and str(p) == a, f'% {p}'); got = str(p)
                elif m3:
                    lo = int(m3.group(1)); s = sum(n for a_, b_, n in cl if a_ >= lo)
                    p = F(s * 100, N); ok(tag, p.denominator == 1 and str(p) == a, f'% {p}'); got = str(p)
                else: ok(tag, False, '물음 꼴')
            elif mid == 'sum':
                T2, p = re.search(r'총합이 (\d+) 인 자료에서 상대도수가 ([\d.]+) 인', q).groups()
                r = int(T2) * F(p); ok(tag, r.denominator == 1 and str(r) == a, f'{r}'); got = str(r)
            elif mid == 'm2':
                head = q.split('\n')[0]; N = int(re.search(r'호박 (\d+)개', head).group(1))
                xs = [int(s) for s in head.split('— ')[1].split()]; ok(tag, len(xs) == N, '자료 수')
                lo, hi = map(int, re.search(r'(\d+)g 이상 (\d+)g 미만', last).groups()); c = sum(1 for w in xs if lo <= w < hi)
                if t == 'number': ok(tag, str(c) == a, f'{c}'); got = str(c)
                else:
                    r = F(c, N); right = [k for k, cc in enumerate(ch) if num(cc) == r]; ok(tag, right == [int(a)], f'{r}'); got = str(float(r))
            elif mid == 'm3':
                head = q.split('\n')[0]
                NA, NB = map(int, re.search(r'A 중학교 1학년 (\d+)명과 B 중학교 1학년 (\d+)명', head).groups())
                cl = [(int(x), int(y), F(p), F(r)) for x, y, p, r in re.findall(r'(\d+)~(\d+): A ([\d.]+) / B ([\d.]+)', head)]
                ok(tag, sum(c[2] for c in cl) == 1 and sum(c[3] for c in cl) == 1, '합 1')
                if t == 'number':
                    lo, hi = map(int, re.search(r'(\d+)시간 이상 (\d+)시간 미만', last).groups())
                    sch = 'A' if 'A 중학교 학생은' in last else 'B'
                    r = sum((c[2] if sch == 'A' else c[3]) for c in cl if lo <= c[0] and c[1] <= hi) * (NA if sch == 'A' else NB)
                    ok(tag, r.denominator == 1 and str(r) == a, f'{r}'); got = str(r)
                else:
                    th = int(re.search(r'\((\d+)시간 이상인 학생의 비율', last).group(1))
                    sa = sum(c[2] for c in cl if c[0] >= th); sb = sum(c[3] for c in cl if c[0] >= th)
                    ok(tag, sa != sb, '같음'); exp = '있다' if sa > sb else '없다'; ok(tag, ch[int(a)] == exp, exp); got = exp
            rows.append((tag, t, a if t != 'choice' else f'{a} ({ch[int(a)]})', got))
# 판 0 = 학습지 정답 (학습지 시안 v1 교사용과 맞대어 봄)
SHEET = {('m1', 0): '0.33', ('m1', 1): '0.2', ('m1', 2): '40', ('m2', 0): '11', ('m2', 1): '6', ('m2', 2): '0.44',
         ('m3', 0): '48', ('m3', 1): '44', ('m3', 2): '있다', ('sum', 0): '0.28', ('sum', 1): '60', ('sum', 2): 'O', ('sum', 3): '8', ('sum', 4): 'O'}
for (mid, i), want in SHEET.items():
    x = (d['mons'][mid] if mid != 'sum' else d['boss'])['vers'][0][i]
    have = x['ch'][int(x['a'])] if x['type'] == 'choice' else x['a']
    ok(f'{mid} 판0 {i + 1} 학습지', have == want, f'{have} ≠ {want}')
b = d['boss']
ok('boss', b['items'] == len(b['vers'][0]) == len(b['tags']) == len(b['links']) and 1 <= b['hpItems'] <= b['items'], 'items')
cids = [s['id'] for s in d['steps'] if s['kind'] == 'concept']; ok('tags', all(t in cids for t in b['tags']))
ok('links', all(l in ('', *d['mons']) for l in b['links']))
ok('steps', [s['id'] for s in d['steps'] if s['kind'] == 'monster'] == list(d['mons']) and d['steps'][-1]['kind'] == 'boss')
ok('판 7', all(len(m['vers']) == 7 for m in list(d['mons'].values()) + [b]))
n = len(rows); ox = sum(1 for r in rows if r[3] == '눈')
print(f'문항 {n} · 계산 검산 {n - ox} · OX 눈 확인 {ox} · 혼자 풀림 {n} · 틀림 {len(bad)}')
if len(sys.argv) > 2:
    with open(sys.argv[2], 'w', encoding='utf8') as f:
        f.write(f'# 중1 통계 3차시 팩 v1 검산 표\n\n문항 {n} · 계산 검산 {n - ox} ✔ · OX {ox} 눈 확인 · 혼자 풀림 {n} ✔ · 판 0 = 학습지 ✔\n\n| 칸 | 꼴 | 정답 | 다시 푼 값 | 혼자 풀림 |\n|---|---|---|---|---|\n')
        for r in rows: f.write(f'| {r[0]} | {r[1]} | {r[2]} | {r[3]} | ✔ |\n')
assert not bad, bad
