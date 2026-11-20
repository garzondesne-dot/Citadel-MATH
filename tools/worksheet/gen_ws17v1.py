# 17차시 레이드용 v1 「역함수」 (2026-11-20 · 손발 #7 · 메타인지 8 컨펌 #6 = A1 · B1 · C1 · D1 · E1) · gen_ws16v1.py + gen_ws15v2.py(그래프) 기반
#   교과서 미래엔 공통수학2 113~116쪽(역함수 · 성질 · 구하기 · 그래프 y = x 대칭) + 중단원 마무리 04 · 08(118~119쪽)
#   몬스터 1 = 문제 1(그림 완성 · 값) · 몬스터 2 = 문제 2 + 문제 4 ⑴(그래프) · 몬스터 3 = 중단원 08 ⚔ 소레이드 (서술형) · 형성평가 4 (1 ~ 2 = 중단원 04)
#   실행: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tools/worksheet/gen_ws17v1.py <출력.pdf>
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
        if k in ('y', 'yd', 'yr'):
            col, dsh = {'y': ('#1b3d8f', ''), 'yd': ('#888', ' stroke-dasharray="3,2"'), 'yr': ('#c0392b', '')}[k]
            f, dom = p[1], p[2]
            a, b = (dom[0], dom[1]) if dom else (x1, x2)
            a, b = max(a, x1), min(b, x2); N = 160; seg = []; segs = []
            for i in range(N + 1):
                x = a + (b - a) * i / N; y = f(x)
                if y1 - 0.2 <= y <= y2 + 0.2: seg.append(f'{X(x):.2f},{Y(y):.2f}')
                elif seg: segs.append(seg); seg = []
            if seg: segs.append(seg)
            for sg in segs: s.append(f'<polyline points="{" ".join(sg)}" fill="none" stroke="{col}" stroke-width="{1 if k == "yd" else 1.5}"{dsh}/>')
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
① {v("(g∘f)(x) =")} {BL["m"]} &nbsp;
② 합성에서 성립하는 법칙 = {BL["m"]}</div>"""

KEYS = [('일차방정식 풀기', '문제 1 · 문제 2', f'{v("3x + 4 = 10")} 의 해는?', ['2', '14/3', '6']),
        ('연립방정식 (빼서 풀기)', '몬스터 3', f'{v("a + b = 5")}, {v("2a + b = 8")} 일 때 {v("a")} 는?', ['3', '2', '5'])]
C5 = '①②③④⑤'
keybox = '<div class="keys"><div class="kt">🔑 입장 열쇠 <span class="mini">대기실에서 먼저 · 중학교 복습</span></div><div class="kr one">' + ''.join(
    f'<div class="kq"><b>🔑{i + 1} {n}</b> <span class="kg"> · {u}</span><br>{q}<div class="kc">{" &nbsp; ".join(f"{C5[j]} {v(c)}" for j, c in enumerate(ch))} &nbsp;&nbsp; 답 ( &nbsp;&nbsp;&nbsp; )</div></div>'
    for i, (n, u, q, ch) in enumerate(KEYS)) + '</div></div>'

sub = lambda a, n: f'{a}<tspan baseline-shift="sub" font-size="7">{n}</tspan>'
GX = ['메테인', '이산화 탄소', '아산화 질소']
GY = ['N' + sub('', 2) + 'O', 'CH' + sub('', 4), 'CO' + sub('', 2)]
gas = diagram(GX, GY, [(GX[0], GY[1]), (GX[1], GY[2]), (GX[2], GY[0])], w=34, label=('온실가스 X', '화학식 Y'), rx=26, cl=30, cr=92, fs=8.5)
EXF = diagram(['1', '2', '3', '4'], ['3', '4', '5', '6'], [('1', '6'), ('2', '3'), ('3', '4'), ('4', '5')], w=24)
p1_left = f"""
<h3>생각 열기 🔍</h3>
<div class="open" style="display:flex;gap:2mm;align-items:center"><div>{gas}</div><div>화살표의 방향을 반대로 바꾼 대응도 {v("Y")}에서 {v("X")}로의 함수가 될까?<br><span class="mini">→ 화학식마다 온실가스가 꼭 하나씩 있다</span></div></div>
<h3>STEP 1 역함수</h3>
<div class="word">낱말 상자 [ 일대일대응 · 역함수 · {v("f<sup>−1</sup>")} ]</div>
<div class="box">함수 {v("f : X → Y")} 가 {BL["m"]}일 때, {v("Y")}의 각 원소 {v("y")}에 {v("f(x) = y")}인 {v("X")}의 원소 {v("x")}를 대응시키는 함수를 {v("f")}의 {BL["s"]}라 하고 {BL["s"]} 로 나타낸다.<br>
{v("y = f(x) ⇔ x = f<sup>−1</sup>(y)")}
<div style="display:flex;align-items:center;gap:2mm;margin-top:0.6mm">{EXF}<span class="mini">보기) {v("f(1) = 6")} 이므로 {v("f<sup>−1</sup>(6) = 1")}<br>{v("(f<sup>−1</sup>∘f)(2) = 2")} · {v("(f∘f<sup>−1</sup>)(5) = 5")}<br>{v("(f<sup>−1</sup>)<sup>−1</sup>(3) = f(3) = 4")}</span></div></div>
<div class="chk">✔ <b>개념 체크</b> 역함수가 존재하려면 {v("f")} 가 ( 일대일함수 · 일대일대응 · 상수함수 ) 이어야 한다.</div>
{MEMO}"""

YX = ('yd', lambda x: x, None)
gx = lambda f, g, w=19: graph([YX, ('y', f, None), ('yr', g, None)], win=(-3, 3, -3, 3), w=w, lab=[('x', 1), ('y', 1)])
ex3 = graph([YX, ('y', lambda x: 2 * x - 2, None), ('yr', lambda x: x / 2 + 1, None)], win=(-3, 4, -3, 4), w=24, lab=[('x', 1), ('x', 2), ('y', 1), ('y', 2)])
g4 = [gx(lambda x: 5 * x - 2, lambda x: (x + 2) / 5), gx(lambda x: 5 * x - 2, lambda x: x / 5 - 2), gx(lambda x: 5 * x - 2, lambda x: -5 * x - 2)]
PX = diagram(['1', '2', '3', '4'], ['1', '3', '5', '7'], [('1', '3'), ('2', '5'), ('4', '1')], w=26)
p1_right = f"""
{MON(1, '거울 박쥐')}
{P(1, "함수 f : X → Y 의 역함수가 존재하도록 오른쪽 그림을 완성하고, 다음을 구하시오.", GAME("★ 칸만"))}
<div style="display:flex;gap:2mm;align-items:center"><div class="pf" style="flex:1">
{S}그림 완성 : 3 → {BL["s"]}<br>
(1) {S}{v("f<sup>−1</sup>(7) =")} {BL["s"]}<br>
(2) {S}{v("(f<sup>−1</sup>∘f)(4) =")} {BL["s"]}<br>
(3) {S}{v("(f∘f<sup>−1</sup>)(3) =")} {BL["s"]}<br>
(4) {S}{v("(f<sup>−1</sup>)<sup>−1</sup>(2) =")} {BL["s"]}</div><div>{PX}</div></div>
<h3>STEP 2 역함수 구하기</h3>
<div class="box" style="font-size:9.4pt;line-height:1.75">
<b>① {v("x")} 에 대하여 푼다 → ② {v("x")} 와 {v("y")} 를 바꾼다</b> &nbsp;<span class="mini">(먼저 일대일대응인지 확인)</span><br>
예제) {v("y = 3x + 4")}<br>
① {v("x")}에 대하여 풀면 {v("3x = y − 4")} → {v("x =")} {BL["m"]}<br>
② {v("x")}와 {v("y")}를 바꾸면 {v("y =")} {BL["m"]}</div>
<div class="chk">✔ <b>개념 체크</b> {v("y = f(x)")} 의 역함수를 구할 때 마지막에 하는 일은 ( {v("x")} 와 {v("y")} 를 바꾼다 · 양변을 제곱한다 )</div>
<h3>STEP 3 함수와 역함수의 그래프</h3>
<div class="box" style="font-size:9.4pt;line-height:1.7"><div style="display:flex;gap:2mm;align-items:center"><div>
점 {v("(a, b)")} 가 {v("y = f(x)")} 위에 있으면 점 {v("(b, a)")} 는 {v("y = f<sup>−1</sup>(x)")} 위에 있다.<br>
→ {v("y = f(x)")} 와 {v("y = f<sup>−1</sup>(x)")} 의 그래프는 직선 {BL["m"]} 에 대하여 대칭<br>
<span class="mini">보기) {v("y = 2x − 2")} (파랑) 의 역함수 {v("y = (1/2)x + 1")} (빨강) · 점선 = {v("y = x")}</span></div><div>{ex3}</div></div></div>
{MEMO}"""

p2_left = f"""
{MON(2, '되감는 시계 정령')}
{P(2, "다음 함수의 역함수를 구하시오.", GAME("★ 칸만"))}
<div class="pf">(1) {S}{v("y = −3x + 1")} → {v("y =")} {BL["m"]} &nbsp;&nbsp; (2) {S}{v("y = (1/4)x + 2")} → {v("y =")} {BL["m"]}</div>
{P(4, "함수 y = 5x − 2 (파랑) 와 그 역함수 (빨강) 의 그래프로 알맞은 것은? (점선 = y = x)", GAME("★ 칸만"))}
<div class="dg">{G(g4[0], "①")}{G(g4[1], "②")}{G(g4[2], "③")}</div>
<div class="pf">{S}답 ( &nbsp;&nbsp;&nbsp; ) &nbsp; <span class="mini">까닭: 빨강이 파랑을 직선 {v("y = x")} 로 접은 모양</span></div>
{MON(3, '뒤집힌 화살 사수 · ✍ 서술형')}
<div class="q"><b class="ex">중단원 08)</b> {v("함수 f(x) = ax + b 가 f(−1) = 1 과 f<sup>−1</sup>(3) = −2 를 만족시킬 때, f(4) 의 값을 구하시오. (단, a 와 b 는 상수)")} {GAME("소레이드 ★ 칸 · ✍ 서술형 📸")}</div>
<div class="pf">
① {S}{v("f<sup>−1</sup>(3) = −2")} 이므로 {v("f(")}{BL["s"]}{v(") =")} {BL["s"]}<br>
② {S}{v("f(−1) = 1")} : {BL["m"]} {v("= 1")}<br>
③ {S}{v("f(−2) = 3")} : {BL["m"]} {v("= 3")}<br>
④ {S}두 식을 빼면 {v("a =")} {BL["s"]}, {v("b =")} {BL["s"]}<br>
👑 {S}그러므로 {v("f(4) =")} {BL["s"]}</div>
<div class="hint">💡 근거 : {v("f<sup>−1</sup>(b) = a ⇔ f(a) = b")} — 역함수 값은 원래 함수의 식으로 바꿔 쓴다</div>
<div class="essay"><b>✍ 나의 풀이</b> <span class="mini">(f<sup>−1</sup> 의 뜻 → 식 두 개 → 연립 → a, b → f(4))</span>
<div class="ln"></div><div class="ln"></div><div class="ln"></div><div class="ln"></div></div>
{MEMO}"""

fq = lambda n, s, h: f'<div class="q">{n}. {s}</div>{W(h)}'
g3 = [gx(lambda x: 2 * x + 2, lambda x: x / 2 - 1, 15), gx(lambda x: 2 * x + 2, lambda x: -2 * x - 2, 15), gx(lambda x: 2 * x + 2, lambda x: 2 * x - 2, 15)]
p2_right = f'''
<h3>📝 오늘 정리</h3>
<div class="box" style="font-size:9.6pt;line-height:1.7">
<b>역함수</b> : {v("f")} 가 일대일대응일 때 {v("f<sup>−1</sup> : Y → X")}, {v("y = f(x) ⇔ x = f<sup>−1</sup>(y)")}<br>
<b>구하기</b> : {v("x")} 에 대하여 풀고 → {v("x")} 와 {v("y")} 를 바꾼다 &nbsp;·&nbsp; <b>그래프</b> : 직선 {v("y = x")} 대칭</div>
<div class="fa"><div class="tt">✔ 17차시 형성평가 <span class="mini" style="font-weight:400">(혼자 풀기 · 4문항)</span>{GAME("보스")}</div>
<div class="mon"><b class="ex">👑 보스</b> <span class="nm">역함수의 거울 군주</span></div>
<div class="q" style="margin-bottom:1mm">함수 {v("f(x) = 4x + 6")} 에 대하여 (1 ~ 2)</div>
{fq(1, v("f<sup>−1</sup>(2)") + " = " + BL["s"], 6)}
{fq(2, v("f<sup>−1</sup>(x)") + " = " + BL["m"], 6)}
<div class="q">3. 함수 {v("y = 2x + 2")} (파랑) 와 그 역함수 (빨강) 의 그래프는? ( &nbsp;&nbsp; )</div>
<div class="dg">{G(g3[0], "①")}{G(g3[1], "②")}{G(g3[2], "③")}</div>
{fq(4, "함수 " + v("f(x) = ax + b") + " 가 " + v("f(1) = 5") + ", " + v("f<sup>−1</sup>(2) = 0") + " 을 만족시킬 때 " + v("f(2)") + " = " + BL["s"], 9)}
<div class="mini" style="border-top:1px dashed #9bb;padding-top:1.5mm">맞은 개수 {BL["s"]} / 4 &nbsp;어려웠던 부분<br>{CB}역함수의 값 {CB}역함수 구하기 {CB}그래프 대칭 {CB}f<sup>−1</sup> 를 식으로</div></div>
<div class="add mini">🎯 <b>더 해 보고 싶다면</b> — 캠프의 복습 허수아비 · 👑 형성평가 재대결</div>'''
STAMP = '<div class="stampwrap" style="margin-top:auto"><div class="stamp"><span>확인 도장</span></div></div>'
rng = '공통수학2 Ⅲ. 함수와 그래프 1. 함수 03. 역함수 (17차시) · 레이드용 v1'
hd = header('17차시', rng)
goal = '<div class="goal"><b>학습목표</b> 역함수의 개념을 설명하고, 역함수를 구할 수 있다.</div>'
pg = lambda g, l, r, n: f'<div class="page">{hd}{g}<div class="cols"><div class="col">{l}</div><div class="col">{r}</div></div><div class="pno">- 17차시 ({n}/2) -</div></div>'
html = f"<!DOCTYPE html><html><head><meta charset='utf-8'><title>학습과정 17차시 레이드용 v1 (역함수)</title><style>{CSS}{EXTRA}{KCSS}</style></head><body>{pg(goal + review, keybox + p1_left, p1_right, 1)}{pg('', p2_left, p2_right + STAMP, 2)}</body></html>"
open(OUT.replace('.pdf', '.html'), 'w', encoding='utf-8').write(html)
with sync_playwright() as p:
    b = p.chromium.launch(); page = b.new_page(); page.set_content(html); page.wait_for_timeout(300)
    bot = page.evaluate("""() => [...document.querySelectorAll('.col')].map(c => { const k = [...c.children].filter(e => !e.classList.contains('memo')).pop(); return k ? Math.round((k.getBoundingClientRect().bottom - c.closest('.page').getBoundingClientRect().top) * 25.4 / 96) : 0 })""")
    page.pdf(path=OUT, format='A4', print_background=True, prefer_css_page_size=True); b.close()
print('단 아래끝:', bot)
