# 6차시 레이드용 학습지 생성기 · v3 (2026-11-05 사용자 「진행」: 명제 STEP 4~6 → 7차시로 · 집합 중단원 마무리(교과서 78~79쪽) 4문항 + 형성평가에 중단원 4문항 · 첫 시도 = 교과서 그대로) · 이전 v2 (2026-11-04 사용자 확정: 보강 칸 빼기 · ★ 칸만 게임 · 보강 ③ → 문제 4-2 · STEP 6 = 사각형의 포함 관계와 명제 · 형성평가 6문항)
import os
D = os.path.dirname(os.path.abspath(__file__))
css = open(os.path.join(D, 'style.css.txt'), encoding='utf-8').read()
css = css.replace('</style>', '''
.mini { font-size: 8.4pt; }
.cols2 { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
.tight { gap: 4px !important; }
.law { text-align: center; font-weight: 700; font-size: 10.2pt; line-height: 1.6; }
.syl { border-collapse: collapse; margin: 1px 0 1px 12px; font-size: 9.3pt; }
.syl th, .syl td { border: 0 !important; text-align: left; padding: 0 6px 1px 0; }
.syl th { width: 13mm; color: #2f5bb7; font-weight: 700; border-right: 1.2px solid #2f5bb7 !important; padding-right: 6px; }
.syl td { padding-left: 8px; }
.opts { padding-left: 12px; }
.pick { list-style: none; margin: 1px 0 0 12px; padding: 0; font-size: 9.3pt; line-height: 1.5; text-align: left; }
.pick li { text-align: left; }
</style>''')

SH = '#cfd9ee'   # 색칠 색
def u_rect(w=200, h=112):
    return f'<rect x="4" y="4" width="{w-8}" height="{h-8}" fill="none" stroke="#1a1a1a" stroke-width="1.2"/><text x="{w-16}" y="18" font-size="11" font-style="italic">U</text>'


def venn_out(label='(A ∪ B)<tspan baseline-shift="super" font-size="7">C</tspan>'):  # 두 원 바깥 색칠
    return f'''<svg viewBox="0 0 200 112" width="100%"><path d="M4,4 H196 V108 H4 Z M78,56 m-36,0 a36,36 0 1,0 72,0 a36,36 0 1,0 -72,0 M122,56 m-36,0 a36,36 0 1,0 72,0 a36,36 0 1,0 -72,0" fill="{SH}" fill-rule="evenodd"/>
<circle cx="78" cy="56" r="36" fill="#fff"/><circle cx="122" cy="56" r="36" fill="#fff"/>{u_rect()}
<circle cx="78" cy="56" r="36" fill="none" stroke="#1a1a1a" stroke-width="1.2"/><circle cx="122" cy="56" r="36" fill="none" stroke="#1a1a1a" stroke-width="1.2"/>
<text x="46" y="26" font-size="12" font-style="italic">A</text><text x="148" y="26" font-size="12" font-style="italic">B</text><text x="100" y="104" font-size="9.5" text-anchor="middle">색칠 = {label}</text></svg>'''

ln = lambda mm: f'<span class="ln" style="min-width:{mm}mm"></span>'
m = lambda t: f'<span class="math">{t}</span>'
G = lambda t: f'<span class="tag t-game">게임: {t}</span>'
C = '<sup>C</sup>'

ox = lambda: '( 참 / 거짓 )'
head = '''<div class="head">
    <div class="school"><b>한국항만물류고등학교</b><span>공통수학2</span></div>
    <div class="title"><h1>학습과정 · 6차시</h1><p>공통수학2 Ⅱ. 집합과 명제 1. 집합 04. 드모르간의 법칙 · 중단원 마무리 (6차시) · 레이드용 v3</p></div>
    <div class="name"><div>학년 &nbsp;&nbsp; 반 &nbsp;&nbsp; 번</div><div>이름</div></div>
  </div>'''

S = '<b class="redc">★</b>'  # v2: 게임(몬스터)에 넣는 칸 — ★ 없는 칸은 학습지에서만 (중간 계산)

