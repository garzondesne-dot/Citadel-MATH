# 10차시 레이드용 v1 (2026-11-12 선생님 「진행」 · 손발 #7 · 📚 정식 차시 추가) · gen_ws9v1.py 기반
#   STEP 1 충분조건 · 필요조건 · 2 필요충분조건과 진리집합 · 3 🔭 생각 넓히기(세 조건) · 몬스터 4(공중 정원) · ✍ 중단원 04 · 형성평가 4
#   교과서 미래엔 89~90쪽(정의 · 예제 2 · 문제 4 · 생각 넓히기) + 96쪽 중단원 마무리 04
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
body { font-size:10.2pt; line-height:1.55; } .q { margin:1.3mm 0; } h3 { margin:2.6mm 0 1.2mm 0; }
.hd .l { width:34mm; } .hd .rr { width:50mm; }
.word { border:1px dashed #9ab; padding:1mm 2mm; font-size:9pt; margin:1mm 0; }
.mon { display:flex; align-items:center; gap:2mm; margin:2mm 0 0.5mm 0; }
.mon .nm { font-size:8.6pt; color:#6b5a40; }
.review { border:1px solid #9bb; background:#f4f8fb; border-radius:2mm; padding:1.5mm 2.5mm; margin:1.5mm 0 2mm 0; font-size:9.4pt; }
.essay { border:1.5px solid #6a7fa8; border-radius:2mm; padding:1.5mm 2.5mm; margin:1.5mm 0; }
.essay .ln { border-bottom:1px dashed #b9c4d8; height:7mm; }
.hint { font-size:8.8pt; color:#6b4a00; background:#fff6dc; border-radius:1.5mm; padding:0.8mm 2mm; margin:1mm 0; }
'''
P = lambda n, s, tag: f'<div class="q"><b class="ex">문제 {n})</b> {v(s)} {tag}</div>'
MON = lambda n, name: f'<div class="mon"><b class="ex">👾 몬스터 {n}</b> <span class="nm">{name}</span></div>'
W = lambda h: f'<div style="height:{h}mm"></div>'
K3 = '( 충분 / 필요 / 필요충분 )조건'
K2 = '( 충분 / 필요 )조건'
IMP = '⇒'

review = f'''<div class="review"><b>🔁 전시 확인</b> (지난 시간) &nbsp;
① 명제 {v("p → q")}가 참이면 진리집합 사이에 {v("P")} {BL["s"]} {v("Q")} &nbsp;
② 명제와 그 대우의 참 · 거짓은 {BL["s"]}.</div>'''

p1_left = f'''
<h3>STEP 1 충분조건과 필요조건</h3>
<div class="word">낱말 상자 [ 충분 · 필요 · 필요충분 ]</div>
<div class="box">명제 {v("p → q")}가 참일 때, 이것을 기호로 {v("p ⇒ q")}와 같이 나타낸다. 이때<br>
&nbsp;&nbsp;{v("p")}는 {v("q")}이기 위한 {BL["s"]}조건, &nbsp;{v("q")}는 {v("p")}이기 위한 {BL["s"]}조건<br>
이라고 한다. <span class="mini">(화살표가 <b>나가는</b> 쪽 = 충분 · 화살표를 <b>받는</b> 쪽 = 필요)</span><br>
<span class="mini">보기 ‘{v("a")}는 4의 배수’ {IMP} ‘{v("a")}는 2의 배수’ — 4의 배수이면 2의 배수가 되기에 <b>충분</b>하고, 2의 배수인 것은 4의 배수가 되기 위해 꼭 <b>필요</b>하다.</span></div>
{MON(1, '충분 나비')}
{P(1, "빈칸에 알맞은 말을 고르시오.", T("89쪽") + " " + GAME("★ 칸만"))}
<div class="q">{v("p")} : {v("x")}는 4의 배수이다. &nbsp; {v("q")} : {v("x")}는 2의 배수이다. &nbsp;→ {v("p ⇒ q")}</div>
<div class="q">(1) {S}{v("p")}는 {v("q")}이기 위한 {K2}</div>
<div class="q">(2) {S}{v("q")}는 {v("p")}이기 위한 {K2}</div>
<div class="q">(3) {S}{v("x = 2")} {IMP} {v("x² = 4")} 이므로 {v("x² = 4")}는 {v("x = 2")}이기 위한 {K2}</div>
{MEMO}'''

venn = '''<svg viewBox="0 0 150 92" width="40mm" height="25mm" xmlns="http://www.w3.org/2000/svg" font-family="DejaVu Serif" font-style="italic" font-size="12">
<rect x="2" y="2" width="146" height="88" rx="6" fill="#fbfaf6" stroke="#7a6a50"/>
<ellipse cx="75" cy="48" rx="66" ry="38" fill="#eef7ee" stroke="#3f8a4f"/><text x="18" y="30" fill="#3f8a4f" font-weight="700">P</text>
<ellipse cx="85" cy="52" rx="44" ry="26" fill="#f3f7fb" stroke="#4a6fa5"/><text x="50" y="44" fill="#4a6fa5" font-weight="700">Q</text>
<ellipse cx="96" cy="56" rx="22" ry="13" fill="#ffe9d6" stroke="#c46a1a"/><text x="92" y="61" fill="#c46a1a" font-weight="700">R</text></svg>'''

p2_left = f'''
<h3>STEP 3 🔭 생각 넓히기 — 세 조건</h3>
<div class="box">세 조건 {v("p")}, {v("q")}, {v("r")}의 진리집합을 각각 {v("P")}, {v("Q")}, {v("R")}라 하자.<br>
‘{v("p")}는 {v("q")}이기 위한 필요조건’ → {v("q ⇒ p")} → {v("Q")} {BL["s"]} {v("P")}<br>
‘{v("r")}은 {v("q")}이기 위한 충분조건’ → {v("r ⇒ q")} → {v("R")} {BL["s"]} {v("Q")}
<div style="display:flex;gap:2mm;align-items:center">{venn}<div style="font-size:8.6pt;line-height:1.45">따라서 {v("R ⊂ Q ⊂ P")}<br>안쪽 집합의 조건 {IMP} 바깥쪽 집합의 조건<br><span class="mini">(예: {v("r ⇒ p")}는 참)</span></div></div></div>
{MON(3, '필요 덩굴')}
{P(3, "세 조건 p, q, r에 대하여 p는 q이기 위한 필요조건이고, r은 q이기 위한 충분조건일 때 물음에 답하시오.", T("90쪽 생각 넓히기") + " " + GAME("★ 칸만"))}
<div class="q">(1) {S}{v("P")}, {v("Q")}, {v("R")} 사이의 포함 관계 : ( &nbsp;&nbsp; ) ⊂ ( &nbsp;&nbsp; ) ⊂ ( &nbsp;&nbsp; )</div>
<div class="q">(2) {S}다음 중 참인 명제를 모두 고르시오.<br>&nbsp;&nbsp;ㄱ. {v("r → p")} &nbsp;&nbsp; ㄴ. {v("q → ~p")} &nbsp;&nbsp; ㄷ. {v("~q → ~r")} &nbsp;&nbsp; ㄹ. {v("~p → r")}</div>
<div class="hint">💡 {v("~q → ~r")}는 {v("r → q")}의 {BL["s"]}이다.</div>
{MON(4, '쌍둥이 구름 정령 · ✍ 서술형')}
{P(4, "두 조건 p, q가 다음과 같을 때, p는 q이기 위한 어떤 조건인지 말하시오. (단, x, a, b는 실수)", T("96쪽 중단원 마무리 04") + " " + GAME("★ 칸 · ✍ 서술형 📸"))}
<div class="q">(1) {S}{v("p")} : {v("x ≤ 1")}, &nbsp;{v("q")} : {v("−3 ≤ x ≤ 0")} &nbsp;→ {v("P")}, {v("Q")}의 포함 관계 {BL["s"]} → {BL["s"]}조건</div>
<div class="q">(2) {S}{v("p")} : {v("a = b")}, &nbsp;{v("q")} : {v("a² = b²")} &nbsp;→ {v("q ⇒ p")}의 반례 {BL["s"]} → {BL["s"]}조건</div>
<div class="q">(3) {S}{v("p")} : {v("|x| ≤ 1")}, &nbsp;{v("q")} : {v("−1 ≤ x ≤ 1")} &nbsp;→ {BL["s"]}조건</div>
<div class="hint">💡 근거 : {v("q ⇒ p")}이면 {v("p")}는 {v("q")}이기 위한 {BL["s"]}조건이다.</div>
<div class="essay"><b>✍ 나의 풀이</b> <span class="mini">(진리집합의 포함 관계 · 반례 → 어떤 조건인지와 그 까닭을 문장으로)</span>
<div class="ln"></div><div class="ln"></div><div class="ln"></div><div class="ln"></div></div>
{MEMO}'''

p1_right = f'''
<h3>STEP 2 필요충분조건 · 진리집합으로 판정</h3>
<div class="box">{v("p ⇒ q")}이고 {v("q ⇒ p")}일 때, 이것을 기호로 {v("p ⇔ q")}와 같이 나타내고, {v("p")}는 {v("q")}이기 위한 {BL["m"]}조건이라고 한다.<br>
두 조건 {v("p")}, {v("q")}의 진리집합을 {v("P")}, {v("Q")}라 할 때<br>
&nbsp;{v("P ⊂ Q")} → {v("p")}는 {v("q")}이기 위한 충분조건 &nbsp;·&nbsp; {v("Q ⊂ P")} → 필요조건 &nbsp;·&nbsp; {v("P = Q")} → 필요충분조건</div>
{MON(2, '천칭 가고일')}
{P(2, "p는 q이기 위한 어떤 조건인지 말하시오.", T("90쪽 예제 2 · 문제 4") + " " + GAME("★ 칸만"))}
<div class="q">(1) {S}{v("p")} : {v("x")}는 3의 배수이다. &nbsp;{v("q")} : {v("x")}는 9의 배수이다. &nbsp;{BL["s"]}조건</div>
<div class="q">(2) {S}{v("p")} : {v("x² ≤ 25")} &nbsp;&nbsp;{v("q")} : {v("|x| ≤ 5")} &nbsp;{BL["s"]}조건</div>
<div class="q">(3) {S}{v("p")} : {v("a = 0")}이고 {v("b = 0")} &nbsp;{v("q")} : {v("ab = 0")} &nbsp;{BL["s"]}조건</div>
<div class="q">(4) {S}{v("p")} : {v("2x − 1 < 5")} &nbsp;&nbsp;{v("q")} : {v("−1 < 2 − x")} &nbsp;{BL["s"]}조건</div>
{MEMO}'''

fq = lambda n, s, h: f'<div class="q">{n}. {s}</div>{W(h)}'
p2_right = f'''
<div class="fa" style="margin-top:0"><div class="tt">✔ 10차시 형성평가 <span class="mini" style="font-weight:400">(혼자 풀기 · 4문항)</span>{GAME("보스")}</div>
<div class="mon"><b class="ex">👑 보스</b> <span class="nm">필요충분의 천칭 수호자</span></div>
<div class="q mini">1 ~ 3. 두 조건 {v("p")}, {v("q")}에 대하여 {v("p")}는 {v("q")}이기 위한 어떤 조건인지 말하시오. <span class="mini">(단, {v("x")}는 실수)</span></div>
{fq(1, v("p") + " : " + v("x") + "는 2의 배수이다. &nbsp;" + v("q") + " : " + v("x") + "는 4의 배수이다. &nbsp;" + BL["s"] + "조건", 11)}
{fq(2, v("p") + " : " + v("x > 3") + " &nbsp;&nbsp;" + v("q") + " : " + v("x > 1") + " &nbsp;" + BL["s"] + "조건", 11)}
{fq(3, v("p") + " : " + v("|x| ≤ 2") + " &nbsp;&nbsp;" + v("q") + " : " + v("−2 ≤ x ≤ 2") + " &nbsp;" + BL["s"] + "조건", 11)}
{fq(4, "세 조건 " + v("p") + ", " + v("q") + ", " + v("r") + "에 대하여 " + v("q") + "는 " + v("p") + "이기 위한 필요조건이고, " + v("r") + "은 " + v("q") + "이기 위한 필요조건일 때, 진리집합 " + v("P") + ", " + v("Q") + ", " + v("R") + " 사이의 포함 관계를 쓰시오.", 14)}
<div class="mini" style="border-top:1px dashed #9bb;padding-top:1.5mm">맞은 개수 {BL["s"]} / 4 &nbsp;어려웠던 부분<br>{CB}충분 · 필요 뜻 {CB}진리집합으로 판정 {CB}반례 {CB}필요충분 {CB}세 조건</div></div>
<div class="add mini">🎯 <b>더 해 보고 싶다면</b> — 캠프의 복습 허수아비 · 👑 형성평가 재대결</div>'''

SUMMARY = f'''
<h3>📝 오늘 정리</h3>
<div class="box" style="font-size:9.6pt;line-height:1.7">
<b>{v("p ⇒ q")}</b> 일 때 &nbsp;{v("p")} = {v("q")}이기 위한 <b>충분조건</b> · {v("q")} = {v("p")}이기 위한 <b>필요조건</b><br>
<b>{v("p ⇔ q")}</b> 일 때 &nbsp;{v("p")} = {v("q")}이기 위한 <b>필요충분조건</b><br>
<b>진리집합</b> &nbsp;{v("P ⊂ Q")} → 충분 &nbsp;·&nbsp; {v("Q ⊂ P")} → 필요 &nbsp;·&nbsp; {v("P = Q")} → 필요충분<br>
<span class="mini">⚠ 한쪽 화살표만 참인지 확인할 때 = 반례 하나로 끝!</span></div>
'''
STAMP = '<div class="stampwrap" style="margin-top:auto"><div class="stamp"><span>확인 도장</span></div></div>'

rng = '공통수학2 Ⅱ. 집합과 명제 2. 명제 02. 명제 사이의 관계 (10차시) · 레이드용 v1'
hd = header('10차시', rng)
goal = '<div class="goal"><b>학습목표</b> ① 충분조건 · 필요조건 · 필요충분조건의 뜻을 안다. ② 진리집합의 포함 관계로 충분조건 · 필요조건 · 필요충분조건을 판정할 수 있다.</div>'
pg = lambda g, l, r, n: f'<div class="page">{hd}{g}<div class="cols"><div class="col">{l}</div><div class="col">{r}</div></div><div class="pno">- 10차시 ({n}/2) -</div></div>'
html = f"<!DOCTYPE html><html><head><meta charset='utf-8'><title>학습과정 10차시 레이드용 v1</title><style>{CSS}{EXTRA}</style></head><body>{pg(goal + review, p1_left[:p1_left.rindex(MEMO)] + SUMMARY + MEMO, p1_right, 1)}{pg('', p2_left, p2_right + STAMP, 2)}</body></html>"
open(OUT.replace('.pdf', '.html'), 'w', encoding='utf-8').write(html)
with sync_playwright() as p:
    b = p.chromium.launch(); page = b.new_page(); page.set_content(html); page.wait_for_timeout(300)
    bot = page.evaluate("""() => [...document.querySelectorAll('.col')].map(c => { const k = [...c.children].filter(e => !e.classList.contains('memo')).pop(); return k ? Math.round((k.getBoundingClientRect().bottom - c.closest('.page').getBoundingClientRect().top) * 25.4 / 96) : 0 })""")
    page.pdf(path=OUT, format='A4', print_background=True, prefer_css_page_size=True); b.close()
print('단 아래끝:', bot)
