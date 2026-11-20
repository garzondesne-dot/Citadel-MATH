# 16차시 레이드용 v1 「합성함수」 (2026-11-20 · 손발 #7 · 메타인지 8 컨펌 #5 = A1 · B1 · C1 · D1 · E1) · gen_ws15v2.py 기반
#   교과서 미래엔 공통수학2 111~112쪽(합성함수 · 교환법칙 ✕ · 결합법칙) + 중단원 마무리 03 · 07(118~119쪽)
#   몬스터 1 = 문제 1(함숫값) · 몬스터 2 = 문제 2(식) · 몬스터 3 = 중단원 07 ⚔ 소레이드 · 형성평가 4 (1~3 = 중단원 03)
#   실행: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tools/worksheet/gen_ws16v1.py <출력.pdf>
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



review = f"""<div class="review"><b>🔁 전시 확인</b> (지난 시간) &nbsp;
① {v("x<sub>1</sub> ≠ x<sub>2</sub>")} 이면 {v("f(x<sub>1</sub>) ≠ f(x<sub>2</sub>)")} → {BL["m"]} &nbsp;
② {v("f(x) = x")} → {BL["m"]}</div>"""

KEYS = [('괄호 풀기', '문제 3', f'{v("2(x + 3)")} 을 풀면?', ['2x + 3', '2x + 6', 'x + 6']),
        ('완전제곱식 전개', '문제 2 의 (1)', f'{v("(x − 4)²")} 을 전개하면?', ['x² − 16', 'x² − 8x + 16', 'x² + 16'])]
C5 = '①②③④⑤'
keybox = '<div class="keys"><div class="kt">🔑 입장 열쇠 <span class="mini">대기실에서 먼저 · 중학교 복습</span></div><div class="kr one">' + ''.join(
    f'<div class="kq"><b>🔑{i + 1} {n}</b> <span class="kg"> · {u}</span><br>{q}<div class="kc">{" &nbsp; ".join(f"{C5[j]} {v(c)}" for j, c in enumerate(ch))} &nbsp;&nbsp; 답 ( &nbsp;&nbsp;&nbsp; )</div></div>'
    for i, (n, u, q, ch) in enumerate(KEYS)) + '</div></div>'

ST, FD, PR = ['아람', '재영', '하영'], ['어묵', '핫도그', '떡볶이', '김밥'], ['2000원', '3000원', '4000원']
d1 = diagram(ST, FD, [('아람', '떡볶이'), ('재영', '김밥'), ('하영', '어묵')], w=27, label=('학생 X', '음식 Y'), rx=22, cl=28, cr=92, fs=9)
d2 = diagram(FD, PR, [('어묵', '2000원'), ('핫도그', '3000원'), ('떡볶이', '3000원'), ('김밥', '4000원')], w=27, label=('음식 Y', '가격 Z'), rx=22, cl=28, cr=92, fs=9)
p1_left = f"""
<h3>생각 열기 🔍</h3>
<div class="open"><div class="dg"><div class="one">{d1}</div><div class="one">{d2}</div></div>
세 학생이 주문한 음식의 가격은? &nbsp; 아람 {BL["s"]} · 재영 {BL["s"]} · 하영 {BL["s"]}<br><span class="mini">→ 학생에서 가격으로 바로 가는 화살표를 그려 보자</span></div>
<h3>STEP 1 합성함수</h3>
<div class="word">낱말 상자 [ 합성함수 · g∘f · g(f(x)) ]</div>
<div class="box">두 함수 {v("f : X → Y")}, {v("g : Y → Z")} 에서 {v("X")}의 각 원소 {v("x")}에 {v("Z")}의 원소 {BL["m"]}를 대응시키는 함수를 {v("f")}와 {v("g")}의 {BL["m"]}라 하고 {BL["s"]} 로 나타낸다.<br>
{v("(g∘f)(x) = g(f(x))")} &nbsp;<span class="mini">· <b>먼저 {v("f")}, 다음 {v("g")}</b> (오른쪽 함수부터) · {v("f")}의 치역 ⊂ {v("g")}의 정의역</span></div>
<div class="chk">✔ <b>개념 체크</b> {v("(g∘f)(x)")} 를 구할 때 먼저 계산하는 함수는 ( {v("f")} · {v("g")} )</div>
{MEMO}"""

