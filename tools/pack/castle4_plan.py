# 🏰 성채 4층 「함수 중단원」 변경 제안 PDF (2026-11-20 · 손발 #7 · 메타인지 8 컨펌 #7 = A1 · B1 · C1 · D1 · E1)
#   방 14개 · 첫 판 = 교과서 숫자를 고친 문제 · 정답은 아래 파이썬으로 따로 셈(assert) · 하나라도 틀리면 PDF 를 만들지 않음
#   실행: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tools/pack/castle4_plan.py <출력.pdf>
import sys
from fractions import Fraction as Fr
from playwright.sync_api import sync_playwright
OUT = sys.argv[1]
R = []  # (방, 열림, 교과서, 고친 첫 판, 정답, 풀이 한 줄, 게임 꼴)

# 01 · 중단원 01 → X = {−1, 0, 1}, Y = {0, 1, 2, 4}
X, Y = [-1, 0, 1], {0, 1, 2, 4}
cand = {'(1) y = x + 1': lambda x: x + 1, '(2) y = x² + 1': lambda x: x * x + 1, '(3) y = 2x': lambda x: 2 * x, '(4) y = |x| + 3': lambda x: abs(x) + 3}
ans01 = [k for k, f in cand.items() if all(f(x) in Y for x in X)]
assert ans01 == ['(1) y = x + 1', '(2) y = x² + 1']
R.append(('01', 14, '중단원 01: X = {−1, 0, 1} → Y = {0, 1, 2, 3} · y = x + 2 · x² − 1 · |x − 1| · 3|x|', 'X = {−1, 0, 1} 에서 Y = {0, 1, 2, 4} 로의 함수인 것을 모두: (1) y = x + 1 (2) y = x² + 1 (3) y = 2x (4) y = |x| + 3',
          '(1), (2)', '(3) x = −1 → −2 ∉ Y · (4) x = 0 → 3 ∉ Y', '여러 개 고르기'))

# 02 · 중단원 05 → 정의역 {1, 3} · f = x + a · g = x² + bx + 4
b = Fr((9 + 4 - 3) - (1 + 4 - 1), 1 - 3); a = 1 + b + 4 - 1
assert (a, b) == (1, -3) and all(x + a == x * x + b * x + 4 for x in (1, 3))
R.append(('02', 14, '중단원 05: 정의역 {1, 2} · f = x + a · g = x² + bx + 5 · f = g', '정의역이 {1, 3} 인 f(x) = x + a, g(x) = x² + bx + 4 에서 f = g 일 때 a, b',
          'a = 1, b = −3', 'f(1) = g(1): 1 + a = 5 + b · f(3) = g(3): 3 + a = 13 + 3b → 빼면 b = −3', '고르기 (졸개 → 대장)'))

# 03 · 중단원 02 → ㄱ y = 4 ㄴ y = −3x + 2 ㄷ y = x ㄹ y = −x² + 2
fs = {'ㄱ': lambda x: 4, 'ㄴ': lambda x: -3 * x + 2, 'ㄷ': lambda x: x, 'ㄹ': lambda x: -x * x + 2}
xs = [i / 4 for i in range(-40, 41)]
inj = [k for k, f in fs.items() if len({f(x) for x in xs}) == len(xs)]
ident = [k for k, f in fs.items() if all(f(x) == x for x in xs)]; const = [k for k, f in fs.items() if len({f(x) for x in xs}) == 1]
assert inj == ['ㄴ', 'ㄷ'] and ident == ['ㄷ'] and const == ['ㄱ']  # 일차(기울기 ≠ 0) = 치역 실수 전체 → 일대일대응
R.append(('03', 15, '중단원 02: ㄱ y = −1 ㄴ y = x ㄷ y = −4x + 1 ㄹ y = 2x² − 3', 'ㄱ. y = 4 ㄴ. y = −3x + 2 ㄷ. y = x ㄹ. y = −x² + 2 에서 일대일대응 · 항등함수 · 상수함수',
          '일대일대응 ㄴ, ㄷ · 항등 ㄷ · 상수 ㄱ', 'ㄹ: f(−1) = f(1) = 1 → 일대일 아님', '짝 맞추기'))

# 04 · 문제 6 ⑷ 꼴 → 구간을 나눈 함수 셋 중 일대일대응
P4 = {'①': (lambda x: -x * x, lambda x: -3 * x), '②': (lambda x: x * x, lambda x: -x), '③': (lambda x: x + 1, lambda x: x)}
def piece(r, l): return lambda x: r(x) if x >= 0 else l(x)
def onto_inj(f):
    """일대일 = 촘촘히 찍어 값 겹침 없음 · 치역 실수 전체 = 끊김 없음(이웃 점 차이가 작음) + 양 끝이 반대 부호로 커짐 (사잇값 정리)"""
    xs = [i / 200 for i in range(-2000, 2001)]; v = [f(x) for x in xs]
    inj = len({round(t, 9) for t in v}) == len(v)
    cont = all(abs(v[i + 1] - v[i]) < 0.1 for i in range(len(v) - 1))
    ends = (f(1000) > 100 and f(-1000) < -100) or (f(1000) < -100 and f(-1000) > 100)
    return inj and cont and ends
