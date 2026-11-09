# 8차시 레이드용 v1 (변경 제안 시안) · gen_ws6v3.py 양식 그대로 · 방향 방 초안 2026-11-07
import os, sys
WSD = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, WSD)
from wslib import CSS, v, C, BL, CB, GAME, header
from playwright.sync_api import sync_playwright
OUT = sys.argv[1]
S = '<b style="color:#d32f2f">★</b>'
T = lambda s: f'<span class="mini" style="color:#a0620a">(교과서 {s})</span>'
MEMO = '<div class="memo" style="flex:1">✏ 풀이 · 메모</div>'
EXTRA = '''
.col { display:flex; flex-direction:column; }
.page { display:flex; flex-direction:column; } .cols { flex:1; min-height:0; }
.ex { color:#2a4a8a; }
body { font-size:9.9pt; line-height:1.48; } .q { margin:1mm 0; } h3 { margin:1.6mm 0 1mm 0; }
.hd .l { width:34mm; } .hd .rr { width:50mm; }
.word { border:1px dashed #9ab; padding:1mm 2mm; font-size:9pt; margin:1mm 0; }
.ox { display:inline-block; min-width:14mm; border-bottom:1px solid #444; }
'''
P = lambda n, s, tag: f'<div class="q"><b class="ex">문제 {n})</b> {v(s)} {tag}</div>'
OX = '( &nbsp;&nbsp;&nbsp;&nbsp; )'

p1_left = f'''
<div class="soft"><b>🎮 생각 열기 — 게임 랭크</b><br>“점수 {v("x")}가 2000 이상이면 다이아 티어” → {v("x ≥ 2000")}은 참일까?<br>
{v("x")} 값을 모르면 ( 알 수 있다 / 알 수 없다 ) · {v("x = 2500")}이면 ( 참 / 거짓 ), {v("x = 1800")}이면 ( 참 / 거짓 )</div>
<h3>STEP 1 명제와 그 부정</h3>
<div class="word">낱말 상자 [ 명제 · 부정 · 조건 · 진리집합 ]</div>
<div class="box">참 또는 거짓을 명확하게 판별할 수 있는 문장이나 식을 {BL["m"]}라고 한다.<br>
명제 {v("p")}에 대하여 ‘{v("p")}가 아니다.’를 {v("p")}의 {BL["s"]}이라 하고 {v("~p")}로 나타낸다.<br>
<span class="mini">{v("p")}가 참이면 {v("~p")}는 거짓, {v("p")}가 거짓이면 {v("~p")}는 참</span></div>
{P(1, "다음이 명제이면 ○, 아니면 ×를 쓰고, 명제이면 참 · 거짓을 판별하시오.", T("82쪽 문제 1") + "<br>" + GAME("몬스터 1 · ★ 칸만"))}
<div class="q">(1) {S}π는 유리수이다. 명제 {OX} 참 · 거짓 {OX}</div>
<div class="q">(2) {S}섬진강은 아름답다. 명제 {OX}</div>
<div class="q">(3) {S}{v("4 − 1 = 3")} 명제 {OX} 참 · 거짓 {OX}</div>
<div class="q">(4) {S}정삼각형은 이등변삼각형이다. 명제 {OX} 참 · 거짓 {OX}</div>
<div class="q">(5) 「15의 약수의 개수는 3이다.」의 부정 : {BL["xl"]}<br>&nbsp;&nbsp;&nbsp;&nbsp;→ {S}부정은 ( 참 / 거짓 ) {T("82쪽 문제 2")}</div>
<h3>STEP 2 조건과 진리집합</h3>
<div class="box">변수 {v("x")}의 값에 따라 참 · 거짓이 정해지는 문장이나 식을 {BL["m"]}이라 한다.<br>
전체집합 {v("U")}의 원소 중 조건 {v("p")}를 참이 되게 하는 모든 원소의 집합을 {v("p")}의 {BL["m"]}이라 하고 보통 {v("P")}로 나타낸다.</div>
{P(2, "U = {1, 2, 3, …, 10}일 때 진리집합을 구하시오.", GAME("몬스터 2 · ★ 칸만"))}
<div class="q">(1) {S}{v("p")} : {v("x")}는 3의 배수 → {v("P")} = {BL["l"]}</div>
<div class="q">(2) {S}{v("q")} : {v("x + 2 = 7")} → {v("Q")} = {BL["l"]}</div>
<div class="q">(3) {S}{v("r")} : {v("x")}는 6의 약수 → {v("R")} = {BL["l"]}</div>
{MEMO}'''

