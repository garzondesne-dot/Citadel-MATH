"""🏰 성채 층별 학습지: 1층 2쪽 · 2층 2쪽 · 3층 4쪽 이내 · 서술형 = 소레이드(제자리) · 01~04 칸 작게 · 서술형 최대 · 나머지 넉넉(자동)"""
import sys, contextlib, io, json
sys.argv = ['gen_merge.py', 'out']
exec(open('gen_merge.py').read().split("if __name__")[0])
import wslib
from wslib import header, page, CSS, BALANCE, STAMP
from playwright.sync_api import sync_playwright
def OPTS(*xs, per=1):
    rows = [xs[i:i+per] for i in range(0, len(xs), per)]
    return '<div class="sub">' + '<br>'.join(' &nbsp;&nbsp; '.join(r) for r in rows) + '</div>'
F3 = [
 ('q01', '다음에서 집합인 것은? ' + OPTS('① 노래를 잘 부르는 사람의 모임', '② 귀여운 동물의 모임', '③ 빠른 자동차의 모임', '④ 우리 반에서 안경을 쓴 학생의 모임', '⑤ 맛있는 음식의 모임'), 0, '④', '대상이 분명하게 정해지는 모임'),
 ('q02', f'집합 {v("A = {x | x는 12의 약수}")} 에 대하여 다음에서 옳은 것은? ' + OPTS(f'① {v("8 ∈ A")}', f'② {v("{12} ⊂ A")}', f'③ {v("{2, 4, 8} ⊂ A")}', f'④ {v("{2, 3} ∈ A")}', f'⑤ {v("A = {1, 2, 3, 4, 6}")}', per=3), 0, '②', 'A = {1, 2, 3, 4, 6, 12}'),
 ('q03', f'자연수 {v("a")}와 {v("b")}에 대하여 두 집합 {v("A = {3, a² − 4a}")}, {v("B = {−4, b² − 2b}")} 가 서로 같을 때, {v("a + b")} 의 값을 구하시오.', 8, '5', 'a² − 4a = −4 → a = 2 · b² − 2b = 3 → b = 3'),
 ('q04', f'두 집합 {v("A = {x | x² − 5x + 6 = 0}")}, {v("B = {x | x는 12의 약수}")} 에 대하여 {v("A ⊂ X ⊂ B")} 를 만족시키는 집합 {v("X")}의 개수를 구하시오.', 8, '16', 'A = {2, 3} · B 의 나머지 원소 4개 → 2⁴'),
 ('q05', f'자연수 {v("n")}에 대하여 {v("A")}<sub>{v("n")}</sub> = {v("{x | x는 √(9n) 이하의 홀수}")} 일 때, {v("A")}<sub>{v("n")}</sub> ⊂ {v("A")}<sub>25</sub> 를 만족시키는 {v("n")}의 최댓값을 구하시오.', 1, '32', 'A₂₅ = {1, 3, …, 15} → √(9n) < 17 → 9n < 289'),
 ('q06', f'전체집합 {v("U = {1, 2, 3, …, 12}")} 의 세 부분집합 {v("A")}, {v("B")}, {v("C")}에 대하여 {v("A ∪ B = {x | x는 2의 배수}")}, {v("A ∪ C = {x | x는 12의 약수}")} 일 때, {v("A ∪ (B ∩ C)")} 의 모든 원소의 합을 구하시오.', 1, '24', '분배법칙 → (A ∪ B) ∩ (A ∪ C) = {2, 4, 6, 12}'),
 ('q07', f'전체집합 {v("U")}의 두 부분집합 {v("A")}와 {v("B")}에 대하여 {v("n(A")}{C} ∩ {v("B) = 8")}, {v("n(A ∩ B) = 5")}, {v("n(A ∪ B) = 25")} 일 때, {v("n(A − B)")} 를 구하시오.', 1, '12', 'n(A − B) = 25 − 8 − 5'),
 ('q08', f'전체집합 {v("U")}에 대하여 두 조건 {v("p")}, {v("q")}의 진리집합을 각각 {v("P")}, {v("Q")}라 할 때, 다음에서 옳지 <u>않은</u> 것은? ' + OPTS(f'① {v("~q")} 의 진리집합은 {v("Q")}{C} 이다.', f'② {v("P ⊂ Q")} 이면 명제 {v("q → p")} 는 참이다.', f'③ 명제 {v("q → p")} 가 참이면 {v("P")}{C} ⊂ {v("Q")}{C} 이다.', f'④ {v("Q ≠ U")} 이면 「모든 {v("x")}에 대하여 {v("q")}이다.」는 거짓이다.', f'⑤ {v("Q ≠ ∅")} 이면 「어떤 {v("x")}에 대하여 {v("q")}이다.」는 참이다.'), 1, '②', 'P ⊂ Q 이면 p → q 가 참'),
 ('q09', f'명제 「모든 양수 {v("x")}에 대하여 {v("2x − a + 3 > 0")} 이다.」가 참이 되도록 하는 자연수 {v("a")}의 값을 모두 구하시오.', 1, '1, 2, 3', 'x → 0 일 때도 성립 → 3 − a ≥ 0'),
 ('q10', f'명제 {v("p → ~q")} 의 역이 참일 때, 다음에서 항상 참인 것은? ' + OPTS(f'① {v("p → q")}', f'② {v("~p → q")}', f'③ {v("q → p")}', f'④ {v("~q → ~p")}', f'⑤ {v("q → ~p")}', per=5), 1, '②', '역 ~q → p 의 대우 = ~p → q'),
 ('q11', f'실수 {v("x")}에 대하여 두 조건 {v("p")}: {v("(x − a + 5)(x + 2a − 14) = 0")}, {v("q")}: {v("x(x − 2a) ≤ 0")} 일 때, {v("p")}가 {v("q")}이기 위한 충분조건이 되도록 하는 모든 정수 {v("a")}의 값의 합을 구하시오.', 1, '18', 'P = {a − 5, 14 − 2a} ⊂ Q = [0, 2a] → 5 ≤ a ≤ 7'),
 ('q12', f'전체집합 {v("U")}에 대하여 세 조건 {v("p")}, {v("q")}, {v("r")}의 진리집합을 각각 {v("P")}, {v("Q")}, {v("R")}이라 하자. {v("Q ⊂ R")}, {v("P ∩ R = ∅")}, {v("P ∪ R = U")} 일 때, 다음에서 옳은 것은? ' + OPTS(f'① {v("p")}는 {v("q")}이기 위한 충분조건이다.', f'② {v("q")}는 {v("r")}이기 위한 필요조건이다.', f'③ {v("~p")}는 {v("q")}이기 위한 필요조건이다.', f'④ {v("r")}은 {v("p")}이기 위한 충분조건이다.', f'⑤ {v("~r")}은 {v("~q")}이기 위한 필요조건이다.'), 1, '③', 'R = Pᶜ · Q ⊂ R = Pᶜ'),
 ('q13', f'실수 {v("a")}와 {v("b")}에 대하여 세 조건 {v("p")}: {v("a² + b² = 0")}, {v("q")}: {v("|a + b| = |a| + |b|")}, {v("r")}: {v("ab ≥ 0")} 일 때, 옳은 것을 모두 고르시오. (&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)' + OPTS(f'ㄱ. {v("p")}는 {v("q")}이기 위한 충분조건이다.', f'ㄴ. {v("~r")}은 {v("~p")}이기 위한 충분조건이다.', f'ㄷ. {v("r")}은 {v("p")}이기 위한 충분조건이다.'), 1, 'ㄱ, ㄴ', 'p: a = b = 0 · q ⇔ r (ab ≥ 0)'),
 ('q14', f'{v("x > 0")} 이고 {v("y > 0")} 일 때, {v("(x + 4/y)(1/x + 9y)")} 의 최솟값을 구하시오.', 1, '49', '전개 = 37 + 9xy + 4/(xy) ≥ 37 + 12'),
]
def build_n(out, n, lesson, rng, goal, body, extra):
    h = header(lesson, rng); g = f'<div class="goal"><b>학습목표</b> {goal}</div>'
    pages = page(h, g, body, "", f"- {lesson} (1/{n}) -") + ''.join(page(h, "", "", "", f"- {lesson} ({i}/{n}) -") for i in range(2, n + 1))
    html = f"<!DOCTYPE html><html><head><meta charset='utf-8'><style>{CSS}{extra}</style></head><body>{pages}</body></html>"
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(); pg.set_content(html); pg.wait_for_timeout(300)
        pg.evaluate(BALANCE.replace('if (pages.length < 2) return;', ''))
        bot = pg.evaluate("""() => [...document.querySelectorAll('.col')].map(c=>{const k=c.lastElementChild;return k?Math.round((k.getBoundingClientRect().bottom-c.closest('.page').getBoundingClientRect().top)*25.4/96):0})""")
        pg.pdf(path=out, format="A4", print_background=True, prefer_css_page_size=True); b.close()
    return bot
