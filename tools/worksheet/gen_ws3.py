# 3차시 레이드용 학습지 v5 생성기 (v4 원본을 사용자 변경 사항대로 고침 · 2026-11-03 컨펌)
#   ① 보강 1 예제 → 문제 1 · 「한 걸음 더」 뒤로  ② 스페셜 「부분집합의 개수 규칙」 삭제 → STEP 5 개념 + 문제 4 (몬스터)
#   ③ 답을 따로 적는 칸 · 형성평가 답 칸 표 삭제 (문제 안의 □ 는 문제의 일부라 남김)  ④ 문항마다 풀이 공간 넉넉히
# 사용: python3 tools/worksheet/gen_ws3.py → tools/worksheet/ws3-raid-v5.html → node tools/worksheet/pdf.js <html> <pdf>
import os
D = os.path.dirname(os.path.abspath(__file__))
css = open(os.path.join(D, 'style.css.txt'), encoding='utf-8').read()
css = css.replace('</style>', '''
.mini { font-size: 8.4pt; }
.tight { gap: 4px !important; }
.law { text-align: center; font-weight: 700; font-size: 10.2pt; line-height: 1.6; }
.sqq { display: inline-block; width: 9mm; height: 6.5mm; border: 1.2px solid #1a1a1a; vertical-align: middle; margin: 0 4px; }
.sol { height: 7mm; }
table.t td.blank { height: 9mm; }
.units { display: flex; gap: 4px; }
</style>''')

ln = lambda mm: f'<span class="ln" style="min-width:{mm}mm"></span>'
m = lambda t: f'<span class="math">{t}</span>'
G = lambda t: f'<span class="tag t-game">게임: {t}</span>'
SQ = '<span class="sqq"></span>'
W = lambda h=8: f'<div style="height:{h}mm;flex:none"></div>'
sup = lambda t: f'<sup>{t}</sup>'

head = '''<div class="head">
    <div class="school"><b>한국항만물류고등학교</b><span>공통수학2</span></div>
    <div class="title"><h1>학습과정 · 3차시</h1><p>공통수학2 Ⅱ. 집합과 명제 1. 집합 02. 집합 사이의 포함 관계 (3차시) · 레이드용 v5</p></div>
    <div class="name"><div>학년 &nbsp;&nbsp; 반 &nbsp;&nbsp; 번</div><div>이름</div></div>
  </div>'''


def group(title, sub, members, unit_name, unit_members):
    # 원래 그룹(큰 타원) 안에 유닛(작은 타원)
    xs = [(40, 22), (100, 22), (22, 44), (118, 44), (30, 66), (110, 66), (70, 30)]
    t = ''.join(f'<text x="{x}" y="{y}" font-size="7.5" text-anchor="middle">{n}</text>' for (x, y), n in zip(xs, members))
    return f'''<div style="flex:1;text-align:center"><div class="mini"><b>{title}</b><br>{sub}</div>
<svg viewBox="0 0 140 92" width="100%"><ellipse cx="70" cy="48" rx="66" ry="42" fill="none" stroke="#1a1a1a" stroke-width="1.1"/>
<ellipse cx="70" cy="66" rx="30" ry="17" fill="#fde3c4" stroke="#e2852c" stroke-width="1"/>{t}
<text x="70" y="62" font-size="8" text-anchor="middle" fill="#b05a10" font-weight="700">{unit_name}</text><text x="70" y="74" font-size="7.5" text-anchor="middle">{unit_members}</text></svg></div>'''


