#!/usr/bin/env python3
"""🔑 입장 열쇠 · 학습지 맨 위 칸 조각 시안 (11 · 12 · 13차시 · 학생용 / 교사용)
  PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers WSLIB_DIR=<tools/worksheet> python3 gen_key_strips.py
학습지 생성기에는 strip(no) 가 돌려주는 HTML 을 학습목표 바로 아래(🔁 전시 확인 위)에 넣으면 된다."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('WSLIB_DIR', os.path.join(HERE, '..', '..', '..', '..', 'tools', 'worksheet')))
from wslib import CSS, v
from playwright.sync_api import sync_playwright
KCSS = '''
.keys { border:1.4px solid #b8860b; background:#fffaf0; border-radius:2mm; padding:1.4mm 2.6mm 1.6mm; margin:1.5mm 0 2mm 0; font-size:9.2pt; line-height:1.6; }
.keys .tt { font-weight:700; color:#7a5a00; } .keys .tt span { font-weight:400; color:#6b5a40; font-size:8.4pt; }
.keys .row { display:grid; grid-template-columns:repeat(3, 1fr); gap:0 4mm; margin-top:0.8mm; }
.keys .k { border-left:2px solid #e2c36b; padding-left:2mm; }
.keys .k b { color:#7a5a00; } .keys .o { color:#333; } .keys .ans { color:#c62828; font-weight:700; }
.keys .par { display:inline-block; min-width:9mm; border-bottom:1px solid #555; text-align:center; }
.cap { font-size:9pt; color:#555; margin:5mm 0 1mm; } .tip { font-size:8.2pt; color:#6b4a00; }
'''
def strip(no, teacher=False):
    d = json.load(open(os.path.join(HERE, f'keys-{no}.json'), encoding='utf8'))
    cells = ''
    for i, k in enumerate(d['keys']):
        it = k['vers'][0]; opts = ' &nbsp;'.join(f'{"①②③"[j]} {v(c)}' for j, c in enumerate(it['ch']))
        blank = f'<span class="par ans">{"①②③"[int(it["a"])]}</span>' if teacher else '<span class="par">&nbsp;</span>'
        extra = f'<div class="tip">💡 {k["help"]} <span style="color:#888">· {k["grade"]} · 쓰임 {", ".join(u["at"] + "-" + str(u["n"]) for u in k["uses"])}</span></div>' if teacher else ''
        cells += f'<div class="k"><b>🔑{i + 1} {k["name"]}</b><br>{v(it["q"])} {blank}<br><span class="o">{opts}</span>{extra}</div>'
    return (f'<div class="keys"><div class="tt">🔑 입장 열쇠 <span>— 수업 전 대기실에서 「🔑 열쇠 얻기」로도 풀 수 있어요 · 열쇠가 있으면 오늘 🔑 표시 문제를 한 번에 맞힐 때 🎁 보물상자</span></div>'
            f'<div class="row">{cells}</div></div>')
def pdf(name, teacher):
    body = ''.join(f'<div class="cap">({no}차시 학습지 · 학습목표 바로 아래에 붙는 칸{" · 교사용 = 정답 · 💡 · 쓰이는 칸" if teacher else ""})</div>{strip(no, teacher)}' for no in (11, 12, 13))
    html = f"<!DOCTYPE html><html><head><meta charset='utf-8'><style>{CSS}{KCSS}</style></head><body><div class='page'><h2 style='margin-top:0'>🔑 입장 열쇠 칸 시안 — {'교사용' if teacher else '학생용'}</h2>{body}</div></body></html>"
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(); pg.set_content(html); pg.wait_for_timeout(300)
        h = pg.evaluate("() => Math.max(...[...document.querySelectorAll('.keys')].map(e => e.getBoundingClientRect().height)) * 25.4 / 96")
        pg.pdf(path=os.path.join(HERE, name), format='A4', print_background=True, prefer_css_page_size=True); b.close()
    print(name, '칸 높이 최대 %.0fmm' % h)
if __name__ == '__main__':
    pdf('key-strips.pdf', False); pdf('key-strips-teacher.pdf', True)
