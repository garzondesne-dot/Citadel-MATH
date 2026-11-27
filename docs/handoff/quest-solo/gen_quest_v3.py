# ✏ 출제 공방 「(출제 공방) 문제 만들기 양식_혼자하기_v3.pdf」 A4 한 장 양면 (2026-11-27 · 📚 차시팩 #1 · DECISIONS 7cee2ca)
#   선생님 「A4용지 두장말고 한장으로 합치되 혼자서도 해볼수 있게끔하면 좋겠어. 오늘 배포하고 주말에 해보라고 할거야」
#   앞 = 안내(줄인 예시 · 사다리 · 문장 틀 · 막힘 카드) + 연습 칸 · 뒤 = v1 PDF 2쪽 그대로(pypdf 로 붙임)
#   쓰는 법: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 gen_quest_v3.py <v1 양식.pdf> <출력.pdf>
import sys, os
from playwright.sync_api import sync_playwright
from pypdf import PdfReader, PdfWriter
V1, OUT = sys.argv[1:3]

inter = lambda a, b, u: a + b - u          # n(A ∩ B) = n(A) + n(B) − n(A ∪ B)
CHECK = {'원래 1층 04 → 9': inter(16, 21, 28) == 9,
         '🟢 20 · 15 · 30 → 5 (≤ 작은 쪽)': inter(20, 15, 30) == 5 <= 15,
         '🟣 35명 · 축구 20 · 농구 18 · 둘 다 아님 5 → 8': inter(20, 18, 35 - 5) == 8,
         '🔵 묻는 것 예 n(A − B) = 16 − 9 = 7': 16 - inter(16, 21, 28) == 7}
assert all(CHECK.values()), CHECK

