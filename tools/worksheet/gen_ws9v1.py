# 9차시 레이드용 v1 확정 (2026-11-10 선생님 「추천대로 컨펌」 · 시안 v4 + 문제 4 (2) = 과제 · v2 + 문제 2 (1) P, Q + ➕ 개념 플러스 2개(사각형 · 수의 포함 관계 · 2쪽 위) · v1 + STEP 3 기본 몬스터 = 89쪽 문제 3 · 선생님 「예제 없이 곧바로 중단원」) (2026-11-10 · 메타인지 방) · gen_ws8v6.py 기반
#   STEP 1 p → q 의 참 · 거짓(가정 · 결론 · 반례) · 2 역과 대우 · 3 명제와 대우의 참 · 거짓 · 몬스터 4(묘실) · ✍ 중단원 03 · 생각 열기 · 고르기 표기 · 미니게임 안내 없음
import os, sys, base64
WSD = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, WSD)
from wslib import CSS, v, C, BL, CB, GAME, header
from playwright.sync_api import sync_playwright
OUT = sys.argv[1]
S = '<b style="color:#d32f2f">★</b>'
T = lambda s: f'<span class="mini" style="color:#a0620a">(교과서 {s})</span>'
MEMO = '<div class="memo" style="flex:1">✏ 풀이 · 메모</div>'
def img(f):
    return 'data:image/png;base64,' + base64.b64encode(open(os.path.join(WSD, f), 'rb').read()).decode()
EXTRA = '''
.col { display:flex; flex-direction:column; }
.page { display:flex; flex-direction:column; } .cols { flex:1; min-height:0; }
.ex { color:#2a4a8a; }
body { font-size:10.2pt; line-height:1.55; } .q { margin:1.3mm 0; } h3 { margin:2.6mm 0 1.2mm 0; }
.hd .l { width:34mm; } .hd .rr { width:50mm; }
.word { border:1px dashed #9ab; padding:1mm 2mm; font-size:9pt; margin:1mm 0; }
.mon { display:flex; align-items:center; gap:2mm; margin:2mm 0 0.5mm 0; }
.mon img { width:13mm; height:13mm; image-rendering:pixelated; background:#2a2433; border-radius:2mm; }
.mon .nm { font-size:8.6pt; color:#6b5a40; }
.ck { font-size:8pt; color:#2f6f9a; font-weight:700; border:1px solid #2f6f9a; border-radius:1.2mm; padding:0 1mm; margin-right:1mm; }
.camp { border:2px dashed #b5851f; background:#fff7e0; border-radius:3mm; padding:2.5mm 3mm; margin:3mm 0; text-align:center; }
.camp b { font-size:11pt; color:#8a5a00; }
.review { border:1px solid #9bb; background:#f4f8fb; border-radius:2mm; padding:1.5mm 2.5mm; margin:1.5mm 0 2mm 0; font-size:9.4pt; }
'''
P = lambda n, s, tag: f'<div class="q"><b class="ex">문제 {n})</b> {v(s)} {tag}</div>'
OX = '( &nbsp;&nbsp;&nbsp;&nbsp; )'
CK = ''  # 11/10 선생님: ✔ 고르기 표기 없어도 학생들이 안다
MON = lambda n, name: f'<div class="mon"><b class="ex">👾 몬스터 {n}</b> <span class="nm">{name}</span></div>'
W = lambda h: f'<div style="height:{h}mm"></div>'


EXTRA = EXTRA + '''
.essay { border:1.5px solid #6a7fa8; border-radius:2mm; padding:1.5mm 2.5mm; margin:1.5mm 0; }
.essay .ln { border-bottom:1px dashed #b9c4d8; height:7mm; }
.hint { font-size:8.8pt; color:#6b4a00; background:#fff6dc; border-radius:1.5mm; padding:0.8mm 2mm; margin:1mm 0; }
'''
TF = '( 참 / 거짓 )'
review = f'''<div class="review"><b>🔁 전시 확인</b> (지난 시간) &nbsp;
① 조건 {v("p")}의 부정 {v("~p")}의 진리집합은 {v("P")}의 {BL["s"]} &nbsp;
② ‘모든 {v("x")}에 대하여 {v("p")}이다.’의 부정은 ‘( &nbsp;&nbsp;&nbsp;&nbsp; ) {v("x")}에 대하여 {v("~p")}이다.’</div>'''

