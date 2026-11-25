# 15차시 서술형 교체 변경 PDF 한 장 (2026-11-25 · 📚 차시팩 #1) · python3 change_pdf.py <출력.pdf>
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'tools', 'worksheet'))
from wslib import CSS, v
from playwright.sync_api import sync_playwright
R = lambda t: f'<b style="color:#d32f2f">{t}</b>'
rows = [
 ('문항', '중단원 02 (118쪽) — 보기에서 일대일대응 · 항등함수 · 상수함수 찾기<br>ㄱ. y = −1 ㄴ. y = x ㄷ. y = −4x + 1 ㄹ. y = 2x² − 3',
  '중단원 10 (119쪽 · 발전 · 서술형) — X = {x | 1 ≤ x ≤ 3}, Y = {y | −1 ≤ y ≤ 5}, X 에서 Y 로의 f(x) = ax + b 가 일대일대응일 때 순서쌍 (a, b) 를 모두'),
 ('정답', '일대일대응 ㄴ, ㄷ · 항등함수 ㄴ · 상수함수 ㄱ', R('(3, −4), (−3, 8)')),
 ('⚔ 소레이드 5단계', '① 상수함수 ② 항등함수 ③ ㄹ 은 f(−1) = f(1) → 일대일 ✕ ④ 직선의 치역 = 실수 전체 👑 짝 맞추기',
  '① 양 끝끼리 대응 {f(1), f(3)} = {−1, 5} ② a > 0 일 때 맞는 식 모두 (a + b = −1, 3a + b = 5) ③ a > 0 → (3, −4) ④ a < 0 → (−3, 8) 👑 (a, b) 모두 고르기'),
 ('💡 근거 줄', '일대일대응 = 일대일함수 + 치역 = 공역', '일차함수가 일대일대응 → 정의역 양 끝이 공역 양 끝에 대응 (a < 0 이면 엇갈려)'),
 ('📸 사진 채점', '4점 · 3점 통과 (상수 · 항등 · 반례 · 일대일대응)', '4점 · 3점 통과 ① 양 끝 대응 ② a > 0 식 두 개 ③ (3, −4) ④ (−3, 8) · 한 경우만 = 최대 3점'),
 ('🔥 숫자 바꾼 판', '판 1 ~ 6 (보기 식 바꿈)', '판 1 ~ 6 (X · Y 범위 바꿈 · 판마다 (a, b) 두 개 · 독립 검산 ✔)'),
]
same = ['몬스터 1 · 2 · 개념 칸 · 형성평가 4문항 · 영상 3편 = 그대로 (보기 순서까지 v6 와 같음)',
        '🔑 열쇠 2 「제곱한 값」 = 「문제 6 · 몬스터 3」 → 「문제 6」 (새 몬스터 3 은 제곱을 쓰지 않음)',
        '👑 형성평가 4 (ㄱ ~ ㄹ 분류) 짝 links = m3 → 「」 (늘 남음 · 짝 몬스터가 없어짐)',
        '학습지 = 레이드용 v3 (몬스터 3 칸만 바뀜 · 1쪽 · 2쪽 나머지 그대로) · 칸 그림은 🔑 열쇠 칸만 다시 자름']
tr = ''.join(f'<tr><th>{a}</th><td>{v(b)}</td><td>{v(c)}</td></tr>' for a, b, c in rows)
html = f'''<!DOCTYPE html><html><head><meta charset="utf-8"><style>{CSS}
body {{ font-size:10pt; }} table.c {{ border-collapse:collapse; width:100%; margin:3mm 0; }}
table.c th, table.c td {{ border:1px solid #888; padding:2mm; vertical-align:top; line-height:1.5; }} table.c th {{ background:#e8eef7; width:22mm; }}
table.c tr:first-child td, table.c tr:first-child th {{ }} .h {{ background:#3d6aa5; color:#fff; padding:2mm 4mm; border-radius:2mm; font-size:14pt; font-weight:700; }}
</style></head><body><div class="page">
<div class="h">15차시 서술형 교체 — 변경 한 장 (2026-11-25)</div>
<p>선생님 말씀: 「15차시 레이드학습지 서술형문항 교과서에 있는거 페이지 119 서술형 10번문항으로 교체해줘」 → 몬스터 3(⚔ 소레이드 · ✍ 서술형 📸)을 교체</p>
<table class="c"><tr><th></th><th style="width:auto">옛 (v2 · 팩 v6)</th><th style="width:auto">새 (v3 · 팩 v7)</th></tr>{tr}</table>
<h3>그대로 · 같이 바뀐 것</h3><ul>{''.join(f'<li>{x}</li>' for x in same)}</ul>
<h3>검사</h3><ul><li>새 몬스터 3 판 7 × 5단계 독립 검산 ✔ (문항 글만 읽고 정수 a, b 전수로 다시 구함) · 함정 식이 a &gt; 0 해에서 성립하지 않음 ✔</li>
<li>혼자 풀림 ✔ (단계마다 문제 글 전체) · 앱 업로드 검사기 오류 0 · 알림 0 · 팩 v6 와 비교 = 몬스터 3 · 열쇠 2 · 형성평가 4 짝 말고 같음</li>
<li>학습지 글꼴 Noto · DejaVu 만 · 교사용 v3 (정답 빨강 · 나의 풀이 모범 · 채점 기준)</li></ul>
<h3>선생님 확인</h3><ol><li>새 몬스터 3 의 5단계 (① ~ 👑) 그대로 써도 될까요?</li><li>형성평가 4 짝을 비워 둠(늘 남음) — 괜찮을까요?</li></ol>
</div></body></html>'''
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); pg.set_content(html); pg.wait_for_timeout(300)
    pg.pdf(path=sys.argv[1], format='A4', print_background=True); b.close()
print(sys.argv[1])
