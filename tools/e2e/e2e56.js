// 💎 조각 상점 · 🎉 레벨업 공개 (2026-11-05 · v0.9.10) — node tools/e2e/e2e56.js <출력 폴더>
//   조각 50 → ⚙ 설정 💎 막대 · 잠긴 용사 12 누르면 해금(30) → 20 남음 · 수업 중 레벨업 → 폰 축하 + 종합상황실 「🎉 LEVEL UP!」
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = [];
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T');
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n2 이서연'); await T.click('#r-up'); await T.waitForTimeout(800);
  const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1500);
  if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(500); }
  await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
  await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200);
  await S.evaluate(() => { localStorage.setItem('citadel-tut-1-3-1', JSON.stringify({ a: true, b: true })); });
  await S.click('#s-go'); await S.waitForTimeout(2000);
  await S.evaluate(async () => { await DS.Net.update('xp/1-3/1/tut', { a: true, b: true }); await DS.Gem.add({ c: '1-3', n: 1 }, 50, 'e2e', '시험', { free: true }); });
  await S.evaluate(() => DS.Camp.back()); await S.waitForTimeout(2000);
  await S.click('#camp-set'); await S.waitForTimeout(1500);
  const bar0 = (await S.textContent('.gem-bar')).replace(/\s+/g, ' ');
  await S.screenshot({ path: `${OUT}/1-settings.png`, fullPage: true });
  await S.click('[data-h="12"]'); await S.waitForTimeout(1500);
  const bar1 = (await S.textContent('.gem-bar')).replace(/\s+/g, ' '), open12 = await S.evaluate(() => !document.querySelector('[data-h="12"]').classList.contains('lock'));
  log.push(`상점: 「${bar0.slice(0, 12)}」 → 「${bar1.slice(0, 12)}」 · 용사 12 열림 ${open12}`);
  await S.evaluate(() => document.querySelector('#set-x').click()); await S.waitForTimeout(500);
  // 수업 중 레벨업
  const { code, key } = await T.evaluate(async () => { const c = await DS.Act.createRoom('set-04', '1-3', { noLimit: true }); const code = c.code || c; return { code, key: (await DS.Net.get(`secrets/${code}`)).hallKey }; });
  const H = await mk('H'); await H.setViewportSize({ width: 1600, height: 900 });
  await H.goto(`${U}&role=hall&code=${code}&key=${key}`); await H.waitForTimeout(2500);
  await S.click('#camp-gate', { force: true }); await S.waitForTimeout(3000);
  await T.evaluate(async (code) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); await DS.Act.go(code, R, DS.Lessons.get('set-04'), 1); }, code);
  await H.waitForTimeout(2000);
  await S.evaluate(async () => { await DS.Net.set('xp/1-3/1/total', 35); await DS.Grow.add({ c: '1-3', n: 1 }, { join: 1 }, 'e2e-lv'); });
  await S.waitForTimeout(400); const full = !!(await S.$('.lvup-full'));
  await S.screenshot({ path: `${OUT}/2-phone-lvup.png` });
  await H.waitForTimeout(1200); const hl = await H.evaluate(() => (document.querySelector('.h-lvup') || {}).textContent || '');
  await H.screenshot({ path: `${OUT}/3-hall-lvup.png` });
  log.push(`레벨업: 폰 축하 ${full} · 종합상황실 「${hl.replace(/\s+/g, ' ').trim()}」`);
  const g = await S.evaluate(() => DS.Gem.mine({ c: '1-3', n: 1 }));
  const ok = /💎 50/.test(bar0) && /💎 20/.test(bar1) && open12 && full && /LEVEL UP/.test(hl) && /김민준/.test(hl) && /Lv\.2/.test(hl) && g.buy && g.buy.hero_12;
  console.log(log.join('\n')); console.log(ok ? '✅ 통과' : '❌ 기대와 다름'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (!ok || errs.length) process.exit(1);
})();