HOW = lambda fl: (f'<div class="how"><b>🏰 성채던전 {fl}층과 같은 문제 · 같은 숫자</b>예요. 먼저 여기에 풀고, 캠프 → 🏰 성채던전 {fl}층의 그 방에서 답을 넣어 보세요. '
                  '꼬리표의 차시 수업을 하면 방이 열려요. 한 번 틀리면 방의 숫자가 바뀌어요. '
                  '<span class="pill ph">📷 서술형</span> = ⚔ 소레이드 빈칸을 채우고 ✍ 서술형 답을 손으로 써서 📷 찍어 올리면 통과(📜 서술 조각 +1).</div>')
def floor3_blocks(E, M, S):
    pk = json.load(open(f'{PACK}/eval-3.json', encoding='utf8')); rooms = {r['id']: r for r in pk['rooms']}
    out = []
    for rid, html, kind, a, sol in F3:
        r = rooms[rid]; no = rid[1:]
        tag = f'<b>{no}</b><span class="pill">🏰 3층 {no}번 방 · {r["no"]}차시 뒤 열림</span>'
        h = 0 if kind == 0 else (E if rid in EASY else M)
        work = f'<div class="wk" style="height:{h}mm">✏ 풀이</div>' if h else ''
        out.append(f'<div class="rm"><div class="tagl">{tag}</div>{html}{work}</div>')
    out += [chain_block(3, r, S) for r in ('q15', 'q16', 'q17')]
    return out
