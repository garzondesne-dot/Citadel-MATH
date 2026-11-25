# 15차시 레이드용 v3 (2026-11-25 · 📚 차시팩 #1 · 선생님 「15차시 레이드학습지 서술형문항 교과서에 있는거 페이지 119 서술형 10번문항으로 교체해줘」 · DECISIONS bd5c7e4) · 몬스터 3 = 중단원 10(119쪽 · 일대일대응 a, b) ⚔ 소레이드 · 나머지는 v2 그대로 (v2 = gen_ws15v2.py)
#   교과서 미래엔 공통수학2 108~110쪽(함수의 그래프 · 일대일함수 · 일대일대응 · 항등함수 · 상수함수) + 중단원 마무리 10(119쪽 · 서술형)
#   몬스터 1 = 문제 4 + 5(그래프) · 몬스터 2 = 문제 6(일대일 · ⑷ 그래프와 함께) · 몬스터 3 = 중단원 10 ⚔ 소레이드 (✍ 서술형) · 형성평가 4
#   실행: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tools/worksheet/gen_ws15v3.py <출력.pdf>
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



def graph(plots, win=(-3, 3, -3, 3), w=26, lab=None):
    """좌표평면 그림 · plots = [('y', f, (a, b, ca, cb) | None) · ('x', c) 세로선 · ('circle', (cx, cy), r) · ('grid', [(x, y)]) 점 + 점선 눈금]"""
    x1, x2, y1, y2 = win; W = 100; H = W * (y2 - y1) / (x2 - x1)
    X = lambda x: (x - x1) / (x2 - x1) * W
    Y = lambda y: H - (y - y1) / (y2 - y1) * H
    it = 'font-family="DejaVu Serif" font-style="italic"'
    s = [f'<svg viewBox="-8 -8 {W + 18} {H + 18}" width="{w}mm" xmlns="http://www.w3.org/2000/svg" font-size="9" font-family="DejaVu Sans">',
         '<defs><marker id="ax" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#222"/></marker></defs>',
         f'<line x1="0" y1="{Y(0)}" x2="{W + 4}" y2="{Y(0)}" stroke="#222" stroke-width="0.8" marker-end="url(#ax)"/>',
         f'<line x1="{X(0)}" y1="{H}" x2="{X(0)}" y2="-4" stroke="#222" stroke-width="0.8" marker-end="url(#ax)"/>',
         f'<text x="{W + 2}" y="{Y(0) + 10}" {it}>x</text><text x="{X(0) + 3}" y="-1" {it}>y</text>',
         f'<text x="{X(0) - 8}" y="{Y(0) + 9}" font-family="DejaVu Sans">O</text>']
    for kind, val in (lab or []):
        t = str(val).replace('-', '−')
        if kind == 'x': s.append(f'<line x1="{X(val)}" y1="{Y(0) - 1.5}" x2="{X(val)}" y2="{Y(0) + 1.5}" stroke="#222" stroke-width="0.6"/><text x="{X(val)}" y="{Y(0) + 9}" text-anchor="middle" font-family="DejaVu Sans">{t}</text>')
        else: s.append(f'<line x1="{X(0) - 1.5}" y1="{Y(val)}" x2="{X(0) + 1.5}" y2="{Y(val)}" stroke="#222" stroke-width="0.6"/><text x="{X(0) - 3}" y="{Y(val) + 3}" text-anchor="end" font-family="DejaVu Sans">{t}</text>')
    for p in plots:
        k = p[0]
        if k == 'y':
            f, dom = p[1], p[2]
            a, b = (dom[0], dom[1]) if dom else (x1, x2)
            a, b = max(a, x1), min(b, x2); N = 160; seg = []; segs = []
            for i in range(N + 1):
                x = a + (b - a) * i / N; y = f(x)
                if y1 - 0.2 <= y <= y2 + 0.2: seg.append(f'{X(x):.2f},{Y(y):.2f}')
                elif seg: segs.append(seg); seg = []
            if seg: segs.append(seg)
            for sg in segs: s.append(f'<polyline points="{" ".join(sg)}" fill="none" stroke="#1b3d8f" stroke-width="1.5"/>')
            if dom:
                for xe, closed in ((dom[0], dom[2]), (dom[1], dom[3])):
                    if x1 <= xe <= x2 and y1 <= f(xe) <= y2: s.append(f'<circle cx="{X(xe)}" cy="{Y(f(xe))}" r="2" fill="{"#1b3d8f" if closed else "#fff"}" stroke="#1b3d8f" stroke-width="1"/>')
        elif k == 'x': s.append(f'<line x1="{X(p[1])}" y1="0" x2="{X(p[1])}" y2="{H}" stroke="#1b3d8f" stroke-width="1.5"/>')
        elif k == 'circle': s.append(f'<ellipse cx="{X(p[1][0])}" cy="{Y(p[1][1])}" rx="{p[2] / (x2 - x1) * W}" ry="{p[2] / (y2 - y1) * H}" fill="none" stroke="#1b3d8f" stroke-width="1.5"/>')
        elif k == 'grid':
            for (a, b) in p[1]:
                s.append(f'<polyline points="{X(a)},{Y(0)} {X(a)},{Y(b)} {X(0)},{Y(b)}" fill="none" stroke="#888" stroke-width="0.5" stroke-dasharray="2,1.5"/>')
                s.append(f'<circle cx="{X(a)}" cy="{Y(b)}" r="2.2" fill="#1b3d8f"/>')
    return ''.join(s) + '</svg>'


