#!/usr/bin/env python3
"""모루 함수 단원(14 ~ 17차시) 카드 · 레시피 + 기호톡 연결표 만들기 (설계 방 · 묶음 #7)
쓰기: python3 build.py  → unit-func.json · symtalk-map.json · FORGE-FUNC-v1.md · 예제 정답 검산"""
import json, re
from fractions import Fraction as Fr

MATS = [
 dict(id='x', sym='x', tip='정의역의 원소'), dict(id='y', sym='y', tip='공역의 원소 · 함숫값'), dict(id='c', sym='c', tip='상수 (정해진 수 하나)'),
 dict(id='SX', sym='X', tip='집합 X (정의역이 될 집합)'), dict(id='SY', sym='Y', tip='집합 Y (공역이 될 집합)'),
 dict(id='f', sym='f', tip='함수 f'), dict(id='g', sym='g', tip='함수 g'), dict(id='h', sym='h', tip='함수 h'),
]
# 있는 연산을 그대로 쓰는 것: then(→ · 9차시) · eq(=) · neq(≠) · and(이고) · brace({ })  /  새 연산 7개
OPS = [
 dict(id='app', sym='( )에 넣기', no=14), dict(id='dom', sym='정의역', no=14, unary=True), dict(id='cod', sym='공역', no=14, unary=True), dict(id='ran', sym='치역', no=14, unary=True),
 dict(id='o', sym='∘', no=16), dict(id='inv', sym='⁻¹', no=17, unary=True), dict(id='swap', sym='x ↔ y', no=17, unary=True),
]
USE_OLD = ['then', 'eq', 'neq', 'and', 'brace']
C = lambda q, ch, a, sol: dict(type='choice', question=q, choices=ch, answerIndex=a, solution=sol)
N = lambda q, a, sol: dict(type='number', question=q, answer=a, solution=sol)
O = lambda q, a, sol: dict(type='ox', question=q, answer=a, solution=sol)
def card(id, no, sec, name, fm, desc, grade, art, op, inn, hint, ex, ordered=False, alt=None, mf=None, short=None, ws=''):
    d = dict(id=id, no=no, sec=sec, name=name, fm=fm, desc=desc, grade=grade, art=art, page='', op=op, **{'in': inn}, hint=hint, ex=ex, ws=ws)
    if ordered: d['ordered'] = True
    if alt: d['alt'] = alt
    if mf: d['mf'] = mf
    if short: d['short'] = short
    return d
