# wslib.py — 학습지 조판 엔진 (HTML+CSS → Playwright PDF). 이 파일을 그대로 복사해서 쓴다.
import re
from playwright.sync_api import sync_playwright

CSS = r"""
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
html, body { margin:0; padding:0; }
body { font-family:'Noto Sans CJK KR',sans-serif; color:#111; font-size:10.5pt; line-height:1.5; }
i.v { font-family:'DejaVu Serif','Noto Serif CJK KR',serif; font-style:italic; }
.page { width:210mm; height:297mm; padding:9mm 14mm 9mm 14mm; page-break-after:always; position:relative; overflow:hidden; }
.page:last-child { page-break-after:auto; }
.pno { position:absolute; bottom:4.5mm; left:0; right:0; text-align:center; font-size:8.5pt; color:#555; }
.hd { display:flex; border:1.5px solid #234; border-radius:4px; overflow:hidden; margin-bottom:2mm; }
.hd .l { width:36mm; border-right:1px solid #234; }
.hd .l .s { text-align:center; font-weight:700; font-size:9.6pt; padding:1mm 0; }
.hd .l .m { background:#3d6aa5; color:#fff; text-align:center; font-size:18pt; font-weight:700; padding:0.8mm 0; }
.hd .c { flex:1; text-align:center; padding:1.2mm 2mm; }
.hd .c .t { font-size:17pt; font-weight:700; letter-spacing:2px; }
.hd .c .r { font-size:9pt; margin-top:0.5mm; }
.hd .rr { width:56mm; border-left:1px solid #234; padding:1.5mm 3mm; font-size:9.4pt; }
.hd .rr div { border-bottom:1px solid #888; margin-bottom:1.3mm; padding-bottom:0.3mm; }
.goal { border-bottom:2px solid #234; padding:0 1mm 1.2mm 1mm; font-size:10pt; margin-bottom:2mm; line-height:1.55; }
.goal b { color:#2a4468; }
h3 { font-size:11.6pt; margin:2.4mm 0 1.2mm 0; padding:0.6mm 3mm; background:#3d6aa5; color:#fff; border-radius:12px; display:inline-block; }
h3.o { background:#e07b1f; }
.box { border:1.4px solid #222; padding:2mm 3mm; margin:1.5mm 0 2.2mm 0; }
.soft { background:#fff8dc; border:1px solid #d9b94a; border-radius:4px; padding:1.8mm 3mm; margin:1.5mm 0 2.2mm 0; }
.warn { background:#fdeaea; border:1px solid #d77; border-radius:4px; padding:1.8mm 3mm; margin:1.5mm 0 2.2mm 0; }
.wb { border:1.4px dashed #3d6aa5; border-radius:6px; padding:1.5mm 3mm; margin:1.5mm 0 2.2mm 0; background:#eef4fb; text-align:center; font-weight:600; }
.fa { border:2px solid #16845a; border-radius:6px; padding:1.5mm 3.5mm; margin:2.4mm 0 1mm 0; background:#f2fbf6; }
table.menu { border-collapse:collapse; width:100%; font-size:8.8pt; line-height:1.35; margin:0.5mm 0 2mm 0; }
table.menu th, table.menu td { border:1px solid #888; padding:0.8mm 1.6mm; vertical-align:middle; }
table.menu th { background:#fde9d4; }
table.menu tr.today td { background:#fff4c2; font-weight:600; }
.endrow { display:flex; gap:4mm; align-items:stretch; margin-top:2.4mm; }
.endrow .fa { flex:1; margin:0; min-width:0; }
.nw { white-space:nowrap; }
.stamp { width:40mm; height:40mm; flex:0 0 40mm; border:1.6px solid #222; border-radius:2mm; position:relative; align-self:flex-end; }
.stamp span { position:absolute; top:1.2mm; left:0; right:0; text-align:center; font-size:8.5pt; color:#555; }
.fa .tt { font-weight:700; color:#0f6642; font-size:12pt; margin-bottom:1mm; }
.bl { display:inline-block; border-bottom:1.2px solid #222; min-width:16mm; height:1.2em; vertical-align:bottom; }
.bl.s { min-width:10mm; } .bl.m { min-width:26mm; } .bl.l { min-width:38mm; } .bl.xl { min-width:55mm; }
.sq { display:inline-block; width:1.7em; height:1.5em; border:1.3px solid #222; vertical-align:middle; margin:0 1px; background:#fff; }
.ex { font-weight:700; color:#2a4468; }
table.t { border-collapse:collapse; width:100%; margin:1mm 0 2mm 0; font-size:11pt; }
table.t th, table.t td { border:1px solid #444; padding:1.2mm 2mm; vertical-align:middle; }
table.t th { background:#e8eef7; }
table.t td.h { height:9mm; }
.q { margin:1mm 0; }
.ln { display:block; border-bottom:1px dotted #777; height:7mm; margin-left:6mm; }
.mini { font-size:9pt; color:#444; }
.two { display:flex; gap:5mm; }
.two > div { flex:1; }
.cb { display:inline-block; width:3.6mm; height:3.6mm; border:1.2px solid #222; vertical-align:middle; margin:0 1mm 0 2mm; }
.th { background:#2a4468; color:#fff; padding:3mm 5mm; border-radius:4px; margin-bottom:3mm; }
.th .a { font-size:15pt; font-weight:700; } .th .b { font-size:9pt; opacity:.92; }
h2 { font-size:11.2pt; margin:3.5mm 0 1.3mm 0; padding-left:2.5mm; border-left:4px solid #3d6aa5; }
.tp { font-size:9.2pt; line-height:1.5; }
.tp ul { margin:1mm 0 1mm 4.5mm; padding:0; } .tp li { margin-bottom:0.7mm; }
table.f { border-collapse:collapse; width:100%; font-size:8.7pt; line-height:1.42; margin:1.3mm 0 2mm 0; }
table.f th, table.f td { border:1px solid #666; padding:1.1mm 1.7mm; vertical-align:top; }
table.f th { background:#dfe8f5; }
.ans { color:#b02020; font-weight:600; }
.tag { display:inline-block; background:#2e7d4f; color:#fff; font-size:8pt; padding:0 2mm; border-radius:8px; margin-left:2mm; }
body { font-size:11pt; line-height:1.6; }
.q { margin:1.8mm 0; }
.page { padding:9mm 11mm 9mm 11mm; }
.cols { display:flex; }
.col { width:50%; padding:0 3.2mm; }
.col:first-child { border-right:1.2px dashed #555; padding-left:0; }
.col:last-child { padding-right:0; }
h3 { font-size:11.8pt; margin:3mm 0 1.6mm 0; }
.box, .soft, .warn, .wb { padding:1.6mm 2.4mm; margin:1.3mm 0 2mm 0; }
table.t { font-size:10.5pt; } table.t td.h { height:10mm; }
table.menu { font-size:9pt; line-height:1.35; }
table.menu th, table.menu td { padding:0.6mm 1.2mm; }
.bl.l { min-width:32mm; } .bl.xl { min-width:44mm; }
.fa { margin:2mm 0 0 0; }
.stampwrap { display:flex; justify-content:flex-end; margin-top:3mm; }
.stamp { align-self:auto; }
.mini { font-size:9.2pt; }
.add { background:#f3ecfb; border:1.4px solid #8e5bd0; border-radius:4px; padding:1.6mm 2.4mm; margin:1.6mm 0 2mm 0; }
.addt { display:inline-block; background:#8e5bd0; color:#fff; font-size:8pt; font-weight:700; padding:0 1.6mm; border-radius:6px; margin-right:1.5mm; vertical-align:middle; }
.addc { color:#6a2fb0; }
body { font-size:10.2pt; line-height:1.5; }
.q { margin:1.2mm 0; }
h3 { margin:2mm 0 1.2mm 0; }
.box, .soft, .warn, .wb, .add { margin:1mm 0 1.5mm 0; }
table.t td.h { height:8.5mm; }
.stampwrap { margin-top:1.5mm; }
.fa .q { margin:1.1mm 0; }
.tbl { border-collapse:collapse; font-size:9.6pt; margin:1mm 0; }
.tbl td, .tbl th { border:1px solid #777; padding:0.8mm 2mm; text-align:center; }
.tbl th { background:#eef3fa; }
.add { background:#f3ecfb; border:1.4px solid #8e5bd0; border-radius:4px; padding:1.6mm 2.4mm; margin:1.6mm 0 2mm 0; }
.gtag { display:inline-block; background:#5b6475; color:#fff; font-size:7.8pt; font-weight:600; padding:0.2mm 1.6mm; border-radius:5px; margin-left:1mm; vertical-align:1px; white-space:nowrap; }
.opt { white-space:nowrap; margin-right:2.5mm; }
.sel { white-space:nowrap; }
.memo { border:1.3px dashed #8a93a6; border-radius:5px; padding:1.5mm 2.5mm; color:#6b7385; font-size:9pt; margin-top:2mm; }
"""

