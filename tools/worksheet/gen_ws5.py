# 5차시 레이드용 학습지 v1 생성기 (4차시 v2 양식)
import os
D = os.path.dirname(os.path.abspath(__file__))
css = open(os.path.join(D, 'style.css.txt'), encoding='utf-8').read()
css = css.replace('</style>', '''
.mini { font-size: 8.4pt; }
.cols2 { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
.tight { gap: 4px !important; }
.law { text-align: center; font-weight: 700; font-size: 10.2pt; line-height: 1.6; }
</style>''')

SH = '#cfd9ee'   # 색칠 색
def u_rect(w=200, h=112):
    return f'<rect x="4" y="4" width="{w-8}" height="{h-8}" fill="none" stroke="#1a1a1a" stroke-width="1.2"/><text x="{w-16}" y="18" font-size="11" font-style="italic">U</text>'

def venn_comp():  # U 안의 A 바깥 색칠 = A^C
    return f'''<svg viewBox="0 0 200 112" width="100%"><path d="M4,4 H196 V108 H4 Z M100,56 m-34,0 a34,34 0 1,0 68,0 a34,34 0 1,0 -68,0" fill="{SH}" fill-rule="evenodd"/>
{u_rect()}<circle cx="100" cy="56" r="34" fill="#fff" stroke="#1a1a1a" stroke-width="1.2"/><text x="100" y="60" font-size="12" font-style="italic" text-anchor="middle">A</text>
<text x="150" y="96" font-size="9.5">색칠 = A<tspan baseline-shift="super" font-size="7">C</tspan></text></svg>'''

def venn2(shade='', label=''):  # shade: 'AmB'(A−B) / '' 빈 그림
    s = ''
    if shade == 'AmB':
        s = f'<circle cx="78" cy="56" r="36" fill="{SH}"/><circle cx="122" cy="56" r="36" fill="#fff"/>'
    return f'''<svg viewBox="0 0 200 112" width="100%">{u_rect()}{s}
<circle cx="78" cy="56" r="36" fill="none" stroke="#1a1a1a" stroke-width="1.2"/><circle cx="122" cy="56" r="36" fill="none" stroke="#1a1a1a" stroke-width="1.2"/>
<text x="46" y="26" font-size="12" font-style="italic">A</text><text x="148" y="26" font-size="12" font-style="italic">B</text>{f'<text x="100" y="104" font-size="9.5" text-anchor="middle">{label}</text>' if label else ''}</svg>'''

def venn_cart():  # 생각 열기: 장바구니
    return '''<svg viewBox="0 0 220 104" width="100%"><circle cx="82" cy="54" r="44" fill="none" stroke="#1a1a1a" stroke-width="1.2"/><circle cx="138" cy="54" r="44" fill="none" stroke="#1a1a1a" stroke-width="1.2"/>
<text x="40" y="12" font-size="10.5">민준 A</text><text x="164" y="12" font-size="10.5">서연 B</text>
<text x="62" y="46" font-size="9.5" text-anchor="middle">삼각김밥</text><text x="62" y="64" font-size="9.5" text-anchor="middle">콜라</text>
<text x="110" y="58" font-size="9.5" text-anchor="middle">라면</text><text x="160" y="58" font-size="9.5" text-anchor="middle">컵떡볶이</text></svg>'''

ln = lambda mm: f'<span class="ln" style="min-width:{mm}mm"></span>'
m = lambda t: f'<span class="math">{t}</span>'
G = lambda t: f'<span class="tag t-game">게임: {t}</span>'
C = '<sup>C</sup>'

head = '''<div class="head">
    <div class="school"><b>한국항만물류고등학교</b><span>공통수학2</span></div>
    <div class="title"><h1>학습과정 · 5차시</h1><p>공통수학2 Ⅱ. 집합과 명제 1. 집합 03~04. 연산 법칙 · 여집합과 차집합 (5차시) · 레이드용 v3</p></div>
    <div class="name"><div>학년 &nbsp;&nbsp; 반 &nbsp;&nbsp; 번</div><div>이름</div></div>
  </div>'''

