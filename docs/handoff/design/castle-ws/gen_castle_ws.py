#!/usr/bin/env python3
"""🏰 성채 학습지 2장 (학생 배부용 · 🌊 설계 묶음 #3 고침 · 설계 방)

성채 1층(집합 12방) · 2층(명제 11방)의 **첫 판 그대로**(게임과 같은 숫자)를 종이 문장으로 옮김.
  PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers WSLIB_DIR=<tools/worksheet> python3 gen_castle_ws.py <성채 팩 폴더(eval-1 · 2.json)> [출력 폴더]
팩을 읽어 ① 방 번호 · 열림 차시 · 📷 · 👑 꼬리표 ② 아래에 적은 숫자 · 정답이 팩 첫 판과 같은지 대조한 뒤 PDF 4개를 만든다.
"""
import json, os, sys, re
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('WSLIB_DIR', os.path.join(HERE, '..', '..', '..', '..', 'tools', 'worksheet')))
from wslib import v, C, BL, build, teacher
PACK = sys.argv[1]; OUT = sys.argv[2] if len(sys.argv) > 2 else HERE
EXTRA = '''
body { font-size:10.2pt; line-height:1.55; }
.rm { margin:0 0 2.2mm 0; padding:1.6mm 2.4mm 1.2mm; border:1px solid #b9c0cf; border-radius:2mm; break-inside:avoid; }
.rm.boss { border:1.6px solid #b8860b; background:#fffaf0; }
.tagl { font-size:8.2pt; color:#5b6478; display:flex; gap:2mm; flex-wrap:wrap; align-items:center; margin-bottom:0.8mm; }
.tagl b { color:#2a4a8a; font-size:9pt; }
.pill { border:1px solid #9aa6c0; border-radius:8px; padding:0 1.6mm; }
.pill.ph { border-color:#b06a00; color:#8a5200; background:#fff3dc; }
.pill.bs { border-color:#b8860b; color:#7a5a00; background:#fff3c4; }
.sub { margin:0.6mm 0 0 3mm; line-height:1.85; }
.wk { border-top:1px dashed #c3cad8; margin-top:1.4mm; color:#8a93a6; font-size:8pt; }
.how { border:1px solid #9bb; background:#f4f8fb; border-radius:2mm; padding:1.4mm 2.4mm; margin:0 0 2.2mm 0; font-size:9pt; line-height:1.6; }
'''
AC = v('A') + C; BC = v('B') + C
PAR = '(&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)'
TF = '( 참 / 거짓 )'
def sub(k): return f'<sub>{k}</sub>'

