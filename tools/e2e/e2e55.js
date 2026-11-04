// ⏳ 보스 타임바 · 문 닫힘 · 이어하기 포털 (2026-11-05 · v0.9.10) — node tools/e2e/e2e55.js <출력 폴더>
//   수업 중 종합상황실 · 리모컨 · 학생 폰 타임바 → 마감 시각이 지나면 보스가 문을 닫음(자동 끝) → rift 7일 → 학생 캠프 차시 문 「⏳ 이어하기」 → 이어하기 화면
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
  const { code, key } = await T.evaluate(async () => { const c = await DS.Act.createRoom('set-04', '1-3'); const code = c.code || c; return { code, key: (await DS.Net.get(`secrets/${code}`)).hallKey }; });
  // 마감 = 지금 + 9분 (학생 폰은 10분 전부터 보임) · 수업 시작 → 첫 몬스터
  await T.evaluate(async (code) => {
    await DS.Net.set(`rooms/${code}/meta/deadline`, DS.Net.now() + 9 * 60e3);
    for (let i = 1; i <= 3; i++) { await DS.Net.set(`rooms/${code}/players/bot${i}`, { num: 10 + i, nick: `봇${i}`, hero: i, cls: '1-3' }); await DS.Net.set(`rooms/${code}/active/bot${i}`, true); }
    const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); await DS.Act.go(code, R, DS.Lessons.get('set-04'), 1);
    await DS.Teacher.open(code, '');
  }, code);
  const H = await mk('H'); await H.setViewportSize({ width: 1600, height: 900 });
  await H.goto(`${U}&role=hall&code=${code}&key=${key}`); await H.waitForTimeout(3000);
  const R0 = await T.evaluate((code) => DS.Net.get(`rooms/${code}/state/step`), code);
  if (R0 < 1) await T.evaluate(async (code) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); await DS.Act.go(code, R, DS.Lessons.get('set-04'), 1); }, code);
  await H.waitForTimeout(2500);
  const hb = await H.evaluate(() => { const e = document.querySelector('#h-tbar .tb'); return e && { t: e.textContent.replace(/\s+/g, ' ').trim(), prog: !!e.querySelector('.tb-prog'), warn: e.classList.contains('warn') }; });
  const tb = await T.evaluate(() => { const e = document.querySelector('#t-tbar .tb'); return e && { ext: !!e.querySelector('[data-extend]') }; });
  log.push('종합상황실: ' + JSON.stringify(hb) + ' · 리모컨: ' + JSON.stringify(tb));
  await H.screenshot({ path: `${OUT}/1-hall-bar.png` });
  // +5분 연장 → 다시 마감 3초 뒤로
  await T.click('#t-tbar [data-extend]'); await T.waitForTimeout(800);
  const ext = await T.evaluate((code) => DS.Net.get(`rooms/${code}/state/extend`), code);
  await T.evaluate(async (code) => DS.Net.set(`rooms/${code}/meta/deadline`, DS.Net.now() + 3000 - 5 * 60e3), code);
  await H.waitForTimeout(6000);
  const st = await T.evaluate((code) => DS.Net.get(`rooms/${code}/state`), code);
  const rift = await T.evaluate(() => DS.Net.get('rift/1-3/set-04'));
  const closedTxt = (await H.textContent('#h-arena')).replace(/\s+/g, ' ');
  log.push(`문 닫힘: closed ${st.closed} · timeUp ${!!st.timeUp} · 연장 ${ext} · rift ${rift && rift.no}차시 D-${rift && Math.round((rift.until - Date.now()) / 86400e3)}`);
  await H.screenshot({ path: `${OUT}/2-hall-closed.png` });
  // 학생: 캠프 차시 문 = 이어하기
  await S.evaluate(() => DS.Camp.back()); await S.waitForTimeout(2500);
  const gate = (await S.textContent('#camp-gate .camp-label')).trim();
  await S.screenshot({ path: `${OUT}/3-camp-rift.png` });
  await S.click('#camp-gate', { force: true }); await S.waitForTimeout(1800);
  const rv = await S.evaluate(() => ({ head: (document.querySelector('.bn-top b') || {}).textContent, cards: document.querySelectorAll('.bn-card').length, msg: (document.querySelector('.rift-head') || {}).textContent || '' }));
  log.push(`학생: 문 「${gate}」 · 화면 ${JSON.stringify({ ...rv, msg: rv.msg.slice(0, 40) })}`);
  await S.screenshot({ path: `${OUT}/4-rift-view.png`, fullPage: true });
  const ok = hb && hb.prog && /보스가 문을 닫아요/.test(hb.t) && tb && tb.ext && ext === 5 && st.closed && st.timeUp && rift && rift.no === 4 && /보스가 문을 닫았다/.test(closedTxt) && /이어하기 D-7/.test(gate) && /4차시 이어하기/.test(rv.head) && rv.cards === 1;
  console.log(log.join('\n')); console.log(ok ? '✅ 통과' : '❌ 기대와 다름'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (!ok || errs.length) process.exit(1);
})();
