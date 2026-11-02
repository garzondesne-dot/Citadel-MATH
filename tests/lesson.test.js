// 차시 묶음 검증: node tests/lesson.test.js  (3차시 · 학습과정 v4)
// (1) 수업 순서: 도입 → 개념1 → 문제1 → 보강 → 개념2 → 문제2 → 개념3 → 문제3 → 보강 → 형성평가
// (2) 몬스터: 첫 시도(attempt 0)는 학습지 정답과 같다 · 재도전 문제는 시드 300개 × 재도전 3번 — 원소를 직접 세고 조건을 직접 계산해 검산
// (3) 채점기: 정답 인정 · 오답 거부 · 같은 시드 → 같은 문제
// (4) 형성평가 세트1(학습지)·세트2 정답 직접 검산 (7번 보너스 포함)
const load = require('./load');
const DS = load(['js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/lessons.js', 'lessons/set-03.js']);
const L = DS.Lessons.get('set-03'), S = DS.SetGen, Q = DS.Quiz;
let fail = 0, count = 0;
const check = (c, m) => { if (!c) { fail++; if (fail <= 30) console.error('FAIL:', m); } };

// ── 독립 계산 도구 (차시 파일의 원소 목록을 쓰지 않는다) ─────────────
const upto = (n) => Array.from({ length: n }, (_, i) => i + 1);
const isPrime = (x) => x > 1 && upto(x - 1).slice(1).every((d) => x % d !== 0);
const member = (cond, x) => {
  const [kind, n] = cond;
  if (kind === 'mul') return Number.isInteger(x) && x > 0 && x % n === 0;
  if (kind === 'div') return Number.isInteger(x) && x > 0 && n % x === 0;
  if (kind === 'prime') return x <= n && isPrime(x);
  if (kind === 'nat') return Number.isInteger(x) && x >= 1 && x <= n;
  if (kind === 'even') return Number.isInteger(x) && x >= 1 && x <= n && x % 2 === 0;
  if (kind === 'odd') return Number.isInteger(x) && x >= 1 && x <= n && x % 2 === 1;
  if (kind === 'quad') return x * x - n * x === 0;
  throw new Error('조건 ' + kind);
};
const listOf = (cond) => (cond[0] === 'quad' ? [-10, -5, -3, -2, -1, 0, 1, 2, 3, 4, 5, 10].filter((x) => member(cond, x)) : upto(60).filter((x) => member(cond, x)));
const subOk = (A, inB) => A.every(inB);
const parseSet = (s) => (s === '∅' ? [] : s.replace(/[{}]/g, '').split(',').map((t) => t.trim()).filter(Boolean).map((t) => Number(t.replace('−', '-'))));
const rightGiven = (p) => (p.type === 'blanks' ? p.items.map((i) => i.answer) : p.type === 'subsets' ? S.allSubsets(p.base) : p.type === 'choice' ? p.answerIndex : p.answer);
const wrongGiven = (p) => (p.type === 'blanks' ? p.items.map((i) => p.options.find((o) => o !== i.answer)) : p.type === 'ox' ? !p.answer : p.type === 'number' ? p.answer + 1 : p.type === 'choice' ? (p.answerIndex + 1) % p.choices.length : p.type === 'multi' ? p.answer.slice(1) : []);
const pow2 = (n) => 2 ** n;
const countSub = (base, must = [], not = []) => { let c = 0; for (let m = 0; m < (1 << base.length); m++) { const s = base.filter((_, i) => m & (1 << i)); if (must.every((x) => s.includes(x)) && not.every((x) => !s.includes(x))) c++; } return c; };

