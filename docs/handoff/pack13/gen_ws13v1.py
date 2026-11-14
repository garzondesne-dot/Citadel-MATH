# 13차시 레이드용 v1 (2026-11-14 선생님 「추천대로」 · 머리 방 메타인지 6) · gen_ws12v1.py 기반
#   생각 열기(반 나누기) · STEP 1 귀류법 · 2 예제 2 √2 흐름 · 몬스터 3 (공중 정원 이어 씀) · ⚔ 문제 3 = 교과서 92쪽 문제 2 (✍ 서술형) · 형성평가 5
#   교과서 미래엔 92쪽(귀류법 · 예제 2 · 문제 2) + 옛 10차시 학습지 앞쪽(결론 부정 쓰기 · 반 나누기)
import os, sys
WSD = '/tmp/claude-0/-home-user-Citadel-MATH/96641048-e4d5-5899-b47f-8ffcee49194e/scratchpad/rel/tools/worksheet'
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


review = f"""<div class="review"><b>🔁 전시 확인</b> (지난 시간) &nbsp;
① 결론을 부정하여 모순을 이끌어 내는 증명법 = {BL["m"]} &nbsp;
② ‘{v("a")}, {v("b")} 중 적어도 하나는 짝수’의 부정 = {BL["m"]}</div>"""

TB = 'style="width:100%;border-collapse:collapse;font-size:9.2pt;margin:1mm 0"'
TD = 'style="border:1px solid #c9b48a;padding:1.2mm 2mm;width:50%"'
p1_left = f"""
<h3>생각 열기 🔍</h3>
<div class="open">왼쪽 · 오른쪽 식의 다른 점을 찾아 보자.
<table {TB}><tr><td {TD}>{v("x² − 4x + 3 = 0")}</td><td {TD}>{v("(x − 1)² = x² − 2x + 1")}</td></tr>
<tr><td {TD}>{v("x² + 2x − 15 < 0")}</td><td {TD}>{v("(x − 1)² ≥ 0")}</td></tr>
<tr><td {TD}>특징) {BL["m"]}</td><td {TD}>특징) {BL["m"]}</td></tr></table>
<span class="mini">→ 왼쪽은 특정한 {v("x")}에서만 성립 · 오른쪽은 어떤 {v("x")}를 넣어도 성립</span></div>
<h3>STEP 1 절대부등식</h3>
<div class="word">낱말 상자 [ 절대부등식 · 모든 ]</div>
<div class="box">부등식의 문자에 {BL["s"]} 실수를 대입하여도 항상 성립하는 부등식을 {BL["m"]}이라고 한다.<br>
<span class="mini">예) {v("x² ≥ 0")}, {v("x² + 1 > 0")} &nbsp;·&nbsp; {v("x + 1 > 0")} 은 {v("x = −2")} 이면 거짓 → 절대부등식 아님</span></div>
{MON(1, '충분 나비')}
{P(1, "다음 부등식이 절대부등식이면 ○, 아니면 × 하시오.", GAME("★ 칸만"))}
<div class="q">(1) {S}{v("(a − b)² ≥ 0")} &nbsp;(&nbsp;&nbsp;&nbsp;&nbsp;) &nbsp;&nbsp;&nbsp; (2) {S}{v("|x − 2| ≥ 0")} &nbsp;(&nbsp;&nbsp;&nbsp;&nbsp;)</div>
<div class="q">(3) {S}{v("x² + x + 1 < 0")} &nbsp;(&nbsp;&nbsp;&nbsp;&nbsp;) &nbsp;&nbsp;&nbsp; (4) {S}{v("|a + 3| > 1")} &nbsp;(&nbsp;&nbsp;&nbsp;&nbsp;)</div>
{MEMO}"""

