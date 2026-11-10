// 🛡 홀리 방패 (2026-11-09 · #72 종합실 눈빛 컷인 11-10): +10 학생이 켜 두면 다음 공격 = 날개 · 방패 연출 · 아무도 안 멈춤 · TV 「🛡 준비」 · 석화 10초 → 그다음 공격은 원래대로
// 사용: python3 -m http.server 8765 (저장소 폴더) 띄운 뒤 node tools/e2e/e2e21.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [];
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('console', (m) => { if (m.type() === 'error' && process.env.DBG) console.log(t, 'console:', m.text().slice(0, 200)); }); p.on('dialog', (d) => d.accept()); return p; };
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
  const mid = await T.evaluate(async () => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${DS.Teacher.code()}`)); return DS.Raid.stepOf(DS.Lessons.get(R.meta.lesson), R).id; });
  await S1.bringToFront();
  console.log('button before arm (not passed yet):', !!(await S1.$('.holy-btn')));
  await S1.evaluate(async ([c, m]) => { await DS.Act.holyArm(c, m, true); }, [code, mid]); // 시험용: 통과 조건 건너뛰고 켜기
  await S1.waitForTimeout(800);
  console.log('button on:', await S1.$eval('.holy-btn', (b) => b.className + ' | ' + b.textContent).catch(() => 'none'));
  await S1.screenshot({ path: `${OUT}/h-phone-armed.png` });
  await H.waitForTimeout(400); console.log('TV mark:', await H.$$eval('.fh2 .hg-mark', (a) => a.length)); await H.screenshot({ path: `${OUT}/h-hall-armed.png` });
  await H.evaluate(() => { window.__g72 = null; new MutationObserver(() => { const d = document.querySelector('.ult.guard'); if (d && !window.__g72) window.__g72 = { name: d.querySelector('.u-name').textContent, shield: !!d.querySelector('.u-shield'), face: !!d.querySelector('.u-facepic, .u-face'), wingsYet: !!document.querySelector('.gd-fx') }; }).observe(document.body, { childList: true, subtree: true }); }); // 🛡 #72 눈빛 컷인 (날개보다 먼저)
  await S1.bringToFront();
  await S1.waitForSelector('.gd-fx', { timeout: 9000 }).catch(() => null);
  console.log('phone guard fx:', (await S1.$$('.gd-fx')).length);
  for (const [i, t] of [300, 500, 400, 300, 400].entries()) { await S1.waitForTimeout(t); await Promise.all([S1.screenshot({ path: `${OUT}/g-phone-${i}.png` }), H.screenshot({ path: `${OUT}/g-hall-${i}.png` })]); }
  console.log('hall guard cutin (#72):', JSON.stringify(await H.evaluate(() => window.__g72)));
  console.log('phone stun on block:', await S1.$$eval('.stun:not(.guard)', (a) => a.length));
  await S1.waitForTimeout(800);
  console.log('used recorded:', await S1.evaluate(async ([c, m]) => { const p = await DS.Net.get(`rooms/${c}/players/${DS.Net.uid()}`); return JSON.stringify({ holy: p.holy, hg: p.hg || null }); }, [code, mid]));
  console.log('phone petri banner:', await S1.$eval('.petri-bn', (e) => e.textContent).catch(() => 'none'));
  console.log('hall petri:', await H.$eval('.h-petri', (e) => e.textContent).catch(() => 'none'), '| mark gone:', (await H.$$('.fh2 .hg-mark')).length === 0, '| button gone:', !(await S1.$('.holy-btn')));
  await H.screenshot({ path: `${OUT}/h-hall-petri.png` });
  await S1.waitForSelector('.stun:not(.guard)', { timeout: 25000 }).catch(() => null);
  console.log('next attack stun (after 10s stone):', !!(await S1.$('.stun:not(.guard)')));
  await H.bringToFront(); await H.evaluate(() => { DS.Attack.cutin(0, 'twinkle', { guard: true }); }); await H.waitForTimeout(380); await H.screenshot({ path: `${OUT}/g-hall-cutin.png` });
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
})();
