#!/usr/bin/env python3
"""🔑 입장 열쇠 쪽지 (11 · 12 · 13차시 · 학생용 = 차시마다 A4 한 장에 6장 · 점선대로 잘라 나눔 / 교사용 = 정답 한 장)
  PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers WSLIB_DIR=<tools/worksheet> python3 gen_key_strips.py"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('WSLIB_DIR', os.path.join(HERE, '..', '..', '..', '..', 'tools', 'worksheet')))
from wslib import CSS, v
from playwright.sync_api import sync_playwright
TITLE = {11: '대우를 이용한 증명', 12: '귀류법', 13: '절대부등식'}
KCSS = '''
@page { size:A4; margin:0; }
.sheet { width:210mm; height:297mm; padding:8mm 10mm; box-sizing:border-box; display:grid; grid-template-rows:repeat(6, 1fr); page-break-after:always; }
.slip { border-bottom:1.2px dashed #888; padding:2.2mm 1mm 2mm; display:flex; flex-direction:column; justify-content:center; font-size:9.4pt; line-height:1.55; }
.slip:last-child { border-bottom:0; }
.slip .hd2 { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:1mm; }
.slip .tt { font-weight:700; color:#7a5a00; font-size:10.4pt; } .slip .tt span { font-weight:400; color:#6b5a40; font-size:8.4pt; }
.slip .nm { font-size:8.6pt; color:#444; white-space:nowrap; }
.row { display:grid; grid-template-columns:repeat(3, 1fr); gap:0 4mm; }
.k { border-left:2px solid #e2c36b; padding-left:2mm; } .k b { color:#7a5a00; }
.par { display:inline-block; min-width:9mm; border-bottom:1px solid #555; text-align:center; } .ans { color:#c62828; font-weight:700; }
.tip { font-size:8.2pt; color:#6b4a00; } .foot { font-size:7.8pt; color:#777; margin-top:0.8mm; }
.tsheet { padding:12mm 12mm; } .tsheet .slip { border:1.2px solid #b8860b; border-radius:2mm; margin-bottom:5mm; padding:3mm; }
'''
def slip(no, teacher=False):
    d = json.load(open(os.path.join(HERE, f'keys-{no}.json'), encoding='utf8')); cells = ''
    for i, k in enumerate(d['keys']):
        it = k['vers'][0]; ox = it['type'] == 'ox'
        opts = '( ○ / × )' if ox else ' &nbsp;'.join(f'{"①②③④"[j]} {v(c)}' for j, c in enumerate(it['ch']))
        mark = {'O': '○', 'X': '×'}[it['a']] if ox else "①②③④"[int(it["a"])]
        blank = f'<span class="par ans">{mark}</span>' if teacher else '<span class="par">&nbsp;</span>'
        extra = f'<div class="tip">💡 {k["help"]}<br><span style="color:#888">{k["grade"]} · 쓰이는 칸 {", ".join(u["at"] + "-" + str(u["n"]) for u in k["uses"])}</span></div>' if teacher else ''
        cells += f'<div class="k"><b>🔑{i + 1} {k["name"]}</b><br>{v(it["q"]).replace(chr(10), '<br>')} {blank}<br>{opts}{extra}</div>'
    name = '' if teacher else '<span class="nm">(&nbsp;&nbsp;&nbsp;&nbsp;)반 (&nbsp;&nbsp;&nbsp;&nbsp;)번 이름 ______________</span>'
    foot = '' if teacher else '<div class="foot">폰 대기실의 「🔑 열쇠 얻기」로도 풀 수 있어요 · 열쇠가 있으면 오늘 🔑 표시 문제를 한 번에 맞힐 때 🎁 보물상자</div>'
    return (f'<div class="slip"><div class="hd2"><span class="tt">🔑 입장 열쇠 <span>· {no}차시 {TITLE[no]}</span></span>{name}</div>'
            f'<div class="row">{cells}</div>{foot}</div>')
def out(name, html):
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(); pg.set_content(f"<!DOCTYPE html><html><head><meta charset='utf-8'><style>{CSS}{KCSS}</style></head><body style='margin:0'>{html}</body></html>"); pg.wait_for_timeout(300)
        over = pg.evaluate("() => [...document.querySelectorAll('.slip')].filter(e => e.scrollHeight > e.clientHeight + 1).length")
        pg.pdf(path=os.path.join(HERE, name), format='A4', print_background=True, prefer_css_page_size=True); b.close()
    print(name, '넘친 쪽지', over); assert over == 0
if __name__ == '__main__':
    out('key-slips.pdf', ''.join('<div class="sheet">' + slip(no) * 6 + '</div>' for no in (11, 12, 13)))
    out('key-slips-teacher.pdf', '<div class="tsheet"><h2 style="margin-top:0">🔑 입장 열쇠 쪽지 — 교사용 정답 (판 0 · 폰의 다시 풀 판은 숫자가 달라요)</h2>' + ''.join(slip(no, True) for no in (11, 12, 13)) + '</div>')