p1_right = f'''
<h3>STEP 3 조건의 부정과 진리집합</h3>
<div class="box">조건 {v("p")}의 부정 {v("~p")}의 진리집합은 {v("P")}의 여집합, 즉 {v("P")}{C}<br>
<b>‘그리고’의 부정 → ‘또는’, ‘또는’의 부정 → ‘그리고’</b><br>
<span class="mini">{v("x = 1")}의 부정 : {v("x ≠ 1")} · {v("x > 2")}의 부정 : {v("x ≤ 2")} (‘같다’도 들어감!)</span></div>
{P(3, "U = {1, 2, 3, 4, 5, 6}일 때 부정과 그 진리집합을 구하시오.", GAME("몬스터 3 · ★ 칸만"))}
<div class="q">(1) {v("p")} : {v("x")}는 홀수 → {v("~p")} : {BL["m"]}, {S}진리집합 {BL["m"]}</div>
<div class="q">(2) {v("q")} : {v("x > 4")} → {v("~q")} : {BL["m"]}, {S}진리집합 {BL["m"]}</div>
<div class="q">(3) {S}‘{v("x = 2")} 또는 {v("x = 3")}’의 부정 : {BL["xl"]}</div>
<div class="q">(4) {S}‘{v("x > 0")} 그리고 {v("y > 0")}’의 부정 : {BL["xl"]}</div>
<h3>STEP 4 ‘모든’과 ‘어떤’의 참 · 거짓</h3>
<div class="box">조건 {v("p")}의 진리집합을 {v("P")}라 할 때<br>
‘모든 {v("x")}에 대하여 {v("p")}’ : {v("P = U")}이면 참 <span class="mini">(하나라도 안 되면 거짓 → 그 예가 {BL["s"]})</span><br>
‘어떤 {v("x")}에 대하여 {v("p")}’ : {v("P ≠ ∅")}이면 참 <span class="mini">(하나만 찾으면 참)</span></div>
{P(4, "참 · 거짓을 판별하시오.", GAME("몬스터 4 · ★ 칸만"))}
<div class="q">U = {{1, 2, 3, 4}}일 때<br>(1) {S}모든 {v("x")}에 대하여 {v("x < 5")}이다. {OX}<br>
(2) {S}모든 {v("x")}에 대하여 {v("x")}는 짝수이다. {OX} 반례 : {BL["s"]}<br>
(3) {S}어떤 {v("x")}에 대하여 {v("x + 1 = 4")}이다. {OX}<br>
(4) {S}어떤 {v("x")}에 대하여 {v("x > 4")}이다. {OX}</div>
<div class="q">실수 {v("x")}에 대하여 {T("85쪽 문제 5")}<br>(5) {S}모든 실수 {v("x")}에 대하여 {v("|x| ≥ 0")}이다. {OX}<br>
(6) {S}어떤 실수 {v("x")}에 대하여 {v("x² − 4x + 5 = 0")}이다. {OX}<br><span class="mini">힌트: {v("x² − 4x + 5 = (x − 2)² + 1")}</span></div>
{MEMO}'''

W = lambda h: f'<div style="height:{h}mm"></div>'
fq = lambda n, s, h: f'<div class="q">{n}. {s}</div>{W(h)}'
p2_left = f'''
<h3>STEP 5 ‘모든’과 ‘어떤’의 부정</h3>
<div class="box">‘모든 {v("x")}에 대하여 {v("p")}’의 부정 → ‘어떤 {v("x")}에 대하여 {v("~p")}’<br>
‘어떤 {v("x")}에 대하여 {v("p")}’의 부정 → ‘모든 {v("x")}에 대하여 {v("~p")}’</div>
<div class="soft">보기 “모든 학생은 휴대폰이 있다.”의 부정 → “어떤 학생은 휴대폰이 없다.”<br><b>⚠ “모든 학생은 휴대폰이 없다.”가 아니다!</b></div>
{P(5, "부정을 쓰시오.", GAME("몬스터 5 · ★ 칸만"))}
<div class="q">(1) {S}모든 실수 {v("x")}에 대하여 {v("x + 1 > 0")}이다.<br>&nbsp;&nbsp;&nbsp;&nbsp;→ {BL["xl"]}</div>
<div class="q">(2) {S}어떤 자연수 {v("x")}에 대하여 {v("x < 1")}이다.<br>&nbsp;&nbsp;&nbsp;&nbsp;→ {BL["xl"]}</div>
<div class="q">(3) {S}우리 반 모든 학생은 지각하지 않았다.<br>&nbsp;&nbsp;&nbsp;&nbsp;→ {BL["xl"]}</div>
<div class="q">(4) {S}모든 마름모는 정사각형이다. {T("85쪽 문제 6")}<br>&nbsp;&nbsp;&nbsp;&nbsp;→ 부정 : {BL["xl"]} &nbsp;부정은 ( 참 / 거짓 )</div>
{MEMO}'''

