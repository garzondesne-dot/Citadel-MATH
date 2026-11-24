# 🏫 무안행복중 중학수학1 통계 3차시 「상대도수와 그 그래프」 학습지 시안 v1 (2026-11-25 · 📚 차시팩 #1)
#   양식 = 같은 학교 1 · 2차시 학습지(무안행복중학교 · 중학수학1 · 지난 시간 기억하기 · 생각 열기 · STEP · 문제 n) 게임: 몬스터 n · 형성평가 = 보스)
#   조판 = tools/worksheet/wslib.py CSS · BALANCE 그대로 (머리글만 이 학교 것)
#   쓰는 법: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 docs/handoff/pack-mid3/gen_ws3.py <출력.pdf> [teacher]
#   teacher = 같은 쪽 · 같은 칸에 정답(빨강) · 판서 메모 · 「학생 배포 ✕」
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', '..', 'tools', 'worksheet'))
from wslib import CSS, v, BALANCE
from playwright.sync_api import sync_playwright
OUT = sys.argv[1]
T = len(sys.argv) > 2 and sys.argv[2] == 'teacher'
R = '#d32f2f'
W = {'s': 12, 'm': 24, 'l': 36}


def B(ans, w='s'):
    """빈칸 · 교사용이면 정답을 빨강으로"""
    if T: return f'<span class="ans" style="min-width:{W[w]}mm">{ans}</span>'
    return f'<span class="bl" style="min-width:{W[w]}mm"></span>'


def SEL(opts, pick):
    """( 가 · 나 ) 고르기 · 교사용이면 고른 말만 빨강"""
    return '( ' + ' · '.join(f'<span class="ans" style="border:0">{o}</span>' if (T and o == pick) else o for o in opts) + ' )'


TM = lambda s: f'<div class="tmemo"><b>판서</b> {s}</div>' if T else ''
GAME = lambda t: f'<span class="gtag">게임: {t}</span>'

# ── 자료 (교과서 256 ~ 259쪽) · 독립 검산은 verify3.py ──
READ = [('5', '10', 1), ('10', '15', 3), ('15', '20', 9), ('20', '25', 5), ('25', '30', 2)]       # 생각 열기 [표 5] · 20명
HUM = [('30', '40', 10), ('40', '50', 6), ('50', '60', 4), ('60', '70', 2), ('70', '80', 6), ('80', '90', 2)]  # 문제 1 · 30곳
PUMP = [270, 324, 210, 315, 232, 436, 271, 262, 326, 425, 293, 524, 269, 156, 381, 227, 342, 432, 286, 258, 161, 284, 455, 356, 409]  # 문제 2 · 25개
SVC_A = [0.1, 0.16, 0.42, 0.2, 0.12]      # 문제 3 · A 중학교 150명 · 계급 2~4 … 10~12 (교과서 그래프 · 정답 48명과 맞음)
SVC_B = [0.16, 0.24, 0.38, 0.12, 0.1]     # B 중학교 200명 (정답 44명과 맞음)
assert sum(n for *_, n in READ) == 20 and sum(n for *_, n in HUM) == 30 and len(PUMP) == 25
assert abs(sum(SVC_A) - 1) < 1e-9 and abs(sum(SVC_B) - 1) < 1e-9


