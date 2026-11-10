// 📢 #61 공지 팝업 (2026-11-10): 교사 「모든 반에 보내기」(확인 · 같은 id · 전체) → 학생 캠프 팝업 → 📮 우편함 열기 = 캠프 📮 창
//   → 다시 와도 안 뜸 · 새 공지 2개 = 「새 공지 2개」 · 대기실에서도 한 번 · 문제 화면이 되면 닫힘 — node tools/e2e/e2e93.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = [], dlg = [];
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => { dlg.push(d.message()); d.accept(); }); return p; };
  const ck = (c, m) => { log.push(`${c ? '✔' : '✘'} ${m}`); return c; }; let ok = true; const C = (c, m) => { ok = ck(c, m) && ok; };
  const T = await mk('T');
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500);
  await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n2 이서연'); await T.click('#r-up'); await T.waitForTimeout(800);
  await T.evaluate(async () => { await DS.Net.set('rosterMask/1-4', { 1: '박*우' }); }); // 둘째 반 (명단 가림 기록만)
  // ① 교사 「모든 반에 보내기」
  await T.evaluate(() => DS.Mail.teacher()); await T.waitForTimeout(800);
  await T.fill('#tm-t', '내일 8차시 형성평가 있어요'); await T.click('#tm-all'); await T.waitForTimeout(1200);
  C(dlg.some((d) => /^2개 반에 보낼까요\?$/.test(d)), `확인 창 「2개 반에 보낼까요?」 (${dlg.join(' / ')})`);
  const nt = await T.evaluate(async () => ({ a: await DS.Net.get('notice/1-3'), b: await DS.Net.get('notice/1-4') }));
  const ia = Object.keys(nt.a || {}), ib = Object.keys(nt.b || {});
  C(ia.length === 1 && ib.length === 1 && ia[0] === ib[0] && nt.a[ia[0]].all === true && nt.a[ia[0]].t === '내일 8차시 형성평가 있어요', '두 반에 같은 id · all 표시');
  C(/전체/.test(await T.textContent('.camp-modal .mail-list')), '교사 공지 목록 「전체」');
  await T.screenshot({ path: `${OUT}/1-teacher-all.png` }); await T.evaluate(() => document.querySelector('#tm-x').click());
  // ② 학생 캠프 팝업
  const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1500);
  if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(500); }
  await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
  await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200);
  await S.evaluate(() => { localStorage.setItem('citadel-tut-1-3-1', JSON.stringify({ a: true, b: true })); });
  await S.click('#s-go'); await S.waitForTimeout(800);
  await S.evaluate(async () => { await DS.Net.update('xp/1-3/1/tut', { a: true, b: true }); }); await S.evaluate(() => DS.Camp.back());
  await S.waitForSelector('.nt-pop', { timeout: 6000 }).catch(() => {});
  const p1 = (await S.$('.nt-pop')) ? (await S.textContent('.nt-pop')).replace(/\s+/g, ' ') : '';
  C(/선생님 공지/.test(p1) && /내일 8차시 형성평가 있어요/.test(p1) && !/새 공지/.test(p1), `캠프 팝업 (${p1.slice(0, 60)})`);
  await S.screenshot({ path: `${OUT}/2-camp-pop.png` });
  await S.click('#nt-mail'); await S.waitForTimeout(1000);
  C(!(await S.$('.nt-pop')) && !!(await S.$('.mail-modal')), '📮 우편함 열기 = 캠프 📮 창');
  await S.screenshot({ path: `${OUT}/3-mail.png` }); await S.evaluate(() => document.querySelector('#ml-x').click()); await S.waitForTimeout(300);
  await S.evaluate(() => DS.Camp.back()); await S.waitForTimeout(1800);
  C(!(await S.$('.nt-pop')), '다시 캠프 → 안 뜸');
  // ③ 새 공지 2개
  await T.evaluate(async () => { await DS.Mail.notice('1-3', '첫 공지'); await new Promise((r) => setTimeout(r, 20)); await DS.Mail.notice('1-3', '둘째 공지'); });
  await S.evaluate(() => DS.Camp.back()); await S.waitForSelector('.nt-pop', { timeout: 6000 }).catch(() => {});
  const p2 = (await S.$('.nt-pop')) ? (await S.textContent('.nt-pop')).replace(/\s+/g, ' ') : '';
  C(/새 공지 2개/.test(p2) && /둘째 공지/.test(p2), `새 공지 2개 + 최근 것 (${p2.slice(0, 60)})`);
  await S.screenshot({ path: `${OUT}/4-two.png` }); await S.click('#nt-x'); await S.waitForTimeout(300);
  C(!(await S.$('.nt-pop')), '닫기');
  // ④ 대기실: 새 공지 → 입장하면 한 번 · 문제 화면이 되면 닫힘
  await T.evaluate(async () => { await DS.Mail.notice('1-3', '대기실 공지'); });
  const code = await T.evaluate(async () => { const c = await DS.Act.createRoom('set-04', '1-3'); return c.code || c; });
  await S.evaluate((c) => DS.Student.enter(c, { cls: '1-3', num: 1, nick: '김민준', hero: 0, fx: 'flame' }), code);
  await S.waitForSelector('.nt-pop', { timeout: 6000 }).catch(() => {});
  const p3 = (await S.$('.nt-pop')) ? await S.textContent('.nt-pop') : '';
  C(/대기실 공지/.test(p3) && !!(await S.$('#screen-student.active')), '대기실 팝업');
  await S.screenshot({ path: `${OUT}/5-lobby.png` });
  await T.evaluate(async (c) => { await DS.Teacher.open(c, ''); }, code); await T.waitForTimeout(800);
  await T.evaluate(async (c) => { await DS.Net.set(`rooms/${c}/state/phase`, 'play'); }, code);
  await T.evaluate(async (c) => { const L = DS.Lessons.get('set-04'); const i = L.steps.findIndex((s) => s.kind === 'monster'); await DS.Net.update(`rooms/${c}/state`, { step: i }); await DS.Net.set(`rooms/${c}/active`, Object.fromEntries(Object.keys((await DS.Net.get(`rooms/${c}/players`)) || {}).map((u) => [u, true]))); }, code);
  await S.waitForTimeout(2500);
  const lob = await S.evaluate(() => !!document.querySelector('.lobby-scene'));
  C(lob || !(await S.$('.nt-pop')), `문제 화면 → 팝업 닫힘 (대기실 ${lob})`);
  await S.screenshot({ path: `${OUT}/6-battle.png` });
  // ⑤ 🧪 테스트 모드도 같은 길: 실제 공지 중 가장 최근 것이 테스트 캠프에 팝업
  await T.setViewportSize({ width: 390, height: 844 }); await T.evaluate(() => { document.querySelectorAll('.modal:not(.hidden)').forEach((e) => e.remove()); DS.Test.start('set-06'); }); await T.waitForSelector('.nt-pop', { timeout: 8000 }).catch(() => {});
  const p4 = (await T.$('.nt-pop')) ? await T.textContent('.nt-pop') : '';
  C(/대기실 공지/.test(p4) && /테스트/.test(await T.evaluate(() => DS.Test && DS.Test.active && DS.Test.active() ? '테스트' : '')), `테스트 캠프 팝업 (${p4.slice(0, 30)})`);
  await T.screenshot({ path: `${OUT}/7-test.png` });
  console.log(log.join('\n')); console.log(ok ? '✅ 통과' : '❌ 기대와 다름'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (!ok || errs.length) process.exit(1);
})();