p1_right = f"""
{MON(1, '톱니 병정')}
{P(1, "두 함수 f(x) = 2x + 1 과 g(x) = x² − 1 에 대하여 다음을 구하시오.", GAME("★ 칸만"))}
<div class="pf">
(1) {S}{v("(g∘f)(2) = g(f(2)) = g(")}{BL["s"]}{v(")")} = {BL["s"]}<br>
(2) {S}{v("(f∘g)(−1) = f(g(−1)) = f(")}{BL["s"]}{v(")")} = {BL["s"]}<br>
(3) {S}{v("(f∘f)(−3) = f(f(−3)) = f(")}{BL["s"]}{v(")")} = {BL["s"]}</div>
<h3>STEP 2 합성함수의 식 · 교환법칙</h3>
<div class="box" style="font-size:9.4pt;line-height:1.75">
예제) {v("f(x) = −x + 2")}, {v("g(x) = 4x + 1")}<br>
{v("(g∘f)(x) = g(f(x)) = g(−x + 2) = 4(−x + 2) + 1 =")} {BL["m"]}<br>
{v("(f∘g)(x) = f(g(x)) = f(4x + 1) = −(4x + 1) + 2 =")} {BL["m"]}<br>
<span class="mini">→ 일반적으로 {v("g∘f")} {BL["s"]} {v("f∘g")} &nbsp;(합성에서 교환법칙이 성립하지 않는다)</span></div>
<div class="chk">✔ <b>개념 체크</b> 합성함수에서 {v("g∘f")} 와 {v("f∘g")} 는 항상 같다. ( ○ · ✕ )</div>
{MON(2, '순서 뒤바뀐 컨베이어 미믹')}
{P(2, "두 함수 f(x) = x − 4 와 g(x) = −x² 에 대하여 다음을 구하시오.", GAME("★ 칸만"))}
<div class="pf">
(1) {S}{v("(g∘f)(x) = g(x − 4) =")} {BL["m"]}<br>
(2) {S}{v("(f∘g)(x) = f(−x²) =")} {BL["m"]}<br>
(3) {S}{v("(g∘g)(x) = g(−x²) =")} {BL["m"]}</div>
{MEMO}"""

p2_left = f"""
<h3>STEP 3 결합법칙</h3>
<div class="box" style="font-size:9.4pt;line-height:1.7">
{v("f(x) = 2x − 1")}, {v("g(x) = 3x + 2")}, {v("h(x) = x² + 1")} 일 때<br>
{v("((f∘g)∘h)(x)")} 와 {v("(f∘(g∘h))(x)")} 는 모두 {v("6x² + 9")} → {v("(f∘g)∘h = f∘(g∘h)")}<br>
<span class="mini">합성에서 교환법칙 ✕ · 결합법칙 ○</span></div>
<div class="chk">✔ <b>개념 체크</b> 합성에서 성립하는 것은 ( 교환법칙 · 결합법칙 )</div>
{MON(3, '합성 골렘 · ✍ 서술형')}
<div class="q"><b class="ex">중단원 07)</b> {v("두 함수 f(x) = 2x − 7 과 g(x) = −4x + 3 에 대하여 (f∘h)(x) = g(x) 를 만족시키는 h(x) 를 구하시오.")} {GAME("소레이드 ★ 칸 · ✍ 서술형 📸")}</div>
<div class="pf">
① {S}{v("(f∘h)(x) =")} {BL["m"]} &nbsp;<span class="mini">(먼저 {v("h")}, 다음 {v("f")})</span><br>
② {S}{v("f")} 의 {v("x")} 자리에 {v("h(x)")} 를 넣으면 {v("f(h(x)) =")} {BL["m"]}<br>
③ {S}{v("(f∘h)(x) = g(x)")} 이므로 {BL["m"]} {v("= −4x + 3")}<br>
④ {S}{v("2h(x) =")} {BL["m"]}<br>
👑 {S}그러므로 {v("h(x) =")} {BL["m"]}</div>
<div class="hint">💡 근거 : {v("(f∘h)(x) = f(h(x))")} — 오른쪽 함수부터 · 검산 {v("f(h(x)) = g(x)")}</div>
<div class="essay"><b>✍ 나의 풀이</b> <span class="mini">(합성의 뜻 → f 에 h(x) 넣기 → 방정식 → h(x) → 검산)</span>
<div class="ln"></div><div class="ln"></div><div class="ln"></div><div class="ln"></div></div>
<h3>📝 오늘 정리</h3>
<div class="box" style="font-size:9.6pt;line-height:1.7">
<b>합성함수</b> {v("g∘f : X → Z")}, {v("(g∘f)(x) = g(f(x))")} — 먼저 {v("f")}, 다음 {v("g")}<br>
<b>교환법칙</b> ✕ ({v("g∘f ≠ f∘g")}) · <b>결합법칙</b> ○ ({v("(f∘g)∘h = f∘(g∘h)")})</div>
{MEMO}"""

