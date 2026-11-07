# 6차시 레이드용 학습지 v3 · wslib 양식 (2026-11-05 사용자 확정 = 사용자가 보낸 「학습과정 6차시 레이드용 v3」 PDF 를 그대로 다시 짠 것)
#   ★ 앞으로 레이드용 학습지는 이 파일을 복사해서 만든다 (사용자: 「이렇게 시인성 앞으로 개선되게」)
#     - 조판 = tools/worksheet/wslib.py (math-lesson-designer 스킬 4-3 원문) · 한글 Noto Sans CJK KR · 문자(A, B, x) = DejaVu Serif 이탤릭(v())
#     - 머리 = 학교 · 과목 칸 + 「학 습 과 정 · n차시」 + 학년 반 번 / 이름 · 학습목표 줄
#     - STEP = 파란 알약 제목(h3) · 개념 = 검은 테 상자(.box) · 팁 = 노란 상자(.soft) · 게임 꼬리표 = 회색 알약(GAME) · ★ = 게임에 넣는 칸
#     - 빈칸 = 밑줄(BL s · m · l · xl) · 단 끝 = 점선 「✏ 풀이 · 메모」 (남는 칸을 채움) · 형성평가 = 초록 상자(.fa) · 더 해 보기 = 보라 상자(.add) · 확인 도장 4cm
#   준비: bash tools/worksheet/setup_wslib.sh → PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tools/worksheet/gen_ws6v3.py [출력.pdf]
#   칸 위치: python3 tools/worksheet/crops_pdf.py <출력.pdf> '{"c1":"STEP 1",…}' --png <확인 폴더>
#   (게임에 실제로 쓴 PDF 는 사용자가 보낸 것 — 드라이브 「02 레이드학습지 > (06차시) 레이드용_v3.pdf」 · 이 생성기는 같은 글 · 같은 양식 — 줄 바꿈 · 칸 높이는 조금 다를 수 있음)
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wslib import CSS, v, C, BL, CB, GAME, header
from playwright.sync_api import sync_playwright

D = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(D, 'ws6-raid-v3.pdf')
NO = sys.argv[2] if len(sys.argv) > 2 else '6' # 2026-11-07 선생님: 7차시 = 6차시 이어서 → 「6·7」 로 찍을 수 있게 (python3 gen_ws6v3.py 출력.pdf 6·7)
S = '<b style="color:#d32f2f">★</b>'                 # 게임(몬스터)에 넣는 칸
T = lambda n: f'<span class="mini" style="color:#a0620a">(교과서 78~79쪽 {n}번)</span>'
MEMO = '<div class="memo" style="flex:1">✏ 풀이 · 메모</div>'
EXTRA = '''
.col { display:flex; flex-direction:column; }
.page { display:flex; flex-direction:column; } .cols { flex:1; min-height:0; }
.law { text-align:center; font-weight:700; font-size:11pt; line-height:1.75; }
.ex { color:#2a4a8a; }
body { font-size:9.9pt; line-height:1.48; } .q { margin:1mm 0; } h3 { margin:1.6mm 0 1mm 0; }
.hd .l { width:34mm; } .hd .rr { width:50mm; }
'''

def venn_out():  # (A ∪ B)ᶜ 색칠 (두 원 바깥)
    return '''<svg width="150" height="96" viewBox="0 0 150 96"><defs><mask id="o"><rect x="4" y="10" width="142" height="80" fill="#fff"/><circle cx="53" cy="50" r="30" fill="#000"/><circle cx="97" cy="50" r="30" fill="#000"/></mask></defs>
<rect width="150" height="96" fill="#f8c9cf" mask="url(#o)"/><rect x="4" y="10" width="142" height="80" fill="none" stroke="#222" stroke-width="1.3"/>
<circle cx="53" cy="50" r="30" fill="none" stroke="#222" stroke-width="1.3"/><circle cx="97" cy="50" r="30" fill="none" stroke="#222" stroke-width="1.3"/>
<text x="8" y="24" font-size="11" font-style="italic" font-family="DejaVu Serif">A</text><text x="134" y="24" font-size="11" font-style="italic" font-family="DejaVu Serif">B</text><text x="134" y="86" font-size="11" font-style="italic" font-family="DejaVu Serif">U</text></svg>'''

