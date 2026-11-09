# 6차시 레이드용 학습지 v5 (2026-11-09 서술형 사다리: 💡 근거 줄 「∵ ____」 · ✍ 서술형 쓰기 칸 크게 · 📸 진필살기 · 교사용 변경 요약 3쪽) · v4 (2026-11-09 소레이드: 문제 4~7 단계 = 게임 졸개 ①②③👑 · 단계마다 ★ · 서술 이어 쓰기 칸) · 아래는 v3 설명 · wslib 양식 (2026-11-05 사용자 확정 = 사용자가 보낸 「학습과정 6차시 레이드용 v3」 PDF 를 그대로 다시 짠 것)
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
.stp { display:inline-block; min-width:4.6mm; font-weight:700; color:#2a4a8a; }
.wr { border:1.2px dashed #c9a227; border-radius:1.5mm; padding:1mm 2mm; margin:1mm 0 1.6mm; font-size:8.4pt; color:#7a5a10; min-height:17mm; background:#fffdf3; }
.why { margin:0.6mm 0; padding:0.5mm 1.5mm; background:#fff6d6; border-left:2.2mm solid #f0c030; border-radius:1mm; }
.t3 { border-collapse:collapse; width:100%; font-size:8.8pt; margin:1mm 0 2mm; } .t3 td, .t3 th { border:1px solid #889; padding:0.9mm 1.4mm; vertical-align:top; } .t3 th { background:#eef2f8; }

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

SUMMARY = f'''
<h3>중단원 마무리 · 집합 한 장 정리</h3>
<div class="box" style="font-size:9.6pt;line-height:1.75">
· 포함 : {v("A")}의 모든 원소가 {v("B")}에 속하면 {v("A ⊂ B")} · 원소 {v("n")}개 → 부분집합 2<sup>{v("n")}</sup>개<br>
· 서로소 : {v("A ∩ B = ∅")} · {v("A ∩ B = B ⇔ B ⊂ A")} · {v("A ∪ B = B ⇔ A ⊂ B")}<br>
· {v("n(A ∪ B) = n(A) + n(B) − n(A ∩ B)")} · {v("n(A")}{C}{v(") = n(U) − n(A)")}<br>
· 드모르간 : {v("(A ∪ B)")}{C} = {v("A")}{C} ∩ {v("B")}{C}, &nbsp;{v("(A ∩ B)")}{C} = {v("A")}{C} ∪ {v("B")}{C}</div>
'''

p4blk = f'''
{P(4, "두 집합 A = {x | x는 8의 약수}, B = {x | x는 20 이하의 4의 배수}에 대하여 A ∩ X = ∅과 B ∪ X = B를 만족시키는 집합 X의 개수를 구하시오.", T("07") + "<br>" + GAME("소레이드 · 졸개 3 + 대장"))}
<div class="q"><span class="stp">①</span>{S}{v("A")} = {BL["l"]}</div>
<div class="q"><span class="stp">②</span>{S}{v("B")} = {BL["l"]}</div>
<div class="q"><span class="stp">③</span>{v("B ∪ X = B → X ⊂ B")}, {v("A ∩ X = ∅ → X")}는 {v("A")}와 서로소<br>&nbsp;&nbsp;&nbsp;&nbsp;→ {S}{v("X")}에 들어갈 수 있는 원소 = {v("B − A")} = {BL["l"]}</div>
<div class="q why">💡 ∵ {v("X")}는 {v("B − A")}의 {BL["m"]}이므로 개수 = 2<sup>(원소의 개수)</sup></div>
<div class="q"><span class="stp">👑</span>{S}{v("X")}의 개수 = 2<sup>□</sup> = {BL["s"]}</div>
<div class="wr" style="min-height:30mm">✍ <b>서술형 쓰기</b> — 대장을 이기면 게임 풀이를 보지 말고 <b>처음부터</b> 써 보기 (<b>학습지 숫자 그대로</b>) → 📸 찍으면 🌟 <b>진필살기</b> 도전</div>

{MEMO}'''

p1_r2 = f'''
{P(5, "두 집합 A = {x² + 2x, 4, 6}, B = {x, 6}에 대하여 A ∩ B = B를 만족시키는 모든 정수 x의 값을 구하시오.", T("08") + " " + GAME("소레이드 · 졸개 3 + 대장"))}
<div class="q"><span class="stp">①</span>{S}{v("A ∩ B = B")} 이면 ( {v("B ⊂ A")} / {v("A ⊂ B")} ) → {v("x")}는 {v("A")}의 원소 (단, {v("x ≠ 6")})</div>
<div class="q why">💡 ∵ {v("x")}는 {v("A")}의 원소이므로 {v("x = 4")} 또는 {v("x")} = {BL["m"]}</div>
<div class="q"><span class="stp">②</span>{S}{v("x = 4")} 일 수 있다 ( ○ / × )</div>
<div class="q"><span class="stp">③</span>{S}{v("x = x² + 2x → x² + x = 0 → x")} = {BL["s"]}, {BL["s"]}</div>
<div class="q"><span class="stp">👑</span>{S}{v("x")}의 값 모두 : {BL["l"]}</div>
<div class="wr" style="min-height:30mm">✍ <b>서술형 쓰기</b> — 대장을 이기면 게임 풀이를 보지 말고 <b>처음부터</b> 써 보기 (<b>학습지 숫자 그대로</b>) → 📸 찍으면 🌟 <b>진필살기</b> 도전</div>
{MEMO}'''

p2_mid = f'''
{P(6, "어느 자전거 동아리 회원 40명을 대상으로 두 코스 A와 B를 다녀온 경험이 있는 회원 수를 조사하였더니 A 코스는 28명이고 B 코스는 21명이었다. 두 코스 A와 B를 모두 다녀온 회원 수의 최댓값과 최솟값을 구하시오.", T("11") + "<br>" + GAME("소레이드 · 졸개 2 + 대장"))}
<div style="text-align:center">{VENN2}</div>
<div class="q"><span class="stp">①</span>{S}{v("n(A) + n(B)")} = 28 + 21 = {BL["s"]} &nbsp;→ {v("n(A ∩ B)")} = 이 수 − {v("n(A ∪ B)")}</div>
<div class="q"><span class="stp">②</span>{S}최댓값 : {v("B")}가 {v("A")} 안에 쏙 → {v("n(A ∩ B)")} = 작은 쪽 = {BL["s"]}명</div>
<div class="q why">💡 ∵ {v("n(A ∩ B)")}는 {v("n(A ∪ B)")}가 가장 ( 클 / 작을 ) 때 가장 작다</div>
<div class="q"><span class="stp">👑</span>{S}최솟값 : {v("n(A ∪ B)")} = 전체 40 → {BL["s"]} − 40 = {BL["s"]}명</div>
<div class="wr" style="min-height:85mm">✍ <b>서술형 쓰기</b> — 대장을 이기면 게임 풀이를 보지 말고 <b>처음부터</b> 써 보기 (<b>학습지 숫자 그대로</b>) → 📸 찍으면 🌟 <b>진필살기</b> 도전</div>
{MEMO}'''

p3_left = f'''
{P(7, "100 미만의 자연수 중에서 7의 배수가 아니거나 5로 나누었을 때의 나머지가 3이 아닌 자연수의 개수를 구하시오.", T("12") + " " + GAME("소레이드 · 졸개 3 + 대장"))}
<div class="q"><span class="stp">①</span>{S}{v("U")} = 100 미만의 자연수 → {v("n(U)")} = {BL["s"]} &nbsp;({v("A")} = 7의 배수, {v("B")} = 5로 나눈 나머지가 3)</div>
<div class="q"><span class="stp">②</span>{S}「{v("A")}가 아니거나 {v("B")}가 아닌」 = {v("A")}{C} ∪ {v("B")}{C} = ( {BL["m"]} ){C} ← 드모르간!</div>
<div class="q"><span class="stp">③</span>{S}{v("A ∩ B")} = 7의 배수 중 5로 나눈 나머지가 3 = {{ {BL["s"]}, {BL["s"]}, {BL["s"]} }}</div>
<div class="q why">💡 ∵ 여집합의 원소의 개수 = 전체의 개수 − {BL["m"]}의 개수</div>
<div class="q"><span class="stp">👑</span>{S}구하는 개수 = {v("n(U) − n(A ∩ B)")} = {BL["m"]}</div>
<div class="wr" style="min-height:95mm">✍ <b>서술형 쓰기</b> — 대장을 이기면 게임 풀이를 보지 말고 <b>처음부터</b> 써 보기 (<b>학습지 숫자 그대로</b>) → 📸 찍으면 🌟 <b>진필살기</b> 도전</div>
{MEMO}'''

W = lambda h: f'<div style="height:{h}mm"></div>'
fq = lambda n, s, h: f'<div class="q">{n}. {s}</div>{W(h)}'
FA6 = f'''
<div class="fa" style="margin-top:0"><div class="tt">✔ 6차시 형성평가 <span class="mini" style="font-weight:400">(혼자 풀기 · 6문항)</span>{GAME("보스")}</div>
{fq(1, f'{v("(A ∪ B)")}{C} = {v("A")}{C} ( &nbsp;&nbsp; ) {v("B")}{C} &nbsp;(∪ 또는 ∩)', 12)}
{fq(2, f'{v("n(U) = 20, n(A) = 7")}일 때 {v("n(A")}{C}) = ?', 13)}
{fq(3, v("두 집합 A와 B에 대하여 n(A) = 18, n(B) = 23, n(A ∪ B) = 30일 때, n(A ∩ B)를 구하시오.") + " " + T("04"), 12)}
{fq(4, v("전체집합 U = {1, 2, 3, …, 10}의 두 부분집합 A = {1, 5, 9, 10}, B = {x | x는 10의 약수}에 대하여 A − B를 구하시오.") + " " + T("05"), 12)}
{fq(5, v("전체집합 U = {1, 2, 3, 4, 5}의 부분집합 중에서 집합 A = {1, 2, 4}와 서로소인 집합을 모두 구하시오.") + "<br>" + T("06"), 12)}
{fq(6, v("전체집합 U = {x | x는 30 이하의 자연수}의 두 부분집합 A = {x | x는 6의 배수}, B = {x | x는 24의 약수}에 대하여 n(A") + C + " ∩ " + v("B") + C + ")를 구하시오.<br>" + T("10"), 8)}
<div class="mini" style="border-top:1px dashed #9bb;padding-top:1.5mm">맞은 개수 {BL["s"]} / 6 &nbsp;어려웠던 부분<br>{CB}드모르간 {CB}여집합 · 차집합의 개수 {CB}서로소 · 차집합 {CB}미지수 {CB}최대 · 최소 {CB}「아니거나」</div></div>
<div class="add mini">🏰 <b>더 해 보고 싶다면</b> — 캠프 🎯 허수아비 형성평가 재대결 · 성채던전 1층 | 다음 시간 = 명제와 조건 (8차시)</div>
<div class="stampwrap" style="margin-top:auto"><div class="stamp"><span>확인 도장</span></div></div>'''
FA7 = f'''
<div class="fa" style="margin-top:0"><div class="tt">✔ 6차시 형성평가 <span class="mini" style="font-weight:400">(혼자 풀기 · 3문항 · 숫자 바꾼 같은 유형)</span>{GAME("보스")}</div>
{fq(1, v("두 집합 A = {x | x는 6의 약수}, B = {x | x는 12 이하의 3의 배수}에 대하여 A ∩ X = ∅과 B ∪ X = B를 만족시키는 집합 X의 개수를 구하시오."), 22)}
{fq(2, v("회원 35명 중 A 코스를 다녀온 회원은 20명, B 코스를 다녀온 회원은 24명이다. 두 코스를 모두 다녀온 회원 수의 최댓값과 최솟값을 구하시오."), 22)}
{fq(3, v("50 미만의 자연수 중에서 3의 배수가 아니거나 4로 나누었을 때의 나머지가 1이 아닌 자연수의 개수를 구하시오."), 18)}
<div class="mini" style="border-top:1px dashed #9bb;padding-top:1.5mm">맞은 개수 {BL["s"]} / 3 &nbsp;어려웠던 부분<br>{CB}부분집합의 개수 {CB}최대 · 최소 {CB}「아니거나」 = 드모르간 {CB}서술형 쓰기</div></div>
<div class="add mini">🏰 <b>더 해 보고 싶다면</b> — 캠프 🎯 허수아비에서 소레이드 다시 · ✍ 서술형 → 📸 · 성채던전 1층 | 다음 시간 = 명제와 조건 (8차시)</div>
<div class="stampwrap" style="margin-top:auto"><div class="stamp"><span>확인 도장</span></div></div>'''
T3 = f'''<div class="page" style="font-size:9.4pt"><h3 style="margin-top:0">교사용 · 6 · 7차시 나누기 + 소레이드 정리 (학생 배부 X)</h3>
<div class="box"><b>나눈 방식 (형평성: 문제 · 숫자 · 형성평가 하나도 안 바꿈)</b> — 6차시 v4를 둘로 나눔 · 6차시 = STEP 1~3 + 중단원 마무리 · 집합 한 장 정리 (1쪽) · 7차시 = 문제 4~7(소레이드 형태로만 바꿈) + 형성평가 6문항 그대로<br>
바뀐 곳 = 문제 4~7에 노란 💡 근거 줄 · ✍ 「서술형 쓰기」 칸(학습지 숫자 그대로 → 📸 진필살기) — 근거 줄은 새 문제가 아니라 풀이 단계의 「왜」 한 줄<br>
<b>서술형 사다리</b> — 같은 소레이드를 만날 때마다 게임이 덜 도와줌 (잠금 아님 · 대장 처치 뒤 언제나 ✍ 바로 쓰기)<br>
1칸 👣 따라가기(첫 판 · 비약 그대로) → 2칸 🧩 💡 근거 줄(🔥 한 판 더 · 보기 고르기 → 💡 힌트 주기) → 4칸 ✍ 직접 쓰기(폰에서 풀이 숨김 → 📸 → 🌟 진필살기) · 3칸 🧱 조각 맞추기는 캠프(나중)</div>
<table class="t3"><tr><th style="width:9%">문제</th><th style="width:32%">💡 근거 줄 (한 판 더에서 빈칸)</th><th style="width:21%">보기 (게임)</th><th>📸 채점 기준 = 소레이드 단계</th></tr>
<tr><td>4 (교07)</td><td>{v("X")}는 {v("B − A")}의 <u>부분집합</u>이므로 개수 = 2<sup>(원소의 개수)</sup></td><td>부분집합 ✔ · 원소 · 여집합</td><td>① {v("A")} 원소나열 ② {v("B")} 원소나열 ③ {v("X ⊂ B")} · {v("A")}와 서로소 → {v("B − A")} ④ 2<sup><i>n</i></sup>으로 개수</td></tr>
<tr><td>5 (교08)</td><td>{v("x")}는 {v("A")}의 원소이므로 {v("x = 4")} 또는 {v("x")} = <u>{v("x² + 2x")}</u></td><td>{v("x² + 2x")} ✔ · 6 · 0</td><td>① {v("A ∩ B = B → B ⊂ A")} ② {v("x = 4")} 확인 ③ {v("x² + x = 0")} 풀기 ④ 모든 {v("x")} 정리</td></tr>
<tr><td>6 (교11)</td><td>{v("n(A ∩ B)")}는 {v("n(A ∪ B)")}가 가장 <u>클</u> 때 가장 작다</td><td>클 ✔ · 작을</td><td>① {v("n(A) + n(B)")} ② 최댓값 = {v("B ⊂ A")}일 때 ③ 최솟값 = {v("n(A ∪ B)")} = 40일 때</td></tr>
<tr><td>7 (교12)</td><td>여집합의 원소의 개수 = 전체의 개수 − <u>{v("A ∩ B")}</u>의 개수</td><td>{v("A ∩ B")} ✔ · {v("A ∪ B")} · {v("A")}</td><td>① {v("n(U)")} ② 드모르간 {v("(A ∩ B)")}{C} ③ {v("A ∩ B")} 원소 ④ 빼기</td></tr></table>

<div class="box"><b>게임 규칙 (DECISIONS 추가)</b><br>
· 첫 판: 💡 줄은 완성 문장으로 「📜 나의 풀이」에 쌓임 · 🔥 한 판 더: 💡 줄이 「∵ ____」 → 보기 고르기<br>
· 💡 힌트 주기: 💡 줄을 맞힌 학생 → 묶기 · 힐 옆 세 번째 단추(기회 1 · EXP +1) → 종합상황실 말풍선에 맞힌 보기 문장 그대로 (줄마다 첫 1명 · 나머지 「👍 +n」 · 소레이드당 최대 3)<br>
· ✍ 바로 쓰기: 대장 처치 뒤 언제나 → 폰에서 나의 풀이 · 졸개 · 채점 기준 숨김 → 📸 찰칵 = 진필살기 예고(TV 「⚡ ○○ 충전 중…」) → 통과 = 🌟 진필살기(스킬 상관없이 · 석화는 몬스터당 반 1번) · 아직 = 실패 연출 없이 빠진 졸개만 다시<br>
· 「📜 풀이 다시 보기」를 누르면 그 도전은 「✍ 연습 쓰기」(💎 · 기록 그대로 · 진필살기 없음) · 수업 사진 학생당 1장(설정)</div></div>'''

goal6 = '<div class="goal"><b>학습목표</b> ① 드모르간의 법칙을 이해하고 이용할 수 있다. ② 여집합·차집합의 원소의 개수를 구할 수 있다. <span class="mini">(③ 중단원 마무리 문제 = 7차시)</span></div>'
goal7 = '<div class="goal"><b>학습목표</b> ③ 집합 단원(중단원 마무리) 문제를 해결할 수 있다. <span class="mini">(6차시 학습지를 둘로 나눈 뒷부분 · 문제 · 숫자 그대로)</span></div>'
def build(no, rng, pages, extra=''):
    hd = header(f'{no}차시', rng); N = len(pages)
    pg = lambda g, l, r, n: f'<div class="page">{hd}{g}<div class="cols"><div class="col">{l}</div><div class="col">{r}</div></div><div class="pno">- {no}차시 ({n}/{N}) -</div></div>'
    return f"<!DOCTYPE html><html><head><meta charset='utf-8'><title>학습과정 {no}차시 레이드용</title><style>{CSS}{EXTRA}</style></head><body>" + ''.join(pg(g, l, r, i + 1) for i, (g, l, r) in enumerate(pages)) + extra + "</body></html>"
html6 = build(6, '공통수학2 Ⅱ. 집합과 명제 1. 집합 04. 드모르간의 법칙 · 원소의 개수 (6차시) · 레이드용 v5', [(goal6, p1_left, SUMMARY + '<div class="mini">문제 4~7 (중단원 마무리) · 형성평가 = 7차시 학습지</div>' + MEMO + '<div class="stampwrap"><div class="stamp"><span>확인 도장</span></div></div>')])
html7 = build(7, '공통수학2 Ⅱ. 집합과 명제 1. 집합 · 중단원 마무리 소레이드 (7차시) · 레이드용 v1', [(goal7, p4blk.replace(MEMO,'') + p1_r2, p2_mid), ('', p3_left, FA6)], T3)
OUT7 = sys.argv[3] if len(sys.argv) > 3 else OUT.replace('06', '07')
with sync_playwright() as p:
    b = p.chromium.launch()
    for html, out in ((html6, OUT), (html7, OUT7)):
        open(out.replace('.pdf', '.html'), 'w', encoding='utf-8').write(html)
        page = b.new_page(); page.set_content(html); page.wait_for_timeout(300)
        bot = page.evaluate("""() => [...document.querySelectorAll('.col')].map(c => { const k = [...c.children].filter(e => !e.classList.contains('memo')).pop(); return k ? Math.round((k.getBoundingClientRect().bottom - c.closest('.page').getBoundingClientRect().top) * 25.4 / 96) : 0 })""")
        page.pdf(path=out, format='A4', print_background=True, prefer_css_page_size=True)
        print('단 아래끝(mm):', bot, out)
    b.close()
