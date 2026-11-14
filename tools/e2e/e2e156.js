// 🧑‍🏫 2026-11-14 선생님 「시연 중 몬스터 공격 없음」: 종합실 🎮 시연 창을 연 채로 몬스터 공격이 와도 선생님 용사 = 맞는 모습 · 헉헉 · 그림 바뀜 없음 · 시연 창 입력 잠금 없음 (학생 용사는 그대로 맞음)
// 사용: PORT=8766 node tools/e2e/e2e156.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = `http://localhost:${process.env.PORT || 8765}/index.html?local`;
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = []; let ok = 0, fail = 0;
  const check = (c, m) => { if (c) ok++; else { fail++; console.log('FAIL:', m); } };
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T');
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n2 이서연'); await T.click('#r-up'); await T.waitForTimeout(800);
  const S1 = await mk('S1'); await S1.goto(U + '&role=student'); await S1.waitForTimeout(1500);
  if (await S1.isVisible('#splash')) { await S1.click('#splash'); await S1.waitForTimeout(500); }
  await S1.selectOption('#s-cls', '1-3'); await S1.waitForTimeout(200); await S1.selectOption('#s-num', '1'); await S1.waitForTimeout(300);
  await S1.click('#s-new'); await S1.fill('#s-p1', '1234'); await S1.fill('#s-p2', '1234'); await S1.click('#s-make'); await S1.waitForTimeout(1200);
  await S1.evaluate(() => { localStorage.setItem('citadel-tut-1-3-1', JSON.stringify({ a: true, b: true })); }); await S1.click('#s-go'); await S1.waitForTimeout(2000);
  const { code, hallKey: key } = await T.evaluate(() => DS.Act.createRoom('set-10', '1-3'));
  await T.evaluate(async (c) => { await DS.Net.set(`rooms/${c}/active/friend2`, true); await DS.Net.set(`rooms/${c}/players/friend2`, { num: 2, nick: '이서연', hero: 1 }); }, code);
  await T.evaluate(async (c) => { const L = DS.Lessons.get('set-10'); for (let i = 0; i < 14; i++) { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); const s = DS.Raid.stepOf(L, R); if (s && s.id === 'm1') break; await DS.Act.go(c, R, L, 1); } const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); await DS.Act.setSolve(c, R, L, { now: true }); }, code);
  const H = await mk('H'); await H.setViewportSize({ width: 1600, height: 900 }); await H.goto(`${U}&role=hall&code=${code}&key=${key}`); await H.waitForTimeout(3000);
  await H.evaluate(() => { window.DS_ATK = { monster: [4, 1], boss: [5, 2] }; }); await S1.evaluate(() => { window.DS_ATK = { monster: [4, 1], boss: [5, 2] }; });
  await H.evaluate(() => document.querySelector('#h-demo').click()); await H.waitForTimeout(600);
  const teach0 = await H.evaluate(() => { const t = document.getElementById('fh-teach'); return t ? t.querySelector('.art').outerHTML.slice(0, 200) : null; });
  check(!!teach0, '시연 = 선생님 용사가 종합실에 나옴');
  // 6초 동안 0.1초마다 지켜봄: 공격(배너)이 왔는지 · 선생님 용사가 맞았는지 · 학생 용사가 맞았는지
  const seen = await H.evaluate(() => new Promise((res) => { const o = { banner: 0, teachHit: 0, teachArt: 0, studHit: 0 }; const t0 = document.getElementById('fh-teach').querySelector('.art').outerHTML; let n = 0;
    const iv = setInterval(() => { n++; if (document.querySelector('.atk-banner:not(.guard)')) o.banner = 1; const t = document.getElementById('fh-teach'); if (t && t.classList.contains('struck')) o.teachHit = 1; if (t && t.querySelector('.art') && t.querySelector('.art').outerHTML !== t0) o.teachArt = 1;
      if ([...document.querySelectorAll('.fh2:not(.teach)')].some((h) => h.classList.contains('struck'))) o.studHit = 1; if (n > 60) { clearInterval(iv); res(o); } }, 100); }));
  check(seen.banner === 1, `몬스터 공격이 실제로 왔음 (${JSON.stringify(seen)})`);
  check(seen.teachHit === 0 && seen.teachArt === 0, `선생님 용사 = 맞는 모습 · 그림 바뀜 없음 (${JSON.stringify(seen)})`);
  check(seen.studHit === 1, '학생 용사는 그대로 맞음');
  check(await H.evaluate(() => !document.querySelector('.stun') && !!document.getElementById('h-demo-ov')), '시연 창 그대로 · 입력 잠금 덮개 없음');
  await H.screenshot({ path: `${OUT}/156-demo-atk.png` });
  console.log(`ok ${ok} · fail ${fail} · errors`, errs.length ? errs : 'none'); await b.close(); if (fail || errs.length) process.exit(1);
})();
