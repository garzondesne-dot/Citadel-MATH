// 공통수학2 Ⅱ-1 집합 · 4차시 「교집합과 합집합」 (학습과정 4차시 레이드용 v2 기준, 2026-11-01)
// 레이드 순서: 도입 → 📖 복습 몬스터(지난 시간) → 개념1(교집합·합집합) → 문제1 → 개념2(서로소) → 문제2 → 개념3(원소의 개수 + 이런 표현도) → 문제3 → 형성평가
// 4차시부터 보강은 레이드에 넣지 않고 ⚔ 보강던전(모닥불 · 혼자)으로 뺀다: 보강 ① 한 걸음 더(∪ ∩) · ② 서로소 한 걸음 더 · ③ 이런 표현도 같은 뜻
// 첫 시도(attempt 0)는 학습지 그대로, 재도전은 소문제 전부 새 숫자(서로소 낱말 문제는 문장 묶음에서). 같은 시드 → 같은 문제.
// 모든 정답은 tests/lesson4.test.js 에서 원소를 직접 세거나 조건을 직접 계산해 검산한다 (check 정보 사용).
(function () {
  const S = DS.SetGen;
  const st = (a) => S.setStr(a);
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const sorted = (a) => a.slice().sort((x, y) => x - y);
  const inter = (A, B) => sorted(A.filter((x) => B.includes(x)));
  const union = (A, B) => sorted([...new Set([...A, ...B])]);
  const divs = (n) => range(1, n).filter((x) => n % x === 0);
  const OPN = { '∩': '교집합 — 둘 다 있는 것', '∪': '합집합 — 모두 모으기 (겹치는 원소는 한 번만)' };

  // 원소 고르기: A ∩ B · A ∪ B 의 원소를 후보 수에서 모두 고른다 (후보 = 나온 수 + 함정 수)
  function pickEls(head, A, B, op, opts, label) {
    const want = op === '∩' ? inter(A, B) : union(A, B);
    const options = opts.map(String);
    return { type: 'multi', question: `${head}${label || `A ${op} B`} 의 원소를 모두 고르시오.`, options, answer: opts.map((x, i) => (want.includes(x) ? i : -1)).filter((i) => i >= 0),
      solution: `${OPN[op]} → ${label || `A ${op} B`} = ${st(want)}`, check: { a: A, b: B, op, options: opts } };
  }
  const traps = (r, used, k, hi) => sorted(r.shuffle(range(1, hi).filter((x) => !used.includes(x))).slice(0, k));

  // ── 📖 복습 몬스터 (3차시 · 부분집합의 개수) ──────────────────
  const LET = ['a', 'b', 'c', 'd', 'e'];
  const sup = (n) => String(n).split('').map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join('');
  const between = (k, n) => S.number(`${st(range(1, k))} ⊂ A ⊂ ${st(range(1, n))} 을 만족시키는 집합 A의 개수는?`, 2 ** (n - k),
    `${range(1, k).join(', ')} 은(는) 반드시 포함 → 나머지 ${n - k}개만 넣거나 빼기 → 2${sup(n - k)} = ${2 ** (n - k)}`, { base: range(1, n), must: range(1, k) });
  const properN = (n) => S.number(`집합 {${LET.slice(0, n).join(', ')}} 의 진부분집합의 개수는?`, 2 ** n - 1, `부분집합 2${sup(n)} = ${2 ** n}개 − 자기 자신 1개 = ${2 ** n - 1}개`, { base: LET.slice(0, n), proper: true });

  // ── 문제 1 · 보강 ① 재도전: 원소 고르기 ───────────────────────
  function genPair(r) {
    for (;;) {
      const A = sorted(r.shuffle(range(1, 12)).slice(0, r.int(3, 4))), B = sorted(r.shuffle(range(1, 12)).slice(0, r.int(3, 5)));
      if (inter(A, B).length && inter(A, B).length < Math.min(A.length, B.length)) return [A, B];
    }
  }
  function m1Retry(r) {
    const out = [];
    for (let k = 0; k < 2; k++) {
      const [A, B] = genPair(r), U = union(A, B), opts = sorted([...U, ...traps(r, U, 2, 15)]);
      const head = `(${k + 1}) A = ${st(A)}, B = ${st(B)} 일 때 `;
      out.push(pickEls(head, A, B, '∩', opts), pickEls(head, A, B, '∪', opts));
    }
    return out;
  }
  function b1Make(A, B, C, opts) {
    const head = `A = ${st(A)}, B = {x | x는 ${B.n}의 약수}, C = {x | x는 ${C.n}의 약수} 일 때 `;
    return [pickEls(head, A, B.els, '∪', opts, 'A ∪ B'), pickEls(head, A, B.els, '∩', opts, 'A ∩ B'), pickEls(head, A, C.els, '∪', opts, 'A ∪ C'), pickEls(head, B.els, C.els, '∩', opts, 'B ∩ C')]
      .map((q, i) => Object.assign(q, { check: Object.assign(q.check, { divB: B.n, divC: C.n, which: ['AB', 'AB', 'AC', 'BC'][i], A }) }));
  }
  function b1Retry(r) {
    const nb = r.pick([6, 10, 12, 15]), nc = r.pick([8, 9, 16, 20].filter((x) => x !== nb));
    let A;
    do A = sorted(r.shuffle(range(1, 9)).slice(0, 4)); while (!inter(A, divs(nb)).length || inter(A, divs(nb)).length === 4);
    const U = union(union(A, divs(nb)), divs(nc));
    return b1Make(A, { n: nb, els: divs(nb) }, { n: nc, els: divs(nc) }, sorted([...U, ...traps(r, U, 2, Math.max(...U) + 3)]));
  }

  // ── 문제 2 · 보강 ② : 서로소 O/X ─────────────────────────────
  // 낱말 문장 묶음 (재도전용): [A의 조건, B의 조건, 서로소?, 이유]. 수 조건은 테스트가 1~200 에서 직접 확인, 도형은 테스트의 따로 쓴 참값표로 확인
  const WORDS = [
    ['정삼각형', '직각삼각형', true, '정삼각형의 세 각은 모두 60° → 직각인 정삼각형은 없다'],
    ['직사각형', '마름모', false, '정사각형은 직사각형이면서 마름모 → 공통인 원소가 있다'],
    ['정사각형', '직사각형', false, '정사각형은 모두 직사각형이다 → 공통인 원소가 있다'],
    ['예각삼각형', '둔각삼각형', true, '한 삼각형이 예각삼각형이면서 둔각삼각형일 수는 없다'],
    ['홀수', '짝수', true, '홀수이면서 짝수인 자연수는 없다'],
    ['2의 배수', '3의 배수', false, '6, 12, … 는 2의 배수이면서 3의 배수'],
    ['소수', '짝수', false, '2 는 소수이면서 짝수'],
    ['4의 배수', '홀수', true, '4의 배수는 모두 짝수 → 홀수와 겹치지 않는다'],
    ['10의 약수', '3의 배수', true, '10의 약수 {1, 2, 5, 10} 중 3의 배수는 없다'],
    ['12의 약수', '5의 배수', true, '12의 약수 {1, 2, 3, 4, 6, 12} 중 5의 배수는 없다'],
    ['8의 약수', '짝수', false, '2, 4, 8 은 8의 약수이면서 짝수'],
  ];
  const oxQ = (A, B, answer, solution, check) => S.ox(`A = ${A}, B = ${B} 는 서로소인가? (서로소이면 O)`, answer, solution, check);
  const word = (w) => oxQ(`{x | x는 ${w[0]}}`, `{x | x는 ${w[1]}}`, w[2], `${w[3]} → ${w[2] ? '서로소 (O)' : '서로소가 아니다 (X)'}`, { words: [w[0], w[1]] });
  function genExplicitDisjoint(r) {
    const A = sorted(r.shuffle(range(1, 9)).slice(0, 3));
    const rest = range(1, 9).filter((x) => !A.includes(x));
    const B = r() < 0.5 ? sorted(r.shuffle(rest).slice(0, 3)) : sorted([...r.shuffle(rest).slice(0, 2), r.pick(A)]);
    const I = inter(A, B);
    return oxQ(st(A), st(B), !I.length, I.length ? `${st(I)} 이(가) 겹친다 → A ∩ B ≠ ∅ → 서로소가 아니다 (X)` : 'A ∩ B = ∅ → 서로소 (O)', { a: A, b: B });
  }
  const ivSet = (lo, hi) => range(lo + 1, hi - 1);
  function intervalQ(a, b, c, d) {
    const A = ivSet(a, b), B = ivSet(c, d), I = inter(A, B);
    return oxQ(`{x | x는 ${a} < x < ${b} 인 정수}`, `{x | x는 ${c} < x < ${d} 인 정수}`, !I.length,
      `원소나열법으로 → A = ${st(A)}, B = ${st(B)} → ${I.length ? `${st(I)} 이(가) 겹친다 → 서로소가 아니다 (X)` : 'A ∩ B = ∅ → 서로소 (O)'}`, { iv: [[a, b], [c, d]] });
  }
  function genInterval(r) {
    const a = r.int(-1, 2), b = a + r.int(2, 4), c = r() < 0.5 ? b - 1 : b - 2, d = c + r.int(3, 5);
    return intervalQ(a, b, c, d);
  }
  const wordPick = (r) => word(r.pick(WORDS));

  // ── 문제 3: 합집합의 원소의 개수 ─────────────────────────────
  const nUnion = (a, b, i) => S.number(`n(A) = ${a}, n(B) = ${b}, n(A ∩ B) = ${i} 일 때, n(A ∪ B) = ?`, a + b - i, `n(A ∪ B) = ${a} + ${b} − ${i} = ${a + b - i}`, { nA: a, nB: b, nI: i });
  const nInter = (a, b, u) => S.number(`n(A) = ${a}, n(B) = ${b}, n(A ∪ B) = ${u} 일 때, n(A ∩ B) = ?`, a + b - u, `${u} = ${a} + ${b} − n(A ∩ B) → n(A ∩ B) = ${a + b - u}`, { nA: a, nB: b, nU: u });
  function m3Retry(r) {
    const a = r.int(4, 12), b = r.int(3, 12), i = r.int(1, Math.min(a, b) - 1);
    const a2 = r.int(5, 12), b2 = r.int(5, 12), i2 = r.int(1, Math.min(a2, b2) - 1);
    return [nUnion(a, b, i), nInter(a2, b2, a2 + b2 - i2)];
  }

  // ── 보강 ③ 이런 표현도 같은 뜻: A ⊂ B 이면 A ∩ B = A, A ∪ B = B ─────
  function sameAs(A, B, op, r) {
    const res = op === '∩' ? inter(A, B) : union(A, B);
    const choices = r ? r.shuffle(['A', 'B', '∅']) : ['A', 'B', '∅'];
    const ans = op === '∩' ? 'A' : 'B';
    return { type: 'choice', question: `A = ${st(A)}, B = ${st(B)} 처럼 A ⊂ B 일 때, A ${op} B 와 같은 집합은?`, choices, answerIndex: choices.indexOf(ans), answer: ans,
      solution: `A ${op} B = ${st(res)} = ${ans} (작은 집합 A 가 큰 집합 B 안에 쏙 → A ∩ B = A, A ∪ B = B)`, check: { a: A, b: B, op } };
  }
  function b3Retry(r) {
    const B = sorted(r.shuffle(range(1, 9)).slice(0, r.int(4, 5))), A = sorted(r.shuffle(B).slice(0, 2));
    const B2 = sorted(r.shuffle(range(1, 9)).slice(0, r.int(3, 5))), A2 = sorted(r.shuffle(B2).slice(0, 2));
    return [sameAs(A, B, '∩', r), sameAs(A2, B2, '∪', r)];
  }

  // ── 몬스터 (학습지 순서) · make(attempt, rng) → 소문제 배열 ─────
  const MONSTERS = {
    r1: { title: '📖 복습 · 지난 시간 기억하기', sprite: 'crown:0', make: (a, r) => (a === 0 ? [between(3, 7), between(2, 4), properN(3)]
      : (() => { const n = r.int(4, 7), k = r.int(1, 3), n2 = r.int(3, 6), k2 = r.int(1, 2); return [between(k, n), between(k2, n2), properN(r.int(2, 4))]; })()) },
    m1: { title: '문제 1', sprite: 'crown:1', make: (a, r) => (a === 0 ? [
      pickEls('(1) A = {1, 2, 3, 4}, B = {2, 4, 6, 8} 일 때 ', [1, 2, 3, 4], [2, 4, 6, 8], '∩', range(1, 9)),
      pickEls('(1) A = {1, 2, 3, 4}, B = {2, 4, 6, 8} 일 때 ', [1, 2, 3, 4], [2, 4, 6, 8], '∪', range(1, 9)),
      pickEls('(2) A = {1, 3, 9, 27}, B = {3, 9, 15, 21, 27} 일 때 ', [1, 3, 9, 27], [3, 9, 15, 21, 27], '∩', [1, 3, 5, 9, 12, 15, 18, 21, 27]),
      pickEls('(2) A = {1, 3, 9, 27}, B = {3, 9, 15, 21, 27} 일 때 ', [1, 3, 9, 27], [3, 9, 15, 21, 27], '∪', [1, 3, 5, 9, 12, 15, 18, 21, 27]),
    ] : m1Retry(r)) },
    m2: { title: '문제 2', sprite: 'crown:2', make: (a, r) => (a === 0 ? [
      oxQ('{1, 3, 5}', '{2, 4, 6}', true, 'A ∩ B = ∅ → 서로소 (O)', { a: [1, 3, 5], b: [2, 4, 6] }),
      word(WORDS[0]),
    ] : [genExplicitDisjoint(r), wordPick(r)]) },
    m3: { title: '문제 3', sprite: 'crown:4', make: (a, r) => (a === 0 ? [nUnion(5, 4, 2), nInter(8, 10, 16)] : m3Retry(r)) },
    // ⚔ 보강던전 (레이드 밖 · 혼자) — concept 는 복습 추천에서 「이 개념의 보강」으로 연결
    b1: { title: '보강 ① · 한 걸음 더 (∪ ∩)', bonus: true, concept: 'c1', sprite: 'crown:8', make: (a, r) => (a === 0
      ? b1Make([2, 3, 4, 5], { n: 6, els: divs(6) }, { n: 8, els: divs(8) }, range(1, 9)) : b1Retry(r)) },
    b2: { title: '보강 ② · 서로소 한 걸음 더', bonus: true, concept: 'c2', sprite: 'crown:3', note: '먼저 원소나열법으로!', make: (a, r) => (a === 0
      ? [intervalQ(0, 2, 1, 5), word(WORDS[1])] : [genInterval(r), wordPick(r)]) },
    b3: { title: '보강 ③ · 이런 표현도 같은 뜻', bonus: true, concept: 'c3', sprite: 'crown:5', make: (a, r) => (a === 0
      ? [sameAs([1, 2], [1, 2, 3, 4], '∩'), sameAs([1, 2], [1, 2, 3, 4], '∪')] : b3Retry(r)) },
  };

  // ── 형성평가 (보스) — 세트1: 학습지 그대로, 세트2: 숫자를 바꾼 재도전 · 6번(보강·도전)은 보너스 ──
  const ch = (question, choices, ans, solution, check) => ({ type: 'choice', question, choices, answerIndex: ans, answer: choices[ans], solution, check });
  const pairTxt = (A, B) => `A ∩ B = ${st(inter(A, B))}, A ∪ B = ${st(union(A, B))}`;
  function bossSet(A, B, disj, disjAns, nA, nB, nI, item4, item5, six) {
    const wrong1 = [`A ∩ B = ${st(union(A, B))}, A ∪ B = ${st(inter(A, B))}`, `A ∩ B = ${st(inter(A, B))}, A ∪ B = ${st(sorted([...A, ...B].filter((x) => !inter(A, B).includes(x))))}`, `A ∩ B = ∅, A ∪ B = ${st(union(A, B))}`];
    const c1 = [pairTxt(A, B), ...wrong1];
    return [
      ch(`1. A = ${st(A)}, B = ${st(B)} 일 때 A ∩ B 와 A ∪ B 를 바르게 구한 것은?`, c1, 0, `둘 다 있는 것 → ${st(inter(A, B))}, 모두 모으기 → ${st(union(A, B))}`, { a: A, b: B, pair: true }),
      ch('2. 서로소인 것은?', disj.map((p, i) => `${'①②③'[i]} ${p[0]}, ${p[1]}`), disjAns, '공통인 원소가 하나도 없는 두 집합 → 서로소', { disj }),
      S.number(`3. n(A) = ${nA}, n(B) = ${nB}, n(A ∩ B) = ${nI} 일 때 n(A ∪ B) = ?`, nA + nB - nI, `n(A ∪ B) = ${nA} + ${nB} − ${nI} = ${nA + nB - nI}`, { nA, nB, nI }),
      ch(`4. ${item4.op === '∪' ? 'A ∪ B' : 'A ∩ B'} = {x | x ∈ A (   ) x ∈ B} 에 알맞은 말은?`, ['그리고', '또는'], item4.op === '∪' ? 1 : 0, '교집합 → 그리고 (둘 다), 합집합 → 또는 (하나라도)', { word: item4.op }),
      ch(`5. A ⊂ B 일 때, A ${item5} B 와 같은 집합은?`, ['A', 'B', '∅'], item5 === '∩' ? 0 : 1, 'A ⊂ B 이면 A ∩ B = A, A ∪ B = B', { sub: item5 }),
      ch(`6. [보강·도전] 두 집합 A = {${six.A}}, B = {${six.B}} 에 대하여 A ∩ B = ${st(six.I)} 일 때, 집합 A ∪ B 는?`, six.choices, 0, six.sol, { six }),
    ];
  }
  const BOSS = {
    1: bossSet([1, 2, 3], [2, 3, 4], [['{1, 2}', '{2, 3}'], ['{1, 3}', '{2, 4}'], ['{a}', '{a, b}']], 1, 6, 5, 3, { op: '∪' }, '∩',
      { A: '1, 3, a + 1', B: '3, a, 5', I: [3, 5], fA: (a) => [1, 3, a + 1], fB: (a) => [3, a, 5], choices: ['{1, 3, 4, 5}', '{1, 3, 5}', '{3, 4, 5}', '{1, 3, 4, 5, 6}'], sol: 'A ∩ B 에 5 가 있으니 a + 1 = 5 → a = 4 → A = {1, 3, 5}, B = {3, 4, 5} → A ∪ B = {1, 3, 4, 5}' }),
    2: bossSet([2, 4, 6], [4, 6, 8], [['{1, 4}', '{4, 5}'], ['{a, b}', '{b}'], ['{2, 5}', '{3, 6}']], 2, 7, 4, 2, { op: '∩' }, '∪',
      { A: '1, 2, a + 3', B: '2, a, 7', I: [2, 7], fA: (a) => [1, 2, a + 3], fB: (a) => [2, a, 7], choices: ['{1, 2, 4, 7}', '{1, 2, 7}', '{2, 4, 7}', '{1, 2, 4, 7, 10}'], sol: 'A ∩ B 에 7 이 있으니 a + 3 = 7 → a = 4 → A = {1, 2, 7}, B = {2, 4, 7} → A ∪ B = {1, 2, 4, 7}' }),
  };
  // 보기 순서는 고정 (같은 시드 → 같은 문제). 1번은 정답이 맨 앞이 되지 않게 돌려 둔다
  [1, 2].forEach((k) => { const q = BOSS[k][0], rot = k === 1 ? 2 : 1; q.choices = [...q.choices.slice(rot), ...q.choices.slice(0, rot)]; q.answerIndex = (q.choices.length - rot) % q.choices.length; q.answer = q.choices[q.answerIndex]; });
  [1, 2].forEach((k) => { const q = BOSS[k][5], rot = k === 1 ? 1 : 3; q.choices = [...q.choices.slice(rot), ...q.choices.slice(0, rot)]; q.answerIndex = (q.choices.length - rot) % q.choices.length; q.answer = q.choices[q.answerIndex]; });

  const STEPS = [
    { kind: 'intro', id: 'intro', title: '도입 · 생각 열기', say: '선생님 폰 vs 너희 폰 — 둘 다 쓰는 앱은? 한 명이라도 쓰는 앱은 모두 몇 개?' },
    { kind: 'monster', id: 'r1' },
    { kind: 'concept', id: 'c1', title: '개념 1 · 교집합 · 합집합', say: 'A ∩ B = 둘 다 있는 것 (그리고), A ∪ B = 모두 모으기 (또는) — 겹치는 원소는 한 번만' },
    { kind: 'monster', id: 'm1' },
    { kind: 'concept', id: 'c2', title: '개념 2 · 서로소', say: '공통인 원소가 하나도 없을 때, 즉 A ∩ B = ∅ 일 때 A와 B는 서로소' },
    { kind: 'monster', id: 'm2' },
    { kind: 'concept', id: 'c3', title: '개념 3 · 합집합의 원소의 개수 · 이런 표현도', say: 'n(A ∪ B) = n(A) + n(B) − n(A ∩ B) (겹친 부분은 한 번 빼기) · A ⊂ B 이면 A ∩ B = A, A ∪ B = B' },
    { kind: 'monster', id: 'm3' },
    { kind: 'boss', id: 'boss', title: '형성평가 · 서리 늑대' },
  ];
  STEPS.forEach((s) => { if (s.kind === 'monster') Object.assign(s, { title: MONSTERS[s.id].title, special: !!MONSTERS[s.id].special }); });

  DS.Lessons.register({
    id: 'set-04', no: 4,
    title: '교집합과 합집합',
    unit: '공통수학2 Ⅱ-1 집합 · 4차시',
    sheet: '학습과정 4차시 레이드용 v2',
    crops: { intro: [{ p: 1, x: 0.0405, y: 0.1385, w: 0.45, h: 0.3953 }], r1: [{ p: 1, x: 0.0405, y: 0.5318, w: 0.45, h: 0.1331 }],
      c1: [{ p: 1, x: 0.0405, y: 0.6619, w: 0.45, h: 0.2297 }, { p: 1, x: 0.5095, y: 0.1385, w: 0.45, h: 0.2663 }], m1: [{ p: 1, x: 0.5095, y: 0.4001, w: 0.45, h: 0.1279 }],
      c2: [{ p: 1, x: 0.5095, y: 0.6179, w: 0.45, h: 0.1357 }], m2: [{ p: 2, x: 0.0405, y: 0.0969, w: 0.45, h: 0.0949 }],
      c3: [{ p: 2, x: 0.0405, y: 0.2834, w: 0.45, h: 0.197 }, { p: 2, x: 0.0405, y: 0.5685, w: 0.45, h: 0.1067 }], m3: [{ p: 2, x: 0.0405, y: 0.4757, w: 0.45, h: 0.0949 }],
      boss: [{ p: 2, x: 0.5095, y: 0.0969, w: 0.45, h: 0.3784 }],
      // ⚔ 보강던전 칸 (학생이 「📄 학습지 보기」로 본다)
      b1: [{ p: 1, x: 0.5095, y: 0.526, w: 0.45, h: 0.0967 }], b2: [{ p: 2, x: 0.0405, y: 0.1897, w: 0.45, h: 0.0967 }], b3: [{ p: 2, x: 0.0405, y: 0.5685, w: 0.45, h: 0.1067 }] },
    theme: '06-frost', // 던전 테마: 빙결 동굴 (배경 dg-06 · 포털 portal-06)
    // 🎬 기본 설명 영상 (모션그래픽, 사용자 드라이브 「학습지 > 결과물」 · 링크 공유). 수업 준비에서 다른 영상을 넣으면 그것이 우선
    videos: { c1: 'https://drive.google.com/file/d/1k_NsW69Vn9KXEBeDEErYXixmp2pDYmzl/view', m1: 'https://drive.google.com/file/d/1SJAtj8g00NpyR9nD0jnJGnhJmncPTPes/view', b1: 'https://drive.google.com/file/d/1SJAtj8g00NpyR9nD0jnJGnhJmncPTPes/view', c2: 'https://drive.google.com/file/d/1VDWhVFYNolKlIN0jrP0vqyP9PUAkzcS9/view', m2: 'https://drive.google.com/file/d/1VDWhVFYNolKlIN0jrP0vqyP9PUAkzcS9/view', b2: 'https://drive.google.com/file/d/1VDWhVFYNolKlIN0jrP0vqyP9PUAkzcS9/view',
      c3: 'https://drive.google.com/file/d/1ZjVOBjXZD4JT_5sR1X631gxe7PgjHFrt/view', m3: 'https://drive.google.com/file/d/1ZjVOBjXZD4JT_5sR1X631gxe7PgjHFrt/view', b3: 'https://drive.google.com/file/d/1BzRRSWAWdJZHpwE2KD-LkVqlvzIZvNix/view' },
    goal: '교집합과 합집합을 구한다 · 서로소인 두 집합을 찾는다 · 합집합의 원소의 개수를 구한다',
    defaultPct: 90,
    steps: STEPS,
    monsters: MONSTERS,
    bonus: ['b1', 'b2', 'b3'].map((id) => ({ id, title: MONSTERS[id].title, concept: MONSTERS[id].concept })),
    items(id, seed, attempt) { return MONSTERS[id].make(attempt, DS.Rng(`${seed}|${id}|${attempt}`)); },
    WORDS,
    next: { title: '5차시 · 여집합과 차집합', ask: '우리 반 전체에서 안경 쓴 친구를 빼면, 남은 친구들은 어떤 집합일까?', link: '오늘 배운 교집합(∩)으로 차집합을 A − B = A ∩ Bᶜ 처럼 나타낼 수 있어요.' }, // 다음 수업 (초안)
    boss: { title: '4차시 형성평가 · 서리 늑대', sprite: 'crown:7', items: 6, hpItems: 5, sets: BOSS, tags: ['c1', 'c2', 'c3', 'c1', 'c3', 'c1'] },
  });
})();
