# 🏫 무안행복중 중1 통계 3차시 「상대도수와 그 그래프」 차시팩 v1 (2026-11-25 · 📚 차시팩 #1 · 선생님 학습지 시안 v1 컨펌 뒤)
#   꼴 = 1 · 2차시 v4 와 같음(게시판 꼴 mons.vers · 판 7개 · 판 0 = 학습지 · 판 1 ~ 6 = 숫자 바꾼 판 · 문항 글에 자료를 다시 적어 혼자 풀림)
#   칸 그림 = 학습지 HTML 에서 따로 자른 png(review · open · c1 · c2 · c3) · 몬스터 · 형성평가 칸은 올리기 창 자동 자르기
#   쓰는 법: python3 gen_pack3.py <출력.json>  → 검산 = verify_pack3.py (문항 글만 읽고 다시 풂)
import json, sys, random
from decimal import Decimal, ROUND_HALF_UP
OUT = sys.argv[1]
R = random.Random(20261125)
NV = 7


def it(t, q, a, ch=None, sol=''):
    assert len(sol) <= 90, sol
    return {'type': t, 'q': q, 'a': str(a), 'ch': ch or [], 'sol': sol}


def r2(n, N):
    """반올림하여 소수 둘째 자리 (교과서 방식 · 사사오입)"""
    return Decimal(n) / Decimal(N)


def fmt(d):
    s = str(Decimal(d).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP))
    return s.rstrip('0').rstrip('.') if '.' in s else s


def choices(ans, seed):
    """상대도수 보기 4개 · 정답 하나 · 0 과 1 사이 · 서로 다름"""
    a = Decimal(fmt(ans))
    cand = [a + Decimal(x) for x in ('0.05', '-0.05', '0.1', '-0.1', '0.15', '0.2')]
    cand = [c for c in cand if Decimal('0') < c < Decimal('1')]
    rr = random.Random(str(seed))
    pick = rr.sample(cand, 3) + [a]
    rr.shuffle(pick)
    ch = [fmt(c) for c in pick]
    assert len(set(ch)) == 4
    return ch, ch.index(fmt(a))


def rng_txt(lo, hi, unit=''):
    return f'{lo}{unit} 이상 {hi}{unit} 미만'


# ── 몬스터 1 · 지역별 습도 (문제 1) ──
HUM0 = [10, 6, 4, 2, 6, 2]


