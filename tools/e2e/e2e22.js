// v2 용사 16명 (v1 변환) 한 화면 확인: 종합상황실 레이드에 0~16번 용사를 모두 세우고 · 몬스터 공격 순간 헉헉 · 학생 설정 용사 목록
// 사용: python3 -m http.server 8765 (저장소 폴더) 띄운 뒤 node tools/e2e/e2e22.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [];
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T');
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n2 이서연'); await T.click('#r-up'); await T.waitForTimeout(800);
  await T.click('#screen-students .nav-back'); await T.waitForTimeout(1500); if (await T.isVisible('#splash')) { await T.click('#splash'); await T.waitForTimeout(400); }
  if (!(await T.isVisible('#lesson'))) { await T.click('.role[data-role=teacher]'); await T.waitForTimeout(600); }
  await T.selectOption('#lesson', 'set-06'); await T.selectOption('#t-cls', '1-3'); await T.click('#t-new'); await T.waitForTimeout(1500);
  const code = await T.evaluate(() => DS.Teacher.code()), key = (await T.textContent('#t-key')).trim();
  await T.evaluate(async (c) => { for (let h = 0; h <= 16; h++) { if (h === 7) continue; await DS.Net.set(`rooms/${c}/players/v${h}`, { num: h + 1, nick: `용사${h}`, hero: h, at: Date.now() }); } }, code);
  const go = () => T.evaluate(async () => { const code = DS.Teacher.code(); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); await DS.Act.go(code, R, DS.Lessons.get(R.meta.lesson), 1); });
  await go(); await T.waitForTimeout(600);
  await T.evaluate(async (c) => { for (let h = 0; h <= 16; h++) if (h !== 7) await DS.Net.set(`rooms/${c}/active/v${h}`, true); }, code);
  for (let k = 0; k < 2; k++) { await go(); await T.waitForTimeout(700); } // 개념1 → 문제1
  const H = await mk('H'); await H.setViewportSize({ width: 1600, height: 900 }); await H.goto(`${U}&role=hall&code=${code}&key=${key}`); await H.waitForTimeout(3000);
  await H.screenshot({ path: `${OUT}/1-hall-16.png` });
  await H.evaluate(() => { window.DS_ATK = { monster: [3, 1], boss: [3, 2] }; });
  await H.waitForSelector('.atk-banner', { timeout: 6000 }).catch(() => null); await H.waitForTimeout(700);
  console.log('hall heroes:', await H.$$eval('.fh2 .art', (as) => as.map((a) => a.dataset.anim || '?').join(',')));
  await H.screenshot({ path: `${OUT}/2-hall-strike.png` });
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
})();
