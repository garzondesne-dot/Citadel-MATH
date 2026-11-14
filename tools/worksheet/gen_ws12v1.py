# 12차시 레이드용 v1 (2026-11-14 선생님 「추천대로 12차시 PDF 만들어줘」 · 손발 #7) · gen_ws11v1.py 기반
#   생각 열기(반 나누기) · STEP 1 귀류법 · 2 예제 2 √2 흐름 · 몬스터 3 (공중 정원 이어 씀) · ⚔ 문제 3 = 교과서 92쪽 문제 2 (✍ 서술형) · 형성평가 5
#   교과서 미래엔 92쪽(귀류법 · 예제 2 · 문제 2) + 옛 10차시 학습지 앞쪽(결론 부정 쓰기 · 반 나누기)
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

review = f"""<div class="review"><b>🔁 전시 확인</b> (지난 시간) &nbsp;
① 명제가 참임을 증명하는 대신에 그 {BL["s"]}가 참임을 증명해도 된다. &nbsp;
② 자연수 {v("n")}에 대하여 {v("n²")}이 짝수이면 {v("n")}도 {BL["s"]}이다.</div>"""

p1_left = f"""
<h3>생각 열기 🏫</h3>
<div class="open">학생 10명을 3개 반으로 나누면, <b>어떤 반은 4명 이상</b>일까?<br>
① ‘모든 반이 3명 이하’라고 가정하면 학생은 많아야 {BL["s"]}명이다.<br>
② 그런데 학생은 10명이다. → 가정이 {BL["s"]}! 따라서 어떤 반은 4명 이상이다.<br>
<span class="mini">→ 결론을 <b>아니라고</b> 가정했더니 말이 안 되면, 처음 결론이 맞다.</span></div>
<h3>STEP 1 귀류법</h3>
<div class="word">낱말 상자 [ 부정 · 모순 · 귀류법 ]</div>
<div class="box">어떤 명제가 참임을 증명할 때, 그 명제의 {BL["s"]}이 참이라 가정하면 이미 알려진 사실에 {BL["s"]}이 생긴다는 것을 보여도 된다.<br>
이와 같이 증명하는 방법을 {BL["m"]}이라고 한다.<br>
<span class="mini">처음 가정 = 결론의 부정 · ⚠ ‘또는’의 부정 = ‘그리고(이고)’ · ‘적어도 하나’의 부정 = ‘모두 ~ 아님’</span></div>
{MON(1, '천칭 가고일')}
{P(1, "다음 명제를 귀류법으로 증명할 때, 처음에 무엇을 가정하는지 쓰시오.", T("92쪽") + " " + GAME("★ 칸만"))}
<div class="q">(1) {S}√3은 유리수가 아니다.<br>&nbsp;&nbsp;→ {LINE}</div>
<div class="q">(2) {S}소수는 무수히 많다.<br>&nbsp;&nbsp;→ {LINE}</div>
<div class="q">(3) {S}실수 {v("a")}, {v("b")}에 대하여 {v("a + b > 2")}이면 {v("a > 1")} 또는 {v("b > 1")}이다.<br>&nbsp;&nbsp;→ {LINE}</div>
{MEMO}"""

p1_right = f"""
<h3>STEP 2 √2 는 유리수가 아니다</h3>
<div class="box" style="font-size:9.4pt;line-height:1.7">
√2 가 유리수라 하면 √2 = {v("n")} / {v("m")} ({v("m")}, {v("n")}은 서로소인 자연수)<br>
→ {v("n = ")}√2{v("m")} → 양변을 제곱 → {v("n² = 2m²")} → {v("n²")} 짝수 → {v("n")} 짝수<br>
→ {v("n = 2k")} 를 넣으면 {v("4k² = 2m²")} → {v("m² = 2k²")} → {v("m")} 짝수<br>
→ {v("m")}, {v("n")} 모두 짝수 → <b>서로소</b>에 모순 → √2 는 유리수가 아니다.</div>
{MON(2, '거울 웅덩이 두꺼비')}
{P(2, "빈칸을 채워 증명을 완성하시오.", T("92쪽 예제 2") + " " + GAME("★ 칸만"))}
<div class="q">명제 ‘√2 는 유리수가 아니다.’</div>
<div class="pf">
(1) {S}처음 가정 : √2 는 {BL["s"]}이다.<br>
(2) {S}{v("n = ")}√2{v("m")}의 양변을 제곱하면 {v("n²")} = {BL["m"]}<br>
(3) {S}{v("n = 2k")}를 대입하면 {v("4k² = 2m²")}, 즉 {v("m²")} = {BL["m"]}<br>
(4) {S}{v("m")}, {v("n")}이 모두 짝수 → {v("m")}, {v("n")}이 {BL["s"]}라는 것에 모순이다.</div>
<h3>📝 오늘 정리</h3>
<div class="box" style="font-size:9.6pt;line-height:1.7">
<b>귀류법</b> : 결론을 부정 → 모순 → 처음 명제가 참<br>
<b>순서</b> : ① 결론의 부정을 가정 → ② 식 · 사실로 따라가기 → ③ 알려진 사실과 모순 → ④ 결론<br>
<b>대우 증명과 다름</b> : 대우 = 가정 · 결론을 바꾸고 둘 다 부정 / 귀류법 = 결론만 부정해 모순 찾기</div>
{MEMO}"""

