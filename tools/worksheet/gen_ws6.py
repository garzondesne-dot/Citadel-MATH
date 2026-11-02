# 6차시 레이드용 학습지 v1 생성기 (5차시 v3 양식 · 2026-11-02 컨펌된 변경 제안 v1 반영)
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
    <div class="title"><h1>학습과정 · 6차시</h1><p>공통수학2 Ⅱ. 집합과 명제 1. 집합 · 2. 명제 04. 드모르간의 법칙 · 01. 명제 (6차시) · 레이드용 v1</p></div>
    <div class="name"><div>학년 &nbsp;&nbsp; 반 &nbsp;&nbsp; 번</div><div>이름</div></div>
  </div>'''

p1_left = f'''
      <div class="yel"><b>생각 열기</b> 급식에서 ʻ둘 다 안 먹는’ 친구 {G('도입 · 말로')}
        <div class="mini">우리 반 18명: 라면 좋아함 A 10명, 떡볶이 좋아함 B 8명, 둘 다 4명</div>
        <div class="q">① n(A ∪ B) = {ln(10)}명 &nbsp; ② 둘 다 싫은 학생 = 18 − {ln(8)} = {ln(8)}명</div>
        <div class="q">③ ʻ라면도 싫고 떡볶이도 싫다’ = ʻ(라면 또는 떡볶이)가 아니다’ ( 예 / 아니요 )</div></div>
      <div class="pur"><span class="tag t-pur">복습</span><b>지난 시간 기억하기</b> {G('개념 1 시작 때 말로')}
        <div class="q">U = {{1, 2, 3, 4, 5}}, {m('A')} = {{1, 2}}, {m('B')} = {{2, 3}}일 때 A{C} = {ln(16)}, A − B = {ln(12)}</div></div>
      <div><span class="pill p-blue">STEP 1 드모르간의 법칙</span></div>
      <div style="display:flex;gap:6px;align-items:center"><div class="box" style="flex:1"><div class="law">(A ∪ B){C} = A{C} ∩ B{C}<br>(A ∩ B){C} = A{C} ∪ B{C}</div><div class="mini">괄호를 풀 때 <b>C가 각각 붙고, ∪ ↔ ∩ 가 바뀐다!</b></div></div><div style="width:40mm">{venn_out()}</div></div>
      <div><b class="blue">문제 1)</b> U = {{1, 2, 3, 4, 5, 6}}, {m('A')} = {{1, 2, 3}}, {m('B')} = {{3, 4}}일 때 {G('몬스터 1 · 원소 골라 담기')}</div>
      <div class="q">(1) A ∪ B = {ln(22)} → (A ∪ B){C} = {ln(16)}</div>
      <div class="q">(2) A{C} = {ln(16)}, B{C} = {ln(18)} → A{C} ∩ B{C} = {ln(14)}</div>
      <div class="q">(3) (A ∩ B){C} = {ln(22)}, &nbsp;A{C} ∪ B{C} = {ln(22)}</div>
      <div class="pur"><span class="tag t-pur">보강</span><b>색칠한 부분의 원소 개수</b> {G('보강던전 ①')}
        <div class="mini">U = {{1, 2, 3, 4, 5, 6, 7}}의 두 부분집합 A, B에 대하여 A ∩ B = {{2}}, (A ∪ B){C} = {{3, 5}}일 때, A ∪ B 에서 A ∩ B 를 뺀 부분의 원소의 개수는?</div>
        <div class="q">n(A ∪ B) = 7 − {ln(8)} = {ln(8)} → 구하는 개수 = {ln(8)} − 1 = {ln(8)}</div></div>
