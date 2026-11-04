// ⚖ 밸런스 게임 검증 (v0.9.7.7): node tests/fun.test.js
// (1) 판정: 적은 쪽 탈락 · 비김 / 한쪽 몰림 = 탈락 없음 · 안 고르면 탈락 · 모두 탈락이면 없던 일  (2) 진행: 시간 · 2명 이하 끝 · 4분 마지막 판  (3) 질문 150개 · 겹침 · 길이 · 안 쓴 것부터
const load = require('./load');
const DS = load(['js/engine/ui.js', 'js/raid/model.js', 'js/raid/fun-q.js', 'js/raid/fun.js']);
let fail = 0;
const check = (c, m) => { if (!c) { fail++; console.error('FAIL:', m); } };
const F = DS.Fun, list = DS.FunQ.list;
const us = (n) => Array.from({ length: n }, (_, i) => `u${i + 1}`);
const V = (a, b) => Object.fromEntries([...a.map((u) => [u, 'a']), ...b.map((u) => [u, 'b'])]);

// ── 1. 판정 ──
const al = us(10);
let r = F.judge(al, V(al.slice(0, 6), al.slice(6)));
check(r.lose === 'b' && r.out.length === 4 && r.left.length === 6, '6 : 4 → 4명 탈락');
r = F.judge(al, V(al.slice(0, 5), al.slice(5)));
check(r.lose === '' && r.out.length === 0, '5 : 5 비김 → 탈락 없음');
r = F.judge(al, V(al, []));
check(r.lose === '' && r.out.length === 0, '모두 같은 쪽 → 탈락 없음');
r = F.judge(al, V(al.slice(0, 7), al.slice(7, 9)));
check(r.lose === 'b' && r.out.length === 3 && r.none.join() === 'u10', '안 고른 사람도 탈락 (7 : 2 + 1명 안 고름 → 3명)');
r = F.judge(us(3), {});
check(r.voided && r.out.length === 0 && r.left.length === 3, '모두 안 고름 → 없던 일');
r = F.judge(us(3), { u1: 'a' });
check(r.left.join() === 'u1' && !r.voided, '1명만 고름 → 그 1명 남음');
// 독립 확인: 무작위 1만 번 — 남은 사람 ≥ 1 · 탈락 쪽은 늘 적은 쪽 · 남은 사람 + 탈락 = 전체
let bad = 0;
for (let t = 0; t < 10000; t++) {
  const n = 2 + (t % 19), a = us(n), v = {};
  a.forEach((u, i) => { const x = (t * 7 + i * 13) % 5; if (x < 2) v[u] = 'a'; else if (x < 4) v[u] = 'b'; });
  const j = F.judge(a, v), na = a.filter((u) => v[u] === 'a').length, nb = a.filter((u) => v[u] === 'b').length;
  if (!j.left.length || j.left.length + j.out.length !== n) bad++;
  if (j.lose && (j.lose === 'a' ? na >= nb : nb >= na)) bad++;
  if (!j.voided && j.left.some((u) => !v[u])) bad++;
}
check(!bad, `무작위 판정 1만 번 (${bad}건 이상)`);

