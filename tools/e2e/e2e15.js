const { chromium } = require('playwright');
const OUT = process.argv[2], PDF = process.argv[3], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [];
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T'); await T.setViewportSize({ width: 1280, height: 900 });
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', process.env.E2E_ID || 'e2e-teacher'); await T.fill('#f-teacher .t-pw', process.env.E2E_PW || '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  // ① 수업 준비: 5차시 학습지 PDF → 칸 이미지 비율
  await T.selectOption('#p-lesson', 'set-05'); await T.click('#p-go'); await T.waitForTimeout(800);
  { const b64 = require('fs').readFileSync(PDF).toString('base64'); await T.evaluate((b64) => { const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)); const fl = new File([bin], 'w5.pdf', { type: 'application/pdf' }); const dt = new DataTransfer(); dt.items.add(fl); const i = document.querySelector('#p-pdf'); i.files = dt.files; i.dispatchEvent(new Event('change')); }, b64); } await T.waitForSelector('#p-all', { timeout: 30000 }); await T.click('#p-all'); await T.waitForTimeout(2500);
  const sizes = await T.evaluate(async () => { const img = (await DS.Net.get('prep/set-05/img')) || {}; const out = {}; for (const [k, v] of Object.entries(img)) { const im = new Image(); im.src = v; await im.decode(); out[k] = `${im.width}x${im.height} (${(im.width / im.height).toFixed(2)})`; } return out; });
  console.log('slot images:', JSON.stringify(sizes));
  const c1 = await T.evaluate(async () => (await DS.Net.get('prep/set-05/img/c1'))); require('fs').writeFileSync(`${OUT}/c1.webp`, Buffer.from(c1.split(',')[1], 'base64'));
  const boss = await T.evaluate(async () => (await DS.Net.get('prep/set-05/img/boss'))); require('fs').writeFileSync(`${OUT}/boss.webp`, Buffer.from(boss.split(',')[1], 'base64'));
  // 수업 · 학생 · 종합상황실
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200); if (await T.isVisible('#splash')) { await T.click('#splash'); await T.waitForTimeout(400); }
  if (!(await T.isVisible('#s-go'))) { await T.click('.role[data-role=teacher]'); await T.waitForTimeout(600); }
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n2 이서연'); await T.click('#r-up'); await T.waitForTimeout(800);
  await T.click('#screen-students .nav-back'); await T.waitForTimeout(1500); if (await T.isVisible('#splash')) { await T.click('#splash'); await T.waitForTimeout(400); }
  if (!(await T.isVisible('#lesson'))) { await T.click('.role[data-role=teacher]'); await T.waitForTimeout(600); }
  await T.selectOption('#lesson', 'set-05'); await T.selectOption('#t-cls', '1-3'); await T.click('#t-new'); await T.waitForTimeout(1500);
  const code = await T.evaluate(() => DS.Teacher.code()), key = (await T.textContent('#t-key')).trim();
  const S1 = await mk('S1'); await S1.goto(U + '&role=student'); await S1.waitForTimeout(1500); if (await S1.isVisible('#splash')) { await S1.click('#splash'); await S1.waitForTimeout(500); }
  await S1.selectOption('#s-cls', '1-3'); await S1.waitForTimeout(200); await S1.selectOption('#s-num', '1'); await S1.waitForTimeout(300);
  await S1.click('#s-new'); await S1.fill('#s-p1', '1234'); await S1.fill('#s-p2', '1234'); await S1.click('#s-make'); await S1.waitForTimeout(1200); await S1.click('#s-go'); await S1.waitForTimeout(2000); await S1.click('#camp-gate'); await S1.waitForTimeout(2500);
  const H = await mk('H'); await H.setViewportSize({ width: 1600, height: 900 }); await H.goto(`${U}&role=hall&code=${code}&key=${key}`); await H.waitForTimeout(2500);
  const go = () => T.evaluate(async () => { const code = DS.Teacher.code(); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); await DS.Act.go(code, R, DS.Lessons.get(R.meta.lesson), 1); });
  await go(); await T.waitForTimeout(1500); // 개념 1
  await H.screenshot({ path: `${OUT}/1-concept1.png` });
  console.log('fs button:', !!(await H.$('#h-fs')));
  await go(); await T.waitForTimeout(1500); // 문제 1
  // 학생 공격 → 공격 자세 프레임
  await S1.evaluate(async () => { const code = JSON.parse(localStorage.getItem('citadel-student')).code; const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); const L = DS.Lessons.get(R.meta.lesson), st = DS.Raid.stepOf(L, R), me = DS.Net.uid(); const its = DS.Raid.itemsFor(L, R, st.id, me, 0); await DS.Act.submit(code, R, st.id, 0, its.map((q) => (q.type === 'choice' ? q.answerIndex : q.answer))); });
  const poses = [];
  for (let k = 0; k < 14; k++) { await H.waitForTimeout(80); poses.push(await H.evaluate(() => { const a = document.querySelector('.fh2 .art'); return a ? getComputedStyle(a).backgroundPosition : ''; })); if (k === 5) await H.screenshot({ path: `${OUT}/2-attack-pose.png` }); }
  console.log('hero bg positions during attack:', [...new Set(poses)].join(' | '));
  await H.waitForTimeout(2000);
  // ④ 시연
  await H.click('#h-demo'); await H.waitForTimeout(600); await H.screenshot({ path: `${OUT}/3-demo-open.png` });
  const ans = await H.evaluate(() => DS.Lessons.get('set-05').items('m1', 'x', 0).map((q) => q.answer));
  for (let i = 0; i < ans.length; i++) for (const k of ans[i]) { await H.click(`#h-demo-ov [data-pick="${i}|${k}"]`); await H.waitForTimeout(60); }
  await H.click('#demo-go'); await H.waitForTimeout(500); await H.screenshot({ path: `${OUT}/4-demo-result.png` });
  await H.waitForTimeout(1200); await H.screenshot({ path: `${OUT}/5-strike.png` });
  await H.waitForTimeout(1500); await H.screenshot({ path: `${OUT}/6-vanished.png` });
  console.log('cleared:', await T.evaluate(async () => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${DS.Teacher.code()}`)); return DS.Raid.cleared(DS.Lessons.get('set-05'), R, 'm1'); }), 'monster gone:', await H.evaluate(() => document.getElementById('rm').classList.contains('gone')),
    'hp:', await H.textContent('#rh-txt'), 'subs teacher?', await T.evaluate(async () => Object.keys(((await DS.Net.get(`rooms/${DS.Teacher.code()}/subs/m1`)) || {})).length));
  console.log('ERRORS', errs.length, errs.slice(0, 6)); await b.close();
})();
