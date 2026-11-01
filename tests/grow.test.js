// 성장 · 보강던전 · 개인 결과 검증: node tests/grow.test.js
// (1) EXP 표 · 레벨 경계 · 칭호  (2) 보강 인장 · 화려한 이펙트 해금 (인장 1·2·4·6·8·10개)  (3) 개인 결과: 첫 시도 / 고침 / 못 맞힘 · 개념별 · 복습 추천
const load = require('./load');
const DS = load(['js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/lessons.js', 'lessons/set-02.js', 'lessons/set-03.js', 'lessons/set-04.js', 'js/engine/fx.js', 'js/raid/model.js', 'js/raid/grow.js', 'js/raid/bonus.js', 'js/raid/result.js']);
let fail = 0;
const check = (c, m) => { if (!c) { fail++; console.error('FAIL:', m); } };
const G = DS.Grow, B = DS.Bonus, X = DS.Raid;

// ── 1. EXP · 레벨 ───────────────────────────────────────
check(G.level(0).lv === 1 && G.level(0).title === '견습 용사', 'Lv.1 견습 용사');
check(G.level(39).lv === 1 && G.level(40).lv === 2 && G.level(40).into === 0, 'Lv.2 = 40 EXP');
check(G.level(40 + 60).lv === 3 && G.level(40 + 60 + 80).lv === 4, 'Lv.3 = 100, Lv.4 = 180 (40 + 20 × (L − 1))');
check(G.level(1e6).title.startsWith('전설의 용사'), '높은 레벨 칭호');
check(G.sum({ join: 1, submit: 4, correct: 9, fixed: 2, bossWin: 1, perfect: 1, words: 1 }) === 10 + 8 + 9 + 6 + 10 + 5 + 2, 'EXP 합계');
check(G.XP.fixed > G.XP.correct, '고친 소문제가 처음 맞힌 것보다 많이 (실패도 재도전)');

// ── 2. 보강 인장 · 이펙트 해금 ───────────────────────────
const L4 = DS.Lessons.get('set-04');
const allClear = { 'set-04': Object.fromEntries(L4.bonus.map((b) => [b.id, { clear: true, tries: 1 }])) };
check(B.seals({}).length === 0 && B.seals(allClear).join() === 'set-04', '4차시 보강 3마리 모두 처치 → 인장 1개');
check(B.seals({ 'set-04': { b1: { clear: true }, b2: { clear: true }, b3: { tries: 2 } } }).length === 0, '하나라도 못 잡으면 인장 없음');
check(JSON.stringify(B.fxOpen(allClear)) === JSON.stringify({ fire: true }), '인장 1개 → 첫 화려한 이펙트(화염)');
check(B.UNLOCK.join() === '1,2,4,6,8,10' && DS.FX.FANCY.length === B.UNLOCK.length, '해금 단계 6개');
check(!DS.Lessons.get('set-02').bonus && !DS.Lessons.get('set-03').bonus, '2·3차시 보강은 레이드에 남음 (보강던전 없음)');