G = lambda svg, cap: f'<div class="one">{cap}<br>{svg}</div>'
review = f"""<div class="review"><b>🔁 전시 확인</b> (지난 시간) &nbsp;
① {v("X")}의 각 원소에 {v("Y")}의 원소가 {BL["s"]}씩 대응 → 함수 &nbsp;
② 함숫값 전체의 집합 = {BL["s"]}</div>"""

KEYS = [('일차함수에 수 넣기', '문제 4', f'{v("y = −2x + 3")} 에 {v("x = 2")} 를 넣으면?', ['−1', '1', '7']),
        ('제곱한 값', '문제 6', f'{v("(−1)²")} 과 {v("1²")} 의 값은?', ['−1 과 1', '1 과 1', '−2 와 2'])]
C5 = '①②③④⑤'
keybox = '<div class="keys"><div class="kt">🔑 입장 열쇠 <span class="mini">대기실에서 먼저 · 중학교 복습</span></div><div class="kr one">' + ''.join(
    f'<div class="kq"><b>🔑{i + 1} {n}</b> <span class="kg"> · {u}</span><br>{q}<div class="kc">{" &nbsp; ".join(f"{C5[j]} {v(c)}" for j, c in enumerate(ch))} &nbsp;&nbsp; 답 ( &nbsp;&nbsp;&nbsp; )</div></div>'
    for i, (n, u, q, ch) in enumerate(KEYS)) + '</div></div>'

ST, MV = ['민지', '준호', '서연'], ['영화1', '영화2', '영화3']
mv1 = diagram(ST, MV, [('민지', '영화2'), ('준호', '영화3'), ('서연', '영화1')], w=26, label=('학생', '영화'), rx=22, cl=28, cr=92, fs=9)
mv2 = diagram(ST, MV, [('민지', '영화2'), ('준호', '영화2'), ('서연', '영화2')], w=26, label=('학생', '영화'), rx=22, cl=28, cr=92, fs=9)
ex1 = graph([('grid', [(-1, 0), (0, 1), (1, 2), (2, 3)])], win=(-1.6, 2.6, -0.8, 3.6), w=21, lab=[('x', -1), ('x', 1), ('x', 2), ('y', 1), ('y', 2), ('y', 3)])
p1_left = f"""
<h3>생각 열기 🔍</h3>
<div class="open"><div class="dg"><div class="one">(가){mv1}</div><div class="one">(나){mv2}</div></div>
학생마다 영화를 한 편씩 고른다. (가)는 모두 다른 영화 · (나)는 모두 같은 영화.<br><span class="mini">→ 두 대응 모두 함수일까? 무엇이 다를까?</span></div>
<h3>STEP 1 함수의 그래프</h3>
<div class="word">낱말 상자 [ 순서쌍 · 그래프 · 한 점 ]</div>
<div class="box">함수 {v("f : X → Y")} 에서 정의역의 원소 {v("x")}와 함숫값 {v("f(x)")}의 {BL["s"]} {v("(x, f(x))")} 전체의 집합 {v("{ (x, f(x)) | x ∈ X }")} 를 함수 {v("f")}의 {BL["s"]}라고 한다.<br>
함수의 그래프는 정의역의 각 원소 {v("a")}에 대하여 세로선 {v("x = a")}와 오직 {BL["s"]}에서 만난다.
<div style="display:flex;align-items:center;gap:2mm;margin-top:0.6mm">{ex1}<span class="mini">보기) 정의역 {v("{−1, 0, 1, 2}")} · {v("f(x) = x + 1")}<br>그래프 = {v("{(−1, 0), (0, 1), (1, 2), (2, 3)}")}<br>→ 좌표평면 위의 점 4개</span></div></div>
{MEMO}"""

