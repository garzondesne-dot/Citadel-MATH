// 집합 단원 연성법 검사: node tests/unit.test.js
// (1) 카드마다 레시피대로 연성되고, 배포 전 차시에서는 막힌다 (2) 엄격 연성: 순서를 바꾸면 실패 + 개념 메시지
// (3) 마력 예제(첫 연성)의 정답이 채점기에서 인정된다 (4) 열리는 범위: 2차시 7장, 3차시 15장
const load = require('./load');
const DS = load(['js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'lessons/unit-set.js']);
const U = DS.Unit, Q = DS.Quiz;
let fail = 0;
const check = (c, m) => { if (!c) { fail++; console.error('FAIL:', m); } };
const ids = new Set();
for (const c of U.CARDS) {
  check(!ids.has(c.id), `카드 id 중복 ${c.id}`); ids.add(c.id);
  const [l, r] = c.in.length === 1 ? [c.in[0], null] : c.in;
  const got = U.forge(c.op, l, r, c.no);
  check(got.ok && got.card.id === c.id, `${c.name}: 레시피 [${c.in}] ${c.op} → ${got.ok ? got.card.id : got.msg}`);
  if (c.in.length === 1) { const g2 = U.forge(c.op, null, c.in[0], c.no); check(g2.ok && g2.card.id === c.id, `${c.name}: 한 칸 연산은 오른쪽 칸에 올려도 됨`); }
  check(!U.forge(c.op, l, r, c.no - 1).ok, `${c.name}: ${c.no}차시 배포 전에는 막힘`);
  if (c.ordered && c.in.length === 2 && c.in[0] !== c.in[1]) { const rev = U.forge(c.op, r, l, c.no); check(!rev.ok || rev.card.id !== c.id, `${c.name}: 순서를 바꾸면 이 카드가 아님`); }
  check(U.opOf(c.op) && U.opOf(c.op).no <= c.no, `${c.name}: 연산이 카드보다 늦게 열리지 않음`);
  // 마력 예제
  const e = c.ex, right = e.type === 'choice' ? e.answerIndex : e.answer;
  check(Q.grade(e, right), `${c.name}: 마력 예제 정답 인정`);
  check(!Q.grade(e, e.type === 'choice' ? (e.answerIndex + 1) % e.choices.length : e.type === 'ox' ? !e.answer : e.answer + 1), `${c.name}: 마력 예제 오답 거부`);
  check([1, 2, 3].includes(c.grade) && c.hint && c.desc && c.page, `${c.name}: 등급·힌트·뜻·쪽`);
}
// 교과서 예제 검산 (독립 계산)
check(U.card('count').ex.answer === [3, 6, 9].length, 'n({3,6,9}) = 3');
check(U.card('proper').ex.answer === 2 ** 3 - 1, '{1,2,3} 진부분집합 7');
check(U.card('allsub').ex.answer === 2 ** 2, '{a,b} 부분집합 4');
// 엄격 연성 메시지
check(/거꾸로/.test(U.forge('in', 'A', 'a', 2).msg), '[A] ∈ [a] → 순서 거꾸로');
check(/원소와 집합/.test(U.forge('sub', 'a', 'A', 3).msg), '[a] ⊂ [A] → ∈ 와 ⊂ 구분');
check(/왼쪽이 포함/.test(U.forge('sub', 'B', 'A', 3).msg), '[B] ⊂ [A] → 왼쪽이 포함되는 집합');
check(/≠/.test(U.forge('and', 'card:subset', 'card:equal', 3).msg), '진부분집합은 ≠');
check(/아직 배우지/.test(U.forge('cup', 'A', 'B', 3).msg), '∪ 는 4차시 전에는 못 씀');
check(!U.forge('in', 'a', null, 2).ok, '두 칸 연산에 재료 하나면 실패');
Object.keys(U.MISTAKES).forEach((k) => { const [op, rest] = k.split('|'); const p = rest.split(','); const g = U.forge(op, p[0], p[1] || null, 3); check(!g.ok && g.msg === U.MISTAKES[k] || (U.opOf(op).no > 3), `실수 메시지 ${k}`); });
// 열리는 범위
check(U.opens(2).length === 7 && U.opens(3).length === 15 && U.opens(1).length === 0, `2차시 7장 · 3차시 15장 (${U.opens(2).length}, ${U.opens(3).length})`);
if (fail) { console.error(`\n${fail}건 실패`); process.exit(1); }
console.log(`OK: 집합 단원 연성법 — 카드 ${U.CARDS.length}장 레시피 · 배포 차시 잠금 · 엄격 순서 · 실수 메시지 ${Object.keys(U.MISTAKES).length}개 · 마력 예제 채점 통과`);
