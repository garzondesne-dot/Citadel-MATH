# 8차시 레이드용 v5 확정 (2026-11-10 선생님 「개념 3개만 해서 컨펌」 · 생각 열기 없음 · ✔ 고르기 표기 없음 · 몬스터 4 · ‘모든’과 ‘어떤’ = 9차시) · gen_ws8.py 기반 · 2026-11-10 메타인지 방
#   STEP 1 명제와 부정 · 2 조건과 진리집합(U 따라) · 3 조건의 부정
#   + 🔁 전시 확인 · 👾 몬스터 그림 칸 · 🏕 쉼터 표지판 · ✔ 고르기 표기 (SORAID P6)
import os, sys, base64
WSD = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, WSD)
from wslib import CSS, v, C, BL, CB, GAME, header
from playwright.sync_api import sync_playwright
OUT = sys.argv[1]
S = '<b style="color:#d32f2f">★</b>'
T = lambda s: f'<span class="mini" style="color:#a0620a">(교과서 {s})</span>'
MEMO = '<div class="memo" style="flex:1">✏ 풀이 · 메모</div>'
def img(f):
    return 'data:image/png;base64,' + base64.b64encode(open(os.path.join(WSD, f), 'rb').read()).decode()
EXTRA = '''
.col { display:flex; flex-direction:column; }
.page { display:flex; flex-direction:column; } .cols { flex:1; min-height:0; }
.ex { color:#2a4a8a; }
body { font-size:10.2pt; line-height:1.55; } .q { margin:1.3mm 0; } h3 { margin:2.6mm 0 1.2mm 0; }
.hd .l { width:34mm; } .hd .rr { width:50mm; }
.word { border:1px dashed #9ab; padding:1mm 2mm; font-size:9pt; margin:1mm 0; }
.mon { display:flex; align-items:center; gap:2mm; margin:2mm 0 0.5mm 0; }
.mon img { width:13mm; height:13mm; image-rendering:pixelated; background:#2a2433; border-radius:2mm; }
.mon .nm { font-size:8.6pt; color:#6b5a40; }
.ck { font-size:8pt; color:#2f6f9a; font-weight:700; border:1px solid #2f6f9a; border-radius:1.2mm; padding:0 1mm; margin-right:1mm; }
.camp { border:2px dashed #b5851f; background:#fff7e0; border-radius:3mm; padding:2.5mm 3mm; margin:3mm 0; text-align:center; }
.camp b { font-size:11pt; color:#8a5a00; }
.review { border:1px solid #9bb; background:#f4f8fb; border-radius:2mm; padding:1.5mm 2.5mm; margin:1.5mm 0 2mm 0; font-size:9.4pt; }
'''
P = lambda n, s, tag: f'<div class="q"><b class="ex">문제 {n})</b> {v(s)} {tag}</div>'
OX = '( &nbsp;&nbsp;&nbsp;&nbsp; )'
CK = ''  # 11/10 선생님: ✔ 고르기 표기 없어도 학생들이 안다
MON = lambda n, name: f'<div class="mon"><b class="ex">👾 몬스터 {n}</b> <span class="nm">{name}</span></div>'
W = lambda h: f'<div style="height:{h}mm"></div>'

review = f'''<div class="review"><b>🔁 전시 확인</b> (지난 시간) &nbsp;
① {v("(A ∩ B)")}{C} = {v("A")}{C} ( &nbsp;&nbsp; ) {v("B")}{C} &nbsp;<span class="mini">(∪ 또는 ∩)</span> &nbsp;
② {v("A ∩ B = ∅")} 이면 {v("A")}와 {v("B")}는 {BL["s"]}</div>'''