// ── 2. 진행 ──
const f0 = { g: 1, at0: 0, queue: [5, 9, 12, 33], alive: Object.fromEntries(us(5).map((u) => [u, true])), outAt: {} };
let f = { ...f0, ...F.round(f0, 1, 0) };
check(f.phase === 'pick' && f.to === 15000 && f.q[0] === list[5][0] && f.rk === 'r1', '1판: 15초 · 줄의 첫 질문');
check(F.step(f, {}, 14999) === null, '시간 전엔 그대로');
f = F.step(f, V(['u1', 'u2', 'u3'], ['u4', 'u5']), 15000);
check(f.phase === 'show' && Object.keys(f.alive).join() === 'u1,u2,u3' && f.outAt.u4 === 1, '공개: 적은 쪽 2명 탈락 기록');
check(F.step(f, null, 15000 + F.SHOW - 1) === null, '공개 6.5초');
f = F.step(f, null, 15000 + F.SHOW);
check(f.phase === 'pick' && f.n === 2 && f.qi === 9 && f.to - f.from === 15000, '2판 = 다음 질문 · 15초');
f = F.step(F.step(f, V(['u1', 'u2'], ['u3']), f.to), null, f.to + F.SHOW);
check(f.phase === 'end' && f.win.join() === 'u1,u2', '2명 남으면 끝 · 우승 2명');
const g3 = { ...f0, alive: Object.fromEntries(us(9).map((u) => [u, true])) };
const r3 = F.round(g3, 3, 100000);
check(r3.to - r3.from === 10000, '3판부터 10초');
const late = F.round(g3, 4, F.LIMIT + 1);
check(late.final, '4분이 지나면 마지막 판');
let lf = { ...g3, ...late };
lf = F.step(F.step(lf, V(us(5), us(9).slice(5)), lf.to), null, lf.to + F.SHOW);
check(lf.phase === 'end' && lf.win.length === 5, '마지막 판 뒤 살아 있는 5명 모두 우승');
// 전체 시뮬: 18명 · 고르게 갈림 → 4분 안
let sim = { ...f0, queue: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], alive: Object.fromEntries(us(18).map((u) => [u, true])) }, now = 0, guard = 0;
sim = { ...sim, ...F.round(sim, 1, 0) };
while (sim.phase !== 'end' && guard++ < 100) {
  now = sim.phase === 'pick' ? sim.to : sim.until;
  const al2 = Object.keys(sim.alive), k = Math.ceil(al2.length * 0.6);
  sim = F.step(sim, sim.phase === 'pick' ? V(al2.slice(0, k), al2.slice(k)) : null, now) || sim;
}
check(sim.phase === 'end' && sim.win.length <= 2 && now < F.LIMIT, `18명 6 : 4 진행 → ${Math.round(now / 1000)}초에 끝 · 우승 ${sim.win.length}명`);

// ── 3. 질문 ──
check(list.length === 150, `질문 150개 (${list.length})`);
const cnt = {}; list.forEach((x) => { cnt[x[2]] = (cnt[x[2]] || 0) + 1; });
check(cnt.food === 40 && cnt.school === 25 && cnt.game === 25 && cnt.dream === 30 && cnt.life === 30, `갈래 개수 ${JSON.stringify(cnt)}`);
const keys = list.map((x) => `${x[0]}|${x[1]}`), dup = keys.filter((k, i) => keys.indexOf(k) !== i);
check(!dup.length, `같은 질문 없음 ${dup}`);
check(list.every((x) => x[0] && x[1] && x[0] !== x[1] && x[0].length <= 14 && x[1].length <= 14 && DS.FunQ.cats[x[2]]), `두 선택지 · 14자 이내 ${list.filter((x) => x[0].length > 14 || x[1].length > 14).map((x) => x.join('/'))}`);
const used = Object.fromEntries(Array.from({ length: 140 }, (_, i) => [i, true]));
const qq = F.queue(used, 24);
check(qq.q.length === 24 && qq.reset && qq.q.slice(0, 10).every((i) => i >= 140) && new Set(qq.q).size === 24, '안 쓴 10개 먼저 → 다 쓰면 처음부터');
check(F.queue({}, 24).q.length === 24 && !F.queue({}, 24).reset, '처음엔 그냥 섞기');

const st = { 3: { n: 2, m: 0.3 }, 4: { n: 3, m: 0.9 }, 7: { n: 1, m: 0.05 } }; // 3번 = 평균 15% (쏠림) · 4번 = 30% · 7번 = 한 번뿐
check(F.tilted(st[3]) && !F.tilted(st[4]) && !F.tilted(st[7]), '쏠림 = 2번 이상 · 적은 쪽 평균 25% 아래');
check([...Array(20)].every(() => !F.queue({}, 24, Math.random, st).q.includes(3)), '쏠린 질문은 줄에 안 들어감');
if (fail) { console.error(`\n${fail}건 실패`); process.exit(1); }
console.log('OK: 밸런스 게임 — 판정(적은 쪽 · 비김 · 안 고름 · 없던 일 · 무작위 1만 번) · 진행(15 → 10초 · 2명 끝 · 4분 마지막 판 · 18명 시뮬) · 질문 150개 통과');
