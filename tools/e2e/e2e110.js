// 👩‍🏫 #80 체험판 7차시 (trial/ · 2026-11-11): 첫 화면 대표 그림 · 차시 카드(3차시 위 · 7차시 아래) → 7차시 → 내 캠프 💎 200 → 차원문 → 대기실(친구 4)
//   → 도입 → 문제 4(소레이드 · 체험판 숫자 6 · 3 · 18 · 정찰 5초) → ✍ 📸 = 「✔ 테스트: 사진 통과로 보기」 → 🏕 → 문제 6 → 👑 문제 7 → 결과 → 내 캠프(「⚔ 3차시로」 · 💎 620 없음)
//   → 허수아비 7차시(형성평가 칸 없음) · 폰 360 · PC 1280 첫 화면 캡처 · node tools/e2e/e2e110.js <출력 폴더>   (로컬 서버 http://localhost:8765)
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = `http://localhost:${process.env.PORT || 8765}/trial/`;
(async () => {
  const b = await chromium.launch(); const errs = []; let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) pass++; else fail++; console.log(`${c ? '✔' : '✘'} ${m}`); };
  // 첫 화면 캡처 (PC · 폰)
  for (const [nm, vp] of [['pc', { width: 1280, height: 720 }], ['phone', { width: 360, height: 780 }]]) {
    const c = await b.newContext({ viewport: vp, deviceScaleFactor: 2 }); const q = await c.newPage(); q.on('pageerror', (e) => errs.push(e.message));
    await q.goto(U); await q.waitForTimeout(3500); await q.screenshot({ path: `${OUT}/110-first-${nm}.png` }); await q.click('[data-mode="s"]'); await q.waitForTimeout(300);
    const f = await q.evaluate(() => { const k = document.querySelector('.sp-key img'), p = document.querySelector('.trial-pick'), r = p.getBoundingClientRect(); return { key: !!k && k.complete && k.naturalWidth === 1672, cards: [...p.querySelectorAll('[data-go]')].map((x) => x.dataset.go), cam: getComputedStyle(document.querySelector('.sp-cam') || document.body).display, top: r.top, h: innerHeight, sw: document.documentElement.scrollWidth, w: innerWidth }; });
    ok(f.key && f.cards.join() === 'set-03,trial-07' && (f.cam === 'none') && f.sw <= f.w + 1, `${nm} 첫 화면: 대표 그림 · 카드 ${f.cards} · 옛 배경 숨김 · 가로 넘침 없음 · 판 위끝 ${Math.round(f.top)} / ${f.h}`);
    await c.close();
  }
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(() => { window.DS_FUN = { pick: 4000, show: 2500 }; });
  const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push((e.stack || e.message).split('\n').slice(0, 3).join(' | '))); p.on('dialog', (d) => d.accept());
  const shot = (n) => p.screenshot({ path: `${OUT}/110-${n}.png` });
  const shut = () => p.evaluate(() => document.querySelectorAll('.th-chest-ov, .bat-ov, .th-bat').forEach((e) => e.remove()));
  const bar = () => p.evaluate(() => (document.querySelector('#test-bar') || {}).innerText || '');
  const next = async (ms = 2500) => { await shut(); await p.click('#tb-next'); await p.waitForTimeout(ms); };
  const room = () => p.evaluate(async () => { const c = Object.keys((await DS.Net.get('rooms')) || {}).pop(); return c ? DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)) : null; });
  const ansNow = () => p.evaluate(async () => { const code = Object.keys((await DS.Net.get('rooms')) || {}).pop(); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); const L = DS.Lessons.get(R.meta.lesson), st = DS.Raid.stepOf(L, R); return DS.Raid.chainItems(L, R, st.id, DS.Net.uid(), 0).map((q) => (q.type === 'multi' ? q.answer.map((i) => q.options[i]).join('|') : q.type === 'choice' ? q.choices[q.answerIndex] : String(q.answer))).join(' / '); });
  const chainAll = () => p.evaluate(async () => { const code = Object.keys((await DS.Net.get('rooms')) || {}).pop(); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); const L = DS.Lessons.get(R.meta.lesson), st = DS.Raid.stepOf(L, R), me = DS.Net.uid();
    let rec = DS.Raid.record(L, R, st.id, me); for (let g = 0; g < 8 && !rec.done; g++) { const q = rec.items[rec.stage], v = DS.Bots.given(q, true); rec = await DS.Act.chainSubmit(code, await DS.Net.get(`rooms/${code}`), st.id, rec.stage, 0, q.type === 'number' ? Number(Array.isArray(v) ? v[0] : v) : v); } return st.id + ':' + !!rec.done; });
  await p.goto(U); await p.waitForTimeout(3500);
  await p.click('[data-mode="s"]'); await p.waitForTimeout(300); await p.fill('#tp-name', '이선생'); await p.click('.tp-h1[data-h="1"]'); await p.click('[data-go="trial-07"]'); await p.waitForTimeout(3500); await shot('1-camp');
  const g0 = await p.evaluate(async () => { const d = (await DS.Gem.mine({ c: '체험', n: 1 })) || {}; return { gem: d.total || 0, bar: (document.querySelector('#test-bar') || {}).innerText || '', gate: (document.querySelector('#camp-gate .camp-label') || {}).textContent || '' }; });
  ok(g0.gem === 200 && /3차시로/.test(g0.bar) && /7차시/.test(g0.gate), `내 캠프 💎 ${g0.gem} · 막대 「${g0.bar.replace(/\n/g, ' ')}」 · 관문 「${g0.gate}」`);
  await shut(); await p.click('#camp-gate'); await p.waitForTimeout(4000);
  for (let k = 0; k < 15; k++) { if (/수업 시작 ▶ \(5/.test(await bar())) break; await p.waitForTimeout(1000); }
  let R = await room(); ok(R.meta.lesson === 'trial-07' && Number(R.meta.solve) === 5, `방 = 체험판 7차시 · 정찰 ${R.meta.solve}초`); ok(Number(R.meta.pct) === 100, `👩‍🏫 #92 체험판 성취 기준 = ${R.meta.pct} (100 · 원래 수업 90)`);
  await next(); await shot('2-intro'); await next(4000);
  R = await room(); const st1 = DS_step(R);
  function DS_step(R) { return (R.state || {}).step; }
  await p.waitForTimeout(6000); await shot('3-u4');
  const q4 = await p.evaluate(() => document.body.innerText);
  ok(/x는 6의 약수/.test(q4) && /x는 18 이하의 3의 배수/.test(q4), `문제 4 = 체험판 숫자 (6의 약수 · 18 이하의 3의 배수) · 단계 ${st1}`);
  const r4 = await chainAll(); await p.waitForTimeout(5000); await shut(); await shot('4-u4-done');
  ok(/u4:true/.test(r4), `문제 4 졸개 → 대장 처치 (${r4})`);
  // ✍ 📸 체험판 = 사진 없이 통과 장면
  const wr = await p.$('.dock-wr:not([disabled]), .dk-wr:not([disabled])'); ok(!!wr, '✍ 서술형 도전 단추');
  if (wr) { await wr.click(); await p.waitForTimeout(1200); const sn = await p.$('#wr-snap'); if (sn) { await sn.click(); await p.waitForTimeout(1200); } await shot('5-photo');
    const btn = await p.$('#ph-trial'); ok(!!btn && !(await p.$('#ph-cam')), '📷 창 = 「✔ 테스트: 사진 통과로 보기」 (찍기 단추 없음)');
    if (btn) { await btn.click(); await p.waitForTimeout(3500); } await shot('6-photo-pass');
    const sc = await p.evaluate(async () => { const d = (await DS.Gem.mine({ c: '체험', n: 1 })) || {}; return Number(d.scroll) || 0; }); ok(sc >= 1, `서술 통과 → 📜 ${sc}`); }
  // 🏕 → 문제 6 → 👑 문제 7
  await shut(); await p.click('#tb-rest'); await p.waitForTimeout(1500); await p.click('#tb-back-class').catch(() => {}); await p.waitForTimeout(1500);
  await next(4000); await p.waitForTimeout(6000); R = await room(); const s6 = await p.evaluate(() => document.body.innerText); await shot('6b-u6'); const a6 = await ansNow(); ok(/ \/ 18 \/ .* \/ 7$/.test(a6) && /가장 많을/.test(s6), `문제 6 = 체험판 숫자 (최댓값 18 · 최솟값 7 · ${a6})`);
  await chainAll(); await p.waitForTimeout(4000);
  await next(4000); await p.waitForTimeout(6000); const s7 = await p.evaluate(() => document.body.innerText); await shot('7-u7');
  const a7 = await ansNow(); ok(/^49 \/ .* \/ 9 \/ 12 \/ 45$/.test(a7) && /50 미만/.test(s7) && /보스 · 문제 7/.test(s7), `👑 문제 7 = 체험판 숫자 (49 · 9 · 12 · 45 · ${a7})`);
  const r7 = await chainAll(); await p.waitForTimeout(5000); ok(/u7:true/.test(r7), `문제 7 처치 (${r7})`);
  const closeRes = async () => { await shut(); for (let k = 0; k < 4; k++) { const x = await p.$('#rs-ok'); if (!x) return; await x.click().catch(() => {}); await p.waitForTimeout(1200); } };
  await next(4000); await closeRes(); await shot('8-finale'); await next(800); await closeRes(); await next(6000); await closeRes(); await shot('9-camp-after');
  const after = await p.evaluate(async () => { const d = (await DS.Gem.mine({ c: '체험', n: 1 })) || {}; return { rec: JSON.stringify(((await DS.Net.get('records/체험/1')) || {})['trial-07'] || {}).slice(0, 400), scr: document.querySelector('.screen.active').id, gift3: !!((d.log || {}).trial_gift3), bar: (document.querySelector('#test-bar') || {}).innerText || '', recs: Object.keys((await DS.Net.get('records/체험/1')) || {}) }; });
  ok(after.scr === 'screen-camp' && !after.gift3 && /3차시로/.test(after.bar) && after.recs.includes('trial-07'), `수업 끝 → ${after.scr} · 기록 ${after.rec} · 3차시 선물 없음 ${!after.gift3} · 기록 ${after.recs}`);
  // 허수아비 7차시: 형성평가 칸 없음
  await shut(); await p.click('#camp-dummy'); await p.waitForTimeout(3000); await shot('10-dummy');
  const dm = await p.evaluate(() => { const t = (document.querySelector('#bonus') || {}).innerText || ''; const c7 = [...document.querySelectorAll('#bonus .bn-card, #bonus .bn-lesson, #bonus section, #bonus details')].find((e) => /7차시/.test(e.innerText) && !/3차시/.test(e.innerText)) || document.querySelector('#bonus'); return { n7: /7차시/.test(t), boss: [...c7.querySelectorAll('.bn-row.boss')].length, rows7: [...c7.querySelectorAll('.bn-row')].length, ok7: /한 번에 맞힘|재도전으로 고침/.test(c7.innerText) && !/틀림/.test(c7.innerText), rows: [...document.querySelectorAll('#bonus .bn-row')].map((e) => e.innerText.replace(/\s+/g, ' ').slice(0, 30)) }; });
  ok(dm.n7 && !dm.boss && dm.rows7 === 3 && dm.ok7, `허수아비 7차시 · 형성평가 칸 없음 (${JSON.stringify(dm)})`);
  await p.click('#bn-back'); await p.waitForTimeout(2000);
  // ⚔ 3차시로 → 차원문이 3차시로
  await p.click('[data-tl="set-03"]'); await p.waitForTimeout(3000); R = await p.evaluate(async () => { const live = await DS.Net.get('live/체험'); return live && live.code ? DS.Act.unpackRoom(await DS.Net.get(`rooms/${live.code}`)) : null; });
  ok(R && R.meta.lesson === 'set-03', `「⚔ 3차시로」 → 새 방 ${R && R.meta.lesson}`);
  console.log(fail ? `❌ e2e110: 확인 ${pass} · 실패 ${fail}` : `✅ e2e110: 확인 ${pass} · 실패 0`); console.log('errors', errs.length ? errs.slice(0, 5) : 'none'); await b.close(); if (fail || errs.length) process.exit(1);
})();