p1_left = f'''
<h3>STEP 1 명제와 그 부정</h3>
<div class="word">낱말 상자 [ 명제 · 부정 · 조건 · 진리집합 ]</div>
<div class="box">참 또는 거짓을 명확하게 판별할 수 있는 문장이나 식을 {BL["m"]}라고 한다.<br>
명제 {v("p")}에 대하여 ‘{v("p")}가 아니다.’를 {v("p")}의 {BL["s"]}이라 하고 {v("~p")}로 나타낸다.<br>
<span class="mini">{v("p")}가 참이면 {v("~p")}는 거짓, {v("p")}가 거짓이면 {v("~p")}는 참 · {v("~(~p)")}는 {v("p")}</span></div>
{MON(1, '거울 박쥐')}
{P(1, "다음이 명제이면 ○, 아니면 ×를 쓰고, 명제이면 참 · 거짓을 고르시오.", T("82쪽 문제 1") + " " + GAME("★ 칸만"))}
<div class="q">(1) {S}π는 유리수이다. 명제 {OX} {CK}( 참 / 거짓 )</div>
<div class="q">(2) {S}섬진강은 아름답다. 명제 {OX}</div>
<div class="q">(3) {S}{v("4 − 1 = 3")} 명제 {OX} {CK}( 참 / 거짓 )</div>
<div class="q">(4) {S}정삼각형은 이등변삼각형이다. 명제 {OX} {CK}( 참 / 거짓 )</div>
{W(3)}
{P(2, "다음 명제의 부정을 쓰고, 그 참 · 거짓을 고르시오.", T("82쪽 문제 2") + " " + GAME("★ 칸만"))}
<div class="q">(1) 15의 약수의 개수는 3이다.<br>&nbsp;&nbsp;&nbsp;&nbsp;부정 : {BL["xl"]} → {S}{CK}( 참 / 거짓 )</div>
{W(4)}
<div class="q">(2) {v("2 ≤ 1 + √2")}<br>&nbsp;&nbsp;&nbsp;&nbsp;부정 : {BL["l"]} → {S}{CK}( 참 / 거짓 )</div>
{MEMO}'''

p1_right = f'''
<h3>STEP 2 조건과 진리집합</h3>
<div class="box">변수 {v("x")}의 값에 따라 참 · 거짓이 정해지는 문장이나 식을 {BL["m"]}이라 한다.<br>
전체집합 {v("U")}의 원소 중 조건 {v("p")}를 참이 되게 하는 모든 원소의 집합을 {v("p")}의 {BL["m"]}이라 하고 보통 {v("P")}로 나타낸다.<br>
<b style="color:#d32f2f">⚠ 같은 조건이라도 전체집합 {v("U")}가 다르면 진리집합이 달라진다!</b></div>
{MON(2, '반사 골렘')}
{P(3, "U = {1, 2, 3, …, 10}일 때 진리집합을 구하시오.", GAME("★ 칸만"))}
<div class="q">(1) {S}{v("p")} : {v("x")}는 3의 배수 → {v("P")} = {BL["l"]}</div>
<div class="q">(2) {S}{v("q")} : {v("x + 2 = 7")} → {v("Q")} = {BL["l"]}</div>
<div class="q">(3) {S}{v("r")} : {v("x")}는 6의 약수 → {v("R")} = {BL["l"]}</div>
<div class="q">(4) {v("s")} : {v("x")}는 소수 → {v("S")} = {BL["l"]}</div>
{W(5)}
{MON(3, '수정 광부 유령')}
{P(4, "조건 p : x² = 4의 진리집합을 전체집합에 따라 구하시오.", GAME("★ 칸만"))}
<div class="q">(1) {S}{v("U")} = 자연수 전체의 집합 → {v("P")} = {BL["l"]}</div>
<div class="q">(2) {S}{v("U")} = 정수 전체의 집합 → {v("P")} = {BL["l"]}</div>
<div class="q">(3) {v("U = {3, 4, 5}")} → {v("P")} = {BL["l"]} <span class="mini">(원소가 하나도 없으면?)</span></div>
<div class="camp"><b>⛺ 여기까지 오면 쉼터!</b><br>오늘의 미니게임 <b>👀 눈치게임</b> — 1부터 차례로 숫자를 누르기 · 같은 숫자를 동시에 누르면 탈락 · 끝까지 안 누르면 관전</div>
{MEMO}'''