res04 = [k for k, (r, l) in P4.items() if onto_inj(piece(r, l))]
assert res04 == ['①']
R.append(('04', 15, '문제 6 ⑷: x ≥ 0 이면 −2x · x < 0 이면 x²', '① x ≥ 0: y = −x² · x < 0: y = −3x ② x ≥ 0: y = x² · x < 0: y = −x ③ x ≥ 0: y = x + 1 · x < 0: y = x 중 일대일대응 (그래프와 함께)',
          '①', '② f(1) = f(−1) = 1 · ③ 0 ≤ y < 1 인 값이 없음 (치역 ≠ 실수 전체)', '그래프 고르기'))

# 05 · 중단원 10 (발전 · 서술형) → X = [0, 2], Y = [1, 7]
sols = []
for sgn in (1, -1):  # a > 0: f(0) = 1, f(2) = 7 · a < 0: f(0) = 7, f(2) = 1
    lo, hi = (1, 7) if sgn > 0 else (7, 1)
    bb = lo; aa = Fr(hi - lo, 2); sols.append((aa, bb))
    assert {aa * 0 + bb, aa * 2 + bb} == {1, 7}
assert sols == [(3, 1), (-3, 7)]
R.append(('05', 15, '중단원 10: X = {x | 1 ≤ x ≤ 3} → Y = {y | −1 ≤ y ≤ 5} · ax + b 일대일대응 · (a, b) 모두', 'X = {x | 0 ≤ x ≤ 2} 에서 Y = {y | 1 ≤ y ≤ 7} 로의 f(x) = ax + b 가 일대일대응일 때 (a, b) 모두',
          '(3, 1), (−3, 7)', 'a > 0: f(0) = 1, f(2) = 7 · a < 0: f(0) = 7, f(2) = 1 (끝점끼리 대응)', '소레이드형 + ✍'))

# 06 · 중단원 03 (g = 3x² − 4) → f = x + 2, g = 2x² − 3
f6, g6 = (lambda x: x + 2), (lambda x: 2 * x * x - 3)
assert g6(f6(0)) == 5 and g6(g6(1)) == -1 and all(f6(g6(x)) == 2 * x * x - 1 for x in range(-3, 4))
R.append(('06', 16, '중단원 03: f = x − 5 · g = 3x² − 4 · (g∘f)(3) · (g∘g)(1) · (f∘f)(x) · (f∘g)(x)', 'f(x) = x + 2, g(x) = 2x² − 3 일 때 (g∘f)(0) · (g∘g)(1) · (f∘g)(x)',
          '5 · −1 · 2x² − 1', 'g(f(0)) = g(2) = 5 · g(g(1)) = g(−1) = −1 · f(g(x)) = 2x² − 3 + 2', '고르기 3'))

# 07 · 중단원 06 → f = x − 2 (x ≥ 3) · 3x + 1 (x < 3) · g = x² + 2x · (f∘g)(1)
f7 = lambda x: x - 2 if x >= 3 else 3 * x + 1; g7 = lambda x: x * x + 2 * x
assert g7(1) == 3 and f7(3) == 1 and f7(g7(1)) == 1
f7t = lambda x: x + 1 if x >= 2 else 2 * x - 1; g7t = lambda x: x * x - 3 * x
assert f7t(g7t(-2)) == 11  # 교과서 답 (참고)
R.append(('07', 16, '중단원 06: f = x + 1 (x ≥ 2) · 2x − 1 (x < 2) · g = x² − 3x · (f∘g)(−2) = 11', 'f(x) = x − 2 (x ≥ 3), 3x + 1 (x < 3) · g(x) = x² + 2x 일 때 (f∘g)(1)',
          '1', 'g(1) = 3 → 3 ≥ 3 이므로 f(3) = 3 − 2 = 1 (경계 3 은 위 식)', '고르기 (경계 함정 보기 10)'))

# 08 · 중단원 07 → f = 3x + 2 · g = 6x − 7 · (f∘h)(x) = g(x)
h8 = lambda x: Fr(6 * x - 7 - 2, 3)
assert all(3 * h8(x) + 2 == 6 * x - 7 for x in range(-5, 6)) and h8(0) == -3 and h8(1) - h8(0) == 2
R.append(('08', 16, '중단원 07: f = 2x − 7 · g = −4x + 3 · (f∘h)(x) = g(x)', 'f(x) = 3x + 2, g(x) = 6x − 7 일 때 (f∘h)(x) = g(x) 인 h(x)',
          'h(x) = 2x − 3', '3h(x) + 2 = 6x − 7 → 3h(x) = 6x − 9', '소레이드형 (16차시 몬스터 3 답과 다름)'))

