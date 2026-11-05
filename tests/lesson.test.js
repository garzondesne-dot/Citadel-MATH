// 차시 묶음 검증: node tests/lesson.test.js  (3차시 · 레이드용 v5)
// (1) 수업 순서: 도입 → 개념1 → 문제1 → 개념2 → 문제2 → 개념3 → 문제3 → 개념4 → 문제4 → 형성평가
// (2) 몬스터: 첫 시도(attempt 0)는 학습지 정답과 같다 · 재도전 문제는 시드 300개 × 재도전 3번 — 원소를 직접 세고 조건을 직접 계산해 검산
// (3) 채점기: 정답 인정 · 오답 거부 · 같은 시드 → 같은 문제
// (4) 형성평가 세트1(학습지)·세트2 정답 직접 검산 (7번 보너스 포함)
// (5) 형성평가 재도전 생성기 L.boss.make — 7문항 × 시드 300개 × 재도전 3번, 문제 글자 · check 로 정답을 독립 계산 · 보기 판정 · 서로 가리킴 없음 · 문제 다양성
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
    // leftCond: 왼쪽이 조건제시법 (v5 문제 1 (5)) → 왼쪽 원소를 직접 풀어 구한다
    const A = c.leftCond ? listOf(c.leftCond) : c.a, inB = c.cond ? (x) => member(c.cond, x) : (x) => c.b.includes(x);
    if (c.leftCond) check(it.left === `{x | ${c.leftCond[1] === 1 ? 'x² − x = 0' : `x² − ${c.leftCond[1]}x = 0`}}`, `${label}: 왼쪽 조건 표시 ${it.left}`);
    else check(JSON.stringify(parseSet(it.left)) === JSON.stringify(A), `${label}: 왼쪽 집합 표시 ${it.left}`);
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
check(L.steps.map((s) => s.kind).join() === 'intro,concept,monster,concept,monster,concept,monster,concept,monster,boss', `순서 ${L.steps.map((s) => s.kind)}`);
check(L.steps.filter((s) => s.kind === 'monster').map((s) => s.id).join() === 'm1,m2,m3,m4', '몬스터 순서 (v5: 보강 삭제 · 개수 규칙 = 문제 4)');
// PDF 자르기 위치: 개념 설명 칸마다 있고, A4 쪽 안에 들어간다
L.steps.filter((s) => s.kind === 'intro' || s.kind === 'concept').forEach((s) => { const rs = (L.crops || {})[s.id]; check(rs && rs.length && rs.every((r) => r.p >= 1 && r.p <= 2 && r.x >= 0 && r.y >= 0 && r.w > 0.1 && r.h > 0.05 && r.x + r.w <= 1 && r.y + r.h <= 1), `${s.id}: PDF 자르기 위치`); });
check(!L.steps.some((s) => s.special), 'v5: 스페셜(보강) 몬스터 없음');
check(L.defaultPct === 90, '기준% 기본값 90');

