// 📝 예시 차시 (저작권 등록용 · 2026-11-04): 특정 교과서 내용 없이 「교사가 입력하는 차시 데이터」 형식을 보여 주는 견본
//   문항은 이 파일을 위해 새로 지은 것 (원소와 집합 · 원소의 개수). 실제 수업 차시(lessons/set-*.js)는 등록 범위가 아니다
(function () {
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const choose = (question, choices, right, solution, r) => {
    const opts = r ? r.shuffle(choices) : choices.slice();
    return { type: 'choice', question, choices: opts, answer: choices[right], answerIndex: opts.indexOf(choices[right]), solution };
  };
  const ox = (question, answer, solution) => ({ type: 'ox', question, answer, solution });
  const num = (question, answer, solution) => ({ type: 'number', question, answer, solution, min: 0, max: 30 });
  // 몬스터 = 문제: make(시도 번호, 난수) → 소문제 목록 · 시도 0 = 교사가 입력한 그대로, 재도전 = 숫자만 바꿈
  const MONSTERS = {
    m1: { title: '문제 1 · 원소인가?', sprite: 'new:0', make: (a, r) => {
      const n = a === 0 ? 12 : r.int(10, 20), x = a === 0 ? 4 : r.int(2, 6);
      const evens = range(1, n).filter((k) => k % 2 === 0);
      return [ox(`A = {x | x는 ${n} 이하의 짝수} 일 때, ${x * 2} ∈ A 이다.`, x * 2 <= n, `A = {${evens.join(', ')}}`),
        num(`A = {x | x는 ${n} 이하의 짝수} 의 원소의 개수 n(A) 는?`, evens.length, `A = {${evens.join(', ')}} → ${evens.length}개`)];
    } },
    m2: { title: '문제 2 · 원소의 개수', sprite: 'new:4', make: (a, r) => {
      const k = a === 0 ? 3 : r.int(2, 5);
      return [num(`{${range(1, k).map((i) => i * 5).join(', ')}} 의 원소의 개수는?`, k, `원소 ${k}개`),
        choose('공집합의 원소의 개수는?', ['0', '1', '정할 수 없다'], 0, 'n(∅) = 0', r)];
    } },
  };
  const BOSS = {
    1: [ox('{1, 2, 3} 과 {3, 2, 1} 은 같은 집합이다.', true, '원소가 같으면 같은 집합'), num('{a, b, c, d} 의 원소의 개수는?', 4, '4개')],
    2: [ox('{5, 6} 과 {6, 5, 5} 는 같은 집합이다.', true, '같은 원소는 한 번만 셈'), num('{p, q, r} 의 원소의 개수는?', 3, '3개')],
  };
  const STEPS = [
    { kind: 'concept', id: 'c1', title: '개념 1 · 원소와 집합', say: '대상이 분명하게 정해지는 모임 = 집합 · 집합을 이루는 하나하나 = 원소 (a ∈ A)' },
    { kind: 'monster', id: 'm1' },
    { kind: 'concept', id: 'c2', title: '개념 2 · 원소의 개수', say: '유한집합 A 의 원소의 개수 → n(A) · n(∅) = 0' },
    { kind: 'monster', id: 'm2' },
    { kind: 'boss', id: 'boss', title: '형성평가 · 견본 보스' },
  ];
  STEPS.forEach((s) => { if (s.kind === 'monster') s.title = MONSTERS[s.id].title; });
  DS.Lessons.register({
    id: 'sample-01', no: 1, title: '원소와 집합 · 원소의 개수 (예시)', unit: '예시 차시 (등록용 견본)', sheet: '교사 입력 예시',
    goal: '원소와 집합의 관계를 말하고 원소의 개수를 구한다', theme: '02-deep-forest', defaultPct: 90,
    steps: STEPS, monsters: MONSTERS,
    items(id, seed, attempt) { return MONSTERS[id].make(attempt, DS.Rng(`${seed}|${id}|${attempt}`)); },
    boss: { title: '형성평가 · 견본 보스', sprite: 'new:6', items: 2, hpItems: 2, sets: BOSS, tags: ['c1', 'c2'] },
  });
})();
