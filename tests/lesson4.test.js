// 4차시 검증: node tests/lesson4.test.js  (학습과정 4차시 레이드용 v2)
// (1) 레이드 순서: 도입 → 복습 → 개념1 → 문제1 → 개념2 → 문제2 → 개념3 → 문제3 → 형성평가 · 보강 3마리는 보강던전(bonus)
// (2) 첫 시도 = 학습지 정답 · 재도전 시드 300개 × 2번 — 원소를 직접 모으고 조건을 직접 계산해 검산 (차시 파일의 계산 결과를 쓰지 않는다)
// (3) 서로소 낱말 문장 묶음: 수 조건은 1~200 에서 직접 확인, 도형은 아래 따로 쓴 참값표로 확인
// (4) 형성평가 세트1·2 (6번 보너스는 a 를 직접 찾아 확인)
const load = require('./load');
const DS = load(['js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/lessons.js', 'lessons/set-04.js']);
const L = DS.Lessons.get('set-04'), Q = DS.Quiz;
let fail = 0, count = 0;
const check = (c, m) => { if (!c) { fail++; if (fail <= 30) console.error('FAIL:', m); } };

// ── 독립 계산 도구 ─────────────────────────────────────────
const upto = (n) => Array.from({ length: n }, (_, i) => i + 1);
const has = (S, x) => S.indexOf(x) >= 0;
const andSet = (A, B) => A.filter((x) => has(B, x)).sort((a, b) => a - b);
const orSet = (A, B) => { const o = A.slice(); B.forEach((x) => { if (!has(o, x)) o.push(x); }); return o.sort((a, b) => a - b); };
const divisorsOf = (n) => upto(n).filter((d) => n % d === 0);
const isPrime = (x) => x > 1 && upto(x - 1).slice(1).every((d) => x % d);
const parseSet = (s) => (s.trim() === '∅' ? [] : s.replace(/[{}]/g, '').split(',').map((t) => Number(t.trim().replace('−', '-'))).sort((a, b) => a - b));
const eq = (A, B) => JSON.stringify(A.slice().sort((a, b) => a - b)) === JSON.stringify(B.slice().sort((a, b) => a - b));
const countSub = (base, must = []) => { let c = 0; for (let m = 0; m < (1 << base.length); m++) { const s = base.filter((_, i) => m & (1 << i)); if (must.every((x) => s.includes(x))) c++; } return c; };
// 서로소 낱말: 수 조건 (자연수 1~200) · 도형 참값표 (교과서 정의로 따로 적음)
const NUM = { 홀수: (x) => x % 2 === 1, 짝수: (x) => x % 2 === 0, 소수: isPrime };
const numCond = (w) => { if (NUM[w]) return NUM[w]; let m = /^(\d+)의 배수$/.exec(w); if (m) return (x) => x % Number(m[1]) === 0; m = /^(\d+)의 약수$/.exec(w); if (m) return (x) => Number(m[1]) % x === 0; return null; };
const SHAPE_DISJOINT = { '정삼각형|직각삼각형': true, '직사각형|마름모': false, '정사각형|직사각형': false, '예각삼각형|둔각삼각형': true };
const disjointWords = (a, b) => { const f = numCond(a), g = numCond(b); if (f && g) return !upto(200).some((x) => f(x) && g(x)); const k = `${a}|${b}`; if (k in SHAPE_DISJOINT) return SHAPE_DISJOINT[k]; throw new Error('참값표에 없는 낱말 ' + k); };

const rightGiven = (p) => (p.type === 'choice' ? p.answerIndex : p.answer);
const wrongGiven = (p) => (p.type === 'ox' ? !p.answer : p.type === 'number' ? p.answer + 1 : p.type === 'choice' ? (p.answerIndex + 1) % p.choices.length : p.type === 'multi' ? p.answer.slice(1) : null);

