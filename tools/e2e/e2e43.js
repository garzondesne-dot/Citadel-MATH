// 📅 시간표 예약 수업 · 🗓 출석부 (2026-11-04 · v0.9.7.0): 시간표 저장 → 오늘 수업 목록 → 시각이 되면 학생 캠프 문이 저절로 켜짐 → 코드 없이 입장 → 출석부 ⭕ / ✕ · 수업 일지 한 줄
//   시험이라 「지금」이 1교시 안이 되게 교시 시각을 바꿔 씀 (실제 시각표는 tests/sched.test.js) — node tools/e2e/e2e43.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = [];
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const patch = (p) => p.evaluate(() => { const S = DS.Sched, k = S.kst(DS.Net.now()), hm = (ms) => S.kst(ms).hm; S.BELLS[1] = [hm(DS.Net.now() - 60e3), hm(DS.Net.now() + 40 * 60e3)]; S.PERIODS[k.dow] = [1, 2, 3, 4, 5, 6, 7]; S.SKIP.length = 0; return k; });
  const T = await mk('T');
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n2 이서연'); await T.click('#r-up'); await T.waitForTimeout(800);
  await T.click('#screen-students .nav-back'); await T.waitForTimeout(1500); if (await T.isVisible('#splash')) { await T.click('#splash'); await T.waitForTimeout(400); }
  if (!(await T.isVisible('#lesson'))) { await T.click('.role[data-role=teacher]'); await T.waitForTimeout(600); }
  const k = await patch(T); log.push(`오늘(한국) ${k.date} 요일 ${k.dow}`);
  await T.waitForTimeout(800); log.push('시간표 없을 때: ' + (await T.textContent('#t-today')).trim().slice(0, 40));
  await T.click('#t-today [data-sc]'); await T.waitForTimeout(700);
  await T.selectOption(`.sc-edit select[data-dp="${k.dow}-1"]`, '1-3'); await T.screenshot({ path: `${OUT}/1-editor.png` });
  await T.click('.sc-edit #sc-save'); await T.waitForTimeout(2500);
  const today = await T.evaluate(() => [...document.querySelectorAll('#t-today .td-row')].map((r) => r.textContent.replace(/\s+/g, ' ').trim()));
  log.push('오늘 수업: ' + today.join(' / '));
  await T.locator('#t-today').scrollIntoViewIfNeeded(); await T.screenshot({ path: `${OUT}/2-today.png` });
  const slots = await T.evaluate(async () => DS.Net.get('slots/1-3')); log.push('slots/1-3: ' + Object.keys(slots || {}).length + '개');
  // 학생: 로그인 → 캠프 → 문이 저절로 켜짐 → 코드 없이 입장
  const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1500); if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(500); }
  await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
  await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200);
  await S.evaluate(() => { localStorage.setItem('citadel-tut-1-3-1', JSON.stringify({ a: true, b: true })); });
  await S.click('#s-go'); await S.waitForTimeout(2000);
  await S.evaluate(async () => { await DS.Net.update('xp/1-3/1/tut', { a: true, b: true }); }); await S.evaluate(() => DS.Camp.back()); await S.waitForTimeout(1500);
  const gate = await S.evaluate(() => { const g = document.getElementById('camp-gate'); return g ? g.className : 'none'; });
  log.push('학생 캠프 문: ' + gate); await S.screenshot({ path: `${OUT}/3-camp-open.png` });
  await S.click('#camp-gate'); await S.waitForTimeout(3500);
  const scr = await S.evaluate(() => (document.querySelector('.screen.active') || {}).id); log.push('문 누름 → 화면: ' + scr);
  // 교사: 출석부 · 수업 일지
  await T.bringToFront(); await T.click('#a-go'); await T.waitForTimeout(2500);
  const att = await T.evaluate(() => [...document.querySelectorAll('.att-tbl tr')].slice(1).map((r) => r.textContent.replace(/\s+/g, ' ').trim()));
  log.push('출석부: ' + att.join(' / ')); await T.screenshot({ path: `${OUT}/4-att.png` });
  await T.click('[data-t=log]'); await T.waitForTimeout(800);
  const lg = await T.evaluate(() => [...document.querySelectorAll('.log-tbl tr')].slice(1).map((r) => r.textContent.replace(/\s+/g, ' ').trim()));
  log.push('수업 일지: ' + lg.join(' / ')); await T.screenshot({ path: `${OUT}/5-log.png` });
  const ok = today.length === 1 && /지금 열림/.test(today[0]) && /on|open/.test(gate) && scr === 'screen-student' && att.length === 2 && /⭕/.test(att[0]) && /✕/.test(att[1]) && lg.length === 1;
  console.log(log.join('\n')); console.log(ok ? '✅ 통과' : '❌ 기대와 다름'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (!ok || errs.length) process.exit(1);
})();