def v(s):
    """태그 밖 텍스트의 영문 한 글자(변수)를 이탤릭 세리프로: v("A ∪ B = {1, 2}")"""
    parts = re.split(r'(<[^>]+>|&\w+;)', s)
    return ''.join(p if (p.startswith('<') or p.startswith('&')) else
                   re.sub(r'(?<![A-Za-z])([A-Za-z])(?![A-Za-z])', r'<i class="v">\1</i>', p) for p in parts)

C = '<sup>C</sup>'                                   # 여집합 표기: v("A") + C
BL = {"s": '<span class="bl s"></span>', "m": '<span class="bl m"></span>', "l": '<span class="bl l"></span>', "xl": '<span class="bl xl"></span>'}
CB = '<span class="cb"></span>'
TAG = lambda t: f'<span class="addt">{t}</span>'     # 보라 라벨 (보강·복습)
GAME = lambda t: f'<span class="gtag">게임: {t}</span>'
OPT = lambda *xs: " ".join(f'<span class="opt">{"①②③④⑤⑥"[i]} {x}</span>' for i, x in enumerate(xs))
SEL = lambda s: f'<span class="sel">( {s} )</span>'
STAMP = '<div class="stampwrap"><div class="stamp"><span>확인 도장</span></div></div>'

def header(lesson, rng):
    return f'''<div class="hd"><div class="l"><div class="s">한국항만물류고등학교</div><div class="m" style="font-size:14pt;padding:2mm 0">공통수학2</div></div>
<div class="c"><div class="t">학 습 과 정 · {lesson}</div><div class="r">{rng}</div></div>
<div class="rr"><div>학년     반     번</div><div>이름</div></div></div>'''