def graph(xs, series, ymax=0.4, w=58, h=36, xunit='', bars=None, blank=False, legend=None):
    """상대도수 그래프 · xs = 가로축 눈금(계급의 양 끝 값) · series = [(색, [상대도수 …])] 도수분포다각형 · bars = 히스토그램 상대도수"""
    L, Bm, Tp, Rt = 9, 7, 3, 6
    PW, PH = 100, 100 * h / w
    n = len(xs) - 1
    X = lambda i: L + PW * (i + 1) / (n + 2)            # 앞뒤로 빈 계급 하나씩
    Y = lambda y: Tp + PH * (1 - y / ymax)
    s = [f'<svg viewBox="0 0 {L + PW + Rt} {Tp + PH + Bm}" width="{w}mm" xmlns="http://www.w3.org/2000/svg" font-size="4.2" font-family="DejaVu Sans">']
    step = 0.05
    k = 0
    while k * step <= ymax + 1e-9:
        y = k * step; major = k % 2 == 0
        s.append(f'<line x1="{L}" y1="{Y(y):.2f}" x2="{L + PW}" y2="{Y(y):.2f}" stroke="{"#9aa" if major else "#d4dada"}" stroke-width="{0.3 if major else 0.2}"/>')
        if major: s.append(f'<text x="{L - 1}" y="{Y(y) + 1.4:.2f}" text-anchor="end">{("%.1f" % y) if y else "0"}</text>')
        k += 1
    for i in range(n + 3):
        xg = L + PW * i / (n + 2)
        s.append(f'<line x1="{xg:.2f}" y1="{Tp}" x2="{xg:.2f}" y2="{Y(0):.2f}" stroke="#d4dada" stroke-width="0.2"/>')
    for i, t in enumerate(xs):
        xg = L + PW * (i + 1) / (n + 2)
        s.append(f'<text x="{xg:.2f}" y="{Y(0) + 4.6:.2f}" text-anchor="middle">{t}</text>')
    s.append(f'<line x1="{L}" y1="{Y(0)}" x2="{L + PW}" y2="{Y(0)}" stroke="#222" stroke-width="0.5"/><line x1="{L}" y1="{Tp}" x2="{L}" y2="{Y(0)}" stroke="#222" stroke-width="0.5"/>')
    if xunit: s.append(f'<text x="{L + PW + 1}" y="{Y(0) + 4.6:.2f}" font-family="Noto Sans CJK KR">{xunit}</text>')
    if not blank:
        cw = PW / (n + 2)
        for i, r in enumerate(bars or []):
            x0 = L + PW * (i + 1) / (n + 2)
            s.append(f'<rect x="{x0:.2f}" y="{Y(r):.2f}" width="{cw:.2f}" height="{Y(0) - Y(r):.2f}" fill="#f6e3a6" stroke="#8a6d1d" stroke-width="0.35"/>')
        for col, vals in series:
            pts = [(L + PW * 0.5 / (n + 2), Y(0))] + [(L + PW * (i + 1.5) / (n + 2), Y(r)) for i, r in enumerate(vals)] + [(L + PW * (n + 1.5) / (n + 2), Y(0))]
            s.append(f'<polyline points="{" ".join(f"{a:.2f},{b:.2f}" for a, b in pts)}" fill="none" stroke="{col}" stroke-width="0.7"/>')
            s += [f'<circle cx="{a:.2f}" cy="{b:.2f}" r="0.9" fill="{col}"/>' for a, b in pts]
    if legend:
        for j, (col, nm) in enumerate(legend):
            x0 = L + 8 + j * 28
            s.append(f'<line x1="{x0}" y1="{Tp + 3}" x2="{x0 + 7}" y2="{Tp + 3}" stroke="{col}" stroke-width="0.9"/><text x="{x0 + 8.5}" y="{Tp + 4.4}" font-family="Noto Sans CJK KR">{nm}</text>')
    return ''.join(s) + '</svg>'


def rows(data, unit_mid=True):
    return ''.join(f'<tr><td>{a}{"<sup>이상</sup>" if i == 0 else ""} ~ {b}{"<sup>미만</sup>" if i == 0 else ""}</td>' for i, (a, b, *_) in enumerate(data))


