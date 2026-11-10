// 🧩 A안 (2026-11-11 선생님 「A안 진행」): 성채 · 허수아비 일반 방 = 차시 던전과 같은 부품 — 한 장에 모아 풀기 · ✍ 나의 풀이 · ⚔ 공격 한 번 · 틀린 것만 새 숫자로 · 처치
//   — node tools/e2e/e2e102.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = []; let bad = 0;
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T'); await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n2 이서연'); await T.click('#r-up'); await T.waitForTimeout(800);
  const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1500);
  if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(500); }
  await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
  await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200);
  await S.evaluate(() => { localStorage.setItem('citadel-tut-1-3-1', JSON.stringify({ a: true, b: true })); }); await S.click('#s-go'); await S.waitForTimeout(2000);
  await S.evaluate(async () => { await DS.Net.update('xp/1-3/1/tut', { a: true, b: true }); await DS.Net.set('unlock/1-3', 8); await DS.Net.set('held/1-3', { 'set-08': true }); await DS.Net.set('records/1-3/1/set-08', { at: 1, no: 8, mons: { m1: 'o', m2: 'x', m3: 'o', m4: 'o', m5: 'o' }, bossM: 'oooo', boss: 4, bossN: 4, conc: {}, names: {} }); });
  await S.evaluate(() => DS.Camp.back()); await S.waitForTimeout(2500);
  // 🎯 허수아비 8차시 문제 3 (원소 칩 3문항)
  await S.click('#camp-dummy', { force: true }).catch(() => {}); await S.waitForTimeout(1500);
  await S.click('[data-fight="set-08|m2"]'); await S.waitForTimeout(800); await S.click('#bf-go'); await S.waitForTimeout(900);
  const view = () => S.evaluate(() => ({ items: document.querySelectorAll('.bn-fight .bf-paper .item').length, chips: document.querySelectorAll('.bn-fight .chipset').length, go: !!document.querySelector('#bf-go2'), dis: (document.querySelector('#bf-go2') || {}).disabled, quiz: !document.querySelector('#quiz').classList.contains('hidden') }));
  let v = await view(); ok(v.items === 3 && v.chips > 10 && v.go && v.dis && !v.quiz, `한 장에 3문제 · 원소 칩 · ⚔ 공격 (문제 창 안 뜸) ${JSON.stringify(v)}`);
  // 정답은 문제 글에서 계산 (U = {1..N}, 조건)
  const solve = async (k, wrong) => S.evaluate(([k, wrong]) => { const it = [...document.querySelectorAll('.bn-fight .bf-paper .item')][k], t = it.querySelector('.item-q').textContent.replace(/\s+/g, ' ');
    const N = Number(/U = \{1, 2, [^}]*?(\d+)\}/.exec(t)[1]), U = Array.from({ length: N }, (_, i) => i + 1); let m, want;
    if ((m = /(\d+)의 배수/.exec(t))) want = U.filter((x) => x % +m[1] === 0); else if ((m = /x \+ (\d+) = (\d+)/.exec(t))) want = U.filter((x) => x + +m[1] === +m[2]); else if ((m = /(\d+)의 약수/.exec(t))) want = U.filter((x) => +m[1] % x === 0);
    if (wrong) want = want.slice(0, 1).concat([N + 1]);
    [...it.querySelectorAll('.chipset')].forEach((c) => { if (want.includes(Number(c.textContent.trim()))) c.click(); }); return want; }, [k, wrong]);
  await solve(0, false); await S.waitForTimeout(250); await solve(1, true); await S.waitForTimeout(250); await solve(2, false); await S.waitForTimeout(300);
  v = await view(); ok(!v.dis, '다 고르면 ⚔ 공격 켜짐');
  const pen = await S.evaluate(() => [...document.querySelectorAll('.bn-fight .pen-box li')].map((l) => l.textContent));
  ok(pen.length === 3, `✍ 나의 풀이 연필 줄 3 (${pen.join(' | ')})`);
  await S.screenshot({ path: `${OUT}/102-form.png` });
  await S.evaluate(() => document.querySelector('#bf-go2').click()); await S.waitForTimeout(3500);
  const r1 = await S.evaluate(() => ({ ok: document.querySelectorAll('.bn-fight .pen-res li.pen-ok').length, gone: document.querySelectorAll('.bn-fight .pen-res li.pen-gone').length, msg: (document.querySelector('.bn-fight .bf-body') || {}).innerText || '', again: !!document.querySelector('#bf-again') }));
  ok(r1.ok === 2 && r1.gone === 1 && /맞힌 소문제 2 \/ 3/.test(r1.msg) && r1.again, `결과: 맞힌 2줄 진하게 · 틀린 1줄 스르르 · 다시 도전 (${JSON.stringify({ ...r1, msg: r1.msg.slice(0, 60) })})`);
  await S.screenshot({ path: `${OUT}/102-res.png` });
  await S.click('#bf-again'); await S.waitForTimeout(900);
  v = await view(); ok(v.items === 1, `다시 도전 = 틀린 것만 (${v.items}문제)`);
  await solve(0, false); await S.waitForTimeout(300); await S.evaluate(() => document.querySelector('#bf-go2').click()); await S.waitForTimeout(4500);
  const win = await S.evaluate(() => /처치/.test((document.querySelector('.bn-fight') || {}).innerText || ''));
  ok(win, '모두 맞힘 → 🎉 처치 (보상 · 기록은 예전 그대로)');
  const rec = await S.evaluate(() => DS.Net.get('bonus/1-3/1/set-08/m2')); ok(rec && rec.clear && rec.tries === 2, `기록 = 처치 · 도전 2번 (${JSON.stringify(rec)})`);
  console.log(log.join('\n')); console.log(bad ? `❌ ${bad}` : '✅ 통과'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad || errs.length) process.exit(1);
})();
