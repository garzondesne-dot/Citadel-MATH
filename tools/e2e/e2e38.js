// 🏕 쉼터 (2026-11-04): 교사 리모컨 「🏕 쉼터」 → 종합상황실 · 학생 폰 쉼터 장면 · 타이머 +1분 · 끄면 하던 문제로 — node tools/e2e/e2e38.js <출력 폴더>
// ③ 마무리 단계가 되면 캠프 잠금 풀림(선생님이 목록에서 끝내기 전에도) ④ 수업 끝 = 개인 결과 ⑤ 용사 겹침 = 아래쪽이 앞
// 사용: python3 -m http.server 8765 (저장소 폴더) 띄운 뒤 node tools/e2e/e2e25.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = [];
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T');
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n2 이서연'); await T.click('#r-up'); await T.waitForTimeout(800);
  await T.click('#screen-students .nav-back'); await T.waitForTimeout(1500); if (await T.isVisible('#splash')) { await T.click('#splash'); await T.waitForTimeout(400); }
  if (!(await T.isVisible('#lesson'))) { await T.click('.role[data-role=teacher]'); await T.waitForTimeout(600); }
  const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1500); if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(400); }
  await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
  await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200);
  await S.click('#s-go'); await S.waitForTimeout(1200);
  await S.evaluate(async () => { localStorage.setItem('citadel-tut-1-3-1', JSON.stringify({ a: true, b: true })); await DS.Net.update('xp/1-3/1/tut', { a: true, b: true }); });
  await T.selectOption('#lesson', 'set-04'); await T.selectOption('#t-cls', '1-3'); await T.click('#t-new'); await T.waitForTimeout(2000);
  const code = await T.evaluate(() => DS.Teacher.code()), key = (await T.textContent('#t-key')).trim();
  await S.bringToFront(); await S.evaluate(() => DS.Camp.back()); await S.waitForTimeout(1200); await S.click('#camp-gate'); await S.waitForTimeout(2500);
  await T.evaluate(async (c) => { await DS.Net.set(`rooms/${c}/players/v16`, { num: 2, nick: '금발', hero: 16, at: Date.now() }); }, code);
  const go = () => T.evaluate(async () => { const code = DS.Teacher.code(); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); await DS.Act.go(code, R, DS.Lessons.get(R.meta.lesson), 1); });
  await go(); await T.waitForTimeout(600); await T.evaluate(async (c) => { await DS.Net.set(`rooms/${c}/active/v16`, true); await DS.Net.set(`rooms/${c}/state/headcount`, 1); }, code);
  const H = await mk('H'); await H.setViewportSize({ width: 1600, height: 900 }); await H.goto(`${U}&role=hall&code=${code}&key=${key}`); await H.waitForTimeout(1500);
  let kind = ''; for (let k = 0; k < 8; k++) { kind = await T.evaluate(async () => { const code = DS.Teacher.code(); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); const st = DS.Raid.stepOf(DS.Lessons.get(R.meta.lesson), R); return st ? st.kind : ''; }); if (kind === 'monster') break; await go(); await T.waitForTimeout(600); }
  // 🏕 쉼터 켜기 (교사 리모컨 버튼)
  await T.bringToFront(); await T.waitForTimeout(800);
  log.push('리모컨 쉼터 버튼: ' + (await T.textContent('[data-rest]')));
  await T.click('[data-rest]'); await T.waitForTimeout(1500);
  log.push('켜진 뒤 리모컨: ' + (await T.textContent('.rest-ctl')).replace(/\s+/g, ' '));
  await T.click('[data-rest-min="1"]'); await T.waitForTimeout(1200);
  log.push('+1분 뒤 타이머: ' + (await T.textContent('.rest-ctl [data-rest-end]')));
  await T.screenshot({ path: `${OUT}/rest-teacher.png` });
  await H.bringToFront(); await H.waitForTimeout(2500);
  log.push('종합상황실: ' + (await H.evaluate(() => { const e = document.querySelector('.h-lobby2.rest'); return e ? `쉼터 장면 · ${e.querySelector('.lb2-title').textContent} · ${e.querySelector('.rest-timer').textContent.trim()} · 앉은 용사 ${e.querySelectorAll('.lb2-h').length}` : '쉼터 장면 없음'; })));
  await H.screenshot({ path: `${OUT}/rest-hall.png` });
  await S.bringToFront(); await S.waitForTimeout(1500);
  log.push('학생 폰: ' + (await S.evaluate(() => (document.querySelector('.lobby-scene.rest') ? '쉼터 · ' + document.querySelector('.lobby-scene.rest .rest-timer').textContent.trim() : '쉼터 없음 · ' + document.querySelector('#st-body').textContent.slice(0, 40)))));
  await S.screenshot({ path: `${OUT}/rest-phone.png` });
  // 끄기 → 하던 문제로
  await T.bringToFront(); await T.click('[data-rest]'); await T.waitForTimeout(1500);
  await S.bringToFront(); await S.waitForTimeout(1500);
  log.push('끈 뒤 학생 폰: ' + (await S.evaluate(() => (document.querySelector('.lobby-scene.rest') ? '아직 쉼터' : document.querySelector('.items') ? '문제 화면으로 돌아옴' : document.querySelector('#st-body').textContent.slice(0, 40)))));
  await H.bringToFront(); await H.waitForTimeout(1500);
  log.push('끈 뒤 종합상황실: ' + (await H.evaluate(() => (document.querySelector('.h-lobby2.rest') ? '아직 쉼터' : document.querySelector('#rh-atk') ? '레이드 화면' : '?'))));
  console.log(log.join('\n')); console.log('errors:', errs.length ? errs : 'none'); await b.close();
})();
