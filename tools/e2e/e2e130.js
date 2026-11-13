// 🐞 2026-11-13 1-2반 「화면에 제 필살기가 안 보여요」: 종합실 = 필살기 5명이 한꺼번에 와도 모두 컷인 (밀리면 짧게) — node tools/e2e/e2e130.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = `http://localhost:${process.env.PORT || 8765}/index.html?local`;
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = []; let bad = 0;
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T'); await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.evaluate(() => DS.Account.uploadRoster([{ c: '1-3', n: 1, name: '가' }])); await T.reload(); await T.waitForTimeout(1500); if (await T.isVisible('#splash')) { await T.click('#splash'); await T.waitForTimeout(400); }
  await T.selectOption('#t-cls', '1-3'); await T.waitForTimeout(400); await T.selectOption('#lesson', 'set-10'); await T.click('#t-new'); await T.waitForTimeout(2500);
  const code = await T.evaluate(() => DS.Teacher.code()), key = (await T.textContent('#t-key')).trim();
  const H = await mk('H'); await H.setViewportSize({ width: 1280, height: 720 }); await H.goto(`${U}&role=hall&code=${code}&key=${key}`); await H.waitForTimeout(2500);
  await T.evaluate(async (c) => { for (let n = 1; n <= 5; n++) { await DS.Net.set(`rooms/${c}/players/s${n}`, { num: n, nick: `학생${n}`, hero: n, fx: 'flame', cls: '1-3', at: Date.now() }); await DS.Net.set(`rooms/${c}/online/s${n}`, true); } await DS.Net.update(`rooms/${c}/state`, { solve: 0 }); }, code);
  const go = () => T.evaluate(async () => { const code = DS.Teacher.code(); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); await DS.Act.go(code, R, DS.Lessons.get(R.meta.lesson), 1); });
  for (let k = 0; k < 3; k++) { await go(); await T.waitForTimeout(700); } await H.waitForTimeout(2000); // 도입 → 개념 1 → 문제 1
  await H.evaluate(() => { window.__cut = 0; const ob = new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((n) => { if (n.classList && n.classList.contains('ult') && !n.classList.contains('th-chain')) { window.__cut++; (window.__names = window.__names || []).push(n.className + ':' + ((n.querySelector('.u-name') || {}).textContent || '')); } }))); ob.observe(document.body, { childList: true, subtree: true }); });
  await T.evaluate(async (c) => { for (let n = 1; n <= 5; n++) await DS.Net.set(`rooms/${c}/heals/m1/s${n}/0`, '!ult'); }, code);
  await H.waitForTimeout(12000);
  const cut = await H.evaluate(() => window.__cut)
  ok(cut === 5, `필살기 5명 한꺼번에 → 종합실 컷인 ${cut}번 (예전 = 3번에서 끊김)`);
  console.log(log.join('\n')); console.log(bad ? `❌ ${bad}` : '✅ 통과'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad || errs.length) process.exit(1);
})();
