// 📕 오답노트 (2026-11-04 · v0.9.7.9): 기록(문제마다 칸) → 캠프 배지 · 중단원던전 층 칩 · 남은 문제부터 풀기 · 우편함 · 교사 대시보드 — node tools/e2e/e2e49.js <출력 폴더>
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
  // 기록: 3차시 (문제 칸 o f x - · 형성평가 oox---o) · 4차시 불참 · 2번 학생은 다 맞힘
  await T.evaluate(async () => {
    await DS.Net.set('unlock/1-3', 4); await DS.Net.set('held/1-3', { 'set-03': true, 'set-04': true });
    const L3 = DS.Lessons.get('set-03'), m = DS.Note.monIds(L3);
    const mons = Object.fromEntries(m.map((id, i) => [id, ['o', 'f', 'x', '-'][i] || 'n']));
    await DS.Net.set('records/1-3/1/set-03', { at: 1, code: '111111', no: 3, conc: {}, names: {}, boss: 2, bossN: 6, bossX: 1, bossM: 'oox---o', mons, won: true });
    await DS.Net.set('records/1-3/2/set-03', { at: 1, code: '111111', no: 3, conc: {}, names: {}, boss: 6, bossN: 6, bossX: 1, bossM: 'ooooooo', mons: Object.fromEntries(m.map((id) => [id, 'o'])), won: true });
    await DS.Net.set('records/1-3/2/set-04', { at: 1, code: '222222', no: 4, conc: {}, names: {}, boss: 5, bossN: 5, bossX: 0, bossM: 'oooooo', mons: Object.fromEntries(DS.Note.monIds(DS.Lessons.get('set-04')).map((id) => [id, 'o'])), won: true });
  });
  await S.click('#s-go'); await S.waitForTimeout(2500);
  await S.evaluate(async () => { await DS.Net.update('xp/1-3/1/tut', { a: true, b: true }); }); await S.evaluate(() => DS.Camp.back()); await S.waitForTimeout(2500);
  const badge = await S.evaluate(() => [...document.querySelectorAll('.nt-badge b')].map((x) => x.textContent));
  log.push('캠프 배지: ' + badge.join(' · ')); await S.screenshot({ path: `${OUT}/1-camp.png` });
  await S.click('#camp-castle'); await S.waitForTimeout(2500);
  const floors = await S.evaluate(() => [...document.querySelectorAll('.bn-card')].map((c) => (c.querySelector('.bn-h') || {}).textContent.replace(/\s+/g, ' ').trim()).slice(0, 3));
  log.push('층: ' + floors.join(' / '));
  const chips3 = await S.evaluate(() => { const c = [...document.querySelectorAll('.bn-card')].find((x) => /3차시/.test(x.textContent)); return c ? [...c.querySelectorAll('.nt-row')].map((r) => [...r.querySelectorAll('.nt-ic')].map((i) => i.className.match(/nt-k-(x|none|ok|fill|star)/)[1][0]).join('')) : []; });
  log.push('3차시 칩: 수업 ' + chips3[0] + ' · 형성평가 ' + chips3[1]);
  await S.screenshot({ path: `${OUT}/2-dungeon.png`, fullPage: true });
  // 보충: 3번 몬스터 처치 기록 → 다시 그리기
  await S.evaluate(async () => { const m = DS.Note.monIds(DS.Lessons.get('set-03')); await DS.Net.set(`bonus/1-3/1/set-03/${m[2]}`, { clear: true, tries: 1 }); });
  await S.click('#bn-back'); await S.waitForTimeout(1500); await S.click('#camp-castle'); await S.waitForTimeout(2000);
  const chips3b = await S.evaluate(() => { const c = [...document.querySelectorAll('.bn-card')].find((x) => /3차시/.test(x.textContent)); return c ? [...c.querySelector('.nt-row').querySelectorAll('.nt-ic')].map((i) => i.className.match(/nt-k-(x|none|ok|fill|star)/)[1][0]).join('') : ''; });
  log.push('보충 뒤 3차시 수업 칩: ' + chips3b);
  const goBtn = await S.$('[data-next]'); log.push('남은 문제부터 풀기 버튼: ' + !!goBtn);
  if (goBtn) { await goBtn.click(); await S.waitForTimeout(1200); log.push('눌러서 열린 전투: ' + ((await S.textContent('.bn-fight .scene-bar b').catch(() => '')) || '').trim()); await S.screenshot({ path: `${OUT}/3-fight.png` }); await S.click('#bf-x').catch(() => {}); }
  await S.click('#bn-back'); await S.waitForTimeout(1500);
  await S.click('#camp-mail'); await S.waitForTimeout(2000);
  const mail = (await S.textContent('.nt-box').catch(() => '')).replace(/\s+/g, ' ').trim(); log.push('우편함: ' + mail.slice(0, 40));
  await S.screenshot({ path: `${OUT}/4-mail.png`, fullPage: true });
  // 교사 대시보드
  await T.setViewportSize({ width: 1280, height: 800 }); await T.bringToFront();
  await T.click('#screen-students .nav-back').catch(() => {}); await T.waitForTimeout(1200);
  await T.click('#d-go'); await T.waitForTimeout(1800);
  await T.selectOption('#dash-cls', '1-3').catch(() => {}); await T.waitForTimeout(1200);
  const rows = await T.evaluate(() => [...document.querySelectorAll('.dash-t tr')].slice(1).map((r) => r.textContent.replace(/\s+/g, ' ').trim() + (r.querySelector('.nt-k-star') ? ' [별]' : '')));
  log.push('대시보드: ' + rows.join(' / '));
  await T.screenshot({ path: `${OUT}/5-dash.png` });
  const ok = badge.length === 2 && chips3[0] && chips3[0] === 'ooxn' && chips3[1] === 'ooxnnns' && /f/.test(chips3b) && !!goBtn && /오답노트/.test(mail) && rows.some((r) => /❗/.test(r)) && rows.some((r) => /\[별\]/.test(r));
  console.log(log.join('\n')); console.log(ok ? '✅ 통과' : '❌ 기대와 다름'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (!ok || errs.length) process.exit(1);
})();