# 방마다: (방 id, 종이 문장 HTML, 풀이 칸 높이 mm, 교사용 정답, 풀이 한 줄, [팩 첫 판 글에 꼭 있어야 하는 조각], [팩 첫 판 정답 대조])
F1 = [
 ('q01', f'다음에서 집합인 것에 ○표, 집합이 아닌 것에 ×표를 하시오.<div class="sub">⑴ 맛있는 과일의 모임 {PAR}<br>⑵ 5보다 작은 자연수의 모임 {PAR}<br>⑶ 0에 가까운 수의 모임 {PAR}</div>', 0,
  '⑴ × ⑵ ○ ⑶ ×', '대상이 분명하게 정해지는 모임만 집합', ['맛있는 과일', '5보다 작은 자연수', '0에 가까운 수'], ['X', 'O', 'X']),
 ('q02', f'다음 집합을 원소나열법으로 나타내시오.<div class="sub">⑴ {v("{x | x는 15의 약수}")} = {BL["l"]}<br>⑵ {v("{x | x² − 5x + 4 = 0}")} = {BL["l"]}</div>', 6,
  '⑴ {1, 3, 5, 15} ⑵ {1, 4}', '(x − 1)(x − 4) = 0', ['15의 약수', 'x² − 5x + 4 = 0'], None),
 ('q03', f'두 집합 {v("A")}와 {v("B")} 사이의 포함 관계를 기호 ⊂ 를 써서 나타내시오.<div class="sub">⑴ {v("A = {1, 5, 9, 13}")}, {v("B = {x | x는 홀수}")} → {BL["m"]}<br>⑵ {v("A = {x | x는 12의 약수}")}, {v("B = {3, 6}")} → {BL["m"]}</div>', 4,
  '⑴ A ⊂ B ⑵ B ⊂ A', '12의 약수 = {1, 2, 3, 4, 6, 12}', ['{1, 5, 9, 13}', '12의 약수', '{3, 6}'], None),
 ('q04', f'두 집합 {v("A")}와 {v("B")}에 대하여 {v("n(A) = 16")}, {v("n(B) = 21")}, {v("n(A ∪ B) = 28")} 일 때, {v("n(A ∩ B)")} 를 구하시오.', 10,
  '9', '16 + 21 − 28 = 9', ['n(A) = 16', 'n(B) = 21', 'n(A ∪ B) = 28'], ['9']),
 ('q05', f'전체집합 {v("U = {1, 2, 3, …, 10}")} 의 두 부분집합 {v("A = {2, 6, 7, 10}")}, {v("B = {x | x는 10의 약수}")} 에 대하여 다음을 구하시오.<div class="sub">⑴ {v("A ∩ B")} = {BL["m"]} &nbsp; ⑵ {v("A ∪ B")} = {BL["l"]}<br>⑶ {AC} = {BL["l"]} &nbsp; ⑷ {v("A − B")} = {BL["m"]}</div>', 6,
  '⑴ {2, 10} ⑵ {1, 2, 5, 6, 7, 10} ⑶ {1, 3, 4, 5, 8, 9} ⑷ {6, 7}', 'B = {1, 2, 5, 10}', ['A = {2, 6, 7, 10}', '10의 약수'], None),
 ('q06', f'전체집합 {v("U = {1, 2, 3, 4, 5, 6}")} 의 부분집합 중에서 집합 {v("A = {1, 2, 3, 5}")} 와 서로소인 집합을 모두 구하시오.', 12,
  '∅, {4}, {6}, {4, 6}', 'U − A = {4, 6} 의 부분집합', ['U = {1, 2, 3, 4, 5, 6}', 'A = {1, 2, 3, 5}'], None),
 ('q07', f'두 집합 {v("A = {x | x는 6의 약수}")}, {v("B = {x | x는 18 이하의 3의 배수}")} 에 대하여 {v("A ∩ X = ∅")} 과 {v("B ∪ X = B")} 를 만족시키는 집합 {v("X")}의 개수를 구하는 풀이 과정과 답을 쓰시오.', 30,
  '16', 'X ⊂ B − A = {9, 12, 15, 18} → 2⁴ = 16', ['6의 약수', '18 이하의 3의 배수'], ['16']),
 ('q08', f'두 집합 {v("A = {x² + 3x, 5, 7}")}, {v("B = {x, 7}")} 에 대하여 {v("A ∩ B = B")} 를 만족시키는 모든 정수 {v("x")}의 값을 구하시오.', 22,
  '−2, 0, 5', 'B ⊂ A → x = 5 또는 x = x² + 3x (x = 0, −2)', ['A = {x² + 3x, 5, 7}', 'B = {x, 7}'], None),
 ('q09', f'100 이하의 자연수 중에서 자연수 {v("k")}의 배수의 집합을 {v("A")}{sub(v("k"))} 로 나타낼 때, {v("n(A")}{sub(6)} ∩ ({v("A")}{sub(4)} ∪ {v("A")}{sub(10)}{v("))")} 을 구하시오.', 24,
  '10', 'A₁₂ ∪ A₃₀ → 8 + 3 − 1 = 10', ['A₆ ∩ (A₄ ∪ A₁₀)'], ['10']),
 ('q10', f'전체집합 {v("U = {x | x는 40 이하의 자연수}")} 의 두 부분집합 {v("A = {x | x는 8의 배수}")}, {v("B = {x | x는 32의 약수}")} 에 대하여 {v("n(")}{AC} ∩ {BC}{v(")")} 를 구하시오.', 24,
  '32', 'n(A) = 5, n(B) = 6, n(A ∩ B) = 3 → n(A ∪ B) = 8 → 40 − 8 = 32', ['40 이하의 자연수', '8의 배수', '32의 약수'], ['32']),
 ('q11', f'어느 동아리 회원 50명을 대상으로 두 코스 {v("A")}와 {v("B")}를 다녀온 경험이 있는 회원 수를 조사하였더니 {v("A")} 코스는 34명이고 {v("B")} 코스는 27명이었다. 두 코스를 모두 다녀온 회원 수의 최댓값과 최솟값을 구하는 풀이 과정과 답을 쓰시오.', 30,
  '최댓값 27 · 최솟값 11', 'B ⊂ A 일 때 27 · n(A ∪ B) = 50 일 때 34 + 27 − 50 = 11', ['회원 50명', 'A 코스 34명', 'B 코스 27명'], ['27', '11']),
 ('q12', f'100 미만의 자연수 중에서 6의 배수가 아니거나 4로 나누었을 때의 나머지가 2가 아닌 자연수의 개수를 구하시오.', 30,
  '91', '여집합 = 6의 배수이면서 4로 나눈 나머지 2 → 6, 18, …, 90 (8개) → 99 − 8 = 91', ['100 미만의 자연수', '6의 배수', '4로 나눈 나머지가 2'], ['99', '91']),
]
F2 = [
 ('q01', f'다음에서 명제를 모두 찾고, 그 참 · 거짓을 판별하시오.<div class="sub">⑴ {v("√9")}는 유리수이다. {PAR}<br>⑵ {v("x")}는 50보다 작은 수이다. {PAR}<br>⑶ 28은 3의 배수이다. {PAR}<br>⑷ 우리 학교는 멋진 학교이다. {PAR}</div>', 0,
  '명제 = ⑴ 참 · ⑶ 거짓 / ⑵ 조건 · ⑷ 명제 아님', '참 · 거짓을 분명히 가릴 수 있는 문장만 명제', ['√9는 유리수이다', 'x는 50보다 작은 수이다', '28은 3의 배수이다', '우리 학교는 멋진 학교이다'], ['0', '2', '1', '2']),
 ('q02', f'전체집합 {v("U = {x | x는 8 이하의 자연수}")} 에 대하여 두 조건 {v("p")}: {v("x² − 7x + 12 = 0")}, {v("q")}: {v("x² − 8x + 16 > 0")} 일 때, 다음 조건의 진리집합을 구하시오.<div class="sub">⑴ {v("p")} : {BL["m"]} &nbsp; ⑵ {v("q")} : {BL["l"]}<br>⑶ {v("~p")} : {BL["l"]} &nbsp; ⑷ {v("~q")} : {BL["m"]}</div>', 6,
  '⑴ {3, 4} ⑵ {1, 2, 3, 5, 6, 7, 8} ⑶ {1, 2, 5, 6, 7, 8} ⑷ {4}', '(x − 3)(x − 4) = 0 · (x − 4)² > 0 → x ≠ 4', ['8 이하의 자연수', 'x² − 7x + 12 = 0', 'x² − 8x + 16 > 0'], None),
 ('q03', f'다음 명제의 역과 대우를 쓰고, 그 참 · 거짓을 판별하시오.<div class="sub">⑴ {v("x")}가 정수이면 {v("x")}는 유리수이다.<br>&nbsp;&nbsp;역 : {BL["xl"]} {TF}<br>&nbsp;&nbsp;대우 : {BL["xl"]} {TF}<br>⑵ {v("x(x − 2) = 0")} 이면 {v("x − 2 = 0")} 이다.<br>&nbsp;&nbsp;역 : {BL["xl"]} {TF}<br>&nbsp;&nbsp;대우 : {BL["xl"]} {TF}</div>', 0,
  '⑴ 역: x가 유리수이면 x는 정수이다 (거짓) · 대우: x가 유리수가 아니면 x는 정수가 아니다 (참) ⑵ 역: x − 2 = 0 이면 x(x − 2) = 0 (참) · 대우: x − 2 ≠ 0 이면 x(x − 2) ≠ 0 (거짓 · x = 0)', '명제와 대우는 참 · 거짓이 같다', ['x가 정수이면 x는 유리수이다', 'x(x − 2) = 0이면 x − 2 = 0이다'], None),
 ('q04', f'두 조건 {v("p")}와 {v("q")}가 다음과 같을 때, {v("p")}는 {v("q")}이기 위한 어떤 조건인지 쓰시오.<div class="sub">⑴ {v("p")}: {v("x ≤ 2")} , {v("q")}: {v("−4 ≤ x ≤ 1")} → {BL["m"]}조건<br>⑵ {v("p")}: {v("a = b")} , {v("q")}: {v("|a| = |b|")} → {BL["m"]}조건<br>⑶ {v("p")}: {v("|x| ≤ 2")} , {v("q")}: {v("−2 ≤ x ≤ 2")} → {BL["m"]}조건</div>', 4,
  '⑴ 필요조건 ⑵ 충분조건 ⑶ 필요충분조건', 'Q ⊂ P 이면 필요 · P ⊂ Q 이면 충분', ['p: x ≤ 2, q: −4 ≤ x ≤ 1', 'p: a = b, q: |a| = |b|', 'p: |x| ≤ 2, q: −2 ≤ x ≤ 2'], ['1', '0', '2']),
 ('q05', f'다음 명제의 부정을 쓰고, 그 참 · 거짓을 판별하시오.<div class="sub">⑴ 모든 실수 {v("x")}에 대하여 {v("x² > 2x − 2")} 이다.<br>&nbsp;&nbsp;부정 : {BL["xl"]} {TF}<br>⑵ 어떤 실수 {v("x")}에 대하여 {v("|2x − 5| < 0")} 이다.<br>&nbsp;&nbsp;부정 : {BL["xl"]} {TF}</div>', 4,
  '⑴ 어떤 실수 x에 대하여 x² ≤ 2x − 2 — 거짓 ⑵ 모든 실수 x에 대하여 |2x − 5| ≥ 0 — 참', 'x² − 2x + 2 = (x − 1)² + 1 > 0 · 절댓값은 늘 0 이상', ['x² > 2x − 2', '|2x − 5| < 0'], None),
 ('q06', f'전체집합 {v("U")}에 대하여 두 조건 {v("p")}와 {v("q")}의 진리집합을 각각 {v("P")}와 {v("Q")}라 하자. 명제 {v("~p → q")} 가 참일 때, 옳은 것을 모두 고르시오. {PAR}<div class="sub">ㄱ. {v("Q")}{C} ⊂ {v("P")} &nbsp; ㄴ. {v("P ∪ Q = U")}<br>ㄷ. {v("P")}{C} ∩ {v("Q")} = {v("P")}{C} &nbsp; ㄹ. {v("P ∩ Q = ∅")}</div>', 12,
  'ㄱ, ㄴ, ㄷ', '~p → q 참 ⇔ Pᶜ ⊂ Q', ['~p → q', 'ㄱ. Qᶜ ⊂ P', 'ㄴ. P ∪ Q = U', 'ㄷ. Pᶜ ∩ Q = Pᶜ', 'ㄹ. P ∩ Q = ∅'], ['0,1,2']),
 ('q07', f'실수 {v("x")}에 대하여 두 조건 {v("p")}: {v("x² − 9a² ≤ 0")}, {v("q")}: {v("|x − 2| ≤ 7")} 일 때, 명제 {v("p → q")} 의 역이 참이 되도록 하는 자연수 {v("a")}의 최솟값을 구하는 풀이 과정과 답을 쓰시오.', 30,
  '3', 'P: −3a ≤ x ≤ 3a · Q: −5 ≤ x ≤ 9 · Q ⊂ P → 3a ≥ 9', ['x² − 9a² ≤ 0', '|x − 2| ≤ 7'], ['3']),
 ('q08', f'실수 {v("x")}에 대하여 두 조건 {v("p")}: {v("x² − 8x + 7 ≤ 0")}, {v("q")}: {v("x ≤ a")} 일 때, {v("p")}가 {v("q")}이기 위한 충분조건이 되도록 하는 실수 {v("a")}의 최솟값을 구하시오.', 22,
  '7', 'P: 1 ≤ x ≤ 7 ⊂ Q → a ≥ 7', ['x² − 8x + 7 ≤ 0', 'q: x ≤ a', '최솟값'], ['7']),
 ('q09', f'세 조건 {v("p")}, {v("q")}, {v("r")}에 대하여 두 명제 {v("p → ~q")} 와 {v("r → q")} 가 모두 참일 때, 항상 참인 명제를 모두 고르시오. {PAR}<div class="sub">ㄱ. {v("q → ~p")} &nbsp; ㄴ. {v("~q → ~r")} &nbsp; ㄷ. {v("r → ~p")} &nbsp; ㄹ. {v("~p → q")}</div>', 14,
  'ㄱ, ㄴ, ㄷ', '대우도 참 · r → q, q → ~p 이면 r → ~p', ['p → ~q 와 r → q', 'ㄱ. q → ~p', 'ㄴ. ~q → ~r', 'ㄷ. r → ~p', 'ㄹ. ~p → q'], ['0,1,2']),
 ('q10', f'실수 {v("x")}에 대하여 두 조건 {v("p")}: {v("a")}{v("x² + 4x − 2 ≥ 0")}, {v("q")}: {v("x² + 2")}{v("b")}{v("x + 16 > 0")} 이다. 다음 두 명제가 모두 거짓이 되도록 하는 정수 {v("a")}의 최댓값을 {v("M")}, 자연수 {v("b")}의 최솟값을 {v("m")}이라 할 때, {v("M + m")} 의 값을 구하는 풀이 과정과 답을 쓰시오.<div class="sub">(가) 어떤 실수 {v("x")}에 대하여 {v("p")}이다.<br>(나) {v("~p")}는 {v("q")}이기 위한 충분조건이다.</div>', 32,
  '1', '(가) 거짓 → a < 0, 4 + 2a < 0 → M = −3 · (나) 거짓 → b² − 16 ≥ 0 → m = 4', ['ax² + 4x − 2 ≥ 0', 'x² + 2bx + 16 > 0'], ['1']),
 ('q11', f'실수 {v("x")}, {v("y")}에 대하여 {v("2x² + y² − 2x +")} <span style="display:inline-block;vertical-align:middle;text-align:center;line-height:1.25"><span style="display:block;border-bottom:1px solid #222;padding:0 1mm">9</span><span style="display:block;padding:0 1mm">{v("x² + y² + 1")}</span></span> 의 최솟값을 구하시오.', 32,
  '4', 'x² + y² + 1 = t → (t + 9/t) + (x − 1)² − 2 ≥ 6 − 2 (t = 3, x = 1)', ['2x² + y² − 2x + 9 / (x² + y² + 1)'], ['4']),
]