p1_left = f'''
      <div class="yel"><b>생각 열기</b> — 선생님 세대 vs 너희 세대 {G('도입 · 말로')}
        <div class="mini">아이돌 그룹 안에서 몇 명만 모여 따로 활동하는 그룹을 <b>유닛</b>이라고 한다.</div>
        <div class="units">{group('선생님 세대', '소녀시대', ['태연', '티파니', '서현', '윤아', '써니', '', ''], '효리수', '효연 유리 수영')}{group('너희 세대', '세븐틴', ['에스쿱스', '정한', '조슈아', '원우', '우지', '디노', '민규'], '부석순', '호시 도겸 승관')}</div>
        <div class="q">① 효리수 멤버는 모두 소녀시대에 있나? ( 예 / 아니요 )</div>
        <div class="q">② 소녀시대 멤버는 모두 효리수에 있나? ( 예 / 아니요 )</div>
        <div class="q">③ 부석순 멤버는 모두 세븐틴에 있나? ( 예 / 아니요 )</div>
        <div class="q">④ 내가 아는 또 다른 유닛 그룹은? {G('말풍선')}<br>유닛 : {ln(22)} &nbsp; 원래 그룹 : {ln(22)}</div></div>
      <div><span class="pill p-blue">STEP 1 부분집합</span></div>
      <div class="word">낱말 상자 [ 모든 · 부분집합 · 포함된다 ]</div>
      <div class="box" style="line-height:2">두 집합 {m('A')}, {m('B')}에 대하여 {m('A')}의 {ln(16)} 원소가 {m('B')}에 속할 때, {m('A')}를 {m('B')}의 {ln(20)}이라 하고, 기호로 {m('A')} ⊂ {m('B')} 와 같이 나타낸다.<br>이때 ʻ집합 {m('A')}는 집합 {m('B')}에 {ln(18)}’고 한다.<br>{m('A')}가 {m('B')}의 부분집합이 아닐 때 → 기호로 {m('A')} ⊄ {m('B')}</div>
      <div class="yel"><b>보기</b>
        <div class="q">① {m('A')} = {{1, 4}}, {m('B')} = {{1, 4, 7}} → 1과 4가 모두 {m('B')}에 있다 → {m('A')} ⊂ {m('B')}</div>
        <div class="q">② {m('C')} = {{2, 4, 5, 8}}, {m('D')} = {{x | x는 짝수}} → 5는 {m('D')}에 없다 → {m('C')} ⊄ {m('D')}</div>
        <div class="mini">※ 원소가 하나라도 빠지면 부분집합이 아니다.</div></div>
'''

venn = '''<svg viewBox="0 0 120 70" width="100%"><ellipse cx="62" cy="36" rx="56" ry="31" fill="none" stroke="#1a1a1a" stroke-width="1.1"/><ellipse cx="46" cy="38" rx="26" ry="18" fill="#dde6f6" stroke="#2f5b9a" stroke-width="1"/>
<text x="104" y="14" font-size="9" font-style="italic">B</text><text x="44" y="18" font-size="8" font-style="italic" fill="#2f5b9a">A</text><text x="38" y="42" font-size="9">1</text><text x="52" y="42" font-size="9">4</text><text x="94" y="42" font-size="9">7</text></svg>'''

p1_right = f'''
      <div class="red"><b>⚠ 기호를 구별하자</b>
        <div class="q">원소와 집합 사이 → ∈, ∉ &nbsp;예) 1 ∈ {{1, 4}}</div>
        <div class="q">집합과 집합 사이 → ⊂, ⊄ &nbsp;예) {{1}} ⊂ {{1, 4}}</div>
        <div class="q redc">{{1}} ∈ {{1, 4}} (×) &nbsp;&nbsp; 1 ⊂ {{1, 4}} (×)</div></div>
      <div><b class="blue">문제 1)</b> □ 안에 ⊂ 또는 ⊄ 를 쓰시오. {G('몬스터 1')}</div>
      <div class="q">(1) {{1, 2}} {SQ} {{1, 2, 3}}</div>{W(5)}
      <div class="q">(2) {{2, 5}} {SQ} {{1, 2, 3, 4}}</div>{W(5)}
      <div class="q">(3) {{3, 6}} {SQ} {{x | x는 3의 배수}}</div>{W(5)}
      <div class="q">(4) {{2, 3, 5}} {SQ} {{x | x는 10 이하의 소수}}</div>{W(5)}
      <div class="pur"><span class="tag t-pur">보강</span><b>한 걸음 더</b> <span class="mini">(먼저 원소나열법으로 바꿔 보자)</span> {G('스페셜 몬스터')}
        <div class="q">(5) {{1, 5, 25}} {SQ} {{x | x는 25의 약수}}</div>{W(4)}
        <div class="q">(6) {{−2, 0, 2}} {SQ} {{x | x{sup('2')} − 2x = 0}}</div>{W(4)}
        <div class="q">(7) {{2, 3, 5, 7}} {SQ} {{x | x는 7 이하의 자연수}}</div>{W(3)}</div>
      <div class="pur"><span class="tag t-pur">보강</span><b>예제</b> {m('A')} = {{1, 3, 4}}, {m('B')} = {{2, 3, 4}}, {m('C')} = {{1, 2, 3, 4, 7}}
        <div class="q">(1) {m('A')}에 속하면서 {m('B')}에 없는 원소는? {ln(18)}</div>
        <div class="q">(2) {m('A')}에 속하면서 {m('C')}에 없는 원소는? {ln(18)}</div>
        <div class="q">(3) {m('B')}에 속하면서 {m('C')}에 없는 원소는? {ln(18)}</div>
        <div class="mini purc">→ 없는 원소가 하나도 없으면 부분집합! &nbsp;{m('A')} ⊂ {m('C')}, {m('B')} ⊂ {m('C')}, {m('A')} ⊄ {m('B')}</div>
        <div style="display:flex;gap:6px;align-items:center"><div class="mini" style="flex:1">벤 다이어그램으로 보면 {m('A')}가 {m('B')} 안에 쏙 들어 있다.<br>{m('A')} = {{1, 4}}, {m('B')} = {{1, 4, 7}}</div><div style="width:34mm">{venn}</div></div></div>
      <div><span class="pill p-blue">STEP 2 꼭 기억할 두 가지</span></div>
      <div class="box">① 모든 집합은 자기 자신의 부분집합이다. → {m('A')} ⊂ {m('A')}<br>② 공집합 ∅은 모든 집합의 부분집합이다. → ∅ ⊂ {m('A')}<div class="mini">예) {{1, 2}} ⊂ {{1, 2}}, ∅ ⊂ {{1, 2}}</div></div>
'''

