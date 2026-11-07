// 👩‍🏫 교사용 체험판 (?trial · 2026-11-07): 첫 화면 이름 · 용사 → 캠프(첫 수업 안내 · 관문만) → 대기실(친구 4 + 늦게 1) → 개념 + 🎬 → 문제 1(한 번 틀리고 고침)
//   → 🏕 쉼터 ⭕ · ⚖ · 🔄 · 🏰 → 문제 2 → 👑 3문항 → 결과 → 캠프(하나씩 소개) · 💎100 · 성채 04 · 07 만 · 07 사진 = 테스트 안내 · 저장소 = 메모리
//   node tools/e2e/e2e75.js <출력 폴더>   (로컬 서버 http://localhost:8765)
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = 'http://localhost:8765/index.html?trial';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = [];
  await ctx.addInitScript(() => { window.DS_FUN = { pick: 4000, show: 2500 }; window.DS_TD = { pick: 8000, speed: 6 }; });
  const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push((e.stack || e.message).split('\n').slice(0, 3).join(' | '))); p.on('dialog', (d) => d.accept());
  const P = (s) => { log.push(s); console.log(s); };
  const shot = (n) => p.screenshot({ path: `${OUT}/75-${n}.png` });
  const ai = () => p.evaluate(() => (document.querySelector('.trial-ai .ta-msg') || {}).textContent || '');
  const tap = async (k) => { const el = await p.$(`[data-ta="${k}"]`); if (el) { await el.click(); return true; } return false; };
  const room = () => p.evaluate(async () => { const c = Object.keys((await DS.Net.get('rooms')) || {}).pop(); return c ? DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)) : null; });
  // 내 답 (bots.js given 과 같은 꼴): ok = [소문제마다 맞힘?]
  const answer = (att, okFirstWrong) => p.evaluate(async ([att, w]) => {
    const c = Object.keys((await DS.Net.get('rooms')) || {}).pop(), R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)), L = DS.Lessons.get(R.meta.lesson), st = DS.Raid.stepOf(L, R), me = DS.Net.uid();
    if (st.kind === 'boss') { for (let i = 0; i < L.boss.items; i++) await DS.Net.set(`rooms/${c}/bossTry/${me}/${i}/0`, DS.Net.pack(DS.Bots.given(L.boss.sets[1][i], true))); return 'boss'; }
    const items = DS.Raid.itemsFor(L, R, st.id, me, att);
    await DS.Net.set(`rooms/${c}/subs/${st.id}/${me}/${att}`, DS.Net.pack(items.map((q, i) => DS.Bots.given(q, !(w && i === 0)))));
    return st.id;
  }, [att, okFirstWrong]);
  // ① 첫 화면 → 이름 · 용사
  await p.goto(U); await p.waitForTimeout(4500); await shot('1-splash');
  const pick6 = (await p.$$('.trial-pick .tp-h1')).length;
  await p.fill('#tp-name', '김선생'); await p.click('.tp-h1[data-h="2"]'); await p.click('#tp-go'); await p.waitForTimeout(1500);
  const memStore = await p.evaluate(() => !(window.localStorage instanceof Storage) && !(window.sessionStorage instanceof Storage));
  const tutA = await p.evaluate(() => document.querySelector('#camp .camp-stage').classList.contains('tut-a'));
  await p.waitForTimeout(3500); await shot('2-camp-gate');
  const gateLbl = await p.evaluate(() => document.querySelector('#camp-gate .camp-label').textContent);
  P(`① 용사 ${pick6}명 · 메모리 저장소 ${memStore} · 첫 수업 안내(A) ${tutA} · 관문 「${gateLbl.trim()}」`);
  // ② 관문 → 대기실
  await p.click('#camp-gate'); await p.waitForTimeout(4000);
  for (let k = 0; k < 20; k++) { const t = await p.evaluate(() => (document.querySelector('[data-ta="go"]') || {}).textContent || ''); if (/수업 시작/.test(t)) break; await p.waitForTimeout(1000); }
  await shot('3-lobby'); P(`② 대기실 AI: ${(await ai()).slice(0, 60)}`);
  await tap('go'); await p.waitForTimeout(2500);
  // ③ 개념 + 영상
  const concept = await ai(); await shot('4-concept');
  await tap('vid'); await p.waitForTimeout(1500); const vidOpen = await p.evaluate(() => !!document.querySelector('video'));
  await p.keyboard.press('Escape'); await p.evaluate(() => document.querySelectorAll('.modal, .vid-modal').forEach((m) => m.remove())); await p.waitForTimeout(500);
  P(`③ 개념 AI 「${concept.slice(0, 40)}」 · 영상 열림 ${vidOpen}`);
  await tap('go'); await p.waitForTimeout(2500);
  // ④ 문제 1: 한 번 틀리고 → 고쳐서 맞힘
  await answer(0, true); await p.waitForTimeout(3500); await answer(1, false); await p.waitForTimeout(9000); await shot('5-battle');
  let R = await room(); const party = await p.evaluate(() => document.querySelectorAll('.trial-raid .enc-party .ep-h').length);
  const late = Object.values(R.players || {}).some((x) => x.nick === '지유');
  P(`④ 문제 1 · 레이드 배치 친구 ${party}명 · 늦게 온 지유 ${late} · 버튼 「${await p.evaluate(() => (document.querySelector('[data-ta="go"]') || {}).textContent)}」`);
  await tap('go'); await p.waitForTimeout(2000);
  // ⑤ 쉼터 4종
  const games = [];
  for (let g = 0; g < 4; g++) {
    if (!(await tap(g ? 'nextfun' : 'fun'))) { P(`쉼터 ${g} 단추 없음: ${await ai()}`); break; }
    await p.waitForTimeout(2500);
    let f = null; for (let k = 0; k < 120; k++) { R = await room(); f = R && R.fun; if (f && f.phase === 'end') break; if (k === 6) await shot(`6-fun${g}`); await p.waitForTimeout(1000); }
    games.push(`${f && f.kind}:${f && f.phase}`);
    if (f && f.kind === 'td') await shot('6-td-end');
  }
  P(`⑤ 쉼터 ${games.join(' · ')}`);
  await tap('back'); await p.waitForTimeout(2500);
  // ⑥ 문제 2 → 보스 3문항
  R = await room(); const st2 = DS_step(R);
  await answer(0, false); await p.waitForTimeout(6000); await tap('go'); await p.waitForTimeout(2500);
  await answer(0, false); await p.waitForTimeout(8000); await shot('7-boss');
  R = await room(); const bossItems = await p.evaluate(() => document.querySelectorAll('.boss-items .bitem').length);
  const closeRes = async () => { for (let k = 0; k < 4; k++) { const b = await p.$('#rs-ok'); if (!b) return; await b.click().catch(() => {}); await p.waitForTimeout(1200); } };
  await closeRes(); await tap('go'); await p.waitForTimeout(4000); await closeRes(); await shot('8-finale');
  await tap('go'); await p.waitForTimeout(800); await closeRes(); await tap('go'); await p.waitForTimeout(6000); await closeRes();
  P(`⑥ 문제 2 단계 ${st2} · 보스 문항 ${bossItems}개`);
  // ⑦ 캠프: 하나씩 소개(B) · 💎100
  await shot('9-camp-tour');
  const tour = [];
  for (let k = 0; k < 8; k++) { const t = await p.evaluate(() => { const c = document.querySelector('#tut-coach .tut-box b'); return c ? c.textContent : ''; }); if (!t) break; tour.push(t); const n = await p.$('#tut-next'); if (!n) break; await n.click(); await p.waitForTimeout(700); }
  const gem = await p.evaluate(async () => { const d = (await DS.Gem.mine({ c: '체험', n: 1 })) || {}; return { total: d.total || 0, gift: !!((d.log || {}).trial_gift) }; });
  const recs = await p.evaluate(async () => Object.keys((await DS.Net.get('records/체험/1')) || {}));
  P(`⑦ 소개 ${tour.join(' → ')} · 💎 ${gem.total} (선물 ${gem.gift}) · 기록 ${recs.join(',')}`);
  await shot('10-camp-free');
  // ⑧ 성채: 04 · 07 만 · 07 사진 = 테스트 안내
  await p.click('#camp-castle'); await p.waitForTimeout(3500);
  const rooms = await p.evaluate(() => [...document.querySelectorAll('.cs-room[data-fight]')].map((e) => e.dataset.fight.split('|')[1]));
  await shot('11-castle');
  let photo = '', photoPass = false;
  if (rooms.includes('q07')) {
    await p.click('[data-fight="eval-1|q07"]'); await p.waitForTimeout(1500); await p.click('#bf-go').catch(() => {});
    for (let k = 0; k < 6; k++) { // e2e70 과 같은 숫자 답 입력
      await p.waitForTimeout(500); if (await p.$('#bf-pv')) break;
      const open = await p.evaluate(() => { const q = document.getElementById('quiz'); return !!q && !q.classList.contains('hidden'); }); if (!open) continue;
      const ans = String(await p.evaluate(() => DS.Quiz.last.answer));
      for (const ch of ans) await p.click(`#quiz-choices .num-pad button:text-is("${ch === '-' ? '−' : ch}")`).catch(() => {});
      await p.click('#quiz-choices .q-submit').catch(() => {}); await p.waitForTimeout(1600);
    }
    await p.waitForTimeout(1500); photo = await p.evaluate(() => [...document.querySelectorAll('.bn-fight .bf-gift')].map((e) => e.textContent).join(' | ')); await shot('12-photo');
    const pv = await p.$('#bf-pv'); if (pv) { await pv.click(); await p.waitForTimeout(3000); } await shot('13-photo-pass');
    photoPass = await p.evaluate(async () => !!(((await DS.Net.get('bonus/체험/1/eval-1/q07')) || {}).clear));
  }
  P(`⑧ 성채 열린 방 ${rooms.join(',')} · 07 사진 안내 「${photo.slice(0, 80)}」 · 테스트 통과 → 처치 ${photoPass}`);
  const ok = pick6 === 6 && memStore && tutA && /6차시 입장/.test(gateLbl) && /드모르간/.test(gateLbl) && /개념/.test(concept) && vidOpen && party >= 4 && late
    && games.length === 4 && games.every((g) => /:end$/.test(g)) && bossItems === 3 && tour.length >= 5 && gem.gift && recs.includes('set-06') && rooms.join(',') === 'q04,q07' && /테스트/.test(photo) && photoPass;
  console.log(ok ? '✅ 통과' : '❌ 기대와 다름'); console.log('errors', errs.length ? errs.slice(0, 5) : 'none'); await b.close(); if (!ok || errs.length) process.exit(1);
  function DS_step(R) { try { return R.state.step; } catch (e) { return '?'; } }
})();
