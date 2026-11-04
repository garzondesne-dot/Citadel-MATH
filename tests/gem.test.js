// 💎 조각 검증 (v0.9.10): node tests/gem.test.js — 같은 키 한 번 · upsert · 하루 30 · 한도 밖(free) · 하루 n번 · 상점 · 연속 참여
const load = require('./load');
const DS = load(['assets/manifest.js', 'js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/lessons.js', 'lessons/set-02.js', 'lessons/set-03.js', 'lessons/set-04.js', 'js/raid/gem.js']);
let fail = 0; const check = (c, m) => { if (!c) { fail++; console.error('FAIL:', m); } };
const db = {};
const getP = (p) => p.split('/').reduce((o, k) => (o == null ? undefined : o[k]), db);
const setP = (p, v) => { const ks = p.split('/'); let o = db; ks.slice(0, -1).forEach((k) => { o[k] = o[k] && typeof o[k] === 'object' ? o[k] : {}; o = o[k]; }); o[ks[ks.length - 1]] = v; };
DS.Net = { TS: 1, get: async (p) => JSON.parse(JSON.stringify(getP(p) ?? null)), set: async (p, v) => setP(p, v), update: async (p, obj) => Object.entries(obj).forEach(([k, v]) => setP(`${p}/${k}`, v)) };
const G = DS.Gem, m = { c: '1-3', n: 5 };
(async () => {
  check(await G.add(m, 8, 'raid_A', '레이드', { upsert: true }) === 8 && await G.add(m, 8, 'raid_A', '레이드', { upsert: true }) === 0, '같은 수업은 한 번 (upsert · 늘어난 것만)');
  check(await G.add(m, 10, 'raid_A', '레이드', { upsert: true }) === 2, 'upsert: 늘어난 2 만');
  check(await G.add(m, 3, 'card_x') === 3 && await G.add(m, 3, 'card_x') === 0, '같은 키 두 번 안 줌');
  for (let i = 0; i < 5; i++) await G.add(m, 5, `room_${i}`);
  const d = await G.mine(m), day = G.today();
  check(d.day[day] === 30 && d.total === 30, `하루 30 한도 (${d.day[day]} · ${d.total})`);
  check(await G.add(m, 4, 'more') === 0, '한도 넘으면 0');
  check(await G.add(m, 10, 'seal_x', '인장', { free: true }) === 10 && (await G.mine(m)).total === 40, '한도 밖(free) 은 들어옴');
  const db2 = {}; Object.assign(db, { gem: { '9-9': { 1: {} } } }); const m2 = { c: '9-9', n: 1 };
  let r = 0; for (let i = 0; i < 5; i++) r += await G.addDaily(m2, 1, 'review', 3);
  check(r === 3, `허수아비 복습은 하루 3번 (${r})`);
  check(G.price('hero', 12) === 30 && G.price('hero', 8) === null && G.price('fx', 'vortex') === 80, '상점: 업적 용사 8 은 못 삼');
  let err = ''; try { await G.buy(m2, 'fx', 'vortex'); } catch (e) { err = e.message; }
  check(/모자라요/.test(err), '조각 모자라면 못 삼');
  await G.add(m2, 60, 't', '', { free: true });
  await G.buy(m2, 'fx', 'stars'); const d2 = await G.mine(m2);
  check(d2.total === 3 && G.owns(d2, 'fx', 'stars'), `사면 줄고 가짐 (${d2.total})`);
  err = ''; try { await G.buy(m2, 'fx', 'stars'); } catch (e) { err = e.message; } check(/이미/.test(err), '두 번 못 삼');
  check(G.streak({ 'set-02': {}, 'set-03': {}, 'set-04': {} }, { 'set-02': true, 'set-03': true, 'set-04': true }) === 3 && G.streak({ 'set-02': {}, 'set-04': {} }, { 'set-02': true, 'set-03': true, 'set-04': true }) === 1, '연속 참여 = 끝에서부터 이어진 수업');
  check(await G.medal(m, 'ox') === 1 && await G.medal(m, 'ox') === 2, '메달 개수');
  console.log(fail ? `❌ ${fail}개 실패` : '✅ 💎 조각 시험 모두 통과'); process.exit(fail ? 1 : 0);
})();
