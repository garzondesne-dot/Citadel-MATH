// ⚔ 소레이드 (2026-11-09 요청 #18): 6차시 문제 4~7 징검다리 · 개별 진행 · 졸개 오답 0.5 · 대장 오답 1 · 남은 1칸 = 잠김 → 풀어주기 · 반 전체 체력
//   + 단계 정답 독립 검산 (교과서 숫자 · 연습 판 200개)
const load = require('./load');
const DS = load(['js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/lessons.js', 'lessons/set-06.js', 'lessons/rubrics.js', 'js/raid/model.js']);
const L = DS.Lessons.get('set-06'), X = DS.Raid; let fail = 0, ok = 0;
const check = (c, m) => { if (c) ok++; else { fail++; console.log('FAIL:', m); } };
const right = (q) => (q.type === 'multi' ? q.answer : q.type === 'choice' ? q.answerIndex : q.answer), wrongOf = (q) => (q.type === 'multi' ? [] : q.type === 'choice' ? (q.answerIndex + 1) % q.choices.length : q.answer + 1);
// ① 교과서 숫자 · 독립 계산
const ans = (id) => L.chainItems(id, 's', 0).map((q) => (q.type === 'multi' ? q.answer.map((i) => q.options[i]).join(',') : q.type === 'choice' ? q.choices[q.answerIndex] : String(q.answer)));
check(ans('u4').join(' | ') === '1,2,4,8 | 4,8,12,16,20 | 12,16,20 | 8', `문제 4 ${ans('u4')}`);
check(ans('u5').join(' | ') === 'B ⊂ A | 가능하다 (○) | −1,0 | −1,0,4', `문제 5 ${ans('u5')}`);
check(ans('u6').join(' | ') === '49 | 21 | 9', `문제 6 ${ans('u6')}`);
check(ans('u7').join(' | ') === '99 | (A ∩ B)ᶜ | 3 | 96', `문제 7 ${ans('u7')}`);
// ② 연습 판: 숫자로 다시 계산
for (let k = 1; k <= 50; k++) {
  const a = L.chainItems('u4', 's' + k, k), c4 = a[3].check || {}; const D = a[2].answer.map((i) => Number(String(a[2].options[i]).replace('−', '-')));
  check(a[3].answer === 2 ** D.length && D.length >= 2, `연습 u4 #${k}`);
  const u7 = L.chainItems('u7', 's' + k, k), q = u7[3].check, bad = Array.from({ length: q.N - 1 }, (_, i) => i + 1).filter((x) => x % q.p === 0 && x % q.q === q.rem).length;
  check(u7[0].answer === q.N - 1 && u7[2].answer === bad && u7[3].answer === q.N - 1 - bad, `연습 u7 #${k}`);
  const u6 = L.chainItems('u6', 's' + k, k), w = u6[2].check; check(u6[0].answer === w.a + w.b && u6[1].answer === Math.min(w.a, w.b) && u6[2].answer === w.a + w.b - w.T, `연습 u6 #${k}`);
  const u5 = L.chainItems('u5', 's' + k, k), v = u5[3].check, want = [1 - v.c, 0, v.b].sort((x, y) => x - y).join(','); check(u5[3].answer.map((i) => String(u5[3].options[i]).replace('−', '-')).join(',') === want, `연습 u5 #${k}`);
  check(L.chainItems('u4', 's' + k, k).every((x) => x.say), `연습 say #${k}`);
}
// ③ 진행 · 기회 · 잠김 · 풀어주기
const R = X.newRoom('555555', 'set-06', 'T', 1000); R.active = { a: true, b: true }; R.players = { a: { num: 1 }, b: { num: 2 } }; R.state.headcount = 2;
const sub = (u, s, good, p = 0) => { const it = p ? L.chainItems('u4', X.chainSubs ? `555555|${u}` : '', p) : X.chainItems(L, R, 'u4', u, 0); const q = it[s];
  const m = ((R.chain = R.chain || {}).u4 = R.chain.u4 || {}); const a = (m[u] = m[u] || {}); a[Object.keys(a).length] = { s, p, g: good ? right(q) : wrongOf(q) }; };
