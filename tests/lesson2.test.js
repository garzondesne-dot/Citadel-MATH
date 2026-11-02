// 2차시 차시 묶음 검증: node tests/lesson2.test.js  (학습과정 2차시 v3)
// (1) 수업 순서 (2) 첫 시도 = 학습지 정답 (3) 재도전 문제 몬스터마다 시드 300개 × 2번을 독립 계산으로 검산
// (4) 채점기: 정답 인정 · 오답 거부 (5) 형성평가 세트1·2
const load = require('./load');
const DS = load(['js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/lessons.js', 'lessons/set-02.js']);
const L = DS.Lessons.get('set-02'), Q = DS.Quiz;
let fail = 0, count = 0;
const check = (c, m) => { if (!c) { fail++; if (fail <= 30) console.error('FAIL:', m); } };

// 독립 계산 도구 (차시 파일의 계산을 쓰지 않는다)
const upto = (n) => Array.from({ length: n }, (_, i) => i + 1);
const divs = (n) => upto(n).filter((d) => n % d === 0);
const prime = (x) => x > 1 && upto(x - 1).slice(1).every((d) => x % d !== 0);
const same = (a, b) => JSON.stringify(a.slice().sort((x, y) => x - y)) === JSON.stringify(b.slice().sort((x, y) => x - y));
const chosenNums = (q) => q.answer.map((i) => Number(q.options[i]));
const right = (q) => (q.type === 'blanks' ? q.items.map((i) => i.answer) : q.type === 'choice' ? q.answerIndex : q.type === 'multi' ? q.answer.slice() : q.answer);
const wrong = (q) => (q.type === 'blanks' ? q.items.map((i) => q.options.find((o) => o !== i.answer)) : q.type === 'choice' ? (q.answerIndex + 1) % q.choices.length : q.type === 'multi' ? q.answer.slice(1) : q.type === 'ox' ? !q.answer : q.answer + 1);
const realRoots = (b, c) => [-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter((x) => x * x + b * x + c === 0);

function verify(q, label) {
  count++;
  const c = q.check || {};
  if (q.type === 'multi') {
    let want;
    if (c.divOf) want = divs(c.divOf);
    else if (c.parity) want = upto(c.parity[1]).filter((x) => (c.parity[0] === 'odd' ? x % 2 === 1 : x % 2 === 0));
    else if (c.roots) want = upto(10).filter((x) => (x - c.roots[0]) * (x - c.roots[1]) === 0);
    else if (c.set) want = c.set;
    check(same(chosenNums(q), want), `${label}: 고를 원소 ${chosenNums(q)} (독립 ${want})`);
    check(want.every((x) => q.options.includes(String(x))), `${label}: 보기 안에 정답 원소가 다 있음`);
  } else if (q.type === 'number') {
    let want;
    if (c.divSet) want = Math.max(...c.divSet), check(same(divs(want), c.divSet), `${label}: 약수 목록`);
    else if (c.mulSeq) want = c.mulSeq[0], check(c.mulSeq[1] === 2 * want && c.mulSeq[2] === 3 * want, `${label}: 배수 수열`);
    else if (c.set) want = new Set(c.set).size;
    else if (c.divOf) want = divs(c.divOf).length;
    else if (c.primesUpTo) want = upto(c.primesUpTo).filter(prime).length;
    else if (c.negSquare) want = upto(20).concat([0]).filter((x) => x * x === -c.negSquare || -x * -x === -c.negSquare).length;
    else if (c.quad) want = realRoots(c.quad[0], c.quad[1]).length;
    check(q.answer === want, `${label}: ${q.question} = ${q.answer} (독립 ${want})`);
  } else if (q.type === 'blanks') {
    const it = q.items[0], inA = c.set.includes(Number(it.left));
    check(it.answer === (inA ? '∈' : '∉'), `${label}: ${it.left} ${it.answer} A=${c.set}`);
  } else if (q.type === 'choice') {
    const r = q.choices[q.answerIndex];
    check(r === c.right, `${label}: 정답 보기 위치`);
    if (c.word) check(['기준 · 집합', '원소'].includes(c.word), `${label}: 낱말`);
    if (c.listOf) { const [k, n] = c.listOf; const last = k === 'odd' ? (n % 2 ? n : n - 1) : (n % 2 ? n - 1 : n); check(r === `{${k === 'odd' ? '1, 3, 5' : '2, 4, 6'}, …, ${last}}`, `${label}: 원소나열법 ${r}`); }
    if (c.vennOf) { check(r === `venn:B|${c.vennOf.join(' ')}`, `${label}: 맞는 벤 다이어그램`); check(q.choices.some((o) => o.includes(',')) && q.choices.length === 3, `${label}: 쉼표 함정 · 빠진 함정`); }
    if (c.infinite) check(/전체의 집합|배수\}/.test(r) && !/…, \d|이하/.test(r), `${label}: 무한집합 ${r}`);
    if (c.emptyIs) check(/보다 작은/.test(r) && q.choices.filter((o) => /^\{\d+\}$/.test(o)).length === 2, `${label}: 공집합 ${r}`);
  } else if (q.type === 'ox') {
    const want = q.check.claim === 'n(∅) = 0 이다.';
    check(q.answer === want, `${label}: O/X ${q.question}`);
  } else check(false, `${label}: 형식 ${q.type}`);
  check(Q.grade(q, right(q)), `${label}: 정답 인정`);
  check(!Q.grade(q, wrong(q)), `${label}: 오답 거부`);
}