p1_left = f'''
      <div class="pur"><span class="tag t-pur">복습</span><b>지난 시간 기억하기</b> {G('개념 1 시작 때 말로 확인')}
        <div class="q">{m('A')} = {{1, 2, 3}}, {m('B')} = {{3, 4}}일 때 &nbsp;A ∩ B = {ln(14)}, &nbsp;A ∪ B = {ln(20)}</div>
        <div class="q">n(A) = 5, n(B) = 4, n(A ∩ B) = 1 이면 n(A ∪ B) = {ln(10)}</div></div>
      <div class="word">낱말 상자 [ 교환법칙 · 결합법칙 · 분배법칙 ]</div>
      <div><span class="pill p-blue">STEP 1 교환법칙</span></div>
      <div class="box">순서를 바꾸어도 결과가 같다 → {ln(24)}<div class="law">A ∪ B = B ∪ A, &nbsp; A ∩ B = B ∩ A</div></div>
      <div><span class="pill p-blue">STEP 2 결합법칙</span></div>
      <div class="box">어느 두 개를 먼저 계산해도 결과가 같다 → {ln(24)}<div class="law">(A ∪ B) ∪ C = A ∪ (B ∪ C)<br>(A ∩ B) ∩ C = A ∩ (B ∩ C)</div><div class="mini">→ 그래서 괄호 없이 A ∪ B ∪ C, A ∩ B ∩ C 로 써도 된다.</div></div>
      <div><b class="blue">문제 1)</b> {m('A')} = {{1, 2, 3}}, {m('B')} = {{2, 3, 4}}, {m('C')} = {{3, 4, 5}}일 때 빈칸을 채우시오. {G('몬스터 1')}</div>
      <div class="q">(1) A ∪ B = {ln(24)}, &nbsp;(A ∪ B) ∪ C = {ln(26)}</div>
      <div class="q">(2) B ∪ C = {ln(24)}, &nbsp;A ∪ (B ∪ C) = {ln(26)}</div>
      <div class="q">(3) A ∩ B ∩ C = {ln(20)}</div>
      <div><span class="pill p-blue">STEP 3 분배법칙</span></div>
      <div class="box">수에서 2 × (3 + 4) = 2 × 3 + 2 × 4 처럼 나누어 계산 → {ln(24)}<div class="law">A ∩ (B ∪ C) = (A ∩ B) ∪ (A ∩ C)<br>A ∪ (B ∩ C) = (A ∪ B) ∩ (A ∪ C)</div>
      <div class="mini redc">⚠ A ∪ (B ∩ C) = (A ∪ B) ∩ C 처럼 괄호만 옮기면 안 된다! 원소를 넣어 확인하기</div></div>
      <div><b class="blue">문제 2)</b> {m('A')} = {{1, 2, 3, 4}}, {m('B')} = {{2, 4, 6}}, {m('C')} = {{3, 4, 5}}일 때 {G('몬스터 2')}</div>
      <div class="q">(1) B ∪ C = {ln(26)} → A ∩ (B ∪ C) = {ln(20)}</div>
      <div class="q">(2) A ∩ B = {ln(14)}, A ∩ C = {ln(14)}<br>&nbsp;&nbsp;→ (A ∩ B) ∪ (A ∩ C) = {ln(20)}</div>
      <div class="q">(3) (1)과 (2)의 결과는 ( 같다 / 다르다 )</div>
'''

