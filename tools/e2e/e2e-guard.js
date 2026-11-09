// ⭐ 각성 첫 공격 막기 (2026-11-09): +10 학생이 있으면 몬스터 첫 공격 = 날개 · 방패 연출 · 아무도 안 멈춤 → 두 번째 공격은 원래대로 멈춤
// 사용: python3 -m http.server 8765 (저장소 폴더) 띄운 뒤 node tools/e2e/e2e21.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [];
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T');
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n2 이서연\n3 박지호'); await T.click('#r-up'); await T.waitForTimeout(800);
  await T.click('#screen-students .nav-back'); await T.waitForTimeout(1500); if (await T.isVisible('#splash')) { await T.click('#splash'); await T.waitForTimeout(400); }
  if (!(await T.isVisible('#lesson'))) { await T.click('.role[data-role=teacher]'); await T.waitForTimeout(600); }
  const S1 = await mk('S1'); await S1.goto(U + '&role=student'); await S1.waitForTimeout(1500);
  if (await S1.isVisible('#splash')) { await S1.click('#splash'); await S1.waitForTimeout(500); }
  await S1.selectOption('#s-cls', '1-3'); await S1.waitForTimeout(200); await S1.selectOption('#s-num', '1'); await S1.waitForTimeout(300);
  await S1.click('#s-new'); await S1.fill('#s-p1', '1234'); await S1.fill('#s-p2', '1234'); await S1.click('#s-make'); await S1.waitForTimeout(1200);
  await S1.click('#s-go'); await S1.waitForTimeout(2000);
  // 수업 열기 → 차원문
  await T.selectOption('#lesson', 'set-06'); await T.selectOption('#t-cls', '1-3'); await T.click('#t-new'); await T.waitForTimeout(2500);
  const code = await T.evaluate(() => DS.Teacher.code()), key = (await T.textContent('#t-key')).trim();
  const H = await mk('H'); await H.setViewportSize({ width: 1600, height: 900 }); await H.goto(`${U}&role=hall&code=${code}&key=${key}`); await H.waitForTimeout(2500);
  await S1.bringToFront(); await S1.waitForTimeout(1500);
  await S1.click('#camp-gate'); await S1.waitForTimeout(4000);
  const go = () => T.evaluate(async () => { const code = DS.Teacher.code(); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); await DS.Act.go(code, R, DS.Lessons.get(R.meta.lesson), 1); });
  // +10 각성으로 (시험용: 방 기록에 바로)
  await S1.evaluate(async (c) => { await DS.Net.update(`rooms/${c}/players/${DS.Net.uid()}`, { enh: 10 }); }, code);
  await T.evaluate(async () => { await DS.Net.update(`rooms/${DS.Teacher.code()}/state`, { solve: 0 }); }); // 🌫 정찰 없이 바로 전투 (시험용)
  const kind = () => T.evaluate(async () => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${DS.Teacher.code()}`)); const s = DS.Raid.stepOf(DS.Lessons.get(R.meta.lesson), R); return s ? s.kind : '-'; });
  for (let k = 0; k < 8 && (await kind()) !== 'monster'; k++) { await go(); await T.waitForTimeout(800); }
  await S1.waitForTimeout(1500);
  console.log('step kind:', await kind());
  await S1.evaluate(() => { window.DS_ATK = { monster: [6, 1], boss: [6, 2] }; }); await H.evaluate(() => { window.DS_ATK = { monster: [6, 1], boss: [6, 2] }; });
  await S1.bringToFront();
  await S1.waitForSelector('.gd-fx', { timeout: 9000 }).catch(() => null);
  console.log('phone guard fx:', (await S1.$$('.gd-fx')).length);
  for (const [i, t] of [300, 500, 400, 300, 400].entries()) { await S1.waitForTimeout(t); await Promise.all([S1.screenshot({ path: `${OUT}/g-phone-${i}.png` }), H.screenshot({ path: `${OUT}/g-hall-${i}.png` })]); }
  console.log('phone stun on first:', await S1.$$eval('.stun:not(.guard)', (a) => a.length), 'guard note:', await S1.$$eval('.stun.guard', (a) => a.length));
  await H.bringToFront();
  console.log('hall guard banner:', !!(await H.$('.atk-banner.guard')), 'hall fx:', (await H.$$('.gd-fx')).length);
  await H.screenshot({ path: `${OUT}/g-hall.png` });
  await S1.bringToFront();
  await S1.waitForSelector('.stun:not(.guard)', { timeout: 9000 }).catch(() => null);
  console.log('second attack stun:', !!(await S1.$('.stun:not(.guard)')));
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
})();