// ── 3. 개인 결과 ────────────────────────────────────────
const L = L4, code = '123456', u = 'stu1';
const R = X.newRoom(code, L.id, 'T', 0, 90);
R.players = { [u]: { num: 1, nick: '가', hero: 0 } }; R.active = { [u]: true }; R.state.step = L.steps.length; R.state.headcount = 1;
const right = (q) => (q.type === 'choice' ? q.answerIndex : q.answer);
const wrong = (q) => (q.type === 'ox' ? !q.answer : q.type === 'number' ? q.answer + 1 : q.type === 'choice' ? (q.answerIndex + 1) % q.choices.length : q.type === 'multi' ? [] : null);
R.subs = {};
// 복습: 처음에 다 맞힘 · 문제1: 첫 시도 2/4 → 재도전에 나머지 고침 · 문제2: 첫 시도 0/2, 재도전도 1개만 · 문제3: 안 함
const give = (mid, a, okIdx) => { const items = X.itemsFor(L, R, mid, u, a); R.subs[mid] = R.subs[mid] || {}; R.subs[mid][u] = R.subs[mid][u] || {}; R.subs[mid][u][a] = items.map((q, i) => (okIdx.includes(i) ? right(q) : wrong(q))); };
give('r1', 0, [0, 1, 2]);
give('m1', 0, [0, 1]); give('m1', 1, [0, 1, 2, 3]);
give('m2', 0, []); give('m2', 1, [0]);
// 형성평가: 세트1 에서 1·2·3 맞힘, 세트2 에서 4번 고침
R.bossAns = { [u]: { 1: L.boss.sets[1].map((q, i) => (i < 3 ? right(q) : wrong(q))), 2: L.boss.sets[2].map((q, i) => (i === 3 ? right(q) : wrong(q))) } };
const r = DS.Result.compute(L, R, u);
const m = Object.fromEntries(r.mons.map((x) => [x.id, x]));
check(m.r1.first === 3 && m.r1.fixed === 0 && m.r1.miss === 0, '복습: 처음에 3개 다 맞힘');
check(m.m1.first === 2 && m.m1.fixed === 2 && m.m1.miss === 0, '문제1: 첫 시도 2 · 고침 2');
check(m.m2.first === 0 && m.m2.fixed === 1 && m.m2.miss === 1, '문제2: 고침 1 · 못 맞힘 1');
check(!m.m3.tried && m.m3.miss === m.m3.n, '문제3: 안 함');
check(r.conc.review.ok === 3 && r.conc.review.total === 3, '개념: 지난 시간 복습 3/3');
check(r.conc.c1.ok === 2 + 1 && r.conc.c1.total === 4 + 3, `개념1 = 문제1 첫 시도 2/4 + 형성평가 1·4·6번 중 1번 → ${JSON.stringify(r.conc.c1)}`);
check(r.conc.c3.ok === 1 && r.conc.c3.total === 2, `개념3 = 안 한 문제3 은 빼고 형성평가 3·5번 → ${JSON.stringify(r.conc.c3)}`);
check(r.conc.c2.ok === 0 + 1 && r.conc.c2.total === 2 + 1, '개념2 = 문제2 0/2 + 형성평가 2번 ✔');
check(r.weak[0] === 'c2' && r.weak.length <= 2, `복습 추천 1순위 = 가장 낮은 개념 (서로소) ${r.weak}`);
check(r.boss.mast.filter(Boolean).length === 4, '형성평가 도달 4문항 (세트2 로 고친 것 포함)');
check(r.parts.submit === 5 && r.parts.fixed === 2 + 1 + 1, `EXP 재료: 제출 5번 · 고침 4개 ${JSON.stringify(r.parts)}`);
const sm = DS.Result.summary(r, code);
check(sm.conc.c2.join() === '1,3' && sm.weak[0] === 'c2' && sm.xp === G.sum(r.parts), '저장 요약');
check(/서로소/.test(DS.Result.history({ 'set-04': Object.assign({}, sm, { at: 1 }) })), '복습 노트에 추천 개념 이름');
// 2·3차시 형성평가 문항마다 개념 표시
['set-02', 'set-03', 'set-04'].forEach((id) => { const l = DS.Lessons.get(id); check((l.boss.tags || []).length === l.boss.items && l.boss.tags.every((t) => l.steps.some((s) => s.id === t)), `${id}: 형성평가 개념 표시`); });

// ── 4. v0.8.1: 첫 출정 · 늦게 온 학생 · 차원문 2시간 ─────────────
check(G.lines({ first: 43 })[0].n === 1 && G.lines({ first: 43 })[0].xp === 43, '첫 출정 축하는 ×n 없이 한 줄');
check(!('words' in r.parts), '마지막 한마디 EXP 는 결과가 아니라 한마디를 남길 때');
const R2 = X.newRoom('222222', L.id, 'T', 0, 90); R2.players = { a: { num: 1, nick: '가', hero: 0 }, b: { num: 2, nick: '나', hero: 0 }, T: { teacher: true, num: 0, nick: '선생님', hero: 0 } };
check(X.lateIds(R2).length === 0, '대기실(시작 전)에는 늦게 온 학생 없음');
R2.active = { a: true }; R2.state.step = 1;
check(X.lateIds(R2).join() === 'b', '시작 뒤 들어온 학생 = 늦게 온 학생 (교사 제외)');
R2.state.closed = true; check(X.lateIds(R2).length === 0, '끝난 수업은 해당 없음');
const now = 10 * X.LIVE_MS;
check(X.liveOpen({ open: true, at: now - 1000 }, now) && !X.liveOpen({ open: true, at: now - X.LIVE_MS - 1 }, now) && !X.liveOpen({ open: false, at: now }, now), '차원문 2시간 지나면 꺼진 것으로');

if (fail) { console.error(`\n${fail}건 실패`); process.exit(1); }
console.log('OK: 성장 — 첫 출정 · 늦게 온 학생 · 차원문 2시간 · EXP · 레벨 · 칭호 · 보강 인장 → 이펙트 해금 · 개인 결과(처음/고침/못 맞힘 · 개념별 · 복습 추천) 통과');
