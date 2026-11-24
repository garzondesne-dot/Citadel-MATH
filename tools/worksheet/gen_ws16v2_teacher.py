# 16차시 레이드용 v2 · 교사용 (2026-11-24 · 📚 차시팩 #1 · 선생님 「13 ~ 17차시 교사용 정답」 · 틀 = teacher_lib.py)
#   정답 = 팩 v6(드라이브 08 「(16차시) 차시팩_v6_형성평가학습지」) 학습지 판 · 독립 검산 = CHECK · 사진 채점 = rubrics-11-17 set-16 m3
#   쓰는 법: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tools/worksheet/gen_ws16v2_teacher.py <출력.pdf>
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from teacher_lib import build, A
xs = [i / 4 for i in range(-20, 21)]
same = lambda F, G: all(abs(F(x) - G(x)) < 1e-9 for x in xs)
f1, g1 = (lambda x: 2 * x + 1), (lambda x: x * x - 1)
f2, g2 = (lambda x: x - 4), (lambda x: -x * x)
fe, ge = (lambda x: -x + 2), (lambda x: 4 * x + 1)
ff, gf = (lambda x: x - 5), (lambda x: 3 * x * x - 4)
CHECK = {
    '생각 열기 아람 3000 · 재영 4000 · 하영 2000': True,
    '문제 1 (g∘f)(2) = g(5) = 24': (f1(2), g1(f1(2))) == (5, 24),
    '문제 1 (f∘g)(−1) = f(0) = 1': (g1(-1), f1(g1(-1))) == (0, 1),
    '문제 1 (f∘f)(−3) = f(−5) = −9': (f1(-3), f1(f1(-3))) == (-5, -9),
    '예제 g∘f = −4x + 9 · f∘g = −4x + 1': same(lambda x: ge(fe(x)), lambda x: -4 * x + 9) and same(lambda x: fe(ge(x)), lambda x: -4 * x + 1),
    '문제 2 −x² + 8x − 16 · −x² − 4 · −x⁴': same(lambda x: g2(f2(x)), lambda x: -x * x + 8 * x - 16) and same(lambda x: f2(g2(x)), lambda x: -x * x - 4) and same(lambda x: g2(g2(x)), lambda x: -x ** 4),
    '몬스터 3 h = −2x + 5': same(lambda x: 2 * (-2 * x + 5) - 7, lambda x: -4 * x + 3),
    '형1 (g∘f)(3) = 8 · 형2 (g∘g)(1) = −1': gf(ff(3)) == 8 and gf(gf(1)) == -1,
    '형3 (f∘g)(x) = 3x² − 9': same(lambda x: ff(gf(x)), lambda x: 3 * x * x - 9),
    '형4 h = 2x − 2': same(lambda x: 3 * (2 * x - 2) + 1, lambda x: 6 * x - 5),
    '🔑 2(x + 3) = 2x + 6 · (x − 4)² = x² − 8x + 16': same(lambda x: 2 * (x + 3), lambda x: 2 * x + 6) and same(lambda x: (x - 4) ** 2, lambda x: x * x - 8 * x + 16),
}
bad = [k for k, ok in CHECK.items() if not ok]; assert not bad, bad
print('독립 검산', len(CHECK), '항목 모두 ✔')
ANS = [A('일대일함수'), A('항등함수'),
       A('3000원'), A('4000원'), A('2000원'),
       A('g(f(x))'), A('합성함수'), A('g∘f'),
       A('5'), A('24'), A('0'), A('1'), A('−5'), A('−9'),
       A('−4x + 9'), A('−4x + 1'), A('≠'),
       A('−x² + 8x − 16'), A('−x² − 4'), A('−x⁴'),
       A('f(h(x))'), A('2h(x) − 7'), A('2h(x) − 7'), A('−4x + 10'), A('−2x + 5'),
       A('8'), A('−1'), A('3x² − 9'), A('2x − 2'),
       None]
PAR = ['{KA[i]}']
CIRCLE = [('( {v("f")} · {v("g")} )', '{v("f")}'), ('( ○ · ✕ )', '✕'), ('( 교환법칙 · 결합법칙 )', '결합법칙')]
MEMOS = ['<div class="tmemo"><b>판서</b> (g∘f)(x) = g(f(x)) · 오른쪽 f 먼저 → 그 값을 g 에 · 아람 → 떡볶이 → 3000원</div>',
         '<div class="tmemo"><b>판서</b> 문제 1 : 안쪽 값 먼저 (f(2) = 5 → g(5) = 24) · 문제 2 : 식을 통째로 넣기 · g(x − 4) = −(x − 4)² · 교환법칙 ✕</div>',
         '<div class="tmemo"><b>판서</b> f(h(x)) = 2h(x) − 7 = −4x + 3 → h(x) = −2x + 5 · 검산 2(−2x + 5) − 7 = −4x + 3</div>']
ESSAY = ['(f∘h)(x) = f(h(x)) = 2h(x) − 7',
         '(f∘h)(x) = g(x) 이므로 2h(x) − 7 = −4x + 3',
         '2h(x) = −4x + 10 → h(x) = −2x + 5',
         '검산 f(h(x)) = 2(−2x + 5) − 7 = −4x + 3 ✔']
RUBRIC = '4점 · 3점 통과 ① f(h(x)) 를 h(x) 로 ② = g(x) ③ 이항 정리 ④ h(x) 답 (검산 없어도 감점 ✕)'
FS = {1: 'f(3) = −2 → g(−2) = 3·4 − 4 = 8', 2: 'g(1) = −1 → g(−1) = 3 − 4 = −1', 3: 'f(3x² − 4) = 3x² − 4 − 5', 4: '3h(x) + 1 = 6x − 5 → 3h(x) = 6x − 6'}
KA = ['② 2x + 6', '② x² − 8x + 16']
build('gen_ws16v2.py', sys.argv[1], lesson=16, ANS=ANS, PAR=PAR, CIRCLE=CIRCLE, MEMOS=MEMOS, ESSAY=ESSAY, RUBRIC=RUBRIC, FS=FS, KA=KA)
