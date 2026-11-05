// 집합 단원 연성법 (모루 · 대장간 번외 특전) — "Citadel-MATH 집합 단원 연성법" 초안을 따른다.
// 원칙: 원리를 유도하지 않고 기호를 바르게 써 보고 외우는 연성 · 모든 카드는 연산을 한 번 이상 거친다 · 순서·자리가 뜻을 바꾼다(엄격 연성).
// 열리는 범위: 반마다 교사가 배포한 차시까지 (unlock/{반}). 2차시 7장 · 3차시 +9장 · 4차시 +6 · 5차시 +8 · 6차시 +6 · 7차시 +6 · 8차시 +6 · 9차시 +4 · 10차시 +2 = 53장 (2026-11-03)
// 두 가지로 만들 수 있는 카드는 alt 에 두 번째 연성식 (다른 연산이어도 됨)
// mf = 이 카드를 다른 카드의 재료로 올릴 때 보이는 수식 (없으면 fm) — 2026-11-05 사용자: 재료 칸은 한글 이름 대신 수식으로 (속한다 → a ∈ A)
// 등급: 1 일반(흰색) · 2 매직(파랑) · 3 레어(보라). 카드는 공격에 쓰지 않는다 (꾸미기 특전만).
window.DS = window.DS || {};

DS.Unit = (function () {
  // 재료 (모두 무한 · 차시와 상관없이 전부)
  const MATS = [
    { id: 'a', sym: 'a', tip: '원소' }, { id: '0', sym: '0', tip: '숫자 0' }, { id: 'A', sym: 'A', tip: '집합' }, { id: 'B', sym: 'B', tip: '집합' },
    { id: 'C', sym: 'C', tip: '집합' }, { id: 'U', sym: 'U', tip: '전체집합' }, { id: 'E', sym: '∅', tip: '공집합' }, { id: 'P', sym: 'x는 ○○', tip: '성질 (조건)' },
    // 2026-11-03 명제 단원 재료 (6~10차시)
    { id: 'S', sym: '○○이다', tip: '문장' }, { id: 'p', sym: 'p', tip: '조건 · 명제 p' }, { id: 'q', sym: 'q', tip: '조건 · 명제 q' }, { id: 'I', sym: '부등식', tip: '부등식 (예: x² ≥ 0)' }, { id: 'X', sym: '모순', tip: '모순 (말이 안 되는 결론)' },
  ];
  // 연산: no = 열리는 차시 번호 (1~2차시 것은 2차시 배포 때 함께 열림), unary = 한 칸 연산
  const OPS = [
    { id: 'in', sym: '∈', no: 2 }, { id: 'notin', sym: '∉', no: 2 }, { id: 'brace', sym: '{ }', no: 2, unary: true }, { id: 'build', sym: '{x | ·}', no: 2, unary: true },
    { id: 'circle', sym: '◯', no: 2, unary: true }, { id: 'n', sym: 'n( )', no: 2, unary: true },
    { id: 'sub', sym: '⊂', no: 3 }, { id: 'nsub', sym: '⊄', no: 3 }, { id: 'eq', sym: '=', no: 3 }, { id: 'neq', sym: '≠', no: 3 }, { id: 'and', sym: '이고', no: 3 }, { id: 'to', sym: '⋯', no: 3 },
    { id: 'cap', sym: '∩', no: 4 }, { id: 'cup', sym: '∪', no: 4 },
    { id: 'paren', sym: '( )', no: 5, unary: true }, { id: 'comp', sym: 'ᶜ', no: 5, unary: true }, { id: 'minus', sym: '−', no: 5 }, // 2026-11-03: 여집합 · 차집합은 5차시에 배움 (예전 6 → 5) · 쓰지 않던 + 는 뺌
    { id: 'tf', sym: '참·거짓?', no: 6, unary: true }, { id: 'not', sym: '~', no: 6, unary: true },
    { id: 'all', sym: '모든', no: 7, unary: true }, { id: 'some', sym: '어떤', no: 7, unary: true },
    { id: 'then', sym: '→', no: 8 }, { id: 'imp', sym: '⇒', no: 9 }, { id: 'iff', sym: '⇔', no: 9 },
  ];
  const q = (o) => o; // 예제(마력) 문제: DS.Quiz 형식
  // 카드: in = [왼쪽, 오른쪽] (한 칸 연산은 [재료]), ordered = 순서 엄격, card:id = 내가 가진 카드를 재료로
  const CARDS = [
    // ── 01 집합 (1~2차시 · 교과서 64~66쪽) ──
    { id: 'belong', no: 2, sec: '01 집합', name: '속한다', fm: 'a ∈ A', desc: 'a는 집합 A에 속한다', grade: 1, art: 0, page: '65쪽', op: 'in', in: ['a', 'A'], ordered: true, hint: '원소가 집합 안에 쏙 들어간다',
      ex: q({ type: 'choice', question: '3 □ {1, 2, 3} — □ 에 알맞은 기호는?', choices: ['∈', '∉'], answerIndex: 0, solution: '3은 {1, 2, 3}의 원소 → 3 ∈ {1, 2, 3}' }) },
    { id: 'notbelong', mf: 'a ∉ A', no: 2, sec: '01 집합', name: '속하지 않는다', fm: 'b ∉ A', desc: 'b는 집합 A에 속하지 않는다', grade: 1, art: 0, flip: true, page: '65쪽', op: 'notin', in: ['a', 'A'], ordered: true, hint: '원소가 집합 밖에 있다',
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
    { id: 'equal', no: 3, sec: '02 포함 관계', name: '서로 같은 집합', fm: 'A = B', desc: 'A ⊂ B 이고 B ⊂ A', grade: 1, art: 5, page: '68쪽', op: 'eq', in: ['A', 'B'], alt: [{ op: 'and', in: ['card:subset', 'card:subset'] }], hint: '원소가 모두 같다면',
      ex: q({ type: 'choice', question: '{1, 2, 3} □ {3, 1, 2}', choices: ['=', '≠'], answerIndex: 0, solution: '순서만 다르고 원소는 같다' }) },
    { id: 'notequal', no: 3, sec: '02 포함 관계', name: '서로 같지 않은 집합', short: '같지 않은 집합', fm: 'A ≠ B', desc: '두 집합의 원소가 다르다', grade: 1, art: 5, flip: true, page: '68쪽', op: 'neq', in: ['A', 'B'], hint: '두 집합이 다를 때',
      ex: q({ type: 'choice', question: '{1, 2} □ {1, 2, 3}', choices: ['=', '≠'], answerIndex: 1, solution: '3 이 왼쪽에 없다' }) },
    { id: 'proper', no: 3, sec: '02 포함 관계', name: '진부분집합', fm: 'A ⊂ B 이고 A ≠ B', desc: '부분집합 중에서 자기 자신을 뺀 것', grade: 2, art: 7, page: '68쪽', op: 'and', in: ['card:subset', 'card:notequal'], hint: '부분집합인데 같지는 않다면?',
      ex: q({ type: 'number', question: '집합 {1, 2, 3}의 진부분집합의 개수는?', answer: 7, solution: '부분집합 8개 − 자기 자신 1개 = 7' }) },
    { id: 'allsub', mf: '∅,{a},{b},{a,b}', no: 3, sec: '02 포함 관계', name: '부분집합 모두 구하기', short: '부분집합 모두', fm: '∅, {a}, {b}, {a, b}', desc: '원소를 0개, 1개, 2개 … 골라', grade: 2, art: 7, flip: true, page: '68쪽', op: 'to', in: ['E', 'A'], ordered: true, hint: '가장 작은 것부터 가장 큰 것까지',
      ex: q({ type: 'number', question: '집합 {a, b}의 부분집합의 개수는?', answer: 4, solution: '∅, {a}, {b}, {a, b}' }) },
    { id: 'subcount', no: 3, sec: '02 포함 관계', name: '부분집합의 개수', short: '부분집합 개수', fm: '2ⁿ개 · 반드시 포함 2ⁿ⁻ᵖ · 포함 안 함 2ⁿ⁻ᑫ', desc: '원소가 하나 늘 때마다 부분집합은 2배', grade: 2, art: 1, page: '3차시 학습지', op: 'n', in: ['card:allsub'], hint: '모두 구한 부분집합을 세어 보면?',
      ex: q({ type: 'number', question: '집합 {a, b, c, d}의 부분집합의 개수는?', answer: 16, solution: '원소 4개 → 2⁴ = 16' }) },
    // ── 03 집합의 연산 (4~6차시) ──
    { id: 'inter', no: 4, sec: '03 집합의 연산', name: '교집합', fm: 'A ∩ B', desc: 'A와 B에 모두 속하는 원소의 집합', grade: 1, art: 3, page: '4차시 학습지', op: 'cap', in: ['A', 'B'], hint: '두 집합에 함께 있는 원소만',
      ex: q({ type: 'choice', question: 'A = {1, 2, 3}, B = {2, 3, 4} 일 때 A ∩ B 는?', choices: ['{2, 3}', '{1, 2, 3, 4}', '{1, 4}'], answerIndex: 0, solution: '둘 다 있는 원소 → {2, 3}' }) },
    { id: 'union', no: 4, sec: '03 집합의 연산', name: '합집합', fm: 'A ∪ B', desc: 'A 또는 B에 속하는 원소의 집합', grade: 1, art: 3, flip: true, page: '4차시 학습지', op: 'cup', in: ['A', 'B'], hint: '두 집합을 모두 모으면 (겹치면 한 번만)',
      ex: q({ type: 'choice', question: 'A = {1, 2, 3}, B = {2, 3, 4} 일 때 A ∪ B 는?', choices: ['{2, 3}', '{1, 2, 3, 4}', '{1, 2, 3, 2, 3, 4}'], answerIndex: 1, solution: '모두 모으고 겹친 2, 3 은 한 번만 → {1, 2, 3, 4}' }) },
    { id: 'disjoint', no: 4, sec: '03 집합의 연산', name: '서로소', fm: 'A ∩ B = ∅', desc: '공통인 원소가 하나도 없는 두 집합', grade: 2, art: 2, page: '4차시 학습지', op: 'eq', in: ['card:inter', 'E'], hint: '함께 있는 원소가 하나도 없다면?',
      ex: q({ type: 'ox', question: '{1, 3} 과 {2, 4} 는 서로소이다.', answer: true, solution: '공통인 원소가 없다 → {1, 3} ∩ {2, 4} = ∅' }) },
    { id: 'incl', no: 4, sec: '03 집합의 연산', name: '포함과 연산', fm: 'A ⊂ B 이면 A ∩ B = A, A ∪ B = B', desc: '작은 집합이 큰 집합에 들어 있을 때', grade: 2, art: 3, page: '4차시 학습지', op: 'and', in: ['card:subset', 'card:inter'], alt: [{ op: 'and', in: ['card:subset', 'card:union'] }], hint: 'A가 B 안에 있으면 둘의 ∩ · ∪ 는?',
      ex: q({ type: 'choice', question: 'A ⊂ B 일 때 A ∩ B 는?', choices: ['A', 'B', '∅'], answerIndex: 0, solution: 'A의 원소는 모두 B에도 있다 → A ∩ B = A' }) },
    { id: 'unioncount', mf: 'n(A∪B)', no: 4, sec: '03 집합의 연산', name: '합집합의 원소의 개수', short: 'n(A∪B)', fm: 'n(A∪B) = n(A) + n(B) − n(A∩B)', desc: '겹친 부분은 한 번만 센다', grade: 2, art: 1, page: '4차시 학습지', op: 'n', in: ['card:union'], hint: '합집합의 원소를 세면? 겹친 곳 주의',
      ex: q({ type: 'number', question: 'n(A) = 5, n(B) = 4, n(A ∩ B) = 2 일 때 n(A ∪ B) = ?', answer: 7, solution: '5 + 4 − 2 = 7' }) },
    { id: 'disjointcount', no: 4, sec: '03 집합의 연산', name: '서로소의 원소의 개수', short: '서로소 개수', fm: 'n(A∪B) = n(A) + n(B)', desc: '서로소이면 겹친 부분이 없어 그냥 더한다', grade: 3, art: 1, flip: true, page: '4차시 학습지', op: 'and', in: ['card:unioncount', 'card:disjoint'], alt: [{ op: 'n', in: ['card:disjoint'] }], hint: '겹친 부분이 없다면 빼기는?',
      ex: q({ type: 'number', question: 'A, B 가 서로소이고 n(A) = 3, n(B) = 6 일 때 n(A ∪ B) = ?', answer: 9, solution: '겹친 부분 0 → 3 + 6 = 9' }) },
    { id: 'commute', no: 5, sec: '03 집합의 연산', name: '교환법칙', fm: 'A ∪ B = B ∪ A, A ∩ B = B ∩ A', desc: '두 집합의 순서를 바꾸어도 같다', grade: 2, art: 6, page: '5차시 학습지', op: 'and', in: ['card:union', 'card:inter'], alt: [{ op: 'eq', in: ['card:union', 'card:union'] }, { op: 'eq', in: ['card:inter', 'card:inter'] }], hint: '자리를 바꿔도 같은 집합',
      ex: q({ type: 'ox', question: 'A ∩ B = B ∩ A 이다.', answer: true, solution: '교환법칙' }) },
    { id: 'assoc', no: 5, sec: '03 집합의 연산', name: '결합법칙', fm: '(A ∪ B) ∪ C = A ∪ (B ∪ C)', desc: '세 집합은 어느 둘을 먼저 계산해도 같다', grade: 2, art: 6, flip: true, page: '5차시 학습지', op: 'paren', in: ['card:union'], alt: [{ op: 'paren', in: ['card:inter'] }], hint: '괄호를 어디에 둬도 같다면?',
      ex: q({ type: 'ox', question: '(A ∩ B) ∩ C = A ∩ (B ∩ C) 이다.', answer: true, solution: '결합법칙' }) },
    { id: 'distrib', no: 5, sec: '03 집합의 연산', name: '분배법칙', fm: 'A ∩ (B ∪ C) = (A ∩ B) ∪ (A ∩ C)', desc: '괄호 밖의 연산을 안으로 나누어 준다 (∪ · ∩ 를 바꿔도 성립)', grade: 3, art: 6, page: '5차시 학습지', op: 'cap', in: ['A', 'card:union'], ordered: true, alt: [{ op: 'cup', in: ['A', 'card:inter'], ordered: true }], hint: '수의 2 × (3 + 4) 처럼',
      ex: q({ type: 'choice', question: 'A ∪ (B ∩ C) 와 같은 것은?', choices: ['(A ∪ B) ∩ (A ∪ C)', '(A ∩ B) ∪ (A ∩ C)', '(A ∪ B) ∪ C'], answerIndex: 0, solution: '분배법칙: ∪ 를 괄호 안 집합마다 나누어 준다' }) },
    { id: 'comp', mf: 'Aᶜ', no: 5, sec: '03 집합의 연산', name: '여집합', fm: 'Aᶜ = U − A', desc: '전체집합 U에서 A에 속하지 않는 원소의 집합', grade: 1, art: 2, page: '5차시 학습지', op: 'comp', in: ['A'], alt: [{ op: 'minus', in: ['U', 'A'], ordered: true }], hint: '전체에서 A 만 빼면?',
      ex: q({ type: 'choice', question: 'U = {1, 2, 3, 4, 5}, A = {1, 3} 일 때 Aᶜ 는?', choices: ['{2, 4, 5}', '{1, 3}', '{1, 2, 3, 4, 5}'], answerIndex: 0, solution: 'U 에서 1, 3 을 뺀다 → {2, 4, 5}' }) },
    { id: 'diff', no: 5, sec: '03 집합의 연산', name: '차집합', fm: 'A − B', desc: 'A에는 속하고 B에는 속하지 않는 원소의 집합', grade: 1, art: 2, flip: true, page: '5차시 학습지', op: 'minus', in: ['A', 'B'], ordered: true, hint: 'A 에서 B 에 있는 것을 빼면 (A − B ≠ B − A)',
      ex: q({ type: 'choice', question: 'A = {1, 2, 3, 4}, B = {3, 4, 5} 일 때 A − B 는?', choices: ['{1, 2}', '{5}', '{3, 4}'], answerIndex: 0, solution: 'A 에서 3, 4 를 뺀다 → {1, 2}' }) },
    { id: 'diffcap', no: 5, sec: '03 집합의 연산', name: '차집합을 교집합으로', short: 'A−B = A∩Bᶜ', fm: 'A − B = A ∩ Bᶜ', desc: 'x ∈ A 이고 x ∉ B', grade: 2, art: 5, page: '5차시 학습지', op: 'and', in: ['card:belong', 'card:notbelong'], hint: 'A 에는 속하고, B 에는 속하지 않고',
      ex: q({ type: 'ox', question: 'A − B = A ∩ Bᶜ 이다.', answer: true, solution: 'B 가 아닌 것(Bᶜ) 중 A 인 것' }) },
    { id: 'compcomp', no: 5, sec: '03 집합의 연산', name: '여집합의 여집합', short: '(Aᶜ)ᶜ', fm: '(Aᶜ)ᶜ = A · Uᶜ = ∅ · ∅ᶜ = U', desc: '여집합을 두 번 하면 처음 집합', grade: 2, art: 2, page: '5차시 학습지', op: 'comp', in: ['card:comp'], hint: '여집합에 또 ᶜ 를 씌우면?',
      ex: q({ type: 'choice', question: 'Uᶜ 는?', choices: ['∅', 'U', '{0}'], answerIndex: 0, solution: '전체집합 밖에는 원소가 없다 → ∅' }) },
    { id: 'compprop', no: 5, sec: '03 집합의 연산', name: 'A와 여집합', short: 'A와 Aᶜ', fm: 'A ∩ Aᶜ = ∅, A ∪ Aᶜ = U', desc: '집합과 그 여집합은 겹치지 않고, 합치면 전체', grade: 2, art: 5, flip: true, page: '5차시 학습지', op: 'cap', in: ['A', 'card:comp'], alt: [{ op: 'cup', in: ['A', 'card:comp'] }], hint: 'A 와 A 가 아닌 것을 함께 놓으면?',
      ex: q({ type: 'choice', question: 'A ∩ Aᶜ 는?', choices: ['∅', 'U', 'A'], answerIndex: 0, solution: 'A 이면서 A 가 아닌 원소는 없다' }) },
    { id: 'demorgan1', no: 6, sec: '03 집합의 연산', name: '드모르간의 법칙 ①', short: '드모르간 ①', fm: '(A ∪ B)ᶜ = Aᶜ ∩ Bᶜ', desc: '괄호를 풀면 ᶜ 이 각각 붙고 ∪ 가 ∩ 로', grade: 3, art: 4, page: '6차시 학습지', op: 'comp', in: ['card:union'], alt: [{ op: 'cap', in: ['card:comp', 'card:comp'] }], hint: '합집합 전체의 여집합은?',
      ex: q({ type: 'choice', question: '(A ∪ B)ᶜ 와 같은 것은?', choices: ['Aᶜ ∩ Bᶜ', 'Aᶜ ∪ Bᶜ', 'A ∩ B'], answerIndex: 0, solution: 'ᶜ 이 각각 붙고 ∪ → ∩' }) },
    { id: 'demorgan2', no: 6, sec: '03 집합의 연산', name: '드모르간의 법칙 ②', short: '드모르간 ②', fm: '(A ∩ B)ᶜ = Aᶜ ∪ Bᶜ', desc: '괄호를 풀면 ᶜ 이 각각 붙고 ∩ 가 ∪ 로', grade: 3, art: 4, flip: true, page: '6차시 학습지', op: 'comp', in: ['card:inter'], alt: [{ op: 'cup', in: ['card:comp', 'card:comp'] }], hint: '교집합 전체의 여집합은?',
      ex: q({ type: 'choice', question: '(A ∩ B)ᶜ 와 같은 것은?', choices: ['Aᶜ ∩ Bᶜ', 'Aᶜ ∪ Bᶜ', 'A ∪ B'], answerIndex: 1, solution: 'ᶜ 이 각각 붙고 ∩ → ∪' }) },
    { id: 'compcount', no: 6, sec: '03 집합의 연산', name: '여집합의 원소의 개수', short: 'n(Aᶜ)', fm: 'n(Aᶜ) = n(U) − n(A)', desc: '전체 개수에서 A 의 개수를 뺀다', grade: 2, art: 1, page: '6차시 학습지', op: 'n', in: ['card:comp'], hint: '여집합의 원소를 세면?',
      ex: q({ type: 'number', question: 'n(U) = 10, n(A) = 4 일 때 n(Aᶜ) = ?', answer: 6, solution: '10 − 4 = 6' }) },
    { id: 'diffcount', no: 6, sec: '03 집합의 연산', name: '차집합의 원소의 개수', short: 'n(A−B)', fm: 'n(A − B) = n(A) − n(A ∩ B)', desc: 'A 의 개수에서 겹친 부분을 뺀다', grade: 2, art: 1, flip: true, page: '6차시 학습지', op: 'n', in: ['card:diff'], hint: '차집합의 원소를 세면?',
      ex: q({ type: 'number', question: 'n(A) = 7, n(A ∩ B) = 3 일 때 n(A − B) = ?', answer: 4, solution: '7 − 3 = 4' }) },
    // ── 04 명제와 조건 (6~7차시) ──
    { id: 'prop', no: 6, sec: '04 명제와 조건', name: '명제', fm: '참 · 거짓을 판별할 수 있는 문장이나 식', desc: '거짓인 문장도 명제 · 기준이 모호하면 명제가 아니다', grade: 1, art: 4, page: '6차시 학습지', op: 'tf', in: ['S'], hint: '참인지 거짓인지 가릴 수 있으면',
      ex: q({ type: 'choice', question: '다음 중 명제인 것은?', choices: ['2는 짝수이다.', '수학은 재미있다.', 'x + 1 = 3'], answerIndex: 0, solution: '참 · 거짓을 분명히 가릴 수 있다 (재미있다 = 기준이 모호, x + 1 = 3 = x 에 따라 달라지는 조건)' }) },
    { id: 'neg', mf: '~p', no: 6, sec: '04 명제와 조건', name: '명제의 부정', short: '~p', fm: '~p : p가 아니다', desc: 'p 가 참이면 ~p 는 거짓, p 가 거짓이면 ~p 는 참', grade: 1, art: 4, flip: true, page: '6차시 학습지', op: 'not', in: ['p'], hint: '‘아니다’를 붙이면',
      ex: q({ type: 'choice', question: '명제 ‘√2는 유리수이다.’의 부정은?', choices: ['√2는 유리수가 아니다.', '√2는 정수이다.', '2는 유리수이다.'], answerIndex: 0, solution: '‘p 가 아니다’' }) },
    { id: 'cond', mf: 'p(x)', no: 7, sec: '04 명제와 조건', name: '조건', fm: 'p(x) : x 의 값에 따라 참 · 거짓이 정해지는 문장이나 식', desc: '변수 x 가 있어서 x 를 정해야 참 · 거짓이 정해진다', grade: 1, art: 4, page: '7차시 학습지', op: 'tf', in: ['P'], hint: 'x 에 따라 참이 되기도 거짓이 되기도',
      ex: q({ type: 'choice', question: '다음 중 조건인 것은?', choices: ['x는 3보다 크다.', '5는 3보다 크다.', '2 + 3 = 6'], answerIndex: 0, solution: 'x 의 값에 따라 참 · 거짓이 달라진다' }) },
    { id: 'truth', mf: 'P={x|p(x)}', no: 7, sec: '04 명제와 조건', name: '진리집합', fm: 'P = {x | p(x) 가 참}', desc: '조건을 참이 되게 하는 원소 전체의 집합', grade: 2, art: 3, page: '7차시 학습지', op: 'build', in: ['card:cond'], hint: '조건을 참으로 만드는 x 를 모으면',
      ex: q({ type: 'choice', question: '전체집합 U = {1, 2, 3, 4, 5, 6} 에서 조건 ‘x는 짝수’의 진리집합은?', choices: ['{2, 4, 6}', '{1, 3, 5}', '{1, 2, 3, 4, 5, 6}'], answerIndex: 0, solution: '짝수인 x → {2, 4, 6}' }) },
    { id: 'negtruth', no: 7, sec: '04 명제와 조건', name: '부정의 진리집합', short: '~p 의 진리집합', fm: '~p 의 진리집합 = Pᶜ', desc: '조건의 부정은 진리집합의 여집합', grade: 2, art: 2, page: '7차시 학습지', op: 'comp', in: ['card:truth'], alt: [{ op: 'build', in: ['card:neg'] }], hint: 'p 가 아닌 것들을 모으면',
      ex: q({ type: 'choice', question: 'U = {1, 2, 3, 4}, p: x ≤ 2 일 때 ~p 의 진리집합은?', choices: ['{3, 4}', '{1, 2}', '∅'], answerIndex: 0, solution: 'P = {1, 2} → Pᶜ = {3, 4}' }) },
    { id: 'all', mf: '모든 x, p(x)', no: 7, sec: '04 명제와 조건', name: '‘모든’ 명제', short: '모든', fm: '‘모든 x에 대하여 p’ 참 ⇔ P = U', desc: '전체집합의 모든 원소가 조건을 만족할 때만 참', grade: 2, art: 7, page: '7차시 학습지', op: 'all', in: ['card:cond'], hint: '하나도 빠짐없이 참이어야',
      ex: q({ type: 'ox', question: 'U = {1, 2, 3} 에서 ‘모든 x에 대하여 x > 0’ 은 참이다.', answer: true, solution: 'P = {1, 2, 3} = U' }) },
    { id: 'some', no: 7, sec: '04 명제와 조건', name: '‘어떤’ 명제', short: '어떤', fm: '‘어떤 x에 대하여 p’ 참 ⇔ P ≠ ∅', desc: '조건을 만족하는 원소가 하나라도 있으면 참', grade: 2, art: 7, flip: true, page: '7차시 학습지', op: 'some', in: ['card:cond'], hint: '하나만 있어도 참',
      ex: q({ type: 'ox', question: 'U = {1, 2, 3} 에서 ‘어떤 x에 대하여 x > 3’ 은 참이다.', answer: false, solution: 'P = ∅ → 거짓' }) },
    { id: 'allneg', no: 7, sec: '04 명제와 조건', name: '‘모든’의 부정', short: '모든의 부정', fm: '‘모든 x에 대하여 p’ 의 부정 = ‘어떤 x에 대하여 ~p’', desc: '‘모든’ ↔ ‘어떤’ 이 바뀌고 조건은 부정', grade: 3, art: 4, page: '7차시 학습지', op: 'not', in: ['card:all'], alt: [{ op: 'some', in: ['card:neg'] }], hint: '모두 그런 건 아니다 = 아닌 것이 하나는 있다',
      ex: q({ type: 'choice', question: '‘모든 학생은 안경을 썼다.’의 부정은?', choices: ['어떤 학생은 안경을 쓰지 않았다.', '모든 학생은 안경을 쓰지 않았다.', '어떤 학생은 안경을 썼다.'], answerIndex: 0, solution: '모든 → 어떤, 썼다 → 쓰지 않았다' }) },
    // ── 05 명제 사이의 관계 (8~9차시) ──
    { id: 'imp', mf: 'p → q', no: 8, sec: '05 명제 사이의 관계', name: '명제 p → q', short: 'p → q', fm: 'p → q (p: 가정, q: 결론)', desc: '‘p 이면 q 이다’ 꼴의 명제', grade: 1, art: 5, page: '8차시 학습지', op: 'then', in: ['p', 'q'], ordered: true, hint: '가정에서 결론으로',
      ex: q({ type: 'choice', question: '명제 ‘x = 2 이면 x² = 4 이다.’의 가정은?', choices: ['x = 2', 'x² = 4', 'x = −2'], answerIndex: 0, solution: '‘이면’ 앞 = 가정' }) },
    { id: 'conv', no: 8, sec: '05 명제 사이의 관계', name: '역', fm: 'q → p', desc: '가정과 결론을 서로 바꾼 명제', grade: 1, art: 5, flip: true, page: '8차시 학습지', op: 'then', in: ['q', 'p'], ordered: true, hint: '가정과 결론의 자리를 바꾸면',
      ex: q({ type: 'choice', question: '명제 ‘x = 2 이면 x² = 4 이다.’의 역은?', choices: ['x² = 4 이면 x = 2 이다.', 'x ≠ 2 이면 x² ≠ 4 이다.', 'x² ≠ 4 이면 x ≠ 2 이다.'], answerIndex: 0, solution: '가정 ↔ 결론' }) },
    { id: 'truthjudge', no: 8, sec: '05 명제 사이의 관계', name: '명제의 참 · 거짓', short: '참 판별', fm: 'p → q 참 ⇔ P ⊂ Q', desc: '가정의 진리집합이 결론의 진리집합에 포함되면 참', grade: 3, art: 3, page: '8차시 학습지', op: 'eq', in: ['card:imp', 'card:subset'], hint: '진리집합으로 참을 가리면',
      ex: q({ type: 'ox', question: 'P = {1, 2}, Q = {1, 2, 3} 이면 명제 p → q 는 참이다.', answer: true, solution: 'P ⊂ Q' }) },
    { id: 'counter', no: 8, sec: '05 명제 사이의 관계', name: '반례', fm: 'P ⊄ Q → x ∈ P, x ∉ Q 인 x', desc: '명제가 거짓임을 보이는 예 하나', grade: 2, art: 4, page: '8차시 학습지', op: 'and', in: ['card:imp', 'card:notsubset'], hint: '거짓을 보이려면 예 하나면 충분',
      ex: q({ type: 'number', question: '명제 ‘x가 소수이면 x는 홀수이다.’의 반례가 되는 소수는?', answer: 2, solution: '2 는 소수인데 짝수' }) },
    { id: 'contra', no: 8, sec: '05 명제 사이의 관계', name: '대우', fm: '~q → ~p', desc: '가정과 결론을 바꾸고 각각 부정한 명제', grade: 2, art: 5, page: '8차시 학습지', op: 'not', in: ['card:conv'], hint: '역에 ~ 를 씌우면?',
      ex: q({ type: 'choice', question: '명제 ‘x = 2 이면 x² = 4 이다.’의 대우는?', choices: ['x² ≠ 4 이면 x ≠ 2 이다.', 'x² = 4 이면 x = 2 이다.', 'x ≠ 2 이면 x² ≠ 4 이다.'], answerIndex: 0, solution: '결론의 부정 → 가정의 부정' }) },
    { id: 'contraeq', no: 8, sec: '05 명제 사이의 관계', name: '대우와 참 · 거짓', short: '대우 = 참 · 거짓', fm: '명제가 참이면 대우도 참 (참 · 거짓이 같다)', desc: 'P ⊂ Q ⇔ Qᶜ ⊂ Pᶜ', grade: 3, art: 5, flip: true, page: '8차시 학습지', op: 'eq', in: ['card:imp', 'card:contra'], hint: '명제와 짝이 늘 같은 것은?',
      ex: q({ type: 'ox', question: '명제가 참이면 그 대우도 반드시 참이다.', answer: true, solution: '명제와 대우는 참 · 거짓이 같다' }) },
    { id: 'suff', mf: 'p ⇒ q', no: 9, sec: '05 명제 사이의 관계', name: '충분조건 · 필요조건', short: '충분 · 필요', fm: 'p ⇒ q : p 는 q 이기 위한 충분조건, q 는 p 이기 위한 필요조건', desc: 'p → q 가 참일 때', grade: 1, art: 3, page: '9차시 학습지', op: 'imp', in: ['p', 'q'], ordered: true, hint: '화살표 앞이 충분, 뒤가 필요',
      ex: q({ type: 'choice', question: 'x = 1 은 x² = 1 이기 위한 어떤 조건인가?', choices: ['충분조건', '필요조건', '필요충분조건'], answerIndex: 0, solution: 'x = 1 ⇒ x² = 1 (역은 x = −1 에서 거짓)' }) },
    { id: 'iff', mf: 'p ⇔ q', no: 9, sec: '05 명제 사이의 관계', name: '필요충분조건', short: 'p ⇔ q', fm: 'p ⇔ q : p ⇒ q 이고 q ⇒ p', desc: '서로가 서로의 충분조건 · 필요조건', grade: 2, art: 3, flip: true, page: '9차시 학습지', op: 'iff', in: ['p', 'q'], alt: [{ op: 'and', in: ['card:suff', 'card:conv'] }], hint: '양쪽 화살표가 모두 참이면',
      ex: q({ type: 'choice', question: 'x > 0 은 −x < 0 이기 위한 어떤 조건인가?', choices: ['필요충분조건', '충분조건', '필요조건'], answerIndex: 0, solution: 'x > 0 ⇔ −x < 0' }) },
    { id: 'iffset', no: 9, sec: '05 명제 사이의 관계', name: '필요충분조건과 진리집합', short: 'P = Q', fm: 'p ⇔ q ⇔ P = Q', desc: '두 조건의 진리집합이 서로 같다', grade: 3, art: 3, page: '9차시 학습지', op: 'eq', in: ['card:iff', 'card:equal'], hint: '진리집합이 어떤 관계일 때?',
      ex: q({ type: 'ox', question: 'P = Q 이면 p 는 q 이기 위한 필요충분조건이다.', answer: true, solution: 'P ⊂ Q 이고 Q ⊂ P' }) },
    { id: 'contraproof', no: 10, sec: '06 명제의 증명', name: '대우를 이용한 증명', short: '대우로 증명', fm: '대우가 참임을 보이면 처음 명제도 참', desc: '직접 보이기 어려울 때 대우를 증명한다', grade: 3, art: 0, page: '9차시 학습지', op: 'imp', in: ['card:contra', 'card:imp'], ordered: true, hint: '대우가 참이면 명제는?',
      ex: q({ type: 'ox', question: '명제 ‘n²이 짝수이면 n은 짝수이다.’는 대우 ‘n이 홀수이면 n²은 홀수이다.’를 보여 증명할 수 있다.', answer: true, solution: '대우가 참 → 명제도 참' }) },
    // ── 06 명제의 증명 (10차시 대우 증명 · 귀류법) · 절대부등식 (11차시) — 2026-11-05 7~11차시 재조직 A안 ──
    { id: 'contradiction', no: 10, sec: '06 명제의 증명', name: '귀류법', fm: '결론을 부정 → 모순 → 처음 명제가 참', desc: '결론을 부정하여 모순을 이끌어 내는 증명', grade: 3, art: 0, flip: true, page: '10차시 학습지', op: 'then', in: ['card:neg', 'X'], ordered: true, hint: '아니라고 가정했더니 말이 안 된다면?',
      ex: q({ type: 'choice', question: '‘√2는 무리수이다.’를 귀류법으로 증명할 때 처음 가정은?', choices: ['√2는 유리수이다.', '√2는 무리수이다.', '√2는 정수이다.'], answerIndex: 0, solution: '결론(무리수)을 부정 → 유리수라고 가정' }) },
    { id: 'absineq', no: 11, sec: '06 명제의 증명', name: '절대부등식', fm: '모든 실수 x 에 대하여 항상 성립하는 부등식', desc: '예: x² ≥ 0', grade: 2, art: 7, page: '10차시 학습지', op: 'all', in: ['I'], hint: '어떤 값을 넣어도 성립하면',
      ex: q({ type: 'ox', question: '부등식 x² ≥ 0 은 모든 실수 x 에 대하여 성립하는 절대부등식이다.', answer: true, solution: '제곱은 0 이상' }) },
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
    // 4~10차시 (2026-11-03)
    'cap|card:union,A': '분배법칙은 A 를 왼쪽에: A ∩ (B ∪ C)',
    'cup|card:inter,A': '분배법칙은 A 를 왼쪽에: A ∪ (B ∩ C)',
    'minus|B,A': '차집합은 순서가 중요해요. A − B 와 B − A 는 달라요 — 이번 카드는 A 를 왼쪽에.',
    'minus|A,U': '여집합은 전체집합에서 빼요: U 를 왼쪽에 → U − A',
    'eq|card:inter,card:union': '교집합과 합집합은 서로 같지 않아요. 같은 연산끼리 놓아 보자 (교환법칙).',
    'eq|card:union,card:inter': '교집합과 합집합은 서로 같지 않아요. 같은 연산끼리 놓아 보자 (교환법칙).',
    'imp|q,p': '⇒ 는 방향이 중요해요. 이번 카드는 p ⇒ q (p 가 충분조건).',
    'not|card:imp': '명제 p → q 를 통째로 부정하면 대우가 아니에요. 역(q → p)에 ~ 를 씌우면 대우 ~q → ~p !',
    'eq|card:imp,card:conv': '명제와 역은 참 · 거짓이 같지 않을 수 있어요. 늘 같은 것은 대우!',
    'eq|card:conv,card:imp': '명제와 역은 참 · 거짓이 같지 않을 수 있어요. 늘 같은 것은 대우!',
    'tf|A': '집합은 참 · 거짓을 가리는 문장이 아니에요. 「○○이다」 나 「x는 ○○」 에 씌워 보자.',
    'then|card:neg,E': '∅ 은 공집합이에요. 말이 안 되는 결론은 「모순」 재료로!',
    'not|card:some': '‘어떤’의 부정은 ‘모든 x에 대하여 ~p’. 이번 카드는 ‘모든’ 명제를 부정해 보자.',
  };
  const card = (id) => CARDS.find((c) => c.id === id);
  const opOf = (id) => OPS.find((o) => o.id === id);
  // 연성식: 기본 하나 + 두 번째 연성식 alt (2026-11-03 사용자 확정: 같은 뜻의 두 식은 둘 다 인정)
  const recipes = (c) => [{ op: c.op, in: c.in, ordered: !!c.ordered }, ...(c.alt || []).map((a) => ({ ordered: false, ...a }))];
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
      const hit = recipes(c).some((r) => r.op === op && (r.ordered || r.in.length === 1 ? mats.join(',') === r.in.join(',') : mats.slice().sort().join(',') === r.in.slice().sort().join(',')));
      if (!hit) continue;
      if (c.no > no) return { ok: false, msg: '아직 열리지 않은 레시피예요. 선생님이 다음 차시를 열면 만들 수 있어요.' };
      return { ok: true, card: c };
    }
    return { ok: false, msg: MISTAKES[key] || '이 조합으로는 개념이 되지 않아요. 도감의 힌트를 보세요.' };
  }
  return { MATS, OPS, CARDS, MISTAKES, card, opOf, opens, forge, recipes, GRADES: { 1: '일반', 2: '매직', 3: '레어' } };
})();
