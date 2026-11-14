// 공통수학2 Ⅱ. 집합과 명제 · 11차시 「대우를 이용한 증명」 (학습과정 11차시 레이드용 v1 · 2026-11-14 선생님 「추천대로」 · 손발 #7 · 📚 정식 차시 추가)
// 교과서 미래엔 91쪽(생각 열기 · 대우를 이용한 증명법 · 예제 1 · 문제 1) + 97쪽 중단원 09 · ★ 칸만 게임 · 몬스터 4 (m3 = ⚔ 소레이드 + ✍ 서술형 📸 · m4 = ⚔ 소레이드) · 형성평가 5문항
// 던전 = ⚖ 저울의 공중 정원 (10차시 테마 이어 씀 · 2026-11-14 결정)
// 📦 #64 꼴: ① 맨 위 DATA = 순수 값 · 재도전은 「어떤 생성기를 어떤 매개변수로」 이름만
//           ② 아래 GEN = 계산 코드 · 정답은 tests/lesson11.test.js 가 문장을 읽어 따로 계산해 판정한다 (대우 = 낱말 뜻을 수로 바꿔 모든 경우 비교 · 식 = k 에 수를 넣어 비교)
(function () {
  // ══ ① 데이터 ═══════════════════════════════════════════════
  const DATA = {
    id: 'set-11', no: 11,
    title: '대우를 이용한 증명',
    unit: '공통수학2 Ⅱ. 집합과 명제 · 11차시',
    sheet: '학습과정 11차시 레이드용 v1',
    theme: '12-skygarden', // ⚖ 저울의 공중 정원 (10차시와 같음)
    goal: '대우를 이용한 증명법을 이해한다 · 대우를 이용하여 간단한 명제가 참임을 증명할 수 있다',
    defaultPct: 90,
    steps: [
      { kind: 'intro', id: 'intro', title: '도입 · 🔁 전시 확인', say: '지난 시간: 명제와 그 대우의 참 · 거짓은 같다 · r 은 q 의 충분 · p 는 q 의 필요 → R ⊂ Q ⊂ P — 학습지 맨 위 칸을 같이 확인해요', img: 'review' },
      { kind: 'concept', id: 'c1', title: '개념 1 · 대우를 이용한 증명법', say: '생각 열기: 「교복 → 할인」과 「할인 못 받음 → 교복 아님」은 참 · 거짓이 같다 · 명제 대신 대우가 참임을 보여도 된다 · 대우 = 가정 · 결론을 바꾸고 둘 다 부정' },
      { kind: 'monster', id: 'm1' },
      { kind: 'concept', id: 'c2', title: '개념 2 · 수를 문자로 나타내기', say: '짝수 = 2k · 홀수 = 2k − 1 · 3의 배수가 아닌 수 = 3k − 1 또는 3k − 2 · 2(□) + 1 꼴 → 홀수 · 3(□) + 1 꼴 → 3의 배수가 아님' },
      { kind: 'monster', id: 'm2' },
      { kind: 'monster', id: 'm3' },
      { kind: 'monster', id: 'm4' },
      { kind: 'concept', id: 'sum', title: '📝 오늘 정리', say: '① 대우 쓰기 → ② 수를 문자로 → ③ 식 정리 → ④ 대우가 참 → 처음 명제도 참 · 세 조건은 대우로 바꿔 화살표를 이으면 포함 관계' },
      { kind: 'boss', id: 'boss', title: '형성평가 · 필요충분의 천칭 수호자' },
    ],
    monsters: {
      m1: { title: '문제 1 · 대우 쓰기', sprite: 'garden:4' /* 거울 웅덩이 두꺼비 */, note: '가정 · 결론을 바꾸고 둘 다 부정 · 적어도 하나 ↔ 모두',
        book: { gen: 'contra3', rows: [0, 1, 2] }, retry: { gen: 'contra3' } },
      m2: { title: '문제 2 · 대우로 증명 (예제 1)', sprite: 'garden:2' /* 충분 나비 */, note: '대우 → 홀수 = 2k − 1 → 2(□) + 1 꼴 → 대우 참',
        book: { gen: 'proof2', pf: 0 }, retry: { gen: 'proof2' } },
      m3: { title: '문제 3 · 3의 배수 증명 (교과서 문제 1)', sprite: 'garden:3' /* 쌍둥이 구름 정령 */, evalQ: true, note: '대우 → 3k − 1 · 3k − 2 두 경우 → 3(□) + 1 꼴 → 대우 참',
        book: { gen: 'proof3', v: 0 }, retry: { gen: 'proof3' } },
      m4: { title: '문제 4 · 세 조건과 대우 (중단원 09)', sprite: 'garden:1' /* 필요 덩굴 */, note: '~ 가 붙은 명제는 대우로 → 화살표 잇기 → 포함 관계',
        book: { gen: 'prop09', order: ['p', 'q', 'r'], neg: 1, props: ['q → r', '~p → ~q', '~r → ~p', 'p → ~r'] }, retry: { gen: 'prop09' } },
    },
    words: {
      // 대우 쓰기 [명제, 대우, 함정…] (함정 = 역 · 이 · 부정 한쪽만 · 「적어도 하나 ↔ 모두」 실수) — 0 = 예제 1 · 1 · 2 = 옛 9차시 학습지 · 3 = 형성평가 2
      stmt: [
        ['n²이 짝수이면 n도 짝수이다.', 'n이 홀수이면 n²도 홀수이다.', ['n이 짝수이면 n²도 짝수이다.', 'n²이 홀수이면 n도 홀수이다.', 'n이 홀수이면 n²은 짝수이다.']],
        ['a + b가 홀수이면 a, b 중 적어도 하나는 홀수이다.', 'a, b가 모두 짝수이면 a + b는 짝수이다.', ['a, b 중 적어도 하나가 홀수이면 a + b는 홀수이다.', 'a, b 중 적어도 하나가 짝수이면 a + b는 짝수이다.', 'a, b가 모두 홀수이면 a + b는 짝수이다.']],
        ['ab가 홀수이면 a와 b는 모두 홀수이다.', 'a, b 중 적어도 하나가 짝수이면 ab는 짝수이다.', ['a와 b가 모두 홀수이면 ab는 홀수이다.', 'a, b가 모두 짝수이면 ab는 짝수이다.', 'ab가 짝수이면 a와 b는 모두 짝수이다.']],
        ['n²이 홀수이면 n도 홀수이다.', 'n이 짝수이면 n²도 짝수이다.', ['n이 홀수이면 n²도 홀수이다.', 'n²이 짝수이면 n도 짝수이다.', 'n이 짝수이면 n²은 홀수이다.']],
        ['n³이 짝수이면 n도 짝수이다.', 'n이 홀수이면 n³도 홀수이다.', ['n이 짝수이면 n³도 짝수이다.', 'n³이 홀수이면 n도 홀수이다.', 'n이 홀수이면 n³은 짝수이다.']],
        ['n²이 3의 배수이면 n도 3의 배수이다.', 'n이 3의 배수가 아니면 n²도 3의 배수가 아니다.', ['n이 3의 배수이면 n²도 3의 배수이다.', 'n²이 3의 배수가 아니면 n도 3의 배수가 아니다.', 'n이 3의 배수가 아니면 n²은 3의 배수이다.']],
        ['ab가 짝수이면 a, b 중 적어도 하나는 짝수이다.', 'a, b가 모두 홀수이면 ab는 홀수이다.', ['a, b 중 적어도 하나가 짝수이면 ab는 짝수이다.', 'a, b 중 적어도 하나가 홀수이면 ab는 홀수이다.', 'a, b가 모두 짝수이면 ab는 홀수이다.']],
        ['a² + b²이 홀수이면 a, b 중 적어도 하나는 홀수이다.', 'a, b가 모두 짝수이면 a² + b²은 짝수이다.', ['a, b 중 적어도 하나가 홀수이면 a² + b²은 홀수이다.', 'a, b 중 적어도 하나가 짝수이면 a² + b²은 짝수이다.', 'a, b가 모두 홀수이면 a² + b²은 짝수이다.']],
        ['n³이 홀수이면 n도 홀수이다.', 'n이 짝수이면 n³도 짝수이다.', ['n이 홀수이면 n³도 홀수이다.', 'n³이 짝수이면 n도 짝수이다.', 'n이 짝수이면 n³은 홀수이다.']],
      ],
      // 문제 2 증명 [명제 행, n 의 꼴 [k 의 계수, 상수], 거듭제곱] — 0 = 예제 1 (n² 짝수 → n 짝수 · n = 2k − 1)
      pf: [[0, [2, -1], 2], [3, [2, 0], 2], [4, [2, -1], 3], [8, [2, 0], 3]],
      // 문제 3 증명 [n 의 두 꼴, 거듭제곱, k 의 범위] — 0 = 교과서 문제 1 (3k − 1 · 3k − 2 · 자연수)
      p3: [[[[3, -1], [3, -2]], 2, '자연수'], [[[3, 1], [3, 2]], 2, '0 또는 자연수'], [[[3, -1], [3, -2]], 3, '자연수'], [[[3, 1], [3, 2]], 3, '0 또는 자연수']],
    },
    boss: { title: '11차시 형성평가 · 필요충분의 천칭 수호자', sprite: 'gardenboss:0', items: 5, hpItems: 5, tags: ['c1', 'c1', 'c2', 'c2', 'c1'],
      book: [{ gen: 'bLogic', row: 0 }, { gen: 'bContra', row: 3 }, { gen: 'bForm', row: 0 }, { gen: 'bInner', pf: 1 }, { gen: 'bChain', order: ['r', 'q', 'p'], neg: 0, flip: true, props: ['p → r', 'r → p', 'p → q', '~r → ~p'] }],
      retry: [{ gen: 'bLogic' }, { gen: 'bContra' }, { gen: 'bForm' }, { gen: 'bInner' }, { gen: 'bChain' }] },
    // 칸 위치 (레이드용 v1 PDF · 2026-11-14 crops_pdf.py · review = 두 단 너비)
    crops: { review: [{ p: 1, x: 0.045, y: 0.1263, w: 0.914, h: 0.05 }],
      c1: [{ p: 1, x: 0.045, y: 0.181, w: 0.455, h: 0.4199 }], m1: [{ p: 1, x: 0.045, y: 0.5979, w: 0.455, h: 0.2341 }],
      c2: [{ p: 1, x: 0.507, y: 0.1875, w: 0.452, h: 0.1328 }], m2: [{ p: 1, x: 0.507, y: 0.3173, w: 0.452, h: 0.2435 }], sum: [{ p: 1, x: 0.507, y: 0.5578, w: 0.452, h: 0.1584 }],
      m3: [{ p: 2, x: 0.045, y: 0.0902, w: 0.455, h: 0.5081 }], m4: [{ p: 2, x: 0.045, y: 0.5953, w: 0.455, h: 0.2421 }],
      boss: [{ p: 2, x: 0.507, y: 0.1052, w: 0.452, h: 0.7202 }] },
    videos: { // 🎬 2026-11-14 모션 #49 대우를이용한증명법 · #50 수를문자로나타내기 (드라이브 05 원본 · 워터마크 없음) · #51 세조건과대우(m4) = 「🎬 완료」 뒤
      c1: 'assets/video/v11-49.mp4', m1: 'assets/video/v11-49.mp4', sum: 'assets/video/v11-49.mp4',
      c2: 'assets/video/v11-50.mp4', m2: 'assets/video/v11-50.mp4', m3: 'assets/video/v11-50.mp4' },
    next: { title: '12차시 · 귀류법', ask: '「√2 는 유리수가 아니다」 — 대우로도 어려울 때, 아니라고 가정해 보면?', link: '결론을 부정했더니 모순이 생기면 처음 명제가 참 — 귀류법을 알아봐요' },
  };

  // ══ ② 계산 코드 ═════════════════════════════════════════════
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const ch = (question, choices, ans, solution, check) => ({ type: 'choice', question, choices, answerIndex: choices.indexOf(ans), answer: ans, solution, check });
  const chR = (question, wrongs, ans, solution, check, r) => ch(question, r ? r.shuffle([ans, ...wrongs]) : [ans, ...wrongs], ans, solution, check);
  const sayOf = (q, say) => Object.assign(q, { say });
  const whyOf = (q, pre, choices, post) => Object.assign(q, { why: { pre, post, choices, answer: 0, text: `${pre} ${choices[0]}${post}` } });
  const W = DATA.words, KN = (s) => (/[ab]/.test(s.replace(/이면.*/, '')) ? 'a, b' : 'n');
  // 다항식 (k 의 거듭제곱 계수 [상수, k, k², k³])
  const SUP = ['', '', '²', '³'];
  const polyMul = (A, B) => { const o = Array(A.length + B.length - 1).fill(0); A.forEach((a, i) => B.forEach((b, j) => { o[i + j] += a * b; })); return o; };
  const polyPow = (lin, p) => { let o = [1]; for (let i = 0; i < p; i++) o = polyMul(o, [lin[1], lin[0]]); return o; };
  const pstr = (P) => { const t = []; for (let d = P.length - 1; d >= 0; d--) { const c = P[d]; if (!c) continue; const a = Math.abs(c), body = d === 0 ? String(a) : `${a === 1 ? '' : a}k${SUP[d]}`; t.push(t.length ? `${c < 0 ? '−' : '+'} ${body}` : `${c < 0 ? '−' : ''}${body}`); } return t.length ? t.join(' ') : '0'; };
  const lstr = (lin) => pstr([lin[1], lin[0]]); // [3, −1] → 3k − 1
  const nPow = (p) => `n${SUP[p]}`;
  // 식 정리: n = lin 일 때 n^p = 전개 = m(안) + 나머지 → 안 · 함정 둘 (나누지 않음 · 부호 바꿈 또는 한 번 더 나눔)
  function split(lin, p, m) { const E = polyPow(lin, p), r = ((E[0] % m) + m) % m, inner = E.map((c, i) => (i === 0 ? (c - r) / m : c / m));
    const t1 = E.map((c, i) => (i === 0 ? 0 : c)), t2 = inner.length > 2 && inner[1] ? inner.map((c, i) => (i === 1 ? -c : c)) : inner.map((c, i) => (i === inner.length - 1 ? c / m : c));
    return { E, r, inner: pstr(inner), traps: [...new Set([pstr(t1), pstr(t2)])].filter((x) => x !== pstr(inner)) }; }
  const innerQ = (lin, p, m, head, r) => { const s = split(lin, p, m), tail = s.r ? ` + ${s.r}` : '';
    return { q: chR(`${head}n = ${lstr(lin)} 일 때 ${nPow(p)} = (${lstr(lin)})${SUP[p]} = ${pstr(s.E)} = ${m}( ? )${tail} 에서 ( ) 안의 식은?`, s.traps.slice(0, 2), s.inner,
      `${pstr(s.E)} = ${m}(${s.inner})${tail}`, { lin, p, m }, r), s, tail }; };
  const contraQ = (row, head, r) => { const [s, c, wr] = W.stmt[row];
    return chR(`${head}명제 「${s}」의 대우는? (단, ${KN(s)}${KN(s) === 'n' ? '은' : '는'} 자연수)`, wr, c, `가정 · 결론을 바꾸고 둘 다 부정 → 「${c}」`, { stmt: row }, r); };
  const U = (s) => s.toUpperCase(), chainStr = (o) => o.map(U).join(' ⊂ ');
  const PERMS = [['p', 'q', 'r'], ['p', 'r', 'q'], ['q', 'p', 'r'], ['q', 'r', 'p'], ['r', 'p', 'q'], ['r', 'q', 'p']];
  // 세 조건: order = [안, 가운데, 바깥] · neg = ~ 꼴(대우)로 주는 명제 (0 = 안 → 가운데 · 1 = 가운데 → 바깥)
  const prem = (o, neg) => { const [i, m, x] = o, A = [`${i} → ${m}`, `~${m} → ~${i}`], B = [`${m} → ${x}`, `~${x} → ~${m}`]; return [neg === 0 ? A[1] : A[0], neg === 1 ? B[1] : B[0]]; };
  const tfLists = (o) => { const [i, m, x] = o; return { T: [`${i} → ${x}`, `${i} → ${m}`, `${m} → ${x}`, `~${x} → ~${i}`, `~${m} → ~${i}`, `~${x} → ~${m}`],
    F: [`${x} → ${i}`, `${m} → ${i}`, `${x} → ${m}`, `${m} → ~${x}`, `${i} → ~${m}`, `~${x} → ${i}`, `~${i} → ~${x}`, `~${m} → ${i}`, `${i} → ~${x}`, `~${i} → ~${m}`] }; };
  const LB = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ'];

  const GEN = {
    // 문제 1: 대우 쓰기 3개
    contra3({ rows }, r) { return rows.map((k, i) => contraQ(k, `(${i + 1}) `, r)); },
    contra3R(r) { for (;;) { const rows = r.shuffle(range(0, W.stmt.length - 1)).slice(0, 3); if (rows.join() === '0,1,2' || !rows.some((k) => [1, 2, 6, 7].includes(k))) continue; return GEN.contra3({ rows }, r); } },
    // 문제 2 (예제 1): (1) 대우 (2) n 의 꼴 (3) 식 정리 (4) 결론
    proof2({ pf }, r) { const [row, lin, p] = W.pf[pf], odd = lin[1] !== 0, e = innerQ(lin, p, 2, '(3) ', r);
      const hw = odd ? '홀수' : '짝수', form = lstr(lin), alt = odd ? ['2k', 'k − 1'] : ['2k − 1', 'k + 2'];
      return [contraQ(row, '(1) ', r),
        chR(`(2) n 이 ${hw}이면 n 을 k 로 나타낸 식은? (단, k는 자연수)`, alt, form, `${hw} = ${form}`, { form: lin, kind: hw }, r),
        e.q,
        chR(`(4) ${nPow(p)} = 2(${e.s.inner})${e.tail} 이므로 ${nPow(p)} 은?`, [odd ? '짝수' : '홀수', '알 수 없다'], hw, `2(□)${e.tail} 꼴 → ${hw} → 대우가 참이므로 처음 명제도 참`, { form: lin, p }, r)]; },
    proof2R(r) { return GEN.proof2({ pf: r.pick(range(1, W.pf.length - 1)) }, r); },
    // 문제 3 (교과서 문제 1) ⚔ 소레이드: ① 대우 (+ 💡 근거) ② 3의 배수가 아닌 n 의 꼴 ③ ④ 두 경우 식 정리 · 👑 결론
    proof3({ v }, r) { const [forms, p, kr] = W.p3[v], np = nPow(p), st = `${np}이 3의 배수이면 n도 3의 배수이다.`, co = `n이 3의 배수가 아니면 ${np}도 3의 배수가 아니다.`;
      const s1 = sayOf(chR(`명제 「${st}」의 대우는? (단, n은 자연수)`, [`n이 3의 배수이면 ${np}도 3의 배수이다.`, `${np}이 3의 배수가 아니면 n도 3의 배수가 아니다.`, `n이 3의 배수가 아니면 ${np}은 3의 배수이다.`], co,
        `가정 · 결론을 바꾸고 둘 다 부정 → 「${co}」`, { stmt3: p }, r), `주어진 명제의 대우는 「${co}」이다.`);
      whyOf(s1, '∵ 명제가 참이면 그 대우도 참이고, 대우가 참이면 처음 명제도', ['참', '거짓', '알 수 없음'], '이다.'); // 💡 근거 줄 = ① 맞힌 뒤 (R2)
      const [f1, f2] = forms.map(lstr), both = `n = ${f1} 또는 n = ${f2}`, plus = forms[0][1] > 0;
      const s2 = sayOf(chR(`n 이 3의 배수가 아니면 n 을 어떻게 나타낼 수 있나? (단, k는 ${kr})`, ['n = 3k', `n = ${f1}`, plus ? 'n = 2k + 1' : 'n = 2k − 1'], both, `3으로 나눈 나머지가 0 이 아님 → ${both}`, { forms, kr }, r),
        `n 이 3의 배수가 아니면 ${both} (k는 ${kr})로 나타낼 수 있다.`);
      const [a, b] = forms.map((lin, i) => { const e = innerQ(lin, p, 3, '', r); return sayOf(e.q, `n = ${lstr(lin)} 일 때 ${np} = ${pstr(e.s.E)} = 3(${e.s.inner})${e.tail}`); });
      const fin = sayOf(chR(`그러므로 어느 경우든 ${np} 은 3으로 나눈 나머지가 0 이 아니다. 결론은?`, [`${np}은 3의 배수가 아니므로 대우가 거짓 → 처음 명제도 거짓이다.`, `${np}은 3의 배수이므로 역이 참 → 처음 명제도 참이다.`],
        `${np}은 3의 배수가 아니므로 대우가 참 → 처음 명제도 참이다.`, '두 경우 모두 3의 배수가 아님 → 대우 참 → 처음 명제 참', { forms, p, end: true }, r),
      `그러므로 ${np} 은 3의 배수가 아니다. 따라서 대우가 참이므로 주어진 명제도 참이다.`);
      return [s1, s2, a, b, fin]; },
    proof3R(r) { return GEN.proof3({ v: r.pick(range(1, W.p3.length - 1)) }, r); },
    // 문제 4 (97쪽 09) ⚔ 소레이드: ① ~ 꼴 명제의 대우 (+ 💡 근거) ② 포함 관계 · 👑 항상 참인 명제 모두
    prop09({ order, neg, props }, r) { const [A, B] = prem(order, neg), N = neg === 0 ? A : B, m = /^~(\w) → ~(\w)$/.exec(N), con = `${m[2]} → ${m[1]}`;
      const box = `보기 ${props.map((s, i) => `${LB[i]}. ${s}`).join('  ')}`, head = `세 조건 p, q, r 에 대하여 두 명제 ${A}, ${B} 가 모두 참일 때`;
      const s1 = sayOf(chR(`${head} — 「${N}」의 대우는?`, [`${m[1]} → ${m[2]}`, `~${m[2]} → ~${m[1]}`] /* 함정 = 이 · 역 */, con, `가정 · 결론을 바꾸고 둘 다 부정 → ${con}`, { neg: N }, r), `${N} 의 대우 ${con} 도 참이다.`);
      whyOf(s1, '∵ 명제가 참이면 그', ['대우', '역', '이'], '도 참이다.');
      const right = chainStr(order), s2 = sayOf(chR(`${head} 진리집합 P, Q, R 사이의 포함 관계는?`, [chainStr([...order].reverse()), chainStr([order[1], order[0], order[2]]), chainStr([order[0], order[2], order[1]])], right,
        `${order[0]} → ${order[1]} → ${order[2]} → ${right}`, { order }, r), `${order[0]} → ${order[1]}, ${order[1]} → ${order[2]} 이므로 ${right} 이다.`);
      const ans = props.map((s, i) => (tfLists(order).T.includes(s) ? i : -1)).filter((i) => i >= 0);
      const fin = sayOf({ type: 'multi', question: `${head}, 항상 참인 명제를 보기에서 모두 고르시오.`, box, options: props.map((s, i) => `${LB[i]}. ${s}`), answer: ans,
        solution: `${right} → 안쪽 → 바깥쪽 · 그 대우도 참 → ${ans.map((i) => LB[i]).join(', ')}`, check: { order, prem: [A, B] } }, `그러므로 항상 참인 명제는 ${ans.map((i) => LB[i]).join(', ')} 이다.`);
      return [s1, s2, fin]; },
    prop09R(r) { for (;;) { const order = r.pick(PERMS), neg = r.pick([0, 1]), L = tfLists(order), PR = prem(order, neg); if (order.join() === 'p,q,r' && neg === 1) continue;
      return GEN.prop09({ order, neg, props: r.shuffle([...r.shuffle(L.T.filter((x) => !PR.includes(x))).slice(0, 2), ...r.shuffle(L.F).slice(0, 2)]) }, r); } },
    // 👑 형성평가 ① 대우와 참 · 거짓 ② 대우 쓰기 ③ 수를 문자로 ④ 식 정리 한 줄 ⑤ 세 조건
    bLogic({ row }, r) { const L = [['어떤 명제의 대우가 참임을 보이면 처음 명제는?', '참이다'], ['어떤 명제가 참이면 그 대우는?', '참이다'], ['어떤 명제의 대우가 거짓이면 처음 명제는?', '거짓이다'], ['어떤 명제가 거짓이면 그 대우는?', '거짓이다']][row];
      return chR(L[0], ['참이다', '거짓이다', '알 수 없다'].filter((x) => x !== L[1]), L[1], '명제와 그 대우의 참 · 거짓은 같다', { logic: row }, r); },
    bContra({ row }, r) { return contraQ(row, '', r); },
    bForm({ row }, r) { const F = [['홀수', '2k − 1'], ['짝수', '2k'], ['3의 배수', '3k'], ['5의 배수', '5k']][row], pool = ['2k − 1', '2k', '3k', '5k', 'k + 1', '2k + 2'].filter((x) => x !== F[1]);
      return chR(`k 가 자연수일 때, ${F[0]}를 k 로 나타낸 식은?`, r ? r.shuffle(pool).slice(0, 2) : pool.slice(0, 2), F[1], `${F[0]} = ${F[1]}`, { form: F }, r); },
    bInner({ pf }, r) { const [, lin, p] = W.pf[pf], e = innerQ(lin, p, 2, '', r), hw = lin[1] ? '홀수' : '짝수'; e.q.question = e.q.question.replace(' 에서 ( ) 안의 식은?', ` 이므로 ${nPow(p)} 은 ${hw}이다. ( ) 안의 식은?`); return e.q; },
    bChain({ order, neg, flip, props }, r) { const [A, B] = flip ? prem(order, neg).reverse() : prem(order, neg), L = tfLists(order), ans = props.find((s) => L.T.includes(s));
      return chR(`두 명제 ${A}, ${B} 가 모두 참일 때, 다음 중 항상 참인 명제는?`, props.filter((s) => s !== ans), ans, `${chainStr(order)} → ${ans}`, { order, prem: [A, B] }, r); },
  };
  const fix = (q, no) => Object.assign(q, { question: `${no}. ${q.question}` });
  const R0 = (k) => DS.Rng(`s11v1|${k}`);
  const RG = { contra3: 'contra3R', proof2: 'proof2R', proof3: 'proof3R', prop09: 'prop09R' };
  const MONSTERS = {};
  Object.entries(DATA.monsters).forEach(([id, M]) => {
    MONSTERS[id] = { title: M.title, sprite: M.sprite, note: M.note, ...(M.evalQ ? { evalQ: true } : {}),
      make: (a, r) => (a === 0 ? GEN[M.book.gen](M.book, R0(id)) : GEN[RG[M.retry.gen]](r, M.retry)) };
  });
  const CARD3 = (items) => `대우를 이용하여 다음 명제가 참임을 증명하시오. 「자연수 n 에 대하여 ${/「(.+?)」/.exec(items[0].question)[1]}」`;
  const CARD4 = (items) => `${items[2].question.replace(/, 항상 참인/, ' 항상 참인')} ${items[2].box}`;
  const CHAIN = {
    m3: (pass, r) => { const items = pass === 0 ? GEN.proof3(DATA.monsters.m3.book, R0('m3c')) : GEN.proof3R(r); if (pass > 0) items.forEach((it, _, a) => { it.problem = CARD3(a); }); return items; },
    m4: (pass, r) => { const items = pass === 0 ? GEN.prop09(DATA.monsters.m4.book, R0('m4c')) : GEN.prop09R(r); if (pass > 0) items.forEach((it, _, a) => { it.problem = CARD4(a); }); return items; },
  };
  const bossMake = (i, a, r) => { const B = DATA.boss.book[i]; let q;
    if (B.gen === 'bLogic') q = GEN.bLogic({ row: r.pick([1, 2, 3]) }, r);
    else if (B.gen === 'bContra') q = GEN.bContra({ row: r.pick(range(0, W.stmt.length - 1).filter((k) => k !== 3)) }, r);
    else if (B.gen === 'bForm') q = GEN.bForm({ row: r.pick([1, 2, 3]) }, r);
    else if (B.gen === 'bInner') q = GEN.bInner({ pf: r.pick([0, 2, 3]) }, r);
    else { for (;;) { const order = r.pick(PERMS), neg = r.pick([0, 1]), L = tfLists(order); if (order.join() === 'r,q,p' && neg === 0) continue; q = GEN.bChain({ order, neg, flip: r.pick([false, true]), props: r.shuffle([r.pick(L.T.filter((x) => !prem(order, neg).includes(x))), ...r.shuffle(L.F).slice(0, 3)]) }, r); break; } }
    return fix(q, i + 1); };
  const BOSS1 = DATA.boss.book.map((B, i) => fix(GEN[B.gen](B, R0(`boss${i}`)), i + 1));
  const STEPS = DATA.steps.map((s) => (s.kind === 'monster' ? { ...s, title: DATA.monsters[s.id].title } : { ...s }));

  DS.Lessons.register({
    id: DATA.id, no: DATA.no, title: DATA.title, unit: DATA.unit, sheet: DATA.sheet, crops: DATA.crops, theme: DATA.theme, videos: DATA.videos, goal: DATA.goal, defaultPct: DATA.defaultPct,
    steps: STEPS, monsters: MONSTERS,
    items(id, seed, attempt) { return MONSTERS[id].make(attempt, DS.Rng(`${seed}|${id}|${attempt}`)); },
    chain: Object.keys(CHAIN),
    chainItems(id, seed, pass) { return CHAIN[id] ? CHAIN[id](pass, DS.Rng(`${seed}|${id}|chain|${pass}`)) : []; },
    DATA, GEN,
    next: DATA.next,
    boss: { title: DATA.boss.title, sprite: DATA.boss.sprite, items: DATA.boss.items, hpItems: DATA.boss.hpItems, tags: DATA.boss.tags,
      sets: { 1: BOSS1, 2: BOSS1.map((q, i) => bossMake(i, 1, DS.Rng(`s11v1|boss2|${i}`))) }, make(i, a, rng) { return a ? bossMake(i, a, rng) : BOSS1[i]; } },
  });
})();