EXTRA = f'''
body {{ font-size:10.2pt; line-height:1.55; }}
.hd .l {{ width:34mm; }} .hd .rr {{ width:46mm; }}
.word {{ border:1px dashed #9ab; padding:1mm 2mm; font-size:9.2pt; margin:1mm 0; font-weight:600; }}
table.d {{ border-collapse:collapse; font-size:9pt; line-height:1.3; margin:1mm 0; }}
table.d {{ flex:0 0 auto; }} table.d th, table.d td {{ border:1px solid #777; padding:0.5mm 1.6mm; text-align:center; white-space:nowrap; }}
table.d th {{ background:#e8eef7; }} table.d tr.sum td {{ background:#f3f3f3; font-weight:700; }}
.q {{ margin:1mm 0; }} .ex {{ color:#2a4a8a; }}
.gtag {{ display:inline-block; background:#55657e; color:#fff; font-size:7.6pt; font-weight:700; padding:0 1.6mm; border-radius:6px; margin-left:1mm; vertical-align:middle; }}
.flex {{ display:flex; gap:2.5mm; align-items:flex-start; }}
.raw {{ border:1px solid #999; border-radius:2mm; padding:1mm 2mm; font-size:9pt; letter-spacing:0.3px; word-spacing:2.2mm; line-height:1.5; margin:1mm 0; }}
.ans {{ display:inline-block; color:{R}; font-weight:700; border-bottom:1.2px solid {R}; text-align:center; padding:0 1mm; }}
.tmemo {{ border:1.3px solid {R}; border-radius:5px; padding:1mm 2.4mm; color:{R}; font-size:8.2pt; line-height:1.4; margin:1mm 0; }}
.stampwrap {{ display:flex; justify-content:flex-end; margin-top:2mm; }}
.fa {{ font-size:9.6pt; }}
'''

# ── 머리글 · 학습목표 ──
rng = '중학수학1 Ⅵ. 통계 · 1 자료의 정리와 해석 · 상대도수와 그 그래프 (교과서 256~259쪽)' + (' · 교사용 정답 · 학생 배포 ✕' if T else '')
hd = f'''<div class="hd"><div class="l"><div class="s">무안행복중학교</div><div class="m" style="font-size:14pt;padding:2mm 0">중학수학1</div></div>
<div class="c"><div class="t">학 습 과 정 · 3차시{" · 교사용" if T else ""}</div><div class="r">{rng}</div></div>
<div class="rr"><div>학년     반     번</div><div>이름</div></div></div>'''
goal = '<div class="goal"><b>학습목표</b> ① 상대도수를 구하고 상대도수의 분포표를 만들 수 있다. ② 상대도수의 분포를 그래프로 나타내고, 도수의 총합이 다른 두 자료를 비교할 수 있다.</div>'

# ── 1쪽 ──
blocks = []
blocks.append(f'''<h3 class="o">지난 시간 기억하기</h3>
<div class="q">① 히스토그램의 직사각형의 넓이 = 계급의 크기 × {B('도수', 'm')}</div>
<div class="q">② 도수분포다각형은 직사각형 윗변의 {B('중앙', 'm')} 에 점을 찍어 이은 그래프</div>
<div class="q">③ 도수분포다각형의 양 끝에는 도수가 {B('0')} 인 계급을 하나씩 더한다</div>''')

HINT0 = '<br><span class="mini">(3 ÷ 20 = 0.15)</span>' if T else ''
t5 = ''.join(f'<tr><td>{a}{"<sup>이상</sup>" if i == 0 else ""} ~ {b}{"<sup>미만</sup>" if i == 0 else ""}</td><td>{n}</td></tr>' for i, (a, b, n) in enumerate(READ))
blocks.append(f'''<h3 class="o">생각 열기 몇 명? 아니면 몇 %?</h3>
<div class="flex"><table class="d"><tr><th>독서 시간(시간)</th><th>학생 수</th></tr>{t5}<tr class="sum"><td>합계</td><td>20</td></tr></table>
<div style="font-size:9.4pt">지혜네 반 학생 20명의 일주일 독서 시간이다.<br><br>• 10시간 이상 15시간 미만인 학생은 전체의 몇 %일까? → {B('15')} %{HINT0}</div></div>
{TM('3명이 「많다 · 적다」는 전체가 몇 명인지 알아야 말할 수 있다 → 비율(상대도수)')}''')

