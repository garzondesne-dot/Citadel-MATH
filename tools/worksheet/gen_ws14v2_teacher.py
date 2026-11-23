# 14차시 레이드용 v2 · 교사용 (2026-11-24 · 📚 차시팩 #1 · 메타인지 9 🔨 「14차시 교사용 학습지」)
#   학생용 gen_ws14v2.py 를 그대로 읽어 빈칸 · 괄호 · 대응 그림 · 탐구 표 · 서술 칸 · 메모 칸만 정답(빨강) · 풀이 · 판서 요점으로 바꿈 → 같은 쪽 · 같은 칸 배치
#   정답 = 팩 v6(드라이브 08 「(14차시) 차시팩_v6.json」) 판 0 과 같음 · 독립 검산 = 아래 CHECK · 사진 채점 기준 = docs/handoff/pack-rubric/rubrics-11-17.json set-14 m3
#   쓰는 법: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tools/worksheet/gen_ws14v2_teacher.py <출력.pdf>
import os, sys, re
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1]
sys.path.insert(0, HERE)
from wslib import v as _v

# ── 독립 검산 (팩 · 학생용을 읽지 않고 다시 셈) ──
X = [1, 2, 3, 4]
T1 = {1: {1: ['c'], 2: ['a'], 4: ['b']}, 2: {1: ['c'], 2: ['d'], 3: ['a'], 4: ['c']}, 3: {1: ['c'], 2: ['a'], 3: ['b'], 4: ['b', 'd']}}
isf = lambda m, D=X: all(len(m.get(x, [])) == 1 for x in D)
xs = [i / 4 for i in range(-80, 81)]
a, b = 3, -2                                   # f = g : 1 + a = 1 + b + 5 , 2 + a = 4 + 2b + 5
a4, b4 = 4, -3                                 # 형성평가 4 : a + b = 1 , 3a + b = 9
CHECK = {
    '문제 1 함수 = (2)': [n for n in T1 if isf(T1[n])] == [2],
    '문제 1 (1) 3 에 대응 없음': 3 not in T1[1],
    '문제 1 (3) 4 에 둘': len(T1[3][4]) == 2,
    '문제 1 치역 {a, c, d}': sorted({y for v in T1[2].values() for y in v}) == ['a', 'c', 'd'],
    '문제 2 (2) 치역 y ≤ 3': max(-x * x + 3 for x in xs) == 3,
    '탐구 |2x| = 2x² ({−1, 0, 1})': all(abs(2 * x) == 2 * x * x for x in (-1, 0, 1)),
    '문제 3 a = 3, b = −2': all(x + a == x * x + b * x + 5 for x in (1, 2)),
    '형1 ① 만 함수': [isf(m, [1, 2, 3]) for m in ({1: ['a'], 2: ['a'], 3: ['b']}, {1: ['a'], 2: ['b']}, {1: ['a', 'b'], 2: ['a'], 3: ['b']})] == [True, False, False],
    '형2 치역 {1, 3, 5}': sorted({2 * x - 1 for x in (1, 2, 3)}) == [1, 3, 5],
    '형3 y ≥ 1': min(x * x + 1 for x in xs) == 1,
    '형4 a = 4, b = −3': all(a4 * x + b4 == x * x for x in (1, 3)),
    '🔑1 x + 3 (x = 1) = 4': 1 + 3 == 4,
    '🔑2 −x² + 3 의 가장 큰 값 3': max(-x * x + 3 for x in xs) == 3,
}
bad = [k for k, ok in CHECK.items() if not ok]
assert not bad, f'독립 검산 실패: {bad}'
print('독립 검산', len(CHECK), '항목 모두 ✔')

