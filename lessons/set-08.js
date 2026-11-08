// 공통수학2 Ⅱ. 집합과 명제 · 8차시 「명제와 조건」 (학습과정 8차시 레이드용 v1 · 2026-11-08 사용자 「8차시 진행하자」 = 변경 제안 v1 컨펌 · 방향 방 요청 #5)
// 교과서 82~85쪽 · 보강 · 도전 없음 · ★ 칸만 게임 · 몬스터 5 + 보스(형성평가 6문항)
// 레이드 순서: 생각 열기(게임 랭크) → 개념1(명제 · 부정) → 문제1 → 개념2(진리집합) → 문제2 → 개념3(조건의 부정) → 문제3
//            → 개념4(모든 · 어떤 참 · 거짓) → 문제4 → 개념5(모든 · 어떤의 부정) → 문제5 → 형성평가 👑 부정의 수정 여왕
// 문장 답 칸(1-(5) 부정 · 3-(3)(4) · 5 · 형성 6) = 4지선다 · 오답 보기에 대표 오개념(모든 → 모든 ~아니다 · 등호 빠짐 · 그리고/또는 안 바꿈)
// 재도전 = 같은 꼴 · 새 숫자 / 새 문장. 정답은 tests/lesson8.test.js 가 문제 글을 읽어 따로 계산한다.
(function () {
  const S = DS.SetGen;
  const st = (a) => (a.length ? S.setStr(a) : '∅');
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const ch = (question, choices, ans, solution, check) => ({ type: 'choice', question, choices, answerIndex: choices.indexOf(ans), answer: ans, solution, check });
  const chR = (question, wrongs, ans, solution, check, r) => ch(question, r ? r.shuffle([ans, ...wrongs]) : [ans, ...wrongs], ans, solution, check);
  const TF = (question, t, solution, check) => ch(question, ['참', '거짓'], t ? '참' : '거짓', solution, check);
  const multi = (question, U, want, solution, check) => ({ type: 'multi', question: `${question} 원소를 모두 고르시오.`, options: U.map(String), answer: U.map((x, i) => (want.includes(x) ? i : -1)).filter((i) => i >= 0), solution, check });
  const divs = (n) => range(1, n).filter((d) => n % d === 0);

  // ── 문제 1: 명제 판별 · 참 거짓 + 부정 ────────────────────
  // 문장 → 참(true) · 거짓(false) · 명제 아님(null)  (교과서 · 학습지 뜻 · 시험은 따로 같은 표를 적음)
  const PROP = {
    'π는 유리수이다.': false, '섬진강은 아름답다.': null, '4 − 1 = 3': true, '정삼각형은 이등변삼각형이다.': true, // 82쪽 문제 1 (첫 시도)
    '√2는 무리수이다.': true, '2는 짝수이다.': true, '정사각형은 직사각형이다.': true, '6 × 7 = 42': true, '12는 3의 배수이다.': true,
    '9는 소수이다.': false, '3 + 5 = 9': false, '1은 소수이다.': false, '모든 직사각형은 정사각형이다.': false, '7은 짝수이다.': false,
    '김치는 맛있다.': null, '수학은 재미있다.': null, '우리 학교 운동장은 넓다.': null, '그 영화는 감동적이다.': null, '봄 하늘은 아름답다.': null,
  };
  const K1 = ['명제 · 참', '명제 · 거짓', '명제가 아니다'];
  const kind = (t) => (t === null ? K1[2] : t ? K1[0] : K1[1]);
  const p1 = (no, s) => ch(`(${no}) 「${s}」 는 명제인가? 명제이면 참 · 거짓까지 고르시오.`, K1.slice(), kind(PROP[s]),
    PROP[s] === null ? '사람마다 판단이 달라 참 · 거짓을 정할 수 없다 → 명제가 아니다' : `참 · 거짓을 분명히 정할 수 있다 → 명제 · ${PROP[s] ? '참' : '거짓'}`, { s });
  const iga = (n) => ('2459'.includes(String(n).slice(-1)) ? '가' : '이'); // 숫자 읽기 끝소리: 2 이 · 4 사 · 5 오 · 9 구 → 「가」
  const p1neg = (no, n, k, r) => { // 「n의 약수의 개수는 k이다.」의 부정 (문장 고르기) + 그 부정의 참 · 거짓
    const d = divs(n).length, s = `${n}의 약수의 개수는 ${k}이다.`, neg = `${n}의 약수의 개수는 ${k}${iga(k)} 아니다.`;
    return [chR(`(${no}) 「${s}」 의 부정은?`, [`${n}의 약수의 개수는 ${k + 1}이다.`, `${n}의 배수의 개수는 ${k}${iga(k)} 아니다.`, `${n}의 약수의 개수는 ${k}보다 크다.`], neg, '「~이다」 → 「~가 아니다」 (다른 숫자로 바꾸는 것이 아님)', { neg: s }, r),
      TF(`(${no}) 「${neg}」 는 참인가 거짓인가?`, d !== k, `${n}의 약수 = ${st(divs(n))} → ${d}개 ${d !== k ? `≠ ${k} → 참` : `= ${k} → 거짓`}`, { n, k })];
  };
  const m1Make = (ss, n, k, r) => [...ss.map((s, i) => p1(i + 1, s)), ...p1neg(5, n, k, r)];
  function m1Retry(r) {
    const all = Object.keys(PROP).slice(4), np = all.filter((s) => PROP[s] === null), pp = all.filter((s) => PROP[s] !== null);
    const ss = r.shuffle([r.pick(np), ...r.shuffle(pp.slice()).slice(0, 3)]);
    for (;;) { const n = r.pick([6, 8, 9, 10, 12, 14, 16, 18, 20]), k = r.int(2, 6); if (n === 15 && k === 3) continue; return m1Make(ss, n, k, r); }
  }

  // ── 문제 2: 진리집합 (U = {1, …, N}) ───────────────────────
  const m2Make = (N, k, a, b, m) => { const U = range(1, N), head = `U = ${st(U)} 일 때`;
    return [multi(`(1) ${head} 조건 p : x는 ${k}의 배수 의 진리집합 P 의`, U, U.filter((x) => x % k === 0), `${k}, ${2 * k}, … → P = ${st(U.filter((x) => x % k === 0))}`, { U, kind: 'mul', k }),
      multi(`(2) ${head} 조건 q : x + ${a} = ${b} 의 진리집합 Q 의`, U, U.filter((x) => x + a === b), `x = ${b} − ${a} = ${b - a} → Q = ${st(U.filter((x) => x + a === b))}`, { U, kind: 'eq', a, b }),
      multi(`(3) ${head} 조건 r : x는 ${m}의 약수 의 진리집합 R 의`, U, U.filter((x) => m % x === 0), `${m}을 나누어떨어지게 하는 수 → R = ${st(U.filter((x) => m % x === 0))}`, { U, kind: 'div', m })]; };
  function m2Retry(r) {
    for (;;) {
      const N = r.pick([8, 10, 12]), k = r.int(2, 5), a = r.int(1, 6), b = a + r.int(1, N), m = r.pick([4, 6, 8, 9, 10, 12].filter((x) => x <= N));
      if (N === 10 && k === 3 && a === 2 && b === 7 && m === 6) continue;
      return m2Make(N, k, a, b, m);
    }
  }

  // ── 문제 3: 조건의 부정 · 진리집합 ─────────────────────────
  const NEGOP = { '>': '≤', '<': '≥', '≥': '<', '≤': '>' };
  const PAR = { 홀수: (x) => x % 2 === 1, 짝수: (x) => x % 2 === 0, '3의 배수': (x) => x % 3 === 0 };
  const cmp = (x, op, c) => ({ '>': x > c, '<': x < c, '≥': x >= c, '≤': x <= c })[op];
  const m3Make = (N, par, op, c, a, b, v, op2, r) => { const U = range(1, N), head = `U = ${st(U)} 일 때`;
    const notPar = U.filter((x) => !PAR[par](x)), notQ = U.filter((x) => !cmp(x, op, c));
    const or = `x = ${a} 또는 x = ${b}`, and = `x ${op2} ${v} 그리고 y ${op2} ${v}`, n2 = NEGOP[op2];
    return [multi(`(1) ${head} 조건 p : x는 ${par} 의 부정 ~p 의 진리집합의`, U, notPar, `~p : x는 ${par}가 아니다 → Pᶜ = ${st(notPar)}`, { U, kind: 'par', par }),
      multi(`(2) ${head} 조건 q : x ${op} ${c} 의 부정 ~q 의 진리집합의`, U, notQ, `~q : x ${NEGOP[op]} ${c} (등호도 바뀜!) → ${st(notQ)}`, { U, kind: 'cmp', op, c }),
      chR(`(3) 조건 「${or}」 의 부정은?`, [`x ≠ ${a} 또는 x ≠ ${b}`, `x = ${a} 그리고 x = ${b}`, `x ≠ ${a} 또는 x = ${b}`], `x ≠ ${a} 그리고 x ≠ ${b}`, '「또는」의 부정 → 「그리고」, = 의 부정 → ≠', { or: [a, b] }, r),
      chR(`(4) 조건 「${and}」 의 부정은?`, [`x ${n2} ${v} 그리고 y ${n2} ${v}`, `x ${op2 === '>' ? '<' : op2 === '<' ? '>' : op2 === '≥' ? '≤' : '≥'} ${v} 또는 y ${op2 === '>' ? '<' : op2 === '<' ? '>' : op2 === '≥' ? '≤' : '≥'} ${v}`, `x ${op2} ${v} 또는 y ${op2} ${v}`], `x ${n2} ${v} 또는 y ${n2} ${v}`,
        `「그리고」의 부정 → 「또는」, ${op2} 의 부정 → ${n2} (등호 조심)`, { and: [op2, v] }, r)];
  };
  function m3Retry(r) {
    for (;;) {
      const N = r.pick([6, 7, 8]), par = r.pick(Object.keys(PAR)), op = r.pick(['>', '<', '≥', '≤']), c = r.int(2, N - 2), a = r.int(1, 4), b = a + r.int(1, 3), v = r.int(0, 3), op2 = r.pick(['>', '<', '≥', '≤']);
      if (N === 6 && par === '홀수' && op === '>' && c === 4) continue;
      return m3Make(N, par, op, c, a, b, v, op2, r);
    }
  }

  // ── 문제 4: 모든 · 어떤 의 참 · 거짓 ───────────────────────
  // 유한 U: { q: 'all' | 'some', f: 'lt' (x < c) · 'even' · 'odd' · 'eq' (x + a = b) · 'gt' (x > c) }
  const SF = { lt: (p) => `x < ${p.c}`, gt: (p) => `x > ${p.c}`, even: () => 'x는 짝수', odd: () => 'x는 홀수', eq: (p) => `x + ${p.a} = ${p.b}` };
  const SV = { lt: (x, p) => x < p.c, gt: (x, p) => x > p.c, even: (x) => x % 2 === 0, odd: (x) => x % 2 === 1, eq: (x, p) => x + p.a === p.b };
  const qWord = { all: '모든', some: '어떤' };
  const finTF = (no, U, s) => { const T = U.filter((x) => SV[s.f](x, s)), t = s.q === 'all' ? T.length === U.length : T.length > 0;
    return TF(`(${no}) U = ${st(U)} 일 때 「${qWord[s.q]} x에 대하여 ${SF[s.f](s)}이다.」`, t, `진리집합 = ${st(T)} → ${s.q === 'all' ? (t ? 'U 전체 → 참' : 'U 가 아님 → 거짓') : (t ? '하나라도 있음 → 참' : '하나도 없음 → 거짓')}`, Object.assign({ U }, s)); };
  const counterQ = (no, U, s) => { const bad = U.filter((x) => !SV[s.f](x, s));
    return multi(`(${no}) U = ${st(U)} 일 때 「모든 x에 대하여 ${SF[s.f](s)}이다.」 의 반례가 되는`, U, bad, `${SF[s.f](s)} 가 아닌 원소 = ${st(bad)} (하나만 들어도 반례)`, Object.assign({ U, counter: true }, s)); };
  // 실수 범위: 「모든 실수 x에 대하여 x² + bx + c ○ 0」 · 「어떤 실수 x에 대하여 x² + bx + c = 0」 (판별식 · 완전제곱으로 판단)
  const poly = (b, c) => `x² ${b < 0 ? '−' : '+'} ${Math.abs(b)}x ${c < 0 ? '−' : '+'} ${Math.abs(c)}`.replace(/ [+−] 0x/, '').replace(/ \+ 0$/, '');
  const realTF = (no, s) => {
    if (s.kind === 'abs') return TF(`(${no}) 「모든 실수 x에 대하여 |x| ≥ 0이다.」`, true, '절댓값은 0 이상 → 참', s);
    const D = s.b * s.b - 4 * s.c; // x² + bx + c
    if (s.q === 'some') return TF(`(${no}) 「어떤 실수 x에 대하여 ${poly(s.b, s.c)} = 0이다.」`, D >= 0, D >= 0 ? `해가 있다 (판별식 ${D} ≥ 0) → 참` : `${poly(s.b, s.c)} = (x ${s.b < 0 ? '−' : '+'} ${Math.abs(s.b) / 2})² + ${-D / 4} > 0 → 거짓`, s);
    return TF(`(${no}) 「모든 실수 x에 대하여 ${poly(s.b, s.c)} > 0이다.」`, D < 0, D < 0 ? `(x ${s.b < 0 ? '−' : '+'} ${Math.abs(s.b) / 2})² + ${-D / 4} > 0 → 참` : `0 이 되는 x 가 있다 (판별식 ${D} ≥ 0) → 거짓`, s);
  };
  const m4Make = (U, a, b, c4, sReal) => [finTF(1, U, { q: 'all', f: 'lt', c: Math.max(...U) + 1 }), finTF(2, U, { q: 'all', f: 'even' }), counterQ(2, U, { f: 'even' }),
    finTF(3, U, { q: 'some', f: 'eq', a, b }), finTF(4, U, { q: 'some', f: 'gt', c: c4 }), realTF(5, { kind: 'abs' }), realTF(6, sReal)];
  function m4Retry(r) {
    for (;;) {
      const n = r.int(4, 6), U = range(1, n), a = r.int(1, 4), b = a + r.int(1, n + 2), c4 = r.int(n - 1, n + 1);
      const h = r.pick([1, 2, 3]), k = r.pick([-2, -1, 0, 1, 2]); // (x − h)² + k 꼴 → b = −2h, c = h² + k
      const sReal = { q: r.pick(['some', 'all']), b: -2 * h, c: h * h + k };
      if (n === 4 && a === 1 && b === 4 && c4 === 4 && h === 2 && k === 1) continue;
      return m4Make(U, a, b, c4, sReal);
    }
  }

  // ── 문제 5: 모든 · 어떤 의 부정 (문장 고르기) ─────────────
  const NEG5 = [ // [원래 문장, 부정(정답), 오개념 3]
    ['우리 반 모든 학생은 지각하지 않았다.', '우리 반 어떤 학생은 지각했다.', ['우리 반 모든 학생은 지각했다.', '우리 반 어떤 학생은 지각하지 않았다.', '우리 반에 지각하지 않은 학생이 있다.']],
    ['모든 학생은 휴대폰이 있다.', '어떤 학생은 휴대폰이 없다.', ['모든 학생은 휴대폰이 없다.', '어떤 학생은 휴대폰이 있다.', '휴대폰이 있는 학생이 있다.']],
    ['모든 고양이는 생선을 좋아한다.', '어떤 고양이는 생선을 좋아하지 않는다.', ['모든 고양이는 생선을 좋아하지 않는다.', '어떤 고양이는 생선을 좋아한다.', '생선을 좋아하는 고양이가 있다.']],
    ['어떤 학생은 수학을 좋아한다.', '모든 학생은 수학을 좋아하지 않는다.', ['어떤 학생은 수학을 좋아하지 않는다.', '모든 학생은 수학을 좋아한다.', '수학을 좋아하는 학생이 있다.']],
    ['모든 정사각형은 마름모이다.', '어떤 정사각형은 마름모가 아니다.', ['모든 정사각형은 마름모가 아니다.', '어떤 정사각형은 마름모이다.', '어떤 마름모는 정사각형이 아니다.']],
  ];
  const QUAD = [ // 사각형 부정 + 그 부정의 참 · 거짓 (교과서 85쪽 문제 6 꼴)
    ['모든 마름모는 정사각형이다.', '어떤 마름모는 정사각형이 아니다.', ['모든 마름모는 정사각형이 아니다.', '어떤 마름모는 정사각형이다.', '어떤 정사각형은 마름모가 아니다.'], true],
    ['모든 직사각형은 정사각형이다.', '어떤 직사각형은 정사각형이 아니다.', ['모든 직사각형은 정사각형이 아니다.', '어떤 직사각형은 정사각형이다.', '어떤 정사각형은 직사각형이 아니다.'], true],
    ['모든 정사각형은 직사각형이다.', '어떤 정사각형은 직사각형이 아니다.', ['모든 정사각형은 직사각형이 아니다.', '어떤 정사각형은 직사각형이다.', '어떤 직사각형은 정사각형이 아니다.'], false],
    ['모든 평행사변형은 마름모이다.', '어떤 평행사변형은 마름모가 아니다.', ['모든 평행사변형은 마름모가 아니다.', '어떤 평행사변형은 마름모이다.', '어떤 마름모는 평행사변형이 아니다.'], true],
  ];
  const ineq = (no, q, dom, a, op, v, r) => { // 「모든/어떤 dom x에 대하여 x + a op v이다.」 의 부정 (a = 0 이면 x op v)
    const X = a ? `x + ${a}` : 'x', s = `${qWord[q]} ${dom} x에 대하여 ${X} ${op} ${v}이다.`, q2 = qWord[q === 'all' ? 'some' : 'all'], n2 = NEGOP[op], strictSwap = { '>': '<', '<': '>', '≥': '≤', '≤': '≥' }[op];
    const ans = `${q2} ${dom} x에 대하여 ${X} ${n2} ${v}이다.`;
    return chR(`(${no}) 「${s}」 의 부정은?`, [`${qWord[q]} ${dom} x에 대하여 ${X} ${n2} ${v}이다.`, `${q2} ${dom} x에 대하여 ${X} ${strictSwap} ${v}이다.`, `${qWord[q]} ${dom} x에 대하여 ${X} ${strictSwap} ${v}이다.`], ans,
      `모든 ↔ 어떤 을 바꾸고, ${op} 의 부정 = ${n2} (등호 조심)`, { q, dom, a, op, v }, r);
  };
  const sent = (no, row, r) => chR(`(${no}) 「${row[0]}」 의 부정은?`, row[2], row[1], '「모든 ~이다」의 부정 = 「어떤 ~가 아니다」 (모든 ~아니다 가 아님!)', { s: row[0] }, r);
  const m5Make = (A, B, row, quad, r) => [ineq(1, 'all', '실수', A[0], A[1], A[2], r), ineq(2, 'some', '자연수', B[0], B[1], B[2], r), sent(3, row, r),
    sent(4, quad, r), TF(`(4) 「${quad[1]}」 는 참인가 거짓인가?`, quad[3], quad[3] ? `「${quad[0]}」 는 거짓(반례가 있음) → 그 부정은 참` : `「${quad[0]}」 는 참 → 그 부정은 거짓`, { quad: quad[0] })];
  function m5Retry(r) {
    for (;;) {
      const A = [r.int(1, 5), r.pick(['>', '≥']), r.int(0, 3)], B = [r.int(0, 3), r.pick(['<', '≤']), r.int(1, 4)], row = r.pick(NEG5.slice(1)), quad = r.pick(QUAD.slice(1));
      return m5Make(A, B, row, quad, r);
    }
  }

  // ── 몬스터 (학습지 순서 · 04 거울 수정 광산) ───────────────
  const MONSTERS = {
    m1: { title: '문제 1 · 명제와 부정', sprite: 'mirror:0', make: (a, r) => (a === 0 ? m1Make(['π는 유리수이다.', '섬진강은 아름답다.', '4 − 1 = 3', '정삼각형은 이등변삼각형이다.'], 15, 3, null) : m1Retry(r)) },
    m2: { title: '문제 2 · 진리집합', sprite: 'mirror:1', make: (a, r) => (a === 0 ? m2Make(10, 3, 2, 7, 6) : m2Retry(r)) },
    m3: { title: '문제 3 · 조건의 부정', sprite: 'mirror:2', note: '「또는」 ↔ 「그리고」 · > 의 부정은 ≤ (같다도 들어가요!)', make: (a, r) => (a === 0 ? m3Make(6, '홀수', '>', 4, 2, 3, 0, '>', null) : m3Retry(r)) },
    m4: { title: '문제 4 · 모든 · 어떤 참 거짓', sprite: 'mirror:3', note: '모든 = 하나라도 안 되면 거짓(반례) · 어떤 = 하나만 찾으면 참', make: (a, r) => (a === 0 ? m4Make(range(1, 4), 1, 4, 4, { q: 'some', b: -4, c: 5 }) : m4Retry(r)) },
    m5: { title: '문제 5 · 모든 · 어떤의 부정', sprite: 'mirror:4', note: '「모든 ~이다」의 부정 = 「어떤 ~가 아니다」', make: (a, r) => (a === 0 ? m5Make([1, '>', 0], [0, '<', 1], NEG5[0], QUAD[0], null) : m5Retry(r)) },
  };

  // ── 형성평가 (보스 👑 부정의 수정 여왕) 6문항 — 시도 0 = 학습지 · 시도 1~3 = L.boss.make (같은 꼴 · 새 값) ──
  const fix = (q, no) => Object.assign(q, { question: `${no}. ${q.question}` });
  const NOTPROP = ['수학은 재미있다.', '김치는 맛있다.', '그 노래는 좋은 노래이다.', '우리 학교 운동장은 넓다.'];
  const YESPROP = ['2 + 3 = 6', '7은 소수이다.', '모든 정사각형은 직사각형이다.', '9는 3의 배수이다.', '1은 소수이다.', '3 × 4 = 13', '정삼각형은 이등변삼각형이다.'];
  const b1 = (np, ps, r) => fix(chR('다음 중 명제가 아닌 것은?', ps, np, `「${np}」 는 사람마다 판단이 달라 참 · 거짓을 정할 수 없다`, { np }, r), 1);
  const b2 = (N, m) => { const U = range(1, N), P = U.filter((x) => m % x === 0); return fix(multi(`U = ${st(U)}, p : x는 ${m}의 약수 일 때 P 의`, U, P, `P = ${st(P)}`, { U, kind: 'div', m }), 2); };
  const b3 = (N, op, c) => { const U = range(1, N), P = U.filter((x) => !cmp(x, op, c)); return fix(multi(`U = ${st(U)}, p : x ${op} ${c} 일 때 ~p 의 진리집합의`, U, P, `~p : x ${NEGOP[op]} ${c} → ${st(P)}`, { U, kind: 'cmp', op, c }), 3); };
  const b45 = (no, U, s) => { const q = finTF(no, U, s); return fix(Object.assign(q, { question: q.question.replace(/^\(\d+\) /, '') + ' 는 참인가 거짓인가?' }), no); };
  const b6 = (row, r) => fix(chR(`「${row[0]}」 의 부정은?`, row[2], row[1], '「모든 ~이다」 → 「어떤 ~가 아니다」', { s: row[0] }, r), 6);
  const GLASS = ['모든 학생은 안경을 썼다.', '어떤 학생은 안경을 쓰지 않았다.', ['모든 학생은 안경을 쓰지 않았다.', '어떤 학생은 안경을 썼다.', '안경을 쓴 학생이 있다.']];
  const BOSS1 = [fix(ch('다음 중 명제가 아닌 것은?', ['2 + 3 = 6', '7은 소수이다.', '수학은 재미있다.', '모든 정사각형은 직사각형이다.'], '수학은 재미있다.', '「수학은 재미있다.」는 사람마다 판단이 달라 참 · 거짓을 정할 수 없다', { np: '수학은 재미있다.' }), 1),
    b2(8, 4), b3(4, '≥', 3), b45(4, range(1, 3), { q: 'all', f: 'lt', c: 4 }), b45(5, range(1, 3), { q: 'some', f: 'eq', a: 0, b: 5 }), b6(GLASS, null)];
  // 4번 「모든 x ≤ 3」: 학습지 글 그대로 보이게 (x < 4 와 같은 뜻 · ≤ 꼴로 적음)
  BOSS1[3] = fix(TF('U = {1, 2, 3} 일 때 「모든 x에 대하여 x ≤ 3이다.」 는 참인가 거짓인가?', true, '1, 2, 3 모두 3 이하 → 참', { U: [1, 2, 3], q: 'all', f: 'le', c: 3 }), 4);
  BOSS1[4] = fix(TF('U = {1, 2, 3} 일 때 「어떤 x에 대하여 x = 5이다.」 는 참인가 거짓인가?', false, 'U 에 5 가 없다 → 거짓', { U: [1, 2, 3], q: 'some', f: 'is', c: 5 }), 5);
  function bossMake(i, a, r) {
    for (;;) {
      if (i === 0) { const np = r.pick(NOTPROP.slice(1)); return b1(np, r.shuffle(YESPROP.slice()).slice(0, 3), r); }
      if (i === 1) { const N = r.pick([8, 10, 12]), m = r.pick([6, 8, 9, 10, 12].filter((x) => x <= N)); if (N === 8 && m === 4) continue; return b2(N, m); }
      if (i === 2) { const N = r.int(4, 7), op = r.pick(['>', '<', '≥', '≤']), c = r.int(2, N - 1); if (N === 4 && op === '≥' && c === 3) continue; return b3(N, op, c); }
      if (i === 3) { const n = r.int(3, 5), c = r.pick([n, n + 1, n - 1]); return b45(4, range(1, n), { q: 'all', f: 'lt', c }); }
      if (i === 4) { const n = r.int(3, 5), a = r.int(0, 3), b = a + r.int(1, n + 3); return b45(5, range(1, n), { q: 'some', f: 'eq', a, b }); }
      return b6(r.pick(NEG5.slice(1)), r);
    }
  }
  const BOSS = { 1: BOSS1, 2: BOSS1.map((q, i) => bossMake(i, 1, DS.Rng(`s8|boss2|${i}`))) }; // 세트2 = 수업 준비 미리보기용

  const STEPS = [
    { kind: 'concept', id: 'c0', title: '생각 열기 · 게임 랭크', say: '「점수 x 가 2000 이상이면 다이아」 — x 를 모르면 참 · 거짓을 알 수 없다 · x = 2500 이면 참 · 1800 이면 거짓 → 오늘은 「참 · 거짓을 정할 수 있는 문장」' },
    { kind: 'concept', id: 'c1', title: '개념 1 · 명제와 그 부정', say: '참 · 거짓을 분명히 정할 수 있으면 명제 · p 의 부정 ~p = 「p 가 아니다」 · p 가 참이면 ~p 는 거짓' },
    { kind: 'monster', id: 'm1' },
    { kind: 'concept', id: 'c2', title: '개념 2 · 조건과 진리집합', say: 'x 값에 따라 참 · 거짓이 정해지면 조건 · U 에서 조건을 참이 되게 하는 원소의 모임 = 진리집합 P' },
    { kind: 'monster', id: 'm2' },
    { kind: 'concept', id: 'c3', title: '개념 3 · 조건의 부정', say: '~p 의 진리집합 = Pᶜ · 「그리고」 ↔ 「또는」 · x > 2 의 부정은 x ≤ 2 (같다도 들어감)' },
    { kind: 'monster', id: 'm3' },
    { kind: 'concept', id: 'c4', title: '개념 4 · 「모든」 · 「어떤」의 참 · 거짓', say: '모든: P = U 이면 참 (하나라도 안 되면 거짓 → 반례) · 어떤: P ≠ ∅ 이면 참 (하나만 찾으면 참)' },
    { kind: 'monster', id: 'm4' },
    { kind: 'concept', id: 'c5', title: '개념 5 · 「모든」 · 「어떤」의 부정', say: '「모든 x 에 대하여 p」의 부정 = 「어떤 x 에 대하여 ~p」 · 「모든 학생은 휴대폰이 없다」가 아니다!' },
    { kind: 'monster', id: 'm5' },
    { kind: 'boss', id: 'boss', title: '형성평가 · 부정의 수정 여왕' },
  ];
  STEPS.forEach((s) => { if (s.kind === 'monster') Object.assign(s, { title: MONSTERS[s.id].title, special: !!MONSTERS[s.id].special }); });

  // 칸 위치 (레이드용 v1 PDF 에서 tools/worksheet/crops_pdf.py 로 잼 · 2026-11-08 · 빨간 상자 그림으로 눈 확인 · c0 = 생각 열기 상자 손으로)
  const CROPS = { c0: [{ p: 1, x: 0.045, y: 0.148, w: 0.455, h: 0.104 }],
    c1: [{ p: 1, x: 0.045, y: 0.2525, w: 0.455, h: 0.1739 }], m1: [{ p: 1, x: 0.045, y: 0.4234, w: 0.455, h: 0.2197 }], c2: [{ p: 1, x: 0.045, y: 0.6401, w: 0.455, h: 0.1275 }], m2: [{ p: 1, x: 0.045, y: 0.7646, w: 0.455, h: 0.136 }],
    c3: [{ p: 1, x: 0.507, y: 0.1412, w: 0.452, h: 0.1124 }], m3: [{ p: 1, x: 0.507, y: 0.2506, w: 0.452, h: 0.2 }], c4: [{ p: 1, x: 0.507, y: 0.4476, w: 0.452, h: 0.1267 }], m4: [{ p: 1, x: 0.507, y: 0.5713, w: 0.452, h: 0.2198 }],
    c5: [{ p: 2, x: 0.045, y: 0.0922, w: 0.455, h: 0.165 }], m5: [{ p: 2, x: 0.045, y: 0.2542, w: 0.455, h: 0.2108 }], boss: [{ p: 2, x: 0.507, y: 0.1017, w: 0.452, h: 0.7237 }] };

  DS.Lessons.register({
    id: 'set-08', no: 8,
    title: '명제와 조건',
    unit: '공통수학2 Ⅱ. 집합과 명제 · 8차시',
    sheet: '학습과정 8차시 레이드용 v1',
    crops: CROPS,
    theme: '04-mine', // 던전 테마: 거울 수정 광산 (배경 dg-04-mine-v2 · 몬스터 mirror:0~4)
    videos: {}, // 🎬 8차시 모션 40 · 41 · 42 는 모션 방에 주문함 (2026-11-08) — 오기 전에는 비워 둠
    goal: '명제와 그 부정의 뜻을 안다 · 조건의 진리집합과 조건의 부정을 구한다 · 「모든」 · 「어떤」을 포함한 명제의 참 · 거짓을 판별하고 부정을 말한다',
    defaultPct: 90,
    steps: STEPS,
    monsters: MONSTERS,
    items(id, seed, attempt) { return MONSTERS[id].make(attempt, DS.Rng(`${seed}|${id}|${attempt}`)); },
    WORDS: { PROP, NEG5, QUAD, NOTPROP, YESPROP },
    next: { title: '9차시 · 명제 사이의 관계', ask: '「x = 1 이면 x² = 1 이다」 를 거꾸로 하면? 거꾸로 해도 참일까?', link: '오늘 배운 진리집합으로 「p 이면 q」 가 참인지 그림으로 확인해요' },
    boss: { title: '8차시 형성평가 · 부정의 수정 여왕', sprite: 'mirrorboss8:0', items: 6, hpItems: 6, sets: BOSS, tags: ['c1', 'c2', 'c3', 'c4', 'c4', 'c5'],
      make(i, a, rng) { return a ? bossMake(i, a, rng) : BOSS1[i]; } },
  });
})();