p1_left = f'''
      <div><span class="pill p-blue">STEP 1 드모르간의 법칙</span> <span class="mini">(지난 시간 Aᶜ · A − B 는 말로 복습)</span></div>
      <div style="display:flex;gap:6px;align-items:center"><div class="box" style="flex:1"><div class="law">(A ∪ B){C} = A{C} ∩ B{C}<br>(A ∩ B){C} = A{C} ∪ B{C}</div><div class="mini">괄호를 풀 때 <b>C가 각각 붙고, ∪ ↔ ∩ 가 바뀐다!</b></div></div><div style="width:34%">{venn_out()}</div></div>
      <div><b class="blue">문제 1)</b> U = {{1, 2, 3, 4, 5, 6}}, {m('A')} = {{1, 2, 3}}, {m('B')} = {{3, 4}}일 때 {G('몬스터 1 · ★ 칸만')}</div>
      <div class="q">(1) A ∪ B = {ln(22)} → {S}(A ∪ B){C} = {ln(16)}</div>
      <div class="q">(2) A{C} = {ln(16)}, B{C} = {ln(18)} → {S}A{C} ∩ B{C} = {ln(14)}</div>
      <div class="q">(3) {S}(A ∩ B){C} = {ln(22)}, &nbsp;{S}A{C} ∪ B{C} = {ln(22)}</div>
      <div><span class="pill p-blue">STEP 2 여집합 · 차집합의 원소의 개수</span></div>
      <div class="box" style="line-height:1.8">① n(A{C}) = n(U) − n(A)<br>② n(A − B) = n(A) − n(A ∩ B) = n(A ∪ B) − n(B)</div>
      <div><b class="blue">문제 2)</b> n(U) = 30, n(A) = 12, n(B) = 15, n(A ∩ B) = 5일 때 {G('몬스터 2 · ★ 칸만')}</div>
      <div class="q">(1) {S}n(A{C}) = {ln(10)} &nbsp; (2) {S}n(A − B) = {ln(10)} &nbsp; (3) n(B − A) = {ln(10)}</div>
      <div class="q">(4) n(A ∪ B) = {ln(10)} &nbsp; (5) {S}n(A{C} ∩ B{C}) = n((A ∪ B){C}) = {ln(10)}</div>
      <div><span class="pill p-blue">STEP 3 생활 속 문제</span></div>
      <div class="box mini">벤 다이어그램의 칸에 숫자를 직접 써 넣으면 쉽다: 「둘 다」 칸부터!</div>
      <div><b class="blue">문제 3)</b> 1학년 40명 중 축구 동아리 18명, 밴드 동아리 12명, 둘 다 5명이다. {G('몬스터 3 · ★ 칸만')}</div>
      <div class="q">(1) {S}축구 또는 밴드 동아리 학생 수 : {ln(10)}명</div>
      <div class="q">(2) 축구만 하는 학생 수 : {ln(10)}명 &nbsp; (3) {S}둘 다 하지 않는 학생 수 : {ln(10)}명</div>
      <div class="box" style="flex:1;border-style:dashed;color:#777;font-size:8.5pt">✏ 풀이 · 메모</div>
'''