L5 = graph([('y', lambda x: -x + 1, None)], win=(-1.2, 2.2, -1.2, 2.2), w=21, lab=[('x', 1), ('y', 1)])
P5 = graph([('grid', [(0, 2), (1, 3), (2, 4), (3, 3), (3, 1), (4, 2)])], win=(-0.6, 4.6, -0.6, 4.6), w=21, lab=[('x', 1), ('x', 2), ('x', 3), ('x', 4), ('y', 1), ('y', 2), ('y', 3), ('y', 4)])
C5g = graph([('circle', (0, 0), 1)], win=(-1.6, 1.6, -1.6, 1.6), w=21, lab=[('x', -1), ('x', 1), ('y', -1), ('y', 1)])
FIG = {1: [('1', 'd'), ('2', 'a'), ('3', 'b')], 2: [('1', 'b'), ('2', 'c'), ('3', 'a'), ('4', 'd')], 3: [('1', 'a'), ('2', 'b'), ('3', 'b'), ('4', 'd')]}
X3, X4, Y4 = ['1', '2', '3'], ['1', '2', '3', '4'], ['a', 'b', 'c', 'd']
p1_right = f"""
{MON(1, '수평선 박쥐')}
{P(4, "정의역이 다음과 같은 함수 y = −2x + 3 의 그래프를 좌표평면 위에 나타내시오.", GAME("★ 칸만"))}
<div class="pf">
(1) 정의역 {v("{0, 1, 2, 3}")} : {S}그래프 = {v("{(0,")} {BL["s"]}{v("), (1,")} {BL["s"]}{v("), (2,")} {BL["s"]}{v("), (3,")} {BL["s"]}{v(")}")}<br>
(2) 정의역 {v("{x | x는 실수}")} : {S}그래프 모양 = ( 점 4개 · 직선 · 포물선 )</div>
{P(5, "다음에서 함수의 그래프를 찾고, 함수의 그래프가 아닌 것은 그 이유를 말하시오.", GAME("★ 칸만"))}
<div class="dg">{G(L5, "(1)")}{G(P5, "(2)")}{G(C5g, "(3)")}</div>
<div class="pf">{S}함수의 그래프 : ( &nbsp;&nbsp;&nbsp; ) &nbsp; {S}아닌 것의 이유 : 세로선 {v("x = a")}와 {BL["m"]} 만나는 곳이 있다.</div>
<h3>STEP 2 일대일함수 · 일대일대응</h3>
<div class="word">낱말 상자 [ 서로 다른 · 공역 · 일대일함수 · 일대일대응 ]</div>
<div class="box" style="font-size:9.4pt;line-height:1.7">
정의역의 원소 {v("x<sub>1</sub>, x<sub>2</sub>")}에 대하여 {v("x<sub>1</sub> ≠ x<sub>2</sub>")} 이면 {v("f(x<sub>1</sub>) ≠ f(x<sub>2</sub>)")} → {BL["m"]}<br>
일대일함수이고 치역과 {BL["s"]}이 같다 → {BL["m"]}
<div class="dg">{''.join(f'<div class="one">[그림 {n}]{diagram(X3 if n == 1 else X4, Y4, FIG[n], w=23)}</div>' for n in (1, 2, 3))}</div>
<span class="mini">[그림 1] 일대일함수 · 치역 ≠ 공역 &nbsp; [그림 2] 일대일대응 &nbsp; [그림 3] {v("2 ≠ 3")} 인데 {v("f(2) = f(3)")}</span></div>
<div class="chk">✔ <b>개념 체크</b> {v("g(x) = x²")} 에서 {v("−1 ≠ 1")} 이지만 {v("g(−1) = g(1) =")} {BL["s"]} → 일대일함수가 ( 이다 · 아니다 )</div>
{MEMO}"""

g6 = [graph([('y', lambda x: 3 * x - 1, None)], win=(-2, 2, -3, 3), w=17, lab=[('x', 1), ('y', 2)]),
      graph([('y', lambda x: -x * x + 2, None)], win=(-2.5, 2.5, -3, 3), w=17, lab=[('x', 1), ('y', 2)]),
      graph([('y', lambda x: abs(x), None)], win=(-2.5, 2.5, -1, 3), w=17, lab=[('x', 1), ('y', 1)]),
      graph([('y', lambda x: -2 * x, (0, 9, True, False)), ('y', lambda x: x * x, (-9, 0, False, False))], win=(-2.5, 2.5, -3, 3), w=17, lab=[('x', 1), ('y', 1)])]
