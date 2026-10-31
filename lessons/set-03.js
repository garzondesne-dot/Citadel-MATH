// 공통수학2 Ⅱ-1 집합 · 3차시 「집합 사이의 포함 관계」 (학습과정 3차시 v4 기준, 2026-10-31 사용자 컨펌)
// 수업 순서: 도입 → 개념1 → 문제1 → 보강 → 개념2 → 문제2 → 개념3 → 문제3 → 보강 → 형성평가(보스)
// 몬스터 = 학습지 문제 묶음. 소문제 하나 = 체력 한 칸. 첫 시도(attempt 0)는 학습지 그대로, 재도전은 소문제 전부 새 숫자.
// 이 수업에서 ⊂ 는 서로 같은 집합도 포함하는 부분집합 기호다 (학습지와 같음).
// 모든 정답은 tests/lesson.test.js 에서 원소를 직접 세거나 조건을 직접 계산해 검산한다 (check 정보 사용).
(function () {
  const S = DS.SetGen;
  const st = (a) => S.setStr(a);
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const sorted = (a) => a.slice().sort((x, y) => x - y);

  // 조건제시법: 글자와 원소 목록 (원소 목록은 화면 해설용. 테스트는 조건을 따로 다시 계산한다)
  const COND = {
    mul: { text: (k) => `x는 ${k}의 배수` },
    div: { text: (n) => `x는 ${n}의 약수`, els: (n) => range(1, n).filter((x) => n % x === 0) },
    prime: { text: (n) => `x는 ${n} 이하의 소수`, els: (n) => range(2, n).filter((x) => range(2, x - 1).every((d) => x % d)) },
    nat: { text: (n) => `x는 ${n} 이하의 자연수`, els: (n) => range(1, n) },
    even: { text: (n) => `x는 ${n} 이하의 짝수`, els: (n) => range(1, n).filter((x) => x % 2 === 0) },
    odd: { text: (n) => `x는 ${n} 이하의 홀수`, els: (n) => range(1, n).filter((x) => x % 2 === 1) },
    quad: { text: (k) => (k === 1 ? 'x² − x = 0' : `x² − ${k}x = 0`), els: (k) => [0, k] },
  };
  const cond = (kind, n) => `{x | ${COND[kind].text(n)}}`;

  // 소문제 한 칸: □ 안에 기호 하나
  const SUBQ = '□ 안에 ⊂ 또는 ⊄ 를 쓰시오.', EQQ = '□ 안에 = 또는 ≠ 를 쓰시오.';
  const sym = (question, left, right, answer, options, solution, check) => ({ type: 'blanks', question, items: [{ left, right, answer }], options, solution, check });
  const subAns = (A, B) => (S.isSubset(A, B) ? '⊂' : '⊄');
  const subSol = (A, B, pre = '') => {
    const out = A.filter((x) => !B.includes(x));
    return pre + (out.length ? `${out.map(S.num).join(', ')} 이(가) 오른쪽 집합에 없다 → ⊄ (원소가 하나라도 빠지면 부분집합이 아니다)` : `${A.map(S.num).join(', ')} 모두 오른쪽 집합에 있다 → ⊂`);
  };

  // ── 재도전 문제 만들기 (시드 → 같은 문제) ─────────────────────
  // 문제1·한 걸음 더: ⊂ / ⊄
  function genExplicit(r) {
    const s = r.int(1, 5), B = range(s, s + r.int(2, 3));
    let A = sorted(r.shuffle(B).slice(0, 2));
    if (r() < 0.5) A = sorted([A[0], B[B.length - 1] + r.int(1, 3)]);
    return sym(SUBQ, st(A), st(B), subAns(A, B), S.SUB, subSol(A, B), { a: A, b: B });
  }
  function genMul(r) {
    const k = r.pick([2, 3, 4, 5]), i = r.int(1, 3), j = r.int(i + 1, 5);
    const A = r() < 0.5 ? [k * i, k * j] : [k * i, k * i + 1];
    const els = A.filter((x) => x % k === 0);
    return sym(SUBQ, st(A), cond('mul', k), els.length === A.length ? '⊂' : '⊄', S.SUB, subSol(A, els, `${k}의 배수인지 하나씩 확인 → `), { a: A, cond: ['mul', k] });
  }
  function genFinite(r, kinds) {
    const [kind, n] = r.pick(kinds), B = COND[kind].els(n);
    const size = Math.min(B.length, r.int(2, 3));
    let A = sorted(r.shuffle(B).slice(0, size));
    if (r() < 0.5) {
      const out = range(1, n + 2).filter((x) => !B.includes(x));
      A = sorted([...A.slice(0, size - 1), r.pick(out)]);
    }
    return sym(SUBQ, st(A), cond(kind, n), subAns(A, B), S.SUB, subSol(A, B, `${cond(kind, n)} = ${st(B)} → `), { a: A, cond: [kind, n] });
  }
  function genQuad(r) {
    const k = r.int(1, 5), B = [0, k];
    const A = r.pick([[-k, 0, k], [0, k], [0], [k], [0, k, 2 * k]]);
    return sym(SUBQ, st(A), cond('quad', k), subAns(A, B), S.SUB, subSol(A, B, `x(x − ${k}) = 0 → ${st(B)} → `), { a: A, cond: ['quad', k] });
  }
  function genNat(r) {
    const n = r.int(4, 9), B = range(1, n);
    let A = sorted(r.shuffle(B).slice(0, r.int(2, 4)));
    if (r() < 0.5) A = sorted([...A.slice(1), r.pick([0, n + 1])]);
    return sym(SUBQ, st(A), cond('nat', n), subAns(A, B), S.SUB, subSol(A, B, `${cond('nat', n)} = ${st(B)} → `), { a: A, cond: ['nat', n] });
  }
  // 문제2: = / ≠
  const eqSol = (A, B, pre = '') => pre + (S.sameSet(A, B) ? '원소가 모두 같다 → =' : '원소가 다르다 → ≠');
  function genPerm(r) {
    const A = sorted(r.shuffle(range(1, 9)).slice(0, 3));
    let B = r.shuffle(A);
    if (B.join() === A.join()) B = [A[2], A[0], A[1]];
    if (r() < 0.5) { const other = r.pick(range(1, 9).filter((x) => !A.includes(x))); B = B.map((x, i) => (i === 0 ? other : x)); }
    return sym(EQQ, st(A), st(B), S.sameSet(A, B) ? '=' : '≠', S.EQ, eqSol(A, B, S.sameSet(A, B) ? '순서만 다르다 → ' : ''), { a: A, b: B });
  }
  function genDivEq(r) {
    const n = r.pick([4, 6, 9, 10, 14, 15, 25]), B = COND.div.els(n);
    let A = B.slice();
    if (r() < 0.5) A = r() < 0.5 ? B.slice(0, -1) : sorted([...B, r.pick(range(2, n).filter((x) => !B.includes(x)))]);
    return sym(EQQ, st(A), cond('div', n), S.sameSet(A, B) ? '=' : '≠', S.EQ, eqSol(A, B, `${cond('div', n)} = ${st(B)} → `), { a: A, cond: ['div', n] });
  }
  function genParityEq(r) {
    const kind = r.pick(['even', 'odd']), n = r.int(5, 10), B = COND[kind].els(n);
    const A = r() < 0.5 ? B.slice() : B.slice(0, -1);
    return sym(EQQ, st(A), cond(kind, n), S.sameSet(A, B) ? '=' : '≠', S.EQ, eqSol(A, B, `${cond(kind, n)} = ${st(B)} → `), { a: A, cond: [kind, n] });
  }
  // 문제3: 부분집합 표 (줄마다 골라 담기) + 개수 2개
  function subsetTable(base, r) {
    const all = S.allSubsets(base);
    const outs = range(0, 9).filter((x) => !base.includes(x));
    const d1 = [r.pick(outs)], d2 = sorted([base[0], r.pick(outs.filter((x) => x !== d1[0]))]);
    const pool = [...all, d1, d2];
    const rows = [0, 1, 2, 3].map((k) => {
      const opts = r.shuffle(pool);
      const answer = opts.map((s, i) => (all.some((t) => S.key(t) === S.key(s)) && s.length === k ? i : -1)).filter((i) => i >= 0);
      const want = all.filter((s) => s.length === k).map(st).join(', ');
      return { type: 'multi', question: `A = ${st(base)} 의 부분집합 중 원소를 ${k}개 고른 것을 모두 고르시오.`, options: opts.map(st), answer,
        solution: `원소 ${k}개 → ${want}`, check: { base, size: k, options: opts } };
    });
    return [...rows,
      S.number(`A = ${st(base)} 의 부분집합의 개수는?`, 8, '0개 1 + 1개 3 + 2개 3 + 3개 1 = 8개', { base }),
      S.number(`A = ${st(base)} 의 진부분집합의 개수는?`, 7, '부분집합 8개 − 자기 자신 1개 = 7개', { base, proper: true })];
  }
  // 보강: 부분집합의 개수 규칙
  const LET = ['a', 'b', 'c', 'd', 'e'];
  function countRule(m, n, letter) {
    const base = LET.slice(0, n), sb = `{${base.join(', ')}}`;
    return [
      S.number(`원소 1개 → 2개, 2개 → 4개, 3개 → 8개 일 때, 원소 ${m}개 → ?개`, 2 ** m, `원소가 하나 늘 때마다 2배 → 2${'⁰¹²³⁴⁵⁶⁷⁸⁹'[m]} = ${2 ** m}`, { pow: m }),
      S.number(`집합 ${sb} 의 부분집합의 개수는?`, 2 ** n, `원소 ${n}개 → 2${'⁰¹²³⁴⁵⁶⁷⁸⁹'[n]} = ${2 ** n}`, { base }),
      S.number(`위 집합에서 ${letter}를 반드시 포함하는 부분집합의 개수는?`, 2 ** (n - 1), `${letter}는 정해졌으니 나머지 ${n - 1}개만 → ${2 ** (n - 1)}`, { base, must: [letter] }),
      S.number(`위 집합에서 ${letter}를 포함하지 않는 부분집합의 개수는?`, 2 ** (n - 1), `${letter}를 빼고 나머지 ${n - 1}개만 → ${2 ** (n - 1)}`, { base, not: [letter] }),
    ];
  }

  // ── 몬스터 (학습지 순서) ─────────────────────────────────────
  // make(attempt, rng) → 소문제 배열. attempt 0 = 학습지 그대로
  const MONSTERS = {
    m1: { title: '문제 1', sprite: 0, make: (a, r) => (a === 0 ? [
      sym(SUBQ, '{1, 2}', '{1, 2, 3}', '⊂', S.SUB, '1, 2 모두 {1, 2, 3} 에 있다 → ⊂', { a: [1, 2], b: [1, 2, 3] }),
      sym(SUBQ, '{2, 5}', '{1, 2, 3, 4}', '⊄', S.SUB, '5 가 {1, 2, 3, 4} 에 없다 → ⊄ (하나라도 빠지면 부분집합이 아니다)', { a: [2, 5], b: [1, 2, 3, 4] }),
      sym(SUBQ, '{3, 6}', cond('mul', 3), '⊂', S.SUB, '3, 6 모두 3의 배수 → ⊂', { a: [3, 6], cond: ['mul', 3] }),
      sym(SUBQ, '{2, 3, 5}', cond('prime', 10), '⊂', S.SUB, `${cond('prime', 10)} = {2, 3, 5, 7} → 모두 있다 → ⊂`, { a: [2, 3, 5], cond: ['prime', 10] }),
    ] : [genExplicit(r), genExplicit(r), genMul(r), genFinite(r, [['prime', 10], ['div', 12], ['odd', 9], ['even', 10], ['div', 18]])]) },
    s1: { title: '보강 · 한 걸음 더', special: true, sprite: 1, note: '먼저 원소나열법으로 바꿔 보자', make: (a, r) => (a === 0 ? [
      sym(SUBQ, '{1, 5, 25}', cond('div', 25), '⊂', S.SUB, `${cond('div', 25)} = {1, 5, 25} → ⊂`, { a: [1, 5, 25], cond: ['div', 25] }),
      sym(SUBQ, '{−2, 0, 2}', cond('quad', 2), '⊄', S.SUB, 'x(x − 2) = 0 → {0, 2}. −2 가 없다 → ⊄', { a: [-2, 0, 2], cond: ['quad', 2] }),
      sym(SUBQ, '{2, 3, 5, 7}', cond('nat', 7), '⊂', S.SUB, `${cond('nat', 7)} = {1, 2, …, 7} → ⊂`, { a: [2, 3, 5, 7], cond: ['nat', 7] }),
    ] : [genFinite(r, [['div', 8], ['div', 12], ['div', 16], ['div', 18], ['div', 20], ['div', 25], ['div', 27]]), genQuad(r), genNat(r)]) },
    m2: { title: '문제 2', sprite: 1, make: (a, r) => (a === 0 ? [
      sym(EQQ, '{2, 4, 6}', '{6, 4, 2}', '=', S.EQ, '순서만 다르다 → 원소가 모두 같다 → =', { a: [2, 4, 6], b: [6, 4, 2] }),
      sym(EQQ, '{1, 2, 4}', cond('div', 4), '=', S.EQ, `${cond('div', 4)} = {1, 2, 4} → =`, { a: [1, 2, 4], cond: ['div', 4] }),
      sym(EQQ, '{2, 4, 6}', cond('even', 8), '≠', S.EQ, `${cond('even', 8)} = {2, 4, 6, 8}. 8 이 없다 → ≠`, { a: [2, 4, 6], cond: ['even', 8] }),
    ] : [genPerm(r), genDivEq(r), genParityEq(r)]) },
    m3: { title: '문제 3', sprite: 0, make: (a, r) => subsetTable(a === 0 ? [1, 2, 3] : sorted(r.shuffle(range(1, 9)).slice(0, 3)), r) },
    s2: { title: '보강 · 부분집합의 개수 규칙', special: true, sprite: 0, make: (a, r) => (a === 0 ? countRule(4, 4, 'a') : (() => { const n = r.int(3, 5); return countRule(r.int(4, 6), n, r.pick(LET.slice(0, n))); })()) },
  };

  // ── 형성평가 (보스) — 세트1: 학습지 그대로(사진 채점은 4단계), 세트2: 숫자를 바꾼 재도전 ──
  // 7번(보강·도전)은 보너스: 보스 체력은 1~6번 기준, 7번을 맞히면 추가 데미지
  const ITEM2 = (opts, bad) => ({ type: 'choice', question: '2. 다음 중 옳지 않은 것은?', choices: opts, answerIndex: bad, answer: opts[bad], solution: '원소와 집합 사이 → ∈, 집합과 집합 사이 → ⊂',
    check: { judge: opts.map((o) => o.replace(/^[①②③④] /, '')) } });
  const BOSS = {
    1: [
      S.blanks('1. □ 안에 ⊂ 또는 ⊄ 를 쓰시오.', [{ left: '{1, 3}', right: '{1, 2, 3}', answer: '⊂' }, { left: '{1, 4}', right: '{1, 2, 3}', answer: '⊄' }], S.SUB, '{1, 3} 의 원소는 모두 있다 → ⊂, 4 는 없다 → ⊄', { pairs: [[[1, 3], [1, 2, 3]], [[1, 4], [1, 2, 3]]] }),
      ITEM2(['① 2 ∈ {1, 2}', '② {2} ⊂ {1, 2}', '③ ∅ ⊂ {1, 2}', '④ 2 ⊂ {1, 2}'], 3),
      S.blanks('3. □ 안에 = 또는 ≠ 를 쓰시오.', [{ left: '{x | x는 6의 약수}', right: '{1, 2, 3, 6}', answer: '=' }], S.EQ, '6의 약수 = {1, 2, 3, 6} → =', { cond: ['div', 6], b: [1, 2, 3, 6] }),
      S.subsets('4. 집합 {5, 7} 의 부분집합을 모두 쓰시오.', [5, 7], '∅, {5}, {7}, {5, 7}'),
      S.number('5. 집합 {5, 7} 의 진부분집합의 개수는?', 3, '부분집합 4개 − 자기 자신 1개 = 3개', { base: [5, 7], proper: true }),
      S.number('6. [도전] 두 집합 A = {1, a}, B = {1, 3} 에 대하여 A ⊂ B 이고 B ⊂ A 일 때, a 의 값은?', 3, 'A ⊂ B 이고 B ⊂ A → A = B → a = 3', { solveB: [1, 3] }),
      S.number('7. [보강·도전] 집합 {1, 2, 3, 4, 5, 6, 7} 의 부분집합 중에서 2와 6을 반드시 포함하고 5는 포함하지 않는 부분집합의 개수는?', 16, '정해진 원소 3개(2, 6, 5)를 빼고 나머지 4개만 → 2⁷⁻³ = 16', { base: [1, 2, 3, 4, 5, 6, 7], must: [2, 6], not: [5] }),
    ],
    2: [
      S.blanks('1. □ 안에 ⊂ 또는 ⊄ 를 쓰시오.', [{ left: '{2, 4}', right: '{2, 4, 6}', answer: '⊂' }, { left: '{2, 5}', right: '{2, 4, 6}', answer: '⊄' }], S.SUB, '{2, 4} 의 원소는 모두 있다 → ⊂, 5 는 없다 → ⊄', { pairs: [[[2, 4], [2, 4, 6]], [[2, 5], [2, 4, 6]]] }),
      ITEM2(['① 1 ∈ {1, 2}', '② {1} ∈ {1, 2}', '③ ∅ ⊂ {1, 2}', '④ {1, 2} ⊂ {1, 2}'], 1),
      S.blanks('3. □ 안에 = 또는 ≠ 를 쓰시오.', [{ left: '{x | x는 4의 약수}', right: '{1, 2, 4}', answer: '=' }], S.EQ, '4의 약수 = {1, 2, 4} → =', { cond: ['div', 4], b: [1, 2, 4] }),
      S.subsets('4. 집합 {2, 8} 의 부분집합을 모두 쓰시오.', [2, 8], '∅, {2}, {8}, {2, 8}'),
      S.number('5. 집합 {2, 8} 의 진부분집합의 개수는?', 3, '부분집합 4개 − 자기 자신 1개 = 3개', { base: [2, 8], proper: true }),
      S.number('6. [도전] 두 집합 A = {1, a}, B = {1, 5} 에 대하여 A ⊂ B 이고 B ⊂ A 일 때, a 의 값은?', 5, 'A ⊂ B 이고 B ⊂ A → A = B → a = 5', { solveB: [1, 5] }),
      S.number('7. [보강·도전] 집합 {1, 2, 3, 4, 5, 6} 의 부분집합 중에서 1과 4를 반드시 포함하고 6은 포함하지 않는 부분집합의 개수는?', 8, '정해진 원소 3개(1, 4, 6)를 빼고 나머지 3개만 → 2⁶⁻³ = 8', { base: [1, 2, 3, 4, 5, 6], must: [1, 4], not: [6] }),
    ],
  };

  const STEPS = [
    { kind: 'intro', id: 'intro', title: '도입 · 생각 열기', say: '선생님 세대 vs 너희 세대 — 유닛 멤버는 원래 그룹에 모두 있을까?' },
    { kind: 'concept', id: 'c1', title: '개념 1 · 부분집합', say: 'A의 모든 원소가 B에 속하면 A ⊂ B (A는 B에 포함된다). 하나라도 빠지면 A ⊄ B' },
    { kind: 'monster', id: 'm1' },
    { kind: 'monster', id: 's1' },
    { kind: 'concept', id: 'c2', title: '개념 2 · 꼭 기억할 두 가지 · 서로 같은 집합', say: 'A ⊂ A, ∅ ⊂ A. A ⊂ B 이고 B ⊂ A 이면 A = B' },
    { kind: 'monster', id: 'm2' },
    { kind: 'concept', id: 'c3', title: '개념 3 · 부분집합 모두 구하기 · 진부분집합', say: '원소를 0개, 1개, 2개, … 고르는 순서로 빠짐없이. 진부분집합 = 부분집합 중에서 자기 자신을 뺀 것' },
    { kind: 'monster', id: 'm3' },
    { kind: 'monster', id: 's2' },
    { kind: 'boss', id: 'boss', title: '형성평가 · 포함의 성주' },
  ];
  STEPS.forEach((s) => { if (s.kind === 'monster') Object.assign(s, { title: MONSTERS[s.id].title, special: !!MONSTERS[s.id].special }); });

  DS.Lessons.register({
    id: 'set-03', no: 3,
    title: '집합 사이의 포함 관계',
    unit: '공통수학2 Ⅱ-1 집합 · 3차시',
    sheet: '학습과정 3차시 v4',
    // 수업 준비에서 이 학습지 PDF 를 올리면 [개념] 칸마다 잘라 넣는 위치 (A4 쪽 비율 0~1, 여러 칸이면 위아래로 이어 붙임)
    crops: { intro: [{ p: 1, x: 0.0426, y: 0.1245, w: 0.4458, h: 0.3329 }], c1: [{ p: 1, x: 0.0426, y: 0.4619, w: 0.4458, h: 0.3044 }], c2: [{ p: 1, x: 0.5116, y: 0.6489, w: 0.4458, h: 0.0979 }, { p: 2, x: 0.0426, y: 0.0984, w: 0.4458, h: 0.1488 }], c3: [{ p: 2, x: 0.0426, y: 0.3542, w: 0.4458, h: 0.1818 }] },
    theme: '05-ruins', // 던전 테마: 고대 유적 (배경 dg-05 · 포털 portal-05)
    goal: '부분집합의 뜻을 알고 ⊂, ⊄ 로 나타낸다 · 서로 같은 집합을 찾는다 · 부분집합을 모두 구한다',
    defaultPct: 90,
    steps: STEPS,
    monsters: MONSTERS,
    // 소문제 목록: 같은 시드 → 같은 문제 (학생 기기와 교사 기기가 각자 만들어 채점이 같다)
    items(id, seed, attempt) { return MONSTERS[id].make(attempt, DS.Rng(`${seed}|${id}|${attempt}`)); },
    COND,
    boss: { title: '3차시 형성평가 · 포함의 성주', sprite: 2, items: 7, hpItems: 6, sets: BOSS },
  });
})();
