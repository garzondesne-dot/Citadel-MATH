// 🔄 차시 바꾸기 · 📚 다음 차시 자동 선택 (2026-11-06 사용자 「차시 변경을 빠르게」) — node tools/e2e/e2e64.js <출력 폴더>
//   ① 교사 메뉴: 반을 고르면 그 반이 안 한 다음 차시가 골라짐 · 이미 한 차시로 열면 확인 창
//   ② 대기실에서 🔄 차시 바꾸기 → 같은 코드 그대로 학생 폰 · 종합실이 새 차시 · 학생 다시 입장 없음 ③ 시작 뒤에는 단추 없음 · 바꾸기 거절
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = [], dialogs = [];
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => { dialogs.push(d.message().split('\n')[0]); d.accept(); }); return p; };
  const T = await mk('T');
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n2 이서연'); await T.click('#r-up'); await T.waitForTimeout(800);
  await T.evaluate(async () => { await DS.Net.set('held/1-3', { 'set-02': true, 'set-03': true, 'set-04': true }); });
  await T.click('#screen-students .nav-back'); await T.waitForTimeout(1500); if (await T.isVisible('#splash')) { await T.click('#splash'); await T.waitForTimeout(400); }
  if (!(await T.isVisible('#lesson'))) { await T.click('.role[data-role=teacher]'); await T.waitForTimeout(600); }
  await T.selectOption('#t-cls', '1-3'); await T.waitForTimeout(700);
  log.push('① 자동 선택: ' + (await T.$eval('#lesson', (e) => e.value)) + ' · 안내 「' + ((await T.textContent('#t-lhint').catch(() => '')) || '').trim() + '」');
  await T.selectOption('#lesson', 'set-04'); await T.click('#t-new'); await T.waitForTimeout(1500);
  log.push('   이미 한 4차시로 열기 → 확인 창: ' + (dialogs.find((m) => /이미 게임으로/.test(m)) || '없음'));
  const code = await T.evaluate(() => DS.Teacher.code()), key = (await T.textContent('#t-key')).trim();
  // 학생 입장
  const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1500); if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(500); }
  await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
  await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200);
  await S.evaluate(() => { localStorage.setItem('citadel-tut-1-3-1', JSON.stringify({ a: true, b: true })); }); await S.click('#s-go'); await S.waitForTimeout(2000); await S.click('#camp-gate'); await S.waitForTimeout(2500);
  const stuLesson = () => S.evaluate(async () => { const c = JSON.parse(localStorage.getItem('citadel-student')).code; const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); return { code: c, lesson: R.meta.lesson, screen: (document.querySelector('.screen.active') || {}).id, head: ((document.querySelector('#st-body .lobby-scene, #st-body') || {}).textContent || '').replace(/\s+/g, ' ').slice(0, 60) }; });
  log.push('학생 입장: ' + JSON.stringify(await stuLesson()));
  const H = await mk('H'); await H.setViewportSize({ width: 1600, height: 900 }); await H.goto(`${U}&role=hall&code=${code}&key=${key}`); await H.waitForTimeout(2500);
  // ② 교사 리모컨 🔄
  await T.bringToFront(); log.push('교사 리모컨 단추: ' + !!(await T.$('[data-lswitch]')));
  await T.click('[data-lswitch]'); await T.waitForTimeout(400); await T.screenshot({ path: `${OUT}/64-picker.png` });
  await T.click('[data-ls="set-05"]'); await T.waitForTimeout(1800);
  const s2 = await stuLesson(); log.push('② 바꾼 뒤 학생: ' + JSON.stringify(s2) + ' · 같은 코드 ' + (s2.code === code));
  log.push('   교사 머리말: ' + (await T.textContent('#t-head')).replace(/\s+/g, ' ').slice(0, 60));
  log.push('   종합실 정보: ' + (await H.evaluate(() => ((document.querySelector('#tc-info') || document.querySelector('#h-top')) || {}).textContent || '')).replace(/\s+/g, ' ').slice(0, 80));
  log.push('   캠프 문 꼬리표(live): ' + JSON.stringify(await T.evaluate(async () => { const v = await DS.Net.get('live/1-3'); return { lesson: v.lesson, no: v.no }; })));
  // ③ 수업 시작 → 단추 없음 · 바꾸기 거절
  await T.evaluate(async () => { const c = DS.Teacher.code(); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); await DS.Act.go(c, R, DS.Lessons.get(R.meta.lesson), 1); }); await T.waitForTimeout(1500);
  log.push('③ 시작 뒤 차시: ' + (await T.evaluate(async () => { const c = DS.Teacher.code(); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); return R.meta.lesson + ' · 첫 단계 ' + DS.Lessons.get(R.meta.lesson).steps[R.state.step].id; })) + ' · 단추 ' + !!(await T.$('[data-lswitch]')));
  log.push('   시작 뒤 바꾸기: ' + (await T.evaluate(async () => { const c = DS.Teacher.code(); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); try { await DS.Act.switchLesson(c, R, 'set-06'); return '바뀜 ✘'; } catch (e) { return '거절 ✔ ' + e.message; } })));
  log.push('   학생 폰 단계: ' + JSON.stringify(await stuLesson()));
  const ok = log[0].includes('set-05') && /이미 게임으로/.test(log[1]) && s2.lesson === 'set-05' && s2.code === code && /거절/.test(log.join(''));
  console.log(log.join('\n')); console.log(ok ? '✅ 통과' : '❌ 기대와 다름'); console.log('errors', errs.length ? errs : 'none'); await b.close();
})();