g7 = [graph([('y', lambda x: x, None), ('grid', [(1, 1)])], win=(-1.5, 2, -1.5, 2), w=15, lab=[('x', 1), ('y', 1)]),
      graph([('x', 1)], win=(-1.5, 2, -1.5, 2), w=15, lab=[('x', 1)]),
      graph([('y', lambda x: 1, None)], win=(-1.5, 2, -1.5, 2), w=15, lab=[('y', 1)])]
p2_left = f"""
{MON(2, '대각선 골렘')}
{P(6, "다음에서 일대일함수를 모두 찾고, 일대일대응인지 확인하시오.", GAME("★ 칸만"))}
<div class="dg">{G(g6[0], "(1) " + v("y = 3x − 1"))}{G(g6[1], "(2) " + v("y = −x² + 2"))}{G(g6[2], "(3) " + v("y = |x|"))}{G(g6[3], "(4)")}</div>
<div class="mini" style="text-align:right">(4) {v("x ≥ 0")} 이면 {v("y = −2x")} · {v("x < 0")} 이면 {v("y = x²")}</div>
<div class="pf">{S}일대일함수 : ( &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ) &nbsp; {S}일대일대응 : ( &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; )</div>
<div class="hint">💡 가로줄과 한 번만 만나면 일대일함수 · (4) 두 부분의 {v("y")} 값이 겹치지 않고 합치면 실수 전체</div>
<h3>STEP 3 항등함수 · 상수함수</h3>
<div class="word">낱말 상자 [ 항등함수 · 상수함수 ]</div>
<div class="box" style="font-size:9.4pt;line-height:1.7">
함수 {v("f : X → X")} 에서 {v("f(x) = x")} (자기 자신이 대응) → {BL["m"]} <span class="mini">· 일대일대응이다</span><br>
함수 {v("f : X → Y")} 에서 {v("f(x) = c")} ({v("c")}는 상수 · 모두 한 원소로) → {BL["m"]}</div>
<div class="chk">✔ <b>개념 체크</b> (문제 7) 그래프 중 항등함수 ( &nbsp;&nbsp; ) · 상수함수 ( &nbsp;&nbsp; )
<div class="dg">{G(g7[0], "(1)")}{G(g7[1], "(2)")}{G(g7[2], "(3)")}</div></div>
{MON(3, '쌍둥이 뿔 늑대 · ✍ 서술형')}
<div class="q"><b class="ex">중단원 10)</b> 두 집합 {v("X = {x | 1 ≤ x ≤ 3}")}, {v("Y = {y | −1 ≤ y ≤ 5}")}에 대하여 {v("X")}에서 {v("Y")}로의 함수 {v("f(x) = a&hairsp;x + b")}가 일대일대응일 때, 상수 {v("a")}와 {v("b")}의 순서쌍 {v("(a, b)")}를 모두 구하는 풀이 과정과 답을 쓰시오. {GAME("소레이드 ★ 칸 · ✍ 서술형 📸")}</div>
<div class="pf">
① {S}일대일대응 → 정의역의 양 끝 {v("1, 3")} 이 공역의 양 끝 {BL["s"]}, {BL["s"]} 에 대응<br>
② {S}{v("a > 0")} 일 때 맞는 식 : {BL["m"]}, {BL["m"]}<br>
③ {S}{v("a > 0")} : 두 식을 빼면 {v("a =")} {BL["s"]}, {v("b =")} {BL["s"]}<br>
④ {S}{v("a < 0")} : {v("f(1) =")} {BL["s"]}, {v("f(3) =")} {BL["s"]} → {v("a =")} {BL["s"]}, {v("b =")} {BL["s"]}<br>
👑 {S}{v("(a, b) =")} {BL["m"]}, {BL["m"]}</div>
"""

p2_right_a = f"""
<div class="hint">💡 근거 : 일차함수가 일대일대응 → 정의역 양 끝이 공역 양 끝에 대응 ({v("a < 0")} 이면 엇갈려)</div>
<div class="essay"><b>✍ 나의 풀이</b> <span class="mini">(양 끝 대응 → {v("a > 0")} → {v("a < 0")} → 순서쌍)</span>
<div class="ln"></div><div class="ln"></div><div class="ln"></div></div>"""

