// ⚖ 밸런스 게임 검증 (v0.9.7.7): node tests/fun.test.js
// (1) 판정: 적은 쪽 탈락 · 비김 / 한쪽 몰림 = 탈락 없음 · 안 고르면 탈락 · 모두 탈락이면 없던 일  (2) 진행: 시간 · 2명 이하 끝 · 4분 마지막 판  (3) 질문 150개 · 겹침 · 길이 · 안 쓴 것부터
const load = require('./load');
const DS = load(['js/engine/ui.js', 'js/raid/model.js', 'js/raid/fun-q.js', 'js/raid/fun-ox.js', 'js/raid/fun.js']);
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
// ── 4. 🔄 반대로 · ⭕ 수학 OX 판정 (v0.9.8.0) ──
let rv = F.judge(al, V(al.slice(0, 6), al.slice(6)), 'rev');
check(rv.lose === 'a' && rv.out.length === 6 && rv.left.length === 4, '반대로: 6 : 4 → 많은 쪽 6명 탈락');
rv = F.judge(al, V(al.slice(0, 5), al.slice(5)), 'rev');
check(rv.lose === '' && !rv.out.length, '반대로: 비김 → 탈락 없음');
rv = F.judge(al, V(al, []), 'rev');
check(rv.lose === '' && !rv.out.length, '반대로: 모두 같은 쪽 → 탈락 없음 (모두 탈락 방지)');
let oxj = F.judge(al, V(al.slice(0, 8), al.slice(8)), 'ox', 'b');
check(oxj.lose === 'a' && oxj.left.join() === 'u9,u10', 'OX: 정답 ❌ → ⭕ 고른 8명 탈락 (적은 쪽이어도 정답이면 생존)');
oxj = F.judge(al, V(al, []), 'ox', 'a');
check(oxj.lose === 'b' && !oxj.out.length && oxj.left.length === 10, 'OX: 모두 정답 → 탈락 없음');
oxj = F.judge(al, V([], al), 'ox', 'a');
check(oxj.voided && oxj.left.length === 10, 'OX: 모두 틀림 → 없던 일');
const fo = { g: 1, kind: 'ox', at0: 0, queue: [0, 1, 2], alive: Object.fromEntries(us(4).map((u) => [u, true])), outAt: {} };
let fx = { ...fo, ...F.round(fo, 1, 0) };
check(fx.s === DS.FunOX.list[0].t && fx.ans === (DS.FunOX.list[0].a ? 'a' : 'b') && fx.q[0].includes('맞다'), 'OX 판: 문장 · 정답 · 버튼');
fx = F.step(fx, { u1: fx.ans, u2: fx.ans, u3: fx.ans === 'a' ? 'b' : 'a' }, fx.to);
check(Object.keys(fx.alive).join() === 'u1,u2' && fx.res.none.join() === 'u4', 'OX 진행: 틀린 사람 · 안 고른 사람 탈락');
// 수학 OX 문제: 차시 2~6 · 10개씩 · 겹침 없음 · 해설
const OX = DS.FunOX.list, byNo = {};
OX.forEach((x) => { byNo[x.no] = (byNo[x.no] || 0) + 1; });
check([2, 3, 4, 5, 6].every((n) => byNo[n] === 10) && OX.every((x) => x.t && x.why && typeof x.a === 'boolean'), `OX 문제 차시마다 10개 (${JSON.stringify(byNo)})`);
check(new Set(OX.map((x) => x.t)).size === OX.length, 'OX 문장 겹침 없음');
check(OX.filter((x) => x.a).length >= 20 && OX.filter((x) => !x.a).length >= 15, `⭕ · ❌ 고르게 (${OX.filter((x) => x.a).length} : ${OX.filter((x) => !x.a).length})`);
// 독립 계산: 숫자 · 집합으로 판별되는 문장
const S0 = (a) => new Set(a), eq = (a, b) => a.size === b.size && [...a].every((x) => b.has(x)), sub = (a, b) => [...a].every((x) => b.has(x));
const I = (a, b) => S0([...a].filter((x) => b.has(x))), Un = (a, b) => S0([...a, ...b]), D = (a, b) => S0([...a].filter((x) => !b.has(x)));
const div = (n) => S0(Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0));
const rnd = (seed) => { let s0 = seed; return () => (s0 = (s0 * 1103515245 + 12345) % 2147483648) / 2147483648; };
const always = (f) => { const r = rnd(7), U = S0([1, 2, 3, 4, 5, 6]); for (let t = 0; t < 300; t++) { const pick = () => S0([...U].filter(() => r() < 0.5)); if (!f(pick(), pick(), pick(), U)) return false; } return true; };
const C = (a, U) => D(U, a);
const truth = {
  '{1, 2, 3} 의 원소의 개수는 3이다.': S0([1, 2, 3]).size === 3,
  '{x | x는 6의 약수} = {1, 2, 3, 6} 이다.': eq(div(6), S0([1, 2, 3, 6])),
  '{1, 2, 2, 3} 의 원소의 개수는 4이다.': S0([1, 2, 2, 3]).size === 4,
  '3 ∈ {1, 3, 5} 이다.': S0([1, 3, 5]).has(3),
  '{1, 2} ⊂ {1, 2, 3} 이다.': sub(S0([1, 2]), S0([1, 2, 3])),
  '{1, 2, 3} 의 부분집합은 모두 6개이다.': 2 ** 3 === 6,
  '{a, b} 의 진부분집합은 3개이다.': 2 ** 2 - 1 === 3,
  '{1, 2} = {2, 1} 이다.': eq(S0([1, 2]), S0([2, 1])),
  '{2, 4} ⊂ {x | x는 4의 약수} 이다.': sub(S0([2, 4]), div(4)),
  '{1, 3} ⊂ {1, 2} 이다.': sub(S0([1, 3]), S0([1, 2])),
  'A = {1, 2, 3}, B = {2, 3, 4} 이면 A ∩ B = {2, 3} 이다.': eq(I(S0([1, 2, 3]), S0([2, 3, 4])), S0([2, 3])),
  'A = {1, 2}, B = {3, 4} 이면 A ∪ B = {1, 2, 3, 4} 이다.': eq(Un(S0([1, 2]), S0([3, 4])), S0([1, 2, 3, 4])),
  '{1, 2} 와 {2, 3} 은 서로소이다.': I(S0([1, 2]), S0([2, 3])).size === 0,
  '{1, 3} 과 {2, 4} 는 서로소이다.': I(S0([1, 3]), S0([2, 4])).size === 0,
  'A ∩ B ⊂ A ∪ B 는 항상 성립한다.': always((a, b) => sub(I(a, b), Un(a, b))),
  'n(A) = 5, n(B) = 4, n(A ∩ B) = 2 이면 n(A ∪ B) = 9 이다.': 5 + 4 - 2 === 9,
  'A ∪ ∅ = A 이다.': always((a) => eq(Un(a, S0([])), a)),
  'A ∩ ∅ = A 이다.': always((a) => eq(I(a, S0([])), a)),
  'A ⊂ B 이면 A ∩ B = A 이다.': always((a, b) => !sub(a, b) || eq(I(a, b), a)),
  'A 와 B 가 서로소이면 n(A ∪ B) = n(A) + n(B) 이다.': always((a, b) => I(a, b).size > 0 || Un(a, b).size === a.size + b.size),
  'A ∪ B = B ∪ A 이다.': always((a, b) => eq(Un(a, b), Un(b, a))),
  'U = {1, 2, 3, 4, 5}, A = {1, 2} 이면 Aᶜ = {3, 4, 5} 이다.': eq(C(S0([1, 2]), S0([1, 2, 3, 4, 5])), S0([3, 4, 5])),
  'A = {1, 2, 3}, B = {2, 3, 4} 이면 A − B = {1} 이다.': eq(D(S0([1, 2, 3]), S0([2, 3, 4])), S0([1])),
  'A − B = B − A 는 항상 성립한다.': always((a, b) => eq(D(a, b), D(b, a))),
  '(Aᶜ)ᶜ = A 이다.': always((a, b, c, U) => eq(C(C(a, U), U), a)),
  'A ∪ Aᶜ = ∅ 이다.': always((a, b, c, U) => Un(a, C(a, U)).size === 0),
  'A ∩ Aᶜ = ∅ 이다.': always((a, b, c, U) => I(a, C(a, U)).size === 0),
  'A − B = A ∩ Bᶜ 이다.': always((a, b, c, U) => eq(D(a, b), I(a, C(b, U)))),
  'A ∩ (B ∪ C) = (A ∩ B) ∪ (A ∩ C) 이다.': always((a, b, c) => eq(I(a, Un(b, c)), Un(I(a, b), I(a, c)))),
  'U = {1, 2, 3, 4}, A = {1, 2, 3} 이면 n(Aᶜ) = 2 이다.': C(S0([1, 2, 3]), S0([1, 2, 3, 4])).size === 2,
  '(A ∪ B)ᶜ = Aᶜ ∩ Bᶜ 이다.': always((a, b, c, U) => eq(C(Un(a, b), U), I(C(a, U), C(b, U)))),
  '(A ∩ B)ᶜ = Aᶜ ∩ Bᶜ 이다.': always((a, b, c, U) => eq(C(I(a, b), U), I(C(a, U), C(b, U)))),
};
const bad2 = Object.entries(truth).filter(([t, v]) => { const x = OX.find((y) => y.t === t); return !x || x.a !== v; }).map(([t]) => t);
check(!bad2.length, `OX 문장 독립 계산 ${Object.keys(truth).length}개 (${bad2.join(' / ')})`);
const qp = F.queue({ x3: true }, 24, Math.random, null, [1, 2, 3, 4], 'x');
check(qp.q.length === 4 && qp.q.slice(0, 3).every((i) => i !== 3), 'OX 줄: 지금 차시까지만 · 쓴 것(x 앞글자)은 뒤로');

