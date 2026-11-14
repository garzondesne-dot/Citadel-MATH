# 11차시 레이드용 v1 (2026-11-14 선생님 「추천대로」 · 손발 #7 · 📚 정식 차시 추가) · gen_ws10v1.py 기반
#   생각 열기 · STEP 1 대우를 이용한 증명법 · 2 수를 문자로 나타내기 · 몬스터 4 (공중 정원 이어 씀) · ⚔ 문제 3 = 교과서 문제 1 (✍ 서술형) · ⚔ 문제 4 = 중단원 09 · 형성평가 5
#   교과서 미래엔 91쪽(생각 열기 · 대우를 이용한 증명법 · 예제 1 · 문제 1) + 97쪽 중단원 마무리 09 + 옛 9차시 학습지 뒤쪽(대우 쓰기 「적어도 하나 ↔ 모두」)
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
body { font-size:10.2pt; line-height:1.55; } .q { margin:1.2mm 0; } h3 { margin:2.4mm 0 1.2mm 0; }
.hd .l { width:34mm; } .hd .rr { width:50mm; }
.word { border:1px dashed #9ab; padding:1mm 2mm; font-size:9pt; margin:1mm 0; }
.mon { display:flex; align-items:center; gap:2mm; margin:2mm 0 0.5mm 0; }
.mon .nm { font-size:8.6pt; color:#6b5a40; }
.review { border:1px solid #9bb; background:#f4f8fb; border-radius:2mm; padding:1.5mm 2.5mm; margin:1.5mm 0 2mm 0; font-size:9.4pt; }
.essay { border:1.5px solid #6a7fa8; border-radius:2mm; padding:1.5mm 2.5mm; margin:1.5mm 0; }
.essay .ln { border-bottom:1px dashed #b9c4d8; height:7mm; }
.hint { font-size:8.8pt; color:#6b4a00; background:#fff6dc; border-radius:1.5mm; padding:0.8mm 2mm; margin:1mm 0; }
.open { border:1px solid #c9b48a; background:#fffaf0; border-radius:2mm; padding:1.4mm 2.4mm; margin:1mm 0 1.5mm 0; font-size:9.2pt; }
.pf { border:1px solid #7a8aa8; border-radius:2mm; padding:1.2mm 2.4mm; margin:1mm 0; font-size:9.6pt; line-height:1.75; }
'''
P = lambda n, s, tag: f'<div class="q"><b class="ex">문제 {n})</b> {v(s)} {tag}</div>'
MON = lambda n, name: f'<div class="mon"><b class="ex">👾 몬스터 {n}</b> <span class="nm">{name}</span></div>'
W = lambda h: f'<div style="height:{h}mm"></div>'
IMP = '⇒'
LINE = '<span class="bl l"></span>'

review = f'''<div class="review"><b>🔁 전시 확인</b> (지난 시간) &nbsp;
① 명제와 그 대우의 참 · 거짓은 {BL["s"]}. &nbsp;
② {v("r")}은 {v("q")}이기 위한 충분조건, {v("p")}는 {v("q")}이기 위한 필요조건 → {v("R")} {BL["s"]} {v("Q")} {BL["s"]} {v("P")}</div>'''

p1_left = f'''
<h3>생각 열기 🎢</h3>
<div class="open">어느 놀이공원은 <b>그 지역 주민 또는 교복을 입은 사람</b>에게 입장료를 할인해 준다.<br>
① ‘교복을 입은 사람은 입장료를 할인받는다.’ — 참? 거짓? {BL["s"]}<br>
② ‘입장료를 할인받지 못한 사람은 교복을 입고 있지 않다.’ — 참? 거짓? {BL["s"]}<br>
<span class="mini">→ ②는 ①의 {BL["s"]}! 둘은 참 · 거짓이 같다.</span></div>
<h3>STEP 1 대우를 이용한 증명법</h3>
<div class="word">낱말 상자 [ 대우 · 참 · 역 ]</div>
<div class="box">어떤 명제가 참이면 그 대우도 참이고, 대우가 참이면 처음의 명제도 {BL["s"]}이므로<br>
어떤 명제가 참임을 증명하는 대신에 그 {BL["s"]}가 참임을 증명해도 된다.<br>
<span class="mini">대우 만들기 : {v("p → q")} 의 대우 = {v("~q → ~p")} (가정 · 결론을 <b>바꾸고</b> 둘 다 <b>부정</b>)<br>
⚠ 부정 : ‘적어도 하나는 홀수’ ↔ ‘모두 짝수’ &nbsp;·&nbsp; ‘모두 홀수’ ↔ ‘적어도 하나는 짝수’</span></div>
{MON(1, '거울 웅덩이 두꺼비')}
{P(1, "다음 명제의 대우를 쓰시오. (단, n, a, b는 자연수)", T("91쪽 예제 1") + " " + GAME("★ 칸만"))}
<div class="q">(1) {S}{v("n²")}이 짝수이면 {v("n")}도 짝수이다.<br>&nbsp;&nbsp;→ {LINE}</div>
<div class="q">(2) {S}{v("a + b")}가 홀수이면 {v("a")}, {v("b")} 중 적어도 하나는 홀수이다.<br>&nbsp;&nbsp;→ {LINE}</div>
<div class="q">(3) {S}<i class="v">ab</i>가 홀수이면 {v("a")}와 {v("b")}는 모두 홀수이다.<br>&nbsp;&nbsp;→ {LINE}</div>
{MEMO}'''

p1_right = f'''
<h3>STEP 2 수를 문자로 나타내기</h3>
<div class="box">{v("k")}가 자연수일 때<br>
&nbsp;짝수 = {v("2k")} &nbsp;·&nbsp; 홀수 = {BL["s"]} &nbsp;·&nbsp; 3의 배수 = {v("3k")}<br>
&nbsp;3의 배수가 <b>아닌</b> 수 = {v("3k − 1")} 또는 {BL["s"]}<br>
<span class="mini">보기 {v("2(□) + 1")} 꼴 → 홀수 · {v("3(□) + 1")} 꼴 → 3의 배수가 아님</span></div>
{MON(2, '충분 나비')}
{P(2, "빈칸을 채워 증명을 완성하시오.", T("91쪽 예제 1") + " " + GAME("★ 칸만"))}
<div class="q">명제 ‘자연수 {v("n")}에 대하여 {v("n²")}이 짝수이면 {v("n")}도 짝수이다.’</div>
<div class="pf">
(1) {S}대우 : {v("n")}이 {BL["s"]}이면 {v("n²")}도 {BL["s"]}이다.<br>
(2) {S}{v("n")}이 홀수이면 {v("n")} = {BL["m"]} ({v("k")}는 자연수)<br>
(3) {S}{v("n²")} = {v("(2k − 1)²")} = {v("4k² − 4k + 1")}<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= {v("2")}( {BL["m"]} ) {v("+ 1")}<br>
(4) {S}따라서 {v("n²")}도 {BL["s"]}이다. → 대우가 참이므로 주어진 명제도 참이다.</div>
<h3>📝 오늘 정리</h3>
<div class="box" style="font-size:9.6pt;line-height:1.7">
<b>명제 대신 대우를 증명</b> : {v("p → q")} 가 참 ⇔ {v("~q → ~p")} 가 참<br>
<b>증명 순서</b> : ① 대우 쓰기 → ② 수를 문자로({v("2k − 1")}, {v("3k − 1")} …) → ③ 식 정리 → ④ 대우 참 → 명제 참<br>
<b>세 조건</b> : 대우로 바꿔 화살표를 이으면 포함 관계가 보인다</div>
{MEMO}'''

p2_left = f'''
{MON(3, '쌍둥이 구름 정령 · ✍ 서술형')}
{P(3, "대우를 이용하여 다음 명제가 참임을 증명하시오.", T("91쪽 문제 1") + " " + GAME("소레이드 ★ 칸 · ✍ 서술형 📸"))}
<div class="q">‘자연수 {v("n")}에 대하여 {v("n²")}이 3의 배수이면 {v("n")}도 3의 배수이다.’</div>
<div class="pf">
① {S}대우 : {LINE}<br>
② {S}{v("n")}이 3의 배수가 아니면 {v("n")} = {v("3k − 1")} 또는 {v("n")} = {BL["m"]} ({v("k")}는 자연수)<br>
③ {S}{v("n = 3k − 1")}일 때<br>&nbsp;&nbsp;&nbsp;&nbsp;{v("n²")} = {v("9k² − 6k + 1")} = {v("3")}( {BL["m"]} ) {v("+ 1")}<br>
④ {S}{v("n = 3k − 2")}일 때<br>&nbsp;&nbsp;&nbsp;&nbsp;{v("n²")} = {v("9k² − 12k + 4")} = {v("3")}( {BL["m"]} ) {v("+ 1")}<br>
👑 {S}그러므로 {v("n²")}은 3의 배수가 {BL["s"]} → 대우가 참이므로 주어진 명제도 참이다.</div>
<div class="hint">💡 근거 : 명제가 참이면 그 대우도 참이고, 대우가 참이면 처음 명제도 {BL["s"]}이다.</div>
<div class="essay"><b>✍ 나의 풀이</b> <span class="mini">(대우 → 두 경우 식 정리 → 결론을 문장으로)</span>
<div class="ln"></div><div class="ln"></div><div class="ln"></div><div class="ln"></div><div class="ln"></div></div>
{MON(4, '필요 덩굴')}
{P(4, "세 조건 p, q, r에 대하여 두 명제 p → q와 ~r → ~q가 모두 참일 때, 항상 참인 명제를 보기에서 모두 고르시오.", T("97쪽 중단원 마무리 09") + " " + GAME("소레이드 ★ 칸"))}
<div class="q" style="font-size:9.6pt">보기 &nbsp;ㄱ. {v("q → r")} &nbsp;&nbsp;ㄴ. {v("~p → ~q")} &nbsp;&nbsp;ㄷ. {v("~r → ~p")} &nbsp;&nbsp;ㄹ. {v("p → ~r")}</div>
<div class="q">① {S}{v("~r → ~q")}의 대우 : {BL["m"]}<br>② {S}포함 관계 : ( &nbsp; ) ⊂ ( &nbsp; ) ⊂ ( &nbsp; )</div>
<div class="q">👑 {S}항상 참인 명제 : {BL["m"]}</div>
<div class="hint">💡 근거 : 명제가 참이면 그 {BL["s"]}도 참이다.</div>
{MEMO}'''

fq = lambda n, s, h: f'<div class="q">{n}. {s}</div>{W(h)}'
p2_right = f'''
<div class="fa" style="margin-top:0"><div class="tt">✔ 11차시 형성평가 <span class="mini" style="font-weight:400">(혼자 풀기 · 5문항)</span>{GAME("보스")}</div>
<div class="mon"><b class="ex">👑 보스</b> <span class="nm">필요충분의 천칭 수호자</span></div>
{fq(1, "어떤 명제의 대우가 참임을 보이면 처음 명제는 " + BL["s"] + "이다.", 6)}
{fq(2, "명제 ‘자연수 " + v("n") + "에 대하여 " + v("n²") + "이 홀수이면 " + v("n") + "도 홀수이다.’의 대우를 쓰시오.<br>→ " + LINE, 8)}
{fq(3, v("k") + "가 자연수일 때, 홀수를 " + v("k") + "로 나타내면 " + BL["m"] + "이다.", 6)}
{fq(4, v("n = 2k") + " (" + v("k") + "는 자연수)일 때 " + v("n²") + " = " + v("4k²") + " = " + v("2") + "( " + BL["m"] + " ) 이므로 " + v("n²") + "은 짝수이다.", 8)}
{fq(5, "두 명제 " + v("q → p") + ", " + v("~q → ~r") + "가 모두 참일 때, 다음 중 항상 참인 명제는?<br>&nbsp;① " + v("p → r") + " &nbsp; ② " + v("r → p") + " &nbsp; ③ " + v("p → q") + " &nbsp; ④ " + v("~r → ~p"), 10)}
<div class="mini" style="border-top:1px dashed #9bb;padding-top:1.5mm">맞은 개수 {BL["s"]} / 5 &nbsp;어려웠던 부분<br>{CB}대우 쓰기 {CB}적어도 · 모두 부정 {CB}홀수 · 짝수 나타내기 {CB}식 정리 {CB}세 조건</div></div>
<div class="add mini">🎯 <b>더 해 보고 싶다면</b> — 캠프의 복습 허수아비 · 👑 형성평가 재대결</div>'''

STAMP = '<div class="stampwrap" style="margin-top:auto"><div class="stamp"><span>확인 도장</span></div></div>'
rng = '공통수학2 Ⅱ. 집합과 명제 2. 명제 03. 명제의 증명 (11차시) · 레이드용 v1'
hd = header('11차시', rng)
goal = '<div class="goal"><b>학습목표</b> ① 대우를 이용한 증명법을 이해한다. ② 대우를 이용하여 간단한 명제가 참임을 증명할 수 있다.</div>'
pg = lambda g, l, r, n: f'<div class="page">{hd}{g}<div class="cols"><div class="col">{l}</div><div class="col">{r}</div></div><div class="pno">- 11차시 ({n}/2) -</div></div>'
html = f"<!DOCTYPE html><html><head><meta charset='utf-8'><title>학습과정 11차시 레이드용 v1</title><style>{CSS}{EXTRA}</style></head><body>{pg(goal + review, p1_left, p1_right, 1)}{pg('', p2_left, p2_right + STAMP, 2)}</body></html>"
open(OUT.replace('.pdf', '.html'), 'w', encoding='utf-8').write(html)
with sync_playwright() as p:
    b = p.chromium.launch(); page = b.new_page(); page.set_content(html); page.wait_for_timeout(300)
    bot = page.evaluate("""() => [...document.querySelectorAll('.col')].map(c => { const k = [...c.children].filter(e => !e.classList.contains('memo')).pop(); return k ? Math.round((k.getBoundingClientRect().bottom - c.closest('.page').getBoundingClientRect().top) * 25.4 / 96) : 0 })""")
    page.pdf(path=OUT, format='A4', print_background=True, prefer_css_page_size=True); b.close()
print('단 아래끝:', bot)
