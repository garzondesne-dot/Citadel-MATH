// 🔉 2026-11-13 선생님 「전투 중에 시연 누르거나 문제 누르면 소리 음소거나 10%로 줄이기」: 종합실 몬스터 단계 🎮 시연 · 📄 문제 창 = 소리 10% → 닫으면 원래대로 · 개념 단계 = 그대로 — node tools/e2e/e2e127.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = `http://localhost:${process.env.PORT || 8765}/index.html?local`;
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = []; let ok = 0, fail = 0;
  const check = (c, m) => { if (c) ok++; else fail++; console.log(`${c ? '✔' : '✘'} ${m}`); };
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T');
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.evaluate(() => DS.Account.uploadRoster([{ c: '1-3', n: 1, name: '김민준' }, { c: '1-3', n: 2, name: '이서연' }])); await T.waitForTimeout(600);
  await T.reload(); await T.waitForTimeout(1500); if (await T.isVisible('#splash')) { await T.click('#splash'); await T.waitForTimeout(400); }
  if (!(await T.isVisible('#lesson'))) { await T.click('.role[data-role=teacher]').catch(() => {}); await T.waitForTimeout(600); }
  await T.selectOption('#lesson', 'set-10'); await T.selectOption('#t-cls', '1-3'); await T.click('#t-new'); await T.waitForTimeout(2500);
  const code = await T.evaluate(() => DS.Teacher.code()), key = (await T.textContent('#t-key')).trim();
  const H = await mk('H'); await H.setViewportSize({ width: 1600, height: 900 }); await H.goto(`${U}&role=hall&code=${code}&key=${key}`); await H.waitForTimeout(2500);
  await T.evaluate(async (c) => { await DS.Net.set(`rooms/${c}/players/bot1`, { num: 1, nick: '학생1', hero: 1, fx: 'flame', cls: '1-3', at: Date.now() }); await DS.Net.set(`rooms/${c}/online/bot1`, true); await DS.Net.update(`rooms/${c}/state`, { solve: 0 }); }, code);
  const go = () => T.evaluate(async () => { const code = DS.Teacher.code(); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); await DS.Act.go(code, R, DS.Lessons.get(R.meta.lesson), 1); });
  const step = () => T.evaluate(async () => { const c = DS.Teacher.code(); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); const s = DS.Raid.stepOf(DS.Lessons.get(R.meta.lesson), R); return s && s.id; });
  const duck = () => H.evaluate(() => DS.Sound.ducked);
  await go(); await T.waitForTimeout(700); await go(); await T.waitForTimeout(1200); // 도입 → 개념 1
  check((await step()) === 'c1', '개념 1 단계');
  await T.evaluate((c) => DS.Act.setSheet(c, true), code); await H.waitForTimeout(1200);
  check((await duck()) === false, '개념 단계 📄 = 소리 그대로');
  await T.evaluate((c) => DS.Act.setSheet(c, false), code); await go(); await H.waitForTimeout(2500);
  check((await step()) === 'm1', '몬스터 단계 (문제 1)');
  check((await duck()) === false, '전투 = 소리 보통');
  await H.click('#h-demo'); await H.waitForTimeout(900);
  check(!!(await H.$('#h-demo-ov')) && (await duck()) === true, '🎮 시연 열기 → 소리 10%');
  await H.screenshot({ path: `${OUT}/127-demo.png` });
  await H.click('#demo-x'); await H.waitForTimeout(700);
  check(!(await H.$('#h-demo-ov')) && (await duck()) === false, '시연 닫기 → 원래대로');
  await T.evaluate((c) => DS.Act.setSheet(c, true), code); await H.waitForTimeout(1200);
  check((await duck()) === true, '📄 문제 창 → 소리 10%');
  await T.evaluate((c) => DS.Act.setSheet(c, false), code); await H.waitForTimeout(1200);
  check((await duck()) === false, '문제 창 닫기 → 원래대로');
  console.log(`e2e127: 확인 ${ok} · 실패 ${fail}`, errs.length ? `errors: ${errs.join(' | ')}` : 'errors: none'); await b.close(); process.exit(fail || errs.length ? 1 : 0);
})();