function verify(q, label) {
  count++;
  const c = q.check || {};
  if (q.type === 'multi') {
    let A = c.a, B = c.b;
    if (c.which) { const Bd = divisorsOf(c.divB), Cd = divisorsOf(c.divC); [A, B] = { AB: [c.A, Bd], AC: [c.A, Cd], BC: [Bd, Cd] }[c.which]; check(eq(A, c.a) && eq(B, c.b), `${label}: 약수 집합 ${c.which}`); }
    const want = c.op === '∩' ? andSet(A, B) : orSet(A, B);
    const opts = c.options;
    check(q.options.join() === opts.map(String).join(), `${label}: 후보 표시`);
    check(want.every((x) => has(opts, x)), `${label}: 정답 원소가 후보에 모두 있음`);
    check(opts.some((x) => !has(orSet(A, B), x)), `${label}: 함정 후보가 있음`);
    check(eq(q.answer.map((i) => opts[i]), want), `${label}: ${q.question} → ${want}`);
    check(want.length > 0, `${label}: 빈 답 없음`);
    if (!c.which) check(q.question.includes(`A = {${A.join(', ')}}`) && q.question.includes(`B = {${B.join(', ')}}`), `${label}: 문제 글의 집합`);
  } else if (q.type === 'ox') {
    let want;
    if (c.a) want = andSet(c.a, c.b).length === 0;
    else if (c.iv) { const ints = ([lo, hi]) => upto(30).map((x) => x - 10).filter((x) => x > lo && x < hi); want = andSet(ints(c.iv[0]), ints(c.iv[1])).length === 0; }
    else if (c.words) want = disjointWords(c.words[0], c.words[1]);
    check(q.answer === want, `${label}: ${q.question} (독립 계산 ${want ? 'O' : 'X'})`);
  } else if (q.type === 'number') {
    let want;
    if (c.nI != null) want = c.nA + c.nB - c.nI;
    else if (c.nU != null) { want = c.nA + c.nB - c.nU; check(want >= 1 && want <= Math.min(c.nA, c.nB) && c.nU <= c.nA + c.nB, `${label}: 가능한 개수`); }
    else if (c.proper) want = countSub(c.base) - 1;
    else if (c.must) want = countSub(c.base, c.must);
    check(q.answer === want, `${label}: ${q.question} = ${q.answer} (독립 계산 ${want})`);
  } else if (q.type === 'choice') {
    const res = c.op === '∩' ? andSet(c.a, c.b) : orSet(c.a, c.b);
    check(c.a.every((x) => has(c.b, x)), `${label}: A ⊂ B`);
    const name = eq(res, c.a) ? 'A' : eq(res, c.b) ? 'B' : '?';
    check(q.choices[q.answerIndex] === name, `${label}: A ${c.op} B 와 같은 집합 = ${name}`);
  } else check(false, `${label}: 알 수 없는 형식 ${q.type}`);
  check(Q.grade(q, rightGiven(q)), `${label}: 정답 인정`);
  check(!Q.grade(q, wrongGiven(q)), `${label}: 오답 거부`);
}

// ── 1. 순서 · 보강던전 · 자르기 위치 ─────────────────────────────
check(L.no === 4 && L.theme === '06-frost', '4차시 · 빙결 동굴');
check(L.steps.map((s) => s.kind).join() === 'intro,monster,concept,monster,concept,monster,concept,monster,boss', `순서 ${L.steps.map((s) => s.kind)}`);
check(L.steps.filter((s) => s.kind === 'monster').map((s) => s.id).join() === 'r1,m1,m2,m3', '레이드 몬스터 = 복습 + 문제 1·2·3');
check(!L.steps.some((s) => s.special), '4차시부터 레이드에 보강 스페셜 없음');
check(L.bonus.map((b) => b.id).join() === 'b1,b2,b3' && L.bonus.every((b) => L.monsters[b.id].bonus && /^c\d$/.test(b.concept)), '보강던전 3마리 · 개념 연결');
[...L.steps.filter((s) => s.kind !== 'monster' || s.id), ...L.bonus].forEach((s) => { const rs = (L.crops || {})[s.id]; check(rs && rs.length && rs.every((r) => r.p >= 1 && r.p <= 2 && r.x >= 0 && r.y >= 0 && r.w > 0.1 && r.h > 0.05 && r.x + r.w <= 1 && r.y + r.h <= 1), `${s.id}: PDF 자르기 위치`); });
check(L.boss.tags.length === L.boss.items && L.boss.tags.every((t) => L.steps.some((s) => s.id === t && s.kind === 'concept')), '형성평가 문항마다 개념 표시');

// ── 2. 첫 시도 = 학습지 정답 ─────────────────────────────────
const sheetAns = {
  r1: [16, 4, 7],
  m1: ['2,4', '1,2,3,4,6,8', '3,9,27', '1,3,9,15,21,27'],
  m2: [true, true],
  m3: [7, 2],
  b1: ['1,2,3,4,5,6', '2,3', '1,2,3,4,5,8', '1,2'],
  b2: [true, false],
  b3: ['A', 'B'],
};
Object.entries(sheetAns).forEach(([id, rows]) => {
  const items = L.items(id, 'x', 0);
  check(items.length === rows.length, `${id} 칸 수 ${items.length}`);
  rows.forEach((want, i) => {
    const q = items[i]; verify(q, `${id}-${i + 1}`);
    const got = q.type === 'multi' ? q.answer.map((k) => q.options[k]).join() : q.type === 'choice' ? q.choices[q.answerIndex] : q.answer;
    check(String(got) === String(want), `${id}-${i + 1} 학습지 정답 ${want} (지금 ${got})`);
  });
});
check(L.items('m2', 'x', 0)[1].check.words.join() === '정삼각형,직각삼각형' && L.items('b2', 'x', 0)[1].check.words.join() === '직사각형,마름모', '학습지 낱말 문항');

