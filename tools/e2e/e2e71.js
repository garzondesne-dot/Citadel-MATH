// 📝 설문 수동 열기 (2026-11-06 사용자 「설문 10차시에 열거야 · 안 바뀌네 · 내가 수동으로」) — node tools/e2e/e2e71.js <출력 폴더>
//   교사 메뉴 「📝 설문」 → 차시 10 → 1-3반 열기 → 학생 캠프 📝 버튼 · 10차시 → 모든 반 닫기 → 버튼 사라짐 · 대시보드 · 리모컨도 같은 번호
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = [], P = (m) => log.push(m);
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T'); await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준'); await T.click('#r-up'); await T.waitForTimeout(600);
  await T.evaluate(() => DS.Net.set('roster/1-4', { 1: '박지호' }));
  const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1500); if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(500); }
  await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
  await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200);
  await S.evaluate(() => { localStorage.setItem('citadel-tut-1-3-1', JSON.stringify({ a: true, b: true })); }); await S.click('#s-go'); await S.waitForTimeout(2000);
  await T.evaluate(() => { try { DS.Scene.clear(); } catch (e) { /* */ } }); await T.goto(U + '&role=teacher'); await T.waitForTimeout(2200);
  if (await T.isVisible('#splash')) { await T.click('#splash'); await T.waitForTimeout(400); } if (!(await T.isVisible('#sv-go'))) { await T.click('.role[data-role=teacher]').catch(() => {}); await T.waitForTimeout(800); }
  await T.click('#sv-go'); await T.waitForTimeout(800);
  P('창: ' + (await T.$$eval('.sv-modal tr', (x) => x.map((e) => e.textContent.replace(/\s+/g, ' ').trim()).join(' | '))));
  await T.fill('#sv-pno', '10'); await T.click('.sv-modal [data-c="1-3"][data-on="1"]'); await T.waitForTimeout(800);
  const st1 = await T.evaluate(async () => ({ a: await DS.Net.get('survey/1-3'), b: await DS.Net.get('survey/1-4') }));
  P('1-3 열기 뒤: ' + JSON.stringify(st1));
  await T.screenshot({ path: `${OUT}/71-1-panel.png` });
  await S.evaluate(() => DS.Camp.back()); await S.waitForTimeout(2000);
  const btn = await S.evaluate(() => (document.querySelector('.sv-btn') || {}).textContent || '');
  P('학생 버튼: ' + btn);
  await S.click('.sv-btn').catch(() => {}); await S.waitForTimeout(600); const head = await S.evaluate(() => [...document.querySelectorAll('.gold')].map((e) => e.textContent).find((t) => /수업 설문/.test(t)) || '');
  P('학생 설문 머리: ' + head); await S.screenshot({ path: `${OUT}/71-2-student.png` });
  await T.click('#sv-all1'); await T.waitForTimeout(1000); const st2 = await T.evaluate(async () => ({ a: await DS.Net.get('survey/1-3'), b: await DS.Net.get('survey/1-4') }));
  await T.click('#sv-all0'); await T.waitForTimeout(1000); const st3 = await T.evaluate(async () => ({ a: await DS.Net.get('survey/1-3'), b: await DS.Net.get('survey/1-4') }));
  P('모든 반 열기: ' + JSON.stringify(st2) + ' · 닫기: ' + JSON.stringify(st3));
  const remembered = await T.evaluate(() => DS.Survey.pickNo());
  // 학생이 설문을 내면 💎 10
  await T.evaluate(() => DS.Survey.setOpen('1-3', true, 10)); await S.evaluate(() => DS.Camp.back()); await S.waitForTimeout(2000); await S.click('.sv-btn').catch(() => {}); await S.waitForTimeout(600);
  const gem0 = await S.evaluate(async () => ((await DS.Gem.mine({ c: '1-3', n: 1 })) || {}).total || 0);
  await S.evaluate(async () => { const m = await DS.Account.me(); const a = { r: DS.Survey.PAIR.map(() => [3, 4]), pick: [0, 1], cmp: 0, say: '재밌어요', want: '' }; await DS.Survey.submit(m, a, 10); });
  const gem1 = await S.evaluate(async () => { const d = (await DS.Gem.mine({ c: '1-3', n: 1 })) || {}; return { total: d.total || 0, log: (d.log || {}).survey }; });
  P(`💎 설문 전 ${gem0} → 뒤 ${JSON.stringify(gem1)}`);
  const C = { 열기10: st1.a && st1.a.open && st1.a.no === 10 && !st1.b, 학생버튼: /설문/.test(btn), 머리10차시: /10차시/.test(head), 모두열기: st2.a.no === 10 && st2.b.no === 10, 모두닫기: !st3.a && !st3.b, 번호기억: remembered === 10, 마정석10: gem1.log && gem1.log.g === 10 };
  const bad = Object.keys(C).filter((k) => !C[k]); if (bad.length) P('틀린 항목: ' + bad.join(', '));
  console.log(log.join('\n')); console.log(!bad.length ? '✅ 통과' : '❌ 기대와 다름'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad.length || errs.length) process.exit(1);
})();