// ── 2. 첫 시도 = 학습지 정답 ─────────────────────────────────
const sheet = {
  m1: [['{1, 2}', '⊂'], ['{2, 5}', '⊄'], ['{3, 6}', '⊂'], ['{2, 3, 5}', '⊂'], ['{x | x² − 2x = 0}', '⊂']],
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
const m4 = L.items('m4', 'x', 0);
check(m4.map((q) => q.answer).join() === '16,16,8,8', `문제 4 개수 규칙 학습지 정답 ${m4.map((q) => q.answer)}`);
m4.forEach((q, i) => verify(q, `m4-${i + 1}`));

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
['m1', 'm2', 'm3', 'm4'].forEach((id) => { const a0 = JSON.stringify(L.items(id, 'q', 0)); check(upto(20).some((s) => JSON.stringify(L.items(id, `q${s}`, 1)) !== a0), `${id}: 재도전 숫자가 바뀜`); });
// ⊂·⊄ / =·≠ 정답이 한쪽으로 쏠리지 않는지
const tally = {};
for (let s = 0; s < 300; s++) for (const id of ['m1', 'm2']) L.items(id, `t${s}`, 1).forEach((q) => { const k = q.items[0].answer; tally[k] = (tally[k] || 0) + 1; });
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

// ── 5. 형성평가 재도전 생성기 L.boss.make(i, attempt, rng) (2026-11-05: 문항마다 4번 — 0번째 학습지 · 1~3번째 새 문제) ──
// 정답은 문제 글자 · check 에서 원소를 직접 세고 풀어 다시 구한다 (생성기의 정답 변수를 쓰지 않는다)
check(typeof L.boss.make === 'function', '형성평가 재도전 생성기 L.boss.make 있음');
const set1Before = JSON.stringify(B[1]);
const SHEET_Q = ['1. □ 안에 ⊂ 또는 ⊄ 를 쓰시오.', '2. 다음 중 옳지 않은 것은?', '3. □ 안에 = 또는 ≠ 를 쓰시오.', '4. 집합 {5, 7} 의 부분집합을 모두 쓰시오.', '5. 집합 {5, 7} 의 진부분집합의 개수는?',
  '6. [도전] 두 집합 A = {1, a}, B = {1, 3} 에 대하여 A ⊂ B 이고 B ⊂ A 일 때, a 의 값은?', '7. [도전] 집합 {1, 2, 3, 4, 5, 6, 7} 의 부분집합 중에서 2와 6을 반드시 포함하고 5는 포함하지 않는 부분집합의 개수는?'];
SHEET_Q.forEach((t, i) => check(B[1][i].question === t && L.boss.make(i, 0, DS.Rng('z')) === B[1][i], `형성평가 ${i + 1}번: 0번째 시도 = 학습지 그대로 (세트1)`));
const tok = (t) => (/^−?\d+$/.test(t) ? Number(t.replace('−', '-')) : t);
const parseAny = (s) => (s === '∅' ? [] : s.replace(/[{}]/g, '').split(',').map((t) => t.trim()).filter(Boolean).map(tok));
const sameAs = (a, b) => a.length === b.length && a.every((x) => b.includes(x)) && b.every((x) => a.includes(x));
const allSubs = (base) => { const out = []; for (let m = 0; m < (1 << base.length); m++) out.push(base.filter((_, k) => m & (1 << k))); return out; };
const condText = ([kind, n]) => ({ div: `x는 ${n}의 약수`, prime: `x는 ${n} 이하의 소수`, even: `x는 ${n} 이하의 짝수`, odd: `x는 ${n} 이하의 홀수` })[kind];
// 문장 하나 판정: "왼쪽 ∈|⊂ 오른쪽" — ∈ 는 왼쪽이 원소, ⊂ 는 왼쪽이 집합(∅ 포함)일 때만 뜻이 있다
const judgeStmt = (s) => {
  const m = s.match(/^(.+?) (∈|⊂) (\{.+\})$/); if (!m) return null;
  const left = m[1], right = parseAny(m[3]), isSet = left === '∅' || left.startsWith('{');
  return m[2] === '∈' ? !isSet && right.includes(tok(left)) : isSet && parseAny(left).every((x) => right.includes(x));
};
const display = (q) => [q.question, ...(q.items || []).map((it) => `${it.left} □ ${it.right}`), ...(q.choices || [])].join(' / ');
const sigOf = (q) => JSON.stringify([q.question, (q.items || []).map((it) => `${it.left}|${it.right}`).sort(), (q.choices || []).map((c) => c.slice(2)).sort(), q.base || null]);
let bossGen = 0;
for (let i = 0; i < 7; i++) {
  const texts = new Set(), answers = new Set(), sheetSig = sigOf(B[1][i]);
  for (let k = 0; k < 300; k++) for (const a of [1, 2, 3]) {
    const lab = `형성평가 ${i + 1}번 #${k}/${a}`, q = L.boss.make(i, a, DS.Rng(`s${k}|boss|${i}|${a}`)), c = q.check || {};
    bossGen++;
    check(q.type === B[1][i].type, `${lab}: 형식 ${q.type} = 학습지 ${B[1][i].type}`);
    check(q.question.startsWith(`${i + 1}. `) && q.solution && q.solution.length > 5, `${lab}: 번호 · 해설`);
    check(!/위 |번의/.test(q.question + ' ' + (q.choices || []).join(' ')), `${lab}: 다른 문항을 가리키지 않음 ${q.question}`);
    check(sigOf(q) !== sheetSig, `${lab}: 학습지와 같은 문제가 아님`);
    let right, wrongs = [];
    if (i === 0) { // ⊂/⊄ 두 칸: 왼쪽 원소가 모두 오른쪽에 있는지 직접 확인
      check(q.items.length === 2 && JSON.stringify(q.options) === JSON.stringify(['⊂', '⊄']), `${lab}: 두 칸 · 기호 ⊂ ⊄`);
      q.items.forEach((it, j) => {
        const A = parseAny(it.left), Bs = parseAny(it.right);
        check(sameAs(A, c.pairs[j][0]) && sameAs(Bs, c.pairs[j][1]), `${lab}: (${j + 1}) 화면 집합 = check`);
        check(it.answer === (A.every((x) => Bs.includes(x)) ? '⊂' : '⊄'), `${lab}: ${it.left} ${it.answer} ${it.right}`);
      });
      check(q.items.map((it) => it.answer).sort().join() === '⊂,⊄', `${lab}: ⊂ 한 칸 · ⊄ 한 칸 (학습지와 같은 난이도)`);
      right = q.items.map((it) => it.answer); wrongs = [right.map((x) => (x === '⊂' ? '⊄' : '⊂')), [right[0], right[1] === '⊂' ? '⊄' : '⊂']];
    } else if (i === 1) { // 옳지 않은 것: 보기 글자를 직접 판정
      const body = q.choices.map((ch, j) => { check(ch.startsWith(`${'①②③④'[j]} `), `${lab}: 보기 번호 ①②③④ 순서`); return ch.slice(2); });
      check(JSON.stringify(body) === JSON.stringify(c.judge), `${lab}: check.judge = 보기 글자`);
      const bad = body.map((s, j) => (judgeStmt(s) === false ? j : -1)).filter((j) => j >= 0);
      check(body.every((s) => judgeStmt(s) !== null) && bad.length === 1 && bad[0] === q.answerIndex && q.answer === q.choices[q.answerIndex], `${lab}: 옳지 않은 것 ${bad} (정답 ${q.answerIndex}) ${body.join(' | ')}`);
      check(q.choices.length === 4 && new Set(body).size === 4, `${lab}: 보기 4개 서로 다름`);
      right = q.answerIndex; wrongs = [0, 1, 2, 3].filter((j) => j !== q.answerIndex);
    } else if (i === 2) { // =/≠: 조건제시법을 직접 풀어 원소나열법과 비교
      const it = q.items[0];
      check(q.items.length === 1 && it.left === `{x | ${condText(c.cond)}}`, `${lab}: 왼쪽 조건 ${it.left}`);
      check(sameAs(parseAny(it.right), c.b), `${lab}: 오른쪽 집합 = check`);
      check(it.answer === (sameAs(listOf(c.cond), parseAny(it.right)) ? '=' : '≠'), `${lab}: ${it.left} ${it.answer} ${it.right}`);
      right = [it.answer]; wrongs = [[it.answer === '=' ? '≠' : '=']];
    } else if (i === 3) { // 부분집합 모두: 원소 2개 · 직접 만든 부분집합 4개로 채점
      check(q.base.length === 2 && q.question === `4. 집합 {${q.base.join(', ')}} 의 부분집합을 모두 쓰시오.`, `${lab}: 원소 2개 집합 ${q.question}`);
      right = allSubs(q.base); check(right.length === 4, `${lab}: 부분집합 4개`);
      wrongs = [right.slice(1), right.slice(0, 3), [...right, [q.base[0]]]];
    } else if (i === 4) { // 진부분집합의 개수 = 부분집합을 직접 세고 − 1
      check(q.question === `5. 집합 {${c.base.join(', ')}} 의 진부분집합의 개수는?` && c.proper && c.base.length >= 2 && c.base.length <= 3, `${lab}: ${q.question}`);
      right = allSubs(c.base).filter((s) => s.length < c.base.length).length; check(q.answer === right, `${lab}: 진부분집합 ${q.answer} (직접 ${right})`);
      wrongs = [right + 1, 2 ** c.base.length, right - 1];
    } else if (i === 5) { // a 의 값: 화면의 A, B 를 읽어 A = B 가 되는 a 를 1~20 에서 직접 찾는다
      const m = q.question.match(/A = \{(.+?)\}, B = (\{.+?\})/), Aknown = m[1].split(', ').filter((t) => t !== 'a').map(tok), Bs = parseAny(m[2]);
      check(m[1].split(', ').filter((t) => t === 'a').length === 1 && sameAs(Bs, c.solveB) && sameAs(Aknown, c.known), `${lab}: 화면 A, B = check`);
      const sols = upto(20).filter((x) => !Aknown.includes(x) && sameAs([...Aknown, x], Bs));
      check(sols.length === 1 && q.answer === sols[0], `${lab}: a = ${q.answer} (직접 ${sols})`);
      right = q.answer; wrongs = [right + 1, Aknown[0]];
    } else { // 반드시 포함 · 포함하지 않음: 부분집합을 직접 세기
      check(q.question.startsWith(`7. [도전] 집합 {${c.base.join(', ')}} 의 부분집합 중에서 `) && c.must.length + c.not.length >= 2 && c.must.every((x) => q.question.includes(String(x))), `${lab}: ${q.question}`);
      check(c.must.every((x) => c.base.includes(x) && !c.not.includes(x)) && c.not.every((x) => c.base.includes(x)), `${lab}: 정해진 원소는 집합 안 · 겹치지 않음`);
      right = countSub(c.base, c.must, c.not); check(q.answer === right, `${lab}: ${q.answer} (직접 ${right})`);
      wrongs = [right + 1, right * 2, 2 ** c.base.length];
    }
    check(Q.grade(q, right), `${lab}: 정답 인정`);
    wrongs.forEach((w, j) => check(!Q.grade(q, w), `${lab}: 오답 ${j + 1} 거부 ${JSON.stringify(w)}`));
    texts.add(display(q)); answers.add(JSON.stringify(right));
    if (k === 0) check(JSON.stringify(L.boss.make(i, a, DS.Rng(`s${k}|boss|${i}|${a}`))) === JSON.stringify(q), `${lab}: 같은 시드 → 같은 문제`);
  }
  check(texts.size >= 5, `형성평가 ${i + 1}번: 재도전 문제가 여러 가지 (${texts.size}가지)`);
  if (i === 1 || i === 4 || i === 6) check(answers.size >= 2, `형성평가 ${i + 1}번: 정답이 한 가지로 고정되지 않음 (${answers.size})`);
  // 재대결은 4번째 판 이후도 부를 수 있다 (bonus.js) → 그때도 문항이 나온다
  check([4, 5, 9].every((a) => { const q = L.boss.make(i, a, DS.Rng(`x|boss|${i}|${a}`)); return q && Q.grade(q, q.type === 'blanks' ? q.items.map((it) => it.answer) : q.type === 'subsets' ? allSubs(q.base) : q.type === 'choice' ? q.answerIndex : q.answer); }), `형성평가 ${i + 1}번: 4번째 이후 시도`);
}
// 같은 학생 · 같은 문항이라도 시도마다 대체로 다른 문제
for (let i = 0; i < 7; i++) {
  let diff = 0;
  for (let k = 0; k < 100; k++) { const t = [1, 2, 3].map((a) => display(L.boss.make(i, a, DS.Rng(`d${k}|boss|${i}|${a}`)))); if (new Set(t).size === 3) diff++; }
  check(diff >= (i === 3 ? 70 : 80), `형성평가 ${i + 1}번: 재도전 1·2·3번이 서로 다른 문제 ${diff}/100`);
}
// 정답 쏠림 없음: 1번 ⊂ 칸 위치 · 2번 정답 번호 · 3번 =/≠
const pos = { first: 0, idx: [0, 0, 0, 0], eq: 0 };
for (let k = 0; k < 300; k++) {
  if (L.boss.make(0, 1, DS.Rng(`b${k}|boss|0|1`)).items[0].answer === '⊂') pos.first++;
  pos.idx[L.boss.make(1, 1, DS.Rng(`b${k}|boss|1|1`)).answerIndex]++;
  if (L.boss.make(2, 1, DS.Rng(`b${k}|boss|2|1`)).items[0].answer === '=') pos.eq++;
}
check(pos.first > 90 && pos.first < 210 && pos.idx.every((n) => n > 40) && pos.eq > 100 && pos.eq < 200, `형성평가 재도전 정답 분포 ${JSON.stringify(pos)}`);
check(JSON.stringify(B[1]) === set1Before, '생성기를 불러도 학습지 세트1 은 바뀌지 않음');

if (fail) { console.error(`\n${fail}건 실패`); process.exit(1); }
console.log(`OK: 3차시 v5 — 수업 순서 · 학습지 첫 시도 · 재도전 소문제 ${count}개 독립 검산 · 형성평가 세트1·2 (7번 보너스) · 형성평가 재도전 생성기 ${bossGen}문항 독립 검산 통과`);
