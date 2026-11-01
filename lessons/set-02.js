// 공통수학2 Ⅱ-1 집합 · 2차시 「집합의 표현 · 원소의 개수 · 공집합」 (학습과정 2차시 v3 기준, 2026-10-31 사용자 컨펌)
// 수업 순서: 복습 → 개념1(조건제시법) → 문제1 → 보강 → 개념2(벤 다이어그램) → 문제2 → 개념3(원소의 개수) → 문제3
//           → 개념4(공집합) → 문제4 → 보강 → 형성평가(보스)
// 첫 시도(attempt 0)는 학습지 그대로, 재도전은 숫자를 바꾼 문제. 모든 정답은 tests/lesson2.test.js 에서 독립 검산한다.
// 폰 입력: 원소나열법 → 숫자 골라 담기(multi) · 빈칸 숫자 → 다이얼(number) · 고르기(choice) · O/X(ox)
//          벤 다이어그램 그리기 → 그림 3개 중 고르기 (보기 글자 'venn:이름|원소 글자' 를 화면이 그림으로 그린다)
(function () {
  const S = DS.SetGen;
  const st = (a) => S.setStr(a);
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const sorted = (a) => a.slice().sort((x, y) => x - y);
  const divisors = (n) => range(1, n).filter((x) => n % x === 0);
  const isPrime = (x) => x > 1 && range(2, x - 1).every((d) => x % d);

  // 소문제 도구
  const pickNums = (question, want, max, solution, check) => {
    const options = range(1, max).map(String);
    return { type: 'multi', question, options, answer: want.map((x) => x - 1), solution, check: { ...check, options: range(1, max) } };
  };
  const choose = (question, choices, right, solution, check, r) => {
    const opts = r ? r.shuffle(choices) : choices.slice();
    return { type: 'choice', question, choices: opts, answer: choices[right], answerIndex: opts.indexOf(choices[right]), solution, check: { ...check, right: choices[right] } };
  };
  const ox = (question, answer, solution, check) => ({ type: 'ox', question, answer, solution, check });
  const sym = (question, left, right, answer, solution, check) => ({ type: 'blanks', question, items: [{ left, right, answer }], options: S.IN, solution, check });
  const poly = (b, c) => { // x² + bx + c 를 학습지처럼 쓴다
    const t = (k, v) => (k === 0 ? '' : `${k < 0 ? ' − ' : ' + '}${Math.abs(k) === 1 && v ? '' : Math.abs(k)}${v}`);
    return `x²${t(b, 'x')}${t(c, '')} = 0`;
  };

  // ── 몬스터 ─────────────────────────────────────────────
  const WORDS = [
    { q: '어떤 □에 따라 대상을 분명하게 정할 수 있을 때, 그 대상들의 모임을 □이라고 한다.', c: ['기준 · 집합', '원소 · 집합', '기준 · 원소', '모임 · 원소'], ans: 0, sol: '기준이 분명한 대상들의 모임 → 집합' },
    { q: '집합을 이루는 대상 하나하나를 그 집합의 □라고 한다.', c: ['원소', '기준', '모임', '공집합'], ans: 0, sol: '집합을 이루는 대상 하나하나 → 원소' },
  ];
  const MONSTERS = {
    r0: { title: '복습 · 지난 시간 기억하기', review: true, sprite: 'new:0', make: (a, r) => {
      const w = WORDS[a === 0 ? 0 : r.int(0, 1)];
      const A = a === 0 ? [1, 3, 5] : sorted(r.shuffle(range(1, 9)).slice(0, 3));
      const yes = a === 0 ? 3 : r.pick(A), no = a === 0 ? 4 : r.pick(range(1, 9).filter((x) => !A.includes(x)));
      const n = a === 0 ? 6 : r.pick([4, 8, 9, 10, 12]);
      return [
        choose(w.q, w.c, w.ans, w.sol, { word: w.c[w.ans] }, r),
        sym(`A = ${st(A)} 일 때, □ 안에 ∈ 또는 ∉`, String(yes), 'A', '∈', `${yes} 은(는) A 의 원소 → ∈`, { elem: yes, set: A }),
        sym(`A = ${st(A)} 일 때, □ 안에 ∈ 또는 ∉`, String(no), 'A', '∉', `${no} 은(는) A 에 없다 → ∉`, { elem: no, set: A }),
        pickNums(`${n}의 약수의 집합을 원소나열법으로 — 원소를 모두 고르시오.`, divisors(n), Math.max(10, n), `${n} = ${divisors(n).filter((d) => d * d <= n).map((d) => `${d}×${n / d}`).join(' = ')} → ${st(divisors(n))}`, { divOf: n }),
      ];
    } },
    m1: { title: '문제 1 · 조건제시법', sprite: 'new:2', make: (a, r) => {
      const n = a === 0 ? 12 : r.pick([8, 10, 12, 15, 16, 18, 20]);
      const k = a === 0 ? 5 : r.int(2, 7);
      const d = a === 0 ? 6 : r.pick([4, 8, 9, 10, 12, 14, 15]);
      const [kind, m] = a === 0 ? ['odd', 10] : [r.pick(['odd', 'even']), r.int(6, 10)];
      const par = range(1, m).filter((x) => (kind === 'odd' ? x % 2 === 1 : x % 2 === 0));
      return [
        S.number(`${st(divisors(n))} = {x | x는 □의 약수}`, n, `가장 큰 원소 ${n} 의 약수 → ${n}`, { divSet: divisors(n) }),
        S.number(`{${k}, ${2 * k}, ${3 * k}, …} = {x | x는 □의 배수}`, k, `${k} 씩 커진다 → ${k}의 배수`, { mulSeq: [k, 2 * k, 3 * k] }),
        pickNums(`{x | x는 ${d}의 약수} 를 원소나열법으로 — 원소를 모두 고르시오.`, divisors(d), Math.max(10, d), `${d}의 약수 → ${st(divisors(d))}`, { divOf: d }),
        pickNums(`{x | x는 ${m} 이하의 ${kind === 'odd' ? '홀수' : '짝수'}} 를 원소나열법으로 — 원소를 모두 고르시오.`, par, 10, `→ ${st(par)}`, { parity: [kind, m] }),
      ];
    } },
    s1: { title: '보강 · 한 걸음 더', special: true, sprite: 'new:3', note: '교과서 65쪽 문제 3', make: (a, r) => {
      const [p, q] = a === 0 ? [3, 5] : sorted(r.shuffle(range(1, 9)).slice(0, 2));
      const n = a === 0 ? 100 : r.pick([20, 30, 50, 100]);
      const odd = a === 0 ? true : r() < 0.5;
      const right = odd ? `{1, 3, 5, …, ${n - 1}}` : `{2, 4, 6, …, ${n}}`;
      const wrongs = odd ? [`{1, 3, 5, …, ${n}}`, `{2, 4, 6, …, ${n}}`, `{1, 2, 3, …, ${n - 1}}`] : [`{2, 4, 6, …, ${n - 1}}`, `{1, 3, 5, …, ${n - 1}}`, `{1, 2, 3, …, ${n}}`];
      const k = a === 0 ? 3 : r.int(2, 9);
      return [
        pickNums(`{x | (x − ${p})(x − ${q}) = 0} 을 원소나열법으로 — 원소를 모두 고르시오.`, [p, q], 10, `x − ${p} = 0 또는 x − ${q} = 0 → ${st([p, q])}`, { roots: [p, q] }),
        choose(`{x | x는 ${n} 이하의 ${odd ? '홀수' : '짝수'}} 를 원소나열법으로 바르게 나타낸 것은?`, [right, ...wrongs], 0, `${n} 이하의 ${odd ? '홀수는 마지막이 ' + (n - 1) : '짝수는 마지막이 ' + n} → ${right}`, { listOf: [odd ? 'odd' : 'even', n] }, r),
        S.number(`{${k}, ${2 * k}, ${3 * k}, …} = {x | x는 □의 배수}`, k, `${k} 씩 커진다 → ${k}의 배수`, { mulSeq: [k, 2 * k, 3 * k] }),
      ];
    } },
    m2: { title: '문제 2 · 벤 다이어그램', sprite: 'new:5', make: (a, r) => {
      const B = a === 0 ? [1, 2, 3, 6] : sorted(r.shuffle(range(1, 12)).slice(0, 4));
      const C = a === 0 ? [2, 4, 6, 8, 10] : sorted(r.shuffle(range(1, 10)).slice(0, r.int(3, 5)));
      const drop = a === 0 ? 2 : r.int(0, 3);
      const good = `venn:B|${B.join(' ')}`, comma = `venn:B|${B.join(', ')}`, miss = `venn:B|${B.filter((_, i) => i !== drop).join(' ')}`;
      return [
        choose(`B = ${st(B)} 을 바르게 나타낸 벤 다이어그램은?`, [good, comma, miss], 0, '원소는 간격을 두고 쓰고, 쉼표는 쓰지 않는다. 원소도 빠짐없이!', { vennOf: B }, r),
        pickNums(`[[venn:C|${C.join(' ')}]]위 벤 다이어그램의 집합 C 를 원소나열법으로 — 원소를 모두 고르시오.`, C, 10, `C = ${st(C)}`, { set: C }),
      ];
    } },
    m3: { title: '문제 3 · 원소의 개수', sprite: 'new:1', make: (a, r) => {
      const A = a === 0 ? [3, 6, 9] : (() => { const k = r.int(2, 5), m = r.int(3, 5); return range(1, m).map((i) => i * k); })();
      const n = a === 0 ? 12 : r.pick([6, 8, 9, 10, 16, 18, 20]);
      const pairs = [['{1, 2, 3, …, 100}', '자연수 전체의 집합'], ['{2, 4, 6, …, 50}', '짝수 전체의 집합'], ['{x | x는 10 이하의 자연수}', '{x | x는 3의 배수}']];
      const [fin, inf] = a === 0 ? pairs[0] : r.pick(pairs);
      return [
        S.number(`A = ${st(A)} → n(A) = ?`, A.length, `원소를 하나씩 세면 ${A.length}개`, { set: A }),
        S.number(`A = {x | x는 ${n}의 약수} → n(A) = ?`, divisors(n).length, `${st(divisors(n))} → ${divisors(n).length}개`, { divOf: n }),
        choose('다음 중 무한집합은?', [inf, fin], 0, `${fin} 은 끝이 있는 유한집합, ${inf} 은 원소가 무수히 많다`, { infinite: inf }, r),
      ];
    } },
    m4: { title: '문제 4 · 공집합', sprite: 'new:4', make: (a, r) => {
      const sets = [['{x | x는 1보다 작은 자연수}', '{0}', '{1}'], ['{x | x는 2보다 작은 짝수인 자연수}', '{0}', '{2}'], ['{x | x는 5보다 작은 10의 배수인 자연수}', '{0}', '{10}']];
      const t = a === 0 ? sets[0] : r.pick(sets);
      const oxs = [['집합 {0}은 공집합이다.', false, '{0}은 원소 0이 1개 있다 → 공집합이 아니다'], ['n({0}) = 0 이다.', false, '{0}의 원소는 0 하나 → n({0}) = 1'], ['n(∅) = 0 이다.', true, '공집합은 원소가 하나도 없다 → n(∅) = 0']];
      const o = a === 0 ? oxs[0] : r.pick(oxs);
      return [
        choose('다음 중 공집합인 것은?', t, 0, `${t[0]} 은 원소가 하나도 없다. ${t[1]}·${t[2]} 은 원소가 1개`, { emptyIs: t[0] }, r),
        ox(o[0], o[1], o[2], { claim: o[0] }),
      ];
    } },
    s2: { title: '보강 · 원소의 개수 한 걸음 더', special: true, sprite: 'new:9', note: '교과서 66쪽 문제 5', make: (a, r) => {
      const m = a === 0 ? 10 : r.pick([10, 12, 15, 20]);
      const k = a === 0 ? 4 : r.int(1, 9);
      let b, c, roots;
      if (a === 0) { b = -2; c = -3; roots = [-1, 3]; } else if (r() < 0.3) { const p = r.int(-4, 4); b = -2 * p; c = p * p; roots = [p]; } else { let p = r.int(-5, 5), q = r.int(-5, 5); if (p === q) q = p + 1; b = -(p + q); c = p * q; roots = sorted([p, q]); }
      return [
        S.number(`A = {x | x는 ${m} 이하의 소수} → n(A) = ?`, range(1, m).filter(isPrime).length, `${st(range(1, m).filter(isPrime))} → ${range(1, m).filter(isPrime).length}개 (1은 소수가 아니다)`, { primesUpTo: m }),
        S.number(`A = {x | x는 x² = −${k}인 실수} → n(A) = ?`, 0, `실수를 제곱하면 0 이상 → 그런 x 는 없다 → 공집합, n(A) = 0`, { negSquare: k }),
        S.number(`A = {x | ${poly(b, c)}} → n(A) = ?`, roots.length, roots.length === 1 ? `(x ${roots[0] < 0 ? '+' : '−'} ${Math.abs(roots[0])})² = 0 → x = ${roots[0]} 하나 → 1개` : `인수분해 → x = ${roots.join(', ')} → 2개`, { quad: [b, c] }),
      ];
    } },
  };

  // ── 형성평가 (보스) — 세트1: 학습지 그대로, 세트2: 숫자를 바꾼 재도전 ──
  const pick1 = (question, choices, right, solution) => ({ type: 'choice', question, choices, answerIndex: right, answer: choices[right], solution });
  const multiNums = (question, want, max, solution) => ({ type: 'multi', question, options: range(1, max).map(String), answer: want.map((x) => x - 1), solution, check: { set: want } });
  const BOSS = {
    1: [
      pick1('1. 집합 {1, 2, 4, 8}을 조건제시법으로 바르게 나타낸 것은?', ['① {x | x는 8의 배수}', '② {x | x는 8의 약수}', '③ {x | x는 8 이하의 짝수}'], 1, '1, 2, 4, 8 은 모두 8의 약수 (①은 8의 배수, ③은 {2, 4, 6, 8})'),
      multiNums('2. {x | x는 10 이하의 홀수}를 원소나열법으로 — 원소를 모두 고르시오.', [1, 3, 5, 7, 9], 10, '{1, 3, 5, 7, 9}'),
      pick1('3. [[venn:A|a b c d]]위 벤 다이어그램의 집합 A 와 n(A) 는?', ['A = {a, b, c, d}, n(A) = 4', 'A = {a, b, c, d}, n(A) = 5', 'A = {a b c d}, n(A) = 4', 'A = {a, b, c}, n(A) = 3'], 0, '원소나열법은 쉼표로 → {a, b, c, d}, 원소 4개'),
      pick1('4. 다음 중 공집합인 것은?', ['① {0}', '② {x | x는 1보다 작은 자연수}', '③ {1}'], 1, '1보다 작은 자연수는 없다 → 공집합'),
      pick1('5. n(∅) 의 값과 집합 {0}의 원소의 개수 n({0}) 은?', ['0, 1', '0, 0', '1, 1', '1, 0'], 0, 'n(∅) = 0, {0}은 원소 0이 하나 → 1'),
    ],
    2: [
      pick1('1. 집합 {1, 3, 9}를 조건제시법으로 바르게 나타낸 것은?', ['① {x | x는 9의 배수}', '② {x | x는 9의 약수}', '③ {x | x는 9 이하의 홀수}'], 1, '1, 3, 9 는 모두 9의 약수 (③은 {1, 3, 5, 7, 9})'),
      multiNums('2. {x | x는 8 이하의 짝수}를 원소나열법으로 — 원소를 모두 고르시오.', [2, 4, 6, 8], 10, '{2, 4, 6, 8}'),
      pick1('3. [[venn:B|p q r]]위 벤 다이어그램의 집합 B 와 n(B) 는?', ['B = {p, q, r}, n(B) = 3', 'B = {p q r}, n(B) = 3', 'B = {p, q, r}, n(B) = 4', 'B = {p, q}, n(B) = 2'], 0, '쉼표로 → {p, q, r}, 원소 3개'),
      pick1('4. 다음 중 공집합인 것은?', ['① {0}', '② {1}', '③ {x | x는 3보다 작은 3의 배수인 자연수}'], 2, '3보다 작은 자연수 1, 2 는 3의 배수가 아니다 → 공집합'),
      pick1('5. n({1, 2}) 와 n(∅) 의 값은?', ['2, 0', '2, 1', '3, 0', '1, 0'], 0, '{1, 2} → 2개, ∅ → 0개'),
    ],
  };

  const STEPS = [
    { kind: 'monster', id: 'r0' },
    { kind: 'concept', id: 'c1', title: '개념 1 · 조건제시법', say: '원소들의 공통된 성질(조건)을 제시하는 방법: {x | x는 8의 약수}. 조건제시법은 답이 여러 가지일 수 있다' },
    { kind: 'monster', id: 'm1' },
    { kind: 'monster', id: 's1' },
    { kind: 'concept', id: 'c2', title: '개념 2 · 벤 다이어그램', say: '집합을 그림으로 나타낸 것. 원소는 간격을 두고 쓰고, 쉼표는 쓰지 않는다' },
    { kind: 'monster', id: 'm2' },
    { kind: 'concept', id: 'c3', title: '개념 3 · 원소의 개수', say: '원소가 유한개 → 유한집합, 무수히 많음 → 무한집합. 유한집합 A 의 원소의 개수 → n(A)' },
    { kind: 'monster', id: 'm3' },
    { kind: 'concept', id: 'c4', title: '개념 4 · 공집합', say: '원소가 하나도 없는 집합 → 공집합 ∅, n(∅) = 0. {0}은 원소 0이 있으니 공집합이 아니다' },
    { kind: 'monster', id: 'm4' },
    { kind: 'monster', id: 's2' },
    { kind: 'boss', id: 'boss', title: '형성평가 · 숲의 수호자' },
  ];
  STEPS.forEach((s) => { if (s.kind === 'monster') Object.assign(s, { title: MONSTERS[s.id].title, special: !!MONSTERS[s.id].special, review: !!MONSTERS[s.id].review }); });

  DS.Lessons.register({
    id: 'set-02', no: 2,
    title: '집합의 표현 · 원소의 개수 · 공집합',
    unit: '공통수학2 Ⅱ-1 집합 · 2차시',
    sheet: '학습과정 2차시 v3',
    // 수업 준비에서 이 학습지 PDF 를 올리면 [개념] 칸마다 잘라 넣는 위치 (A4 쪽 비율 0~1, 여러 칸이면 위아래로 이어 붙임)
    crops: { c1: [{ p: 1, x: 0.0426, y: 0.2721, w: 0.4458, h: 0.2258 }], c2: [{ p: 1, x: 0.5116, y: 0.2191, w: 0.4458, h: 0.1253 }], c3: [{ p: 2, x: 0.0426, y: 0.0984, w: 0.4458, h: 0.1874 }], c4: [{ p: 2, x: 0.0426, y: 0.4241, w: 0.4458, h: 0.1818 }],
      // 문제 · 보강 · 형성평가 (교사 「📄 문제 화면」 해설용)
      r0: [{ p: 1, x: 0.0426, y: 0.1245, w: 0.4458, h: 0.1431 }], m1: [{ p: 1, x: 0.0426, y: 0.4961, w: 0.4458, h: 0.1836 }], s1: [{ p: 1, x: 0.5116, y: 0.1245, w: 0.4458, h: 0.0964 }], m2: [{ p: 1, x: 0.5116, y: 0.3427, w: 0.4458, h: 0.1818 }], m3: [{ p: 2, x: 0.0426, y: 0.284, w: 0.4458, h: 0.1357 }], m4: [{ p: 2, x: 0.0426, y: 0.6042, w: 0.4458, h: 0.0482 }], s2: [{ p: 2, x: 0.5116, y: 0.0984, w: 0.4458, h: 0.1129 }], boss: [{ p: 2, x: 0.5116, y: 0.2095, w: 0.4458, h: 0.4271 }] },
    goal: '조건제시법과 벤 다이어그램으로 집합을 나타낸다 · 유한집합·무한집합, n(A), 공집합을 말한다',
    theme: '02-deep-forest',
    defaultPct: 90,
    steps: STEPS,
    monsters: MONSTERS,
    items(id, seed, attempt) { return MONSTERS[id].make(attempt, DS.Rng(`${seed}|${id}|${attempt}`)); },
    boss: { title: '2차시 형성평가 · 숲의 수호자', sprite: 'new:6', items: 5, hpItems: 5, sets: BOSS },
  });
})();
