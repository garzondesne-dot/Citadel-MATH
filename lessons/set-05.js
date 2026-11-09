// 공통수학2 Ⅱ-1 집합 · 5차시 「연산 법칙 · 여집합과 차집합」 (학습과정 5차시 레이드용 v3 기준, 2026-11-02 사용자 확정)
// v4 (2026-11-03 사용자 확정 「보강 걷어내기 + 안 1」): 학습지 보강 칸 · 형성평가 도전 7·8 뺌 · 몬스터는 ★ 칸만(19 → 12 소문제) · 문제 3 · 4 한 몬스터
// 레이드 순서: 개념1(교환·결합 — 시작 때 지난 시간 복습은 말로) → 문제1 → 개념2(분배) → 문제2 → 개념3(전체집합·여집합) → 문제3
//            → 개념4(차집합) → 문제4 → 개념5(성질 · A − B = A ∩ Bᶜ) → 문제5 → 형성평가 (도입 없음 · 복습 몬스터 없음 — 분량 줄이기, 사용자 결정)
// ⚔ 보강던전: ① 법칙을 이용해 간단히 하기(학습지 보강) · ② 여집합의 성질 · ③ 색칠해서 확인하기(그림 고르기)
// 첫 시도(attempt 0)는 학습지 그대로, 재도전은 새 집합. 같은 시드 → 같은 문제.
// 모든 정답은 tests/lesson5.test.js 에서 식을 따로 계산하는 계산기(직접 만든 파서)와 모든 부분집합 대입으로 검산한다 (check 정보 사용).
(function () {
  const S = DS.SetGen;
  const st = (a) => (a.length ? S.setStr(a) : '∅');
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const sorted = (a) => a.slice().sort((x, y) => x - y);
  const inter = (A, B) => sorted(A.filter((x) => B.includes(x)));
  const union = (A, B) => sorted([...new Set([...A, ...B])]);
  const minus = (A, B) => sorted(A.filter((x) => !B.includes(x)));
  const comp = (U, A) => minus(U, A);
  const traps = (r, used, k, hi) => sorted(r.shuffle(range(1, hi).filter((x) => !used.includes(x))).slice(0, k));
  const COND = { even: ['짝수', (x) => x % 2 === 0], odd: ['홀수', (x) => x % 2 === 1], m3: ['3의 배수', (x) => x % 3 === 0], m4: ['4의 배수', (x) => x % 4 === 0] };

  // 원소 고르기: 식의 원소를 후보 수에서 모두 고른다. check.expr 은 테스트가 따로 계산한다
  function pick(head, label, want, opts, sol, check) {
    return { type: 'multi', question: `${head}${label} 의 원소를 모두 고르시오.`, options: opts.map(String), answer: opts.map((x, i) => (want.includes(x) ? i : -1)).filter((i) => i >= 0),
      solution: `${sol} → ${label} = ${st(want)}`, check: Object.assign({ expr: label }, check) };
  }
  const same = (q, ans, sol, check) => ({ type: 'choice', question: q, choices: ['같다', '다르다'], answerIndex: ans ? 0 : 1, answer: ans ? '같다' : '다르다', solution: sol, check });
  const ch = (question, choices, ans, solution, check) => ({ type: 'choice', question, choices, answerIndex: choices.indexOf(ans), answer: ans, solution, check });

  // ── 문제 1: 교환법칙 · 결합법칙 ────────────────────────────
  function m1Make(A, B, C, opts) {
    const head = `A = ${st(A)}, B = ${st(B)}, C = ${st(C)} 일 때 `, sets = { A, B, C };
    const AB = union(A, B), BC = union(B, C), ABC = union(AB, C);
    return [
      pick(`(1) ${head}`, 'A ∪ B', AB, opts, '모두 모으기', { sets }),
      pick(`(1) ${head}`, '(A ∪ B) ∪ C', ABC, opts, `A ∪ B = ${st(AB)} 에 C 를 모으기`, { sets }),
      pick(`(2) ${head}`, 'B ∪ C', BC, opts, '모두 모으기', { sets }),
      pick(`(2) ${head}`, 'A ∪ (B ∪ C)', ABC, opts, `B ∪ C = ${st(BC)} 에 A 를 모으기 → (1)과 같다 (결합법칙)`, { sets }),
      pick(`(3) ${head}`, 'A ∩ B ∩ C', inter(inter(A, B), C), opts, '셋 모두에 있는 것', { sets }),
    ];
  }
  function m1Retry(r) {
    for (;;) {
      const A = sorted(r.shuffle(range(1, 8)).slice(0, 3)), B = sorted(r.shuffle(range(1, 8)).slice(0, 3)), C = sorted(r.shuffle(range(1, 8)).slice(0, 3));
      if (!inter(inter(A, B), C).length) continue;
      if (union(union(A, B), C).length < 5) continue;
      const U = union(union(A, B), C);
      return m1Make(A, B, C, sorted([...U, ...traps(r, U, 1, 9)]));
    }
  }

  // ── 문제 2: 분배법칙 ──────────────────────────────────────
  function m2Make(A, B, C, opts) {
    const head = `A = ${st(A)}, B = ${st(B)}, C = ${st(C)} 일 때 `, sets = { A, B, C };
    const BC = union(B, C), L = inter(A, BC), AB = inter(A, B), AC = inter(A, C), Rr = union(AB, AC);
    return [
      pick(`(1) ${head}`, 'B ∪ C', BC, opts, '모두 모으기', { sets }),
      pick(`(1) ${head}`, 'A ∩ (B ∪ C)', L, opts, `B ∪ C = ${st(BC)} 중 A 에도 있는 것`, { sets }),
      pick(`(2) ${head}`, 'A ∩ B', AB, opts, '둘 다 있는 것', { sets }),
      pick(`(2) ${head}`, 'A ∩ C', AC, opts, '둘 다 있는 것', { sets }),
      pick(`(2) ${head}`, '(A ∩ B) ∪ (A ∩ C)', Rr, opts, `${st(AB)} 와 ${st(AC)} 를 모으기`, { sets }),
      same(`(3) ${head}A ∩ (B ∪ C) 와 (A ∩ B) ∪ (A ∩ C) 의 결과는?`, true, `둘 다 ${st(L)} → 같다 (분배법칙)`, { sets, eq: ['A ∩ (B ∪ C)', '(A ∩ B) ∪ (A ∩ C)'] }),
    ];
  }
  function m2Retry(r) {
    for (;;) {
      const A = sorted(r.shuffle(range(1, 8)).slice(0, 4)), B = sorted(r.shuffle(range(1, 8)).slice(0, 3)), C = sorted(r.shuffle(range(1, 8)).slice(0, 3));
      if (!inter(A, B).length || !inter(A, C).length || inter(A, B).join() === inter(A, C).join()) continue;
      const U = union(union(A, B), C);
      return m2Make(A, B, C, sorted([...U, ...traps(r, U, 1, 9)]));
    }
  }

  // ── 문제 3: 여집합 ───────────────────────────────────────
  const uTxt = (U) => (U.length > 5 && U.join() === range(1, U.length).join() ? `{1, 2, 3, …, ${U.length}}` : st(U));
  function compEls(head, U, name, A, cond) {
    const def = cond ? `${name} = {x | x는 ${COND[cond][0]}}` : `${name} = ${st(A)}`;
    return pick(`${head}U = ${uTxt(U)}, ${def} 일 때 `, `${name}ᶜ`, comp(U, A), U, `U 의 원소 중 ${name} 에 속하지 않는 것`, { U, sets: { [name]: A }, cond: cond ? { [name]: cond } : null });
  }
  function m3Retry(r) {
    const U = range(1, r.int(6, 10)), A = sorted(r.shuffle(U).slice(0, r.int(2, 4))), cond = r.pick(['even', 'odd', 'm3']);
    return [compEls('(1) ', U, 'A', A), compEls('(2) ', U, 'B', U.filter(COND[cond][1]), cond)];
  }

  // ── 문제 4: 차집합 ───────────────────────────────────────
  function m4Make(A, B, opts) {
    const head = `A = ${st(A)}, B = ${st(B)} 일 때 `, sets = { A, B };
    return [pick(`(1) ${head}`, 'A − B', minus(A, B), opts, 'A 에서 B 에 있는 것 빼기', { sets }), pick(`(2) ${head}`, 'B − A', minus(B, A), opts, 'B 에서 A 에 있는 것 빼기 (A − B 와 다르다!)', { sets })];
  }
  function m4Retry(r) {
    for (;;) {
      const A = sorted(r.shuffle(range(1, 10)).slice(0, r.int(4, 5))), B = sorted(r.shuffle(range(1, 10)).slice(0, 3));
      if (!inter(A, B).length || !minus(A, B).length || !minus(B, A).length) continue;
      const U = union(A, B);
      return m4Make(A, B, sorted([...U, ...traps(r, U, 2, 11)]));
    }
  }

  // ── 문제 5: A − B = A ∩ Bᶜ ──────────────────────────────
  function m5Make(U, A, B) {
    const head = `U = ${st(U)}, A = ${st(A)}, B = ${st(B)} 일 때 `, sets = { A, B }, Bc = comp(U, B);
    return [
      pick(`(1) ${head}`, 'Bᶜ', Bc, U, 'U 의 원소 중 B 에 속하지 않는 것', { U, sets }),
      pick(`(1) ${head}`, 'A ∩ Bᶜ', inter(A, Bc), U, `Bᶜ = ${st(Bc)} 중 A 에도 있는 것`, { U, sets }),
      pick(`(2) ${head}`, 'A − B', minus(A, B), U, 'A 에서 B 에 있는 것 빼기', { U, sets }),
      same(`(2) ${head}A − B 와 A ∩ Bᶜ 의 결과는?`, true, `둘 다 ${st(minus(A, B))} → 같다 (A − B = A ∩ Bᶜ)`, { U, sets, eq: ['A − B', 'A ∩ Bᶜ'] }),
    ];
  }
  function m5Retry(r) {
    for (;;) {
      const U = range(1, r.int(6, 8)), A = sorted(r.shuffle(U).slice(0, 3)), B = sorted(r.shuffle(U).slice(0, 3));
      if (!minus(A, B).length || !inter(A, B).length) continue;
      return m5Make(U, A, B);
    }
  }

  // ── 보강 ① 법칙을 이용해 간단히 하기 (보기 고르기) ────────────
  // check.lhs / check.tpl: 테스트가 A, B, C 의 모든 부분집합을 대입해 보기마다 같은지 확인한다
  function simp(lhs, choices, ans, sol, tpl) {
    const q = tpl ? `${lhs} = ${tpl.replace('□', '(   )')} 에 알맞은 것은?` : `${lhs} 를 간단히 하면?`;
    return Object.assign(ch(q, choices, ans, sol, { lhs, tpl: tpl || '□' }));
  }
  const ROT = (a, k) => [...a.slice(k), ...a.slice(0, k)];
  function b1Retry(r) {
    const [X, Y, Z] = r.shuffle(['A', 'B', 'C']);
    const f1 = r() < 0.5
      ? simp(`(${X} ∪ ${Y}) ∩ ${X}`, r.shuffle([X, Y, `${X} ∪ ${Y}`, `${X} ∩ ${Y}`]), X, `${X} ⊂ ${X} ∪ ${Y} 이므로 → ${X}`)
      : simp(`(${X} ∩ ${Y}) ∪ ${X}`, r.shuffle([X, Y, `${X} ∪ ${Y}`, `${X} ∩ ${Y}`]), X, `${X} ∩ ${Y} ⊂ ${X} 이므로 → ${X}`);
    const [P, Q] = r.shuffle(['A', 'B', 'C'].filter((v) => v !== X));
    const f2 = r() < 0.5
      ? simp(`(${P} ∩ ${Q}) ∪ ${P}`, r.shuffle([P, Q, `${P} ∪ ${Q}`, `${P} ∩ ${Q}`]), P, `${P} ∩ ${Q} ⊂ ${P} 이므로 → ${P}`)
      : simp(`(${P} ∪ ${Q}) ∩ ${P}`, r.shuffle([P, Q, `${P} ∪ ${Q}`, `${P} ∩ ${Q}`]), P, `${P} ⊂ ${P} ∪ ${Q} 이므로 → ${P}`);
    const f3 = r() < 0.5
      ? simp(`(${X} ∩ ${Y}) ∪ (${X} ∩ ${Z})`, r.shuffle([`${Y} ∪ ${Z}`, `${Y} ∩ ${Z}`, `${X} ∪ ${Z}`, Y]), `${Y} ∪ ${Z}`, `분배법칙을 거꾸로 → ${X} ∩ (${Y} ∪ ${Z})`, `${X} ∩ □`)
      : simp(`(${X} ∪ ${Y}) ∩ (${X} ∪ ${Z})`, r.shuffle([`${Y} ∩ ${Z}`, `${Y} ∪ ${Z}`, `${X} ∩ ${Z}`, Z]), `${Y} ∩ ${Z}`, `분배법칙을 거꾸로 → ${X} ∪ (${Y} ∩ ${Z})`, `${X} ∪ □`);
    return [f1, f2, f3];
  }

  // ── 보강 ② 여집합의 성질 (보기 고르기) ──────────────────────
  const PROPS = [
    (v) => [`${v} ∪ ${v}ᶜ`, 'U', `${v} 와 ${v} 가 아닌 것을 합치면 전체 → U`],
    (v) => [`${v} ∩ ${v}ᶜ`, '∅', `${v} 와 ${v} 가 아닌 것은 겹치지 않는다 → ∅`],
    (v) => [`(${v}ᶜ)ᶜ`, v, `여집합의 여집합 → 다시 ${v}`],
    () => ['Uᶜ', '∅', '전체의 바깥은 아무것도 없다 → ∅'],
    () => ['∅ᶜ', 'U', '아무것도 없는 것의 바깥은 전체 → U'],
  ];
  const propQ = (p, v, choices) => { const [lhs, ans, sol] = p(v); return ch(`${lhs} 와 같은 것은?`, choices || [ans, ...['U', '∅', v, `${v}ᶜ`].filter((x) => x !== ans)].slice(0, 4), ans, sol, { lhs, v }); };
  function b2Retry(r) {
    const v = r.pick(['A', 'B']);
    return r.shuffle([0, 1, 2, 3, 4]).slice(0, 3).map((k) => { const q = propQ(PROPS[k], v); const c = r.shuffle(q.choices); return Object.assign(q, { choices: c, answerIndex: c.indexOf(q.answer) }); });
  }

  // ── 보강 ③ 색칠해서 확인하기: 벤 다이어그램 그림 고르기 (보기 'vshade:영역') ──
  // 영역 이름: A-B (A 만) · B-A (B 만) · AnB (겹친 곳) · AuB (합친 곳)
  const REG = ['vshade:A-B', 'vshade:B-A', 'vshade:AnB', 'vshade:AuB'];
  const shadeQ = (expr, ans, choices, sol) => ch(`${expr} 를 색칠한 그림은?`, choices, ans, sol, { expr, shade: true });
  function b3Make(X, Y, choices) {
    const ans = `vshade:${X}-${Y}`;
    return [
      shadeQ(`${X} − ${Y}`, ans, choices, `${X} 에는 있고 ${Y} 에는 없는 부분 → ${X} 만 색칠`),
      shadeQ(`${X} ∩ ${Y}ᶜ`, ans, choices, `${Y} 가 아닌 부분 중 ${X} 인 곳 → ${X} 만 색칠`),
      same(`${X} − ${Y} 와 ${X} ∩ ${Y}ᶜ 를 색칠한 두 그림은?`, true, `두 그림 모두 ${X} 만 색칠 → 같다 (${X} − ${Y} = ${X} ∩ ${Y}ᶜ)`, { eqShade: [`${X} − ${Y}`, `${X} ∩ ${Y}ᶜ`] }),
    ];
  }
  const b3Retry = (r) => { const [X, Y] = r.shuffle(['A', 'B']); return b3Make(X, Y, r.shuffle(REG)); };

  // ── 몬스터 (학습지 순서) · make(attempt, rng) → 소문제 배열 ─────
  // 화산 테마 몬스터 (남은 몬스터: extra 3·6·7 · crown 6·9 — 6차시에 4마리 모자람, HANDOVER 에셋 표)
  // v4 (2026-11-03 사용자 확정 · 수업 분량 줄이기): 중간 계산 칸은 학습지에서만 → 게임은 학습지 ★ 칸만 (KEEP = 남기는 소문제 번호)
  //   문제 3(여집합) + 문제 4(차집합) → 몬스터 하나 (개념 3 · 4 를 연달아 설명한 뒤) · 소문제 19 → 12
  const KEEP = { m1: [1, 3, 4], m2: [1, 4, 5], m5: [1, 2] }, keep = (id, arr) => KEEP[id].map((i) => arr[i]);
  const MONSTERS = {
    m1: { title: '문제 1', sprite: 'extra:1', make: (a, r) => keep('m1', a === 0 ? m1Make([1, 2, 3], [2, 3, 4], [3, 4, 5], range(1, 6)) : m1Retry(r)) },
    m2: { title: '문제 2', sprite: 'new:7', make: (a, r) => keep('m2', a === 0 ? m2Make([1, 2, 3, 4], [2, 4, 6], [3, 4, 5], range(1, 7)) : m2Retry(r)) },
    m3: { title: '문제 3 · 4', sprite: 'extra:2', make: (a, r) => (a === 0 // ref = 학습지 꼬리표 (소문제마다 · 첫 시도에만 보임)
      ? [compEls('(1) ', range(1, 8), 'A', [1, 2, 3]), compEls('(2) ', range(1, 8), 'B', [2, 4, 6, 8], 'even'), ...m4Make([1, 3, 5, 7, 9], [3, 6, 9], range(1, 9))]
      : [...m3Retry(r), ...m4Retry(r)]).map((q, i) => Object.assign(q, { ref: ['문제 3 (1)', '문제 3 (2)', '문제 4 (1)', '문제 4 (2)'][i] })) },
    m5: { title: '문제 5', sprite: 'extra:8', make: (a, r) => keep('m5', a === 0 ? m5Make(range(1, 6), [1, 2, 3], [2, 4, 6]) : m5Retry(r)) },
    // ⚔ 보강던전 (레이드 밖 · 혼자)
    b1: { title: '보강 ① · 법칙으로 간단히', bonus: true, concept: 'c2', sprite: 'extra:0', note: '포함 관계를 떠올려 봐요 (A ⊂ A ∪ B, A ∩ B ⊂ A)', make: (a, r) => (a === 0 ? [
      simp('(A ∪ B) ∩ A', ['A ∪ B', 'A', 'A ∩ B', 'B'], 'A', 'A ⊂ A ∪ B 이므로 → A'),
      simp('(A ∩ B) ∪ A', ['A ∩ B', 'B', 'A', 'A ∪ B'], 'A', 'A ∩ B ⊂ A 이므로 → A'),
      simp('(A ∩ B) ∪ (A ∩ C)', ['B ∩ C', 'B ∪ C', 'A ∪ C', 'B'], 'B ∪ C', '분배법칙을 거꾸로 → A ∩ (B ∪ C)', 'A ∩ □'),
    ] : b1Retry(r)) },
    b2: { title: '보강 ② · 여집합의 성질', bonus: true, concept: 'c5', sprite: 'extra:4', make: (a, r) => (a === 0
      ? [propQ(PROPS[0], 'A', ['∅', 'A', 'U', 'Aᶜ']), propQ(PROPS[1], 'A', ['U', '∅', 'Aᶜ', 'A']), propQ(PROPS[2], 'A', ['Aᶜ', 'U', '∅', 'A'])] : b2Retry(r)) },
    b3: { title: '보강 ③ · 색칠해서 확인하기', bonus: true, concept: 'c5', sprite: 'new:8', make: (a, r) => (a === 0 ? b3Make('A', 'B', ROT(REG, 1)) : b3Retry(r)) },
  };

  // ── 형성평가 (보스) — 세트1: 학습지 그대로(6번은 「위 5번에서」 원본 오타를 고친 v3 기준), 세트2: 숫자를 바꾼 재도전 · v4: 7·8번(도전)은 뺌 (bossSet 은 8문항을 만들고 6문항만 씀) ──
  const LAWS = ['교환법칙', '결합법칙', '분배법칙'];
  // 문항 1~6 만드는 틀 (학습지 세트 · 재도전 생성기 make 가 함께 쓴다) · sol 이 없으면 학습지 해설 그대로
  //   6번: lead = '5번의 ' (학습지 세트) / 재도전은 lead 없이 「A = …, B = … 일 때」 로 집합을 다시 적는다 (문항 하나만 보아도 풀 수 있게)
  const BI = {
    law: (law, choices) => ch(`1. ${law[0]} 는 어떤 법칙인가?`, choices, law[1], law[2], { law }),
    union3: (A, B, C, choices, sol) => ch(`2. A = ${st(A)}, B = ${st(B)}, C = ${st(C)} 일 때 A ∪ B ∪ C 는?`, choices.map(st), st(union(union(A, B), C)), sol || '셋을 모두 모으기 (괄호 없이 써도 된다 · 결합법칙)', { sets: { A, B, C }, expr: 'A ∪ B ∪ C' }),
    dist: (dist, sol) => ch(`3. ${dist[0]} 의 (   ) 에 알맞은 것은?`, dist[1], dist[2], sol || '분배법칙: A ∩ (B ∪ C) = (A ∩ B) ∪ (A ∩ C), A ∪ (B ∩ C) = (A ∪ B) ∩ (A ∪ C)', { dist }),
    comp: (U, A, choices, sol) => ch(`4. U = ${st(U)}, A = ${st(A)} 일 때 Aᶜ 는?`, choices.map(st), st(comp(U, A)), sol || 'U 의 원소 중 A 에 속하지 않는 것', { U, sets: { A }, expr: 'Aᶜ' }),
    diffAB: (A, B, choices, sol) => ch(`5. A = ${st(A)}, B = ${st(B)} 일 때 A − B 는?`, choices.map(st), st(minus(A, B)), sol || 'A 에서 B 에 있는 것 빼기', { sets: { A, B }, expr: 'A − B' }),
    diffBA: (A, B, choices, lead, sol) => ch(lead ? `6. ${lead}A = ${st(A)}, B = ${st(B)} 에서 B − A 는?` : `6. A = ${st(A)}, B = ${st(B)} 일 때 B − A 는?`, choices.map(st), st(minus(B, A)), sol || 'B 에서 A 에 있는 것 빼기 (A − B 와 다르다!)', { sets: { A, B }, expr: 'B − A' }),
  };
  function bossSet(o) {
    const { A2, B2, C2, U4, A4, A5, B5, A7, B7, C7, U8, cA8, cB8 } = o;
    const r7 = union(A7, inter(B7, C7));
    const A8 = U8.filter(COND[cA8][1]), B8 = U8.filter(COND[cB8][1]), r8 = inter(comp(U8, A8), B8);
    return [
      BI.law(o.law, LAWS),
      BI.union3(A2, B2, C2, o.c2),
      BI.dist(o.dist),
      BI.comp(U4, A4, o.c4),
      BI.diffAB(A5, B5, o.c5),
      BI.diffBA(A5, B5, o.c6, '5번의 '),
      ch(`7. [도전] A = ${st(A7)}, B = ${st(B7)}, C = ${st(C7)} 일 때 (A ∪ B) ∩ (A ∪ C) = A ∪ (   ) 이다. 빈칸과 계산 결과를 바르게 짝지은 것은?`, o.c7, `B ∩ C, ${st(r7)}`,
        `분배법칙 → (A ∪ B) ∩ (A ∪ C) = A ∪ (B ∩ C) = A ∪ ${st(inter(B7, C7))} = ${st(r7)}`, { sets: { A: A7, B: B7, C: C7 }, pair: true }),
      ch(`8. [도전] U = {x | x는 ${U8.length} 이하의 자연수}, A = {x | x는 ${COND[cA8][0]}}, B = {x | x는 ${COND[cB8][0]}} 일 때 Aᶜ ∩ B 는?`, o.c8.map(st), st(r8),
        `Aᶜ = ${st(comp(U8, A8))}, B = ${st(B8)} → 둘 다 있는 것 ${st(r8)}`, { U: U8, cond: { A: cA8, B: cB8 }, expr: 'Aᶜ ∩ B' }),
    ];
  }
  const BOSS6 = (set) => set.slice(0, 6);
  const BOSS = {
    1: BOSS6(bossSet({ law: ['A ∪ B = B ∪ A', '교환법칙', '순서를 바꾸어도 결과가 같다 → 교환법칙'],
      A2: [1, 2], B2: [2, 3], C2: [3, 4], c2: [[2, 3], [1, 2, 3, 4], [1, 4], [1, 2, 3]],
      dist: ['A ∩ (B ∪ C) = (A ∩ B) ∪ (   )', ['A ∪ C', 'B ∩ C', 'A ∩ C', 'B ∪ C'], 'A ∩ C'],
      U4: range(1, 5), A4: [2, 4], c4: [[2, 4], [1, 2, 3, 4, 5], [1, 3, 5], []],
      A5: [1, 2, 3, 4], B5: [2, 4, 6], c5: [[6], [2, 4], [1, 3, 6], [1, 3]], c6: [[1, 3], [6], [2, 4], [1, 3, 6]],
      A7: [1, 2, 3, 4, 5], B7: [2, 4, 6], C7: [4, 5, 6], c7: ['B ∪ C, {1, 2, 3, 4, 5, 6}', 'B ∩ C, {4, 6}', 'B ∩ C, {1, 2, 3, 4, 5, 6}', 'B ∪ C, {2, 4, 5, 6}'],
      U8: range(1, 10), cA8: 'm3', cB8: 'odd', c8: [[3, 9], [1, 3, 5, 7, 9], [2, 4, 8, 10], [1, 5, 7]] })),
    2: BOSS6(bossSet({ law: ['(A ∩ B) ∩ C = A ∩ (B ∩ C)', '결합법칙', '어느 두 개를 먼저 계산해도 결과가 같다 → 결합법칙'],
      A2: [2, 5], B2: [5, 6], C2: [6, 7], c2: [[2, 5, 6, 7], [5, 6], [2, 7], [2, 5, 6]],
      dist: ['A ∪ (B ∩ C) = (A ∪ B) ∩ (   )', ['A ∩ C', 'A ∪ C', 'B ∪ C', 'B ∩ C'], 'A ∪ C'],
      U4: range(1, 6), A4: [1, 3, 5], c4: [[1, 3, 5], [2, 4, 6], [1, 2, 3, 4, 5, 6], []],
      A5: [2, 3, 5, 7], B5: [3, 4, 5], c5: [[2, 7], [4], [3, 5], [2, 4, 7]], c6: [[2, 7], [3, 5], [4], [2, 4, 7]],
      A7: [1, 2, 3], B7: [3, 4, 5], C7: [4, 5, 6], c7: ['B ∩ C, {4, 5}', 'B ∪ C, {1, 2, 3, 4, 5, 6}', 'B ∩ C, {1, 2, 3, 4, 5}', 'B ∪ C, {3, 4, 5, 6}'],
      U8: range(1, 10), cA8: 'm4', cB8: 'even', c8: [[4, 8], [2, 6, 10], [2, 4, 6, 8, 10], [1, 3, 5, 7, 9]] })),
  };

  // ── 형성평가 재도전 생성기 (2026-11-05 사용자 결정: 문항마다 4번 · 시도 0 = 학습지 · 시도 1~3 = 같은 유형 · 같은 난이도의 새 문제) ──
  //   make(i, a, rng) → 문항 i 하나 · 보기는 시도마다 섞음 · 검산 정보(check)는 학습지 세트와 같은 모양 (tests/lesson5.test.js 가 따로 계산)
  const LAW_FORMS = [ // [식, 법칙] — 같은 법칙의 여러 모양 (교과서 표기)
    ...[['A', 'B'], ['B', 'A'], ['B', 'C'], ['C', 'B'], ['A', 'C'], ['C', 'A']].flatMap(([x, y]) => ['∪', '∩'].map((op) => [`${x} ${op} ${y} = ${y} ${op} ${x}`, '교환법칙'])),
    ...['∪', '∩'].flatMap((op) => [[`(A ${op} B) ${op} C = A ${op} (B ${op} C)`, '결합법칙'], [`A ${op} (B ${op} C) = (A ${op} B) ${op} C`, '결합법칙']]),
    ['A ∩ (B ∪ C) = (A ∩ B) ∪ (A ∩ C)', '분배법칙'], ['A ∪ (B ∩ C) = (A ∪ B) ∩ (A ∪ C)', '분배법칙'],
    ['(A ∩ B) ∪ (A ∩ C) = A ∩ (B ∪ C)', '분배법칙'], ['(A ∪ B) ∩ (A ∪ C) = A ∪ (B ∩ C)', '분배법칙'],
  ];
  const LAW_SOL = { 교환법칙: '순서를 바꾸어도 결과가 같다 → 교환법칙', 결합법칙: '어느 두 개를 먼저 계산해도 결과가 같다 → 결합법칙', 분배법칙: '∩ 와 ∪ 가 섞여 있고, 한 집합을 괄호 안의 두 집합에 각각 나누어 계산한다 (거꾸로 묶어도 같다) → 분배법칙' };
  const pairStr = (x, op, y) => (x < y ? `${x} ${op} ${y}` : `${y} ${op} ${x}`); // 보기는 글자 순서로 (A ∩ C, B ∪ C …)
  const flip = (op) => (op === '∩' ? '∪' : '∩');
  const BOSS_GEN = [
    // 1. 법칙 이름: 법칙을 먼저 고르고(세 법칙이 고르게) 그 법칙의 모양 하나
    (r) => { const name = r.pick(LAWS), [expr] = r.pick(LAW_FORMS.filter((f) => f[1] === name)); return BI.law([expr, name, LAW_SOL[name]], LAWS); },
    // 2. A ∪ B ∪ C: 학습지처럼 원소 2개씩 사슬로 겹친 세 집합 (A = {p, q}, B = {q, s}, C = {s, t})
    (r) => {
      const [p, q, s, t] = r.shuffle(range(1, 9)).slice(0, 4), A = sorted([p, q]), B = sorted([q, s]), C = sorted([s, t]), AB = union(A, B), all = union(AB, C);
      const wrong = r.shuffle([sorted([q, s]), sorted([p, t]), AB, union(B, C)]).slice(0, 3); // 겹친 원소만 · 한 번만 나온 원소만 · 두 집합만 모음
      return BI.union3(A, B, C, [all, ...wrong], `A ∪ B = ${st(AB)} 에 C 를 모으기 → ${st(all)} (괄호 없이 써도 된다 · 결합법칙)`);
    },
    // 3. 분배법칙 빈칸: 모양 6가지 × (B, C 자리 바꾸기) · 보기 = 두 글자 식 (정답의 ∩ ↔ ∪ 바꾼 것은 늘 넣음)
    (r) => {
      const [Y, Z] = r.shuffle(['B', 'C']), o = r.pick(['∩', '∪']), p = flip(o), X = 'A';
      const form = r.pick([
        [`${X} ${o} (${Y} ${p} ${Z}) = (${X} ${o} ${Y}) ${p} (   )`, [X, o, Z]],
        [`${X} ${o} (${Y} ${p} ${Z}) = (   ) ${p} (${X} ${o} ${Z})`, [X, o, Y]],
        [`(${X} ${o} ${Y}) ${p} (${X} ${o} ${Z}) = ${X} ${o} (   )`, [Y, p, Z]],
      ]);
      const [a1, op, a2] = form[1], ans = pairStr(a1, op, a2);
      const others = [['A', 'B'], ['A', 'C'], ['B', 'C']].flatMap(([x, y]) => ['∩', '∪'].map((w) => pairStr(x, w, y))).filter((c) => c !== ans && c !== pairStr(a1, flip(op), a2));
      const full = form[0].replace('(   )', `(${a1} ${op} ${a2})`);
      return BI.dist([form[0], [ans, pairStr(a1, flip(op), a2), ...r.shuffle(others).slice(0, 2)], ans], `분배법칙: ${full} → (   ) = ${ans}`);
    },
    // 4. 여집합: U = {1, …, n} (n = 5~7), A 는 원소 2~3개 · 보기 = Aᶜ · A · U · ∅ (학습지와 같은 함정)
    (r) => {
      const U = range(1, r.int(5, 7)), A = sorted(r.shuffle(U).slice(0, r.int(2, 3))), Ac = comp(U, A);
      return BI.comp(U, A, [Ac, A, U, []], `U 의 원소 중 A 에 속하지 않는 것 → Aᶜ = ${st(Ac)}`);
    },
    // 5 · 6. 차집합: A 원소 4~5개, B 원소 3개 (1~9) · A ∩ B, A − B, B − A 모두 공집합이 아님
    //   보기 = 정답 · 반대 차집합(B − A ↔ A − B) · A ∩ B / 한쪽에만 있는 것 / A ∪ B 중 2개
    (r) => { const [A, B] = diffSets(r); return BI.diffAB(A, B, [minus(A, B), minus(B, A), ...diffWrong(r, A, B)], `A 에서 B 에도 있는 ${st(inter(A, B))} 빼기 → A − B = ${st(minus(A, B))}`); },
    (r) => { const [A, B] = diffSets(r); return BI.diffBA(A, B, [minus(B, A), minus(A, B), ...diffWrong(r, A, B)], '', `B 에서 A 에도 있는 ${st(inter(A, B))} 빼기 → B − A = ${st(minus(B, A))} (A − B 와 다르다!)`); },
  ];
  function diffSets(r) {
    for (;;) {
      const A = sorted(r.shuffle(range(1, 9)).slice(0, r.int(4, 5))), B = sorted(r.shuffle(range(1, 9)).slice(0, 3));
      if (inter(A, B).length && minus(A, B).length && minus(B, A).length) return [A, B];
    }
  }
  const diffWrong = (r, A, B) => r.shuffle([inter(A, B), union(minus(A, B), minus(B, A)), union(A, B)]).slice(0, 2);
  function bossMake(i, a, r) {
    if (!a) return BOSS[1][i]; // 시도 0 = 학습지 그대로 (게임도 시도 0 은 sets[1] 을 씀)
    let q = BOSS_GEN[i](r);
    for (let k = 0; k < 20 && q.question === BOSS[1][i].question; k++) q = BOSS_GEN[i](r); // 학습지 문항과 똑같이 나오면 다시 (재도전은 새 문제)
    const c = r.shuffle(q.choices);
    if (q.check.dist) q.check.dist = [q.check.dist[0], c, q.answer];
    return Object.assign(q, { choices: c, answerIndex: c.indexOf(q.answer) });
  }

  const STEPS = [
    { kind: 'concept', id: 'c1', title: '개념 1 · 교환법칙 · 결합법칙', say: '(먼저 지난 시간 복습: A ∩ B, A ∪ B, n(A ∪ B)) 순서를 바꾸어도 같다 → 교환법칙 A ∪ B = B ∪ A · 어느 두 개를 먼저 계산해도 같다 → 결합법칙 (A ∪ B) ∪ C = A ∪ (B ∪ C)' },
    { kind: 'monster', id: 'm1' },
    { kind: 'concept', id: 'c2', title: '개념 2 · 분배법칙', say: '수에서 2 × (3 + 4) = 2 × 3 + 2 × 4 처럼 → A ∩ (B ∪ C) = (A ∩ B) ∪ (A ∩ C), A ∪ (B ∩ C) = (A ∪ B) ∩ (A ∪ C) · 괄호만 옮기면 안 된다!' },
    { kind: 'monster', id: 'm2' },
    { kind: 'concept', id: 'c3', title: '개념 3 · 전체집합과 여집합', say: '처음에 생각하는 모든 원소의 집합 = 전체집합 U · U 의 원소 중 A 에 속하지 않는 원소의 집합 = A 의 여집합 Aᶜ (U 가 정해져야 구할 수 있다)' },
    { kind: 'concept', id: 'c4', title: '개념 4 · 차집합', say: 'A 에는 속하고 B 에는 속하지 않는 원소의 집합 = A − B · A − B 와 B − A 는 다르다!' },
    { kind: 'monster', id: 'm3' }, // 문제 3 · 4 (여집합 2 + 차집합 2)
    { kind: 'concept', id: 'c5', title: '개념 5 · 여집합 · 차집합의 성질', say: 'A ∪ Aᶜ = U, A ∩ Aᶜ = ∅, (Aᶜ)ᶜ = A, Uᶜ = ∅, ∅ᶜ = U · A − B = A ∩ Bᶜ (B 가 아닌 것 중 A 인 것)' },
    { kind: 'monster', id: 'm5' },
    { kind: 'boss', id: 'boss', title: '형성평가 · 흑요석 미노타우로스' },
  ];
  STEPS.forEach((s) => { if (s.kind === 'monster') Object.assign(s, { title: MONSTERS[s.id].title, special: !!MONSTERS[s.id].special }); });

  DS.Lessons.register({
    id: 'set-05', no: 5,
    title: '연산 법칙 · 여집합과 차집합',
    unit: '공통수학2 Ⅱ-1 집합 · 5차시',
    sheet: '학습과정 5차시 레이드용 v4',
    // 개념 · 문제 칸 위치 (학습지 v4 를 재서 넣음 · tools/worksheet/measure_crops.js) · v4 에는 보강 ① · ③ 칸이 없음 (보강던전은 영상만) · 보강 ② = STEP 6
    crops: { c1: [{ p: 1, x: 0.0426, y: 0.2701, w: 0.4458, h: 0.0843 }, { p: 1, x: 0.0426, y: 0.3526, w: 0.4458, h: 0.1346 }], m1: [{ p: 1, x: 0.0426, y: 0.4854, w: 0.4458, h: 0.1522 }],
      c2: [{ p: 1, x: 0.0426, y: 0.6385, w: 0.4458, h: 0.1491 }], m2: [{ p: 1, x: 0.0426, y: 0.7858, w: 0.4458, h: 0.1522 }],
      c3: [{ p: 1, x: 0.5116, y: 0.1764, w: 0.4458, h: 0.22 }], c4: [{ p: 1, x: 0.5116, y: 0.4861, w: 0.4458, h: 0.1965 }],
      m3: [{ p: 1, x: 0.5116, y: 0.3928, w: 0.4458, h: 0.0942 }, { p: 1, x: 0.5116, y: 0.6791, w: 0.4458, h: 0.0629 }],
      c5: [{ p: 2, x: 0.0426, y: 0.103, w: 0.4458, h: 0.1411 }], m5: [{ p: 2, x: 0.0426, y: 0.2423, w: 0.4458, h: 0.0948 }],
      boss: [{ p: 2, x: 0.5116, y: 0.103, w: 0.4458, h: 0.7156 }],
      b2: [{ p: 2, x: 0.0426, y: 0.103, w: 0.4458, h: 0.1411 }] },
    split: { m3: ['c3', 'c3', 'c4', 'c4'] }, // 한 몬스터에 두 개념: 소문제마다 개념 (결과 · 대시보드의 개념별 첫 시도)
    theme: '07-volcano', // 던전 테마: 화산 심연 (배경 dg-07)
    // 🎬 05 모션그래픽 v2 (2026-11-03 교체, 옛 07·08·11~14 는 99 지난판): 26 교환·결합 → c1·m1 · 27 분배 → c2·m2 · 28 간단히 → b1
    //    29 전체집합과 여집합 → c3·m3(문제 3 · 4) · 30 차집합 → c4·b3 · 31 여집합 · 차집합의 성질 → c5·m5·b2
    videos: { c1: 'assets/video/v05-26-v3.mp4', m1: 'assets/video/v05-26-v3.mp4', c2: 'assets/video/v05-27-v3.mp4', m2: 'assets/video/v05-27-v3.mp4',
      b1: 'assets/video/v05-28-v3.mp4', c3: 'assets/video/v05-29-v3.mp4', m3: 'assets/video/v05-29-v3.mp4',
      c4: 'assets/video/v05-30-v3.mp4', b3: 'assets/video/v05-30-v3.mp4',
      c5: 'assets/video/v05-31-v3.mp4', m5: 'assets/video/v05-31-v3.mp4', b2: 'assets/video/v05-31-v3.mp4' },
    goal: '교환·결합·분배법칙을 안다 · 여집합과 차집합을 구한다 · A − B = A ∩ Bᶜ 임을 안다',
    defaultPct: 90,
    steps: STEPS,
    monsters: MONSTERS,
    // 보강(bonus)은 2026-11-05 사용자 결정으로 삭제 — 위 b1~ 몬스터는 게임에 나오지 않음 (지난 기록 이어 셈용 · Bonus.LEGACY)
    items(id, seed, attempt) { return MONSTERS[id].make(attempt, DS.Rng(`${seed}|${id}|${attempt}`)); },
    COND,
    next: { title: '6차시 · 드모르간의 법칙', ask: '(A ∪ B)ᶜ 는 Aᶜ ∪ Bᶜ 일까, Aᶜ ∩ Bᶜ 일까?', link: '오늘 배운 여집합(ᶜ)과 분배법칙으로 「괄호 밖 ᶜ」를 안으로 넣는 방법을 알아봐요.' }, // 다음 수업 (초안)
    boss: { title: '5차시 형성평가 · 흑요석 미노타우로스', sprite: 'extra:9', items: 6, hpItems: 6, sets: BOSS, tags: ['c1', 'c1', 'c2', 'c3', 'c4', 'c4'],
      make(i, a, rng) { return bossMake(i, a, rng); } }, // 재도전 1~3 = 같은 유형의 새 문제 (위 BOSS_GEN)
  });
})();