p1_right = f'''
      <div class="pur"><span class="tag t-pur">보강</span><b>법칙을 이용해 간단히 하기</b> {G('보강던전 ① · 보기 고르기')}
        <div class="mini">식이 길어 보여도 포함 관계를 생각하면 짧아진다. (A ∪ B) ∩ A = A <span class="purc">(A ⊂ A ∪ B 이므로)</span></div>
        <div class="q">(1) (A ∪ B) ∩ A = {ln(14)} &nbsp; (2) (A ∩ B) ∪ A = {ln(14)}</div>
        <div class="q">(3) (A ∩ B) ∪ (A ∩ C) = A ∩ ( {ln(16)} )</div></div>
      <div class="word">낱말 상자 [ 전체집합 · 여집합 · 차집합 · 속하지 않는 ]</div>
      <div><span class="pill p-blue">STEP 4 전체집합과 여집합</span></div>
      <div style="display:flex;gap:6px;align-items:center"><div class="box" style="flex:1;line-height:1.85">처음에 생각하는 모든 원소의 집합을 {ln(18)}이라 하고 <b>U</b>로 나타낸다.<br><b>U</b>의 원소 중 {m('A')}에 {ln(18)} 원소의 집합을 {m('A')}의 {ln(14)}이라 하고 <b>A{C}</b><br>A{C} = {{{m('x')} | {m('x')} ∈ U 그리고 {m('x')} ∉ A}}<div class="mini purc">💡 U가 정해져야 A{C}를 구할 수 있다</div></div><div style="width:40%">{venn_comp()}</div></div>
      <div><b class="blue">문제 3)</b> U = {{1, 2, 3, …, 8}}일 때 여집합을 구하시오. {G('몬스터 3')}</div>
      <div class="q">(1) {m('A')} = {{1, 2, 3}} → A{C} = {ln(30)}</div>
      <div class="q">(2) {m('B')} = {{{m('x')} | {m('x')}는 짝수}} → B{C} = {ln(30)}</div>
      <div><span class="pill p-blue">STEP 5 차집합</span></div>
      <div style="display:flex;gap:6px;align-items:center"><div class="box" style="flex:1;line-height:1.85">{m('A')}에는 속하고 {m('B')}에는 속하지 않는 원소의 집합을 {m('A')}에 대한 {m('B')}의 {ln(14)}이라 하고 <b>A − B</b><br>A − B = {{{m('x')} | {m('x')} ∈ A 그리고 {m('x')} ∉ B}}</div><div style="width:40%">{venn2('AmB', '색칠 = A − B')}</div></div>
      <div class="yel"><b>보기</b> {m('A')} = {{1, 2, 3, 4}}, {m('B')} = {{3, 4, 5}} &nbsp;A − B = {{1, 2}} <span class="mini">(A에서 B에 있는 것 빼기)</span>, &nbsp;B − A = {{5}}<br><b class="redc">⚠ A − B 와 B − A 는 다르다!</b></div>
      <div><b class="blue">문제 4)</b> {m('A')} = {{1, 3, 5, 7, 9}}, {m('B')} = {{3, 6, 9}}일 때 {G('몬스터 4')}</div>
      <div class="q">(1) A − B = {ln(26)} &nbsp; (2) B − A = {ln(18)}</div>
'''

p2_left = f'''
      <div><span class="pill p-blue">STEP 6 여집합 · 차집합의 성질</span> {G('개념 5에서 짚기 · 보강던전 ②')}</div>
      <div class="box" style="line-height:1.9">① A ∪ A{C} = {ln(10)} &nbsp; ② A ∩ A{C} = {ln(10)} &nbsp; ③ (A{C}){C} = {ln(10)}<br>④ U{C} = ∅, &nbsp;∅{C} = U<br>⑤ <b>A − B = A ∩ B{C}</b> <span class="mini">(B가 아닌 것 중 A인 것)</span></div>
      <div class="pur"><span class="tag t-pur">보강</span><b>색칠해서 확인하기</b> A − B 와 A ∩ B{C} 를 각각 색칠해 보고 같은지 비교하자. {G('보강던전 ③ · 그림 고르기')}
        <div class="cols2"><div>{venn2('', 'A − B')}</div><div>{venn2('', 'A ∩ B<tspan baseline-shift="super" font-size="7">C</tspan>')}</div></div>
        <div class="q" style="text-align:center">→ 두 그림은 ( 같다 / 다르다 )</div></div>
      <div><b class="blue">문제 5)</b> U = {{1, 2, 3, 4, 5, 6}}, {m('A')} = {{1, 2, 3}}, {m('B')} = {{2, 4, 6}}일 때 {G('몬스터 5')}</div>
      <div class="q">(1) B{C} = {ln(18)} → A ∩ B{C} = {ln(16)}</div>
      <div class="q">(2) A − B = {ln(16)} → (1)과 ( 같다 / 다르다 )</div>
      <div class="box" style="flex:1;border-style:dashed;color:#777;font-size:8.5pt">✏ 풀이 · 메모</div>
'''

