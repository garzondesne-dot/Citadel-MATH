// 공통수학2 Ⅱ. 집합과 명제 · 6차시 「드모르간의 법칙 · 명제」 (학습과정 6차시 레이드용 v2 · 2026-11-04 사용자 확정)
// v2: 도입 · 복습은 말로 · 학습지 ★ 칸만 게임(KEEP) · 보강 ③ → 문제 4-2(삼단논법 · 명제 고르기) · STEP 6 = 사각형의 포함 관계와 명제(문제 6)
//     · 형성평가 6문항(도전 7 · 8 뺌 · 4번 = 사각형 명제 참 · 거짓) · 보강 ② · ④ 없앰 · 보강 ① 만 🟪 중단원던전 6층
// 레이드 순서: 개념1(드모르간) → 문제1 → 개념2(원소의 개수) → 문제2 → 개념3(생활 속 문제) → 문제3 → 개념4(명제) → 문제4 → 문제4-2
//            → 개념5(명제의 부정) → 문제5 → 개념6(사각형의 포함 관계와 명제) → 문제6 → 형성평가
// 컨펌된 변경: 부정 「쓰기」 → 고르기(문제 5 · 형성평가 6 · 도전 8) · 형성평가 2 · 4 고르기 · 학습목표 번호 오타
// 첫 시도(attempt 0)는 학습지 그대로, 재도전은 새 숫자 · 새 문장(문장 묶음). 정답은 tests/lesson6.test.js 가 따로 계산한다.
(function () {
  const S = DS.SetGen;
  const st = (a) => (a.length ? S.setStr(a) : '∅');
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const sorted = (a) => a.slice().sort((x, y) => x - y);
  const inter = (A, B) => sorted(A.filter((x) => B.includes(x)));
  const union = (A, B) => sorted([...new Set([...A, ...B])]);
  const comp = (U, A) => sorted(U.filter((x) => !A.includes(x)));
  const ch = (question, choices, ans, solution, check) => ({ type: 'choice', question, choices, answerIndex: choices.indexOf(ans), answer: ans, solution, check });
  const nq = (question, answer, solution, check) => ({ type: 'number', question, answer, solution, check });
  const C = 'ᶜ';

  // ── 문제 1: 드모르간 (U 의 원소 골라 담기) ─────────────────
  function pick(head, label, want, U, sol, check) {
    return { type: 'multi', question: `${head}${label} 의 원소를 모두 고르시오.`, options: U.map(String), answer: U.map((x, i) => (want.includes(x) ? i : -1)).filter((i) => i >= 0),
      solution: `${sol} → ${label} = ${st(want)}`, check: Object.assign({ expr: label }, check) };
  }
  function m1Make(U, A, B) {
    const head = `U = ${st(U)}, A = ${st(A)}, B = ${st(B)} 일 때 `, k = { U, sets: { A, B } };
    const AuB = union(A, B), AnB = inter(A, B), Ac = comp(U, A), Bc = comp(U, B);
    return [
      pick(`(1) ${head}`, `(A ∪ B)${C}`, comp(U, AuB), U, `A ∪ B = ${st(AuB)} 의 바깥`, k),
      pick(`(2) ${head}`, `A${C}`, Ac, U, 'U 에서 A 빼기', k),
      pick(`(2) ${head}`, `B${C}`, Bc, U, 'U 에서 B 빼기', k),
      pick(`(2) ${head}`, `A${C} ∩ B${C}`, inter(Ac, Bc), U, `${st(Ac)} 와 ${st(Bc)} 에 둘 다 있는 것 = (1)과 같다 (드모르간)`, k),
      pick(`(3) ${head}`, `(A ∩ B)${C}`, comp(U, AnB), U, `A ∩ B = ${st(AnB)} 의 바깥`, k),
      pick(`(3) ${head}`, `A${C} ∪ B${C}`, union(Ac, Bc), U, `${st(Ac)} 와 ${st(Bc)} 를 모으기 = (A ∩ B)${C} (드모르간)`, k),
    ];
  }
  function m1Retry(r) {
    for (;;) {
      const U = range(1, r.int(6, 7)), A = sorted(r.shuffle(U.slice()).slice(0, 3)), B = sorted(r.shuffle(U.slice()).slice(0, r.int(2, 3)));
      if (inter(A, B).length !== 1 || union(A, B).length >= U.length - 1) continue;
      return m1Make(U, A, B);
    }
  }

  // ── 문제 2: 여집합 · 차집합의 원소의 개수 ────────────────
  function m2Make(u, a, b, ab) {
    const head = `n(U) = ${u}, n(A) = ${a}, n(B) = ${b}, n(A ∩ B) = ${ab} 일 때 `, k = { n: { U: u, A: a, B: b, AB: ab } };
    const aub = a + b - ab;
    return [
      nq(`(1) ${head}n(A${C}) = ?`, u - a, `n(U) − n(A) = ${u} − ${a}`, Object.assign({ q: 'Ac' }, k)),
      nq(`(2) ${head}n(A − B) = ?`, a - ab, `n(A) − n(A ∩ B) = ${a} − ${ab}`, Object.assign({ q: 'A-B' }, k)),
      nq(`(3) ${head}n(B − A) = ?`, b - ab, `n(B) − n(A ∩ B) = ${b} − ${ab}`, Object.assign({ q: 'B-A' }, k)),
      nq(`(4) ${head}n(A ∪ B) = ?`, aub, `${a} + ${b} − ${ab}`, Object.assign({ q: 'AuB' }, k)),
      nq(`(5) ${head}n(A${C} ∩ B${C}) = n((A ∪ B)${C}) = ?`, u - aub, `드모르간 → n(U) − n(A ∪ B) = ${u} − ${aub}`, Object.assign({ q: 'AcnBc' }, k)),
    ];
  }
  function m2Retry(r) {
    for (;;) {
      const u = r.int(25, 40), a = r.int(8, 16), b = r.int(8, 16), ab = r.int(2, 6);
      if (ab >= a || ab >= b || a + b - ab >= u || a === b) continue;
      return m2Make(u, a, b, ab);
    }
  }

  // ── 문제 3: 생활 속 문제 (둘 다 칸부터) ───────────────────
  const CLUBS = [['축구', '밴드'], ['미술', '음악'], ['농구', '독서'], ['댄스', '코딩'], ['요리', '사진']];
  function m3Make(T, x, y, both, [p, q]) {
    const head = `1학년 ${T}명 중 ${p} 동아리 ${x}명, ${q} 동아리 ${y}명, 둘 다 ${both}명이다. `, k = { T, x, y, both };
    return [
      nq(`(1) ${head}${p} 또는 ${q} 동아리 학생 수는?`, x + y - both, `${x} + ${y} − ${both}`, Object.assign({ q: 'or' }, k)),
      nq(`(2) ${head}${p}만 하는 학생 수는?`, x - both, `${x} − ${both}`, Object.assign({ q: 'only' }, k)),
      nq(`(3) ${head}둘 다 하지 않는 학생 수는?`, T - (x + y - both), `${T} − (${x} + ${y} − ${both})`, Object.assign({ q: 'none' }, k)),
    ];
  }
  function m3Retry(r) {
    for (;;) {
      const T = r.int(30, 40), x = r.int(10, 20), y = r.int(8, 16), both = r.int(2, 7);
      if (both >= x || both >= y || x + y - both >= T) continue;
      return m3Make(T, x, y, both, r.pick(CLUBS));
    }
  }

  // ── 문제 4: 참인 명제 / 거짓인 명제 / 명제 아님 (문장 묶음) ──
  const KIND = ['참인 명제', '거짓인 명제', '명제 아님'];
  const TRUE = ['3은 홀수이다.', '2는 소수이다.', '정사각형은 직사각형이다.', '6은 3의 배수이다.', '2 + 3 = 5', '삼각형의 세 내각의 합은 180°이다.'];
  const FALSE = ['5 + 4 = 10', '2 + 3 = 7', '9는 짝수이다.', '1은 소수이다.', '태양은 지구를 중심으로 돈다.', '4 < 1'];
  const NONE = ['축구는 재미있다.', '부산은 큰 도시이다.', '떡볶이는 맛있다.', '수학 선생님은 키가 크다.', '이 노래는 좋은 노래이다.', '우리 반 교실은 넓다.'];
  const kindOf = (s) => (TRUE.includes(s) ? KIND[0] : FALSE.includes(s) ? KIND[1] : KIND[2]);
  const why = (s) => (TRUE.includes(s) ? '참·거짓을 분명히 판별 → 참인 명제' : FALSE.includes(s) ? '참·거짓을 분명히 판별 → 거짓인 명제 (거짓도 명제!)' : '기준이 사람마다 다름 → 명제가 아니다');
  const kindQ = (n, s) => ch(`(${n}) 「${s}」 는?`, KIND, kindOf(s), why(s), { sentence: s });
  const m4Make = (list) => list.map((s, i) => kindQ(i + 1, s));
  const m4Retry = (r) => m4Make(r.shuffle([...r.shuffle(TRUE.slice()).slice(0, 1), ...r.shuffle(FALSE.slice()).slice(0, 1), ...r.shuffle(NONE.slice()).slice(0, 2)])); // v2: 4문장 (참 1 · 거짓 1 · 명제 아님 2)

  // ── 문제 5: 명제의 부정 고르기 + 참·거짓 (문장 묶음) ──────
  // p · p 의 참거짓 · 올바른 부정 · 틀린 보기 2개 (틀린 보기는 「부정」의 모양이 아닌 것)
  const NEG = [
    { p: '4는 2의 배수이다.', t: true, neg: '4는 2의 배수가 아니다', wrong: ['4는 2의 약수이다', '4는 2의 배수이다'] },
    { p: '3 > 5', t: false, neg: '3 ≤ 5', wrong: ['3 < 5', '3 ≥ 5'] },
    { p: '√4 는 무리수이다.', t: false, neg: '√4는 무리수가 아니다', wrong: ['√4는 유리수가 아니다', '√4는 정수이다'] },
    { p: '6은 3의 배수이다.', t: true, neg: '6은 3의 배수가 아니다', wrong: ['6은 3의 약수이다', '6은 3의 배수이다'] },
    { p: '9는 짝수이다.', t: false, neg: '9는 짝수가 아니다', wrong: ['9는 홀수가 아니다', '9는 짝수이다'] },
    { p: '2 < 7', t: true, neg: '2 ≥ 7', wrong: ['2 > 7', '2 ≤ 7'] },
    { p: '√9 는 무리수이다.', t: false, neg: '√9는 무리수가 아니다', wrong: ['√9는 유리수가 아니다', '√9는 자연수이다'] },
    { p: '7은 소수이다.', t: true, neg: '7은 소수가 아니다', wrong: ['7은 짝수이다', '7은 소수이다'] },
    { p: '8 ≤ 3', t: false, neg: '8 > 3', wrong: ['8 < 3', '8 = 3'] },
  ];
  const TF = ['참', '거짓'];
  function negQs(n, e, order) {
    const choices = order || [e.neg, ...e.wrong];
    return [
      ch(`(${n}) 「${e.p}」 의 부정은?`, choices, e.neg, `ʻ~이 아니다’ (부등호는 > ↔ ≤, < ↔ ≥) → ${e.neg}`, { neg: e.p }),
      ch(`(${n}) 「${e.p}」 의 부정 「${e.neg}」 는 참인가 거짓인가?`, TF, e.t ? '거짓' : '참', `p 가 ${e.t ? '참' : '거짓'} → ~p 는 ${e.t ? '거짓' : '참'}`, { negTruth: e.p }),
    ];
  }
  const m5Make = (es, shuffle) => es.flatMap((e, i) => negQs(i + 1, e, shuffle ? shuffle([e.neg, ...e.wrong]) : null));
  const m5Retry = (r) => m5Make(r.shuffle(NEG.slice(3)).slice(0, 2), (a) => r.shuffle(a)); // v2: 2문장

  // ── 보강 ① 색칠한 부분의 원소 개수 ─────────────────────
  function b1Make(u, nAB, nOut) {
    const head = `U = {1, 2, …, ${u}} 의 두 부분집합 A, B 에 대하여 n(A ∩ B) = ${nAB}, n((A ∪ B)${C}) = ${nOut} 일 때 `, k = { u, nAB, nOut };
    return [
      nq(`${head}n(A ∪ B) = ?`, u - nOut, `${u} − ${nOut}`, Object.assign({ q: 'AuB' }, k)),
      nq(`${head}A ∪ B 에서 A ∩ B 를 뺀 부분의 원소의 개수는?`, u - nOut - nAB, `${u - nOut} − ${nAB}`, Object.assign({ q: 'ring' }, k)),
    ];
  }
  const b1Retry = (r) => b1Make(r.int(8, 10), r.int(1, 2), r.int(1, 3));

  // ── 문제 4-2 (옛 보강 ③) 삼단논법 · 명제 고르기 ─────────────────────
  const SYL = [
    { a: '모든 사람은 죽는다.', b: '소크라테스는 사람이다.', head: '소크라테스는', ans: '죽는다', choices: ['죽는다', '사람이다', '소크라테스다'] },
    { a: '모든 새는 날개가 있다.', b: '참새는 새이다.', head: '참새는', ans: '날개가 있다', choices: ['날개가 있다', '새이다', '참새이다'] },
    { a: '모든 정사각형은 직사각형이다.', b: '이 도형은 정사각형이다.', head: '이 도형은', ans: '직사각형이다', choices: ['직사각형이다', '정사각형이다', '도형이다'] },
  ];
  const sylQ = (s, order) => ch(`전제1 ${s.a} 전제2 ${s.b} 결론: 따라서 ${s.head} ( ) — 알맞은 것은?`, order || s.choices, s.ans, `${s.head} ${s.ans} (두 전제를 이어서)`, { syl: true });
  const PICK6 = ['순천시는 대한민국의 수도이다.', '맛초킹은 가장 맛있는 치킨이다.', '우리 반 착한 친구의 비중이 전국에서 가장 높다.', '태양은 지구를 중심으로 돈다.', '수학 선생님은 키가 크다.', '제주도는 대한민국에서 가장 큰 섬이다.'];
  const PROP_EXTRA = ['순천시는 대한민국의 수도이다.', '태양은 지구를 중심으로 돈다.', '제주도는 대한민국에서 가장 큰 섬이다.'];
  const isProp = (s) => PROP_EXTRA.includes(s) || TRUE.includes(s) || FALSE.includes(s);
  const propPick = (list) => ({ type: 'multi', question: '다음 중 명제인 것을 모두 고르시오.', options: list, answer: list.map((s, i) => (isProp(s) ? i : -1)).filter((i) => i >= 0),
    solution: `참·거짓을 분명히 판별할 수 있는 것 (거짓도 명제!) → ${list.filter(isProp).join(' / ')}`, check: { props: list } });
  const NONE2 = ['맛초킹은 가장 맛있는 치킨이다.', '우리 반 착한 친구의 비중이 전국에서 가장 높다.', '수학 선생님은 키가 크다.', ...NONE];
  const b3Retry = (r) => { const s = r.pick(SYL.slice(1)); return [sylQ(s, r.shuffle(s.choices.slice())), propPick(r.shuffle([...r.shuffle([...TRUE, ...FALSE]).slice(0, 3), ...r.shuffle(NONE2.slice()).slice(0, 3)]))]; };

  // ── 문제 6 · 형성평가 4: 사각형의 포함 관계와 명제 (v2 · 8차시 「p → q 참 ⇔ P ⊂ Q」를 미리 그림으로) ──
  //   사각형 가족: 사다리꼴(한 쌍 이상 평행) ⊃ 평행사변형 ⊃ 직사각형 · 마름모, 정사각형 = 직사각형 ∩ 마름모
  //   참 · 거짓 = 대표 사각형 5개(반례 후보)로 계산: 「X이면 Y」 가 참 ⇔ X 에 드는 대표가 모두 Y 에도 든다
  const QD = ['사다리꼴', '평행사변형', '직사각형', '마름모', '정사각형'];
  const QREP = [ // 대표 사각형 → 드는 가족 (반례로 씀)
    { name: '한 쌍만 평행한 사다리꼴', in: ['사다리꼴'] },
    { name: '네 각이 직각이 아닌 평행사변형', in: ['사다리꼴', '평행사변형'] },
    { name: '가로 2, 세로 1인 직사각형', in: ['사다리꼴', '평행사변형', '직사각형'] },
    { name: '네 각이 직각이 아닌 마름모', in: ['사다리꼴', '평행사변형', '마름모'] },
    { name: '정사각형', in: QD.slice() },
  ];
  const qTrue = (x, y) => QREP.every((r) => !r.in.includes(x) || r.in.includes(y));
  const qWhy = (x, y) => { if (qTrue(x, y)) return `${eun(x)} 모두 ${y} 안에 든다 (${x} ⊂ ${y}) → 참`; const c = QREP.find((r) => r.in.includes(x) && !r.in.includes(y)); return `반례: ${c.name} — ${x}이지만 ${iga(y)} 아니다 → 거짓`; };
  const bat = (w) => (w.charCodeAt(w.length - 1) - 0xac00) % 28 > 0; // 받침 있음 → 은 · 이 / 없음 → 는 · 가
  const eun = (w) => w + (bat(w) ? '은' : '는'), iga = (w) => w + (bat(w) ? '이' : '가');
  const quadQ = (n, x, y) => ch(`${n ? `(${n}) ` : ''}「${x}이면 ${y}이다.」 는 참인가 거짓인가?`, TF, qTrue(x, y) ? '참' : '거짓', qWhy(x, y), { quad: [x, y] });
  const m6Make = (pairs) => pairs.map(([x, y], i) => quadQ(i + 1, x, y));
  function m6Retry(r) { // 참 2 · 거짓 2 (서로 다른 짝 · 처음 문제와 겹치지 않게)
    const used = ['마름모|평행사변형', '평행사변형|직사각형', '정사각형|마름모', '사다리꼴|평행사변형'];
    const all = []; QD.forEach((x) => QD.forEach((y) => { if (x !== y && !used.includes(`${x}|${y}`)) all.push([x, y]); }));
    const t = r.shuffle(all.filter(([x, y]) => qTrue(x, y))).slice(0, 2), f = r.shuffle(all.filter(([x, y]) => !qTrue(x, y))).slice(0, 2);
    return m6Make(r.shuffle([...t, ...f]));
  }

  // ── 몬스터 (학습지 순서) ─────────────────────────────────
  // 땅굴 테마 · v1 남은 몬스터 5마리(이끼 미믹 · 서리 늑대 · 버섯 기사 · 자수정 눈알 문어 · 청록 수정룡) · 보강 = 색 변형(@h) · v2 도트가 오면 교체
  // v2 (2026-11-04): 학습지 ★ 칸만 게임에 (KEEP = 남기는 소문제 번호 · 나머지는 학습지에서만 중간 계산)
  const KEEP = { m1: [0, 3, 4, 5], m2: [0, 1, 4], m3: [0, 2] }, keep = (id, arr) => KEEP[id].map((i) => arr[i]);
  const MONSTERS = {
    m1: { title: '문제 1', sprite: 'extra:3', make: (a, r) => keep('m1', a === 0 ? m1Make(range(1, 6), [1, 2, 3], [3, 4]) : m1Retry(r)) },
    m2: { title: '문제 2', sprite: 'extra:6', make: (a, r) => keep('m2', a === 0 ? m2Make(30, 12, 15, 5) : m2Retry(r)) },
    m3: { title: '문제 3', sprite: 'extra:7', make: (a, r) => keep('m3', a === 0 ? m3Make(40, 18, 12, 5, CLUBS[0]) : m3Retry(r)) },
    m4: { title: '문제 4', sprite: 'crown:6', make: (a, r) => (a === 0 ? m4Make(['5 + 4 = 10', '축구는 재미있다.', '2는 소수이다.', '부산은 큰 도시이다.']) : m4Retry(r)) },
    m42: { title: '문제 4-2 · 삼단논법 · 명제 고르기', sprite: 'crown:6@h120', make: (a, r) => (a === 0 ? [sylQ(SYL[0]), propPick(PICK6)] : b3Retry(r)) },
    m5: { title: '문제 5', sprite: 'crown:9', make: (a, r) => (a === 0 ? m5Make(NEG.slice(0, 2)) : m5Retry(r)) },
    m6: { title: '문제 6 · 사각형 명제', sprite: 'extra:6@h300', make: (a, r) => (a === 0 ? m6Make([['마름모', '평행사변형'], ['평행사변형', '직사각형'], ['정사각형', '마름모'], ['사다리꼴', '평행사변형']]) : m6Retry(r)) },
    // 🟪 중단원던전 6층 (레이드 밖 · 혼자)
    b1: { title: '보강 ① · 색칠한 부분의 원소 개수', bonus: true, concept: 'c2', sprite: 'extra:3@h150', make: (a, r) => (a === 0 ? b1Make(7, 1, 2) : b1Retry(r)) },
  };


  // ── 형성평가 (보스) — 세트1: 학습지 그대로, 세트2: 숫자 · 문장을 바꾼 재도전 · v2: 6문항 (도전 7 · 8 뺌 · 4번 = 사각형 명제 참 · 거짓) ──
  function bossSet(o) {
    return [
      ch(`1. ${o.q1} 의 ( ) 에 알맞은 것은?`, ['∪', '∩'], o.a1, '드모르간: 괄호를 풀면 ᶜ 이 각각 붙고 ∪ ↔ ∩', { dm: o.q1 }),
      ch(`2. ${o.q2} 과 같은 것은?`, o.c2, o.c2[0], '드모르간의 법칙', { dm2: o.q2 }),
      nq(`3. n(U) = ${o.u3}, n(A) = ${o.a3} 일 때 n(A${C}) = ?`, o.u3 - o.a3, `${o.u3} − ${o.a3}`, { u: o.u3, a: o.a3 }),
      quadQ(0, o.q4[0], o.q4[1]),
      ch('5. 다음 중 명제가 아닌 것은?', o.c5, o.c5[2], '기준이 사람마다 다른 문장은 명제가 아니다', { notProp: o.c5[2] }),
      ch(`6. “${o.p6}” 의 부정은?`, o.c6, o.c6[0], 'ʻ~이 아니다’', { neg: o.p6 }),
    ].map((q, i) => (i === 3 ? Object.assign(q, { question: `4. ${q.question}` }) : q));
  }
  const ROT = (a, k) => a.slice(k).concat(a.slice(0, k)); // 보기 순서 섞기 (정답 = 원래 0번)
  const BOSS = {
    1: bossSet({ q1: `(A ∪ B)${C} = A${C} ( ) B${C}`, a1: '∩', q2: `(A ∩ B)${C}`, c2: [`A${C} ∪ B${C}`, `A${C} ∩ B${C}`, 'A ∪ B', `(A ∪ B)${C}`],
      u3: 20, a3: 7, q4: ['직사각형', '평행사변형'],
      c5: ['1 + 1 = 3', '6은 3의 배수이다.', '떡볶이는 맛있다.'], p6: '5는 홀수이다.', c6: ['5는 홀수가 아니다', '5는 짝수가 아니다', '5는 홀수이다'] }),
    2: bossSet({ q1: `(A ∩ B)${C} = A${C} ( ) B${C}`, a1: '∪', q2: `(A ∪ B)${C}`, c2: [`A${C} ∩ B${C}`, `A${C} ∪ B${C}`, 'A ∩ B', `(A ∩ B)${C}`],
      u3: 25, a3: 9, q4: ['마름모', '정사각형'],
      c5: ['2 + 2 = 5', '9는 3의 배수이다.', '이 영화는 재미있다.'], p6: '8은 짝수이다.', c6: ['8은 짝수가 아니다', '8은 홀수가 아니다', '8은 짝수이다'] }),
  };
  // 세트마다 보기 순서를 섞어 둔다 (정답이 늘 ①에 오지 않게) — 같은 순서가 학생 · 교사 기기에서 같게 고정
  [[1, [0, 1, 0, 0, 2, 1]], [2, [1, 2, 0, 0, 1, 2]]].forEach(([set, ks]) => BOSS[set].forEach((q, i) => { if (q.type === 'choice' && ks[i]) { q.choices = ROT(q.choices, ks[i]); q.answerIndex = q.choices.indexOf(q.answer); } }));

  const STEPS = [
    { kind: 'concept', id: 'c1', title: '개념 1 · 드모르간의 법칙', say: '(먼저 말로: 급식에서 「둘 다 안 먹는」 친구 · 지난 시간 Aᶜ, A − B 복습) (A ∪ B)ᶜ = Aᶜ ∩ Bᶜ, (A ∩ B)ᶜ = Aᶜ ∪ Bᶜ · 괄호를 풀 때 ᶜ 이 각각 붙고 ∪ ↔ ∩ 가 바뀐다!' },
    { kind: 'monster', id: 'm1' },
    { kind: 'concept', id: 'c2', title: '개념 2 · 여집합 · 차집합의 원소의 개수', say: 'n(Aᶜ) = n(U) − n(A) · n(A − B) = n(A) − n(A ∩ B) = n(A ∪ B) − n(B)' },
    { kind: 'monster', id: 'm2' },
    { kind: 'concept', id: 'c3', title: '개념 3 · 생활 속 문제', say: '벤 다이어그램 칸에 숫자를 직접 써 넣기 — 「둘 다」 칸부터!' },
    { kind: 'monster', id: 'm3' },
    { kind: 'concept', id: 'c4', title: '개념 4 · 명제', say: '참인지 거짓인지 분명하게 판별할 수 있는 문장이나 식 = 명제 · 거짓인 문장도 명제! · 맛있다 · 크다 · 멋지다 처럼 기준이 모호하면 명제가 아니다' },
    { kind: 'monster', id: 'm4' },
    { kind: 'monster', id: 'm42' },
    { kind: 'concept', id: 'c5', title: '개념 5 · 명제의 부정', say: 'ʻp 가 아니다’ = ~p · p 가 참이면 ~p 는 거짓, p 가 거짓이면 ~p 는 참 · ~(~p) = p · ' },
    { kind: 'monster', id: 'm5' },
    { kind: 'concept', id: 'c6', title: '개념 6 · 사각형의 포함 관계와 명제', say: '사각형 가족의 뜻(정의) → 포함 그림 · 「p이면 q이다」 = p 가 q 안에 쏙 들어가면 참, 삐져나오는 반례가 있으면 거짓 · 정사각형이면 직사각형(참) / 직사각형이면 정사각형(거짓: 가로 2 세로 1) · 8차시에 진리집합으로 다시!' },
    { kind: 'monster', id: 'm6' },
    { kind: 'boss', id: 'boss', title: '형성평가 · 그림자 드래곤' },
  ];
  STEPS.forEach((s) => { if (s.kind === 'monster') Object.assign(s, { title: MONSTERS[s.id].title, special: !!MONSTERS[s.id].special }); });

  DS.Lessons.register({
    id: 'set-06', no: 6,
    title: '드모르간의 법칙 · 명제',
    unit: '공통수학2 Ⅱ. 집합과 명제 · 6차시',
    sheet: '학습과정 6차시 레이드용 v2',
    // 칸 위치 (레이드용 v2 를 tools/worksheet/measure_crops.js 로 잼 · 2026-11-04)
    crops: { c1: [{ p: 1, x: 0.0426, y: 0.1602, w: 0.4458, h: 0.1389 }], m1: [{ p: 1, x: 0.0426, y: 0.2973, w: 0.4458, h: 0.1609 }], c2: [{ p: 1, x: 0.0426, y: 0.4591, w: 0.4458, h: 0.0923 }], m2: [{ p: 1, x: 0.0426, y: 0.5496, w: 0.4458, h: 0.1308 }], c3: [{ p: 1, x: 0.0426, y: 0.6813, w: 0.4458, h: 0.0773 }], m3: [{ p: 1, x: 0.0426, y: 0.7568, w: 0.4458, h: 0.1084 }], c4: [{ p: 1, x: 0.5116, y: 0.1892, w: 0.4458, h: 0.1086 }], m4: [{ p: 1, x: 0.5116, y: 0.2942, w: 0.4458, h: 0.1392 }], m42: [{ p: 1, x: 0.5116, y: 0.4325, w: 0.4458, h: 0.2599 }], c5: [{ p: 1, x: 0.5116, y: 0.6889, w: 0.4458, h: 0.1646 }], m5: [{ p: 1, x: 0.5116, y: 0.8499, w: 0.4458, h: 0.1049 }], c6: [{ p: 2, x: 0.0426, y: 0.103, w: 0.4458, h: 0.4561 }], m6: [{ p: 2, x: 0.0426, y: 0.5574, w: 0.4458, h: 0.1298 }], boss: [{ p: 2, x: 0.5116, y: 0.103, w: 0.4458, h: 0.6544 }] },
    theme: '01-burrow', // 던전 테마: 땅굴 (배경 dg-01 · 포털 portal-01)
    // 🎬 「공통수학2 > 05 모션그래픽」: (06차시) 09 드모르간 → c1 · m1 · 18 원소의 개수 → c2 · m2 · b1 · 19 생활 속 문제 → c3 · m3
    //    · 20 명제 → c4 · m4 · m42 · 21 명제의 부정 → c5 · m5 · 22 사각형의 포함 관계와 명제(UI 데모 스타일 · 2026-11-04) → c6 · m6
    videos: { c1: 'assets/video/v06-09.mp4', m1: 'assets/video/v06-09.mp4',
      c2: 'assets/video/v06-18.mp4', m2: 'assets/video/v06-18.mp4', b1: 'assets/video/v06-18.mp4',
      c3: 'assets/video/v06-19.mp4', m3: 'assets/video/v06-19.mp4',
      c4: 'assets/video/v06-20.mp4', m4: 'assets/video/v06-20.mp4', m42: 'assets/video/v06-20.mp4',
      c5: 'assets/video/v06-21.mp4', m5: 'assets/video/v06-21.mp4',
      c6: 'assets/video/v06-37.mp4', m6: 'assets/video/v06-22.mp4' }, // 2026-11-04: 개념 6 = 37 사각형의 포함관계(꼭짓점 끌기) · 문제 6 = 22 (사각형 명제)
    goal: '드모르간의 법칙을 이용한다 · 여집합 · 차집합의 원소의 개수를 구한다 · 명제와 그 부정의 참 · 거짓을 판별한다 · 사각형의 포함 관계를 「~이면 ~이다」 명제로 판별한다',
    defaultPct: 90,
    steps: STEPS,
    monsters: MONSTERS,
    // 보강(bonus)은 2026-11-05 사용자 결정으로 삭제 — 위 b1~ 몬스터는 게임에 나오지 않음 (지난 기록 이어 셈용 · Bonus.LEGACY)
    items(id, seed, attempt) { return MONSTERS[id].make(attempt, DS.Rng(`${seed}|${id}|${attempt}`)); },
    WORDS: { TRUE, FALSE, NONE, NEG, SYL, PROP_EXTRA, NONE2, QD, QREP },
    next: { title: '7차시 · 조건과 진리집합', ask: '「x 는 짝수이다」 는 명제일까? x 가 정해지면?', link: '오늘 배운 명제와 부정을 「조건」으로 넓혀, 참이 되게 하는 원소들의 집합(진리집합)을 찾아요.' }, // 다음 수업 (초안)
    boss: { title: '6차시 형성평가 · 그림자 드래곤', sprite: '2@h250', items: 6, hpItems: 6, sets: BOSS, tags: ['c1', 'c1', 'c2', 'c6', 'c4', 'c5'] },
  });
})();