'''

p1_right = f'''
      <div><span class="pill p-blue">STEP 2 여집합 · 차집합의 원소의 개수</span></div>
      <div class="box" style="line-height:1.8">① n(A{C}) = n(U) − n(A)<br>② n(A − B) = n(A) − n(A ∩ B) = n(A ∪ B) − n(B)</div>
      <div><b class="blue">문제 2)</b> n(U) = 30, n(A) = 12, n(B) = 15, n(A ∩ B) = 5일 때 {G('몬스터 2')}</div>
      <div class="q">(1) n(A{C}) = {ln(10)} &nbsp; (2) n(A − B) = {ln(10)} &nbsp; (3) n(B − A) = {ln(10)}</div>
      <div class="q">(4) n(A ∪ B) = {ln(10)} &nbsp; (5) n(A{C} ∩ B{C}) = n((A ∪ B){C}) = {ln(10)}</div>
      <div><span class="pill p-blue">STEP 3 생활 속 문제</span></div>
      <div class="box mini">벤 다이어그램의 칸에 숫자를 직접 써 넣으면 쉽다: 「둘 다」 칸부터!</div>
      <div><b class="blue">문제 3)</b> 1학년 40명 중 축구 동아리 18명, 밴드 동아리 12명, 둘 다 5명이다. {G('몬스터 3')}</div>
      <div class="q">(1) 축구 또는 밴드 동아리 학생 수 : {ln(10)}명</div>
      <div class="q">(2) 축구만 하는 학생 수 : {ln(10)}명 &nbsp; (3) 둘 다 하지 않는 학생 수 : {ln(10)}명</div>
      <div class="pur"><span class="tag t-pur">보강</span><b>생활 속 문제 2</b> {G('보강던전 ②')}
        <div class="mini">재능 기부 봉사 활동에서 벽화 그리기 37명, 교육 봉사 54명, 두 가지 모두 26명이다.</div>
        <div class="q">벽화 그리기 또는 교육 봉사를 하는 학생 수는? {ln(12)}명</div></div>
      <div class="word">낱말 상자 [ 명제 · 참 · 거짓 · 부정 ]</div>
      <div><span class="pill p-blue">STEP 4 명제</span></div>
      <div class="box">참인지 거짓인지를 분명하게 판별할 수 있는 문장이나 식을 {ln(16)}라고 한다.<div class="mini redc">※ 거짓인 문장도 명제이다! (예: 2 + 3 = 7 은 거짓인 명제) · ʻ맛있다, 크다, 멋지다’처럼 기준이 모호하면 명제가 아니다</div></div>
      <div class="pur"><span class="tag t-pur">보강</span><b>삼단논법 · 명제 고르기</b> {G('보강던전 ③')}
        <div class="mini">전제1 모든 사람은 죽는다. 전제2 소크라테스는 사람이다. 결론 따라서 소크라테스는 ( 죽는다 / 사람이다 / 소크라테스다 )</div>
        <div class="mini">명제인 것을 모두 고르시오. ① 순천시는 대한민국의 수도이다. ② 맛초킹은 가장 맛있는 치킨이다. ③ 우리 반 착한 친구의 비중이 전국에서 가장 높다. ④ 태양은 지구를 중심으로 돈다. ⑤ 수학 선생님은 키가 크다. ⑥ 제주도는 대한민국에서 가장 큰 섬이다.</div></div>
'''

p2_left = f'''
      <div><b class="blue">문제 4)</b> 다음이 <b>참인 명제 / 거짓인 명제 / 명제 아님</b> 중 어느 것인지 고르시오. {G('몬스터 4')}</div>
      <div class="q">(1) 3은 홀수이다. ( 참 / 거짓 / 명제 아님 ) &nbsp; (2) 5 + 4 = 10 ( 참 / 거짓 / 명제 아님 )</div>
      <div class="q">(3) 축구는 재미있다. ( 참 / 거짓 / 명제 아님 ) &nbsp; (4) 2는 소수이다. ( 참 / 거짓 / 명제 아님 )</div>
      <div class="q">(5) 부산은 큰 도시이다. ( 참 / 거짓 / 명제 아님 ) &nbsp; (6) 정사각형은 직사각형이다. ( 참 / 거짓 / 명제 아님 )</div>
      <div><span class="pill p-blue">STEP 5 명제의 부정</span></div>
      <div class="box" style="line-height:1.8">명제 p에 대하여 ʻp가 아니다’를 p의 {ln(12)}이라 하고 <b>~p</b>로 나타낸다.<br>p가 참이면 ~p는 {ln(10)}, p가 거짓이면 ~p는 {ln(10)} &nbsp; · &nbsp;~(~p) = p
        <div class="mini">보기 p : 7은 짝수이다. (거짓) → ~p : 7은 짝수가 아니다. (참) &nbsp;|&nbsp; ʻ&gt;’의 부정은 ʻ≤’</div></div>
      <div><b class="blue">문제 5)</b> 부정을 <b>고르고</b> 참·거짓을 판별하시오. {G('몬스터 5 · 고르기')}</div>
      <div class="q">(1) 4는 2의 배수이다. → ① 4는 2의 배수가 아니다 ② 4는 2의 약수이다 ③ 4는 2의 배수이다 &nbsp;{ox()}</div>
      <div class="q">(2) 3 &gt; 5 → ① 3 ≤ 5 &nbsp;② 3 &lt; 5 &nbsp;③ 3 ≥ 5 &nbsp;{ox()}</div>
      <div class="q">(3) √4 는 무리수이다. → ① √4는 무리수가 아니다 ② √4는 유리수가 아니다 ③ √4는 정수이다 &nbsp;{ox()}</div>
      <div class="pur"><span class="tag t-pur">보강</span><b>STEP 6 정의와 정리</b> {G('보강던전 ④')}
        <div class="mini"><b>정의</b> : 용어의 뜻을 명확하게 정한 문장 예) “두 변의 길이가 같은 삼각형을 이등변삼각형이라 한다.”<br><b>정리</b> : 참임이 증명된 명제 중 기본이 되는 것 예) “삼각형의 세 내각의 합은 180°이다.”</div>
        <div class="q">(1) 네 변의 길이가 같은 사각형을 마름모라 한다. ( 정의 / 정리 )</div>
        <div class="q">(2) 직각삼각형에서 빗변의 제곱은 다른 두 변의 제곱의 합과 같다. ( 정의 / 정리 )</div></div>
      <div class="box" style="flex:1;border-style:dashed;color:#777;font-size:8.5pt">✏ 풀이 · 메모</div>