src = open(os.path.join(HERE, 'gen_ws14v2.py'), encoding='utf-8').read()
src = src.replace('os.path.dirname(os.path.abspath(__file__))', repr(HERE)).replace('OUT = sys.argv[1]', '')
R = '#d32f2f'
TCSS = f'''
.ans {{ color:{R}; font-weight:700; border-bottom:1px solid {R}; padding:0 1.2mm; }}
.tsol {{ color:{R}; font-size:8.4pt; line-height:1.35; padding:0.4mm 0 0 4mm; overflow:hidden; }}
.tmemo {{ border:1.3px solid {R}; border-radius:5px; padding:1.2mm 2.4mm; color:{R}; font-size:8pt; line-height:1.4; margin-top:1.2mm; }}
.essay .tl {{ border-bottom:1px dashed #b9c4d8; min-height:5.6mm; color:{R}; font-size:8.4pt; line-height:1.4; padding-top:0.6mm; }}
.tred {{ color:{R}; font-weight:700; }}
'''
A = lambda s: f'<span class="ans">{_v(s)}</span>'
ANS = [A('절대부등식'), A('2√(ab)'),                                            # 전시 확인
       A('대응'), A('오직 하나'), A('함수'),                                     # STEP 1
       A('정의역'), A('공역'), A('함숫값'), A('치역'),                            # STEP 2
       A('{1, 2, 3, 4}'), A('{a, b, c, d}'), A('{a, c, d}'),                      # 문제 1
       A('3 에 대응하는 원소가 없다'), A('4 에 대응하는 원소가 2개(b, d)'),
       A('실수'), A('실수'),                                                       # STEP 3
       A('{x | x는 실수}'), A('{y | y는 실수}'), A('{x | x는 실수}'), A('{y | y ≤ 3}'),  # 문제 2
       A('정의역'), A('모든'), A('같다'),                                          # STEP 4
       A('2'), A('2'), A('6 + b'), A('9 + 2b'), A('−2'), A('3'), A('−2'),          # 문제 3
       A('모든'),                                                                  # 근거
       A('{1, 3, 5}'), A('{y | y ≥ 1}'), A('4'), A('−3'),                         # 형성평가 2 · 3 · 4
       None]                                                                       # 맞은 개수 = 비움
toks = list(re.finditer(r'BL\["(s|m|l|xl)"\]', src)); assert len(toks) == len(ANS), (len(toks), len(ANS))
out, last = [], 0
for i, m in enumerate(toks):
    out.append(src[last:m.start()]); out.append(m.group(0) if ANS[i] is None else f'ANS[{i}]'); last = m.end()
src = ''.join(out) + src[last:]

# 괄호 · 그림 · 표 · 열쇠
def once(old, new):
    global src
    assert src.count(old) >= 1, old[:60]; src = src.replace(old, new, 1)
once('함수인 것 : ( &nbsp;&nbsp;&nbsp; )', "함수인 것 : ( <span class='ans'>(2)</span> )")
once('<br>( &nbsp;&nbsp; ) {', "<br>( <span class='ans'>(1)</span> ) {")
once('<br>( &nbsp;&nbsp; ) {', "<br>( <span class='ans'>(3)</span> ) {")
once('"로의 대응 중 함수인 것은? ( &nbsp;&nbsp;&nbsp; )', '"로의 대응 중 함수인 것은? ( <span class=\'ans\'>①</span> )')
once("['원', '유로', '달러', '파운드'], []", "['원', '유로', '달러', '파운드'], [('대한민국', '원'), ('독일', '유로'), ('프랑스', '유로'), ('미국', '달러')]")
once("<td {TD}>2</td><td {TD}></td><td {TD}></td></tr>", "<td {TD}>2</td><td {TD}><span class='tred'>0</span></td><td {TD}><span class='tred'>2</span></td></tr>")
once("<td {TD}></td><td {TD}>0</td><td {TD}></td></tr></table>", "<td {TD}><span class='tred'>2</span></td><td {TD}>0</td><td {TD}><span class='tred'>2</span></td></tr></table>")
once('→ 두 함수는 서로 ( 같다 · 같지 않다 )', "→ 두 함수는 서로 ( <span class='ans'>같다</span> · 같지 않다 )")
once('&nbsp;&nbsp; 답 ( &nbsp;&nbsp;&nbsp; )</div></div>', '&nbsp;&nbsp; 답 ( <span class="ans">{KA[i]}</span> )</div></div>')

