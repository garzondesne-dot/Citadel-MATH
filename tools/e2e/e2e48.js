// ⚖ 밸런스 게임 (2026-11-04 · v0.9.7.7): 쉼터 → 교사 「⚖ 밸런스 게임」 → 학생 폰 고르기 · 종합상황실 공개(우르르 · 무너짐) → 2명 남으면 우승 → 쉼터 끝이면 게임도 끝 — node tools/e2e/e2e48.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = [];
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); await p.addInitScript(() => { window.DS_FUN = { pick: 5000, show: 4000 }; }); return p; };
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
  await S.evaluate(async () => { await DS.Net.update('xp/1-3/1/tut', { a: true, b: true }); });
  const { code, key } = await T.evaluate(async () => { const c = await DS.Act.createRoom('set-04', '1-3'); const code = c.code || c; return { code, key: (await DS.Net.get(`secrets/${code}`)).hallKey }; });
  await S.evaluate(() => DS.Camp.back()); await S.waitForTimeout(1500); await S.click('#camp-gate'); await S.waitForTimeout(2500);
  // 가짜 용사 5명 + 수업 시작 + 쉼터
  await T.evaluate(async (code) => {
    for (let i = 1; i <= 5; i++) { await DS.Net.set(`rooms/${code}/players/bot${i}`, { num: 10 + i, nick: `봇${i}`, hero: i % 6, cls: '1-3' }); await DS.Net.set(`rooms/${code}/active/bot${i}`, true); }
    const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); await DS.Act.go(code, R, DS.Lessons.get(R.meta.lesson), 1);
    await DS.Act.setRest(code, true, 5);
  }, code);
  const H = await mk('H'); await H.setViewportSize({ width: 1600, height: 900 });
  await H.goto(`${U}&role=hall&code=${code}&key=${key}`); await H.waitForTimeout(3000);
  const hb = await H.$('[data-fun="start:bal"]'); log.push('종합상황실 ⚖ 버튼: ' + !!hb);
  await hb.click(); await H.waitForTimeout(1500);
  await H.screenshot({ path: `${OUT}/1-hall-pick.png` });
  const pick1 = await S.$$eval('.fa-pick .btn', (x) => x.map((e) => e.textContent.trim()));
  log.push('학생 폰 1판: ' + pick1.join(' | '));
  await S.click('.fa-pick .fa-a'); await S.waitForTimeout(400);
  await S.screenshot({ path: `${OUT}/2-phone-pick.png` });
  const vote = (rk, v) => T.evaluate(async ({ code, rk, v }) => { for (const [u, x] of Object.entries(v)) await DS.Net.set(`rooms/${code}/fv/${rk}/${u}`, x); }, { code, rk, v });
  await vote('r1', { bot1: 'a', bot2: 'a', bot3: 'a', bot4: 'b', bot5: 'b' });
  log.push('종합상황실 고른 사람: ' + (await H.textContent('.fa-voted')).trim());
  await H.waitForFunction(() => document.querySelector('.fa-plat.broken .fa-piece'), null, { timeout: 12000 });
  await H.waitForTimeout(900); await H.screenshot({ path: `${OUT}/3-hall-show.png` });
  log.push('공개: ' + (await H.textContent('.fa-foot')).trim());
  await S.screenshot({ path: `${OUT}/4-phone-show.png` });
  log.push('학생 폰: ' + (await S.textContent('.fa-me')).trim());
  await S.waitForSelector('.fa-pick .fa-a', { timeout: 10000 }); await S.click('.fa-pick .fa-a');
  await vote('r2', { bot1: 'a', bot2: 'b' });
  await H.waitForFunction(() => /우승/.test((document.querySelector('.fa-win') || {}).textContent || ''), null, { timeout: 20000 });
  await H.waitForTimeout(600); await H.screenshot({ path: `${OUT}/5-hall-win.png` });
  const win = (await H.textContent('.fa-win')).replace(/\s+/g, ' ').trim(); log.push('끝: ' + win);
  await S.waitForTimeout(500); await S.screenshot({ path: `${OUT}/6-phone-win.png` });
  const meWin = (await S.textContent('.fa-me')).trim(); log.push('학생 폰: ' + meWin);
  // 쉼터 끝 → 게임도 끝 · 레이드로
  await T.evaluate((code) => DS.Act.setRest(code, false), code); await S.waitForTimeout(1500);
  const after = await T.evaluate((code) => DS.Net.get(`rooms/${code}/fun`), code); const back = !(await S.$('.fa-wrap'));
  log.push(`쉼터 끝 → fun ${after ? '남음' : '지움'} · 학생 화면 ${back ? '레이드로' : '그대로'}`);
  const ok = !!hb && pick1.length === 2 && /2명 탈락/.test(log.join()) && /살아남았다/.test(log.join()) && /김민준/.test(win) && /봇1/.test(win) && /우승/.test(meWin) && !after && back;
  console.log(log.join('\n')); console.log(ok ? '✅ 통과' : '❌ 기대와 다름'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (!ok || errs.length) process.exit(1);
})();
