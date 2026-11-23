# 무안행복중 중1 통계 1 · 2차시 차시팩 v4 (2026-11-23 · 📚 차시팩 #1 · 선생님 「최신 버전에 맞게 · 문항마다 단독으로」 → 「진행」)
#   v3 바탕 · 바뀐 것: ① 문항 글마다 표 · 원자료 · 줄기와 잎 · 히스토그램을 다시 적음(혼자 풀림) ② 판 7개(0 = 학습지 · 1 ~ 6 = 숫자 바꾼 판)
#   ③ 형성평가 판 7개 · links ④ 모든 판 sol = 그 판 숫자
#   고른 안 (메인 보고 A · A · A): 표 = 문항 글 한 줄(엔진에 표 꼴 없음) · 히스토그램 = [[graph:…]] 그림 · 줄기와 잎 = 줄기별 「 / 」 한 줄
#   쓰는 법: python3 gen_v4.py <v3 팩 1.json> <v3 팩 2.json> <출력 폴더>  → 검산은 verify_v4.py (문항 글만 읽고 다시 풂)
import json, sys, random, copy, os
P1, P2, OUT = sys.argv[1:4]
R = random.Random(20261123)
NV = 7
def it(t, q, a, ch=None, sol=''):
    assert len(sol) <= 90, sol
    return {'type': t, 'q': q, 'a': str(a), 'ch': ch or [], 'sol': sol}
def shuffled(xs, seed):
    xs = list(xs); random.Random(seed).shuffle(xs); return xs
fmt = lambda x: f'{x:g}'

# ── 1차시 ─────────────────────────────────────────────
def tbl(label, lo, w, f, miss=None, who='명', mark='?'):
    cells = [f'{lo + i * w}~{lo + (i + 1) * w}: {mark if i == miss else f[i]}' for i in range(len(f))]
    return f'{label} ' + ' · '.join(cells) + f' · 합계 {sum(f)} (단위 {who} · 「{lo}~{lo + w}」 = {lo} 이상 {lo + w} 미만)'

def m1_ver(v):
    if v == 0: w, lo, f, k, j = 10, 0, [3, 6, 15, 8, 2], 1, 3
    else:
        while True:
            w = R.choice([5, 10, 15, 20]); lo = R.choice([0, w]); f = [R.randint(2, 15) for _ in range(5)]
            k = R.randrange(5); j = R.choice([2, 3, 4])
            if sum(f) <= 60 and len(set(f)) >= 4 and (w, lo, tuple(f)) != (10, 0, (3, 6, 15, 8, 2)): break
    T = sum(f); head = f'어느 반 학생 {T}명의 통학 시간 도수분포표 — ' + tbl('통학 시간(분)', lo, w, f, k)
    b = lambda i: lo + i * w
    others = ' + '.join(str(f[i]) for i in range(5) if i != k)
    return [
        it('number', f'{head}\n계급의 크기는 몇 분인가?', w, sol=f'{b(1)} − {b(0)} = {w}'),
        it('number', f'{head}\n{b(k)}분 이상 {b(k + 1)}분 미만인 계급의 도수(?)는?', f[k], sol=f'{T} − ({others}) = {f[k]}'),
        it('number', f'{head}\n통학 시간이 {b(j)}분 이상인 학생 수는?', sum(f[j:]), sol=f'{" + ".join(str(x) for x in f[j:])} = {sum(f[j:])}' + (' (? 포함)' if k >= j else '')),
    ]

