# 6차시 레이드용 학습지 생성기 · v2 (2026-11-04 사용자 확정: 보강 칸 빼기 · ★ 칸만 게임 · 보강 ③ → 문제 4-2 · STEP 6 = 사각형의 포함 관계와 명제 · 형성평가 6문항)
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
    <div class="title"><h1>학습과정 · 6차시</h1><p>공통수학2 Ⅱ. 집합과 명제 1. 집합 · 2. 명제 04. 드모르간의 법칙 · 01. 명제 (6차시) · 레이드용 v2</p></div>
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

KS = '<span class="ks">'
p1_right = f'''
      <div class="word">낱말 상자 [ 명제 · 참 · 거짓 · 부정 ]</div>
      <div><span class="pill p-blue">STEP 4 명제</span></div>
      <div class="box">참인지 거짓인지를 분명하게 판별할 수 있는 문장이나 식을 {ln(16)}라고 한다.<div class="mini redc">※ 거짓인 문장도 명제이다! (예: 2 + 3 = 7 은 거짓인 명제) · ʻ맛있다, 크다, 멋지다’처럼 기준이 모호하면 명제가 아니다.</div></div>
      <div><b class="blue">문제 4)</b> 다음이 <b>참인 명제 / 거짓인 명제 / 명제 아님</b> 중 어느 것인지 고르시오. {G('몬스터 4')}</div>
      <div class="q">(1) 5 + 4 = 10 &nbsp;( 참 / 거짓 / 명제 아님 )</div>
      <div class="q">(2) 축구는 재미있다. &nbsp;( 참 / 거짓 / 명제 아님 )</div>
      <div class="q">(3) 2는 소수이다. &nbsp;( 참 / 거짓 / 명제 아님 )</div>
      <div class="q">(4) 부산은 큰 도시이다. &nbsp;( 참 / 거짓 / 명제 아님 )</div>
      <div><b class="blue">문제 4-2)</b> 삼단논법 · 명제 고르기 {G('몬스터 4-2')}</div>
      <div class="q">(1) ( ) 에 알맞은 것을 고르시오.</div>
      <table class="syl"><tr><th>전제 1</th><td>모든 사람은 죽는다.</td></tr><tr><th>전제 2</th><td>소크라테스는 사람이다.</td></tr><tr><th>결&nbsp;&nbsp;론</th><td>따라서 소크라테스는 (&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;).</td></tr></table>
      <div class="q opts">① 죽는다 &nbsp;&nbsp; ② 사람이다 &nbsp;&nbsp; ③ 소크라테스다</div>
      <div class="q">(2) 다음 중 <b>명제인 것</b>을 모두 고르시오.</div>
      <ol class="pick">
        <li>① 순천시는 대한민국의 수도이다.</li>
        <li>② 맛초킹은 가장 맛있는 치킨이다.</li>
        <li>③ 우리 반 착한 친구의 비중이 전국에서 가장 높다.</li>
        <li>④ 태양은 지구를 중심으로 돈다.</li>
        <li>⑤ 수학 선생님은 키가 크다.</li>
        <li>⑥ 제주도는 대한민국에서 가장 큰 섬이다.</li>
      </ol>
      <div><span class="pill p-blue">STEP 5 명제의 부정</span></div>
      <div class="box" style="line-height:1.8">명제 p에 대하여 ʻp가 아니다’를 p의 {ln(12)}이라 하고 <b>~p</b>로 나타낸다.<br>p가 참이면 ~p는 {ln(10)}, p가 거짓이면 ~p는 {ln(10)} &nbsp; · &nbsp;~(~p) = p
        <div class="mini">보기 p : 7은 짝수이다. (거짓) → ~p : 7은 짝수가 아니다. (참) &nbsp;|&nbsp; ʻ&gt;’의 부정은 ʻ≤’</div></div>
      <div><b class="blue">문제 5)</b> 부정을 <b>고르고</b> 참·거짓을 판별하시오. {G('몬스터 5 · 고르기')}</div>
      <div class="q">(1) 4는 2의 배수이다. → ① 4는 2의 배수가 아니다 ② 4는 2의 약수이다 ③ 4는 2의 배수이다 &nbsp;{ox()}</div>
      <div class="q">(2) 3 &gt; 5 → ① 3 ≤ 5 &nbsp;② 3 &lt; 5 &nbsp;③ 3 ≥ 5 &nbsp;{ox()}</div>
'''

