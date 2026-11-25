# 15차시 문제 4 = 학습지 꼴 · 바뀐 곳 한 장 (2026-11-25 · 📚 차시팩 #1) · python3 change_p4.py <출력.pdf> <학습지 문제4 그림.png> <옛 판 json> <새 판 json>
import sys, os, json, base64
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'tools', 'worksheet'))
from wslib import CSS
from playwright.sync_api import sync_playwright
out, png, oldj, newj = sys.argv[1:]
img = base64.b64encode(open(png, 'rb').read()).decode()
o = json.load(open(oldj, encoding='utf8'))['monsters']['m1']['first']; n = json.load(open(newj, encoding='utf8'))['monsters']['m1']['first']
def show(it):
    ch = ''.join(f'<li{" class=ok" if i == it["answerIndex"] else ""}>{("🖼 그림 " + c.split(" @")[0][6:]) if c.startswith("graph:") else c}</li>' for i, c in enumerate(it['choices']))
    return f'<div class="qq">{it["question"]}</div><ol>{ch}</ol>'
html = f'''<!DOCTYPE html><html><head><meta charset="utf-8"><style>{CSS}
body {{ font-size:9.6pt; }} .h {{ background:#3d6aa5; color:#fff; padding:2mm 4mm; border-radius:2mm; font-size:14pt; font-weight:700; }}
table.c {{ border-collapse:collapse; width:100%; margin:2mm 0; }} table.c th, table.c td {{ border:1px solid #888; padding:2mm; vertical-align:top; }} table.c th {{ background:#e8eef7; }}
.qq {{ font-weight:600; margin-bottom:1mm; }} ol {{ margin:0; padding-left:5mm; }} li.ok {{ color:#d32f2f; font-weight:700; }} img {{ width:100%; border:1px solid #ccc; }}
</style></head><body><div class="page">
<div class="h">15차시 문제 4 = 학습지 꼴로 (팩 v8 · 2026-11-25)</div>
<p>선생님 (1-3반 수업 뒤): 「문제4번 학습지 작성한 정답이랑 보기에서 고르는거랑 완전 달라서 혼란스러움. 학습지에 맞춰. 문제 5번은 대충 잘 맞네.」 → 학습지는 그대로 · 게임을 학습지에 맞춤</p>
<table class="c"><tr><th style="width:34%">학습지 v3 답란 (그대로)</th><th style="width:33%">옛 게임 (팩 v7)</th><th style="width:33%">새 게임 (팩 v8)</th></tr>
<tr><td><img src="data:image/png;base64,{img}"><br>(1) 빈칸 4개에 <b>수</b> 3, 1, −1, −3 · (2) ( 점 4개 · <b>직선</b> · 포물선 ) 고르기</td>
<td>{show(o[0])}<hr>{show(o[1])}</td><td>{show(n[0])}<hr>{show(n[1])}</td></tr></table>
<ul><li>숫자 바꾼 판 1 ~ 6 도 같은 꼴 (함수 그대로 · 보기 = 정답 · 부호 틀림 · 거꾸로 적기) · 판 7 독립 검산 ✔ · 혼자 풀림 ✔</li>
<li>문제 5 (몬스터 1 단계 3 · 4) · 몬스터 2 · 3 · 형성평가 = 팩 v7 과 글자까지 같음 · 앱 업로드 검사기 오류 0 · 알림 0</li>
<li>학습지 PDF 는 바꾸지 않음 (레이드용 v3 그대로)</li></ul>
</div></body></html>'''
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); pg.set_content(html); pg.wait_for_timeout(300)
    pg.pdf(path=out, format='A4', print_background=True); b.close()
print(out)
