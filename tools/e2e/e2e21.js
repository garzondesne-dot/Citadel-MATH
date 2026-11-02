// v2 도트 용사 (금발 검사 16번): ① 설정에서 고르기 ② 캠프 모닥불 앞 앉기 ③ 차원문 = 뒷모습으로 들어가기 ④ 레이드 풀 때 생각 중 ⑤ 힐 받음
// 사용: python3 -m http.server 8765 (저장소 폴더) 띄운 뒤 node tools/e2e/e2e21.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [];
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T');
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n2 이서연\n3 박지호'); await T.click('#r-up'); await T.waitForTimeout(800);
  await T.click('#screen-students .nav-back'); await T.waitForTimeout(1500); if (await T.isVisible('#splash')) { await T.click('#splash'); await T.waitForTimeout(400); }
  if (!(await T.isVisible('#lesson'))) { await T.click('.role[data-role=teacher]'); await T.waitForTimeout(600); }
  const S1 = await mk('S1'); await S1.goto(U + '&role=student'); await S1.waitForTimeout(1500);
  if (await S1.isVisible('#splash')) { await S1.click('#splash'); await S1.waitForTimeout(500); }
  await S1.selectOption('#s-cls', '1-3'); await S1.waitForTimeout(200); await S1.selectOption('#s-num', '1'); await S1.waitForTimeout(300);
  await S1.click('#s-new'); await S1.fill('#s-p1', '1234'); await S1.fill('#s-p2', '1234'); await S1.click('#s-make'); await S1.waitForTimeout(1200);
  await S1.click('#s-go'); await S1.waitForTimeout(2000);
  // ① 설정에서 금발 검사(16) 고르기
  await S1.click('#camp-set'); await S1.waitForTimeout(800);
  await S1.click('[data-h="16"]'); await S1.waitForTimeout(400);
  await S1.screenshot({ path: `${OUT}/1-settings.png` });
  await S1.click('#set-ok'); await S1.waitForTimeout(1500);
  // ② 캠프: 앉아 쉬기
  console.log('camp anim:', await S1.getAttribute('.camp-hero .art', 'data-anim'));
  await S1.screenshot({ path: `${OUT}/2-camp-sit.png` });
  await S1.evaluate(() => document.querySelector('#camp-dummy').classList.add('picked')); await S1.waitForTimeout(150); await S1.screenshot({ path: `${OUT}/2b-dummy-hit.png` }); await S1.evaluate(() => document.querySelector('#camp-dummy').classList.remove('picked'));
  // 수업 열기 → 차원문
  await T.selectOption('#lesson', 'set-06'); await T.selectOption('#t-cls', '1-3'); await T.click('#t-new'); await T.waitForTimeout(2500);
  const code = await T.evaluate(() => DS.Teacher.code()), key = (await T.textContent('#t-key')).trim();
  const H = await mk('H'); await H.setViewportSize({ width: 1600, height: 900 }); await H.goto(`${U}&role=hall&code=${code}&key=${key}`); await H.waitForTimeout(2500);
  await S1.bringToFront(); await S1.waitForTimeout(1500);
  await S1.click('#camp-gate');
  for (const ms of [200, 500, 800, 1000]) { await S1.waitForTimeout(ms === 200 ? 200 : ms === 1000 ? 200 : 300); await S1.screenshot({ path: `${OUT}/3-portal-${ms}.png` });
    if (ms === 800) console.log('portal center gap (px):', await S1.evaluate(() => { const p = document.querySelector('.camp-portal').getBoundingClientRect(), h = document.querySelector('.camp-hero .art').getBoundingClientRect(); return [Math.round(p.left + p.width / 2 - h.left - h.width / 2), Math.round(p.top + p.height / 2 - h.top - h.height / 2)]; })); }
  console.log('portal anim:', await S1.getAttribute('.camp-hero .art', 'data-anim').catch(() => 'gone'));
  await S1.waitForTimeout(2500);
  const go = () => T.evaluate(async () => { const code = DS.Teacher.code(); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); await DS.Act.go(code, R, DS.Lessons.get(R.meta.lesson), 1); });
  if (process.env.V2MON) await S1.evaluate(() => { const L = DS.Lessons.get('set-06'); L.monsters.m1.sprite = 'rift:0'; L.boss.sprite = 'riftboss:0'; L.theme = '03-dimensional'; }); // V2MON=1: v2 몬스터 미리보기 (이 브라우저에서만)
  for (let k = 0; k < 3; k++) { await go(); await T.waitForTimeout(800); } // 도입 → 개념1 → 문제1
  await S1.waitForTimeout(1500);
  console.log('fight anim:', await S1.getAttribute('.enc-hero .art', 'data-anim').catch(() => 'none'));
  await S1.screenshot({ path: `${OUT}/4-raid-think.png` });
  // 👾 몬스터 공격: 시험용으로 4초마다 1초 잠금
  await S1.bringToFront();
  console.log('hidden:', await S1.evaluate(() => document.hidden), 'focus hidden:', await S1.evaluate(() => document.querySelector('#focus').hidden));
  await S1.evaluate(() => { window.DS_ATK = { monster: [4, 1], boss: [5, 2] }; }); await H.evaluate(() => { window.DS_ATK = { monster: [4, 1], boss: [5, 2] }; });
  // 🔗 동기화: 같은 순간 종합상황실 · 학생 폰 게이지 비교
  for (let k = 0; k < 3; k++) { const [a, b] = await Promise.all([H.$eval('#rh-atk i', (e) => e.style.width), S1.$eval('.atk-gauge i', (e) => e.style.width).catch(() => '-')]); console.log('sync hall/phone:', a, b); await S1.waitForTimeout(700); }
  await H.waitForSelector('.atk-banner', { timeout: 5000 }).catch(() => null); await H.waitForTimeout(500);
  console.log('hall banner:', !!(await H.$('.atk-banner')), 'hall heroes pant:', await H.$$eval('.fh2 .art', (as) => as.map((a) => a.dataset.anim || 'v1').join(',')));
  await H.screenshot({ path: `${OUT}/7-hall-strike.png` });
  const samples = []; for (let k = 0; k < 7; k++) { samples.push(await S1.$eval('.atk-gauge i', (e) => e.style.width).catch(() => '-')); await S1.waitForTimeout(500); }
  console.log('gauge samples (0.5s):', samples.join(' '));
  await S1.screenshot({ path: `${OUT}/4b-gauge-hot.png` });
  console.log('gauge width before hit:', await S1.$eval('.atk-gauge i', (e) => e.style.width).catch(() => 'none'));
  await S1.waitForSelector('.stun', { timeout: 3000 }).catch(() => null); await S1.waitForTimeout(250);
  console.log('stun shown:', !!(await S1.$('.stun')), 'hero anim:', await S1.getAttribute('.enc-hero .art', 'data-anim').catch(() => 'none'));
  await S1.screenshot({ path: `${OUT}/4c-struck.png` });
  await S1.waitForTimeout(1200); console.log('stun after 1.2s:', !!(await S1.$('.stun')));
  await S1.evaluate(() => { window.DS_ATK = null; });
  // ⑤ 힐 받음: 4번 다 틀리고 가상 친구가 힐
  await T.evaluate(async (c) => { await DS.Net.set(`rooms/${c}/players/f2`, { num: 2, nick: '이서연', hero: 2, at: Date.now() }); await DS.Net.set(`rooms/${c}/active/f2`, true); }, code);
  const subAs = (page, who, a, k) => page.evaluate(async ([who, a, k]) => {
    const code = (DS.Teacher && DS.Teacher.code()) || JSON.parse(localStorage.getItem('citadel-student')).code;
    const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); const L = DS.Lessons.get(R.meta.lesson), st = DS.Raid.stepOf(L, R);
    const u = who === 'me' ? DS.Net.uid() : who; const right = (q) => (q.type === 'choice' ? q.answerIndex : q.answer);
    const ans = DS.Raid.itemsFor(L, R, st.id, u, a).map((q, i) => (k < 0 || i < k ? right(q) : (q.type === 'multi' ? [] : -1)));
    if (who === 'me') await DS.Act.submit(code, R, st.id, a, ans); else await DS.Net.set(`rooms/${code}/subs/${st.id}/${u}/${a}`, DS.Net.pack(ans));
    return st.id;
  }, [who, a, k]);
  for (let a = 0; a < 4; a++) { await subAs(S1, 'me', a, 0); await S1.waitForTimeout(400); }
  await S1.waitForTimeout(1500);
  const s1uid = await S1.evaluate(() => DS.Net.uid());
  await subAs(T, 'f2', 0, -1);
  await T.evaluate(async ([c, to]) => { await DS.Net.set(`rooms/${c}/heals/m1/f2/0`, to); }, [code, s1uid]);
  await S1.waitForTimeout(500);
  console.log('healed anim:', await S1.getAttribute('.enc-hero .art', 'data-anim').catch(() => 'none'));
  await S1.screenshot({ path: `${OUT}/5-healed.png` });
  await S1.waitForTimeout(2200);
  console.log('after heal anim:', await S1.getAttribute('.enc-hero .art', 'data-anim').catch(() => 'none'));
  // 👑 보스 장면: 내 용사 · 머리 위 체력 · 공격 게이지
  for (let k = 0; k < 16; k++) { const kind = await T.evaluate(async () => { const code = DS.Teacher.code(); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); return DS.Raid.stepOf(DS.Lessons.get(R.meta.lesson), R).kind; }); if (kind === 'boss') break; await go(); await T.waitForTimeout(500); }
  await S1.bringToFront(); await S1.waitForTimeout(1500);
  await S1.screenshot({ path: `${OUT}/6-boss.png` });
  await S1.evaluate(() => { window.DS_ATK = { monster: [4, 1], boss: [3, 2] }; }); await S1.waitForTimeout(2200);
  await S1.waitForSelector('.stun', { timeout: 4000 }).catch(() => null); await S1.waitForTimeout(300);
  console.log('boss stun:', !!(await S1.$('.stun')), 'hero:', await S1.getAttribute('.enc-hero .art', 'data-anim').catch(() => 'none'));
  await S1.screenshot({ path: `${OUT}/6b-boss-struck.png` });
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
})();