p1_left = f'''
<h3>STEP 1 명제 p → q 의 참 · 거짓</h3>
<div class="word">낱말 상자 [ 가정 · 결론 · 반례 · 역 · 대우 ]</div>
<div class="box">명제 ‘{v("p")}이면 {v("q")}이다.’를 기호로 {v("p → q")}와 같이 나타내고, {v("p")}를 {BL["s"]}, {v("q")}를 {BL["s"]}이라 한다.<br>
두 조건 {v("p")}, {v("q")}의 진리집합을 {v("P")}, {v("Q")}라 할 때 &nbsp;{v("P ⊂ Q")} 이면 {v("p → q")}는 <b>참</b>, &nbsp;{v("P ⊄ Q")} 이면 <b>거짓</b><br>
<span class="mini">명제가 거짓임을 보이는 예를 {BL["s"]}라고 한다.</span></div>
{MON(1, '자물쇠 미믹')}
{P(1, "참인 명제 ‘3의 약수는 9의 약수이다.’를 p → q 꼴로 살펴보시오.", T("86쪽 함께하기") + " " + GAME("★ 칸만"))}
<div class="q">(1) {v("p")} : {v("x")}는 3의 약수이다. &nbsp; {v("q")} : {v("x")}는 {BL["m"]}이다.</div>
<div class="q">(2) {S}{v("P")} = {BL["m"]} &nbsp; {S}{v("Q")} = {BL["m"]}</div>
<div class="q">(3) {S}{v("P")} ( ⊂ / ⊄ ) {v("Q")} 이므로 명제는 {TF}</div>
{MON(2, '사슬 기사')}
{P(2, "다음 명제의 참 · 거짓을 판별하고, 거짓이면 반례를 하나 쓰시오.", T("87쪽 예제 1 · 문제 1") + " " + GAME("★ 칸만"))}
<div class="q">(1) {S}{v("x − 1 = 0")}이면 {v("x² = x")}이다.<br>&nbsp;&nbsp;{v("P")} = {BL["m"]}, {v("Q")} = {BL["m"]} → {v("P")} ( ⊂ / ⊄ ) {v("Q")} → {TF}</div>
<div class="q">(2) {S}소수는 홀수이다. {TF} &nbsp;반례 {BL["s"]}</div>
<div class="q">(3) {S}{v("x ≤ 6")}이면 {v("x² ≤ 36")}이다. <span class="mini">(단, {v("x")}는 실수)</span> {TF} &nbsp;반례 {BL["s"]}</div>
<div class="box" style="padding:1mm 2mm;margin-top:1.5mm"><b>➕ 개념 플러스 📐 사각형의 포함 관계</b> <span class="mini">(안쪽 ⊂ 바깥쪽)</span>
<div style="display:flex;gap:2mm;align-items:center"><svg viewBox="0 0 190 120" width="44mm" height="28mm" xmlns="http://www.w3.org/2000/svg" font-family="Noto Sans CJK KR" font-size="10.5">
<rect x="2" y="2" width="186" height="116" rx="8" fill="#fbfaf6" stroke="#7a6a50"/><text x="8" y="13" fill="#7a6a50" font-weight="700">사각형</text>
<rect x="12" y="17" width="170" height="96" rx="8" fill="#f3f7fb" stroke="#4a6fa5"/><text x="18" y="28" fill="#4a6fa5" font-weight="700">사다리꼴</text>
<rect x="22" y="32" width="152" height="76" rx="8" fill="#eef7ee" stroke="#3f8a4f"/><text x="28" y="43" fill="#3f8a4f" font-weight="700">평행사변형</text>
<ellipse cx="78" cy="76" rx="44" ry="26" fill="#ffe9d6" fill-opacity="0.75" stroke="#c46a1a"/><text x="44" y="68" fill="#c46a1a" font-weight="700">직사각형</text>
<ellipse cx="120" cy="76" rx="44" ry="26" fill="#efe1ff" fill-opacity="0.75" stroke="#7a4fb0"/><text x="136" y="68" fill="#7a4fb0" font-weight="700">마름모</text>
<text x="99" y="81" text-anchor="middle" font-weight="700" fill="#b02a2a">정사각형</text></svg><div style="font-size:7.8pt;line-height:1.4"><b>사다리꼴</b> : 한 쌍의 대변이 평행<br><b>평행사변형</b> : 두 쌍의 대변이 각각 평행<br><b>직사각형</b> : 네 각이 모두 직각<br><b>마름모</b> : 네 변의 길이가 모두 같음<br><b>정사각형</b> : 네 변이 같고 네 각이 직각</div></div>
<div class="mini">‘정사각형이면 마름모이다.’ ( 참 / 거짓 ) · ‘평행사변형이면 직사각형이다.’ ( 참 / 거짓 ) 반례 {BL["s"]}</div></div>
{MEMO}'''

