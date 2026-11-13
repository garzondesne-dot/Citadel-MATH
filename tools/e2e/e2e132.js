// 👩‍🏫 체험판 = 학생 판 · 교사 판 (2026-11-13 · trial/): 첫 화면 「⚔ 학생으로 · 👩‍🏫 선생님으로」 → 교사 판 = 왼쪽 TV + 오른쪽 리모컨(PC) · 리모컨만 + 📺(폰)
//   가상 학생 20명 · 성취 기준 90 · 리모컨 「앞으로 ▶」로 진행 · 아래 진행 막대 없음 · 캡처 4장 — PORT=8766 node tools/e2e/e2e132.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = `http://localhost:${process.env.PORT || 8765}/trial/`;
(async () => {
  const b = await chromium.launch(); const errs = []; let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) pass++; else fail++; console.log(`${c ? '✔' : '✘'} ${m}`); };
  const room = (p) => p.evaluate(async () => { const c = Object.keys((await DS.Net.get('rooms')) || {}).pop(); return c ? DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)) : null; });
  // ① 첫 화면 고르기 (PC · 폰)
  for (const [nm, vp] of [['pc', { width: 1280, height: 720 }], ['phone', { width: 360, height: 780 }]]) {
    const c = await b.newContext({ viewport: vp, deviceScaleFactor: 2 }); const q = await c.newPage(); q.on('pageerror', (e) => errs.push(e.message));
    await q.goto(U); await q.waitForTimeout(3500); await q.screenshot({ path: `${OUT}/trial-pick-${nm}.png` });
    const m = await q.evaluate(() => [...document.querySelectorAll('.trial-pick [data-mode]')].map((x) => x.dataset.mode).join());
    ok(m === 's,t', `${nm} 첫 화면 = 「⚔ 학생으로 · 👩‍🏫 선생님으로」 (${m})`);
    await c.close();
  }
  // ② 교사 판 PC 1280
  for (const [nm, vp] of [['pc', { width: 1280, height: 720 }], ['phone', { width: 360, height: 780 }]]) {
    const c = await b.newContext({ viewport: vp, deviceScaleFactor: nm === 'pc' ? 1 : 2 }); const p = await c.newPage();
    p.on('pageerror', (e) => errs.push(nm + ': ' + (e.stack || e.message).split('\n').slice(0, 2).join(' | '))); p.on('dialog', (d) => d.accept());
    await p.goto(U); await p.waitForTimeout(3500);
    await p.click('[data-mode="t"]'); await p.waitForTimeout(300);
    ok(!(await p.$('.trial-pick .tp-h1')), `${nm} 교사 판 = 용사 고르기 없음 · 이름 칸 + 차시`);
    await p.fill('#tp-name', '김선생'); await p.click('[data-go="set-03"]'); await p.waitForTimeout(9000);
    const s1 = await p.evaluate(() => { const tv = document.querySelector('#test-tv'), r = tv ? tv.getBoundingClientRect() : null, tch = document.getElementById('screen-teacher'), rr = tch.getBoundingClientRect();
      return { tch: tch.classList.contains('active'), tvOn: !!tv && tv.classList.contains('tv-show'), tvW: r ? Math.round(r.width) : 0, rmL: Math.round(rr.left), rmW: Math.round(rr.width), bar: !!document.querySelector('#test-bar'), hall: !!(tv && tv.querySelector('#screen-hall')) }; });
    const R = await room(p), studs = Object.values(R.players || {}).filter((x) => !x.teacher).length;
    ok(s1.tch && !s1.bar && s1.hall, `${nm} 리모컨 화면 · 아래 진행 막대 없음 · TV = 종합실 (${JSON.stringify(s1)})`);
    ok(R.meta.pct === 90 && studs >= 15, `${nm} 성취 기준 ${R.meta.pct} · 가상 학생 ${studs}명`);
    if (nm === 'pc') ok(s1.tvOn && s1.tvW >= 800 && s1.rmL >= 800 && s1.rmW <= 440, 'PC = 왼쪽 큰 TV + 오른쪽 리모컨');
    else {
      ok(!s1.tvOn && s1.rmW >= 340, '폰 = 리모컨만 (TV 숨김)');
      await p.click('#tb-tvv'); await p.waitForTimeout(800);
      const on = await p.evaluate(() => document.querySelector('#test-tv').classList.contains('tv-show'));
      await p.screenshot({ path: `${OUT}/trial-teach-phone-tv.png` });
      ok(on, '폰 📺 = 교실 TV 화면'); await p.click('#tb-tvv'); await p.waitForTimeout(500);
    }
    // 리모컨으로 진행: 수업 시작 → 도입 → 개념 1 → 문제 1
    for (let k = 0; k < 3; k++) { await p.evaluate(() => document.querySelector('#t-fwd').click()); await p.waitForTimeout(1800); }
    const R2 = await room(p);
    ok((R2.state.step ?? -1) >= 1, `${nm} 리모컨 「앞으로 ▶」 = 수업 진행 (단계 ${R2.state.step})`);
    if (nm === 'pc') { await p.waitForTimeout(25000); const R3 = await room(p), dmg = Object.keys(((R3.answers || R3.att || {})) || {}).length; await p.screenshot({ path: `${OUT}/trial-teach-pc.png` }); ok(true, `PC 캡처 (기록 칸 ${dmg})`); }
    else await p.screenshot({ path: `${OUT}/trial-teach-phone.png` });
    await c.close();
  }
  console.log(fail ? `❌ ${fail}` : `✅ 통과 ${pass}`); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (fail || errs.length) process.exit(1);
})();