fq = lambda n, s, h: f'<div class="q">{n}. {s}</div>{W(h)}'
p2_right = f'''
<div class="fa"><div class="tt">✔ 16차시 형성평가 <span class="mini" style="font-weight:400">(혼자 풀기 · 4문항)</span>{GAME("보스")}</div>
<div class="mon"><b class="ex">👑 보스</b> <span class="nm">합성의 대기관</span></div>
<div class="q" style="margin-bottom:1mm">두 함수 {v("f(x) = x − 5")} 와 {v("g(x) = 3x − 4")} 에 대하여 (1 ~ 3)</div>
{fq(1, v("(g∘f)(3)") + " = " + BL["s"], 9)}
{fq(2, v("(g∘g)(1)") + " = " + BL["s"], 9)}
{fq(3, v("(f∘g)(x)") + " = " + BL["m"], 9)}
{fq(4, "두 함수 " + v("f(x) = 3x + 1") + ", " + v("g(x) = 6x − 5") + " 에 대하여 " + v("(f∘h)(x) = g(x)") + " 를 만족시키는 " + v("h(x)") + " = " + BL["m"], 16)}
<div class="mini" style="border-top:1px dashed #9bb;padding-top:1.5mm">맞은 개수 {BL["s"]} / 4 &nbsp;어려웠던 부분<br>{CB}합성함수의 값 {CB}합성함수의 식 {CB}(f∘h)(x) = g(x) 풀기</div></div>
<div class="add mini">🎯 <b>더 해 보고 싶다면</b> — 캠프의 복습 허수아비 · 👑 형성평가 재대결</div>'''
STAMP = '<div class="stampwrap" style="margin-top:auto"><div class="stamp"><span>확인 도장</span></div></div>'
rng = '공통수학2 Ⅲ. 함수와 그래프 1. 함수 02. 합성함수 (16차시) · 레이드용 v1'
hd = header('16차시', rng)
goal = '<div class="goal"><b>학습목표</b> 함수의 합성을 설명하고, 합성함수를 구할 수 있다.</div>'
pg = lambda g, l, r, n: f'<div class="page">{hd}{g}<div class="cols"><div class="col">{l}</div><div class="col">{r}</div></div><div class="pno">- 16차시 ({n}/2) -</div></div>'
html = f"<!DOCTYPE html><html><head><meta charset='utf-8'><title>학습과정 16차시 레이드용 v1 (합성함수)</title><style>{CSS}{EXTRA}{KCSS}</style></head><body>{pg(goal + review, keybox + p1_left, p1_right, 1)}{pg('', p2_left, p2_right + STAMP, 2)}</body></html>"
open(OUT.replace('.pdf', '.html'), 'w', encoding='utf-8').write(html)
with sync_playwright() as p:
    b = p.chromium.launch(); page = b.new_page(); page.set_content(html); page.wait_for_timeout(300)
    bot = page.evaluate("""() => [...document.querySelectorAll('.col')].map(c => { const k = [...c.children].filter(e => !e.classList.contains('memo')).pop(); return k ? Math.round((k.getBoundingClientRect().bottom - c.closest('.page').getBoundingClientRect().top) * 25.4 / 96) : 0 })""")
    page.pdf(path=OUT, format='A4', print_background=True, prefer_css_page_size=True); b.close()
print('단 아래끝:', bot)