p2_right = f'''
<div class="fa" style="margin-top:0"><div class="tt">✔ 8차시 형성평가 <span class="mini" style="font-weight:400">(혼자 풀기 · 6문항)</span>{GAME("보스")}</div>
{fq(1, "다음 중 명제가 <b>아닌</b> 것은?<br>① " + v("2 + 3 = 6") + " &nbsp;② 7은 소수이다. &nbsp;③ 수학은 재미있다. &nbsp;④ 모든 정사각형은 직사각형이다.", 6)}
{fq(2, v("U = {1, 2, …, 8}, p : x는 4의 약수일 때 P = ?"), 7)}
{fq(3, v("U = {1, 2, 3, 4}, p : x ≥ 3일 때 ~p의 진리집합 = ?"), 7)}
{fq(4, v("U = {1, 2, 3}일 때 “모든 x에 대하여 x ≤ 3이다.”") + " ( 참 / 거짓 )", 5)}
{fq(5, v("U = {1, 2, 3}일 때 “어떤 x에 대하여 x = 5이다.”") + " ( 참 / 거짓 )", 5)}
{fq(6, "“모든 학생은 안경을 썼다.”의 부정을 쓰시오.", 8)}
<div class="mini" style="border-top:1px dashed #9bb;padding-top:1.5mm">맞은 개수 {BL["s"]} / 6 &nbsp;어려웠던 부분<br>{CB}명제 {CB}진리집합 {CB}조건의 부정<br>{CB}모든 · 어떤 판별 {CB}모든 · 어떤의 부정 {CB}반례</div></div>
<div class="add mini">🎯 <b>더 해 보고 싶다면</b> — 수업 뒤 캠프의 복습 허수아비: 오늘 문제 숫자 바꿔 다시 · 👑 형성평가 재대결 | 🏰 성채 2층(명제)은 11차시 뒤에 열려요 | 다음 시간 = 명제 사이의 관계 (9차시)</div>
<div class="stampwrap" style="margin-top:auto"><div class="stamp"><span>확인 도장</span></div></div>'''

rng = '공통수학2 Ⅱ. 집합과 명제 2. 명제 01. 명제와 조건 (8차시) · 레이드용 v1'
hd = header('8차시', rng)
goal = '<div class="goal"><b>학습목표</b> ① 명제와 그 부정의 뜻을 안다. ② 조건의 진리집합과 조건의 부정을 구할 수 있다. ③ ‘모든’, ‘어떤’을 포함한 명제의 참 · 거짓을 판별하고 부정을 말할 수 있다.</div>'
pg = lambda g, l, r, n: f'<div class="page">{hd}{g}<div class="cols"><div class="col">{l}</div><div class="col">{r}</div></div><div class="pno">- 8차시 ({n}/2) -</div></div>'
html = f"<!DOCTYPE html><html><head><meta charset='utf-8'><title>학습과정 8차시 레이드용 v1</title><style>{CSS}{EXTRA}</style></head><body>{pg(goal, p1_left, p1_right, 1)}{pg('', p2_left, p2_right, 2)}</body></html>"
open(OUT.replace('.pdf', '.html'), 'w', encoding='utf-8').write(html)
with sync_playwright() as p:
    b = p.chromium.launch(); page = b.new_page(); page.set_content(html); page.wait_for_timeout(300)
    bot = page.evaluate("""() => [...document.querySelectorAll('.col')].map(c => { const k = [...c.children].filter(e => !e.classList.contains('memo')).pop(); return k ? Math.round((k.getBoundingClientRect().bottom - c.closest('.page').getBoundingClientRect().top) * 25.4 / 96) : 0 })""")
    page.pdf(path=OUT, format='A4', print_background=True, prefer_css_page_size=True); b.close()
print('단 아래끝:', bot)