W = lambda h=15: f'<div style="height:{h}mm"></div>'
p2_right = f'''
      <div class="grn" style="flex:1;display:flex;flex-direction:column">
        <div class="h grnc" style="font-size:10.5pt">✔ 5차시 형성평가 <span style="font-size:8.5pt;color:#555;font-weight:400">(혼자 풀기 · 8문항)</span> <span class="tag t-boss">게임: 보스</span></div>
        <div class="q">1. A ∪ B = B ∪ A 는 어떤 법칙인가?</div>{W(10)}
        <div class="q">2. {m('A')} = {{1, 2}}, {m('B')} = {{2, 3}}, {m('C')} = {{3, 4}}일 때 A ∪ B ∪ C 를 구하시오.</div>{W()}
        <div class="q">3. A ∩ (B ∪ C) = (A ∩ B) ∪ ( &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ) &nbsp;빈칸에 알맞은 것은?</div>{W(10)}
        <div class="q">4. U = {{1, 2, 3, 4, 5}}, {m('A')} = {{2, 4}}일 때 A{C} 를 구하시오.</div>{W()}
        <div class="q">5. {m('A')} = {{1, 2, 3, 4}}, {m('B')} = {{2, 4, 6}}일 때 A − B 를 구하시오.</div>{W()}
        <div class="q">6. 위 <b class="redc">5번</b>에서 B − A 를 구하시오.</div>{W()}
        <div class="q purc"><b class="redc">[도전]</b> <span class="tag t-game">보너스</span> 7. {m('A')} = {{1, 2, 3, 4, 5}}, {m('B')} = {{2, 4, 6}}, {m('C')} = {{4, 5, 6}}일 때<br>&nbsp;&nbsp;(A ∪ B) ∩ (A ∪ C) = A ∪ ( &nbsp;&nbsp;&nbsp;&nbsp; ) = ?</div>{W(20)}
        <div class="q purc"><b class="redc">[도전]</b> <span class="tag t-game">보너스</span> 8. U = {{{m('x')} | {m('x')}는 10 이하의 자연수}}, {m('A')} = {{{m('x')} | {m('x')}는 3의 배수}}, {m('B')} = {{{m('x')} | {m('x')}는 홀수}}일 때 A{C} ∩ B 를 원소나열법으로 나타내시오.</div>{W(20)}
        <div style="font-size:8.5pt;margin-top:auto">맞은 개수 {ln(10)} / 8 &nbsp;어려웠던 부분<br>□ 교환·결합법칙 □ 분배법칙 □ 여집합 □ 차집합 □ 성질</div>
      </div>
      <div style="display:flex;justify-content:flex-end"><div style="width:34mm;height:22mm;border:1.2px solid #1a1a1a;text-align:center;font-size:8pt;padding-top:2px">확인 도장</div></div>
'''

goal = '<div class="goal"><b>학습목표</b> ① 교환법칙, 결합법칙을 이해한다. ② 분배법칙을 벤 다이어그램과 원소로 확인할 수 있다. ③ 연산 법칙으로 식을 간단히 할 수 있다. ④ 전체집합과 여집합의 뜻을 알고 구할 수 있다. ⑤ 차집합을 구할 수 있다. ⑥ A − B = A ∩ B<sup>C</sup> 임을 안다.</div>'

html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>학습과정 5차시 레이드용 v3</title>{css}</head><body>
<div class="page">{head}{goal}
  <div class="cols"><div class="col" id="c1">{p1_left}</div><div class="col tight" id="c2">{p1_right}</div></div>
  <div class="foot">- 5차시 (1/2) -</div></div>
<div class="page">{head}<div style="height:6px"></div>
  <div class="cols"><div class="col" id="c3" style="height:234mm">{p2_left}</div><div class="col" id="c4" style="height:234mm">{p2_right}</div></div>
  <div class="foot">- 5차시 (2/2) -</div></div>
</body></html>'''
open(os.path.join(D, 'ws5-raid-v3.html'), 'w', encoding='utf-8').write(html)
print('ok')