p1_right = f'''
<h3>STEP 2 명제의 역과 대우</h3>
<div class="box">명제 {v("p → q")}에서 가정과 결론을 서로 바꾼 명제 {v("q → p")}를 {BL["m"]}이라 하고,<br>
가정과 결론을 각각 부정하여 서로 바꾼 명제 {v("~q → ~p")}를 {BL["m"]}라고 한다.<br>
<span class="mini">보기 ‘{v("x = 1")}이면 {v("x² = 1")}이다.’ → 역 : {v("x² = 1")}이면 {v("x = 1")}이다. · 대우 : {v("x² ≠ 1")}이면 {v("x ≠ 1")}이다.</span></div>
{MON(3, '열쇠 유령')}
{P(3, "다음 명제의 역과 대우를 쓰시오.", T("88쪽 문제 2") + " " + GAME("★ 칸만"))}
<div class="q">(1) {v("a = b")}이면 {v("a² = b²")}이다.<br>&nbsp;&nbsp;{S}역 : {BL["l"]}<br>&nbsp;&nbsp;{S}대우 : {BL["l"]}</div>
<div class="q">(2) {v("x² > 4")}이면 {v("x > 2")}이다.<br>&nbsp;&nbsp;{S}역 : {BL["l"]}<br>&nbsp;&nbsp;{S}대우 : {BL["l"]} <span class="mini">(&gt; 의 부정은 ≤)</span></div>
<h3>STEP 3 명제와 그 대우의 참 · 거짓</h3>
<div class="box">명제 {v("p → q")}가 참이면 그 대우 {v("~q → ~p")}도 {BL["s"]}이고, 거짓이면 대우도 {BL["s"]}이다.<br>
<span class="mini">까닭 : {v("P ⊂ Q")} 이면 {v("Q")}{C} ⊂ {v("P")}{C} &nbsp;·&nbsp; ⚠ <b>역</b>은 참 · 거짓이 같지 않을 수 있다 ({v("x = 1 → x² = 1")} 참, 역은 거짓 : {v("x = −1")})</span></div>
{MON(4, '봉인 석상')}
{P(4, "다음 명제의 대우를 쓰고, 대우를 이용하여 참 · 거짓을 판별하시오.", T("89쪽 문제 3") + " " + GAME("★ 칸만"))}
<div class="q">(1) {v("x")}가 4의 배수이면 {v("x")}는 짝수이다.<br>&nbsp;&nbsp;{S}대우 : {BL["l"]} {TF}</div>
<div class="q">(2) <span class="mini">(과제)</span> 자연수 {v("a")}: ‘{v("3a + 7")}이 홀수이면 {v("a")}는 짝수’의 대우 {BL["m"]}<br>&nbsp;&nbsp;{v("a")}가 홀수 → {v("3a")}는 ( 홀 / 짝 ), {v("3a + 7")}은 ( 홀 / 짝 ) → 대우 {TF} → 원래 {TF}</div>
{MEMO}'''

