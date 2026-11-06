// 💎 문제 밖 보상 표시 · 처치 보상 = 용사 머리 위 (2026-11-05 사용자 「꼬드겨야지」 · 「머리 위에 오래」) — node tools/e2e/e2e61.js <출력 폴더>
//   성채 방 꼬리표 💎+3 · 보스 방 🟪 인장 → 이펙트 · 허수아비 줄 💎+1 / 재대결 🟪 → 성채 04 처치: 머리 위 +5 EXP · 💎 +3 성채 방 처치 · 💎 +3 성채 첫 방 (8초 머묾)
//   → 4차시 문제 1(틀림) 허수아비 처치: 💎 +1 복습으로 해결 · 💎 +3 첫 복습
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = [];
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message + ' @ ' + String(e.stack).split('\n').slice(1, 3).join(' '))); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T');
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n2 이서연'); await T.click('#r-up'); await T.waitForTimeout(800);
  const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1500);
  if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(500); }
  await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
  await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200);
  await S.evaluate(() => { localStorage.setItem('citadel-tut-1-3-1', JSON.stringify({ a: true, b: true })); });
  await S.click('#s-go'); await S.waitForTimeout(2000);
  // 진도 6차시 · 4차시 기록: 문제 1 틀림(x) · 형성평가 일부
  await S.evaluate(async () => {
    await DS.Net.update('xp/1-3/1/tut', { a: true, b: true }); await DS.Net.set('unlock/1-3', 6); await DS.Net.set('held/1-3', { 'set-04': true });
    await DS.Net.set('records/1-3/1/set-04', { at: 1, no: 4, mons: { r1: 'o', m1: 'x', m2: 'o', m3: 'f' }, bossM: 'ooxoo', boss: 4, bossN: 5, conc: {}, names: {} });
  });
  await S.evaluate(() => DS.Camp.back()); await S.waitForTimeout(2500);
  // (이모지 💎 🟪 는 도트 아이콘으로 바뀌어 글자에서 빠짐 → 숫자 · 글자로 확인)
  // 문제 하나 맞게 풀기 (DS.Quiz.last)
  async function solveAll() {
    for (let k = 0; k < 20; k++) {
      const q = await S.evaluate(() => { const r = document.querySelector('#quiz'); if (!r || r.classList.contains('hidden')) return null; const l = DS.Quiz.last; return l && { type: l.type, ai: l.answerIndex, ans: l.answer }; });
      if (!q) return;
      if (q.type === 'choice') await S.click(`#quiz-choices button:nth-child(${q.ai + 1})`);
      else if (q.type === 'multi') { for (const i of q.ans) await S.click(`#quiz-choices .choice.multi:nth-child(${i + 1})`); await S.click('#quiz-choices .q-submit'); }
      else if (q.type === 'number') { const t = String(q.ans); if (t.startsWith('-')) await S.click('#quiz-choices .choice.key:has-text("−")'); for (const d of t.replace('-', '')) await S.click(`#quiz-choices .choice.key:text-is("${d}")`); await S.click('#quiz-choices .q-submit'); }
      else if (q.type === 'ox') await S.click(`#quiz-choices button:nth-child(${q.ans ? 1 : 2})`);
      else throw new Error('모르는 문제 꼴 ' + q.type);
      await S.waitForTimeout(1300);
    }
  }
  const heads = () => S.evaluate(() => [...document.querySelectorAll('.hd-rw-i')].map((e) => e.textContent));
  await S.click('#camp-castle', { force: true }); await S.waitForTimeout(1500);
  await S.click('.cs-portal[data-floor="eval-1"]').catch(() => {}); await S.waitForTimeout(400); // 2026-11-06: 🏰 포털 메뉴 → 1층
  const tags = await S.evaluate(() => ({ room: (document.querySelector('[data-fight="eval-1|q04"] .gm-tag') || {}).textContent || '', boss: (document.querySelector('.cs-room.boss .gm-tag.seal') || {}).textContent || '', line: (document.querySelector('.gm-line') || {}).textContent || '' }));
  log.push('성채 꼬리표: ' + JSON.stringify(tags));
  await S.click('[data-fight="eval-1|q04"]'); await S.waitForTimeout(800); await S.click('#bf-go'); await S.waitForTimeout(900);
  await solveAll(); await S.waitForTimeout(1500);
  const h1 = await heads(); await S.screenshot({ path: `${OUT}/1-castle-win.png` });
  await S.waitForTimeout(5000); const h1late = await heads(); await S.screenshot({ path: `${OUT}/2-castle-win-6s.png` });
  log.push(`성채 04 처치 → 머리 위 ${JSON.stringify(h1)} · 6초 뒤에도 ${h1late.length}줄`);
  await S.click('#bf-out'); await S.waitForTimeout(600);
  const after = await S.evaluate(() => (document.querySelector('[data-fight="eval-1|q04"] .gm-tag') || {}).textContent || '없음');
  await S.click('#bn-back'); await S.waitForTimeout(1500);
  // 허수아비
  await S.click('#camp-dummy', { force: true }).catch(() => {}); await S.waitForTimeout(1500);
  if (!(await S.$('#bonus .bn-card'))) { await S.evaluate(() => DS.Bonus && DS.Bonus.enter && DS.Bonus.enter(DS.Camp.me ? DS.Camp.me() : null, { train: true })); await S.waitForTimeout(1500); }
  const rows = await S.evaluate(() => [...document.querySelectorAll('.bn-row')].filter((r) => r.querySelector('.gm-tag')).map((r) => r.textContent.replace(/\s+/g, ' ').trim().slice(0, 60)).slice(0, 4));
  log.push('허수아비 꼬리표 줄: ' + JSON.stringify(rows));
  await S.screenshot({ path: `${OUT}/3-review-list.png`, fullPage: true });
  await S.click('[data-fight="set-04|m1"]'); await S.waitForTimeout(800); await S.click('#bf-go'); await S.waitForTimeout(900);
  await solveAll(); await S.waitForTimeout(1500);
  const h2 = await heads(); await S.screenshot({ path: `${OUT}/4-review-win.png` });
  log.push(`허수아비 4차시 문제 1 처치 → 머리 위 ${JSON.stringify(h2)}`);
  const C = { 성채꼬리표: /\+3/.test(tags.room) && /인장/.test(tags.boss) && /첫 방/.test(tags.line), 성채머리: h1.some((t) => /EXP/.test(t)) && h1.some((t) => /성채 방 처치/.test(t)) && h1.some((t) => /성채 첫 방/.test(t)), 오래: h1late.length >= 2, 받은뒤: after === '없음',
    허수아비꼬리표: rows.some((r) => /\+1/.test(r)) && rows.some((r) => /인장/.test(r)), 허수아비머리: h2.some((t) => /복습으로 해결/.test(t)) && h2.some((t) => /첫 복습/.test(t)) };
  const bad = Object.keys(C).filter((k) => !C[k]); if (bad.length) log.push('틀린 항목: ' + bad.join(', '));
  console.log(log.join('\n')); console.log(!bad.length ? '✅ 통과' : '❌ 기대와 다름'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad.length || errs.length) process.exit(1);
})();