p1_right = f"""
<h3>STEP 2 완전제곱식으로 증명하기</h3>
<div class="word">낱말 상자 [ 완전제곱식 · 등호 ]</div>
<div class="box" style="font-size:9.4pt;line-height:1.7">
<b>예</b> {v("a² + b² ≥ 2ab")} 증명<br>
(좌변) − (우변) = {v("a² − 2ab + b²")} = {v("(a − b)²")} ≥ 0 ← {BL["m"]}의 값은 0 이상<br>
{BL["s"]}는 {v("a = b")} 일 때 성립</div>
{MON(2, '필요 덩굴')}
{P(2, "실수 " + v("x") + "에 대하여 부등식 " + v("x² + 9 ≥ 6x") + "가 성립함을 증명하시오.", GAME("★ 칸만"))}
<div class="pf">
(1) {S}(좌변) − (우변) = {BL["m"]}<br>
(2) {S}= ( {BL["m"]} )²<br>
(3) {S}(□)² ≥ 0 이므로 {v("x² + 9")} {BL["s"]} {v("6x")}<br>
(4) {S}등호는 {v("x")} = {BL["s"]} 일 때 성립한다.</div>
<h3>STEP 3 산술평균과 기하평균</h3>
<div class="word">낱말 상자 [ 산술평균 · 기하평균 · 등호 ]</div>
<div class="box" style="font-size:9.4pt;line-height:1.7">
{v("a > 0")}, {v("b > 0")} 일 때 &nbsp;<b>{v("(a + b) / 2 ≥ √(ab)")}</b> &nbsp;({BL["s"]}는 {v("a = b")} 일 때)<br>
{v("(a + b) / 2")} = {BL["m"]} &nbsp;·&nbsp; {v("√(ab)")} = {BL["m"]}<br>
<span class="mini">→ {v("a + b ≥ 2√(ab)")} : 곱이 일정하면 합의 최솟값 · 합이 일정하면 곱의 최댓값</span></div>

<h3>📝 오늘 정리</h3>
<div class="box" style="font-size:9.6pt;line-height:1.7">
<b>절대부등식</b> : 문자에 어떤 실수를 넣어도 항상 성립하는 부등식<br>
<b>증명 순서</b> : ① (좌변) − (우변) → ② 완전제곱식 (□)² ≥ 0 → ③ 등호 조건<br>
<b>산술 · 기하평균</b> : {v("a > 0")}, {v("b > 0")} → {v("a + b ≥ 2√(ab)")} · 등호 {v("a = b")}</div>
{MEMO}"""

p2_left = f"""
{MON(3, '천칭 가고일')}
{P(3, v("x > 0") + " 일 때, " + v("x + 4/x") + " 의 최솟값을 구하시오.", GAME("★ 칸만"))}
<div class="pf">
(1) {S}두 수의 곱 {v("x × (4/x)")} = {BL["s"]}<br>
(2) {S}{v("x + 4/x ≥ 2√4")} = {BL["s"]}<br>
(3) {S}등호는 {v("x = 4/x")}, 즉 {v("x")} = {BL["s"]} 일 때 성립한다.</div>
{MON(4, '쌍둥이 구름 정령 · ✍ 서술형')}
{P(4, v("a > 0") + ", " + v("b > 0") + " 일 때, " + v("(a + 2/b)(b + 8/a)") + " 의 최솟값을 구하시오.", GAME("소레이드 ★ 칸 · ✍ 서술형 📸"))}
<div class="pf">
① {S}전개 : {v("(a + 2/b)(b + 8/a) = ab + 16/(ab) +")} {BL["s"]}<br>
② {S}{v("a > 0")}, {v("b > 0")} 이므로 {v("ab")} {BL["s"]} 0 → 산술평균 · 기하평균을 쓸 수 있다<br>
③ {S}{v("ab + 16/(ab) ≥ 2√16")} = {BL["s"]}<br>
④ {S}등호는 {v("ab = 16/(ab)")}, 즉 {v("ab")} = {BL["s"]} 일 때<br>
👑 {S}그러므로 최솟값은 {BL["s"]}</div>
<div class="hint">💡 근거 : {v("a > 0")}, {v("b > 0")} 이면 {v("a + b ≥")} {BL["m"]} (산술평균과 기하평균의 관계)</div>
<div class="essay"><b>✍ 나의 풀이</b> <span class="mini">(전개 → 양수 확인 → 산술 · 기하평균 → 등호 조건 → 최솟값)</span>
<div class="ln"></div><div class="ln"></div><div class="ln"></div><div class="ln"></div><div class="ln"></div></div>
{MEMO}"""