S14, S15, S16, S17 = '07 함수', '08 여러 가지 함수', '09 합성함수', '10 역함수'
CARDS = [
 # ── 14차시 함수 ──
 card('func', 14, S14, '함수', 'f : X → Y', 'X 의 원소마다 Y 의 원소가 하나씩 대응', 1, 16, 'then', ['SX', 'SY'], '정의역이 될 집합에서 공역이 될 집합으로 화살표', ordered=True, ws='14차시 STEP 1 · 문제 1',
      ex=C('X = {1, 2, 3} 에서 Y = {a, b} 로의 대응 중 함수인 것은?', ['1→a, 2→b', '1→a, 2→a, 3→b', '1→a, 1→b, 2→a, 3→b'], 1, 'X 의 원소 1, 2, 3 마다 화살표가 꼭 하나씩 → 함수')),
 card('fval', 14, S14, '함숫값', 'y = f(x)', 'x 에 대응하는 Y 의 원소 f(x)', 1, 17, 'app', ['f', 'x'], '함수에 x 를 넣으면 나오는 값', ordered=True, mf='f(x)', ws='14차시 STEP 1',
      ex=N('f(x) = 3x − 4 일 때 f(5) = ?', 11, 'f(5) = 3 × 5 − 4 = 11')),
 card('domain', 14, S14, '정의역', '정의역 X', '함수 f : X → Y 에서 집합 X', 1, 18, 'dom', ['card:func'], '화살표가 출발하는 집합', ws='14차시 STEP 2',
      ex=C('함수 f : X → Y 에서 정의역은?', ['집합 X', '집합 Y', '함숫값 전체'], 0, '화살표가 출발하는 집합 X 가 정의역')),
 card('codomain', 14, S14, '공역', '공역 Y', '함수 f : X → Y 에서 집합 Y', 1, 18, 'cod', ['card:func'], '화살표가 도착할 수 있는 집합 전체', ws='14차시 STEP 2',
      ex=C('함수 f : X → Y 에서 공역은?', ['집합 X', '집합 Y', '화살표를 받은 원소만 모은 집합'], 1, '화살표가 향하는 집합 Y 전체가 공역 (받지 못한 원소도 포함)')),
 card('range', 14, S14, '치역', '{f(x) | x ∈ X}', '함숫값 전체의 집합 (공역의 부분집합)', 2, 18, 'ran', ['card:func'], '화살표를 실제로 받은 원소만 모으면?', ws='14차시 STEP 2 · 문제 1 · 2',
      ex=C('X = {1, 2, 3} 에서 f(x) = 2x + 1 의 치역은?', ['{1, 2, 3}', '{3, 5, 7}', '{2, 4, 6}'], 1, 'f(1) = 3, f(2) = 5, f(3) = 7 → {3, 5, 7}')),
 card('feq', 14, S14, '서로 같은 함수', 'f = g', '정의역이 같고 모든 원소에서 함숫값이 같다', 2, 19, 'eq', ['f', 'g'], '두 함수 사이에 =', ws='14차시 STEP 4 · 문제 3',
      ex=C('정의역이 {0, 1} 인 두 함수 f(x) = x, g(x) = x² 은 서로 같은 함수일까?', ['같다 — f(0) = g(0), f(1) = g(1)', '다르다 — 식이 다르다', '알 수 없다'], 0, 'f(0) = g(0) = 0, f(1) = g(1) = 1 → 정의역의 모든 원소에서 함숫값이 같다')),
 # ── 15차시 함수의 그래프 · 여러 가지 함수 ──
 card('graph', 15, S15, '함수의 그래프', '{(x, f(x)) | x ∈ X}', '순서쌍 (x, f(x)) 전체의 집합', 2, 20, 'brace', ['card:fval'], '함숫값을 순서쌍으로 모아 중괄호에', ws='15차시 문제 4 · 5',
      ex=C('정의역이 {0, 1, 2} 인 함수 y = x + 2 의 그래프는?', ['점 3개 (0, 2), (1, 3), (2, 4)', '직선 y = x + 2', '점 3개 (2, 0), (3, 1), (4, 2)'], 0, '정의역이 원소 3개 → 점 3개 (0, 2), (1, 3), (2, 4)')),
 card('inj', 15, S15, '일대일함수', 'x₁ ≠ x₂ 이면 f(x₁) ≠ f(x₂)', '서로 다른 원소의 함숫값이 서로 다르다', 2, 21, 'neq', ['card:fval', 'card:fval'], '함숫값끼리 서로 다르다면?', ws='15차시 문제 6',
      ex=C('다음 중 일대일함수가 아닌 것은? (정의역 · 공역 = 실수 전체)', ['y = 2x + 5', 'y = x² − 3', 'y = −x'], 1, 'y = x² − 3 은 f(−1) = f(1) = −2 → 서로 다른 x 의 함숫값이 같다')),
 card('onto', 15, S15, '치역과 공역이 같다', '치역 = 공역', '공역의 모든 원소가 화살표를 받는다', 2, 18, 'eq', ['card:range', 'card:codomain'], '치역 카드와 공역 카드가 같다면', short='치역 = 공역', ws='15차시 문제 6',
      ex=C('정의역 · 공역이 실수 전체인 y = x² 의 치역은 공역과 같을까?', ['같다', '다르다 — 치역은 {y | y ≥ 0}'], 1, 'x² ≥ 0 이라 음수는 함숫값이 될 수 없다 → 치역 ≠ 공역')),
 card('bij', 15, S15, '일대일대응', '일대일함수이고 치역 = 공역', '일대일함수이면서 치역과 공역이 같은 함수', 3, 21, 'and', ['card:inj', 'card:onto'], '일대일함수이고, 치역 = 공역', ws='15차시 문제 6 · 중단원 02',
      ex=C('정의역 · 공역이 실수 전체일 때 일대일대응인 것은?', ['y = |x|', 'y = 4', 'y = −3x + 1'], 2, '직선(기울기 ≠ 0)은 일대일함수이고 치역이 실수 전체')),
 card('ident', 15, S15, '항등함수', 'f(x) = x', '자기 자신에 대응하는 함수', 2, 22, 'eq', ['card:fval', 'x'], '함숫값이 넣은 값 그대로라면', ordered=True, ws='15차시 중단원 02',
      ex=N('항등함수 f 에 대하여 f(7) = ?', 7, '항등함수는 f(x) = x → f(7) = 7')),
 card('const', 15, S15, '상수함수', 'f(x) = c', '모든 x 에 같은 값 하나가 대응하는 함수', 2, 22, 'eq', ['card:fval', 'c'], '함숫값이 늘 같은 수 하나라면', ordered=True, ws='15차시 중단원 02',
      ex=N('상수함수 f 에서 f(1) = 6 일 때 f(100) = ?', 6, '상수함수는 모든 x 에서 값이 같다 → 6')),
 # ── 16차시 합성함수 ──
 card('compose', 16, S16, '합성함수', 'g∘f', 'f 다음에 g (오른쪽 함수부터)', 1, 23, 'o', ['g', 'f'], '두 함수를 ∘ 로 이어 붙이자 (나중 함수가 왼쪽)', ordered=True, ws='16차시 STEP 1',
      ex=C('(g∘f)(x) 를 구할 때 먼저 계산하는 함수는?', ['f', 'g'], 0, '(g∘f)(x) = g(f(x)) — 오른쪽 f 먼저')),
 card('compose2', 16, S16, '순서를 바꾼 합성함수', 'f∘g', 'g 다음에 f (g∘f 와 순서가 반대)', 1, 23, 'o', ['f', 'g'], '이번에는 f 를 왼쪽에: f∘g', ordered=True, short='f∘g', ws='16차시 STEP 2',
      ex=C('f(x) = x + 1, g(x) = 2x 일 때 (f∘g)(3) 의 값은?', ['7', '8', '6', '5'], 0, 'g(3) = 6 을 먼저 구하고 f(6) = 6 + 1 = 7. (g∘f)(3) = g(4) = 8 과 다르다.')),
 card('compval', 16, S16, '합성함수의 값', '(g∘f)(x) = g(f(x))', 'f(x) 를 구해 g 에 넣는다', 2, 23, 'app', ['g', 'card:fval'], 'g 에 f(x) 를 통째로 넣으면', ordered=True, alt=[dict(op='app', **{'in': ['card:compose', 'x']})], ws='16차시 문제 1 · 2',
      ex=N('f(x) = x + 3, g(x) = 2x 일 때 (g∘f)(1) = ?', 8, 'f(1) = 4 → g(4) = 8')),
 card('noncomm', 16, S16, '교환법칙이 성립하지 않는다', 'g∘f ≠ f∘g', '순서를 바꾸면 결과가 달라진다', 2, 23, 'neq', ['card:compose', 'card:compose2'], 'g∘f 카드와 f∘g 카드를 견주면', short='교환법칙 ✕', ws='16차시 STEP 2',
      ex=C('f(x) = x + 3, g(x) = 2x 일 때 (g∘f)(1) 과 (f∘g)(1) 은?', ['8 과 5 — 다르다', '8 과 8 — 같다', '5 와 5 — 같다'], 0, '(g∘f)(1) = g(4) = 8 · (f∘g)(1) = f(2) = 5')),
 card('fassoc', 16, S16, '결합법칙', 'h∘(g∘f) = (h∘g)∘f', '묶는 자리를 바꿔도 결과가 같다', 3, 23, 'o', ['h', 'card:compose'], '합성함수 카드에 함수를 하나 더 이어 붙이자', ordered=True, ws='16차시 STEP 3',
      ex=O('함수의 합성에서 결합법칙은 성립한다.', True, '(h∘g)∘f = h∘(g∘f) — 순서는 그대로, 묶는 자리만 바뀐다')),
 # ── 17차시 역함수 ──
 card('inverse', 17, S17, '역함수', 'f⁻¹ : Y → X', '화살표를 거꾸로 돌린 함수 (f 가 일대일대응일 때만)', 2, 24, 'inv', ['card:bij'], '일대일대응인 함수에 ⁻¹ 을 붙이자', ws='17차시 STEP 1 · 문제 1',
      ex=C('함수 f 의 역함수가 존재하려면 f 는?', ['일대일함수', '일대일대응', '상수함수'], 1, '화살표를 거꾸로 해도 함수가 되려면 하나씩 짝지어져야 → 일대일대응')),
 card('invval', 17, S17, '역함수의 값', 'f(a) = b ⇔ f⁻¹(b) = a', '역함수 값은 원래 함수의 식으로 바꿔 쓴다', 2, 24, 'app', ['card:inverse', 'y'], '역함수에 y 를 넣으면 나오는 것은?', ordered=True, ws='17차시 문제 1 · 중단원 08',
      ex=N('f(x) = 2x + 6 일 때 f⁻¹(10) = ?', 2, 'f(a) = 10 → 2a + 6 = 10 → a = 2')),
 card('invinv', 17, S17, '역함수의 역함수', '(f⁻¹)⁻¹ = f', '두 번 뒤집으면 제자리', 2, 24, 'inv', ['card:inverse'], '역함수 카드에 ⁻¹ 을 한 번 더', ws='17차시 문제 1 (4)',
      ex=N('f(3) = 8 일 때 (f⁻¹)⁻¹(3) = ?', 8, '(f⁻¹)⁻¹ = f → f(3) = 8')),
 card('invcomp', 17, S17, '역함수와 합성', '(f⁻¹∘f)(x) = x', '갔다가 돌아오면 제자리 (항등함수)', 3, 24, 'o', ['card:inverse', 'f'], '역함수와 원래 함수를 ∘ 로 이으면', alt=[dict(op='o', **{'in': ['f', 'card:inverse']})], ws='17차시 문제 1 (2) (3)',
      ex=N('f 가 일대일대응일 때 (f⁻¹∘f)(9) = ?', 9, 'f 로 갔다가 f⁻¹ 로 돌아오면 제자리 → 9')),
 card('invfind', 17, S17, '역함수 구하기', 'x 에 대하여 풀고 x 와 y 를 바꾼다', 'y = f(x) → x = … → x 와 y 를 바꿈', 2, 25, 'swap', ['card:fval'], 'y = f(x) 에서 x 와 y 의 자리를 바꾸면', ws='17차시 STEP 2 · 문제 2',
      ex=C('y = 2x + 6 의 역함수는?', ['y = (1/2)x − 3', 'y = (1/2)x + 3', 'y = −2x − 6'], 0, 'x = (y − 6)/2 = (1/2)y − 3 → x 와 y 를 바꾸면 y = (1/2)x − 3')),
 card('invgraph', 17, S17, '역함수의 그래프', 'y = f(x) 와 y = f⁻¹(x) 는 직선 y = x 에 대하여 대칭', '점 (a, b) ↔ 점 (b, a)', 3, 25, 'swap', ['card:graph'], '그래프의 모든 점에서 x 와 y 를 바꾸면', short='y = x 대칭', ws='17차시 STEP 3 · 문제 4',
      ex=C('점 (2, 5) 가 y = f(x) 의 그래프 위에 있으면 y = f⁻¹(x) 의 그래프 위에 있는 점은?', ['(2, 5)', '(5, 2)', '(−2, −5)'], 1, '(a, b) ↔ (b, a) → (5, 2)')),
]
MISTAKES = {
 'then|SY,SX': '함수는 정의역이 왼쪽이에요: X → Y (X 의 원소마다 Y 의 원소가 하나씩)',
 'app|x,f': '순서가 거꾸로예요. 함수가 왼쪽, 넣는 값이 오른쪽: f(x)',
 'app|f,y': 'f 에 넣는 것은 정의역의 원소 x 예요. y 는 나오는 값!',
 'app|f,card:fval': 'f(f(x)) 도 합성이지만, 이번 카드는 g 에 f(x) 를 넣어요: g(f(x))',
 'app|card:fval,g': '순서가 거꾸로예요. 나중 함수 g 가 왼쪽: g(f(x))',
 'eq|card:compose,card:compose2': 'g∘f 와 f∘g 는 보통 같지 않아요. ≠ 로 놓아 보자 (교환법칙 ✕)',
 'neq|card:compose,card:compose': '같은 카드 두 장은 서로 같아요. f∘g 카드를 따로 만들어 견주자',
 'inv|f': '역함수는 f 가 일대일대응일 때만 있어요. 일대일대응 카드에 ⁻¹ 을 붙여 보자',
 'inv|card:inj': '일대일함수만으로는 모자라요. 치역 = 공역 까지 갖춘 일대일대응이어야 역함수가 있어요',
 'inv|card:func': '모든 함수에 역함수가 있는 것은 아니에요. 일대일대응일 때만!',
 'app|card:inverse,x': '역함수 f⁻¹ 는 Y 에서 X 로 가요. 넣는 것은 y !',
 'eq|card:range,card:domain': '치역은 공역과 견줘요 (둘 다 Y 쪽). 정의역은 X 쪽!',
 'eq|x,card:fval': '함숫값을 왼쪽에: f(x) = x',
 'eq|c,card:fval': '함숫값을 왼쪽에: f(x) = c',
 'ran|card:fval': '치역은 함수 카드(f : X → Y)에서 구해요',
 'swap|card:func': 'x ↔ y 는 식 y = f(x) 나 그래프에 써요',
 'o|card:compose,h': '이번 카드는 h 를 왼쪽에: h∘(g∘f)',
}
# ───────── 기호톡 ─────────
SYM_FUNC = [  # 새 기호 톡 줄 (함수 단원 · 14차시부터) · find = 문제 글에서 찾는 꼴(정규식 · 긴 낱말 먼저)
 dict(id='bij', sym='일대일대응', find='일대일대응', card='bij', easy='하나씩 딱 짝이 맞는다 (남는 것도 겹치는 것도 없음)', defn='일대일함수이고 치역과 공역이 같은 함수', memo='역함수가 있으려면 꼭 일대일대응'),
 dict(id='inj', sym='일대일함수', find='일대일함수', card='inj', easy='다른 것을 넣으면 다른 것이 나온다', defn='x₁ ≠ x₂ 이면 f(x₁) ≠ f(x₂) 인 함수', memo='가로선을 그어 그래프와 한 번만 만나면 일대일함수'),
 dict(id='ident', sym='항등함수', find='항등함수', card='ident', easy='넣은 그대로 나온다', defn='정의역의 각 원소에 자기 자신이 대응하는 함수 f(x) = x', memo='그래프는 직선 y = x'),
 dict(id='const', sym='상수함수', find='상수함수', card='const', easy='무엇을 넣어도 같은 값 하나', defn='정의역의 모든 원소에 공역의 원소 하나가 대응하는 함수 f(x) = c', memo='그래프는 가로선 · 치역의 원소는 1개'),
 dict(id='compose', sym='g∘f', find=r'[fgh]⁻¹∘[fgh]|[fgh]∘[fgh]⁻¹|[fgh]∘[fgh]|합성함수', card='compose', easy='f 하고 나서 g (오른쪽부터)', defn='(g∘f)(x) = g(f(x)) · f 와 g 의 합성함수', memo='g∘f ≠ f∘g (순서 중요) · 결합법칙은 성립'),
 dict(id='inverse', sym='f⁻¹', find=r'[fgh]⁻¹|역함수', card='inverse', easy='화살표를 거꾸로 돌린 함수', defn='f 가 일대일대응일 때 y = f(x) ⇔ x = f⁻¹(y)', memo='f⁻¹(b) = a ⇔ f(a) = b · (f⁻¹)⁻¹ = f'),
 dict(id='fmap', sym='f : X → Y', find=r'[fgh]\s*:\s*[A-Z]\s*→\s*[A-Z]', card='func', easy='X 의 원소마다 Y 의 원소를 하나씩 짝지음', defn='집합 X 의 각 원소에 집합 Y 의 원소가 오직 하나씩 대응할 때 이 대응을 X 에서 Y 로의 함수라 한다', memo='짝이 없는 원소 · 짝이 둘인 원소가 있으면 함수가 아님'),
 dict(id='domain', sym='정의역', find='정의역', card='domain', easy='화살표가 출발하는 집합', defn='함수 f : X → Y 에서 집합 X', memo='주어지지 않으면 함수가 정의되는 실수 전체'),
 dict(id='codomain', sym='공역', find='공역', card='codomain', easy='화살표가 도착할 수 있는 집합 전체', defn='함수 f : X → Y 에서 집합 Y', memo='치역은 공역의 부분집합'),
 dict(id='range', sym='치역', find='치역', card='range', easy='화살표를 실제로 받은 것만 모음', defn='함숫값 전체의 집합 {f(x) | x ∈ X}', memo='치역 ⊂ 공역'),
 dict(id='yx', sym='직선 y = x', find=r'직선\s*y\s*=\s*x(?![\w²])|y\s*=\s*x\s*(?:에 대하여 )?대칭', card='invgraph', easy='접으면 함수와 역함수가 겹치는 선', defn='y = f(x) 와 y = f⁻¹(x) 의 그래프는 직선 y = x 에 대하여 대칭', memo='(a, b) ↔ (b, a)'),
 dict(id='graph', sym='그래프', find='그래프', card='graph', easy='(x, f(x)) 를 좌표평면에 찍은 그림', defn='순서쌍 (x, f(x)) 전체의 집합', memo='세로선과 한 점에서만 만나야 함수의 그래프'),
 dict(id='fval', sym='f(x)', find=r'(?<![∘⁻¹A-Za-z가-힣)])[fgh]\((?=[^)]*\))', card='fval', easy='x 를 넣었을 때 나오는 값', defn='함수 f 에서 x 에 대응하는 Y 의 원소 = 함숫값', memo='f(2) = x 자리에 2 를 넣은 값'),
]
SET_MAP = {  # 카드 id → 기호톡 줄 id(있는 것) + 문제 글에서 찾을 글자(줄이 없는 것 = 새 줄 후보)
 'belong': (['in'], []), 'notbelong': (['notin'], []), 'roster': (['list'], []), 'builder': (['build'], []), 'venn': ([], ['벤 다이어그램']), 'count': (['n'], []), 'empty': (['empty'], []),
 'subset': (['sub'], []), 'notsubset': (['nsub'], []), 'self': (['sub'], []), 'emptysub': (['sub', 'empty'], []), 'equal': (['eq'], []), 'notequal': ([], ['≠']), 'proper': ([], ['진부분집합']),
 'allsub': (['sub'], ['부분집합']), 'subcount': (['2^n'], ['부분집합의 개수']), 'inter': (['cap'], []), 'union': (['cup'], []), 'disjoint': (['disj'], ['서로소']), 'incl': (['sub', 'cap', 'cup'], []),
 'unioncount': (['ncup'], []), 'disjointcount': (['disj', 'ncup'], []), 'commute': ([], ['교환법칙']), 'assoc': ([], ['결합법칙']), 'distrib': ([], ['분배법칙']),
 'comp': (['compl', 'U'], []), 'diff': (['diff'], []), 'diffcap': (['diff', 'compl'], []), 'compcomp': (['compl'], []), 'compprop': (['compl', 'U'], []),
 'demorgan1': (['compl'], ['드모르간']), 'demorgan2': (['compl'], ['드모르간']), 'compcount': (['n', 'compl'], []), 'diffcount': (['n', 'diff'], []),
 'prop': (['prop'], []), 'neg': (['neg'], []), 'cond': (['cond'], []), 'truth': (['truth'], []), 'negtruth': (['neg', 'truth'], []), 'all': (['all'], []), 'some': (['some'], []), 'allneg': (['all', 'some', 'neg'], []),
 'imp': (['imp'], []), 'conv': (['conv'], []), 'truthjudge': (['imp', 'truth'], []), 'counter': (['counter'], []), 'contra': (['contra'], []), 'contraeq': (['contra'], []),
 'suff': (['dimp', 'suff', 'need'], []), 'iff': (['iff'], []), 'iffset': (['iff', 'truth'], []), 'contraproof': (['contra'], ['증명']), 'contradiction': (['absurd'], ['모순']), 'absineq': (['absineq', 'amgm'], []),
}
ROW_PRIMARY = {  # 기호톡 줄 → 눌렀을 때 찜할 카드 하나(가장 바탕이 되는 카드) · 앞 13개 = 지금 SYM_CARD 그대로
 'in': 'belong', 'notin': 'notbelong', 'list': 'roster', 'build': 'builder', 'n': 'count', 'empty': 'empty', 'sub': 'subset', 'eq': 'equal', 'cap': 'inter', 'cup': 'union', 'disj': 'disjoint', 'compl': 'comp', 'diff': 'diff',
 'nsub': 'notsubset', 'ncup': 'unioncount', 'U': 'comp', '2^n': 'subcount',
 'neg': 'neg', 'prop': 'prop', 'cond': 'cond', 'truth': 'truth', 'imp': 'imp', 'counter': 'counter', 'conv': 'conv', 'contra': 'contra', 'all': 'all', 'some': 'some',
 'dimp': 'suff', 'suff': 'suff', 'need': 'suff', 'iff': 'iff', 'absurd': 'contradiction', 'absineq': 'absineq', 'amgm': 'absineq',
}