T = lambda n: f'<span class="mini" style="color:#8a5a00">(교과서 78~79쪽 {n}번)</span>'
p1_right = f"""
      <div><span class="pill p-blue">중단원 마무리 · 집합 한 장 정리</span></div>
      <div class="box mini" style="line-height:1.6">
        · 포함 : A 의 모든 원소가 B 에 속하면 A ⊂ B &nbsp;·&nbsp; 원소 n 개 → 부분집합 2<sup>n</sup> 개<br>
        · 서로소 : A ∩ B = ∅ &nbsp;·&nbsp; A ∩ B = B ⇔ B ⊂ A &nbsp;·&nbsp; A ∪ B = B ⇔ A ⊂ B<br>
        · n(A ∪ B) = n(A) + n(B) − n(A ∩ B) &nbsp;·&nbsp; n(A{C}) = n(U) − n(A)<br>
        · 드모르간 : (A ∪ B){C} = A{C} ∩ B{C}, &nbsp;(A ∩ B){C} = A{C} ∪ B{C}</div>
      <div><b class="blue">문제 4)</b> 두 집합 A = {{x | x는 8의 약수}}, B = {{x | x는 20 이하의 4의 배수}}에 대하여 A ∩ X = ∅ 과 B ∪ X = B 를 만족시키는 집합 X 의 개수를 구하시오. {T('07')} {G('몬스터 4 · ★ 칸만')}</div>
      <div class="q">(1) A = {ln(22)}, &nbsp;B = {ln(26)}</div>
      <div class="q">(2) B ∪ X = B → X ⊂ ( A / B ), &nbsp;A ∩ X = ∅ → X 는 A 와 {ln(10)}</div>
      <div class="q">(3) 그래서 X ⊂ B − A = {ln(22)} &nbsp;→ {S}X 의 개수 = 2<sup>□</sup> = {ln(10)}</div>
      <div><b class="blue">문제 5)</b> 두 집합 A = {{x² + 2x, 4, 6}}, B = {{x, 6}}에 대하여 A ∩ B = B 를 만족시키는 모든 정수 x 의 값을 구하시오. {T('08')} {G('몬스터 5 · ★ 칸만')}</div>
      <div class="q">(1) A ∩ B = B → B ⊂ A → x 는 A 의 원소 (단, x ≠ 6)</div>
      <div class="q">(2) x = 4 &nbsp;또는 &nbsp;x = x² + 2x → x² + x = 0 → x = {ln(8)}, {ln(8)}</div>
      <div class="q">(3) {S}x 의 값 모두 : {ln(24)}</div>
      <div class="box" style="flex:1;border-style:dashed;color:#777;font-size:8.5pt">✏ 풀이 · 메모</div>
"""

VENN2 = """<svg viewBox="0 0 200 100" width="100%"><rect x="4" y="4" width="192" height="92" fill="none" stroke="#1a1a1a" stroke-width="1.2"/><text x="182" y="18" font-size="11" font-style="italic">U</text>
<circle cx="80" cy="52" r="34" fill="#eef3ff" fill-opacity=".8" stroke="#1a1a1a" stroke-width="1.2"/><circle cx="120" cy="52" r="34" fill="#fff4d6" fill-opacity=".7" stroke="#1a1a1a" stroke-width="1.2"/>
<text x="54" y="26" font-size="11" font-style="italic">A</text><text x="140" y="26" font-size="11" font-style="italic">B</text><text x="100" y="56" font-size="9.5" text-anchor="middle">둘 다</text></svg>"""
p2_left = f"""
      <div><b class="blue">문제 6)</b> 어느 자전거 동아리 회원 40명을 대상으로 두 코스 A와 B를 다녀온 경험이 있는 회원 수를 조사하였더니 A 코스는 28명이고 B 코스는 21명이었다. 두 코스 A와 B를 모두 다녀온 회원 수의 최댓값과 최솟값을 구하시오. {T('11')} {G('몬스터 6 · ★ 칸만')}</div>
      <div style="width:62%;margin:0 auto">{VENN2}</div>
      <div class="q">(1) n(A ∩ B) = 28 + 21 − n(A ∪ B) = {ln(8)} − n(A ∪ B)</div>
      <div class="q">(2) n(A ∪ B) 는 가장 작으면 {ln(8)} (B 가 A 안에 쏙), 가장 크면 {ln(8)} (전체)</div>
      <div class="q">(3) {S}최댓값 {ln(10)}명, &nbsp;{S}최솟값 {ln(10)}명</div>
      <div><b class="blue">문제 7)</b> 100 미만의 자연수 중에서 7의 배수가 아니거나 5로 나누었을 때의 나머지가 3이 아닌 자연수의 개수를 구하시오. {T('12')} {G('몬스터 7 · ★ 칸만')}</div>
      <div class="q">(1) U = 100 미만의 자연수 → n(U) = {ln(8)}, &nbsp;A = 7의 배수, B = 5로 나눈 나머지가 3</div>
      <div class="q">(2) 「A 가 아니거나 B 가 아닌」 = A{C} ∪ B{C} = ( {ln(14)} ){C} &nbsp;← 드모르간!</div>
      <div class="q">(3) A ∩ B = 7의 배수 중 5로 나눈 나머지가 3 = {{ {ln(8)}, {ln(8)}, {ln(8)} }}</div>
      <div class="q">(4) {S}구하는 개수 = n(U) − n(A ∩ B) = {ln(18)}</div>
      <div class="box" style="flex:1;border-style:dashed;color:#777;font-size:8.5pt">✏ 풀이 · 메모</div>
"""

