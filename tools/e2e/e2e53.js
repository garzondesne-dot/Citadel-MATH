// 📝 수업 설문 (2026-11-04 · v0.9.8.2): 리모컨 마무리에서 📝 열기 → 학생 캠프 📝 버튼 → 11문항 응답(익명) → 응답 표시 · +5 EXP · 버튼 사라짐
//   → 대시보드 📝 탭 집계 · 닫기 — node tools/e2e/e2e53.js <출력 폴더>
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
  await S.evaluate(async () => { await DS.Net.update('xp/1-3/1/tut', { a: true, b: true }); }); await S.evaluate(() => DS.Camp.back()); await S.waitForTimeout(1500);
  const before = !!(await S.$('#camp-sv-btn'));
  // 수업을 만들고 마무리까지 → 리모컨에서 📝 열기
  const code = await T.evaluate(async () => { const c = await DS.Act.createRoom('set-04', '1-3'); return c.code || c; });
  await T.evaluate(async (code) => { const L = DS.Lessons.get('set-04'); await DS.Net.set(`rooms/${code}/state/step`, L.steps.length); await DS.Teacher.open(code, ''); }, code); await T.waitForTimeout(1500);
  const ctl0 = (await T.textContent('.sv-ctl')).replace(/\s+/g, ' ').trim();
  await T.click('[data-sv="open"]'); await T.waitForTimeout(1200);
  const ctl1 = (await T.textContent('.sv-ctl')).replace(/\s+/g, ' ').trim(); log.push(`리모컨: ${ctl0} → ${ctl1}`);
  await T.screenshot({ path: `${OUT}/1-remote-finale.png` });
  await S.waitForSelector('#camp-sv-btn', { timeout: 8000 }); await S.screenshot({ path: `${OUT}/2-camp-btn.png` });
  await S.click('#camp-sv-btn'); await S.waitForTimeout(600);
  await S.screenshot({ path: `${OUT}/3-survey-top.png` });
  await S.click('#sv-go'); await S.waitForTimeout(500); const still = !!(await S.$('.sv-modal')); // 빈 채로 → 막힘
  const rows = await S.$$('.sv-scale');
  for (let i = 0; i < rows.length; i++) await (await rows[i].$(`.sv-o[data-v="${i % 2 ? 4 : 2}"]`)).click();
  await S.click('[data-pick="0"]'); await S.click('[data-pick="3"]'); await S.click('[data-cmp="0"]');
  await S.fill('#sv-say', '틀린 문제를 다시 풀게 됐어요');
  await S.evaluate(() => document.querySelector('#sv-say').scrollIntoView({ block: 'center' })); await S.screenshot({ path: `${OUT}/4-survey-bottom.png` });
  await S.click('#sv-go'); await S.waitForTimeout(1500);
  const gone = !(await S.$('.sv-modal')) && !(await S.$('#camp-sv-btn'));
  const db = await T.evaluate(async () => ({ a: await DS.Net.get('surveyA/1-3'), d: await DS.Net.get('surveyDone/1-3'), xp: await DS.Net.get('xp/1-3/1/log/survey') }));
  const ans = await T.evaluate((a) => DS.Survey.norm(a), Object.values(db.a || {})[0] || {});
  log.push(`저장: ${JSON.stringify(ans)} · 응답 표시 ${JSON.stringify(db.d)} · EXP ${db.xp && db.xp.xp}`);
  // 대시보드 📝 탭
  await T.evaluate(() => DS.Dash.enter()); await T.waitForTimeout(1500); await T.click('[data-tab="sv"]'); await T.waitForTimeout(1500);
  await T.setViewportSize({ width: 1100, height: 1400 }); await T.waitForTimeout(400); await T.screenshot({ path: `${OUT}/5-dash.png`, fullPage: true });
  const dash = (await T.textContent('.dash-main')).replace(/\s+/g, ' ');
  log.push('대시보드: ' + dash.slice(0, 200));
  await T.click('[data-svc="1-3"][data-on="0"]'); await T.waitForTimeout(1200);
  const closed = (await T.evaluate(() => DS.Net.get('survey/1-3'))) === null;
  const ok = !before && /열기/.test(ctl0) && /열림 · 4차시/.test(ctl1) && still && gone && ans.no === 4 && ans.r && ans.r.length === 7 && ans.r[0][0] === 2 && ans.r[0][1] === 4 && !('n' in ans) && db.d && db.d['1'] === true && db.xp && db.xp.xp === 5 && /1\/2명 응답/.test(dash) && closed;
  console.log(log.join('\n')); console.log(ok ? '✅ 통과' : '❌ 기대와 다름', { before, still, gone, closed }); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (!ok || errs.length) process.exit(1);
})();
