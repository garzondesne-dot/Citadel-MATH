// 🪟 경험 통일 (2026-11-04): 화면 14곳 윗부분 (뒤로 · ✕ 자리) + 긴 창을 끝까지 내려도 ✕ 가 보이는지 — node tools/e2e/e2e39.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 360, height: 780 } }); const errs = [], log = [];
  const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(e.message)); p.on('dialog', (d) => d.accept());
  const shot = async (n) => { await p.waitForTimeout(900); await p.screenshot({ path: `${OUT}/${n}.png`, clip: { x: 0, y: 0, width: 360, height: 300 } }); };
  const close = async () => p.evaluate(() => { document.querySelectorAll('.modal, .bn-fight').forEach((e) => { if (e.id !== 'quiz') e.remove(); }); document.getElementById('quiz').classList.add('hidden'); document.getElementById('forge').hidden = true; document.body.classList.remove('forge-open'); });
  const xCheck = async (name) => {
    const r = await p.evaluate(() => { const m = [...document.querySelectorAll('.modal')].filter((e) => e.id !== 'quiz').pop(); if (!m) return 'no-modal'; const box = m.querySelector('.quiz-box, .framed'); box.scrollTop = box.scrollHeight; const x = m.querySelector('.ui-x'); if (!x) return 'no-x'; const a = x.getBoundingClientRect(), bb = box.getBoundingClientRect(); return a.top >= bb.top - 2 && a.bottom <= bb.bottom + 2 && a.top < bb.top + 80 /* 창 맨 위 (짧은 창은 화면 가운데라 200 넘을 수 있음) */ ? 'x 보임' : `x 사라짐 (${Math.round(a.top)})`; });
    log.push(`${name}: ${r}`);
  };
  await p.goto(U); await p.waitForTimeout(1200);
  const me = { c: '1-1', n: 3, name: '박도윤', hero: 0, fx: 'flame', title: 'dawn' };
  await p.evaluate(async (m) => { localStorage.setItem('citadel-tut-1-1-3', JSON.stringify({ a: 1, b: 1 })); await DS.Net.set('unlock/1-1', 5); await DS.Camp.enter(m); }, me);
  await shot('01-camp');
  await p.evaluate(() => DS.Camp.settings()); await p.waitForTimeout(800); await shot('02-settings'); await xCheck('설정'); await p.screenshot({ path: `${OUT}/02b-settings-scrolled.png` });
  await p.click('.hpick:not(.lock) >> nth=1'); await p.waitForTimeout(400); log.push('설정 다시 그린 뒤 ✕: ' + (await p.locator('.modal .ui-x').count()) + ' · 저장 아래 고정: ' + (await p.locator('.modal .ui-foot #set-ok').count()));
  await close();
  await p.click('#camp-tent'); await p.waitForTimeout(1200); await shot('03-shelf'); await xCheck('책장'); await close();
  await p.click('#camp-mail'); await p.waitForTimeout(1200); await shot('04-mail'); await xCheck('우편함');
  await p.mouse.click(5, 775); await p.waitForTimeout(500); log.push('바깥 눌러 닫힘: ' + ((await p.locator('.modal.camp-modal').count()) === 0)); await close();
  await p.click('#camp-castle'); await p.waitForTimeout(1500); await shot('05-dungeon');
  await p.evaluate(() => { const pt = document.querySelector('.cs-portal[data-floor="eval-1"]'); if (pt) pt.click(); }); await p.waitForTimeout(400); /* 2026-11-06: 🏰 성채 포털 메뉴 → 1층 */ await p.evaluate(() => document.querySelector('[data-fight]').click()); await shot('06-dungeon-fight'); await close();
  await p.evaluate((m) => DS.Bonus.enter(m, { train: true }), me); await shot('07-dummy');
  await p.evaluate((m) => DS.Camp.enter(m), me); await p.waitForTimeout(800);
  await p.click('#camp-anvil'); await p.waitForTimeout(1500); await shot('08-forge'); await close();
  await p.goto(U + '&role=teacher'); await p.waitForTimeout(1200);
  await p.fill('#f-teacher .t-id', 'e2e-teacher'); await p.fill('#f-teacher .t-pw', '909090'); await p.click('#f-teacher .t-login'); await p.waitForTimeout(1000);
  await shot('09-teacher-menu');
  const { code, hallKey } = await p.evaluate(() => DS.Act.createRoom('set-05', '1-1'));
  await p.evaluate(([c, k]) => DS.Teacher.open(c, k), [code, hallKey]); await shot('10-teacher-remote');
  await p.evaluate(([c, k]) => DS.TCamp.enter({ code: c, hallKey: k }), [code, hallKey]); await shot('11-tcamp');
  await p.evaluate(() => DS.Prep.enter('set-05')); await shot('12-prep');
  await p.evaluate(() => DS.Students.enter()); await shot('13-students');
  await p.evaluate(() => DS.Dash.enter()); await shot('14-dash');
  console.log(log.join('\n')); console.log('errors', errs.length ? errs : 'none'); await b.close();
})();
