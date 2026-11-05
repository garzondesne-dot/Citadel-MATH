# 🏰 성채던전 2층 「명제 중단원」 변경 제안 v1 (2026-11-06 · 교과서 96~97쪽 중단원 마무리 11문항) — wslib 양식
#   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tools/worksheet/gen_eval2_prop.py <출력.pdf>
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wslib import CSS, v, C, header
from playwright.sync_api import sync_playwright

OUT = sys.argv[1] if len(sys.argv) > 1 else 'eval2-prop.pdf'
EXTRA = '''
table.p { border-collapse: collapse; width: 100%; font-size: 8.9pt; line-height: 1.4; margin: 1.5mm 0 3mm; }
table.p th, table.p td { border: 1px solid #888; padding: 1.2mm 1.6mm; vertical-align: top; }
table.p th { background: #e8eef7; text-align: center; white-space: nowrap; }
td.c { text-align: center; white-space: nowrap; } .ans { color: #b02020; font-weight: 700; }
.lk { color: #8e5bd0; font-weight: 700; } .bs { color: #b8860b; font-weight: 700; }
.page { padding: 9mm 11mm; } h2 { margin-top: 3mm; }
'''
# (번호, 교과서 원문 요약, 바꾼 첫 문제, 게임 꼴, 정답, 차시, 비고)
R = [
 ('01', '명제 찾고 참 · 거짓: √4는 유리수 / x는 100보다 큰 수 / 26은 3의 배수 / 우리나라는 아름다운 나라',
  '⑴ √9는 유리수이다. ⑵ x는 50보다 작은 수이다. ⑶ 28은 3의 배수이다. ⑷ 우리 학교는 멋진 학교이다.', '고르기 ×4 (참인 명제 · 거짓인 명제 · 명제 아님)', '참 · 명제 아님(조건) · 거짓 · 명제 아님', 7, ''),
 ('02', 'U = {x | x는 7 이하의 자연수}, p: x² − 6x + 8 = 0, q: x² − 6x + 9 > 0 의 진리집합 p · q · ~p · ~q',
  'U = {x | x는 8 이하의 자연수}, p: x² − 7x + 12 = 0, q: x² − 8x + 16 > 0', '원소 고르기 ×4', 'P = {3, 4} · Q = {1, 2, 3, 5, 6, 7, 8} · ~p = {1, 2, 5, 6, 7, 8} · ~q = {4}', 7, ''),
 ('03', '역 · 대우와 참 · 거짓: ⑴ x가 자연수이면 유리수 ⑵ x(x + 1) = 0 이면 x + 1 = 0',
  '⑴ x가 정수이면 x는 유리수이다. ⑵ x(x − 2) = 0 이면 x − 2 = 0 이다.', '역 · 대우 문장 고르기 + 참 · 거짓 (4)', '⑴ 역 거짓 · 대우 참 ⑵ 역 참 · 대우 거짓', 8, ''),
 ('04', 'p는 q이기 위한 어떤 조건: ⑴ x ≤ 1 / −3 ≤ x ≤ 0 ⑵ a = b / a² = b² ⑶ |x| ≤ 1 / −1 ≤ x ≤ 1',
  '⑴ p: x ≤ 2, q: −4 ≤ x ≤ 1 ⑵ p: a = b, q: |a| = |b| ⑶ p: |x| ≤ 2, q: −2 ≤ x ≤ 2', '고르기 ×3 (충분 · 필요 · 필요충분 · 아무것도 아님)', '필요 · 충분 · 필요충분', 9, ''),
 ('05', '부정과 참 · 거짓: ⑴ 모든 실수 x에 대하여 x² > x − 1 ⑵ 어떤 실수 x에 대하여 |3x − 2| < 0',
  '⑴ 모든 실수 x에 대하여 x² > 2x − 2 ⑵ 어떤 실수 x에 대하여 |2x − 5| < 0', '부정 고르기 + 참 · 거짓 (4)', '⑴ 어떤 x, x² ≤ 2x − 2 → 거짓 ⑵ 모든 x, |2x − 5| ≥ 0 → 참', 7, ''),
 ('06', 'p → ~q 가 참일 때 옳은 것 (보기 ㄱ~ㄹ: P ⊂ Qᶜ · P ∩ Q = Q · Pᶜ ∩ Q = Q · Pᶜ ∪ Qᶜ = U)',
  '~p → q 가 참일 때 옳은 것: ㄱ. Qᶜ ⊂ P ㄴ. P ∪ Q = U ㄷ. Pᶜ ∩ Q = Pᶜ ㄹ. P ∩ Q = ∅', '보기 모두 고르기', 'ㄱ, ㄴ, ㄷ', 8, ''),
 ('07', '서술형: p: x² − 4a² ≤ 0, q: |x − 3| ≤ 4, p → q 의 역이 참이 되는 자연수 a 의 최솟값',
  'p: x² − 9a² ≤ 0, q: |x − 2| ≤ 7 (a 는 자연수)', '숫자 (답만)', '3', 8, '<span class="lk">📷 서술형 잠금</span>'),
 ('08', 'p: x² − 10x + 9 ≤ 0, q: x ≤ a, p가 q이기 위한 충분조건이 되는 a의 범위',
  'p: x² − 8x + 7 ≤ 0, q: x ≤ a → a 의 최솟값', '숫자', '7 (a ≥ 7)', 9, ''),
 ('09', 'p → q, ~r → ~q 가 참일 때 항상 참인 명제 (보기 ㄱ~ㄹ)',
  'p → ~q, r → q 가 참일 때: ㄱ. q → ~p ㄴ. ~q → ~r ㄷ. r → ~p ㄹ. ~p → q', '보기 모두 고르기', 'ㄱ, ㄴ, ㄷ', 8, ''),
 ('10', '서술형 발전: p: ax² + 2x − 4 ≥ 0, q: x² + 2bx + 25 > 0, (가) 어떤 x에 대하여 p (나) ~p는 q이기 위한 충분조건 — 모두 거짓, M + m',
  'p: ax² + 4x − 2 ≥ 0, q: x² + 2bx + 16 > 0 (정수 a 최댓값 M, 자연수 b 최솟값 m)', '숫자 (답만)', '1 (M = −3, m = 4)', 9, '<span class="lk">📷 서술형 잠금</span>'),
 ('11', '발전: 2x² + y² − 4x + 25 / (x² + y² + 1) 의 최솟값',
  '2x² + y² − 2x + 9 / (x² + y² + 1) 의 최솟값', '숫자', '4 (x = 1, y² = 1)', 10, '<span class="bs">👑 보스 방</span>'),
]

