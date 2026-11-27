# ✏ 출제 공방 「혼자 하기」 판 (2026-11-27 · 📚 차시팩 #1 · DECISIONS d6edf9f · 선생님 「출제 공방 학습지 스스로 학생들이 만들 수 있는 버전도 만들어봐」)
#   ① (출제 공방) 혼자 하기 안내_v1.pdf  A4 양면 — 앞: 따라 하기 한 바퀴(🏰 1층 04) · 바꾸기 사다리 / 뒤: 문장 틀 · 막힘 카드 · 시간 순서
#   ② (출제 공방) 문제 만들기 양식_양면_v2.pdf — 앞면(연습)만 새로 · 뒷면 = v1 PDF 2쪽을 그대로 붙임(한 픽셀도 안 바뀜)
#   쓰는 법: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 gen_quest_solo.py <v1 양식.pdf> <출력 폴더>
import os, sys, re
from fractions import Fraction
from playwright.sync_api import sync_playwright
from pypdf import PdfReader, PdfWriter
V1, OUT = sys.argv[1:3]
os.makedirs(OUT, exist_ok=True)
HERE = os.path.dirname(os.path.abspath(__file__))

# ── 예시 독립 검산 (🏰 1층 04 = n(A) = 16, n(B) = 21, n(A ∪ B) = 28 → n(A ∩ B) = 9 · lessons/eval-1.js m04 첫 판) ──
def inter(a, b, u): return a + b - u
CHECK = {
    '원래 04 → 9': inter(16, 21, 28) == 9,
    '🟢 숫자만 20 · 15 · 30 → 5': inter(20, 15, 30) == 5 and 5 <= min(20, 15),
    '🔵 조건 n(U) = 40 · n((A ∪ B)ᶜ) = 12 → 9': inter(16, 21, 40 - 12) == 9,
    '🔵 묻는 것 n(A − B) → 7': 16 - inter(16, 21, 28) == 7,
    '🔵 형식 객관식 ③ 9': [7, 8, 9, 10, 11].index(inter(16, 21, 28)) == 2,
    '🟣 상황 35명 · 축구 20 · 농구 18 · 둘 다 아님 5 → 8': inter(20, 18, 35 - 5) == 8,
    '오답 보기 예: 16 + 21 + 28 = 65 · 28 − 16 − 21 = −9 · 21 − 16 = 5 (정답 9 와 다름)': len({65, -9, 5, 9}) == 4,
}
A = frozenset({1, 2, 3}); OPTS = [('1 ⊂ A', False), ('{1} ∈ A', frozenset({1}) in {1, 2, 3}), ('{1} ⊂ A', {1} <= A), ('∅ ∈ A', frozenset() in {1, 2, 3}), ('4 ∈ A', 4 in A)]
CHECK['틀 2 예: 옳은 것은 ③ 하나'] = [i for i, (_, t) in enumerate(OPTS) if t] == [2]
CHECK['틀 3 예: {1, a + 1} = {1, 3} → a = 2'] = [a for a in range(-10, 11) if {1, a + 1} == {1, 3}] == [2]
bad = [k for k, ok in CHECK.items() if not ok]; assert not bad, bad