# ───────── 검산 ─────────
def verify():
    ok = []; byid = {c['id']: c for c in CARDS}; mats = {m['id'] for m in MATS}; ops = {o['id'] for o in OPS} | set(USE_OLD)
    seen = {}
    for c in CARDS:
        recs = [(c['op'], c['in'])] + [(a['op'], a['in']) for a in c.get('alt', [])]
        for op, inn in recs:
            assert op in ops, (c['id'], op)
            for t in inn:
                assert t in mats or (t.startswith('card:') and t[5:] in byid), (c['id'], t)
                if t.startswith('card:'): assert byid[t[5:]]['no'] <= c['no'], ('재료 카드가 더 뒤 차시', c['id'], t)
            keys = [f"{op}|{','.join(inn)}"] + ([] if c.get('ordered') else [f"{op}|{','.join(reversed(inn))}"])
            for k in keys:
                assert seen.get(k, c['id']) == c['id'], ('레시피 겹침', k, seen[k], c['id']); seen[k] = c['id']
        e = c['ex']
        if e['type'] == 'choice': assert len(set(e['choices'])) == len(e['choices']) and 0 <= e['answerIndex'] < len(e['choices'])
    for k in MISTAKES: assert k not in seen, ('실수 안내가 정답 레시피와 겹침', k)
    f = lambda x: 3 * x - 4; assert f(5) == 11 == byid['fval']['ex']['answer']
    assert {2 * x + 1 for x in (1, 2, 3)} == {3, 5, 7}
    assert all(x == x * x for x in (0, 1))                                   # feq: 정의역 {0, 1} 에서 x = x²
    assert [(x, x + 2) for x in (0, 1, 2)] == [(0, 2), (1, 3), (2, 4)]
    assert (-1) ** 2 - 3 == 1 ** 2 - 3 == -2
    ff = lambda x: x + 3; gg = lambda x: 2 * x
    assert gg(ff(1)) == 8 == byid['compval']['ex']['answer'] and ff(gg(1)) == 5
    assert 2 * 2 + 6 == 10 and byid['invval']['ex']['answer'] == 2
    inv = lambda x: Fr(1, 2) * x - 3; assert all(inv(2 * x + 6) == x for x in (-2, 0, 1, 5))
    assert not all(Fr(1, 2) * (2 * x + 6) + 3 == x for x in (0, 1)) and not all(-2 * (2 * x + 6) - 6 == x for x in (0, 1))
    return len(seen)

