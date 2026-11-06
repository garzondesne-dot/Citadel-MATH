// 📅 진도 예정표 (2026-11-06 사용자 확정): 정규 시간표 → 칸마다 「반 · n차시」(+1씩) · ➕ 보충 = 차시 당겨짐 · 쉼 = 밀림 · 칸 눌러 열기 · 마무리 「수업 끝」= 다음 차시 · ⏸ 저장 = 같은 차시(이어서) — node tools/e2e/e2e69.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); const errs = [], log = [];
  const T = await ctx.newPage(); T.on('pageerror', (e) => errs.push(e.message)); T.on('dialog', (d) => d.accept());
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-2'); await T.fill('#r-text', '1 김민준'); await T.click('#r-up'); await T.waitForTimeout(800);
  await T.evaluate(async () => { // 1-2반: 월 1교시 · 수 3교시 · 금 2교시 · 4차시까지 함 (held 2~4, 4차시 보스 이김)
    await DS.Net.set('sched/week', { '1-1': '1-2', '3-3': '1-2', '5-2': '1-2' });
    await DS.Net.set('held/1-2', { 'set-02': true, 'set-03': true, 'set-04': true }); await DS.Net.set('records/1-2/1/set-04', { won: true, no: 4 });
  });
  const plan = () => T.evaluate(async () => (await DS.Sched.plan({ days: 14 })).filter((x) => x.cls === '1-2').slice(0, 4).map((x) => `${x.date.slice(5)} ${x.p}교시${x.extra ? '(보충)' : ''}=${x.no || '-'}${x.resume ? '⏸' : ''}${x.code ? (x.doneL ? '✔' : x.saved ? '(저장)' : '(열림)') : ''}`).join(' · '));
  log.push('① 처음 (4차시 끝 → 5차시부터): ' + await plan());
  const first = await T.evaluate(async () => (await DS.Sched.plan({ days: 14 })).find((x) => x.cls === '1-2'));
  // ② 보충 넣기 (첫 칸 전날 · 6교시) → 보충이 5차시 · 정규가 6 · 7
  const exDay = await T.evaluate((d) => { const t = Date.parse(`${d}T12:00:00+09:00`) - 86400e3; return new Date(t + 9 * 3600e3).toISOString().slice(0, 10); }, first.date);
  const exOk = await T.evaluate(async (d) => { const now = DS.Net.now(), t = Date.parse(`${d}T15:50:00+09:00`); if (t <= now) return false; await DS.Sched.addExtra(d, 6, '1-2'); return true; }, exDay);
  log.push('② 보충 추가' + (exOk ? '' : ' (어제라 건너뜀)') + ': ' + await plan());
  // ③ 첫 정규 칸 쉼 → 뒤로 밀림
  await T.evaluate(async (k) => DS.Sched.skipSlot(k, true), first.key);
  log.push('③ 첫 정규 칸 쉼: ' + await plan());
  await T.evaluate(async (k) => DS.Sched.skipSlot(k, false), first.key);
  if (exOk) await T.evaluate(async (d) => DS.Sched.removeExtra(`${d}_6`), exDay);
  // ④ 칸에서 열기 → 5차시 방 · 마무리까지 → 수업 끝 → 진도 6
  await T.evaluate(async () => { const x = (await DS.Sched.plan({ days: 14 })).find((s) => s.cls === '1-2' && !s.code && !s.past); await DS.Sched.openSlot(x); });
  await T.waitForTimeout(1200);
  const code = await T.evaluate(() => DS.Teacher.code());
  log.push('④ 칸에서 연 방: ' + (await T.evaluate(async (c) => { const m = await DS.Net.get(`rooms/${c}/meta`); return `${m.lesson} · slot ${m.slot && m.slot.key}`; }, code)));
  await T.evaluate(async (c) => { await DS.Net.set(`rooms/${c}/players/v1`, { num: 1, nick: '용사', hero: 0, at: Date.now(), cls: '1-2' }); let R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); const L = DS.Lessons.get(R.meta.lesson); await DS.Act.go(c, R, L, 1); await DS.Net.update(`rooms/${c}/state`, { step: L.steps.length }); await DS.Act.endClass(c); }, code);
  log.push('   마무리 · 수업 끝 → ' + await plan());
  // ⑤ 다음 칸 열고 중간에 ⏸ 저장 → 같은 차시(이어서)
  await T.evaluate(async () => { const x = (await DS.Sched.plan({ days: 14 })).find((s) => s.cls === '1-2' && !s.code && !s.past); await DS.Sched.openSlot(x); }); await T.waitForTimeout(1000);
  const code2 = await T.evaluate(() => DS.Teacher.code());
  await T.evaluate(async (c) => { await DS.Net.set(`rooms/${c}/players/v1`, { num: 1, nick: '용사', hero: 0, at: Date.now(), cls: '1-2' }); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); const L = DS.Lessons.get(R.meta.lesson); await DS.Act.go(c, R, L, 1); await DS.Net.update(`rooms/${c}/state`, { step: 4 }); await DS.Act.saveEnd(c); }, code2);
  log.push('⑤ 중간에 ⏸ 저장 → ' + await plan());
  // ⑥ 화면: 교사 메뉴 오늘 수업 · 시간표 창
  await T.evaluate(() => { try { DS.Scene.clear(); localStorage.removeItem('citadel-teacher'); } catch (e) { /* */ } }); await T.goto(U + '&role=teacher'); await T.waitForTimeout(2200);
  if (await T.isVisible('#splash')) { await T.click('#splash'); await T.waitForTimeout(400); }
  if (!(await T.isVisible('#t-today'))) { await T.click('.role[data-role=teacher]').catch(() => {}); await T.waitForTimeout(800); }
  await T.waitForTimeout(1200); log.push('⑥ 오늘 수업 칸: ' + ((await T.textContent('#t-today').catch(() => '')) || '').replace(/\s+/g, ' ').slice(0, 120));
  await T.click('#t-today [data-sc]'); await T.waitForTimeout(1500);
  log.push('   시간표 칸 꼬리표: ' + (await T.$$eval('.sc-next', (x) => x.map((e) => e.textContent).filter(Boolean).join(' | '))) + ' · 진도 맞추기 1-2반 = ' + (await T.$eval('[data-pg="1-2"]', (e) => e.selectedOptions[0].textContent).catch(() => '없음')));
  await T.screenshot({ path: `${OUT}/69-editor.png`, fullPage: true });
  console.log(log.join('\n')); console.log('errors', errs.length ? errs : 'none'); await b.close();
})();
