// 🔘 #65-6 원소 칩 (2026-11-10): 🧪 테스트 모드 8차시 문제 4(U 에 따라) → 칩 고르기 · ∅ 단추 배타 · 제출 정답 — node tools/e2e/e2e96.js <출력 폴더>
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
  for (let i = 0; i < 12 && (await stepId()) !== 'm3'; i++) { await p.click('#tb-next'); await p.waitForTimeout(900); }
  await p.waitForTimeout(7500); // 🌫 정찰
  const it = async () => p.evaluate(() => [...document.querySelectorAll('#st-body .item')][0].querySelectorAll('.chipset').length);
  ok((await it()) === 8, `문제 4 (1) 칩 7 + ∅ 1 = ${await it()}`);
  const pick = (txt, n = 0) => p.evaluate(([t, n]) => { const btn = [...[...document.querySelectorAll('#st-body .item')][n].querySelectorAll('.chipset')].find((x) => x.textContent.trim() === t); btn.click(); }, [txt, n]);
  const onTx = (n = 0) => p.evaluate((n) => [...[...document.querySelectorAll('#st-body .item')][n].querySelectorAll('.chipset.on')].map((x) => x.textContent.trim()).join(','), n);
  await pick('2'); await p.waitForTimeout(200); await pick('−2'); await p.waitForTimeout(200);
  ok((await onTx()) === '−2,2', `칩 둘 고름 (${await onTx()})`);
  await pick('∅ (공집합)'); await p.waitForTimeout(200); ok((await onTx()) === '∅ (공집합)', `∅ 누르면 다른 칩 꺼짐 (${await onTx()})`);
  await pick('2'); await p.waitForTimeout(200); ok((await onTx()) === '2', `칩 누르면 ∅ 꺼짐 (${await onTx()})`);
  ok(await p.evaluate(() => !!document.querySelector('#st-body .chipset.chip-empty')), '∅ 단추 = 따로 (점선)');
  await pick('−2', 1); await p.waitForTimeout(200); await pick('2', 1); await p.waitForTimeout(300);
  await p.screenshot({ path: `${OUT}/96-chips.png`, fullPage: true });
  await p.evaluate(() => { const g = document.querySelector('#st-go'); if (g) g.click(); }); await p.waitForTimeout(2500);
  const res = await p.evaluate(async () => { const db = JSON.parse(localStorage.getItem('citadel-test-db')); const code = Object.keys(db.rooms).pop(); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); const L = DS.Lessons.get('set-08'); return DS.Raid.record(L, R, 'm3', DS.Net.uid()).best; });
  ok(res === 2, `제출 → 2문항 맞음 (${res})`);
  console.log(log.join('\n')); console.log(bad ? `❌ ${bad}` : '✅ 통과'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad || errs.length) process.exit(1);
})();