fq = lambda n, s, h: f'<div class="q">{n}. {s}</div>{W(h)}'
p2_right = f'''
<div class="fa" style="margin-top:0"><div class="tt">✔ 8차시 형성평가 <span class="mini" style="font-weight:400">(혼자 풀기 · 4문항)</span>{GAME("보스")}</div>
<div class="mon"><b class="ex">👑 보스</b> <span class="nm">부정의 수정 여왕</span></div>
{fq(1, "다음 중 명제가 <b>아닌</b> 것을 고르시오.<br>① " + v("2 + 3 = 6") + " &nbsp;② 7은 소수이다. &nbsp;③ 수학은 재미있다. &nbsp;④ 모든 정사각형은 직사각형이다.", 12)}
{fq(2, v("U = {1, 2, …, 8}, p : x는 4의 약수일 때 P = ?"), 18)}
{fq(3, v("p : x² = 9의 진리집합을 U = 자연수 전체의 집합, U = 정수 전체의 집합일 때 각각 구하시오."), 18)}
{fq(4, v("U = {1, 2, 3, 4, 5}, p : x² > 5일 때 ~p와 그 진리집합을 구하시오."), 18)}
<div class="mini" style="border-top:1px dashed #9bb;padding-top:1.5mm">맞은 개수 {BL["s"]} / 4 &nbsp;어려웠던 부분<br>{CB}명제 {CB}명제의 부정 {CB}진리집합 {CB}전체집합이 바뀔 때 {CB}조건의 부정</div></div>
<div class="add mini">🎯 <b>더 해 보고 싶다면</b> — 수업 뒤 캠프의 복습 허수아비 · 👑 형성평가 재대결 | 다음 시간 = ‘모든’과 ‘어떤’ (9차시)</div>
<div class="stampwrap" style="margin-top:auto"><div class="stamp"><span>확인 도장</span></div></div>'''
p2_left = f'''<h3>STEP 3 조건의 부정과 진리집합</h3>
<div class="box">조건 {v("p")}에 대하여 ‘{v("p")}가 아니다.’를 {v("p")}의 부정이라 하고 {v("~p")}로 나타낸다.<br>
{v("~p")}의 진리집합은 {v("P")}의 {BL["m"]}, 즉 {v("P")}{C}<br>
<span class="mini">{v("x = 1")}의 부정 : {v("x ≠ 1")} · {v("x > 2")}의 부정 : {v("x ≤ 2")} (‘같다’도 들어감!)</span></div>
{MON(4, '뒤집힌 거미')}
{P(5, "U = {1, 2, 3, 4, 5, 6}일 때 부정과 그 진리집합을 구하시오.", GAME("★ 칸만"))}
<div class="q">(1) {v("p")} : {v("x")}는 홀수 → {v("~p")} : {BL["m"]}, {S}진리집합 {BL["m"]}</div>
{W(3)}
<div class="q">(2) {v("q")} : {v("x > 4")} → {v("~q")} : {BL["m"]}, {S}진리집합 {BL["m"]}</div>
{W(3)}
<div class="q">(3) {v("r")} : {v("x = 2")} → {v("~r")} : {BL["m"]}, {S}진리집합 {BL["m"]}</div>
{W(3)}
{P(6, "U가 자연수 전체의 집합일 때, 조건 p : x² > 10에 대하여 ~p와 그 진리집합을 구하시오.", T("84쪽 문제 4") + " " + GAME("★ 칸만"))}
<div class="q">{v("~p")} : {BL["l"]} &nbsp; {S}진리집합 : {BL["l"]}</div>
{MEMO}'''

rng = '공통수학2 Ⅱ. 집합과 명제 2. 명제 01. 명제와 조건 (8차시) · 레이드용 v5'
hd = header('8차시', rng)
goal = '<div class="goal"><b>학습목표</b> ① 명제와 그 부정의 뜻을 안다. ② 조건의 진리집합과 조건의 부정을 구할 수 있다.</div>'
pg = lambda g, l, r, n: f'<div class="page">{hd}{g}<div class="cols"><div class="col">{l}</div><div class="col">{r}</div></div><div class="pno">- 8차시 ({n}/2) -</div></div>'
html = f"<!DOCTYPE html><html><head><meta charset='utf-8'><title>학습과정 8차시 레이드용 v5</title><style>{CSS}{EXTRA}</style></head><body>{pg(goal + review, p1_left, p1_right, 1)}{pg('', p2_left, p2_right, 2)}</body></html>"
open(OUT.replace('.pdf', '.html'), 'w', encoding='utf-8').write(html)
with sync_playwright() as p:
    b = p.chromium.launch(); page = b.new_page(); page.set_content(html); page.wait_for_timeout(300)
    bot = page.evaluate("""() => [...document.querySelectorAll('.col')].map(c => { const k = [...c.children].filter(e => !e.classList.contains('memo')).pop(); return k ? Math.round((k.getBoundingClientRect().bottom - c.closest('.page').getBoundingClientRect().top) * 25.4 / 96) : 0 })""")
    page.pdf(path=OUT, format='A4', print_background=True, prefer_css_page_size=True); b.close()
print('단 아래끝:', bot)