p2_left = f'''
      <div><span class="pill p-blue">STEP 3 서로 같은 집합</span></div>
      <div class="box">{m('A')} ⊂ {m('B')} 이고 {m('B')} ⊂ {m('A')} 일 때 → {m('A')} = {m('B')} (서로 같다)<br>= 두 집합의 원소가 모두 같다. &nbsp;서로 같지 않을 때 → {m('A')} ≠ {m('B')}
        <div class="mini">보기 {{1, 2, 3}} = {{3, 1, 2}} (순서만 다르다) · {{1, 2}} ≠ {{1, 2, 3}} (3이 없다)</div></div>
      <div><b class="blue">문제 2)</b> □ 안에 = 또는 ≠ 를 쓰시오. {G('몬스터 2')}</div>
      <div class="q">(1) {{2, 4, 6}} {SQ} {{6, 4, 2}}</div>{W(5)}
      <div class="q">(2) {{1, 2, 4}} {SQ} {{x | x는 4의 약수}}</div>{W(6)}
      <div class="q">(3) {{2, 4, 6}} {SQ} {{x | x는 8 이하의 짝수}}</div>{W(6)}
      <div><span class="pill p-blue">STEP 4 부분집합 모두 구하기</span></div>
      <div class="yel"><b>방법</b> 원소를 0개, 1개, 2개, … 고르는 순서로 빠짐없이 쓴다.
        <div class="mini">보기 {m('A')} = {{a, b}}의 부분집합 → 0개 : ∅ &nbsp;1개 : {{a}}, {{b}} &nbsp;2개 : {{a, b}} → 모두 4개</div></div>
      <div class="box"><b>진부분집합</b> : 부분집합 중에서 자기 자신을 뺀 것<div class="mini">예) {m('A')} = {{a, b}}의 진부분집합 → ∅, {{a}}, {{b}} (3개)</div></div>
      <div><b class="blue">문제 3)</b> 집합 {m('A')} = {{1, 2, 3}}의 부분집합을 모두 구하시오. {G('몬스터 3')}</div>
      <table class="t"><tr><th style="width:18mm">고른 개수</th><th>부분집합</th></tr><tr><td>0개</td><td class="blank"></td></tr><tr><td>1개</td><td class="blank"></td></tr><tr><td>2개</td><td class="blank"></td></tr><tr><td>3개</td><td class="blank"></td></tr></table>
      <div class="q">→ 부분집합의 개수 : {ln(12)}개, &nbsp;진부분집합의 개수 : {ln(12)}개</div>
      <div><span class="pill p-blue">STEP 5 부분집합의 개수</span></div>
      <div class="box" style="line-height:1.75">원소가 하나 늘 때마다 부분집합은 <b>2배</b>!<br>원소가 {m('n')}개인 집합의 부분집합의 개수 : <b>2{sup(m('n'))}개</b>
        <br>특정한 원소 {m('p')}개를 <b>반드시 포함</b> : 2{sup(m('n') + ' − ' + m('p'))}개 &nbsp;/&nbsp; 특정한 원소 {m('q')}개를 <b>포함하지 않음</b> : 2{sup(m('n') + ' − ' + m('q'))}개
        <div class="mini">예) {{a, b, c}} 의 부분집합 2{sup('3')} = 8개 · a를 반드시 포함 2{sup('2')} = 4개</div></div>
'''

