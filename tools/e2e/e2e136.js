// 🏕 2026-11-13 선생님 「쉼터상태에서 앞으로누르면 자동으로 수업으로」: 쉼터(놀이 고르기 · 놀이 중) 에서 리모컨 「앞으로 ▶」 = 쉼터 · 놀이 닫고 다음 단계 — PORT=8766 node tools/e2e/e2e136.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = `http://localhost:${process.env.PORT || 8765}/index.html?local`;
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = []; let bad = 0;
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T'); await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.evaluate(() => DS.Account.uploadRoster([{ c: '1-3', n: 1, name: '가' }])); await T.reload(); await T.waitForTimeout(1500); if (await T.isVisible('#splash')) { await T.click('#splash'); await T.waitForTimeout(400); }
  await T.selectOption('#t-cls', '1-3'); await T.waitForTimeout(400); await T.selectOption('#lesson', 'set-03'); await T.click('#t-new'); await T.waitForTimeout(2500);
  const code = await T.evaluate(() => DS.Teacher.code()), key = (await T.textContent('#t-key')).trim();
  const H = await mk('H'); await H.setViewportSize({ width: 1280, height: 720 }); await H.goto(`${U}&role=hall&code=${code}&key=${key}`); await H.waitForTimeout(2500);
  await T.evaluate(async (c) => { for (let n = 1; n <= 4; n++) { await DS.Net.set(`rooms/${c}/players/s${n}`, { num: n, nick: `학생${n}`, hero: n, fx: 'flame', cls: '1-3', at: Date.now() }); await DS.Net.set(`rooms/${c}/online/s${n}`, true); } }, code);
  const room = () => T.evaluate(async (c) => DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)), code);
  const fwd = async () => { await T.evaluate(() => document.querySelector('#t-fwd').click()); await T.waitForTimeout(1500); };
  await fwd(); await fwd(); // 수업 시작 → 도입 → 개념 1
  const s0 = (await room()).state.step;
  // ① 쉼터 (놀이 고르기 화면)에서 앞으로
  await T.evaluate((c) => DS.Act.setRest(c, true, 5), code); await T.waitForTimeout(1500);
  ok(!!(await room()).state.rest, `쉼터 켬 (단계 ${s0})`);
  await fwd(); await H.waitForTimeout(1200);
  let R = await room();
  ok(!R.state.rest && R.state.step === s0 + 1, `쉼터에서 앞으로 ▶ = 쉼터 닫고 다음 단계 (${s0} → ${R.state.step})`);
  ok(!(await H.$('#screen-hall .fa-arena, #screen-hall .rest-scene, #screen-hall .h-rest')), '종합실 = 쉼터 화면 사라짐');
  // ② 놀이 중(⚖ 밸런스)에 앞으로
  const s1 = R.state.step;
  await T.evaluate(async (c) => { await DS.Act.setRest(c, true, 5); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); for (let n = 1; n <= 4; n++) await DS.Net.set(`rooms/${c}/active/s${n}`, true); await DS.Fun.start(c, DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)), 'bal'); }, code);
  await T.waitForTimeout(2000);
  R = await room(); ok(!!R.state.rest && !!R.fun, '쉼터 + ⚖ 밸런스 놀이 진행 중');
  await H.screenshot({ path: `${OUT}/136-rest-fun.png` });
  await fwd(); await H.waitForTimeout(1500);
  R = await room();
  ok(!R.state.rest && !R.fun, `놀이 중 앞으로 ▶ = 놀이 · 쉼터 닫힘 (단계 ${R.state.step} · 문제 몬스터라 「아직 안 낸 학생」 안내는 원래대로)`);
  await fwd(); await fwd(); await fwd(); R = await room();
  ok(R.state.step === s1 + 1, `그다음 앞으로 = 원래 규칙대로 다음 단계 (${s1} → ${R.state.step})`);
  await H.screenshot({ path: `${OUT}/136-after.png` });
  console.log(log.join('\n')); console.log(bad ? `❌ ${bad}` : '✅ 통과'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad || errs.length) process.exit(1);
})();
