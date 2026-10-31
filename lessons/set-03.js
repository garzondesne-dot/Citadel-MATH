// 공통수학2 Ⅱ-1 집합 · 3차시 「집합 사이의 포함 관계」 (학습지 v2 기준)
// 단계: 부분집합 → 꼭 기억할 두 가지(A ⊂ A, ∅ ⊂ A) → 서로 같은 집합 → 부분집합 모두 구하기 → 보스(3차시 형성평가 6문항)
// 이 수업에서 ⊂ 는 서로 같은 집합도 포함하는 부분집합 기호다 (학습지와 같음).
// 모든 정답은 tests/lesson.test.js 에서 원소를 직접 세거나 조건을 직접 계산해 검산한다.
(function () {
  const S = DS.SetGen;
  const IN4 = ['∈', '∉', '⊂', '⊄'];
  const st = (a) => S.setStr(a);

  // 조건제시법 집합 (원소는 테스트에서 조건을 다시 계산해 확인)
  const COND = {
    mul3: { text: 'x는 30 이하의 3의 배수', els: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30] },
    prime10: { text: 'x는 10 이하의 소수', els: [2, 3, 5, 7] },
    div12: { text: 'x는 12의 약수', els: [1, 2, 3, 4, 6, 12] },
    div25: { text: 'x는 25의 약수', els: [1, 5, 25] },
    div4: { text: 'x는 4의 약수', els: [1, 2, 4] },
    div6: { text: 'x는 6의 약수', els: [1, 2, 3, 6] },
    even8: { text: 'x는 8 이하의 짝수', els: [2, 4, 6, 8] },
    odd10: { text: 'x는 10 이하의 홀수', els: [1, 3, 5, 7, 9] },
  };
  const condStr = (c) => `{x | ${COND[c].text}}`;

  // ── 문제 (시드 → 학생마다 숫자가 다름) ──────────────────────
  function question(type, seed) {
    const r = DS.Rng(seed), k = r.int(1, 5), flip = r() < 0.5;
    let q;
    if (type === 'subset') {
      const A = [k, flip ? k + 2 : k + 4], B = [k, k + 1, k + 2];
      q = S.one(st(A), st(B), S.isSubset(A, B) ? '⊂' : '⊄', S.SUB,
        flip ? `${k}, ${k + 2} 모두 B 에 있다 → ⊂` : `${k + 4} 이(가) B 에 없다 → ⊄ (원소가 하나라도 빠지면 부분집합이 아니다)`, { a: A, b: B });
      q.question = '□ 안에 ⊂ 또는 ⊄ 를 쓰시오.';
      q.cards = ['subset', 'counter'];
    } else if (type === 'condSubset') {
      const pick = r.pick([['div25', [1, 5, 25]], ['prime10', [2, 3, 5]], ['mul3', [3, 6]], ['div12', [2, 4, 8]], ['prime10', [2, 3, 9]], ['div12', [1, 3, 6, 12]]]);
      const [c, A] = pick, B = COND[c].els;
      q = S.one(st(A), condStr(c), S.isSubset(A, B) ? '⊂' : '⊄', S.SUB,
        `${condStr(c)} = ${st(B)} (원소나열법으로 바꿔 보자) → ${S.isSubset(A, B) ? '모든 원소가 있다 → ⊂' : `${A.filter((x) => !B.includes(x)).join(', ')} 이(가) 없다 → ⊄`}`, { a: A, cond: c });
      q.question = '먼저 원소나열법으로 바꾸고, □ 안에 ⊂ 또는 ⊄ 를 쓰시오.';
      q.cards = ['subset', 'counter'];
    } else if (type === 'counter') {
      const A = [k, k + 4], B = [k, k + 1, k + 2];
      const opts = r.shuffle([k, k + 1, k + 2, k + 4].map(String));
      q = { type: 'choice', question: `A = ${st(A)}, B = ${st(B)}\nA ⊄ B 인 근거가 되는 원소는?`, choices: opts, answer: String(k + 4), answerIndex: opts.indexOf(String(k + 4)),
        solution: `A 에는 있지만 B 에는 없는 원소 ${k + 4} → A ⊄ B`, check: { a: A, b: B } };
      q.cards = ['counter'];
    } else if (type === 'self') {
      const A = [k, k + 2];
      q = S.ox(`A = ${st(A)} 일 때, A ⊂ A 이다.`, true, '모든 집합은 자기 자신의 부분집합이다 → A ⊂ A', { a: A, b: A });
      q.cards = ['self', 'subset'];
    } else if (type === 'emptySub') {
      const A = [k, k + 3];
      q = flip
        ? S.ox(`A = ${st(A)} 일 때, ∅ ⊂ A 이다.`, true, '공집합은 모든 집합의 부분집합이다 → ∅ ⊂ A', { a: [], b: A })
        : S.ox(`A = ${st(A)} 일 때, A ⊂ ∅ 이다.`, false, `A 의 원소 ${k} 가 ∅ 에 없다 → A ⊄ ∅ (∅ ⊂ A 와 거꾸로!)`, { a: A, b: [] });
      q.cards = ['emptySub', 'subset'];
    } else if (type === 'symbol') {
      const A = [k, k + 1];
      q = S.blanks('□ 안에 알맞은 기호를 쓰시오. (원소와 집합 사이 → ∈·∉, 집합과 집합 사이 → ⊂·⊄)',
        [{ left: String(k), right: st(A), answer: '∈' }, { left: `{${k}}`, right: st(A), answer: '⊂' }], IN4,
        `${k} 는 원소 → ${k} ∈ ${st(A)}.  {${k}} 는 집합 → {${k}} ⊂ ${st(A)}`, { elem: k, set: A, sub: [k] });
      q.cards = ['subset', 'self', 'emptySub'];
    } else if (type === 'equal') {
      const A = [k, k + 1, k + 2], B = flip ? [k + 2, k, k + 1] : [k, k + 1, k + 3];
      q = S.one(st(A), st(B), S.sameSet(A, B) ? '=' : '≠', S.EQ,
        flip ? '원소가 모두 같고 순서만 다르다 → =' : `${k + 2} 는 B 에 없고 ${k + 3} 은 A 에 없다 → ≠`, { a: A, b: B });
      q.question = '□ 안에 = 또는 ≠ 를 쓰시오.';
      q.cards = ['equal'];
    } else if (type === 'equalCond') {
      const [A, c] = r.pick([[[1, 2, 4], 'div4'], [[2, 4, 6], 'even8'], [[1, 2, 3, 6], 'div6'], [[1, 3, 5, 7], 'odd10'], [[4, 2, 1], 'div4']]);
      const B = COND[c].els;
      q = S.one(st(A), condStr(c), S.sameSet(A, B) ? '=' : '≠', S.EQ,
        `${condStr(c)} = ${st(B)} → ${S.sameSet(A, B) ? '원소가 모두 같다 → =' : '원소가 다르다 → ≠'}`, { a: A, cond: c });
      q.question = '먼저 원소나열법으로 바꾸고, □ 안에 = 또는 ≠ 를 쓰시오.';
      q.cards = ['equal'];
    } else if (type === 'list') {
      const base = flip ? [k, k + 1] : [k, k + 1, k + 2];
      q = S.subsets(`집합 ${st(base)} 의 부분집합을 모두 만드시오. (∅ 과 자기 자신도!)`, base,
        `원소를 0개, 1개, 2개, … 고르는 순서로 빠짐없이 → ${2 ** base.length}개`);
      q.cards = ['list'];
    } else if (type === 'proper') {
      const base = flip ? [k, k + 2] : [k, k + 1, k + 2];
      q = S.number(`집합 ${st(base)} 의 진부분집합의 개수는?`, 2 ** base.length - 1,
        `부분집합 ${2 ** base.length}개 중 자기 자신을 빼면 ${2 ** base.length - 1}개`, { base, proper: true });
      q.cards = ['proper', 'list'];
    }
    if (!q) throw new Error('알 수 없는 문제 유형: ' + type);
    return { ...q, qtype: type, seed: String(seed) };
  }

  // ── 형성평가 (보스) — 세트1: 3차시 학습지 그대로, 세트2: 숫자를 바꾼 재도전용 ──
  const ITEM2 = (opts, bad) => ({ type: 'choice', question: '다음 중 옳지 않은 것은?', choices: opts, answerIndex: bad, answer: opts[bad], solution: '원소와 집합 사이 → ∈, 집합과 집합 사이 → ⊂',
    check: { judge: opts.map((o) => o.replace(/^[①②③④] /, '')) } });
  const BOSS = {
    1: [
      S.blanks('1. □ 안에 ⊂ 또는 ⊄ 를 쓰시오.', [{ left: '{1, 3}', right: '{1, 2, 3}', answer: '⊂' }, { left: '{1, 4}', right: '{1, 2, 3}', answer: '⊄' }], S.SUB, '{1, 3} 의 원소는 모두 있다 → ⊂, 4 는 없다 → ⊄', { pairs: [[[1, 3], [1, 2, 3]], [[1, 4], [1, 2, 3]]] }),
      ITEM2(['① 2 ∈ {1, 2}', '② {2} ⊂ {1, 2}', '③ ∅ ⊂ {1, 2}', '④ 2 ⊂ {1, 2}'], 3),
      S.blanks('3. □ 안에 = 또는 ≠ 를 쓰시오.', [{ left: '{x | x는 6의 약수}', right: '{1, 2, 3, 6}', answer: '=' }], S.EQ, '6의 약수 = {1, 2, 3, 6} → =', { cond: 'div6', b: [1, 2, 3, 6] }),
      S.subsets('4. 집합 {5, 7} 의 부분집합을 모두 쓰시오.', [5, 7], '∅, {5}, {7}, {5, 7}'),
      S.number('5. 집합 {5, 7} 의 진부분집합의 개수는?', 3, '부분집합 4개 − 자기 자신 1개 = 3개', { base: [5, 7], proper: true }),
      S.number('6. [도전] 두 집합 A = {1, a}, B = {1, 3} 에 대하여 A ⊂ B 이고 B ⊂ A 일 때, a 의 값은?', 3, 'A ⊂ B 이고 B ⊂ A → A = B → a = 3', { solveB: [1, 3] }),
    ],
    2: [
      S.blanks('1. □ 안에 ⊂ 또는 ⊄ 를 쓰시오.', [{ left: '{2, 4}', right: '{2, 4, 6}', answer: '⊂' }, { left: '{2, 5}', right: '{2, 4, 6}', answer: '⊄' }], S.SUB, '{2, 4} 의 원소는 모두 있다 → ⊂, 5 는 없다 → ⊄', { pairs: [[[2, 4], [2, 4, 6]], [[2, 5], [2, 4, 6]]] }),
      ITEM2(['① 1 ∈ {1, 2}', '② {1} ∈ {1, 2}', '③ ∅ ⊂ {1, 2}', '④ {1, 2} ⊂ {1, 2}'], 1),
      S.blanks('3. □ 안에 = 또는 ≠ 를 쓰시오.', [{ left: '{x | x는 4의 약수}', right: '{1, 2, 4}', answer: '=' }], S.EQ, '4의 약수 = {1, 2, 4} → =', { cond: 'div4', b: [1, 2, 4] }),
      S.subsets('4. 집합 {2, 8} 의 부분집합을 모두 쓰시오.', [2, 8], '∅, {2}, {8}, {2, 8}'),
      S.number('5. 집합 {2, 8} 의 진부분집합의 개수는?', 3, '부분집합 4개 − 자기 자신 1개 = 3개', { base: [2, 8], proper: true }),
      S.number('6. [도전] 두 집합 A = {1, a}, B = {1, 5} 에 대하여 A ⊂ B 이고 B ⊂ A 일 때, a 의 값은?', 5, 'A ⊂ B 이고 B ⊂ A → A = B → a = 5', { solveB: [1, 5] }),
    ],
  };

  const EX_TYPE = { subset: 'subset', counter: 'counter', self: 'self', emptySub: 'emptySub', equal: 'equal', list: 'list', proper: 'proper' };

  DS.Lessons.register({
    id: 'set-03',
    title: '집합 사이의 포함 관계',
    unit: '공통수학2 Ⅱ-1 집합 · 3차시',
    goal: '부분집합의 뜻을 알고 ⊂, ⊄ 로 나타낸다 · 서로 같은 집합을 찾는다 · 부분집합을 모두 구한다',
    parts: {
      elem: { name: '원소', sym: 'a' },
      setA: { name: '집합 A', sym: 'A' },
      setB: { name: '집합 B', sym: 'B' },
      empty: { name: '공집합', sym: '∅' },
    },
    ops: {
      sub: { sym: '⊂', name: '부분집합' },
      nsub: { sym: '⊄', name: '부분집합 아님' },
      and: { sym: '이고', name: '그리고' },
      span: { sym: '⋯', name: '부터 … 까지' },
      minus: { sym: '−', name: '빼기' },
    },
    recipes: [
      { op: 'sub', in: ['part:setA', 'part:setB'], ordered: true, out: { kind: 'card', id: 'subset' } },
      { op: 'nsub', in: ['part:setA', 'part:setB'], ordered: true, out: { kind: 'card', id: 'counter' } },
      { op: 'sub', in: ['part:setA', 'part:setA'], out: { kind: 'card', id: 'self' } },
      { op: 'sub', in: ['part:empty', 'part:setA'], ordered: true, out: { kind: 'card', id: 'emptySub' } },
      { op: 'sub', in: ['part:setB', 'part:setA'], ordered: true, out: { kind: 'part', id: 'subBA' } },
      { op: 'and', in: ['card:subset', 'part:subBA'], out: { kind: 'card', id: 'equal' } },
      { op: 'span', in: ['part:empty', 'part:setA'], ordered: true, out: { kind: 'card', id: 'list' } },
      { op: 'minus', in: ['card:list', 'part:setA'], ordered: true, out: { kind: 'card', id: 'proper' } },
    ],
    midParts: { subBA: { name: '반대 방향 포함', sym: 'B ⊂ A' } },
    mistakes: {
      'sub>part:elem,part:setA': '1 ⊂ {1, 4} (✕). 원소와 집합 사이는 ∈, 집합과 집합 사이가 ⊂ 예요.',
      'sub>part:elem,part:setB': '1 ⊂ {1, 4} (✕). 원소와 집합 사이는 ∈, 집합과 집합 사이가 ⊂ 예요.',
      'sub>part:setA,part:elem': '⊂ 의 양쪽은 모두 집합이어야 해요.',
      'sub>part:setA,part:empty': 'A ⊂ ∅ 은 A 가 공집합일 때만 참이에요. 언제나 참인 것은 거꾸로, ∅ ⊂ A!',
      'nsub>part:setA,part:setA': 'A ⊄ A 는 언제나 거짓이에요. 모든 집합은 자기 자신의 부분집합 (A ⊂ A)!',
      'nsub>part:setB,part:setA': '⊄ 카드는 [A] ⊄ [B] 순서로 벼려요.',
      'and|card:subset,part:setB': '한쪽 방향만으로는 같다고 할 수 없어요. 먼저 [B] ⊂ [A] 로 반대 방향을 만들자.',
      'and|card:subset,part:setA': '한쪽 방향만으로는 같다고 할 수 없어요. 먼저 [B] ⊂ [A] 로 반대 방향을 만들자.',
      'and|card:self,part:subBA': '자기 포함(A ⊂ A)이 아니라 [A ⊂ B] 부분집합 카드와 이어야 해요.',
      'span>part:setA,part:empty': '거꾸로예요! 부분집합은 가장 작은 ∅ 부터 가장 큰 A 자신까지: [∅] ⋯ [A]',
      'span>part:elem,part:setA': '부분집합의 가장 작은 것은 원소 하나가 아니라 공집합 ∅ 이에요.',
      'minus>part:setA,card:list': '거꾸로예요! 부분집합 전체에서 자기 자신 A 를 빼서 진부분집합: [부분집합 탐색] − [A]',
      'minus>card:list,part:empty': '진부분집합은 ∅ 이 아니라 자기 자신 A 를 빼요. ∅ 은 진부분집합에 들어가요!',
    },
    generalMistake(op, keys) {
      if ((op === 'sub' || op === 'nsub') && keys.includes('part:elem')) return '⊂ · ⊄ 는 집합과 집합 사이에만 써요. 원소는 ∈ 로!';
      if (op === 'and') return '"이고"는 [A ⊂ B] 카드와 반대 방향 [B ⊂ A] 를 이어요.';
      if (op === 'span') return '[∅] ⋯ [A]: 가장 작은 부분집합부터 가장 큰 부분집합까지.';
      if (op === 'minus') return '[부분집합 탐색] − [A]: 부분집합 중에서 자기 자신을 빼요.';
      return '';
    },
    cards: {
      subset: { name: '포함 판정', formula: 'A ⊂ B', art: 3, desc: 'A 의 모든 원소가 B 에 속하면 A ⊂ B' },
      counter: { name: '반례 탐지', formula: 'A ⊄ B', art: 4, desc: 'A 에만 있는 원소 하나면 A ⊄ B' },
      self: { name: '자기 포함', formula: 'A ⊂ A', art: 3, desc: '모든 집합은 자기 자신의 부분집합' },
      emptySub: { name: '공집합의 포함', formula: '∅ ⊂ A', art: 2, desc: '공집합은 모든 집합의 부분집합' },
      equal: { name: '서로 같은 집합', formula: 'A ⊂ B 이고 B ⊂ A ⇔ A = B', art: 5, desc: '양쪽 방향으로 포함될 때만 같다' },
      list: { name: '부분집합 탐색', formula: '∅ ⋯ A', art: 6, desc: '0개, 1개, 2개 … 고르며 빠짐없이' },
      proper: { name: '진부분집합', formula: '2ⁿ − 1', art: 6, desc: '부분집합 중 자기 자신을 뺀 것' },
    },
    book: {
      subset: { chain: '[A] ⊂ [B]', hint: 'A 의 모든 원소가 B 에 있다면…' },
      counter: { chain: '[A] ⊄ [B]', hint: '원소가 하나라도 빠지면…' },
      self: { chain: '[A] ⊂ [A]', hint: '자기 자신과 비교하면…' },
      emptySub: { chain: '[∅] ⊂ [A]', hint: '원소가 하나도 없는 집합은 어디에든…' },
      equal: { chain: '[B] ⊂ [A] 를 만든 뒤 [A ⊂ B] 이고 [B ⊂ A]', hint: '양쪽 방향이 모두 포함되면…' },
      list: { chain: '[∅] ⋯ [A]', hint: '가장 작은 부분집합부터 가장 큰 부분집합까지…' },
      proper: { chain: '[부분집합 탐색] − [A]', hint: '부분집합에서 자기 자신만 빼면…' },
    },
    stages: [
      { name: '부분집합', step: 'STEP 1 · 문제 1', intro: '유닛 멤버가 모두 본 그룹에 있으면 → 부분집합 ⊂', cards: ['subset', 'counter'], types: ['subset', 'condSubset', 'counter'], monster: 0 },
      { name: '꼭 기억할 두 가지', step: 'STEP 2', intro: 'A ⊂ A, ∅ ⊂ A. 원소와 집합 사이는 ∈, 집합과 집합 사이는 ⊂', cards: ['self', 'emptySub'], types: ['self', 'emptySub', 'symbol'], monster: 1 },
      { name: '서로 같은 집합', step: 'STEP 3 · 문제 2', intro: 'A ⊂ B 이고 B ⊂ A 일 때 A = B', cards: ['equal'], types: ['equal', 'equalCond'], monster: 2 },
      { name: '부분집합 모두 구하기', step: 'STEP 4 · 문제 3', intro: '0개, 1개, 2개 … 고르는 순서로 빠짐없이. 진부분집합은 자기 자신을 뺀 것', cards: ['list', 'proper'], types: ['list', 'proper'], monster: 0 },
    ],
    typeNames: { subset: '포함 판정', condSubset: '조건제시법 포함', counter: '반례 찾기', self: '자기 포함', emptySub: '공집합의 포함', symbol: '∈ 와 ⊂ 구별', equal: '서로 같은 집합', equalCond: '조건제시법 같은 집합', list: '부분집합 모두', proper: '진부분집합 개수' },
    question,
    example: (cardId, seed) => question(EX_TYPE[cardId], seed),
    COND,
    boss: { title: '3차시 형성평가 · 포함의 성주', items: 6, sets: BOSS, monster: 2 },
  });
})();