# 메모 3칸 = 판서 요점
MEMOS = [
    '<div class="tmemo"><b>판서</b> 함수 = X 의 원소마다 화살표 <b>꼭 하나</b> (빈손 ✕ · 두 개 ✕) · 치역 ⊂ 공역</div>',
    '<div class="tmemo"><b>판서</b> 문제 1 : (1) 3 이 빈손 · (3) 4 가 두 개 → 함수 아님 · (2) 치역 = 화살표 받은 것 {a, c, d}<br>문제 2 : 정의역 · 공역이 없으면 실수 전체 · −x² ≤ 0 → y ≤ 3</div>',
    '',   # 2쪽 왼쪽 = 남는 자리 없음 → 판서는 2쪽 오른쪽(형성평가 아래)으로
]
P2MEMO = '<div class="tmemo"><b>판서</b> f = g ⇔ 정의역의 <b>원소마다</b> 식 하나 → 원소 2개 = 식 2개 → 연립 · 식이 달라도(탐구 |2x| 와 2x²) 함숫값이 같으면 같은 함수</div>'
for t in MEMOS:   # 학생용 f-string 안에 들어감 → 중괄호는 두 겹
    t = t.replace('{', '{{').replace('}', '}}')
    i = src.index('{MEMO}'); src = src[:i] + t + src[i + 6:]
assert '{MEMO}' not in src

once('<div class="add mini">', P2MEMO.replace('{', '{{').replace('}', '}}') + '<div class="add mini">')

# ✍ 서술형 = 모범 답안 + 사진 채점 기준(set-14 m3 · 4점 · 통과 3)
ESSAY = ['f = g → f(1) = g(1), f(2) = g(2)',
         '1 + a = 6 + b · 2 + a = 9 + 2b',
         '빼면 1 = 3 + b → b = −2',
         'a = 6 + (−2) − 1 = 3 → a = 3, b = −2']
lines = '<div class="ln"></div>' * 4
assert lines in src
src = src.replace(lines, ''.join(f'<div class="tl">{_v(s)}</div>' for s in ESSAY).replace('{', '{{').replace('}', '}}') +
                  f'<div class="mini" style="color:{R};margin-top:1mm"><b>📸 채점 4점 · 3점 통과</b> ① f = g 뜻 ② 식 두 개 ③ b ④ a, b</div>', 1)

# 형성평가 빈 줄 → 풀이 한 줄
FS = {1: '② 는 3 에 대응 없음 · ③ 은 1 에 둘 → ① 만 함수',
      2: 'f(1) = 1, f(2) = 3, f(3) = 5 → {1, 3, 5} (7 은 공역에만)',
      3: 'x² ≥ 0 → x² + 1 ≥ 1 → {y | y ≥ 1}',
      4: 'f(1) = g(1) : a + b = 1 · f(3) = g(3) : 3a + b = 9 → a = 4, b = −3'}
old = "fq = lambda n, s, h: f'<div class=\"q\">{n}. {s}</div>{W(h)}'"
assert old in src
src = src.replace(old, "fq = lambda n, s, h: f'<div class=\"q\">{n}. {s}</div><div class=\"tsol\" style=\"height:{h}mm\">{FS[n]}</div>'")

# 머리 · 제목
once("hd = header('14차시', rng)", "hd = header('14차시 · 교사용', rng)")
once("· 레이드용 v2'\n", "· 레이드용 v2 · 교사용 정답 · 학생 배포 ✕'\n")
once("<title>학습과정 14차시 레이드용 v2 (함수) v2</title><style>{CSS}{EXTRA}{KCSS}</style>", "<title>학습과정 14차시 레이드용 v2 (함수) · 교사용</title><style>{CSS}{EXTRA}{KCSS}{TCSS}</style>")
KA = ['② 4', '② 3']
exec(compile(src, 'gen_ws14v2(teacher)', 'exec'), {'__name__': '__main__', 'OUT': OUT, 'ANS': ANS, 'FS': FS, 'TCSS': TCSS, 'KA': KA, 'sys': sys})
