// 🎬 시작 화면 연출 (2026-11-04 · v0.9.6.30): 장면 찍기 + 연출 중 누르면 끝 장면 · 한 번 더 = 첫 화면 · 동작 줄이기 = 처음부터 끝 장면 — node tools/e2e/e2e41.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const errs = [], log = [];
  const page = async (opt = {}) => { const c = await b.newContext({ viewport: { width: 360, height: 780 }, ...opt }); const p = await c.newPage(); p.on('pageerror', (e) => errs.push(e.message)); return p; };
  let p = await page(); const t0 = Date.now(); await p.goto(U);
  for (const ms of [400, 1700, 2600, 4000]) { const w = ms - (Date.now() - t0); if (w > 0) await p.waitForTimeout(w); await p.screenshot({ path: `${OUT}/splash-${ms}.png` }); }
  const st = await p.evaluate(() => { const r = (s) => document.querySelector(s).getBoundingClientRect(); return { logoTop: Math.round(r('.sp-logo').top), tap: getComputedStyle(document.querySelector('.splash-tap')).opacity, border: getComputedStyle(document.querySelector('.splash-tap')).borderTopWidth, w: document.documentElement.scrollWidth }; });
  log.push(`끝 장면: 로고 위 ${st.logoTop}px · 터치 글자 보임 ${st.tap} · 테두리 ${st.border} · 가로 ${st.w}`);
  await p.click('#splash'); await p.waitForTimeout(400); log.push('끝 장면에서 누름 → 첫 화면: ' + (await p.isVisible('#screen-home')));
  p = await page(); await p.goto(U); await p.waitForTimeout(600); await p.click('#splash'); await p.waitForTimeout(200);
  log.push('연출 중 누름 → 끝 장면: ' + (await p.evaluate(() => document.getElementById('splash').classList.contains('done'))) + ' · 아직 시작 화면: ' + (await p.isVisible('#screen-splash')));
  await p.screenshot({ path: `${OUT}/splash-skip.png` });
  await p.click('#splash'); await p.waitForTimeout(400); log.push('한 번 더 → 첫 화면: ' + (await p.isVisible('#screen-home')));
  p = await page({ reducedMotion: 'reduce' }); await p.goto(U); await p.waitForTimeout(500);
  log.push('동작 줄이기 → 처음부터 끝 장면: ' + (await p.evaluate(() => document.getElementById('splash').classList.contains('done'))));
  p = await page({ viewport: { width: 1280, height: 800 } }); await p.goto(U); await p.waitForTimeout(4000); await p.screenshot({ path: `${OUT}/splash-pc.png` });
  console.log(log.join('\n')); console.log('errors', errs.length ? errs : 'none'); await b.close();
})();