p2_left = f"""
{MON(3, '쌍둥이 구름 정령 · ✍ 서술형')}
{P(3, "귀류법을 이용하여 다음 명제가 참임을 증명하시오.", T("92쪽 문제 2") + " " + GAME("소레이드 ★ 칸 · ✍ 서술형 📸"))}
<div class="q">‘1 + √2 는 유리수가 아니다.’</div>
<div class="pf">
① {S}처음 가정 : {LINE}<br>
② {S}1 + √2 = {v("a")} ({v("a")}는 유리수)로 놓으면 √2 = {BL["m"]}<br>
③ {S}{v("a")}가 유리수이면 {v("a − 1")}은 {BL["s"]}이다.<br>
④ {S}그러면 √2 가 유리수가 된다. → ‘√2 는 {BL["m"]}’(예제 2)에 모순<br>
👑 {S}그러므로 {LINE}</div>
<div class="hint">💡 근거 : 유리수끼리의 합 · 차는 {BL["s"]}이다.</div>
<div class="essay"><b>✍ 나의 풀이</b> <span class="mini">(처음 가정 → 식 정리 → 무엇과 모순인지 → 결론을 문장으로)</span>
<div class="ln"></div><div class="ln"></div><div class="ln"></div><div class="ln"></div><div class="ln"></div><div class="ln"></div></div>
{MEMO}"""

fq = lambda n, s, h: f'<div class="q">{n}. {s}</div>{W(h)}'
p2_right = f'''
<div class="fa" style="margin-top:0"><div class="tt">✔ 12차시 형성평가 <span class="mini" style="font-weight:400">(혼자 풀기 · 5문항)</span>{GAME("보스")}</div>
<div class="mon"><b class="ex">👑 보스</b> <span class="nm">필요충분의 천칭 수호자</span></div>
{fq(1, "명제의 결론을 부정하여 모순을 이끌어 내는 증명법을 " + BL["m"] + "이라고 한다.", 6)}
{fq(2, "명제 ‘√5 는 유리수가 아니다.’를 귀류법으로 증명할 때, 처음에 가정하는 것을 쓰시오.<br>→ " + LINE, 8)}
{fq(3, "‘" + v("a") + ", " + v("b") + " 중 적어도 하나는 짝수이다.’의 부정을 쓰시오. (단, " + v("a") + ", " + v("b") + "는 자연수)<br>→ " + LINE, 8)}
{fq(4, v("n² = 2m²") + "에 " + v("n = 2k") + "를 대입하면 " + v("m²") + " = " + BL["m"] + "이다.", 8)}
{fq(5, "학생 13명을 4개 반으로 나누면 어떤 반은 4명 이상이다. 이것을 귀류법으로 보일 때 처음에 가정하는 것을 쓰시오.<br>→ " + LINE, 10)}
<div class="mini" style="border-top:1px dashed #9bb;padding-top:1.5mm">맞은 개수 {BL["s"]} / 5 &nbsp;어려웠던 부분<br>{CB}처음 가정(결론 부정) {CB}또는 · 적어도 하나 부정 {CB}√2 식 정리 {CB}무엇과 모순인지</div></div>
<div class="add mini">🎯 <b>더 해 보고 싶다면</b> — 캠프의 복습 허수아비 · 👑 형성평가 재대결</div>'''
STAMP = '<div class="stampwrap" style="margin-top:auto"><div class="stamp"><span>확인 도장</span></div></div>'
rng = '공통수학2 Ⅱ. 집합과 명제 2. 명제 03. 명제의 증명 (12차시) · 레이드용 v1'
hd = header('12차시', rng)
goal = '<div class="goal"><b>학습목표</b> ① 귀류법을 이해한다. ② 귀류법을 이용하여 간단한 명제가 참임을 증명할 수 있다.</div>'
pg = lambda g, l, r, n: f'<div class="page">{hd}{g}<div class="cols"><div class="col">{l}</div><div class="col">{r}</div></div><div class="pno">- 12차시 ({n}/2) -</div></div>'
html = f"<!DOCTYPE html><html><head><meta charset='utf-8'><title>학습과정 12차시 레이드용 v1</title><style>{CSS}{EXTRA}</style></head><body>{pg(goal + review, p1_left, p1_right, 1)}{pg('', p2_left, p2_right + STAMP, 2)}</body></html>"
open(OUT.replace('.pdf', '.html'), 'w', encoding='utf-8').write(html)
with sync_playwright() as p:
    b = p.chromium.launch(); page = b.new_page(); page.set_content(html); page.wait_for_timeout(300)
    bot = page.evaluate("""() => [...document.querySelectorAll('.col')].map(c => { const k = [...c.children].filter(e => !e.classList.contains('memo')).pop(); return k ? Math.round((k.getBoundingClientRect().bottom - c.closest('.page').getBoundingClientRect().top) * 25.4 / 96) : 0 })""")
    page.pdf(path=OUT, format='A4', print_background=True, prefer_css_page_size=True); b.close()
print('단 아래끝:', bot)
