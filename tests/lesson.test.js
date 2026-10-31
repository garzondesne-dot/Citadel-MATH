// 차시 묶음 검증: node tests/lesson.test.js
// (1) 엄격한 연성: 모든 카드가 재료로 연성 가능, 순서가 뜻을 바꾸면 거꾸로는 실패 + 개념 메시지
// (2) 문제: 모든 유형 × 시드 500개 — 정답을 원소를 직접 세고 조건을 직접 계산해 검산, 채점기(정답 인정·오답 거부)
// (3) 형성평가 세트1(학습지)·세트2 정답 직접 검산
const load = require('./load');
const DS = load(['js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/lessons.js', 'lessons/set-03.js']);
const L = DS.Lessons.get('set-03'), S = DS.SetGen, Q = DS.Quiz;
let fail = 0;
const check = (c, m) => { if (!c) { fail++; if (fail <= 30) console.error('FAIL:', m); } };
const tok = (k) => { const [kind, id] = k.split(':'); return { kind, id }; };
const M = (op, a, b) => DS.Craft.match(L, op, a && tok(a), b && tok(b));

// ── 1. 연성 ─────────────────────────────────────────────
const have = new Set(Object.keys(L.parts).map((p) => `part:${p}`));
for (let r = 0; r < 5; r++) for (const x of L.recipes) if (x.in.every((k) => have.has(k))) have.add(`${x.out.kind}:${x.out.id}`);
for (const id of Object.keys(L.cards)) check(have.has(`card:${id}`), `연성 불가능한 카드 ${id}`);
for (const x of L.recipes) {
  const res = M(x.op, x.in[0], x.in[1]);
  check(res.ok && res.out.id === x.out.id, `규칙 ${x.op} ${x.in}`);
  if (x.ordered && x.in[0] !== x.in[1]) { const rev = M(x.op, x.in[1], x.in[0]); check(!rev.ok || rev.out.id !== x.out.id, `거꾸로도 같은 결과 (엄격하지 않음) ${x.op} ${x.in}`); }
}
const failMsg = (op, a, b, re, label) => { const r = M(op, a, b); check(!r.ok && re.test(r.msg), `${label}: ${r.msg}`); };
failMsg('sub', 'part:elem', 'part:setA', /∈/, '원소 ⊂ 집합');
failMsg('sub', 'part:setA', 'part:empty', /∅ ⊂ A/, 'A ⊂ ∅');
failMsg('nsub', 'part:setA', 'part:setA', /자기 자신/, 'A ⊄ A');
failMsg('and', 'card:subset', 'part:setB', /반대 방향/, '한쪽 방향만');
failMsg('span', 'part:setA', 'part:empty', /거꾸로/, '⋯ 거꾸로');
failMsg('minus', 'part:setA', 'card:list', /거꾸로/, '− 거꾸로');
check(M('sub', 'part:setB', 'part:setA').out.id === 'subBA' && M('sub', 'part:setA', 'part:setB').out.id === 'subset', '⊂ 방향에 따라 다른 결과');
L.stages.forEach((st, i) => {
  st.cards.forEach((c) => { check(L.cards[c] && L.book[c], `단계 ${i} 카드 ${c}`); check(L.example(c, 'x'), `예제 ${c}`); });
  st.types.forEach((t) => { const q = L.question(t, 's'); check(q.cards.some((c) => L.stages.slice(0, i + 1).some((s2) => s2.cards.includes(c))), `${t}: 이 단계까지 연성한 카드로 풀 수 있어야`); });
});

