#!/usr/bin/env python3
"""🏰 집합 · 명제 중단원 레이드 · 레이드용 학습지 시안 (🌊 설계 묶음 #3 · 설계 방) — gen_ws13v1.py 양식 그대로

  bash tools/worksheet/setup_wslib.sh   (글꼴 · 파이썬 playwright)
  PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers WSLIB_DIR=<tools/worksheet> python3 gen_ws.py <출력 폴더>
→ ws-mid-set.pdf · ws-mid-set-teacher.pdf · ws-mid-prop.pdf · ws-mid-prop-teacher.pdf (+ html)
숫자 = 교과서 원래 숫자(미래엔 공통수학2 78~79쪽 · 96~97쪽) = 팩 판 0 과 같음.
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('WSLIB_DIR', os.path.join(HERE, '..', '..', '..', '..', 'tools', 'worksheet')))
from wslib import CSS, v, C, BL, CB, GAME, header, teacher
from playwright.sync_api import sync_playwright
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE
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
.review { border:1px solid #9bb; background:#f4f8fb; border-radius:2mm; padding:1.5mm 2.5mm; margin:1.5mm 0 2mm 0; font-size:9.2pt; line-height:1.75; }
.review .two { display:grid; grid-template-columns:1fr 1fr; gap:0 6mm; }
.essay { border:1.5px solid #6a7fa8; border-radius:2mm; padding:1.5mm 2.5mm; margin:1.5mm 0; }
.essay .ln { border-bottom:1px dashed #b9c4d8; height:7mm; }
.hint { font-size:8.8pt; color:#6b4a00; background:#fff6dc; border-radius:1.5mm; padding:0.8mm 2mm; margin:1mm 0; }
.pf { border:1px solid #7a8aa8; border-radius:2mm; padding:1.2mm 2.4mm; margin:1mm 0; font-size:9.6pt; line-height:1.8; }
.sub { margin:0.8mm 0 0.8mm 3mm; line-height:1.9; }
'''
P = lambda n, s, tag, src: f'<div class="q"><b class="ex">문제 {n})</b> {s} {T(src)} {tag}</div>'
MON = lambda n, name: f'<div class="mon"><b class="ex">👾 몬스터 {n}</b> <span class="nm">{name}</span></div>'
W = lambda h: f'<div style="height:{h}mm"></div>'
PAR = '(&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)'
TF = '( 참 / 거짓 )'
STAMP = '<div class="stampwrap" style="margin-top:auto"><div class="stamp"><span>확인 도장</span></div></div>'
fq = lambda n, s, h: f'<div class="q">{n}. {s}</div>{W(h)}'

def build(name, lesson, rng, goal, review, p1l, p1r, p2l, p2r):
    hd = header(lesson, rng)
    g = f'<div class="goal"><b>학습목표</b> {goal}</div>'
    pg = lambda top, l, r, n: f'<div class="page">{hd}{top}<div class="cols"><div class="col">{l}</div><div class="col">{r}</div></div><div class="pno">- {lesson} ({n}/2) -</div></div>'
    html = f"<!DOCTYPE html><html><head><meta charset='utf-8'><title>학습과정 {lesson} 레이드용 v1 시안</title><style>{CSS}{EXTRA}</style></head><body>{pg(g + review, p1l, p1r, 1)}{pg('', p2l, p2r + STAMP, 2)}</body></html>"
    out = os.path.join(OUT, name + '.pdf')
    open(out.replace('.pdf', '.html'), 'w', encoding='utf-8').write(html)
    with sync_playwright() as p:
        b = p.chromium.launch(); page = b.new_page(); page.set_content(html); page.wait_for_timeout(300)
        bot = page.evaluate("""() => [...document.querySelectorAll('.col')].map(c => { const k = [...c.children].filter(e => !e.classList.contains('memo') && !e.classList.contains('stampwrap')).pop(); return k ? Math.round((k.getBoundingClientRect().bottom - c.closest('.page').getBoundingClientRect().top) * 25.4 / 96) : 0 })""")
        page.pdf(path=out, format='A4', print_background=True, prefer_css_page_size=True); b.close()
    print(name, '단 아래끝(mm):', bot, '← 281 이하')
    assert max(bot) <= 281, bot

AC = v('A') + C; BC = v('B') + C

# ════════════════ 집합 ════════════════
set_review = f"""<div class="review"><b>🔁 전시 확인 · 집합 한 장 정리</b> <span class="mini">(빈칸을 채우며 단원을 한 장으로)</span>
<div class="two"><div>
① 대상이 분명한 모임 = {BL["s"]} · 그 대상 하나하나 = {BL["s"]}<br>
② 원소를 {{ }} 안에 나열 = {BL["m"]} · 조건으로 = {BL["m"]}<br>
③ {v("A")}의 모든 원소가 {v("B")}에 속한다 = {v("A")} {BL["s"]} {v("B")}</div><div>
④ 둘 다 = {v("A")} {BL["s"]} {v("B")} · 적어도 한쪽 = {v("A")} {BL["s"]} {v("B")} · {v("U")}에서 {v("A")}를 뺀 것 = {BL["s"]}<br>
⑤ {v("n(A ∪ B) = n(A) + n(B) −")} {BL["m"]}<br>
⑥ 드모르간의 법칙 : {v("(A ∪ B)")}{C} = {BL["m"]}</div></div></div>"""

set_p1l = f"""
<h3>STEP 1 집합의 표현과 포함 관계</h3>
<div class="word">낱말 상자 [ 원소나열법 · 약수 · ⊂ ]</div>
<div class="box">조건제시법 {v("{x | x는 6의 약수}")} → {BL["m"]} {v("{1, 2, 3, 6}")}<br>
{v("{1, 3}")} 의 원소가 모두 {v("{1, 2, 3, 6}")} 에 있다 → {v("{1, 3}")} {BL["s"]} {v("{1, 2, 3, 6}")}<br>
<span class="mini">방정식의 해도 원소 : {v("{x | x² − 3x + 2 = 0} = {1, 2}")}</span></div>
{MON(1, '수정 슬라임')}
{P(1, "다음 집합을 원소나열법으로 나타내시오.", GAME("★ 칸만"), "02")}
<div class="sub">⑴ {S}{v("{x | x는 21의 약수}")} = {BL["l"]}<br>
⑵ {S}{v("{x | x² − 7x + 6 = 0}")} = {BL["l"]}</div>
{P(2, "두 집합 " + v("A") + "와 " + v("B") + " 사이의 포함 관계를 기호 ⊂ 를 써서 나타내시오.", GAME("★ 칸만"), "03")}
<div class="sub">⑴ {S}{v("A = {1, 3, 7, 15}")}, {v("B = {x | x는 홀수}")} → {BL["m"]}<br>
⑵ {S}{v("A = {x | x는 16의 약수}")}, {v("B = {2, 4}")} → {BL["m"]}</div>
{MEMO}"""

set_p1r = f"""
<h3>STEP 2 집합의 연산과 원소의 개수</h3>
<div class="word">낱말 상자 [ 교집합 · 합집합 · 여집합 · 차집합 · 드모르간 ]</div>
<div class="box" style="font-size:9.4pt;line-height:1.75">
{v("A ∩ B")} = {BL["m"]} · {v("A ∪ B")} = {BL["m"]}<br>{AC} = {BL["m"]} · {v("A − B")} = {BL["m"]}<br>
{v("n(A ∪ B) = n(A) + n(B) − n(A ∩ B)")} · {v("n(")}{AC}{v(") = n(U) − n(A)")}<br>
{BL["m"]}의 법칙 : {AC} ∩ {BC} = {v("(A ∪ B)")}{C}</div>
{MON(2, '바위 골렘')}
{P(3, "전체집합 " + v("U = {1, 2, 3, …, 10}") + " 의 두 부분집합 " + v("A = {1, 5, 9, 10}") + ", " + v("B = {x | x는 10의 약수}") + " 에 대하여 다음을 구하시오.", GAME("★ 칸만"), "05")}
<div class="sub">⑴ {S}{v("A ∩ B")} = {BL["l"]}<br>
⑵ {S}{v("A ∪ B")} = {BL["l"]}<br>
⑶ {S}{AC} = {BL["l"]}<br>
⑷ {S}{v("A − B")} = {BL["l"]}</div>
{MEMO}"""

set_p2l = f"""
{MON(3, '반사 골렘 · ✍ 서술형')}
{P(4, "전체집합 " + v("U = {x | x는 30 이하의 자연수}") + " 의 두 부분집합 " + v("A = {x | x는 6의 배수}") + ", " + v("B = {x | x는 24의 약수}") + " 에 대하여 " + v("n(") + AC + " ∩ " + BC + v(")") + " 를 구하시오.", GAME("소레이드 ★ 칸 · ✍ 서술형 📸"), "10")}
<div class="pf">
① {S}{AC} ∩ {BC} = ( {BL["m"]} ){C} &nbsp;<span class="mini">← 드모르간의 법칙</span><br>
② {S}{v("n(A)")} = {BL["s"]} , {v("n(B)")} = {BL["s"]}<br>
③ {S}{v("n(A ∪ B)")} = {BL["s"]} &nbsp;<span class="mini">({v("A ∩ B")} = {BL["m"]})</span><br>
👑 {S}그러므로 {v("n(")}{AC} ∩ {BC}{v(")")} = {BL["s"]}</div>
<div class="hint">💡 근거 ① {v("n(A ∪ B) = n(A) + n(B) −")} {BL["m"]} &nbsp; ② {v("n(X")}{C}{v(") = n(U) −")} {BL["s"]}</div>
<div class="essay"><b>✍ 나의 풀이</b> <span class="mini">(드모르간 → 원소의 개수 → 합집합 → 전체에서 빼기)</span>
<div class="ln"></div><div class="ln"></div><div class="ln"></div><div class="ln"></div><div class="ln"></div></div>
{MEMO}"""

set_p2r = f'''
<div class="fa" style="margin-top:0"><div class="tt">✔ 집합 중단원 형성평가 <span class="mini" style="font-weight:400">(혼자 풀기 · 4문항)</span>{GAME("보스")}</div>
<div class="mon"><b class="ex">👑 보스</b> <span class="nm">성채 드래곤</span></div>
{fq(1, "다음에서 집합인 것을 모두 고르시오. " + T("01") + " " + PAR + "<br>⑴ 인구수가 많은 나라의 모임 &nbsp;⑵ π보다 작은 자연수의 모임<br>⑶ 1에 가까운 실수의 모임", 4)}
{fq(2, v("n(A) = 18") + ", " + v("n(B) = 23") + ", " + v("n(A ∪ B) = 30") + " 일 때 " + v("n(A ∩ B)") + " = " + BL["s"] + " " + T("04"), 10)}
{fq(3, "전체집합 " + v("U = {1, 2, 3, 4, 5}") + " 의 부분집합 중에서 집합 " + v("A = {1, 2, 4}") + " 와 서로소인 집합을 모두 쓰시오. " + T("06") + "<br>" + BL["xl"], 9)}
{fq(4, "100 이하의 자연수 중에서 자연수 " + v("k") + "의 배수의 집합을 " + v("A") + "<sub>" + v("k") + "</sub> 로 나타낼 때, " + v("n(A") + "<sub>10</sub> ∩ (" + v("A") + "<sub>3</sub> ∪ " + v("A") + "<sub>8</sub>" + v("))") + " = " + BL["s"] + " " + T("09"), 20)}
<div class="mini" style="border-top:1px dashed #9bb;padding-top:1.5mm">맞은 개수 {BL["s"]} / 4 &nbsp;어려웠던 부분<br>{CB}집합의 뜻 {CB}원소의 개수 {CB}서로소 {CB}배수의 집합</div></div>
<div class="add mini">🎯 <b>더 해 보고 싶다면</b> — 캠프의 복습 허수아비 · 🏰 성채던전 1층 (같은 문제 · 다른 숫자)</div>'''

# ════════════════ 명제 ════════════════
prop_review = f"""<div class="review"><b>🔁 전시 확인 · 명제 한 장 정리</b> <span class="mini">(빈칸을 채우며 단원을 한 장으로)</span>
<div class="two"><div>
① 참 · 거짓을 분명히 가릴 수 있는 문장 = {BL["s"]} · {v("x")}에 따라 달라지는 문장 = {BL["s"]}<br>
② 조건이 참이 되는 원소의 집합 = {BL["m"]} · {v("~p")}의 진리집합 = {BL["s"]}<br>
③ ‘모든’의 부정 = {BL["s"]} · ‘어떤’의 부정 = {BL["s"]}</div><div>
④ {v("p → q")} 가 참 ⇔ {v("P")} {BL["s"]} {v("Q")}<br>
⑤ {v("p → q")} 의 역 = {BL["m"]} · 대우 = {BL["m"]}<br>
⑥ {v("p ⇒ q")} 일 때 {v("p")}는 {v("q")}이기 위한 {BL["s"]}조건 · {v("q")}는 {v("p")}이기 위한 {BL["s"]}조건</div></div></div>"""

prop_p1l = f"""
<h3>STEP 1 조건과 진리집합 · 부정</h3>
<div class="word">낱말 상자 [ 진리집합 · 여집합 · 어떤 · 모든 ]</div>
<div class="box" style="font-size:9.4pt;line-height:1.75">{v("U = {1, 2, 3, 4}")}, {v("p")}: {v("x")}는 짝수 → {BL["m"]} {v("P = {2, 4}")}<br>
{v("~p")}의 진리집합 = {v("P")}의 {BL["m"]} = {v("{1, 3}")}<br>
‘모든 {v("x")}에 대하여 {v("p")}’의 부정 = ‘{BL["s"]} {v("x")}에 대하여 {v("~p")}’ <span class="mini">(&gt; 의 부정은 ≤)</span></div>
{MON(1, '열쇠 유령')}
{P(1, "전체집합 " + v("U = {x | x는 7 이하의 자연수}") + " 에 대하여 두 조건 " + v("p") + ": " + v("x² − 6x + 8 = 0") + ", " + v("q") + ": " + v("x² − 6x + 9 > 0") + " 일 때, 다음 조건의 진리집합을 구하시오.", GAME("★ 칸만"), "02")}
<div class="sub">⑴ {S}{v("p")} : {BL["m"]} &nbsp; ⑵ {S}{v("q")} : {BL["l"]}<br>
⑶ {S}{v("~p")} : {BL["l"]} &nbsp; ⑷ {S}{v("~q")} : {BL["m"]}</div>
{P(2, "다음 명제의 부정을 쓰고, 그 참 · 거짓을 판별하시오.", GAME("★ 칸만"), "05")}
<div class="sub">⑴ {S}모든 실수 {v("x")}에 대하여 {v("x² > x − 1")} 이다.<br>&nbsp;&nbsp;부정 : {BL["xl"]} {TF}<br>
⑵ {S}어떤 실수 {v("x")}에 대하여 {v("|3x − 2| < 0")} 이다.<br>&nbsp;&nbsp;부정 : {BL["xl"]} {TF}</div>
{MEMO}"""

prop_p1r = f"""
<h3>STEP 2 역과 대우 · 충분조건과 필요조건</h3>
<div class="word">낱말 상자 [ 역 · 대우 · 충분 · 필요 ]</div>
<div class="box" style="font-size:9.4pt;line-height:1.75">
{v("p → q")} 의 {BL["s"]} = {v("q → p")} · {BL["s"]} = {v("~q → ~p")} <span class="mini">(명제와 대우는 참 · 거짓이 같다)</span><br>
{v("P ⊂ Q")} 이면 {v("p ⇒ q")} : {v("p")}는 {BL["s"]}조건 · {v("q")}는 {BL["s"]}조건 &nbsp;·&nbsp; {v("P = Q")} 이면 필요충분조건</div>
{MON(2, '뒤집개 박쥐')}
{P(3, "다음 명제의 역과 대우를 쓰고, 그 참 · 거짓을 판별하시오.", GAME("★ 칸만"), "03")}
<div class="sub">⑴ {v("x")}가 자연수이면 {v("x")}는 유리수이다.<br>
&nbsp;&nbsp;{S}역 : {BL["xl"]} {TF}<br>&nbsp;&nbsp;{S}대우 : {BL["xl"]} {TF}<br>
⑵ {v("x(x + 1) = 0")} 이면 {v("x + 1 = 0")} 이다.<br>
&nbsp;&nbsp;{S}역 : {BL["xl"]} {TF}<br>&nbsp;&nbsp;{S}대우 : {BL["xl"]} {TF}</div>
{P(4, "두 조건 " + v("p") + "와 " + v("q") + "가 다음과 같을 때, " + v("p") + "는 " + v("q") + "이기 위한 어떤 조건인지 쓰시오.", GAME("★ 칸만"), "04")}
<div class="sub">⑴ {S}{v("p")}: {v("x ≤ 1")} , {v("q")}: {v("−3 ≤ x ≤ 0")} → {BL["m"]}조건<br>
⑵ {S}{v("p")}: {v("a = b")} , {v("q")}: {v("a² = b²")} → {BL["m"]}조건<br>
⑶ {S}{v("p")}: {v("|x| ≤ 1")} , {v("q")}: {v("−1 ≤ x ≤ 1")} → {BL["m"]}조건</div>
{MEMO}"""

prop_p2l = f"""
{MON(3, '천칭 가고일 · ✍ 서술형')}
{P(5, "실수 " + v("x") + "에 대하여 두 조건 " + v("p") + ": " + v("x² − 10x + 9 ≤ 0") + ", " + v("q") + ": " + v("x ≤ a") + " 일 때, " + v("p") + "가 " + v("q") + "이기 위한 충분조건이 되도록 하는 실수 " + v("a") + "의 값의 범위를 구하시오.", GAME("소레이드 ★ 칸 · ✍ 서술형 📸"), "08")}
<div class="pf">
① {S}{v("x² − 10x + 9 = (x − 1)(x − 9) ≤ 0")} → {v("P = {x |")} {BL["s"]} ≤ {v("x")} ≤ {BL["s"]} {v("}")}<br>
② {S}{v("p")}가 {v("q")}이기 위한 충분조건 → {v("P")} {BL["s"]} {v("Q")}<br>
③ {S}{v("Q = {x | x ≤ a}")} 가 {v("P")}를 모두 포함하려면 {v("P")}의 가장 {BL["s"]} 수 {BL["s"]} 이(가) {v("Q")}에 들어가야 한다<br>
👑 {S}그러므로 {v("a")}의 값의 범위는 {BL["m"]}</div>
<div class="hint">💡 근거 : 명제 {v("p → q")} 가 {BL["s"]}이면 {v("p")}는 {v("q")}이기 위한 충분조건</div>
<div style="margin:1.5mm 0;font-size:8.8pt;color:#555">수직선에 {v("P")}와 {v("Q")}를 그려 보자.
<svg viewBox="0 0 260 34" style="width:100%;height:12mm"><line x1="6" y1="22" x2="254" y2="22" stroke="#444" stroke-width="1"/><polygon points="254,22 248,19 248,25" fill="#444"/>
<g font-size="8" fill="#444" text-anchor="middle"><line x1="60" y1="19" x2="60" y2="25" stroke="#444"/><text x="60" y="33">1</text><line x1="190" y1="19" x2="190" y2="25" stroke="#444"/><text x="190" y="33">9</text></g></svg></div>
<div class="essay"><b>✍ 나의 풀이</b> <span class="mini">(진리집합 → 충분조건의 뜻 → 포함 관계 → 범위)</span>
<div class="ln"></div><div class="ln"></div><div class="ln"></div><div class="ln"></div></div>
{MEMO}"""

prop_p2r = f'''
<div class="fa" style="margin-top:0"><div class="tt">✔ 명제 중단원 형성평가 <span class="mini" style="font-weight:400">(혼자 풀기 · 4문항)</span>{GAME("보스")}</div>
<div class="mon"><b class="ex">👑 보스</b> <span class="nm">필요충분의 천칭 수호자</span></div>
{fq(1, "다음에서 명제를 모두 찾고, 그 참 · 거짓을 판별하시오. " + T("01") + "<br>⑴ " + v("√4") + " 는 유리수이다. " + PAR + " &nbsp;⑵ " + v("x") + "는 100보다 큰 수이다. " + PAR + "<br>⑶ 26은 3의 배수이다. " + PAR + " &nbsp;⑷ 우리나라는 아름다운 나라이다. " + PAR, 3)}
{fq(2, "두 조건 " + v("p") + ", " + v("q") + "의 진리집합을 각각 " + v("P") + ", " + v("Q") + "라 하자. 명제 " + v("p → ~q") + " 가 참일 때, 옳은 것을 모두 고르시오. " + T("06") + " " + PAR + "<br>ㄱ. " + v("P ⊂ Q") + C + " &nbsp;ㄴ. " + v("P ∩ Q = Q") + " &nbsp;ㄷ. " + v("P") + C + v(" ∩ Q = Q") + " &nbsp;ㄹ. " + v("P") + C + " ∪ " + v("Q") + C + v(" = U"), 8)}
{fq(3, "실수 " + v("x") + "에 대하여 " + v("p") + ": " + v("x² − 4a² ≤ 0") + ", " + v("q") + ": " + v("|x − 3| ≤ 4") + " 일 때, 명제 " + v("p → q") + " 의 역이 참이 되도록 하는 자연수 " + v("a") + "의 최솟값 = " + BL["s"] + " " + T("07"), 20)}
{fq(4, "실수 " + v("x") + "에 대하여 " + v("p") + ": " + v("a") + v("x² + 2x − 4 ≥ 0") + ", " + v("q") + ": " + v("x² + 2") + v("b") + v("x + 25 > 0") + " 이다. 다음 두 명제가 모두 거짓이 되도록 하는 정수 " + v("a") + "의 최댓값을 " + v("M") + ", 자연수 " + v("b") + "의 최솟값을 " + v("m") + "이라 할 때 " + v("M + m") + " = " + BL["s"] + " " + T("10") + "<br>(가) 어떤 실수 " + v("x") + "에 대하여 " + v("p") + "이다. &nbsp;(나) " + v("~p") + "는 " + v("q") + "이기 위한 충분조건이다.", 26)}
<div class="mini" style="border-top:1px dashed #9bb;padding-top:1.5mm">맞은 개수 {BL["s"]} / 4 &nbsp;어려웠던 부분<br>{CB}명제 찾기 {CB}진리집합 {CB}역 · 대우 {CB}충분 · 필요</div></div>
<div class="add mini">🎯 <b>더 해 보고 싶다면</b> — 캠프의 복습 허수아비 · 🏰 성채던전 2층 (같은 문제 · 다른 숫자)</div>'''

if __name__ == '__main__':
    build('ws-mid-set', '집합 중단원 레이드', '공통수학2 Ⅱ-1. 집합 · 중단원 마무리 (교과서 78~79쪽) · 레이드용 v1 시안',
          '① 집합 단원의 핵심 개념을 한 장으로 정리한다. ② 중단원 마무리 문제를 반 전체가 함께 해결한다.', set_review, set_p1l, set_p1r, set_p2l, set_p2r)
    build('ws-mid-prop', '명제 중단원 레이드', '공통수학2 Ⅱ-2. 명제 · 중단원 마무리 (교과서 96~97쪽) · 레이드용 v1 시안',
          '① 명제 단원의 핵심 개념을 한 장으로 정리한다. ② 중단원 마무리 문제를 반 전체가 함께 해결한다.', prop_review, prop_p1l, prop_p1r, prop_p2l, prop_p2r)
    teacher(os.path.join(OUT, 'ws-mid-set-teacher.pdf'), '집합 중단원 레이드', '교과서 78~79쪽 중단원 마무리 · 레이드용 v1 시안', [
        '교과서 중단원 마무리 12문항 중 8문항을 레이드 한 차시로 묶음: 몬스터 1 = 02 · 03 / 몬스터 2 = 05 / 몬스터 3(산 · 소레이드) = 10 / 형성평가 = 01 · 04 · 06 · 09. 숫자는 교과서 그대로.',
        '수업에서 이미 쓴 07 · 08 · 11 · 12 는 넣지 않음. 같은 문제의 다른 숫자는 🏰 성채던전 1층에서 다시 만남.',
        '도입 = 🔁 집합 한 장 정리 빈칸을 TV 에 띄우고 말로 채움(3분). STEP 1 · 2 는 몬스터 앞에서 낱말만 다시 짚음.',
        '몬스터 3 은 드모르간 → n(A), n(B) → n(A ∪ B) → 전체에서 빼기 순서. 근거 줄 2개(합집합의 원소의 개수 · 여집합의 원소의 개수).',
        '형성평가 짝: 2번(04) = 몬스터 1 · 3번(06) · 4번(09) = 몬스터 2. 몬스터를 🎯 복습으로 보내면 짝 문항도 같이 빠짐.',
    ], [
        ('🔁 한 장 정리', '① 집합 · 원소 ② 원소나열법 · 조건제시법 ③ ⊂ ④ ∩ · ∪ · A<sup>C</sup> ⑤ n(A ∩ B) ⑥ A<sup>C</sup> ∩ B<sup>C</sup>'),
        ('STEP 1 · 2', '원소나열법 · ⊂ / 교집합 · 합집합 · 여집합 · 차집합 · 드모르간'),
        ('문제 1 (02)', '⑴ {1, 3, 7, 21} ⑵ {1, 6}'),
        ('문제 2 (03)', '⑴ A ⊂ B ⑵ B ⊂ A (A = {1, 2, 4, 8, 16})'),
        ('문제 3 (05)', 'B = {1, 2, 5, 10} → ⑴ {1, 5, 10} ⑵ {1, 2, 5, 9, 10} ⑶ {2, 3, 4, 6, 7, 8} ⑷ {9}'),
        ('문제 4 (10)', '① (A ∪ B)<sup>C</sup> ② n(A) = 5, n(B) = 8 ③ A ∩ B = {6, 12, 24} → n(A ∪ B) = 10 👑 30 − 10 = 20 · 💡 n(A ∩ B) · n(X)'),
        ('형성평가 1 (01)', '⑵ (1, 2, 3 으로 분명히 정해짐)'),
        ('형성평가 2 (04)', '18 + 23 − 30 = 11'),
        ('형성평가 3 (06)', 'U − A = {3, 5} 의 부분집합 → ∅, {3}, {5}, {3, 5}'),
        ('형성평가 4 (09)', 'A<sub>10</sub> ∩ (A<sub>3</sub> ∪ A<sub>8</sub>) = A<sub>30</sub> ∪ A<sub>40</sub> → 3 + 2 − 0 = 5'),
    ])
    teacher(os.path.join(OUT, 'ws-mid-prop-teacher.pdf'), '명제 중단원 레이드', '교과서 96~97쪽 중단원 마무리 · 레이드용 v1 시안', [
        '교과서 중단원 마무리 11문항 중 9문항을 레이드 한 차시로 묶음: 몬스터 1 = 02 · 05 / 몬스터 2 = 03 · 04 / 몬스터 3(산 · 소레이드) = 08 / 형성평가 = 01 · 06 · 07 · 10. 숫자는 교과서 그대로.',
        '수업에서 이미 쓴 09 와 13차시 내용인 11 은 넣지 않음. 같은 문제의 다른 숫자는 🏰 성채던전 2층에서 다시 만남.',
        '도입 = 🔁 명제 한 장 정리 빈칸을 TV 에 띄우고 말로 채움(3분).',
        '몬스터 3 은 진리집합 P → 충분조건 = P ⊂ Q → P 의 가장 큰 수가 Q 에 → 범위 순서. 수직선 그림을 먼저 그리게 함.',
        '형성평가 3번(07) · 4번(10) 은 교과서 서술형 · 발전 문항: 폰에는 답만 넣고 풀이는 학습지에 씀. 시간이 모자라면 몬스터 2 또는 3 을 🎯 복습으로 보내면 짝 문항(3번 · 4번)도 같이 빠짐.',
    ], [
        ('🔁 한 장 정리', '① 명제 · 조건 ② 진리집합 · P<sup>C</sup> ③ 어떤 · 모든 ④ ⊂ ⑤ q → p · ~q → ~p ⑥ 충분 · 필요'),
        ('STEP 1 · 2', '진리집합 · 여집합 · 어떤 / 역 · 대우 · 충분 · 필요'),
        ('문제 1 (02)', '⑴ {2, 4} ⑵ {1, 2, 4, 5, 6, 7} ⑶ {1, 3, 5, 6, 7} ⑷ {3}'),
        ('문제 2 (05)', '⑴ 어떤 실수 x에 대하여 x² ≤ x − 1 — 거짓 (x² − x + 1 &gt; 0) ⑵ 모든 실수 x에 대하여 |3x − 2| ≥ 0 — 참'),
        ('문제 3 (03)', '⑴ 역: x가 유리수이면 x는 자연수이다 (거짓) · 대우: x가 유리수가 아니면 x는 자연수가 아니다 (참) ⑵ 역: x + 1 = 0 이면 x(x + 1) = 0 (참) · 대우: x + 1 ≠ 0 이면 x(x + 1) ≠ 0 (거짓 · x = 0)'),
        ('문제 4 (04)', '⑴ 필요조건 ⑵ 충분조건 ⑶ 필요충분조건'),
        ('문제 5 (08)', '① 1 ≤ x ≤ 9 ② P ⊂ Q ③ 가장 큰 수 9 👑 a ≥ 9 · 💡 참'),
        ('형성평가 1 (01)', '명제 = ⑴ 참 · ⑶ 거짓 / ⑵ 조건 · ⑷ 명제 아님'),
        ('형성평가 2 (06)', 'P ∩ Q = ∅ → ㄱ, ㄷ, ㄹ'),
        ('형성평가 3 (07)', 'P: −2a ≤ x ≤ 2a · Q: −1 ≤ x ≤ 7 · Q ⊂ P → 2a ≥ 7 → 최솟값 4'),
        ('형성평가 4 (10)', '(가) 거짓 → a &lt; 0, 1 + 4a &lt; 0 → M = −1 · (나) 거짓 → b² − 25 ≥ 0 → m = 5 → M + m = 4'),
    ])
    print('끝')