BASE_CSS = '''@page{size:A4;margin:0}*{box-sizing:border-box}
body{margin:0;font-family:"Noto Sans CJK KR",sans-serif;color:#1d1d1f;font-size:10.2pt}
.page{width:210mm;height:297mm;padding:11mm 12mm;position:relative;page-break-after:always;overflow:hidden}
h1{font-size:15pt;margin:0 0 1mm;letter-spacing:.5px} .sub{font-size:9pt;color:#555;margin-bottom:2.5mm}
.box{border:1.3px solid #333;border-radius:2mm;padding:2mm 3mm;margin-bottom:2.4mm;position:relative}
.box .t{font-weight:700;font-size:10.5pt;margin-bottom:1.2mm} .box .t small{font-weight:400;color:#666;font-size:8.5pt}
.n{display:inline-block;background:#2a4a8a;color:#fff;border-radius:50%;width:5.4mm;height:5.4mm;text-align:center;line-height:5.4mm;font-size:8.5pt;margin-right:1.5mm}
.ln{border-bottom:1px dashed #aab;height:7mm}
.chk{display:inline-block;width:3.6mm;height:3.6mm;border:1.3px solid #333;margin:0 1mm 0 3mm;vertical-align:-0.5mm}
.row{display:flex;gap:2.4mm}.row>.box{flex:1}
.fill{display:inline-block;border-bottom:1.3px solid #222;min-width:12mm;height:5mm;vertical-align:bottom}
.tip{font-size:8.6pt;color:#6b4a00;background:#fff6dc;border-radius:1.5mm;padding:1.2mm 2.5mm;margin-bottom:2.4mm}
.foot{position:absolute;bottom:9mm;left:0;right:0;text-align:center;font-size:8pt;color:#777}
.side{position:absolute;top:11mm;right:13mm;font-weight:800;font-size:11pt;border-radius:1.5mm;padding:1mm 3mm;color:#fff;background:#888}
.g{color:#1b7a3a;font-weight:700} .b{color:#1b4fa0;font-weight:700} .p{color:#7a2fa8;font-weight:700}
.hg{background:#d9f2df;border-radius:1mm;padding:0 .8mm} .hb{background:#dbe7fb;border-radius:1mm;padding:0 .8mm} .hp{background:#efdcf9;border-radius:1mm;padding:0 .8mm}
table.ex{border-collapse:collapse;width:100%;table-layout:fixed;font-size:9.6pt;line-height:1.5} table.ex th,table.ex td{border:1px solid #999;padding:1.2mm 1.6mm;vertical-align:top}
table.ex th{background:#eef2f8} .ans{color:#c0392b;font-weight:700}
.lad{display:flex;flex-direction:column-reverse;gap:1.2mm}
.rung{display:flex;align-items:center;gap:2mm;border-radius:2mm;padding:2mm 2.5mm;font-size:9.6pt}
.rung .k{font-weight:800;min-width:26mm}
.r1{background:#d9f2df}.r2{background:#dbe7fb}.r3{background:#c9dbf7}.r4{background:#efdcf9}
.frame{border:1.5px dashed #2a4a8a;border-radius:2mm;padding:2.2mm 3mm;margin-bottom:2mm;font-size:10pt}
.frame b.tag{display:inline-block;color:#fff;border-radius:1.2mm;padding:0 1.8mm;font-size:8.4pt;margin-right:1.5mm}
.obj{background:#b8541b}.subj{background:#2a7a4a}
.card{border:1.3px solid #c0392b;border-radius:2mm;padding:2.2mm 3mm;margin-bottom:2mm;font-size:9.8pt;background:#fff7f6}
.card b.q{color:#c0392b}
.time{display:flex;gap:1.4mm}.time div{flex:1;border:1.3px solid #2a4a8a;border-radius:2mm;padding:1.4mm;text-align:center;font-size:9pt}
.time div b{display:block;font-size:13pt;color:#2a4a8a}
.circ{display:inline-block;border:1.3px solid #333;border-radius:3mm;padding:.2mm 2.2mm;margin:0 .8mm;font-size:9.4pt}
'''

