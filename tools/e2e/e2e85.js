// ⚔ #50 성채 소레이드 (2026-11-10): ✍ 서술형 도전 📸 = 시작 전 · 문제 창 안(도중) · 도중 통과 = 남은 단계 처치 → 🔥 한 판 더 (누를 때만 · 제한 없음) — node tools/e2e/e2e85.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = []; let bad = 0;
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T'); await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n2 이서연'); await T.click('#r-up'); await T.waitForTimeout(800);
  await T.evaluate(async () => { await DS.Net.set('gcfg/photo', { on: true, url: 'https://example.invalid/x' }); await DS.Net.set('photo_rubric/eval-1/q07', { on: true }); });
  const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1500); if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(500); }
  await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
  await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200);
  await S.evaluate(() => { localStorage.setItem('citadel-tut-1-3-1', JSON.stringify({ a: true, b: true })); }); await S.click('#s-go'); await S.waitForTimeout(2000);
  await S.evaluate(async () => { await DS.Net.update('xp/1-3/1/tut', { a: true, b: true }); await DS.Net.set('unlock/1-3', 7); });
  await S.evaluate(() => DS.Camp.back()); await S.waitForTimeout(1500); await S.click('#camp-castle', { force: true }); await S.waitForTimeout(1800); await S.click('.cs-portal[data-floor="eval-1"]'); await S.waitForTimeout(500);
  await S.click('[data-fight="eval-1|q07"]'); await S.waitForTimeout(1500);
  ok(await S.isVisible('#bf-act #cf-photo'), '시작 전: ⚔ 전투 시작 옆 ✍ 서술형 도전 📸');
  await S.click('#bf-go'); await S.waitForTimeout(800);
  ok(await S.isVisible('#quiz .q-extra'), '문제 창(졸개 ①) 안: ✍ 서술형 도전 📸');
  // 졸개 ① 맞힘
  await S.evaluate(() => { const q = DS.Quiz.last; if (q.type === 'multi') { q.answer.forEach((k) => document.querySelectorAll('#quiz-choices .choice')[k].click()); document.querySelector('#quiz-choices .q-submit').click(); } else if (q.type === 'choice' || !q.type) document.querySelectorAll('#quiz-choices .choice')[q.answerIndex].click(); });
  await S.waitForTimeout(4000);
  ok(await S.isVisible('#quiz .q-extra'), '졸개 ② 문제 창에도 ✍ 그대로');
  await S.evaluate(() => { DS.Photo.grade = async () => ({ status: 'pass', id: 'c1', score: 3, total: 3, scores: [3] }); });
  await S.click('#quiz .q-extra'); await S.waitForTimeout(800);
  ok(await S.isVisible('#bf-photo') && /사슬로 돌아가기/.test(await S.textContent('#bf-later')), '✍ → 📷 사진 올리기 · 「⚔ 사슬로 돌아가기」');
  await S.click('#bf-photo'); await S.waitForTimeout(3000);
  const rec = await S.evaluate(() => DS.Net.get('bonus/1-3/1/eval-1/q07'));
  const scr = await S.evaluate(() => ({ win: /처치/.test((document.querySelector('.bn-fight') || {}).innerText || ''), perfect: /퍼펙트/.test((document.querySelector('.bn-fight') || {}).innerText || ''), lis: document.querySelectorAll('.bn-fight .cr-story li').length, prac: !!document.querySelector('#cf-prac'), pracDis: (document.querySelector('#cf-prac') || {}).disabled }));
  ok(rec && rec.clear && rec.ph && scr.win && !scr.perfect && scr.lis >= 3, `도중 통과 → 처치 · 퍼펙트 아님 · 나의 풀이 채움 (${JSON.stringify(scr)})`);
  ok(scr.prac, '처치 뒤 🔥 한 판 더 (누를 때만 시작)');
  await S.screenshot({ path: `${OUT}/85-castle-win.png` });
  await S.waitForTimeout(1700); await S.click('#cf-prac'); await S.waitForTimeout(800);
  ok(await S.evaluate(() => /한 판 더/.test(document.querySelector('#quiz-card').textContent)), '🔥 한 판 더 → 숫자 바뀐 사슬 (연습)');
  console.log(log.join('\n')); if (errs.length) console.log('오류:\n' + errs.join('\n'));
  await b.close(); process.exit(bad || errs.length ? 1 : 0);
})();