p2_right = f'''
      <div><b class="blue">문제 4)</b> 다음을 구하시오. {G('몬스터 4')}</div>
      <div class="q">(1) 원소 1개 → 2개, 2개 → 4개, 3개 → 8개 일 때, 원소 4개 → {ln(10)}개</div>{W(4)}
      <div class="q">(2) 집합 {{a, b, c, d}}의 부분집합의 개수 → {ln(10)}개</div>{W(5)}
      <div class="q">(3) 위 집합에서 a를 반드시 포함하는 부분집합의 개수 → {ln(10)}개</div>{W(6)}
      <div class="q">(4) 위 집합에서 a를 포함하지 않는 부분집합의 개수 → {ln(10)}개</div>{W(6)}
      <div class="grn" style="flex:1;display:flex;flex-direction:column">
        <div class="h grnc" style="font-size:10.5pt">✔ 3차시 형성평가 <span style="font-size:8.5pt;color:#555;font-weight:400">(혼자 풀기 · 7문항)</span> <span class="tag t-boss">게임: 보스</span></div>
        <div class="q">1. □ 안에 ⊂ 또는 ⊄ 를 쓰시오. &nbsp;{{1, 3}} {SQ} {{1, 2, 3}} &nbsp;&nbsp; {{1, 4}} {SQ} {{1, 2, 3}}</div>{W(5)}
        <div class="q">2. 다음 중 옳지 <b>않은</b> 것은? &nbsp;① 2 ∈ {{1, 2}} ② {{2}} ⊂ {{1, 2}} ③ ∅ ⊂ {{1, 2}} ④ 2 ⊂ {{1, 2}}</div>{W(6)}
        <div class="q">3. {{x | x는 6의 약수}} {SQ} {{1, 2, 3, 6}} &nbsp;(= 또는 ≠)</div>{W(6)}
        <div class="q">4. 집합 {{5, 7}}의 부분집합을 모두 쓰시오.</div>{W(11)}
        <div class="q">5. 집합 {{5, 7}}의 진부분집합의 개수는?</div>{W(8)}
        <div class="q purc"><b class="redc">[도전]</b> 6. 두 집합 {m('A')} = {{1, a}}, {m('B')} = {{1, 3}}에 대하여 {m('A')} ⊂ {m('B')} 이고 {m('B')} ⊂ {m('A')} 일 때, a의 값은?</div>{W(9)}
        <div class="q purc"><b class="redc">[도전]</b> <span class="tag t-game">보너스</span> 7. 집합 {{1, 2, 3, 4, 5, 6, 7}}의 부분집합 중에서 2와 6을 반드시 포함하고 5는 포함하지 않는 부분집합의 개수는?</div>{W(9)}
        <div style="font-size:8.5pt;margin-top:auto">맞은 개수 {ln(10)} / 7 &nbsp;어려웠던 부분 □ ⊂ ⊄ □ = ≠ □ 부분집합 구하기 □ 부분집합의 개수</div>
      </div>
      <div style="display:flex;justify-content:flex-end"><div style="width:34mm;height:20mm;border:1.2px solid #1a1a1a;text-align:center;font-size:8pt;padding-top:2px">확인 도장</div></div>
'''

goal = '<div class="goal"><b>학습목표</b> ① 부분집합의 뜻을 알고 기호 ⊂, ⊄ 로 나타낼 수 있다. ② 서로 같은 집합을 찾을 수 있다. ③ 부분집합을 모두 구하고 그 개수를 구할 수 있다.</div>'

html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>학습과정 3차시 레이드용 v5</title>{css}</head><body>
<div class="page">{head}{goal}
  <div class="cols"><div class="col" id="c1">{p1_left}</div><div class="col tight" id="c2">{p1_right}</div></div>
  <div class="foot">- 3차시 (1/2) -</div></div>
<div class="page">{head}<div style="height:6px"></div>
  <div class="cols"><div class="col tight" id="c3" style="height:234mm">{p2_left}</div><div class="col tight" id="c4" style="height:234mm">{p2_right}</div></div>
  <div class="foot">- 3차시 (2/2) -</div></div>
</body></html>'''
open(os.path.join(D, 'ws3-raid-v5.html'), 'w', encoding='utf-8').write(html)
print('ok')
