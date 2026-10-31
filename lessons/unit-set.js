// 집합 단원 연성법 (모루 · 대장간 번외 특전) — "Citadel-MATH 집합 단원 연성법" 초안을 따른다.
// 원칙: 원리를 유도하지 않고 기호를 바르게 써 보고 외우는 연성 · 모든 카드는 연산을 한 번 이상 거친다 · 순서·자리가 뜻을 바꾼다(엄격 연성).
// 열리는 범위: 반마다 교사가 배포한 차시까지 (unlock/{반}). 2차시 배포 → 01 집합(1~2차시) 7장, 3차시 배포 → + 02 포함 관계 8장.
// 등급: 1 일반(흰색) · 2 매직(파랑) · 3 레어(보라). 카드는 공격에 쓰지 않는다 (꾸미기 특전만).
window.DS = window.DS || {};

DS.Unit = (function () {
  // 재료 (모두 무한 · 차시와 상관없이 전부)
  const MATS = [
    { id: 'a', sym: 'a', tip: '원소' }, { id: '0', sym: '0', tip: '숫자 0' }, { id: 'A', sym: 'A', tip: '집합' }, { id: 'B', sym: 'B', tip: '집합' },
    { id: 'C', sym: 'C', tip: '집합' }, { id: 'U', sym: 'U', tip: '전체집합' }, { id: 'E', sym: '∅', tip: '공집합' }, { id: 'P', sym: 'x는 ○○', tip: '성질 (조건)' },
  ];
  // 연산: no = 열리는 차시 번호 (1~2차시 것은 2차시 배포 때 함께 열림), unary = 한 칸 연산
  const OPS = [
    { id: 'in', sym: '∈', no: 2 }, { id: 'notin', sym: '∉', no: 2 }, { id: 'brace', sym: '{ }', no: 2, unary: true }, { id: 'build', sym: '{x | ·}', no: 2, unary: true },
    { id: 'circle', sym: '◯', no: 2, unary: true }, { id: 'n', sym: 'n( )', no: 2, unary: true },
    { id: 'sub', sym: '⊂', no: 3 }, { id: 'nsub', sym: '⊄', no: 3 }, { id: 'eq', sym: '=', no: 3 }, { id: 'neq', sym: '≠', no: 3 }, { id: 'and', sym: '이고', no: 3 }, { id: 'to', sym: '⋯', no: 3 },
    { id: 'cap', sym: '∩', no: 4 }, { id: 'cup', sym: '∪', no: 4 }, { id: 'plus', sym: '+', no: 4 }, { id: 'paren', sym: '( )', no: 4, unary: true },
    { id: 'comp', sym: 'ᶜ', no: 6, unary: true }, { id: 'minus', sym: '−', no: 6 },
  ];
  const q = (o) => o; // 예제(마력) 문제: DS.Quiz 형식
  // 카드: in = [왼쪽, 오른쪽] (한 칸 연산은 [재료]), ordered = 순서 엄격, card:id = 내가 가진 카드를 재료로
  const CARDS = [
    // ── 01 집합 (1~2차시 · 교과서 64~66쪽) ──
    { id: 'belong', no: 2, sec: '01 집합', name: '속한다', fm: 'a ∈ A', desc: 'a는 집합 A에 속한다', grade: 1, art: 0, page: '65쪽', op: 'in', in: ['a', 'A'], ordered: true, hint: '원소가 집합 안에 쏙 들어간다',
      ex: q({ type: 'choice', question: '3 □ {1, 2, 3} — □ 에 알맞은 기호는?', choices: ['∈', '∉'], answerIndex: 0, solution: '3은 {1, 2, 3}의 원소 → 3 ∈ {1, 2, 3}' }) },
    { id: 'notbelong', no: 2, sec: '01 집합', name: '속하지 않는다', fm: 'b ∉ A', desc: 'b는 집합 A에 속하지 않는다', grade: 1, art: 0, flip: true, page: '65쪽', op: 'notin', in: ['a', 'A'], ordered: true, hint: '원소가 집합 밖에 있다',
      ex: q({ type: 'choice', question: '4 □ {1, 2, 3} — □ 에 알맞은 기호는?', choices: ['∈', '∉'], answerIndex: 1, solution: '4는 {1, 2, 3}에 없다 → 4 ∉ {1, 2, 3}' }) },
    { id: 'roster', no: 2, sec: '01 집합', name: '원소나열법', fm: '{1, 2, 4, 8}', desc: '원소를 모두 적는다 (순서·중복 X)', grade: 1, art: 6, page: '65쪽', op: 'brace', in: ['a'], hint: '원소를 중괄호에 하나씩 넣어 보자',
      ex: q({ type: 'choice', question: '6의 약수의 집합을 원소나열법으로 바르게 나타낸 것은?', choices: ['{2, 3}', '{1, 2, 3, 6}', '{1, 2, 3, 4, 6}'], answerIndex: 1, solution: '6의 약수: 1, 2, 3, 6' }) },
    { id: 'builder', no: 2, sec: '01 집합', name: '조건제시법', fm: '{x | x는 8의 약수}', desc: '원소들의 공통된 성질로 나타낸다', grade: 1, art: 4, page: '65쪽', op: 'build', in: ['P'], hint: '성질(조건)을 중괄호에 담아 보자',
      ex: q({ type: 'choice', question: '{1, 2, 4, 8} 을 조건제시법으로 나타내면?', choices: ['{x | x는 8의 배수}', '{x | x는 8의 약수}', '{x | x는 8 이하의 짝수}'], answerIndex: 1, solution: '1, 2, 4, 8 은 모두 8의 약수' }) },
    { id: 'venn', no: 2, sec: '01 집합', name: '벤 다이어그램', fm: '◯ 1 2 4 8', desc: '집합을 원 안에 원소로 그린 그림', grade: 1, art: 3, page: '66쪽', op: 'circle', in: ['A'], hint: '집합을 동그라미 안에 그려 보자',
      ex: q({ type: 'choice', question: '벤 다이어그램에 원소를 쓸 때 쓰지 않는 것은?', choices: ['원소', '쉼표( , )', '집합의 이름'], answerIndex: 1, solution: '원소는 간격을 두고 쓰고, 쉼표는 쓰지 않는다' }) },
    { id: 'count', no: 2, sec: '01 집합', name: '원소의 개수', fm: 'n(A)', desc: '유한집합 A의 원소의 개수', grade: 1, art: 1, page: '66쪽', op: 'n', in: ['A'], hint: '집합의 원소를 세어 보자',
      ex: q({ type: 'number', question: 'A = {3, 6, 9} 일 때 n(A) = ?', answer: 3, solution: '원소 3, 6, 9 → 3개' }) },
    { id: 'empty', no: 2, sec: '01 집합', name: '공집합', fm: '∅ , n(∅) = 0', desc: '원소가 하나도 없는 집합', grade: 1, art: 2, page: '66쪽', op: 'n', in: ['E'], hint: '아무것도 없는 집합을 세면?',
      ex: q({ type: 'ox', question: 'n(∅) = 0 이다.', answer: true, solution: '공집합은 원소가 하나도 없다 → 0' }) },
    // ── 02 집합 사이의 포함 관계 (3차시 · 67~68쪽) ──
    { id: 'subset', no: 3, sec: '02 포함 관계', name: '부분집합', fm: 'A ⊂ B', desc: 'A의 모든 원소가 B에 속한다', grade: 1, art: 3, page: '67쪽', op: 'sub', in: ['A', 'B'], ordered: true, hint: '작은 집합이 큰 집합 안에',
      ex: q({ type: 'choice', question: '{1, 2} □ {1, 2, 3}', choices: ['⊂', '⊄'], answerIndex: 0, solution: '1, 2 가 모두 {1, 2, 3}에 있다' }) },
    { id: 'notsubset', no: 3, sec: '02 포함 관계', name: '부분집합이 아니다', short: '부분집합 X', fm: 'A ⊄ B', desc: 'A의 원소 중 B에 없는 것이 있다', grade: 1, art: 3, flip: true, page: '67쪽', op: 'nsub', in: ['A', 'B'], ordered: true, hint: 'A의 원소가 B에 없을 때',
      ex: q({ type: 'choice', question: '{2, 5} □ {1, 2, 3, 4}', choices: ['⊂', '⊄'], answerIndex: 1, solution: '5 가 {1, 2, 3, 4}에 없다' }) },
    { id: 'self', no: 3, sec: '02 포함 관계', name: '자기 자신의 부분집합', short: '자기 자신 ⊂', fm: 'A ⊂ A', desc: '모든 집합은 자기 자신의 부분집합', grade: 1, art: 2, page: '67쪽', op: 'sub', in: ['A', 'A'], ordered: true, hint: '나는 나에게 포함될까?',
      ex: q({ type: 'ox', question: '모든 집합은 자기 자신의 부분집합이다.', answer: true, solution: 'A ⊂ A' }) },
    { id: 'emptysub', no: 3, sec: '02 포함 관계', name: '공집합은 모든 집합의 부분집합', short: '∅의 포함', fm: '∅ ⊂ A', desc: '∅은 어떤 집합에도 포함된다', grade: 1, art: 2, flip: true, page: '67쪽', op: 'sub', in: ['E', 'A'], ordered: true, hint: '아무것도 없는 집합은 어디에나',
      ex: q({ type: 'ox', question: '∅ ⊂ {1, 2} 이다.', answer: true, solution: '공집합은 모든 집합의 부분집합' }) },
    { id: 'equal', no: 3, sec: '02 포함 관계', name: '서로 같은 집합', fm: 'A = B', desc: 'A ⊂ B 이고 B ⊂ A', grade: 1, art: 5, page: '68쪽', op: 'eq', in: ['A', 'B'], hint: '원소가 모두 같다면',
      ex: q({ type: 'choice', question: '{1, 2, 3} □ {3, 1, 2}', choices: ['=', '≠'], answerIndex: 0, solution: '순서만 다르고 원소는 같다' }) },
    { id: 'notequal', no: 3, sec: '02 포함 관계', name: '서로 같지 않은 집합', short: '같지 않은 집합', fm: 'A ≠ B', desc: '두 집합의 원소가 다르다', grade: 1, art: 5, flip: true, page: '68쪽', op: 'neq', in: ['A', 'B'], hint: '두 집합이 다를 때',
      ex: q({ type: 'choice', question: '{1, 2} □ {1, 2, 3}', choices: ['=', '≠'], answerIndex: 1, solution: '3 이 왼쪽에 없다' }) },
    { id: 'proper', no: 3, sec: '02 포함 관계', name: '진부분집합', fm: 'A ⊂ B 이고 A ≠ B', desc: '부분집합 중에서 자기 자신을 뺀 것', grade: 2, art: 7, page: '68쪽', op: 'and', in: ['card:subset', 'card:notequal'], hint: '부분집합인데 같지는 않다면?',
      ex: q({ type: 'number', question: '집합 {1, 2, 3}의 진부분집합의 개수는?', answer: 7, solution: '부분집합 8개 − 자기 자신 1개 = 7' }) },
    { id: 'allsub', no: 3, sec: '02 포함 관계', name: '부분집합 모두 구하기', short: '부분집합 모두', fm: '∅, {a}, {b}, {a, b}', desc: '원소를 0개, 1개, 2개 … 골라', grade: 2, art: 7, flip: true, page: '68쪽', op: 'to', in: ['E', 'A'], ordered: true, hint: '가장 작은 것부터 가장 큰 것까지',
      ex: q({ type: 'number', question: '집합 {a, b}의 부분집합의 개수는?', answer: 4, solution: '∅, {a}, {b}, {a, b}' }) },
  ];
  // 엄격 연성 실수 메시지 (op|왼쪽,오른쪽 — 순서 그대로)
  const MISTAKES = {
    'in|A,a': '순서가 거꾸로예요. 원소가 왼쪽, 집합이 오른쪽: a ∈ A',
    'notin|A,a': '순서가 거꾸로예요. 원소가 왼쪽, 집합이 오른쪽: a ∉ A',
    'in|A,B': '∈ 는 원소와 집합 사이에만 써요. 집합과 집합 사이는 ⊂ !',
    'in|B,A': '∈ 는 원소와 집합 사이에만 써요. 집합과 집합 사이는 ⊂ !',
    'sub|a,A': 'a ⊂ A (✕). 원소와 집합 사이는 ∈ , 집합과 집합 사이가 ⊂ 예요.',
    'eq|0,E': '0 은 숫자, ∅ 은 원소가 없는 집합이에요. {0} 은 원소가 1개 — 공집합이 아니에요.',
    'eq|E,0': '0 은 숫자, ∅ 은 원소가 없는 집합이에요. {0} 은 원소가 1개 — 공집합이 아니에요.',
    'sub|A,E': 'A ⊂ ∅ 은 A 가 공집합일 때만 참이에요. 언제나 참인 것은 거꾸로 ∅ ⊂ A !',
    'nsub|A,A': 'A ⊄ A 는 언제나 거짓! 모든 집합은 자기 자신의 부분집합 (A ⊂ A).',
    'sub|B,A': '기호의 왼쪽이 포함되는 집합이에요. 이번 카드는 A 를 왼쪽에: A ⊂ B',
    'nsub|B,A': '기호의 왼쪽이 포함되는 집합이에요. 이번 카드는 A 를 왼쪽에: A ⊄ B',
    'to|A,E': '거꾸로예요! 부분집합은 가장 작은 ∅ 부터 가장 큰 A 까지: [∅] ⋯ [A]',
    'to|a,A': '가장 작은 부분집합은 원소 하나가 아니라 공집합 ∅ 이에요.',
    'and|card:subset,card:equal': 'A ⊂ B 이고 A = B 면 자기 자신이에요. 진부분집합은 서로 같지 않을 때(≠)!',
    'and|card:equal,card:subset': 'A ⊂ B 이고 A = B 면 자기 자신이에요. 진부분집합은 서로 같지 않을 때(≠)!',
    'n|0': '0 은 숫자예요. 원소가 없는 집합은 ∅ — n(∅) 를 만들어 보자.',
    'brace|A': '{ } 안에는 원소를 넣어요. 집합 A 는 이미 집합이에요.',
  };
  const card = (id) => CARDS.find((c) => c.id === id);
  const opOf = (id) => OPS.find((o) => o.id === id);
  const opens = (no) => CARDS.filter((c) => c.no <= no); // 배포한 차시까지 열린 카드
  // 연성 판정: left/right = 재료 id 또는 'card:id' (한 칸 연산은 둘 중 하나만)
  function forge(op, left, right, no) {
    const o = opOf(op);
    if (!o) return { ok: false, msg: '가운데 칸에 연산을 올려요.' };
    if (o.no > no) return { ok: false, msg: `${o.sym} 는 아직 배우지 않은 연산이에요.` };
    const mats = [left, right].filter(Boolean);
    if (o.unary && mats.length !== 1) return { ok: false, msg: `${o.sym} 는 재료 하나에만 씌워요.` };
    if (!o.unary && (!left || !right)) return { ok: false, msg: `${o.sym} 는 왼쪽 칸과 오른쪽 칸에 재료가 하나씩 필요해요.` };
    const key = `${op}|${mats.join(',')}`;
    for (const c of CARDS) {
      if (c.op !== op) continue;
      const hit = c.ordered || c.in.length === 1 ? mats.join(',') === c.in.join(',') : mats.slice().sort().join(',') === c.in.slice().sort().join(',');
      if (!hit) continue;
      if (c.no > no) return { ok: false, msg: '아직 열리지 않은 레시피예요. 선생님이 다음 차시를 열면 만들 수 있어요.' };
      return { ok: true, card: c };
    }
    return { ok: false, msg: MISTAKES[key] || '이 조합으로는 개념이 되지 않아요. 도감의 힌트를 보세요.' };
  }
  return { MATS, OPS, CARDS, MISTAKES, card, opOf, opens, forge, GRADES: { 1: '일반', 2: '매직', 3: '레어' } };
})();