t6 = ''.join(f'<tr><td>{a}{"<sup>이상</sup>" if i == 0 else ""} ~ {b}{"<sup>미만</sup>" if i == 0 else ""}</td><td>{n}</td><td>{B(r) if i in (2, 3) else r}</td></tr>'
             for i, ((a, b, n), r) in enumerate(zip(READ, ['0.05', '0.15', '0.45', '0.25', '0.1'])))
blocks.append(f'''<h3>STEP 1 상대도수</h3>
<div class="word">낱말 상자 [ 상대도수 · 도수의 총합 · 1 · 0 ]</div>
<div class="box">전체 도수에 대한 각 계급의 도수의 비율을 그 계급의 {B('상대도수', 'm')} 라고 한다.<br>
<b>(계급의 상대도수) = (계급의 도수) ÷ ( {B('도수의 총합', 'm')} )</b><br>
• 상대도수의 합은 항상 {B('1')} 이다.<br>• 상대도수는 {B('0')} 이상 1 이하의 수이다.<br>• 상대도수 × 100 = 백분율(%)</div>
<div class="flex"><table class="d"><tr><th>독서 시간(시간)</th><th>학생 수</th><th>상대도수</th></tr>{t6}<tr class="sum"><td>합계</td><td>20</td><td>1</td></tr></table>
<div class="mini" style="padding-top:2mm">빈칸을 채워 상대도수의 분포표를 완성하자.<br>9 ÷ 20 = ?<br>5 ÷ 20 = ?</div></div>''')

hum_ans = ['0.33', '0.2', '0.13', '0.07', '0.2', '0.07']
th1 = ''.join(f'<tr><td>{a}{"<sup>이상</sup>" if i == 0 else ""} ~ {b}{"<sup>미만</sup>" if i == 0 else ""}</td><td>{n}</td><td>{"0.13" if i == 2 else B(hum_ans[i])}</td></tr>' for i, (a, b, n) in enumerate(HUM))
blocks.append(f'''<h3>STEP 2 따라 하기</h3>
<div class="blk"><div class="q"><b class="ex">문제 1)</b> 어느 날 영남 지방 30개 지역의 습도를 조사한 상대도수의 분포표이다. 사람은 습도 약 40 % ~ 70 % 일 때 쾌적함을 느낀다. {GAME('몬스터 1')}</div>
<div class="flex"><table class="d"><tr><th>습도(%)</th><th>지역 수</th><th>상대도수</th></tr>{th1}<tr class="sum"><td>합계</td><td>30</td><td>1</td></tr></table>
<div style="font-size:9.4pt">⑴ 표를 완성하시오.<br><span class="mini">(반올림하여 소수 둘째 자리까지)</span><br><br>⑵ 습도가 40 % 이상 70 % 미만인 지역은 전체의 몇 %? → {B('40')} %</div></div></div>
{TM('⑵ 0.2 + 0.13 + 0.07 = 0.4 → 40 % · 반올림한 값을 더하면 오차가 생길 수 있어 (6 + 4 + 2) ÷ 30 으로 확인')}''')

g2 = graph(['5', '10', '15', '20', '25', '30'], [('#1b3d8f', [0.05, 0.15, 0.45, 0.25, 0.1])], ymax=0.5, w=50, h=32, xunit='시간', bars=[0.05, 0.15, 0.45, 0.25, 0.1])
blocks.append(f'''<h3>STEP 3 상대도수의 분포를 나타낸 그래프</h3>
<div class="box" style="font-size:9.6pt">그리는 방법은 히스토그램 · 도수분포다각형과 같다.<br>
① 가로축에 각 계급의 {B('양 끝 값', 'm')} 을 적는다.<br>② 세로축에 {B('상대도수', 'm')} 를 적는다.<br>③ 히스토그램이나 도수분포다각형과 같은 방법으로 그린다.</div>
<div class="flex"><div>{g2}</div><div class="mini" style="padding-top:3mm">STEP 1 독서 시간의<br>상대도수 그래프<br>(막대 = 히스토그램 꼴,<br>선 = 도수분포다각형 꼴)</div></div>''')