// ── 3. 재도전 (시드 300개 × 2번) ─────────────────────────────
for (const id of Object.keys(L.monsters)) {
  const n0 = L.items(id, 'x', 0).length;
  for (let s = 0; s < 300; s++) for (const a of [1, 2]) {
    const items = L.items(id, `seed${s}`, a);
    check(items.length === n0, `${id} 재도전 칸 수`);
    items.forEach((q, i) => verify(q, `${id}#${s}/${a}-${i + 1}`));
    if (s === 0) check(JSON.stringify(L.items(id, `seed${s}`, a)) === JSON.stringify(items), `${id}: 같은 시드 → 같은 문제`);
  }
  const a0 = JSON.stringify(L.items(id, 'q', 0));
  check(upto(20).some((s) => JSON.stringify(L.items(id, `q${s}`, 1)) !== a0), `${id}: 재도전 문제가 바뀜`);
}
// 서로소 O/X 정답이 한쪽으로 쏠리지 않고, 문장 묶음이 골고루 나오는지
const ox = { true: 0, false: 0 }, seen = new Set();
for (let s = 0; s < 300; s++) ['m2', 'b2'].forEach((id) => L.items(id, `t${s}`, 1).forEach((q) => { ox[q.answer]++; if (q.check.words) seen.add(q.check.words.join()); }));
check(ox.true > 150 && ox.false > 150, `서로소 정답 분포 ${JSON.stringify(ox)}`);
check(seen.size === L.WORDS.length, `문장 묶음 ${seen.size} / ${L.WORDS.length} 가지가 나옴`);
L.WORDS.forEach((w) => check(disjointWords(w[0], w[1]) === w[2], `문장 묶음 ${w[0]} · ${w[1]} = ${w[2]}`));

// ── 4. 형성평가 ─────────────────────────────────────────
const B = L.boss.sets;
check(L.boss.items === 6 && L.boss.hpItems === 5 && B[1].length === 6 && B[2].length === 6, '형성평가 6문항 (체력은 1~5번, 6번 보너스)');
for (const set of [1, 2]) {
  const p = B[set];
  const { a, b } = p[0].check, ok = `A ∩ B = {${andSet(a, b).join(', ')}}, A ∪ B = {${orSet(a, b).join(', ')}}`;
  check(p[0].choices[p[0].answerIndex] === ok && p[0].choices.filter((x) => x === ok).length === 1, `세트${set} 1번 ${ok}`);
  const dj = p[1].check.disj.map(([x, y]) => { const px = x.replace(/[{}]/g, '').split(',').map((t) => t.trim()), py = y.replace(/[{}]/g, '').split(',').map((t) => t.trim()); return !px.some((t) => py.includes(t)); });
  check(dj.filter(Boolean).length === 1 && dj.indexOf(true) === p[1].answerIndex, `세트${set} 2번 서로소 하나 ${dj}`);
  check(p[2].answer === p[2].check.nA + p[2].check.nB - p[2].check.nI, `세트${set} 3번`);
  check(p[3].choices[p[3].answerIndex] === (p[3].check.word === '∪' ? '또는' : '그리고'), `세트${set} 4번 그리고/또는`);
  check(p[4].choices[p[4].answerIndex] === (p[4].check.sub === '∩' ? 'A' : 'B'), `세트${set} 5번`);
  // 6번: a 를 −20~20 에서 직접 찾는다 (원소가 서로 다른 집합 · A ∩ B 가 주어진 것과 같음)
  const six = p[5].check.six, sols = [];
  for (let x = -20; x <= 20; x++) { const A = six.fA(x), Bs = six.fB(x); if (new Set(A).size === A.length && new Set(Bs).size === Bs.length && eq(andSet(A, Bs), six.I)) sols.push(orSet(A, Bs)); }
  check(sols.length === 1, `세트${set} 6번 a 가 하나 (${sols.length})`);
  check(sols.length === 1 && eq(parseSet(p[5].choices[p[5].answerIndex]), sols[0]), `세트${set} 6번 A ∪ B = ${sols[0]}`);
  check(p[5].answerIndex !== 0 && p[0].answerIndex !== 0, `세트${set} 정답이 맨 앞에만 있지 않음`);
  p.forEach((q, i) => { check(Q.grade(q, rightGiven(q)), `세트${set} ${i + 1}번 정답 인정`); check(!Q.grade(q, wrongGiven(q)), `세트${set} ${i + 1}번 오답 거부`); });
}
check(B[1][2].answer === 8 && B[1][3].choices[B[1][3].answerIndex] === '또는' && B[1][4].choices[B[1][4].answerIndex] === 'A', '세트1 학습지 정답 3·4·5번 = 8, 또는, A');
check(B[1][1].answerIndex === 1, '세트1 2번 = ②');

if (fail) { console.error(`\n${fail}건 실패`); process.exit(1); }
console.log(`OK: 4차시 레이드용 v2 — 순서 · 보강던전 3마리 · 학습지 첫 시도 · 재도전 소문제 ${count}개 독립 검산 · 문장 묶음 ${L.WORDS.length}가지 · 형성평가 세트1·2 통과`);
