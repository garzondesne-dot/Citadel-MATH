// 🎯 2026-11-13 선생님 「수업 서술형 문제는 허수아비가 스캔을 제공」: 허수아비 9차시 문제 5 = 답을 맞혀 처치 → 「📷 종이에 쓴 풀이 찍기」
//   → 성채와 같은 사진 단계 (✍ 2026-11-13 밤: 학습지 숫자 · own 없음) → 통과 = 💎 · 📜 (문제마다 한 번) · 수업 서술형이 아닌 문제엔 단추 없음 — node tools/e2e/e2e129.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = `http://localhost:${process.env.PORT || 8765}/index.html?local`;
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = []; let bad = 0;
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T'); await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.evaluate(async () => { await DS.Account.uploadRoster([{ c: '1-3', n: 1, name: '김민준' }]); await DS.Net.set('gcfg/photo', { on: true, url: 'https://example.invalid/x' }); await DS.Net.set('photo_rubric/set-09/m5', { on: true }); });
  const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1500); if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(500); }
  await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
  await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200);
  await S.evaluate(() => { localStorage.setItem('citadel-tut-1-3-1', JSON.stringify({ a: true, b: true })); }); await S.click('#s-go'); await S.waitForTimeout(2000);
  await S.evaluate(async () => { await DS.Net.update('xp/1-3/1/tut', { a: true, b: true }); await DS.Net.set('unlock/1-3', 9); await DS.Net.set('held/1-3/set-09', true); await DS.Net.set('records/1-3/1/set-09', { no: 9, conc: {}, boss: 2, bossN: 4, miss: ['m5'] }); });
  await S.evaluate(() => DS.Camp.back()); await S.waitForTimeout(1500);
  await S.evaluate(() => DS.Control.run(async () => DS.Bonus.enter(await DS.Account.me(), { train: true }))); await S.waitForTimeout(1800);
  ok(!!(await S.$('[data-fight="set-09|m5"]')), '허수아비 9차시 문제 5 칸');
  // 정답 판정을 모두 맞음으로 (연출 · 흐름만 봄)
  await S.evaluate(() => { DS.Quiz.grade = () => true; window.__ph = []; window.__realGrade = DS.Photo.grade; DS.Photo.grade = async (m, c) => { window.__ctx = c; window.__ph.push({ lesson: c.lesson, room: c.room, own: !!c.own, ws: !!c.ws, top: String(c.top || ''), ask: (c.items || []).map((q) => q.question).join(' / ').slice(0, 80) }); return { status: 'pass', id: 'h1', score: 4, total: 4, scores: [4] }; }; });
  await S.click('[data-fight="set-09|m5"]'); await S.waitForTimeout(1500);
  const fill = async () => { const n = (await S.$$('.bn-fight .ans-line')).length; for (let i = 0; i < n; i++) { const r = await S.$(`.bn-fight [data-rune="${i}|1"]`); if (r) { await r.click(); await S.waitForTimeout(120); continue; } const bt = await S.$(`.bn-fight [data-pick^="${i}|"]`); if (bt) { await bt.click(); await S.waitForTimeout(200); } } return n; };
  const start = async () => { const g = await S.$('.bn-fight #bf-go'); if (g) { await g.click(); await S.waitForTimeout(1200); } }; // ⚔ 전투 시작
  await start();
  const n = await fill(); ok(n >= 3, `문제 5 소문제 ${n}개`);
  await S.evaluate(() => document.querySelector('#bf-go2').click()); await S.waitForTimeout(6000);
  const txt = await S.evaluate(() => (document.querySelector('.bn-fight') || {}).innerText || '');
  ok(/처치/.test(txt) && !!(await S.$('#sc-photo:not([disabled])')), '처치 → 「📷 종이에 쓴 풀이 찍기」 단추');
  await S.screenshot({ path: `${OUT}/129-win.png` });
  await S.click('#sc-photo'); await S.waitForTimeout(800);
  ok(await S.isVisible('#bf-photo'), '📷 풀이 사진 올리기 (성채와 같은 사진 단계)');
  await S.click('#bf-photo'); await S.waitForTimeout(3500);
  const ph = await S.evaluate(() => window.__ph[0] || null);
  ok(ph && ph.lesson === 'set-09' && ph.room === 'm5' && !ph.own && ph.ws && /^명제 「x가 자연수이면/.test(ph.ask) && /학습지 숫자 그대로 써요/.test(ph.top), `채점 = set-09 / m5 · ✍ 학습지 숫자(기준표 문제 · own 없음 · 2026-11-13 밤) (${ph && ph.ask})`);
  { await S.evaluate(() => { window.__realGrade({ c: '1-1', n: 1 }, window.__ctx); }); await S.waitForTimeout(800); const tp = await S.evaluate(() => (document.querySelector('.ph-modal .ph-top') || {}).innerText || ''); ok(/학습지 숫자 그대로 써요/.test(tp) && /바뀐 숫자 아님/.test(tp), `사진 창 맨 위 = 「📄 학습지 숫자 그대로 써요 (바뀐 숫자 아님)」 (${tp.slice(0, 40)})`); await S.screenshot({ path: `${OUT}/129-ws-top.png` }); await S.evaluate(() => { const x = document.querySelector('.ph-modal [data-x]'); if (x) x.click(); }); await S.waitForTimeout(300); }
  const t2 = await S.evaluate(() => (document.querySelector('.bn-fight') || {}).innerText || '');
  ok(/서술형 통과/.test(t2), '통과 → 📷 서술형 통과 화면');
  await S.screenshot({ path: `${OUT}/129-pass.png` });
  const w = await S.evaluate(async () => ({ rec: await DS.Net.get('bonus/1-3/1/set-09/m5'), gem: await DS.Gem.mine({ c: '1-3', n: 1 }) }));
  const logs = Object.values((w.gem || {}).log || {}).map((x) => x.why || ''), scr = Number((w.gem || {}).scroll) || 0;
  ok(w.rec && w.rec.ph === 'h1', '허수아비 문제 칸에 사진 통과 기록 (따로)');
  ok(logs.some((x) => /서술형 통과/.test(x)) && scr >= 1, `💎 📷 서술형 통과 · 📜 서술 조각 ${scr}`);
  // 다른 문제(서술형 아님) = 단추 없음
  await S.evaluate(() => { const x = document.querySelector('#bf-out'); if (x) x.click(); }); await S.waitForTimeout(1200);
  await S.click('[data-fight="set-09|m1"]'); await S.waitForTimeout(1500); await start(); await fill(); await S.evaluate(() => document.querySelector('#bf-go2').click()); await S.waitForTimeout(6000);
  ok(!(await S.$('#sc-photo')), '수업 서술형이 아닌 문제(문제 1) = 사진 단추 없음');
  // ⏳ 선생님 확인 → ✔ 하면 다음에 허수아비에 들어올 때 보상 (10차시 문제 4 칸으로)
  await S.evaluate(async () => { await DS.Net.set('held/1-3/set-10', true); await DS.Net.set('bonus/1-3/1/set-10/m4', { tries: 1, clear: true, pend: 'chk1' }); DS.Photo.pendState = async () => 'ok'; });
  const sc0 = Number(((await S.evaluate(() => DS.Gem.mine({ c: '1-3', n: 1 }))) || {}).scroll) || 0;
  await S.evaluate(() => { const x = document.querySelector('#bf-out'); if (x) x.click(); }); await S.waitForTimeout(800);
  await S.evaluate(() => DS.Control.run(async () => DS.Bonus.enter(await DS.Account.me(), { train: true }))); await S.waitForTimeout(2500);
  const w2 = await S.evaluate(async () => ({ rec: await DS.Net.get('bonus/1-3/1/set-10/m4'), gem: await DS.Gem.mine({ c: '1-3', n: 1 }) }));
  ok(w2.rec && w2.rec.ph === 'chk1' && !w2.rec.pend && (Number(w2.gem.scroll) || 0) > sc0, `⏳ 확인된 허수아비 사진 = 다음에 들어올 때 📷 보너스 (📜 ${sc0} → ${w2.gem.scroll})`);
  console.log(log.join('\n')); console.log(bad ? `❌ ${bad}` : '✅ 통과'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad || errs.length) process.exit(1);
})();
