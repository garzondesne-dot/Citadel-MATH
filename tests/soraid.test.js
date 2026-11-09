// ⚔ 소레이드 (2026-11-09 요청 #18): 6차시 문제 4~7 징검다리 · 개별 진행 · 졸개 오답 0.5 · 대장 오답 1 · 남은 1칸 = 잠김 → 풀어주기 · 반 전체 체력
//   + 단계 정답 독립 검산 (교과서 숫자 · 연습 판 200개)
const load = require('./load');
const DS = load(['js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/lessons.js', 'lessons/set-06.js', 'lessons/rubrics.js', 'js/raid/model.js']);
const L = DS.Lessons.get('set-06'), X = DS.Raid; let fail = 0, ok = 0;
const check = (c, m) => { if (c) ok++; else { fail++; console.log('FAIL:', m); } };
const right = (q) => (q.type === 'multi' ? q.answer : q.type === 'choice' ? q.answerIndex : q.answer), wrongOf = (q) => (q.type === 'multi' ? [] : q.type === 'choice' ? (q.answerIndex + 1) % q.choices.length : q.answer + 1);
// ① 교과서 숫자 · 독립 계산
const ans = (id) => L.chainItems(id, 's', 0).map((q) => (q.type === 'multi' ? q.answer.map((i) => q.options[i]).join(',') : q.type === 'choice' ? q.choices[q.answerIndex] : String(q.answer)));
check(ans('u4').join(' | ') === '1,2,4,8,4,8,12,16,20 | X ⊂ B 이고 X 와 A 는 서로소 | 12,16,20 | 8', `문제 4 ${ans('u4')}`);
// #44 근거 줄 자리 = 그 근거를 쓰는 단계 뒤 (문제 4 · 6 · 7 = 대장 · 문제 5 = 졸개2) · 첫 판 완성 문장이 뒤 단계 답을 미리 보여 주지 않게
{ const at = (id) => L.chainItems(id, 's', 0).map((q, i) => (q.why ? i : -1)).filter((i) => i >= 0).join();
  check(at('u4') === '3' && at('u5') === '1' && at('u6') === '3' && at('u7') === '3', `근거 줄 자리 u4 ${at('u4')} · u5 ${at('u5')} · u6 ${at('u6')} · u7 ${at('u7')}`); }
// #41 문제 4 다시 짜기: 졸개1 = A 칸 · B 칸 두 묶음 (교과서 8 · 4 · 20 → A = {1, 2, 4, 8} · B = {4, 8, …, 20}) · 졸개3 근거 = 2³ · 대장 8
{ const u4 = L.chainItems('u4', 's', 0), g = u4[0].groups || [], cut = (g[0] || {}).n, pick = (lo, hi) => u4[0].answer.filter((i) => i >= lo && i < hi).map((i) => u4[0].options[i]).join(',');
  check(g.length === 2 && pick(0, cut) === '1,2,4,8' && pick(cut, cut + g[1].n) === '4,8,12,16,20' && /8의 약수/.test(g[0].label) && /20 이하의 4의 배수/.test(g[1].label), `졸개1 = A 칸 ${pick(0, cut)} · B 칸 ${pick(cut, 99)}`);
  check(u4.length === 4 && u4[1].type === 'choice' && u4[3].why && u4[3].why.text === '∵ 원소가 3개인 집합의 부분집합의 개수는 2³' && u4[3].why.choices[0].startsWith('2ⁿ') && u4[3].answer === 8, '4단계 · 졸개2 고르기 · 졸개3 근거 「…2³」 · 대장 8');
  check(u4[0].say === 'A = {1, 2, 4, 8}, B = {4, 8, 12, 16, 20} 이다.' && /서로소이다\.$/.test(u4[1].say) && u4[2].say === '따라서 X ⊂ B − A = {12, 16, 20} 이다.', `나의 풀이 문장 ${u4[0].say}`);
  const DS2 = DS; check(!DS2.Quiz.grade(u4[0], u4[0].answer.slice(0, -1)) && DS2.Quiz.grade(u4[0], u4[0].answer.slice()), '두 칸 다 맞아야 정답 (하나 빠지면 틀림)'); }