'''

W = lambda h=12: f'<div style="height:{h}mm"></div>'
p2_right = f'''
      <div class="grn" style="flex:1;display:flex;flex-direction:column">
        <div class="h grnc" style="font-size:10.5pt">✔ 6차시 형성평가 <span style="font-size:8.5pt;color:#555;font-weight:400">(혼자 풀기 · 8문항)</span> <span class="tag t-boss">게임: 보스</span></div>
        <div class="q">1. (A ∪ B){C} = A{C} ( &nbsp;&nbsp;&nbsp; ) B{C} &nbsp;(∪ 또는 ∩)</div>{W(8)}
        <div class="q">2. (A ∩ B){C} 과 같은 것은? &nbsp;① A{C} ∪ B{C} ② A{C} ∩ B{C} ③ A ∪ B ④ (A ∪ B){C}</div>{W(8)}
        <div class="q">3. n(U) = 20, n(A) = 7 일 때 n(A{C}) = ?</div>{W(10)}
        <div class="q">4. 참인지 거짓인지 판별할 수 있는 문장을 ( 명제 / 참 / 거짓 / 부정 ) 라고 한다.</div>{W(8)}
        <div class="q">5. 다음 중 명제가 <b>아닌</b> 것은? &nbsp;① 1 + 1 = 3 ② 6은 3의 배수이다. ③ 떡볶이는 맛있다.</div>{W(8)}
        <div class="q">6. “5는 홀수이다.”의 부정은? &nbsp;① 5는 홀수가 아니다 ② 5는 짝수가 아니다 ③ 5는 홀수이다</div>{W(8)}
        <div class="q purc"><b class="redc">[도전]</b> <span class="tag t-game">보너스</span> 7. 반 학생 18명 중 버스 통학 6명, 기숙사 14명, 둘 다 아닌 학생이 1명일 때, 버스 통학과 기숙사를 둘 다 하는 학생은 몇 명인가?</div>{W(14)}
        <div class="q purc"><b class="redc">[도전]</b> <span class="tag t-game">보너스</span> 8. “2는 짝수가 아니다.”의 부정과 그 참·거짓은?<br>&nbsp;① 2는 짝수이다 · 참 ② 2는 짝수이다 · 거짓 ③ 2는 홀수이다 · 거짓 ④ 2는 짝수가 아니다 · 참</div>{W(8)}
        <div style="font-size:8.5pt;margin-top:auto">맞은 개수 {ln(10)} / 8 &nbsp;어려웠던 부분<br>□ 드모르간 □ 원소의 개수 □ 활용 □ 명제 찾기 □ 부정 □ 정의·정리</div>
      </div>
      <div style="display:flex;justify-content:flex-end"><div style="width:34mm;height:22mm;border:1.2px solid #1a1a1a;text-align:center;font-size:8pt;padding-top:2px">확인 도장</div></div>
'''

goal = '<div class="goal"><b>학습목표</b> ① 드모르간의 법칙을 이해하고 이용할 수 있다. ② 여집합·차집합의 원소의 개수를 구할 수 있다. ③ 명제의 뜻을 알고 참·거짓을 판별할 수 있다. ④ 명제의 부정을 말할 수 있다. ⑤ 정의와 정리를 구별할 수 있다.</div>'

html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>학습과정 6차시 레이드용 v1</title>{css}</head><body>
<div class="page">{head}{goal}
  <div class="cols"><div class="col" id="c1">{p1_left}</div><div class="col tight" id="c2">{p1_right}</div></div>
  <div class="foot">- 6차시 (1/2) -</div></div>
<div class="page">{head}<div style="height:6px"></div>
  <div class="cols"><div class="col" id="c3" style="height:234mm">{p2_left}</div><div class="col" id="c4" style="height:234mm">{p2_right}</div></div>
  <div class="foot">- 6차시 (2/2) -</div></div>
</body></html>'''
open(os.path.join(D, 'ws6-raid-v1.html'), 'w', encoding='utf-8').write(html)
print('ok')
