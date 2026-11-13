// 📅 2026-11-13 밤 선생님 「당분간 시간표기능은 끄고 생성된 반 누르고 차시 누르고 생성하는 수동방법」: ⚙ 「📅 시간표 쓰기」 기본 끔
//   끔 = 오늘 수업 줄 · 📅 시간표 단추 없음 · 차시를 저절로 고르지 않음 · 켜면 🕘 교시 시각 · 🗓 시간표 단추 — PORT=8766 node tools/e2e/e2e150.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = `http://localhost:${process.env.PORT || 8765}/index.html?local`;
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = []; let bad = 0;
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  const T = await ctx.newPage(); T.on('pageerror', (e) => errs.push('T: ' + e.message)); T.on('dialog', (d) => d.accept());
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.evaluate(async () => { await DS.Account.uploadRoster([{ c: '1-3', n: 1, name: '김민준' }]); await DS.Net.set('sched/week', { '1-1': '1-3', '2-1': '1-3', '3-1': '1-3', '4-1': '1-3', '5-1': '1-3' }); });
  await T.reload(); await T.waitForTimeout(2200); if (await T.isVisible('#splash')) { await T.click('#splash'); await T.waitForTimeout(500); }
  let v = await T.evaluate(() => ({ on: DS.Sched.isOn(), today: (document.querySelector('#t-today') || {}).innerHTML || '', sched: document.querySelector('#t-sched').hidden, cb: document.querySelector('#t-sched-use').checked, hint: (document.querySelector('#t-lhint') || {}).textContent || '', lesson: document.querySelector('#lesson').value }));
  ok(!v.on && !v.today && v.sched && !v.cb, `기본 끔 = 오늘 수업 줄 없음 · 📅 시간표 단추 숨김 · 스위치 꺼짐 (${JSON.stringify({ on: v.on, today: v.today.length, sched: v.sched })})`);
  ok(/차시를 골라 주세요/.test(v.hint), `차시를 저절로 고르지 않음 「${v.hint}」`);
  await T.evaluate(() => { document.querySelector('#t-set').open = true; }); await T.screenshot({ path: `${OUT}/150-off.png`, fullPage: true });
  await T.evaluate(() => { const c = document.querySelector('#t-sched-use'); c.checked = true; c.dispatchEvent(new Event('change')); }); await T.waitForTimeout(1500);
  v = await T.evaluate(() => ({ on: DS.Sched.isOn(), saved: null, btns: !document.querySelector('#t-bells').closest('.sched-only').hidden, sched: !document.querySelector('#t-sched').hidden }));
  const saved = await T.evaluate(() => DS.Net.get('sched/use'));
  ok(v.on && saved === true && v.btns && v.sched, '켜면 sched/use = true · 🕘 교시 시각 · 🗓 시간표 단추 보임');
  await T.screenshot({ path: `${OUT}/150-on.png`, fullPage: true });
  await T.evaluate(() => { const c = document.querySelector('#t-sched-use'); c.checked = false; c.dispatchEvent(new Event('change')); }); await T.waitForTimeout(1200);
  ok(await T.evaluate(async () => !DS.Sched.isOn() && (await DS.Net.get('sched/use')) == null), '다시 끄면 기본(끔)으로');
  console.log(log.join('\n')); console.log(bad ? `❌ ${bad}` : '✅ 통과'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad || errs.length) process.exit(1);
})();