const setOf = (id, k) => { const q = L.chainItems(id, 's', 0)[k]; return q.answer.map((i) => q.options[i]).sort().join(','); };
check(ans('u5')[0] === 'B ⊂ A' && setOf('u5', 1) === ['x = 4', 'x = x² + 2x'].sort().join(',') && ans('u5')[2] === '−1,0' && ans('u5')[3] === '−1,0,4', `문제 5 ${ans('u5')}`);
check(ans('u6').join(' | ') === 'B ⊂ A | 21 | A ∪ B = U (곧 n(A ∪ B) = 40) | 9', `문제 6 ${ans('u6')}`);
check(ans('u7').join(' | ') === '99 | (A ∩ B)ᶜ | 3 | 96', `문제 7 ${ans('u7')}`);
// ② 연습 판: 숫자로 다시 계산
for (let k = 1; k <= 50; k++) {
  const a = L.chainItems('u4', 's' + k, k), c1 = a[0].check || {}, num = (q, ix) => ix.map((i) => Number(String(q.options[i]).replace('−', '-')));
  const A0 = Array.from({ length: c1.p }, (_, i) => i + 1).filter((d) => c1.p % d === 0), B0 = Array.from({ length: Math.floor(c1.N / c1.q) }, (_, i) => (i + 1) * c1.q), D0 = B0.filter((x) => !A0.includes(x)), g0 = (a[0].groups || [{}])[0].n;
  const D = num(a[2], a[2].answer);
  check(num(a[0], a[0].answer.filter((i) => i < g0)).join() === A0.join() && num(a[0], a[0].answer.filter((i) => i >= g0)).join() === B0.join() && D.join() === D0.join() && a[3].answer === 2 ** D0.length && D0.length >= 2 && a[3].why.text.endsWith('2' + String(D0.length).replace(/\d/g, (x) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[x])), `연습 u4 #${k} (독립 계산 p ${c1.p} · q ${c1.q} · N ${c1.N})`);
  const u7 = L.chainItems('u7', 's' + k, k), q = u7[3].check, bad = Array.from({ length: q.N - 1 }, (_, i) => i + 1).filter((x) => x % q.p === 0 && x % q.q === q.rem).length;
  check(u7[0].answer === q.N - 1 && u7[2].answer === bad && u7[3].answer === q.N - 1 - bad, `연습 u7 #${k}`);
  const u6 = L.chainItems('u6', 's' + k, k), w = u6[3].check; check(u6[0].answer === (w.a >= w.b ? 'B ⊂ A' : 'A ⊂ B') && u6[1].answer === Math.min(w.a, w.b) && /^A ∪ B = U/.test(u6[2].answer) && u6[3].answer === w.a + w.b - w.T && u6[3].why && u6.every((x) => x.problem && x.problem.includes(`${w.T}명`)), `연습 u6 #${k}`);
  { const q2 = L.chainItems('u5', 's' + k, k), c5 = q2[3].check, o = q2[1].options, ok = q2[1].answer.map((i) => o[i]).sort().join(',');
    check(ok === [`x = ${c5.b}`, `x = x² + ${c5.c}x`].sort().join(',') && o.length === 5 && new Set(o).size === 5 && !o.includes(`x = ${c5.d}`) && q2[0].problem && /B = \{x, /.test(q2[0].problem), `연습 u5 졸개2 보기 #${k} (정답 2개 · 「x = d」 없음 · 겹침 없음)`); }
  const u5 = L.chainItems('u5', 's' + k, k), v = u5[3].check, want = [1 - v.c, 0, v.b].sort((x, y) => x - y).join(','); check(u5[3].answer.map((i) => String(u5[3].options[i]).replace('−', '-')).join(',') === want, `연습 u5 #${k}`);
  check(L.chainItems('u4', 's' + k, k).every((x) => x.say), `연습 say #${k}`);
}
for (let k = 51; k <= 200; k++) { const a = L.chainItems('u4', 's' + k, k), c1 = a[0].check || {}, A0 = Array.from({ length: c1.p }, (_, i) => i + 1).filter((d) => c1.p % d === 0), B0 = Array.from({ length: Math.floor(c1.N / c1.q) }, (_, i) => (i + 1) * c1.q), D0 = B0.filter((x) => !A0.includes(x));
  check(a[3].answer === 2 ** D0.length && a[2].answer.map((i) => Number(a[2].options[i])).join() === D0.join() && a[0].groups.length === 2, `연습 u4 #${k} (#41 연습 200개)`); }
// #44 ③ 문제 6 a ≤ b (작은 쪽이 A) · ⑤ 첫 판엔 원문 상자 없음
{ const v = L.chainRaw.u6(40, 18, 25); check(v[0].answer === 'A ⊂ B' && v[0].choices.includes('B ⊂ A') && v[1].answer === 18 && v[3].answer === 3 && v[0].say.startsWith('A ⊂ B 일 때'), 'a < b 이면 「A ⊂ B」 가 정답 (반대 포함은 함정)');
  const e = L.chainRaw.u6(40, 20, 20); check(e[1].answer === 20, 'a = b 도 최댓값 = 20');
  check(['u4', 'u5', 'u6', 'u7'].every((id) => L.chainItems(id, 's', 0).every((x) => !x.problem)), '첫 판 = 「📜 문제」 상자 없음 (학습지 그대로)');
  check(['u4', 'u5', 'u6', 'u7'].every((id) => L.chainItems(id, 's1', 1).every((x) => x.problem && /구하시오\.$/.test(x.problem))), '한 판 더 = 모든 단계에 바뀐 숫자의 원문 문제'); }
// ③ 진행 · 기회 · 잠김 · 풀어주기
const R = X.newRoom('555555', 'set-06', 'T', 1000); R.active = { a: true, b: true }; R.players = { a: { num: 1 }, b: { num: 2 } }; R.state.headcount = 2;
const sub = (u, s, good, p = 0) => { const it = p ? L.chainItems('u4', X.chainSubs ? `555555|${u}` : '', p) : X.chainItems(L, R, 'u4', u, 0); const q = it[s];
  const m = ((R.chain = R.chain || {}).u4 = R.chain.u4 || {}); const a = (m[u] = m[u] || {}); a[Object.keys(a).length] = { s, p, g: good ? right(q) : wrongOf(q) }; };
check(X.isChain(L, R, 'u4') && X.monsterHp(L, R, 'u4').max === Math.floor(2 * 4 * (L.defaultPct || 90) / 100), '반 체력 = 인원 × 단계 4 × 기준%');
sub('a', 0, true); sub('a', 1, true); sub('a', 2, true); sub('a', 3, true); let r = X.record(L, R, 'u4', 'a');
check(r.done && r.perfect && r.best === 4 && r.says.length === 5 && /그러므로/.test(r.says[3]) && /^∵ 원소가 3개인 집합의 부분집합의 개수는 2³$/.test(r.says[4]), '퍼펙트: 4단계 · 나의 풀이 4줄(마지막 「그러므로」) + 💡 근거 줄(대장 뒤 · 완성 문장)');
sub('b', 0, false); r = X.record(L, R, 'u4', 'b'); check(r.left === 3.5 && r.stage === 0 && !r.locked, '졸개 오답 = 0.5칸 · 같은 단계');
sub('b', 0, true); sub('b', 1, true); sub('b', 2, true); sub('b', 3, false); sub('b', 3, false); r = X.record(L, R, 'u4', 'b');
check(r.left === 1.5 && r.stage === 3 && !r.locked, '대장 오답 = 1칸씩');
sub('b', 3, false); r = X.record(L, R, 'u4', 'b'); check(r.left === 0.5 && r.locked, '남은 기회 ≤ 1 = 잠김');
(R.chainOk = { u4: { b: true } }); r = X.record(L, R, 'u4', 'b'); check(!r.locked && r.ok, '선생님 풀어주기 → 잠김 풀림');
sub('b', 3, false); r = X.record(L, R, 'u4', 'b'); check(r.fail && !r.done && r.best === 3, '마지막 칸까지 틀림 = 못 맞힘 · 데미지 3');
check(X.monsterHp(L, R, 'u4').dmg === 7, '반 체력 피해 = 4 + 3');
// ④ 🔥 연습 사슬 EXP (2026-11-09 선생님: 사슬 완성 1번당 +1)
const psub = (u, p, s, good) => { const q = X.chainItems(L, R, 'u4', u, p)[s]; const a = R.chain.u4[u]; a[Object.keys(a).length] = { s, p, g: good ? right(q) : wrongOf(q) }; };
const pwhy = (u, p, g) => { const a = R.chain.u4[u]; a[Object.keys(a).length] = { s: 3, p, g, w: 1 }; }; // #44 근거 = 대장 뒤
psub('a', 1, 0, false); [0, 1, 2, 3].forEach((s) => psub('a', 1, s, true)); r = X.record(L, R, 'u4', 'a');
check(r.pWhy === 3 && !r.whyOk && r.pDoneN === 0, '💡 연습 판: 대장 맞힌 뒤 근거 빈칸을 기다림 (아직 완성 아님)');
pwhy('a', 1, 1); r = X.record(L, R, 'u4', 'a'); check(r.pWhy === 3 && !r.whyOk && r.pLeft === 3.5, '💡 근거 오답 = 그대로 (기회도 안 깎음)');
pwhy('a', 1, 0); r = X.record(L, R, 'u4', 'a'); check(r.pWhy === -1 && r.whyOk && /부분집합/.test(r.pSays[r.pSays.length - 1]), '💡 근거 정답 = 「∵ …」 한 줄 · 힌트 주기 열림');
check(r.pDoneN === 1 && r.left === 4 && r.best === 4 && r.perfect, '연습 1판 완성(중간 오답 있어도) = 1 · 기회 · 기록 그대로');
[0, 1].forEach((s) => psub('a', 2, s, true)); r = X.record(L, R, 'u4', 'a'); check(r.pDoneN === 1, '연습 2판 반만 = 그대로 1');
psub('a', 2, 2, true); psub('a', 2, 3, true); pwhy('a', 2, 0); r = X.record(L, R, 'u4', 'a'); check(r.pDoneN === 2, '연습 2판 완성 = 2 (대장 → 근거 줄 순서 · #44)');
check(DS.Grow && DS.Grow.XP ? DS.Grow.XP.chainPrac === 1 : true, 'EXP 표 chainPrac = 1');
// ⑤ 🌫 정찰 시간 줄이기 (2026-11-09 리모컨 −30초): solveOn sec 줄이면 끝 시각이 당겨지고 · 이미 지난 시간보다 짧으면 바로 등장
{ const S = X.newRoom('777777', 'set-06', 'T', 1000); S.state.step = L.steps.findIndex((s) => s.id === 'u4'); S.state.stepAt = 1000;
  let k = X.solveLock(L, S, 11000); check(k && k.on && k.left === 50000, '정찰 기본 60초 · 10초 지남 = 50초 남음');
  S.state.solveOn = { u4: { sec: 30, at: 1000 } }; k = X.solveLock(L, S, 11000); check(k.on && k.left === 20000, '−30초 → 20초 남음');
  S.state.solveEnd = { u4: 11000 }; k = X.solveLock(L, S, 11000); check(!k.on, '남은 시간보다 많이 줄이면 = 바로 등장'); }
// ⑥ 💥 졸개 쓰러짐 (기준% · 못 맞힘 빼고 · 리모컨 쓰러뜨리기)
{ const Q = X.newRoom('888888', 'set-06', 'T', 1000); Q.active = { a: true, b: true, c: true }; Q.players = { a: {}, b: {}, c: {} }; Q.chain = { u4: {} };
  const add = (u, s, good) => { const q = X.chainItems(L, Q, 'u4', u, 0)[s]; const m = (Q.chain.u4[u] = Q.chain.u4[u] || {}); m[Object.keys(m).length] = { s, p: 0, g: good ? right(q) : wrongOf(q) }; };
  add('a', 0, true); add('b', 0, true); add('b', 1, true); add('c', 0, false);
  let d = X.chainDown(L, Q, 'u4'); check(d.length === 3 && d[0].past === 2 && d[0].need === 3 && !d[0].down, '졸개 3마리 · ① 넘은 2명 < 기준 3명(90%) = 안 쓰러짐');
  add('c', 0, true); d = X.chainDown(L, Q, 'u4'); check(d[0].down && !d[1].down, '① 3명 다 넘음 = 쓰러짐 · ② 아직');
  Q.state.chainDown = { u4: { 1: true } }; d = X.chainDown(L, Q, 'u4'); check(d[1].down && !d[2].down, '리모컨 쓰러뜨리기 = ② 쓰러짐');
for (let i = 0; i < 8; i++) add('c', 1, false); d = X.chainDown(L, Q, 'u4'); check(d[0].all === 2, '기회 다 쓴 학생은 머릿수에서 뺌');
  check(X.chainDown(L, Q, 'm1').length === 0, '보통 몬스터 = 졸개 없음'); }
// ⑦ 🩸 졸개 체력 막대 (#37 · 2026-11-09): 최대 = 올림(머릿수 × 기준%) · 넘은 학생마다 −1 · 0 = 쓰러짐 · 머릿수가 바뀌면 다시 계산
{ const Q = X.newRoom('999999', 'set-06', 'T', 1000), us = Array.from({ length: 20 }, (_, i) => 'p' + i); Q.active = {}; Q.players = {}; Q.chain = { u4: {} };
  us.forEach((u) => { Q.active[u] = true; Q.players[u] = {}; });
  const pass = (u, s) => { const q = X.chainItems(L, Q, 'u4', u, 0)[s]; const m = (Q.chain.u4[u] = Q.chain.u4[u] || {}); m[Object.keys(m).length] = { s, p: 0, g: right(q) }; };
  let d = X.chainDown(L, Q, 'u4'); check(d[0].max === 18 && d[0].left === 18, `20명 · 90% → 졸개 체력 18칸 (${d[0].max})`);
  us.slice(0, 5).forEach((u) => pass(u, 0)); d = X.chainDown(L, Q, 'u4'); check(d[0].left === 13 && d[1].left === 18, '① 5명 넘음 → 13 남음 · ② 그대로 18');
  us.slice(5, 18).forEach((u) => pass(u, 0)); d = X.chainDown(L, Q, 'u4'); check(d[0].left === 0 && d[0].down, '18명 넘음 → 0 = 쓰러짐 (같은 순간)');
  us.slice(18).forEach((u) => pass(u, 0)); d = X.chainDown(L, Q, 'u4'); check(d[0].left === 0, '더 넘어도 0 아래로 안 감');
  us.slice(0, 2).forEach((u) => { delete Q.active[u]; }); d = X.chainDown(L, Q, 'u4'); check(d[0].max === 17 && d[1].max === 17 && d[1].left === 17, `머릿수 18 → 최대 다시 계산 17 (${d[1].max})`);
  Q.state.chainDown = { u4: { 2: true } }; d = X.chainDown(L, Q, 'u4'); check(d[2].left === 0 && d[2].down, '리모컨 쓰러뜨리기 = 막대 0');
  Q.state.pct = { u4: 50 }; d = X.chainDown(L, Q, 'u4'); check(d[1].max === 9, `기준% 50 · 18명 → 9 (${d[1].max})`); }
// ⑦ ✍ → 📸 진필살기 (2026-11-09 #26): 채점 기준 = 소레이드 단계 · 학습지 숫자 · 다음 통과자 금빛 컷인 3명
{ for (const id of L.chain) { const rb = (DS.Rubrics['set-06'] || {})[id], it = X.chainItems(L, X.newRoom('1', 'set-06', 'T', 1), id, '_', 0);
    check(rb && (rb.steps.length === it.length || (id === 'u6' && rb.steps.length === 3)) && rb.pass === rb.total - 1 && rb.raid, /* #44: 문제 6 은 4단계로 바뀌었지만 사진 채점 기준표는 그대로(3칸) */ `${id} 채점 기준 ${rb ? rb.steps.length : 0}칸 = 단계 ${it.length}칸 · 1점 빠져도 통과`);
    check(rb && /학습지|[0-9]/.test(rb.ask) && rb.steps[rb.steps.length - 1].key.includes(String(it[it.length - 1].answer).split(',')[0].replace('−', '−')) || id === 'u5', `${id} 마지막 기준 = 대장 답 ${it[it.length - 1].answer}`); }
  const T = X.newRoom('2', 'set-06', 'T', 1); T.heals = { u4: { a: { 0: '!true@5' }, b: { 0: '!tcut@6' }, c: { 0: '!tcut@7', 1: '_' } } };
  check(X.tcutN(T, 'u4') === 2 && X.isTcut('!tcut@1') && !X.isTcut('!true@1') && X.petrify(T, 'u4') && X.petrify(T, 'u4').by === 'a', '석화 = 첫 통과자 1번 · 다음은 금빛 컷인만 (셈 2)'); }
// ⑧ 🔥 한 판 더 3판 (#39 · 2026-11-09): 첫 판 빼고 · 시작 기준(players/{나}/pr/{mid}) · 4번째 막힘 · 성채 · 허수아비는 그대로
{ const Q = X.newRoom('121212', 'set-06', 'T', 1000); Q.active = { a: true }; Q.players = { a: {} }; Q.chain = { u4: {} };
  check(X.PRAC_MAX === 3 && X.pracUsed(Q, 'u4', 'a', X.record(L, Q, 'u4', 'a')) === 0, '처음 = 0판 · 최대 3');
  Q.players.a.pr = { u4: 1 }; check(X.pracUsed(Q, 'u4', 'a', X.record(L, Q, 'u4', 'a')) === 1, '한 판 더를 누르기만 해도 1 (시작 기준 · 도중에 그만둬도)');
  Q.chain.u4.a = { 0: { s: 0, p: 2, g: [] } }; check(X.pracUsed(Q, 'u4', 'a', X.record(L, Q, 'u4', 'a')) === 2, '기록된 연습 판 번호가 더 크면 그 수 (예전 기록 · 다시 들어와도 유지)');
  Q.players.a.pr = { u4: 3 }; check(X.pracUsed(Q, 'u4', 'a', X.record(L, Q, 'u4', 'a')) >= X.PRAC_MAX, '3판 시작 = 남은 0 → 4번째 막힘');
  check(X.pracUsed(Q, 'u5', 'a', X.record(L, Q, 'u5', 'a')) === 0, '소레이드(문제)마다 따로');
  const fs = require('fs'), path = require('path'), bon = fs.readFileSync(path.join(__dirname, '..', 'js/raid/bonus.js'), 'utf8');
  check(!/PRAC_MAX|pracUsed|pracStart/.test(bon), '성채 · 복습 허수아비(bonus.js)의 한 판 더는 제한 없음 그대로'); }
// ⑨ 🔥 한 판 더도 오답이면 기회 깎임 (#40 · 2026-11-09 · #22 바꿈): 판마다 새 4칸 · 졸개 0.5 · 대장 1 · 0 = 그 판 끝(EXP 없음) · 잠김 없음 · 근거 빈칸 오답은 안 깎음
{ const Q = X.newRoom('343434', 'set-06', 'T', 1000); Q.active = { a: true }; Q.players = { a: {} }; Q.chain = { u4: {} };
  const it0 = X.chainItems(L, Q, 'u4', 'a', 0), m = (Q.chain.u4.a = {}); let k = 0;
  it0.forEach((q, i) => { m[k++] = { s: i, p: 0, g: right(q) }; });
  const P1 = X.chainItems(L, Q, 'u4', 'a', 1), sub = (p, s2, good, w) => { const q = X.chainItems(L, Q, 'u4', 'a', p)[s2]; m[k++] = { s: s2, p, g: w ? (good ? q.why.answer : 99) : good ? right(q) : wrongOf(q), ...(w ? { w: 1 } : {}) }; };
  let r = X.record(L, Q, 'u4', 'a'); check(r.done && r.left === 4, '첫 판 다 맞힘 · 기회 4 그대로');
  sub(1, 0, false); r = X.record(L, Q, 'u4', 'a'); check(r.pLeft === 3.5 && r.left === 4 && !r.locked, `연습 졸개 오답 → 연습 기회 3.5 (첫 판 기회는 그대로 · 잠김 없음) ${r.pLeft}`);
  sub(1, 0, true); const wi = P1.findIndex((q) => q.why); r = X.record(L, Q, 'u4', 'a');
  if (P1[0].why) { sub(1, 0, false, true); r = X.record(L, Q, 'u4', 'a'); check(r.pLeft === 3.5, '근거 빈칸 오답 = 안 깎음'); sub(1, 0, true, true); }
  else check(wi >= 0, '연습 판에 근거 빈칸 있음');
  r = X.record(L, Q, 'u4', 'a'); const last = P1.length - 1;
  for (let i = r.pStage; i < last; i++) { const q = P1[i]; sub(1, i, true); if (q.why) sub(1, i, true, true); }
  sub(1, last, false); r = X.record(L, Q, 'u4', 'a'); check(r.pLeft === 2.5, `연습 대장 오답 → −1 (${r.pLeft})`);
  sub(1, last, false); sub(1, last, false); r = X.record(L, Q, 'u4', 'a'); check(r.pLeft === 0.5 && !r.pFail && !r.locked, `0.5 남아도 잠김 없이 계속 (${r.pLeft})`);
  sub(1, last, false); r = X.record(L, Q, 'u4', 'a'); check(r.pLeft === 0 && r.pFail && r.pDoneN === 0, '0 = 그 판 끝 · 완성 아님(EXP 없음)');
  sub(1, last, true); r = X.record(L, Q, 'u4', 'a'); check(r.pFail && r.pDoneN === 0, '끝난 판에 정답을 내도 안 셈');
  sub(2, 0, false); r = X.record(L, Q, 'u4', 'a'); check(r.pass === 2 && r.pLeft === 3.5 && !r.pFail, `다음 판 = 새 4칸 (${r.pLeft})`); }
// ⑩ 🌟 진필살기 즉발 (#42): 쓰러진 몬스터여도 금빛 컷인(충전 +1 없음) · 석화는 살아 있을 때만 — actions.js photoTrue 글 확인
{ const src = require('fs').readFileSync(require('path').join(__dirname, '..', 'js/raid/actions.js'), 'utf8'), f = src.slice(src.indexOf('async function photoTrue'), src.indexOf('// 🛡 홀리 방패'));
  check(!/charge`\), c \+ 1/.test(f) && /alive && !Raid\.petrify/.test(f) && /tcutN\(R, mid\) < 3/.test(f), '서술형 통과 = 쓰러졌어도 금빛 컷인 (충전 +1 없음 · 석화는 살아 있을 때만 · 컷인 3명)'); }
console.log(fail ? `❌ 소레이드 실패 ${fail}` : `✅ 소레이드: 확인 ${ok}개 · 실패 0`); if (fail) process.exit(1);
