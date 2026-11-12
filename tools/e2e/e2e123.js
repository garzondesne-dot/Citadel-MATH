// 🧪 #122 베타 반 (2026-11-12): 학생 관리 「🧪 이 반을 베타 반으로」 → 반 칩 🧪 · 수업 반 고르기 🧪 · 대시보드 「전체」에서 1-6 빠짐 · 1-6 칩 = 그 반 기록 보임 · 입장하면 🧪 시험 계정(체력 머릿수 빠짐) — node tools/e2e/e2e123.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = `http://localhost:${process.env.PORT || 8765}/index.html?local`;
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1000, height: 900 } }); const errs = [], log = []; let bad = 0;
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  const T = await ctx.newPage(); T.on('pageerror', (e) => errs.push(e.message)); T.on('dialog', (d) => d.accept());
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500);
  await T.evaluate(() => DS.Account.uploadRoster([{ c: '1-1', n: 1, name: '가나' }, { c: '1-1', n: 2, name: '다라' }, { c: '1-6', n: 1, name: '김민준' }, { c: '1-6', n: 2, name: '이서연' }, { c: '1-6', n: 3, name: '박도윤' }])); await T.waitForTimeout(900);
  await T.evaluate(() => document.querySelector('[data-cls="1-6"]').click()); await T.waitForTimeout(400);
  ok(/이 반을 베타 반으로/.test(await T.textContent('[data-beta]')), '학생 관리: 「🧪 이 반을 베타 반으로」 단추');
  await T.click('[data-beta]'); await T.waitForTimeout(900);
  ok(await T.evaluate(async () => (await DS.Net.get('tester/1-6/_all')) === true), '켜면 tester/1-6/_all = true');
  const ih = (sel) => T.evaluate((q) => (document.querySelector(q) || {}).innerHTML || '', sel); // 이모지는 그림으로 바뀌므로 innerHTML 로 확인
  ok(/🧪|data-ic="potion"/.test(await ih('#sm-body [data-cls="1-6"]')) && !/🧪|data-ic="potion"/.test(await ih('#sm-body [data-cls="1-1"]')) && /베타 반 끄기/.test(await T.textContent('[data-beta]')), '반 칩 1-6 에만 🧪 · 끄기 단추');
  await T.screenshot({ path: `${OUT}/123-students.png` });
  // 기록 · 설문 · 대항전
  await T.evaluate(async () => {
    await DS.Net.set('records/1-1/1/set-04', { no: 4, conc: { a: [3, 5] }, fixed: 1, won: true }); await DS.Net.set('records/1-6/1/set-04', { no: 4, conc: { a: [5, 5] }, fixed: 9, won: true });
    await DS.Net.set('xp/1-6/1', { total: 999 }); await DS.Net.set('xp/1-1/1', { total: 10 });
  });
  await T.evaluate(() => DS.Dash.enter()); await T.waitForTimeout(1500);
  await T.evaluate(() => document.querySelector('#dash-body [data-cls="*"]').click()); await T.waitForTimeout(1500);
  const allTxt = await T.evaluate(() => (document.querySelector('#dash-body') || {}).innerText || '');
  ok(/베타 반 1-6 은 빠졌어요/.test(allTxt), '대시보드 「전체」 안내 = 베타 반 1-6 빠짐');
  ok(!/김민준/.test(allTxt) && /가나/.test(allTxt), `「전체」 표 = 1-6 학생 없음 · 1-1 있음`);
  ok(/🧪|data-ic="potion"/.test(await ih('#dash-body [data-cls="1-6"]')), '대시보드 반 칩 1-6 🧪');
  await T.screenshot({ path: `${OUT}/123-dash-all.png` });
  await T.evaluate(() => document.querySelector('#dash-body [data-cls="1-6"]').click()); await T.waitForTimeout(1500);
  const oneTxt = await T.evaluate(() => (document.querySelector('#dash-body') || {}).innerText || '');
  ok(/김민준/.test(oneTxt) && /이 반은 베타 반/.test(oneTxt), '1-6 칩 = 그 반 기록 보임 · 베타 안내');
  // 베타 반 학생 입장 = 🧪 시험 계정 표시 (체력 머릿수에서 빠짐)
  const code = await T.evaluate(async () => { const c = await DS.Act.createRoom('set-04', '1-6'); return c.code || c; });
  const S = await ctx.newPage(); S.on('pageerror', (e) => errs.push('S: ' + e.message)); await S.goto(U + '&role=student'); await S.waitForTimeout(1200);
  await S.evaluate((c) => DS.Student.enter(c, { cls: '1-6', num: 2, nick: '서연', hero: 0, fx: 'flame' }), code); await S.waitForTimeout(1500);
  const p2 = await T.evaluate(async (c) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); return Object.values(R.players).find((p) => p.num === 2) || {}; }, code);
  ok(p2.tester === true, '베타 반 학생 입장 = 🧪 시험 계정 (번호마다 켜지 않아도)');
  // 대항전: 1-1 화면에서 1-6 빠짐
  await T.evaluate(async () => { await DS.Net.set('punch/set-04/1-1', { s: 500, m: {}, at: 1 }); await DS.Net.set('punch/set-04/1-6', { s: 900, m: {}, at: 1 }); });
  const pb = await T.evaluate(async () => { const all = DS.Combo.noBeta(await DS.Net.get('punch'), DS.Account.betaKeys(await DS.Net.get('tester')), '1-1'); return Object.keys(all['set-04']).join(); });
  ok(pb === '1-1', `대항전(1-1 화면) = 1-6 빠짐 (${pb})`);
  // 끄기
  await T.click('#s-go').catch(() => {}); await T.evaluate(() => DS.Students.enter()).catch(() => {}); await T.waitForTimeout(800);
  await T.evaluate(() => document.querySelector('#sm-body [data-cls="1-6"]').click()); await T.waitForTimeout(400); await T.click('[data-beta]'); await T.waitForTimeout(800);
  ok(await T.evaluate(async () => (await DS.Net.get('tester/1-6/_all')) == null), '끄면 지움');
  console.log(log.join('\n')); console.log(bad ? `❌ ${bad}` : '✅ 통과'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad || errs.length) process.exit(1);
})();