row = lambda n, o, c, g, a, no, e: (f'<tr><td class="c"><b>{n}</b></td><td>{v(o)}</td><td>{v(c)}</td><td>{g}</td><td class="ans">{v(a)}</td><td class="c">{no}</td><td class="c">{e}</td></tr>')
TH = '<tr><th>번호</th><th>교과서 원문 (요약)</th><th>바꾼 첫 문제</th><th>게임 꼴</th><th>정답</th><th>차시</th><th>비고</th></tr>'
rows1 = ''.join(row(*r) for r in R[:5]); rows2 = ''.join(row(*r) for r in R[5:])
hd = header('성채 2층', '성채던전 2층 「명제 중단원」 변경 제안 v1 · 교과서 96~97쪽 중단원 마무리 11문항 · 2026-11-06')
p1 = f'''<div class="page">{hd}
<h2>1. 층 다시 짜기</h2>
<table class="p"><tr><th>층</th><th>내용</th><th>방</th><th>👑 보스 방 · 호칭</th><th>열림</th></tr>
<tr><td class="c">1층</td><td>집합 중단원 (그대로)</td><td class="c">12</td><td>12번 · 집합의 지배자</td><td>진도대로 (2~6차시)</td></tr>
<tr><td class="c"><b>2층 (새)</b></td><td><b>명제 중단원</b> (교과서 96~97쪽)</td><td class="c">11</td><td>11번 · <b>호칭 제안: 「논리의 탐정」</b></td><td>진도대로 (7~10차시)</td></tr>
<tr><td class="c">3층 (옮김)</td><td>집합과 명제 대단원 (지금 2층 → 3층 · 문제 · 학생 기록 그대로)</td><td class="c">17</td><td>17번 · 명제의 군주</td><td>🔒 기본 잠김 (선생님이 열기)</td></tr></table>
<ul class="mini"><li>층 포털 메뉴 = 🌀 1층 · 2층 · 3층 · 2층도 1 · 3층처럼 선생님이 🔓/🔒 할 수 있음 (기본 = 열림 · 진도가 안 나간 방은 원래 잠김)</li>
<li>🟪 인장: 층마다 1개 → 2층 보스 처치 = 인장 1개 더 (2~10차시 9 + 성채 3층 = 최대 12개)</li>
<li>교과서 숫자를 그대로 쓰지 않음 (1층 · 대단원과 같은 원칙): 첫 시도 = 아래 「바꾼 문제」 · 재도전 = 숫자 · 보기를 또 바꿈 · 서술형 07 · 10 은 📷 사진 분석 전까지 잠금 (답만 칸은 준비)</li>
<li>보스 방 11 = 열린 방(보스 빼고)의 60% 처치하면 열림 · 10차시(절대부등식) 진도 뒤</li></ul>
<h2>2. 방 11개 — 바꾼 첫 문제 · 정답 (직접 풀어 검산 · 구현 때 독립 검산 시험)</h2>
<table class="p">{TH}{rows1}</table>
<div class="pno">- 변경 제안 v1 (1/2) -</div></div>
<div class="page">{hd}
<table class="p">{TH}{rows2}</table>
<p class="mini">차시 = 그 문항을 풀 수 있는 차시 (7 명제와 조건 · 부정 · 진리집합 · 모든/어떤 / 8 참 · 거짓 · 역과 대우 / 9 충분 · 필요조건 / 10 귀류법 · 절대부등식). 우리 반이 그 차시 수업을 열면 방이 열립니다.</p>
<div class="pno">- 변경 제안 v1 (2/2) -</div></div>'''
html = f"<!DOCTYPE html><html><head><meta charset='utf-8'><title>성채 2층 명제 중단원 변경 제안 v1</title><style>{CSS}{EXTRA}</style></head><body>{p1}</body></html>"
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); pg.set_content(html); pg.wait_for_timeout(300)
    h = pg.evaluate("() => [...document.querySelectorAll('.page')].map((e) => Math.round(e.scrollHeight * 25.4 / 96))")
    pg.pdf(path=OUT, format='A4', print_background=True, prefer_css_page_size=True); b.close()
print('쪽 높이(mm):', h, '→', OUT)