fq = lambda n, s, h: f'<div class="q">{n}. {s}</div>{W(h)}'
p2_left = f'''
<h3>➕ 개념 플러스 — 수의 포함 관계</h3>
<div class="box" style="padding:1.5mm 2.5mm"><b>🔢 수</b> <span class="mini">(자연수 ⊂ 정수 ⊂ 유리수 ⊂ 실수 · 무리수 ⊂ 실수 · 유리수와 무리수는 서로소)</span><div style="text-align:center"><svg viewBox="0 0 200 112" width="72mm" height="40mm" xmlns="http://www.w3.org/2000/svg" font-family="Noto Sans CJK KR" font-size="8">
<text x="100" y="9" text-anchor="middle" fill="#7a6a50" font-weight="700">실수 = 유리수 ∪ 무리수 (빈틈없이 둘로 나뉨)</text>
<rect x="2" y="13" width="196" height="96" rx="8" fill="#f3f7fb" stroke="#7a6a50" stroke-width="1.6"/>
<path d="M146 13 V109" stroke="#7a6a50" stroke-width="1.6"/>
<path d="M146 13 H190 a8 8 0 0 1 8 8 V101 a8 8 0 0 1 -8 8 H146 Z" fill="#efe1ff"/>
<path d="M146 13 V109" stroke="#7a6a50" stroke-width="1.6"/>
<text x="10" y="25" fill="#4a6fa5" font-weight="700">유리수 <tspan font-weight="400">½ · 0.3 · −0.7</tspan></text>
<rect x="12" y="30" width="122" height="72" rx="6" fill="#eef7ee" stroke="#3f8a4f"/><text x="18" y="41" fill="#3f8a4f" font-weight="700">정수 <tspan font-weight="400">−2 · −1 · 0</tspan></text>
<rect x="20" y="48" width="88" height="46" rx="5" fill="#ffe9d6" stroke="#c46a1a"/><text x="28" y="74" fill="#c46a1a" font-weight="700">자연수 <tspan font-weight="400">1 · 2 · 3 …</tspan></text>
<text x="172" y="56" text-anchor="middle" fill="#7a4fb0" font-weight="700">무리수</text><text x="172" y="72" text-anchor="middle" fill="#7a4fb0">√2 · π</text></svg></div>
<div style="font-size:8.4pt;line-height:1.45"><b>유리수</b> : 분수 {v("a/b")} ({v("a")}, {v("b")}는 정수, {v("b ≠ 0")}) 꼴로 나타낼 수 있는 수 · <b>무리수</b> : 유리수가 아닌 실수</div>
<div class="mini">‘{v("x")}가 정수이면 {v("x")}는 유리수이다.’ ( 참 / 거짓 ) · ‘{v("x")}가 유리수이면 {v("x")}는 정수이다.’ ( 참 / 거짓 ), 반례 : {BL["s"]}</div></div>
{MON(5, '뒤집개 박쥐 · ✍ 서술형')}
{P(5, "다음 명제의 역과 대우를 말하고, 그 참 · 거짓을 판별하시오.", T("96쪽 중단원 마무리 03") + " " + GAME("★ 칸 · ✍ 서술형 📸"))}
<div class="q">(1) {v("x")}가 자연수이면 {v("x")}는 유리수이다.</div>
<div class="q">&nbsp;&nbsp;{S}역 : {BL["l"]} {TF} 반례 {BL["s"]}</div>
<div class="q">&nbsp;&nbsp;{S}대우 : {BL["l"]} {TF}</div>
<div class="hint">💡 근거 : 명제와 그 대우의 참 · 거짓은 {BL["s"]}.</div>
<div class="essay"><b>✍ 나의 풀이</b> <span class="mini">(가정 · 결론 → 역 · 대우 → 참 · 거짓과 그 까닭을 문장으로)</span>
<div class="ln"></div><div class="ln"></div><div class="ln"></div><div class="ln"></div><div class="ln"></div></div>
{W(2)}
{MEMO}'''

