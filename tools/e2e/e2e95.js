// 🏅 #63 칭호 작은 기능 (2026-11-10): 학생 폰 · 종합실 이름표 기호 · 보스 격파 때 반짝 · 종합실 동시 5 (줄 서기) · 끄기 스위치 · reduced-motion — node tools/e2e/e2e95.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = []; let bad = 0;
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  const mk = async (t, c = ctx) => { const p = await c.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T'); await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  const { code, hallKey: key } = await T.evaluate(() => DS.Act.createRoom('set-04', '1-3'));
  // 학생 7명 (칭호 = 보스 토벌자 6 · 집합의 지배자 1) → 대기실
  const S = await mk('S');
  await S.goto(U + '&role=student'); await S.waitForTimeout(1200);
  await S.evaluate((c) => DS.Student.enter(c, { cls: '1-3', num: 1, nick: '민준', hero: 0, fx: 'flame', title: 'slayer' }), code); await S.waitForTimeout(1500);
  const plate = await S.evaluate(() => (document.querySelector('#st-head .st-plate') || {}).innerHTML || '');
  ok(/tfx-ic[^>]*data-tfx="slayer"/.test(plate), `학생 폰 대기실 이름표 ⚔ (${plate.length})`);
  await S.screenshot({ path: `${OUT}/95-phone.png` });
  await T.evaluate(async (c) => { for (let n = 2; n <= 8; n++) await DS.Net.set(`rooms/${c}/players/bot${n}`, { num: n, nick: `학생${n}`, hero: n % 5, fx: 'flame', title: n === 8 ? 'king' : 'slayer', at: Date.now() }); }, code);
  await T.evaluate(async (c) => { const L = DS.Lessons.get('set-04'); const R = await DS.Net.get(`rooms/${c}`); await DS.Net.set(`rooms/${c}/active`, Object.fromEntries(Object.keys(R.players || {}).map((u) => [u, true]))); await DS.Net.update(`rooms/${c}/state`, { step: L.steps.findIndex((x) => x.kind === 'monster') }); }, code); // 수업 시작 (종합실 = 레이드 화면)
  const H = await mk('H'); await H.setViewportSize({ width: 1280, height: 720 });
  await H.goto(`${U}&role=hall&code=${code}&key=${key}`); await H.waitForTimeout(2500);
  const hic = await H.evaluate(() => [...document.querySelectorAll('#screen-hall .tfx-ic')].filter((e) => e.getClientRects().length).map((e) => e.dataset.tfx + ':' + (e.textContent || (e.querySelector('.ui-ic') || {}).dataset.ic)));
  ok(hic.filter((x) => x === 'slayer:sword').length >= 7 && hic.includes('king:∩'), `종합실 이름표 기호 (⚔ = 도트 칼 아이콘 · 4차시라 ∩) (${hic.join(' ')})`);
  await H.screenshot({ path: `${OUT}/95-hall-lobby.png` });
  // 동시 5 상한: 7명 한꺼번에 반짝 → 5만 움직이고 2는 줄 서기 → 1초 뒤 나머지
  const cap = await H.evaluate(async () => { const ids = [...new Set([...document.querySelectorAll('#screen-hall .tfx-ic[data-tu]')].filter((e) => e.getClientRects().length).map((e) => e.dataset.tu))]; ids.forEach((u) => DS.Titles.pulse(u)); await new Promise((r) => setTimeout(r, 50)); const a = document.querySelectorAll('#screen-hall .tfx-pop').length, q = DS.Titles._hall(); await new Promise((r) => setTimeout(r, 1000)); const b2 = document.querySelectorAll('#screen-hall .tfx-pop').length; await new Promise((r) => setTimeout(r, 1000)); return { n: ids.length, a, q, b: b2, end: DS.Titles._hall() }; });
  ok(cap.n >= 7 && cap.a === 5 && cap.q.q === cap.n - 5 && cap.b === cap.n - 5 && cap.end.live === 0 && cap.end.q === 0, `종합실 동시 5 · 나머지 줄 서기 (${JSON.stringify(cap)})`);
  // 끄기 스위치 (⚙)
  await H.evaluate(() => document.querySelector('#h-gear').click()); await H.waitForTimeout(200); const t0 = await H.textContent('#h-tfx'); await H.evaluate(() => document.querySelector('#h-tfx').click()); await H.waitForTimeout(200);
  const offd = await H.evaluate(() => ({ cls: document.documentElement.classList.contains('tfx-off'), vis: [...document.querySelectorAll('#screen-hall .tfx-ic')].filter((e) => e.getClientRects().length).length }));
  ok(/켜짐 → 끄기/.test(t0) && offd.cls && offd.vis === 0, `⚙ 칭호 효과 끄기 → 기호 숨김 (${JSON.stringify(offd)})`);
  await H.evaluate(() => DS.Titles.setOff(false));
  // 보스 격파 → 보스 토벌자 반짝 (종합실 · 폰)
  await T.evaluate(async (c) => { const L = DS.Lessons.get('set-04'); const i = L.steps.findIndex((s) => s.kind === 'boss'); await DS.Net.update(`rooms/${c}/state`, { step: i }); }, code);
  await H.waitForTimeout(1500);
  const probe = H.evaluate(() => new Promise((res) => { let mx = 0, phone = 0; const t0 = Date.now(); const iv = setInterval(() => { mx = Math.max(mx, document.querySelectorAll('#screen-hall .tfx-pop').length); if (Date.now() - t0 > 3000) { clearInterval(iv); res(mx); } }, 30); }));
  const sprobe = S.evaluate(() => new Promise((res) => { let hit = 0; const t0 = Date.now(); const iv = setInterval(() => { if (document.querySelector('.tfx-pop, .tfx-say')) hit = 1; if (Date.now() - t0 > 3000) { clearInterval(iv); res(hit); } }, 30); }));
  await T.evaluate(async (c) => { const L = DS.Lessons.get('set-04'); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); const hp = DS.Raid.bossHp(L, R); await DS.Net.update(`rooms/${c}/state`, { bossWonAt: Date.now() }); const sets = {}; for (let n = 2; n <= 8; n++) sets[`bot${n}`] = { 1: JSON.stringify(L.boss.sets[1].map((q) => (q.type === 'choice' ? q.answerIndex : q.answer))) }; await DS.Net.update(`rooms/${c}/active`, Object.fromEntries(Object.keys(R.players || {}).map((u) => [u, true]))); void hp; for (const [u, v] of Object.entries(sets)) await DS.Net.set(`rooms/${c}/bossAns/${u}/1`, v[1]); }, code);
  const [hmax, sp] = await Promise.all([probe, sprobe]);
  const won = await T.evaluate(async (c) => { const L = DS.Lessons.get('set-04'); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); return DS.Raid.bossHp(L, R).won; }, code);
  ok(!won || (hmax >= 1 && hmax <= 5), `보스 격파 → 종합실 보스 토벌자 반짝 (동시 최대 ${hmax} · 격파 ${won})`);
  ok(!won || sp === 1, `보스 격파 → 학생 폰 반짝 (${sp})`);
  await H.screenshot({ path: `${OUT}/95-hall-boss.png` });
  console.log(log.join('\n')); console.log(bad ? `❌ ${bad}` : '✅ 통과'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad || errs.length) process.exit(1);
})();