# ── ① 혼자 하기 안내 ──
ORIG = 'n(A) = 16, n(B) = 21, n(A ∪ B) = 28 일 때 n(A ∩ B) 는?'
O = lambda m: m   # 원래 문제에서 바뀌는 곳 표시
ORIGS = [
    'n(A) = <span class="hg">16</span>, n(B) = <span class="hg">21</span>, n(A ∪ B) = <span class="hg">28</span> 일 때 n(A ∩ B) 는?',
    'n(A) = 16, n(B) = 21, <span class="hb">n(A ∪ B) = 28</span> 일 때 n(A ∩ B) 는?',
    'n(A) = 16, n(B) = 21, n(A ∪ B) = 28 일 때 <span class="hb">n(A ∩ B)</span> 는?',
    'n(A) = 16, n(B) = 21, n(A ∪ B) = 28 일 때 n(A ∩ B) 는? <span class="hb">(답을 씀)</span>',
    '<span class="hp">n(A) = 16, n(B) = 21, n(A ∪ B) = 28</span> 일 때 <span class="hp">n(A ∩ B)</span> 는?',
]
rows = [
    ('🟢 숫자만', f'n(A) = <span class="hg">20</span>, n(B) = <span class="hg">15</span>, n(A ∪ B) = <span class="hg">30</span> 일 때 n(A ∩ B) 는?', '20 + 15 − 30 = <span class="ans">5</span>', '주관식'),
    ('🔵 조건', f'<span class="hb">n(U) = 40</span>, n(A) = 16, n(B) = 21, <span class="hb">n((A ∪ B)<sup>c</sup>) = 12</span> 일 때 n(A ∩ B) 는?', 'n(A ∪ B) = 40 − 12 = 28 → 16 + 21 − 28 = <span class="ans">9</span>', '주관식'),
    ('🔵 묻는 것', f'n(A) = 16, n(B) = 21, n(A ∪ B) = 28 일 때 <span class="hb">n(A − B)</span> 는?', 'n(A ∩ B) = 9 → n(A − B) = 16 − 9 = <span class="ans">7</span>', '주관식'),
    ('🔵 형식', f'n(A) = 16, n(B) = 21, n(A ∪ B) = 28 일 때 n(A ∩ B) 는? <span class="hb">① 7 ② 8 ③ 9 ④ 10 ⑤ 11</span>', '16 + 21 − 28 = 9 → <span class="ans">③</span>', '객관식'),
    ('🟣 상황', '<span class="hp">우리 반 35명 중 축구를 좋아하는 학생 20명, 농구를 좋아하는 학생 18명, 둘 다 좋아하지 않는 학생 5명</span>일 때, <span class="hp">둘 다 좋아하는 학생</span>은 몇 명?', '좋아하는 학생 35 − 5 = 30 → 20 + 18 − 30 = <span class="ans">8</span>', '주관식'),
]
ex = ''.join(f'<tr><th>{k}<br><small style="font-weight:400">{t}</small></th><td style="color:#555">{o}</td><td>{q}</td><td>{s}</td></tr>' for (k, q, s, t), o in zip(rows, ORIGS))
front = f'''<div class="page"><div class="side">앞 · 따라 하기</div>
<h1>✏ 출제 공방 · 혼자 하기 안내</h1>
<div class="sub">선생님 설명 없이도 이 종이만 보고 따라 할 수 있어요. 바탕은 🏰 성채 <b>1 ~ 3층</b> 문제 하나 → <b>바꿔서</b> 나만의 문제 → 앞면(연습)에서 다듬고 뒷면에 옮겨 써요.</div>
<div class="box"><div class="t"><span class="n">1</span>따라 하기 한 바퀴 <small>바탕 = 🏰 1층 04 · 교집합의 원소의 개수 (다 같이 풀어 본 방)</small></div>
<div style="font-size:9.6pt;margin-bottom:1.4mm"><b>원래 문제</b> {ORIG} &nbsp;→ 풀이 16 + 21 − 28 = <span class="ans">9</span> &nbsp;<small style="color:#666">(n(A ∩ B) = n(A) + n(B) − n(A ∪ B))</small></div>
<table class="ex"><colgroup><col style="width:20mm"><col style="width:44mm"><col><col style="width:40mm"></colgroup><tr><th>바꾼 곳</th><th>원래 문제 (바뀔 곳)</th><th>바꾼 문제 <small style="font-weight:400">(색칠 = 바뀐 곳)</small></th><th>정답 · 풀이</th></tr>{ex}</table>
<div style="font-size:8.6pt;color:#555;margin-top:1.2mm">👀 원래와 나란히 놓고 <b>무엇이 바뀌었는지</b> 색으로 표시해 보면 내 문제가 몇 단인지 바로 보여요.</div></div>
<div class="box"><div class="t"><span class="n">2</span>바꾸기 사다리 <small>위로 갈수록 어렵고 등급이 올라가요 · AI 가 같은 기준으로 판단해요</small></div>
<div class="lad">
<div class="rung r1"><span class="k g">① 숫자 🟢</span>뼈대 · 묻는 것 · 조건은 그대로, <b>숫자만</b> 바꿈 → 쉬운 문제</div>
<div class="rung r2"><span class="k b">② 조건 🔵</span>주어진 조건을 바꿈 (예: n(A ∪ B) 대신 n(U) 와 여집합) → 변형 문제</div>
<div class="rung r3"><span class="k b">③ 묻는 것 🔵</span>묻는 것을 바꿈 (예: n(A ∩ B) 대신 n(A − B)) · 객관식 ↔ 주관식 바꾸기도 여기 → 변형 문제</div>
<div class="rung r4"><span class="k p">④ 상황 🟣</span>새 이야기 · 새 상황으로 · 다른 개념과 연결 (예: 우리 반 운동 좋아하는 학생) → 독창 문제 · 명예의 전당 후보</div>
</div>
<div style="font-size:8.6pt;color:#555;margin-top:1.4mm">⚪ 반려가 되는 경우: 바탕과 다른 단원 · 정답이 틀림 · 풀 수 없음(조건이 부딪힘) · 글씨를 읽을 수 없음</div></div>
<div class="box"><div class="t">🧭 따라 하기 순서</div>
<div class="time" style="font-size:9pt"><div><b>①</b>바탕 방 문제를 <b>먼저 풀어</b> 정답 확인</div><div><b>②</b>사다리에서 <b>한 칸</b> 골라 한 곳만 바꾸기</div><div><b>③</b>바꾼 문제를 <b>두 번</b> 따로 풀기</div><div><b>④</b>원래 ↔ 바꾼 문제 나란히 → <b>색칠</b>로 확인</div></div></div>
<div class="tip">💡 처음이면 ① 🟢 부터! 숫자만 바꿔도 「답이 깔끔한지」 확인하는 연습이 돼요. 익숙해지면 한 칸씩 올라가요.</div>
<div class="foot">공통수학2 · 모두의 던전 · 출제 공방 혼자 하기 안내 (앞)</div></div>'''