fq = lambda n, s, h: f'<div class="q">{n}. {s}</div>{W(h)}'
p2_right = f'''
<div class="fa" style="margin-top:0"><div class="tt">✔ 13차시 형성평가 <span class="mini" style="font-weight:400">(혼자 풀기 · 5문항)</span>{GAME("보스")}</div>
<div class="mon"><b class="ex">👑 보스</b> <span class="nm">필요충분의 천칭 수호자</span></div>
{fq(1, "문자에 어떤 실수를 넣어도 항상 성립하는 부등식을 " + BL["m"] + "이라고 한다.", 5)}
{fq(2, "다음 중 절대부등식인 것은? ( &nbsp;&nbsp;&nbsp; )<br>① " + v("x > 1") + " &nbsp;② " + v("x² + 2 > 0") + " &nbsp;③ " + v("x² > 0"), 5)}
{fq(3, v("x² − 4x + 4") + " = ( " + BL["m"] + " )² ≥ 0", 5)}
{fq(4, v("x > 0") + " 일 때 " + v("x + 9/x") + " 의 최솟값은 " + BL["s"] + "이다.", 7)}
{fq(5, v("a > 0") + ", " + v("b > 0") + ", " + v("a + b = 10") + " 일 때 " + v("ab") + " 의 최댓값은 " + BL["s"] + "이다.", 7)}
<div class="mini" style="border-top:1px dashed #9bb;padding-top:1.5mm">맞은 개수 {BL["s"]} / 5 &nbsp;어려웠던 부분<br>{CB}절대부등식 뜻 {CB}완전제곱식 {CB}등호 조건 {CB}산술 · 기하평균</div></div>
<div class="add mini">🎯 <b>더 해 보고 싶다면</b> — 캠프의 복습 허수아비 · 👑 형성평가 재대결</div>'''
STAMP = '<div class="stampwrap" style="margin-top:auto"><div class="stamp"><span>확인 도장</span></div></div>'
rng = '공통수학2 Ⅱ. 집합과 명제 2. 명제 03. 명제의 증명 (13차시) · 레이드용 v1'
hd = header('13차시', rng)
goal = '<div class="goal"><b>학습목표</b> ① 절대부등식의 뜻을 안다. ② 완전제곱식과 산술평균 · 기하평균의 관계를 이용하여 간단한 절대부등식을 증명할 수 있다.</div>'
pg = lambda g, l, r, n: f'<div class="page">{hd}{g}<div class="cols"><div class="col">{l}</div><div class="col">{r}</div></div><div class="pno">- 13차시 ({n}/2) -</div></div>'
html = f"<!DOCTYPE html><html><head><meta charset='utf-8'><title>학습과정 13차시 레이드용 v1</title><style>{CSS}{EXTRA}</style></head><body>{pg(goal + review, p1_left, p1_right, 1)}{pg('', p2_left, p2_right + STAMP, 2)}</body></html>"
open(OUT.replace('.pdf', '.html'), 'w', encoding='utf-8').write(html)
with sync_playwright() as p:
    b = p.chromium.launch(); page = b.new_page(); page.set_content(html); page.wait_for_timeout(300)
    bot = page.evaluate("""() => [...document.querySelectorAll('.col')].map(c => { const k = [...c.children].filter(e => !e.classList.contains('memo')).pop(); return k ? Math.round((k.getBoundingClientRect().bottom - c.closest('.page').getBoundingClientRect().top) * 25.4 / 96) : 0 })""")
    page.pdf(path=OUT, format='A4', print_background=True, prefer_css_page_size=True); b.close()
print('단 아래끝:', bot)
