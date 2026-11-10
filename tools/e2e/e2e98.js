// 🔥 #65-4 형성평가 「한 판 더」 (2026-11-10): 🧪 테스트 모드 8차시 형성평가를 마친 뒤 → 🔥 한 판 더 3/3 · 숫자 바뀐 4문항 · 다 맞히면 +1 EXP · 3판 뒤 끝 — node tools/e2e/e2e98.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = []; let bad = 0;
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(e.message)); p.on('dialog', (d) => d.accept());
  await p.goto(U + '&role=teacher'); await p.waitForTimeout(1200);
  await p.fill('#f-teacher .t-id', 'e2e-teacher'); await p.fill('#f-teacher .t-pw', '909090'); await p.click('#f-teacher .t-login'); await p.waitForTimeout(1000);
  await p.selectOption('#p-lesson', 'set-08'); await p.click('#x-go'); await p.waitForTimeout(2500);
  await p.evaluate(() => document.querySelectorAll('.nt-pop').forEach((e) => e.remove()));
  await p.click('#camp-gate'); await p.waitForTimeout(3500);
  const room = () => p.evaluate(async () => { const db = JSON.parse(localStorage.getItem('citadel-test-db')); const code = Object.keys(db.rooms).pop(); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); const st = DS.Raid.stepOf(DS.Lessons.get(R.meta.lesson), R); return { code, id: st && st.id }; });
  for (let i = 0; i < 14 && (await room()).id !== 'boss'; i++) { await p.click('#tb-next'); await p.waitForTimeout(900); }
  await p.waitForTimeout(7500);
  ok(!(await p.$('#bp-go')), '형성평가 전 = 한 판 더 없음');
  // 4문항 모두 첫 시도에 맞힘
  const { code } = await room();
  await p.evaluate(async (code) => { const L = DS.Lessons.get('set-08'); for (let i = 0; i < 4; i++) { const q = L.boss.sets[1][i]; await DS.Act.bossTry(code, i, 0, q.type === 'choice' ? q.answerIndex : q.answer); } }, code);
  await p.waitForTimeout(2500);
  const btn = await p.evaluate(() => (document.querySelector('#bp-go') || {}).textContent || '');
  ok(/한 판 더 3\/3/.test(btn), `형성평가를 마친 뒤 🔥 한 판 더 3/3 (${btn})`);
  await p.screenshot({ path: `${OUT}/98-bp.png` });
  const play = async (allRight) => { await p.waitForTimeout(1700); await p.evaluate(() => document.querySelector('#bp-go').click()); const qs = [];
    for (let i = 0; i < 4; i++) { await p.waitForSelector('#quiz:not(.hidden)', { timeout: 5000 }); await p.waitForTimeout(300); const card = await p.textContent('#quiz-formula'); qs.push(await p.textContent('#quiz-q'));
      if (i === 0) ok(/한 판 더/.test(card), `연습 판 표시 (${card.slice(0, 40)})`);
      await p.evaluate((right) => { const q = DS.Quiz.last, box = document.querySelector('#quiz-choices');
        if (q.type === 'multi') { (right ? q.answer : [q.empty ? q.empty[0] : 0]).forEach((k) => box.querySelectorAll('.choice.multi')[k].click()); box.querySelector('.q-submit').click(); }
        else box.querySelectorAll('.choice')[right ? q.answerIndex : (q.answerIndex + 1) % q.choices.length].click(); }, allRight);
      await p.waitForTimeout(900); if (!allRight) { const nx = await p.$('#quiz-next:not(.hidden)'); if (nx) await nx.click(); await p.waitForTimeout(300); } }
    await p.waitForTimeout(1200); return qs; };
  const q1 = await play(true);
  const xp = await p.evaluate(async () => { const v = await DS.Net.get('xp/테스트/1'); return Object.keys((v || {}).log || {}).filter((k) => /^bprac_/.test(k)).length; });
  ok(xp === 1, `다 맞힘 → +1 EXP 기록 (${xp})`);
  ok(/2\/3/.test(await p.evaluate(() => (document.querySelector('#bp-go') || {}).textContent || '')), '남은 판 2/3 · 저절로 안 넘어감');
  const q2 = await play(false);
  ok(q1.join('|') !== q2.join('|'), '판마다 숫자가 바뀜');
  await play(true);
  ok(/연습 3판 끝/.test(await p.evaluate(() => document.querySelector('#st-body').textContent)), '3판 뒤 끝');
  console.log(log.join('\n')); console.log(bad ? `❌ ${bad}` : '✅ 통과'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad || errs.length) process.exit(1);
})();
