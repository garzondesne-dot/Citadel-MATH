// 🏰 5분 타워 디펜스 (v0.9.14 · 2026-11-07) — node tools/e2e/e2e73.js <출력 폴더>
//   교사 폰 쉼터 → 🏰 디펜스 → 학생 3명 폰 지도에서 자리 (선착순 · 같은 칸 두 번 못 잡음) · 한 명은 안 골라 자동 배치
//   → 교실 TV: 난이도 맞추고 시작 · 몬스터 · 타워 · 웨이브 · 생명 / 폰: ⬆ 업그레이드 고르기 · 기술 / 교사: 🛡 방패 · ✨ 응원 → 결과 · 💎 (하루 첫 판)
//   window.DS_TD = { pick: 9000, speed: 3 } (자리 9초 · 3배 빨리)
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = [], P = (m) => log.push(m);
  await ctx.addInitScript(() => { window.DS_TD = { pick: 9000, speed: 3 }; });
  const mk = async (t) => { const p = await ctx.newPage(); p.on('console', (m) => { if (m.type() === 'error') errs.push(t + ' console: ' + m.text().slice(0, 160)); }); p.on('pageerror', (e) => errs.push(t + ': ' + e.message + ' @ ' + String(e.stack).split('\n').slice(1, 3).join(' '))); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T'); await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n2 이서연\n3 박지호'); await T.click('#r-up'); await T.waitForTimeout(800);
  const { code, hallKey: key } = await T.evaluate(() => DS.Act.createRoom('set-05', '1-3'));
  const stu = async (n, fx) => {
    const S = await mk('S' + n); await S.goto(U + '&role=student'); await S.waitForTimeout(1500); if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(400); }
    await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', String(n)); await S.waitForTimeout(300);
    await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200);
    await S.evaluate((n) => { localStorage.setItem(`citadel-tut-1-3-${n}`, JSON.stringify({ a: true, b: true })); }, n);
    await S.evaluate(async ([c, n, fx]) => { await DS.Student.enter(c, { cls: '1-3', num: n, nick: ['', '민준', '서연', '지호'][n], hero: [0, 0, 3, 7][n], fx }); }, [code, n, fx]).catch((e) => errs.push('enter ' + e.message));
    await S.waitForTimeout(1000); return S;
  };
  const S1 = await stu(1, 'fire'), S2 = await stu(2, 'ice'), S3 = await stu(3, 'flame');
  const H = await mk('H'); await H.setViewportSize({ width: 1400, height: 820 }); await H.goto(`${U}&role=hall&code=${code}&key=${key}`); await H.waitForTimeout(2500);
  // 수업 시작 → 쉼터 → 🏰 디펜스 (교사 리모컨 단추)
  await T.evaluate(async (c) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)), L = DS.Lessons.get(R.meta.lesson); await DS.Act.go(c, R, L, 1); const R2 = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); await DS.Act.setRest(c, true, 5); }, code);
  await T.evaluate((c) => DS.Teacher.open(c), code).catch((e) => errs.push('open ' + e.message)); await T.waitForTimeout(2500);
  const btn = await T.$('[data-fun="start:td"]'); P('교사 단추: ' + (btn ? (await btn.textContent()).trim() : '없음'));
  if (btn) await btn.click(); else await T.evaluate(async (c) => DS.Fun.start(c, DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)), 'td'), code);
  await H.waitForTimeout(2000); await S1.waitForTimeout(500);
  const pick0 = await H.evaluate(() => ({ head: (document.querySelector('.td-top') || {}).textContent || '', canvas: !!document.querySelector('.td-bg') }));
  P('TV 자리 고르기: ' + JSON.stringify(pick0));
  // 자리: S1 = 첫 ★ · S2 = 같은 칸 (막혀야 함) → 다른 칸 · S3 = 안 고름
  const star = await S1.evaluate(() => { const g = [...document.querySelectorAll('.td-mini g[data-slot]')].find((x) => x.querySelector('circle').getAttribute('stroke') === '#ffd25a'); return g ? g.dataset.slot : null; });
  await S1.click(`.td-mini g[data-slot="${star}"]`); await S1.waitForTimeout(800);
  await S2.waitForTimeout(800); await S2.click(`.td-mini g[data-slot="${star}"]`).catch(() => {}); await S2.waitForTimeout(600);
  const s2took = await S2.evaluate(async ([c, s]) => { const f = await DS.Net.get(`rooms/${c}/fun`); return (await DS.Net.get(`rooms/${c}/tdp/${f.g}/${s}`)); }, [code, star]);
  await S2.click('.td-mini g[data-slot="2"]').catch(() => {}); await S2.waitForTimeout(800);
  const ph1 = await S1.evaluate(() => (document.querySelector('.td-ph') || {}).textContent || '');
  await S1.screenshot({ path: `${OUT}/73-1-phone-pick.png` }); await H.screenshot({ path: `${OUT}/73-2-tv-pick.png` });
  P(`자리: S1 ★${star} · S2 같은 칸 → ${s2took === (await S1.evaluate(() => DS.Net.uid())) ? '막힘(S1 것)' : '이상'} · S1 폰 「${ph1.replace(/\s+/g, ' ').slice(0, 60)}」`);
  // 놀이 시작까지
  let f = null; for (let k = 0; k < 40; k++) { await H.waitForTimeout(500); f = await H.evaluate(async (c) => DS.Net.get(`rooms/${c}/fun`), code); if (f && f.phase === 'play') break; }
  P(`시작: phase ${f && f.phase} · 타워 ${f && Object.values(f.tw || {}).length} · 몬스터 체력 ${f && f.hp0} · S3 자동 자리 ${f && (Object.values(f.tw || {}).find((t) => t.u !== 'T' && ![star, '2', 2].includes(t.s)) || {}).s}`);
  await H.waitForTimeout(6000);
  const tv = await H.evaluate(() => ({ mons: document.querySelectorAll('.td-mon').length, tw: document.querySelectorAll('.td-tw').length, head: (document.querySelector('.td-top') || {}).textContent || '' }));
  await H.screenshot({ path: `${OUT}/73-3-tv-play.png` });
  P('TV 놀이: ' + JSON.stringify(tv));
  // 교사: 방패 · 응원
  await T.waitForTimeout(500); const tctl = await T.evaluate(() => (document.querySelector('.td-ctl') || {}).textContent || '');
  await T.click('[data-td="sh"]').catch((e) => errs.push('sh ' + e.message)); await T.waitForTimeout(400); await T.click('[data-td="ch"]').catch((e) => errs.push('ch ' + e.message));
  P('교사 리모컨: ' + tctl.replace(/\s+/g, ' ').slice(0, 80));
  // 폰: 업그레이드 · 기술
  let upDone = false; for (let k = 0; k < 60 && !upDone; k++) { await S1.waitForTimeout(500); for (const S of [S1, S2, S3]) { const b1 = await S.$('[data-up="a"]'); if (b1 && !upDone) { await b1.click().catch(() => {}); upDone = true; await S.screenshot({ path: `${OUT}/73-4-phone-up.png` }); } } }
  await S1.screenshot({ path: `${OUT}/73-4-phone-play.png` });
  await S2.click('#td-sk').catch((e) => errs.push('skill ' + e.message)); await S2.waitForTimeout(800);
  // 끝까지
  for (let k = 0; k < 150; k++) { await H.waitForTimeout(1000); f = await H.evaluate(async (c) => DS.Net.get(`rooms/${c}/fun`), code); if (f && f.phase === 'end') break; }
  const live = await H.evaluate(async ([c, g]) => DS.Net.get(`rooms/${c}/tdl/${g}`), [code, f.g]);
  await H.waitForTimeout(1200); await H.screenshot({ path: `${OUT}/73-5-tv-end.png` });
  await S1.waitForTimeout(6000); await S1.screenshot({ path: `${OUT}/73-6-phone-end.png` });
  await S1.evaluate(() => { window.__con = []; }); 
  const gem = await S1.evaluate(async () => { const d = (await DS.Gem.mine({ c: '1-3', n: 1 })) || {}; return Object.entries(d.log || {}).filter(([k]) => k.startsWith('td_')).map(([, v]) => v.g); });
  P('💎 기록 열쇠: ' + JSON.stringify(await S1.evaluate(async () => { const d = (await DS.Gem.mine({ c: '1-3', n: 1 })) || {}; return { keys: Object.keys(d.log || {}), total: d.total, endView: !!document.querySelector('.td-ph.td-end'), me: DS.Net.uid() }; })));
  const ups = await S1.evaluate(async ([c, g]) => DS.Net.get(`rooms/${c}/tdu/${g}`), [code, f.g]);
  P(`끝: ${JSON.stringify(f.res)} · 방패 ${!!f.sh} · 응원 ${JSON.stringify(f.ch || {})} · 업그레이드 ${JSON.stringify(ups)} · 기술 ${JSON.stringify(live && live.used)} · 💎 ${JSON.stringify(gem)}`);
  const C = {
    교사단추: !!btn, TV자리: /자리 고르기/.test(pick0.head) && pick0.canvas, 선착순: !!star && s2took && s2took !== (await S2.evaluate(() => DS.Net.uid())),
    시작: f && f.phase === 'end' && f.hp0 > 0 && Object.values(f.tw || {}).length === 4, 자동배치: Object.values(f.tw || {}).filter((t) => t.u !== 'T').length === 3,
    TV놀이: tv.mons > 0 && tv.tw === 4 && /웨이브/.test(tv.head), 교사: /방패/.test(tctl) && !!f.sh && Object.keys(f.ch || {}).length >= 1,
    업그레이드: upDone && ups && Object.keys(ups).length >= 1, 기술: !!(live && live.used && Object.keys(live.used).length), 결과: !!(f.res && f.res.top), 보상: gem.length === 1 && [1, 3].includes(gem[0]),
  };
  const bad = Object.keys(C).filter((k) => !C[k]); if (bad.length) P('틀린 항목: ' + bad.join(', '));
  console.log(log.join('\n')); console.log(!bad.length ? '✅ 통과' : '❌ 기대와 다름'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad.length || errs.length) process.exit(1);
})();
