# 17차시 레이드용 v2 교사용 = v1 교사용과 같은 정답 · 풀이 칸만 넓힌 학생용 v2 위에 (2026-11-25 · DECISIONS a9ef715)
# 17차시 레이드용 v2 · 교사용 (2026-11-24 · 📚 차시팩 #1 · 선생님 「13 ~ 17차시 교사용 정답」 · 틀 = teacher_lib.py)
#   정답 = 팩 v6(드라이브 08 「(17차시) 차시팩_v6_형성평가학습지」) 학습지 판 · 독립 검산 = CHECK · 사진 채점 = rubrics-11-17 set-17 m3
#   쓰는 법: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tools/worksheet/gen_ws17v1_teacher.py <출력.pdf>
import sys, os
from fractions import Fraction as F
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from teacher_lib import build, A
xs = [F(i, 4) for i in range(-20, 21)]
inv = lambda f, g: all(g(f(x)) == x for x in xs)          # g = f⁻¹ ?
f1 = {1: 3, 2: 5, 4: 1}; f1[3] = ({1, 3, 5, 7} - set(f1.values())).pop()
fi = {y: x for x, y in f1.items()}
# 몬스터 3 : f(−1) = 1, f(−2) = 3 → a, b
a = F(3 - 1, -2 - (-1)); b = 1 + a
a4 = F(2 - 0) ; b4 = 2; a4 = 5 - b4                        # 형4 : f(0) = 2 → b = 2, f(1) = 5 → a = 3
CHECK = {
    '문제 1 그림 3 → 7': f1[3] == 7,
    '문제 1 f⁻¹(7) = 3 · (f⁻¹∘f)(4) = 4 · (f∘f⁻¹)(3) = 3 · (f⁻¹)⁻¹(2) = 5': (fi[7], fi[f1[4]], f1[fi[3]], f1[2]) == (3, 4, 3, 5),
    '예제 y = 3x + 4 → (x − 4)/3': inv(lambda x: 3 * x + 4, lambda x: (x - 4) / 3),
    '문제 2 (1) −(1/3)x + 1/3 · (2) 4x − 8': inv(lambda x: -3 * x + 1, lambda x: -x / 3 + F(1, 3)) and inv(lambda x: x / 4 + 2, lambda x: 4 * x - 8),
    '문제 4 ① (x + 2)/5': inv(lambda x: 5 * x - 2, lambda x: (x + 2) / 5) and not inv(lambda x: 5 * x - 2, lambda x: x / 5 - 2),
    '몬스터 3 a = −2, b = −1, f(4) = −9': (a, b, a * 4 + b) == (-2, -1, -9),
    '형1 f⁻¹(2) = −1 · 형2 (x − 6)/4': 4 * (-1) + 6 == 2 and inv(lambda x: 4 * x + 6, lambda x: (x - 6) / 4),
    '형3 ① x/2 − 1': inv(lambda x: 2 * x + 2, lambda x: x / 2 - 1),
    '형4 f(2) = 8': a4 * 2 + b4 == 8,
    '🔑 3x + 4 = 10 → 2 · a = 3': 3 * 2 + 4 == 10 and (8 - 5) == 3,
}
bad = [k for k, ok in CHECK.items() if not ok]; assert not bad, bad
print('독립 검산', len(CHECK), '항목 모두 ✔')
ANS = [A('g(f(x))'), A('결합법칙'),
       A('일대일대응'), A('역함수'), A('f<sup>−1</sup>'),
       A('7'), A('3'), A('4'), A('3'), A('5'),
       A('(y − 4)/3'), A('(x − 4)/3'),
       A('y = x'),
       A('−(1/3)x + 1/3'), A('4x − 8'),
       A('−2'), A('3'), A('−a + b'), A('−2a + b'), A('−2'), A('−1'), A('−9'),
       A('−1'), A('(1/4)x − 3/2'), A('8'),
       None]
PAR = ['{KA[i]}', '①', '①']
CIRCLE = [('( 일대일함수 · 일대일대응 · 상수함수 )', '일대일대응'),
          ('( {v("x")} 와 {v("y")} 를 바꾼다 · 양변을 제곱한다 )', '{v("x")} 와 {v("y")} 를 바꾼다')]
MEMOS = ['<div class="tmemo"><b>판서</b> 생각 열기 = 일대일대응이라 거꾸로도 함수 ✔ · y = f(x) ⇔ x = f<sup>−1</sup>(y) · (f<sup>−1</sup>∘f)(x) = x</div>',
         '<div class="tmemo"><b>판서</b> 문제 1 : 남은 짝 3 → 7 · (f<sup>−1</sup>)<sup>−1</sup> = f · 구하기 = x 에 대해 풀고 → x, y 바꾸기 · 그래프 = y = x 대칭</div>',
         '<div class="tmemo"><b>판서</b> f<sup>−1</sup>(3) = −2 ⇔ f(−2) = 3 · −a + b = 1, −2a + b = 3 → a = −2, b = −1 → f(x) = −2x − 1</div>']
ESSAY = ['f<sup>−1</sup>(3) = −2 이므로 f(−2) = 3',
         'f(−1) = 1 : −a + b = 1 · f(−2) = 3 : −2a + b = 3',
         '빼면 a = −2 → b = −1 → f(x) = −2x − 1',
         'f(4) = −8 − 1 = −9']
RUBRIC = '4점 · 3점 통과 ① f<sup>−1</sup>(3) = −2 → f(−2) = 3 ② 식 두 개 ③ a, b ④ f(4) 답 (① 을 거꾸로 쓰면 이어진 단계 0)'
FS = {1: '4x + 6 = 2 → x = −1', 2: 'y = 4x + 6 → x = (y − 6)/4 → x, y 바꿈', 4: 'f<sup>−1</sup>(2) = 0 → f(0) = 2 → b = 2 · a + b = 5 → a = 3 → f(2) = 8'}
KA = ['① 2', '① 3']
build('gen_ws17v2.py', sys.argv[1], lesson=17, ANS=ANS, PAR=PAR, CIRCLE=CIRCLE, MEMOS=MEMOS, ESSAY=ESSAY, RUBRIC=RUBRIC, FS=FS, KA=KA)