// ── 5. ⭕ OX 타임 (v0.9.8.1): 탈락 없음 · 5문장 · 사람마다 o x - · 반 정답률 ──
const fq0 = { g: 2, kind: 'quiz', at0: 0, queue: [10, 11, 12, 13, 14, 15, 16], alive: Object.fromEntries(us(4).map((u) => [u, true])), outAt: {} };
let fq = { ...fq0, ...F.round(fq0, 1, 0) }, tq = 0;
check(fq.to === 10000 && fq.s === DS.FunOX.list[10].t, 'OX 타임: 10초 · 문장');
for (let k = 0; k < 6 && fq.phase !== 'end'; k++) {
  const w = fq.ans === 'a' ? 'b' : 'a';
  tq = fq.to; fq = F.step(fq, { u1: fq.ans, u2: fq.ans, u3: w }, tq); // u4 안 고름
  check(Object.keys(fq.alive).length === 4, `OX 타임 ${k + 1}번: 아무도 탈락 안 함`);
  tq = fq.until; fq = F.step(fq, null, tq);
}
check(fq.phase === 'end' && fq.n === 5, `5문장 뒤 끝 (${fq.n})`);
check(fq.marks.u1 === 'ooooo' && fq.marks.u3 === 'xxxxx' && fq.marks.u4 === '-----', `사람마다 기록 ${JSON.stringify(fq.marks)}`);
check(fq.hist.length === 5 && fq.hist.every((h) => h.ok === 2 && h.n === 4), '판마다 반 정답 수');

if (fail) { console.error(`\n${fail}건 실패`); process.exit(1); }
console.log('OK: 밸런스 게임 — 판정(적은 쪽 · 비김 · 안 고름 · 없던 일 · 무작위 1만 번) · 진행(15 → 10초 · 2명 끝 · 4분 마지막 판 · 18명 시뮬) · 질문 150개 · 반대로 · 수학 OX(판정 · 문장 독립 계산) · OX 타임(탈락 없음 · 5문장 · 기록) 통과');