W = lambda h=12: f'<div style="height:{h}mm"></div>'
p2_right = f"""
      <div class="grn" style="flex:1;display:flex;flex-direction:column">
        <div class="h grnc" style="font-size:10.5pt">✔ 6차시 형성평가 <span style="font-size:8.5pt;color:#555;font-weight:400">(혼자 풀기 · 6문항)</span> <span class="tag t-boss">게임: 보스</span></div>
        <div class="q">1. (A ∪ B){C} = A{C} ( &nbsp;&nbsp;&nbsp; ) B{C} &nbsp;(∪ 또는 ∩)</div>{W(8)}
        <div class="q">2. n(U) = 20, n(A) = 7 일 때 n(A{C}) = ?</div>{W(10)}
        <div class="q">3. 두 집합 A 와 B 에 대하여 n(A) = 18, n(B) = 23, n(A ∪ B) = 30 일 때, n(A ∩ B) 를 구하시오. {T('04')}</div>{W(12)}
        <div class="q">4. 전체집합 U = {{1, 2, 3, …, 10}}의 두 부분집합 A = {{1, 5, 9, 10}}, B = {{x | x는 10의 약수}}에 대하여 A − B 를 구하시오. {T('05')}</div>{W(12)}
        <div class="q">5. 전체집합 U = {{1, 2, 3, 4, 5}}의 부분집합 중에서 집합 A = {{1, 2, 4}}와 서로소인 집합을 모두 구하시오. {T('06')}</div>{W(12)}
        <div class="q">6. 전체집합 U = {{x | x는 30 이하의 자연수}}의 두 부분집합 A = {{x | x는 6의 배수}}, B = {{x | x는 24의 약수}}에 대하여 n(A{C} ∩ B{C}) 를 구하시오. {T('10')}</div>{W(14)}
        <div style="font-size:8.5pt;margin-top:auto">맞은 개수 {ln(10)} / 6 &nbsp;어려웠던 부분<br>□ 드모르간 □ 원소의 개수 □ 서로소 · 포함 □ 미지수 □ 최대 · 최소 □ 「아니거나」</div>
      </div>
      <div class="pur mini">🏰 <b>더 해 보고 싶다면</b> — 수업 뒤 캠프의 <b>성채던전 1층</b>: 중단원 12문항(숫자를 바꾼 문제) · 🎯 허수아비 형성평가 재대결 &nbsp;|&nbsp; 다음 시간 = <b>명제와 조건 (7차시)</b></div>
      <div style="display:flex;justify-content:flex-end"><div style="width:34mm;height:22mm;border:1.2px solid #1a1a1a;text-align:center;font-size:8pt;padding-top:2px">확인 도장</div></div>
"""

goal = '<div class="goal"><b>학습목표</b> ① 드모르간의 법칙을 이해하고 이용할 수 있다. ② 여집합·차집합의 원소의 개수를 구할 수 있다. ③ 집합 단원(중단원 마무리) 문제를 해결할 수 있다.</div>'
css = css.replace('</style>', '.pt { border-collapse: collapse; width: 100%; font-size: 9.6pt; } .pt th, .pt td { border: 1px solid #999; padding: 3px 6px; text-align: left; vertical-align: top; } .pt th { background: #eef3ff; }</style>')