// 소문제 하나를 독립 검산
function verify(q, label) {
  count++;
  const c = q.check || {};
  if (q.type === 'blanks') {
    const it = q.items[0];
    const A = c.a, inB = c.cond ? (x) => member(c.cond, x) : (x) => c.b.includes(x);
    check(JSON.stringify(parseSet(it.left)) === JSON.stringify(A), `${label}: 왼쪽 집합 표시 ${it.left}`);
    if (c.b) check(JSON.stringify(parseSet(it.right).slice().sort((x, y) => x - y)) === JSON.stringify(c.b.slice().sort((x, y) => x - y)), `${label}: 오른쪽 집합 표시 ${it.right}`);
    let want;
    if (q.options.includes('⊂')) want = subOk(A, inB) ? '⊂' : '⊄';
    else { const B = c.b || listOf(c.cond); want = subOk(A, inB) && B.every((x) => A.includes(x)) ? '=' : '≠'; }
    check(it.answer === want, `${label}: ${it.left} ${it.answer} ${it.right} (독립 계산 ${want})`);
  } else if (q.type === 'multi') {
    const opts = c.options, want = opts.map((s, i) => (s.length === c.size && s.every((x) => c.base.includes(x)) && new Set(s).size === s.length ? i : -1)).filter((i) => i >= 0);
    check(want.length === [1, 3, 3, 1][c.size], `${label}: 원소 ${c.size}개 부분집합 개수`);
    check(JSON.stringify(q.answer) === JSON.stringify(want), `${label}: 골라 담기 정답`);
    check(q.options.length === 10, `${label}: 후보 10개 (정답 8 + 함정 2)`);
  } else if (q.type === 'number') {
    let want;
    if (c.pow != null) want = pow2(c.pow);
    else if (c.proper) want = countSub(c.base) - 1;
    else if (c.base) want = countSub(c.base, c.must || [], c.not || []);
    check(q.answer === want, `${label}: ${q.question} = ${q.answer} (독립 계산 ${want})`);
  } else check(false, `${label}: 알 수 없는 형식 ${q.type}`);
  check(Q.grade(q, rightGiven(q)), `${label}: 정답 인정`);
  check(!Q.grade(q, wrongGiven(q)), `${label}: 오답 거부`);
}

// ── 1. 수업 순서 ─────────────────────────────────────────
check(L.steps.map((s) => s.kind).join() === 'intro,concept,monster,monster,concept,monster,concept,monster,monster,boss', `순서 ${L.steps.map((s) => s.kind)}`);
check(L.steps.filter((s) => s.kind === 'monster').map((s) => s.id).join() === 'm1,s1,m2,m3,s2', '몬스터 순서');
// PDF 자르기 위치: 개념 설명 칸마다 있고, A4 쪽 안에 들어간다
L.steps.filter((s) => s.kind === 'intro' || s.kind === 'concept').forEach((s) => { const rs = (L.crops || {})[s.id]; check(rs && rs.length && rs.every((r) => r.p >= 1 && r.p <= 2 && r.x >= 0 && r.y >= 0 && r.w > 0.1 && r.h > 0.05 && r.x + r.w <= 1 && r.y + r.h <= 1), `${s.id}: PDF 자르기 위치`); });
check(L.steps.filter((s) => s.special).map((s) => s.id).join() === 's1,s2', '보강 = 스페셜 몬스터');
check(L.defaultPct === 90, '기준% 기본값 90');

// ── 2. 첫 시도 = 학습지 정답 ─────────────────────────────────
const sheet = {
  m1: [['{1, 2}', '⊂'], ['{2, 5}', '⊄'], ['{3, 6}', '⊂'], ['{2, 3, 5}', '⊂']],
  s1: [['{1, 5, 25}', '⊂'], ['{−2, 0, 2}', '⊄'], ['{2, 3, 5, 7}', '⊂']],
  m2: [['{2, 4, 6}', '='], ['{1, 2, 4}', '='], ['{2, 4, 6}', '≠']],
};
Object.entries(sheet).forEach(([id, rows]) => {
  const items = L.items(id, 'x', 0);
  check(items.length === rows.length, `${id} 칸 수`);
  rows.forEach(([left, ans], i) => { check(items[i].items[0].left === left && items[i].items[0].answer === ans, `${id}-${i + 1} 학습지 ${left} ${ans}`); verify(items[i], `${id}-${i + 1}`); });
});
const m3 = L.items('m3', 'x', 0);
check(m3.length === 6 && m3[4].answer === 8 && m3[5].answer === 7, '문제3: 6칸, 부분집합 8개 · 진부분집합 7개');
m3.forEach((q, i) => verify(q, `m3-${i + 1}`));
check(m3[0].answer.map((k) => m3[0].options[k]).join('|') === '∅', '문제3 0개 줄 = ∅');
check(m3[2].answer.map((k) => m3[2].options[k]).sort().join('|') === '{1, 2}|{1, 3}|{2, 3}', '문제3 2개 줄');
const s2 = L.items('s2', 'x', 0);
check(s2.map((q) => q.answer).join() === '16,16,8,8', `보강 개수 규칙 학습지 정답 ${s2.map((q) => q.answer)}`);
s2.forEach((q, i) => verify(q, `s2-${i + 1}`));

