// 💾 기록 저장 검증 (v0.9.7.6): node tests/save.test.js
// (1) 진행 저장을 여러 번 해도 EXP 는 늘어난 만큼만  (2) 첫 레이드 특전은 한 번만 (정한 값 그대로)  (3) 결과 모으기 = 기록 없는 학생만 · 다른 방 기록은 그대로
const load = require('./load');
const DS = load(['assets/manifest.js', 'js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/lessons.js', 'lessons/set-04.js', 'js/engine/fx.js', 'js/raid/model.js', 'js/raid/actions.js', 'js/raid/grow.js', 'js/raid/result.js']);
let fail = 0;
const check = (c, m) => { if (!c) { fail++; console.error('FAIL:', m); } };
// 메모리 DB
const db = {};
const seg = (p) => p.split('/').filter(Boolean);
const get = (p) => seg(p).reduce((o, k) => (o == null ? null : o[k] ?? null), db);
const set = (p, v) => { const s = seg(p); let o = db; s.slice(0, -1).forEach((k) => { o = o[k] = o[k] && typeof o[k] === 'object' ? o[k] : {}; }); o[s[s.length - 1]] = JSON.parse(JSON.stringify(v)); };
DS.Net = { TS: 1000, now: () => 1000, uid: () => 'T', pack: (v) => JSON.stringify(v), unpack: (s) => JSON.parse(s), get: async (p) => get(p), set: async (p, v) => set(p, v) };
const X = DS.Raid, L = DS.Lessons.get('set-04'), code = '555111';
const R = X.newRoom(code, L.id, 'T', 0, 90);
R.players = { a: { cls: '1-4', num: 1, nick: '가', first: 500 }, b: { cls: '1-4', num: 2, nick: '나', first: 600 }, c: { cls: '1-4', num: 3, nick: '다' } };
R.active = { a: true, b: true, c: true }; R.state.step = 1; R.subs = {};
const right = (q) => (q.type === 'choice' ? q.answerIndex : q.answer);
const mid = L.steps.find((s) => s.kind === 'monster' || s.monsters).id || L.steps[1].id;
const give = (u, a, n) => { const items = X.itemsFor(L, R, mid, u, a); R.subs[mid] = R.subs[mid] || {}; R.subs[mid][u] = R.subs[mid][u] || {}; R.subs[mid][u][a] = items.map((q, i) => (i < n ? right(q) : (q.type === 'choice' ? (q.answerIndex + 1) % q.choices.length : 99999))); };

(async () => {
  const m = { c: '1-4', n: 1 };
  set('xp/1-4/1', { total: 200, log: { old: { xp: 200 } } }); set('records/1-4/1/set-03', { at: 1, code: '1' }); // 지난 차시 기록 있음 → 첫 레이드 아님
  give('a', 0, 1);
  const s1 = await DS.Result.save(L, R, 'a', m, code);
  const t1 = get('xp/1-4/1/total');
  check(get('records/1-4/1/set-04').code === code && t1 > 200 && !s1.first, `진행 저장 1: 기록 · EXP (${t1})`);
  await DS.Result.save(L, R, 'a', m, code);
  check(get('xp/1-4/1/total') === t1, '같은 상태로 또 저장 → EXP 그대로');
  give('a', 1, 99);
  const s3 = await DS.Result.save(L, R, 'a', m, code);
  const t3 = get('xp/1-4/1/total');
  check(t3 > t1 && get('xp/1-4/1/log/raid_' + code).xp === t3 - 200, `더 맞힘 → 늘어난 만큼만 (${t1} → ${t3})`);
  check(s3.g && s3.g.before.lv === DS.Grow.level(200).lv, '결과 화면 레벨업 = 이 수업 전 레벨부터');

  // 첫 레이드: 특전 한 번만
  const m2 = { c: '1-4', n: 2 };
  give('b', 0, 1);
  const f1 = await DS.Result.save(L, R, 'b', m2, code);
  const fx = get('records/1-4/2/set-04').firstXp, ft = get('xp/1-4/2/total');
  check(f1.first && fx >= 40 && DS.Grow.level(ft).lv >= 2, `첫 레이드 특전 · 레벨업 보장 (${fx}, ${ft})`);
  await DS.Result.save(L, R, 'b', m2, code);
  check(get('records/1-4/2/set-04').firstXp === fx && get('xp/1-4/2/total') === ft, '다시 저장해도 특전은 같은 값 · 두 번 안 쌓임');

  // 결과 모으기: 3번(기록 없음)만 · 다른 방에서 같은 차시 한 학생은 그대로
  set('rooms/' + code, { ...R, subs: Object.fromEntries(Object.entries(R.subs).map(([k, byU]) => [k, Object.fromEntries(Object.entries(byU).map(([u, byA]) => [u, Object.fromEntries(Object.entries(byA).map(([a, g]) => [a, JSON.stringify(g)]))]))])) });
  give('c', 0, 2);
  set('rooms/' + code + '/subs/' + mid + '/c/0', JSON.stringify(R.subs[mid].c[0]));
  const before1 = JSON.stringify(get('records/1-4/1/set-04'));
  const o = await DS.Result.gather(code, '1-4');
  check(o.saved.join() === '3' && o.kept.sort().join() === '1,2', `결과 모으기: 없는 학생만 (${o.saved} / 유지 ${o.kept})`);
  check(get('records/1-4/3/set-04').at === 1000 || get('records/1-4/3/set-04').code === code, '3번 기록 생김');
  check(JSON.stringify(get('records/1-4/1/set-04')) === before1, '이미 있는 기록은 건드리지 않음');
  const t3c = get('xp/1-4/3/total');
  await DS.Result.gather(code, '1-4');
  check(get('xp/1-4/3/total') === t3c, '결과 모으기 두 번 → EXP 한 번만');

  // 저장 줄이기 (v0.9.8.0 · cache): 두 번째부터 바뀐 게 없으면 서버 요청 0 · 늘어나면 기록 + EXP 만
  const m4 = { c: '1-4', n: 2 }, R4 = { ...R };
  let calls = 0; const g0 = DS.Net.get, s0 = DS.Net.set;
  DS.Net.get = async (p2) => { calls++; return g0(p2); }; DS.Net.set = async (p2, v) => { calls++; return s0(p2, v); };
  await DS.Result.save(L, R4, 'b', m4, code, null, null, { cache: true });
  calls = 0; await DS.Result.save(L, R4, 'b', m4, code, null, null, { cache: true });
  check(calls === 0, `바뀐 게 없으면 서버 요청 0 (${calls})`);
  const tB = get('xp/1-4/2/total'); give('b', 1, 99); calls = 0;
  await DS.Result.save(L, R4, 'b', m4, code, null, null, { cache: true });
  check(get('xp/1-4/2/total') > tB && calls <= 6, `더 맞히면 기록 + EXP 만 (요청 ${calls}번 · EXP ${tB} → ${get('xp/1-4/2/total')})`);
  DS.Net.get = g0; DS.Net.set = s0;

  if (fail) { console.error(`\n${fail}건 실패`); process.exit(1); }
  console.log('OK: 기록 저장 — 진행 저장 EXP 늘어난 만큼만 · 첫 레이드 특전 한 번 · 결과 모으기(없는 학생만 · 두 번 눌러도 한 번) 통과');
})().catch((e) => { console.error(e); process.exit(1); });
