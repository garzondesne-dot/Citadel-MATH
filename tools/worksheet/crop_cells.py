# 학습지 칸 그림 따로 자르기 (2026-11-24 · 📚 차시팩 #1 · 선생님 「열쇠 · 전시 학습 · 도입 · 개념 따로 분리 · 13차시부터」 · PACK-GUIDE 검사 16)
#   학생용 생성기가 남긴 .html 을 인쇄 모드로 열어 칸마다 상자를 재고, 그 상자만 3배 해상도로 찍음 → 한 그림에 두 칸이 붙지 않음
#   칸: key = 🔑 입장 열쇠 · review = 🔁 전시 확인 · open = 생각 열기(제목 + 내용) · c1 … = STEP n(제목 ~ 다음 제목 · 몬스터 · 메모 · 문제 앞까지) · recap = 📝 오늘 정리
#   쓰는 법: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tools/worksheet/crop_cells.py <학습지.html> <출력 폴더> <이름 앞> [c 칸 이름 …(STEP 순서)]
#   출력: <이름 앞>_<칸>.png (zip 에 넣으면 「📦 차시 팩 올리기」가 그 칸 그림으로 씀) + check_p1.png · check_p2.png (빨간 상자 눈 확인)
import sys, os, json
from playwright.sync_api import sync_playwright
html, out, pre, *cids = sys.argv[1:]
os.makedirs(out, exist_ok=True)
JS = r"""(cids) => {
  const R = (els) => { const rs = els.map(e => e.getBoundingClientRect()); return { x: Math.min(...rs.map(r => r.left)), y: Math.min(...rs.map(r => r.top)) + scrollY, r: Math.max(...rs.map(r => r.right)), b: Math.max(...rs.map(r => r.bottom)) + scrollY }; };
  const stop = (e) => e.tagName === 'H3' || ['mon', 'memo', 'q', 'pf', 'fa', 'tmemo', 'dg', 'essay', 'stampwrap', 'add'].some(c => e.classList.contains(c));
  const group = (h) => { const g = [h]; let e = h.nextElementSibling; while (e && !stop(e)) { g.push(e); e = e.nextElementSibling; } return g; };
  const out = {}; const k = document.querySelector('.keys'); if (k) out.key = R([k]);
  const rv = document.querySelector('.review'); if (rv) out.review = R([rv]);
  const hs = [...document.querySelectorAll('h3')];
  const op = hs.find(h => h.textContent.includes('생각 열기')); if (op) out.open = R(group(op));
  hs.filter(h => /^\s*STEP\s*\d/.test(h.textContent)).forEach((h, i) => { if (cids[i]) out[cids[i]] = R(group(h)); });
  const rc = hs.find(h => h.textContent.includes('오늘 정리')); if (rc) out.recap = R(group(rc));
  const pages = [...document.querySelectorAll('.page')].map(p => { const r = p.getBoundingClientRect(); return { y: r.top + scrollY, b: r.bottom + scrollY }; });
  return { cells: out, pages };
}"""
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 900, 'height': 1300}, device_scale_factor=3)
    pg.emulate_media(media='print'); pg.goto('file://' + os.path.abspath(html)); pg.wait_for_timeout(400)
    m = pg.evaluate(JS, cids)
    cells = m['cells']; names = list(cells)
    # 이웃 칸과 겹치지 않게: 여백 6px(≈1.6mm) · 같은 단의 다른 칸 경계를 넘지 않음
    PAD = 6; boxes = {}
    for n, r in cells.items():
        x0, y0, x1, y1 = r['x'] - PAD, r['y'] - PAD, r['r'] + PAD, r['b'] + PAD
        for o, q in cells.items():
            if o == n or q['r'] <= r['x'] or q['x'] >= r['r']: continue          # 다른 단
            if q['b'] <= r['y']: y0 = max(y0, (q['b'] + r['y']) / 2)
            if q['y'] >= r['b']: y1 = min(y1, (q['y'] + r['b']) / 2)
        boxes[n] = (x0, y0, x1, y1)
    for n, (x0, y0, x1, y1) in boxes.items():
        pg.screenshot(path=os.path.join(out, f'{pre}_{n}.png'), clip={'x': x0, 'y': y0, 'width': x1 - x0, 'height': y1 - y0}, full_page=True)
    # 눈 확인: 빨간 상자
    pg.evaluate("""(bx) => { for (const [n, [x0, y0, x1, y1]] of Object.entries(bx)) { const d = document.createElement('div'); d.style.cssText = `position:absolute;left:${x0}px;top:${y0}px;width:${x1-x0}px;height:${y1-y0}px;border:2px solid red;z-index:9;pointer-events:none`; const t = document.createElement('b'); t.textContent = n; t.style.cssText = 'position:absolute;right:2px;top:0;color:#fff;background:red;font:12px sans-serif;padding:0 3px'; d.appendChild(t); document.body.appendChild(d); } document.body.style.position = 'relative'; }""", boxes)
    for i, pr in enumerate(m['pages']):
        pg.set_viewport_size({'width': 900, 'height': 1300})
        pg.screenshot(path=os.path.join(out, f'check_p{i + 1}.png'), clip={'x': 0, 'y': pr['y'], 'width': 900, 'height': pr['b'] - pr['y']}, full_page=True, scale='css')
    b.close()
json.dump({n: [round(v) for v in bx] for n, bx in boxes.items()}, open(os.path.join(out, f'{pre}_cells.json'), 'w'), ensure_ascii=False)
print(pre, '칸', names)