// ── 3. 재도전 문제 (숫자가 바뀜) ───────────────────────────────
for (const id of Object.keys(L.monsters)) {
  for (let s = 0; s < 300; s++) for (const a of [1, 2, 3]) {
    const items = L.items(id, `seed${s}`, a);
    check(items.length === L.items(id, 'x', 0).length, `${id} 재도전 칸 수`);
    items.forEach((q, i) => verify(q, `${id}#${s}/${a}-${i + 1}`));
    if (s === 0) check(JSON.stringify(L.items(id, `seed${s}`, a)) === JSON.stringify(items), `${id}: 같은 시드 → 같은 문제`);
  }
}
// 재도전은 정말 숫자가 바뀌는지 (학습지와 다른 문제가 나와야)
['m1', 's1', 'm2', 'm3'].forEach((id) => { const a0 = JSON.stringify(L.items(id, 'q', 0)); check(upto(20).some((s) => JSON.stringify(L.items(id, `q${s}`, 1)) !== a0), `${id}: 재도전 숫자가 바뀜`); });
// ⊂·⊄ / =·≠ 정답이 한쪽으로 쏠리지 않는지
const tally = {};
for (let s = 0; s < 300; s++) for (const id of ['m1', 's1', 'm2']) L.items(id, `t${s}`, 1).forEach((q) => { const k = q.items[0].answer; tally[k] = (tally[k] || 0) + 1; });
['⊂', '⊄', '=', '≠'].forEach((k) => check((tally[k] || 0) > 100, `재도전 정답 분포 ${JSON.stringify(tally)}`));

// ── 4. 형성평가 ─────────────────────────────────────────
const B = L.boss.sets;
check(L.boss.items === 7 && L.boss.hpItems === 6 && B[1].length === 7 && B[2].length === 7, '형성평가 7문항 (체력은 1~6번)');
for (const set of [1, 2]) {
  const p = B[set];
  p[0].check.pairs.forEach(([A, Bs], k) => check(p[0].items[k].answer === (A.every((x) => Bs.includes(x)) ? '⊂' : '⊄'), `세트${set} 1번 (${k + 1})`));
  const bad = p[1].check.judge.map((s) => { const m = s.match(/^(.+?) (∈|⊂) (.+)$/); const left = m[1], right = parseSet(m[3]); if (m[2] === '∈') return !left.startsWith('{') && right.includes(Number(left)); return left === '∅' || (left.startsWith('{') && parseSet(left).every((x) => right.includes(x))); }).map((ok, i) => (ok ? -1 : i)).filter((i) => i >= 0);
  check(bad.length === 1 && bad[0] === p[1].answerIndex, `세트${set} 2번 옳지 않은 것 ${bad}`);
  const ds = listOf(p[2].check.cond);
  check(p[2].items[0].answer === (JSON.stringify(ds) === JSON.stringify(p[2].check.b) ? '=' : '≠'), `세트${set} 3번`);
  check(Q.grade(p[3], S.allSubsets(p[3].base)) && !Q.grade(p[3], S.allSubsets(p[3].base).slice(1)), `세트${set} 4번 부분집합 모두`);
  check(p[4].answer === countSub(p[4].check.base) - 1, `세트${set} 5번 진부분집합 개수`);
  const sb = p[5].check.solveB; check(p[5].answer === sb.find((x) => x !== 1), `세트${set} 6번 a`);
  check(p[6].answer === countSub(p[6].check.base, p[6].check.must, p[6].check.not), `세트${set} 7번 (보강·도전) ${p[6].answer}`);
  p.forEach((q, i) => { check(Q.grade(q, rightGiven(q)), `세트${set} ${i + 1}번 정답 인정`); check(!Q.grade(q, wrongGiven(q)), `세트${set} ${i + 1}번 오답 거부`); });
}
check(B[1].map((q) => rightGiven(q)).slice(4).join() === '3,3,16', '세트1 학습지 정답 5·6·7번 = 3, 3, 16');
check(B[2][6].answer === 8, '세트2 7번 새 문항 = 2⁶⁻³ = 8');

if (fail) { console.error(`\n${fail}건 실패`); process.exit(1); }
console.log(`OK: 3차시 v4 — 수업 순서 · 학습지 첫 시도 · 재도전 소문제 ${count}개 독립 검산 · 형성평가 세트1·2 (7번 보너스) 통과`);