# 사각형 가족 포함 그림: 사다리꼴 ⊃ 평행사변형 ⊃ 직사각형 · 마름모, 정사각형 = 직사각형 ∩ 마름모
QUAD = '''<svg viewBox="0 0 220 128" width="100%">
<rect x="3" y="3" width="214" height="122" rx="10" fill="#f7f7f7" stroke="#1a1a1a" stroke-width="1.2"/><text x="12" y="18" font-size="10.5" font-weight="700">사다리꼴</text>
<rect x="18" y="24" width="184" height="96" rx="10" fill="#eef3ff" stroke="#2f5bb7" stroke-width="1.2"/><text x="26" y="38" font-size="10.5" font-weight="700" fill="#2f5bb7">평행사변형</text>
<ellipse cx="82" cy="76" rx="50" ry="34" fill="#fff4d6" fill-opacity=".85" stroke="#b07a0a" stroke-width="1.2"/><text x="40" y="72" font-size="10" font-weight="700" fill="#8a5a00">직사각형</text>
<ellipse cx="138" cy="76" rx="50" ry="34" fill="#ffe3ef" fill-opacity=".7" stroke="#c0396b" stroke-width="1.2"/><text x="152" y="72" font-size="10" font-weight="700" fill="#a02a58">마름모</text>
<text x="110" y="80" font-size="9.5" font-weight="700" text-anchor="middle">정사각형</text></svg>'''

p2_left = f'''
      <div><span class="pill p-blue">STEP 6 사각형의 포함 관계와 명제</span></div>
      <div class="box mini" style="line-height:1.55">
        <b>사각형 가족의 뜻</b> (뜻을 정한 문장 = <b>정의</b>)<br>
        · <b>사다리꼴</b> : 한 쌍의 대변이 평행한 사각형<br>
        · <b>평행사변형</b> : 두 쌍의 대변이 각각 평행한 사각형<br>
        · <b>직사각형</b> : 네 각이 모두 직각인 사각형<br>
        · <b>마름모</b> : 네 변의 길이가 모두 같은 사각형<br>
        · <b>정사각형</b> : 네 각이 직각이고 네 변의 길이가 모두 같은 사각형</div>
      <div style="width:82%;margin:0 auto">{QUAD}</div>
      <div class="box" style="line-height:1.6"><b>「p이면 q이다」</b> → p 의 집합이 q 의 집합 <b>안에 쏙 들어가면 참</b>,<br>밖으로 삐져나오는 것(<b>반례</b>)이 하나라도 있으면 <b>거짓</b>
        <div class="mini" style="margin-top:3px">예) 정사각형이면 직사각형이다. → <b>참</b> (정사각형은 모두 직사각형 안)<br>예) 직사각형이면 정사각형이다. → <b>거짓</b> (반례: 가로 2, 세로 1인 직사각형)</div>
        <div class="mini" style="margin-top:3px;color:#555">※ 이렇게 참임이 증명된 성질 중 기본이 되는 것 = <b>정리</b></div></div>
      <div><b class="blue">문제 6)</b> 다음 명제의 참 · 거짓을 판별하시오. {G('몬스터 6')}</div>
      <div class="q">(1) 마름모이면 평행사변형이다. &nbsp;{ox()}</div>
      <div class="q">(2) 평행사변형이면 직사각형이다. &nbsp;{ox()}</div>
      <div class="q">(3) 정사각형이면 마름모이다. &nbsp;{ox()}</div>
      <div class="q">(4) 사다리꼴이면 평행사변형이다. &nbsp;{ox()}</div>
      <div class="pur mini">🔭 <b>8차시에 다시 만나요</b> — 「진리집합」으로 바꿔 말하면: <b>p → q 가 참 ⇔ P ⊂ Q</b></div>
      <div class="box" style="flex:1;border-style:dashed;color:#777;font-size:8.5pt">✏ 풀이 · 메모</div>
'''

