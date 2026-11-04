// 📕 오답노트 검증 (v0.9.7.9): node tests/note.test.js
// (1) 수업 기록 → 문제마다 칸 (한 번에 · 고침 · 틀림 · 나만 안 함 · 반 전체 안 함) · 형성평가 문항 칸 · ⭐ 도전 문항 분리
// (2) 남은 문제 수 · 불참 · 보충(수업 문제 처치 · 👑 재대결 처치) · 옛 기록(칸 없음)
const load = require('./load');
const DS = load(['assets/manifest.js', 'js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/lessons.js', 'lessons/set-03.js', 'lessons/set-04.js', 'js/engine/fx.js', 'js/raid/model.js', 'js/raid/grow.js', 'js/raid/result.js', 'js/raid/note.js']);
let fail = 0;
const check = (c, m) => { if (!c) { fail++; console.error('FAIL:', m); } };
const X = DS.Raid, Nt = DS.Note, L = DS.Lessons.get('set-03');
const R = X.newRoom('1', L.id, 'T', 0, 90);
R.players = { a: { num: 1, nick: '가' }, b: { num: 2, nick: '나' } }; R.active = { a: true, b: true }; R.state.step = L.steps.length; R.subs = {}; R.bossAns = {};
const S = DS.SetGen;
const right = (p) => (p.type === 'blanks' ? p.items.map((i) => i.answer) : p.type === 'subsets' ? S.allSubsets(p.base) : p.type === 'choice' ? p.answerIndex : p.answer);
const wrong = (p) => (p.type === 'blanks' ? p.items.map(() => '?') : p.type === 'subsets' ? [] : p.type === 'choice' ? (p.answerIndex + 1) % p.choices.length : p.type === 'multi' ? [] : p.type === 'ox' ? !p.answer : 99999);
const mids = Nt.monIds(L);
const give = (u, mid, a, okAll) => { const it = X.itemsFor(L, R, mid, u, a); R.subs[mid] = R.subs[mid] || {}; R.subs[mid][u] = R.subs[mid][u] || {}; R.subs[mid][u][a] = it.map((q) => (okAll ? right(q) : wrong(q))); };
// a: 1번 한 번에 · 2번 틀렸다 고침 · 3번 끝까지 틀림(기회 4번) · 4번 안 함 (b 는 4번 함) · 나머지 몬스터 아무도 안 함
give('a', mids[0], 0, true);
give('a', mids[1], 0, false); give('a', mids[1], 1, true);
[0, 1, 2, 3].forEach((k) => give('a', mids[2], k, false));
give('b', mids[3], 0, true);
// 형성평가: a 세트 1 — 1 · 2번 맞힘, 3번 틀림, 나머지 안 씀 · 마지막(⭐ 도전) 맞힘
const B1 = L.boss.sets[1], hp = L.boss.hpItems, nb = L.boss.items;
R.bossAns.a = { 1: B1.map((q, i) => (i < 2 || i === nb - 1 ? right(q) : i === 2 ? wrong(q) : null)) };
const r = DS.Result.compute(L, R, 'a'), sm = DS.Result.summary(r, '1');
check(sm.mons[mids[0]] === 'o' && sm.mons[mids[1]] === 'f' && sm.mons[mids[2]] === 'x' && sm.mons[mids[3]] === '-', `수업 칸 o f x - (${JSON.stringify(sm.mons)})`);
check(mids.slice(4).every((m) => sm.mons[m] === 'n'), '아무도 안 한 몬스터 = n (수업 시간 부족)');
check(nb > hp && sm.bossM.length === nb && sm.bossM.slice(0, 3) === 'oox' && sm.bossM[3] === '-' && sm.bossM[nb - 1] === 'o', `형성평가 칸 (${sm.bossM})`);
check(sm.boss === 2 && sm.bossN === hp && sm.bossX === 1, `⭐ 도전 문항 분리: 기본 2/${hp} + 도전 1 (${sm.boss}/${sm.bossN} ⭐${sm.bossX})`);

// ── 2. 남은 문제 · 보충 ──
let x = Nt.lesson(L, sm, {});
const openM = 1 + 1 + (mids.length - 4), openB = hp - 2;
check(x.left === openM + openB, `남은 문제 = 틀림 · 안 풂 (${x.left} = ${openM} + ${openB})`);
check(x.boss[nb - 1] === 'star' && x.boss.length === nb, '⭐ 도전 문항은 맞혔을 때만 별 · 남은 문제에 안 셈');
x = Nt.lesson(L, sm, { [mids[2]]: { clear: true, tries: 1 }, [mids[0]]: { clear: true, tries: 1 } });
check(x.mons[2] === 'p' && x.mons[0] === 'o' && x.left === openM - 1 + openB, '틀린 문제 처치 → 🟪 보충 (맞힌 문제는 그대로)');
x = Nt.lesson(L, sm, { boss: { clear: true, tries: 2 } });
check(x.boss.slice(0, hp).filter((s) => s === 'p').length === openB && x.left === openM, '👑 재대결 처치 → 형성평가 남은 문항 모두 보충');
x = Nt.lesson(L, null, {});
check(x.absent && x.left === mids.length + hp && x.mons.every((s) => s === 'a'), '불참 = 모두 안 풂');
x = Nt.lesson(L, { boss: 7, bossN: 6, miss: [mids[1]] }, {});
check(x.mons[1] === 'x' && x.mons[0] === 'o' && x.boss.slice(0, hp).every((s) => s === 'o'), '옛 기록: miss 만 틀림 · 형성평가 boss 수로');
check(Nt.all({ 'set-03': sm }, {}, 4).list.map((y) => y.L.id).join() === 'set-03', '반이 게임으로 안 한 차시(기록도 없음)는 빼기');
const all = Nt.all({ 'set-03': sm }, {}, 4, { 'set-04': true });
check(all.list.length >= 2 && all.list.find((y) => y.L.id === 'set-04').absent && all.left === Nt.lesson(L, sm, {}).left + Nt.lesson(DS.Lessons.get('set-04'), null, {}).left, '열린 차시 전체 합 (기록 없는 차시 = 불참)');
check(/nt-badge/.test(Nt.badge(3)) && /done/.test(Nt.badge(0)), '배지 · 0 이면 노트 완성');

R.oxq = { 9: { marks: { a: 'oox-o' } } };
const rx = DS.Result.summary(DS.Result.compute(L, R, 'a'), '1');
check(rx.ox && rx.ox[0] === 3 && rx.ox[1] === 5, `OX 타임 결과 → 기록 ox [3, 5] (${JSON.stringify(rx.ox)})`);
delete R.oxq;
if (fail) { console.error(`\n${fail}건 실패`); process.exit(1); }
console.log('OK: 오답노트 — 문제 칸(o f x - n) · 형성평가 칸 · ⭐ 도전 분리 · 남은 문제 · 보충(문제 · 재대결) · 불참 · 옛 기록 통과');
