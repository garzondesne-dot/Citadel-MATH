#!/usr/bin/env python3
"""🏰 성채 서술형 소레이드 학습지 한 장 (학생용 · 교사용) — 🌊 설계 묶음 #5
  PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers WSLIB_DIR=<tools/worksheet> python3 gen_chain_ws.py [출력 폴더]
castle-chain.json(판 0)을 읽어 꼬리표 · 정답을 붙임. 단계 빈칸 글은 아래에 손으로 적고, 빈칸 답이 판 0 정답과 같은지 대조."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('WSLIB_DIR', os.path.join(HERE, '..', '..', '..', '..', 'tools', 'worksheet')))
from wslib import v, C, BL, build, teacher
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE
D = json.load(open(os.path.join(HERE, 'castle-chain.json'), encoding='utf8'))
S = '<b style="color:#d32f2f">★</b>'
EXTRA = '''
.hd .c .t { font-size:15pt; letter-spacing:1px; white-space:nowrap; }
body { font-size:9.7pt; line-height:1.45; }
.goal { margin-bottom:1.5mm; }
.rm { margin:0 0 2.2mm 0; padding:1.6mm 2.4mm 1.4mm; border:1px solid #b9c0cf; border-radius:2mm; }
.rm.boss { border:1.6px solid #b8860b; background:#fffaf0; }
.tagl { font-size:8.2pt; color:#5b6478; display:flex; gap:1.6mm; flex-wrap:wrap; align-items:center; margin-bottom:0.8mm; }
.tagl b { color:#2a4a8a; font-size:9pt; }
.pill { border:1px solid #9aa6c0; border-radius:8px; padding:0 1.6mm; }
.pill.ph { border-color:#b06a00; color:#8a5200; background:#fff3dc; }
.pill.ch { border-color:#6a7fa8; color:#2a4a8a; background:#eef3fb; }
.pf { border:1px solid #7a8aa8; border-radius:2mm; padding:1mm 2.2mm; margin:1.2mm 0 1mm; font-size:9.4pt; line-height:1.7; background:#fff; }
.hint { font-size:8.8pt; color:#6b4a00; background:#fff6dc; border-radius:1.5mm; padding:0.8mm 2mm; margin:1mm 0; }
.essay { border:1.5px solid #6a7fa8; border-radius:2mm; padding:1.2mm 2.4mm; margin:1mm 0 0; background:#fff; }
.essay .ln { border-bottom:1px dashed #b9c4d8; height:6mm; }
.how { border:1px solid #9bb; background:#f4f8fb; border-radius:2mm; padding:1.4mm 2.4mm; margin:0 0 2.2mm 0; font-size:9pt; line-height:1.6; }
'''
s, m, l = BL['s'], BL['m'], BL['l']
AC = v('A') + C
# (층 팩, 방, 문제 글, [단계 빈칸 줄], 근거 줄, 서술형 줄 수, 교사용 빈칸 답)
ROOMS = [
 ('eval-1', 'q07', f'두 집합 {v("A = {x | x는 6의 약수}")}, {v("B = {x | x는 18 이하의 3의 배수}")} 에 대하여 {v("A ∩ X = ∅")} 과 {v("B ∪ X = B")} 를 만족시키는 집합 {v("X")}의 개수를 구하는 풀이 과정과 답을 쓰시오.',
  [f'{v("A")} = {l} , {v("B")} = {l}', f'{v("B ∪ X = B")} → {v("X")} {s} {v("B")} &nbsp;·&nbsp; {v("A ∩ X = ∅")} → {v("X")}와 {v("A")}는 {m}', f'{v("X")}에 들어갈 수 있는 원소 : {l}', f'그러므로 {v("X")}의 개수 = {s}'],
  f'원소가 {v("n")}개인 집합의 부분집합의 개수 = {s}', 3, '① {1, 2, 3, 6} · {3, 6, 9, 12, 15, 18} ② ⊂ · 서로소 ③ 9, 12, 15, 18 👑 16 · 💡 2ⁿ'),
 ('eval-1', 'q11', f'동아리 회원 50명 중 {v("A")} 코스를 다녀온 회원은 34명, {v("B")} 코스는 27명이다. 두 코스를 모두 다녀온 회원 수의 최댓값과 최솟값을 구하는 풀이 과정과 답을 쓰시오.',
  [f'가장 많을 때 : {m} (집합의 포함 관계로)', f'최댓값 = {s}', f'가장 적을 때 : {v("n(A ∪ B)")} = {s} 일 때', f'그러므로 최솟값 = 34 + 27 − {s} = {s}'],
  f'{v("n(A ∩ B) = n(A) + n(B) −")} {m}', 3, '① B ⊂ A ② 27 ③ 50 👑 50 · 11 · 💡 n(A ∪ B)'),
 ('eval-2', 'q07', f'실수 {v("x")}에 대하여 두 조건 {v("p")}: {v("x² − 9a² ≤ 0")}, {v("q")}: {v("|x − 2| ≤ 7")} 일 때, 명제 {v("p → q")} 의 역이 참이 되도록 하는 자연수 {v("a")}의 최솟값을 구하는 풀이 과정과 답을 쓰시오.',
  [f'{v("P = {x |")} {s} ≤ {v("x")} ≤ {s} {v("}")}', f'{v("Q = {x |")} {s} ≤ {v("x")} ≤ {s} {v("}")}', f'역이 참 → {v("Q")} {s} {v("P")}', f'{v("−3a")} ≤ {s} 이고 {s} ≤ {v("3a")}', f'그러므로 자연수 {v("a")}의 최솟값 = {s}'],
  f'명제 {v("p → q")} 의 역은 {m}', 3, '① −3a · 3a ② −5 · 9 ③ ⊂ ④ −5 · 9 👑 3 · 💡 q → p'),
 ('eval-2', 'q10', f'실수 {v("x")}에 대하여 두 조건 {v("p")}: {v("a")}{v("x² + 4x − 2 ≥ 0")}, {v("q")}: {v("x² + 2")}{v("b")}{v("x + 16 > 0")} 이다. (가) 어떤 실수 {v("x")}에 대하여 {v("p")}이다. (나) {v("~p")}는 {v("q")}이기 위한 충분조건이다. — 두 명제가 모두 거짓이 되도록 하는 정수 {v("a")}의 최댓값을 {v("M")}, 자연수 {v("b")}의 최솟값을 {v("m")}이라 할 때, {v("M + m")} 의 값을 구하는 풀이 과정과 답을 쓰시오.',
  [f'(가)가 거짓 → {s} 실수 {v("x")}에 대하여 {v("a")}{v("x² + 4x − 2")} {s} 0', f'그러려면 {v("a")} {s} 0 이고 판별식 {v("D")} {s} 0', f'{v("D/4 = 4 + 2a < 0")} → {v("a <")} {s} → {v("M")} = {s}', f'(나)가 거짓 → {v("q")}가 참이 아닌 {v("x")}가 있다 → {v("b² − 16")} {s} 0', f'{v("m")} = {s} , 그러므로 {v("M + m")} = {s}'],
  f'‘어떤 {v("x")}에 대하여 {v("p")}’의 부정은 ‘{s} {v("x")}에 대하여 {v("~p")}’', 4, '① 모든 · < ② < · < ③ −2 · −3 ④ ≥ 👑 4 · 1 · 💡 모든'),
 ('eval-3', 'q15', f'두 동아리 {v("A")} 또는 {v("B")}에 가입한 남학생 26명과 여학생 22명을 조사하였더니, {v("A")}에 가입한 학생 수와 {v("B")}에 가입한 학생 수의 합은 58이고, 한 동아리에만 가입한 남학생 수와 여학생 수가 같았다. 두 동아리에 모두 가입한 여학생 수를 구하는 풀이 과정과 답을 쓰시오.',
  [f'{v("n(A ∩ B)")} = 58 − {s} = {s}', f'둘 다 가입한 남학생 {v("x")}명, 여학생 {v("y")}명 → 한 곳만 : 남 {m}, 여 {m}', f'식 두 개 : {l} , {l}', f'그러므로 둘 다 가입한 여학생 수 = {s}'],
  f'{v("n(A ∩ B) = n(A) + n(B) −")} {m}', 3, '① 48 · 10 ② 26 − x · 22 − y ③ 26 − x = 22 − y · x + y = 10 👑 3 · 💡 n(A ∪ B)'),
 ('eval-3', 'q16', f'‘{v("√5")} 는 유리수가 아니다’를 귀류법으로 증명하시오.',
  [f'{v("√5")} 가 {m}라고 가정하자.', f'{v("√5 = m/n")} ({v("m")}, {v("n")}은 서로소인 자연수) → {v("m²")} = {s} {v("n²")} → {v("m")}은 5의 배수', f'{v("m = 5t")} 라 하면 {v("n²")} = {s} {v("t²")} → {v("n")}도 5의 배수', f'그러므로 {v("m")}, {v("n")}이 {m}라는 것에 모순 → {v("√5")} 는 유리수가 아니다'],
  f'결론을 부정하여 모순을 이끌어 내는 증명법 = {m}', 4, '① 유리수 ② 5 ③ 5 👑 서로소 · 💡 귀류법'),
 ('eval-3', 'q17', f'{v("a > 0")}, {v("b > 0")} 일 때, 부등식 {v("2(a³ + b³) ≥ (a + b)(a² + b²)")} 이 성립함을 증명하시오.',
  [f'(좌변) − (우변) {s} 0 임을 보인다', f'(좌변) − (우변) = {v("a³ + b³ −")} {m}', f'= ( {m} )( {m} )²', f'{v("a + b")} {s} 0 , {v("(a − b)²")} {s} 0 이므로 (좌변) − (우변) ≥ 0', f'등호는 {m} 일 때 성립한다'],
  f'실수를 제곱한 값은 항상 {m}', 4, '① ≥ ② a²b − ab² ③ a + b · a − b ④ > · ≥ 👑 a = b · 💡 0 이상'),
]
body = ('<div class="how"><b>🏰 성채던전의 서술형 방 7개</b>를 ⚔ 소레이드로 풀어요(게임과 같은 숫자). ① ② … 빈칸을 채우고 → '
        '<b>✍ 서술형 답</b>을 손으로 써서 📷 찍어 올리면 통과(📜 서술 조각 +1).</div>')
ans = []
CIRC = '①②③④⑤'
for pid, rid, prob, steps, hint, lines, key in ROOMS:
    r = D[pid][rid]; n = len(r['vers'][0]); assert n == len(steps), (pid, rid, n, len(steps))
    fl = pid[-1]; no = rid[1:]; boss = r.get('boss')
    tag = (f'<b>{"👑 " if boss else ""}{fl}층 {no}</b><span class="pill">🏰 {fl}층 {no}번 방 · {r["no"]}차시 뒤 열림</span>'
           f'<span class="pill ch">⚔ 소레이드 · {n}단계</span><span class="pill ph">📷 서술형</span>')
    rows = '<br>'.join(f'{"👑" if i == n - 1 else CIRC[i]} {S}{t}' for i, t in enumerate(steps))
    body += (f'<div class="rm{" boss" if boss else ""}"><div class="tagl">{tag}</div>{prob}<div class="pf">{rows}</div>'
             f'<div class="hint">💡 근거 : {hint}</div><div class="essay"><b>✍ 서술형 답</b> <span class="mini">({r["note"]})</span>' + '<div class="ln"></div>' * lines + '</div></div>')
    v0 = r['vers'][0]
    full = ' / '.join(f'{"👑" if i == n - 1 else CIRC[i]} {it["say"]}' for i, it in enumerate(v0))
    ans.append((f'{"👑 " if boss else ""}{fl}층 {no}번 방 ({r["no"]}차시 뒤)', f'<b>{key}</b><br><span style="font-weight:400;color:#555">{full}</span>'))
bot = build(os.path.join(OUT, 'castle-chain-ws.pdf'), '🏰 성채 서술형 · 소레이드', '공통수학2 Ⅱ. 집합과 명제 · 성채던전 1 ~ 3층 서술형 방 7문항',
            '① 서술형 문제의 풀이를 단계로 나누어 쓸 수 있다. ② 근거를 넣어 풀이 과정을 끝까지 서술한다.', body, EXTRA)
assert max(bot) <= 281, bot
teacher(os.path.join(OUT, 'castle-chain-ws-teacher.pdf'), '🏰 성채 서술형 · 소레이드', '성채던전 1 ~ 3층 서술형 방 7문항', [
    '성채 서술형 방 7개의 첫 판과 같은 문제 · 같은 숫자. 풀이만 단계(졸개 → 👑 대장)로 쪼갬 — 문제 · 정답은 그대로.',
    '굵은 글씨 = 빈칸 답 · 회색 글 = 게임에서 「📜 나의 풀이」에 쌓이는 문장(= 서술형 모범 답안의 뼈대).',
    '📷 사진 채점 기준표는 지금 것 그대로(단계와 대응 = 단계표.md). 한 번 틀리면 방의 숫자가 바뀌므로 이 정답은 첫 판에만 맞음(3층 17 은 늘 같은 문제).',
], ans)
print('끝', bot)