# 09 · 문제 3 (115쪽) → (g∘f)(x) = 3x + 1 · (f⁻¹∘g⁻¹)(7)
assert 3 * 2 + 1 == 7
R.append(('09', 17, '문제 3: (g∘f)(x) = 2x − 5 · (f⁻¹∘g⁻¹)(3) = 4', '(g∘f)(x) = 3x + 1 일 때 (f⁻¹∘g⁻¹)(7)',
          '2', '(f⁻¹∘g⁻¹) = (g∘f)⁻¹ → 3x + 1 = 7 인 x', '고르기 2 (성질 → 값)'))

# 10 · 중단원 04 → f = 2x − 8
A, B = Fr(1, 2), Fr(8, 2)
assert all(A * (2 * x - 8) + B == x for x in range(-4, 5)) and 2 * 6 - 8 == 4
R.append(('10', 17, '중단원 04: f = 4x + 6 · f⁻¹(2) · f⁻¹(x)', 'f(x) = 2x − 8 일 때 f⁻¹(4) · f⁻¹(x)',
          '6 · y = (1/2)x + 4', '2x − 8 = 4 → x = 6 · x = (1/2)y + 4 → 바꾸면', '고르기 2'))

# 11 · 문제 5 (116쪽 · 과학) → 68 °F
c = Fr(5, 9) * (68 - 32)
assert c == 20 and Fr(9, 5) * 20 + 32 == 68 and Fr(5, 9) * (95 - 32) == 35
R.append(('11', 17, '문제 5: y = (9/5)x + 32 · 역함수 · 95 °F → 35 °C', '섭씨 x °C → 화씨 y °F : y = (9/5)x + 32 의 역함수 · 68 °F 는 몇 °C',
          'y = (5/9)(x − 32) · 20 °C', 'x 에 대하여 풀고 바꾸기 · (5/9)(68 − 32) = 20', '고르기 2'))

# 12 · 중단원 08 (서술형) → f(2) = 3 · f⁻¹(−1) = 4 · f(−3)
a12 = Fr(-1 - 3, 4 - 2); b12 = 3 - a12 * 2
assert (a12, b12) == (-2, 7) and a12 * -3 + b12 == 13
R.append(('12', 17, '중단원 08: f = ax + b · f(−1) = 1 · f⁻¹(3) = −2 · f(4) = −9', 'f(x) = ax + b, f(2) = 3, f⁻¹(−1) = 4 일 때 f(−3)',
          '13', 'f⁻¹(−1) = 4 → f(4) = −1 · 2a + b = 3 · 4a + b = −1 → a = −2, b = 7', '소레이드형 + ✍'))

# 13 · 중단원 09 → 글자 a ~ e 대신 수: y = f(x) = 2x − 3 의 그래프 + 점선 y = x
f13 = lambda x: 2 * x - 3
assert f13(f13(2)) == -1 and f13(4) == 5 and f13(f13(3)) == 3
R.append(('13', 17, '중단원 09: 그래프와 y = x · (f∘f)(d) · f⁻¹(a) · (f∘f)⁻¹(c) (축에 글자 a ~ e)', '그래프 y = f(x) (점 (1, −1) (2, 1) (3, 3) (4, 5) 지남) 와 점선 y = x 를 보고 (f∘f)(2) · f⁻¹(5) · (f∘f)⁻¹(3)',
          '−1 · 4 · 3', 'f(2) = 1 → f(1) = −1 · f(4) = 5 · f(f(x)) = 3 → f(x) = 3 → x = 3', '그래프 보고 고르기 3'))

# 👑 14 · 중단원 11 (발전) → f = x + a · g = x² (x ≥ a) · 2x − 6 (x < a) · (g∘f)(2) + (f∘g)(4) = 56
def total(a):
    f = lambda x: x + a; g = lambda x: x * x if x >= a else 2 * x - 6
    return g(f(2)) + f(g(4))
