// ⌨ #97 문제 창(DS.Quiz · 👑 형성평가 · 🏰 성채 · ⚒ 모루 예제 · 🔥 한 판 더 · 선생님 시연) 숫자 = 룬 키패드 (2026-11-12 선생님 A)
//   #92 와 같은 함수 · 4자리 · 답이 음수인 문제만 「−」 룬 · 빈 채로 내기 막음 · 맞음 / 틀림 · node tools/e2e/e2e117.js <출력 폴더> (로컬 서버 · PORT 기본 8765)
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = `http://localhost:${process.env.PORT || 8765}/index.html?local`;
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage(); const errs = []; let ok = 0, fail = 0;
  const check = (c, m) => { if (c) ok++; else { fail++; console.log('FAIL:', m); } };
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(U); await p.waitForTimeout(1500);
  const ask = (q) => p.evaluate((q) => { window.__r = null; DS.Quiz.ask({ name: '시험', formula: '' }, q, {}).then((r) => { window.__r = r; }); }, q);
  const st = () => p.evaluate(() => ({ keys: document.querySelectorAll('#quiz [data-rune]').length, neg: !!document.querySelector('#quiz [data-rune="0|m"]'), slot: (document.querySelector('#quiz .rune-slot') || {}).textContent || '', dis: (document.querySelector('#quiz .q-submit') || {}).disabled, old: document.querySelectorAll('#quiz .num-pad').length }));
  const press = async (ks) => { for (const k of ks) { await p.click(`#quiz [data-rune="0|${k}"]`); await p.waitForTimeout(60); } };
  // ① 양수 1234 (4자리)
  await ask({ type: 'number', question: 'n(U) = ?', answer: 1234 }); await p.waitForTimeout(800);
  let s = await st(); check(s.keys === 11 && !s.neg && s.old === 0 && s.dis === true && /숫자를 넣어/.test(s.slot), `룬 11개 · − 없음 · 옛 패드 없음 · 빈 칸 = 내기 잠김 (${JSON.stringify(s)})`);
  await press([1, 2, 3, 4, 5]); s = await st(); check(s.slot === '1234' && s.dis === false, `4자리까지 (${s.slot})`);
  await p.screenshot({ path: `${OUT}/117-quiz.png` });
  await p.click('#quiz .q-submit'); await p.waitForTimeout(1500);
  check(await p.evaluate(() => /정답|맞|✔/.test(document.querySelector('#quiz').innerText) || !!document.querySelector('#quiz .rune-slot.right')), '맞음 표시');
  await p.evaluate(() => { const c = document.querySelector('#quiz .q-next, #quiz .btn.primary'); if (c) c.click(); }); await p.waitForTimeout(800);
  // ② 음수 −3
  await p.evaluate(() => { document.querySelector('#quiz').classList.add('hidden'); });
  await ask({ type: 'number', question: 'x = ?', answer: -3 }); await p.waitForTimeout(800);
  s = await st(); check(s.neg, '음수 답 문제 = − 룬');
  await press(['m']); s = await st(); check(s.slot === '−' && s.dis === true, `− 만 = 아직 못 냄 (${s.slot})`);
  await press([3]); s = await st(); check(s.slot === '−3' && s.dis === false, `−3 (${s.slot})`);
  await p.click('#quiz .q-submit'); await p.waitForTimeout(1200);
  check(await p.evaluate(() => !!document.querySelector('#quiz .rune-slot.right')), '−3 = 맞음');
  console.log(`e2e117: 확인 ${ok} · 실패 ${fail}`, errs.length ? `errors: ${errs.join(' | ')}` : 'errors: none');
  await b.close(); process.exit(fail || errs.length ? 1 : 0);
})();