def m1_ver(v):
    if v == 0: f, k1, k2, s = HUM0, 0, 1, 1
    else:
        while True:
            N = R.choice([20, 25, 40, 50]); f = [R.randint(1, 12) for _ in range(6)]
            if sum(f) != N: continue
            k1, k2 = R.sample(range(6), 2); s = R.randrange(4)
            if sum(f[s:s + 3]) * 100 % N == 0 and f != HUM0 and fmt(r2(f[k1], N)) != fmt(r2(f[k2], N)): break
    N = sum(f); lab = lambda i: (30 + 10 * i, 40 + 10 * i)
    head = f'어느 날 {N}개 지역의 습도 상대도수 분포 — 습도(%) ' + ' · '.join(f'{lab(i)[0]}~{lab(i)[1]}: {f[i]}' for i in range(6)) + f' · 합계 {N} (단위 곳 · 「30~40」 = 30 이상 40 미만)'
    out = []
    for k in (k1, k2):
        ch, a = choices(r2(f[k], N), (v, k, 'm1'))
        out.append(it('choice', f'{head}\n습도가 {rng_txt(*lab(k), "%")}인 계급의 상대도수는? (반올림하여 소수 둘째 자리까지)', a, ch, f'{f[k]} ÷ {N} = {fmt(r2(f[k], N))}'))
    t = sum(f[s:s + 3]); lo, hi = lab(s)[0], lab(s + 2)[1]
    out.append(it('number', f'{head}\n습도가 {lo}% 이상 {hi}% 미만인 지역은 전체의 몇 %인가?', t * 100 // N, sol=f'({" + ".join(map(str, f[s:s + 3]))}) ÷ {N} × 100 = {t * 100 // N}'))
    return out


# ── 몬스터 2 · 호박의 무게 (문제 2) ──
PUMP0 = [270, 324, 210, 315, 232, 436, 271, 262, 326, 425, 293, 524, 269, 156, 381, 227, 342, 432, 286, 258, 161, 284, 455, 356, 409]
cntc = lambda xs, lo: sum(1 for x in xs if lo <= x < lo + 100)


def m2_ver(v):
    if v == 0: xs, k1, k2, k3 = PUMP0, 1, 2, 1
    else:
        while True:
            N = R.choice([20, 25]); xs = [R.randint(101, 599) for _ in range(N)]
            if any(x % 100 == 0 for x in xs): continue
            c = [cntc(xs, 100 + 100 * i) for i in range(5)]
            k1, k2 = R.sample(range(5), 2); k3 = R.randrange(5)
            if min(c[k1], c[k2], c[k3]) >= 1 and c[k1] != c[k2]: break
    N = len(xs); c = [cntc(xs, 100 + 100 * i) for i in range(5)]
    head = f'어느 농장에서 수확한 호박 {N}개의 무게(g) — ' + ' '.join(map(str, xs))
    lab = lambda i: (100 + 100 * i, 200 + 100 * i)
    q = lambda t: f'{head}\n{t}'
    lst = lambda k: sorted(x for x in xs if lab(k)[0] <= x < lab(k)[1])
    sl = lambda k: (' · '.join(map(str, lst(k))) + f' → {c[k]}개') if len(' · '.join(map(str, lst(k)))) <= 80 else f'{lab(k)[0]}대 무게를 세면 {c[k]}개'
    ch, a = choices(r2(c[k3], N), (v, 'm2'))
    return [
        it('number', q(f'무게가 {rng_txt(*lab(k1), "g")}인 호박은 몇 개인가?'), c[k1], sol=sl(k1)),
        it('number', q(f'무게가 {rng_txt(*lab(k2), "g")}인 호박은 몇 개인가?'), c[k2], sol=sl(k2)),
        it('choice', q(f'무게가 {rng_txt(*lab(k3), "g")}인 계급의 상대도수는?'), a, ch, f'{c[k3]} ÷ {N} = {fmt(r2(c[k3], N))}'),
    ]


# ── 몬스터 3 · 봉사 활동 시간 (문제 3 · 교과서 그래프 값을 글로) ──
A0, B0 = [10, 16, 42, 20, 12], [16, 24, 38, 12, 10]       # % 단위 정수 (0.1 = 10)
d2 = lambda p: fmt(Decimal(p) / 100)


def rand_dist():
    while True:
        p = [2 * R.randint(1, 25) for _ in range(5)]
        if sum(p) == 100: return p


def m3_ver(v):
    if v == 0: A, B, NA, NB, j, t = A0, B0, 150, 200, 3, 2
    else:
        while True:
            A, B = rand_dist(), rand_dist(); NA, NB = R.sample([50, 100, 150, 200, 250, 300], 2)
            j = R.randrange(4); t = R.choice([1, 2, 3])
            ca, cb = (A[j] + A[j + 1]) * NA / 100, (B[j] + B[j + 1]) * NB / 100
            if ca == int(ca) and cb == int(cb) and 1 <= ca <= 99 and 1 <= cb <= 99 and sum(A[t:]) != sum(B[t:]) and A != A0: break
    lab = lambda i: (2 + 2 * i, 4 + 2 * i)
    head = (f'A 중학교 1학년 {NA}명과 B 중학교 1학년 {NB}명의 한 달 봉사 활동 시간 상대도수 — 시간 '
            + ' · '.join(f'{lab(i)[0]}~{lab(i)[1]}: A {d2(A[i])} / B {d2(B[i])}' for i in range(5)) + ' (「2~4」 = 2시간 이상 4시간 미만)')
    lo, hi = lab(j)[0], lab(j + 1)[1]
    ca, cb = (A[j] + A[j + 1]) * NA // 100, (B[j] + B[j + 1]) * NB // 100
    th = lab(t)[0]; sa, sb = sum(A[t:]), sum(B[t:]); yes = sa > sb
    return [
        it('number', f'{head}\n봉사 활동 시간이 {lo}시간 이상 {hi}시간 미만인 A 중학교 학생은 몇 명인가?', ca, sol=f'({d2(A[j])} + {d2(A[j + 1])}) × {NA} = {ca}'),
        it('number', f'{head}\n봉사 활동 시간이 {lo}시간 이상 {hi}시간 미만인 B 중학교 학생은 몇 명인가?', cb, sol=f'({d2(B[j])} + {d2(B[j + 1])}) × {NB} = {cb}'),
        it('choice', f'{head}\nA 중학교 학생의 봉사 활동 시간이 B 중학교보다 상대적으로 더 많다고 할 수 있는가? ({th}시간 이상인 학생의 비율로 판단)', 0 if yes else 1, ['있다', '없다'],
           f'{th}시간 이상 비율 A {d2(sa)} {">" if yes else "<"} B {d2(sb)}'),
    ]


# ── 형성평가 · 비율의 수호자 ──
CL0 = [3, 7, 8, 5, 2]
OX3 = [('어떤 자료에서 상대도수의 합은 항상 1 이다.', 'O', '각 계급의 도수 ÷ 총합을 모두 더하면 총합 ÷ 총합 = 1'),
       ('상대도수는 1 보다 클 수 있다.', 'X', '계급의 도수는 총합보다 클 수 없어 상대도수는 1 이하'),
       ('상대도수에 100 을 곱하면 그 계급이 전체에서 차지하는 백분율(%)이다.', 'O', '0.25 × 100 = 25 %'),
       ('계급의 상대도수 = 도수의 총합 ÷ 계급의 도수 이다.', 'X', '거꾸로 · 계급의 도수 ÷ 도수의 총합'),
       ('상대도수는 0 이상 1 이하의 수이다.', 'O', '도수는 0 이상 총합 이하'),
       ('도수가 가장 큰 계급의 상대도수가 가장 크다.', 'O', '같은 총합으로 나누므로 도수가 클수록 상대도수도 큼'),
       ('상대도수의 분포를 그래프로 나타낼 때 세로축에는 도수를 적는다.', 'X', '세로축 = 상대도수')]
OX5 = [('도수의 총합이 다른 두 자료를 비교할 때는 도수보다 상대도수를 비교하는 것이 알맞다.', 'O', '전체에서 차지하는 비율로 비교'),
       ('도수의 총합이 다른 두 자료는 도수가 큰 쪽이 비율도 항상 높다.', 'X', '14/50 = 0.28 < 12/40 = 0.3 처럼 거꾸로일 수 있음'),
       ('두 자료의 상대도수 분포 그래프는 한 좌표평면에 함께 그려 비교할 수 있다.', 'O', '세로축이 같은 상대도수라 함께 그림'),
       ('총합 50 중 도수 10 인 계급과 총합 40 중 도수 10 인 계급의 비율은 같다.', 'X', '10 ÷ 50 = 0.2 · 10 ÷ 40 = 0.25'),
       ('도수의 총합이 다른 두 자료는 상대도수로 비교할 수 없다.', 'X', '총합이 달라도 비율이라 비교 가능'),
       ('총합 20 중 도수 5 인 계급과 총합 40 중 도수 10 인 계급의 상대도수는 같다.', 'O', '5 ÷ 20 = 10 ÷ 40 = 0.25'),
       ('두 반을 비교할 때 학생 수가 많은 반의 도수가 크면 그 반의 비율이 더 높다고 바로 말할 수 있다.', 'X', '학생 수가 다르면 상대도수로 비교')]


USED4 = {(40, 20)}


def boss_ver(v):
    if v == 0: f, k, s, T2, p = CL0, 1, 2, 40, 20
    else:
        while True:
            N = R.choice([20, 25, 50]); f = [R.randint(1, 15) for _ in range(5)]
            if sum(f) != N or f == CL0: continue
            k = R.randrange(5); s = R.choice([1, 2, 3])
            T2 = R.choice([20, 25, 30, 40, 50, 60, 80, 100]); p = R.choice([5, 10, 15, 20, 25, 30, 35, 40])
            if T2 * p % 100 == 0 and 1 <= T2 * p // 100 <= 99 and sum(f[s:]) * 100 % N == 0 and (T2, p) not in USED4: break
    USED4.add((T2, p))
    N = sum(f); lab = lambda i: (10 * i, 10 + 10 * i)
    head = f'어느 반 학생 {N}명의 통학 시간 — 시간(분) ' + ' · '.join(f'{lab(i)[0]}~{lab(i)[1]}: {f[i]}' for i in range(5)) + f' · 합계 {N} (단위 명 · 「0~10」 = 0 이상 10 미만)'
    ch, a = choices(r2(f[k], N), (v, 'boss'))
    pc = sum(f[s:]) * 100 // N
    o3, o5 = OX3[v], OX5[v]
    return [
        it('choice', f'{head}\n통학 시간이 {rng_txt(*lab(k), "분")}인 계급의 상대도수는?', a, ch, f'{f[k]} ÷ {N} = {fmt(r2(f[k], N))}'),
        it('number', f'{head}\n통학 시간이 {lab(s)[0]}분 이상인 학생은 전체의 몇 %인가?', pc, sol=f'({" + ".join(map(str, f[s:]))}) ÷ {N} × 100 = {pc}'),
        it('ox', o3[0], o3[1], sol=o3[2]),
        it('number', f'도수의 총합이 {T2} 인 자료에서 상대도수가 {d2(p)} 인 계급의 도수는?', T2 * p // 100, sol=f'{T2} × {d2(p)} = {T2 * p // 100}'),
        it('ox', o5[0], o5[1], sol=o5[2]),
    ]


pack = {
    'id': 'mid1-stat-03', 'no': 3, 'title': '상대도수와 그 그래프', 'unit': '중학수학1 Ⅵ. 통계 · 1 자료의 정리와 해석',
    'goal': '① 상대도수를 구하고 상대도수의 분포표를 만들 수 있다. ② 상대도수의 분포를 그래프로 나타내고, 도수의 총합이 다른 두 자료를 비교할 수 있다.',
    'theme': '06-frost', 'pct': 100,
    'steps': [
        {'kind': 'intro', 'id': 'intro', 'title': '도입 ① 지난 시간 기억하기', 'img': 'review', 'say': '직사각형의 넓이 = 계급의 크기 × 도수 · 도수분포다각형 = 윗변 중앙에 점 · 양 끝에 도수 0 인 계급'},
        {'kind': 'intro', 'id': 'open', 'title': '도입 ② 생각 열기 · 몇 명? 아니면 몇 %?', 'img': 'open', 'say': '🔍 20명 중 3명 → 3 ÷ 20 = 0.15 → 15 % · 「많다 · 적다」는 전체가 몇 명인지 알아야 말할 수 있다'},
        {'kind': 'concept', 'id': 'c1', 'title': 'STEP 1 · 상대도수', 'say': '계급의 상대도수 = 계급의 도수 ÷ 도수의 총합 · 상대도수의 합 = 1 · 상대도수는 0 이상 1 이하 · 상대도수 × 100 = 백분율(%)'},
        {'kind': 'monster', 'id': 'm1', 'title': '문제 1 · 지역별 습도'},
        {'kind': 'concept', 'id': 'c2', 'title': 'STEP 3 · 상대도수의 분포를 나타낸 그래프', 'say': '가로축 = 계급의 양 끝 값 · 세로축 = 상대도수 · 히스토그램이나 도수분포다각형과 같은 방법으로 그린다'},
        {'kind': 'monster', 'id': 'm2', 'title': '문제 2 · 호박의 무게'},
        {'kind': 'concept', 'id': 'c3', 'title': 'STEP 5 · 도수의 총합이 다른 두 자료 비교', 'say': '수영 14명 ÷ 50 = 0.28 · 볼링 12명 ÷ 40 = 0.3 → 도수는 수영이 많아도 비율은 볼링이 높다 · 총합이 다르면 상대도수로 비교'},
        {'kind': 'monster', 'id': 'm3', 'title': '문제 3 · 봉사 활동 시간'},
        {'kind': 'boss', 'id': 'sum', 'title': '형성평가 · 비율의 수호자'},
    ],
    'mons': {
        'm1': {'title': '문제 1 · 지역별 습도', 'sprite': 'new6:0', 'vers': [m1_ver(v) for v in range(NV)]},
        'm2': {'title': '문제 2 · 호박의 무게', 'sprite': 'new7:0', 'vers': [m2_ver(v) for v in range(NV)]},
        'm3': {'title': '문제 3 · 봉사 활동 시간', 'sprite': 'new8:0', 'vers': [m3_ver(v) for v in range(NV)]},
    },
    'boss': {'title': '형성평가 · 비율의 수호자', 'sprite': 'crown1:0', 'items': 5, 'hpItems': 5,
             'tags': ['c1', 'c1', 'c1', 'c1', 'c3'], 'links': ['m1', 'm1', '', '', 'm3'], 'vers': [boss_ver(v) for v in range(NV)]},
    'img': ['review', 'open', 'c1', 'c2', 'c3', 'm1', 'm2', 'm3', 'sum'],
    'video': [],
}
if len(sys.argv) > 2: pack['video'] = [{'file': sys.argv[2], 'at': ['c1']}]
for m in list(pack['mons'].values()) + [pack['boss']]:
    for vv in m['vers']: assert [x['type'] for x in vv] == [x['type'] for x in m['vers'][0]]
json.dump(pack, open(OUT, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print(OUT, {k: (len(m['vers']), len(m['vers'][0])) for k, m in pack['mons'].items()}, 'boss', len(pack['boss']['vers']))
