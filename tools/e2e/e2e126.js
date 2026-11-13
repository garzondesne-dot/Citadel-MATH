// 👁 2026-11-13 선생님 「종합실에서도 눈빛 연출 보여줘」: 교실 PC 가 「동작 줄이기」(prefers-reduced-motion)여도 종합실 = 컷인 · 눈빛 나옴 · node tools/e2e/e2e126.js <출력 폴더>
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 720 }, reducedMotion: 'reduce' }); const errs = [];
  const T = await ctx.newPage(); T.on('dialog', (d) => d.accept()); T.on('pageerror', (e) => errs.push(e.message));
  await T.goto(`http://localhost:${process.env.PORT || 8765}/index.html?local&role=teacher`); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  const code = await T.evaluate(async () => { const c = await DS.Act.createRoom('set-10', '1-1'); return c.code || c; });
  const key = await T.evaluate(async (c) => DS.Net.get(`secrets/${c}/hallKey`), code);
  await T.evaluate(async ({ c, k }) => { await DS.Hall.enter(c, k); }, { c: code, k: key }); await T.waitForTimeout(2500);
  const r = await T.evaluate(async () => { await new Promise((ok) => setTimeout(ok, 800)); DS.Attack.cutin(2, 'flame', { gold: true }); await new Promise((ok) => setTimeout(ok, 700)); return { reduce: matchMedia('(prefers-reduced-motion: reduce)').matches, hall: document.getElementById('screen-hall').classList.contains('active'), ult: !!document.querySelector('.ult'), glint: document.querySelectorAll('.ult .u-glint').length }; });
  await T.screenshot({ path: `${process.argv[2] || '.'}/126-hall-reduce.png` });
  const ok = r.reduce && r.ult && r.glint === 2 && !errs.length; console.log(JSON.stringify(r), errs); console.log(ok ? '✅ e2e126 통과 (동작 줄이기 PC 에서도 종합실 컷인 · 눈빛 2개)' : '❌ e2e126'); await b.close(); process.exit(ok ? 0 : 1); })();