frames = [
    ('subj', '주관식', '「 □ 가 ○ 일 때 △ 를 구하시오. 」', '예) n(A) = 20, n(B) = 15, n(A ∪ B) = 30 일 때 n(A ∩ B) 를 구하시오.'),
    ('obj', '객관식', '「 다음 중 옳은 것은? 」 + 보기 다섯 개 (정답 하나)', '예) A = {1, 2, 3} 일 때 다음 중 옳은 것은? ① 1 ⊂ A ② {1} ∈ A ③ {1} ⊂ A ④ ∅ ∈ A ⑤ 4 ∈ A'),
    ('subj', '주관식', '「 ~ 를 만족하는 ○ 의 값은? 」', '예) A = {1, a + 1}, B = {1, 3} 이고 A = B 를 만족하는 a 의 값은?'),
    ('subj', '상황', '「 (우리 이야기) … 일 때, … 인 ○ 은 몇 명(개)인가? 」', '예) 우리 반 35명 중 … 둘 다 좋아하는 학생은 몇 명인가?'),
]
fr = ''.join(f'<div class="frame"><b class="tag {c}">{lab}</b><b>틀 {i + 1}</b> {t}<div style="font-size:8.6pt;color:#555;margin-top:.6mm">{e}</div></div>' for i, (c, lab, t, e) in enumerate(frames))
cards = [
    ('답이 깔끔하지 않아요', '답이 음수 · 분수 · 너무 큰 수면 <b>숫자를 다시</b> 골라요. 집합 개수 문제는 n(A ∩ B) ≤ 작은 쪽 · n(A ∪ B) ≥ 큰 쪽이 되게.'),
    ('객관식 오답 보기가 안 떠올라요', '친구가 할 만한 실수 세 가지에서 하나씩: <b>부호 실수</b>(16 + 21 + 28 = 65) · <b>계산 순서 실수</b>(28 − 16 − 21 = −9) · <b>정의 착각</b>(n(B) − n(A) = 5) → 정답 9 와 섞어 다섯 개.'),
    ('친구가 혼자 못 풀어요', '「위의 · 앞에서 · 그림에서」 같은 말을 지우고, 필요한 <b>조건을 문제 안에 다시</b> 적어요. 정의 없이 쓴 문자(A, B, p, q)는 무엇인지 써 줘요.'),
    ('조건끼리 부딪혀요', 'n(A ∩ B) 가 n(A) 보다 크거나, 명제에서 참 · 거짓이 둘 다 되는 조건이면 풀 수 없어요 → 숫자 · 조건 하나를 바꿔요.'),
]
cd = ''.join(f'<div class="card"><b class="q">🆘 {q}</b><br>{a}</div>' for q, a in cards)
back = f'''<div class="page"><div class="side">뒤 · 도움 카드</div>
<h1>✏ 출제 공방 · 문장 틀 · 막힘 카드</h1>
<div class="sub">문제를 어떻게 써야 할지 모르겠으면 아래 틀에 맞춰 쓰고, 막히면 막힘 카드를 봐요.</div>
<div class="box"><div class="t"><span class="n">3</span>문장 틀 <small>하나 골라 빈칸만 채워도 문제가 돼요 · 객관식 / 주관식 하나만</small></div>{fr}</div>
<div class="box"><div class="t"><span class="n">4</span>막힘 카드</div>{cd}</div>
<div class="box"><div class="t"><span class="n">5</span>시간 순서 <small>수업 한 시간 · 30분 안에 한 문제</small></div>
<div class="time"><div><b>5분</b>🏰 바탕 방 고르기<br>원래 문제 한 줄</div><div><b>10분</b>🔧 바꾸기<br>사다리 · 문장 틀</div><div><b>10분</b>✍ 풀기<br>두 번 따로 풀기</div><div><b>5분</b>✔ 검사<br>짝 확인 · 📸 사진</div></div>
<div style="font-size:8.6pt;color:#555;margin-top:1.4mm">📸 사진은 양식 <b>뒷면만</b> · 네 모서리 표시가 다 보이게 · 앱 → 출제 공방 → 「내 문제 올리기」</div></div>
<div class="foot">공통수학2 · 모두의 던전 · 출제 공방 혼자 하기 안내 (뒤)</div></div>'''

