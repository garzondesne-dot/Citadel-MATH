# 15차시 레이드용 v3 · 교사용 (2026-11-25 · 📚 차시팩 #1 · 몬스터 3 = 중단원 10(119쪽 서술형) 교체 · 틀 = teacher_lib.py · v2 교사용 = gen_ws15v2_teacher.py)
#   정답 = 팩 v7(드라이브 08 「(15차시) 차시팩_v7_서술형교체」) 학습지 판 · 독립 검산 = CHECK · 사진 채점 = rubrics-11-17 set-15 m3(11/25 새 문항)
#   쓰는 법: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tools/worksheet/gen_ws15v3_teacher.py <출력.pdf>
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from teacher_lib import build, A
xs = [i / 8 for i in range(-80, 81)]
one2one = lambda f, D=xs: len({round(f(x), 9) for x in D}) == len(D)
f4 = lambda x: -2 * x if x >= 0 else x * x
CHECK = {
    '문제 4 (0..3) → 3, 1, −1, −3': [-2 * x + 3 for x in range(4)] == [3, 1, -1, -3],
    '문제 5 (2) x = 3 에 점 둘': [p for p in [(0, 2), (1, 3), (2, 4), (3, 3), (3, 1), (4, 2)] if p[0] == 3].__len__() == 2,
    '문제 6 일대일 (1) (4) · (2) (3) 아님': [one2one(lambda x: 3 * x - 1), one2one(lambda x: -x * x + 2), one2one(abs), one2one(f4)] == [True, False, False, True],
    '문제 6 (4) 치역 = 실수 전체 (x ≥ 0 → y ≤ 0 · x < 0 → y > 0)': max(f4(x) for x in xs if x >= 0) == 0 and min(f4(x) for x in xs if x < 0) > 0,
    '개념 체크 g(−1) = g(1) = 1': (-1) ** 2 == 1 ** 2 == 1,
    '몬스터 3 중단원 10 (3, −4) · (−3, 8) (정수 a, b 전수)': sorted((a, b) for a in range(-20, 21) for b in range(-40, 41) if a and sorted([a + b, 3 * a + b]) == [-1, 5]) == [(-3, 8), (3, -4)],
    '형1 2x − 1 → −3, −1, 1': [2 * x - 1 for x in (-1, 0, 1)] == [-3, -1, 1],
    '형3 일대일대응 = x + 2 · −3x': [one2one(lambda x: x + 2), one2one(lambda x: x * x), one2one(lambda x: abs(x) + 1), one2one(lambda x: -3 * x)] == [True, False, False, True],
    '형4 ㄱ y = x 일대일 · ㄴ 아님 · ㄹ 2x 일대일': [one2one(lambda x: x), one2one(lambda x: x * x + 1), one2one(lambda x: 2 * x)] == [True, False, True],
    '🔑1 −2·2 + 3 = −1': -2 * 2 + 3 == -1,
}
bad = [k for k, ok in CHECK.items() if not ok]; assert not bad, bad
print('독립 검산', len(CHECK), '항목 모두 ✔')
ANS = [A('하나'), A('치역'),                                          # 전시 확인
       A('순서쌍'), A('그래프'), A('한 점'),                            # STEP 1
       A('3'), A('1'), A('−1'), A('−3'),                                 # 문제 4
       A('두 점 이상에서'),                                              # 문제 5 이유
       A('일대일함수'), A('공역'), A('일대일대응'),                      # STEP 2
       A('1'),                                                           # 개념 체크
       A('항등함수'), A('상수함수'),                                     # STEP 3
       A('−1'), A('5'), A('a + b = −1'), A('3a + b = 5'), A('3'), A('−4'),   # 몬스터 3 ① ② ③
       A('5'), A('−1'), A('−3'), A('8'), A('(3, −4)'), A('(−3, 8)'),          # 몬스터 3 ④ 👑
       A('−3'), A('−1'), A('1'),                                         # 형성평가 1
       A('y = x + 2, y = −3x'),                                          # 형성평가 3
       None]                                                             # 맞은 개수
PAR = ['{KA[i]}', '(1)', '(1), (4)', '(1), (4)', '(1)', '(3)', '②', 'ㄱ, ㄹ', 'ㄱ', 'ㄷ']
CIRCLE = [('( 점 4개 · 직선 · 포물선 )', '직선'),
          ('→ 일대일함수가 ( 이다 · 아니다 )</div>', '아니다')]
MEMOS = ['<div class="tmemo"><b>판서</b> 그래프 = 순서쌍 (x, f(x)) 의 모임 · 세로선 x = a 와 꼭 한 점 → 함수의 그래프 · (2) 는 x = 3 에서 두 점 · (3) 원은 두 점</div>',
         '<div class="tmemo"><b>판서</b> 일대일 = 가로줄과 한 번만 · 일대일대응 = 일대일 + 치역 = 공역 · y = x² 은 −1, 1 → 같은 값 1</div>']
P2MEMO = '<div class="tmemo"><b>판서</b> 문제 6 : (1) 3x − 1 · (4) 두 부분 y 값 안 겹침 + 합쳐서 실수 전체 → 일대일대응 · (2) (3) 은 좌우 대칭 → 아님 · 문제 7 : (2) 세로선은 함수 아님</div>'
ESSAY = ['일대일대응 → 치역 = Y → 양 끝끼리 대응 : {f(1), f(3)} = {−1, 5}',
         'a > 0 : a + b = −1, 3a + b = 5 → 2a = 6 → a = 3, b = −4',
         'a < 0 : a + b = 5, 3a + b = −1 → a = −3, b = 8 · 답 (3, −4), (−3, 8)']
RUBRIC = '4점 · 3점 통과 ① 양 끝끼리 대응(치역 = Y) ② a > 0 식 두 개 ③ a > 0 → (3, −4) ④ a < 0 → (−3, 8) (한 경우만 = 최대 3점)'
FS = {1: '2·(−1) − 1 = −3 · 2·0 − 1 = −1 · 2·1 − 1 = 1', 3: 'x², |x| + 1 은 x = ±1 에서 같은 값 → 일대일 ✕', 4: 'ㄴ x² + 1 은 일대일 ✕ · ㄱ · ㄹ 일차 → 일대일대응'}
KA = ['① −1', '② 1 과 1']
build('gen_ws15v3.py', sys.argv[1], lesson=15, ANS=ANS, PAR=PAR, CIRCLE=CIRCLE, MEMOS=MEMOS, P2MEMO=P2MEMO, ESSAY=ESSAY, RUBRIC=RUBRIC, FS=FS, KA=KA)
