// 🏰 성채던전 · 🎯 복습 허수아비 · 📮 바로 풀기 (2026-11-05 · v0.9.8.3) — node tools/e2e/e2e54.js <출력 폴더>
//   진도 6차시 → 캠프 🏰 NEW 11 (보스 잠김) → 성채 12방(11 열림 · 👑 잠김) → 7방 처치 기록 → 👑 열림 · 방 전투 배경
//   📮 우편함: 4차시 문제 1 틀림 → 「🎯 바로 풀기」 → 허수아비 복습 전투가 바로 · 🎯 허수아비 = 복습! n차시 목록 (보강 없음)
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = [];
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message + ' @ ' + String(e.stack).split('\n').slice(1, 3).join(' '))); p.on('dialog', (d) => d.accept()); return p; };
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
  // 진도 6차시 · 4차시 기록: 문제 1 틀림(x) · 형성평가 일부
  await S.evaluate(async () => {
    await DS.Net.update('xp/1-3/1/tut', { a: true, b: true }); await DS.Net.set('unlock/1-3', 6); await DS.Net.set('held/1-3', { 'set-04': true });
    await DS.Net.set('records/1-3/1/set-04', { at: 1, no: 4, mons: { r1: 'o', m1: 'x', m2: 'o', m3: 'f' }, bossM: 'ooxoo', boss: 4, bossN: 5, conc: {}, names: {} });
  });
  await S.evaluate(() => DS.Camp.back()); await S.waitForTimeout(2500);
  const newB = (await S.textContent('#camp-castle .cs-newb').catch(() => '')).trim(), mailBadge = !!(await S.$('#camp-mail .nt-badge')), castleNt = !!(await S.$('#camp-castle .nt-badge')), dot = await S.evaluate(() => document.getElementById('camp-dummy').classList.contains('nt-dot'));
  log.push(`캠프: 성채 ${newB} · 우편함 배지 ${mailBadge} · 성채 오답 배지 ${castleNt} · 허수아비 점 ${dot}`);
  await S.screenshot({ path: `${OUT}/1-camp.png` });
  // 🏰 성채던전
  await S.click('#camp-castle', { force: true }); await S.waitForTimeout(1500);
  const rooms = await S.evaluate(() => ({ all: document.querySelectorAll('.cs-floor .cs-room').length, ready: document.querySelectorAll('.cs-room.ready').length, lock: document.querySelectorAll('.cs-room.lock').length, boss: document.querySelector('.cs-room.boss').className, news: document.querySelectorAll('.cs-room .cs-rnew').length, floor2: !!document.querySelector('.cs-floor.lock') }));
  log.push('성채: ' + JSON.stringify(rooms));
  await S.screenshot({ path: `${OUT}/2-castle.png`, fullPage: true });
  await S.click('[data-fight="eval-1|q04"]'); await S.waitForTimeout(800);
  const fightBg = await S.evaluate(() => { const sc = document.querySelector('.bn-fight .scene'); return sc && sc.classList.contains('cs-bg') && /citadel-room/.test(sc.style.backgroundImage); });
  const fightTag = (await S.textContent('.bn-fight .scene-bar')).replace(/\s+/g, ' ');
  await S.screenshot({ path: `${OUT}/3-room-fight.png` });
  await S.click('#bf-x'); await S.waitForTimeout(500);
  const q04new = await S.evaluate(() => !!document.querySelector('[data-fight="eval-1|q04"] .cs-rnew'));
  // 7방 처치 → 👑 열림
  await S.evaluate(async () => { for (const id of ['q01', 'q02', 'q03', 'q04', 'q05', 'q06', 'q07']) await DS.Net.set(`bonus/1-3/1/eval-1/${id}`, { clear: true, tries: 1 }); });
  await S.click('#bn-back'); await S.waitForTimeout(1500); await S.click('#camp-castle', { force: true }); await S.waitForTimeout(1500);
  const bossOpen = await S.evaluate(() => !document.querySelector('.cs-room.boss').classList.contains('lock'));
  await S.click('.cs-room.boss'); await S.waitForTimeout(800);
  const bossBg = await S.evaluate(() => /citadel-boss/.test((document.querySelector('.bn-fight .scene') || {}).style.backgroundImage || ''));
  await S.screenshot({ path: `${OUT}/4-boss-fight.png` });
  await S.click('#bf-x'); await S.waitForTimeout(400); await S.screenshot({ path: `${OUT}/5-castle-after.png`, fullPage: true });
  await S.click('#bn-back'); await S.waitForTimeout(1500);
  // 📮 바로 풀기
  await S.click('#camp-mail', { force: true }); await S.waitForTimeout(1500);
  const goBtns = await S.evaluate(() => [...document.querySelectorAll('[data-go]')].map((b) => b.dataset.go));
  await S.screenshot({ path: `${OUT}/6-mail.png`, fullPage: true });
  await S.click('[data-go="set-04|m1"]'); await S.waitForTimeout(2200);
  const quick = await S.evaluate(() => ({ screen: document.getElementById('screen-bonus').classList.contains('active'), fight: !!document.querySelector('.bn-fight'), tag: (document.querySelector('.bn-fight .scene-bar') || {}).textContent || '' }));
  log.push('바로 풀기: ' + JSON.stringify({ goBtns, ...quick, tag: quick.tag.replace(/\s+/g, ' ').slice(0, 60) }));
  await S.screenshot({ path: `${OUT}/7-quick-fight.png` });
  await S.click('#bf-x'); await S.waitForTimeout(500);
  const review = await S.evaluate(() => ({ head: (document.querySelector('.bn-top b') || {}).textContent, cards: [...document.querySelectorAll('.bn-card .bn-h b')].map((e) => e.textContent), rows: document.querySelectorAll('.bn-card .bn-row').length, bo: /보강/.test(document.getElementById('bonus').textContent) }));
  log.push('허수아비: ' + JSON.stringify(review));
  await S.screenshot({ path: `${OUT}/8-review.png`, fullPage: true });
  const ok = newB === 'NEW 11' && mailBadge && !castleNt && dot && rooms.all === 12 + 0 && rooms.ready === 11 && rooms.lock === 1 && /lock/.test(rooms.boss) && rooms.news === 11 && rooms.floor2
    && fightBg && /성채던전 1층/.test(fightTag) && !q04new && bossOpen && bossBg && goBtns.includes('set-04|m1') && goBtns.includes('set-04|boss') && quick.screen && quick.fight && /복습! 4차시/.test(quick.tag)
    && /복습 허수아비/.test(review.head) && review.cards.some((c) => /복습! 4차시/.test(c));
  console.log(log.join('\n')); console.log(ok ? '✅ 통과' : '❌ 기대와 다름', { fightBg, fightTag, q04new, bossOpen, bossBg }); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (!ok || errs.length) process.exit(1);
})();
