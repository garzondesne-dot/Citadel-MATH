// ✍ #65-2 일반 몬스터 나의 풀이 (2026-11-10): 🧪 8차시 문제 3 → 고르면 연필 줄 · 빼면 지워짐 · 접힘 = 한 줄 · 제출 → 맞힌 줄 진하게 · 틀린 줄 스르르 — node tools/e2e/e2e99.js <출력 폴더>
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
  const stepId = () => p.evaluate(async () => { const db = JSON.parse(localStorage.getItem('citadel-test-db')); const code = Object.keys(db.rooms).pop(); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); const st = DS.Raid.stepOf(DS.Lessons.get(R.meta.lesson), R); return st && st.id; });
  for (let i = 0; i < 12 && (await stepId()) !== 'm2'; i++) { await p.click('#tb-next'); await p.waitForTimeout(900); }
  await p.waitForTimeout(7500);
  const pick = (n, t) => p.evaluate(([n, t]) => [...[...document.querySelectorAll('#st-body .item')][n].querySelectorAll('.chipset')].find((x) => x.textContent.trim() === t).click(), [n, t]);
  const lines = () => p.evaluate(() => [...document.querySelectorAll('#st-body .item')].map((it) => { const a = it.querySelector('.ans-line'); return a ? `${a.classList.contains('pen') ? 'pen' : 'empty'}:${a.textContent.trim()}` : 'none'; }));
  let L1 = await lines(); ok(L1.length === 3 && L1.every((x) => x.startsWith('empty')), `고르기 전 = 문제마다 빈 답 칸 (${L1.join(' | ')})`);
  await pick(0, '3'); await p.waitForTimeout(200); await pick(0, '6'); await p.waitForTimeout(200);
  L1 = await lines(); ok(/^pen:✍ P = \{3, 6\}/.test(L1[0]) && L1[1].startsWith('empty'), `고르는 동안 그 문제 바로 아래에 연필 글씨 (${L1[0]})`);
  ok(await p.evaluate(() => getComputedStyle(document.querySelector('.ans-line.pen')).fontStyle === 'italic'), '연필 = 기울임 · 옅은 회색');
  await pick(0, '6'); await p.waitForTimeout(200); L1 = await lines(); ok(/\{3\}$/.test(L1[0]), `빼면 바로 지워짐 (${L1[0]})`);
  await pick(0, '6'); await pick(0, '9'); await p.waitForTimeout(150); await pick(1, '5'); await p.waitForTimeout(150); await pick(2, '1'); await p.waitForTimeout(200);
  ok(!(await p.$('#st-body .pen-box')), '맨 아래 「나의 풀이」 상자 없음');
  await p.screenshot({ path: `${OUT}/99-pen.png` });
  await p.evaluate(() => document.querySelector('#st-go').click()); await p.waitForTimeout(300);
  const card = await p.evaluate(() => ({ card: !!document.querySelector('.ans-card'), fly: document.querySelectorAll('.ans-fly').length }));
  ok(card.card && card.fly === 3, `⚔ 공격 → 📜 나의 답안 카드로 모임 (${JSON.stringify(card)})`);
  await p.waitForTimeout(900);
  const res = await p.evaluate(() => [...document.querySelectorAll('#st-body .pen-res li')].map((li) => `${li.className}:${li.textContent}`));
  ok(res.some((x) => /pen-ok/.test(x) && /P = \{3, 6, 9\}/.test(x)) && res.some((x) => /pen-ok/.test(x) && /Q = \{5\}/.test(x)) && res.some((x) => /pen-gone/.test(x) && /R = \{1\}/.test(x)), `결과 = 📜 나의 답안 · 맞힌 줄 ✔ 진하게 · 틀린 줄 ✘ 스르르 (${res.join(' | ')})`);
  ok(await p.evaluate(() => /나의 답안/.test((document.querySelector('#st-body .pen-res b') || {}).textContent || '')), '카드 제목 「📜 나의 답안」');
  await p.waitForTimeout(400); await p.screenshot({ path: `${OUT}/99-pen-res.png` });
  console.log(log.join('\n')); console.log(bad ? `❌ ${bad}` : '✅ 통과'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad || errs.length) process.exit(1);
})();
