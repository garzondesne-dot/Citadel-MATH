# 14차시 레이드용 v1 「함수」 (2026-11-20 · 손발 #7 · 메타인지 8 컨펌 #1 = A 몬스터 3 · B1 지금 꼴 · C1 🔑 열쇠) · gen_ws13v2.py 기반
#   교과서 미래엔 공통수학2 106~108쪽(함수 · 정의역 · 공역 · 치역 · 서로 같은 함수) + 중단원 마무리 05(119쪽)
#   몬스터 1 = 문제 1(대응 그림) · 몬스터 2 = 문제 2(정의역 · 치역) · 몬스터 3 = 중단원 05 ⚔ 소레이드 · 형성평가 4
#   실행: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tools/worksheet/gen_ws14v1.py <출력.pdf>
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wslib import CSS, v, BL, CB, GAME, header
from keybox import KCSS
from playwright.sync_api import sync_playwright
OUT = sys.argv[1]
S = '<b style="color:#d32f2f">★</b>'
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
.dg { display:flex; gap:1.5mm; justify-content:space-between; margin:0.5mm 0; }
.dg .one { text-align:center; font-size:8.6pt; }
.chk { border:1px dashed #8aa; border-radius:1.5mm; padding:0.8mm 2mm; font-size:8.8pt; margin:1mm 0; }
'''
P = lambda n, s, tag: f'<div class="q"><b class="ex">문제 {n})</b> {v(s)} {tag}</div>'
MON = lambda n, name: f'<div class="mon"><b class="ex">👾 몬스터 {n}</b> <span class="nm">{name}</span></div>'
W = lambda h: f'<div style="height:{h}mm"></div>'


def diagram(xs, ys, arrows, w=40, label=('X', 'Y'), rx=17, cl=28, cr=92, fs=11):
    """대응 그림(벤 다이어그램 + 화살표) · arrows = [(x, y)] 이름으로 · 빈 목록이면 학생이 그림"""
    H = 18 + 15 * max(len(xs), len(ys))
    py = lambda i, n: 22 + i * 15 + (max(len(xs), len(ys)) - n) * 7.5
    it = lambda t: all(ch.isascii() and ch.isalpha() for ch in t)
    tx = lambda x, y, t: f'<text x="{x}" y="{y}" text-anchor="middle" ' + ('font-family="DejaVu Serif" font-style="italic"' if it(t) else 'font-family="Noto Sans CJK KR"') + f'>{t}</text>'
    s = [f'<svg viewBox="0 0 120 {H}" width="{w}mm" xmlns="http://www.w3.org/2000/svg" font-size="{fs}">',
         '<defs><marker id="ah" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="#222"/></marker></defs>',
         f'<ellipse cx="{cl}" cy="{H/2+4}" rx="{rx}" ry="{H/2-6}" fill="none" stroke="#222" stroke-width="1.3"/>',
         f'<ellipse cx="{cr}" cy="{H/2+4}" rx="{rx}" ry="{H/2-6}" fill="none" stroke="#222" stroke-width="1.3"/>',
         tx(cl, 10, label[0]), tx(cr, 10, label[1])]
    for i, x in enumerate(xs): s.append(tx(cl, py(i, len(xs)) + 4, x))
    for i, y in enumerate(ys): s.append(tx(cr, py(i, len(ys)) + 4, y))
    for a, b in arrows:
        y1 = py(xs.index(a), len(xs)); y2 = py(ys.index(b), len(ys))
        s.append(f'<line x1="{cl+rx-10}" y1="{y1}" x2="{cr-rx+9}" y2="{y2}" stroke="#222" stroke-width="0.9" marker-end="url(#ah)"/>')
    return ''.join(s) + '</svg>'


X4, Y4 = ['1', '2', '3', '4'], ['a', 'b', 'c', 'd']
T1 = {1: [('1', 'c'), ('2', 'a'), ('4', 'b')],
      2: [('1', 'c'), ('2', 'd'), ('3', 'a'), ('4', 'c')],
      3: [('1', 'c'), ('2', 'a'), ('3', 'b'), ('4', 'b'), ('4', 'd')]}
EX = [('1', 'b'), ('2', 'a'), ('3', 'b'), ('4', 'd')]  # 교과서 107쪽 보기

review = f"""<div class="review"><b>🔁 전시 확인</b> (지난 시간) &nbsp;
① 문자에 모든 실수를 넣어도 항상 성립하는 부등식 = {BL["m"]} &nbsp;
② {v("a > 0")}, {v("b > 0")} 일 때 {v("a + b ≥")} {BL["m"]}</div>"""

KEYS = [('식에 수 넣기', '문제 3', f'{v("x + 3")} 에 {v("x = 1")} 을 넣으면?', ['2', '4', '−2']),
        ('y = −x² + r 의 가장 큰 값', '문제 2 의 (2)', f'{v("y = −x² + 3")} 의 가장 큰 값은?', ['0', '3', '−3'])]
C5 = '①②③④⑤'
keybox = '<div class="keys"><div class="kt">🔑 입장 열쇠 <span class="mini">대기실에서 먼저 · 중학교 복습</span></div><div class="kr one">' + ''.join(
    f'<div class="kq"><b>🔑{i + 1} {n}</b> <span class="kg"> · {u}</span><br>{q}<div class="kc">{" &nbsp; ".join(f"{C5[j]} {v(c)}" for j, c in enumerate(ch))} &nbsp;&nbsp; 답 ( &nbsp;&nbsp;&nbsp; )</div></div>'
    for i, (n, u, q, ch) in enumerate(KEYS)) + '</div></div>'

money = diagram(['대한민국', '독일', '프랑스', '미국'], ['원', '유로', '달러', '파운드'], [], w=44, label=('X', 'Y'), rx=24, cl=30, cr=90, fs=8.5)
p1_left = f"""
<h3>생각 열기 🔍</h3>
<div class="open" style="display:flex;gap:2mm;align-items:center"><div>{money}</div><div>나라(X)와 그 나라에서 쓰는 화폐(Y)를 화살표로 이어 보자.<br><span class="mini">→ 나라마다 화폐가 꼭 하나씩 · 화살표를 받지 않는 화폐가 있어도 된다</span></div></div>
<h3>STEP 1 함수</h3>
<div class="word">낱말 상자 [ 대응 · 오직 하나 · 함수 ]</div>
<div class="box">공집합이 아닌 두 집합 {v("X")}, {v("Y")}에서 {v("X")}의 원소에 {v("Y")}의 원소를 짝 지어 주는 것을 {BL["s"]}이라고 한다.<br>
{v("X")}의 각 원소에 {v("Y")}의 원소가 {BL["m"]}씩 대응할 때, 이 대응을 {v("X")}에서 {v("Y")}로의 {BL["s"]}라 하고 {v("f : X → Y")} 로 나타낸다.</div>
<h3>STEP 2 정의역 · 공역 · 치역</h3>
<div class="word">낱말 상자 [ 정의역 · 공역 · 치역 · 함숫값 ]</div>
<div class="box" style="font-size:9.4pt;line-height:1.7">
함수 {v("f : X → Y")} 에서 {v("X")} = {BL["s"]} &nbsp;·&nbsp; {v("Y")} = {BL["s"]}<br>
{v("x")}에 대응하는 {v("f(x)")} = {v("x")}의 {BL["s"]} &nbsp;·&nbsp; 함숫값 전체의 집합 {v("{ f(x) | x ∈ X }")} = {BL["s"]}<br>
<span class="mini">치역은 공역의 부분집합이다.</span>
<div style="display:flex;align-items:center;gap:2mm;margin-top:0.6mm">{diagram(X4, Y4, EX, w=32)}<span class="mini">보기) 정의역 {v("{1, 2, 3, 4}")} · 공역 {v("{a, b, c, d}")}<br>{v("f(1) = b, f(2) = a, f(3) = b, f(4) = d")}<br>→ 치역 {v("{a, b, d}")}</span></div></div>
{MEMO}"""

p1_right = f"""
{MON(1, '짝 잃은 열쇠')}
{P(1, "다음 대응 중 집합 X에서 집합 Y로의 함수인 것을 찾고, 그 함수의 정의역, 공역, 치역을 구하시오. 또, 함수가 아닌 것은 그 이유를 말하시오.", GAME("★ 칸만"))}
<div class="dg">{''.join(f'<div class="one">({n}){diagram(X4, Y4, T1[n], w=27)}</div>' for n in (1, 2, 3))}</div>
<div class="pf">
{S}함수인 것 : ( &nbsp;&nbsp;&nbsp; ) &nbsp;→ 정의역 {BL["s"]} · {S}공역 {BL["s"]} · {S}치역 {BL["m"]}<br>
{S}함수가 아닌 것과 그 이유 :<br>( &nbsp;&nbsp; ) {BL["m"]}<br>( &nbsp;&nbsp; ) {BL["m"]}</div>
<h3>STEP 3 정의역 · 공역이 주어지지 않을 때</h3>
<div class="box" style="font-size:9.4pt;line-height:1.7">
함수 {v("y = f(x)")}의 정의역이나 공역이 없으면<br>
정의역 = 함수가 정의되는 {BL["m"]} 전체 · 공역 = {BL["m"]} 전체<br>
<span class="mini">보기) {v("y = x² − 1")} : 정의역 {v("{x | x는 실수}")} · 치역 {v("{y | y ≥ −1}")} &nbsp; {v("y = 1/x")} : 정의역 {v("{x | x ≠ 0}")}</span></div>
{MON(2, '정의역 문지기')}
{P(2, "다음 함수의 정의역과 치역을 구하시오.", GAME("★ 칸만"))}
<div class="pf">
(1) {v("y = 2x + 1")} &nbsp; {S}정의역 {BL["m"]} &nbsp; {S}치역 {BL["m"]}<br>
(2) {v("y = −x² + 3")} &nbsp; {S}정의역 {BL["m"]} &nbsp; {S}치역 {BL["m"]}</div>
{MEMO}"""

TB = 'style="border-collapse:collapse;font-size:9pt;margin:0.8mm 0"'
TD = 'style="border:1px solid #9ab;padding:0.6mm 3mm;text-align:center"'
p2_left = f"""
<h3>STEP 4 서로 같은 함수</h3>
<div class="word">낱말 상자 [ 정의역 · 모든 · 같다 ]</div>
<div class="box">두 함수 {v("f : X → Y")}, {v("g : X → Y")} 에서 {BL["s"]}의 {BL["s"]} 원소 {v("x")}에 대하여 {v("f(x) = g(x)")} 일 때, 두 함수 {v("f")}와 {v("g")}는 서로 {BL["s"]}고 하며 {v("f = g")} 로 나타낸다.</div>
<div class="chk">✔ <b>탐구</b> 정의역이 {v("{−1, 0, 1}")}인 두 함수 {v("f(x) = |2x|")}, {v("g(x) = 2x²")}
<table {TB}><tr><td {TD}>{v("x")}</td><td {TD}>−1</td><td {TD}>0</td><td {TD}>1</td></tr>
<tr><td {TD}>{v("f(x)")}</td><td {TD}>2</td><td {TD}></td><td {TD}></td></tr>
<tr><td {TD}>{v("g(x)")}</td><td {TD}></td><td {TD}>0</td><td {TD}></td></tr></table>
→ 두 함수는 서로 ( 같다 · 같지 않다 ) <span class="mini">식이 달라도 서로 같은 함수가 될 수 있다</span></div>
{MON(3, '대응 사슬 기사 · ✍ 서술형')}
{P(3, "정의역이 {1, 2}인 두 함수 f(x) = x + a 와 g(x) = x² + bx + 5 에 대하여 f = g 가 성립할 때, 상수 a 와 b 의 값을 구하시오.", GAME("소레이드 ★ 칸 · ✍ 서술형 📸"))}
<div class="pf">
① {S}{v("f = g")} 이므로 정의역의 모든 원소에서 함숫값이 같다 : {v("f(1) = g(1)")}, {v("f(")}{BL["s"]}{v(") = g(")}{BL["s"]}{v(")")}<br>
② {S}{v("f(1) = g(1)")} : {v("1 + a")} = {BL["m"]}<br>
③ {S}{v("f(2) = g(2)")} : {v("2 + a")} = {BL["m"]}<br>
④ {S}두 식을 빼면 {v("b")} = {BL["s"]}<br>
👑 {S}그러므로 {v("a")} = {BL["s"]}, {v("b")} = {BL["s"]}</div>
<div class="hint">💡 근거 : 서로 같은 함수 = 정의역이 같고, 정의역의 {BL["s"]} 원소에서 함숫값이 같다</div>
<div class="essay"><b>✍ 나의 풀이</b> <span class="mini">(f = g 의 뜻 → f(1) = g(1) → f(2) = g(2) → 연립 → a, b)</span>
<div class="ln"></div><div class="ln"></div><div class="ln"></div><div class="ln"></div></div>
<h3>📝 오늘 정리</h3>
<div class="box" style="font-size:9.6pt;line-height:1.7">
<b>함수</b> : {v("X")}의 각 원소에 {v("Y")}의 원소가 오직 하나씩 대응<br>
<b>정의역</b> {v("X")} · <b>공역</b> {v("Y")} · <b>치역</b> {v("{ f(x) | x ∈ X }")} ⊂ 공역<br>
<b>{v("f = g")}</b> : 정의역이 같고, 모든 원소 {v("x")}에서 {v("f(x) = g(x)")}</div>
{MEMO}"""

fq = lambda n, s, h: f'<div class="q">{n}. {s}</div>{W(h)}'
p2_right = f'''
<div class="fa"><div class="tt">✔ 14차시 형성평가 <span class="mini" style="font-weight:400">(혼자 풀기 · 4문항)</span>{GAME("보스")}</div>
<div class="mon"><b class="ex">👑 보스</b> <span class="nm">대응의 사슬 군주</span></div>
{fq(1, v("X = {1, 2, 3}") + "에서 " + v("Y = {a, b}") + "로의 대응 중 함수인 것은? ( &nbsp;&nbsp;&nbsp; )<br>① " + v("1→a, 2→a, 3→b") + " &nbsp;② " + v("1→a, 2→b") + " &nbsp;③ " + v("1→a, 1→b, 2→a, 3→b"), 4)}
{fq(2, v("X = {1, 2, 3}") + "에서 " + v("Y = {1, 3, 5, 7}") + "로의 함수 " + v("f(x) = 2x − 1") + " 의 치역은 " + BL["m"] + "이다.", 5)}
{fq(3, "함수 " + v("y = x² + 1") + " 의 치역은 " + BL["m"] + "이다.", 5)}
{fq(4, "정의역이 " + v("{1, 2}") + "인 두 함수 " + v("f(x) = ax + b") + ", " + v("g(x) = x²") + " 에 대하여 " + v("f = g") + " 일 때, 상수 " + v("a") + " = " + BL["s"] + ", " + v("b") + " = " + BL["s"], 8)}
<div class="mini" style="border-top:1px dashed #9bb;padding-top:1.5mm">맞은 개수 {BL["s"]} / 4 &nbsp;어려웠던 부분<br>{CB}함수의 뜻 {CB}정의역 · 공역 · 치역 {CB}서로 같은 함수</div></div>
<div class="add mini">🎯 <b>더 해 보고 싶다면</b> — 캠프의 복습 허수아비 · 👑 형성평가 재대결</div>'''
STAMP = '<div class="stampwrap" style="margin-top:auto"><div class="stamp"><span>확인 도장</span></div></div>'
rng = '공통수학2 Ⅲ. 함수와 그래프 1. 함수 01. 함수 (14차시) · 레이드용 v1'
hd = header('14차시', rng)
goal = '<div class="goal"><b>학습목표</b> ① 함수의 뜻을 알고 정의역 · 공역 · 치역을 구할 수 있다. ② 두 함수가 서로 같을 조건을 안다.</div>'
pg = lambda g, l, r, n: f'<div class="page">{hd}{g}<div class="cols"><div class="col">{l}</div><div class="col">{r}</div></div><div class="pno">- 14차시 ({n}/2) -</div></div>'
html = f"<!DOCTYPE html><html><head><meta charset='utf-8'><title>학습과정 14차시 레이드용 v1 (함수)</title><style>{CSS}{EXTRA}{KCSS}</style></head><body>{pg(goal + review, keybox + p1_left, p1_right, 1)}{pg('', p2_left, p2_right + STAMP, 2)}</body></html>"
open(OUT.replace('.pdf', '.html'), 'w', encoding='utf-8').write(html)
with sync_playwright() as p:
    b = p.chromium.launch(); page = b.new_page(); page.set_content(html); page.wait_for_timeout(300)
    bot = page.evaluate("""() => [...document.querySelectorAll('.col')].map(c => { const k = [...c.children].filter(e => !e.classList.contains('memo')).pop(); return k ? Math.round((k.getBoundingClientRect().bottom - c.closest('.page').getBoundingClientRect().top) * 25.4 / 96) : 0 })""")
    page.pdf(path=OUT, format='A4', print_background=True, prefer_css_page_size=True); b.close()
print('단 아래끝:', bot)
