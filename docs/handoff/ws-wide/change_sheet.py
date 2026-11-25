# 16 · 17차시 풀이 칸 넓힘 바뀐 곳 한 장 (2026-11-25 · 📚 차시팩 #1) · python3 change_sheet.py <출력.pdf> <옛16.pdf> <새16.pdf> <옛17.pdf> <새17.pdf>
import sys, os, subprocess, base64, tempfile, glob
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'tools', 'worksheet'))
from wslib import CSS
from playwright.sync_api import sync_playwright
out, *pdfs = sys.argv[1:]
tmp = tempfile.mkdtemp()
def thumbs(pdf, tag):
    subprocess.run(['pdftoppm', '-r', '28', '-png', pdf, os.path.join(tmp, tag)], check=True)
    return ''.join(f'<img src="data:image/png;base64,{base64.b64encode(open(f, "rb").read()).decode()}">' for f in sorted(glob.glob(os.path.join(tmp, tag + '-*.png'))))
rows = ''.join(f'<tr><th>{n}차시</th><td>{thumbs(pdfs[2 * i], f"o{n}")}</td><td>{thumbs(pdfs[2 * i + 1], f"n{n}")}</td></tr>' for i, n in enumerate((16, 17)))
html = f'''<!DOCTYPE html><html><head><meta charset="utf-8"><style>{CSS}
body {{ font-size:9.6pt; }} .h {{ background:#3d6aa5; color:#fff; padding:2mm 4mm; border-radius:2mm; font-size:14pt; font-weight:700; }}
table.c {{ border-collapse:collapse; width:100%; margin:2mm 0; }} table.c th, table.c td {{ border:1px solid #888; padding:1.5mm; vertical-align:top; }} table.c th {{ background:#e8eef7; }}
img {{ width:28mm; border:1px solid #bbb; margin-right:1mm; }}</style></head><body><div class="page">
<div class="h">16 · 17차시 풀이 칸 넓힘 (2026-11-25 · DECISIONS a9ef715)</div>
<p>선생님 고르기 「다음 레이드용 학습지부터 풀이 칸 넓힘 · 문항 수 그대로 · 빡빡하면 쪽 늘리기」 → 「응 · 미리 만듦」(16 · 17차시)</p>
<table class="c"><tr><th></th><th>옛 쪽 (16 v2 · 17 v1 · 2쪽)</th><th>새 쪽 (16 v3 · 17 v2 · 3쪽)</th></tr>{rows}</table>
<ul><li>문제 · 보기 · 정답 · 빈칸 · ★ · 칸 순서 = 그대로 (글자 한 자도 안 바뀜)</li>
<li>넓어진 곳: 몬스터 1 밑 「✏ 풀이」 칸 · 몬스터 2 옆 풀이 · 메모 칸 · ✍ 나의 풀이 4줄 → 8줄 · 👑 형성평가 문항마다 풀이 칸 (16차시 9 → 22 ~ 40mm · 17차시 6 → 24 ~ 40mm)</li>
<li>쪽 배치: 1쪽 = 도입 · STEP 1 · 몬스터 1 · STEP 2 / 2쪽 = 몬스터 2 · 3 (+ 17차시 STEP 3) / 3쪽 = 👑 형성평가 · 오늘 정리 · 확인 도장</li>
<li>팩 = 문제 그대로 · 칸 그림 다시 자름 (열쇠 · 전시 · 생각 열기 · STEP 1 = 같은 그림 · STEP 2 · 3 · 오늘 정리 = 같은 글 · 자리만 옮김) · 학습지 PDF 만 새 판</li>
<li>교사용 = 같은 정답 · 판서 · 채점 기준을 새 쪽에 (비공개 폴더)</li></ul></div></body></html>'''
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); pg.set_content(html); pg.wait_for_timeout(300)
    pg.pdf(path=out, format='A4', print_background=True); b.close()
print(out)