def body(fl, E, M, S):
    if fl == 1: b = floor_blocks(1, W.F1, E, M, S)[1:]
    elif fl == 2: b = floor_blocks(2, W.F2, E, M, S)[1:]
    else: b = floor3_blocks(E, M, S)
    return HOW(fl) + ''.join(b)
INFO = {1: ('🏰 성채 1층 · 집합', '공통수학2 Ⅱ-1. 집합 중단원 · 성채던전 1층과 같은 문제 (12문항)', 2, '집합'),
        2: ('🏰 성채 2층 · 명제', '공통수학2 Ⅱ-2. 명제 중단원 · 성채던전 2층과 같은 문제 (11문항)', 2, '명제'),
        3: ('🏰 성채 3층 · 대단원', '공통수학2 Ⅱ. 집합과 명제 대단원 · 성채 3층 (17문항)', 4, '집합과 명제')}
def mk(fl, E, M, S, out):
    t, rng, n, nm = INFO[fl]
    goal = f'① {nm} 단원의 문제를 스스로 풀어 본다. ② 서술형은 소레이드 단계로 나누어 풀이를 끝까지 쓴다.'
    with contextlib.redirect_stdout(io.StringIO()):
        return build_n(out, n, t, rng, goal, body(fl, E, M, S), EXTRA)
for fl in (1, 2, 3):
    E = 4; M = 8; S = 12
    ok = lambda b: max(b) <= 281
    b = mk(fl, E, M, S, 'out/_t.pdf')
    if not ok(b): print(fl, '기본도 넘침', b); continue
    while M < 22 and ok(mk(fl, E, M + 2, S, 'out/_t.pdf')): M += 2   # 나머지 = 넉넉(22 mm 까지)
    while ok(mk(fl, E, M, S + 6, 'out/_t.pdf')): S += 6                # 서술형 = 최대
    while M < 30 and ok(mk(fl, E, M + 2, S, 'out/_t.pdf')): M += 2   # 남으면 나머지에 조금 더
    b = mk(fl, E, M, S, f'out/성채{fl}층.pdf')
    print(fl, '층 · 쉬움', E, '나머지', M, '서술형', S, b)
# 교사용: 층 정답표 + 서술형 소레이드 교사용
import pypdf
CHT = '/home/user/hv2/docs/handoff/design/castle-chain/castle-chain-ws-teacher.pdf'
pk3 = {r['id']: r for r in json.load(open(f'{PACK}/eval-3.json', encoding='utf8'))['rooms']}
ans3 = [(f'{rid[1:]} · 3층 {rid[1:]}번 방 ({pk3[rid]["no"]}차시 뒤)', f'<b>{a}</b><br><span style="font-weight:400;color:#555">{sol}</span>') for rid, h, k, a, sol in F3]
ans3 += [('15 · 16 · 👑 17 📷 서술형', '<b>15 = 3 · 16 · 17 = 증명</b><br><span style="font-weight:400;color:#555">단계 답 = 뒤쪽 「성채 서술형 · 소레이드 교사용」</span>')]
with contextlib.redirect_stdout(io.StringIO()):
    wslib.teacher('out/_t3.pdf', '🏰 성채 3층 · 대단원', '성채던전 3층 17방', [
        '🏰 성채던전 3층 17방의 첫 판과 같은 문제 · 같은 숫자. 학생에게 나눠 주는 용도.',
        '방 번호 = 문항 번호 · 꼬리표의 차시 수업을 하면 그 방이 열림 · 👑 17 은 열린 방의 60%를 처치하면 열림.',
        '한 번 틀리면 방의 숫자가 바뀜 → 이 정답은 첫 판에만 맞음. 📷 15 · 16 · 17 은 풀이를 사진으로 내면 AI 가 채점.'], ans3)
D = '/home/user/hv2/docs/handoff/design/castle-ws'
for fl, first in ((1, f'{D}/castle-ws-1-set-teacher.pdf'), (2, f'{D}/castle-ws-2-prop-teacher.pdf'), (3, 'out/_t3.pdf')):
    w = pypdf.PdfWriter()
    for f in (first, CHT):
        for pg in pypdf.PdfReader(f).pages: w.add_page(pg)
    w.write(f'out/성채{fl}층_교사용.pdf')
print('교사용 끝')