fq = lambda n, s, h: f'<div class="q">{n}. {s}</div>{W(h)}'
f2 = [graph([('y', lambda x: x + 1, None)], win=(-2, 2, -2, 2), w=15), graph([('x', 1)], win=(-2, 2, -2, 2), w=15),
      graph([('y', lambda x: x * x, None)], win=(-2, 2, -2, 2), w=15), graph([('y', lambda x: -1, None)], win=(-2, 2, -2, 2), w=15)]
p2_right = p2_right_a + f"""
<div class="fa"><div class="tt">✔ 15차시 형성평가 <span class="mini" style="font-weight:400">(혼자 풀기 · 4문항)</span>{GAME("보스")}</div>
<div class="mon"><b class="ex">👑 보스</b> <span class="nm">그래프 용</span></div>
{fq(1, "정의역이 " + v("{−1, 0, 1}") + "인 함수 " + v("f(x) = 2x − 1") + " 의 그래프는 " + v("{(−1,") + " " + BL["s"] + v("), (0,") + " " + BL["s"] + v("), (1,") + " " + BL["s"] + v(")}"), 1)}
<div class="q">2. 다음 중 함수의 그래프가 <u>아닌</u> 것은? ( &nbsp;&nbsp;&nbsp; )</div>
<div class="dg">{G(f2[0], "①")}{G(f2[1], "②")}{G(f2[2], "③")}{G(f2[3], "④")}</div>
{fq(3, v("y = x + 2") + ", " + v("y = x²") + ", " + v("y = |x| + 1") + ", " + v("y = −3x") + " 중 일대일대응을 모두 고르면 " + BL["m"], 2)}
{fq(4, "ㄱ. " + v("y = x") + " &nbsp;ㄴ. " + v("y = x² + 1") + " &nbsp;ㄷ. " + v("y = 5") + " &nbsp;ㄹ. " + v("y = 2x") + " 에서<br>일대일대응 ( &nbsp;&nbsp;&nbsp; ) · 항등함수 ( &nbsp;&nbsp; ) · 상수함수 ( &nbsp;&nbsp; )", 2)}
<div class="mini" style="border-top:1px dashed #9bb;padding-top:1.5mm">맞은 개수 {BL["s"]} / 4 &nbsp;어려웠던 부분<br>{CB}함수의 그래프 {CB}일대일함수 · 일대일대응 {CB}항등 · 상수함수</div></div>
<div class="add mini">🎯 <b>더 해 보고 싶다면</b> — 캠프의 복습 허수아비 · 👑 형성평가 재대결</div>"""
STAMP = '<div class="stampwrap" style="margin-top:auto"><div class="stamp"><span>확인 도장</span></div></div>'
rng = '공통수학2 Ⅲ. 함수와 그래프 1. 함수 01. 함수 (15차시) · 레이드용 v3'
hd = header('15차시', rng)
goal = '<div class="goal"><b>학습목표</b> ① 함수의 그래프를 나타내고 함수의 그래프인지 판단할 수 있다. ② 일대일함수 · 일대일대응 · 항등함수 · 상수함수를 구별할 수 있다.</div>'
pg = lambda g, l, r, n: f'<div class="page">{hd}{g}<div class="cols"><div class="col">{l}</div><div class="col">{r}</div></div><div class="pno">- 15차시 ({n}/2) -</div></div>'
html = f"<!DOCTYPE html><html><head><meta charset='utf-8'><title>학습과정 15차시 레이드용 v3 (함수의 그래프)</title><style>{CSS}{EXTRA}{KCSS}</style></head><body>{pg(goal + review, keybox + p1_left, p1_right, 1)}{pg('', p2_left, p2_right + STAMP, 2)}</body></html>"
open(OUT.replace('.pdf', '.html'), 'w', encoding='utf-8').write(html)
with sync_playwright() as p:
    b = p.chromium.launch(); page = b.new_page(); page.set_content(html); page.wait_for_timeout(300)
    bot = page.evaluate("""() => [...document.querySelectorAll('.col')].map(c => { const k = [...c.children].filter(e => !e.classList.contains('memo')).pop(); return k ? Math.round((k.getBoundingClientRect().bottom - c.closest('.page').getBoundingClientRect().top) * 25.4 / 96) : 0 })""")
    page.pdf(path=OUT, format='A4', print_background=True, prefer_css_page_size=True); b.close()
print('단 아래끝:', bot)
