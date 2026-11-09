// 공통수학2 Ⅱ. 집합과 명제 · 6차시 「드모르간의 법칙 · 집합 중단원 마무리」 (학습과정 6차시 레이드용 v3 · 2026-11-05 사용자 확정 = 사용자가 보낸 PDF)
// v3: 명제 STEP 4~6 → 7차시로 (학습지에 집합 · 명제를 섞지 않음) · 오른쪽 · 2쪽 = 집합 중단원 마무리 (교과서 78~79쪽 07 · 08 · 11 · 12)
//     · 형성평가 6문항 = 드모르간 1 · n(Aᶜ) 1 · 중단원 04 · 05⑷ · 06 · 10 · ★ 칸만 게임
// 레이드 순서: 개념1(드모르간) → 문제1 → 개념2(원소의 개수) → 문제2 → 개념3(생활 속 문제) → 문제3 → 개념4(집합 한 장 정리) → 문제4(07) → 문제5(08) → 문제6(11) → 문제7(12) → 형성평가
// 중단원 문항(문제 4~7 · 형성평가 3~6)은 첫 시도 = 교과서 원문 그대로 (사용자 결정 · 11-03 「게임은 고친 숫자」의 예외 — 🏰 성채 1층은 고친 숫자 그대로)
// 재도전 = 같은 꼴 · 새 숫자. 정답은 tests/lesson6.test.js 가 문제 글을 읽어 따로 계산한다.
// v2 의 명제 몬스터(m4 · m42 · m5 · m6)와 보강 ① (b1)은 단계에서 빠지고 MONSTERS 에만 남김 — 1-6반(v2 로 수업)의 기록 · 오답노트가 그대로 열리게
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
      if (ab >= a || ab >= b || a + b - ab >= u || a === b || (u === 30 && a === 12 && b === 15 && ab === 5)) continue; // 학습지 그대로 빼기
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

  // ── v3 중단원 마무리 (교과서 78~79쪽) — 첫 시도 = 교과서 원문 · 재도전 = 같은 꼴 · 새 숫자 ─────────
  const divs = (n) => range(1, n).filter((d) => n % d === 0);
  const mults = (k, N) => range(1, N).filter((x) => x % k === 0);
  const minus = (A, B) => sorted(A.filter((x) => !B.includes(x)));
  const sup = (s) => String(s).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]);
  const last = (n) => Number(String(n).slice(-1));
  const gwaN = (n) => ([2, 4, 5, 9].includes(last(n)) ? `${n} 와` : `${n} 과`), lcmOf = (x, y) => { let a = x, b = y; while (b) [a, b] = [b, a % b]; return (x / a) * y; }; // #45 숫자 뒤 「과/와」 · 최소공배수
  const igaN = (n) => ([2, 4, 5, 9].includes(last(n)) ? `${n}가` : `${n}이`), ro = (n) => ([0, 3, 6].includes(last(n)) ? `${n}으로` : `${n}로`); // 숫자 뒤 조사
  const show = (x) => String(x).replace(/^-/, '−');
  const multi = (question, opts, want, solution, check) => {
    const o = opts.map(show), w = want.map(show);
    return { type: 'multi', question, options: o, answer: o.map((x, i) => (w.includes(x) ? i : -1)).filter((i) => i >= 0), solution, check };
  };
  const fill = (r, want, pool, k) => sorted([...new Set([...want, ...r.shuffle(pool.filter((x) => !want.includes(x))).slice(0, k - want.length)])]);

  // 문제 4 (07) A ∩ X = ∅ · B ∪ X = B → X ⊂ B − A → 2ⁿ
  function u4Make(p, q, N) {
    const A = divs(p), B = mults(q, N), D = minus(B, A);
    return [nq(`두 집합 A = {x | x는 ${p}의 약수}, B = {x | x는 ${N} 이하의 ${q}의 배수}에 대하여 A ∩ X = ∅ 과 B ∪ X = B 를 만족시키는 집합 X 의 개수는? (풀이는 학습지에)`,
      2 ** D.length, `A = ${st(A)}, B = ${st(B)} → B ∪ X = B 이면 X ⊂ B, A ∩ X = ∅ 이면 X 는 A 와 서로소 → X ⊂ B − A = ${st(D)} → 2${sup(D.length)} = ${2 ** D.length}개`, { p, q, N })];
  }
  function u4Retry(r) {
    for (;;) {
      const p = r.pick([4, 6, 8, 9, 10, 12]), q = r.pick([2, 3, 4]), N = q * r.int(4, 7), B = mults(q, N), D = minus(B, divs(p));
      if (p === 8 && q === 4 && N === 20) continue; // 교과서 그대로
      if (inter(B, divs(p)).length && D.length >= 2 && D.length <= 5) return u4Make(p, q, N);
    }
  }
  // 문제 5 (08) A = {x² + cx, b, d}, B = {x, d}, A ∩ B = B 인 모든 정수 x
  function u5Make(c, b, d, r) {
    const want = [1 - c, 0, b].sort((x, y) => x - y);
    const opts = fill(r, [...want, d], range(-5, 9), 9);
    return [multi(`두 집합 A = {x² + ${c}x, ${b}, ${d}}, B = {x, ${d}}에 대하여 A ∩ B = B 를 만족시키는 정수 x 를 모두 고르시오.`, opts, want,
      `A ∩ B = B → B ⊂ A → x 는 A 의 원소 (x ≠ ${d}) → x = ${b} 또는 x = x² + ${c}x → x² + ${c - 1 === 1 ? '' : c - 1}x = 0 → x = 0, ${show(1 - c)} → ${want.map(show).join(', ')}`, { c, b, d })];
  }
  function u5Retry(r) {
    for (;;) {
      const c = r.int(2, 5), b = r.int(2, 6), d = r.int(6, 9);
      if (b === d || b * b + c * b === d || (c === 2 && b === 4 && d === 6)) continue; // 원소가 겹치지 않게 · 교과서 그대로 빼기
      return u5Make(c, b, d, r);
    }
  }
  // 문제 6 (11) 겹침의 최댓값 · 최솟값
  function u6Make(T, a, b) {
    const head = `어느 자전거 동아리 회원 ${T}명을 대상으로 두 코스 A와 B를 다녀온 경험이 있는 회원 수를 조사하였더니 A 코스는 ${a}명이고 B 코스는 ${b}명이었다. 두 코스 A와 B를 모두 다녀온 회원 수의`;
    const sol = `n(A ∩ B) = ${a} + ${b} − n(A ∪ B), ${Math.max(a, b)} ≤ n(A ∪ B) ≤ ${T}`;
    return [nq(`${head} 최댓값은?`, Math.min(a, b), `${sol} → n(A ∪ B) = ${Math.max(a, b)} 일 때 (B 가 A 안에 쏙) 최대 ${Math.min(a, b)}`, { T, a, b, ask: 'max' }),
      nq(`${head} 최솟값은?`, a + b - T, `${sol} → n(A ∪ B) = ${T} 일 때 (전체) 최소 ${a + b - T}`, { T, a, b, ask: 'min' })];
  }
  function u6Retry(r) {
    for (;;) {
      const T = r.int(30, 50), a = r.int(Math.ceil(T / 2), T - 3), b = r.int(Math.ceil(T / 3), T - 5);
      if (T === 40 && a === 28 && b === 21) continue;
      if (a + b > T + 2 && b < a) return u6Make(T, a, b);
    }
  }
  // 문제 7 (12) 「~이 아니거나 ~이 아닌」 = (A ∩ B)ᶜ
  function u7Make(N, p, q, rem) {
    const bad = range(1, N - 1).filter((x) => x % p === 0 && x % q === rem), n = N - 1 - bad.length;
    return [nq(`${N} 미만의 자연수 중에서 ${p}의 배수가 아니거나 ${ro(q)} 나누었을 때의 나머지가 ${igaN(rem)} 아닌 자연수의 개수는?`, n,
      `A = ${p}의 배수, B = ${ro(q)} 나눈 나머지가 ${rem} → 「A 가 아니거나 B 가 아닌」 = Aᶜ ∪ Bᶜ = (A ∩ B)ᶜ (드모르간) → A ∩ B = ${st(bad)} → ${N - 1} − ${bad.length} = ${n}`, { N, p, q, rem })];
  }
  function u7Retry(r) {
    for (;;) {
      const N = r.pick([50, 60, 80, 100]), p = r.int(3, 8), q = r.int(3, 6), rem = r.int(1, q - 1);
      if (N === 100 && p === 7 && q === 5 && rem === 3) continue;
      const bad = range(1, N - 1).filter((x) => x % p === 0 && x % q === rem).length;
      if (bad >= 2 && bad <= 6) return u7Make(N, p, q, rem);
    }
  }

  // ⚔ 소레이드 징검다리 (2026-11-09 요청 #18 · 선생님 「추천대로」): 문제 4~7 = 졸개(소문제) … 👑 대장(마지막)
  //   각 단계 say = 맞힌 뒤 「📜 나의 풀이」에 덧붙는 교과서 말투 한 줄 · 첫 판(pass 0) = 교과서 숫자 · 연습(pass ≥ 1) = 같은 꼴 새 숫자 (…Retry 와 같은 조건)
  const sayOf = (q, say) => Object.assign(q, { say });
  // 💡 근거 줄 (2026-11-09 #26 · 7차시 학습지 표): 그 단계를 맞힌 뒤 붙는 「∵ …」 한 줄 · 첫 판 = 완성 문장으로 📜 에 · 🔥 한 판 더 = 빈칸 고르기
  const whyOf = (q, pre, choices, post) => Object.assign(q, { why: { pre, post, choices, answer: 0, text: `${pre} ${choices[0]}${post}` } });
  // 🔁 #41 (2026-11-09 선생님 「추천대로」 · 7차시 문제 4 다시 짜기 · 4단계 그대로): 졸개1 = A · B 두 칸 한 화면 · 졸개2 = 조건의 뜻 · 졸개3 = B − A (+ 💡 2ⁿ 근거) · 대장 = 개수
  //   두 칸 고르기 = multi 하나 + groups(칸 제목 · 보기 수) → 보기 번호를 이어 붙임 · 둘 다 맞아야 정답 · 틀리면 0.5 한 번
  const multi2 = (question, parts, solution, check) => {
    const options = [], answer = [], groups = []; parts.forEach(({ label, opts, want }) => { const o = opts.map(show), w = want.map(show), base = options.length; o.forEach((x, i) => { options.push(x); if (w.includes(x)) answer.push(base + i); }); groups.push({ label, n: o.length }); });
    return { type: 'multi', question, options, answer, groups, solution, check };
  };
  function u4Chain(p, q, N, r) {
    const A = divs(p), B = mults(q, N), D = minus(B, A), U = sorted([...new Set([...A, ...B])]), n = D.length;
    const aOpts = fill(r, A, range(1, Math.max(12, p + 3)), Math.min(10, A.length + 4)), bOpts = fill(r, B, range(1, N + 4), Math.min(12, B.length + 4));
    const s3 = sayOf(multi(`A ∩ X = ∅ 이고 B ∪ X = B 일 때, X 에 들어갈 수 있는 원소를 모두 고르시오.`, U.map(show), D, `X ⊂ B 이고 A 와 서로소 → B − A = ${st(D)}`, { step: 3 }), `따라서 X ⊂ B − A = ${st(D)} 이다.`);
    const boss = sayOf(nq(`집합 X 의 개수는?`, 2 ** n, `B − A 의 원소 ${n}개로 만들 수 있는 부분집합 → 2${sup(n)} = ${2 ** n}`, { step: 4 }), `그러므로 집합 X 의 개수는 2${sup(n)} = ${2 ** n} 이다.`);
    boss.why = { pre: `∵ 원소가 ${n}개인 집합의 부분집합의 개수는`, post: '', choices: [`2ⁿ 꼴(예: 2${sup(n)})`, `n²(예: ${n}²)`, `2n(예: ${2 * n})`], answer: 0, text: `∵ 원소가 ${n}개인 집합의 부분집합의 개수는 2${sup(n)}` }; // #44 ① 근거 줄 = 그 근거를 쓰는 단계(대장) 뒤
    return [
      sayOf(multi2('A 와 B 의 원소를 각각 모두 고르시오.', [{ label: `A = {x | x는 ${p}의 약수}`, opts: aOpts, want: A }, { label: `B = {x | x는 ${N} 이하의 ${q}의 배수}`, opts: bOpts, want: B }], `${p}의 약수 → ${st(A)} · ${N} 이하의 ${q}의 배수 → ${st(B)}`, { p, q, N, step: 1 }), `A = ${st(A)}, B = ${st(B)} 이다.`),
      sayOf(ch('B ∪ X = B, A ∩ X = ∅ 이 뜻하는 것은?', ['X ⊂ B 이고 X 와 A 는 서로소', 'B ⊂ X 이고 X ⊂ A', 'X ⊂ A 이고 X 와 B 는 서로소'], 'X ⊂ B 이고 X 와 A 는 서로소', 'B ∪ X = B → X ⊂ B · A ∩ X = ∅ → 공통 원소 없음(서로소)', { step: 2 }), 'B ∪ X = B 이므로 X ⊂ B, A ∩ X = ∅ 이므로 X 와 A 는 서로소이다.'),
      s3,
      boss,
    ];
  }
  function u5Chain(c, b, d, r) {
    const want = [1 - c, 0, b].sort((x, y) => x - y), opts = fill(r, [...want, d], range(-5, 9), 9);
    const eq = r.shuffle([`x = ${b}`, `x = x² + ${c}x`, `x² + ${c}x = ${b}`, `x² + ${c}x = ${d}`, 'x = 2x']); // #44 ② 졸개2 = 맞는 식 모두 고르기 (「x = d」 는 넣지 않음)
    return [
      sayOf(ch(`A ∩ B = B 이면 두 집합 A, B 사이의 관계는?`, ['B ⊂ A', 'A ⊂ B', 'A ∩ B = ∅'], 'B ⊂ A', 'A ∩ B 가 B 전체 → B 의 원소가 모두 A 에 있음 → B ⊂ A', { step: 1 }), `A ∩ B = B 이므로 B ⊂ A, 곧 x 는 A 의 원소이다 (x ≠ ${d}).`),
      whyOf(sayOf(multi(`B ⊂ A 가 성립하기 위해 맞는 식을 모두 고르시오.`, eq, [`x = ${b}`, `x = x² + ${c}x`], `x 는 A 의 원소 → x = ${b} 또는 x = x² + ${c}x`, { step: 2 }), `x 는 A 의 원소이므로 x = ${b} 또는 x = x² + ${c}x 이다.`), '∵ B ⊂ A 이면 B 의 원소 x 는 A 의', ['원소', '부분집합', '여집합'], '이다'),
      sayOf(multi(`x = x² + ${c}x 를 만족시키는 x 를 모두 고르시오.`, opts, [0, 1 - c], `x² + ${c - 1 === 1 ? '' : c - 1}x = 0 → x(x + ${c - 1}) = 0 → x = 0, ${show(1 - c)}`, { step: 3 }), `x = x² + ${c}x 에서 x² + ${c - 1 === 1 ? '' : c - 1}x = 0 이므로 x = 0 또는 x = ${show(1 - c)} 이다.`),
      sayOf(multi(`A ∩ B = B 를 만족시키는 정수 x 를 모두 고르시오.`, opts, want, `x = ${b} · 0 · ${show(1 - c)} 모두 가능`, { c, b, d, step: 4 }), `그러므로 x = ${want.map(show).join(', ')} 이다.`),
    ];
  }
  function u6Chain(T, a, b) { // #44 ③ 4단계: 가장 많을 때(포함) → 최댓값 → 가장 적을 때(A ∪ B = U) → 최솟값 · 근거 줄 = 대장 뒤
    const inc = a >= b ? 'B ⊂ A' : 'A ⊂ B', rev = a >= b ? 'A ⊂ B' : 'B ⊂ A', mx = Math.min(a, b), mn = a + b - T;
    const boss = sayOf(nq(`두 코스를 모두 다녀온 회원 수의 최솟값은?`, mn, `n(A ∪ B) = ${T} 일 때 → ${a} + ${b} − ${T} = ${mn}`, { T, a, b, step: 4 }), `그러므로 최솟값은 ${a} + ${b} − ${T} = ${mn} 이다.`);
    whyOf(boss, '∵ n(A ∩ B) = n(A) + n(B) −', ['n(A ∪ B)', 'n(U)', 'n(A ∩ B)'], '');
    return [
      sayOf(ch(`두 코스를 모두 다녀온 회원 수가 가장 많을 때는?`, [inc, rev, 'A ∩ B = ∅', 'A ∪ B = U'], inc, `작은 쪽(${a >= b ? 'B' : 'A'})이 큰 쪽 안에 쏙 들어갈 때 A ∩ B 가 가장 큼`, { step: 1 }), `${inc} 일 때 두 코스를 모두 다녀온 회원 수가 가장 많다.`),
      sayOf(nq(`두 코스를 모두 다녀온 회원 수의 최댓값은?`, mx, `${inc} 이면 n(A ∩ B) = ${mx}`, { step: 2 }), `그러므로 최댓값은 ${mx} 이다.`),
      sayOf(ch(`두 코스를 모두 다녀온 회원 수가 가장 적을 때는?`, [`A ∪ B = U (곧 n(A ∪ B) = ${T})`, 'A ∩ B = ∅', 'B ⊂ A', 'A ⊂ B'], `A ∪ B = U (곧 n(A ∪ B) = ${T})`, `n(A ∩ B) = n(A) + n(B) − n(A ∪ B) → n(A ∪ B) 가 가장 클 때(= ${T})`, { step: 3 }), `A ∪ B = U, 곧 n(A ∪ B) = ${T} 일 때 가장 적다.`),
      boss,
    ];
  }
  function u7Chain(N, p, q, rem, r) { // #45 5단계: 전체 → 드모르간 → 가장 작은 원소 → 최소공배수 간격 → 개수
    const bad = range(1, N - 1).filter((x) => x % p === 0 && x % q === rem), n = N - 1 - bad.length, L2 = lcmOf(p, q);
    return [
      sayOf(nq(`${N} 미만의 자연수는 모두 몇 개인가?`, N - 1, `1, 2, …, ${N - 1} → ${N - 1}개`, { step: 1 }), `${N} 미만의 자연수는 ${N - 1}개이다.`),
      sayOf(ch(`A = {${p}의 배수}, B = {${ro(q)} 나눈 나머지가 ${rem}} 일 때 「${p}의 배수가 아니거나 ${ro(q)} 나눈 나머지가 ${igaN(rem)} 아닌 수」의 집합은?`, ['(A ∩ B)ᶜ', '(A ∪ B)ᶜ', 'A ∩ Bᶜ'], '(A ∩ B)ᶜ', 'Aᶜ ∪ Bᶜ = (A ∩ B)ᶜ (드모르간)', { step: 2 }), `「A 가 아니거나 B 가 아닌」 수의 집합은 Aᶜ ∪ Bᶜ = (A ∩ B)ᶜ 이다.`),
      sayOf(nq(`A ∩ B 의 가장 작은 원소는?`, bad[0], `${p}의 배수 중 ${ro(q)} 나눈 나머지가 ${rem}인 가장 작은 수 → ${bad[0]}`, { step: 3 }), `A ∩ B 의 가장 작은 원소는 ${bad[0]} 이다.`), // #45 옛 졸개3 → 둘로
      sayOf(ch(`A ∩ B 의 원소는 몇씩 커지는가?`, r.shuffle([...new Set([L2, p, q, p + q, p * q])]).map(String), String(L2), `${gwaN(p)} ${q} 의 최소공배수 → ${L2}`, { step: 4 }), `${gwaN(p)} ${q} 의 최소공배수 ${L2} 씩 커지므로 A ∩ B = ${st(bad)} 이다.`),
      whyOf(sayOf(nq(`구하는 자연수의 개수는?`, n, `${N - 1} − ${bad.length} = ${n}`, { N, p, q, rem, step: 5 }), `그러므로 구하는 개수는 ${N - 1} − ${bad.length} = ${n} 이다.`), '∵ 여집합의 원소의 개수 = 전체의 개수 −', ['A ∩ B', 'A ∪ B', 'A'], ' 의 개수'), // #44 ④ 근거 줄 = 대장 뒤
    ];
  }
  const RETRY_ARGS = { // 연습 판 숫자 (…Retry 와 같은 조건 · 교과서 숫자 빼기)
    u4: (r) => { for (;;) { const p = r.pick([4, 6, 8, 9, 10, 12]), q = r.pick([2, 3, 4]), N = q * r.int(4, 7), B = mults(q, N), D = minus(B, divs(p)); if (p === 8 && q === 4 && N === 20) continue; if (inter(B, divs(p)).length && D.length >= 2 && D.length <= 5) return [p, q, N]; } },
    u5: (r) => { for (;;) { const c = r.int(2, 5), b = r.int(2, 6), d = r.int(6, 9); if (b === d || b * b + c * b === d || (c === 2 && b === 4 && d === 6)) continue; return [c, b, d]; } },
    u6: (r) => { for (;;) { const T = r.int(30, 50), a = r.int(Math.ceil(T / 2), T - 3), b = r.int(Math.ceil(T / 3), T - 5); if (T === 40 && a === 28 && b === 21) continue; if (a + b > T + 2 && b < a) return [T, a, b]; } },
    u7: (r) => { for (;;) { const N = r.pick([50, 60, 80, 100]), p = r.int(3, 8), q = r.int(3, 6), rem = r.int(1, q - 1); if (N === 100 && p === 7 && q === 5 && rem === 3) continue; const k = range(1, N - 1).filter((x) => x % p === 0 && x % q === rem).length; if (k >= 2 && k <= 6) return [N, p, q, rem]; } },
  };
  // 📜 #44 ⑤ 한 판 더(숫자 바뀐 판) = 문제 카드 맨 위에 바뀐 숫자의 원문 문제 전체 (첫 판은 학습지 그대로라 없음)
  const PROB = {
    u4: (p, q, N) => `두 집합 A = {x | x는 ${p}의 약수}, B = {x | x는 ${N} 이하의 ${q}의 배수}에 대하여 A ∩ X = ∅ 과 B ∪ X = B 를 만족시키는 집합 X 의 개수를 구하시오.`,
    u5: (c, b, d) => `두 집합 A = {x² + ${c}x, ${b}, ${d}}, B = {x, ${d}}에 대하여 A ∩ B = B 를 만족시키는 정수 x 를 모두 구하시오.`,
    u6: (T, a, b) => `어느 자전거 동아리 회원 ${T}명을 대상으로 두 코스 A와 B를 다녀온 경험이 있는 회원 수를 조사하였더니 A 코스는 ${a}명이고 B 코스는 ${b}명이었다. 두 코스 A와 B를 모두 다녀온 회원 수의 최댓값과 최솟값을 구하시오.`,
    u7: (N, p, q, rem) => `${N} 미만의 자연수 중에서 ${p}의 배수가 아니거나 ${ro(q)} 나누었을 때의 나머지가 ${igaN(rem)} 아닌 자연수의 개수를 구하시오.`,
  };
  const CHAIN_FN = { u4: (a, r) => u4Chain(...a, r), u5: (a, r) => u5Chain(...a, r), u6: (a) => u6Chain(...a), u7: (a, r) => u7Chain(...a, r) };
  const BOOK = { u4: [8, 4, 20], u5: [2, 4, 6], u6: [40, 28, 21], u7: [100, 7, 5, 3] };
  const chainOf = (id) => (pass, r) => { const args = pass === 0 ? BOOK[id] : RETRY_ARGS[id](r), items = CHAIN_FN[id](args, r); if (pass > 0) items.forEach((it) => { it.problem = PROB[id](...args); }); return items; };
  const CHAIN = { u4: chainOf('u4'), u5: chainOf('u5'), u6: chainOf('u6'), u7: chainOf('u7') };

  // ── 몬스터 (학습지 순서) ─────────────────────────────────
  // 땅굴 테마 · 학습지 ★ 칸만 게임에 (KEEP = 남기는 소문제 번호 · 나머지는 학습지에서만 중간 계산)
  const KEEP = { m1: [0, 3, 4, 5], m2: [0, 1, 4], m3: [0, 2] }, keep = (id, arr) => KEEP[id].map((i) => arr[i]);
  const MONSTERS = {
    m1: { title: '문제 1', sprite: 'extra:3', make: (a, r) => keep('m1', a === 0 ? m1Make(range(1, 6), [1, 2, 3], [3, 4]) : m1Retry(r)) },
    m2: { title: '문제 2', sprite: 'extra:6', make: (a, r) => keep('m2', a === 0 ? m2Make(30, 12, 15, 5) : m2Retry(r)) },
    m3: { title: '문제 3', sprite: 'extra:7', make: (a, r) => keep('m3', a === 0 ? m3Make(40, 18, 12, 5, CLUBS[0]) : m3Retry(r)) },
    // v3 중단원 마무리 (교과서 78~79쪽)
    u4: { evalQ: true, title: '문제 4 · 조건을 만족하는 X', sprite: 'crown:6', make: (a, r) => (a === 0 ? u4Make(8, 4, 20) : u4Retry(r)) },
    u5: { evalQ: true, title: '문제 5 · 미지수 x', sprite: 'crown:9', note: 'B 의 원소가 모두 A 에 있어야 해요 — x 가 A 의 어느 원소와 같을 수 있을까? (B 의 두 원소는 서로 달라야 해요)', make: (a, r) => (a === 0 ? u5Make(2, 4, 6, DS.Rng('s6|u5')) : u5Retry(r)) },
    u6: { evalQ: true, title: '문제 6 · 겹침의 최대 · 최소', sprite: 'extra:6@h300', make: (a, r) => (a === 0 ? u6Make(40, 28, 21) : u6Retry(r)) },
    u7: { evalQ: true, title: '문제 7 · 「~이 아니거나」', sprite: 'crown:6@h120', make: (a, r) => (a === 0 ? u7Make(100, 7, 5, 3) : u7Retry(r)) },
    // v2 명제 몬스터 · 보강 ① (단계에 없음 — 1-6반 v2 기록 · 오답노트용)
    m4: { title: '문제 4 (v2 명제)', legacy: true, sprite: 'crown:6', make: (a, r) => (a === 0 ? m4Make(['5 + 4 = 10', '축구는 재미있다.', '2는 소수이다.', '부산은 큰 도시이다.']) : m4Retry(r)) },
    m42: { title: '문제 4-2 · 삼단논법 · 명제 고르기 (v2)', legacy: true, sprite: 'crown:6@h120', make: (a, r) => (a === 0 ? [sylQ(SYL[0]), propPick(PICK6)] : b3Retry(r)) },
    m5: { title: '문제 5 (v2 명제의 부정)', legacy: true, sprite: 'crown:9', make: (a, r) => (a === 0 ? m5Make(NEG.slice(0, 2)) : m5Retry(r)) },
    m6: { title: '문제 6 · 사각형 명제 (v2)', legacy: true, sprite: 'extra:6@h300', make: (a, r) => (a === 0 ? m6Make([['마름모', '평행사변형'], ['평행사변형', '직사각형'], ['정사각형', '마름모'], ['사다리꼴', '평행사변형']]) : m6Retry(r)) },
    b1: { title: '보강 ① · 색칠한 부분의 원소 개수', bonus: true, concept: 'c2', sprite: 'extra:3@h150', make: (a, r) => (a === 0 ? b1Make(7, 1, 2) : b1Retry(r)) },
  };

  // ── 형성평가 (보스) 6문항 — 시도 0 = 학습지(1 · 2) · 교과서 원문(3~6) · 시도 1~3 = L.boss.make (같은 꼴 · 새 값) ──
  const FLIP = { '∪': '∩', '∩': '∪' };
  const LET = [['A', 'B'], ['A', 'C'], ['B', 'C'], ['X', 'Y']];
  const fix = (q, no) => Object.assign(q, { question: `${no}. ${q.question}` });
  const chS = (question, wrongs, ans, solution, check, r) => ch(question, r.shuffle([ans, ...wrongs]), ans, solution, check); // 보기 순서 섞기
  const dm1 = (X, Y, op, form, r) => { // 1. 드모르간 ( ) 에 ∪ · ∩
    const f = FLIP[op];
    const q = form === 'out' ? `(${X} ${op} ${Y})${C} = ${X}${C} ( ) ${Y}${C}` : `${X}${C} ${op} ${Y}${C} = (${X} ( ) ${Y})${C}`;
    const sol = form === 'out' ? `(${X} ${op} ${Y})${C} = ${X}${C} ${f} ${Y}${C}` : `(${X} ${f} ${Y})${C} = ${X}${C} ${op} ${Y}${C}`;
    return fix(r ? chS(`${q} 의 ( ) 에 알맞은 것은?`, [op], f, `드모르간: 괄호를 풀면 ᶜ 이 각각 붙고 ∪ ↔ ∩ → ${sol}`, { dm: q, form, op, sets: [X, Y] }, r)
      : ch(`${q} 의 ( ) 에 알맞은 것은?`, ['∪', '∩'], f, `드모르간: 괄호를 풀면 ᶜ 이 각각 붙고 ∪ ↔ ∩ → ${sol}`, { dm: q, form, op, sets: [X, Y] }), 1);
  };
  const nAc = (u, x, s) => nq(`2. n(U) = ${u}, n(${s}) = ${x} 일 때 n(${s}${C}) = ?`, u - x, `n(U) − n(${s}) = ${u} − ${x}`, { u, a: x, set: s });
  const q04 = (a, b, u) => nq(`3. 두 집합 A 와 B 에 대하여 n(A) = ${a}, n(B) = ${b}, n(A ∪ B) = ${u} 일 때, n(A ∩ B) 는?`, a + b - u, `n(A ∩ B) = n(A) + n(B) − n(A ∪ B) = ${a} + ${b} − ${u} = ${a + b - u}`, { a, b, u });
  const q05 = (A, n) => { const U = range(1, 10), B = divs(n), want = minus(A, B);
    return multi(`4. 전체집합 U = {1, 2, 3, …, 10}의 두 부분집합 A = ${st(A)}, B = {x | x는 ${n}의 약수}에 대하여 A − B 의 원소를 모두 고르시오.`, U, want, `B = ${st(B)} → A 에서 B 에 있는 것 빼기 → A − B = ${st(want)}`, { A, n, expr: 'A − B' }); };
  const q06 = (m, A, r) => { const U = range(1, m), Cc = minus(U, A), want = [[], [Cc[0]], [Cc[1]], Cc];
    const traps = [[A[0], Cc[0]], [A[1]], [A[2], Cc[1]], [Cc[0], A[A.length - 1]]].map(sorted);
    return multi(`5. 전체집합 U = ${st(U)}의 부분집합 중에서 집합 A = ${st(A)}와 서로소인 집합을 모두 고르시오.`, r.shuffle([...want, ...traps]).map(st), want.map(st),
      `A 와 겹치지 않으려면 U − A = ${st(Cc)} 의 부분집합 → ${want.map(st).join(', ')} (4개)`, { U, A }); };
  const q10 = (N, k, m) => { const A = mults(k, N), B = divs(m), n = N - union(A, B).length;
    return nq(`6. 전체집합 U = {x | x는 ${N} 이하의 자연수}의 두 부분집합 A = {x | x는 ${k}의 배수}, B = {x | x는 ${m}의 약수}에 대하여 n(A${C} ∩ B${C}) 는?`, n,
      `A${C} ∩ B${C} = (A ∪ B)${C} (드모르간) → n(A ∪ B) = ${A.length} + ${B.length} − ${inter(A, B).length} = ${union(A, B).length} → ${N} − ${union(A, B).length} = ${n}`, { N, k, m }); };
  const BOSS1 = [dm1('A', 'B', '∪', 'out'), nAc(20, 7, 'A'), q04(18, 23, 30), q05([1, 5, 9, 10], 10), q06(5, [1, 2, 4], DS.Rng('s6|boss|06')), q10(30, 6, 24)];
  function bossMake(i, a, r) {
    for (;;) {
      if (i === 0) { // 1. 드모르간 ( ) 에 ∪ · ∩
        const [X, Y] = r.pick(LET), op = r.pick(['∪', '∩']), form = r.pick(['out', 'out', 'in']);
        if (form === 'out' && op === '∪' && X === 'A' && Y === 'B') continue; // 학습지 그대로
        return dm1(X, Y, op, form, r);
      }
      if (i === 1) { // 2. n(Aᶜ) = n(U) − n(A)
        const u = r.int(15, 30), s = r.pick(['A', 'A', 'B']), x = r.int(4, u - 4);
        if (u === 20 && x === 7) continue;
        return nAc(u, x, s);
      }
      if (i === 2) { // 3. (04) n(A ∩ B)
        const a = r.int(10, 25), b = r.int(10, 25), k = r.int(2, Math.min(a, b) - 2);
        if (a === 18 && b === 23 && k === 11) continue;
        return q04(a, b, a + b - k);
      }
      if (i === 3) { // 4. (05⑷) A − B
        const n = r.pick([6, 8, 10]), A = sorted(r.shuffle(range(1, 10)).slice(0, 4)), B = divs(n);
        if (!inter(A, B).length || !minus(A, B).length || !minus(B, A).length || (n === 10 && A.join() === '1,5,9,10')) continue;
        return q05(A, n);
      }
      if (i === 4) { // 5. (06) 서로소인 집합 모두
        const m = r.int(5, 7), A = sorted(r.shuffle(range(1, m)).slice(0, m - 2));
        if (m === 5 && A.join() === '1,2,4') continue;
        return q06(m, A, r);
      }
      if (i === 5) { // 6. (10) n(Aᶜ ∩ Bᶜ)
        const N = r.pick([30, 36, 40, 48, 50]), k = r.int(4, 9), m = r.pick([24, 30, 32, 36, 40, 48].filter((x) => x <= N));
        if (inter(mults(k, N), divs(m)).length < 2 || (N === 30 && k === 6 && m === 24)) continue;
        return q10(N, k, m);
      }
      return BOSS1[i];
    }
  }
  const BOSS = { 1: BOSS1, 2: BOSS1.map((q, i) => bossMake(i, 1, DS.Rng(`s6|boss2|${i}`))) }; // 세트2 = 옛 기록 · 수업 준비 미리보기용 (재도전은 L.boss.make)

  const STEPS = [
    { kind: 'concept', id: 'c1', title: '개념 1 · 드모르간의 법칙', say: '(먼저 말로: 급식에서 「둘 다 안 먹는」 친구 · 지난 시간 Aᶜ, A − B 복습) (A ∪ B)ᶜ = Aᶜ ∩ Bᶜ, (A ∩ B)ᶜ = Aᶜ ∪ Bᶜ · 괄호를 풀 때 ᶜ 이 각각 붙고 ∪ ↔ ∩ 가 바뀐다!' },
    { kind: 'monster', id: 'm1' },
    { kind: 'concept', id: 'c2', title: '개념 2 · 여집합 · 차집합의 원소의 개수', say: 'n(Aᶜ) = n(U) − n(A) · n(A − B) = n(A) − n(A ∩ B) = n(A ∪ B) − n(B)' },
    { kind: 'monster', id: 'm2' },
    { kind: 'concept', id: 'c3', title: '개념 3 · 생활 속 문제', say: '벤 다이어그램 칸에 숫자를 직접 써 넣기 — 「둘 다」 칸부터!' },
    { kind: 'monster', id: 'm3' },
    { kind: 'concept', id: 'c4', title: '개념 4 · 집합 한 장 정리 (중단원 마무리)', say: '포함: 원소 n 개 → 부분집합 2ⁿ 개 · 서로소 A ∩ B = ∅ · A ∩ B = B ⇔ B ⊂ A · A ∪ B = B ⇔ A ⊂ B · n(A ∪ B) = n(A) + n(B) − n(A ∩ B) · 드모르간 — 오늘 문제 4~7 은 교과서 78~79쪽 그대로!' },
    { kind: 'monster', id: 'u4' },
    { kind: 'monster', id: 'u5' },
    { kind: 'monster', id: 'u6' },
    { kind: 'monster', id: 'u7' },
    { kind: 'boss', id: 'boss', title: '형성평가 · 그림자 드래곤' },
  ];
  STEPS.forEach((s) => { if (s.kind === 'monster') Object.assign(s, { title: MONSTERS[s.id].title, special: !!MONSTERS[s.id].special }); });

  // 칸 위치 (사용자가 보낸 레이드용 v3 PDF 에서 pdftotext -bbox 글자 위치로 잼 · 2026-11-05 · 칸 이미지로 눈 확인)
  const CROPS_V3 = { c1: [{ p: 1, x: 0.045, y: 0.139, w: 0.455, h: 0.1565 }], m1: [{ p: 1, x: 0.045, y: 0.2955, w: 0.455, h: 0.177 }], c2: [{ p: 1, x: 0.045, y: 0.4725, w: 0.455, h: 0.1 }], m2: [{ p: 1, x: 0.045, y: 0.5725, w: 0.455, h: 0.129 }], c3: [{ p: 1, x: 0.045, y: 0.7015, w: 0.455, h: 0.09 }], m3: [{ p: 1, x: 0.045, y: 0.7915, w: 0.455, h: 0.1335 }],
    c4: [{ p: 1, x: 0.507, y: 0.139, w: 0.452, h: 0.2035 }], u4: [{ p: 1, x: 0.507, y: 0.3425, w: 0.452, h: 0.198 }], u5: [{ p: 1, x: 0.507, y: 0.5405, w: 0.452, h: 0.1765 }],
    u6: [{ p: 2, x: 0.045, y: 0.0937, w: 0.455, h: 0.3053 }], u7: [{ p: 2, x: 0.045, y: 0.3965, w: 0.455, h: 0.2415 }], boss: [{ p: 2, x: 0.507, y: 0.093, w: 0.452, h: 0.7 }] };

  // 2026-11-09 레이드용 v4 (방향 방 생성기 tools/worksheet/gen_ws6v4.py · crops_pdf.py 로 잼 · 빨간 상자 눈 확인 · c1 아래 색칠 줄 조금 늘림)
  const CROPS_V4 = { c1: [{ p: 1, x: 0.045, y: 0.151, w: 0.455, h: 0.1692 }], m1: [{ p: 1, x: 0.045, y: 0.3112, w: 0.455, h: 0.192 }], c2: [{ p: 1, x: 0.045, y: 0.5002, w: 0.455, h: 0.1017 }], m2: [{ p: 1, x: 0.045, y: 0.5989, w: 0.455, h: 0.1288 }], c3: [{ p: 1, x: 0.045, y: 0.7247, w: 0.455, h: 0.0892 }], m3: [{ p: 1, x: 0.045, y: 0.8109, w: 0.455, h: 0.1334 }],
    c4: [{ p: 1, x: 0.507, y: 0.151, w: 0.452, h: 0.2059 }], u4: [{ p: 1, x: 0.507, y: 0.3539, w: 0.452, h: 0.2605 }], u5: [{ p: 1, x: 0.507, y: 0.6114, w: 0.452, h: 0.2367 }],
    u6: [{ p: 2, x: 0.045, y: 0.0992, w: 0.455, h: 0.3352 }], u7: [{ p: 2, x: 0.045, y: 0.4314, w: 0.455, h: 0.2759 }], boss: [{ p: 2, x: 0.507, y: 0.1115, w: 0.452, h: 0.5737 }] };
  // 2026-11-09 6 · 7차시 나누기 (선생님 「추천대로」 · 요청 #26): 학습지 = 6차시 v5(1쪽) + 7차시 v2(1~3쪽)을 한 PDF 로 이어 붙여 자름
  //   p1 = 6차시 v5 · p2 ~ p4 = 7차시 v3(#49) 의 1 ~ 3쪽 (4쪽 교사용은 뺌 · ✍ 서술형 칸은 자르지 않음 — 종이에 쓰는 곳) · 문제 · 숫자 · 형성평가는 v4 와 같음 (tools/worksheet/check_same_text.py 로 문제 7 · 형성평가 6문항 확인함)
  // 2026-11-10 #49 7차시 레이드용 v3 (gen_ws67 v3 · 게임 단계 칸) → u4 ~ u7 다시 잼 (crops_pdf · ✍ 서술형 칸 바로 위까지 · 빨간 상자 눈 확인) · p1 = 6차시 v5 그대로
  const CROPS_V5 = { c1: [{ p: 1, x: 0.045, y: 0.151, w: 0.455, h: 0.1692 }], m1: [{ p: 1, x: 0.045, y: 0.3112, w: 0.455, h: 0.192 }], c2: [{ p: 1, x: 0.045, y: 0.5002, w: 0.455, h: 0.1017 }], m2: [{ p: 1, x: 0.045, y: 0.5989, w: 0.455, h: 0.1288 }], c3: [{ p: 1, x: 0.045, y: 0.7247, w: 0.455, h: 0.0892 }], m3: [{ p: 1, x: 0.045, y: 0.8109, w: 0.455, h: 0.1334 }],
    c4: [{ p: 1, x: 0.507, y: 0.151, w: 0.452, h: 0.2383 }], u4: [{ p: 2, x: 0.045, y: 0.1303, w: 0.455, h: 0.2753 }], u5: [{ p: 2, x: 0.507, y: 0.1303, w: 0.452, h: 0.237 }],
    u6: [{ p: 3, x: 0.045, y: 0.0992, w: 0.455, h: 0.3572 }], u7: [{ p: 3, x: 0.507, y: 0.0992, w: 0.452, h: 0.2993 }], boss: [{ p: 4, x: 0.045, y: 0.1115, w: 0.455, h: 0.6342 }] };
  DS.Lessons.register({
    id: 'set-06', no: 6,
    title: '드모르간의 법칙 · 집합 중단원 마무리',
    unit: '공통수학2 Ⅱ. 집합과 명제 · 6·7차시',
    sheet: '학습과정 6차시 레이드용 v5 + 7차시 레이드용 v3', // #49
    parts: [{ no: 7, from: 'u4', title: '문제 4부터 · 소레이드 4개 + 형성평가 (6차시 이어서)' }], // 🧩 6 · 7차시 나누기 (2026-11-09 #26)
    crops: CROPS_V5, // v4 = CROPS_V4 · v3 = CROPS_V3 (되돌릴 때)
    theme: '01-burrow', // 던전 테마: 땅굴 (배경 dg-01)
    // 🎬 「05 모션그래픽」 (06차시) 09 드모르간 → c1 · m1 · 18 원소의 개수 → c2 · m2 · 19 생활 속 문제 → c3 · m3
    //    · 중단원: (평가1) 34 = 07 풀이 → 문제 4 · 36 = 11 풀이 → 문제 6 (교과서 숫자로 푼 예제 = 선생님 보충 설명용 · 교사가 켤 때만 보임)
    //    · 이번 v3 개념 설명은 영상 대신 PPT (2026-11-05 사용자 결정 · 「(06차시) 개념설명_v3.pptx」)
    videos: { c1: 'assets/video/v06-09-v3.mp4', m1: 'assets/video/v06-09-v3.mp4', // 2026-11-06 모션 방 새 판 (30초 · 좌변 · 우변 그림이 가운데로 합쳐짐)
      c2: 'assets/video/v06-18-v3.mp4', m2: 'assets/video/v06-18-v3.mp4', b1: 'assets/video/v06-18-v3.mp4',
      c3: 'assets/video/v06-19-v3.mp4', m3: 'assets/video/v06-19-v3.mp4',
      c4: 'assets/video/v06-38-v2.mp4', // 38 포함 관계와 교집합 · 합집합 (A ⊂ B ⇔ A ∩ B = A ⇔ A ∪ B = B · 30초 · 2026-11-06)
      u4: 'assets/video/e1-34.mp4', u6: 'assets/video/e1-36-v3.mp4',
      u7: 'assets/video/v06-39-v2.mp4' }, // 39 문제 7 「~이 아니거나」 = 드모르간 (99 − 3 = 96 · 30초 · 2026-11-06)
    goal: '드모르간의 법칙을 이용한다 · 여집합 · 차집합의 원소의 개수를 구한다 · 집합 단원(중단원 마무리) 문제를 해결한다',
    defaultPct: 90,
    steps: STEPS,
    monsters: MONSTERS,
    // 보강(bonus)은 2026-11-05 사용자 결정으로 삭제 — b1 · v2 명제 몬스터는 게임에 나오지 않음 (지난 기록 이어 셈용)
    items(id, seed, attempt) { return MONSTERS[id].make(attempt, DS.Rng(`${seed}|${id}|${attempt}`)); },
    chain: Object.keys(CHAIN), // ⚔ 소레이드 (방 version 3) · 단계 = chainItems
    chainRaw: { u6: u6Chain, u5: u5Chain, u7: u7Chain }, // 🧪 시험용 (#44: 문제 6 a ≤ b 경우 · 문제 5 보기 함정 검사)
    chainItems(id, seed, pass) { return CHAIN[id] ? CHAIN[id](pass, DS.Rng(`${seed}|${id}|chain|${pass}`)) : []; },
    WORDS: { TRUE, FALSE, NONE, NEG, SYL, PROP_EXTRA, NONE2, QD, QREP },
    next: { title: '8차시 · 명제와 조건 (7차시 = 6차시 이어서 · 설문 · 사진 채점)', ask: '「x 는 짝수이다」 는 참일까 거짓일까? x 가 정해지면?', link: '집합에서 배운 「모임」을 이용해 참 · 거짓을 가리는 문장(명제)과 조건, 진리집합을 배워요.' }, // 다음 수업
    boss: { title: '6·7차시 형성평가 · 그림자 드래곤', sprite: '2@h250', items: 6, hpItems: 6, sets: BOSS, tags: ['c1', 'c2', 'c4', 'c4', 'c4', 'c1'],
      make(i, a, rng) { return a ? bossMake(i, a, rng) : BOSS1[i]; } }, // 재도전 1~3 = 같은 꼴 · 새 값 (시도 0 = 학습지 · 교과서 원문)
  });
})();