def page(hd, goal, left, right, pno):
    return f'<div class="page">{hd}{goal}<div class="cols"><div class="col">{left}</div><div class="col">{right}</div></div><div class="pno">{pno}</div></div>'

def form(lesson, items, challenge, checks, game=""):
    n = len(items) + len(challenge)
    s = f'<div class="fa"><div class="tt">✔ {lesson} 형성평가 <span class="mini" style="font-weight:400">(혼자 풀기 · {n}문항)</span>{game}</div>'
    for i, it in enumerate(items, 1): s += f'<div class="q">{i}. {it}</div>'
    for j, it in enumerate(challenge, len(items) + 1): s += f'<div class="q"><b style="color:#b02020">[도전]</b> {j}. {it}</div>'
    s += f'<div class="mini" style="margin-top:1mm">맞은 개수 {BL["s"]} / {n}   어려웠던 부분<br>' + " ".join(CB + c for c in checks) + '</div></div>'
    return s

# 블록을 1쪽 왼쪽 → 1쪽 오른쪽 → 2쪽 왼쪽 → 2쪽 오른쪽 순으로 위쪽 정렬해 채운다 (제목·낱말상자는 다음 블록과 함께 넘김)
BALANCE = r"""() => {
  // 모든 블록을 위쪽부터 차례로 채움: 1쪽 왼쪽 → 1쪽 오른쪽 → 2쪽 왼쪽 → 2쪽 오른쪽 (남는 공간은 뒷장 끝으로)
  const mm = 96/25.4;
  const pages = [...document.querySelectorAll('.page')];
  if (pages.length < 2) return;
  const cols = pages.flatMap(pg => [...pg.querySelectorAll('.col')]);
  const blocks = cols.flatMap(c => [...c.children]);
  cols.forEach(c => c.innerHTML = '');
  const limitOf = col => col.closest('.page').getBoundingClientRect().top + 281*mm;
  const bottomOf = col => col.lastElementChild ? col.lastElementChild.getBoundingClientRect().bottom : 0;
  const sticky = el => el && (el.tagName == 'H3' || /\bwb\b/.test(el.className) || (el.querySelector && el.querySelector(':scope > .ex')));
  let ci = 0;
  for (const el of blocks) {
    let col = cols[ci];
    col.appendChild(el);
    while (bottomOf(col) > limitOf(col) && ci < cols.length - 1) {
      const carry = [el];
      // 소제목·낱말상자는 다음 내용과 함께 넘김
      while (col.children.length > 1 && sticky(col.children[col.children.length - 1 - (carry.length - 1) - 1])) {
        carry.unshift(col.children[col.children.length - carry.length - 1]);
      }
      ci++; col = cols[ci];
      carry.forEach(x => col.appendChild(x));
    }
  }
  // 각 단 첫 요소의 위 여백 제거
  cols.forEach(c => { if (c.firstElementChild) c.firstElementChild.style.marginTop = '0'; });
}"""