VENN2 = '''<svg width="190" height="92" viewBox="0 0 190 92"><rect x="4" y="4" width="182" height="84" fill="none" stroke="#222" stroke-width="1.3"/>
<circle cx="78" cy="46" r="30" fill="#dce8f8" fill-opacity=".85" stroke="#222" stroke-width="1.2"/><circle cx="112" cy="46" r="30" fill="#fbe7c4" fill-opacity=".75" stroke="#222" stroke-width="1.2"/>
<text x="44" y="22" font-size="11" font-style="italic" font-family="DejaVu Serif">A</text><text x="140" y="22" font-size="11" font-style="italic" font-family="DejaVu Serif">B</text><text x="172" y="82" font-size="11" font-style="italic" font-family="DejaVu Serif">U</text><text x="95" y="50" font-size="8.5" text-anchor="middle">둘 다</text></svg>'''

q = lambda s: f'<div class="q">{v(s)}</div>'
P = lambda n, s, tag: f'<div class="q"><b class="ex">문제 {n})</b> {v(s)} {tag}</div>'

p1_left = f'''
<h3>STEP 1 드모르간의 법칙</h3> <div class="mini">(지난 시간 {v("A")}{C} · {v("A − B")}는 말로 복습)</div>
<div style="display:flex;gap:3mm;align-items:center"><div class="box" style="flex:1"><div class="law">{v("(A ∪ B)")}{C} = {v("A")}{C} ∩ {v("B")}{C}<br>{v("(A ∩ B)")}{C} = {v("A")}{C} ∪ {v("B")}{C}</div><div class="mini" style="text-align:center">괄호를 풀 때 C가 각각 붙고,<br>∪ ↔ ∩ 가 바뀐다!</div></div>
<div style="text-align:center">{venn_out()}<div class="mini">색칠 = {v("(A ∪ B)")}{C}</div></div></div>
{P(1, "U = {1, 2, 3, 4, 5, 6}, A = {1, 2, 3}, B = {3, 4}일 때", "<br>" + GAME("몬스터 1 · ★ 칸만"))}
<div class="q">(1) {v("A ∪ B")} = {BL["m"]} → {S}{v("(A ∪ B)")}{C} = {BL["m"]}</div>
<div class="q">(2) {v("A")}{C} = {BL["m"]}, &nbsp;{v("B")}{C} = {BL["m"]}<br>&nbsp;&nbsp;&nbsp;&nbsp;→ {S}{v("A")}{C} ∩ {v("B")}{C} = {BL["m"]}</div>
<div class="q">(3) {S}{v("(A ∩ B)")}{C} = {BL["l"]},<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{S}{v("A")}{C} ∪ {v("B")}{C} = {BL["l"]}</div>
<h3>STEP 2 여집합 · 차집합의 원소의 개수</h3>
<div class="box" style="line-height:1.8"><b>① {v("n(A")}{C}{v(") = n(U) − n(A)")}<br>② {v("n(A − B) = n(A) − n(A ∩ B)")}</b> = {v("n(A ∪ B) − n(B)")}</div>
{P(2, "n(U) = 30, n(A) = 12, n(B) = 15, n(A ∩ B) = 5일 때", GAME("몬스터 2 · ★ 칸만"))}
<div class="q">(1) {S}{v("n(A")}{C}) = {BL["s"]} &nbsp;&nbsp; (2) {S}{v("n(A − B)")} = {BL["s"]}</div>
<div class="q">(3) {v("n(B − A)")} = {BL["s"]} &nbsp;&nbsp; (4) {v("n(A ∪ B)")} = {BL["s"]}</div>
<div class="q">(5) {S}{v("n(A")}{C} ∩ {v("B")}{C}) = {v("n((A ∪ B)")}{C}) = {BL["s"]}</div>
<h3>STEP 3 생활 속 문제</h3>
<div class="soft">벤 다이어그램의 칸에 숫자를 직접 써 넣으면 쉽다:<br><b>「둘 다」 칸부터!</b></div>
{P(3, "1학년 40명 중 축구 동아리 18명, 밴드 동아리 12명, 둘 다 5명이다.", GAME("몬스터 3 · ★ 칸만"))}
<div class="q">(1) {S}축구 또는 밴드 동아리 학생 수 : {BL["s"]}명</div>
<div class="q">(2) 축구만 하는 학생 수 : {BL["s"]}명</div>
<div class="q">(3) {S}둘 다 하지 않는 학생 수 : {BL["s"]}명</div>
{MEMO}'''

