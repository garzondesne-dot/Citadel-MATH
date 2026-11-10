// 🧪 #67 시험 계정 (2026-11-11): 학생 관리 「🧪 시험 계정」 → 입장 표시 · 체력 머릿수에서 빠짐 · 교사 화면 🧪 · 대시보드 랭킹에서 빠짐 — node tools/e2e/e2e101.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1000, height: 900 } }); const errs = [], log = []; let bad = 0;
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T'); await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-6'); await T.fill('#r-text', '1 김민준\n2 이서연\n3 박도윤'); await T.click('#r-up'); await T.waitForTimeout(900);
  await T.evaluate(() => document.querySelector('[data-cls="1-6"]') && document.querySelector('[data-cls="1-6"]').click()); await T.waitForTimeout(400);
  await T.evaluate(() => document.querySelector('[data-tst="1"]').click()); await T.waitForTimeout(800);
  ok(await T.evaluate(async () => (await DS.Net.get('tester/1-6/1')) === true && /시험 계정 끄기/.test(document.querySelector('[data-tst="1"]').textContent) && !!document.querySelector('.st-tester .tst-ic')), '학생 관리: 1번 🧪 시험 계정 켜짐 · 표시');
  await T.screenshot({ path: `${OUT}/101-students.png` });
  // 수업: 1번(시험) · 2번 · 3번 입장 → 시작 → 체력 머릿수 = 2
  const code = await T.evaluate(async () => { const c = await DS.Act.createRoom('set-04', '1-6'); return c.code || c; });
  const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1200);
  await S.evaluate((c) => DS.Student.enter(c, { cls: '1-6', num: 1, nick: '민준', hero: 0, fx: 'flame' }), code); await S.waitForTimeout(1200);
  await T.evaluate(async (c) => { for (const n of [2, 3]) await DS.Net.set(`rooms/${c}/players/bot${n}`, { num: n, nick: `학생${n}`, hero: n, fx: 'flame', cls: '1-6', at: Date.now() }); }, code);
  const p1 = await T.evaluate(async (c) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); return Object.values(R.players).find((p) => p.num === 1) || {}; }, code);
  ok(p1.tester === true, '입장 기록에 🧪 표시');
  await T.evaluate(async (c) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); await DS.Act.go(c, R, DS.Lessons.get('set-04'), 1); }, code); await T.waitForTimeout(800);
  const hc = await T.evaluate(async (c) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); return { hc: DS.Raid.headcount(R), act: DS.Raid.activeIds(R).length }; }, code);
  ok(hc.hc === 2 && hc.act === 3, `체력 머릿수 = 시험 계정 빼고 2 (입장 ${hc.act}) (${JSON.stringify(hc)})`);
  ok(/🧪/.test(await T.evaluate(() => DS.Titles.nameHtml({ num: 1, nick: '민준', tester: true }, { short: true }))), '교사 · 종합실 이름 옆 🧪');
  // 대시보드: 1번 기록이 있어도 랭킹에서 빠짐
  await T.evaluate(async () => { await DS.Net.set('records/1-6/1/set-04', { no: 4, conc: { a: [5, 5] }, fixed: 9, won: true }); await DS.Net.set('records/1-6/2/set-04', { no: 4, conc: { a: [3, 5] }, fixed: 1, won: true }); await DS.Net.set('xp/1-6/1', { total: 999 }); });
  await T.evaluate(() => DS.Dash.enter()); await T.waitForTimeout(1500);
  await T.evaluate(() => { const b2 = [...document.querySelectorAll('[data-cls], select')].find((x) => x.dataset && x.dataset.cls === '1-6'); if (b2) b2.click(); }); await T.waitForTimeout(1200);
  const dash = await T.evaluate(() => (document.querySelector('.dash-main') || {}).innerText || '');
  ok(/시험 계정 1명은 랭킹 · 반 통계에서 빠졌어요/.test(dash), `대시보드 안내 (${dash.slice(0, 80).replace(/\n/g, ' ')})`);
  await T.evaluate(() => document.querySelector('[data-tab="rank"]') && document.querySelector('[data-tab="rank"]').click()); await T.waitForTimeout(800);
  const rank = await T.evaluate(() => (document.querySelector('.dash-main') || {}).innerText || '');
  ok(!/김민준|김\*준|민준/.test(rank), '랭킹에 시험 계정 없음');
  await T.screenshot({ path: `${OUT}/101-dash.png`, fullPage: true });
  console.log(log.join('\n')); console.log(bad ? `❌ ${bad}` : '✅ 통과'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad || errs.length) process.exit(1);
})();