VOTE0 = [95.5, 91.9, 91.1, 87.8, 84.3, 72.1, 76.1, 73.2, 71.4, 77.1, 77.7, 84.6, 75.8, 71.9, 63.9, 57.2, 60.6, 46.1, 54.2, 58.0]
def cnt(xs, a, b=None): return [x for x in xs if x >= a and (b is None or x < b)]
def lst(xs): return ' · '.join(f'{x:.1f}' for x in xs)
def m2_ver(v):
    if v == 0: xs, (a1, a2, c) = VOTE0, (50, 70, 80); head = '제1대 ~ 제20대 국회의원 선거 투표율(%) 20개 — ' + lst(xs)
    else:
        while True:
            xs = [round(R.uniform(40, 99.9), 1) for _ in range(20)]
            a1, a2 = R.sample([40, 50, 60, 70, 80, 90], 2); c = R.choice([60, 70, 80, 90])
            n = [len(cnt(xs, a1, a1 + 10)), len(cnt(xs, a2, a2 + 10)), len(cnt(xs, c))]
            if all(1 <= x <= 12 for x in n) and len(set(n)) == 3: break
        head = '어느 지역 선거 20회의 투표율(%) 20개 — ' + lst(xs)
    def sol(ys, tag):
        ys = sorted(ys)
        s = f'{lst(ys)} → {len(ys)}'
        return s if len(s) <= 90 else f'{tag} {len(ys)}개'
    q = lambda t: f'{head}\n{t}'
    return [
        it('number', q(f'투표율이 {a1}% 이상 {a1 + 10}% 미만인 선거는 몇 회인가?'), len(cnt(xs, a1, a1 + 10)), sol=sol(cnt(xs, a1, a1 + 10), f'{a1}% 대')),
        it('number', q(f'투표율이 {a2}% 이상 {a2 + 10}% 미만인 선거는 몇 회인가?'), len(cnt(xs, a2, a2 + 10)), sol=sol(cnt(xs, a2, a2 + 10), f'{a2}% 대')),
        it('number', q(f'투표율이 {c}% 이상인 선거는 몇 회인가?'), len(cnt(xs, c)), sol=sol(cnt(xs, c), f'{c}% 이상')),
    ]

