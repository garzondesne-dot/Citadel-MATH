// 문제 칸 위치 재기: key = 시작 요소 글자의 앞부분. 시작 요소부터 다음 '문제 n)' · pill · pur · 형성평가 전까지
const { chromium } = require('playwright');
(async () => {
  const [file, mapJson] = process.argv.slice(2), map = JSON.parse(mapJson);
  const b = await chromium.launch(); const p = await b.newPage();
  const MM = 96 / 25.4; await p.setViewportSize({ width: Math.round(190 * MM), height: 1200 });
  await p.goto('file://' + file); await p.emulateMedia({ media: 'print' });
  const out = await p.evaluate(({ map, MM }) => {
    const pages = [...document.querySelectorAll('.page')], res = {};
    const kids = [...document.querySelectorAll('.col > *')];
    const isStart = (el) => /^\s*✏/.test(el.textContent) || /^\s*문제\s*\d+(-\d+)?\)/.test(el.textContent) || el.classList.contains('pur') || !!el.querySelector('.pill') || !!el.querySelector('.h.grnc') || el.classList.contains('box') && false;
    for (const [id, key] of Object.entries(map)) {
      const start = kids.find((el) => el.textContent.replace(/\s+/g, ' ').trim().startsWith(key));
      if (!start) { res[id] = null; continue; }
      const els = [start]; let n = start.nextElementSibling;
      const single = start.classList.contains('pur') || !!start.querySelector('.h.grnc');
      if (start.querySelector('.h.grnc') || start.closest('.col').lastElementChild === start) { /* 형성평가: 그 요소 하나 */ }
      while (!single && n && !isStart(n)) { els.push(n); n = n.nextElementSibling; }
      const col = start.parentElement, page = col.closest('.page'), pr = page.getBoundingClientRect(), cr = col.getBoundingClientRect();
      const top = Math.min(...els.map((e) => e.getBoundingClientRect().top)), bot = Math.max(...els.map((e) => e.getBoundingClientRect().bottom));
      const pad = 4, W = 210 * MM, H = 297 * MM, off = 10 * MM, r4 = (v) => Math.round(v * 1e4) / 1e4;
      res[id] = [{ p: pages.indexOf(page) + 1, x: r4((off + cr.left - pr.left - pad) / W), y: r4((off + top - pr.top - pad) / H), w: r4((cr.width + 2 * pad) / W), h: r4((bot - top + 2 * pad) / H) }];
    }
    return res;
  }, { map, MM });
  console.log(JSON.stringify(out)); await b.close();
})();
