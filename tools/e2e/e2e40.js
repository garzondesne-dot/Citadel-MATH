// 🎨 UI 키트 · 메인 화면 (2026-11-04 · v0.9.6.29): 화면 15곳 찍기 + 가로 넘침 확인 — node tools/e2e/e2e40.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const errs = [];
  const ctx = await b.newContext({ viewport: { width: 360, height: 780 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(e.message)); p.on('dialog', (d) => d.accept());
  const over = []; const shot = async (n, full) => { await p.waitForTimeout(900); const w = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]); if (w[0] > w[1] + 1) over.push(`${n}: ${w[0]}>${w[1]}`); await p.screenshot({ path: `${OUT}/${n}.png`, fullPage: !!full }); };
  const close = async () => p.evaluate(() => { document.querySelectorAll('.modal, .bn-fight').forEach((e) => { if (e.id !== 'quiz') e.remove(); }); document.getElementById('quiz').classList.add('hidden'); document.getElementById('forge').hidden = true; document.body.classList.remove('forge-open'); });
  await p.goto(U); await p.waitForTimeout(1300);
  if (await p.isVisible('#splash').catch(() => false)) { await p.click('#splash'); await p.waitForTimeout(500); }
  await shot('01-home-student');
  const me = { c: '1-1', n: 3, name: '박도윤', hero: 0, fx: 'flame', title: 'dawn' };
  await p.evaluate(async (m) => { localStorage.setItem('citadel-tut-1-1-3', JSON.stringify({ a: 1, b: 1 })); await DS.Net.set('unlock/1-1', 5); await DS.Camp.enter(m); }, me);
  await shot('02-camp');
  await p.evaluate(() => DS.Camp.settings()); await shot('03-settings'); await close();
  await p.click('#camp-tent'); await p.waitForTimeout(800); await shot('04-shelf'); await close();
  await p.click('#camp-mail'); await p.waitForTimeout(800); await shot('05-mail'); await close();
  await p.click('#camp-castle'); await p.waitForTimeout(1200); await shot('06-dungeon');
  await p.evaluate(() => document.querySelector('[data-fight]').click()); await shot('07-fight'); await close();
  await p.evaluate((m) => DS.Camp.enter(m), me); await p.waitForTimeout(800);
  await p.click('#camp-anvil'); await p.waitForTimeout(1300); await shot('08-forge'); await close();
  await p.goto(U + '&role=teacher'); await p.waitForTimeout(1200);
  await p.fill('#f-teacher .t-id', 'e2e-teacher'); await p.fill('#f-teacher .t-pw', '909090'); await p.click('#f-teacher .t-login'); await p.waitForTimeout(1000);
  await shot('09-teacher-menu');
    const { code, hallKey } = await p.evaluate(() => DS.Act.createRoom('set-05', '1-1'));
  await p.evaluate(([c, k]) => DS.Teacher.open(c, k), [code, hallKey]); await shot('10-teacher-remote');
  await p.evaluate(() => DS.Prep.enter('set-05')); await shot('11-prep');
  await p.evaluate(() => DS.Students.enter()); await shot('12-students');
  await p.evaluate(() => DS.Dash.enter()); await shot('13-dash');
  await p.setViewportSize({ width: 1280, height: 800 });
  await p.evaluate(([c, k]) => DS.TCamp.enter({ code: c, hallKey: k }), [code, hallKey]); await shot('14-tcamp-pc');
  const c2 = await b.newContext({ viewport: { width: 1280, height: 800 } }), q = await c2.newPage(); q.on('pageerror', (e) => errs.push(e.message));
  await q.goto(U); await q.waitForTimeout(1300); if (await q.isVisible('#splash').catch(() => false)) { await q.click('#splash'); await q.waitForTimeout(500); }
  await q.screenshot({ path: `${OUT}/15-home-pc.png` });
  console.log('가로 넘침', over.length ? over : '없음'); console.log('errors', errs.length ? errs : 'none'); await b.close();
})();
