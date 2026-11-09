# 체험판용 예시 학습지 · 3차시 「집합 사이의 포함 관계」 — trial/ 의 set-03 문제와 1:1 (gen_ws6v3 양식 · 학교 이름 없음)
import sys
import os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wslib import CSS, v, BL, CB, GAME
from playwright.sync_api import sync_playwright
OUT = sys.argv[1]
S = '<b style="color:#d32f2f">★</b>'
MEMO = '<div class="memo" style="flex:1">✏ 풀이 · 메모</div>'
EXTRA = '''
.col { display:flex; flex-direction:column; } .page { display:flex; flex-direction:column; } .cols { flex:1; min-height:0; }
.ex { color:#2a4a8a; } body { font-size:8.8pt; line-height:1.36; } .q { margin:0.7mm 0; } h3 { margin:1.4mm 0 0.8mm 0; } .box,.soft { margin:0.8mm 0 !important; padding:1.2mm 2mm !important; }
.word { border:1px dashed #9ab; padding:1mm 2mm; font-size:9pt; margin:1mm 0; }
.sq { display:inline-block; width:7mm; height:5mm; border:1px solid #444; vertical-align:middle; margin:0 1mm; }
table.t { border-collapse:collapse; width:100%; font-size:9.3pt; margin:1mm 0; } table.t td, table.t th { border:1px solid #889; padding:0.8mm 1.5mm; }
table.t th { background:#eef2f8; font-weight:600; width:24%; }
.trialnote { font-size:8.3pt; color:#7a5a20; background:#fff6e0; border:1px solid #e8cf96; border-radius:2mm; padding:1mm 2mm; margin-top:1mm; }
'''
P = lambda n, s, tag: f'<div class="q"><b class="ex">문제 {n})</b> {v(s)} {tag}</div>'
SQ = '<span class="sq"></span>'
pair = lambda a, b: f'{v(a)} {SQ} {v(b)}'

p1_left = f'''
<div class="soft"><b>생각 열기 — 유닛 멤버는 그룹 안에?</b><br>
그룹 「별빛」의 멤버 = {{민, 서, 준, 하, 윤}} · 유닛 「달빛」의 멤버 = {{민, 하}}<br>
유닛 멤버는 모두 그룹 멤버일까? ( 예 / 아니요 ) · 유닛에 「솔」이 들어오면? ( 예 / 아니요 ) {GAME("도입")}</div>
<h3>STEP 1 부분집합</h3>
<div class="box">집합 {v("A")}의 모든 원소가 집합 {v("B")}에 속할 때, {v("A")}를 {v("B")}의 {BL["m"]}이라 하고 {v("A ⊂ B")}로 나타낸다.<br>
{v("A")}는 {v("B")}에 {BL["s"]}된다고 읽는다.<br>
<span class="mini">원소가 <b>하나라도</b> {v("B")}에 없으면 {v("A ⊄ B")}</span></div>
'''

p1_right = f'''
{P(1, "□ 안에 ⊂ 또는 ⊄를 쓰시오.", GAME("몬스터 1 · 5칸"))}
<div class="q">(1) {S}{pair("{1, 2}", "{1, 2, 3}")}</div>
<div class="q">(2) {S}{pair("{2, 5}", "{1, 2, 3, 4}")}</div>
<div class="q">(3) {S}{pair("{3, 6}", "{x | x는 3의 배수}")}</div>
<div class="q">(4) {S}{pair("{2, 3, 5}", "{x | x는 10 이하의 소수}")}</div>
<div class="q">(5) {S}{pair("{x | x² − 2x = 0}", "{−2, 0, 2}")} <span class="mini">(힌트: {v("x(x − 2) = 0")})</span></div>
<h3>STEP 2 꼭 기억할 두 가지 · 서로 같은 집합</h3>
<div class="box">① 모든 집합은 자기 자신의 부분집합 : {v("A ⊂ A")}<br>
② 공집합은 모든 집합의 부분집합 : {v("∅ ⊂ A")}<br>
{v("A ⊂ B")}이고 {v("B ⊂ A")}이면 두 집합은 {BL["m"]}고 하고 {v("A = B")}로 나타낸다.<br>
<span class="mini">원소의 순서는 상관없다 : {v("{1, 2} = {2, 1}")}</span></div>
{P(2, "□ 안에 = 또는 ≠를 쓰시오.", GAME("몬스터 2 · 3칸"))}
<div class="q">(1) {S}{pair("{2, 4, 6}", "{6, 4, 2}")}</div>
<div class="q">(2) {S}{pair("{1, 2, 4}", "{x | x는 4의 약수}")}</div>
<div class="q">(3) {S}{pair("{2, 4, 6}", "{x | x는 8 이하의 짝수}")}</div>
'''