// ── 2. 문제 독립 검산 ─────────────────────────────────────
const condEls = {
  mul3: Array.from({ length: 30 }, (_, i) => i + 1).filter((x) => x % 3 === 0),
  prime10: Array.from({ length: 10 }, (_, i) => i + 1).filter((x) => x > 1 && [2, 3, 5, 7].every((p) => p === x || x % p)),
  div12: Array.from({ length: 12 }, (_, i) => i + 1).filter((x) => 12 % x === 0),
  div25: Array.from({ length: 25 }, (_, i) => i + 1).filter((x) => 25 % x === 0),
  div4: [1, 2, 3, 4].filter((x) => 4 % x === 0), div6: [1, 2, 3, 4, 5, 6].filter((x) => 6 % x === 0),
  even8: [1, 2, 3, 4, 5, 6, 7, 8].filter((x) => x % 2 === 0), odd10: Array.from({ length: 10 }, (_, i) => i + 1).filter((x) => x % 2),
};
for (const [c, els] of Object.entries(condEls)) check(JSON.stringify(els) === JSON.stringify(L.COND[c].els), `조건제시법 ${c}: ${els}`);
const sub = (a, b) => a.every((x) => b.includes(x)), same = (a, b) => sub(a, b) && sub(b, a);
const nSub = (n) => { let c = 0; for (let m = 0; m < 1 << n; m++) c++; return c; };
function rightAndWrong(p) {
  if (p.type === 'blanks') return [p.items.map((it) => it.answer), p.items.map((it) => p.options.find((o) => o !== it.answer))];
  if (p.type === 'ox') return [p.answer, !p.answer];
  if (p.type === 'number') return [p.answer, p.answer + 1];
  if (p.type === 'subsets') return [S.allSubsets(p.base), S.allSubsets(p.base).slice(1)];
  if (p.type === 'multi') return [p.answer, p.answer.slice(1)];
  return [p.answerIndex, (p.answerIndex + 1) % p.choices.length];
}
let n = 0;
for (const st of L.stages) for (const t of st.types) for (let s = 0; s < 500; s++) {
  const p = L.question(t, `seed${s}`), c = p.check || {};
  const [ok, bad] = rightAndWrong(p);
  check(Q.grade(p, ok) && !Q.grade(p, bad), `${t} 채점`);
  check(JSON.stringify(L.question(t, `seed${s}`)) === JSON.stringify(p), `${t} 같은 시드 → 같은 문제`);
  if (t === 'subset') check(p.items[0].answer === (sub(c.a, c.b) ? '⊂' : '⊄'), `subset ${p.items[0].left}`);
  if (t === 'condSubset') check(p.items[0].answer === (sub(c.a, condEls[c.cond]) ? '⊂' : '⊄'), `condSubset ${p.items[0].left} ${c.cond}`);
  if (t === 'counter') check(c.a.filter((x) => !c.b.includes(x)).map(String).includes(p.answer) && !c.b.includes(Number(p.answer)), `counter ${p.answer}`);
  if (t === 'self' || t === 'emptySub') check(p.answer === sub(c.a, c.b), `${t} O/X`);
  if (t === 'symbol') check(p.items[0].answer === (c.set.includes(c.elem) ? '∈' : '∉') && p.items[1].answer === (sub(c.sub, c.set) ? '⊂' : '⊄'), 'symbol');
  if (t === 'equal') check(p.items[0].answer === (same(c.a, c.b) ? '=' : '≠'), `equal ${p.items[0].left}`);
  if (t === 'equalCond') check(p.items[0].answer === (same(c.a, condEls[c.cond]) ? '=' : '≠'), `equalCond ${p.items[0].left}`);
  if (t === 'list') check(S.allSubsets(p.base).length === nSub(p.base.length), 'list');
  if (t === 'proper') check(p.answer === nSub(c.base.length) - 1, `proper ${p.answer}`);
  n++;
}
// 부분집합 모두: ∅·자기 자신이 빠지면 안내
{
  const p = L.question('list', 'a');
  check(/공집합/.test(Q.subsetsNote(p, S.allSubsets(p.base).filter((x) => x.length))), '∅ 빠짐 안내');
}

// ── 3. 형성평가 ─────────────────────────────────────────
const judgeItem2 = (s) => { // '2 ∈ {1, 2}' / '{2} ⊂ {1, 2}' / '∅ ⊂ {1, 2}'
  const m = s.match(/^(.+?) (∈|⊂) \{(.+)\}$/); const R = m[3].split(',').map((x) => Number(x));
  const L0 = m[1] === '∅' ? [] : m[1].startsWith('{') ? m[1].slice(1, -1).split(',').map(Number) : Number(m[1]);
  return m[2] === '∈' ? !Array.isArray(L0) && R.includes(L0) : Array.isArray(L0) && sub(L0, R);
};
for (const set of [1, 2]) {
  const B = L.boss.sets[set];
  check(B.length === 6, `세트${set} 6문항`);
  B.forEach((p, i) => { const [ok, bad] = rightAndWrong(p); check(Q.grade(p, ok) && !Q.grade(p, bad), `세트${set} ${i + 1}번 채점`); });
  B[0].check.pairs.forEach(([a, b], k) => check(B[0].items[k].answer === (sub(a, b) ? '⊂' : '⊄'), `세트${set} 1번`));
  const bad = B[1].check.judge.map((s, i) => (judgeItem2(s) ? -1 : i)).filter((i) => i >= 0);
  check(bad.length === 1 && bad[0] === B[1].answerIndex, `세트${set} 2번 옳지 않은 것 ${bad}`);
  check(B[2].items[0].answer === (same(condEls[B[2].check.cond], B[2].check.b) ? '=' : '≠'), `세트${set} 3번`);
  check(S.allSubsets(B[3].base).length === 4, `세트${set} 4번`);
  check(B[4].answer === nSub(B[4].check.base.length) - 1, `세트${set} 5번`);
  const a = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((x) => x !== 1 && same([1, x], B[5].check.solveB));
  check(a.length === 1 && a[0] === B[5].answer, `세트${set} 6번 a = ${a}`);
}
// 학습지 세트1 정답 (3차시 형성평가): ⊂·⊄ / ④ / = / ∅,{5},{7},{5,7} / 3 / 3
const B1 = L.boss.sets[1];
check(B1[0].items.map((x) => x.answer).join() === '⊂,⊄' && B1[1].answerIndex === 3 && B1[2].items[0].answer === '=' && B1[3].base.join() === '5,7' && B1[4].answer === 3 && B1[5].answer === 3, '세트1 = 3차시 학습지 정답');

if (fail) { console.error(`\n${fail}건 실패`); process.exit(1); }
console.log(`OK: 연성 ${L.recipes.length}개(엄격) · 문제 ${n}개 독립 검산 · 형성평가 세트1(학습지)·세트2 검산 통과`);