# ── ② 양식 v2 앞면 (연습) ──
form_front = f'''<div class="page"><div class="side">앞면 · 연습</div>
<h1>✏ 출제 공방 · 문제 만들기 연습장</h1>
<div class="sub">🏰 성채던전 1 ~ 3층 문제 하나를 골라 <b>바꿔서</b> 나만의 문제를 만들어요. 혼자 하기 안내를 옆에 두고 ①부터 차례로. 다 되면 <b>뒷면에 깨끗하게</b> 옮겨 써요.</div>
<div class="box"><div class="t"><span class="n">1</span>바탕 방 <small>성채 1 ~ 3층 · 내가 열어 본 방만</small></div>
🏰 성채 <span class="fill"></span> 층 <span class="fill"></span> 번 방 &nbsp;&nbsp; 원래 문제 핵심 한 줄 :<div class="ln"></div></div>
<div class="box"><div class="t"><span class="n">2</span>사다리 칸 고르기 <small>동그라미 · 여러 개 가능</small></div>
<span class="circ g">① 숫자 🟢</span><span class="circ b">② 조건 🔵</span><span class="circ b">③ 묻는 것 🔵</span><span class="circ p">④ 상황 🟣</span> &nbsp; 형식 <span class="circ">객관식</span><span class="circ">주관식</span><br>
바꿀 곳 메모 :<div class="ln"></div></div>
<div class="box" style="height:68mm"><div class="t"><span class="n">3</span>문제 초안 <small>문장 틀 <span class="circ">1</span><span class="circ">2</span><span class="circ">3</span><span class="circ">4</span> 에 맞춰</small></div></div>
<div class="row"><div class="box" style="height:66mm"><div class="t"><span class="n">4</span>풀이 ① <small>첫 번째</small></div></div>
<div class="box" style="height:66mm"><div class="t">풀이 ② <small>다른 방법 · 또는 처음부터 다시</small></div></div></div>
<div style="margin:-1mm 0 2.4mm 1mm;font-size:9.4pt">두 답 : <span class="fill"></span> · <span class="fill"></span> → 같으면 <span class="chk" style="margin-left:1mm"></span> ✔</div>
<div class="box"><div class="t"><span class="n">5</span>스스로 검사</div>
<span class="chk" style="margin-left:0"></span>혼자 풀림 (「위의 · 앞에서」 없음 · 조건이 다 적혀 있음) &nbsp;<span class="chk"></span>답이 깔끔함 &nbsp;<span class="chk"></span>말이 됨 (조건끼리 안 부딪힘)</div>
<div class="box"><div class="t"><span class="n">6</span>짝 확인 <small>친구가 내 문제를 풀어 봐요</small></div>
친구 답 : <span class="fill" style="min-width:25mm"></span> &nbsp; 내 답과 같음 <span class="chk"></span> &nbsp;&nbsp; 친구 이름 · 서명 : <span class="fill" style="min-width:42mm"></span></div>
<div class="foot">공통수학2 · 모두의 던전 · 출제 공방 연습면 v2 (사진은 뒷면만 찍어요)</div></div>'''

def render(html, pdf):
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(); pg.set_content(html); pg.wait_for_timeout(400)
        over = pg.evaluate("() => [...document.querySelectorAll('.page')].map(pg => { const f = pg.querySelector('.foot').getBoundingClientRect().top; const last = [...pg.children].filter(e => !e.classList.contains('foot') && !e.classList.contains('side')).pop().getBoundingClientRect().bottom; return Math.round((f - last) * 25.4 / 96) })")
        pg.pdf(path=pdf, format='A4', print_background=True, prefer_css_page_size=True); b.close()
    return over

doc = lambda body: f'<!doctype html><html><head><meta charset="utf-8"><style>{BASE_CSS}</style></head><body>{body}</body></html>'
g1 = render(doc(front + back), os.path.join(OUT, '(출제 공방) 혼자 하기 안내_v1.pdf'))
tmp = os.path.join(OUT, '_front_v2.pdf'); g2 = render(doc(form_front), tmp)
assert min(g1 + g2) >= 0, ('넘침', g1, g2)
w = PdfWriter(); w.add_page(PdfReader(tmp).pages[0]); w.add_page(PdfReader(V1).pages[1])   # 뒷면 = v1 2쪽 그대로
w.write(os.path.join(OUT, '(출제 공방) 문제 만들기 양식_양면_v2.pdf')); os.remove(tmp)
print('예시 독립 검산', len(CHECK), '✔ · 아래 여백(mm)', g1, g2)