if __name__ == '__main__':
    nrec = verify()
    unit = dict(_note='모루 함수 단원 (14 ~ 17차시) · unit-set.js 의 MATS · OPS · CARDS · MISTAKES 에 그대로 더하는 꼴 · art 16 ~ 25 = 새 그림 시트(작업대 「⚒ 모루 함수」) · page = 교과서 쪽(❓ 채울 것) · ws = 학습지 자리(참고 · 게임은 안 읽음)',
                MATS=MATS, OPS=OPS, USES_EXISTING_OPS=USE_OLD, CARDS=CARDS, MISTAKES=MISTAKES)
    json.dump(unit, open('unit-func.json', 'w'), ensure_ascii=False, indent=1)
    cards_map = {cid: dict(rows=r, strings=s) for cid, (r, s) in SET_MAP.items()}
    for c in CARDS: cards_map[c['id']] = dict(rows=[r['id'] for r in SYM_FUNC if r['card'] == c['id']], strings=[])
    extra = {'feq': ['서로 같은 함수'], 'onto': ['치역', '공역'], 'compval': ['compose'], 'compose2': ['compose'], 'noncomm': ['compose', '교환법칙'], 'fassoc': ['compose', '결합법칙'], 'invval': ['inverse'], 'invinv': ['inverse'], 'invcomp': ['inverse', 'compose'], 'invfind': ['inverse'], 'invgraph': ['yx', 'inverse', 'graph']}
    fr = {r['id'] for r in SYM_FUNC}
    for cid, xs in extra.items():
        for x in xs:
            (cards_map[cid]['rows'] if x in fr else cards_map[cid]['strings']).append(x) if x not in cards_map[cid]['rows'] + cards_map[cid]['strings'] else None
    rowp = dict(ROW_PRIMARY); rowp.update({r['id']: r['card'] for r in SYM_FUNC})
    json.dump(dict(_note='기호톡 줄(row) → 눌렀을 때 찜할 카드(primary) · 카드 → 그 카드로 이어지는 줄(rows)과 줄이 아직 없는 글자(strings = 새 줄 후보). 함수 줄(newRows)은 symtalk.ts 에 더할 것 · find = 정규식(위에서부터 · 긴 낱말 먼저).',
                   rowToCard=rowp, cards=cards_map, newRows=[{**{k: v for k, v in r.items() if k != 'defn'}, 'def': r['defn']} for r in SYM_FUNC]), open('symtalk-map.json', 'w'), ensure_ascii=False, indent=1)
    print(f"카드 {len(CARDS)}장 · 레시피 {nrec}개(순서 바꾼 것 포함) · 실수 안내 {len(MISTAKES)}줄 · 기호톡 새 줄 {len(SYM_FUNC)} · 줄→카드 {len(rowp)} · 카드 {len(cards_map)}장 연결 · 검산 통과")
    G = {1: '일반', 2: '매직', 3: '레어'}; symof = {m['id']: m['sym'] for m in MATS}
    opsym = {o['id']: o['sym'] for o in OPS}; opsym.update({'then': '→', 'eq': '=', 'neq': '≠', 'and': '이고', 'brace': '{ }'})
    nm = {c['id']: c['name'] for c in CARDS}
    def rec(op, inn, ordered):
        t = [f"[{nm[i[5:]]}]" if i.startswith('card:') else symof[i] for i in inn]
        s = f"{opsym[op]} ← {t[0]}" if len(t) == 1 else f"{t[0]} 〔{opsym[op]}〕 {t[1]}"
        return s + (' · 순서 엄격' if ordered else '')
    L = ["# ⚒ 모루 함수 단원 카드 · 레시피 v1 (14 ~ 17차시 · 🌊 설계 방 · 묶음 #7 · 2026-11-21)", "",
         "> 꼴 = 베타 `forge/unit-set.js` 그대로(MATS · OPS · CARDS · MISTAKES) → `unit-func.json`. **초안 · 선생님 확인 전.**",
         "> 지킨 것: 엄격 연성(모든 카드 연산 한 번 이상 · 순서 · 자리가 뜻을 바꿈) · 교과서 용어 · 기호 · 예제 숫자는 14 ~ 17차시 학습지와 겹치지 않게 · 예제 정답은 `build.py` 가 따로 계산해 맞춤.", "",
         f"## 1. 한눈에", "", f"- 카드 **{len(CARDS)}장**: 14차시 6 · 15차시 6 · 16차시 4 · 17차시 6 / 등급 일반 {sum(c['grade']==1 for c in CARDS)} · 매직 {sum(c['grade']==2 for c in CARDS)} · 레어 {sum(c['grade']==3 for c in CARDS)}",
         f"- 새 재료 {len(MATS)}개 · 새 연산 {len(OPS)}개 · 있는 연산 5개(→ · = · ≠ · 이고 · {{ }})를 그대로 씀", "- 가장 긴 연성 사슬: 함수 → 함숫값 → 일대일함수 + (치역 = 공역) → **일대일대응 → 역함수** → 역함수와 합성 (「역함수는 일대일대응일 때만」이 레시피에 박혀 있음)", "",
         "## 2. 재료 · 연산", "", "| 재료 | 뜻 |", "|---|---|"] + [f"| {m['sym']} | {m['tip']} |" for m in MATS] + ["", "| 새 연산 | 열리는 차시 | 칸 |", "|---|---|---|"] + [f"| {o['sym']} | {o['no']} | {'한 칸' if o.get('unary') else '두 칸'} |" for o in OPS]
    L += ["", "- 재료 id 는 있는 것과 안 겹치게: 집합 X · Y = `SX` · `SY`(있는 `X` = 모순 · `I` = 부등식 과 다름).", "- 「( )에 넣기」 = f 에 x 를 넣는 연산(함숫값) · g 에 f(x) 를 넣으면 합성함수의 값 · f⁻¹ 에 y 를 넣으면 역함수의 값 — 한 연산이 자리마다 다른 카드를 만듦.", "",
          "## 3. 카드 · 레시피", "", "| 차시 | 카드 | 수식 | 등급 | 레시피 | 다른 레시피 | 힌트 | 학습지 자리 |", "|---|---|---|---|---|---|---|---|"]
    for c in CARDS:
        alt = ' / '.join(rec(a['op'], a['in'], False) for a in c.get('alt', [])) or '—'
        L.append(f"| {c['no']} | {c['name']} | {c['fm'].replace('|', '｜')} | {G[c['grade']]} | {rec(c['op'], c['in'], c.get('ordered'))} | {alt} | {c['hint']} | {c['ws']} |")
    L += ["", "## 4. 예제 (처음 만든 카드는 예제를 맞혀야 완성) · 검산", "", "| 카드 | 예제 | 정답 | 검산 |", "|---|---|---|---|"]
    for c in CARDS:
        e = c['ex']; a = e['choices'][e['answerIndex']] if e['type'] == 'choice' else ('○' if e['answer'] is True else '✕' if e['answer'] is False else e['answer'])
        chk = '계산' if c['id'] in ('fval', 'range', 'feq', 'graph', 'inj', 'compval', 'noncomm', 'invval', 'invfind', 'invgraph', 'ident', 'const', 'invinv', 'invcomp') else '뜻(정의)'
        L.append(f"| {c['name']} | {e['question']} | {a} | {chk} |")
    L += ["", "- 「계산」 = `build.py verify()` 가 파이썬으로 다시 계산(함숫값 · 치역 · 합성 · 역함수 · 순서쌍) · 「뜻」 = 정의를 묻는 문항이라 교과서 문장과 대조.", f"- 레시피 겹침 검사: 서로 다른 카드가 같은 (연산, 재료)를 쓰지 않음 · 실수 안내가 정답 레시피와 겹치지 않음 · 재료 카드는 같은 차시이거나 앞 차시 — 통과(레시피 {nrec}개).", "",
          "## 5. 실수 안내 (틀린 조합을 올렸을 때)", "", "| 올린 것 | 안내 |", "|---|---|"]
    for k, v in MISTAKES.items():
        op, inn = k.split('|'); t = [f"[{nm[i[5:]]}]" if i.startswith('card:') else symof.get(i, i) for i in inn.split(',')]
        L.append(f"| {t[0]} 〔{opsym[op]}〕 {t[1]}" + f" | {v} |" if len(t) == 2 else f"| {opsym[op]} ← {t[0]} | {v} |")
    L += ["", "## 6. 기호톡 연결 (`symtalk-map.json`)", "", "- 지금 = 기호톡 줄 13개만 카드와 이어짐(`symcard.ts`) · 함수 줄은 아직 없음.", f"- 이번 = **함수 새 줄 {len(SYM_FUNC)}개**(문제 글에서 찾는 꼴 포함) + **집합 · 명제 줄 34개 전부**에 「눌렀을 때 찜할 카드 하나」 + **카드 {len(cards_map)}장 전부**에 「이 카드로 이어지는 줄 · 글자」.", "",
          "### 함수 새 줄", "", "| 줄 | 문제 글에서 찾는 꼴 | 찜할 카드 | 쉬운 말 |", "|---|---|---|---|"]
    L += [f"| {r['sym']} | `{r['find']}` | {nm[r['card']]} | {r['easy']} |" for r in SYM_FUNC]
    L += ["", "- 찾는 순서 = 표 위에서부터(긴 낱말 먼저: 일대일대응 → 일대일함수 · 합성함수 · 역함수 · 항등함수 · 상수함수 → 정의역 …) · 「f(x)」는 (g∘f)(x) 나 f⁻¹(x) 의 일부가 아닐 때만.", "- 「함수」 한 낱말은 줄로 안 만듦(거의 모든 문제 글에 나와 화면이 온통 밑줄이 됨) — 「f : X → Y」 꼴만.", "",
          "### 줄이 아직 없는 카드(새 줄 후보)", "", "| 카드 | 문제 글에서 찾을 글자 |", "|---|---|"]
    setnm = {}
    for cid, v in cards_map.items():
        if v['strings'] and not v['rows']: L.append(f"| {nm.get(cid, cid)} | {' · '.join(v['strings'])} |")
    L += ["", "- 집합 · 명제 카드 이름은 `unit-set.js` id 그대로 적음(venn 벤 다이어그램 · notequal 서로 같지 않은 집합 · proper 진부분집합 · commute 교환법칙 · assoc 결합법칙 · distrib 분배법칙).", "- 한 줄을 누르면 카드는 **하나만** 찜(가장 바탕 카드) — 여러 장이 한꺼번에 찜되면 모루 배너가 넘침. 나머지 연결(cards.rows)은 「이 카드를 만들면 이 기호가 나오는 문제에 도움」 표시에 씀.", "",
          "## 7. 카드 그림", "", "- 있는 그림 시트(`card-arts-v2.webp` 8 × 2 = 16칸 · 0 ~ 15)는 집합 · 명제가 다 씀 → 함수용 **새 시트 10칸(16 ~ 25)** 이 필요.", "- 칸: 16 대응 화살표(두 타원) · 17 함숫값 기계 · 18 정의역 · 공역 · 치역 · 19 서로 같은 함수(쌍둥이 기계) · 20 그래프 · 21 일대일 짝 · 22 항등 · 상수 · 23 합성(기계 둘) · 24 역함수(되돌아오는 화살표) · 25 y = x 대칭 거울", "- 주문 카드 = 작업대 「⚒ 모루 함수」 탭(올리면 메인에 「🎨 올림」).", "",
          "## 8. 선생님이 정한 것 (2026-11-21)", "", "1. **역함수 사슬 = 그대로**(일대일대응 → 역함수) + **지름길 안내**: 재료 카드가 없으면 「먼저 만들 카드: ○○」를 눌러 바로 그 카드로 가게 한다(손발: 모루 화면에 더할 것).", "2. **f∘g 카드를 따로 만든다**(compose2) → 「교환법칙 ✕」 = g∘f 카드 ≠ f∘g 카드. 카드 23장.", "3. 구성 · 등급 = 초안대로.", "4. 교과서 쪽수(page) = 빈칸으로 먼저 넣고, 선생님이 나중에 한 번에 알려 주시면 채운다.", "", "남은 컨펌: 기호톡 함수 줄 13개의 쉬운 말 · 「함수」 한 낱말은 줄로 안 만드는 것"]
    open('FORGE-FUNC-v1.md', 'w').write("\n".join(L) + "\n")