raw = ' '.join(str(x) for x in PUMP)
pump_n = ['2', '11', '6', '5', '1']; pump_r = ['0.08', '0.44', '0.24', '0.2', '0.04']
tp = ''.join(f'<tr><td>{a}{"<sup>이상</sup>" if i == 0 else ""} ~ {b}{"<sup>미만</sup>" if i == 0 else ""}</td><td>{B(pump_n[i])}</td><td>{B(pump_r[i])}</td></tr>'
             for i, (a, b) in enumerate([('100', '200'), ('200', '300'), ('300', '400'), ('400', '500'), ('500', '600')]))
g3 = graph(['100', '200', '300', '400', '500', '600'], [] if not T else [(R, [0.08, 0.44, 0.24, 0.2, 0.04])], ymax=0.5, w=62, h=34, xunit='g', blank=not T)
blocks.append(f'''<h3>STEP 4 혼자 풀기</h3>
<div class="blk"><div class="q"><b class="ex">문제 2)</b> 어느 농장에서 수확한 호박 25개의 무게(g)이다. {GAME('몬스터 2')}</div>
<div class="raw">{raw}</div>
<div class="flex"><table class="d"><tr><th>무게(g)</th><th>개수</th><th>상대도수</th></tr>{tp}<tr class="sum"><td>합계</td><td>25</td><td>1</td></tr></table>
<div style="font-size:9.4pt">⑴ 표를 완성하시오.<br><br>⑵ ⑴의 상대도수를 아래 모눈에 도수분포다각형 꼴로 그리시오.</div></div>
<div>{g3}</div></div>
{TM('먼저 계급마다 개수 세기(빠뜨림 확인: 2 + 11 + 6 + 5 + 1 = 25) → 25 로 나누기 · 다각형 양 끝은 0')}''')

# ── 2쪽 ──
blocks.append(f'''<h3>STEP 5 도수의 총합이 다른 두 자료 비교</h3>
<div class="blk"><div class="flex"><table class="d"><tr><th>나이(세)</th><th>수영</th><th>볼링</th></tr><tr><td>40<sup>이상</sup> ~ 50<sup>미만</sup></td><td>14</td><td>12</td></tr><tr class="sum"><td>합계</td><td>50</td><td>40</td></tr></table>
<div style="font-size:9.4pt">어느 체육 시설 회원 수<br>• 수영의 상대도수 = 14 ÷ 50 = {B('0.28')}<br>• 볼링의 상대도수 = 12 ÷ 40 = {B('0.3')}</div></div>
<div class="box" style="font-size:9.6pt">도수(명)는 수영이 많지만, 이 계급의 비율은 {SEL(['수영', '볼링'], '볼링')} 이 더 높다.<br>
→ 도수의 총합이 다른 두 자료는 도수보다 {B('상대도수', 'm')} 로 비교한다.</div></div>''')

g4 = graph(['2', '4', '6', '8', '10', '12'], [('#c0392b', SVC_A), ('#1b3d8f', SVC_B)], ymax=0.45, w=62, h=36, xunit='시간', legend=[('#c0392b', 'A'), ('#1b3d8f', 'B')])
blocks.append(f'''<div class="blk"><div class="q"><b class="ex">문제 3)</b> A 중학교 1학년 150명(빨강)과 B 중학교 1학년 200명(파랑)의 한 달 동안 봉사 활동 시간의 상대도수 그래프이다. {GAME('몬스터 3')}</div>
<div>{g4}</div>
<div class="q" style="font-size:9.6pt">⑴ 봉사 활동 시간이 8시간 이상 12시간 미만인 학생 수<br>&nbsp;&nbsp;&nbsp;A 중학교 → {B('48')} 명 &nbsp;&nbsp; B 중학교 → {B('44')} 명<br>
⑵ A 중학교 학생의 봉사 활동 시간이 B 중학교보다 상대적으로 더 많다고 할 수 있을까? {SEL(['있다', '없다'], '있다')}<br>
<span class="mini">까닭: 6시간 이상인 쪽의 비율이 {SEL(['A', 'B'], 'A')} 가 더 높다</span></div></div>
{TM('⑴ 0.32 × 150 = 48 · 0.22 × 200 = 44 · ⑵ 6시간 이상 A 0.74 · B 0.6')}''')

