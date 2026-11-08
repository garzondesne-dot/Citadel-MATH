// 👩‍🏫 교사용 체험판 v2 (trial/ · 2026-11-07 「테스트 모드 기준 · 3차시 · 디펜스 빼기」)
//   첫 화면(이름 · 용사 6) → 내 캠프 → 차원문 → 대기실(친구 4) → 도입 · 개념1(👀 집중) → 문제 1(한 번 틀리고 고침) · 위 TV = 종합상황실 레이드
//   → 🏕 쉼터(디펜스 없음 · ⚖ 한 판) → 개념2 · 문제 2 → 👑 3문항 → 결과 → 내 캠프 💎 200 · 성채 1층 01~03 · 허수아비 3차시 · ≪ 메뉴화면
//   node tools/e2e/e2e75.js <출력 폴더>   (로컬 서버 http://localhost:8765)
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = 'http://localhost:8765/trial/';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = [];
  await ctx.addInitScript(() => { window.DS_FUN = { pick: 4000, show: 2500 }; });
  const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push((e.stack || e.message).split('\n').slice(0, 3).join(' | '))); p.on('dialog', (d) => d.accept());
  const P = (s) => { log.push(s); console.log(s); };
  const shot = (n) => p.screenshot({ path: `${OUT}/75-${n}.png` });
  const shut = () => p.evaluate(() => document.querySelectorAll('.th-chest-ov, .bat-ov, .th-bat').forEach((e) => e.remove())); // 🎁 · 🦇 무작위 팝업
  const bar = () => p.evaluate(() => (document.querySelector('#test-bar') || {}).innerText || '');
  const next = async (ms = 2500) => { await shut(); await p.click('#tb-next'); await p.waitForTimeout(ms); };
  const room = () => p.evaluate(async () => { const c = Object.keys((await DS.Net.get('rooms')) || {}).pop(); return c ? DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)) : null; });
  // 내 답 (bots.js given 과 같은 꼴)
  const answer = (att, firstWrong) => p.evaluate(async ([att, w]) => {
    const c = Object.keys((await DS.Net.get('rooms')) || {}).pop(), R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)), L = DS.Lessons.get(R.meta.lesson), st = DS.Raid.stepOf(L, R), me = DS.Net.uid();
    if (st.kind === 'boss') { for (let i = 0; i < L.boss.items; i++) await DS.Net.set(`rooms/${c}/bossTry/${me}/${i}/0`, DS.Net.pack(DS.Bots.given(L.boss.sets[1][i], true))); return 'boss'; }
    const items = DS.Raid.itemsFor(L, R, st.id, me, att);
    await DS.Net.set(`rooms/${c}/subs/${st.id}/${me}/${att}`, DS.Net.pack(items.map((q, i) => DS.Bots.given(q, !(w && i === 0)))));
    return st.id;
  }, [att, firstWrong]);
  // ① 첫 화면(이름 · 용사) → 내 캠프
  await p.goto(U); await p.waitForTimeout(4000); await shot('1-splash');
  const cap = await p.evaluate(() => (document.querySelector('.trial-pick .tp-h') || {}).textContent || '');
  const pick6 = (await p.$$('.trial-pick .tp-h1')).length;
  await p.fill('#tp-name', '김선생'); await p.click('.tp-h1[data-h="2"]'); await p.click('#tp-go');
  await p.waitForTimeout(3500); await shot('2-camp');
  const mem = await p.evaluate(() => !(window.localStorage instanceof Storage));
  const camp1 = { bar: await bar(), anvil: await p.evaluate(() => !!document.querySelector('#camp-anvil') && getComputedStyle(document.querySelector('#camp-anvil')).display !== 'none'), gate: await p.evaluate(() => document.querySelector('#camp-gate .camp-label').textContent) };
  const campName = await p.evaluate(() => (document.querySelector('.camp-plate') || {}).textContent || ''), setLbl = await p.evaluate(() => (document.querySelector('#camp-set') || {}).textContent || '');
  P(`① 안내 「${cap.slice(0, 40)}」 · 용사 ${pick6}명 · 이름 「${campName.trim()}」 · 단추 「${setLbl}」 · 메모리 저장소 ${mem} · 막대 「${camp1.bar.replace(/\n/g, ' ')}」 · 모루 보임 ${camp1.anvil} · 관문 「${camp1.gate}」`);
  // ② 관문 → 대기실 → 수업 시작
  await shut(); await p.click('#camp-gate'); await p.waitForTimeout(4000);
  for (let k = 0; k < 15; k++) { if (/수업 시작 ▶ \(5/.test(await bar())) break; await p.waitForTimeout(1000); }
  const tvLobby = await p.evaluate(() => ({ tv: !!document.querySelector('#test-tv #screen-hall.tv-embed'), qr: !!document.querySelector('#test-tv #h-arena canvas, #test-tv #h-arena img') }));
  await shot('3-lobby'); P(`② 대기실 막대 「${(await bar()).replace(/\n/g, ' ')}」 · 위 TV 종합상황실 ${tvLobby.tv}`);
  await next(); await shot('4-intro'); await next(3000);
  // ③ 개념 1: 집중모드 (개념은 저절로 켜짐) → 👀 끄기
  const foc = await p.evaluate(() => { const o = document.getElementById('focus'); return !!o && !o.hidden; });
  await shot('5-c1-focus');
  if (foc) { await p.click('#tb-focus'); await p.waitForTimeout(1500); }
  const focOff = await p.evaluate(() => { const o = document.getElementById('focus'); return !o || o.hidden; });
  await p.click('#tb-focus'); await p.waitForTimeout(1500); const focOn2 = await p.evaluate(() => { const o = document.getElementById('focus'); return !!o && !o.hidden; });
  await p.click('#tb-focus'); await p.waitForTimeout(1000);
  P(`③ 개념 1 집중 화면 ${foc} → 👀 끔 ${focOff} → 👀 다시 켬 ${focOn2}`);
  // ④ 문제 1: 한 번 틀리고 고침 · 위 TV = 레이드 장면
  await next(3000); await answer(0, true); await p.waitForTimeout(3000); await answer(1, false); await p.waitForTimeout(6000); await shut(); await shot('6-m1');
  const raidTv = await p.evaluate(() => !!document.querySelector('#test-tv #raid'));
  let R = await room(); const friends = Object.values(R.players || {}).filter((x) => !x.teacher).length - 1;
  P(`④ 문제 1 · TV 레이드 ${raidTv} · 친구 ${friends}명`);
  // ⑨ ≪ 메뉴화면 (수업 중): → 내 캠프(TV 닫힘) → 아치 문으로 다시 들어가면 이어서
  await shut(); await p.click('#st-back'); await p.waitForTimeout(2500);
  const back = await p.evaluate(() => ({ scr: document.querySelector('.screen.active').id, tv: !!document.querySelector('#test-tv') }));
  await shut(); await p.click('#camp-gate'); await p.waitForTimeout(5000);
  const again = await p.evaluate(() => ({ scr: document.querySelector('.screen.active').id, tv: !!document.querySelector('#test-tv #screen-hall'), step: (document.querySelector('#test-bar .tb-step') || {}).textContent || '' }));
  P(`⑨ ≪ 메뉴화면 → ${back.scr} (TV 닫힘 ${!back.tv}) → 다시 입장 ${again.scr} · TV ${again.tv} · 「${again.step}」`);
  // ⑤ 🏕 쉼터: 디펜스 없음 · ⚖ 한 판
  await shut(); await p.click('#tb-rest'); await p.waitForTimeout(2000);
  const funBtns = await p.evaluate(() => [...document.querySelectorAll('#test-fun button')].map((x) => x.textContent.trim()));
  await p.click('#test-fun .fun-btn.k-bal'); await p.waitForTimeout(5000); await shot('7-bal');
  const balTv = await p.evaluate(() => !!document.querySelector('#test-tv .fa-wrap'));
  await p.click('#test-fun [data-fun="stop"]').catch(() => {}); await p.waitForTimeout(1500);
  await p.click('#tb-back-class'); await p.waitForTimeout(2000);
  P(`⑤ 쉼터 단추 ${funBtns.join(' · ')} · ⚖ TV ${balTv}`);
  // ⑥ 개념 2 → 문제 2 → 👑 3문항 → 마무리 → 수업 끝
  await next(3000); await next(3000); await answer(0, false); await p.waitForTimeout(5000);
  await next(4000); await answer(0, false); await p.waitForTimeout(7000); await shut(); await shot('8-boss');
  R = await room(); const bossN = await p.evaluate(() => document.querySelectorAll('.boss-items .bitem').length);
  const closeRes = async () => { await shut(); for (let k = 0; k < 4; k++) { const x = await p.$('#rs-ok'); if (!x) return; await x.click().catch(() => {}); await p.waitForTimeout(1200); } };
  await closeRes(); await next(4000); await closeRes(); await shot('9-finale');
  await next(800); await closeRes(); await next(6000); await closeRes();
  // ⑦ 내 캠프: 💎 200 · 막대 · TV 닫힘 · 안내 없음
  await shot('10-camp-after');
  const after = await p.evaluate(async () => { const d = (await DS.Gem.mine({ c: '체험', n: 1 })) || {}; return { gem: d.total || 0, gift: !!((d.log || {}).trial_gift), tv: !!document.querySelector('#test-tv'), tut: !!document.querySelector('#tut-coach'), scr: document.querySelector('.screen.active').id, recs: Object.keys((await DS.Net.get('records/체험/1')) || {}) }; });
  P(`⑥ 보스 문항 ${bossN} · ⑦ ${after.scr} · 💎 ${after.gem} (선물 ${after.gift}) · TV 닫힘 ${!after.tv} · 안내 없음 ${!after.tut} · 기록 ${after.recs.join(',')}`);
  // ⑧ 성채 1층 · 허수아비
  await shut(); await p.click('#camp-castle'); await p.waitForTimeout(3500); await shot('11-castle');
  const rooms = await p.evaluate(() => [...document.querySelectorAll('.cs-room[data-fight]')].map((e) => e.dataset.fight.split('|')[1]));
  await p.click('#bn-back'); await p.waitForTimeout(2500);
  await shut(); await p.click('#camp-dummy'); await p.waitForTimeout(3000); await shot('12-dummy');
  const dummy = await p.evaluate(() => document.querySelector('#bonus') ? document.querySelector('#bonus').innerText.match(/\d+차시/g) || [] : []);
  await p.click('#bn-back'); await p.waitForTimeout(2000);
  P(`⑧ 성채 열린 방 ${rooms.join(',')} · 허수아비 ${[...new Set(dummy)].join(',')}`);
  const ok = /3차시/.test(cap) && pick6 === 6 && /김선생/.test(campName) && /＋|상점/.test(setLbl) && mem && /체험판/.test(camp1.bar) && camp1.anvil && /3차시 입장/.test(camp1.gate) && tvLobby.tv && foc && focOff && focOn2 && raidTv && friends >= 4
    && !funBtns.some((t) => /디펜스/.test(t)) && funBtns.some((t) => /밸런스/.test(t)) && balTv && bossN === 3 && after.scr === 'screen-camp' && after.gem >= 200 && after.gift && !after.tv && !after.tut && after.recs.includes('set-03')
    && rooms.join(',') === 'q01,q02,q03' && dummy.includes('3차시') && back.scr === 'screen-camp' && !back.tv && again.scr === 'screen-student' && again.tv && /문제 1/.test(again.step);
  console.log(ok ? '✅ 통과' : '❌ 기대와 다름'); console.log('errors', errs.length ? errs.slice(0, 5) : 'none'); await b.close(); if (!ok || errs.length) process.exit(1);
})();