p1_right = f'''
<h3>중단원 마무리 · 집합 한 장 정리</h3>
<div class="box" style="font-size:9.6pt;line-height:1.75">
· 포함 : {v("A")}의 모든 원소가 {v("B")}에 속하면 {v("A ⊂ B")} · 원소 {v("n")}개 → 부분집합 2<sup>{v("n")}</sup>개<br>
· 서로소 : {v("A ∩ B = ∅")} · {v("A ∩ B = B ⇔ B ⊂ A")} · {v("A ∪ B = B ⇔ A ⊂ B")}<br>
· {v("n(A ∪ B) = n(A) + n(B) − n(A ∩ B)")} · {v("n(A")}{C}{v(") = n(U) − n(A)")}<br>
· 드모르간 : {v("(A ∪ B)")}{C} = {v("A")}{C} ∩ {v("B")}{C}, &nbsp;{v("(A ∩ B)")}{C} = {v("A")}{C} ∪ {v("B")}{C}</div>
{P(4, "두 집합 A = {x | x는 8의 약수}, B = {x | x는 20 이하의 4의 배수}에 대하여 A ∩ X = ∅과 B ∪ X = B를 만족시키는 집합 X의 개수를 구하시오.", T("07") + "<br>" + GAME("몬스터 4 · ★ 칸만"))}
<div class="q">(1) {v("A")} = {BL["l"]}, &nbsp;{v("B")} = {BL["l"]}</div>
<div class="q">(2) {v("B ∪ X = B → X ⊂ ( A / B ), A ∩ X = ∅ → X")}는 {v("A")}와 {BL["m"]}</div>
<div class="q">(3) 그래서 {v("X ⊂ B − A")} = {BL["l"]} → {S}{v("X")}의 개수 = 2<sup>□</sup> = {BL["s"]}</div>
{P(5, "두 집합 A = {x² + 2x, 4, 6}, B = {x, 6}에 대하여 A ∩ B = B를 만족시키는 모든 정수 x의 값을 구하시오.", T("08") + " " + GAME("몬스터 5 · ★ 칸만"))}
<div class="q">(1) {v("A ∩ B = B → B ⊂ A → x")}는 {v("A")}의 원소 (단, {v("x ≠ 6")})</div>
<div class="q">(2) {v("x = 4")} 또는 {v("x = x² + 2x → x² + x = 0")}<br>&nbsp;&nbsp;&nbsp;&nbsp;→ {v("x")} = {BL["s"]}, {BL["s"]}</div>
<div class="q">(3) {S}{v("x")}의 값 모두 : {BL["l"]}</div>
{MEMO}'''

p2_left = f'''
{P(6, "어느 자전거 동아리 회원 40명을 대상으로 두 코스 A와 B를 다녀온 경험이 있는 회원 수를 조사하였더니 A 코스는 28명이고 B 코스는 21명이었다. 두 코스 A와 B를 모두 다녀온 회원 수의 최댓값과 최솟값을 구하시오.", T("11") + "<br>" + GAME("몬스터 6 · ★ 칸만"))}
<div style="text-align:center">{VENN2}</div>
<div class="q">(1) {v("n(A ∩ B) = 28 + 21 − n(A ∪ B)")} = {BL["s"]} − {v("n(A ∪ B)")}</div>
<div class="q">(2) {v("n(A ∪ B)")}는 가장 작으면 {BL["s"]} ({v("B")}가 {v("A")} 안에 쏙), 가장 크면 {BL["s"]} (전체)</div>
<div class="q">(3) {S}최댓값 {BL["s"]}명, {S}최솟값 {BL["s"]}명</div>
{P(7, "100 미만의 자연수 중에서 7의 배수가 아니거나 5로 나누었을 때의 나머지가 3이 아닌 자연수의 개수를 구하시오.", T("12") + " " + GAME("몬스터 7 · ★ 칸만"))}
<div class="q">(1) {v("U")} = 100 미만의 자연수 → {v("n(U)")} = {BL["s"]}, &nbsp;{v("A")} = 7의 배수, {v("B")} = 5로 나눈 나머지가 3</div>
<div class="q">(2) 「{v("A")}가 아니거나 {v("B")}가 아닌」 = {v("A")}{C} ∪ {v("B")}{C}<br>&nbsp;&nbsp;&nbsp;&nbsp;= ( {BL["m"]} ){C} ← 드모르간!</div>
<div class="q">(3) {v("A ∩ B")} = 7의 배수 중 5로 나눈 나머지가 3<br>&nbsp;&nbsp;&nbsp;&nbsp;= {{ {BL["s"]}, {BL["s"]}, {BL["s"]} }}</div>
<div class="q">(4) {S}구하는 개수 = {v("n(U) − n(A ∩ B)")} = {BL["m"]}</div>
{MEMO}'''

