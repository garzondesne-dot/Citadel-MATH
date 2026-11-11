// 👩‍🏫 #98 체험판 (2026-11-11): 3차시 선물 💎 620 · 📜 8 로 🔨 10강(홀리 방패) + 내 속성 Ⅱ~Ⅳ 를 「고름」 → 💾 저장 한 번에 · 🧪 같은 창
//   사용: python3 -m http.server 8765 뒤 node tools/e2e/e2e116.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = `http://localhost:${process.env.PORT || 8765}/trial/`;
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage(); const errs = []; let ok = 0, fail = 0;
  const check = (c, m) => { if (c) ok++; else { fail++; console.log('FAIL:', m); } };
  p.on('pageerror', (e) => errs.push(e.message)); p.on('dialog', (d) => d.accept());
  await p.goto(U); await p.waitForTimeout(3500);
  await p.fill('#tp-name', '이선생'); await p.click('.tp-h1[data-h="1"]'); await p.click('[data-go="set-03"]'); await p.waitForTimeout(3500);
  await p.evaluate(async () => { const m = await DS.Account.me(); await DS.Gem.add(m, 620, 'trial_gift3', '선물', { free: true }); await DS.Gem.addScroll(m, 8, 'trial_scroll3', '선물'); });
  const srv = () => p.evaluate(async () => { const m = await DS.Account.me(); const d = await DS.Gem.mine(m); return { total: d.total, scroll: d.scroll, enh: d.enh || 0, buy: Object.keys(d.buy || {}) }; });
  const s0 = await srv();
  await p.evaluate(() => DS.Camp.settings({})); await p.waitForTimeout(1500);
  for (let i = 0; i < 10; i++) { await p.click('#enh-go'); await p.waitForTimeout(150); }
  await p.click('[data-tab="gem"]'); await p.waitForTimeout(800);
  const lad = await p.evaluate(() => [...document.querySelectorAll('.lad .lad-c')].map((x) => x.dataset.fx));
  for (const id of lad.slice(1)) { await p.click(`.lad-c[data-fx="${id}"]`); await p.waitForTimeout(200); }
  const u = await p.evaluate(() => ({ gem: (document.querySelector('.me-h .g') || {}).textContent, scr: (document.querySelector('.me-h .s') || {}).textContent, bar: (document.querySelector('#mh-bar') || {}).textContent || '', lad: [...document.querySelectorAll('.lad .lad-c')].map((x) => x.className.replace(/fxpick lad-c /, '')).join(',') }));
  await p.screenshot({ path: `${OUT}/116-trial.png` });
  check(/강화 \+0 → \+10/.test(u.bar) && /스킬 3칸/.test(u.bar) && !/-/.test(u.gem + u.scr), `고름 = 10강 + 스킬 3칸 · 남는 💎 ${u.gem} · 📜 ${u.scr} (${u.lad})`);
  await p.click('#set-ok'); await p.waitForTimeout(1500); const s1 = await srv();
  check(s1.enh === 10 && lad.slice(1).every((id) => s1.buy.includes(`fx_${id}`)) && s1.scroll === s0.scroll - 6 - 2 && s1.total <= s0.total - 430 - 180 + 220, `💾 저장 한 번 = 10강 · Ⅱ~Ⅳ (${s1.enh} · 💎 ${s0.total} → ${s1.total} · 📜 ${s1.scroll})`);
  console.log(`e2e116: 확인 ${ok} · 실패 ${fail}`, errs.length ? `errors: ${errs.join(' | ')}` : 'errors: none');
  await b.close(); process.exit(fail || errs.length ? 1 : 0);
})();