p2_right = f'''
<div class="fa" style="margin-top:0"><div class="tt">✔ 9차시 형성평가 <span class="mini" style="font-weight:400">(혼자 풀기 · 4문항)</span>{GAME("보스")}</div>
<div class="mon"><b class="ex">👑 보스</b> <span class="nm">역과 대우의 문지기</span></div>
{fq(1, "명제 ‘" + v("x = 2") + "이면 " + v("x² = 4") + "이다.’의 가정과 결론을 쓰시오.", 12)}
{fq(2, v("U = {1, 2, …, 10}") + "일 때, 명제 ‘" + v("x") + "가 4의 배수이면 " + v("x") + "는 2의 배수이다.’에서 " + v("P") + ", " + v("Q") + "를 구하고 참 · 거짓을 판별하시오.", 16)}
{fq(3, "명제 ‘" + v("x > 1") + "이면 " + v("x > 3") + "이다.’의 참 · 거짓을 판별하고, 거짓이면 반례를 쓰시오.", 14)}
{fq(4, "명제 ‘" + v("x = 3") + "이면 " + v("x² = 9") + "이다.’의 역과 대우를 쓰고, 각각의 참 · 거짓을 판별하시오.", 18)}
<div class="mini" style="border-top:1px dashed #9bb;padding-top:1.5mm">맞은 개수 {BL["s"]} / 4 &nbsp;어려웠던 부분<br>{CB}가정 · 결론 {CB}{v("P ⊂ Q")} 로 참 · 거짓 {CB}반례 {CB}역 · 대우 {CB}대우의 참 · 거짓</div></div>
<div class="add mini">🎯 <b>더 해 보고 싶다면</b> — 캠프의 복습 허수아비 · 👑 형성평가 재대결 | 다음 시간 = 충분조건과 필요조건 (10차시)</div>
<div class="stampwrap" style="margin-top:auto"><div class="stamp"><span>확인 도장</span></div></div>'''

rng = '공통수학2 Ⅱ. 집합과 명제 2. 명제 02. 명제 사이의 관계 (9차시) · 레이드용 v1'
hd = header('9차시', rng)
goal = '<div class="goal"><b>학습목표</b> ① 명제 p → q 의 참 · 거짓을 진리집합으로 판별하고 반례를 찾을 수 있다. ② 명제의 역과 대우를 말하고, 명제와 그 대우의 참 · 거짓이 같음을 안다.</div>'
pg = lambda g, l, r, n: f'<div class="page">{hd}{g}<div class="cols"><div class="col">{l}</div><div class="col">{r}</div></div><div class="pno">- 9차시 ({n}/2) -</div></div>'
html = f"<!DOCTYPE html><html><head><meta charset='utf-8'><title>학습과정 9차시 레이드용 v1</title><style>{CSS}{EXTRA}</style></head><body>{pg(goal + review, p1_left, p1_right, 1)}{pg('', p2_left, p2_right, 2)}</body></html>"
open(OUT.replace('.pdf', '.html'), 'w', encoding='utf-8').write(html)
with sync_playwright() as p:
    b = p.chromium.launch(); page = b.new_page(); page.set_content(html); page.wait_for_timeout(300)
    bot = page.evaluate("""() => [...document.querySelectorAll('.col')].map(c => { const k = [...c.children].filter(e => !e.classList.contains('memo')).pop(); return k ? Math.round((k.getBoundingClientRect().bottom - c.closest('.page').getBoundingClientRect().top) * 25.4 / 96) : 0 })""")
    page.pdf(path=OUT, format='A4', print_background=True, prefer_css_page_size=True); b.close()
print('단 아래끝:', bot)