W = lambda h: f'<div style="height:{h}mm"></div>'
fq = lambda n, s, h: f'<div class="q">{n}. {s}</div>{W(h)}'
p2_right = f'''
<div class="fa" style="margin-top:0"><div class="tt">✔ {NO}차시 형성평가 <span class="mini" style="font-weight:400">(혼자 풀기 · 6문항)</span>{GAME("보스")}</div>
{fq(1, f'{v("(A ∪ B)")}{C} = {v("A")}{C} ( &nbsp;&nbsp; ) {v("B")}{C} &nbsp;(∪ 또는 ∩)', 10)}
{fq(2, f'{v("n(U) = 20, n(A) = 7")}일 때 {v("n(A")}{C}) = ?', 11)}
{fq(3, v("두 집합 A와 B에 대하여 n(A) = 18, n(B) = 23, n(A ∪ B) = 30일 때, n(A ∩ B)를 구하시오.") + " " + T("04"), 9)}
{fq(4, v("전체집합 U = {1, 2, 3, …, 10}의 두 부분집합 A = {1, 5, 9, 10}, B = {x | x는 10의 약수}에 대하여 A − B를 구하시오.") + " " + T("05"), 9)}
{fq(5, v("전체집합 U = {1, 2, 3, 4, 5}의 부분집합 중에서 집합 A = {1, 2, 4}와 서로소인 집합을 모두 구하시오.") + "<br>" + T("06"), 9)}
{fq(6, v("전체집합 U = {x | x는 30 이하의 자연수}의 두 부분집합 A = {x | x는 6의 배수}, B = {x | x는 24의 약수}에 대하여 n(A") + C + " ∩ " + v("B") + C + ")를 구하시오.<br>" + T("10"), 3)}
<div class="mini" style="border-top:1px dashed #9bb;padding-top:1.5mm">맞은 개수 {BL["s"]} / 6 &nbsp;어려웠던 부분<br>{CB}드모르간 {CB}원소의 개수 {CB}서로소 · 포함<br>{CB}미지수 {CB}최대 · 최소 {CB}「아니거나」</div></div>
<div class="add mini">🏰 <b>더 해 보고 싶다면</b> — 수업 뒤 캠프의 성채던전 1층: 중단원 12문항(숫자를 바꾼 문제) · 🎯 허수아비 형성평가 재대결 | 다음 시간 = 명제와 조건 (7차시)</div>
<div class="stampwrap" style="margin-top:auto"><div class="stamp"><span>확인 도장</span></div></div>'''

rng = f'공통수학2 Ⅱ. 집합과 명제 1. 집합 04. 드모르간의 법칙 · 중단원 마무리 ({NO}차시) · 레이드용 v3'
hd = header(f'{NO}차시', rng)
goal = '<div class="goal"><b>학습목표</b> ① 드모르간의 법칙을 이해하고 이용할 수 있다. ② 여집합·차집합의 원소의 개수를 구할 수 있다. ③ 집합 단원(중단원 마무리) 문제를 해결할 수 있다.</div>'
pg = lambda g, l, r, n: f'<div class="page">{hd}{g}<div class="cols"><div class="col">{l}</div><div class="col">{r}</div></div><div class="pno">- {NO}차시 ({n}/2) -</div></div>'
html = f"<!DOCTYPE html><html><head><meta charset='utf-8'><title>학습과정 {NO}차시 레이드용 v3</title><style>{CSS}{EXTRA}</style></head><body>{pg(goal, p1_left, p1_right, 1)}{pg('', p2_left, p2_right, 2)}</body></html>"
open(OUT.replace('.pdf', '.html'), 'w', encoding='utf-8').write(html)
with sync_playwright() as p:
    b = p.chromium.launch(); page = b.new_page(); page.set_content(html); page.wait_for_timeout(300)
    bot = page.evaluate("""() => [...document.querySelectorAll('.col')].map(c => { const k = [...c.children].filter(e => !e.classList.contains('memo')).pop(); return k ? Math.round((k.getBoundingClientRect().bottom - c.closest('.page').getBoundingClientRect().top) * 25.4 / 96) : 0 })""")
    page.pdf(path=OUT, format='A4', print_background=True, prefer_css_page_size=True); b.close()
print('단 아래끝(mm, 메모 빼고):', bot, '← 281 이하 · 출력', OUT)
