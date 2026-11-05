// v0.9.11 🔥 콤보 · ✨ 퍼펙트 · 🦇 황금 박쥐 · 🎁 상자 · 👑 보스 단계 · 🏁 반대항 경주 — node tools/e2e/e2e57.js <출력 폴더>
//   학생 폰 1 (김민준) + 봇 11 · 종합상황실 · 교사 리모컨 (로컬 체험 모드)
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
const RIGHT = `(p) => (p.type === 'blanks' ? p.items.map((i) => i.answer) : p.type === 'subsets' ? DS.SetGen.allSubsets(p.base) : p.type === 'choice' ? p.answerIndex : p.answer)`;
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = [];
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T');
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n2 이서연'); await T.click('#r-up'); await T.waitForTimeout(800);
  // 다른 반 · 지난 차시 기록 (순위 · +n% 확인용)
  await T.evaluate(async () => { await DS.Net.set('punch/set-04/1-4', { s: 380, m: { join: 50, fix: 40, combo: 20, first: 30, heal: 50 }, at: Date.now(), code: 'x1' }); await DS.Net.set('punch/set-03/1-3', { s: 420, m: {}, at: Date.now(), code: 'x2' }); await DS.Net.set('punch/set-03/1-5', { s: 510, m: {}, at: Date.now(), code: 'x3' }); await DS.Net.set('combo/1-3', { best: 6, at: Date.now(), code: 'x2' }); });
  const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1500);
  if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(500); }
  await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
  await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200);
  await S.evaluate(() => { localStorage.setItem('citadel-tut-1-3-1', JSON.stringify({ a: true, b: true })); });
  await S.click('#s-go'); await S.waitForTimeout(2000);
  await S.evaluate(async () => { await DS.Net.update('xp/1-3/1/tut', { a: true, b: true }); });
  await S.evaluate(() => DS.Camp.back()); await S.waitForTimeout(1500);
  const { code, key } = await T.evaluate(async () => { const c = await DS.Act.createRoom('set-04', '1-3', { noLimit: true }); const code = c.code || c; return { code, key: (await DS.Net.get(`secrets/${code}`)).hallKey }; });
  const meta = await T.evaluate((code) => DS.Net.get(`rooms/${code}/meta`), code);
  log.push(`방: 반 최고 콤보 복사 ${meta.comboBest}`);
  const H = await mk('H'); await H.setViewportSize({ width: 1600, height: 900 });
  await H.goto(`${U}&role=hall&code=${code}&key=${key}`); await H.waitForTimeout(2500);
  await S.click('#camp-gate', { force: true }); await S.waitForTimeout(2500);
  // 봇 11명 · 수업 시작 → 도입 → 몬스터 r1 · 박쥐는 r1 시작 3초 뒤
  await T.evaluate(async (code) => {
    for (let i = 1; i <= 11; i++) await DS.Net.set(`rooms/${code}/players/bot${i}`, { num: 10 + i, nick: `봇${i}`, hero: i % 8, cls: '1-3' });
    const L = DS.Lessons.get('set-04');
    let R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); await DS.Act.go(code, R, L, 1);
    R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); await DS.Act.go(code, R, L, 1);
    await DS.Net.set(`rooms/${code}/state/batPlan`, { mid: 'r1', d: 3 });
    await DS.Net.set(`rooms/${code}/state/headcount`, 30); // 체력을 넉넉히 (봇이 다 맞혀도 아직 안 쓰러지게)
    await DS.Teacher.open(code, '');
  }, code);
  await H.waitForTimeout(5000);
  const bat0 = await T.evaluate((code) => DS.Net.get(`rooms/${code}/state/bat`), code);
  await S.waitForTimeout(800);
  const phoneBat = await S.evaluate(() => (document.querySelector('#th-bat') || {}).textContent || '');
  await S.screenshot({ path: `${OUT}/1-phone-bat.png` });
  await H.screenshot({ path: `${OUT}/2-hall-bat.png` });
  // 학생 · 봇 8명 정답 → 20초를 줄여 끝냄
  const qa = await T.evaluate((code) => DS.Net.get(`rooms/${code}/state/bat/q`).then((q) => DS.FunOX.list[q].a), code);
  await S.click(`#th-bat [data-bat="${qa ? 'o' : 'x'}"]`); await S.waitForTimeout(500);
  await T.evaluate(async ({ code, qa }) => { for (let i = 1; i <= 8; i++) await DS.Net.set(`rooms/${code}/batA/bot${i}`, qa ? 'o' : 'x'); await DS.Net.set(`rooms/${code}/state/bat/at`, DS.Net.now() - 19000); }, { code, qa });
  await S.waitForTimeout(2500);
  const batRes = await S.evaluate(() => (document.querySelector('#th-bat') || {}).textContent || '');
  const hallBat = await H.evaluate(() => (document.querySelector('.th-bat-card') || {}).textContent || '');
  await S.screenshot({ path: `${OUT}/3-phone-bat-ok.png` }); await H.screenshot({ path: `${OUT}/4-hall-bat-ok.png` });
  await S.click('#th-bat [data-bat-x]').catch(() => {}); await S.waitForTimeout(2200);
  const chest = await S.evaluate(() => (document.querySelector('.th-chest') || {}).textContent || '');
  await S.screenshot({ path: `${OUT}/5-phone-chest.png` });
  await S.click('.th-chest button').catch(() => {}); await S.waitForTimeout(400);
  log.push(`🦇 박쥐: 나타남 ${!!bat0} · 폰 「${phoneBat.replace(/\s+/g, ' ').slice(0, 40)}」 · 결과 「${batRes.replace(/\s+/g, ' ').slice(0, 30)}」 · 종합상황실 「${hallBat.replace(/\s+/g, ' ').slice(0, 30)}」 · 상자 「${chest.replace(/\s+/g, ' ').slice(0, 30)}」`);
  // ✨ 학생 퍼펙트 → 봇 10명 퍼펙트 (콤보 3 + 11 = 14 → ⚡ 10)
  await S.evaluate(async ({ code, RIGHT }) => { const right = eval(RIGHT); const raw = await DS.Net.get(`rooms/${code}`), R = DS.Act.unpackRoom(raw), L = DS.Lessons.get('set-04');
    await DS.Act.submit(code, raw, 'r1', 0, DS.Raid.itemsFor(L, R, 'r1', DS.Net.uid(), 0).map(right)); }, { code, RIGHT });
  await S.waitForTimeout(1000);
  const pf = await S.evaluate(() => (document.querySelector('.th-perfect') || {}).textContent || '');
  await S.screenshot({ path: `${OUT}/6-phone-perfect.png` });
  await T.evaluate(async ({ code, RIGHT }) => { const right = eval(RIGHT), L = DS.Lessons.get('set-04');
    for (let i = 1; i <= 10; i++) { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); const u = `bot${i}`;
      await DS.Net.set(`rooms/${code}/subs/r1/${u}/0`, DS.Net.pack(DS.Raid.itemsFor(L, R, 'r1', u, 0).map(right)));
      await DS.Net.set(`rooms/${code}/hits/${u}/m_r1_0`, { at: DS.Net.TS, ac: DS.Combo.activeNow(R, DS.Net.now()) }); await new Promise((r) => setTimeout(r, 120)); } }, { code, RIGHT });
  await H.waitForTimeout(900);
  const hc = await H.evaluate(() => { const T = (e) => (e ? [...e.childNodes].map((n) => (n.nodeType === 3 ? n.nodeValue : n.dataset && n.dataset.ic === 'chain' ? '⛓' : n.textContent)).join('') : ''); return { combo: (document.querySelector('#h-combo') || {}).textContent || '', note: (document.querySelector('.th-note') || {}).textContent || '', atk: T(document.querySelector('#rh-atk span')) }; });
  await H.screenshot({ path: `${OUT}/7-hall-combo.png` });
  const sc = await S.evaluate(() => (document.querySelector('#st-combo') || {}).textContent || '');
  await S.screenshot({ path: `${OUT}/8-phone-combo.png` });
  log.push(`🔥 콤보: 폰 퍼펙트 「${pf}」 · 폰 배지 「${sc.trim()}」 · 종합상황실 「${hc.combo.trim()}」 알림 「${hc.note.trim()}」 · 게이지 「${hc.atk}」`);
  // 👑 보스: 봇이 문항을 맞혀 체력 66% 아래 → 2단계
  await T.evaluate(async (code) => { const L = DS.Lessons.get('set-04'); for (let k = 0; k < 12; k++) { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); if (DS.Raid.stepOf(L, R) && DS.Raid.stepOf(L, R).kind === 'boss') break; await DS.Act.go(code, R, L, 1); await DS.Act.setFocus(code, false); } }, code);
  await H.waitForTimeout(2500);
  const bossAns = async (n) => T.evaluate(async ({ code, RIGHT, n }) => { const right = eval(RIGHT), L = DS.Lessons.get('set-04');
    for (let i = 1; i <= 11; i++) { const a = L.boss.sets[1].map((p, k) => (k < n ? right(p) : null)); await DS.Net.set(`rooms/${code}/bossAns/bot${i}/1`, DS.Net.pack(a)); } }, { code, RIGHT, n });
  await T.evaluate((code) => DS.Net.set(`rooms/${code}/state/headcount`, 12), code); // 보스 체력 12 × 6 × 90% = 64
  await bossAns(1); await H.waitForTimeout(1500);
  const ph1 = await H.evaluate(() => (document.querySelector('#rh-atk span') || {}).textContent || '');
  await bossAns(2); await H.waitForTimeout(700);
  const ph2 = await H.evaluate(() => ({ note: (document.querySelector('.th-note.phase') || {}).textContent || '', atk: (document.querySelector('#rh-atk span') || {}).textContent || '', cls: document.querySelector('#raid').className }));
  await H.screenshot({ path: `${OUT}/9-hall-boss-phase.png` });
  log.push(`👑 보스: 처음 「${ph1.slice(0, 22)}」 → 「${ph2.note.trim()}」 · 「${ph2.atk.slice(0, 22)}」`);
  // 마무리 → 수업 끝 → 🏁 반대항 경주
  await T.evaluate(async (code) => { const L = DS.Lessons.get('set-04'); let R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); await DS.Act.go(code, R, L, 1); R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); await DS.Act.go(code, R, L, 1); }, code);
  await H.waitForFunction(() => document.querySelector('.rc-lane'), null, { timeout: 20000 }).catch(() => {}); await H.waitForTimeout(1500); // 반대항 창이 뜰 때까지 (느린 기기 · 첫 실행)
  await H.screenshot({ path: `${OUT}/10-hall-race-run.png` });
  await H.waitForTimeout(7000);
  const pm = await H.evaluate(() => ({ lanes: document.querySelectorAll('.rc-lane').length, near: [...document.querySelectorAll('.rc-lane.near small')].map((e) => e.textContent).join(), badge: [...document.querySelectorAll('.rc-badge:not([hidden])')].map((e) => e.textContent).join(), after: (document.querySelector('.pm-after:not([hidden])') || {}).textContent || '' }));
  await H.screenshot({ path: `${OUT}/11-hall-race.png` });
  const saved = await T.evaluate(() => DS.Net.get('punch/set-04/1-3')), cbest = await T.evaluate(() => DS.Net.get('combo/1-3'));
  await S.waitForTimeout(9000);
  const g = await S.evaluate(() => DS.Gem.mine({ c: '1-3', n: 1 }));
  await S.screenshot({ path: `${OUT}/12-phone-after.png` });
  const logs = Object.keys(g.log || {});
  log.push(`🏁 경주: 레인 ${pm.lanes} · 가까운 차시 「${pm.near}」 · 배지 「${pm.badge}」 · 결과 「${pm.after.replace(/\s+/g, ' ').slice(0, 80)}」 · 저장 ${saved && saved.s} · 반 콤보 ${cbest && cbest.best} · 조각 기록 ${logs.join(',')} · 상자 ${JSON.stringify(g.chest && g.chest.log)}`);
  // 🪶 이펙트 목록
  const fxw = await S.evaluate(async () => (await DS.Account.looks({ c: '1-3', n: 1 })).fx.find((f) => f.id === 'wings'));
  log.push(`🪶 황금 날개: ${JSON.stringify(fxw)}`);
  const C = { 콤보복사: meta.comboBest === 6, 박쥐나타남: !!bat0 && /황금 박쥐/.test(phoneBat), 박쥐포획폰: /포획 성공/.test(batRes), 박쥐포획큰화면: /포획 성공/.test(hallBat), 상자: /보물 상자/.test(chest),
    퍼펙트: /PERFECT/.test(pf), 콤보미터: /COMBO/.test(hc.combo), 콤보10: /10 COMBO/.test(hc.note), 묶기표시: /⛓/.test(hc.atk), 보스1단계: /1단계 · 멈춤 4초/.test(ph1), 보스2단계: /보스 2단계/.test(ph2.note) && /2단계 · 멈춤 3초/.test(ph2.atk),
    경주화면: pm.lanes === 3 && /3차시 기록/.test(pm.near) && /1등/.test(pm.badge) && /지난 차시보다/.test(pm.after), 펀치저장: !!saved && saved.s > 0 && saved.best >= 10 /* combo/{반} 은 로컬 체험 모드에서 여러 창이 같은 순간 저장하면 덮일 수 있어 punch.best 로 */,
    박쥐조각: logs.some((k) => k.startsWith('bat_')), 콤보조각: logs.some((k) => k.startsWith('combo_')), 반대항조각: logs.some((k) => k.startsWith('punch_set-04')), 황금날개잠김: !!fxw && !fxw.open };
  const bad = Object.keys(C).filter((k) => !C[k]), ok = !bad.length; if (bad.length) log.push('틀린 항목: ' + bad.join(', '));
  console.log(log.join('\n')); console.log(ok ? '✅ 통과' : '❌ 기대와 다름'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (!ok || errs.length) process.exit(1);
})();