CSS = '''@page{size:A4;margin:0}*{box-sizing:border-box}
body{margin:0;font-family:"Noto Sans CJK KR",sans-serif;color:#1d1d1f;font-size:9.4pt;line-height:1.4}
.page{width:210mm;height:297mm;padding:9mm 11mm 8mm;position:relative;overflow:hidden}
h1{font-size:14pt;margin:0 0 .6mm}.sub{font-size:8.6pt;color:#555;margin-bottom:1.6mm}
.side{position:absolute;top:9mm;right:11mm;font-weight:800;font-size:10pt;border-radius:1.5mm;padding:.8mm 2.6mm;color:#fff;background:#888}
.sec{border:1.2px solid #333;border-radius:2mm;padding:1.4mm 2.6mm;margin-bottom:1.6mm}
.sec .t{font-weight:700;font-size:9.8pt;margin-bottom:.6mm}.sec .t small{font-weight:400;color:#666;font-size:8pt}
.n{display:inline-block;background:#2a4a8a;color:#fff;border-radius:50%;width:4.8mm;height:4.8mm;text-align:center;line-height:4.8mm;font-size:8pt;margin-right:1.2mm}
.hg{background:#d9f2df;border-radius:1mm;padding:0 .6mm}.hb{background:#dbe7fb;border-radius:1mm;padding:0 .6mm}.hp{background:#efdcf9;border-radius:1mm;padding:0 .6mm}
.ans{color:#c0392b;font-weight:700}.g{color:#1b7a3a;font-weight:700}.b{color:#1b4fa0;font-weight:700}.p{color:#7a2fa8;font-weight:700}
.ex{font-size:9pt}.ex div{margin:.3mm 0}
.lad div{font-size:8.8pt;margin:.2mm 0}
.two{display:flex;gap:2mm}.two>div{flex:1}
.small{font-size:8.3pt;line-height:1.38}.small div{margin:.2mm 0}
.box{border:1.2px solid #333;border-radius:2mm;padding:1.2mm 2.6mm;margin-bottom:1.5mm;position:relative}
.box .t{font-weight:700;font-size:9.6pt}.box .t small{font-weight:400;color:#666;font-size:8pt}
.ln{border-bottom:1px dashed #aab;height:6.4mm}
.chk{display:inline-block;width:3.4mm;height:3.4mm;border:1.2px solid #333;margin:0 1mm 0 2.6mm;vertical-align:-0.5mm}
.fill{display:inline-block;border-bottom:1.2px solid #222;min-width:11mm;height:4.6mm;vertical-align:bottom}
.circ{display:inline-block;border:1.2px solid #333;border-radius:3mm;padding:0 2mm;margin:0 .6mm;font-size:8.8pt}
.row{display:flex;gap:2mm}.row>.box{flex:1}
.end{border-top:2px solid #2a4a8a;padding-top:1.2mm;font-size:9pt;font-weight:600;color:#1b3d6b}
'''
front = f'''<div class="page"><div class="side">앞면 · 혼자 하기</div>
<h1>✏ 출제 공방 · 혼자서 문제 만들기</h1>
<div class="sub">🏰 성채던전 <b>1 ~ 3층</b> 문제 하나를 골라 <b>바꿔서</b> 나만의 문제를 만들어요. 순서 : <b>① 바탕 문제를 먼저 풀기 → ② 사다리에서 한 칸 골라 바꾸기 → ③ 두 번 따로 풀기 → ④ 뒷면에 옮겨 쓰기</b></div>
<div class="sec ex"><div class="t"><span class="n">1</span>따라 하기 예시 <small>바탕 = 🏰 1층 04 · 색칠 = 바뀐 곳</small></div>
<div><b>원래</b> n(A) = <span class="hg">16</span>, n(B) = <span class="hg">21</span>, n(A ∪ B) = <span class="hg">28</span> 일 때 n(A ∩ B) 는? → 16 + 21 − 28 = <span class="ans">9</span></div>
<div><b class="g">🟢 숫자</b> n(A) = <span class="hg">20</span>, n(B) = <span class="hg">15</span>, n(A ∪ B) = <span class="hg">30</span> 일 때 n(A ∩ B) 는? → 20 + 15 − 30 = <span class="ans">5</span></div>
<div><b class="p">🟣 상황</b> <span class="hp">우리 반 35명 중 축구 좋아함 20명, 농구 좋아함 18명, 둘 다 안 좋아함 5명</span> → <span class="hp">둘 다 좋아하는 학생</span>은? → 35 − 5 = 30, 20 + 18 − 30 = <span class="ans">8</span></div></div>
<div class="sec lad"><div class="t"><span class="n">2</span>바꾸기 사다리 <small>아래에서 위로 · 위로 갈수록 등급 ↑ · AI 도 이 기준으로 판단</small></div>
<div><b class="p">④ 상황 🟣</b> 새 이야기 · 새 상황 · 다른 개념과 연결 → 독창 문제(명예의 전당 후보)</div>
<div><b class="b">③ 묻는 것 🔵</b> 묻는 것을 바꿈 (예: n(A ∩ B) 대신 <span class="hb">n(A − B)</span> → 7) · 객관식 ↔ 주관식 바꾸기도 여기</div>
<div><b class="b">② 조건 🔵</b> 주어진 조건을 바꿈 (예: n(A ∪ B) 대신 <span class="hb">n(U) 와 여집합</span>)</div>
<div><b class="g">① 숫자 🟢</b> 뼈대 · 조건 · 묻는 것은 그대로, 숫자만 → 처음이면 여기부터!</div>
<div style="color:#666">⚪ 반려 : 바탕과 다른 단원 · 정답이 틀림 · 풀 수 없음(조건이 부딪힘) · 글씨를 읽을 수 없음</div></div>
<div class="two"><div class="sec small"><div class="t"><span class="n">3</span>문장 틀 <small>빈칸만 채워도 문제</small></div>
<div>틀 1 (주관식) 「 □ 가 ○ 일 때 △ 를 구하시오. 」</div><div>틀 2 (객관식) 「 다음 중 옳은 것은? 」 + 보기 다섯 개</div>
<div>틀 3 (주관식) 「 ~ 를 만족하는 ○ 의 값은? 」</div><div>틀 4 (상황) 「 우리 이야기 … 일 때 … 는 몇 명? 」</div></div>
<div class="sec small"><div class="t">🆘 막힘 카드</div>
<div>· 답이 깔끔하지 않음 → 숫자 다시 (n(A ∩ B) ≤ 작은 쪽)</div><div>· 오답 보기 → 부호 실수 · 계산 순서 실수 · 정의 착각에서 하나씩</div>
<div>· 혼자 안 풀림 → 「위의 · 앞에서」 지우고 조건을 문제 안에 다시</div><div>· 조건이 부딪힘 → 숫자 · 조건 하나를 바꿈</div></div></div>
<div class="box"><div class="t"><span class="n">4</span>연습 칸</div>
🏰 성채 <span class="fill"></span> 층 <span class="fill"></span> 번 방 · 원래 문제 핵심 한 줄 :<div class="ln"></div>
<div style="margin-top:1mm">사다리 <span class="circ g">① 숫자</span><span class="circ b">② 조건</span><span class="circ b">③ 묻는 것</span><span class="circ p">④ 상황</span> &nbsp; 형식 <span class="circ">객관식</span><span class="circ">주관식</span> &nbsp; 바꿀 곳 : <span class="fill" style="min-width:34mm"></span></div></div>
<div class="box" style="height:52mm"><div class="t">문제 초안 <small>문장 틀 1 · 2 · 3 · 4 중 하나에 맞춰</small></div></div>
<div class="row"><div class="box" style="height:50mm"><div class="t">풀이 ① <small>첫 번째</small></div></div><div class="box" style="height:50mm"><div class="t">풀이 ② <small>다른 방법 · 처음부터 다시</small></div></div></div>
<div class="box">두 답 <span class="fill"></span> · <span class="fill"></span> 같으면 <span class="chk" style="margin-left:1mm"></span>✔ &nbsp;|&nbsp; 스스로 검사 <span class="chk"></span>혼자 풀림 <span class="chk"></span>답이 깔끔 <span class="chk"></span>말이 됨<br>
(선택) 가족 · 친구가 풀어 보기 → 그 답 <span class="fill" style="min-width:16mm"></span> 내 답과 같음 <span class="chk"></span> &nbsp; 풀어 준 사람 <span class="fill" style="min-width:24mm"></span></div>
<div class="end">✅ 다 되면 <b>뒷면에 깨끗하게</b> 옮겨 쓰기 → 앱 ✏ 출제 공방 → 「내 문제 올리기」로 <b>뒷면만</b> 찍기 (하루 3번 · 네 모서리 표시가 다 보이게)</div>
</div>'''
html = f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>{front}</body></html>'
tmp = OUT + '.front.pdf'
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); pg.set_content(html); pg.wait_for_timeout(400)
    bottom = pg.evaluate("() => { const pg = document.querySelector('.page'); const e = pg.querySelector('.end').getBoundingClientRect(); return Math.round((e.bottom - pg.getBoundingClientRect().top) * 25.4 / 96) }")
    pg.pdf(path=tmp, format='A4', print_background=True, prefer_css_page_size=True); b.close()
assert bottom <= 281 and len(PdfReader(tmp).pages) == 1, ('넘침', bottom)
w = PdfWriter(); w.add_page(PdfReader(tmp).pages[0]); w.add_page(PdfReader(V1).pages[1]); w.write(OUT); os.remove(tmp)
print('예시 검산', len(CHECK), '✔ · 앞면 아래끝', bottom, 'mm (≤ 281)')