def venn(spec=None, w=150, h=96, la="A", lb="B", single=False):
    """spec: [('+'|'-', 'U'|'A'|'B'), ...] 마스크로 정확히 색칠. 예) (A∪B)ᶜ = [('+','U'),('-','A'),('-','B')]"""
    cx1, cx2, cy, r = (w/2-22, w/2+22, h/2+2, 30)
    if single: cx1 = w/2
    uid = "m%d" % abs(hash((str(spec), w, la, single)))
    s = f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg">'
    sh = {"U": f'<rect x="4" y="10" width="{w-8}" height="{h-16}"', "A": f'<circle cx="{cx1}" cy="{cy}" r="{r}"', "B": f'<circle cx="{cx2}" cy="{cy}" r="{r}"'}
    if spec:
        s += f'<defs><mask id="{uid}">' + "".join(sh[k] + f' fill="{"#fff" if op=="+" else "#000"}"/>' for op, k in spec)
        s += f'</mask></defs><rect width="{w}" height="{h}" fill="#f8c9cf" mask="url(#{uid})"/>'
    s += f'<rect x="4" y="10" width="{w-8}" height="{h-16}" fill="none" stroke="#222" stroke-width="1.3"/><text x="{w-16}" y="{h-10}" font-size="11" font-style="italic" font-family="DejaVu Serif">U</text>'
    s += f'<circle cx="{cx1}" cy="{cy}" r="{r}" fill="none" stroke="#222" stroke-width="1.3"/><text x="{cx1-r-2}" y="{cy-r+8}" font-size="11" font-style="italic" font-family="DejaVu Serif" text-anchor="end">{la}</text>'
    if not single:
        s += f'<circle cx="{cx2}" cy="{cy}" r="{r}" fill="none" stroke="#222" stroke-width="1.3"/><text x="{cx2+r+2}" y="{cy-r+8}" font-size="11" font-style="italic" font-family="DejaVu Serif">{lb}</text>'
    return s + '</svg>'

def build(out_pdf, lesson, rng, goal, body, extra_css=""):
    """body = 블록(div/h3)들을 순서대로 이은 HTML. 2쪽에 자동 배치. 각 단 아래끝(mm)을 출력: 281 넘으면 넘침."""
    h = header(lesson, rng)
    g = f'<div class="goal"><b>학습목표</b> {goal}</div>'
    pages = page(h, g, body + STAMP, "", f"- {lesson} (1/2) -") + page(h, "", "", "", f"- {lesson} (2/2) -")
    html = f"<!DOCTYPE html><html><head><meta charset='utf-8'><style>{CSS}{extra_css}</style></head><body>{pages}</body></html>"
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(); pg.set_content(html); pg.wait_for_timeout(300)
        pg.evaluate(BALANCE)
        bot = pg.evaluate("""() => [...document.querySelectorAll('.col')].map(c=>{const k=c.lastElementChild;return k?Math.round((k.getBoundingClientRect().bottom-c.closest('.page').getBoundingClientRect().top)*25.4/96):0})""")
        pg.pdf(path=out_pdf, format="A4", print_background=True, prefer_css_page_size=True); b.close()
    print("단 아래끝(mm):", bot, "← 281 이하여야 함")
    return bot

def teacher(out_pdf, lesson, rng, design, answers):
    rows = "".join(f'<tr><td>{a}</td><td class="ans">{b}</td></tr>' for a, b in answers)
    html = f'''<!DOCTYPE html><html><head><meta charset='utf-8'><style>{CSS}</style></head><body><div class="page">
<div class="th"><div class="a">{lesson} 교사용 — {rng}</div><div class="b">학생 배포 ✕</div></div>
<h2 style="margin-top:0">설계 방향 · 지도 포인트</h2><div class="tp"><ul>{"".join("<li>"+d+"</li>" for d in design)}</ul></div>
<h2>정답</h2><table class="f"><tr><th style="width:20%">문항</th><th>정답</th></tr>{rows}</table><div class="pno">― 교사용 ―</div></div></body></html>'''
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(); pg.set_content(html); pg.wait_for_timeout(300)
        pg.pdf(path=out_pdf, format="A4", print_background=True, prefer_css_page_size=True); b.close()
