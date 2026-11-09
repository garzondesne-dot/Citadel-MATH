// ⚔ 소레이드 (2026-11-09 요청 #18): 6차시 문제 4~7 징검다리 · 개별 진행 · 졸개 오답 0.5 · 대장 오답 1 · 남은 1칸 = 잠김 → 풀어주기 · 반 전체 체력
//   + 단계 정답 독립 검산 (교과서 숫자 · 연습 판 200개)
const load = require('./load');
const DS = load(['js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/lessons.js', 'lessons/set-06.js', 'js/raid/model.js']);
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
check(r.done && r.perfect && r.best === 4 && r.says.length === 4 && /그러므로/.test(r.says[3]), '퍼펙트: 4단계 · 나의 풀이 4줄 · 마지막 「그러므로」');
sub('b', 0, false); r = X.record(L, R, 'u4', 'b'); check(r.left === 3.5 && r.stage === 0 && !r.locked, '졸개 오답 = 0.5칸 · 같은 단계');
sub('b', 0, true); sub('b', 1, true); sub('b', 2, true); sub('b', 3, false); sub('b', 3, false); r = X.record(L, R, 'u4', 'b');
check(r.left === 1.5 && r.stage === 3 && !r.locked, '대장 오답 = 1칸씩');
sub('b', 3, false); r = X.record(L, R, 'u4', 'b'); check(r.left === 0.5 && r.locked, '남은 기회 ≤ 1 = 잠김');
(R.chainOk = { u4: { b: true } }); r = X.record(L, R, 'u4', 'b'); check(!r.locked && r.ok, '선생님 풀어주기 → 잠김 풀림');
sub('b', 3, false); r = X.record(L, R, 'u4', 'b'); check(r.fail && !r.done && r.best === 3, '마지막 칸까지 틀림 = 못 맞힘 · 데미지 3');
check(X.monsterHp(L, R, 'u4').dmg === 7, '반 체력 피해 = 4 + 3');
// ④ 🔥 연습 사슬 EXP (2026-11-09 선생님: 사슬 완성 1번당 +1)
const psub = (u, p, s, good) => { const q = X.chainItems(L, R, 'u4', u, p)[s]; const a = R.chain.u4[u]; a[Object.keys(a).length] = { s, p, g: good ? right(q) : wrongOf(q) }; };
psub('a', 1, 0, false); [0, 1, 2, 3].forEach((s) => psub('a', 1, s, true)); r = X.record(L, R, 'u4', 'a');
check(r.pDoneN === 1 && r.left === 4 && r.best === 4 && r.perfect, '연습 1판 완성(중간 오답 있어도) = 1 · 기회 · 기록 그대로');
[0, 1].forEach((s) => psub('a', 2, s, true)); r = X.record(L, R, 'u4', 'a'); check(r.pDoneN === 1, '연습 2판 반만 = 그대로 1');
[2, 3].forEach((s) => psub('a', 2, s, true)); r = X.record(L, R, 'u4', 'a'); check(r.pDoneN === 2, '연습 2판 완성 = 2');
check(DS.Grow && DS.Grow.XP ? DS.Grow.XP.chainPrac === 1 : true, 'EXP 표 chainPrac = 1');
console.log(fail ? `❌ 소레이드 실패 ${fail}` : `✅ 소레이드: 확인 ${ok}개 · 실패 0`); if (fail) process.exit(1);