fq = lambda n, s: f'<div class="q">{n}. {s}</div>'
CL = [('0', '10', 3), ('10', '20', 7), ('20', '30', 8), ('30', '40', 5), ('40', '50', 2)]
tc = '<tr><th>통학 시간(분)</th>' + ''.join(f'<td>{a} ~ {b}</td>' for a, b, _ in CL) + '<td>합계</td></tr><tr><th>학생 수</th>' + ''.join(f'<td>{n}</td>' for *_, n in CL) + '<td>25</td></tr>'
blocks.append(f'''<div class="fa"><div class="tt">✔ 3차시 형성평가 <span class="mini" style="font-weight:400">(혼자 풀기 · 6문항)</span>{GAME('보스')}</div>
<div class="q" style="margin-bottom:0">어느 반 학생 25명의 통학 시간이다. (1 ~ 2) <span class="mini">(a ~ b = a 이상 b 미만)</span></div>
<table class="d" style="width:100%">{tc}</table>
{fq(1, f"10분 이상 20분 미만인 계급의 상대도수는? → {B('0.28')}")}
{fq(2, f"통학 시간이 20분 이상인 학생은 전체의 몇 %? → {B('60')} %")}
{fq(3, f"어떤 자료에서 상대도수의 합은 항상 1 이다. {SEL(['O', 'X'], 'O')}")}
{fq(4, f"도수의 총합이 40 인 자료에서 상대도수가 0.2 인 계급의 도수는? → {B('8')}")}
{fq(5, f"도수의 총합이 다른 두 자료를 비교할 때는 도수보다 상대도수를 비교하는 것이 알맞다. {SEL(['O', 'X'], 'O')}")}
<div class="q"><b style="color:#b02020">[도전]</b> 6. 수학 80점 이상인 학생이 1반은 30명 중 9명, 2반은 25명 중 8명이다. 80점 이상인 학생의 비율이 더 높은 반은? → {B('2')} 반</div>
{TM('2. (8 + 5 + 2) ÷ 25 = 0.6 · 4. 40 × 0.2 = 8 · 6. 1반 9 ÷ 30 = 0.3 · 2반 8 ÷ 25 = 0.32') if T else '''<div class="mini" style="margin-top:1mm">맞은 개수 <span class="bl" style="min-width:10mm"></span> / 6 &nbsp; 어려웠던 부분<br><span class="cb"></span>상대도수 구하기 <span class="cb"></span>% 로 바꾸기 <span class="cb"></span>도수 거꾸로 구하기 <span class="cb"></span>두 자료 비교</div>'''}</div>''')
if not T: blocks.append('<div class="stampwrap"><div class="stamp"><span>확인 도장</span></div></div>')

page = lambda l, n, g='': f'<div class="page">{hd}{g}<div class="cols"><div class="col">{l}</div><div class="col"></div></div><div class="pno">- 3차시 ({n}/2) -</div></div>'
html = f"<!DOCTYPE html><html><head><meta charset='utf-8'><title>학습과정 3차시 (상대도수와 그 그래프){' 교사용' if T else ''}</title><style>{CSS}{EXTRA}</style></head><body>{page(''.join(blocks), 1, goal)}{page('', 2)}</body></html>"
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); pg.set_content(html); pg.wait_for_timeout(300)
    pg.evaluate(BALANCE)
    bot = pg.evaluate("""() => [...document.querySelectorAll('.col')].map(c=>{const k=c.lastElementChild;return k?Math.round((k.getBoundingClientRect().bottom-c.closest('.page').getBoundingClientRect().top)*25.4/96):0})""")
    open(OUT.replace('.pdf', '.html'), 'w', encoding='utf-8').write(pg.content())
    pg.pdf(path=OUT, format='A4', print_background=True, prefer_css_page_size=True); b.close()
print('단 아래끝(mm):', bot, '← 281 이하')