W = lambda h=12: f'<div style="height:{h}mm"></div>'
p2_right = f'''
      <div class="grn" style="flex:1;display:flex;flex-direction:column">
        <div class="h grnc" style="font-size:10.5pt">✔ 6차시 형성평가 <span style="font-size:8.5pt;color:#555;font-weight:400">(혼자 풀기 · 6문항)</span> <span class="tag t-boss">게임: 보스</span></div>
        <div class="q">1. (A ∪ B){C} = A{C} ( &nbsp;&nbsp;&nbsp; ) B{C} &nbsp;(∪ 또는 ∩)</div>{W(10)}
        <div class="q">2. (A ∩ B){C} 과 같은 것은? &nbsp;① A{C} ∪ B{C} ② A{C} ∩ B{C} ③ A ∪ B ④ (A ∪ B){C}</div>{W(10)}
        <div class="q">3. n(U) = 20, n(A) = 7 일 때 n(A{C}) = ?</div>{W(14)}
        <div class="q">4. 「직사각형이면 평행사변형이다.」 &nbsp;( 참 / 거짓 )</div>{W(10)}
        <div class="q">5. 다음 중 명제가 <b>아닌</b> 것은? &nbsp;① 1 + 1 = 3 ② 6은 3의 배수이다. ③ 떡볶이는 맛있다.</div>{W(10)}
        <div class="q">6. “5는 홀수이다.”의 부정은? &nbsp;① 5는 홀수가 아니다 ② 5는 짝수가 아니다 ③ 5는 홀수이다</div>{W(10)}
        <div style="font-size:8.5pt;margin-top:auto">맞은 개수 {ln(10)} / 6 &nbsp;어려웠던 부분<br>□ 드모르간 □ 원소의 개수 □ 활용 □ 명제 찾기 □ 부정 □ 사각형 명제</div>
      </div>
      <div class="pur mini">🟪 <b>더 해 보고 싶다면</b> — 수업 뒤 캠프의 <b>중단원던전 6층</b>: 보강 ① 색칠한 부분의 원소 개수 · 형성평가 재대결 &nbsp;|&nbsp; 다음 시간 = <b>집합 중단원 마무리 (꼭대기 층)</b></div>
      <div style="display:flex;justify-content:flex-end"><div style="width:34mm;height:22mm;border:1.2px solid #1a1a1a;text-align:center;font-size:8pt;padding-top:2px">확인 도장</div></div>
'''

goal = '<div class="goal"><b>학습목표</b> ① 드모르간의 법칙을 이해하고 이용할 수 있다. ② 여집합·차집합의 원소의 개수를 구할 수 있다. ③ 명제의 뜻을 알고 참·거짓을 판별할 수 있다. ④ 명제의 부정을 말할 수 있다. ⑤ 사각형의 포함 관계를 명제로 나타내고 참·거짓을 판별할 수 있다. (정의 · 정리의 뜻) </div>'

html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>학습과정 6차시 레이드용 v2</title>{css}</head><body>
<div class="page">{head}{goal}
  <div class="cols"><div class="col" id="c1">{p1_left}</div><div class="col tight" id="c2">{p1_right}</div></div>
  <div class="foot">- 6차시 (1/2) -</div></div>
<div class="page">{head}<div style="height:6px"></div>
  <div class="cols"><div class="col" id="c3" style="height:234mm">{p2_left}</div><div class="col" id="c4" style="height:234mm">{p2_right}</div></div>
  <div class="foot">- 6차시 (2/2) -</div></div>
</body></html>'''
open(os.path.join(D, 'ws6-raid-v2.html'), 'w', encoding='utf-8').write(html)
print('ok')