prop = f"""<div class="page">{head}
  <div style="padding:4mm 2mm">
  <h2 style="margin:0 0 3mm;font-size:15pt">6차시 변경 제안 (레이드용 v2 → v3) · 2026-11-05</h2>
  <table class="pt"><tr><th>바뀌는 것</th><th>v2 (지금)</th><th>v3 (제안)</th></tr>
    <tr><td>명제 STEP 4~6</td><td>명제 · 명제의 부정 · 사각형의 포함 관계와 명제 (몬스터 4 · 4-2 · 5 · 6)</td><td><b>7차시로 옮김</b> (학습지에 집합 · 명제를 섞지 않음)</td></tr>
    <tr><td>오른쪽 · 2쪽</td><td>명제</td><td><b>집합 중단원 마무리</b> (교과서 78~79쪽): 집합 한 장 정리 + 몬스터 4문제 = 07 · 08 · 11 · 12 (선생님 보충 설명이 필요한 문항)</td></tr>
    <tr><td>형성평가 6문항</td><td>드모르간 2 · n(A<sup>C</sup>) 1 · 명제 3</td><td>드모르간 1 · n(A<sup>C</sup>) 1 · <b>중단원 04 · 05 · 06 · 10</b></td></tr>
    <tr><td>그대로</td><td colspan="2">STEP 1 드모르간 · STEP 2 원소의 개수 · STEP 3 생활 속 문제 (몬스터 1 · 2 · 3) · 확인 도장 · ★ 칸만 게임</td></tr></table>
  <h3 style="margin:5mm 0 2mm">게임에 반영할 때</h3>
  <ul style="line-height:1.7;margin:0;padding-left:5mm">
    <li>중단원 문항은 <b>첫 시도 = 교과서 원문 그대로</b> (사용자 결정 · 11-03 「게임은 고친 숫자」 원칙의 예외) · 재도전 3번 = 숫자를 바꾼 새 문제 (성채 1층 생성기)</li>
    <li>서술형 07 · 11 은 게임에서 답만 입력 · 풀이는 학습지에</li>
    <li>형성평가도 문항마다 4번 (첫 시도 = 학습지 · 재도전 = 숫자 바뀐 새 문제)</li>
    <li>성채 1층 (중단원 12방)은 숫자를 바꾼 문제 그대로 → 수업 뒤 복습</li>
    <li>이미 6차시(v2)를 한 1-6반의 기록 · 오답노트는 그대로 남김</li>
    <li>명제 단원은 7 명제와 조건 · 8 참 · 거짓 · 역과 대우 · 대우로 증명 맛보기 · 9 충분 · 필요조건 · 10 귀류법 · 절대부등식(줄인 판)</li></ul>
  <h3 style="margin:5mm 0 2mm">정답 (교과서 해설 148~149쪽으로 검산)</h3>
  <table class="pt"><tr><th>문항</th><th>정답</th><th>문항</th><th>정답</th></tr>
    <tr><td>문제 4 (07)</td><td>8 (X ⊂ {{12, 16, 20}})</td><td>형성평가 3 (04)</td><td>11</td></tr>
    <tr><td>문제 5 (08)</td><td>−1, 0, 4</td><td>형성평가 4 (05)</td><td>{{9}}</td></tr>
    <tr><td>문제 6 (11)</td><td>최댓값 21 · 최솟값 9</td><td>형성평가 5 (06)</td><td>∅, {{3}}, {{5}}, {{3, 5}}</td></tr>
    <tr><td>문제 7 (12)</td><td>96 (99 − 3)</td><td>형성평가 6 (10)</td><td>20</td></tr></table>
  <p style="margin-top:5mm;color:#555">다음 장부터 = v3 학습지 시안 2쪽. 컨펌하시면 「6차시 학습지 컨펌」 흐름으로 레이드용 v3 PDF · 게임 차시 파일 · 검산 시험을 만듭니다.</p>
  </div><div class="foot">- 변경 제안 -</div></div>"""
html = prop_html = None
html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>학습과정 6차시 레이드용 v3</title>{css}</head><body>
{prop}
<div class="page">{head}{goal}
  <div class="cols"><div class="col" id="c1">{p1_left}</div><div class="col tight" id="c2">{p1_right}</div></div>
  <div class="foot">- 6차시 (1/2) -</div></div>
<div class="page">{head}<div style="height:6px"></div>
  <div class="cols"><div class="col" id="c3" style="height:234mm">{p2_left}</div><div class="col" id="c4" style="height:234mm">{p2_right}</div></div>
  <div class="foot">- 6차시 (2/2) -</div></div>
</body></html>'''
open(os.path.join(D, 'ws6-raid-v3.html'), 'w', encoding='utf-8').write(html)
print('ok')