def run(n, rows, lesson, unit, key, sheet):
    pk = json.load(open(os.path.join(PACK, f'eval-{n}.json'), encoding='utf8'))
    rooms = {r['id']: r for r in pk['rooms']}
    assert [r[0] for r in rows] == [r['id'] for r in pk['rooms']], '방 순서 · 개수가 팩과 다름'
    body = (f'<div class="how"><b>🏰 성채던전 {n}층과 같은 문제 · 같은 숫자</b>예요. 여기에 먼저 풀고, 캠프 → 🏰 성채던전 {n}층의 그 방에서 답을 넣어 보세요. '
            f'꼬리표의 차시 수업을 하면 그 방이 열려요. 한 번 틀리면 방의 숫자가 바뀌어요. <span class="pill ph">📷 성채에서 사진으로 내기</span> = 풀이를 써서 찍어 올리는 방.</div>')
    ans = []
    for rid, html, wk, a, sol, frags, chk in rows:
        r = rooms[rid]; v0 = r['vers'][0]; text = ' '.join(it['q'] + ' ' + ' '.join(it['ch']) + ' ' + ' '.join(g['label'] for g in it.get('groups', [])) for it in v0)
        for f in frags: assert f in text, (rid, '팩 첫 판에 없는 글', f)
        if chk:
            got = [it['a'] for it in v0]
            assert all(c in got for c in chk), (rid, '정답이 팩과 다름', chk, got)
        no = rid[1:]; boss = r.get('boss')
        tag = f'<b>{"👑 " if boss else ""}{no}</b><span class="pill">🏰 {n}층 {no}번 방 · {r["no"]}차시 뒤 열림</span>'
        if boss: tag += f'<span class="pill bs">👑 보스 방 · 열린 방의 {pk["bossPct"]}%를 처치하면 열림</span>'
        if r.get('photo'): tag += '<span class="pill ph">📷 성채에서 사진으로 내기</span>'
        work = f'<div class="wk" style="height:{wk}mm">✏ 풀이</div>' if wk else ''
        body += f'<div class="rm{" boss" if boss else ""}"><div class="tagl">{tag}</div>{html}{work}</div>'
        ans.append((f'{"👑 " if boss else ""}{no} · {n}층 {no}번 방 ({r["no"]}차시 뒤){" 📷" if r.get("photo") else ""}', f'<b>{a}</b><br><span style="font-weight:400;color:#555">{sol}</span>'))
    bot = build(os.path.join(OUT, key + '.pdf'), lesson, unit, f'① {sheet} 단원의 중단원 문제를 스스로 풀어 본다. ② 같은 문제를 🏰 성채던전 {n}층에서 숫자를 바꿔 다시 도전한다.', body, EXTRA)
    assert max(bot) <= 281, bot
    teacher(os.path.join(OUT, key + '-teacher.pdf'), lesson, unit, [
        f'🏰 성채던전 {n}층 {len(rows)}방의 첫 판과 같은 문제 · 같은 숫자(교과서 중단원 마무리 문제의 숫자를 바꾼 것). 수업에서 다루지 않고 학생에게 나눠 주는 용도.',
        '방 번호 = 문항 번호 · 꼬리표의 차시 수업을 하면 그 방이 열림 · 👑 보스 방은 열린 방의 60%를 처치하면 열림.',
        '학생이 방에서 한 번 틀리면 방의 숫자가 바뀜 → 이 정답은 첫 판에만 맞음. 📷 방은 풀이를 사진으로 내면 AI 가 채점.',
    ], ans)

if __name__ == '__main__':
    run(1, F1, '🏰 성채 1층 · 집합', '공통수학2 Ⅱ-1. 집합 중단원 · 성채던전 1층과 같은 문제 (12문항)', 'castle-ws-1-set', '집합')
    run(2, F2, '🏰 성채 2층 · 명제', '공통수학2 Ⅱ-2. 명제 중단원 · 성채던전 2층과 같은 문제 (11문항)', 'castle-ws-2-prop', '명제')
    print('끝')