rows = ''.join(f'<tr><th>원소 {k}개</th><td></td></tr>' for k in range(4))
p2_left = f'''
<h3>STEP 3 부분집합 모두 구하기 · 진부분집합</h3>
<div class="box">원소를 <b>0개, 1개, 2개, …</b> 고르는 순서로 쓰면 빠짐없이 구할 수 있다.<br>
부분집합 중에서 자기 자신을 뺀 것을 {BL["m"]}이라 한다.</div>
{P(3, "A = {1, 2, 3}의 부분집합을 원소의 개수별로 모두 쓰시오.", GAME("몬스터 3 · 6칸"))}
<table class="t">{rows}</table>
<div class="q">{S}부분집합의 개수 : {BL["s"]}개 &nbsp;&nbsp; {S}진부분집합의 개수 : {BL["s"]}개</div>
<h3>STEP 4 부분집합의 개수</h3>
<div class="box">원소가 하나 늘 때마다 부분집합은 <b>2배</b> → 원소 {v("n")}개이면 {v("2")}<sup><i class="v">n</i></sup>개<br>
특정한 원소 {v("k")}개를 <b>반드시 포함</b>(또는 <b>포함하지 않는</b>) 부분집합 → {v("2")}<sup><i class="v">n</i>−<i class="v">k</i></sup>개</div>
{P(4, "물음에 답하시오.", GAME("몬스터 4 · 4칸"))}
<div class="q">(1) {S}원소 1개 → 2개, 2개 → 4개, 3개 → 8개일 때, 원소 4개 → {BL["s"]}개</div>
<div class="q">(2) {S}{v("{a, b, c, d}")}의 부분집합의 개수 : {BL["s"]}개</div>
<div class="q">(3) {S}{v("{a, b, c, d}")}에서 {v("a")}를 반드시 포함하는 부분집합 : {BL["s"]}개</div>
<div class="q">(4) {S}{v("{a, b, c, d}")}에서 {v("a")}를 포함하지 않는 부분집합 : {BL["s"]}개</div>
'''

W = lambda h: f'<div style="height:{h}mm"></div>'
fq = lambda n, s, h: f'<div class="q">{n}. {v(s)}</div>{W(h)}'
p2_right = f'''
<div class="fa" style="margin-top:0"><div class="tt">3차시 형성평가 <span class="mini" style="font-weight:400">(혼자 풀기 · 7문항)</span>{GAME("보스 「포함의 성주」")}</div>
<div class="q">1. □ 안에 ⊂ 또는 ⊄를 쓰시오.<br>&nbsp;&nbsp;{pair("{1, 3}", "{1, 2, 3}")} &nbsp;&nbsp; {pair("{1, 4}", "{1, 2, 3}")}</div>{W(3)}
<div class="q">2. 다음 중 옳지 <b>않은</b> 것은?<br>&nbsp;&nbsp;① {v("2 ∈ {1, 2}")} &nbsp; ② {v("{2} ⊂ {1, 2}")} &nbsp; ③ {v("∅ ⊂ {1, 2}")} &nbsp; ④ {v("2 ⊂ {1, 2}")}</div>{W(3)}
<div class="q">3. □ 안에 = 또는 ≠를 쓰시오.<br>&nbsp;&nbsp;{pair("{x | x는 6의 약수}", "{1, 2, 3, 6}")}</div>{W(3)}
{fq(4, "집합 {5, 7}의 부분집합을 모두 쓰시오.", 5)}
{fq(5, "집합 {5, 7}의 진부분집합의 개수는?", 4)}
{fq(6, "[도전] 두 집합 A = {1, a}, B = {1, 3}에 대하여 A ⊂ B이고 B ⊂ A일 때, a의 값은?", 5)}
{fq(7, "[도전] 집합 {1, 2, 3, 4, 5, 6, 7}의 부분집합 중에서 2와 6을 반드시 포함하고 5는 포함하지 않는 부분집합의 개수는?", 5)}
</div>
<div class="add mini"><b>수업 뒤에도</b> — 내 캠프의 복습 허수아비: 오늘 문제를 숫자만 바꿔 다시 · 형성평가 재대결 | 성채던전: 진도에 맞춰 단원 평가 방이 열려요</div>
<div class="trialnote">「모두의 던전」 체험판용 예시 학습지 — 게임: 표시가 붙은 칸이 그대로 게임 속 몬스터 · 보스가 됩니다. ★ 칸 = 게임에서 푸는 칸</div>
<div class="stampwrap" style="margin-top:auto"><div class="stamp"><span>확인 도장</span></div></div>'''

hd = '''<div class="hd"><div class="l"><div class="s">모두의 던전 체험판</div><div class="m" style="font-size:14pt;padding:2mm 0">공통수학2</div></div>
<div class="c"><div class="t">학 습 과 정 · 3차시</div><div class="r">공통수학2 Ⅱ. 집합과 명제 1. 집합 02. 집합 사이의 포함 관계 · 예시 학습지</div></div>
<div class="rr"><div>학년     반     번</div><div>이름</div></div></div>'''
goal = '<div class="goal"><b>학습목표</b> ① 부분집합의 뜻을 알고 ⊂, ⊄로 나타낼 수 있다. ② 서로 같은 집합을 찾을 수 있다. ③ 부분집합을 모두 구하고 그 개수를 셀 수 있다.</div>'
pg = lambda g, l, r, n: f'<div class="page">{hd}{g}<div class="cols"><div class="col">{l}</div><div class="col">{r}</div></div><div class="pno">- 3차시 -</div></div>'
html = f"<!DOCTYPE html><html><head><meta charset='utf-8'><title>3차시 체험판 예시 학습지</title><style>{CSS}{EXTRA}</style></head><body>{pg(goal, p1_left + p1_right + p2_left.split('<h3>STEP 4')[0], '<h3>STEP 4' + p2_left.split('<h3>STEP 4')[1] + p2_right, 1)}</body></html>"
open(OUT.replace('.pdf', '.html'), 'w', encoding='utf-8').write(html)
with sync_playwright() as p:
    b = p.chromium.launch(); page = b.new_page(); page.set_content(html); page.wait_for_timeout(400)
    bot = page.evaluate("""() => [...document.querySelectorAll('.col')].map(c => { const k = [...c.children].filter(e => !e.classList.contains('memo')).pop(); return k ? Math.round((k.getBoundingClientRect().bottom - c.closest('.page').getBoundingClientRect().top) * 25.4 / 96) : 0 })""")
    page.pdf(path=OUT, format='A4', print_background=True, prefer_css_page_size=True); b.close()
print('단 아래끝(mm):', bot)
