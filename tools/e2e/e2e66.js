// 2026-11-06 1-2반 녹취 뒤: ❄ 📝 풀이 시간(중단원 문항 60초 · 꽁꽁 묶기 · 지금 풀기) · ⏸ 수업 끝(저장) → ▶ 지난 수업 이어서 · 🎁 선물 알림(던전) · 🏕 수업 중 캠프 보기
//   node tools/e2e/e2e66.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = [];
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T');
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준'); await T.click('#r-up'); await T.waitForTimeout(800);
  await T.click('#screen-students .nav-back'); await T.waitForTimeout(1500); if (await T.isVisible('#splash')) { await T.click('#splash'); await T.waitForTimeout(400); }
  if (!(await T.isVisible('#lesson'))) { await T.click('.role[data-role=teacher]'); await T.waitForTimeout(600); }
  await T.selectOption('#t-cls', '1-3'); await T.waitForTimeout(500); await T.selectOption('#lesson', 'set-06'); await T.click('#t-new'); await T.waitForTimeout(1500);
  const code = await T.evaluate(() => DS.Teacher.code()), key = (await T.textContent('#t-key')).trim();
  const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1500); if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(500); }
  await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
  await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200);
  await S.evaluate(() => { localStorage.setItem('citadel-tut-1-3-1', JSON.stringify({ a: true, b: true })); }); await S.click('#s-go'); await S.waitForTimeout(2000); await S.click('#camp-gate'); await S.waitForTimeout(2500);
  const H = await mk('H'); await H.setViewportSize({ width: 1600, height: 900 }); await H.goto(`${U}&role=hall&code=${code}&key=${key}`); await H.waitForTimeout(2500);
  const goTo = (id) => T.evaluate(async ([c, id]) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); const L = DS.Lessons.get(R.meta.lesson); if (R.state.step < 0) await DS.Act.go(c, R, L, 1); await DS.Net.update(`rooms/${c}/state`, { step: L.steps.findIndex((s) => s.id === id), stepAt: Date.now(), focus: false }); }, [code, id]);
  // ① 일반 문제(m1) = 잠금 없음 · 중단원 문항(u4) = 60초 잠금
  await goTo('m1'); await T.waitForTimeout(1500); log.push('① m1 학생: ' + (await S.evaluate(() => (document.querySelector('.sl-scene') ? '꽁꽁' : document.querySelector('#st-body .items') ? '문제 칸' : '?'))));
  await goTo('u4'); await T.waitForTimeout(1800);
  log.push('   u4 학생: ' + (await S.evaluate(() => (document.querySelector('.sl-scene') ? `꽁꽁 · ${document.querySelector('.sl-left').textContent}` : document.querySelector('#st-body .items') ? '문제 칸' : '?'))));
  await S.screenshot({ path: `${OUT}/66-1-frozen.png` });
  await H.waitForTimeout(800); log.push('   종합실: ' + (await H.evaluate(() => `${document.querySelector('.h-solve') ? document.querySelector('.h-solve').textContent.slice(0, 20) : '배너 없음'} · 얼음 용사 ${document.querySelectorAll('.fh2.frozen').length}`)) + ' · 몬스터 공격 멈춤 ' + (await H.evaluate(async () => { const c = new URLSearchParams(location.search).get('code'); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); const L = DS.Lessons.get(R.meta.lesson); const k = DS.Raid.atkClock(L, R, Date.now()); return !!(k && k.paused); })));
  await H.screenshot({ path: `${OUT}/66-2-hall-frozen.png` });
  await T.bringToFront(); log.push('   리모컨: ' + ((await T.textContent('.sl-row').catch(() => '없음')) || '').replace(/\s+/g, ' ').slice(0, 40));
  await T.click('[data-sl="now"]'); await T.waitForTimeout(1500);
  log.push('   지금 풀기 → 학생: ' + (await S.evaluate(() => (document.querySelector('.sl-scene') ? '꽁꽁' : document.querySelector('#st-body .items') ? '문제 칸' : '?'))) + ' · 종합실 얼음 ' + (await H.evaluate(() => document.querySelectorAll('.fh2.frozen').length)));
  // ② 🎁 선물 → 던전 안 학생 알림
  await T.evaluate(() => DS.Gem.gift('1-3', 1, 10, 'e2e66')); await S.waitForTimeout(1200);
  log.push('② 선물 알림(던전): ' + (await S.evaluate(() => (document.querySelector('.gift-note') ? document.querySelector('.gift-note').textContent : '없음'))));
  // ③ 🏕 수업 중 캠프 보기 → 돌아가기
  await H.bringToFront(); await H.click('#h-camp'); await H.waitForTimeout(1500);
  log.push('③ 캠프 보기: ' + (await H.evaluate(() => document.querySelector('.screen.active').id)) + ' · 돌아가기 단추 「' + ((await H.textContent('#tc-menu').catch(() => '')) || '').trim() + '」');
  await H.click('#tc-menu'); await H.waitForTimeout(1000); log.push('   돌아감: ' + (await H.evaluate(() => document.querySelector('.screen.active').id)));
  // ④ ⏸ 수업 끝 (저장) at u6 → 이어서
  await goTo('u6'); await T.waitForTimeout(1200); await T.bringToFront();
  log.push('④ 저장 단추: ' + !!(await T.$('[data-saveend]'))); await T.click('[data-saveend]'); await T.waitForTimeout(2000);
  log.push('   저장 뒤: closed ' + (await T.evaluate(async (c) => { const st = await DS.Net.get(`rooms/${c}/state`); return `${!!st.closed} · savedStop ${st.savedStop}`; }, code)) + ' · prep resume ' + JSON.stringify(await T.evaluate(async () => { const v = await DS.Net.get('prep/set-06/resume/1-3'); return v && v.stop; })));
  await T.evaluate(() => { try { DS.Scene.clear(); localStorage.removeItem('citadel-teacher'); } catch (e) { /* */ } }); await T.goto(U + '&role=teacher'); await T.waitForTimeout(2000); if (await T.isVisible('#splash')) { await T.click('#splash'); await T.waitForTimeout(400); }
  if (!(await T.isVisible('#lesson'))) { await T.click('.role[data-role=teacher]').catch(() => {}); await T.waitForTimeout(600); }
  console.log(log.join('\n'));
  await T.selectOption('#t-cls', '1-3'); await T.waitForTimeout(800); await T.selectOption('#lesson', 'set-06'); await T.dispatchEvent('#lesson', 'change'); await T.waitForTimeout(1200);
  log.push('   이어서 단추: ' + ((await T.textContent('#t-resume2').catch(() => '없음')) || '').replace(/\s+/g, ' ') + ' · 보임 ' + (await T.isVisible('#t-resume2').catch(() => false)));
  await T.click('#t-resume2'); await T.waitForTimeout(1500);
  const code2 = await T.evaluate(() => DS.Teacher.code());
  await T.evaluate(async (c) => { await DS.Net.set(`rooms/${c}/players/v1`, { num: 1, nick: '용사', hero: 0, at: Date.now() }); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); await DS.Act.go(c, R, DS.Lessons.get(R.meta.lesson), 1); }, code2); await T.waitForTimeout(1200);
  log.push('   이어서 시작 단계: ' + (await T.evaluate(async (c) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); const L = DS.Lessons.get(R.meta.lesson); return `${L.steps[R.state.step].id} (resumeFrom ${R.meta.resumeFrom}) · 새 코드 ${c !== '${code}'}`; }, code2)) + ' · 저장 지점 지움 ' + (await T.evaluate(async () => (await DS.Net.get('prep/set-06/resume/1-3')) == null)));
  console.log(log.join('\n')); console.log('errors', errs.length ? errs : 'none'); await b.close();
})();
