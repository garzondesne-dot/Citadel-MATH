// 💾 진행 저장 (2026-11-04 · v0.9.7.6 → v0.9.8.0 줄임): 공격만으론 저장 안 함 · 선생님이 다음 단계로 넘기면 저장 → 교사 「📥 결과」(결과 모으기)는 이미 있는 학생을 건드리지 않음 — node tools/e2e/e2e47.js <출력 폴더>
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
  await S.evaluate(async () => { await DS.Net.update('xp/1-3/1/tut', { a: true, b: true }); });
  const code = await T.evaluate(async () => { const c = await DS.Act.createRoom('set-04', '1-3'); return c.code || c; });
  log.push('방: ' + code);
  await S.evaluate(() => DS.Camp.back()); await S.waitForTimeout(1500); await S.click('#camp-gate'); await S.waitForTimeout(2500);
  const go = () => T.evaluate(async (code) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); await DS.Act.go(code, R, DS.Lessons.get(R.meta.lesson), 1); return DS.Raid.stepOf(DS.Lessons.get(R.meta.lesson), DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`))).kind; }, code);
  for (let k = 0; k < 6; k++) { const kind = await go(); await S.waitForTimeout(1200); if (kind === 'monster' && (await S.$('#st-go'))) break; }
  await S.screenshot({ path: `${OUT}/1-fight.png` });
  const had = !!(await S.$('#st-go')); log.push('공격 화면: ' + had);
  await S.evaluate(() => { const g = document.querySelector('#st-go'); g.disabled = false; g.click(); });
  await S.waitForTimeout(2500);
  const rec0 = await T.evaluate(() => DS.Net.get('records/1-3/1/set-04'));
  log.push('공격 직후(저장 안 함): ' + (rec0 ? '있음' : '없음'));
  await go(); await S.waitForTimeout(4000); // 선생님이 다음 단계로 → 저장
  const rec = await T.evaluate(() => DS.Net.get('records/1-3/1/set-04')), xp = await T.evaluate(() => DS.Net.get('xp/1-3/1/total'));
  log.push(`다음 단계 뒤 기록: ${rec ? rec.code : '없음'} · EXP ${xp}`);
  // 앱을 내릴 때 저장: 다음 몬스터 공격 → 화면 숨김 흉내 → 기록 갱신
  for (let k = 0; k < 4; k++) { if (await S.$('#st-go')) break; await go(); await S.waitForTimeout(1500); }
  const before = JSON.stringify((await T.evaluate(() => DS.Net.get('records/1-3/1/set-04'))).mons || {});
  if (await S.$('#st-go')) { await S.evaluate(() => { const g = document.querySelector('#st-go'); g.disabled = false; g.click(); }); await S.waitForTimeout(1500); }
  await S.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' }); document.dispatchEvent(new Event('visibilitychange')); });
  await S.waitForTimeout(2500);
  const after = JSON.stringify((await T.evaluate(() => DS.Net.get('records/1-3/1/set-04'))).mons || {});
  log.push(`앱 내림 저장: ${before === after ? '그대로' : '갱신'} ${after}`);
  const hidOk = before !== after, xpH = await T.evaluate(() => DS.Net.get('xp/1-3/1/total'));
  const o = await T.evaluate((c) => DS.Result.gather(c, '1-3').then((o) => ({ saved: o.saved, kept: o.kept })), code);
  log.push(`결과 모으기: 저장 ${o.saved} · 이미 있음 ${o.kept}`);
  const xp2 = await T.evaluate(() => DS.Net.get('xp/1-3/1/total'));
  const ok = hidOk && had && !rec0 && rec && rec.code === String(code) && xp > 0 && o.kept.includes(1) && !o.saved.includes(1) && xp2 === xpH;
  console.log(log.join('\n')); console.log(ok ? '✅ 통과' : '❌ 기대와 다름'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (!ok || errs.length) process.exit(1);
})();