SL0 = {7: '13457778889999999', 8: '0001134558899', 9: '1123344568'}
CON3 = [  # 3번 = 개념 (숫자 없음 · 판마다 다른 물음)
    ('학생 400명의 50m 달리기 기록을 정리할 때 더 편리한 것은?', ['줄기와 잎 그림', '도수분포표'], 1, '자료가 많으면 계급으로 묶는 도수분포표'),
    ('학생 12명의 기록을 하나하나 정확한 값까지 보고 싶을 때 알맞은 것은?', ['줄기와 잎 그림', '도수분포표'], 0, '줄기와 잎 그림은 변량이 그대로 남음'),
    ('줄기와 잎 그림에서는 각 학생의 정확한 기록을 알 수 있다.', ['맞다', '틀리다'], 0, '잎에 변량이 그대로 남음'),
    ('도수분포표를 보면 각 변량의 정확한 값을 알 수 있다.', ['맞다', '틀리다'], 1, '계급으로 묶어서 정확한 값은 사라짐'),
    ('변량이 1000개일 때 분포를 한눈에 보기에 더 편리한 것은?', ['줄기와 잎 그림', '도수분포표'], 1, '잎 1000개는 너무 많음 → 계급으로 묶어 셈'),
    ('줄기와 잎 그림에서 줄기 7, 잎 4 가 나타내는 기록은? (7|1 = 7.1초)', ['7.4초', '4.7초', '74초'], 0, '줄기 = 일의 자리 · 잎 = 소수 첫째 자리 → 7.4'),
    ('도수분포표를 보면 계급의 크기를 알 수 있다.', ['맞다', '틀리다'], 0, '계급의 양 끝 값의 차 = 계급의 크기'),
]
def sl_text(d): return ' / '.join(f'{s} | {" ".join(d[s])}' for s in sorted(d))
def sl_vals(d): return [s + int(c) / 10 for s in sorted(d) for c in d[s]]
def m3_ver(v):
    if v == 0: d, n, (s1, s2) = SL0, 40, (7, 8)
    else:
        while True:
            st = R.choice([(6, 7, 8), (7, 8, 9)]); n = R.choice([24, 25, 28, 30])
            vals = sorted(R.choice(st) + R.randint(0, 9) / 10 for _ in range(n))
            d = {s: ''.join(str(round((x - s) * 10)) for x in vals if int(round(x * 10)) // 10 == s) for s in st}
            s1 = R.choice(st[:2]); s2 = R.choice(st[1:])
            a = len([x for x in sl_vals(d) if s1 + .5 <= x < s1 + 1]); b = len([x for x in sl_vals(d) if x < s2 + .5])
            if all(d.values()) and 1 <= a <= 15 and b <= 30 and a != b: break
    head = f'남학생 {n}명의 50m 달리기 기록(초) 줄기와 잎 그림 (7|1 = 7.1초) — {sl_text(d)}'
    xs = sl_vals(d)
    A = [x for x in xs if s1 + .5 <= x < s1 + 1]; B = [x for x in xs if x < s2 + .5]
    cq, cch, ca, csol = CON3[v]
    return [
        it('number', f'{head}\n{s1}.5초 이상 {s1 + 1}.0초 미만인 학생 수는?', len(A), sol=f'줄기 {s1} 의 잎 5 ~ 9 → {len(A)}명'),
        it('number', f'{head}\n기록이 {s2}.5초 미만인 학생 수는?', len(B), sol=f'{min(d)}.0초부터 {s2}.4초까지 모두 세면 {len(B)}명'),
        it('choice', cq, ca, cch, csol),
    ]

OXB1 = [('도수분포표를 보면 가장 큰 변량을 정확히 알 수 있다.', 'X', '계급으로 묶어서 정확한 값은 사라짐'),
        ('도수분포표를 보면 각 학생의 정확한 점수를 알 수 있다.', 'X', '계급으로 묶어서 정확한 값은 사라짐'),
        ('도수분포표에서 각 계급의 도수를 모두 더하면 전체 변량의 개수가 된다.', 'O', '도수의 합 = 전체 학생 수'),
        ('계급의 크기는 한 계급의 양 끝 값의 차이다.', 'O', '예: 20 이상 40 미만 → 40 − 20 = 20'),
        ('도수가 가장 큰 계급에는 가장 큰 변량이 들어 있다.', 'X', '도수 = 개수 · 변량의 크기와는 상관없음'),
        ('도수분포표의 계급은 서로 겹치지 않는다.', 'O', '「이상 · 미만」이라 경계 값은 한 계급에만'),
        ('계급의 개수가 많을수록 계급의 크기는 커진다.', 'X', '같은 범위를 더 잘게 나누면 크기는 작아짐')]
def boss1_ver(v):
    if v == 0: w, f, k, j = 20, [2, 3, 11, 4, 5], 1, 3; T = 25
    else:
        while True:
            w = R.choice([10, 20]); T = R.choice([20, 25, 50]); f = R.sample(range(1, 16), 5)
            k = R.randrange(5); j = R.choice([2, 3, 4])
            if sum(f) == T and f[k] != max(f): break
    lo = 0 if w == 20 else 50
    T = sum(f); lab = [f'{lo + i * w}점 이상 {lo + (i + 1) * w}점 미만' for i in range(5)]
    head = f'수학 시험에 참가한 {T}명의 점수 도수분포표 — ' + tbl('점수(점)', lo, w, f, k, mark='A')
    order = sorted(range(5), key=lambda i: -f[i]); sec = order[1]
    assert f[order[0]] > f[order[1]] > f[order[2]]
    others = ' + '.join(str(f[i]) for i in range(5) if i != k)
    pct = sum(f[j:]) * 100 // T; assert sum(f[j:]) * 100 % T == 0
    b = lambda i: lo + i * w
    m = 1 if v == 0 else v % 4          # 「다음 계급」이 실제로 있게 m ≤ 3
    ox1 = (f'「{b(m)} 이상 {b(m + 1)} 미만」 계급에 {b(m + 1)}점은 들어간다.', 'X', f'{b(m + 1)}은 다음 계급 「{b(m + 1)} 이상 {b(m + 2)} 미만」') if v % 2 == 0 else \
          (f'「{b(m)} 이상 {b(m + 1)} 미만」 계급에 {b(m)}점은 들어간다.', 'O', f'「{b(m)} 이상」 → {b(m)}점은 이 계급')
    ox2 = OXB1[v]
    return [
        it('number', f'{head}\nA의 값은?', f[k], sol=f'{T} − ({others}) = {f[k]}'),
        it('choice', f'{head}\n도수가 두 번째로 큰 계급은?', sec, lab, f'{" > ".join(str(f[i]) for i in order)} (A = {f[k]} 포함)'),
        it('number', f'{head}\n점수가 {b(j)}점 이상인 학생은 전체의 몇 %인가?', pct, sol=f'({" + ".join(str(x) for x in f[j:])}) ÷ {T} × 100 = {pct}'),
        it('ox', ox1[0], ox1[1], sol=ox1[2]),
        it('ox', ox2[0], ox2[1], sol=ox2[2]),
    ]

# ── 2차시 ─────────────────────────────────────────────
def m21_ver(v):
    if v == 0: lo, w, f = 10, 5, [2, 5, 4, 8, 1]
    else:
        while True:
            w = R.choice([5, 10]); lo = R.choice([5, 10, 20]) if w == 5 else R.choice([10, 20, 30]); f = [R.randint(1, 9) for _ in range(5)]
            if f.count(max(f)) == 1 and w * max(f) <= 99 and (lo, w, f) != (10, 5, [2, 5, 4, 8, 1]): break
    T = sum(f); top = f.index(max(f)); e = lo + 5 * w
    lab = [f'{lo + i * w}명 이상 {lo + (i + 1) * w}명 미만' for i in range(5)]
    head = f'블로그 방문자 수 {T}일 도수분포표 — ' + tbl('방문자 수(명)', lo, w, f, None, '일')
    R3 = lambda a, b, c, d: f'{a}~{b} 과 {c}~{d}'
    ends = [R3(lo - w, lo, e, e + w), R3(lo, lo + w, e - w, e), R3(lo - 2 * w, lo - w, e + w, e + 2 * w), R3(lo - 2 * w, lo, e, e + 2 * w)]
    if v == 0: ch3 = ['5~10 과 35~40', '10~15 과 30~35', '0~5 과 40~45', '0~10 과 35~45']; assert ch3 == ends
    else: ch3 = shuffled(ends, f'm21{v}')
    return [
        it('choice', f'{head}\n히스토그램을 그리면 가장 높은 직사각형은 어느 계급인가?', top, lab, f'도수 {max(f)} 이 가장 큼'),
        it('number', f'{head}\n가장 높은 직사각형의 넓이(계급의 크기×도수)는?', w * max(f), sol=f'{w} × {max(f)} = {w * max(f)}'),
        it('choice', f'{head}\n도수분포다각형을 그릴 때 양 끝에 도수 0으로 더하는 계급은?', ch3.index(ends[0]), ch3, f'계급의 크기({w})만큼 양 끝에 하나씩 → {ends[0]}'),
    ]

def m22_ver(v):
    if v == 0: f, big = [17, 5, 5, 1, 1, 2], 1000; yr = '2015년'
    else:
        while True:
            f = [R.randint(8, 20)] + [R.randint(1, 7) for _ in range(5)]; big = R.choice([800, 1000, 1200])
            if f.count(max(f)) == 1 and sum(f) <= 60 and sum(f[(big - 200) // 200:]) >= 1: break
        yr = '어느 해'
    T = sum(f); lab = [f'{200 + i * 200}만~{400 + i * 200}만 명' for i in range(6)]
    head = f'{yr} 200만 명 이상 관람한 영화의 관객 수 (도수분포다각형을 표로) — 관객 수(만 명): ' + ' · '.join(f'{200 + i * 200}~{400 + i * 200}: {f[i]}' for i in range(6)) + ' (단위 편 · 「200~400」 = 200만 명 이상 400만 명 미만)'
    i0 = (big - 200) // 200; top = f.index(max(f))
    if v == 0: ch = lab[:5]; a = 0
    else:
        pool = [i for i in range(6) if i != top]; pick = sorted(R.sample(pool, 4) + [top]); ch = [lab[i] for i in pick]; a = pick.index(top)
    return [
        it('number', f'{head}\n200만 명 이상이 관람한 영화는 모두 몇 편인가?', T, sol=f'{" + ".join(map(str, f))} = {T}'),
        it('number', f'{head}\n{big}만 명 이상이 관람한 영화는 몇 편인가?', sum(f[i0:]), sol=f'{" + ".join(map(str, f[i0:]))} = {sum(f[i0:])}'),
        it('choice', f'{head}\n도수분포다각형에서 가장 높은 점이 있는 계급은?', a, ch, f'{max(f)}편이 가장 많음'),
    ]

def hist(lo, w, f):
    bars = '; '.join(f'poly ({lo + i * w},0) ({lo + (i + 1) * w},0) ({lo + (i + 1) * w},{f[i]}) ({lo + i * w},{f[i]})' for i in range(len(f)) if f[i] > 0)
    return f'[[graph:{bars} @{lo - w // 2},{lo + len(f) * w + w // 2},0,{max(10, max(f) + 2)} #]]'
def m23_ver(v):
    if v == 0: lo, f, a1 = 200, [4, 7, 5, 3, 1], 250
    else:
        while True:
            lo = R.choice([100, 150, 200, 250]); f = [R.randint(1, 9) for _ in range(5)]; a1 = lo + R.choice([0, 50, 100])
            if f.count(min(f)) == 1 and (lo, f) != (200, [4, 7, 5, 3, 1]): break
    w = 50; lab = [f'{lo + i * w}cm 이상 {lo + (i + 1) * w}cm 미만' for i in range(5)]; lo_i = (a1 - lo) // w
    head = f'어느 공원 나무의 키 히스토그램 (가로 = 키(cm) · 세로 = 나무 수(그루) · 계급 {lo}~{lo + 5 * w}cm, 크기 50cm) {hist(lo, w, f)}'
    mn = f.index(min(f))
    return [
        it('number', f'{head}\n조사한 나무는 모두 몇 그루인가?', sum(f), sol=f'{" + ".join(map(str, f))} = {sum(f)}'),
        it('choice', f'{head}\n도수가 가장 작은 계급은?', mn, lab, f'{min(f)}그루로 가장 낮은 막대'),
        it('number', f'{head}\n키가 {a1}cm 이상 {a1 + 100}cm 미만인 나무는 몇 그루인가?', f[lo_i] + f[lo_i + 1], sol=f'{f[lo_i]} + {f[lo_i + 1]} = {f[lo_i] + f[lo_i + 1]}'),
    ]

OXB2 = [('히스토그램의 직사각형 넓이의 합과 도수분포다각형과 가로축으로 둘러싸인 부분의 넓이는 같다.', 'O', '교과서 개념'),
        ('히스토그램에서 직사각형의 넓이는 그 계급의 도수에 비례한다.', 'O', '넓이 = 계급의 크기(같음) × 도수'),
        ('도수분포다각형은 도수분포표에서 바로 그릴 수 없다.', 'X', '계급의 중앙과 도수만 있으면 바로 그릴 수 있음'),
        ('도수분포다각형은 히스토그램을 그리지 않고 도수분포표에서 바로 그릴 수도 있다.', 'O', '교과서 개념'),
        ('히스토그램에서 직사각형의 높이는 그 계급의 도수이다.', 'O', '세로축 = 도수'),
        ('도수분포다각형을 그릴 때 양 끝에 도수가 0 인 계급은 더하지 않는다.', 'X', '양 끝에 도수 0 인 계급을 하나씩 더해 중앙에 점을 찍음'),
        ('히스토그램의 가로축에는 도수를 나타낸다.', 'X', '가로축 = 계급 · 세로축 = 도수'),
        ('도수분포다각형의 점은 각 직사각형 윗변의 오른쪽 끝에 찍는다.', 'X', '윗변의 중앙에 찍음'),
        ('계급의 크기가 모두 같은 히스토그램에서 직사각형의 가로 길이는 모두 같다.', 'O', '가로 = 계급의 크기'),
        ('히스토그램에서 가장 높은 직사각형의 계급이 도수가 가장 크다.', 'O', '높이 = 도수')]
OXSET2 = [(0, 1, 2), (3, 4, 5), (6, 1, 8), (0, 7, 4), (9, 5, 3), (8, 2, 6), (1, 7, 9)]
def boss2_ver(v):
    if v == 0: f, k, T = [3, 3, 14, 7, 5, 3], 2, 35
    else:
        while True:
            T = R.choice([20, 25, 50]); f = [R.randint(1, 12) for _ in range(6)]; k = R.randrange(6)
            if sum(f) == T and f[k] * 100 % T == 0 and f[k] >= 2: break
    lo, w = 150, 50; T = sum(f)
    head = f'복숭아 {T}개의 무게 히스토그램인데 한 막대가 찢어졌다 (막대 높이를 표로) — 무게(g): ' + ' · '.join(f'{lo + i * w}~{lo + (i + 1) * w}: {"?" if i == k else f[i]}' for i in range(6)) + f' (단위 개 · 「{lo}~{lo + w}」 = {lo} 이상 {lo + w} 미만)'
    others = ' + '.join(str(f[i]) for i in range(6) if i != k); pct = f[k] * 100 // T
    ox = [OXB2[i] for i in OXSET2[v]]
    return [
        it('number', f'{head}\n{lo + k * w}g 이상 {lo + (k + 1) * w}g 미만인 복숭아는 몇 개인가?', f[k], sol=f'{T} − ({others}) = {f[k]}'),
        it('number', f'{head}\n{lo + k * w}g 이상 {lo + (k + 1) * w}g 미만인 복숭아는 전체의 몇 %인가?', pct, sol=f'{f[k]} ÷ {T} × 100 = {pct}'),
    ] + [it('ox', q, a, sol=s) for q, a, s in ox]

def build(src, gens, bossgen, links):
    d = json.load(open(src, encoding='utf8')); v3 = copy.deepcopy(d)
    for mid, g in gens.items():
        vers = [g(v) for v in range(NV)]
        old0 = v3['mons'][mid]['vers'][0]
        for a, b in zip(vers[0], old0):   # 판 0 = 학습지: 정답 · 보기 · 물음 그대로 (문항 글 앞에 자료만 더함)
            assert a['a'] == b['a'] and a['ch'] == b['ch'] and a['type'] == b['type'] and a['q'].split('\n')[-1] == b['q'].split('] ')[-1], (mid, a['q'][-60:], b['q'])
        d['mons'][mid]['vers'] = vers
    bv = [bossgen(v) for v in range(NV)]
    for a, b in zip(bv[0], v3['boss']['vers'][0]):
        assert a['a'] == b['a'] and a['ch'] == b['ch'] and a['type'] == b['type'], (a['q'][-50:], b['q'])
    d['boss']['vers'] = bv; d['boss']['links'] = links
    for m in list(d['mons'].values()) + [d['boss']]:
        for v in m['vers']:
            assert [x['type'] for x in v] == [x['type'] for x in m['vers'][0]]
    return d

R = random.Random(20261123)
p1 = build(P1, {'m1': m1_ver, 'm2': m2_ver, 'm3': m3_ver}, boss1_ver, ['m1', 'm1', 'm1', '', ''])
p2 = build(P2, {'m1': m21_ver, 'm2': m22_ver, 'm3': m23_ver}, boss2_ver, ['m3', 'm3', '', '', ''])
os.makedirs(OUT, exist_ok=True)
for p in (p1, p2):
    json.dump(p, open(os.path.join(OUT, f"{p['id']}.json"), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    print(p['id'], {k: (len(m['vers']), len(m['vers'][0])) for k, m in p['mons'].items()}, 'boss', len(p['boss']['vers']), p['boss']['links'])