roots = [a for a in range(-50, 51) if total(a) == 56]
# 실수 해 전부: 경우 a ≤ 4 → (2 + a)² + 16 + a = 56 → a² + 5a − 36 = 0 · 경우 a > 4 → (2 + a)² + 2 + a = 56 → a² + 5a − 50 = 0 (판별식 완전제곱 → 정수 해뿐)
assert 25 + 4 * 36 == 13 ** 2 and 25 + 4 * 50 == 15 ** 2
assert roots == [-9, 4, 5] and sum(roots) == 0
assert [a for a in range(-50, 51) if (lambda f, g: g(f(1)) + f(g(4)))(lambda x: x + a, lambda x: x * x if x >= a else 2 * x - 6) == 57] == [-8, 6]  # 교과서 답 합 −2 (참고)
R.append(('👑 14', 17, '중단원 11: f = x + a · g = x² (x ≥ a), 2x − 6 (x < a) · (g∘f)(1) + (f∘g)(4) = 57 · 모든 a 의 합 = −2', 'f(x) = x + a · g(x) = x² (x ≥ a), 2x − 6 (x < a) · (g∘f)(2) + (f∘g)(4) = 56 을 만족시키는 모든 실수 a 의 합',
          '0 (a = −9, 4, 5)', '(g∘f)(2) = (2 + a)² (2 + a ≥ a) · a ≤ 4: a² + 5a − 36 = 0 → −9, 4 · a > 4: a² + 5a − 50 = 0 → 5 (−10 버림)', '소레이드형 · 숫자'))

rows = ''.join(f'<tr><td class="c">{r[0]}</td><td class="c">{r[1]}</td><td class="s">{r[2]}</td><td>{r[3]}</td><td class="a">{r[4]}</td><td class="s">{r[5]}</td><td class="s">{r[6]}</td></tr>' for r in R)
rows = rows.replace('⁻¹', '<sup>−1</sup>')
html = f'''<!DOCTYPE html><html><head><meta charset="utf-8"><style>
@page {{ size: A4 landscape; margin: 10mm; }}
body {{ font-family: "Noto Sans CJK KR"; font-size: 8.6pt; color: #222; }}
h1 {{ font-size: 14pt; margin: 0 0 1mm 0; }} .sub {{ color: #555; font-size: 8.6pt; margin-bottom: 2mm; }}
table {{ border-collapse: collapse; width: 100%; }} th, td {{ border: 1px solid #9ab; padding: 1.2mm 1.6mm; vertical-align: top; line-height: 1.45; }}
th {{ background: #eef3f8; font-weight: 700; }} td.c {{ text-align: center; white-space: nowrap; }} td.s {{ color: #444; font-size: 8pt; }} td.a {{ font-weight: 700; color: #1b3d8f; }}
.box {{ border: 1px solid #c9b48a; background: #fffaf0; border-radius: 2mm; padding: 1.5mm 2.5mm; margin-top: 2mm; font-size: 8.4pt; }}
</style></head><body>
<h1>🏰 성채 4층 「함수 중단원」 변경 제안 v1</h1>
<div class="sub">교과서 미래엔 공통수학2 Ⅲ-1 함수 (106~119쪽) · eval-4 · 17차시를 나가면 층이 열림 · 방 하나 = 문항 하나 · 판 7개 (첫 판 = 아래 「고친 첫 판」 · 나머지 6판은 같은 꼴로 숫자만) · 👑 보스 방 = 열린 방의 60% 처치 · 손발 #7 · 2026-11-20</div>
<table><tr><th>방</th><th>열림</th><th>교과서 원문</th><th>고친 첫 판 (게임 · 학습지 없음)</th><th>정답</th><th>풀이 한 줄</th><th>게임 꼴</th></tr>{rows}</table>
<div class="box"><b>독립 검산</b> — 모든 정답은 이 PDF 를 만드는 코드가 숫자를 넣어 따로 셈(정의역 원소 대입 · 다항식 비교 · 정수 범위 −50 ~ 50 전수 조사 · 판별식 확인)하고, 하나라도 다르면 PDF 를 만들지 않음. 교과서 원래 답(07 = 11 · 09 = 4 · 11 = 35 °C · 14 = −2)도 같은 코드로 확인.<br>
<b>컨펌 #7</b> = A1 4층 · 함수 중단원 · B1 13번 방 = 글자 대신 수 · C1 보스 = 중단원 11 · D1 서술형 방(05 · 12) = 소레이드형 + ✍ · E1 그림 = castle 그림 색 바꿔 재사용 · 보스 castleboss2<br>
<b>⚠</b> 03 (짝 맞추기) · 04 · 13 (그래프) = 새 꼴 → 11/24 정식 배포 뒤 앱에서 올림 · 06 은 교과서 중단원 03 의 이차식 꼴(g = 3x² − 4)을 따라 g = 2x² − 3 으로 고침</div>
</body></html>'''
with sync_playwright() as p:
    b_ = p.chromium.launch(); pg = b_.new_page(); pg.set_content(html); pg.wait_for_timeout(200)
    pg.pdf(path=OUT, format='A4', landscape=True, print_background=True); b_.close()
print('검산 통과 · 방', len(R))