check(X.isChain(L, R, 'u4') && X.monsterHp(L, R, 'u4').max === Math.floor(2 * 4 * (L.defaultPct || 90) / 100), '반 체력 = 인원 × 단계 4 × 기준%');
sub('a', 0, true); sub('a', 1, true); sub('a', 2, true); sub('a', 3, true); let r = X.record(L, R, 'u4', 'a');
check(r.done && r.perfect && r.best === 4 && r.says.length === 5 && /^∵ X 는 B − A 의 부분집합/.test(r.says[3]) && /그러므로/.test(r.says[4]), '퍼펙트: 4단계 · 나의 풀이 4줄 + 💡 근거 줄(완성 문장) · 마지막 「그러므로」');
sub('b', 0, false); r = X.record(L, R, 'u4', 'b'); check(r.left === 3.5 && r.stage === 0 && !r.locked, '졸개 오답 = 0.5칸 · 같은 단계');
sub('b', 0, true); sub('b', 1, true); sub('b', 2, true); sub('b', 3, false); sub('b', 3, false); r = X.record(L, R, 'u4', 'b');
check(r.left === 1.5 && r.stage === 3 && !r.locked, '대장 오답 = 1칸씩');
sub('b', 3, false); r = X.record(L, R, 'u4', 'b'); check(r.left === 0.5 && r.locked, '남은 기회 ≤ 1 = 잠김');
(R.chainOk = { u4: { b: true } }); r = X.record(L, R, 'u4', 'b'); check(!r.locked && r.ok, '선생님 풀어주기 → 잠김 풀림');
sub('b', 3, false); r = X.record(L, R, 'u4', 'b'); check(r.fail && !r.done && r.best === 3, '마지막 칸까지 틀림 = 못 맞힘 · 데미지 3');
check(X.monsterHp(L, R, 'u4').dmg === 7, '반 체력 피해 = 4 + 3');
// ④ 🔥 연습 사슬 EXP (2026-11-09 선생님: 사슬 완성 1번당 +1)
const psub = (u, p, s, good) => { const q = X.chainItems(L, R, 'u4', u, p)[s]; const a = R.chain.u4[u]; a[Object.keys(a).length] = { s, p, g: good ? right(q) : wrongOf(q) }; };
const pwhy = (u, p, g) => { const a = R.chain.u4[u]; a[Object.keys(a).length] = { s: 2, p, g, w: 1 }; };
psub('a', 1, 0, false); [0, 1, 2].forEach((s) => psub('a', 1, s, true)); r = X.record(L, R, 'u4', 'a');
check(r.pWhy === 2 && !r.whyOk, '💡 연습 판: ③ 맞힌 뒤 근거 빈칸을 기다림');
psub('a', 1, 3, true); r = X.record(L, R, 'u4', 'a'); check(r.pStage === 3, '💡 근거를 안 고르면 다음 단계는 안 받음');
pwhy('a', 1, 1); r = X.record(L, R, 'u4', 'a'); check(r.pWhy === 2 && !r.whyOk, '💡 근거 오답 = 그대로 (벌 없음)');
pwhy('a', 1, 0); r = X.record(L, R, 'u4', 'a'); check(r.pWhy === -1 && r.whyOk && /부분집합/.test(r.pSays[r.pSays.length - 1]), '💡 근거 정답 = 「∵ …」 한 줄 · 힌트 주기 열림');
psub('a', 1, 3, true); r = X.record(L, R, 'u4', 'a');
check(r.pDoneN === 1 && r.left === 4 && r.best === 4 && r.perfect, '연습 1판 완성(중간 오답 있어도) = 1 · 기회 · 기록 그대로');
[0, 1].forEach((s) => psub('a', 2, s, true)); r = X.record(L, R, 'u4', 'a'); check(r.pDoneN === 1, '연습 2판 반만 = 그대로 1');
psub('a', 2, 2, true); pwhy('a', 2, 0); psub('a', 2, 3, true); r = X.record(L, R, 'u4', 'a'); check(r.pDoneN === 2, '연습 2판 완성 = 2');
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
    check(rb && rb.steps.length === it.length && rb.pass === rb.total - 1 && rb.raid, `${id} 채점 기준 ${rb ? rb.steps.length : 0}칸 = 단계 ${it.length}칸 · 1점 빠져도 통과`);
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
console.log(fail ? `❌ 소레이드 실패 ${fail}` : `✅ 소레이드: 확인 ${ok}개 · 실패 0`); if (fail) process.exit(1);