// 1. 순서
check(L.steps.map((s) => s.id).join() === 'r0,c1,m1,s1,c2,m2,c3,m3,c4,m4,s2,boss', `순서 ${L.steps.map((s) => s.id)}`);
check(L.steps.filter((s) => s.special).map((s) => s.id).join() === 's1,s2' && L.steps[0].review, '보강 = 스페셜, 첫 몬스터 = 복습');
check(L.theme === '02-deep-forest', '테마 = 깊은 숲');
// PDF 자르기 위치: 개념 설명 칸마다 있고, A4 쪽 안에 들어간다
L.steps.filter((s) => s.kind === 'intro' || s.kind === 'concept').forEach((s) => { const rs = (L.crops || {})[s.id]; check(rs && rs.length && rs.every((r) => r.p >= 1 && r.p <= 2 && r.x >= 0 && r.y >= 0 && r.w > 0.1 && r.h > 0.05 && r.x + r.w <= 1 && r.y + r.h <= 1), `${s.id}: PDF 자르기 위치`); });

// 2. 학습지 첫 시도
const it = (id) => L.items(id, 'x', 0);
check(it('r0')[0].choices[it('r0')[0].answerIndex] === '기준 · 집합' && it('r0')[1].items[0].answer === '∈' && it('r0')[2].items[0].answer === '∉' && same(chosenNums(it('r0')[3]), [1, 2, 3, 6]), '복습: 기준·집합 / 3 ∈ A / 4 ∉ A / {1, 2, 3, 6}');
check(it('m1')[0].answer === 12 && it('m1')[1].answer === 5 && same(chosenNums(it('m1')[2]), [1, 2, 3, 6]) && same(chosenNums(it('m1')[3]), [1, 3, 5, 7, 9]), '문제1: 12 / 5 / {1, 2, 3, 6} / {1, 3, 5, 7, 9}');
check(same(chosenNums(it('s1')[0]), [3, 5]) && it('s1')[1].choices[it('s1')[1].answerIndex] === '{1, 3, 5, …, 99}' && it('s1')[2].answer === 3, '보강1: {3, 5} / {1, 3, 5, …, 99} / 3');
check(it('m2')[0].choices[it('m2')[0].answerIndex] === 'venn:B|1 2 3 6' && same(chosenNums(it('m2')[1]), [2, 4, 6, 8, 10]), '문제2: 벤 B / C = {2, 4, 6, 8, 10}');
check(it('m3')[0].answer === 3 && it('m3')[1].answer === 6 && it('m3')[2].choices[it('m3')[2].answerIndex] === '자연수 전체의 집합', '문제3: 3 / 6 / 자연수 전체');
check(it('m4')[0].choices[it('m4')[0].answerIndex] === '{x | x는 1보다 작은 자연수}' && it('m4')[1].answer === false, '문제4: 공집합 / {0}은 공집합 X');
check(it('s2').map((q) => q.answer).join() === '4,0,2', `보강2: 4 / 0 / 2 (${it('s2').map((q) => q.answer)})`);
Object.keys(L.monsters).forEach((id) => it(id).forEach((q, i) => verify(q, `${id}-${i + 1}`)));

// 3. 재도전
for (const id of Object.keys(L.monsters)) for (let s = 0; s < 300; s++) for (const a of [1, 2, 3]) {
  const items = L.items(id, `seed${s}`, a);
  check(items.length === it(id).length, `${id} 칸 수`);
  items.forEach((q, i) => verify(q, `${id}#${s}/${a}-${i + 1}`));
}
['r0', 'm1', 'm2', 'm3', 's2'].forEach((id) => { const a0 = JSON.stringify(it(id)); check(upto(20).some((s) => JSON.stringify(L.items(id, `q${s}`, 1)) !== a0), `${id}: 재도전 숫자가 바뀜`); });

// 4. 형성평가
const B = L.boss.sets;
check(L.boss.items === 5 && L.boss.hpItems === 5 && B[1].length === 5 && B[2].length === 5, '형성평가 5문항');
check(B[1][0].answerIndex === 1 && same(B[1][1].answer.map((i) => i + 1), [1, 3, 5, 7, 9]) && B[1][2].answerIndex === 0 && B[1][3].answerIndex === 1 && B[1][4].choices[B[1][4].answerIndex] === '0, 1', '세트1 학습지 정답 ② / {1,3,5,7,9} / {a,b,c,d}·4 / ② / 0, 1');
check(same(divs(9), [1, 3, 9]) && B[2][0].answerIndex === 1, '세트2 1번 9의 약수');
check(same(B[2][1].answer.map((i) => i + 1), upto(8).filter((x) => x % 2 === 0)), '세트2 2번 8 이하의 짝수');
check(!upto(2).some((x) => x % 3 === 0) && B[2][3].answerIndex === 2, '세트2 4번 3보다 작은 3의 배수 자연수 → 공집합');
check(B[2][4].choices[B[2][4].answerIndex] === '2, 0', '세트2 5번');
[1, 2].forEach((set) => B[set].forEach((q, i) => { check(Q.grade(q, right(q)), `세트${set} ${i + 1}번 정답 인정`); check(!Q.grade(q, wrong(q)), `세트${set} ${i + 1}번 오답 거부`); }));

if (fail) { console.error(`\n${fail}건 실패`); process.exit(1); }
console.log(`OK: 2차시 v3 — 수업 순서 · 학습지 첫 시도 · 재도전 소문제 ${count}개 독립 검산 · 형성평가 세트1·2 통과`);
